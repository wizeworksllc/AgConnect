import { MagicLinkForm } from './MagicLinkForm';

export const metadata = { title: 'Sign in — AGCONN Admin' };
export const dynamic = 'force-dynamic';

export default function SignInPage() {
    return (
        <div className="flex justify-center">
            <MagicLinkForm />
        </div>
    );
}
