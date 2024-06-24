export function Row({ values, rowIdx }) {
    // const xValues = detection
    //     ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    //     : [9, 8, 10, 7, 11, 6, 12, 5, 13, 4, 14, 3, 15, 2, 0, 1];

    return values.map((value, idx) => {
        return sensorExist(idx, rowIdx) ? (
            <button
                key={idx}
                className="sensor"
                style={{
                    backgroundColor: `rgba(${value ? value : 0}, ${value ? 200 - value : 200}, 0, 0.8)`,
                }}
            >
                {value}
            </button>
        ) : (
            <button key={idx} className="break">
                {value}
            </button>
        );
    });
}

function sensorExist(x, y, detection = false) {
    const xBreak = [0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const yBreak = [0, 1, 2, 6, 7, 8];

    return detection || !(xBreak.includes(x) && yBreak.includes(y));
}
