import fs from "fs";
import { DataFrame, DataFrameArraySchema } from "./schemas/DataFrameSchema";
import { wait } from "./utils/wait";
import { FrontCommunicator } from "./FrontCommunicator";
import { AbstractController } from "./AbstractController";
import { StartReq } from "./schemas/StartReqSchema";

export class PlaybackController extends AbstractController {
    private static _instance: PlaybackController;
    private _filename: string;
    private _frontCommunicator: FrontCommunicator;

    private constructor() {
        super();
        this._frontCommunicator = FrontCommunicator.getInstance();
    }

    static getInstance() {
        if (!PlaybackController._instance) PlaybackController._instance = new PlaybackController();
        return PlaybackController._instance;
    }

    async start(data: StartReq) {
        console.log(data.filename);
        this._filename = `results/${data.filename}`;
        fs.readFile(this._filename, "utf8", (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                const dataFrames = DataFrameArraySchema.parse(jsonData);
                this._start(dataFrames);
            } catch (err) {
                console.error("Error parsing JSON:", err);
            }
        });
    }

    async _start(frames: DataFrame[]) {
        let lastTimestamp;
        for (let frame of frames) {
            if (lastTimestamp) {
                await wait(frame.timestamp - lastTimestamp);
            }
            this._frontCommunicator.send(frame);
            lastTimestamp = frame.timestamp;
        }
    }

    private _publish() {}
}
