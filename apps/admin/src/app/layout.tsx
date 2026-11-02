import type { Metadata, Viewport } from 'next';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import { inter, interTight, dmMono } from '@/lib/fonts';
import { WizeLens } from '@/components/WizeLens';
import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

faConfig.autoAddCss = false;

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL?.trim() || 'http://localhost:3100'),
    title: 'AGCONN Admin',
    description: 'Internal admin console.',
    robots: { index: false, follow: false },
};

export const viewport: Viewport = {
    themeColor: '#5B6E2E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const fontVars = `${inter.variable} ${interTight.variable} ${dmMono.variable}`;

    return (
        <html lang="en" data-theme="tierra-light" style={{ colorScheme: 'light' }} className={fontVars}>
            <body className="bg-base-200 text-base-content antialiased">
                {children}
                <WizeLens />
            </body>
        </html>
    );
}
