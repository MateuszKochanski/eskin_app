export const numberToBytes = (value: number, size: number): number[] => {
    if (size == 1) return [value % 256];
    return [value % 256, Math.floor(value / 256)];
};
