import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('About');
  return (
    <div className="container page prose">
      <h1>About HimalayaHub</h1>
      <p>HimalayaHub brings together the everyday things an IT student needs: typing practice, clear revision notes, short courses, quizzes and handy tools like a Bikram Sambat calendar and date converter.</p>
      <h2>What you can do</h2>
      <ul>
        <li>Build typing speed with <Link to="/typing">timed challenges</Link> and <Link to="/typing/lessons">ten lessons</Link>.</li>
        <li>Revise with <Link to="/notes">IT notes</Link> covering networking, programming, databases and more.</li>
        <li>Follow <Link to="/courses">courses</Link> and test yourself with <Link to="/quizzes">quizzes</Link>.</li>
        <li>Use the <Link to="/tools/calendar">Nepali calendar</Link>, <Link to="/tools/date-converter">date converter</Link>, <Link to="/tools/currency">currency converter</Link> and <Link to="/tools/world-clock">world clock</Link>.</li>
      </ul>
      <h2>How your data is handled</h2>
      <p>This version works without an account server. Your progress is saved in your own browser. See the <Link to="/privacy">Privacy Policy</Link> for details.</p>
      <h2>Content notes</h2>
      <p>Course instructors shown are sample placeholders. The AI Astrologer and Tarot sections are for entertainment only.</p>
    </div>
  );
}
