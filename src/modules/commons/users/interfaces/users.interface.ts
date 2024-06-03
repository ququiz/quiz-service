export interface User {
  id: string;
  email: string;
  fullname: string;
  username: string;
}

export interface GetUserRequestByIds {
  ids: string[];
}

export interface GetUserRequestById {
  id: string;
}

export interface GetUserResponseByIds {
  user: User[];
}
