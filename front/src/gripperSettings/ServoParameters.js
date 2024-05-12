import { Parameter } from "./Parameter";
import { SyncStatus } from "./SyncStatus";
import { useState } from "react";

export function ServoParameters({ paremeters }) {
    const [filename, setFilename] = useState("data.json");
    const handleInputChange = (event) => {
        setFilename(event.target.value);
    };

    const start = () => {
        fetch("http://localhost:3002/start", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                filename: filename,
            }),
        })
            .then((resp) => {
                console.log(resp);
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className="servoParameters">
            <h1>Gripper settings</h1>
            <ul>
                {paremeters.map((parameter) => (
                    <Parameter parameter={parameter} />
                ))}
            </ul>
            <input className="filename" type="text" value={filename} onChange={handleInputChange} />
            <button className="parametersButton" onClick={start}>
                Start
            </button>
            {/* <SyncStatus status={true} /> */}
        </div>
    );
}
