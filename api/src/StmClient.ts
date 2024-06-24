import dgram, { Socket } from "dgram";
import { MsgIdCreator } from "./MsgIdCreator";
import { numberToBytes } from "./utils/numberToBytes";
import { bytesToNumber } from "./utils/bytesToNumber";
import { MessageType } from "./enums/MessageType";
import { ContinuousCommand } from "./enums/ContinuousCommand";

export class StmClient {
    private static _instance: StmClient;
    private _client: Socket;
    private _instantCallbacks: Map<number, (data: number[]) => void>;
    private _continuousSet: boolean = false;
    private _continuousCallback?: (data: number[]) => void;
    private _lastMsgTime?: number;

    private _ip = process.env.STM_SERVER_IP;
    private _port = parseInt(process.env.STM_SERVER_PORT);

    private constructor() {
        this._instantCallbacks = new Map();
        this._client = dgram.createSocket("udp4");

        this._client.on("message", this._handleResponse);
        this._client.on("error", this._handleError);
        this._client.on("close", this._handleClose);
    }

    static getInstance() {
        if (!this._instance) this._instance = new StmClient();
        return this._instance;
    }

    startContinuous(req1: number[], req2: number[], callback: (data: number[]) => void) {
        // const request = [MessageType.Continuous, ContinuousCommand.Start, req1.length, ...req1, req2.length, ...req2];
        const request = [1, 0, 4, 0];
        this._continuousCallback = callback;
        this._client.send(Buffer.from(request), this._port, this._ip, (err) => {
            if (err) throw err;
            console.log("sent start continous");
        });
        this._continuousSet = true;
    }

    stopContinuous() {
        // const request = [MessageType.Continuous, ContinuousCommand.Stop];
        const request = [1, 0, 2, 0];
        this._continuousCallback = undefined;
        this._client.send(Buffer.from(request), this._port, this._ip, (err) => {
            if (err) throw err;
            console.log("sent stop continous");
        });
        this._continuousSet = false;
    }

    write(data: number[], callback: (data: number[]) => void) {
        const msgId = MsgIdCreator.create();
        this._instantCallbacks.set(msgId, callback);
        const request = [...numberToBytes(msgId, 2), ...data];
        this._client.send(Buffer.from(request), this._port, this._ip, (err) => {
            if (err) {
                throw err;
            }
            console.log("udp message sent");
        });
    }

    private _handleResponse = (data: Buffer) => {
        const dataArray = Array.from(data);
        console.log("data");
        this._handleContinuousMsg(dataArray);
        // this._eskinDataMaper.handleData(dataArray);

        // const now = Date.now();
        // if (this._lastMsgTime) {
        //     console.log(now - this._lastMsgTime);
        // }
        // this._lastMsgTime = now;
        // console.log(dataArray);
        // console.log(this._instantCallbacks.size);
        const type = dataArray.shift();
        switch (type) {
            case MessageType.Instant:
                this._handleInstantMsg(dataArray);
                break;
            case MessageType.Continuous:
                this._handleContinuousMsg(dataArray);
                break;
            default:
                console.log("Unknown message type");
        }
    };

    private _handleInstantMsg(data: number[]) {
        const idBytes = data.splice(0, 2);
        const msgId = bytesToNumber(idBytes);
        const callback = this._instantCallbacks.get(msgId);
        if (!callback) return;
        callback(data);
        this._instantCallbacks.delete(msgId);
    }

    private _handleContinuousMsg(data: number[]) {
        if (!this._continuousSet) this.stopContinuous();
        this._continuousCallback?.(data);
    }

    private _handleError(err: Error) {
        console.log(err);
    }

    private _handleClose() {
        console.log("Connection closed!");
    }
}
