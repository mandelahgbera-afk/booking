// AirFly is a booking platform, not an airline — this is the informational
// "who we cover" content for the About/Partners page. Framed factually
// ("carriers you can search and book across"), the way real flight-search
// platforms (Kayak, Skyscanner, Expedia) describe their own coverage,
// not as exclusive commercial partnerships.
//
// This list is intentionally separate from src/lib/mock-data.ts — the
// fictional airlines there (AirFly Prime, British Skyways, etc.) power the
// simulated booking/payment flow, so no real airline's name ends up attached
// to a fake e-ticket or a fake charge. This file is purely informational.

export type PartnerCountry = {
  code: string;
  name: string;
  flag: string;
  airlines: { category: string; names: string[] }[];
  platforms: { category: string; names: string[] }[];
};

export const partnerNetwork: PartnerCountry[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    airlines: [
      {
        category: "Full-service",
        names: [
          "American Airlines",
          "Delta Air Lines",
          "United Airlines",
          "Alaska Airlines",
          "Hawaiian Airlines",
          "JetBlue Airways",
          "Southwest Airlines",
        ],
      },
      {
        category: "Low-cost",
        names: ["Allegiant Air", "Avelo Airlines", "Breeze Airways", "Frontier Airlines", "Spirit Airlines", "Sun Country Airlines"],
      },
      {
        category: "Regional",
        names: ["Cape Air", "Contour Airlines", "Silver Airways", "JSX", "SkyWest", "Republic Airways", "Envoy Air", "PSA Airlines"],
      },
    ],
    platforms: [
      { category: "Online travel agencies", names: ["Expedia", "Priceline", "Orbitz", "Travelocity", "CheapOair", "Hotwire"] },
      { category: "Metasearch", names: ["Google Flights", "Kayak", "Skyscanner", "Momondo"] },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    airlines: [
      { category: "Full-service", names: ["Air Canada", "Air Canada Rouge", "WestJet", "WestJet Encore"] },
      { category: "Leisure & low-cost", names: ["Air Transat", "Porter Airlines", "Flair Airlines", "Sunwing Airlines"] },
      {
        category: "Regional",
        names: ["Air North", "Canadian North", "Pacific Coastal Airlines", "PAL Airlines", "Calm Air", "Bearskin Airlines"],
      },
    ],
    platforms: [
      { category: "Online travel agencies", names: ["Expedia.ca", "FlightHub", "JustFly", "Redtag.ca", "CheapOair.ca"] },
      { category: "Metasearch", names: ["Google Flights", "Kayak", "Skyscanner", "Hopper"] },
      { category: "Vacation packages", names: ["Air Canada Vacations", "WestJet Vacations", "Sunwing Vacations", "Transat"] },
    ],
  },
  {
    code: "UK",
    name: "United Kingdom",
    flag: "🇬🇧",
    airlines: [
      { category: "Full-service", names: ["British Airways", "BA CityFlyer", "Virgin Atlantic"] },
      { category: "Low-cost & leisure", names: ["easyJet", "Jet2.com", "Ryanair UK", "TUI Airways", "Wizz Air UK"] },
      { category: "Regional", names: ["Loganair", "Eastern Airways", "Aurigny", "Blue Islands"] },
    ],
    platforms: [
      { category: "Online travel agencies", names: ["Expedia.co.uk", "Opodo", "Lastminute.com", "On the Beach", "Loveholidays"] },
      { category: "Metasearch", names: ["Skyscanner", "Kayak", "Google Flights", "Momondo"] },
      { category: "Holiday packages", names: ["TUI", "Jet2holidays", "British Airways Holidays", "Virgin Holidays", "easyJet holidays"] },
    ],
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    airlines: [
      { category: "Full-service", names: ["Lufthansa", "Lufthansa CityLine", "Discover Airlines"] },
      { category: "Leisure & low-cost", names: ["Eurowings", "Condor", "TUI fly Deutschland", "Sundair"] },
      { category: "Widely used foreign carriers", names: ["Ryanair", "Wizz Air", "easyJet Europe"] },
    ],
    platforms: [
      { category: "Online travel agencies", names: ["Expedia.de", "Opodo.de", "Fluege.de", "Check24 Flüge", "Lastminute.de"] },
      { category: "Metasearch", names: ["Skyscanner.de", "Kayak.de", "Google Flights", "Idealo Flüge"] },
      { category: "Holiday packages", names: ["TUI.de", "DERTOUR", "Alltours", "Schauinsland-Reisen"] },
    ],
  },
];
