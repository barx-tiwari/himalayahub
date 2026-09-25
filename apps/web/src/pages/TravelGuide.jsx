import { Link } from 'react-router-dom';
import { AlertTriangle, BadgeInfo, Bus, Coins, ExternalLink, HeartPulse, Languages, Landmark, Phone, Plane, Shirt, Smartphone, ShieldCheck } from 'lucide-react';
import Alert from '../components/ui/Alert';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { LAST_REVIEWED, nationalContacts } from '../data/emergencyContacts';

/**
 * Travel Nepal Guide for foreign visitors.
 * Editorial rule: rules and fees change, so this page states stable facts, labels anything
 * time-sensitive, and always links the official source. Emergency numbers come from the
 * reviewed directory in data/emergencyContacts.js — never re-typed here.
 */
export const GUIDE_REVIEWED = '2026-09-25';

const SECTIONS = [
  ['before', 'Before you arrive'], ['getting-around', 'Getting around'], ['culture', 'Culture & etiquette'],
  ['permits', 'Trekking permits'], ['safety', 'Safety & health'], ['useful', 'Useful tools & phrases'],
];
const EXT = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children} <ExternalLink aria-hidden="true" className="inline-ico" /></a>;

function Block({ icon: I, title, children }) {
  return <div className="card guide-block"><h3><I aria-hidden="true" /> {title}</h3>{children}</div>;
}

const PHRASES = [
  ['Namaste', 'Hello / goodbye (with palms together)'], ['Dhanyabad', 'Thank you'], ['Hajur?', 'Pardon? / Yes (polite)'],
  ['Kati ho?', 'How much is it?'], ['Mitho chha', 'It’s delicious'], ['Pani', 'Water'], ['Bistarai', 'Slowly, please'],
  ['Ma bujhdina', 'I don’t understand'], ['Sauchalaya kaha chha?', 'Where is the toilet?'], ['Maddat garnus!', 'Help!'],
];

export default function TravelGuide() {
  useDocumentTitle('Travel Nepal Guide');
  const tourist = nationalContacts.filter((c) => ['police', 'ambulance', 'fire'].includes(c.id) || c.category === 'Tourist Police');
  return (
    <div className="container page guide" data-domain="nepal">
      <header className="page-header">
        <p className="eyebrow">For international visitors</p>
        <h1>Travel Nepal Guide</h1>
        <p>Everything to sort out before and during your trip — visas, money, SIM cards, permits, etiquette and safety.</p>
      </header>
      <Alert type="info">Reviewed {GUIDE_REVIEWED}. Visa fees, permit rules and prices change — always confirm with the official links below before you travel.</Alert>
      <nav className="guide-toc" aria-label="On this page"><ul>{SECTIONS.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul></nav>

      <section id="before" className="guide-sec"><h2>Before you arrive</h2><div className="guide-grid">
        <Block icon={BadgeInfo} title="Visa">
          <p>Most nationalities can get a tourist visa on arrival at Tribhuvan International Airport and major land borders, or apply in advance. Filling in the online arrival form before you fly saves time at the airport. Indian citizens don’t need a visa. A few nationalities must apply at an embassy beforehand.</p>
          <p>Fees are charged in US dollars for 15, 30 or 90 days and can be paid in cash at the airport.</p>
          <p><EXT href="https://www.immigration.gov.np/">Department of Immigration — current fees and eligibility</EXT></p>
        </Block>
        <Block icon={Plane} title="Airports">
          <p><strong>Tribhuvan International (KTM), Kathmandu</strong> handles most international flights. Gautam Buddha International (Bhairahawa, near Lumbini) and Pokhara International also take some international services.</p>
          <p>Domestic flights to the mountains (Lukla, Jomsom, Tumlingtar, Suketar) are often delayed by weather — keep spare days before your flight home.</p>
        </Block>
        <Block icon={Coins} title="Money">
          <p>The currency is the Nepali rupee (NPR). ATMs are common in cities but rare in the hills; carry enough cash before trekking. Card payments work in many hotels and shops in Kathmandu and Pokhara, often with a surcharge.</p>
          <p>Change money at banks or licensed exchange counters and keep receipts. Rules on some Indian rupee notes have changed over time — check before relying on them.</p>
          <p><Link to="/tools/currency">Currency converter</Link> (Nepal Rastra Bank rates)</p>
        </Block>
        <Block icon={Smartphone} title="SIM cards">
          <p>The two mobile networks are <strong>Nepal Telecom (NTC)</strong> and <strong>Ncell</strong>. Buy a tourist SIM at the airport arrivals hall or a network shop with your passport and a photo (a copy is often taken on the spot). Coverage in remote valleys is patchy; NTC generally reaches further in the mountains.</p>
        </Block>
        <Block icon={ShieldCheck} title="Travel insurance">
          <p>Get a policy that covers the altitude you plan to reach <em>and</em> helicopter evacuation. Many standard policies stop at a set height or exclude trekking — read the small print. Agencies may ask to see it.</p>
        </Block>
      </div></section>

      <section id="getting-around" className="guide-sec"><h2>Getting around</h2><div className="guide-grid">
        <Block icon={Plane} title="Domestic flights">Short flights connect Kathmandu with Pokhara, Bhadrapur, Biratnagar, Bhairahawa, Tumlingtar and mountain airstrips. Morning flights are the most reliable; afternoon cloud causes delays.</Block>
        <Block icon={Bus} title="Tourist buses">Tourist coaches run daily between Kathmandu, Pokhara and Chitwan, leaving early in the morning from central Kathmandu. They are more comfortable than local buses; book a day ahead. Long hill roads are slow — plan on 25–35 km/h averages.</Block>
        <Block icon={Bus} title="Taxis and ride-hailing">City taxis rarely use meters — agree the fare first. Ride-hailing apps such as Pathao and inDrive operate in Kathmandu and Pokhara and show the price up front.</Block>
      </div></section>

      <section id="culture" className="guide-sec"><h2>Culture & etiquette</h2><div className="guide-grid">
        <Block icon={Landmark} title="Temples and monasteries">
          <ul className="gem-ul">
            <li>Take off your shoes (and often leather items) before entering temples and homes.</li>
            <li>Walk clockwise around stupas, chortens and prayer wheels.</li>
            <li>Some Hindu temples, including the main Pashupatinath shrine, admit Hindus only — signs will say.</li>
            <li>Ask before photographing people, rituals or cremations.</li>
          </ul>
        </Block>
        <Block icon={Shirt} title="Dress">Cover shoulders and knees at religious sites and in villages. Light layers work in the lowlands; the hills and mountains get cold at night in every season.</Block>
        <Block icon={Languages} title="Everyday manners">Use your right hand to give and receive things. Don’t touch people’s heads or point your feet at people or shrines. Public displays of affection are uncommon outside cities. A little Nepali goes a long way (see phrases below).</Block>
      </div></section>

      <section id="permits" className="guide-sec"><h2>Trekking permits</h2>
        <Alert type="warning">Since 2023, foreign trekkers in Nepal’s national parks and conservation areas must generally trek with a licensed guide arranged through a registered agency. Confirm the current rule with the Nepal Tourism Board before planning an independent trek.</Alert>
        <div className="guide-grid">
          <Block icon={BadgeInfo} title="TIMS card">The Trekkers’ Information Management System card records who is on which trail, to help in emergencies. It is issued through registered trekking agencies and the Nepal Tourism Board. <EXT href="https://ntb.gov.np/">Nepal Tourism Board</EXT></Block>
          <Block icon={Landmark} title="Park & conservation area fees">National parks (e.g. Sagarmatha, Makalu Barun) and conservation areas (e.g. Annapurna, Kanchenjunga) charge entry fees, paid at entry points or in advance.</Block>
          <Block icon={AlertTriangle} title="Restricted areas">Areas near the northern border — including Upper Mustang, Upper Dolpo, Manaslu, Humla and upper Kanchenjunga (Olangchung Gola, Yangma) — need a Restricted Area Permit. It is issued only through an agency, usually for groups of at least two, with a licensed guide. <EXT href="https://www.immigration.gov.np/">Department of Immigration</EXT></Block>
        </div>
        <p>Planning eastern Nepal? See the permit notes on each <Link to="/hidden-gems">Hidden Gem</Link>.</p>
      </section>

      <section id="safety" className="guide-sec"><h2>Safety & health</h2><div className="guide-grid">
        <Block icon={Phone} title="Emergency numbers">
          <ul className="guide-phones">{tourist.map((c) => <li key={c.id}><span>{c.service}</span>{c.number ? <a href={`tel:${c.number}`}>{c.number}</a> : <span className="muted">see link</span>}</li>)}</ul>
          <p className="small muted">From our verified directory, last reviewed {LAST_REVIEWED}. <Link to="/emergency">All emergency contacts</Link></p>
        </Block>
        <Block icon={HeartPulse} title="Altitude">Above about 2,500 m, climb slowly (no more than roughly 300–500 m of sleeping altitude a day once high), drink water and rest. Headache, nausea and poor sleep are warning signs; confusion or breathlessness at rest are emergencies — descend immediately.</Block>
        <Block icon={HeartPulse} title="Health">Drink treated or bottled water. See a travel-health clinic about vaccinations several weeks before you travel. Good private hospitals are in Kathmandu and Pokhara; facilities in remote districts are basic.</Block>
        <Block icon={AlertTriangle} title="Trekking safety">Tell someone your route, don’t trek alone, and check weather before high passes. Monsoon (June–September) brings landslides and leeches; spring and autumn are safest.</Block>
      </div></section>

      <section id="useful" className="guide-sec"><h2>Useful tools & phrases</h2>
        <p><Link to="/tools/currency" className="btn btn-secondary btn-sm">Currency converter</Link> <Link to="/weather" className="btn btn-secondary btn-sm">Weather</Link> <Link to="/tools/world-clock" className="btn btn-secondary btn-sm">World clock</Link> <Link to="/community/c/foreign-travelers" className="btn btn-secondary btn-sm">Ask other travellers</Link></p>
        <div className="table-wrap"><table className="guide-phrases"><caption className="sr-only">Nepali phrases</caption><thead><tr><th scope="col">Nepali</th><th scope="col">Meaning</th></tr></thead><tbody>{PHRASES.map(([n, e]) => <tr key={n}><td lang="ne-Latn"><strong>{n}</strong></td><td>{e}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
