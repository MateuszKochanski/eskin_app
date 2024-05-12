import z from "zod";

export const StartReqSchema = z.object({
    filename: z.string(),
});

export type StartReq = z.infer<typeof StartReqSchema>;
