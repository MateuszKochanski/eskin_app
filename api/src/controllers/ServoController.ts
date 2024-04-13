import { ServoCommunicator } from "../communicators/ServoCommunicator";

export class ServoController {
    private _communicator: ServoCommunicator;

    constructor() {
        this._communicator = ServoCommunicator.getInstance();
    }
    setPosition() {}

    getPosition() {}
}
