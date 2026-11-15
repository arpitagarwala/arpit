import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicContact} from '../src/lib/public-contact.server.ts';
import {siteDefaults,normalizeSite} from '../src/lib/site-config.ts';

test('legacy saved contacts and published text use the routing email without mutating storage',()=>{
  const saved=siteDefaults();
  saved.home.email='arpitagarwalms@gmail.com';
  saved.about.connect[0].label='ARPITAGARWALMS@GMAIL.COM';
  saved.about.connect[0].href='mailto:arpitagarwalms%40gmail.com?subject=Hello';
  const original=structuredClone(saved);
  const migrated=publicContact(normalizeSite(saved));
  assert.equal(migrated.home.email,'connect@arpitagarwala.com');
  assert.equal(migrated.about.connect[0].label,'connect@arpitagarwala.com');
  assert.equal(migrated.about.connect[0].href,'mailto:connect%40arpitagarwala.com?subject=Hello');
  assert.deepEqual(saved,original);
  assert.deepEqual(publicContact(migrated),migrated);
  const entry={body:'Email arpitagarwalms@gmail.com; contributor: someone@gmail.com',tags:['Contact'],coverId:null};
  assert.deepEqual(publicContact(entry),{...entry,body:'Email connect@arpitagarwala.com; contributor: someone@gmail.com'});
});
