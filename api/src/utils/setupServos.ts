import { Address } from "../enums/Address";
import { ServoCommunicator } from "../communicators/ServoCommunicator";

export const setupServos = () => {
    const servoCommunicator = ServoCommunicator.getInstance();

    servoCommunicator.setValue(
        parseInt(process.env.SERVO_1_ID, 10),
        Address.MovingSpeed,
        parseInt(process.env.SERVO_1_SPEED, 10)
    );

    servoCommunicator.setValue(
        parseInt(process.env.SERVO_2_ID, 10),
        Address.MovingSpeed,
        parseInt(process.env.SERVO_2_SPEED, 10)
    );
};
