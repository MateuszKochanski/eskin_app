import z from "zod";
export const DataFrameSchema = z.object({
    eskin: z.array(z.number()),
    servoPos1: z.number(),
    servoPos2: z.number(),
    timestamp: z.number(),
});

export const DataFrameArraySchema = z.array(DataFrameSchema);

export type DataFrame = z.infer<typeof DataFrameSchema>;
