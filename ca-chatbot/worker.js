/**
 * ICAI CA Expert Chatbot — Cloudflare Worker
 * RAG-powered chatbot using OpenRouter API + TF-IDF keyword retrieval
 * Targeted at CA Foundation, Intermediate, and Final students.
 */

// ─── Constants ───────────────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 🤖 MODEL SELECTION
// This is exactly where we choose the model. OpenRouter API keys work for ALL models automatically.
// Llama 3.3 70B is incredible for complex reasoning (like CA exams) and is currently free on OpenRouter.
// If you want to switch back to Nemotron, change this to: 'nvidia/nemotron-3-nano-30b-a3b:free'
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free'; 

const TOP_K = 5;          // number of context chunks to retrieve
const MAX_HISTORY = 8;    // max conversation turns to keep

// ─── CORS ────────────────────────────────────────────────────────────────────
function corsHeaders(origin, allowedOrigin) {
  const allowed = !allowedOrigin || allowedOrigin === '*' || origin === allowedOrigin
    || origin?.endsWith('arpitagarwala.online')
    || origin?.includes('localhost')
    || origin?.includes('127.0.0.1');

  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// ─── TF-IDF Keyword Retrieval ────────────────────────────────────────────────
// (Used exclusively to search through the ICAI Amendments & Updates)

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s₹]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
  'by', 'from', 'as', 'into', 'about', 'up', 'out', 'if', 'or', 'and', 'but', 'not', 'no', 'so', 'than', 'too',
  'very', 'just', 'that', 'this', 'it', 'he', 'she', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'how'
]);

function relevanceScore(queryTokens, chunk, idf) {
  const chunkTokens = chunk.tokens || tokenize(chunk.text);
  const chunkFreq = {};
  for (const t of chunkTokens) { chunkFreq[t] = (chunkFreq[t] || 0) + 1; }
  let score = 0;
  const chunkLen = chunkTokens.length || 1;
  for (const qt of queryTokens) {
    if (chunkFreq[qt]) {
      const tf = chunkFreq[qt] / chunkLen;
      const idfVal = idf[qt] || 1;
      score += tf * idfVal;
    }
  }
  const queryStr = queryTokens.join(' ');
  if (chunk.text.toLowerCase().includes(queryStr)) score *= 2;
  return score;
}

function retrieveChunks(query, knowledgeBase) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const docCount = knowledgeBase.length || 1;
  const docFreq = {};
  for (const chunk of knowledgeBase) {
    const unique = new Set(chunk.tokens || tokenize(chunk.text));
    for (const t of unique) docFreq[t] = (docFreq[t] || 0) + 1;
  }

  const idf = {};
  for (const term in docFreq) idf[term] = Math.log(docCount / (docFreq[term] + 1)) + 1;

  const scored = knowledgeBase.map(chunk => ({
    ...chunk,
    score: relevanceScore(queryTokens, chunk, idf)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, TOP_K).filter(c => c.score > 0);
}

// ─── Call OpenRouter ─────────────────────────────────────────────────────────
async function askLLM(systemPrompt, conversationHistory, apiKey) {
  const messages = [{ role: 'system', content: systemPrompt }];
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.text });
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ca.arpitagarwala.online',
      'X-Title': 'CA Expert Tutor'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4, // Lower temperature for more accurate, factual CA answers
      top_p: 0.9,
      max_tokens: 1536,
    })
  });

  if (!res.ok) throw new Error(`OpenRouter API error: ${res.status} — ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';
}

// ─── Build system prompt with RAG context ────────────────────────────────────
function buildSystemPrompt(relevantChunks) {
  const contextBlock = relevantChunks.map((c, i) =>
    `[Source ${i + 1}: ${c.source || 'Latest Amendment'}]\n${c.text}`
  ).join('\n\n');

  return `You are an elite, highly knowledgeable Chartered Accountancy (CA) Faculty Expert created by Arpit Agarwala.
Your purpose is to tutor, mentor, and answer queries for CA Foundation, CA Intermediate, and CA Final students in India.

YOUR KNOWLEDGE AND BEHAVIOR:
1. You possess vast native knowledge of the global and Indian CA syllabus (Accounting Standards, Ind AS, Companies Act 2013, Income Tax Act 1961, GST, Costing, Auditing, Financial Management, Strategic Management, etc.). Use this native knowledge confidently to teach concepts, explain formulas, and solve problems.
2. For specific questions about "Latest Amendments", "Recent Statutory Updates", or attempts like "May 2026", ALWAYS prioritize the LATEST AMENDMENTS provided in the context below. The context contains direct scrapes from the ICAI BOS Live website.
3. Be structured, professional, clear, and encouraging. Use bullet points and bold text to highlight key concepts.
4. If a student asks a generic CA concept (e.g., "Explain AS-2 Valuation of Inventories"), explain it deeply using your existing LLM knowledge. You do NOT need context for standard syllabus topics.
5. If a student asks what attempt an amendment applies to, check the context provided.
6. If the query is completely unrelated to CA, finance, studies, or Arpit Agarwala, politely decline and steer them back to CA studies.

LATEST ICAI AMENDMENTS & UPDATES CONTEXT (RAG):
${contextBlock || 'No specific new amendments found for this query in the database. Rely entirely on your native mastery of the CA syllabus to answer.'}`;
}

// ─── Main Worker handler ─────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

    try {
      const { query, history = [] } = await request.json();
      if (!query || typeof query !== 'string' || !query.trim()) {
        return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400, headers });
      }

      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });

      // 1. Load Amendments from KV
      let knowledgeBase = [];
      try {
        const kbData = await env.CA_KNOWLEDGE.get('amendments', { type: 'json' });
        if (kbData) knowledgeBase = kbData;
      } catch (e) {
        console.error('KV read error:', e);
      }

      // 2. Retrieve relevant amendment chunks
      const relevantChunks = retrieveChunks(query.trim(), knowledgeBase);

      // 3. Prompt + CA Knowledge Native Engine
      const systemPrompt = buildSystemPrompt(relevantChunks);
      const trimmedHistory = history.slice(-MAX_HISTORY);
      const conversation = [
        ...trimmedHistory.map(m => ({ role: m.role, text: m.text })),
        { role: 'user', text: query.trim() }
      ];

      // 4. Call OpenRouter
      const answer = await askLLM(systemPrompt, conversation, apiKey);

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
