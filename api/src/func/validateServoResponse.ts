import { calcCKSM } from "./calcCKSM";

export const validateServoResponse = (data: number[]): boolean => {
    if (data.at(0) !== 255 || data.at(1) !== 255) return false;
    if (data.at(3) !== data.length - 4) return false;
    const cksm = calcCKSM(data.slice(2, data.length - 1));
    if (cksm !== data.at(-1)) return false;

    return true;
};
