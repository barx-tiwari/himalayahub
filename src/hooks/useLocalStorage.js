import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/** useState that persists to LocalStorage under the himalayahub: prefix. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));
  useEffect(() => { writeStorage(key, value); }, [key, value]);
  return [value, setValue];
}
