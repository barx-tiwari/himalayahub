import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Terms() {
  useDocumentTitle('Terms of Use');
  return (
    <div className="container page prose">
      <h1>Terms of Use</h1>
      <p className="muted">Sample terms for the demo version.</p>
      <h2>Educational use</h2>
      <p>Notes, courses and quizzes are provided for learning. We try to keep them accurate, but please confirm important facts with your textbooks and teachers.</p>
      <h2>Tools</h2>
      <p>Date conversions use a built-in Bikram Sambat table. Exchange rates are sample values unless a live API is connected, and are not suitable for financial transactions.</p>
      <h2>Entertainment features</h2>
      <p>The AI Astrologer and Tarot readings are for entertainment and reflection only. They are not scientific and are not medical, financial, legal or psychological advice, and they cannot predict the future.</p>
      <h2>Acceptable use</h2>
      <p>Do not misuse the service, attempt to break it, or copy its content for commercial redistribution without permission.</p>
    </div>
  );
}
