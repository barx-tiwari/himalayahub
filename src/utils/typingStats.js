/**
 * Compute live typing statistics.
 * - WPM uses the standard 5 characters = 1 word, counting only correct characters.
 * - Accuracy is correct keystrokes / total keystrokes (mistakes that were later fixed still count).
 */
export function computeTypingStats({ text, input, keystrokes, mistakes, elapsedMs }) {
  let correct = 0;
  for (let i = 0; i < input.length; i += 1) {
    if (input[i] === text[i]) correct += 1;
  }
  const incorrect = input.length - correct;
  const minutes = elapsedMs / 60000;
  const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0;
  const rawWpm = minutes > 0 ? Math.round(input.length / 5 / minutes) : 0;
  const accuracy = keystrokes > 0 ? Math.max(0, Math.round(((keystrokes - mistakes) / keystrokes) * 100)) : 100;
  const progress = text.length ? Math.min(100, Math.round((input.length / text.length) * 100)) : 0;
  return { wpm, rawWpm, accuracy, characters: input.length, correct, incorrect, errors: mistakes, progress };
}
