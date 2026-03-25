/**
 * Arpit Chatbot — Cloudflare Worker
 * RAG-powered chatbot using OpenRouter API + TF-IDF keyword retrieval
 */

// ─── Constants ───────────────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';  // Free model
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

/** Tokenize and normalize text */
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s₹]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

/** Common stop words to ignore */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'up',
  'out', 'if', 'or', 'and', 'but', 'not', 'no', 'so', 'than', 'too',
  'very', 'just', 'that', 'this', 'it', 'he', 'she', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'his', 'its', 'our', 'your',
  'their', 'what', 'which', 'who', 'when', 'where', 'how', 'all',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
  'such', 'only', 'own', 'same', 'also', 'then', 'there', 'here'
]);

/** Compute TF-IDF score between query and a chunk */
function relevanceScore(queryTokens, chunk, idf) {
  const chunkTokens = chunk.tokens || tokenize(chunk.text);
  const chunkFreq = {};
  for (const t of chunkTokens) {
    chunkFreq[t] = (chunkFreq[t] || 0) + 1;
  }

  let score = 0;
  const chunkLen = chunkTokens.length || 1;

  for (const qt of queryTokens) {
    if (chunkFreq[qt]) {
      // TF = frequency / total words in chunk
      const tf = chunkFreq[qt] / chunkLen;
      // IDF from pre-computed values (or default)
      const idfVal = idf[qt] || 1;
      score += tf * idfVal;
    }
  }

  // Boost for exact phrase matches
  const queryStr = queryTokens.join(' ');
  if (chunk.text.toLowerCase().includes(queryStr)) {
    score *= 1.5;
  }

  return score;
}

/** Retrieve top-K matching chunks using TF-IDF */
function retrieveChunks(query, knowledgeBase) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // Compute IDF across all chunks
  const docCount = knowledgeBase.length || 1;
  const docFreq = {};
  for (const chunk of knowledgeBase) {
    const tokens = chunk.tokens || tokenize(chunk.text);
    const unique = new Set(tokens);
    for (const t of unique) {
      docFreq[t] = (docFreq[t] || 0) + 1;
    }
  }

  const idf = {};
  for (const term in docFreq) {
    idf[term] = Math.log(docCount / (docFreq[term] + 1)) + 1;
  }

  // Score each chunk
  const scored = knowledgeBase.map(chunk => ({
    ...chunk,
    score: relevanceScore(queryTokens, chunk, idf)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, TOP_K).filter(c => c.score > 0);
}

// ─── Call OpenRouter ─────────────────────────────────────────────────────────
async function askLLM(systemPrompt, conversationHistory, apiKey) {
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://arpitagarwala.online',
      'X-Title': 'Arpit Chatbot'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1024,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';
}

// ─── Build system prompt with RAG context ────────────────────────────────────
function buildSystemPrompt(relevantChunks) {
  const contextBlock = relevantChunks.map((c, i) =>
    `[Source ${i + 1}: ${c.source || 'knowledge base'}]\n${c.text}`
  ).join('\n\n');

  return `You are Arpit's AI Assistant — a helpful, friendly, and knowledgeable chatbot embedded in Arpit Agarwala's portfolio website (arpitagarwala.online).

ABOUT ARPIT:
Arpit Agarwala is a BCom (Hons) student at Bhawanipur Education Society College, Kolkata, and a CA Intermediate candidate. He cleared CA Foundation in Dec 2023. He builds web tools at the intersection of finance and technology, analyses markets using SMC/ICT methodology, and has experience in operations management and business development.

YOUR BEHAVIOR:
- Be warm, professional, and helpful
- If asked about Arpit, use the KNOWLEDGE BASE below + your general knowledge of his portfolio
- If the knowledge base has relevant information, prioritize it over general knowledge
- If you don't know something specific, say so honestly — don't make things up
- Keep responses concise (2-4 paragraphs max) unless the user asks for detail
- You can use markdown formatting (bold, lists, etc.)
- If asked something completely unrelated to Arpit or his work, you can still answer helpfully but note you're Arpit's assistant

KNOWLEDGE BASE (retrieved via RAG — use this context to answer):
${contextBlock || 'No specific context found for this query. Use your general knowledge about Arpit\'s portfolio.'}`;
}

// ─── Main Worker handler ─────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { query, history = [] } = await request.json();

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Query is required' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // 1. Load knowledge base from KV
      let knowledgeBase = [];
      try {
        const kbData = await env.KNOWLEDGE_BASE.get('chunks', { type: 'json' });
        if (kbData) knowledgeBase = kbData;
      } catch (e) {
        console.error('KV read error:', e);
      }

      // 2. Retrieve relevant chunks using TF-IDF
      const relevantChunks = retrieveChunks(query.trim(), knowledgeBase);

      // 3. Build system prompt with RAG context
      const systemPrompt = buildSystemPrompt(relevantChunks);

      // 4. Build conversation (trim to max history)
      const trimmedHistory = history.slice(-MAX_HISTORY);
      const conversation = [
        ...trimmedHistory.map(m => ({ role: m.role, text: m.text })),
        { role: 'user', text: query.trim() }
      ];

      // 5. Call OpenRouter
      const answer = await askLLM(systemPrompt, conversation, apiKey);

      return new Response(JSON.stringify({ answer }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({
        error: 'Something went wrong. Please try again.',
        detail: err.message
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  }
};
