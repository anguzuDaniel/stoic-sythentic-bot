interface AuthenticatedRequest extends Request {
  user: JWTUser;
}

export { AuthenticatedRequest };