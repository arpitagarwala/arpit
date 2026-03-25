/**
 * RAG Ingest Script (TF-IDF version — no embedding API needed)
 * ─────────────────────────────────────────────────────────────
 * Reads text files from ./data/ folder, chunks them, and outputs
 * a knowledge-base.json that the Worker uses for TF-IDF retrieval.
 *
 * Usage:
 *   1. Put your training data files (.txt, .md, .csv) into ./data/
 *   2. Run: node ingest.js
 *   3. Upload: npx wrangler kv key put --binding=KNOWLEDGE_BASE "chunks" --path=knowledge-base.json
 */

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const DATA_DIR    = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(__dirname, 'knowledge-base.json');
const CHUNK_SIZE  = 400;   // approximate words per chunk
const CHUNK_OVERLAP = 50;  // words of overlap between chunks

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Split text into overlapping chunks */
function chunkText(text, source) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks = [];

  let i = 0;
  while (i < words.length) {
    const end = Math.min(i + CHUNK_SIZE, words.length);
    const chunkContent = words.slice(i, end).join(' ');

    if (chunkContent.trim().length > 30) { // skip very short chunks
      chunks.push({
        text: chunkContent.trim(),
        source: source
      });
    }

    i += (CHUNK_SIZE - CHUNK_OVERLAP);
    if (i >= words.length) break;
  }

  return chunks;
}

/** Read all supported files from data directory */
function readDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created ${DATA_DIR} — put your training data files there.`);
    return [];
  }

  const supportedExtensions = ['.txt', '.md', '.csv', '.json', '.html'];
  const files = fs.readdirSync(DATA_DIR).filter(f =>
    supportedExtensions.includes(path.extname(f).toLowerCase())
  );

  console.log(`Found ${files.length} file(s) in data/`);

  return files.map(f => {
    const filePath = path.join(DATA_DIR, f);
    const content = fs.readFileSync(filePath, 'utf-8');
    return { name: f, content };
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   RAG Knowledge Base Builder (TF-IDF)║');
  console.log('╚══════════════════════════════════════╝\n');

  // 1. Read files
  const files = readDataFiles();
  if (files.length === 0) {
    console.log('\n❌ No data files found!');
    console.log('   Put .txt, .md, .csv files into the data/ folder and re-run.');
    process.exit(1);
  }

  // 2. Chunk all files
  console.log('\nChunking files...');
  let allChunks = [];
  for (const file of files) {
    const chunks = chunkText(file.content, file.name);
    console.log(`  ${file.name}: ${chunks.length} chunk(s)`);
    allChunks = allChunks.concat(chunks);
  }
  console.log(`\nTotal: ${allChunks.length} chunks`);

  // 3. Save locally
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(`📁 Saved to knowledge-base.json (${sizeMB} KB)`);

  console.log('\n✅ Done! Now upload to Cloudflare KV:');
  console.log('   npx wrangler kv key put --binding=KNOWLEDGE_BASE "chunks" --path=knowledge-base.json\n');
}

main();
