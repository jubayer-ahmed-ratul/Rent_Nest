export interface createLandlordPayload {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
}

export interface updateLandlordPayload {
  name?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}
