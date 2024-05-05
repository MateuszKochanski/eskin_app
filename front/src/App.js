import useWebSocket from "react-use-websocket";
import { useState } from "react";

import { EskinPreview } from "./eskinPrev/EskinPreview";
import { ServoParameters } from "./gripperSettings/ServoParameters";
import { Measurement } from "./measurement/Measurement";

export default function App() {
    const socketUrl = "ws://localhost:3001/";
    const [values, setValues] = useState([]);

    const [servosParameters, setServosParameters] = useState([
        { name: "Speed", value: 0 },
        { name: "Max torque", value: 0 },
        { name: "Open position", value: 0 },
        { name: "Closed position", value: 0 },
    ]);

    useWebSocket(socketUrl, {
        onOpen: () => console.log("Connected to WebSocket!"),
        onMessage: (msg) => {
            setValues(JSON.parse(msg.data.eskin));
        },
        shouldReconnect: (closeEvent) => true,
    });

    return (
        <div className="app">
            <EskinPreview values={values} />
            <ServoParameters paremeters={servosParameters} />
            <Measurement />
        </div>
    );
}
