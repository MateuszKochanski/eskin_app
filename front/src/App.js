import useWebSocket from "react-use-websocket";
import { useState } from "react";
import "./switch.css";

export default function App() {
  const socketUrl = "ws://localhost:3001/";
  const [values, setValues] = useState([]);
  const [detection, setDetection] = useState(false);
  const [servosParameters, setServosParameters] = useState([
    { name: "speed", value: 0 },
    { name: "maxTorque", value: 0 },
    { name: "openPosition", value: 0 },
    { name: "closedPosition", value: 0 },
  ]);

  useWebSocket(socketUrl, {
    onOpen: () => console.log("Connected to WebSocket!"),
    onMessage: (msg) => {
      setValues(JSON.parse(msg.data));
    },
    shouldReconnect: (closeEvent) => true,
  });

  function handleChange(asd) {
    setDetection(!detection);
  }

  return (
    <div className="app">
      <div className="setup">
        <label className="switch">
          <input type="checkbox" checked={detection} onChange={handleChange} />
          <span className="slider round"></span>
        </label>
        <label className="setupText">Detection Mode</label>
      </div>

      <div className="matrix">
        <Matrix values={values} detection={detection} />
      </div>
      <>
        <ServoParameters paremeters={servosParameters} />
      </>
    </div>
  );
}

function ServoParameters({ paremeters }) {
  // const paremeters = ["speed", "max torque", "open position", "close position"];

  return paremeters.map((parameter) => <li>{parameter.name}</li>);
}

function Parameter({ parameter }) {
  return (
    <dev>
      <label title="123" />
    </dev>
  );
}

function Matrix({ values, detection }) {
  const yValues = detection
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    : [0, 15, 14, 13, 12, 11, 10, 9, 8];

  return yValues.map((y) => (
    <div key={y} className="row">
      <Row y={y} values={values} detection={detection} />
    </div>
  ));
}

function Row({ y, values, detection }) {
  const xValues = detection
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    : [7, 10, 4, 0, 1, 2, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15];

  return xValues.map((x) => {
    const id = calcId(x, y);
    return sensorExist(x, y, detection) ? (
      <button
        key={id}
        className="sensor"
        style={{
          backgroundColor: `rgba(${values[id] ? values[id] : 0}, ${values[id] ? 200 - values[id] : 200}, 0, 0.8)`,
        }}
      >
        {id}
      </button>
    ) : (
      <button key={id} className="break">
        {id}
      </button>
    );
  });
}

function calcId(x, y) {
  return 16 * y + x;
}

function sensorExist(x, y, detection) {
  const xBreak = [7, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15];
  const yBreak = [8, 9, 10, 14, 15, 0];

  return detection || !(xBreak.includes(x) && yBreak.includes(y));
}
