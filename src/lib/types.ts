export interface StreetViewParams {
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
  zoom: number;
}

export interface SelfieData {
  dataUrl: string;
  width: number;
  height: number;
}

export interface Slide {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface GenerateRequest {
  streetView: StreetViewParams;
  selfie: SelfieData;
}

export interface GenerateResponse {
  slides: Slide[];
  error?: string;
}

export interface StreetViewRequest {
  lat: number;
  lng: number;
  heading?: number;
  pitch?: number;
  zoom?: number;
  width?: number;
  height?: number;
}

export interface StreetViewResponse {
  imageUrl: string;
  error?: string;
}
