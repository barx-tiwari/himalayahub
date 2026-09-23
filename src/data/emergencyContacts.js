/**
 * Nepal emergency directory.
 *
 * RULES FOR EDITING THIS FILE
 * - Never add a number without a `sourceUrl` you have checked yourself.
 * - Update `verifiedOn` (YYYY-MM-DD) whenever you re-check an entry.
 * - If sources disagree, do not guess: leave `number: null` and point to
 *   the official contact page instead (see Electricity below).
 *
 * Last full review: 2026-09-23. Cross-checked against Nepal government
 * pages where available (NEOC, National Women Commission, Nepal Police
 * Cyber Bureau, U.S. Embassy Nepal emergency page) and recent reporting of
 * official announcements (Ministry of Home Affairs disaster hotline change).
 */
export const LAST_REVIEWED = '2026-09-23';

export const emergencyCategories = [
  'Police', 'Ambulance', 'Fire Brigade', 'Traffic Police', 'Tourist Police', 'Disaster Management',
  'Government Services', 'Electricity Emergency', 'Water Emergency', 'Women/Children Protection',
  'Cyber Crime', 'Health Emergency', 'Rescue Services',
];

/** Short codes are toll-free national numbers dialled without an area code. */
export const nationalContacts = [
  {
    id: 'police', category: 'Police', service: 'Nepal Police', number: '100', availability: '24/7',
    note: 'General emergency number for crime, accidents and immediate danger.',
    source: 'Nepal Police', sourceUrl: 'https://www.nepalpolice.gov.np/', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'ambulance', category: 'Ambulance', service: 'Ambulance', number: '102', availability: '24/7',
    note: 'Response times vary, especially outside the Kathmandu Valley.',
    source: 'Nepal Police / national short-code list', sourceUrl: 'https://np.usembassy.gov/emergency-assistance/', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'fire', category: 'Fire Brigade', service: 'Fire Brigade', number: '101', availability: '24/7',
    note: 'Fires and many rescue situations.',
    source: 'National short-code list', sourceUrl: 'https://www.nepalpolice.gov.np/', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'traffic', category: 'Traffic Police', service: 'Traffic Police', number: '103', availability: '24/7',
    note: 'Road accidents and traffic emergencies.',
    source: 'Nepal Police', sourceUrl: 'https://www.nepalpolice.gov.np/', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'tourist', category: 'Tourist Police', service: 'Tourist Police', number: '1144', availability: 'See source',
    note: 'Help for visitors: theft, scams, lost documents. Office at Bhrikuti Mandap, Kathmandu.',
    source: 'U.S. Embassy in Nepal (emergency assistance page)', sourceUrl: 'https://np.usembassy.gov/emergency-assistance/', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'disaster', category: 'Disaster Management', service: 'Disaster hotline (Ministry of Home Affairs)', number: '1234', availability: 'See source',
    note: 'Replaced the older central number 1149 in 2026. Calls from outside Kathmandu, Lalitpur and Bhaktapur route to the District Emergency Operation Centre.',
    source: 'Ministry of Home Affairs press release, as reported by Nepal News (July 2026)', sourceUrl: 'https://english.nepalnews.com/s/nation/disaster-hotline-1234-extended-to-all-districts-to-enhance-rescue-operations/', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'neoc', category: 'Disaster Management', service: 'National Emergency Operation Centre (office line)', number: '+977-1-4200105', availability: 'See source',
    note: 'NEOC, Singha Durbar. Email neoc@moha.gov.np.',
    source: 'NEOC official website', sourceUrl: 'http://neoc.gov.np/en/', verifiedOn: '2026-09-23',
  },
  {
    id: 'women', category: 'Women/Children Protection', service: 'National Women Commission helpline "Khabar Garaun"', number: '1145', availability: '24/7',
    note: 'Gender-based violence and violence against women. Call or SMS. Online reporting at nwchelpline.gov.np.',
    source: 'National Women Commission', sourceUrl: 'https://nwchelpline.gov.np/?lang=en', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'child', category: 'Women/Children Protection', service: 'Child helpline', number: '1098', availability: 'See source',
    note: 'Child protection: abuse, trafficking, children in danger.',
    source: 'Ministry of Women, Children and Senior Citizens (as reported by Republica, May 2026)', sourceUrl: 'https://myrepublica.nagariknetwork.com/news/mowcsc-urges-reporting-of-gender-based-violence-via-helplines-1145-100-and--65-39.html', verifiedOn: '2026-09-23', primary: true,
  },
  {
    id: 'child-tracing', category: 'Women/Children Protection', service: 'Missing child tracing service', number: '104', availability: 'See source',
    note: 'Search coordination for missing children.',
    source: 'Ministry of Women, Children and Senior Citizens (as reported by Republica, May 2026)', sourceUrl: 'https://myrepublica.nagariknetwork.com/news/mowcsc-urges-reporting-of-gender-based-violence-via-helplines-1145-100-and--65-39.html', verifiedOn: '2026-09-23',
  },
  {
    id: 'cyber', category: 'Cyber Crime', service: 'Nepal Police Cyber Bureau (field officer)', number: '9851286771', availability: 'See source',
    note: 'Office: Bhotahiti, Kathmandu. Email cyberbureau@nepalpolice.gov.np. You can also file a report online.',
    source: 'Nepal Police Cyber Bureau contact page', sourceUrl: 'https://cyberbureau.nepalpolice.gov.np/about-us/contact-us/', verifiedOn: '2026-09-23',
    link: { label: 'Report cyber crime online', url: 'https://cyberbureau.nepalpolice.gov.np/report-cyber-crime/' },
  },
  {
    id: 'hello-sarkar', category: 'Government Services', service: 'Hello Sarkar (government grievance line)', number: '1111', availability: '24/7',
    note: 'Complaints about public services, run by the Office of the Prime Minister. Not an emergency service.',
    source: 'Hello Sarkar portal (OPMCM); 24/7 operation announced 2023', sourceUrl: 'https://gunaso.opmcm.gov.np/home', verifiedOn: '2026-09-23',
  },
  {
    id: 'electricity', category: 'Electricity Emergency', service: 'Nepal Electricity Authority', number: null, availability: 'Varies',
    note: 'Published short codes differ between sources, so none is listed here. For dangerous lines or outages, contact your local NEA distribution centre (listed on the official contacts page). If there is immediate danger, call 100.',
    source: 'Nepal Electricity Authority contacts', sourceUrl: 'https://www.nea.org.np/contacts', verifiedOn: '2026-09-23',
  },
  {
    id: 'water', category: 'Water Emergency', service: 'Local water supply office', number: null, availability: 'Varies',
    note: 'There is no national water emergency short code. In the Kathmandu Valley the utility is Kathmandu Upatyaka Khanepani Limited (KUKL); elsewhere, contact your municipality or local water users’ committee.',
    source: 'Your municipality / water utility', sourceUrl: null, verifiedOn: '2026-09-23',
  },
  {
    id: 'health', category: 'Health Emergency', service: 'Ambulance (medical emergencies)', number: '102', availability: '24/7',
    note: 'For outbreaks and health-system emergencies, the Ministry of Health’s Health Emergency Operation Centre publishes guidance.',
    source: 'Health Emergency Operation Centre (MoHFS)', sourceUrl: 'https://heoc.mohp.gov.np/', verifiedOn: '2026-09-23',
  },
  {
    id: 'rescue', category: 'Rescue Services', service: 'Police (coordinates rescue) / disaster hotline', number: '100', availability: '24/7',
    note: 'For floods, landslides and earthquakes also call the disaster hotline 1234. Nepal Police, Armed Police Force and Nepali Army run rescue operations through the emergency operation centres.',
    source: 'Nepal Police; Ministry of Home Affairs', sourceUrl: 'https://www.nepalpolice.gov.np/', verifiedOn: '2026-09-23',
  },
];

/** Official directories for finding district/municipal contacts. */
export const officialDirectories = [
  { label: 'Nepal Police (district offices and contacts)', url: 'https://www.nepalpolice.gov.np/' },
  { label: 'National Emergency Operation Centre (NEOC)', url: 'http://neoc.gov.np/en/' },
  { label: 'Ministry of Home Affairs', url: 'https://www.moha.gov.np/' },
  { label: 'Health Emergency Operation Centre (Ministry of Health)', url: 'https://heoc.mohp.gov.np/' },
  { label: 'National Women Commission service map (GBV services by area)', url: 'https://nwchelpline.gov.np/service-mapping?lang=en' },
];

/**
 * District- and municipality-level contacts.
 * Empty on purpose: add entries only after checking them on the official
 * District Police Office / District Administration Office / municipality site.
 *
 * Shape:
 * districtContacts['Kaski'] = {
 *   contacts: [{ service, number, availability, source, sourceUrl, verifiedOn }],
 *   municipalities: {
 *     'Pokhara Metropolitan City': [{ service, number, availability, source, sourceUrl, verifiedOn }],
 *   },
 * };
 */
export const districtContacts = {};
