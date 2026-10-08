export const establishmentTypes = {
  hotel: { label: "Hôtel", plural: "Hôtels", route: "/hotels" },
  restaurant: { label: "Restaurant", plural: "Restaurants", route: "/restaurants" },
  apartment: { label: "Appartement", plural: "Appartements", route: "/appartements" },
} as const;

export type EstablishmentType = keyof typeof establishmentTypes;
export type EstablishmentStatus = "pending" | "approved" | "rejected";

type ApartmentDetails = {
  passagePrice: number | null;
  nightPrice: number | null;
  dayPrice: number | null;
  longStayDiscount: number | null;
  maxAdults: number | null;
  bedrooms: number | null;
  energyOptions: string[];
  amenities: string[];
  landmark: string;
};

type RestaurantDetails = {
  cuisines: string[];
  signatureDishes: string;
  averageMainPrice: number | null;
  services: string[];
  ambiance: string[];
  openingHours: string;
  closedDays: string;
};

type HotelDetails = {
  standardRoomPrice: number | null;
  vipSuitePrice: number | null;
  breakfast: string;
  services: string[];
  meetingRoomCapacity: number | null;
  facilities: string[];
};

export type EstablishmentDetails = {
  apartment: ApartmentDetails;
  restaurant: RestaurantDetails;
  hotel: HotelDetails;
};

export type Establishment = {
  id: string;
  owner_id: string;
  business_type: EstablishmentType;
  name: string;
  phone: string;
  address: string;
  description: string;
  equipment: string[];
  details: EstablishmentDetails;
  photos: string[];
  status: EstablishmentStatus;
  rejection_reason?: string | null;
  rejected_at?: string | null;
  created_at: string;
};

export const emptyEstablishmentDetails: EstablishmentDetails = {
  apartment: {
    passagePrice: null,
    nightPrice: null,
    dayPrice: null,
    longStayDiscount: null,
    maxAdults: null,
    bedrooms: null,
    energyOptions: [],
    amenities: [],
    landmark: "",
  },
  restaurant: {
    cuisines: [],
    signatureDishes: "",
    averageMainPrice: null,
    services: [],
    ambiance: [],
    openingHours: "",
    closedDays: "",
  },
  hotel: {
    standardRoomPrice: null,
    vipSuitePrice: null,
    breakfast: "",
    services: [],
    meetingRoomCapacity: null,
    facilities: [],
  },
};

export const establishmentEquipment = [
  "Wi-Fi",
  "Climatisation",
  "Piscine",
  "Parking",
  "Restaurant",
  "Petit-déjeuner",
  "Eau chaude",
  "Salle de réunion",
] as const;
