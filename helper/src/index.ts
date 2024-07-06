import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { DataFrame, DataFrameArraySchema, DataFrameSchema } from "./schemas/DataFrameSchema";

const dataPath = "../api/results";

function getJsonFiles(dir: string, startWith: string = ""): string[] {
    const files = fs.readdirSync(dir);
    const jsonFiles: string[] = [];
    files.forEach((file) => {
        if (
            fs.statSync(path.join(dir, file)).isFile() &&
            path.extname(file) === ".json" &&
            file.startsWith(startWith)
        ) {
            jsonFiles.push(path.join(dir, file));
        }
    });
    return jsonFiles;
}

function readFile(filePath: string): DataFrame[] {
    const dataBuffer = fs.readFileSync(filePath).toString();
    const jsonData = JSON.parse(dataBuffer);
    return DataFrameArraySchema.parse(jsonData);
}

function transformData(data: DataFrame[]): XLSX.WorkSheet {
    if (data.length === 0) {
        return [];
    }

    const firstItem = data[0];
    const headers: string[] = [];

    const addHeaders = (prefix: string, array: number[][]) => {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                headers.push(`${prefix}_${i}_${j}`);
            }
        }
    };

    addHeaders("eskin1", firstItem.eskin1);
    addHeaders("eskin2", firstItem.eskin2);
    headers.push("servoPos1", "servoPos2", "servoLoad1", "servoLoad2", "timestamp");

    const rows = data.map((item) => {
        const row: any[] = [];
        item.eskin1.forEach((subArray) => subArray.forEach((value) => row.push(value)));
        item.eskin2.forEach((subArray) => subArray.forEach((value) => row.push(value)));
        row.push(item.servoPos1, item.servoPos2, item.servoLoad1, item.servoLoad2, item.timestamp);
        return row;
    });

    const matrix = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(matrix);
    return worksheet;
}

const files = getJsonFiles(dataPath);
const workbook = XLSX.utils.book_new();

files.forEach((file) => {
    // console.log(path.basename(file, ".json"));
    const data = readFile(file);
    const workSheet = transformData(data);
    XLSX.utils.book_append_sheet(workbook, workSheet, path.basename(file, ".json"));
});

XLSX.writeFile(workbook, "all_results.xlsx");
console.log("Excel file created successfully!");
