import { DataRecorder } from "./DataRecorder";
import { FrontCommunicator } from "./FrontCommunicator";
import { EskinCommunicator } from "./communicators/ESkinCommunicator";
import { ServoCommunicator } from "./communicators/ServoCommunicator";
import { StateCommunicator } from "./communicators/StateCommunicator";
import { Address } from "./enums/Address";
import { isCloseTo } from "./func/isCloseTo";
import { DataFrame } from "./schemas/DataFrameSchema";
import { StartReq } from "./schemas/StartReqSchema";

export class Controller {
    private static _instance: Controller;
    private _interval: NodeJS.Timeout | undefined;
    private _delay = 100;
    private _eskinCommunicator: EskinCommunicator;
    private _servoCommunicator: ServoCommunicator;
    private _stateCommunicator: StateCommunicator;
    private _servoId1 = parseInt(process.env.SERVO_1_ID, 10);
    private _servoId2 = parseInt(process.env.SERVO_2_ID, 10);
    private _recordData: boolean = false;
    private _dataRecorder: DataRecorder;
    private _frontCommunicator: FrontCommunicator;
    private _servo1CurrentPosition: number = -1;
    private _servo2CurrentPosition: number = -1;

    private constructor() {
        this._eskinCommunicator = EskinCommunicator.getInstance();
        this._servoCommunicator = ServoCommunicator.getInstance();
        this._stateCommunicator = StateCommunicator.getInstance();
        this._dataRecorder = new DataRecorder(process.env.RECORD_DATA_FILENAME);
        this._frontCommunicator = FrontCommunicator.getInstance();
        this._read();
    }

    static getInstance() {
        if (!this._instance) this._instance = new Controller();
        return this._instance;
    }

    async start(data: StartReq) {
        await this._openPosition();
        this._startReading(data);
        await this._closePosition();
        await this._wait(1000);
        this._stopReading();
        await this._openPosition();
    }

    async _openPosition() {
        return this._setPositions(
            parseInt(process.env.SERVO_1_OPEN_POSITION),
            parseInt(process.env.SERVO_2_OPEN_POSITION),
            parseInt(process.env.SERVO_1_OPEN_SPEED),
            parseInt(process.env.SERVO_2_OPEN_SPEED)
        );
    }

    async _closePosition() {
        return this._setPositions(
            parseInt(process.env.SERVO_1_CLOSE_POSITION),
            parseInt(process.env.SERVO_2_CLOSE_POSITION),
            parseInt(process.env.SERVO_1_CLOSE_SPEED),
            parseInt(process.env.SERVO_2_CLOSE_SPEED)
        );
    }

    async _setPositions(servo1Pos: number, servo2Pos: number, servo1Speed: number, servo2Speed: number) {
        this._servoCommunicator.setValue(this._servoId1, Address.MovingSpeed, servo1Speed);
        this._servoCommunicator.setValue(this._servoId2, Address.MovingSpeed, servo2Speed);
        this._servoCommunicator.setValue(this._servoId1, Address.GoalPosition, servo1Pos);
        this._servoCommunicator.setValue(this._servoId2, Address.GoalPosition, servo2Pos);
        return new Promise((resolve) => {
            const i = setInterval(() => {
                if (isCloseTo(servo2Pos, this._servo2CurrentPosition, 3)) {
                    clearInterval(i);
                    resolve(undefined);
                }
            }, 100);
        });
    }

    async _wait(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(undefined);
            }, ms);
        });
    }

    private _startReading(data: StartReq) {
        this._dataRecorder.init(data!.filename);
        this._recordData = true;
        setTimeout(() => {
            this._stopReading();
        }, 5000);
    }

    private _stopReading() {
        this._recordData = false;
        this._dataRecorder.save();
    }

    private _read() {
        this._interval = setInterval(() => {
            let start = Date.now();
            this._stateCommunicator.getData(this._servoId1, this._servoId2, (data) => {
                const newTime = Date.now();
                start = newTime;
                this._emit(data);
            });
        }, this._delay);
    }

    private _emit(data: DataFrame) {
        if (data.servoPos1 !== -1) this._servo1CurrentPosition = data.servoPos1;
        if (data.servoPos2 !== -1) this._servo2CurrentPosition = data.servoPos2;

        this._frontCommunicator.send(data);
        if (this._recordData) this._dataRecorder.add(data);
    }
}
