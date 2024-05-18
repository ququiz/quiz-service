import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { JwtPayloadDTO } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  public verify(token: string, publicKey = process.env.JWT_PUBLIC_KEY): void {
    try {
      this.jwtService.verify(token, {
        publicKey,
        algorithms: ['ES256', 'ES512'],
      });
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  public decode(token: string): JwtPayloadDTO {
    const userData = this.jwtService.decode(token);
    return plainToInstance(JwtPayloadDTO, userData);
  }
}
