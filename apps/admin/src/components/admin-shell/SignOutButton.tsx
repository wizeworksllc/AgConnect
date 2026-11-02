'use client';

import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOutToSignIn } from '@/lib/auth-client';

export function SignOutButton({ withLabel = false }: { withLabel?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => void signOutToSignIn()}
      className={withLabel ? 'btn btn-neutral btn-sm rounded-full' : 'btn btn-ghost btn-sm btn-circle'}
      aria-label="Sign out"
      title="Sign out"
    >
      {withLabel ? 'Sign out' : <FontAwesomeIcon icon={faArrowRightFromBracket} className="h-4 w-4" />}
    </button>
  );
}
