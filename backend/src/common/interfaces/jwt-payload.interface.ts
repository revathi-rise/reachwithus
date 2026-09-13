export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}
