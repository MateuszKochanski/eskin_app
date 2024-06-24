import useWebSocket from "react-use-websocket";
import { useEffect, useState } from "react";

import { EskinPreview } from "./eskinPrev/EskinPreview";
import { ServoPositionsPrev } from "./servoPositionsPrev/ServoPositionsPrev";
import { Measurement } from "./measurement/Measurement";

export default function App() {
    const socketUrl = "ws://localhost:3001/";
    const [eskin1, setEskin1] = useState([[]]);
    const [eskin2, setEskin2] = useState([[]]);

    useEffect(() => {
        const defaultRow = new Array(16).fill(0);
        const defaultData = new Array(9).fill(defaultRow);
        setEskin1(defaultData);
        setEskin2(defaultData);
    }, []);

    const [servosParameters, setServosParameters] = useState([
        { name: "Servo 1 position:", value: 0 },
        { name: "Servo 2 position:", value: 0 },
        { name: "Servo 1 load:", value: 0 },
        { name: "Servo 2 load:", value: 0 },
    ]);

    useWebSocket(socketUrl, {
        onOpen: () => console.log("Connected to WebSocket!"),
        onMessage: (msg) => {
            const data = JSON.parse(msg.data);
            setEskin1(data.eskin1);
            setEskin2(data.eskin2);
            setServosParameters([
                { name: "Servo 1 position:", value: data.servoPos1 },
                { name: "Servo 2 position:", value: data.servoPos2 },
                { name: "Servo 1 load:", value: data.servoLoad1 },
                { name: "Servo 2 load:", value: data.servoLoad2 },
            ]);
        },
        shouldReconnect: (closeEvent) => true,
    });

    return (
        <div className="app">
            <EskinPreview values={eskin1} name={"Left finger eskin preview"} />
            <EskinPreview values={eskin2} name={"Right finger eskin preview"} />
            <ServoPositionsPrev paremeters={servosParameters} />
            <Measurement />
        </div>
    );
}
