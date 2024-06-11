import express from "express";
import cors from "cors";
import { StartReqSchema } from "./schemas/StartReqSchema";
import { Controller } from "./Controller";

export class HttpServer {
    private _app;
    private _port = 3002;
    private _controller: Controller;

    constructor() {
        this._controller = Controller.getInstance();

        this._app = express();
        this._app.use(cors());
        this._app.use(express.json());
        this._app.listen(this._port, () => {
            console.log(`HTTP server listening on port ${this._port}`);
        });

        this._app.post("/start", (req, res) => {
            const data = req.body;
            console.log(data);
            const result = StartReqSchema.safeParse(data);
            if (!result.success) {
                res.sendStatus(404);
                return;
            }
            const reqData = result.data;
            this._controller.start(reqData);
            res.sendStatus(200);
        });
    }
}
