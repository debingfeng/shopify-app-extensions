import assert from 'node:assert/strict';
import {test} from 'node:test';

import register, {searchLabDemos} from '../src/index.js';

test('searches Chinese and English topics and returns app links', () => {
  assert.deepEqual(searchLabDemos({query: '图表'}).results.map((result) => result.url), [
    'app://zh-CN/packages/charts',
  ]);
  assert.deepEqual(searchLabDemos({query: 'web pixel'}).results.map((result) => result.url), [
    'app://en/extensions/lab-web-pixel',
  ]);
  assert.equal(searchLabDemos().results.length, 6);
  assert.equal(searchLabDemos({query: 'not-a-demo'}).results.length, 0);
});

test('registers the declared Sidekick tool', () => {
  const registrations = [];
  globalThis.shopify = {tools: {register: (...args) => registrations.push(args)}};
  try {
    register();
    assert.equal(registrations[0][0], 'search_lab_demos');
    assert.deepEqual(registrations[0][1]({query: 'puck'}).results.map((result) => result.url), [
      'app://en/packages/puck-page-builder',
    ]);
  } finally {
    delete globalThis.shopify;
  }
});
