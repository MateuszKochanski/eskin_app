import useWebSocket from "react-use-websocket";
import { useState } from "react";

import { EskinPreview } from "./eskinPrev/EskinPreview";
import { ServoParameters } from "./gripperSettings/ServoParameters";
import { Measurement } from "./measurement/Measurement";

export default function App() {
    const socketUrl = "ws://localhost:3001/";
    const [values, setValues] = useState([]);

    // const [servosParameters, setServosParameters] = useState([
    //     { name: "Speed", value: 0 },
    //     { name: "Max torque", value: 0 },
    //     { name: "Open position", value: 0 },
    //     { name: "Closed position", value: 0 },
    // ]);

    const [servosParameters, setServosParameters] = useState([
        { name: "Servo1 position", value: 0 },
        { name: "Servo2 position", value: 0 },
    ]);

    useWebSocket(socketUrl, {
        onOpen: () => console.log("Connected to WebSocket!"),
        onMessage: (msg) => {
            const data = JSON.parse(msg.data);
            setValues(data.eskin);
            setServosParameters([
                { name: "Servo1 position", value: data.servoPos1 },
                { name: "Servo2 position", value: data.servoPos2 },
            ]);
        },
        shouldReconnect: (closeEvent) => true,
    });

    return (
        <div className="app">
            <EskinPreview values={values} />
            <ServoParameters paremeters={servosParameters} />
            {/* <Measurement /> */}
        </div>
    );
}
