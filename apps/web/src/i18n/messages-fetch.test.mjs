import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchMessages, withLastGood } from './messages-fetch.ts';

const BASE = 'http://api.test';
const okBody = { ok: true, data: { locale: 'es', tenantId: null, messages: { nav: { home: 'Inicio' } } } };
const reply = (status, body) => async () => new Response(JSON.stringify(body), { status });

test('a good response returns the tree', async () => {
  assert.deepEqual(await fetchMessages(BASE, 'es', null, reply(200, okBody)), okBody.data.messages);
});

test('HTTP errors, bad envelopes and empty trees throw, so they are never cached', async () => {
  await assert.rejects(fetchMessages(BASE, 'es', null, reply(500, {})));
  await assert.rejects(fetchMessages(BASE, 'es', null, reply(200, { ok: false })));
  const empty = { ok: true, data: { locale: 'es', tenantId: null, messages: {} } };
  await assert.rejects(fetchMessages(BASE, 'es', null, reply(200, empty)));
  await assert.rejects(fetchMessages(BASE, 'es', null, async () => { throw new Error('ECONNREFUSED'); }));
});

test('a failure after a success serves the last good copy', async () => {
  const good = { nav: { home: 'Inicio' } };
  assert.deepEqual(await withLastGood('es|global', async () => good), good);
  assert.deepEqual(await withLastGood('es|global', async () => { throw new Error('down'); }), good);
});

test('a failure with no good copy throws, so a cold pod never shows raw keys', async () => {
  await assert.rejects(withLastGood('en|cold', async () => { throw new Error('down'); }), /down/);
});

test('next build has no api, so a failure with no good copy gives an empty tree', async () => {
  process.env.NEXT_PHASE = 'phase-production-build';
  try {
    assert.deepEqual(await withLastGood('en|build', async () => { throw new Error('down'); }), {});
  } finally {
    delete process.env.NEXT_PHASE;
  }
});
