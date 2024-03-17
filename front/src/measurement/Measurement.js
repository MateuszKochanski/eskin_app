export function Measurement() {
  return (
    <div className="measurement">
      <h1>Measurement</h1>
      <div className="measurement-container">
        <button className="measurement-button" style={{ marginRight: "10px" }}>
          Start
        </button>
        <button className="measurement-button" style={{ marginLeft: "10px" }}>
          Abort
        </button>
      </div>
      <progress className="measurement-progress" value={0.5} />
    </div>
  );
}
