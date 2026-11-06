import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siteDefaults, normalizeSite, sitePathEnabled } from '../src/lib/site-config.ts';
import { appEnquiryLinks } from '../src/lib/app-enquiry.ts';

test('existing saved configurations gain the Apps page without losing custom navigation', () => {
  const old = siteDefaults();
  delete old.appsRevision;
  old.navigation = old.navigation.filter(item => item.id !== 'apps');
  old.pages = old.pages.filter(item => item.id !== 'apps');
  old.navigation[0].label = 'My story';
  const original = structuredClone(old);
  const upgraded = normalizeSite(old);
  assert.equal(upgraded.navigation[1].href, '/apps');
  assert.equal(upgraded.navigation[0].label, 'My story');
  assert.equal(sitePathEnabled(upgraded, '/apps'), true);
  assert.equal(upgraded.pages.find(item => item.id === 'apps').enabled, true);
  assert.deepEqual(old, original);
  assert.deepEqual(normalizeSite(upgraded), upgraded);
});

test('Apps migration respects existing disabled entries and subsequent owner choices', () => {
  const old = siteDefaults();
  delete old.appsRevision;
  old.navigation.find(item => item.id === 'apps').enabled = false;
  const upgraded = normalizeSite(old);
  assert.equal(upgraded.navigation.filter(item => item.href === '/apps').length, 1);
  assert.equal(sitePathEnabled(upgraded, '/apps'), false);
  upgraded.navigation = upgraded.navigation.filter(item => item.id !== 'apps');
  upgraded.pages.find(item => item.id === 'apps').enabled = false;
  const saved = normalizeSite(upgraded);
  assert.equal(saved.navigation.some(item => item.id === 'apps'), false);
  assert.equal(sitePathEnabled(saved, '/apps'), false);
});

test('enquiry drafts preserve the app, purchase intent, reply details and special characters', () => {
  const result = appEnquiryLinks({ name: ' Arpit ', reply: ' test@example.com ', app: 'Gita for Daily Life', intent: 'Purchase or license an app', message: 'Hello & नमस्ते — pricing? #1 + customization' }, 'owner@example.com', 'https://wa.me/919999999999?text=old');
  const email = new URL(result.email);
  assert.equal(email.pathname, 'owner@example.com');
  assert.equal(email.searchParams.get('subject'), 'Purchase or license an app — Gita for Daily Life');
  assert.equal(email.searchParams.get('body'), result.body);
  assert.equal(new URL(result.whatsapp).searchParams.get('text'), result.body);
  assert.match(result.body, /Hello & नमस्ते — pricing\? #1 \+ customization/);
  assert.match(result.body, /Name: Arpit\nReply to: test@example.com$/);
});

test('custom enquiries work with only email configured and no selected app', () => {
  const result = appEnquiryLinks({ name: 'Visitor', reply: '', app: '', intent: 'Build a custom app', message: 'Build a tool for my business.' }, 'owner@example.com');
  assert.equal(result.whatsapp, undefined);
  assert.match(result.body, /App: New project/);
  assert.ok(!result.body.includes('Reply to:'));
});
