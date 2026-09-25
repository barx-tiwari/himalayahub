import { networkingNotes } from './networking';
import { programmingNotes } from './programming';
import { databaseNotes } from './database';
import { otherNotes } from './other';

export const noteCategories = [
  { id: 'networking', name: 'Networking', icon: 'Network' },
  { id: 'programming', name: 'Programming', icon: 'Code2' },
  { id: 'database', name: 'Database', icon: 'Database' },
  { id: 'security', name: 'Cyber Security', icon: 'Shield' },
  { id: 'cloud', name: 'Cloud Computing', icon: 'Cloud' },
  { id: 'iot', name: 'IoT', icon: 'Wifi' },
  { id: 'os', name: 'Operating Systems', icon: 'Monitor' },
  { id: 'web', name: 'Web Development', icon: 'Globe' },
  { id: 'se', name: 'Software Engineering', icon: 'Layers' },
  { id: 'ai', name: 'Artificial Intelligence', icon: 'Brain' },
  { id: 'architecture', name: 'Computer Architecture', icon: 'Cpu' },
];

export const notes = [...networkingNotes, ...programmingNotes, ...databaseNotes, ...otherNotes];

export const getNote = (id) => notes.find((n) => n.id === id);
export const getCategory = (id) => noteCategories.find((c) => c.id === id);
