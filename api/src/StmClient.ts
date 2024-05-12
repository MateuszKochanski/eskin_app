import net, { Socket } from "net";
import { MsgIdCreator } from "./MsgIdCreator";
import { numberToBytes } from "./func/numberToBytes";
import { bytesToNumber } from "./func/bytesToNumber";
import { StmRequest } from "StmRequest";

export class StmClient {
    private static _instance: StmClient;
    private _client: Socket;
    private _callbacks: Map<number, (data: number[]) => void>;
    private _connected: boolean;
    private _timeout: number = 1000;

    private _inExecution: boolean = false;

    private _callback: (data: number[]) => void | undefined;
    private _currentId: number | undefined;
    private _requests: StmRequest[];

    private constructor() {
        this._client = new Socket();
        this._callbacks = new Map();
        this._connected = false;
        this._requests = [];

        this._client.connect(parseInt(process.env.STM_SERVER_PORT), process.env.STM_SERVER_IP, () => {
            this._connected = true;
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

    async waitForConnection(): Promise<void> {
        return new Promise((resolve) => {
            if (this._connected) resolve();
            setInterval(() => {
                if (this._connected) resolve();
            }, 10);
        });
    }

    async write(data: number[], callback: (data: number[]) => void) {
        await this.waitForConnection();
        const msgId = MsgIdCreator.create();
        const reqData = numberToBytes(msgId, 2).concat(data);

        const request = { id: msgId, data: reqData, callback };
        this._requests.push(request);
        if (!this._inExecution) {
            this._inExecution = true;
            this._writeNext();
        }
    }

    private _writeNext() {
        const request = this._requests.shift();
        if (!request) {
            this._inExecution = false;
            return;
        }

        this._currentId = request.id;
        this._callback = (data) => {
            clearTimeout(timeout);
            this._callback = undefined;
            request.callback(data);
            this._writeNext();
        };

        this._client.write(Buffer.from(request.data));

        const timeout = setTimeout(() => {
            console.log(`Aborting due to Timeout! ${request.id}`);
            this._callback([]);
        }, this._timeout);
    }

    private _handleResponse = (data: Buffer) => {
        const dataArray = Array.from(data);
        const msgId = bytesToNumber(dataArray.slice(0, 2));

        if (!this._currentId) return;
        if (this._currentId !== msgId) return;

        const respData = dataArray.slice(2);

        this._callback(respData);
    };

    private _handleError(err: Error) {
        console.log(err);
    }

    private _handleClose() {
        this._connected = false;
        console.log("Connection closed!");
    }
}
