export interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  codeInternal: string;
  year: number;
  idOwner: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyImage {
  id: string;
  idProperty: string;
  file: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export interface PropertyFormData {
  name: string;
  address: string;
  price: number;
  codeInternal: string;
  year: number;
  idOwner: string;
}
