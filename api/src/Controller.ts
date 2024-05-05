import { FrontCommunicator } from "./FrontCommunicator";
import { EskinCommunicator } from "./communicators/ESkinCommunicator";
import { ServoCommunicator } from "./communicators/ServoCommunicator";
import { Address } from "./enums/Address";
import { DataFrame } from "./schemas/DataFrameSchema";

export class Controller {
    static _instance: Controller;
    private _interval: NodeJS.Timeout | undefined;
    private _delay = 100;
    private _eskinCommunicator: EskinCommunicator;
    private _servoCommunicator: ServoCommunicator;
    private _servoId1 = parseInt(process.env.SERVO_1_ID, 10);
    private _servoId2 = parseInt(process.env.SERVO_2_ID, 10);
    private _RecordData: boolean = false;

    private constructor() {
        this._eskinCommunicator = EskinCommunicator.getInstance();
        this._servoCommunicator = ServoCommunicator.getInstance();
    }

    static getInstance() {
        if (!this._instance) this._instance = new Controller();
        return this._instance;
    }

    startReading() {
        this._read();
    }

    stopReading() {
        clearInterval(this._interval);
        this._interval = undefined;
    }

    private _read() {
        this._interval = setInterval(() => {
            this._servoCommunicator.getValue(this._servoId2, Address.PresentPosition, (value) => {
                // this._servoCommunicator.getValue(this.servoId2, Address.PresentPosition, (value) => {
                this._eskinCommunicator.getData((eskinData) => {
                    const data: DataFrame = {
                        eskin: eskinData,
                        servoPos1: 0,
                        servoPos2: value,
                        timestamp: Date.now(),
                    };
                    this._emit(data);
                });
                // });
            });
        }, this._delay);
    }

    private _emit(data: DataFrame) {
        FrontCommunicator.getInstance().send(data);
    }
}
