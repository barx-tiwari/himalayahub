export const zodiacSigns = [
  { id: 'aries', name: 'Aries', glyph: '♈', dates: 'Mar 21 – Apr 19', start: [3, 21], element: 'Fire', planet: 'Mars', quality: 'Cardinal', traits: 'bold, energetic and quick to start new things', strengths: 'courage, initiative, honesty', colors: ['Red', 'Scarlet', 'Orange'] },
  { id: 'taurus', name: 'Taurus', glyph: '♉', dates: 'Apr 20 – May 20', start: [4, 20], element: 'Earth', planet: 'Venus', quality: 'Fixed', traits: 'patient, reliable and fond of comfort and beauty', strengths: 'persistence, loyalty, practicality', colors: ['Green', 'Pink', 'Cream'] },
  { id: 'gemini', name: 'Gemini', glyph: '♊', dates: 'May 21 – Jun 20', start: [5, 21], element: 'Air', planet: 'Mercury', quality: 'Mutable', traits: 'curious, talkative and quick-minded', strengths: 'adaptability, wit, communication', colors: ['Yellow', 'Light blue', 'Silver'] },
  { id: 'cancer', name: 'Cancer', glyph: '♋', dates: 'Jun 21 – Jul 22', start: [6, 21], element: 'Water', planet: 'Moon', quality: 'Cardinal', traits: 'caring, protective and emotionally perceptive', strengths: 'empathy, loyalty, imagination', colors: ['Silver', 'White', 'Sea green'] },
  { id: 'leo', name: 'Leo', glyph: '♌', dates: 'Jul 23 – Aug 22', start: [7, 23], element: 'Fire', planet: 'Sun', quality: 'Fixed', traits: 'warm, confident and generous', strengths: 'leadership, creativity, enthusiasm', colors: ['Gold', 'Orange', 'Purple'] },
  { id: 'virgo', name: 'Virgo', glyph: '♍', dates: 'Aug 23 – Sep 22', start: [8, 23], element: 'Earth', planet: 'Mercury', quality: 'Mutable', traits: 'thoughtful, organised and detail-oriented', strengths: 'analysis, diligence, helpfulness', colors: ['Navy', 'Beige', 'Olive'] },
  { id: 'libra', name: 'Libra', glyph: '♎', dates: 'Sep 23 – Oct 22', start: [9, 23], element: 'Air', planet: 'Venus', quality: 'Cardinal', traits: 'diplomatic, fair-minded and sociable', strengths: 'balance, cooperation, grace', colors: ['Pastel blue', 'Rose', 'Lavender'] },
  { id: 'scorpio', name: 'Scorpio', glyph: '♏', dates: 'Oct 23 – Nov 21', start: [10, 23], element: 'Water', planet: 'Mars (trad.), Pluto', quality: 'Fixed', traits: 'intense, determined and deeply loyal', strengths: 'focus, resourcefulness, bravery', colors: ['Maroon', 'Black', 'Deep red'] },
  { id: 'sagittarius', name: 'Sagittarius', glyph: '♐', dates: 'Nov 22 – Dec 21', start: [11, 22], element: 'Fire', planet: 'Jupiter', quality: 'Mutable', traits: 'adventurous, optimistic and freedom-loving', strengths: 'curiosity, humour, open-mindedness', colors: ['Purple', 'Turquoise', 'Indigo'] },
  { id: 'capricorn', name: 'Capricorn', glyph: '♑', dates: 'Dec 22 – Jan 19', start: [12, 22], element: 'Earth', planet: 'Saturn', quality: 'Cardinal', traits: 'ambitious, disciplined and practical', strengths: 'responsibility, patience, planning', colors: ['Brown', 'Grey', 'Dark green'] },
  { id: 'aquarius', name: 'Aquarius', glyph: '♒', dates: 'Jan 20 – Feb 18', start: [1, 20], element: 'Air', planet: 'Saturn (trad.), Uranus', quality: 'Fixed', traits: 'inventive, independent and humanitarian', strengths: 'originality, vision, friendliness', colors: ['Electric blue', 'Teal', 'Silver'] },
  { id: 'pisces', name: 'Pisces', glyph: '♓', dates: 'Feb 19 – Mar 20', start: [2, 19], element: 'Water', planet: 'Jupiter (trad.), Neptune', quality: 'Mutable', traits: 'gentle, intuitive and artistic', strengths: 'compassion, creativity, intuition', colors: ['Sea green', 'Lilac', 'Aqua'] },
];

/** Western (tropical) sun sign from month (1-12) and day. */
export function signFromDate(month, day) {
  const value = month * 100 + day;
  const ordered = [...zodiacSigns].sort((a, b) => (b.start[0] * 100 + b.start[1]) - (a.start[0] * 100 + a.start[1]));
  const found = ordered.find((s) => value >= s.start[0] * 100 + s.start[1]);
  return found || zodiacSigns.find((s) => s.id === 'capricorn');
}

export const getSign = (id) => zodiacSigns.find((s) => s.id === id);
