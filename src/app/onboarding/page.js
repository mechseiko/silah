'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LEVELS = [
  { id: 'beginner', label: 'Just starting', desc: 'A few verses a day is enough', goal: 1 },
  { id: 'regular', label: 'Building a habit', desc: 'I want to read consistently', goal: 3 },
  { id: 'dedicated', label: 'Dedicated reader', desc: 'I read multiple pages daily', goal: 5 },
  { id: 'hifz', label: 'Hifz student', desc: "I'm memorizing the Quran", goal: 10 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState(null);
  const [action, setAction] = useState(null); // 'create' | 'join'
  const [inviteCode, setInviteCode] = useState('');
  const [circleName, setCircleName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save profile
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, level }),
      });

      // Create or join circle
      if (action === 'create' && circleName) {
        await fetch('/api/circle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: circleName }),
        });
      } else if (action === 'join' && inviteCode) {
        await fetch('/api/circle/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode }),
        });
      }

      router.push('/home');
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col px-6 py-12">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300
              ${s <= step ? 'bg-primary-400' : 'bg-ink-200'}`}
          />
        ))}
      </div>

      {/* Step 1 — Name */}
      {step === 1 && (
        <div className="flex-1 animate-slide-up">
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-2">
            What should we call you?
          </h2>
          <p className="text-ink-500 mb-8">Your circle will see this name.</p>
          <input
            className="input text-lg"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* Step 2 — Level */}
      {step === 2 && (
        <div className="flex-1 animate-slide-up">
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-2">
            Where are you in your journey?
          </h2>
          <p className="text-ink-500 mb-6">We'll suggest a starting goal. You can change it anytime.</p>
          <div className="space-y-3">
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all
                  ${level === l.id
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-ink-100 bg-white hover:border-ink-200'
                  }`}
              >
                <p className="text-sm font-medium text-ink-800">{l.label}</p>
                <p className="text-xs text-ink-500 mt-0.5">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Circle */}
      {step === 3 && (
        <div className="flex-1 animate-slide-up">
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-2">
            Join or create a circle
          </h2>
          <p className="text-ink-500 mb-6">A circle is a small group of 2–7 people who read together.</p>

          {!action && (
            <div className="space-y-3">
              <button
                onClick={() => setAction('create')}
                className="w-full p-5 rounded-2xl border-2 border-ink-100 bg-white hover:border-primary-200 text-left transition-all"
              >
                <p className="text-base font-medium text-ink-800">Create a new circle</p>
                <p className="text-sm text-ink-500 mt-0.5">Start one with your family or friends</p>
              </button>
              <button
                onClick={() => setAction('join')}
                className="w-full p-5 rounded-2xl border-2 border-ink-100 bg-white hover:border-primary-200 text-left transition-all"
              >
                <p className="text-base font-medium text-ink-800">Join with an invite code</p>
                <p className="text-sm text-ink-500 mt-0.5">Someone sent you a 6-letter code</p>
              </button>
              <button
                onClick={() => router.push('/home')}
                className="w-full text-sm text-ink-400 py-3 hover:text-ink-600 transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {action === 'create' && (
            <div className="animate-slide-up">
              <button onClick={() => setAction(null)} className="text-sm text-ink-400 mb-4">← Back</button>
              <input
                className="input text-base mb-2"
                placeholder="Circle name (e.g. Al-Noor Family)"
                value={circleName}
                onChange={e => setCircleName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-ink-400">You can invite members after creation.</p>
            </div>
          )}

          {action === 'join' && (
            <div className="animate-slide-up">
              <button onClick={() => setAction(null)} className="text-sm text-ink-400 mb-4">← Back</button>
              <input
                className="input text-xl tracking-widest uppercase font-mono mb-2"
                placeholder="XXXXXX"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-ink-400">Enter the 6-character invite code from your circle admin.</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-ghost px-6">
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={(step === 1 && !name.trim()) || (step === 2 && !level)}
            className="btn-primary flex-1"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              'Start reading ✦'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
