/**
 * Maps icon names used in data files to Lucide components, so data stays
 * plain JSON-friendly (easy to move to an API later).
 */
import {
  Network, Code2, Database, Shield, Cloud, Wifi, Monitor, Globe, Layers, Brain, Cpu,
  CalendarDays, ArrowLeftRight, Coins, GraduationCap, ListChecks, BookOpen, Keyboard,
  Sparkles, Star, FileText, HelpCircle, LayoutDashboard, Clock, Terminal, Server,
  Sigma, Share2, KeyRound, KanbanSquare, FolderKanban, Calculator, TrendingUp, BarChart3,
  Users, MessageSquare, Megaphone, Landmark, UserCheck, Scale, Rocket, HeartPulse,
  Trophy, CircleDot, Target, Flag, LineChart, Bitcoin, CloudSun, Compass, Mountain,
  Siren, MapPin, Newspaper, Gem, Plane,
} from 'lucide-react';

export const ICONS = {
  Network, Code2, Database, Shield, Cloud, Wifi, Monitor, Globe, Layers, Brain, Cpu,
  CalendarDays, ArrowLeftRight, Coins, GraduationCap, ListChecks, BookOpen, Keyboard,
  Sparkles, Star, FileText, HelpCircle, LayoutDashboard, Clock, Terminal, Server,
  Sigma, Share2, KeyRound, KanbanSquare, FolderKanban, Calculator, TrendingUp, BarChart3,
  Users, MessageSquare, Megaphone, Landmark, UserCheck, Scale, Rocket, HeartPulse,
  Trophy, CircleDot, Target, Flag, LineChart, Bitcoin, CloudSun, Compass, Mountain,
  Siren, MapPin, Newspaper, Gem, Plane,
};

export function Icon({ name, ...props }) {
  const Cmp = ICONS[name] || FileText;
  return <Cmp aria-hidden="true" {...props} />;
}
