export const bytesToNumber = (bytes: number[]): number => {
    let value = 0;
    bytes.forEach((val, idx) => (value += val * 256 ** idx));
    return value;
};
