/**
 * Database seed. Safe to re-run:
 *  - creates what's missing, never deletes anything;
 *  - by default does NOT overwrite rows that exist (so CMS edits survive a re-seed);
 *    set SEED_UPDATE=true to refresh seeded content from the code;
 *  - creates the first SUPER_ADMIN only from SEED_SUPERADMIN_EMAIL / SEED_SUPERADMIN_PASSWORD;
 *  - DEMO content only when SEED_DEMO=true and never in production (clearly labelled).
 */
import { PrismaClient } from '@prisma/client';
import * as B from './seed/build.ts';
import { hashPassword, passwordProblem } from '../src/auth/password.ts';

const prisma = new PrismaClient();
const UPDATE = process.env.SEED_UPDATE === 'true';
const upd = <T extends object>(data: T) => (UPDATE ? data : {});
const log = (m: string) => console.log(`  • ${m}`);

async function main() {
  await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
  console.log(`Seeding HimalayaHub (${UPDATE ? 'create + update' : 'create-only'})…`);

  await prisma.siteSettings.upsert({ where: { id: 1 }, create: B.siteSettings, update: {} }); // never overwrite admin settings
  log('site settings');

  for (const a of B.apiSettingRecords) {
    const data = { ...a, options: 'options' in a ? (a.options as object) : undefined };
    await prisma.apiSetting.upsert({ where: { service: a.service }, create: data, update: {} });
  }
  log(`${B.apiSettingRecords.length} API provider settings`);

  // Destinations
  for (const c of B.destinationCategories) await prisma.destinationCategory.upsert({ where: { slug: c.slug }, create: c, update: upd(c) });
  const catIds = Object.fromEntries((await prisma.destinationCategory.findMany()).map((c) => [c.slug, c.id]));
  for (const d of B.destinationRecords) {
    const { images, categorySlugs, nearbySlugs, ...data } = d;
    const row = await prisma.destination.upsert({ where: { slug: d.slug }, create: { ...data, featuredImage: null }, update: upd(data) });
    if ((await prisma.destinationImage.count({ where: { destinationId: row.id } })) === 0) {
      await prisma.destinationImage.createMany({ data: images.map((i) => ({ ...i, destinationId: row.id })) });
    }
    for (const s of categorySlugs) {
      const key = { destinationId: row.id, categoryId: catIds[s]! };
      await prisma.destinationOnCategory.upsert({ where: { destinationId_categoryId: key }, create: key, update: {} });
    }
  }
  for (const d of B.destinationRecords) {
    if (d.nearbySlugs.length) await prisma.destination.update({ where: { slug: d.slug }, data: { nearby: { connect: d.nearbySlugs.map((slug) => ({ slug })) } } });
  }
  log(`${B.destinationRecords.length} destinations`);

  // v5: Hidden Gems of Eastern Nepal (guide JSON is only written on create or with SEED_UPDATE)
  for (const g of B.hiddenGemRecords) {
    const { categorySlugs, images, ...data } = g;
    const row = await prisma.destination.upsert({ where: { slug: g.slug }, create: data, update: upd(data) });
    // Photos are added once; editors' gallery changes are never overwritten.
    if (images.length && (await prisma.destinationImage.count({ where: { destinationId: row.id } })) === 0) {
      await prisma.destinationImage.createMany({ data: images.map((i) => ({ ...i, destinationId: row.id })) });
    }
    for (const s of categorySlugs.filter((c) => catIds[c])) {
      const key = { destinationId: row.id, categoryId: catIds[s]! };
      await prisma.destinationOnCategory.upsert({ where: { destinationId_categoryId: key }, create: key, update: {} });
    }
  }
  log(`${B.hiddenGemRecords.length} hidden gems`);

  // v5: Community spaces
  for (const c of B.communityRecords) await prisma.community.upsert({ where: { slug: c.slug }, create: c, update: upd(c) });
  log(`${B.communityRecords.length} communities`);

  // Academics
  for (const u of B.universities) await prisma.university.upsert({ where: { slug: u.slug }, create: u, update: upd(u) });
  for (const s of B.subjectRecords) await prisma.subject.upsert({ where: { slug: s.slug }, create: s, update: upd(s) });
  const subjectIds = Object.fromEntries((await prisma.subject.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
  for (const p of B.programRecords) {
    const { semesters, ...data } = p;
    const prog = await prisma.program.upsert({ where: { slug: p.slug }, create: data, update: upd(data) });
    for (const s of semesters) {
      const sem = await prisma.semester.upsert({ where: { programId_number: { programId: prog.id, number: s.number } }, create: { programId: prog.id, number: s.number, name: s.name }, update: {} });
      for (const x of s.subjects) {
        await prisma.semesterSubject.upsert({
          where: { semesterId_subjectId: { semesterId: sem.id, subjectId: subjectIds[x.slug]! } },
          create: { semesterId: sem.id, subjectId: subjectIds[x.slug]!, displayTitle: x.displayTitle, sortOrder: x.sortOrder }, update: {},
        });
      }
    }
  }
  log(`${B.programRecords.length} programmes, ${B.subjectRecords.length} subjects (confirm each programme's university in the CMS)`);

  for (const c of B.noteCategoryRecords) await prisma.noteCategory.upsert({ where: { slug: c.slug }, create: c, update: upd(c) });
  const noteCatIds = Object.fromEntries((await prisma.noteCategory.findMany()).map((c) => [c.slug, c.id]));
  for (const n of B.noteRecords) {
    const { tags, categorySlug, structured, ...data } = n;
    const tagRows = await Promise.all(tags.map((t) => prisma.tag.upsert({ where: { slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }, create: { name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }, update: {} })));
    const note = await prisma.note.upsert({
      where: { slug: n.slug },
      create: { ...data, structured: structured as object, categoryId: noteCatIds[categorySlug] ?? null, publishedAt: new Date() },
      update: upd({ ...data, structured: structured as object, categoryId: noteCatIds[categorySlug] ?? null }),
    });
    for (const t of tagRows) await prisma.noteTag.upsert({ where: { noteId_tagId: { noteId: note.id, tagId: t.id } }, create: { noteId: note.id, tagId: t.id }, update: {} });
  }
  log(`${B.noteRecords.length} IT notes`);

  // Quizzes, then courses (courses link to quizzes)
  for (const q of B.quizRecords) {
    const { questions, ...data } = q;
    const quiz = await prisma.quiz.upsert({ where: { slug: q.slug }, create: data, update: upd(data) });
    if ((await prisma.question.count({ where: { quizId: quiz.id } })) === 0) {
      for (const qu of questions) {
        const { options, ...qd } = qu;
        await prisma.question.create({ data: { ...qd, quizId: quiz.id, options: { create: options } } });
      }
    }
  }
  for (const c of B.courseRecords) {
    const { lessons, quizSlug, ...data } = c;
    const quiz = quizSlug ? await prisma.quiz.findUnique({ where: { slug: quizSlug } }) : null;
    const course = await prisma.course.upsert({ where: { slug: c.slug }, create: { ...data, quizId: quiz?.id, publishedAt: new Date() }, update: upd({ ...data, quizId: quiz?.id }) });
    for (const l of lessons) await prisma.courseLesson.upsert({ where: { courseId_slug: { courseId: course.id, slug: l.slug } }, create: { ...l, courseId: course.id }, update: upd(l) });
  }
  log(`${B.quizRecords.length} quizzes, ${B.courseRecords.length} courses`);

  for (const t of B.typingRecords) await prisma.typingChallenge.upsert({ where: { slug: t.slug }, create: t, update: upd(t) });
  log(`${B.typingRecords.length} typing challenges`);

  for (const e of B.emergencyRecords) await prisma.emergencyService.upsert({ where: { key: e.key }, create: e, update: upd(e) });
  log(`${B.emergencyRecords.length} verified emergency services`);

  // Sports configuration (no scores — those only ever come from providers)
  for (const s of B.sports) await prisma.sport.upsert({ where: { slug: s.slug }, create: s, update: {} });
  const sportIds = Object.fromEntries((await prisma.sport.findMany()).map((s) => [s.slug, s.id]));
  for (const l of B.leagueRecords) {
    const { sport, ...data } = l;
    await prisma.league.upsert({ where: { slug: l.slug }, create: { ...data, sportId: sportIds[sport]! }, update: upd(data) });
  }
  for (const c of B.competitionRecords) {
    const league = await prisma.league.findUniqueOrThrow({ where: { slug: c.leagueSlug } });
    const exists = await prisma.competition.findFirst({ where: { leagueId: league.id, name: c.name } });
    if (!exists) await prisma.competition.create({ data: { leagueId: league.id, name: c.name, season: c.season } });
  }
  log(`${B.leagueRecords.length} leagues (incl. Nepal Premier League)`);

  for (const c of B.newsCategoryRecords) await prisma.newsCategory.upsert({ where: { slug: c.slug }, create: c, update: upd(c) });
  for (const s of B.newsSourceRecords) { if (!(await prisma.newsSource.findFirst({ where: { rssUrl: s.rssUrl } }))) await prisma.newsSource.create({ data: s }); }
  log(`${B.newsCategoryRecords.length} news categories, ${B.newsSourceRecords.length} sources`);

  for (const h of B.holidayRecords([2083, 2084])) await prisma.holiday.upsert({ where: { name_date: { name: h.name, date: h.date } }, create: h, update: {} });
  log('fixed-date holidays for BS 2083–2084 (lunar festivals should be added from an official calendar)');

  // First super admin
  const email = process.env.SEED_SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  if (email && password) {
    const problem = passwordProblem(password, [email]);
    if (problem) throw new Error(`SEED_SUPERADMIN_PASSWORD rejected: ${problem}`);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({ data: { email, name: process.env.SEED_SUPERADMIN_NAME || 'Site owner', role: 'SUPER_ADMIN', passwordHash: await hashPassword(password), emailVerifiedAt: new Date(), profile: { create: {} } } });
      log(`SUPER_ADMIN created for ${email} (remove SEED_SUPERADMIN_PASSWORD from .env now)`);
    } else log(`SUPER_ADMIN ${email} already exists — unchanged`);
  } else log('No SEED_SUPERADMIN_EMAIL/PASSWORD set — skipped creating the first admin');

  // Demo content (development only)
  if (process.env.SEED_DEMO === 'true') {
    if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed DEMO data in production.');
    const cats = Object.fromEntries((await prisma.newsCategory.findMany()).map((c) => [c.slug, c.id]));
    for (const n of B.demoNews) {
      const { categorySlug, ...data } = n;
      await prisma.newsArticle.upsert({ where: { slug: n.slug }, create: { ...data, categoryId: cats[categorySlug], publishedAt: new Date() }, update: {} });
    }
    log(`${B.demoNews.length} DEMO news articles (labelled [DEMO], isDemo=true)`);
  }
  console.log('Seed complete.');
}

main().catch((e) => { console.error('Seed failed:', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
