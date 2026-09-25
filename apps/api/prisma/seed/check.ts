/** Dry run: builds every seed record and checks integrity. Needs no database. Run: npm run seed:check */
import assert from 'node:assert/strict';
import * as B from './build.ts';

const uniq = (name: string, xs: string[]) => { const d = xs.filter((x, i) => xs.indexOf(x) !== i); assert.equal(d.length, 0, `${name}: duplicate keys ${d.join(', ')}`); };
const destSlugs = B.destinationRecords.map((d) => d.slug);
uniq('destinations', destSlugs);
for (const d of B.destinationRecords) {
  assert.ok(d.images.length > 0 && d.images.every((i) => i.altText), `${d.slug}: images need alt text`);
  for (const n of d.nearbySlugs) assert.ok(destSlugs.includes(n), `${d.slug}: nearby ${n} missing`);
  for (const c of d.categorySlugs) assert.ok(B.destinationCategories.some((x) => x.slug === c), `${d.slug}: category ${c} missing`);
  assert.ok(Number.isFinite(d.latitude) && Number.isFinite(d.longitude));
  assert.ok(d.metaTitle.length <= 70 && d.metaDescription.length <= 170);
}
const subjectSlugs = B.subjectRecords.map((s) => s.slug); uniq('subjects', subjectSlugs);
for (const p of B.programRecords) for (const s of p.semesters) for (const x of s.subjects) assert.ok(subjectSlugs.includes(x.slug), `${p.code} sem ${s.number}: subject ${x.slug} missing`);
uniq('programs', B.programRecords.map((p) => p.slug));
uniq('notes', B.noteRecords.map((n) => n.slug));
for (const n of B.noteRecords) { assert.ok(B.noteCategoryRecords.some((c) => c.slug === n.categorySlug), `note ${n.slug}: category ${n.categorySlug}`); assert.ok(!/<script/i.test(n.content)); }
uniq('courses', B.courseRecords.map((c) => c.slug));
const quizSlugs = B.quizRecords.map((q) => q.slug);
for (const c of B.courseRecords) {
  uniq(`${c.slug} lessons`, c.lessons.map((l) => l.slug));
  if (c.quizSlug) assert.ok(quizSlugs.includes(c.quizSlug), `${c.slug}: quiz ${c.quizSlug} missing`);
  for (const l of c.lessons) if (l.relatedNoteSlug) assert.ok(B.noteRecords.some((n) => n.slug === l.relatedNoteSlug), `${c.slug}/${l.slug}: note ${l.relatedNoteSlug} missing`);
}
for (const q of B.quizRecords) for (const qu of q.questions) assert.equal(qu.options.filter((o) => o.isCorrect).length, 1, `${q.slug}: "${qu.prompt}" needs exactly one correct option`);
uniq('typing', B.typingRecords.map((t) => t.slug));
uniq('emergency', B.emergencyRecords.map((e) => e.key));
for (const e of B.emergencyRecords) { assert.ok(e.source && !Number.isNaN(e.lastVerified.getTime()), `${e.key}: needs source + verified date`); }
uniq('leagues', B.leagueRecords.map((l) => l.slug));
for (const need of ['premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1', 'uefa-champions-league', 'uefa-europa-league', 'nepal-premier-league']) assert.ok(B.leagueRecords.some((l) => l.slug === need), `league ${need} missing`);
assert.equal(B.newsCategoryRecords.length, 12);
assert.ok(B.demoNews.every((n) => n.isDemo && n.title.startsWith('[DEMO]')), 'demo content must be labelled');
const hol = B.holidayRecords([2083, 2084]);
assert.ok(hol.length > 0 && hol.every((h) => !Number.isNaN(h.date.getTime())));
uniq('holidays', hol.map((h) => `${h.name}|${h.date.toISOString()}`));
assert.equal(B.siteSettings.whatsappNumber, '+977 9863903703');

// v5: hidden gems must satisfy the same validation the CMS applies, and not clash with existing slugs
const { destinationInput } = await import('../../src/modules/destinations/destinations.schemas.ts');
const catSlugs = new Set(B.destinationCategories.map((c) => c.slug));
for (const g of B.hiddenGemRecords) {
  const r = destinationInput.safeParse(g);
  assert.ok(r.success, `hidden gem ${g.slug}: ${r.success ? '' : JSON.stringify(r.error.issues.slice(0, 3))}`);
  g.categorySlugs.forEach((c) => assert.ok(catSlugs.has(c), `hidden gem ${g.slug}: unknown category ${c}`));
}
uniq('destination slugs incl. hidden gems', [...B.destinationRecords.map((d) => d.slug), ...B.hiddenGemRecords.map((g) => g.slug)]);
uniq('communities', B.communityRecords.map((c) => c.slug));
assert.equal(B.communityRecords.length, 6);

console.log(JSON.stringify({
  destinations: B.destinationRecords.length, images: B.destinationRecords.reduce((n, d) => n + d.images.length, 0), featured: B.destinationRecords.filter((d) => d.isFeatured).length,
  destinationCategories: B.destinationCategories.length, programs: B.programRecords.length,
  semesters: B.programRecords.reduce((n, p) => n + p.semesters.length, 0), subjects: B.subjectRecords.length, notes: B.noteRecords.length,
  courses: B.courseRecords.length, lessons: B.courseRecords.reduce((n, c) => n + c.lessons.length, 0), quizzes: B.quizRecords.length,
  questions: B.quizRecords.reduce((n, q) => n + q.questions.length, 0), typingChallenges: B.typingRecords.length,
  emergencyServices: B.emergencyRecords.length, leagues: B.leagueRecords.length, newsCategories: B.newsCategoryRecords.length, holidays: hol.length,
  hiddenGems: B.hiddenGemRecords.length, communities: B.communityRecords.length,
}, null, 1));
console.log('seed:check OK — all references resolve, keys unique, demo data labelled');
