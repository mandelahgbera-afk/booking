// Realistic mock data used until Supabase is wired up.
// Shapes here intentionally mirror the eventual `destinations` / `flights` tables.

export type Destination = {
  city: string;
  country: string;
  iata: string;
  image: string;
  fromPrice: number;
  region: "North America" | "South America" | "Europe" | "Africa" | "Asia" | "Middle East" | "Oceania";
};

export const destinations: Destination[] = [
  {
    city: "New York",
    country: "United States",
    iata: "JFK",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 189,
    region: "North America",
  },
  {
    city: "Los Angeles",
    country: "United States",
    iata: "LAX",
    image:
      "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 219,
    region: "North America",
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
    region: "Europe",
  },
  {
    city: "Edinburgh",
    country: "United Kingdom",
    iata: "EDI",
    image:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200&auto=format&fit=crop",
    fromPrice: 379,
    region: "Europe",
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
  region: "North America" | "South America" | "Europe" | "Africa" | "Asia" | "Middle East" | "Oceania";
  lat: number;
  lng: number;
  /** IANA zone. Departure and arrival clock times are shown in the
   *  airport's own local time, which is the only reading a traveler
   *  can act on — a UTC or viewer-local time is simply wrong. */
  tz: string;
};

export const airports: Airport[] = [
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl", country: "USA", region: "North America", lat: 40.6413, lng: -73.7781, tz: "America/New_York" },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Intl", country: "USA", region: "North America", lat: 33.9416, lng: -118.4085, tz: "America/Los_Angeles" },
  { code: "SFO", city: "San Francisco", name: "San Francisco Intl", country: "USA", region: "North America", lat: 37.6213, lng: -122.3790, tz: "America/Los_Angeles" },
  { code: "ORD", city: "Chicago", name: "O'Hare Intl", country: "USA", region: "North America", lat: 41.9742, lng: -87.9073, tz: "America/Chicago" },
  { code: "MIA", city: "Miami", name: "Miami Intl", country: "USA", region: "North America", lat: 25.7959, lng: -80.2870, tz: "America/New_York" },
  { code: "LHR", city: "London", name: "Heathrow", country: "UK", region: "Europe", lat: 51.4700, lng: -0.4543, tz: "Europe/London" },
  { code: "LGW", city: "London", name: "Gatwick", country: "UK", region: "Europe", lat: 51.1537, lng: -0.1821, tz: "Europe/London" },
  { code: "EDI", city: "Edinburgh", name: "Edinburgh Airport", country: "UK", region: "Europe", lat: 55.9500, lng: -3.3725, tz: "Europe/London" },
  { code: "MAN", city: "Manchester", name: "Manchester Airport", country: "UK", region: "Europe", lat: 53.3537, lng: -2.2750, tz: "Europe/London" },
  { code: "HND", city: "Tokyo", name: "Haneda", country: "Japan", region: "Asia", lat: 35.5494, lng: 139.7798, tz: "Asia/Tokyo" },
  { code: "NRT", city: "Tokyo", name: "Narita Intl", country: "Japan", region: "Asia", lat: 35.7647, lng: 140.3864, tz: "Asia/Tokyo" },
  { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore", region: "Asia", lat: 1.3644, lng: 103.9915, tz: "Asia/Singapore" },
  { code: "DPS", city: "Bali", name: "Ngurah Rai Intl", country: "Indonesia", region: "Asia", lat: -8.7482, lng: 115.1672, tz: "Asia/Makassar" },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE", region: "Middle East", lat: 25.2532, lng: 55.3657, tz: "Asia/Dubai" },
  { code: "HKG", city: "Hong Kong", name: "Hong Kong Intl", country: "China", region: "Asia", lat: 22.3080, lng: 113.9185, tz: "Asia/Hong_Kong" },
  { code: "ICN", city: "Seoul", name: "Incheon Intl", country: "South Korea", region: "Asia", lat: 37.4602, lng: 126.4407, tz: "Asia/Seoul" },
  // Rail/coach terminals — same table as airports since bookings just need
  // a "location with a code + coordinates", regardless of travel mode.
  { code: "BER", city: "Berlin", name: "Berlin Hauptbahnhof", country: "Germany", region: "Europe", lat: 52.5251, lng: 13.3694, tz: "Europe/Berlin" },
  { code: "MUC", city: "Munich", name: "München Hauptbahnhof", country: "Germany", region: "Europe", lat: 48.1402, lng: 11.5586, tz: "Europe/Berlin" },
  { code: "PAR", city: "Paris", name: "Gare du Nord", country: "France", region: "Europe", lat: 48.8809, lng: 2.3553, tz: "Europe/Paris" },
  { code: "LDN", city: "London", name: "St Pancras International", country: "UK", region: "Europe", lat: 51.5308, lng: -0.1238, tz: "Europe/London" },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Hauptbahnhof", country: "Germany", region: "Europe", lat: 50.1070, lng: 8.6632, tz: "Europe/Berlin" },
  { code: "BRU", city: "Brussels", name: "Bruxelles-Midi", country: "Belgium", region: "Europe", lat: 50.8357, lng: 4.3326, tz: "Europe/Brussels" },
  { code: "VIE", city: "Vienna", name: "Wien Hauptbahnhof", country: "Austria", region: "Europe", lat: 48.1858, lng: 16.3764, tz: "Europe/Vienna" },
  { code: "HAM", city: "Hamburg", name: "Hamburg Hauptbahnhof", country: "Germany", region: "Europe", lat: 53.5528, lng: 10.0067, tz: "Europe/Berlin" },
  { code: "CGN", city: "Cologne", name: "Köln Hauptbahnhof", country: "Germany", region: "Europe", lat: 50.9432, lng: 6.9583, tz: "Europe/Berlin" },
  { code: "AMS", city: "Amsterdam", name: "Amsterdam Centraal", country: "Netherlands", region: "Europe", lat: 52.3791, lng: 4.9003, tz: "Europe/Amsterdam" },

  // Worldwide airport network.
  { code: "YYZ", city: "Toronto", name: "Pearson Intl", country: "Canada", region: "North America", lat: 43.6777, lng: -79.6248, tz: "America/Toronto" },
  { code: "YVR", city: "Vancouver", name: "Vancouver Intl", country: "Canada", region: "North America", lat: 49.1967, lng: -123.1815, tz: "America/Vancouver" },
  { code: "MEX", city: "Mexico City", name: "Benito Juarez Intl", country: "Mexico", region: "North America", lat: 19.4361, lng: -99.0719, tz: "America/Mexico_City" },
  { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson", country: "USA", region: "North America", lat: 33.6407, lng: -84.4277, tz: "America/New_York" },
  { code: "SEA", city: "Seattle", name: "Seattle-Tacoma Intl", country: "USA", region: "North America", lat: 47.4502, lng: -122.3088, tz: "America/Los_Angeles" },
  { code: "BOS", city: "Boston", name: "Logan Intl", country: "USA", region: "North America", lat: 42.3656, lng: -71.0096, tz: "America/New_York" },
  { code: "DFW", city: "Dallas", name: "Dallas/Fort Worth Intl", country: "USA", region: "North America", lat: 32.8998, lng: -97.0403, tz: "America/Chicago" },
  { code: "GRU", city: "Sao Paulo", name: "Guarulhos Intl", country: "Brazil", region: "South America", lat: -23.4356, lng: -46.4731, tz: "America/Sao_Paulo" },
  { code: "EZE", city: "Buenos Aires", name: "Ezeiza Intl", country: "Argentina", region: "South America", lat: -34.8222, lng: -58.5358, tz: "America/Argentina/Buenos_Aires" },
  { code: "BOG", city: "Bogota", name: "El Dorado Intl", country: "Colombia", region: "South America", lat: 4.7016, lng: -74.1469, tz: "America/Bogota" },
  { code: "LIM", city: "Lima", name: "Jorge Chavez Intl", country: "Peru", region: "South America", lat: -12.0219, lng: -77.1143, tz: "America/Lima" },
  { code: "SCL", city: "Santiago", name: "Arturo Merino Benitez", country: "Chile", region: "South America", lat: -33.393, lng: -70.7858, tz: "America/Santiago" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", region: "Europe", lat: 49.0097, lng: 2.5479, tz: "Europe/Paris" },
  { code: "MAD", city: "Madrid", name: "Barajas Intl", country: "Spain", region: "Europe", lat: 40.4839, lng: -3.568, tz: "Europe/Madrid" },
  { code: "BCN", city: "Barcelona", name: "El Prat", country: "Spain", region: "Europe", lat: 41.2974, lng: 2.0833, tz: "Europe/Madrid" },
  { code: "FCO", city: "Rome", name: "Fiumicino", country: "Italy", region: "Europe", lat: 41.8003, lng: 12.2389, tz: "Europe/Rome" },
  { code: "ZRH", city: "Zurich", name: "Zurich Airport", country: "Switzerland", region: "Europe", lat: 47.4647, lng: 8.5492, tz: "Europe/Zurich" },
  { code: "CPH", city: "Copenhagen", name: "Kastrup", country: "Denmark", region: "Europe", lat: 55.618, lng: 12.6508, tz: "Europe/Copenhagen" },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport", country: "Turkey", region: "Europe", lat: 41.2753, lng: 28.7519, tz: "Europe/Istanbul" },
  { code: "LIS", city: "Lisbon", name: "Humberto Delgado", country: "Portugal", region: "Europe", lat: 38.7742, lng: -9.1342, tz: "Europe/Lisbon" },
  { code: "DUB", city: "Dublin", name: "Dublin Airport", country: "Ireland", region: "Europe", lat: 53.4213, lng: -6.2701, tz: "Europe/Dublin" },
  { code: "ARN", city: "Stockholm", name: "Arlanda", country: "Sweden", region: "Europe", lat: 59.6519, lng: 17.9186, tz: "Europe/Stockholm" },
  { code: "PRG", city: "Prague", name: "Vaclav Havel", country: "Czechia", region: "Europe", lat: 50.1008, lng: 14.26, tz: "Europe/Prague" },
  { code: "ATH", city: "Athens", name: "Eleftherios Venizelos", country: "Greece", region: "Europe", lat: 37.9364, lng: 23.9445, tz: "Europe/Athens" },
  { code: "JNB", city: "Johannesburg", name: "O.R. Tambo Intl", country: "South Africa", region: "Africa", lat: -26.1367, lng: 28.2411, tz: "Africa/Johannesburg" },
  { code: "CPT", city: "Cape Town", name: "Cape Town Intl", country: "South Africa", region: "Africa", lat: -33.9715, lng: 18.6021, tz: "Africa/Johannesburg" },
  { code: "CAI", city: "Cairo", name: "Cairo Intl", country: "Egypt", region: "Africa", lat: 30.1219, lng: 31.4056, tz: "Africa/Cairo" },
  { code: "LOS", city: "Lagos", name: "Murtala Muhammed Intl", country: "Nigeria", region: "Africa", lat: 6.5774, lng: 3.3212, tz: "Africa/Lagos" },
  { code: "NBO", city: "Nairobi", name: "Jomo Kenyatta Intl", country: "Kenya", region: "Africa", lat: -1.3192, lng: 36.9278, tz: "Africa/Nairobi" },
  { code: "ACC", city: "Accra", name: "Kotoka Intl", country: "Ghana", region: "Africa", lat: 5.6052, lng: -0.1668, tz: "Africa/Accra" },
  { code: "CMN", city: "Casablanca", name: "Mohammed V Intl", country: "Morocco", region: "Africa", lat: 33.3675, lng: -7.59, tz: "Africa/Casablanca" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Thailand", region: "Asia", lat: 13.69, lng: 100.7501, tz: "Asia/Bangkok" },
  { code: "KUL", city: "Kuala Lumpur", name: "KLIA", country: "Malaysia", region: "Asia", lat: 2.7456, lng: 101.7099, tz: "Asia/Kuala_Lumpur" },
  { code: "DEL", city: "Delhi", name: "Indira Gandhi Intl", country: "India", region: "Asia", lat: 28.5562, lng: 77.1, tz: "Asia/Kolkata" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji", country: "India", region: "Asia", lat: 19.0896, lng: 72.8656, tz: "Asia/Kolkata" },
  { code: "PVG", city: "Shanghai", name: "Pudong Intl", country: "China", region: "Asia", lat: 31.1443, lng: 121.8083, tz: "Asia/Shanghai" },
  { code: "PEK", city: "Beijing", name: "Capital Intl", country: "China", region: "Asia", lat: 40.0799, lng: 116.6031, tz: "Asia/Shanghai" },
  { code: "TPE", city: "Taipei", name: "Taoyuan Intl", country: "Taiwan", region: "Asia", lat: 25.0777, lng: 121.2328, tz: "Asia/Taipei" },
  { code: "MNL", city: "Manila", name: "Ninoy Aquino Intl", country: "Philippines", region: "Asia", lat: 14.5086, lng: 121.0194, tz: "Asia/Manila" },
  { code: "CGK", city: "Jakarta", name: "Soekarno-Hatta", country: "Indonesia", region: "Asia", lat: -6.1256, lng: 106.6559, tz: "Asia/Jakarta" },
  { code: "DOH", city: "Doha", name: "Hamad Intl", country: "Qatar", region: "Middle East", lat: 25.2731, lng: 51.6081, tz: "Asia/Qatar" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed Intl", country: "UAE", region: "Middle East", lat: 24.433, lng: 54.6511, tz: "Asia/Dubai" },
  { code: "RUH", city: "Riyadh", name: "King Khalid Intl", country: "Saudi Arabia", region: "Middle East", lat: 24.9576, lng: 46.6988, tz: "Asia/Riyadh" },
  { code: "TLV", city: "Tel Aviv", name: "Ben Gurion", country: "Israel", region: "Middle East", lat: 32.0114, lng: 34.8867, tz: "Asia/Jerusalem" },
  { code: "SYD", city: "Sydney", name: "Kingsford Smith", country: "Australia", region: "Oceania", lat: -33.9399, lng: 151.1753, tz: "Australia/Sydney" },
  { code: "MEL", city: "Melbourne", name: "Tullamarine", country: "Australia", region: "Oceania", lat: -37.669, lng: 144.841, tz: "Australia/Melbourne" },
  { code: "AKL", city: "Auckland", name: "Auckland Airport", country: "New Zealand", region: "Oceania", lat: -37.0082, lng: 174.785, tz: "Pacific/Auckland" },
  { code: "BNE", city: "Brisbane", name: "Brisbane Airport", country: "Australia", region: "Oceania", lat: -27.3842, lng: 153.1175, tz: "Australia/Brisbane" },
  { code: "PER", city: "Perth", name: "Perth Airport", country: "Australia", region: "Oceania", lat: -31.9385, lng: 115.9672, tz: "Australia/Perth" },
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
  { code: "AT", name: "AtlasAir Global", color: "#0ea5e9" },
  { code: "SV", name: "SkyVista", color: "#8b5cf6" },
  { code: "PW", name: "PacificWing", color: "#14b8a6" },
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

  // Return legs + extra hub connections for the routes above — a real
  // network runs both ways, and covers more than one corridor per city.
  { id: "TR105", airline: operator("ES"), flightNumber: "TR 105", from: airport("MUC"), to: airport("BER"), departTime: "15:10", arriveTime: "19:10", durationMins: 240, stops: 0, price: 89, cabin: "Economy", seatsLeft: 38, mode: "train" },
  { id: "TR229", airline: operator("ES"), flightNumber: "TR 229", from: airport("AMS"), to: airport("BER"), departTime: "11:00", arriveTime: "17:25", durationMins: 385, stops: 0, price: 112, cabin: "Economy", seatsLeft: 25, mode: "train" },
  { id: "TR352", airline: operator("CX"), flightNumber: "TR 352", from: airport("LDN"), to: airport("PAR"), departTime: "08:30", arriveTime: "10:45", durationMins: 135, stops: 0, price: 145, cabin: "Business", seatsLeft: 60, mode: "train" },
  { id: "TR468", airline: operator("CX"), flightNumber: "TR 468", from: airport("BRU"), to: airport("FRA"), departTime: "07:15", arriveTime: "10:25", durationMins: 190, stops: 0, price: 98, cabin: "Economy", seatsLeft: 31, mode: "train" },
  { id: "TR583", airline: operator("ES"), flightNumber: "TR 583", from: airport("VIE"), to: airport("MUC"), departTime: "06:40", arriveTime: "10:50", durationMins: 250, stops: 0, price: 76, cabin: "Economy", seatsLeft: 29, mode: "train" },
  { id: "TR601", airline: operator("ES"), flightNumber: "TR 601", from: airport("BER"), to: airport("HAM"), departTime: "10:15", arriveTime: "12:00", durationMins: 105, stops: 0, price: 45, cabin: "Economy", seatsLeft: 50, mode: "train" },
  { id: "TR602", airline: operator("ES"), flightNumber: "TR 602", from: airport("HAM"), to: airport("BER"), departTime: "17:30", arriveTime: "19:15", durationMins: 105, stops: 0, price: 45, cabin: "Economy", seatsLeft: 48, mode: "train" },
  { id: "TR615", airline: operator("CX"), flightNumber: "TR 615", from: airport("FRA"), to: airport("MUC"), departTime: "09:00", arriveTime: "12:20", durationMins: 200, stops: 0, price: 68, cabin: "Economy", seatsLeft: 40, mode: "train" },
  { id: "TR616", airline: operator("CX"), flightNumber: "TR 616", from: airport("MUC"), to: airport("FRA"), departTime: "14:45", arriveTime: "18:05", durationMins: 200, stops: 0, price: 68, cabin: "Economy", seatsLeft: 37, mode: "train" },
  { id: "TR630", airline: operator("CX"), flightNumber: "TR 630", from: airport("BRU"), to: airport("AMS"), departTime: "12:10", arriveTime: "14:00", durationMins: 110, stops: 0, price: 39, cabin: "Economy", seatsLeft: 44, mode: "train" },
  { id: "TR631", airline: operator("CX"), flightNumber: "TR 631", from: airport("AMS"), to: airport("BRU"), departTime: "08:20", arriveTime: "10:10", durationMins: 110, stops: 0, price: 39, cabin: "Economy", seatsLeft: 41, mode: "train" },
  { id: "TR701", airline: operator("ES"), flightNumber: "TR 701", from: airport("LDN"), to: airport("MAN"), departTime: "07:05", arriveTime: "09:15", durationMins: 130, stops: 0, price: 58, cabin: "Economy", seatsLeft: 33, mode: "train" },
  { id: "TR702", airline: operator("ES"), flightNumber: "TR 702", from: airport("MAN"), to: airport("LDN"), departTime: "18:20", arriveTime: "20:30", durationMins: 130, stops: 0, price: 58, cabin: "Economy", seatsLeft: 30, mode: "train" },

  { id: "BU211", airline: operator("LW"), flightNumber: "BU 211", from: airport("LDN"), to: airport("MAN"), departTime: "13:20", arriveTime: "18:05", durationMins: 285, stops: 0, price: 32, cabin: "Economy", seatsLeft: 15, mode: "bus" },
  { id: "BU345", airline: operator("LW"), flightNumber: "BU 345", from: airport("MAN"), to: airport("EDI"), departTime: "08:00", arriveTime: "13:20", durationMins: 320, stops: 0, price: 38, cabin: "Economy", seatsLeft: 18, mode: "bus" },
  { id: "BU460", airline: operator("CL"), flightNumber: "BU 460", from: airport("BER"), to: airport("HAM"), departTime: "09:10", arriveTime: "11:55", durationMins: 165, stops: 0, price: 24, cabin: "Economy", seatsLeft: 36, mode: "bus" },
  { id: "BU574", airline: operator("CL"), flightNumber: "BU 574", from: airport("FRA"), to: airport("CGN"), departTime: "07:40", arriveTime: "10:05", durationMins: 145, stops: 0, price: 21, cabin: "Economy", seatsLeft: 42, mode: "bus" },
  { id: "BU620", airline: operator("LW"), flightNumber: "BU 620", from: airport("LDN"), to: airport("BRU"), departTime: "06:50", arriveTime: "10:50", durationMins: 240, stops: 0, price: 29, cabin: "Economy", seatsLeft: 25, mode: "bus" },
  { id: "BU621", airline: operator("LW"), flightNumber: "BU 621", from: airport("BRU"), to: airport("LDN"), departTime: "16:15", arriveTime: "20:15", durationMins: 240, stops: 0, price: 29, cabin: "Economy", seatsLeft: 22, mode: "bus" },
  { id: "BU640", airline: operator("CL"), flightNumber: "BU 640", from: airport("BRU"), to: airport("AMS"), departTime: "11:05", arriveTime: "13:15", durationMins: 130, stops: 0, price: 18, cabin: "Economy", seatsLeft: 48, mode: "bus" },
  { id: "BU641", airline: operator("CL"), flightNumber: "BU 641", from: airport("AMS"), to: airport("BRU"), departTime: "15:40", arriveTime: "17:50", durationMins: 130, stops: 0, price: 18, cabin: "Economy", seatsLeft: 46, mode: "bus" },
  { id: "BU660", airline: operator("CL"), flightNumber: "BU 660", from: airport("BRU"), to: airport("CGN"), departTime: "09:50", arriveTime: "12:20", durationMins: 150, stops: 0, price: 22, cabin: "Economy", seatsLeft: 39, mode: "bus" },
  { id: "BU661", airline: operator("CL"), flightNumber: "BU 661", from: airport("CGN"), to: airport("BRU"), departTime: "13:35", arriveTime: "16:05", durationMins: 150, stops: 0, price: 22, cabin: "Economy", seatsLeft: 35, mode: "bus" },
  { id: "BU700", airline: operator("LW"), flightNumber: "BU 700", from: airport("MAN"), to: airport("BER"), departTime: "05:30", arriveTime: "16:30", durationMins: 660, stops: 1, price: 55, cabin: "Economy", seatsLeft: 20, mode: "bus" },
  { id: "BU701", airline: operator("LW"), flightNumber: "BU 701", from: airport("BER"), to: airport("MAN"), departTime: "07:00", arriveTime: "18:00", durationMins: 660, stops: 1, price: 55, cabin: "Economy", seatsLeft: 18, mode: "bus" },

  // Worldwide flight network.
  { id: "AF881", airline: operator("AF"), flightNumber: "AF 881", from: airport("JFK"), to: airport("CDG"), departTime: "19:40", arriveTime: "08:55", durationMins: 435, stops: 0, price: 489, cabin: "Economy", seatsLeft: 18 },
  { id: "BA204", airline: operator("BA"), flightNumber: "BA 204", from: airport("LHR"), to: airport("JFK"), departTime: "10:15", arriveTime: "13:20", durationMins: 485, stops: 0, price: 522, cabin: "Economy", seatsLeft: 22 },
  { id: "AT310", airline: operator("AT"), flightNumber: "AT 310", from: airport("JFK"), to: airport("GRU"), departTime: "21:50", arriveTime: "10:40", durationMins: 590, stops: 0, price: 712, cabin: "Economy", seatsLeft: 14 },
  { id: "AT415", airline: operator("AT"), flightNumber: "AT 415", from: airport("GRU"), to: airport("LIS"), departTime: "23:10", arriveTime: "13:05", durationMins: 560, stops: 0, price: 648, cabin: "Economy", seatsLeft: 9 },
  { id: "SV220", airline: operator("SV"), flightNumber: "SV 220", from: airport("LHR"), to: airport("JNB"), departTime: "19:05", arriveTime: "07:35", durationMins: 665, stops: 0, price: 798, cabin: "Economy", seatsLeft: 11 },
  { id: "SV305", airline: operator("SV"), flightNumber: "SV 305", from: airport("CDG"), to: airport("CAI"), departTime: "14:20", arriveTime: "19:45", durationMins: 265, stops: 0, price: 342, cabin: "Economy", seatsLeft: 26 },
  { id: "SV412", airline: operator("SV"), flightNumber: "SV 412", from: airport("LHR"), to: airport("LOS"), departTime: "21:30", arriveTime: "05:10", durationMins: 405, stops: 0, price: 571, cabin: "Economy", seatsLeft: 8 },
  { id: "AT520", airline: operator("AT"), flightNumber: "AT 520", from: airport("JNB"), to: airport("NBO"), departTime: "08:15", arriveTime: "12:05", durationMins: 230, stops: 0, price: 289, cabin: "Economy", seatsLeft: 19 },
  { id: "PW110", airline: operator("PW"), flightNumber: "PW 110", from: airport("LAX"), to: airport("SYD"), departTime: "22:30", arriveTime: "07:45", durationMins: 900, stops: 0, price: 986, cabin: "Economy", seatsLeft: 7 },
  { id: "PW225", airline: operator("PW"), flightNumber: "PW 225", from: airport("SYD"), to: airport("SIN"), departTime: "09:40", arriveTime: "15:55", durationMins: 495, stops: 0, price: 612, cabin: "Economy", seatsLeft: 16 },
  { id: "PW330", airline: operator("PW"), flightNumber: "PW 330", from: airport("AKL"), to: airport("MEL"), departTime: "06:20", arriveTime: "08:05", durationMins: 225, stops: 0, price: 268, cabin: "Economy", seatsLeft: 24 },
  { id: "PW445", airline: operator("PW"), flightNumber: "PW 445", from: airport("SYD"), to: airport("AKL"), departTime: "16:10", arriveTime: "21:25", durationMins: 195, stops: 0, price: 241, cabin: "Economy", seatsLeft: 31 },
  { id: "EJ710", airline: operator("EJ"), flightNumber: "EJ 710", from: airport("DXB"), to: airport("LHR"), departTime: "02:40", arriveTime: "07:15", durationMins: 455, stops: 0, price: 534, cabin: "Business", seatsLeft: 5 },
  { id: "EJ815", airline: operator("EJ"), flightNumber: "EJ 815", from: airport("DOH"), to: airport("JFK"), departTime: "01:20", arriveTime: "08:05", durationMins: 825, stops: 0, price: 879, cabin: "Business", seatsLeft: 4 },
  { id: "EJ920", airline: operator("EJ"), flightNumber: "EJ 920", from: airport("AUH"), to: airport("DEL"), departTime: "03:50", arriveTime: "09:10", durationMins: 200, stops: 0, price: 318, cabin: "Economy", seatsLeft: 21 },
  { id: "SV630", airline: operator("SV"), flightNumber: "SV 630", from: airport("TLV"), to: airport("CDG"), departTime: "06:45", arriveTime: "10:30", durationMins: 285, stops: 0, price: 384, cabin: "Economy", seatsLeft: 17 },
  { id: "NA240", airline: operator("NA"), flightNumber: "NA 240", from: airport("HND"), to: airport("SIN"), departTime: "10:05", arriveTime: "16:40", durationMins: 455, stops: 0, price: 543, cabin: "Economy", seatsLeft: 13 },
  { id: "NA355", airline: operator("NA"), flightNumber: "NA 355", from: airport("PVG"), to: airport("LAX"), departTime: "15:30", arriveTime: "11:50", durationMins: 680, stops: 0, price: 724, cabin: "Economy", seatsLeft: 10 },
  { id: "TP460", airline: operator("TP"), flightNumber: "TP 460", from: airport("SIN"), to: airport("BOM"), departTime: "19:15", arriveTime: "22:40", durationMins: 325, stops: 0, price: 398, cabin: "Economy", seatsLeft: 23 },
  { id: "TP575", airline: operator("TP"), flightNumber: "TP 575", from: airport("BKK"), to: airport("SYD"), departTime: "23:45", arriveTime: "11:20", durationMins: 565, stops: 0, price: 631, cabin: "Economy", seatsLeft: 12 },
  { id: "NA680", airline: operator("NA"), flightNumber: "NA 680", from: airport("ICN"), to: airport("TPE"), departTime: "09:25", arriveTime: "11:15", durationMins: 170, stops: 0, price: 276, cabin: "Economy", seatsLeft: 28 },
  { id: "TP790", airline: operator("TP"), flightNumber: "TP 790", from: airport("KUL"), to: airport("CGK"), departTime: "13:40", arriveTime: "14:35", durationMins: 115, stops: 0, price: 164, cabin: "Economy", seatsLeft: 35 },
  { id: "AT835", airline: operator("AT"), flightNumber: "AT 835", from: airport("DEL"), to: airport("LHR"), departTime: "02:10", arriveTime: "07:05", durationMins: 565, stops: 0, price: 652, cabin: "Economy", seatsLeft: 15 },
  { id: "AF915", airline: operator("AF"), flightNumber: "AF 915", from: airport("MEX"), to: airport("MAD"), departTime: "23:55", arriveTime: "18:40", durationMins: 605, stops: 0, price: 704, cabin: "Economy", seatsLeft: 11 },
  { id: "AF126W", airline: operator("AF"), flightNumber: "AF 126", from: airport("YYZ"), to: airport("LHR"), departTime: "21:15", arriveTime: "09:05", durationMins: 470, stops: 0, price: 498, cabin: "Economy", seatsLeft: 20 },
  { id: "BA330W", airline: operator("BA"), flightNumber: "BA 330", from: airport("MAN"), to: airport("DUB"), departTime: "07:50", arriveTime: "09:00", durationMins: 70, stops: 0, price: 118, cabin: "Economy", seatsLeft: 42 },
  { id: "BA445", airline: operator("BA"), flightNumber: "BA 445", from: airport("LHR"), to: airport("FCO"), departTime: "11:20", arriveTime: "14:55", durationMins: 155, stops: 0, price: 187, cabin: "Economy", seatsLeft: 33 },
  { id: "AF560", airline: operator("AF"), flightNumber: "AF 560", from: airport("CDG"), to: airport("BCN"), departTime: "16:40", arriveTime: "18:25", durationMins: 105, stops: 0, price: 142, cabin: "Economy", seatsLeft: 38 },
  { id: "AF675", airline: operator("AF"), flightNumber: "AF 675", from: airport("MAD"), to: airport("LIS"), departTime: "08:30", arriveTime: "09:35", durationMins: 65, stops: 0, price: 96, cabin: "Economy", seatsLeft: 45 },
  { id: "BA780", airline: operator("BA"), flightNumber: "BA 780", from: airport("LHR"), to: airport("ARN"), departTime: "13:15", arriveTime: "16:45", durationMins: 150, stops: 0, price: 176, cabin: "Economy", seatsLeft: 29 },
  { id: "AF890", airline: operator("AF"), flightNumber: "AF 890", from: airport("ZRH"), to: airport("PRG"), departTime: "10:05", arriveTime: "11:30", durationMins: 85, stops: 0, price: 124, cabin: "Economy", seatsLeft: 36 },
  { id: "BA905W", airline: operator("BA"), flightNumber: "BA 905", from: airport("LGW"), to: airport("ATH"), departTime: "06:35", arriveTime: "12:20", durationMins: 225, stops: 0, price: 214, cabin: "Economy", seatsLeft: 25 },
  { id: "SV150", airline: operator("SV"), flightNumber: "SV 150", from: airport("IST"), to: airport("CMN"), departTime: "09:10", arriveTime: "12:55", durationMins: 285, stops: 0, price: 268, cabin: "Economy", seatsLeft: 22 },
  { id: "AT265", airline: operator("AT"), flightNumber: "AT 265", from: airport("BOS"), to: airport("DUB"), departTime: "20:40", arriveTime: "07:55", durationMins: 375, stops: 0, price: 432, cabin: "Economy", seatsLeft: 18 },
  { id: "AT380", airline: operator("AT"), flightNumber: "AT 380", from: airport("SEA"), to: airport("ICN"), departTime: "13:25", arriveTime: "16:40", durationMins: 670, stops: 0, price: 758, cabin: "Economy", seatsLeft: 9 },
  { id: "PW495", airline: operator("PW"), flightNumber: "PW 495", from: airport("SFO"), to: airport("AKL"), departTime: "21:55", arriveTime: "06:30", durationMins: 790, stops: 0, price: 891, cabin: "Economy", seatsLeft: 6 },
  { id: "AT610", airline: operator("AT"), flightNumber: "AT 610", from: airport("ATL"), to: airport("BOG"), departTime: "09:15", arriveTime: "14:05", durationMins: 290, stops: 0, price: 367, cabin: "Economy", seatsLeft: 27 },
  { id: "AT725", airline: operator("AT"), flightNumber: "AT 725", from: airport("MIA"), to: airport("LIM"), departTime: "23:20", arriveTime: "06:45", durationMins: 325, stops: 0, price: 412, cabin: "Economy", seatsLeft: 16 },
  { id: "AT840", airline: operator("AT"), flightNumber: "AT 840", from: airport("EZE"), to: airport("SCL"), departTime: "07:40", arriveTime: "09:25", durationMins: 105, stops: 0, price: 158, cabin: "Economy", seatsLeft: 34 },
  { id: "SV955", airline: operator("SV"), flightNumber: "SV 955", from: airport("CPT"), to: airport("JNB"), departTime: "17:30", arriveTime: "19:35", durationMins: 125, stops: 0, price: 146, cabin: "Economy", seatsLeft: 41 },
  { id: "SV170", airline: operator("SV"), flightNumber: "SV 170", from: airport("ACC"), to: airport("LOS"), departTime: "11:45", arriveTime: "12:50", durationMins: 65, stops: 0, price: 108, cabin: "Economy", seatsLeft: 39 },
  { id: "EJ285", airline: operator("EJ"), flightNumber: "EJ 285", from: airport("DXB"), to: airport("SYD"), departTime: "10:30", arriveTime: "06:15", durationMins: 825, stops: 0, price: 934, cabin: "First", seatsLeft: 3 },
  { id: "EJ390", airline: operator("EJ"), flightNumber: "EJ 390", from: airport("RUH"), to: airport("CAI"), departTime: "15:05", arriveTime: "16:50", durationMins: 165, stops: 0, price: 238, cabin: "Economy", seatsLeft: 30 },
  { id: "NA405", airline: operator("NA"), flightNumber: "NA 405", from: airport("PEK"), to: airport("HND"), departTime: "08:40", arriveTime: "13:15", durationMins: 215, stops: 0, price: 342, cabin: "Economy", seatsLeft: 24 },
  { id: "TP510", airline: operator("TP"), flightNumber: "TP 510", from: airport("MNL"), to: airport("HKG"), departTime: "14:20", arriveTime: "16:35", durationMins: 135, stops: 0, price: 196, cabin: "Economy", seatsLeft: 32 },
  { id: "PW625", airline: operator("PW"), flightNumber: "PW 625", from: airport("PER"), to: airport("DPS"), departTime: "09:50", arriveTime: "13:05", durationMins: 195, stops: 0, price: 254, cabin: "Economy", seatsLeft: 26 },
  { id: "AT740", airline: operator("AT"), flightNumber: "AT 740", from: airport("YVR"), to: airport("NRT"), departTime: "12:15", arriveTime: "15:30", durationMins: 610, stops: 0, price: 687, cabin: "Economy", seatsLeft: 13 },
  { id: "SV860", airline: operator("SV"), flightNumber: "SV 860", from: airport("NBO"), to: airport("DXB"), departTime: "22:10", arriveTime: "04:35", durationMins: 265, stops: 0, price: 384, cabin: "Economy", seatsLeft: 20 },
  { id: "AF975", airline: operator("AF"), flightNumber: "AF 975", from: airport("CPH"), to: airport("JFK"), departTime: "11:30", arriveTime: "13:55", durationMins: 505, stops: 0, price: 556, cabin: "Premium Economy", seatsLeft: 14 },
  { id: "BA115", airline: operator("BA"), flightNumber: "BA 115", from: airport("DFW"), to: airport("LHR"), departTime: "18:50", arriveTime: "09:40", durationMins: 530, stops: 0, price: 612, cabin: "Economy", seatsLeft: 17 },
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
