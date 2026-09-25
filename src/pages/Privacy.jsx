import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Privacy() {
  useDocumentTitle('Privacy Policy');
  return (
    <div className="container page prose">
      <h1>Privacy Policy</h1>
      <p className="muted">Sample policy for the demo version. Review it with a legal adviser before launching publicly.</p>
      <h2>What we store</h2>
      <p>Your profile name, typing scores, course and quiz progress, bookmarks and preferences are saved in your browser's LocalStorage on your device. They are not sent to any server by this app.</p>
      <h2>External services</h2>
      <p>If the site owner connects a currency or AI service, requests go to that service (or a backend acting for it). Astrology questions sent to a connected AI service may be processed by that provider. Fonts are loaded from Google Fonts.</p>
      <h2>Your control</h2>
      <p>You can export or delete all saved data at any time from the Profile page, or by clearing your browser's site data.</p>
      <h2>Children</h2>
      <p>The app does not knowingly collect personal information from anyone. Only a first name is requested and it stays on the device.</p>
    </div>
  );
}
