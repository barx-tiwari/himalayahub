import { test } from 'node:test';
import assert from 'node:assert/strict';
import { can, canAssignRole, parsePage, pageMeta, normalizeWhatsApp, whatsappUrl, classify, slugify } from './index.ts';

test('RBAC: ordinary users have no CMS permissions', () => {
  assert.equal(can('USER', 'cms.access'), false);
  assert.equal(can('STUDENT', 'news.create'), false);
  assert.equal(can(null, 'news.read'), false);
});
test('RBAC: editors write & publish but cannot delete', () => {
  assert.equal(can('EDITOR', 'news.create'), true);
  assert.equal(can('EDITOR', 'news.publish'), true);
  assert.equal(can('EDITOR', 'news.delete'), false);
  assert.equal(can('EDITOR', 'settings.manage'), false);
});
test('RBAC: only SUPER_ADMIN manages settings, API config and admins', () => {
  for (const p of ['settings.manage', 'api.manage', 'admins.manage'] as const) {
    assert.equal(can('ADMIN', p), false); assert.equal(can('SUPER_ADMIN', p), true);
  }
});
test('RBAC: admins cannot touch super admins or promote to their own level', () => {
  assert.equal(canAssignRole('ADMIN', { currentRole: 'USER', newRole: 'EDITOR' }), true);
  assert.equal(canAssignRole('ADMIN', { currentRole: 'USER', newRole: 'ADMIN' }), false);
  assert.equal(canAssignRole('ADMIN', { currentRole: 'SUPER_ADMIN', newRole: 'USER' }), false);
  assert.equal(canAssignRole('ADMIN', { currentRole: 'ADMIN', newRole: 'USER' }), false);
  assert.equal(canAssignRole('EDITOR', { currentRole: 'USER', newRole: 'STUDENT' }), false);
  assert.equal(canAssignRole('SUPER_ADMIN', { currentRole: 'ADMIN', newRole: 'SUPER_ADMIN' }), true);
});
test('pagination clamps bad input', () => {
  assert.deepEqual(parsePage({ page: '-3', limit: '100000' }), { page: 1, limit: 100, skip: 0, take: 100 });
  assert.deepEqual(parsePage({ page: '3', limit: 'abc' }), { page: 3, limit: 20, skip: 40, take: 20 });
  assert.deepEqual(pageMeta(2, 20, 41), { page: 2, limit: 20, total: 41, totalPages: 3, hasNext: true, hasPrev: true });
  assert.equal(pageMeta(1, 20, 0).totalPages, 1);
});
test('WhatsApp numbers normalise from any admin input', () => {
  assert.equal(normalizeWhatsApp('9863903703'), '9779863903703');
  assert.equal(normalizeWhatsApp('+977 986-390-3703'), '9779863903703');
  assert.equal(normalizeWhatsApp('00977 9863903703'), '9779863903703');
  assert.equal(normalizeWhatsApp('12'), null);
  assert.equal(whatsappUrl('+977 9863903703', 'Hello HimalayaHub'), 'https://wa.me/9779863903703?text=Hello%20HimalayaHub');
});
test('recommendation engine never overclaims', () => {
  assert.equal(classify({ temperature: 22, rainProbability: 10, visibility: 10000 }).level, 'SUITABLE');
  assert.equal(classify({ temperature: 22, rainProbability: 70 }).level, 'POOR');
  assert.equal(classify({ temperature: 22, rainProbability: 5, weatherCode: 95 }).level, 'SEVERE');
  assert.equal(classify({}).level, 'UNKNOWN');
  for (const lvl of ['SUITABLE', 'MIXED', 'POOR', 'SEVERE', 'UNKNOWN']) assert.doesNotMatch(classify({ temperature: 22, rainProbability: lvl === 'POOR' ? 80 : 5 }).message, /\bsafe\b/i);
});
test('slugify', () => { assert.equal(slugify('  Rara Lake — Mugu!  '), 'rara-lake-mugu'); });
