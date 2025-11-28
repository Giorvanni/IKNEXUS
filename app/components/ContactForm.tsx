"use client";

import { useState } from 'react';

type FormState = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  topic: '',
  message: ''
};

const topics = [
  { value: 'ritueel', label: 'Ritueel boeken' },
  { value: 'academy', label: 'Academy / mentorschap' },
  { value: 'partnership', label: 'Samenwerking' },
  { value: 'other', label: 'Anders' }
];

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleChange<T extends keyof FormState>(key: T, value: FormState[T]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(values: FormState) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (values.name.trim().length < 2) nextErrors.name = 'Vul je naam in.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) nextErrors.email = 'Voer een geldig e‑mailadres in.';
    if (values.phone && values.phone.trim().length < 6) nextErrors.phone = 'Telefoonnummer lijkt onvolledig.';
    if (values.message.trim().length < 20) nextErrors.message = 'Bericht moet minimaal 20 tekens zijn.';
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMessage =
          (payload && typeof payload === 'object' && 'error' in payload && (payload as any).error?.message) ||
          'Verzenden mislukt. Probeer het later nogmaals.';
        throw new Error(errorMessage);
      }
      setForm(initialState);
      setStatus('success');
      setFeedback('Bedankt! We reageren binnen één werkdag.');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      setStatus('error');
      setFeedback(error instanceof Error ? error.message : 'Verzenden mislukt.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-4"
      aria-describedby={feedback ? 'contact-feedback' : undefined}
    >
      <Field
        id="contact-name"
        label="Naam"
        value={form.name}
        onChange={(value) => handleChange('name', value)}
        error={errors.name}
        autoComplete="name"
        required
      />
      <Field
        id="contact-email"
        label="E‑mail"
        type="email"
        value={form.email}
        onChange={(value) => handleChange('email', value)}
        error={errors.email}
        autoComplete="email"
        required
      />
      <Field
        id="contact-phone"
        label="Telefoon (optioneel)"
        type="tel"
        value={form.phone}
        onChange={(value) => handleChange('phone', value)}
        error={errors.phone}
        autoComplete="tel"
      />
      <div className="grid gap-2">
        <label htmlFor="contact-topic" className="text-sm font-medium">
          Onderwerp
        </label>
        <select
          id="contact-topic"
          value={form.topic}
          onChange={(event) => handleChange('topic', event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">Maak een keuze…</option>
          {topics.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Bericht
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(event) => handleChange('message', event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
      </div>
      <button
        type="submit"
        className="btn-primary text-sm"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Versturen…' : 'Verstuur'}
      </button>
      {feedback && (
        <p
          id="contact-feedback"
          className={`text-xs ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  required?: boolean;
}

function Field({ id, label, type = 'text', value, onChange, error, autoComplete, required }: FieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

