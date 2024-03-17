export function Row({ y, values, detection }) {
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
