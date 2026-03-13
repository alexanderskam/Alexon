export interface IUser {
    username: string;
    email: string;
    _id: string;
    isActivated: boolean;
}

export interface ILoginResponse {
    user: IUser;
    accessToken: string;
}
