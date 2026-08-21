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
  region: "USA" | "Asia" | "UK";
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
};

function airport(code: string): Airport {
  return airports.find((a) => a.code === code)!;
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

export const stats = [
  { label: "Daily active travelers", value: "1.8M+" },
  { label: "Countries covered", value: "250+" },
  { label: "Average rating", value: "4.7/5" },
  { label: "On-time performance", value: "95%" },
];
