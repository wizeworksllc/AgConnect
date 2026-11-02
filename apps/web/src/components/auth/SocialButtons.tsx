'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faApple, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { authClient, fetchSocialProviders } from '@/lib/auth-client';
import { localizedAuthError, socialCallbackUrls, type SignupRole } from './authShared';
import { OrDivider } from './AuthFields';

type SocialId = 'google' | 'microsoft' | 'apple';

const PROVIDERS: Record<SocialId, { icon: IconDefinition; labelKey: SocialId }> = {
  google: { icon: faGoogle, labelKey: 'google' },
  microsoft: { icon: faMicrosoft, labelKey: 'microsoft' },
  apple: { icon: faApple, labelKey: 'apple' },
};

type Props = {
  locale: string;
  role?: SignupRole;
  disabled: boolean;
  onError: (message: string) => void;
};

export function SocialButtons({ locale, role, disabled, onError }: Props) {
  const tShared = useTranslations('auth.shared');
  const tErrors = useTranslations('auth.shared.errors');
  const [providers, setProviders] = useState<SocialId[]>([]);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSocialProviders().then((ids) => {
      if (alive) setProviders(ids.filter((id): id is SocialId => id in PROVIDERS));
    });
    return () => {
      alive = false;
    };
  }, []);

  if (providers.length === 0) return null;

  async function start(provider: SocialId) {
    setPending(provider);
    const { error } = await authClient.signIn.social({
      provider,
      ...socialCallbackUrls(locale),
      ...(role ? { additionalData: { signupRole: role } } : {}),
    });
    if (error) {
      setPending(null);
      onError(localizedAuthError(error, tErrors, 'generic'));
    }
  }

  return (
    <>
      <div className="mb-4 grid gap-2">
        {providers.map((id) => {
          const { icon, labelKey } = PROVIDERS[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => start(id)}
              disabled={disabled || pending !== null}
              className="btn btn-outline border-base-300 hover:bg-base-200 w-full justify-center gap-3 rounded-full text-sm font-semibold"
            >
              <FontAwesomeIcon icon={icon} className="h-4 w-4" />
              {tShared(labelKey)}
            </button>
          );
        })}
      </div>
      <OrDivider label={tShared('or')} />
    </>
  );
}
