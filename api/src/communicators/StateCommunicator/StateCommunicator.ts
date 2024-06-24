import { DataFrame } from "../../schemas/DataFrameSchema";
import { Address } from "../../enums/Address";
import { bytesToNumber } from "../../utils/bytesToNumber";
import { Size } from "../../Size";
import { calcCKSM } from "../../utils/calcCKSM";
import { Instruction } from "../../enums/Instruction";
import { validateServoResponse } from "../../utils/validateServoResponse";
import { StmClient } from "../../StmClient";
import { EskinDataMaper } from "./EskinDataMapper";
import { PositionsStore } from "./PositionsStore";
import { Device } from "../../enums/Device";

export class StateCommunicator {
    private static _instance: StateCommunicator;
    private _client: StmClient;
    private _eskinDataMaper: EskinDataMaper;
    private _positionStore: PositionsStore;
    private _frameReady: boolean;
    private _lastMsgTime?: number;

    private constructor() {
        this._frameReady = false;
        this._client = StmClient.getInstance();
        this._eskinDataMaper = new EskinDataMaper();
        this._positionStore = new PositionsStore();
    }

    static getInstance() {
        if (!this._instance) this._instance = new StateCommunicator();
        return this._instance;
    }

    start(servoId1: number, servoId2: number, callback: (data: DataFrame) => void) {
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

        this._client.startContinuous(servoReq1, servoReq2, (data) => {
            const device = data.shift();
            switch (device) {
                case Device.Servo:
                    const now = Date.now();
                    if (this._lastMsgTime) {
                        console.log(now - this._lastMsgTime);
                    }
                    this._lastMsgTime = now;
                    this._positionStore.handleData(data);
                    break;
                case Device.Eskin:
                    this._eskinDataMaper.handleData(data);
                    break;
                default:
                    break;
            }
            if (this._eskinDataMaper.dataReady()) {
                const eskinData = this._eskinDataMaper.data;
                const positions = this._positionStore.data;
                callback({ ...eskinData, ...positions, timestamp: Date.now() });
                // callback(this._extractData(data));
            }
        });
    }

    stop() {
        this._client.stopContinuous();
    }
}
