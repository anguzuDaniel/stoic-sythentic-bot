export interface AuthenticatedRequest extends Request {
  user: JWTUser;
}