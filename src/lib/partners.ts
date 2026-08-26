// AirFly is a booking platform, not an airline — this is the informational
// "who we cover" content for the About/Partners page. Framed factually
// ("carriers you can search and book across"), the way real flight-search
// platforms (Kayak, Skyscanner, Expedia) describe their own coverage,
// not as exclusive commercial partnerships.
//
// This list is intentionally separate from src/lib/mock-data.ts — the
// fictional airlines/rail/coach operators there power the simulated
// booking/payment flow, so no real company's name ends up attached to a
// fake e-ticket or a fake charge. This file is purely informational.

export type PartnerCategoryGroup = { category: string; names: string[] };

export type PartnerCountry = {
  code: string;
  name: string;
  flag: string;
  airlines?: PartnerCategoryGroup[];
  platforms?: PartnerCategoryGroup[];
  trains?: PartnerCategoryGroup[];
  buses?: PartnerCategoryGroup[];
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
    trains: [
      { category: "Main intercity operator", names: ["Amtrak"] },
      {
        category: "Private & regional rail",
        names: ["Brightline", "Alaska Railroad", "Metra", "LIRR", "Metro-North", "NJ Transit", "Caltrain", "Sounder", "MBTA Commuter Rail"],
      },
      { category: "Booking platforms", names: ["Amtrak.com / app", "Wanderu", "Busbud", "Railbookers"] },
    ],
    buses: [
      {
        category: "Major intercity operators",
        names: ["Greyhound", "FlixBus USA", "Megabus", "Peter Pan Bus Lines", "Trailways", "Jefferson Lines", "OurBus", "Coach USA", "RedCoach", "Vamoose"],
      },
      { category: "Booking platforms", names: ["Wanderu", "Busbud", "CheckMyBus", "Direct operator sites/apps"] },
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
    trains: [
      { category: "National operator", names: ["VIA Rail"] },
      {
        category: "Other rail services",
        names: ["Rocky Mountaineer", "Amtrak Cascades", "GO Transit", "Exo", "West Coast Express", "Ontario Northland"],
      },
      { category: "Booking platforms", names: ["VIA Rail website/app", "Wanderu", "Direct regional operator sites"] },
    ],
    buses: [
      {
        category: "Intercity operators",
        names: ["FlixBus", "Rider Express", "Ontario Northland", "Orléans Express", "Maritime Bus", "Pacific Western", "Ebus", "Red Arrow", "Megabus"],
      },
      { category: "Booking platforms", names: ["Busbud", "Wanderu", "Direct operator sites"] },
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
    trains: [
      {
        category: "National Rail operating companies",
        names: ["Avanti West Coast", "LNER", "Great Western Railway", "CrossCountry", "TransPennine Express", "Northern", "ScotRail", "Transport for Wales", "Greater Anglia", "Southeastern", "Southern / Thameslink"],
      },
      {
        category: "Booking platforms",
        names: ["Trainline", "National Rail Enquiries", "TrainSplit", "Split My Fare", "Railsmartr", "Omio", "Rail Europe"],
      },
    ],
    buses: [
      { category: "Major coach operators", names: ["National Express", "Megabus UK", "FlixBus", "Scottish Citylink", "Oxford Tube", "Stagecoach", "First Bus"] },
      { category: "Booking platforms", names: ["National Express", "Megabus", "Trainline", "Omio", "Busbud", "CheckMyBus"] },
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
    trains: [
      { category: "National operator", names: ["Deutsche Bahn (DB)"] },
      { category: "Low-cost & private rail", names: ["FlixTrain", "Metronom", "erixx", "Abellio", "National Express Germany"] },
      { category: "Booking platforms", names: ["DB Navigator", "Trainline", "Omio", "FlixTrain", "HappyRail"] },
    ],
    buses: [
      { category: "Main operators", names: ["FlixBus", "BlaBlaCar Bus", "IC Bus", "RegioJet"] },
      { category: "Booking platforms", names: ["FlixBus", "Omio", "CheckMyBus", "Busbud", "ComparaBUS"] },
    ],
  },
  {
    code: "EU",
    name: "Europe-wide",
    flag: "🇪🇺",
    trains: [
      {
        category: "Cross-border aggregators",
        names: ["Trainline", "Omio", "Rail Europe", "Eurail / Interrail", "HappyRail", "Save A Train", "Kombo"],
      },
      {
        category: "National operator apps worth having",
        names: ["SNCF Connect (France)", "Trenitalia / Italo (Italy)", "Renfe (Spain)", "ÖBB (Austria)", "SBB (Switzerland)", "NS / NS International (Netherlands)", "SNCB/NMBS (Belgium)", "SJ (Sweden)", "Vy (Norway)", "CP (Portugal)"],
      },
    ],
    buses: [
      { category: "Major networks", names: ["FlixBus", "BlaBlaCar Bus", "Alsa", "RegioJet", "Leo Express", "Itabus / Marino", "Union Ivkoni"] },
      { category: "Aggregators", names: ["Omio", "Busbud", "CheckMyBus", "ComparaBUS", "GetByBus"] },
    ],
    platforms: [
      { category: "Multimodal planning", names: ["Rome2Rio", "Google Maps", "Moovit"] },
    ],
  },
];
