import { Row } from "./Row";

export function Matrix({ values }) {
    // const yValues = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    return values.map((row, idx) => (
        <div key={idx} className="row">
            <Row values={row} rowIdx={idx} />
        </div>
    ));
}
