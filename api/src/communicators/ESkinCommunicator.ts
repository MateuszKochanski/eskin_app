import { Tool } from "../enums/Tool";
import { StmClient } from "../StmClient";

export class EskinCommunicator {
    private _client: StmClient;
    constructor() {
        this._client = StmClient.getInstance();
    }

    getData(callback: (data: number[]) => void) {
        let array = [Tool.ESkin];
        this._client.write(array, (data) => {
            callback(this._extractData(data));
        });
    }

    private _extractData(data: number[]): number[] {
        const startIndex = 5;
        const result = data.slice(startIndex);
        return result;
    }
}
