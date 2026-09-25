import {
  LayoutDashboard, Newspaper, Tags, BookOpen, GraduationCap, ListChecks, Mountain, Compass, CloudSun, Trophy, LineChart, Coins,
  Bitcoin, BarChart3, Landmark, Layers, CalendarDays, Users, UserCheck, KeyRound, Siren, Server, Settings, Image, ScrollText, FileText, ShieldAlert,
} from 'lucide-react';

const ICONS = { LayoutDashboard, Newspaper, Tags, BookOpen, GraduationCap, ListChecks, Mountain, Compass, CloudSun, Trophy, LineChart, Coins, Bitcoin, BarChart3, Landmark, Layers, CalendarDays, Users, UserCheck, KeyRound, Siren, Server, Settings, Image, ScrollText, ShieldAlert };
export function AdminIcon({ name, ...p }) { const C = ICONS[name] || FileText; return <C aria-hidden="true" {...p} />; }
