/**
 * ICAI Amendments Scraper 
 * ───────────────────────
 * Downloads only the specific Amendment, Corrigendum, and Statutory Update PDFs
 * for CA Inter and Final. This keeps the RAG database extremely light and fast,
 * while allowing the LLM to use its native knowledge for the rest of the syllabus.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const pdfParse = require('pdf-parse'); // v1.1.1 installed via package.json

const OUTPUT_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(__dirname, 'amendments.json');

// Direct links to recent ICAI Amendments and Updates
const AMENDMENT_PDFS = [
  // Inter
  { url: 'https://resource.cdn.icai.org/90715bos-aps4085.pdf', name: 'Inter_Law_Amendments_May2026' },
  { url: 'https://resource.cdn.icai.org/88993bos-aps2830.pdf', name: 'Inter_Audit_Amendments_May2026' },
  { url: 'https://resource.cdn.icai.org/90106bos-aps3737.pdf', name: 'Inter_GST_StatutoryUpdate_May2026' },
  { url: 'https://resource.cdn.icai.org/89400bos-aps3102-corrigendum.pdf', name: 'Inter_GST_Corrigendum' },
  { url: 'https://resource.cdn.icai.org/86582bos-aps1156-amendments-sep2025-exam.pdf', name: 'Inter_Tax_Amendments_Sep2025' },
  // Final
  { url: 'https://resource.cdn.icai.org/91404bos-aps4425-law.pdf', name: 'Final_Law_Amendments_May2026' },
  { url: 'https://resource.cdn.icai.org/91405bos-aps4425-dt.pdf', name: 'Final_DirectTax_StatutoryUpdates_May2026' },
  { url: 'https://resource.cdn.icai.org/91406bos-aps4425-idt.pdf', name: 'Final_IndirectTax_StatutoryUpdates_May2026' }
];

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
  });
}

function chunkText(text, source) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks = [];
  const CHUNK_SIZE = 400;
  const CHUNK_OVERLAP = 50;

  for (let i = 0; i < words.length; i += (CHUNK_SIZE - CHUNK_OVERLAP)) {
    const end = Math.min(i + CHUNK_SIZE, words.length);
    const content = words.slice(i, end).join(' ');
    if (content.length > 50) chunks.push({ text: content, source });
  }
  return chunks;
}

async function main() {
  console.log('Fetching ICAI Amendments...\n');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  let allChunks = [];

  for (const pdf of AMENDMENT_PDFS) {
    console.log(`⬇ Downloading ${pdf.name}...`);
    try {
      const buffer = await fetchBuffer(pdf.url);
      const data = await pdfParse(buffer);
      if (data.text) {
        fs.writeFileSync(path.join(OUTPUT_DIR, `${pdf.name}.txt`), data.text);
        const chunks = chunkText(data.text, pdf.name);
        allChunks = allChunks.concat(chunks);
        console.log(`  ✅ Extracted ${chunks.length} chunks`);
      }
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
    }
    await delay(1000);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  console.log(`\n🎉 Saved ${allChunks.length} chunks to amendments.json`);
  console.log('Now upload to Cloudflare KV:');
  console.log('npx wrangler kv key put --binding=CA_KNOWLEDGE "amendments" --path=amendments.json');
}

main();
