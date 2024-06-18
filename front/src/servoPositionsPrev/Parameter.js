export function Parameter({ parameter }) {
    // console.log(parameter.value);
    return (
        <li key={parameter.name}>
            <label className="parameterLabel">{parameter.name}</label>
            <label className="parameterValue">{parameter.value}</label>
        </li>
    );
}
