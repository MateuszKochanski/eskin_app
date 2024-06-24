import { DataRecorder } from "./DataRecorder";
import { FrontCommunicator } from "./FrontCommunicator";
import { ServoCommunicator } from "./communicators/ServoCommunicator";
import { StateCommunicator } from "./communicators/StateCommunicator/StateCommunicator";
import { Address } from "./enums/Address";
import { isCloseTo } from "./utils/isCloseTo";
import { StartReq } from "./schemas/StartReqSchema";
import { DataFrame } from "DataFrame";

export class Controller {
    private static _instance: Controller;
    private _servoCommunicator: ServoCommunicator;
    private _stateCommunicator: StateCommunicator;
    private _servoId1 = parseInt(process.env.SERVO_1_ID, 10);
    private _servoId2 = parseInt(process.env.SERVO_2_ID, 10);
    private _recordData: boolean = false;
    private _dataRecorder: DataRecorder;
    private _frontCommunicator: FrontCommunicator;
    private _currentFrame: DataFrame;
    private _maxTorque: number;
    private _torqueLimit: number;

    private constructor() {
        this._servoCommunicator = ServoCommunicator.getInstance();
        this._stateCommunicator = StateCommunicator.getInstance();
        this._dataRecorder = new DataRecorder(process.env.RECORD_DATA_FILENAME);
        this._frontCommunicator = FrontCommunicator.getInstance();
        this._maxTorque = parseInt(process.env.SERVO_MAX_TORQUE);
        this._torqueLimit = parseInt(process.env.SERVO_TORQUE_LIMIT);
        this._initServos();
        this._read();
    }

    private _initServos() {
        this._servoCommunicator.setValue(this._servoId1, Address.MaxTorque, this._maxTorque);
        this._servoCommunicator.setValue(this._servoId2, Address.MaxTorque, this._maxTorque);
        this._servoCommunicator.setValue(this._servoId1, Address.TorqueLimit, this._torqueLimit);
        this._servoCommunicator.setValue(this._servoId2, Address.TorqueLimit, this._torqueLimit);
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

    private async _openPosition() {
        return this._setPositions(
            parseInt(process.env.SERVO_1_OPEN_POSITION),
            parseInt(process.env.SERVO_2_OPEN_POSITION),
            parseInt(process.env.SERVO_OPEN_SPEED),
            parseInt(process.env.SERVO_OPEN_SPEED)
        );
    }

    private async _closePosition() {
        return this._setPositions(
            parseInt(process.env.SERVO_1_CLOSE_POSITION),
            parseInt(process.env.SERVO_2_CLOSE_POSITION),
            parseInt(process.env.SERVO_CLOSE_SPEED),
            parseInt(process.env.SERVO_CLOSE_SPEED)
        );
    }

    private async _setPositions(servo1Pos: number, servo2Pos: number, servo1Speed: number, servo2Speed: number) {
        this._servoCommunicator.setValue(this._servoId1, Address.MovingSpeed, servo1Speed);
        this._servoCommunicator.setValue(this._servoId2, Address.MovingSpeed, servo2Speed);
        this._servoCommunicator.setValue(this._servoId1, Address.GoalPosition, servo1Pos);
        this._servoCommunicator.setValue(this._servoId2, Address.GoalPosition, servo2Pos);
        return new Promise((resolve) => {
            const i = setInterval(() => {
                if (!this._currentFrame) return;
                if (
                    (isCloseTo(servo1Pos, this._currentFrame.servoPos1, 5) &&
                        isCloseTo(servo2Pos, this._currentFrame.servoPos2, 5)) ||
                    isCloseTo(this._torqueLimit, this._currentFrame.servoLoad1, 100) ||
                    isCloseTo(this._torqueLimit, this._currentFrame.servoLoad2, 100)
                ) {
                    clearInterval(i);
                    resolve(undefined);
                }
            }, 100);
        });
    }

    private async _wait(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(undefined);
            }, ms);
        });
    }

    private _startReading(data: StartReq) {
        this._dataRecorder.init(data!.filename);
        this._recordData = true;
    }

    private _stopReading() {
        this._recordData = false;
        this._dataRecorder.save();
    }

    private _read() {
        this._stateCommunicator.start(this._servoId1, this._servoId2, (data) => {
            this._emit(data);
        });
    }

    private _emit(data: DataFrame) {
        this._currentFrame = data;

        this._frontCommunicator.send(data);
        if (this._recordData) this._dataRecorder.add(data);
    }
}
