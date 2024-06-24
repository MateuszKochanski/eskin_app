import z from "zod";
export const DataFrameSchema = z.object({
    eskin1: z.array(z.array(z.number())),
    eskin2: z.array(z.array(z.number())),
    servoPos1: z.number(),
    servoPos2: z.number(),
    timestamp: z.number(),
});

export const DataFrameArraySchema = z.array(DataFrameSchema);

export type DataFrame = z.infer<typeof DataFrameSchema>;
