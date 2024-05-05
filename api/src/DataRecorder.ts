import fs from "fs";
import { DataFrame, DataFrameArraySchema } from "./schemas/DataFrameSchema";

export class DataRecorder {
    private _filename: string;
    private _data: DataFrame[];
    constructor(filename: string) {
        this._data = [];
        this._filename = filename;
        fs.writeFileSync(filename, "[]");
    }

    add(newData: DataFrame) {
        this._data.push(newData);
    }

    save() {
        fs.writeFileSync(this._filename, JSON.stringify(this._data));
    }
}