import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization)
      throw new UnauthorizedException('No token provided');

    const token = request.headers.authorization.split(' ')[1];

    if (!token) throw new UnauthorizedException('Token must be a Bearer token');

    this.authService.verify(token);

    const tokenData = this.authService.decode(token);
    request.jwt = tokenData;

    return true;
  }
}
