export interface AuthUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse extends AuthUser {
  accessToken: string;
  refreshToken: string;
}