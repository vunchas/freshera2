import { Product, FAQItem } from './types';

const DEVICE_COLORS = [
  { name: 'Sidabras + Šviesus Ąžuolas', metalColor: '#E5E7EB', woodColor: '#D4B996' },
  { name: 'Plienas + Vidutinis Medis', metalColor: '#4B5563', woodColor: '#8D6E63' },
  { name: 'Juoda + Tamsus Riešutas', metalColor: '#1F2937', woodColor: '#3E2723' }
];

export const PRODUCTS: Product[] = [
  {
    id: 'kit-starter',
    name: 'Pradžios Rinkinys',
    price: 29.99,
    description: 'Pirmas žingsnis į laisvę. Viskas, ko reikia norint pradėti ir išsilaikyti pirmąjį mėnesį. Idealu norintiems išbandyti ir įsitikinti efektyvumu.',
    features: [
      'Natūralus ąžuolo įrenginys',
      'Valymo rinkinys priežiūrai',
      'Gidas: "Kaip apgauti smegenis"',
      '3x filtrų pakuotės (1 mėnesiui)',
      '9 filtrai viso (3 vnt. pakelyje)'
    ],
    image: 'https://picsum.photos/id/104/600/600',
    category: 'kit',
    variants: ['Mix (Visų skonių)', 'Šalta Mėta', 'Energijos Žievelė', 'Miško Ramybė'],
    colors: DEVICE_COLORS
  },
  {
    id: 'kit-transformation',
    name: 'Transformacijos Rinkinys',
    price: 49.99,
    description: 'Pilnas įsipareigojimas pokyčiams. 4 mėnesių ramybė be jokio streso dėl papildymo. Tai sprendimas tiems, kurie nusprendė mesti galutinai.',
    features: [
      'Natūralus ąžuolo įrenginys',
      'Premium valymo rinkinys',
      '30 dienų atpratimo planas',
      '12x filtrų pakuotės (4 mėnesiams)',
      'Nemokamas pristatymas'
    ],
    image: 'https://picsum.photos/id/250/600/600',
    category: 'kit',
    colors: DEVICE_COLORS
  },
  {
    id: 'filter-mint',
    name: 'Šalta Mėta',
    price: 5.99,
    description: 'Stiprus, šaldantis pojūtis, padedantis "mušti" norą užsirūkyti. Atgaivina ir nukreipia mintis.',
    features: ['3 vnt. pakuotėje', 'Stiprus mentolis'],
    image: 'https://picsum.photos/id/106/300/300',
    category: 'filter',
    attributes: {
      sweetness: 1,
      throatHit: 3
    }
  },
  {
    id: 'filter-citrus',
    name: 'Energijos Žievelė',
    price: 5.99,
    description: 'Kai norisi cigaretės dėl streso – rinkitės citrusus. Aštrus skonis stimuliuoja ir ramina nervus.',
    features: ['3 vnt. pakuotėje', 'Apelsinų ekstraktas'],
    image: 'https://picsum.photos/id/108/300/300',
    category: 'filter',
    attributes: {
      sweetness: 2,
      throatHit: 2
    }
  },
  {
    id: 'filter-berry',
    name: 'Miško Ramybė',
    price: 5.99,
    description: 'Subtilus uogų poskonis tiems momentams, kai reikia tiesiog giliai įkvėpti ir nusiraminti.',
    features: ['3 vnt. pakuotėje', 'Natūralios uogos'],
    image: 'https://picsum.photos/id/292/300/300',
    category: 'filter',
    attributes: {
      sweetness: 3,
      throatHit: 1
    }
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'Kaip tai padeda mesti rūkyti?',
    answer: 'ORU pakeičia patį ritualą. Dažniausiai rūkome ne dėl nikotino, o dėl įpročio "ranka-burna" ir gilaus kvėpavimo. Mūsų įrenginys suteikia tą patį pasitenkinimą be nuodų, apgaudamas smegenis ir palengvindamas atpratimą.'
  },
  {
    question: 'Ar tikrai nėra nikotino?',
    answer: 'Visiškai. 0% nikotino, 0% tabako, 0% dūmų. Tai saugi priemonė, padedanti nutraukti fizinę priklausomybę nuo cheminio nikotino poveikio.'
  },
  {
    question: 'Kiek sutaupysiu?',
    answer: 'Vidutinis rūkalius išleidžia apie 150-200€ per mėnesį. Mūsų Transformacijos Rinkinys kainuoja 49.99€ ir jo užtenka 4 mėnesiams. Jūs sutaupote tūkstančius per metus.'
  },
  {
    question: 'Ar jaučiamas "gerklės kirtis"?',
    answer: 'Taip, ypač su mėtų filtrais. Mes sukūrėme filtrų pasipriešinimą taip, kad jis imituotų cigaretės traukimą, suteikdamas psichologinį nusiraminimą.'
  },
  {
    question: 'Ar siunčiate diskretiškai?',
    answer: 'Taip, pakuotė yra neutrali ir saugi. Siunčiame per Omniva, DPD ir LP Express visoje Lietuvoje.'
  },
  {
    question: 'Kiek laiko trunka pristatymas?',
    answer: 'Užsisakius šiandien, prekes dažniausiai pristatome per 1-3 darbo dienas.'
  },
  {
    question: 'Ar yra grąžinimo garantija?',
    answer: 'Taip. Jei nuspręsite, kad tai ne jums – grąžinkite nenaudotą prekę per 14 dienų. Bet mes tikime, kad tai bus jūsų paskutinis pirkinys susijęs su rūkymu.'
  },
  {
    question: 'Ar įrenginys saugus naudoti visur?',
    answer: 'Taip! Jokių dūmų, jokio kvapo aplinkiniams. Galite naudoti lėktuve, ofise, restorane ar namuose prie vaikų.'
  },
  {
    question: 'Kaip atsiskaityti?',
    answer: 'Saugiai per Montonio platformą (Visi bankai, kortelės, Apple Pay).'
  },
  {
    question: 'Ar tai tinka dovanai?',
    answer: 'Tai geriausia dovana rūkančiam draugui ar artimajam. Jūs dovanojate ne daiktą, o sveikatą ir laisvę.'
  }
];

export const PRODUCT_DESCRIPTION = "Susigrąžink kontrolę. Elegantiškas būdas pakeisti žalingą įprotį. Ąžuolo korpusas, natūralūs aromatai ir jokio nikotino.";