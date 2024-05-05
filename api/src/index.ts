import { configDotenv } from "dotenv";
import { Address } from "./enums/Address";
import { ServoCommunicator } from "./communicators/ServoCommunicator";
import { EskinCommunicator } from "./communicators/ESkinCommunicator";
import { DataRecorder } from "./DataRecorder";
import { DataFrame, DataFrameArraySchema, DataFrameSchema } from "./schemas/DataFrameSchema";

configDotenv();

const servoCommunicator = ServoCommunicator.getInstance();
const eskinCommunicator = EskinCommunicator.getInstance();

// servoCommunicator.setValue(servo1, Address.MovingSpeed, 100);
// servoCommunicator.setValue(servo2, Address.MovingSpeed, 100);

// setInterval(() => {
//     if (a) {
//         servoCommunicator.setValue(servo2, Address.GoalPosition, 0);
//         servoCommunicator.setValue(servo1, Address.GoalPosition, 0);
//         a = false;
//     } else {
//         servoCommunicator.setValue(servo2, Address.GoalPosition, 100);
//         servoCommunicator.setValue(servo1, Address.GoalPosition, 100);
//         a = true;
//     }
// }, 1000);

// servoCommunicator.setValue(servo1, Address.GoalPosition, 0);
// servoCommunicator.setValue(servo2, Address.GoalPosition, 100);

// servoCommunicator.getValue(servo2, Address.PresentPosition, (data) => {
//     console.log(`Position1 ${data}`);
// });

const dataRecorder = new DataRecorder(process.env.RECORD_DATA_FILENAME);

let i = 0;

const interval = setInterval(() => {
    const start = Date.now();
    i++;
    if (i % 100 === 0) console.log(i / 100);
    // if (i > 1000) {
    //     clearInterval(interval);
    //     dataRecorder.save();
    //     console.log("done");
    // }
    // const data: DataFrame = {
    //     eskin: [
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    //         255, 255, 255, 255,
    //     ],
    //     servoPos1: 255,
    //     servoPos2: 255,
    //     timestamp: Date.now(),
    // };

    // dataRecorder.add(data);
}, 10);
