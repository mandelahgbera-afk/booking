// Realistic mock data used until Supabase is wired up.
// Shapes here intentionally mirror the eventual `destinations` / `flights` tables.

export type Destination = {
  city: string;
  country: string;
  iata: string;
  image: string;
  fromPrice: number;
  region: "USA" | "Asia" | "UK";
};

export const destinations: Destination[] = [
  {
    city: "New York",
    country: "United States",
    iata: "JFK",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 189,
    region: "USA",
  },
  {
    city: "Los Angeles",
    country: "United States",
    iata: "LAX",
    image:
      "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 219,
    region: "USA",
  },
  {
    city: "Tokyo",
    country: "Japan",
    iata: "HND",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 649,
    region: "Asia",
  },
  {
    city: "Singapore",
    country: "Singapore",
    iata: "SIN",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 599,
    region: "Asia",
  },
  {
    city: "Bali",
    country: "Indonesia",
    iata: "DPS",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 559,
    region: "Asia",
  },
  {
    city: "London",
    country: "United Kingdom",
    iata: "LHR",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 349,
    region: "UK",
  },
  {
    city: "Edinburgh",
    country: "United Kingdom",
    iata: "EDI",
    image:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 379,
    region: "UK",
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    iata: "DXB",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 489,
    region: "Asia",
  },
];

export type Airport = {
  code: string;
  city: string;
  name: string;
  country: string;
  region: "USA" | "Asia" | "UK" | "Other";
  lat: number;
  lng: number;
};

export const airports: Airport[] = [
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl", country: "USA", region: "USA", lat: 40.6413, lng: -73.7781 },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Intl", country: "USA", region: "USA", lat: 33.9416, lng: -118.4085 },
  { code: "SFO", city: "San Francisco", name: "San Francisco Intl", country: "USA", region: "USA", lat: 37.6213, lng: -122.3790 },
  { code: "ORD", city: "Chicago", name: "O'Hare Intl", country: "USA", region: "USA", lat: 41.9742, lng: -87.9073 },
  { code: "MIA", city: "Miami", name: "Miami Intl", country: "USA", region: "USA", lat: 25.7959, lng: -80.2870 },
  { code: "LHR", city: "London", name: "Heathrow", country: "UK", region: "UK", lat: 51.4700, lng: -0.4543 },
  { code: "LGW", city: "London", name: "Gatwick", country: "UK", region: "UK", lat: 51.1537, lng: -0.1821 },
  { code: "EDI", city: "Edinburgh", name: "Edinburgh Airport", country: "UK", region: "UK", lat: 55.9500, lng: -3.3725 },
  { code: "MAN", city: "Manchester", name: "Manchester Airport", country: "UK", region: "UK", lat: 53.3537, lng: -2.2750 },
  { code: "HND", city: "Tokyo", name: "Haneda", country: "Japan", region: "Asia", lat: 35.5494, lng: 139.7798 },
  { code: "NRT", city: "Tokyo", name: "Narita Intl", country: "Japan", region: "Asia", lat: 35.7647, lng: 140.3864 },
  { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore", region: "Asia", lat: 1.3644, lng: 103.9915 },
  { code: "DPS", city: "Bali", name: "Ngurah Rai Intl", country: "Indonesia", region: "Asia", lat: -8.7482, lng: 115.1672 },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE", region: "Asia", lat: 25.2532, lng: 55.3657 },
  { code: "HKG", city: "Hong Kong", name: "Hong Kong Intl", country: "China", region: "Asia", lat: 22.3080, lng: 113.9185 },
  { code: "ICN", city: "Seoul", name: "Incheon Intl", country: "South Korea", region: "Asia", lat: 37.4602, lng: 126.4407 },
  // Rail/coach terminals — same table as airports since bookings just need
  // a "location with a code + coordinates", regardless of travel mode.
  { code: "BER", city: "Berlin", name: "Berlin Hauptbahnhof", country: "Germany", region: "Other", lat: 52.5251, lng: 13.3694 },
  { code: "MUC", city: "Munich", name: "München Hauptbahnhof", country: "Germany", region: "Other", lat: 48.1402, lng: 11.5586 },
  { code: "PAR", city: "Paris", name: "Gare du Nord", country: "France", region: "Other", lat: 48.8809, lng: 2.3553 },
  { code: "LDN", city: "London", name: "St Pancras International", country: "UK", region: "UK", lat: 51.5308, lng: -0.1238 },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Hauptbahnhof", country: "Germany", region: "Other", lat: 50.1070, lng: 8.6632 },
  { code: "BRU", city: "Brussels", name: "Bruxelles-Midi", country: "Belgium", region: "Other", lat: 50.8357, lng: 4.3326 },
  { code: "VIE", city: "Vienna", name: "Wien Hauptbahnhof", country: "Austria", region: "Other", lat: 48.1858, lng: 16.3764 },
  { code: "HAM", city: "Hamburg", name: "Hamburg Hauptbahnhof", country: "Germany", region: "Other", lat: 53.5528, lng: 10.0067 },
  { code: "CGN", city: "Cologne", name: "Köln Hauptbahnhof", country: "Germany", region: "Other", lat: 50.9432, lng: 6.9583 },
  { code: "AMS", city: "Amsterdam", name: "Amsterdam Centraal", country: "Netherlands", region: "Other", lat: 52.3791, lng: 4.9003 },
];

export type Airline = {
  code: string;
  name: string;
  color: string;
};

export const airlines: Airline[] = [
  { code: "AF", name: "AirFly Prime", color: "#f97316" },
  { code: "BA", name: "British Skyways", color: "#2563eb" },
  { code: "NA", name: "Nippon Air", color: "#e11d48" },
  { code: "TP", name: "TransPacific", color: "#0891b2" },
  { code: "EJ", name: "EmiratesJet", color: "#7c3aed" },
  // Rail/coach operators — same `airlines` table since a booking just needs
  // an "operator with a code + color", regardless of travel mode.
  { code: "ES", name: "EuroSwift Rail", color: "#059669" },
  { code: "CX", name: "Continental Express", color: "#0d9488" },
  { code: "LW", name: "LinkWay Coach", color: "#d97706" },
  { code: "CL", name: "ContinentalLink", color: "#ca8a04" },
];

export type FlightOffer = {
  id: string;
  airline: Airline;
  flightNumber: string;
  from: Airport;
  to: Airport;
  departTime: string;
  arriveTime: string;
  durationMins: number;
  stops: 0 | 1 | 2;
  price: number;
  cabin: "Economy" | "Premium Economy" | "Business" | "First";
  seatsLeft: number;
  // Defaults to "flight" when absent — every flightOffers entry below the
  // trains/buses section omits it for exactly that reason.
  mode?: "flight" | "train" | "bus";
};

function airport(code: string): Airport {
  return airports.find((a) => a.code === code)!;
}

function operator(code: string): Airline {
  return airlines.find((a) => a.code === code)!;
}

export const flightOffers: FlightOffer[] = [
  {
    id: "AF712",
    airline: airlines[0],
    flightNumber: "AF 712",
    from: airport("JFK"),
    to: airport("LHR"),
    departTime: "21:35",
    arriveTime: "09:20",
    durationMins: 465,
    stops: 0,
    price: 412,
    cabin: "Economy",
    seatsLeft: 6,
  },
  {
    id: "BA118",
    airline: airlines[1],
    flightNumber: "BA 118",
    from: airport("JFK"),
    to: airport("LHR"),
    departTime: "18:05",
    arriveTime: "06:10",
    durationMins: 485,
    stops: 0,
    price: 389,
    cabin: "Economy",
    seatsLeft: 12,
  },
  {
    id: "NA905",
    airline: airlines[2],
    flightNumber: "NA 905",
    from: airport("LAX"),
    to: airport("HND"),
    departTime: "01:15",
    arriveTime: "05:40",
    durationMins: 685,
    stops: 0,
    price: 741,
    cabin: "Economy",
    seatsLeft: 4,
  },
  {
    id: "TP221",
    airline: airlines[3],
    flightNumber: "TP 221",
    from: airport("SFO"),
    to: airport("SIN"),
    departTime: "23:50",
    arriveTime: "08:30",
    durationMins: 1120,
    stops: 1,
    price: 812,
    cabin: "Premium Economy",
    seatsLeft: 9,
  },
  {
    id: "EJ340",
    airline: airlines[4],
    flightNumber: "EJ 340",
    from: airport("ORD"),
    to: airport("DXB"),
    departTime: "16:20",
    arriveTime: "14:05",
    durationMins: 820,
    stops: 1,
    price: 655,
    cabin: "Business",
    seatsLeft: 3,
  },
  {
    id: "AF208",
    airline: airlines[0],
    flightNumber: "AF 208",
    from: airport("LAX"),
    to: airport("LHR"),
    departTime: "19:10",
    arriveTime: "13:40",
    durationMins: 630,
    stops: 0,
    price: 468,
    cabin: "Economy",
    seatsLeft: 15,
  },
  {
    id: "BA552",
    airline: airlines[1],
    flightNumber: "BA 552",
    from: airport("MIA"),
    to: airport("LGW"),
    departTime: "22:15",
    arriveTime: "11:50",
    durationMins: 515,
    stops: 0,
    price: 431,
    cabin: "Premium Economy",
    seatsLeft: 7,
  },
  {
    id: "NA118",
    airline: airlines[2],
    flightNumber: "NA 118",
    from: airport("SFO"),
    to: airport("NRT"),
    departTime: "12:40",
    arriveTime: "16:10",
    durationMins: 690,
    stops: 0,
    price: 698,
    cabin: "Economy",
    seatsLeft: 21,
  },
  {
    id: "TP804",
    airline: airlines[3],
    flightNumber: "TP 804",
    from: airport("ORD"),
    to: airport("HKG"),
    departTime: "17:05",
    arriveTime: "21:55",
    durationMins: 890,
    stops: 1,
    price: 889,
    cabin: "Economy",
    seatsLeft: 5,
  },
  {
    id: "EJ671",
    airline: airlines[4],
    flightNumber: "EJ 671",
    from: airport("JFK"),
    to: airport("DXB"),
    departTime: "23:05",
    arriveTime: "20:40",
    durationMins: 755,
    stops: 0,
    price: 712,
    cabin: "Business",
    seatsLeft: 2,
  },
  {
    id: "AF319",
    airline: airlines[0],
    flightNumber: "AF 319",
    from: airport("ORD"),
    to: airport("MAN"),
    departTime: "20:30",
    arriveTime: "09:55",
    durationMins: 505,
    stops: 0,
    price: 402,
    cabin: "Economy",
    seatsLeft: 18,
  },
  {
    id: "BA773",
    airline: airlines[1],
    flightNumber: "BA 773",
    from: airport("LAX"),
    to: airport("EDI"),
    departTime: "16:45",
    arriveTime: "08:50",
    durationMins: 605,
    stops: 1,
    price: 519,
    cabin: "Economy",
    seatsLeft: 10,
  },
  {
    id: "NA452",
    airline: airlines[2],
    flightNumber: "NA 452",
    from: airport("JFK"),
    to: airport("ICN"),
    departTime: "01:50",
    arriveTime: "06:20",
    durationMins: 810,
    stops: 1,
    price: 761,
    cabin: "Economy",
    seatsLeft: 13,
  },
  {
    id: "TP390",
    airline: airlines[3],
    flightNumber: "TP 390",
    from: airport("MIA"),
    to: airport("DPS"),
    departTime: "09:15",
    arriveTime: "19:05",
    durationMins: 1370,
    stops: 2,
    price: 1042,
    cabin: "Premium Economy",
    seatsLeft: 6,
  },
  {
    id: "EJ205",
    airline: airlines[4],
    flightNumber: "EJ 205",
    from: airport("SFO"),
    to: airport("DXB"),
    departTime: "14:20",
    arriveTime: "17:55",
    durationMins: 815,
    stops: 1,
    price: 733,
    cabin: "Business",
    seatsLeft: 4,
  },
  {
    id: "AF126",
    airline: airlines[0],
    flightNumber: "AF 126",
    from: airport("ORD"),
    to: airport("LHR"),
    departTime: "17:50",
    arriveTime: "07:05",
    durationMins: 495,
    stops: 0,
    price: 445,
    cabin: "Economy",
    seatsLeft: 24,
  },
  {
    id: "BA340",
    airline: airlines[1],
    flightNumber: "BA 340",
    from: airport("JFK"),
    to: airport("MAN"),
    departTime: "20:55",
    arriveTime: "09:15",
    durationMins: 500,
    stops: 0,
    price: 398,
    cabin: "Economy",
    seatsLeft: 16,
  },
  {
    id: "NA630",
    airline: airlines[2],
    flightNumber: "NA 630",
    from: airport("SFO"),
    to: airport("HKG"),
    departTime: "23:40",
    arriveTime: "06:15",
    durationMins: 815,
    stops: 0,
    price: 771,
    cabin: "Economy",
    seatsLeft: 8,
  },
  {
    id: "TP512",
    airline: airlines[3],
    flightNumber: "TP 512",
    from: airport("LAX"),
    to: airport("ICN"),
    departTime: "11:30",
    arriveTime: "16:50",
    durationMins: 740,
    stops: 0,
    price: 705,
    cabin: "Economy",
    seatsLeft: 19,
  },
  {
    id: "EJ118",
    airline: airlines[4],
    flightNumber: "EJ 118",
    from: airport("MIA"),
    to: airport("DXB"),
    departTime: "21:10",
    arriveTime: "20:35",
    durationMins: 925,
    stops: 1,
    price: 799,
    cabin: "First",
    seatsLeft: 2,
  },

  // Trains — same booking pipeline as flights (seat map, checkout, refunds,
  // manage-booking lookup), just filtered to mode: "train" on /trains.
  {
    id: "TR104",
    airline: operator("ES"),
    flightNumber: "TR 104",
    from: airport("BER"),
    to: airport("MUC"),
    departTime: "07:20",
    arriveTime: "11:20",
    durationMins: 240,
    stops: 0,
    price: 89,
    cabin: "Economy",
    seatsLeft: 42,
    mode: "train",
  },
  {
    id: "TR228",
    airline: operator("ES"),
    flightNumber: "TR 228",
    from: airport("BER"),
    to: airport("AMS"),
    departTime: "09:45",
    arriveTime: "16:10",
    durationMins: 385,
    stops: 0,
    price: 112,
    cabin: "Economy",
    seatsLeft: 30,
    mode: "train",
  },
  {
    id: "TR351",
    airline: operator("CX"),
    flightNumber: "TR 351",
    from: airport("PAR"),
    to: airport("LDN"),
    departTime: "13:10",
    arriveTime: "15:25",
    durationMins: 135,
    stops: 0,
    price: 145,
    cabin: "Business",
    seatsLeft: 55,
    mode: "train",
  },
  {
    id: "TR467",
    airline: operator("CX"),
    flightNumber: "TR 467",
    from: airport("FRA"),
    to: airport("BRU"),
    departTime: "16:35",
    arriveTime: "19:45",
    durationMins: 190,
    stops: 0,
    price: 98,
    cabin: "Economy",
    seatsLeft: 27,
    mode: "train",
  },
  {
    id: "TR582",
    airline: operator("ES"),
    flightNumber: "TR 582",
    from: airport("MUC"),
    to: airport("VIE"),
    departTime: "18:50",
    arriveTime: "23:00",
    durationMins: 250,
    stops: 0,
    price: 76,
    cabin: "Economy",
    seatsLeft: 33,
    mode: "train",
  },

  // Buses — same pattern as trains above.
  {
    id: "BU210",
    airline: operator("LW"),
    flightNumber: "BU 210",
    from: airport("MAN"),
    to: airport("LDN"),
    departTime: "06:15",
    arriveTime: "11:00",
    durationMins: 285,
    stops: 0,
    price: 32,
    cabin: "Economy",
    seatsLeft: 12,
    mode: "bus",
  },
  {
    id: "BU344",
    airline: operator("LW"),
    flightNumber: "BU 344",
    from: airport("EDI"),
    to: airport("MAN"),
    departTime: "10:40",
    arriveTime: "16:00",
    durationMins: 320,
    stops: 0,
    price: 38,
    cabin: "Economy",
    seatsLeft: 20,
    mode: "bus",
  },
  {
    id: "BU459",
    airline: operator("CL"),
    flightNumber: "BU 459",
    from: airport("HAM"),
    to: airport("BER"),
    departTime: "12:25",
    arriveTime: "15:10",
    durationMins: 165,
    stops: 0,
    price: 24,
    cabin: "Economy",
    seatsLeft: 40,
    mode: "bus",
  },
  {
    id: "BU573",
    airline: operator("CL"),
    flightNumber: "BU 573",
    from: airport("CGN"),
    to: airport("FRA"),
    departTime: "15:05",
    arriveTime: "17:30",
    durationMins: 145,
    stops: 0,
    price: 21,
    cabin: "Economy",
    seatsLeft: 45,
    mode: "bus",
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Ahmed",
    role: "Frequent Flyer",
    quote:
      "Booking was quick and hassle-free. The seat map matched reality perfectly and check-in was seamless.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "James Whitfield",
    role: "Business Traveler",
    quote:
      "The split-payment feature saved our whole team a headache when we booked London to Singapore together.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "Aiko Tanaka",
    role: "Digital Nomad",
    quote:
      "Cleanest flight search I've used. Price alerts on the Tokyo route got me a fare I couldn't find anywhere else.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    rating: 4,
  },
  {
    name: "Daniel Okoro",
    role: "Family Traveler",
    quote:
      "Refunds within 24 hours, real support, and a UI that didn't confuse my parents. Genuinely impressed.",
    avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=200&auto=format&fit=crop",
    rating: 5,
  },
];

// Ground transit — same "fictional operators, real cities" pattern as
// flightOffers, so the live departures board can show a genuinely
// multi-modal terminal feel (heavy on Europe, as requested) without
// implying real-time tracking of any real rail/coach company.
export type TransitOffer = {
  id: string;
  mode: "train" | "bus";
  operator: string;
  from: string;
  to: string;
  departTime: string;
  durationMins: number;
  price: number;
};

export const transitOffers: TransitOffer[] = [
  { id: "TR104", mode: "train", operator: "EuroSwift Rail", from: "Berlin", to: "Munich", departTime: "07:20", durationMins: 240, price: 89 },
  { id: "TR228", mode: "train", operator: "EuroSwift Rail", from: "Berlin", to: "Amsterdam", departTime: "09:45", durationMins: 385, price: 112 },
  { id: "TR351", mode: "train", operator: "Continental Express", from: "Paris", to: "London", departTime: "13:10", durationMins: 135, price: 145 },
  { id: "TR467", mode: "train", operator: "Continental Express", from: "Frankfurt", to: "Brussels", departTime: "16:35", durationMins: 190, price: 98 },
  { id: "TR582", mode: "train", operator: "EuroSwift Rail", from: "Munich", to: "Vienna", departTime: "18:50", durationMins: 250, price: 76 },
  { id: "BU210", mode: "bus", operator: "LinkWay Coach", from: "Manchester", to: "London", departTime: "06:15", durationMins: 285, price: 32 },
  { id: "BU344", mode: "bus", operator: "LinkWay Coach", from: "Edinburgh", to: "Manchester", departTime: "10:40", durationMins: 320, price: 38 },
  { id: "BU459", mode: "bus", operator: "ContinentalLink", from: "Hamburg", to: "Berlin", departTime: "12:25", durationMins: 165, price: 24 },
  { id: "BU573", mode: "bus", operator: "ContinentalLink", from: "Cologne", to: "Frankfurt", departTime: "15:05", durationMins: 145, price: 21 },
];

export const stats = [
  { label: "Daily active travelers", value: "1.8M+" },
  { label: "Countries covered", value: "250+" },
  { label: "Average rating", value: "4.7/5" },
  { label: "On-time performance", value: "95%" },
];
