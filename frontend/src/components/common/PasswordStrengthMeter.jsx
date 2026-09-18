import React from 'react';

const getPasswordStrength = (password = '') => {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password)
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-600'];

  return { score, label: labels[score], color: colors[score] };
};

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-label={`Password strength: ${label}`}>
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full ${segment <= score ? color : 'bg-stone-200'}`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-stone-500">
        <span>Strength: {label}</span>
        <span>8+ chars, upper, lower, number</span>
      </div>
    </div>
  );
}
