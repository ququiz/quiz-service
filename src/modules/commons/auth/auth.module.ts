import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';

const services = [AuthService, JwtGuard];

@Module({
  imports: [JwtModule],
  providers: [...services],
  exports: [...services],
})
export class AuthModule {}
