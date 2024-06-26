import { Address } from "../enums/Address";
import { Instruction } from "../enums/Instruction";
import { Size } from "../Size";
import { StmClient } from "../StmClient";
import { bytesToNumber } from "../utils/bytesToNumber";
import { calcCKSM } from "../utils/calcCKSM";
import { numberToBytes } from "../utils/numberToBytes";
import { validateServoResponse } from "../utils/validateServoResponse";

export class ServoCommunicator {
    private static _instance: ServoCommunicator;
    private _client: StmClient;
    private _preq: number[] = [0xff, 0xff];

    private constructor() {
        this._client = StmClient.getInstance();
    }

    static getInstance() {
        if (!this._instance) this._instance = new ServoCommunicator();
        return this._instance;
    }

    setValue(id: number, address: Address, value: number) {
        const length = Size.get(address) + 3;

        let array = [id, length, Instruction.Write, address];
        array = array.concat(numberToBytes(value, Size.get(address)));
        array.push(calcCKSM(array));
        array = this._preq.concat(array);

        this._client.write(array, () => {
            // console.log("writed");
        });
    }

    getValue(id: number, address: Address, callback: (value: number) => void) {
        const length = 4;
        let array = [id, length, Instruction.Read, address, Size.get(address)];
        array.push(calcCKSM(array));
        array = this._preq.concat(array);
        this._client.write(array, (resp) => {
            if (!validateServoResponse(resp)) {
                console.log("validation ERRor");
                callback(-1);
                return;
            }
            callback(this._extractValue(address, resp));
        });
    }

    private _extractValue(address: Address, data: number[]): number {
        const startIndex = 5;
        const value = bytesToNumber(data.slice(startIndex, startIndex + Size.get(address)));
        return value;
    }
}
