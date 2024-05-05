import { Row } from "./Row";

export function Matrix({ values, detection }) {
    const yValues = detection ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] : [0, 3, 6, 9, 12, 1, 4, 7, 10];

    return yValues.map((y) => (
        <div key={y} className="row">
            <Row y={y} values={values} detection={detection} />
        </div>
    ));
}
