import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

const loadGoogleIdentity = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google sign-in could not be loaded.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Google sign-in could not be loaded.'));
    document.head.appendChild(script);
  });

export default function GoogleSignInButton({ onCredential, onError }) {
  const buttonRef = useRef(null);
  const [loadError, setLoadError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Use refs for callbacks so function identity changes don't trigger re-renders
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;
    let cancelled = false;

    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !buttonRef.current) return;

        // Initialize Google Accounts once
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => onCredentialRef.current?.(credential),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear previous instances before rendering
        buttonRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 320,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error.message);
        onErrorRef.current?.(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]); // ONLY depend on clientId!

  if (!clientId) return <p className="text-center text-xs text-gray-500">Google sign-in is not configured yet.</p>;
  if (loadError) return <p className="text-center text-xs text-red-600">{loadError}</p>;

  return (
    <div className="w-full flex justify-center items-center min-h-[44px]">
      <div ref={buttonRef} className="w-[320px] h-[44px]" />
    </div>
  );
}