import { Hono } from 'hono';
import { ok } from '@agconn/api-client/server';
import { enabledProviders } from './providers.js';
import { contextFromHeaders, runWithAuthContext } from './request-context.js';
import { auth } from './server.js';

export const authRoutes = new Hono();

// Which social sign-in buttons the web app should show.
authRoutes.get('/providers', (c) => ok(c, { providers: enabledProviders() }));

authRoutes.on(['GET', 'POST'], '/*', (c) =>
  runWithAuthContext(contextFromHeaders(c.req.raw.headers), () => auth.handler(c.req.raw)),
);
