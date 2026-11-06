import { SignOutButton } from '@/components/admin-shell/SignOutButton';

export const metadata = { title: 'Access denied — AGCONN Admin' };
export const dynamic = 'force-dynamic';

export default function ForbiddenPage() {
    return (
        <main className="bg-base-200 grid min-h-screen place-items-center px-5 py-12">
            <div className="bg-base-100 border-base-300 w-full max-w-md rounded-box border p-8 text-center shadow-[var(--shadow-card)]">
                <p className="text-sm font-semibold text-error">403 — Forbidden</p>
                <h1 className="mt-2 font-serif text-2xl font-medium">Not an admin account.</h1>
                <p className="text-base-content/70 mt-3 text-sm leading-relaxed">
                    This console is restricted to AGCONN staff accounts. If you
                    believe you should have access, contact your administrator.
                </p>
                <div className="mt-6">
                    <SignOutButton withLabel />
                </div>
            </div>
        </main>
    );
}
