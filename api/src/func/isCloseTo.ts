export const isCloseTo = (num1: number, num2: number, dif: number): boolean => {
    if (Math.abs(num1 - num2) < dif) return true;
    return false;
};
