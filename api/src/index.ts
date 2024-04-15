import { configDotenv } from "dotenv";
import { Address } from "./enums/Address";
import { ServoCommunicator } from "./communicators/ServoCommunicator";

configDotenv();

const servo1 = parseInt(process.env.SERVO_1_ID, 10);
const servo2 = parseInt(process.env.SERVO_2_ID, 10);

const servoCommunicator = ServoCommunicator.getInstance();

let a = true;
setTimeout(() => {
    servoCommunicator.setValue(servo1, Address.MovingSpeed, 100);
    servoCommunicator.setValue(servo2, Address.MovingSpeed, 100);

    // servoCommunicator.setValue(servo1, Address.LED, 0);

    setInterval(() => {
        if (a) {
            servoCommunicator.setValue(servo2, Address.GoalPosition, 0);
            servoCommunicator.setValue(servo1, Address.GoalPosition, 0);
            a = false;
        } else {
            servoCommunicator.setValue(servo2, Address.GoalPosition, 100);
            servoCommunicator.setValue(servo1, Address.GoalPosition, 100);
            a = true;
        }
    }, 1000);

    setInterval(() => {
        servoCommunicator.getValue(servo1, Address.PresentPosition, (data) => {
            console.log(`Position1 ${data}`);
        });
        servoCommunicator.getValue(servo2, Address.PresentPosition, (data) => {
            console.log(`Position2 ${data}`);
        });
    }, 10);
}, 1000);
