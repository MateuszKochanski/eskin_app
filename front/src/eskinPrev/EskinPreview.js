import { useState } from "react";
import { Matrix } from "./Matrix";
import "../switch.css";

export function EskinPreview({ values }) {
  const [detection, setDetection] = useState(false);
  function handleChange(asd) {
    setDetection(!detection);
  }

  return (
    <div className="eskinPreview">
      <h1>Eskin real-time preview</h1>
      <div className="setup">
        <label className="setupText">Detection Mode</label>
        <label className="switch">
          <input type="checkbox" checked={detection} onChange={handleChange} />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="matrix">
        <Matrix values={values} detection={detection} />
      </div>
    </div>
  );
}
