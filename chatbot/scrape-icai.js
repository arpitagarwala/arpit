/**
 * ICAI BOS Live Scraper
 * ─────────────────────
 * Crawls the ICAI BOS Live website, follows the page hierarchy,
 * discovers all PDF download links, downloads them, extracts text,
 * and saves all content as plain text files in data/ca-knowledge/
 *
 * Usage:
 *   npm install node-fetch@2 cheerio pdf-parse
 *   node scrape-icai.js
 *
 * After running:
 *   node ingest.js    (to chunk and build knowledge base)
 *   npx wrangler kv key put --namespace-id=d75b970c89b84e44b3435dc12a1eaffd "chunks" --path=knowledge-base.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const pdfParse = require('pdf-parse');

// ─── Config ──────────────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, 'data', 'ca-knowledge');
const BASE_URL = 'https://boslive.icai.org';
const CDN_BASE = 'https://resource.cdn.icai.org';
const DELAY_MS = 1000; // polite delay between requests

// All discovered paper module IDs from BOS Live (May 2026 exam onwards)
const PAPERS = {
  foundation: [
    { module: 152, name: 'Foundation-Paper1-Accounting' },
    { module: 153, name: 'Foundation-Paper2-BusinessLaws' },
    { module: 154, name: 'Foundation-Paper3-QuantitativeAptitude' },
    { module: 155, name: 'Foundation-Paper4-BusinessEconomics' },
  ],
  intermediate: [
    { module: 144, name: 'Inter-Paper1-AdvancedAccounting' },
    { module: 145, name: 'Inter-Paper2-CorporateAndOtherLaws' },
    { module: 137, name: 'Inter-Paper3A-IncomeTaxLaw' },
    { module: 136, name: 'Inter-Paper3B-GST' },
    { module: 146, name: 'Inter-Paper4-CostAndManagementAccounting' },
    { module: 147, name: 'Inter-Paper5-AuditingAndEthics' },
    { module: 151, name: 'Inter-Paper6A-FinancialManagement' },
    { module: 156, name: 'Inter-Paper6B-StrategicManagement' },
  ],
  // Final papers can be added similarly
};

// Direct amendment PDF URLs discovered from the website
const AMENDMENT_PDFS = [
  { url: 'https://resource.cdn.icai.org/90715bos-aps4085.pdf', name: 'Amendment-Inter-1' },
  { url: 'https://resource.cdn.icai.org/88993bos-aps2830.pdf', name: 'Amendment-Inter-2' },
  { url: 'https://resource.cdn.icai.org/86582bos-aps1156-amendments-sep2025-exam.pdf', name: 'Amendment-Inter-Sep2025' },
  { url: 'https://resource.cdn.icai.org/81242bos65468.pdf', name: 'Amendment-Inter-3' },
  { url: 'https://resource.cdn.icai.org/90106bos-aps3737.pdf', name: 'Amendment-Inter-GST-May2026' },
  { url: 'https://resource.cdn.icai.org/87641bos-aps2131.pdf', name: 'Amendment-Inter-4' },
  { url: 'https://resource.cdn.icai.org/80049bos64172.pdf', name: 'Amendment-Inter-5' },
  { url: 'https://resource.cdn.icai.org/89400bos-aps3102-corrigendum.pdf', name: 'Corrigendum-GST' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/** Fetch a URL and return the response body as text */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CA-Study-Bot/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

/** Fetch a URL and return the response body as a Buffer */
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CA-Study-Bot/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

/** Extract href links from HTML matching a pattern */
function extractLinks(html, pattern) {
  const links = [];
  const regex = /href=["']([^"']+)["'][^>]*>([^<]*)</g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].trim();
    if (pattern && !href.includes(pattern)) continue;
    links.push({ href, text });
  }
  return links;
}

/** Extract text from PDF buffer using pdf-parse */
async function extractPdfText(buffer, filename) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error(`  ⚠ Failed to parse PDF ${filename}: ${err.message}`);
    return '';
  }
}

/** Clean extracted text */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/gm, '')
    .trim();
}

// ─── Main Scraping Logic ─────────────────────────────────────────────────────

async function scrapeModulePage(moduleId, paperName) {
  console.log(`\n📘 ${paperName} (module=${moduleId})`);
  const url = `${BASE_URL}/sm_module.php?module=${moduleId}`;

  try {
    const html = await fetchText(url);
    await delay(DELAY_MS);

    // Find sub-module links (Module 1, Module 2, etc.)
    const moduleLinks = extractLinks(html, 'sm_chapter_details.php');

    if (moduleLinks.length === 0) {
      // This page might directly list chapter PDFs
      const pdfLinks = extractLinks(html, 'resource.cdn.icai.org');
      if (pdfLinks.length > 0) {
        await downloadAndSavePdfs(pdfLinks, paperName, 'Main');
      }
      return;
    }

    for (const ml of moduleLinks) {
      const moduleName = ml.text || 'Module';
      console.log(`  📂 ${moduleName}`);
      const chapterUrl = ml.href.startsWith('http') ? ml.href : `${BASE_URL}/${ml.href}`;

      try {
        const chapterHtml = await fetchText(chapterUrl);
        await delay(DELAY_MS);

        // Find PDF links on the chapter page
        const pdfLinks = extractLinks(chapterHtml, 'resource.cdn.icai.org');
        // Also find unit detail links (some chapters have sub-units)
        const unitLinks = extractLinks(chapterHtml, 'sm_unit_details.php');

        if (pdfLinks.length > 0) {
          await downloadAndSavePdfs(pdfLinks, paperName, moduleName);
        }

        // Follow unit detail links if present
        for (const ul of unitLinks) {
          const unitUrl = ul.href.startsWith('http') ? ul.href : `${BASE_URL}/${ul.href}`;
          try {
            const unitHtml = await fetchText(unitUrl);
            await delay(DELAY_MS);
            const unitPdfs = extractLinks(unitHtml, 'resource.cdn.icai.org');
            if (unitPdfs.length > 0) {
              await downloadAndSavePdfs(unitPdfs, paperName, `${moduleName}-${ul.text || 'Unit'}`);
            }
          } catch (e) {
            console.error(`    ⚠ Unit error: ${e.message}`);
          }
        }

      } catch (e) {
        console.error(`  ⚠ Chapter page error: ${e.message}`);
      }
    }
  } catch (e) {
    console.error(`  ⚠ Module page error: ${e.message}`);
  }
}

async function downloadAndSavePdfs(pdfLinks, paperName, moduleName) {
  for (const pl of pdfLinks) {
    const pdfUrl = pl.href.startsWith('http') ? pl.href : `${CDN_BASE}/${pl.href}`;
    const chapterName = pl.text.replace(/[^a-zA-Z0-9\s\-_&()]/g, '').trim().substring(0, 80);
    const safeName = `${paperName}_${moduleName}_${chapterName}`.replace(/[^a-zA-Z0-9\-_]/g, '_').replace(/_+/g, '_');
    const txtPath = path.join(OUTPUT_DIR, `${safeName}.txt`);

    // Skip if already downloaded
    if (fs.existsSync(txtPath)) {
      console.log(`    ✓ Already have: ${chapterName}`);
      continue;
    }

    try {
      process.stdout.write(`    ⬇ ${chapterName}...`);
      const buffer = await fetchBuffer(pdfUrl);
      const text = await extractPdfText(buffer, safeName);

      if (text.length > 100) {
        const header = `=== ${paperName} > ${moduleName} > ${chapterName} ===\nSource: ${pdfUrl}\n\n`;
        fs.writeFileSync(txtPath, cleanText(header + text));
        console.log(` ✅ (${(text.length / 1024).toFixed(0)} KB text)`);
      } else {
        console.log(` ⚠ Skipped (too short or unreadable)`);
      }

      await delay(DELAY_MS);
    } catch (e) {
      console.log(` ❌ ${e.message}`);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   ICAI BOS Live — CA Study Material Scraper  ║');
  console.log('╚══════════════════════════════════════════════╝');

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Scrape all Foundation papers
  console.log('\n\n━━━ CA FOUNDATION ━━━');
  for (const paper of PAPERS.foundation) {
    await scrapeModulePage(paper.module, paper.name);
  }

  // 2. Scrape all Intermediate papers
  console.log('\n\n━━━ CA INTERMEDIATE ━━━');
  for (const paper of PAPERS.intermediate) {
    await scrapeModulePage(paper.module, paper.name);
  }

  // 3. Download amendment PDFs
  console.log('\n\n━━━ AMENDMENTS ━━━');
  const amendmentLinks = AMENDMENT_PDFS.map(a => ({ href: a.url, text: a.name }));
  await downloadAndSavePdfs(amendmentLinks, 'Amendments', 'Intermediate');

  // Summary
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.txt'));
  const totalSize = files.reduce((sum, f) => {
    return sum + fs.statSync(path.join(OUTPUT_DIR, f)).size;
  }, 0);

  console.log('\n\n════════════════════════════════════════');
  console.log(`✅ Scraped ${files.length} documents`);
  console.log(`📁 Total text: ${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`📂 Output: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('  1. node ingest.js');
  console.log('  2. npx wrangler kv key put --namespace-id=d75b970c89b84e44b3435dc12a1eaffd "chunks" --path=knowledge-base.json');
  console.log('════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
