import { QueryTypes } from "sequelize";
import { sequelize_main, Session, User } from "../databases/main.db";
import { ROLES } from "../constant/role";
import { RequestCreateUser, RequestInsertUserSession, RequestRegisterUser, RequestUpsertProvider, ResponseCreateUser, ResponseFailedLogin } from "../types/auth-types";
import bcrypt from "bcrypt"
import { ErrUnauthorized } from "../config/errors";

export class AuthRepositories {
    static async createUser(payload: RequestCreateUser): Promise<ResponseCreateUser> {
        const [result] = await sequelize_main.query<ResponseCreateUser>(
            `SELECT * FROM apps.f_create_user_if_not_exists(:email, :name, :role_id::uuid)`,
            {
                replacements: { email: payload.email.toLowerCase(), name: payload.name, role_id: ROLES.USER.id },
                type: QueryTypes.SELECT,
            }
        );

        return result!
    }

    static async upsertAuthProvider(payload: RequestUpsertProvider): Promise<void> {
        await sequelize_main.query(
            `SELECT * FROM apps.f_upsert_auth_provider(
        :user_id,
        :provider,
        :provider_user_id,
        :access_token,
        :refresh_token,
        :expires_at,
        :profile
      )`,
            {
                replacements: {
                    user_id: payload.user_id,
                    provider: payload.provider,
                    provider_user_id: payload.provider_user_id,
                    access_token: payload.access_token,
                    refresh_token: payload.refresh_token,
                    expires_at: payload.expires_at,
                    profile: payload.profile,
                },
                type: QueryTypes.SELECT,
            }
        );
    }

    static async createUserSession(payload: RequestInsertUserSession): Promise<void> {
        await sequelize_main.query(
            `SELECT * FROM apps.f_create_user_session(
        :id,
        :user_id,
        :access_token,
        :refresh_token,
        :user_agent,
        :ip_address,
        :expires_at
      )`,
            {
                replacements: {
                    id: payload.id,
                    user_id: payload.user_id,
                    access_token: payload.access_token,
                    refresh_token: payload.refresh_token,
                    user_agent: payload.user_agent,
                    ip_address: payload.ip_address,
                    expires_at: payload.expires_at,
                },
                type: QueryTypes.SELECT,
            }
        );
    }

    static async createUserByRegister(payload: RequestRegisterUser, role_id?: string): Promise<ResponseCreateUser> {
        const hashed = await bcrypt.hash(payload.password, 12);

        const [result] = await sequelize_main.query<ResponseCreateUser>(
            `SELECT * FROM apps.f_create_user_if_not_exists(:email, :name, :role_id::uuid)`,
            {
                replacements: {
                    email: payload.email.toLowerCase(),
                    name: payload.name,
                    role_id: role_id || ROLES.USER.id
                },
                type: QueryTypes.SELECT,
            }
        );

        await User.update(
            { password: hashed, phone_number: payload.phone_number },
            { where: { id: result!.id } }
        );

        return result!;
    }

    static async checkPasswordAuth(password: string, password_hash: string): Promise<boolean> {
        const match = await bcrypt.compare(password, password_hash);

        return match
    }

    static async revokeToken(id: string): Promise<void> {
        await Session.update({
            is_revoked: true
        }, {
            where: {
                id
            }
        })
    }

    static async checkRevokeToken(id: string): Promise<void> {
        const data = await Session.findOne({
            where: {
                id
            }
        })

        if (data?.is_revoked) {
            throw new ErrUnauthorized()
        }
    }

    static async refreshToken(payload: {
        refresh_token: string
        new_access_token: string
        new_refresh_token: string
        user_agent: string
        ip_address: string
        expires_at: Date
    }) {
        const [result] = await sequelize_main.query(
            `SELECT * FROM apps.f_refresh_user_session(
            :refresh_token,
            :new_access_token,
            :new_refresh_token,
            :user_agent,
            :ip_address,
            :expires_at
        )`,
            {
                replacements: payload,
                type: QueryTypes.SELECT,
            }
        );

        return result;
    }

    static async failedLogin(email: string) : Promise<ResponseFailedLogin> {
        const [result] =  await sequelize_main.query<ResponseFailedLogin>(
            `select * from apps.f_failed_login(:email)`,
            {
                replacements: {
                    email
                },
                type: QueryTypes.SELECT
            }
        )

        return result!
    }

    static async resetLockedAccount(email: string) : Promise<void> {
        await User.update({
            locked_until: null,
            failed_login_attempt: 0
        }, {
            where: {
                email,
                deleted_at: null,
                is_active: true
            }
        })
    }
}