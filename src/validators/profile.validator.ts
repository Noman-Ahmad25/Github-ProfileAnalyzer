import { z } from "zod";

export const getProfileSchema = z.object({
    params: z.object({
        username: z
            .string()
            .min(1, "Username parameter is required")
            .max(39, "GitHub usernames cannot exceed 39 characters ")
            .regex(/^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/,"Invalid GitHub username format")

    })
})
export const listProfileSchema = z.object({
    query: z.object({
        limit: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 10))
            .pipe(z.number().int().positive().max(100, "Maximum allowable limit is 100 rows")),
        page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .pipe(z.number().int().positive()),
        sortBY: z
            .string()
            .optional()
            .default("createdAt")
            .refine((val) => ["createdAt", "totalStars", "followersCount", "publicReposCount"].includes(val), {
                message: "Invalid sorting column field provided"
            }),
        order: z
            .string()
            .optional()
            .default('DESC')
            .transform((val) => val.toUpperCase())
            .refine((val) => ["ASC", "DESC"].includes(val),{
                message: "Ordering must strictly evaluate to 'ASC' or 'DESC'."
            })


    })
})

export type GetProfileInput = z.infer<typeof getProfileSchema>