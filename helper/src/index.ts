import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { DataFrame, DataFrameArraySchema, DataFrameSchema } from "./schemas/DataFrameSchema";

const dataPath = "../api/results";

function getJsonFiles(dir: string, includes: string[] = [], excludes: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    const jsonFiles: string[] = [];
    files.forEach((file) => {
        if (
            fs.statSync(path.join(dir, file)).isFile() &&
            path.extname(file) === ".json" &&
            !includes.find((str) => !file.includes(str)) &&
            !excludes.find((str) => file.includes(str))
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

    headers.push(
        "timestamp",
        "time",
        "servoPos1",
        "servoPos2",
        "servo1CloseVal",
        "servo2CloseVal",
        "servoCloseVal",
        "servoLoad1",
        "servoLoad2",
        "eskin1Sum",
        "eskin2Sum"
    );

    addHeaders("eskin1", firstItem.eskin1);
    addHeaders("eskin2", firstItem.eskin2);

    const rows = data.map((item) => {
        const row: any[] = [];
        const { servo1CloseVal, servo2CloseVal, servoCloseVal } = calculateClosingValue(item);
        row.push(
            item.timestamp,
            item.timestamp - data[0].timestamp,
            item.servoPos1,
            item.servoPos2,
            servo1CloseVal,
            servo2CloseVal,
            servoCloseVal,
            item.servoLoad1,
            item.servoLoad2,
            calcSum(item.eskin1),
            calcSum(item.eskin2)
        );
        // row.push(servo1CloseVal, servo2CloseVal, servoCloseVal);
        item.eskin1.forEach((subArray) => subArray.forEach((value) => row.push(value)));
        item.eskin2.forEach((subArray) => subArray.forEach((value) => row.push(value)));
        return row;
    });

    const matrix = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(matrix);
    return worksheet;
}

function calculateError(data: DataFrame[]): DataFrame {
    const errorData = data.slice(0, 4);
    const errorSum: DataFrame = {
        eskin1: Array.from({ length: 9 }, () => Array(16).fill(0)),
        eskin2: Array.from({ length: 9 }, () => Array(16).fill(0)),
        servoPos1: 0,
        servoPos2: 0,
        servoLoad1: 0,
        servoLoad2: 0,
        timestamp: 0,
    };

    errorData.forEach((frame) => {
        frame.eskin1.forEach((row, rowIdx) => {
            row.forEach((cell, cellIdx) => {
                errorSum.eskin1[rowIdx][cellIdx] += cell;
            });
        });

        frame.eskin2.forEach((row, rowIdx) => {
            row.forEach((cell, cellIdx) => {
                errorSum.eskin2[rowIdx][cellIdx] += cell;
            });
        });
    });

    const error: DataFrame = {
        eskin1: Array.from({ length: 9 }, () => Array(16).fill(0)),
        eskin2: Array.from({ length: 9 }, () => Array(16).fill(0)),
        servoPos1: 0,
        servoPos2: 0,
        servoLoad1: 0,
        servoLoad2: 0,
        timestamp: 0,
    };

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 16; j++) {
            error.eskin1[i][j] = Math.floor(errorSum.eskin1[i][j] / errorData.length);
            error.eskin2[i][j] = Math.floor(errorSum.eskin2[i][j] / errorData.length);
        }
    }

    return error;
}

function removeError(data: DataFrame[], error: DataFrame): DataFrame[] {
    const result: DataFrame[] = [];
    data.forEach((frame) => {
        const newFrame = frame;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 16; j++) {
                newFrame.eskin1[i][j] = frame.eskin1[i][j] - error.eskin1[i][j];
                newFrame.eskin2[i][j] = frame.eskin2[i][j] - error.eskin2[i][j];

                if (newFrame.eskin1[i][j] < 0) newFrame.eskin1[i][j] = 0;
                if (newFrame.eskin2[i][j] < 0) newFrame.eskin2[i][j] = 0;
            }
        }
        result.push(newFrame);
    });
    return result;
}

// const errorData = readFile(path.join(dataPath, "pusty_v_1.json"));
// const error = calculateError(errorData);

function calculateClosingValue(frame: DataFrame): {
    servo1CloseVal: number;
    servo2CloseVal: number;
    servoCloseVal: number;
} {
    const servo1Open = 85;
    const servo1Close = 190;

    const servo2Open = 625;
    const servo2Close = 520;

    const servo1CloseVal = (frame.servoPos1 - servo1Open) / (servo1Close - servo1Open);
    const servo2CloseVal = (frame.servoPos2 - servo2Open) / (servo2Close - servo2Open);
    const servoCloseVal = servo1CloseVal + servo2CloseVal;
    return { servo1CloseVal, servo2CloseVal, servoCloseVal };
}

function createConfig() {
    const headers: string[] = [];

    headers.push("sheetname", "xColumn", "yColumn");

    const matrix = [
        headers,
        ["niebieska_s_5_v_1", "time", "eskin1Sum"],
        ["niebieska_s_5_v_2", "time", "eskin1Sum"],
        ["niebieska_s_5_v_3", "time", "eskin1Sum"],
        ["niebieska_s_5_v_4", "time", "eskin1Sum"],
        ["niebieska_s_5_v_5", "time", "eskin1Sum"],
        ["zolta_s_5_v_1", "time", "eskin1Sum"],
        ["zolta_s_5_v_2", "time", "eskin1Sum"],
        ["zolta_s_5_v_3", "time", "eskin1Sum"],
        ["zolta_s_5_v_4", "time", "eskin1Sum"],
        ["zolta_s_5_v_5", "time", "eskin1Sum"],
        ["niebieska_s_5_v_1", "time", "eskin2Sum"],
        ["niebieska_s_5_v_2", "time", "eskin2Sum"],
        ["niebieska_s_5_v_3", "time", "eskin2Sum"],
        ["niebieska_s_5_v_4", "time", "eskin2Sum"],
        ["niebieska_s_5_v_5", "time", "eskin2Sum"],
        ["zolta_s_5_v_1", "time", "eskin2Sum"],
        ["zolta_s_5_v_2", "time", "eskin2Sum"],
        ["zolta_s_5_v_3", "time", "eskin2Sum"],
        ["zolta_s_5_v_4", "time", "eskin2Sum"],
        ["zolta_s_5_v_5", "time", "eskin2Sum"],
        //
        ["niebieska_s_5_v_1", "servoCloseVal", "eskin1Sum"],
        ["niebieska_s_5_v_2", "servoCloseVal", "eskin1Sum"],
        ["niebieska_s_5_v_3", "servoCloseVal", "eskin1Sum"],
        ["niebieska_s_5_v_4", "servoCloseVal", "eskin1Sum"],
        ["niebieska_s_5_v_5", "servoCloseVal", "eskin1Sum"],
        ["zolta_s_5_v_1", "servoCloseVal", "eskin1Sum"],
        ["zolta_s_5_v_2", "servoCloseVal", "eskin1Sum"],
        ["zolta_s_5_v_3", "servoCloseVal", "eskin1Sum"],
        ["zolta_s_5_v_4", "servoCloseVal", "eskin1Sum"],
        ["zolta_s_5_v_5", "servoCloseVal", "eskin1Sum"],
        ["niebieska_s_5_v_1", "servoCloseVal", "eskin2Sum"],
        ["niebieska_s_5_v_2", "servoCloseVal", "eskin2Sum"],
        ["niebieska_s_5_v_3", "servoCloseVal", "eskin2Sum"],
        ["niebieska_s_5_v_4", "servoCloseVal", "eskin2Sum"],
        ["niebieska_s_5_v_5", "servoCloseVal", "eskin2Sum"],
        ["zolta_s_5_v_1", "servoCloseVal", "eskin2Sum"],
        ["zolta_s_5_v_2", "servoCloseVal", "eskin2Sum"],
        ["zolta_s_5_v_3", "servoCloseVal", "eskin2Sum"],
        ["zolta_s_5_v_4", "servoCloseVal", "eskin2Sum"],
        ["zolta_s_5_v_5", "servoCloseVal", "eskin2Sum"],
        // ["niebieska_s_5_v_1", "time", "eskin1_4_2"],
        // ["niebieska_s_5_v_2", "time", "eskin1_4_2"],
        // ["niebieska_s_5_v_3", "time", "eskin1_4_3"],
        // ["niebieska_s_5_v_4", "time", "eskin1_3_3"],
        // ["niebieska_s_5_v_5", "time", "eskin1_4_2"],
        // ["zolta_s_5_v_1", "time", "eskin1"],
        // ["zolta_s_5_v_2", "time", "eskin1"],
        // ["zolta_s_5_v_3", "time", "eskin1"],
        // ["zolta_s_5_v_4", "time", "eskin1"],
        // ["zolta_s_5_v_5", "time", "eskin1"],
        // ["niebieska_s_5_v_1", "time", "eskin2_4_2"],
        // ["niebieska_s_5_v_2", "time", "eskin2_4_2"],
        // ["niebieska_s_5_v_3", "time", "eskin2_4_3"],
        // ["niebieska_s_5_v_4", "time", "eskin2_3_3"],
        // ["niebieska_s_5_v_5", "time", "eskin2_4_2"],
        // ["zolta_s_5_v_1", "time", "eskin2"],
        // ["zolta_s_5_v_2", "time", "eskin2"],
        // ["zolta_s_5_v_3", "time", "eskin2"],
        // ["zolta_s_5_v_4", "time", "eskin2"],
        // ["zolta_s_5_v_5", "time", "eskin2"],
        // ["niebieska_s_5_v_1", "servoCloseVal", "eskin1_4_2"],
        // ["niebieska_s_5_v_2", "servoCloseVal", "eskin1_4_2"],
        // ["niebieska_s_5_v_3", "servoCloseVal", "eskin1_4_3"],
        // ["niebieska_s_5_v_4", "servoCloseVal", "eskin1_3_3"],
        // ["niebieska_s_5_v_5", "servoCloseVal", "eskin1_4_2"],
        // ["zolta_s_5_v_1", "servoCloseVal", "eskin1"],
        // ["zolta_s_5_v_2", "servoCloseVal", "eskin1"],
        // ["zolta_s_5_v_3", "servoCloseVal", "eskin1"],
        // ["zolta_s_5_v_4", "servoCloseVal", "eskin1"],
        // ["zolta_s_5_v_5", "servoCloseVal", "eskin1"],
        // ["niebieska_s_5_v_1", "servoCloseVal", "eskin2_4_2"],
        // ["niebieska_s_5_v_2", "servoCloseVal", "eskin2_4_2"],
        // ["niebieska_s_5_v_3", "servoCloseVal", "eskin2_4_3"],
        // ["niebieska_s_5_v_4", "servoCloseVal", "eskin2_3_3"],
        // ["niebieska_s_5_v_5", "servoCloseVal", "eskin2_4_2"],
        // ["zolta_s_5_v_1", "servoCloseVal", "eskin2"],
        // ["zolta_s_5_v_2", "servoCloseVal", "eskin2"],
        // ["zolta_s_5_v_3", "servoCloseVal", "eskin2"],
        // ["zolta_s_5_v_4", "servoCloseVal", "eskin2"],
        // ["zolta_s_5_v_5", "servoCloseVal", "eskin2"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(matrix);
    return worksheet;
}

function calcSum(eskin: number[][]): number {
    let sum: number = 0;
    for (let row of eskin) {
        for (let cell of row) sum += cell;
    }
    return sum;
}

const files = getJsonFiles(dataPath, ["s_5_"], ["top", "zarowka"]);
const workbook = XLSX.utils.book_new();

files.forEach((file) => {
    const data = readFile(file);
    const error = calculateError(data);
    const dataWithoutError = removeError(data, error);
    const workSheet = transformData(dataWithoutError);
    XLSX.utils.book_append_sheet(workbook, workSheet, path.basename(file, ".json"));
});

const config = createConfig();
XLSX.utils.book_append_sheet(workbook, config, "Config");

XLSX.writeFile(workbook, "results/all_results.xlsx");
console.log("Excel file created successfully!");
