import { Tool } from "../enums/Tool";
import { StmClient } from "../StmClient";

export class EskinCommunicator {
    private static _instance: EskinCommunicator;
    private _client: StmClient;

    private constructor() {
        this._client = StmClient.getInstance();
    }

    static getInstance() {
        if (!this._instance) this._instance = new EskinCommunicator();
        return this._instance;
    }

    getData(callback: (data: number[]) => void) {
        let array = [Tool.ESkin];
        this._client.write(array, (data) => {
            callback(this._extractData(data));
        });
    }

    private _extractData(data: number[]): number[] {
        const startIndex = 1;
        const result = data.slice(startIndex);
        return result;
    }
}
