import { configDotenv } from "dotenv";
import { Controller } from "./Controller";
import { setupServos } from "./utils/setupServos";
import { HttpServer } from "./HttpServer";
import { Address } from "./enums/Address";
import { ServoCommunicator } from "./communicators/ServoCommunicator";

configDotenv();

// setupServos();
// new HttpServer();
ServoCommunicator.getInstance().getValue(11, Address.PresentPosition, () => {});

setInterval(() => {
    ServoCommunicator.getInstance().getValue(11, Address.PresentPosition, () => {});
}, 10000);
