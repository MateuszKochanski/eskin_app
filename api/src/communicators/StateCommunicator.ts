import { DataFrame } from "../schemas/DataFrameSchema";
import { Tool } from "../enums/Tool";
import { StmClient } from "../StmClient";
import { Address } from "../enums/Address";
import { bytesToNumber } from "../func/bytesToNumber";
import { Size } from "../Size";
import { calcCKSM } from "../func/calcCKSM";
import { Instruction } from "../enums/Instruction";
import { validateServoResponse } from "../func/validateServoResponse";

export class StateCommunicator {
    private static _instance: StateCommunicator;
    private _client: StmClient;
    private _preq: number[] = [Tool.State];

    private constructor() {
        this._client = StmClient.getInstance();
    }

    static getInstance() {
        if (!this._instance) this._instance = new StateCommunicator();
        return this._instance;
    }

    getData(servoId1: number, servoId2: number, callback: (data: DataFrame) => void) {
        const length = 4;
        let servoReq1 = [
            servoId1,
            length,
            Instruction.Read,
            Address.PresentPosition,
            Size.get(Address.PresentPosition),
        ];
        servoReq1.push(calcCKSM(servoReq1));
        servoReq1 = [255, 255].concat(servoReq1);

        let servoReq2 = [
            servoId2,
            length,
            Instruction.Read,
            Address.PresentPosition,
            Size.get(Address.PresentPosition),
        ];
        servoReq2.push(calcCKSM(servoReq2));
        servoReq2 = [255, 255].concat(servoReq2);

        let array = this._preq.concat(servoReq1, servoReq2);

        this._client.write(array, (data) => {
            callback(this._extractData(data));
        });
    }

    private _extractData(data: number[]): DataFrame {
        let servoPos1 = -1;
        let servoPos2 = -1;
        const startIndex = 1;
        const servoData1 = data.slice(startIndex, startIndex + 10);
        if (validateServoResponse(servoData1)) servoPos1 = this._extractValue(Address.PresentPosition, servoData1);
        const servoData2 = data.slice(startIndex + 10, startIndex + 20);
        if (validateServoResponse(servoData2)) servoPos2 = this._extractValue(Address.PresentPosition, servoData2);
        const eskin = data.slice(startIndex + 20, startIndex + 20 + 256);
        // console.log(data.at(-1));

        const result: DataFrame = {
            eskin,
            servoPos1,
            servoPos2,
            timestamp: Date.now(),
        };
        return result;
    }

    private _extractValue(address: Address, data: number[]): number {
        const startIndex = 5;
        const value = bytesToNumber(data.slice(startIndex, startIndex + Size.get(address)));
        return value;
    }
}
