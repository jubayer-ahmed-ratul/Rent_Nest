export interface createPropertyPayload {
  categoryId: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  images?: string[];
  amenities?: string[];
}

export interface updatePropertyPayload {
  categoryId?: string;
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  amenities?: string[];
  isAvailable?: boolean;
}

export interface propertyFilterPayload {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  bedrooms?: number;
}
