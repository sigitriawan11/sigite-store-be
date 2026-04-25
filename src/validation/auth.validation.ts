import z, { ZodType } from "zod";

export const AuthValidation = {
    register: z
        .object({
            email: z
                .email("Invalid email format")
                .min(1, "Email is required"),

            name: z
                .string()
                .min(1, "Name is required"),
            phone_number: z
                .string()
                .min(10, "Phone number must be at least 10 digits")
                .max(13, "Phone number must be at most 13 digits")
                .regex(/^(08|628)[0-9]{8,11}$/, "Invalid phone number format"),
            password: z
                .string()
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                    "Password must be at least 8 characters and include uppercase, lowercase, and a number"
                ),
            confirm_password: z
                .string()
                .min(1, "Confirm password is required"),

            terms: z
                .boolean()
                .refine((val) => val === true, {
                    message: "You must accept the terms",
                }),
        })
        .refine((data) => data.password === data.confirm_password, {
            message: "Passwords do not match",
            path: ["confirm_password"],
        }),
    login: z
        .object({
            email: z
                .email("Invalid email format")
                .min(1, "Email is required"),
            password: z
                .string()
                .min(1, "Password is required"),
        })
}