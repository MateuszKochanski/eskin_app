import { Parameter } from "./Parameter";
import { SyncStatus } from "./SyncStatus";

export function ServoParameters({ paremeters }) {
  return (
    <div className="servoParameters">
      <h1>Gripper settings</h1>
      <ul>
        {paremeters.map((parameter) => (
          <Parameter parameter={parameter} />
        ))}
      </ul>
      <button className="parametersButton">Set parameters</button>
      <SyncStatus status={true} />
    </div>
  );
}
