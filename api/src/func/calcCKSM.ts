export const calcCKSM = (arr: number[]): number => {
    let CKSM = 0;
    for (let el of arr) {
        CKSM = CKSM + el;
    }
    let result = 255 - (CKSM % 256);
    return result;
};
