export function Row({ y, values, detection }) {
    const xValues = detection
        ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        : [9, 8, 10, 7, 11, 6, 12, 5, 13, 4, 14, 3, 15, 2, 0, 1];

    return xValues.map((x) => {
        const id = calcId(x, y);
        return sensorExist(x, y, detection) ? (
            <button
                key={id}
                className="sensor"
                style={{
                    backgroundColor: `rgba(${values[id] ? values[id] : 0}, ${
                        values[id] ? 200 - values[id] : 200
                    }, 0, 0.8)`,
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
    const xBreak = [9, 12, 5, 13, 4, 14, 3, 15, 2, 0, 1];
    const yBreak = [10, 7, 4, 6, 3, 0];

    return detection || !(xBreak.includes(x) && yBreak.includes(y));
}
