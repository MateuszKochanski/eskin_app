import { configDotenv } from "dotenv";
import { Address } from "./Address";
import { ServoCommunicator } from "./communicators/ServoCommunicator";

configDotenv();

const servoCommunicator = ServoCommunicator.getInstance();

let a = true;
let pos = 0;
setInterval(() => {
    if (a) {
        servoCommunicator.setValue(parseInt(process.env.SERVO_2_ID, 10), Address.GoalPosition, 0);
        // servoCommunicator.setValue(9, Address.GoalPosition, 0);
        a = false;
    } else {
        servoCommunicator.setValue(parseInt(process.env.SERVO_2_ID, 10), Address.GoalPosition, 10);
        // servoCommunicator.setValue(9, Address.GoalPosition, 10);

        a = true;
    }
    // pos += 20;
}, 1000);

setInterval(() => {
    servoCommunicator.getValue(parseInt(process.env.SERVO_2_ID, 10), Address.PresentPosition, (data) => {
        console.log(`Position ${data}`);
    });
}, 10);
