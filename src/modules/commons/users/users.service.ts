import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable, lastValueFrom } from 'rxjs';
import {
  GetUserRequestById,
  GetUserRequestByIds,
  GetUserResponseByIds,
  User,
} from './interfaces/users.interface';
import { USERS_PACKAGE } from 'src/helpers/constants';

interface UsersServiceClient {
  getUserByIds(data: GetUserRequestByIds): Observable<GetUserResponseByIds>;
  getUserById(data: GetUserRequestById): Observable<User>;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private usersServiceClient: UsersServiceClient;

  constructor(@Inject(USERS_PACKAGE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.usersServiceClient =
      this.client.getService<UsersServiceClient>('UsersService');
  }

  getUserByIds(userIds: string[]): Promise<GetUserResponseByIds> {
    const request: GetUserRequestByIds = { ids: userIds };
    return lastValueFrom(this.usersServiceClient.getUserByIds(request));
  }

  getUserById(userId: string): Promise<User> {
    const request: GetUserRequestById = { id: userId };
    return lastValueFrom(this.usersServiceClient.getUserById(request));
  }
}
