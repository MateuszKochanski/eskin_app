export function Parameter({ parameter }) {
  return (
    <li key={parameter.name}>
      <label className="parameterLabel">{parameter.name}</label>
      <input type="number" defaultValue={parameter.value} />
    </li>
  );
}
