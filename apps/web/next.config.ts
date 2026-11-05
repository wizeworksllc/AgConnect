import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { SECURITY_HEADERS } from './src/lib/security-headers';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    typedRoutes: true,
    // Standalone output: self-contained server bundle in .next/standalone for
    // slim Docker images (no node_modules in the runtime layer).
    output: 'standalone',
    outputFileTracingRoot: process.env.NEXT_OUTPUT_FILE_TRACING_ROOT,
    // OG routes read bundled TTFs with fs at runtime, which the tracer cannot see.
    outputFileTracingIncludes: {
        '/og/**': ['./src/app/og/_shared/fonts/*.ttf'],
    },
    // Workspace packages export TypeScript source via the "source" condition.
    // SWC transpiles them so no pre-build step is required during next build.
    transpilePackages: ['@agconn/api-client', '@agconn/auth', '@agconn/schemas', '@agconn/sms', '@agconn/ui'],
    // WizeLens hooks node:http at runtime; bundling it would break that.
    serverExternalPackages: ['@wizeworks/lens-node'],
    webpack(config) {
        // Prepend the custom "source" condition so webpack picks up the TypeScript
        // source entry from workspace package exports before the "import" condition
        // (which points to dist/ and may not exist without a prior build).
        config.resolve.conditionNames = [
            'source',
            ...(config.resolve.conditionNames ?? []),
        ];
        return config;
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    ...SECURITY_HEADERS,
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                    {
                        key: 'Content-Security-Policy',
                        value:
                            "default-src 'self'; script-src 'self'; connect-src 'self' https:; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; font-src 'self' https: data:",
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
