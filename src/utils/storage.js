const PREFIX = 'himalayahub:';
const OLD_PREFIX = 'learnhub:';

/** One-time copy of data saved under the old LearnHub name, so nobody loses progress. */
(function migrate() {
  try {
    const ls = window.localStorage;
    if (ls.getItem(`${PREFIX}__migrated`)) return;
    for (let i = 0; i < ls.length; i += 1) {
      const k = ls.key(i);
      if (k && k.startsWith(OLD_PREFIX)) {
        const nk = PREFIX + k.slice(OLD_PREFIX.length);
        if (ls.getItem(nk) === null) ls.setItem(nk, ls.getItem(k));
      }
    }
    ls.setItem(`${PREFIX}__migrated`, '1');
  } catch { /* storage unavailable */ }
}());

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try { window.localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}
