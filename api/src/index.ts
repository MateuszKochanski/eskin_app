import { configDotenv } from "dotenv";
import { Controller } from "./Controller";
import { setupServos } from "./func/setupServos";
import { HttpServer } from "./HttpServer";

configDotenv();

setupServos();

// Controller.getInstance().startReading();

// setTimeout(() => {
//     Controller.getInstance().stopReading();
//     console.log("done");
// }, 10000);

new HttpServer();
