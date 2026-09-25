import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';

// Pages are code-split so the first load stays small.
const Typing = lazy(() => import('./pages/Typing'));
const TypingLessons = lazy(() => import('./pages/TypingLessons'));
const TypingLesson = lazy(() => import('./pages/TypingLesson'));
const Learn = lazy(() => import('./pages/Learn'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const Notes = lazy(() => import('./pages/Notes'));
const NoteDetail = lazy(() => import('./pages/NoteDetail'));
const Tools = lazy(() => import('./pages/Tools'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const DateConverterPage = lazy(() => import('./pages/DateConverterPage'));
const CurrencyPage = lazy(() => import('./pages/CurrencyPage'));
const WorldClockPage = lazy(() => import('./pages/WorldClockPage'));
const Astrology = lazy(() => import('./pages/Astrology'));
const Tarot = lazy(() => import('./pages/Tarot'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const News = lazy(() => import('./pages/News'));
const Sports = lazy(() => import('./pages/Sports'));
const Football = lazy(() => import('./pages/Football'));
const Cricket = lazy(() => import('./pages/Cricket'));
const NPL = lazy(() => import('./pages/NPL'));
const Markets = lazy(() => import('./pages/Markets'));
const Gold = lazy(() => import('./pages/Gold'));
const Crypto = lazy(() => import('./pages/Crypto'));
const Nepse = lazy(() => import('./pages/Nepse'));
const Weather = lazy(() => import('./pages/Weather'));
const WhereToGo = lazy(() => import('./pages/WhereToGo'));
const ExploreNepal = lazy(() => import('./pages/ExploreNepal'));
const Emergency = lazy(() => import('./pages/Emergency'));
const BMI = lazy(() => import('./pages/BMI'));
const ProgramNotes = lazy(() => import('./pages/ProgramNotes'));
const SubjectDetail = lazy(() => import('./pages/SubjectDetail'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const ImageCredits = lazy(() => import('./pages/ImageCredits'));

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="typing" element={<Typing />} />
        <Route path="typing/lessons" element={<TypingLessons />} />
        <Route path="typing/lessons/:lessonId" element={<TypingLesson />} />
        <Route path="learn" element={<Learn />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/:category" element={<QuizPage />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/csit" element={<ProgramNotes programId="csit" />} />
        <Route path="notes/bca" element={<ProgramNotes programId="bca" />} />
        <Route path="notes/bim" element={<ProgramNotes programId="bim" />} />
        <Route path="notes/bba" element={<ProgramNotes programId="bba" />} />
        <Route path="notes/:program/:subjectId" element={<SubjectDetail />} />
        <Route path="notes/:noteId" element={<NoteDetail />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/calendar" element={<CalendarPage />} />
        <Route path="tools/date-converter" element={<DateConverterPage />} />
        <Route path="tools/currency" element={<CurrencyPage />} />
        <Route path="tools/world-clock" element={<WorldClockPage />} />
        <Route path="tools/bmi" element={<Navigate to="/bmi" replace />} />
        <Route path="bmi" element={<BMI />} />
        <Route path="news" element={<News />} />
        <Route path="news/:category" element={<News />} />
        <Route path="sports" element={<Sports />} />
        <Route path="football" element={<Football />} />
        <Route path="cricket" element={<Cricket />} />
        <Route path="npl" element={<NPL />} />
        <Route path="markets" element={<Markets />} />
        <Route path="gold" element={<Gold />} />
        <Route path="crypto" element={<Crypto />} />
        <Route path="nepse" element={<Nepse />} />
        <Route path="weather" element={<Weather />} />
        <Route path="weather/:location" element={<Weather />} />
        <Route path="where-to-go" element={<WhereToGo />} />
        <Route path="explore-nepal" element={<ExploreNepal />} />
        <Route path="explore-nepal/:destination" element={<DestinationDetail />} />
        <Route path="destinations" element={<Navigate to="/explore-nepal" replace />} />
        <Route path="image-credits" element={<ImageCredits />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="astrology" element={<Astrology />} />
        <Route path="tarot" element={<Tarot />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
