/** Compact builders so subject files stay readable. */
export const mcq = (id, question, options, answer, explanation) => ({ id, question, options, answer, explanation });
export const qa = (q, a) => ({ q, a });
export const long = (q, outline) => ({ q, outline });
export const def = (term, meaning) => ({ term, meaning });
