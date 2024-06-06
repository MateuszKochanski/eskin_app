import { useState } from "react";

export function Measurement() {
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
        <div className="measurement">
            <h1>Measurement</h1>
            <input className="filename" type="text" value={filename} onChange={handleInputChange} />
            <button className="parametersButton" onClick={start}>
                Start
            </button>
        </div>
    );
}
