export interface ProduktKonfig {
  cjId: string;
  navn: string;
  navnEn: string;
  sub: string;
  subEn: string;
  pris: number;
  margin: number;
  emoji: string;
  cat: 'hund' | 'katt';
  bildIndex?: number;
  beskrivelse: string;
  beskrivelseEn: string;
  metaTittel: string;
  metaBeskrivelse: string;
  behold_bilder?: number[];
  tillatte_vider?: string[];
  skjul_varianter?: string[];
  enkel_picker?: boolean;
}

export const PRODUKTER: ProduktKonfig[] = [
  {
    cjId: '1653041912300969984',
    navn: 'Sakte-forer Skål',
    navnEn: 'Slow Feeder Bowl',
    sub: 'Forhindrer kvelning, hund/katt',
    subEn: 'Prevents choking, dogs & cats',
    pris: 149,
    margin: 132,
    emoji: '🥣',
    cat: 'hund',
    bildIndex: 1,
    enkel_picker: true,
    beskrivelse: 'Spiser hunden eller katten din altfor fort? Denne sakte fôrer skålen er laget for å bremse spisetempoet og gi kjæledyret ditt en sunnere og roligere måltidsopplevelse. Den smarte labyrintstrukturen i bunnen gjør at maten må «jaktes» frem, noe som forhindrer kvelning, oppblåsthet og fordøyelsesproblemer som ofte oppstår ved rask spising. En sakte fôrer hund og katt vil elske, fordi den samtidig stimulerer hjernen og forlenger måltidet på en naturlig måte — perfekt for ivrige slukere. Skålen er laget av slitesterkt, BPA-fritt materiale med sklisikker bunn, og kan enkelt vaskes for hånd eller i oppvaskmaskin. Et lite, men effektivt grep for bedre helse og trivsel hver eneste dag.',
    beskrivelseEn: "Does your dog or cat eat way too fast? This slow feeder bowl is designed to slow down eating pace and give your pet a healthier, calmer mealtime. The clever maze structure at the bottom turns every meal into a fun challenge, preventing choking, bloating and digestive issues that often come from rapid eating. It also gently stimulates the brain and naturally extends mealtime — perfect for eager eaters. Made from durable, BPA-free material with a non-slip base, it is easy to clean by hand or in the dishwasher. A small but effective step toward better health and well-being every single day.",
    metaTittel: 'Sakte Fôrer Skål til Hund & Katt – Forhindrer Kvelning',
    metaBeskrivelse: 'Sakte fôrer til hund og katt som bremser spisetempoet og forhindrer kvelning og oppblåsthet. Slitesterk, BPA-fri og enkel å rengjøre. Fri frakt over 499 kr.',
  },
  {
    cjId: '2504100230321610200',
    navn: 'Vannflaske 2-i-1',
    navnEn: 'Water Bottle 2-in-1',
    sub: 'Med matbeholder, perfekt for turer',
    subEn: 'With food container, perfect for trips',
    pris: 249,
    margin: 120,
    emoji: '🚰',
    cat: 'hund',
    beskrivelse: 'En vannflaske til hund på tur bør være enkel, sølfri og rask å bruke — og denne 2-i-1-løsningen er alt dette og mer. Vannflaske og matbeholder er samlet i én kompakt enhet, slik at du har med både drikke og snacks uansett hvor turen går. Trykk enkelt på knappen for å fylle den innebygde drikkekoppen med akkurat passe mengde vann, og hell ubrukt vann tilbake i flasken uten å søle en eneste dråpe. Perfekt for lange turer, hytteturer, treningsøkter og varme sommerdager der hunden trenger å holde seg hydrert. Det lekkasjesikre designet får lett plass i en ryggsekk eller hundebag, og det robuste, BPA-frie materialet tåler aktiv bruk. Gi hunden din friheten til å drikke når som helst, hvor som helst.',
    beskrivelseEn: 'A water bottle for dogs on the go should be simple, spill-free and quick to use — and this 2-in-1 solution is all that and more. The water bottle and food container are combined into one compact unit, so you can bring both drink and snacks wherever the trail leads. Just press the button to fill the built-in drinking cup with the right amount of water, then pour any unused water back into the bottle without spilling a drop. Perfect for long walks, cabin trips, training sessions and hot summer days when your dog needs to stay hydrated. The leak-proof design fits easily in a backpack or dog bag, and the sturdy, BPA-free material handles active use. Give your dog the freedom to drink anytime, anywhere.',
    metaTittel: 'Vannflaske til Hund på Tur – 2-i-1 med Matbeholder',
    metaBeskrivelse: 'Praktisk vannflaske til hund på tur med innebygd drikkekopp og matbeholder i ett. Sølfri og kompakt – perfekt for turer og hytteliv. Fri frakt over 499 kr.',
  },
  {
    cjId: '1767124394830204928',
    navn: 'Bajspose-holder',
    navnEn: 'Poop Bag Holder',
    sub: 'Praktisk holder til hundeposen',
    subEn: 'Practical holder for dog waste bags',
    pris: 169,
    margin: 79,
    emoji: '🐾',
    cat: 'hund',
    enkel_picker: true,
    behold_bilder: [0, 3, 4, 5, 8, 12, 18, 20, 21, 23, 27, 28, 29, 35, 36, 37],
    tillatte_vider: [
      '1767124394905702400',
      '1767124394964422656',
      '1767124395123806208',
      '1767124395178332160',
      '1767124395249635328',
      '1767124395409018880',
      '1767124395463544832',
    ],
    beskrivelse: 'En bæsjeposeholder til bånd er det lille tilbehøret som gjør hver tur enklere. Denne hendige og diskrete holderen festes raskt til hundebåndet, ryggsekken eller nøkkelknippet, slik at du alltid har poser tilgjengelig akkurat når du trenger dem — slutt på å rote i lommene etter poser. Den tette lukkingen holder posene trygt på plass, og det kompakte, lette designet gjør den enkel å ta med overalt. Holderen passer til de fleste standard poseruller og er laget av slitesterkt materiale som tåler daglig bruk i all slags vær. Velg mellom flere stilrene farger som matcher båndet eller utstyret ditt, og gjør hundeturen litt mer organisert og bekymringsfri.',
    beskrivelseEn: 'A poop bag holder for your leash is the little accessory that makes every walk easier. This handy, discreet holder attaches quickly to your dog\'s leash, backpack or keychain, so you always have bags ready exactly when you need them — no more digging through pockets. The secure closure keeps bags safely in place, and the compact, lightweight design makes it easy to bring along anywhere. It fits most standard bag rolls and is made from durable material that withstands daily use in all kinds of weather. Choose from several sleek colours to match your leash or gear, and make every dog walk a little more organised and worry-free.',
    metaTittel: 'Bæsjeposeholder til Bånd – Diskret Holder til Hundeposer',
    metaBeskrivelse: 'Bæsjeposeholder til bånd, ryggsekk eller nøkkelknippe. Hold hundeposene alltid for hånden på tur. Kompakt design i flere farger. Fri frakt over 499 kr.',
  },
  {
    cjId: '2607180827191632000',
    navn: 'Stellesett Øre & Tenner',
    navnEn: 'Grooming Set Ears & Teeth',
    sub: 'Komplett sett: tann-, øre- & øremiddservietter',
    subEn: 'Complete set: teeth, ear & ear mite wipes',
    pris: 199,
    margin: 122,
    emoji: '🧼',
    cat: 'katt',
    beskrivelse: 'Å holde ørene og tennene rene er en viktig del av kjæledyrets helse — og med dette komplette settet med engangs rensevetter blir stellet både enkelt og skånsomt. Dette er et komplett stellesett, og i settet får du: tannrensservietter for renere tenner og friskere ånde, ørepleieservietter til fingertuppen for skånsom rens av ørene, og egne servietter for å motvirke og fjerne øremidd. Hver serviett tres rett over fingertuppen, slik at du har full kontroll og lett kommer til i ørene, rundt tennene og på sensitive områder. De myke, fuktige klutene fjerner effektivt ørevoks, matrester, smuss og skitt, og bidrar til å motvirke øremidd, vond lukt og oppbygging av plakk. Rensevetter til katt og hund er perfekt for deg som vil ta vare på kjæledyret mellom besøk hos veterinær eller frisør, uten stress og uten vann. Servietten er praktisk å bruke hjemme, på reise eller på tur, og det milde innholdet er laget for å være trygt for daglig bruk. En liten rutine som gir friskere ører, renere tenner og et gladere kjæledyr.',
    beskrivelseEn: 'Keeping the ears and teeth clean is an important part of your pet\'s health — and this complete set of disposable care wipes makes grooming both easy and gentle. This is a complete grooming set, and in the set you get: teeth cleaning wipes for cleaner teeth and fresher breath, fingertip ear care wipes for gentle cleaning of the ears, and dedicated wipes to help prevent and remove ear mites. Each wipe slips right over your fingertip, giving you full control and easy access to the ears, around the teeth and on sensitive areas. The soft, moist cloths effectively remove ear wax, food residue, dirt and grime, and help prevent ear mites, bad odour and plaque build-up. These cleaning wipes for cats and dogs are perfect for caring for your pet between visits to the vet or groomer, without stress and without water. Each wipe is convenient to use at home, while travelling or on a walk, and the mild formula is made to be safe for daily use. A small routine that gives fresher ears, cleaner teeth and a happier pet.',
    metaTittel: 'Stellesett til Katt & Hund – Servietter for Øre, Tenner & Øremidd',
    metaBeskrivelse: 'Komplett stellesett med engangsservietter til katt og hund: tannrens, ørepleie og øremiddfjerning. Trekkes over fingertuppen, fjerner ørevoks og plakk. Fri frakt over 499 kr.',
  },
  {
    cjId: '2608040730431611800',
    navn: 'Kobberring Pølsehund',
    navnEn: 'Eco-friendly Copper Sausage Dog Ring',
    sub: 'Miljøvennlig kobber – for hundeelskere',
    subEn: 'Eco-friendly copper – for dog lovers',
    pris: 149,
    margin: 141,
    emoji: '🐕',
    cat: 'hund',
    beskrivelse: 'Er du – eller noen du er glad i – helt vill etter pølsehunder? Denne miljøvennlige kobberringen er formet som en sjarmerende pølsehund (dachshund) og er den perfekte lille detaljen for enhver hundeelsker. Ringen er laget av miljøvennlig kobber som gir en varm, tidløs glød og et fint håndverkspreg. Den er behagelig å bære hele dagen, tåler daglig bruk og passer like godt til hverdagsantrekket som til en spesiell anledning. En kobberring med pølsehund-motiv er også en fin og personlig gave til hundeeieren som har alt — til bursdag, jul eller bare fordi. Det stilrene, minimalistiske designet gjør at den matcher det meste, samtidig som det lille hundemotivet skaper et hyggelig samtaleemne. Vis frem kjærligheten til firbeinte venner med et smykke som er både bærekraftig og fullt av personlighet.',
    beskrivelseEn: 'Are you — or someone you love — completely obsessed with sausage dogs? This eco-friendly copper ring is shaped like a charming dachshund and makes the perfect little detail for any dog lover. The ring is crafted from eco-friendly copper that gives a warm, timeless glow and a lovely handcrafted feel. It is comfortable to wear all day, holds up to everyday use and works just as well with a casual outfit as with a special occasion. A copper ring with a sausage dog motif is also a lovely, personal gift for the dog owner who has everything — for a birthday, Christmas or just because. The sleek, minimalist design pairs with almost anything, while the little dog motif sparks a friendly conversation. Show off your love for four-legged friends with a piece of jewellery that is both sustainable and full of personality.',
    metaTittel: 'Kobberring Pølsehund – Miljøvennlig Smykke til Hundeelskere',
    metaBeskrivelse: 'Miljøvennlig kobberring formet som en pølsehund (dachshund) – et stilrent og bærekraftig smykke og en fin gave til hundeelskere. Håndverkspreg og tidløst design. Fri frakt over 499 kr.',
  },
];

export function hentRelaterte(cjId: string) {
  return PRODUKTER.filter(p => p.cjId !== cjId);
}
