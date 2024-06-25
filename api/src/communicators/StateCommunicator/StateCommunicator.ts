import { Address } from "../../enums/Address";
import { Size } from "../../Size";
import { calcCKSM } from "../../utils/calcCKSM";
import { Instruction } from "../../enums/Instruction";
import { StmClient } from "../../StmClient";
import { EskinDataHandler } from "./EskinDataHandler";
import { ServosDataHandler } from "./ServosDataHandler";
import { Device } from "../../enums/Device";
import { DataFrame } from "../../schemas/DataFrameSchema";

export class StateCommunicator {
    private static _instance: StateCommunicator;
    private _client: StmClient;
    private _eskinDataHandler: EskinDataHandler;
    private _servosDataHandler: ServosDataHandler;

    private constructor() {
        this._client = StmClient.getInstance();
        this._eskinDataHandler = new EskinDataHandler();
        this._servosDataHandler = new ServosDataHandler();
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

        let servoReq3 = [servoId1, length, Instruction.Read, Address.PresentLoad, Size.get(Address.PresentLoad)];
        servoReq3.push(calcCKSM(servoReq3));
        servoReq3 = [255, 255].concat(servoReq3);

        let servoReq4 = [servoId2, length, Instruction.Read, Address.PresentLoad, Size.get(Address.PresentLoad)];
        servoReq4.push(calcCKSM(servoReq4));
        servoReq4 = [255, 255].concat(servoReq4);

        this._client.startContinuous([servoReq1, servoReq2, servoReq3, servoReq4], (data) => {
            const device = data.shift();
            switch (device) {
                case Device.Servo:
                    this._servosDataHandler.handleData(data);
                    break;
                case Device.Eskin:
                    this._eskinDataHandler.handleData(data);
                    break;
                default:
                    break;
            }
            if (this._eskinDataHandler.dataReady()) {
                const eskinData = this._eskinDataHandler.data;
                const servoData = this._servosDataHandler.data;
                callback({ ...eskinData, ...servoData, timestamp: Date.now() });
            }
        });
    }

    stop() {
        this._client.stopContinuous();
    }
}
