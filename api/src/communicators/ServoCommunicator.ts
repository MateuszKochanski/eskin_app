import { Address } from "../Address";
import { Instruction } from "../Instruction";
import { Size } from "../Size";
import { StmClient } from "../StmClient";
import { bytesToNumber } from "../func/bytesToNumber";
import { calcCKSM } from "../func/calcCKSM";
import { numberToBytes } from "../func/numberToBytes";

export class ServoCommunicator {
    private static _instance: ServoCommunicator;
    private _client: StmClient;

    private constructor() {
        this._client = StmClient.getInstance();
    }

    static getInstance() {
        if (!this._instance) this._instance = new ServoCommunicator();
        return this._instance;
    }

    setValue(id: number, address: Address, value: number) {
        const preq = [0xff, 0xff];
        const length = Size.get(address) + 3;

        let array = [id, length, Instruction.Write, address];
        array = array.concat(numberToBytes(value, Size.get(address)));
        array.push(calcCKSM(array));
        array = preq.concat(array);
        this._client.write(array, () => {
            console.log("writed");
        });
    }

    getValue(id: number, address: Address, callback: (value: number) => void) {
        const preq = [0xff, 0xff];
        const length = 4;
        let array = [id, length, Instruction.Read, address, Size.get(address)];
        array.push(calcCKSM(array));
        array = preq.concat(array);
        this._client.write(array, (data) => {
            callback(this._extractValue(address, data));
        });
    }

    private _extractValue(address: Address, data: number[]): number {
        const startIndex = 5;
        const value = bytesToNumber(data.slice(startIndex, startIndex + Size.get(address)));
        return value;
    }
}
