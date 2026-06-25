import { GITA_CHAPTERS, getVerse } from './gita';
let total = 0;
let errors = 0;
for (const ch of GITA_CHAPTERS) {
  for (let v = 1; v <= ch.versesCount; v++) {
    total++;
    const verse = getVerse(ch.chapter, v);
    if (!verse) {
      console.log(`Error: Chapter ${ch.chapter}, Verse ${v} is undefined`);
      errors++;
    }
  }
}
console.log(`Completed test of ${total} verses. Total errors: ${errors}`);
