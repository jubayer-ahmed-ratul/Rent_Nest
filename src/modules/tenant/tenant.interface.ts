export interface registerUserPayload {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
}

export interface updateTenantProfilePayload {
  fullName?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}
