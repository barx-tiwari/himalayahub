/**
 * Fixed-date observances only. Lunar festivals (Dashain, Tihar, Holi, Teej,
 * Chhath, Buddha Jayanti, Shivaratri, etc.) move every year and should come
 * from an official calendar API; see "Connecting APIs" in README.md.
 */
export const bsFixedEvents = [
  { month: 1, day: 1, name: 'Nepali New Year (Navavarsha)', holiday: true },
  { month: 1, day: 11, name: 'Loktantra Diwas (Democracy Day)', holiday: true },
  { month: 2, day: 15, name: 'Ganatantra Diwas (Republic Day)', holiday: true },
  { month: 3, day: 15, name: 'Ropain Diwas / National Paddy Day', holiday: false },
  { month: 6, day: 3, name: 'Sambidhan Diwas (Constitution Day)', holiday: true },
  { month: 9, day: 27, name: 'Prithvi Jayanti (National Unity Day)', holiday: true },
  { month: 10, day: 1, name: 'Maghe Sankranti', holiday: true },
  { month: 10, day: 16, name: 'Shahid Diwas (Martyrs\' Day)', holiday: false },
  { month: 11, day: 7, name: 'Prajatantra Diwas (Democracy Day)', holiday: true },
];

export const adFixedEvents = [
  { month: 1, day: 1, name: 'International New Year', holiday: false },
  { month: 3, day: 8, name: 'International Women\'s Day', holiday: false },
  { month: 5, day: 1, name: 'International Labour Day', holiday: false },
  { month: 12, day: 25, name: 'Christmas Day', holiday: true },
];

export function eventsForBsDay(month, day) {
  return bsFixedEvents.filter((e) => e.month === month && e.day === day);
}
export function eventsForAdDay(month, day) {
  return adFixedEvents.filter((e) => e.month === month && e.day === day);
}
