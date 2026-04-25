export interface JWTPayload {
    session_id: string,
    user_id: string,
    email: string,
    role_id: string
}

export interface RequestLoginProvider {
    email: string,
    name: string,
    provider_user_id: string,
    provider: string,
    raw: any,
    access_token: string,
    refresh_token: string,
    user_agent: string,
    ip_address: string
}

export interface RequestLogin {
    email: string,
    password: string
    user_agent: string,
    ip_address: string
}

export interface ResponseLogin {
    access_token: string,
    refresh_token: string
}

export interface RequestCreateUser {
    email: string,
    name: string
}

export interface RequestRegisterUser extends RequestCreateUser {
    phone_number: string
    password: string
}

export interface ResponseCreateUser {
    id: string,
    email: string,
    role_id: string
}

export interface RequestUpsertProvider {
    user_id: string;
    provider: string;
    provider_user_id: string;
    access_token: string | null;
    refresh_token: string | null;
    expires_at: Date | null;
    profile: string;
}

export interface RequestInsertUserSession {
    id: string
    user_id: string;
    access_token: string;
    refresh_token: string;
    user_agent: string;
    ip_address: string;
    expires_at: Date | null;
}

export interface ResponseFailedLogin {
    failed_login_attempt: number;
    locked_until: Date | null
}