import { it1 } from './it1';
import { it2 } from './it2';
import { business } from './business';

/** Shared subject library: one entry per subject, reused by every program that teaches it. */
export const subjects = [...it1, ...it2, ...business];
export const getSubject = (id) => subjects.find((s) => s.id === id);
