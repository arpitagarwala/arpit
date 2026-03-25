/**
 * ICAI CA Expert Chatbot — Cloudflare Worker
 * RAG-powered chatbot using OpenRouter API + TF-IDF keyword retrieval
 * Targeted at CA Foundation, Intermediate, and Final students.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free'; // Ultra-stable text model
const TOP_K = 5;
const MAX_HISTORY = 8;

// ─── CORS ────────────────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// ─── TF-IDF Keyword Retrieval (Same as before) ───────────────────────────────
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s₹]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}
const STOP_WORDS = new Set(['the', 'is', 'are', 'was', 'were', 'be', 'have', 'do', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'and', 'but', 'not']);
function relevanceScore(queryTokens, chunk, idf) {
  const chunkTokens = chunk.tokens || tokenize(chunk.text);
  const chunkFreq = {};
  for (const t of chunkTokens) chunkFreq[t] = (chunkFreq[t] || 0) + 1;
  let score = 0;
  for (const qt of queryTokens) if (chunkFreq[qt]) score += (chunkFreq[qt] / chunkTokens.length) * (idf[qt] || 1);
  if (chunk.text.toLowerCase().includes(queryTokens.join(' '))) score *= 1.5;
  return score;
}
function retrieveChunks(query, knowledgeBase) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  const docCount = knowledgeBase.length || 1;
  const docFreq = {};
  for (const chunk of knowledgeBase) {
    for (const t of new Set(chunk.tokens || tokenize(chunk.text))) docFreq[t] = (docFreq[t] || 0) + 1;
  }
  const idf = {};
  for (const term in docFreq) idf[term] = Math.log(docCount / (docFreq[term] + 1)) + 1;
  const scored = knowledgeBase.map(chunk => ({ ...chunk, score: relevanceScore(queryTokens, chunk, idf) }));
  return scored.sort((a, b) => b.score - a.score).slice(0, TOP_K).filter(c => c.score > 0);
}

// ─── Call OpenRouter with Multimodal Support ─────────────────────────────────
async function askLLM(systemPrompt, conversationHistory, currentQuery, imageUrl, pdfContext, apiKey) {
  const messages = [{ role: 'system', content: systemPrompt }];

  // Add history (text only)
  let lastRole = 'system';
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    if (msg.role !== 'system') {
      const currentRole = msg.role === 'user' ? 'user' : 'assistant';
      // If this is the final element in history and it matches our currentQuery, skip it to avoid duplication!
      if (i === conversationHistory.length - 1 && currentRole === 'user' && msg.text === currentQuery) continue;
      
      // Prevent consecutive roles
      if (currentRole === lastRole) continue; 
      
      messages.push({ role: currentRole, content: msg.text });
      lastRole = currentRole;
    }
  }

  // Construct current user message
  let finalQueryText = currentQuery;
  
  // If PDF was uploaded by user in frontend, prepend the extracted text to their prompt
  if (pdfContext) {
    finalQueryText = `[EXTRACTED DOCUMENT TEXT]\n${pdfContext}\n\n[USER QUERY]\n${currentQuery}`;
  }

  // Since Nemotron-nano is text-only, we gracefully fallback and ignore the image_url to prevent 400 errors.
  let userMessagePayload;
  if (imageUrl) {
    finalQueryText = `[Note: The user attempted to upload an image, but your current Vision sensors are offline. Please ask them to describe the image or type out the data instead.]\n\n${finalQueryText}`;
  }
  userMessagePayload = { role: 'user', content: finalQueryText };
  
  if (userMessagePayload.role !== lastRole) {
     messages.push(userMessagePayload);
  } else {
     // If history ended with a user message, just append to it
     messages[messages.length - 1].content += '\n\n' + finalQueryText;
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ca.arpitagarwala.online',
      'X-Title': 'CA Bhaiya'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2000,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';
}

// ─── Build system prompt ─────────────────────────────────────────────────────
function buildSystemPrompt(relevantChunks) {
  const contextBlock = relevantChunks.map((c, i) => `[Source ${i + 1}: ${c.source || 'Latest Amendment'}]\n${c.text}`).join('\n\n');

  return `You are "CA Bhaiya" — a highly knowledgeable, GenZ Chartered Accountant created by Arpit Agarwala.
You mentor CA Foundation, CA Intermediate, and CA Final students in India.

YOUR PERSONA & BEHAVIOR:
1. You have a GenZ, relatable, and approachable vibe. You speak the students' language—use clear, modern, and direct explanations without sounding like a rigid, traditional textbook or overly formal.
2. Avoid traditional Hindi cliches (like 'Namaste' or extreme reverence). Be that smart senior ("bhaiya") who knows exactly how to crack the exam and explains complex topics in a snap.
3. For questions about "Latest Amendments", "Statutory Updates", or specific attempts (e.g. "May 2026"), ALWAYS prioritize the RAG CONTEXT below.
4. Keep it concise, crisp, and factually flawless. Do not waste time with long motivational speeches. Give them the concept simply.
5. Use highly readable formats: short bullet points, tables, and bold text for key terms.
6. If the user uploads an image, analyze it carefully (e.g., balance sheets, tricky CA provisions) and answer their query based on visual contents.
7. If the user uploads a document (PDF text provided in prompt), base your calculation/answer on the document text.

LATEST ICAI AMENDMENTS & UPDATES CONTEXT (RAG):
${contextBlock || 'No specific new amendments found for this query in the database. Rely entirely on your native mastery of the CA syllabus to answer.'}`;
}

// ─── Main Worker handler ─────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const headers = corsHeaders();
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } });

    try {
      const { query, history = [], image_url = null, pdf_context = null } = await request.json();

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } });
      }

      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("API Key Missing");

      // 1. Load knowledge base from KV
      let knowledgeBase = [];
      try {
        const kbData = await env.CA_KNOWLEDGE.get('amendments', { type: 'json' });
        if (kbData) knowledgeBase = kbData;
      } catch (e) {
        console.error('KV read error:', e);
      }

      // 2. Retrieve relevant chunks using TF-IDF
      const relevantChunks = retrieveChunks(query.trim(), knowledgeBase);

      // 3. Build system prompt
      const systemPrompt = buildSystemPrompt(relevantChunks);

      // 4. Call OpenRouter
      const trimmedHistory = history.slice(-MAX_HISTORY);
      const answer = await askLLM(systemPrompt, trimmedHistory, query.trim(), image_url, pdf_context, apiKey);

      return new Response(JSON.stringify({ answer }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Server Error', detail: err.message }), { status: 500, headers });
    }
  }
};
