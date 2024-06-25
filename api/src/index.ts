import { configDotenv } from "dotenv";
import { HttpServer } from "./HttpServer";

configDotenv();

new HttpServer();
