import { calcCKSM } from "./calcCKSM";

export const validateServoResponse = (data: number[]): boolean => {
    if (data.at(0) !== 255 || data.at(1) !== 255) return false;
    let length = data.at(3);
    if (!length || length > 10) return false;
    length += 4;
    const cksm = calcCKSM(data.slice(2, length - 1));
    if (cksm !== data.at(length - 1)) return false;
    return true;
};
