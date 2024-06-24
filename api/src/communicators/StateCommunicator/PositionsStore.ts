import { Size } from "../../Size";
import { Address } from "../../enums/Address";
import { bytesToNumber } from "../../utils/bytesToNumber";
import { validateServoResponse } from "../../utils/validateServoResponse";

export class PositionsStore {
    private _positions: { servoPos1: number; servoPos2: number };

    constructor() {
        this._positions = { servoPos1: -1, servoPos2: -1 };
    }

    get data(): { servoPos1: number; servoPos2: number } {
        return this._positions;
    }

    handleData(data: number[]) {
        const newPositions = this._extractPositionData(data);
        this._positions = { ...this._positions, ...newPositions };
    }

    private _extractPositionData(data: number[]): { servoPos1?: number; servoPos2?: number } {
        let servoPos1;
        let servoPos2;
        const startIndex = 0;
        const servoData1 = data.slice(startIndex, startIndex + 10);
        if (validateServoResponse(servoData1)) servoPos1 = this._extractValue(Address.PresentPosition, servoData1);
        const servoData2 = data.slice(startIndex + 10, startIndex + 20);
        if (validateServoResponse(servoData2)) servoPos2 = this._extractValue(Address.PresentPosition, servoData2);

        return {
            servoPos1,
            servoPos2,
        };
    }

    private _extractValue(address: Address, data: number[]): number {
        const startIndex = 5;
        const value = bytesToNumber(data.slice(startIndex, startIndex + Size.get(address)));
        return value;
    }
}
