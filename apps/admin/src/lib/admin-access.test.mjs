import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessFromStatus, bearerFallback } from './admin-access.ts';

test('bearer fallback is never used in production', () => {
  assert.equal(bearerFallback('secret', 'production'), null);
});

test('bearer fallback works in dev and test', () => {
  assert.equal(bearerFallback('secret', 'development'), 'Bearer secret');
  assert.equal(bearerFallback('secret', 'test'), 'Bearer secret');
});

test('no token means no fallback', () => {
  assert.equal(bearerFallback('', 'development'), null);
});

test('no session is unauthenticated', () => {
  assert.equal(accessFromStatus(401), 'unauthenticated');
});

test('a signed-in non-admin is forbidden', () => {
  assert.equal(accessFromStatus(403), 'forbidden');
  assert.equal(accessFromStatus(500), 'forbidden');
});

test('an admin is allowed', () => {
  assert.equal(accessFromStatus(200), 'allow');
});
