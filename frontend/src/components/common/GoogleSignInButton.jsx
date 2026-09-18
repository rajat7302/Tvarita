import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

const loadGoogleIdentity = () => new Promise((resolve, reject) => {
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

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;
    let cancelled = false;
    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => onCredential(credential),
          auto_select: false,
          cancel_on_tap_outside: true
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', width: 320
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error.message);
        onError?.(error.message);
      });
    return () => {
      cancelled = true;
      if (buttonRef.current) buttonRef.current.replaceChildren();
    };
  }, [clientId, onCredential, onError]);

  if (!clientId) return <p className="text-center text-xs text-gray-500">Google sign-in is not configured yet.</p>;
  if (loadError) return <p className="text-center text-xs text-red-600">{loadError}</p>;
  return <div ref={buttonRef} className="flex justify-center min-h-10" />;
}
