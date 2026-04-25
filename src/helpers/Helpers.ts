import { RoleName, ROLES } from "../constant/role";

type ZodErrorItem = {
    field: string;
    message: string;
};


export class Helpers {
    static getRoleIdByName(name: RoleName) {
        const role = Object.values(ROLES).find((r) => r.name === name);

        if (!role) {
            throw new Error(`Role ${name} not found`);
        }

        return role.id;
    };

    static getUserAgent = (req: any) => {
        return req.headers["user-agent"] || null;
    };

    static getClientIp = (req: any) => {
        let ip =
            req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
            req.socket?.remoteAddress ||
            req.ip ||
            null;

        if (ip === "::1") ip = "127.0.0.1";

        if (ip?.startsWith("::ffff:")) {
            ip = ip.replace("::ffff:", "");
        }

        return ip;
    };

    static getUrlAPI = () => {
        return process.env.NEXT_PUBLIC_API_URL
    }

    static parsingErrorZod = (errors: ZodErrorItem[]) => {
        return errors.map((err) => ({
            name: err.field,
            errors: [err.message],
        }));
    };

    static normalizePhoneNumber(phone: string): string {
        if (!phone) return phone;

        const clean = phone.replace(/[^0-9]/g, "");

        if (clean.startsWith("0")) {
            return "62" + clean.slice(1);
        }

        return clean;
    }

    static normalizeUpper(data: string): string {
        return data?.trim().toUpperCase()
    }
}