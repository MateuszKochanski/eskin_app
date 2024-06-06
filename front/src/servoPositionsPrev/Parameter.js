export function Parameter({ parameter }) {
    // console.log(parameter.value);
    return (
        <li key={parameter.name}>
            <label className="parameterLabel">{parameter.name}</label>
            <input type="number" value={parameter.value} />
        </li>
    );
}
