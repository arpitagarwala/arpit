import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSite,siteDefaults} from '../src/lib/site-config.ts';

test('saved app links migrate with their paths, queries and fragments',()=>{
  const stored=siteDefaults();
  stored.home.actions[0].href='https://ca.arpitagarwala.online/?exam=inter#chat';
  stored.navigation[0].href='https://vertex.arpitagarwala.online/login';
  stored.about.connect[0].href='https://finsight.arpitagarwala.online/register';
  stored.achievements.items[0].href='https://design.arpitagarwala.online/#projects';
  stored.about.connect[1].href='https://design.arpitagarwala.com/?ref=portfolio#gallery';
  const migrated=normalizeSite(stored);
  assert.equal(migrated.home.actions[0].href,'https://ca.arpitagarwala.com/?exam=inter#chat');
  assert.equal(migrated.navigation[0].href,'https://vertex.arpitagarwala.com/login');
  assert.equal(migrated.about.connect[0].href,'https://finsight.arpitagarwala.com/register');
  assert.equal(migrated.achievements.items[0].href,'/designs#projects');
  assert.equal(migrated.about.connect[1].href,'/designs?ref=portfolio#gallery');
  assert.equal(stored.home.actions[0].href,'https://ca.arpitagarwala.online/?exam=inter#chat');
});

test('migration leaves other hosts, relative routes and misleading host suffixes alone',()=>{
  const stored=siteDefaults();
  const urls=['/about','https://other.arpitagarwala.online/','https://ca.arpitagarwala.online.example.org/'];
  stored.home.actions.forEach((action,i)=>{action.href=urls[i];});
  assert.deepEqual(normalizeSite(stored).home.actions.map(action=>action.href),urls);
});
