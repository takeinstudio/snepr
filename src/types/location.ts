// Unified Location Architecture Types for Snepr Website & Mobile App

export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locality: string;
  city: string;
  formattedLabel: string;
  source: 'gps' | 'manual';
}

export const DEFAULT_LOCATION: LocationState = {
  latitude: 20.3533,
  longitude: 85.8266,
  locality: 'Patia',
  city: 'Bhubaneswar',
  formattedLabel: 'Patia, Bhubaneswar',
  source: 'manual',
};

export const PRESET_LOCALITIES: Array<{ name: string; lat: number; lng: number }> = [
  { name: 'Patia, Bhubaneswar', lat: 20.3533, lng: 85.8266 },
  { name: 'Silicon Institute, Bhubaneswar', lat: 20.3705, lng: 85.8115 },
  { name: 'KIIT Square, Bhubaneswar', lat: 20.3548, lng: 85.8170 },
  { name: 'Saheed Nagar, Bhubaneswar', lat: 20.2885, lng: 85.8427 },
  { name: 'Jaydev Vihar, Bhubaneswar', lat: 20.3010, lng: 85.8250 },
  { name: 'Janpath, Bhubaneswar', lat: 20.2700, lng: 85.8333 },
];
