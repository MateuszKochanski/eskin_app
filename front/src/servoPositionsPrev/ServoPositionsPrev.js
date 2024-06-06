import { Parameter } from "./Parameter";

export function ServoPositionsPrev({ paremeters }) {
    return (
        <div className="servoParameters">
            <h1>Servo positions</h1>
            <ul>
                {paremeters.map((parameter) => (
                    <Parameter parameter={parameter} />
                ))}
            </ul>
        </div>
    );
}
