import { DataFrame } from "./schemas/DataFrameSchema";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 3001,
});

export class FrontCommunicator {
    private static _instance: FrontCommunicator;

    private constructor() {
        wss.on("connection", (ws) => {
            console.log("WSS connected!");
            ws.on("close", () => {
                console.log("WSS disconnected");
            });
        });
    }

    static getInstance() {
        if (!FrontCommunicator._instance) FrontCommunicator._instance = new FrontCommunicator();
        return FrontCommunicator._instance;
    }

    send(data: DataFrame) {
        wss.clients.forEach((client) => {
            client.send(JSON.stringify(data));
        });
    }
}
