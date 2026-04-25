import { ErrBadRequest } from "../config/errors";
import { AuthRepositories } from "../repositories/auth";
import { UserRepository } from "../repositories/user";
import { RequestCreateUser, RequestInsertUserSession, RequestLogin, RequestLoginProvider, RequestRegisterUser, RequestUpsertProvider, ResponseCreateUser, ResponseLogin } from "../types/auth-types";
import { Auth } from "../config/auth";
import { v4 as uuidv4 } from 'uuid';
import { Helpers } from "../helpers/Helpers";
import moment from "moment-timezone"


export class AuthService {
    static async createUser(payload: RequestCreateUser): Promise<ResponseCreateUser> {
        await UserRepository.findUserByEmailNotDeletedAndActive(payload.email)

        return AuthRepositories.createUser(payload)
    }

    static async upsertAuthProvider(payload: RequestUpsertProvider): Promise<void> {
        await AuthRepositories.upsertAuthProvider(payload);
    }

    static async createUserSession(payload: RequestInsertUserSession): Promise<void> {
        await AuthRepositories.createUserSession(payload);
    }

    static async login(payload: RequestLogin): Promise<ResponseLogin> {
        const { email, password, user_agent, ip_address } = payload;

        const now = moment().tz('Asia/Jakarta');

        const user = await UserRepository.findUserByEmailNotDeletedAndActive(email)

        const lockedUntil = moment(user.locked_until);


        if (lockedUntil.isAfter(now)) {
            const minutesLeft = Math.ceil(lockedUntil.diff(now, 'minutes', true));
            throw new ErrBadRequest(`Too many failed login attempts. Please try again in ${minutesLeft} minutes.`)
        } else if(lockedUntil.isBefore(now)) {
            await AuthRepositories.resetLockedAccount(user.email!)
        }

        const check_password = await AuthRepositories.checkPasswordAuth(password, user.password!)

        if (!check_password) {
            await AuthRepositories.failedLogin(user.email!);

            throw new ErrBadRequest("Login failed. Please check your email and password.")
        }

        const session_id = uuidv4()

        const token = Auth.createToken({
            session_id: session_id,
            user_id: user.id!,
            email: user.email!,
            role_id: user.role_id!
        })

        const token_refresh = Auth.createToken({
            session_id: session_id,
            user_id: user.id!,
            email: user.email!,
            role_id: user.role_id!
        }, "3d")

        await this.createUserSession({
            id: session_id,
            user_id: user!.id,
            access_token: token,
            refresh_token: token_refresh,
            user_agent: user_agent,
            ip_address: ip_address,
            expires_at: null,
        })

        return {
            access_token: token,
            refresh_token: token_refresh
        }
    }

    static async loginProvider(payload: RequestLoginProvider): Promise<{ token: string, token_refresh: string }> {
        const { email, name, provider_user_id, provider, raw, access_token, refresh_token, user_agent, ip_address } = payload;
        const user = await this.createUser({ email, name })

        await this.upsertAuthProvider({
            user_id: user!.id,
            provider: provider,
            provider_user_id: provider_user_id,
            access_token,
            refresh_token: refresh_token ?? null,
            expires_at: null,
            profile: JSON.stringify(raw),
        })

        const session_id = uuidv4()

        const token = Auth.createToken({
            session_id: session_id,
            user_id: user!.id,
            email: user!.email,
            role_id: user!.role_id
        })

        const token_refresh = Auth.createToken({
            session_id: session_id,
            user_id: user!.id,
            email: user!.email,
            role_id: user!.role_id
        }, "3d")

        await this.createUserSession({
            id: session_id,
            user_id: user!.id,
            access_token: token,
            refresh_token: token_refresh,
            user_agent: user_agent,
            ip_address: ip_address,
            expires_at: null,
        })

        return { token, token_refresh }

    }

    static async registerUser(payload: RequestRegisterUser) {
        await UserRepository.checkUserIfExistsByEmail(payload.email)

        const user = await AuthRepositories.createUserByRegister({
            ...payload,
            phone_number: Helpers.normalizePhoneNumber(payload.phone_number)
        })

        return user
    }
}