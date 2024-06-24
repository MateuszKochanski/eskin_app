import { Size } from "../../Size";
import { Address } from "../../enums/Address";
import { bytesToNumber } from "../../utils/bytesToNumber";
import { validateServoResponse } from "../../utils/validateServoResponse";

export class ServosDataHandler {
    private _servosData: { servoPos1: number; servoPos2: number; servoLoad1: number; servoLoad2: number };

    constructor() {
        this._servosData = { servoPos1: -1, servoPos2: -1, servoLoad1: -1, servoLoad2: -1 };
    }

    get data(): { servoPos1: number; servoPos2: number; servoLoad1: number; servoLoad2: number } {
        return this._servosData;
    }

    handleData(data: number[]) {
        const newData = this._extractPositionData(data);
        this._servosData = { ...this._servosData, ...newData };
    }

    private _extractPositionData(data: number[]): {
        servoPos1?: number;
        servoPos2?: number;
        servoLoad1?: number;
        servoLoad2?: number;
    } {
        let servoPos1;
        let servoPos2;
        let servoLoad1;
        let servoLoad2;
        const startIndex = 0;
        let servoData = data.slice(startIndex, startIndex + 10);
        if (validateServoResponse(servoData)) servoPos1 = this._extractValue(Address.PresentPosition, servoData);
        servoData = data.slice(startIndex + 10, startIndex + 20);
        if (validateServoResponse(servoData)) servoPos2 = this._extractValue(Address.PresentPosition, servoData);
        servoData = data.slice(startIndex + 20, startIndex + 30);
        if (validateServoResponse(servoData)) servoLoad1 = this._extractValue(Address.PresentLoad, servoData);
        servoData = data.slice(startIndex + 30, startIndex + 40);
        if (validateServoResponse(servoData)) servoLoad2 = this._extractValue(Address.PresentLoad, servoData);

        return {
            servoPos1,
            servoPos2,
            servoLoad1: servoLoad1 <= 1023 ? -servoLoad1 : servoLoad1 - 1024,
            servoLoad2: servoLoad2 <= 1023 ? -servoLoad2 : servoLoad2 - 1024,
        };
    }

    private _extractValue(address: Address, data: number[]): number {
        const startIndex = 5;
        const value = bytesToNumber(data.slice(startIndex, startIndex + Size.get(address)));
        return value;
    }
}
