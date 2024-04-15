import net, { Socket } from "net";
import { MsgIdCreator } from "./MsgIdCreator";
import { numberToBytes } from "./func/numberToBytes";
import { bytesToNumber } from "./func/bytesToNumber";

export class StmClient {
    private static _instance: StmClient;
    private _client: Socket;
    private _callbacks: Map<number, (data: number[]) => void>;

    private constructor() {
        this._client = new Socket();
        this._callbacks = new Map();

        this._client.connect(parseInt(process.env.STM_SERVER_PORT), process.env.STM_SERVER_IP, () => {
            console.log("Connected!");
        });

        this._client.on("data", this._handleResponse);
        this._client.on("error", this._handleError);
        this._client.on("close", this._handleClose);
    }

    static getInstance() {
        if (!this._instance) this._instance = new StmClient();
        return this._instance;
    }

    write(data: number[], callback: (data: number[]) => void) {
        const msgId = MsgIdCreator.create();
        const reqData = numberToBytes(msgId, 2).concat(data);

        // console.log(numberToBytes(msgId, 2));

        this._callbacks.set(msgId, callback);

        this._client.write(Buffer.from(reqData));
    }

    private _handleResponse = (data: Buffer) => {
        const dataArray = Array.from(data);
        const msgId = bytesToNumber(dataArray.slice(0, 2));
        // console.log(dataArray);

        const callback = this._callbacks.get(msgId);

        const respData = dataArray.slice(2);

        if (callback) {
            this._callbacks.delete(msgId);
            callback(respData);
        }
    };

    private _handleError(err: Error) {
        console.log(err);
    }

    private _handleClose() {
        console.log("Connection closed!");
    }
}
