import { Request } from "express";

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
}
export interface UserData extends LimitedUserData {
    email: string;
    password: string;
    tenantId?: number;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    id: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface UserQueryParams {
    currentPage: number;
    perPage: number;
}
