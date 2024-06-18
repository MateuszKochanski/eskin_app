import { configDotenv } from "dotenv";
import { Controller } from "./Controller";
import { setupServos } from "./utils/setupServos";
import { HttpServer } from "./HttpServer";
import { Address } from "./enums/Address";
import { ServoCommunicator } from "./communicators/ServoCommunicator";
import { StateCommunicator } from "./communicators/StateCommunicator";

configDotenv();

// setupServos();
new HttpServer();

// ServoCommunicator.getInstance().getValue(11, Address.PresentPosition, () => {});

// setInterval(() => {
//     ServoCommunicator.getInstance().getValue(11, Address.PresentPosition, () => {});
// }, 1000);

// setInterval(() => {
//     ServoCommunicator.getInstance().setValue(9, Address.GoalPosition, 100);
//     ServoCommunicator.getInstance().setValue(11, Address.GoalPosition, 100);
// }, 1000);

// StateCommunicator.getInstance().start(11, 9, (data) => {
//     // console.log(data);
// });

// setTimeout(() => {
//     StateCommunicator.getInstance().stop();
// }, 5000);
