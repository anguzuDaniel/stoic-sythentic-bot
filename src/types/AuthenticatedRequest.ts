interface AuthenticatedRequest extends Request {
  user: JWTUser;
}