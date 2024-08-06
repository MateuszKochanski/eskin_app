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
        "eskin2Sum",
        "eskin1XCenter",
        "eskin1YCenter",
        "eskin2XCenter",
        "eskin2YCenter",
        "eskin1CenterValue",
        "eskin2CenterValue",
        "eskin1XMaxValue",
        "eskin1YMassValue",
        "eskin2XMaxValue",
        "eskin2YMaxValue",
        "eskin1MaxValue",
        "eskin2MaxValue",
        "eskin1AreaIndex",
        "eskin2AreaIndex"
    );

    addHeaders("eskin1", firstItem.eskin1);
    addHeaders("eskin2", firstItem.eskin2);

    const eskin1lastFrameMassCenter = findCenterOfMass(data.at(-1)!.eskin1);
    const eskin2lastFrameMassCenter = findCenterOfMass(data.at(-1)!.eskin2);

    const rows = data.map((item) => {
        const row: any[] = [];
        const { servo1CloseVal, servo2CloseVal, servoCloseVal } = calculateClosingValue(item);
        const eskin1Center = findCenterOfMass(item.eskin1);
        const eskin2Center = findCenterOfMass(item.eskin2);
        const eskin1CenterValue =
            item.eskin1[Math.round(eskin1lastFrameMassCenter.y)][Math.round(eskin1lastFrameMassCenter.x)];
        const eskin2CenterValue =
            item.eskin2[Math.round(eskin2lastFrameMassCenter.y)][Math.round(eskin2lastFrameMassCenter.x)];

        const eskin1MaxValuePos = findMaxValuePosition(item.eskin1);
        const eskin2MaxValuePos = findMaxValuePosition(item.eskin2);
        const eskin1MaxValue = item.eskin1[Math.round(eskin1MaxValuePos.y)][eskin1MaxValuePos.x];
        const eskin2MaxValue = item.eskin2[Math.round(eskin2MaxValuePos.y)][eskin2MaxValuePos.x];

        const eskin1AreaIndex = calcAreaIndex(item.eskin1);
        const eskin2AreaIndex = calcAreaIndex(item.eskin2);

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
            calcSum(item.eskin2),
            eskin1Center.x,
            eskin1Center.y,
            eskin2Center.x,
            eskin2Center.y,
            eskin1CenterValue,
            eskin2CenterValue,
            eskin1MaxValuePos.x,
            eskin1MaxValuePos.y,
            eskin2MaxValuePos.x,
            eskin2MaxValuePos.y,
            eskin1MaxValue,
            eskin2MaxValue,
            eskin1AreaIndex,
            eskin2AreaIndex
        );
        item.eskin1.forEach((subArray) => subArray.forEach((value) => row.push(value)));
        item.eskin2.forEach((subArray) => subArray.forEach((value) => row.push(value)));
        return row;
    });

    const matrix = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(matrix);
    return worksheet;
}

function calculateError(data: DataFrame[]): DataFrame {
    const errorData = data.slice(0, -5);
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

                // if (newFrame.eskin1[i][j] < 0) newFrame.eskin1[i][j] = 0;
                // if (newFrame.eskin2[i][j] < 0) newFrame.eskin2[i][j] = 0;
            }
        }
        result.push(newFrame);
    });
    return result;
}

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
        ["zarowka_s_5_v_1", "time", "eskin1Sum"],
        ["zarowka_s_5_v_2", "time", "eskin1Sum"],
        ["zarowka_s_5_v_3", "time", "eskin1Sum"],
        ["zarowka_s_5_v_4", "time", "eskin1Sum"],
        ["zarowka_s_5_v_5", "time", "eskin1Sum"],
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
        ["zarowka_s_5_v_1", "time", "eskin2Sum"],
        ["zarowka_s_5_v_2", "time", "eskin2Sum"],
        ["zarowka_s_5_v_3", "time", "eskin2Sum"],
        ["zarowka_s_5_v_4", "time", "eskin2Sum"],
        ["zarowka_s_5_v_5", "time", "eskin2Sum"],
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
        ["zarowka_s_5_v_1", "servoCloseVal", "eskin1Sum"],
        ["zarowka_s_5_v_2", "servoCloseVal", "eskin1Sum"],
        ["zarowka_s_5_v_3", "servoCloseVal", "eskin1Sum"],
        ["zarowka_s_5_v_4", "servoCloseVal", "eskin1Sum"],
        ["zarowka_s_5_v_5", "servoCloseVal", "eskin1Sum"],
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
        ["zarowka_s_5_v_1", "servoCloseVal", "eskin2Sum"],
        ["zarowka_s_5_v_2", "servoCloseVal", "eskin2Sum"],
        ["zarowka_s_5_v_3", "servoCloseVal", "eskin2Sum"],
        ["zarowka_s_5_v_4", "servoCloseVal", "eskin2Sum"],
        ["zarowka_s_5_v_5", "servoCloseVal", "eskin2Sum"],
        //
        ["niebieska_s_5_v_1", "time", "eskin1XCenter"],
        ["niebieska_s_5_v_2", "time", "eskin1XCenter"],
        ["niebieska_s_5_v_3", "time", "eskin1XCenter"],
        ["niebieska_s_5_v_4", "time", "eskin1XCenter"],
        ["niebieska_s_5_v_5", "time", "eskin1XCenter"],
        ["zolta_s_5_v_1", "time", "eskin1XCenter"],
        ["zolta_s_5_v_2", "time", "eskin1XCenter"],
        ["zolta_s_5_v_3", "time", "eskin1XCenter"],
        ["zolta_s_5_v_4", "time", "eskin1XCenter"],
        ["zolta_s_5_v_5", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_1", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_2", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_3", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_4", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_5", "time", "eskin1XCenter"],
        ["niebieska_s_5_v_1", "time", "eskin2XCenter"],
        ["niebieska_s_5_v_2", "time", "eskin2XCenter"],
        ["niebieska_s_5_v_3", "time", "eskin2XCenter"],
        ["niebieska_s_5_v_4", "time", "eskin2XCenter"],
        ["niebieska_s_5_v_5", "time", "eskin2XCenter"],
        ["zolta_s_5_v_1", "time", "eskin2XCenter"],
        ["zolta_s_5_v_2", "time", "eskin2XCenter"],
        ["zolta_s_5_v_3", "time", "eskin2XCenter"],
        ["zolta_s_5_v_4", "time", "eskin2XCenter"],
        ["zolta_s_5_v_5", "time", "eskin2XCenter"],
        ["zarowka_s_5_v_1", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_2", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_3", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_4", "time", "eskin1XCenter"],
        ["zarowka_s_5_v_5", "time", "eskin1XCenter"],
        //
        ["niebieska_s_5_v_1", "time", "eskin1YCenter"],
        ["niebieska_s_5_v_2", "time", "eskin1YCenter"],
        ["niebieska_s_5_v_3", "time", "eskin1YCenter"],
        ["niebieska_s_5_v_4", "time", "eskin1YCenter"],
        ["niebieska_s_5_v_5", "time", "eskin1YCenter"],
        ["zolta_s_5_v_1", "time", "eskin1YCenter"],
        ["zolta_s_5_v_2", "time", "eskin1YCenter"],
        ["zolta_s_5_v_3", "time", "eskin1YCenter"],
        ["zolta_s_5_v_4", "time", "eskin1YCenter"],
        ["zolta_s_5_v_5", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_1", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_2", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_3", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_4", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_5", "time", "eskin1YCenter"],
        ["niebieska_s_5_v_1", "time", "eskin2YCenter"],
        ["niebieska_s_5_v_2", "time", "eskin2YCenter"],
        ["niebieska_s_5_v_3", "time", "eskin2YCenter"],
        ["niebieska_s_5_v_4", "time", "eskin2YCenter"],
        ["niebieska_s_5_v_5", "time", "eskin2YCenter"],
        ["zolta_s_5_v_1", "time", "eskin2YCenter"],
        ["zolta_s_5_v_2", "time", "eskin2YCenter"],
        ["zolta_s_5_v_3", "time", "eskin2YCenter"],
        ["zolta_s_5_v_4", "time", "eskin2YCenter"],
        ["zolta_s_5_v_5", "time", "eskin2YCenter"],
        ["zarowka_s_5_v_1", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_2", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_3", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_4", "time", "eskin1YCenter"],
        ["zarowka_s_5_v_5", "time", "eskin1YCenter"],
        //
        ["niebieska_s_5_v_1", "time", "eskin1CenterValue"],
        ["niebieska_s_5_v_2", "time", "eskin1CenterValue"],
        ["niebieska_s_5_v_3", "time", "eskin1CenterValue"],
        ["niebieska_s_5_v_4", "time", "eskin1CenterValue"],
        ["niebieska_s_5_v_5", "time", "eskin1CenterValue"],
        ["zolta_s_5_v_1", "time", "eskin1CenterValue"],
        ["zolta_s_5_v_2", "time", "eskin1CenterValue"],
        ["zolta_s_5_v_3", "time", "eskin1CenterValue"],
        ["zolta_s_5_v_4", "time", "eskin1CenterValue"],
        ["zolta_s_5_v_5", "time", "eskin1CenterValue"],
        ["zarowka_s_5_v_1", "time", "eskin1CenterValue"],
        ["zarowka_s_5_v_2", "time", "eskin1CenterValue"],
        ["zarowka_s_5_v_3", "time", "eskin1CenterValue"],
        ["zarowka_s_5_v_4", "time", "eskin1CenterValue"],
        ["zarowka_s_5_v_5", "time", "eskin1CenterValue"],
        ["niebieska_s_5_v_1", "time", "eskin2CenterValue"],
        ["niebieska_s_5_v_2", "time", "eskin2CenterValue"],
        ["niebieska_s_5_v_3", "time", "eskin2CenterValue"],
        ["niebieska_s_5_v_4", "time", "eskin2CenterValue"],
        ["niebieska_s_5_v_5", "time", "eskin2CenterValue"],
        ["zolta_s_5_v_1", "time", "eskin2CenterValue"],
        ["zolta_s_5_v_2", "time", "eskin2CenterValue"],
        ["zolta_s_5_v_3", "time", "eskin2CenterValue"],
        ["zolta_s_5_v_4", "time", "eskin2CenterValue"],
        ["zolta_s_5_v_5", "time", "eskin2CenterValue"],
        ["zarowka_s_5_v_1", "time", "eskin2CenterValue"],
        ["zarowka_s_5_v_2", "time", "eskin2CenterValue"],
        ["zarowka_s_5_v_3", "time", "eskin2CenterValue"],
        ["zarowka_s_5_v_4", "time", "eskin2CenterValue"],
        ["zarowka_s_5_v_5", "time", "eskin2CenterValue"],
        //

        ["niebieska_s_5_v_1", "time", "eskin1MaxValue"],
        ["niebieska_s_5_v_2", "time", "eskin1MaxValue"],
        ["niebieska_s_5_v_3", "time", "eskin1MaxValue"],
        ["niebieska_s_5_v_4", "time", "eskin1MaxValue"],
        ["niebieska_s_5_v_5", "time", "eskin1MaxValue"],
        ["zolta_s_5_v_1", "time", "eskin1MaxValue"],
        ["zolta_s_5_v_2", "time", "eskin1MaxValue"],
        ["zolta_s_5_v_3", "time", "eskin1MaxValue"],
        ["zolta_s_5_v_4", "time", "eskin1MaxValue"],
        ["zolta_s_5_v_5", "time", "eskin1MaxValue"],
        ["zarowka_s_5_v_1", "time", "eskin1MaxValue"],
        ["zarowka_s_5_v_2", "time", "eskin1MaxValue"],
        ["zarowka_s_5_v_3", "time", "eskin1MaxValue"],
        ["zarowka_s_5_v_4", "time", "eskin1MaxValue"],
        ["zarowka_s_5_v_5", "time", "eskin1MaxValue"],
        ["niebieska_s_5_v_1", "time", "eskin2MaxValue"],
        ["niebieska_s_5_v_2", "time", "eskin2MaxValue"],
        ["niebieska_s_5_v_3", "time", "eskin2MaxValue"],
        ["niebieska_s_5_v_4", "time", "eskin2MaxValue"],
        ["niebieska_s_5_v_5", "time", "eskin2MaxValue"],
        ["zolta_s_5_v_1", "time", "eskin2MaxValue"],
        ["zolta_s_5_v_2", "time", "eskin2MaxValue"],
        ["zolta_s_5_v_3", "time", "eskin2MaxValue"],
        ["zolta_s_5_v_4", "time", "eskin2MaxValue"],
        ["zolta_s_5_v_5", "time", "eskin2MaxValue"],
        ["zarowka_s_5_v_1", "time", "eskin2MaxValue"],
        ["zarowka_s_5_v_2", "time", "eskin2MaxValue"],
        ["zarowka_s_5_v_3", "time", "eskin2MaxValue"],
        ["zarowka_s_5_v_4", "time", "eskin2MaxValue"],
        ["zarowka_s_5_v_5", "time", "eskin2MaxValue"],
        //
        ["niebieska_s_5_v_1", "servoCloseVal", "eskin1MaxValue"],
        ["niebieska_s_5_v_2", "servoCloseVal", "eskin1MaxValue"],
        ["niebieska_s_5_v_3", "servoCloseVal", "eskin1MaxValue"],
        ["niebieska_s_5_v_4", "servoCloseVal", "eskin1MaxValue"],
        ["niebieska_s_5_v_5", "servoCloseVal", "eskin1MaxValue"],
        ["zolta_s_5_v_1", "servoCloseVal", "eskin1MaxValue"],
        ["zolta_s_5_v_2", "servoCloseVal", "eskin1MaxValue"],
        ["zolta_s_5_v_3", "servoCloseVal", "eskin1MaxValue"],
        ["zolta_s_5_v_4", "servoCloseVal", "eskin1MaxValue"],
        ["zolta_s_5_v_5", "servoCloseVal", "eskin1MaxValue"],
        ["zarowka_s_5_v_1", "servoCloseVal", "eskin1MaxValue"],
        ["zarowka_s_5_v_2", "servoCloseVal", "eskin1MaxValue"],
        ["zarowka_s_5_v_3", "servoCloseVal", "eskin1MaxValue"],
        ["zarowka_s_5_v_4", "servoCloseVal", "eskin1MaxValue"],
        ["zarowka_s_5_v_5", "servoCloseVal", "eskin1MaxValue"],
        ["niebieska_s_5_v_1", "servoCloseVal", "eskin2MaxValue"],
        ["niebieska_s_5_v_2", "servoCloseVal", "eskin2MaxValue"],
        ["niebieska_s_5_v_3", "servoCloseVal", "eskin2MaxValue"],
        ["niebieska_s_5_v_4", "servoCloseVal", "eskin2MaxValue"],
        ["niebieska_s_5_v_5", "servoCloseVal", "eskin2MaxValue"],
        ["zolta_s_5_v_1", "servoCloseVal", "eskin2MaxValue"],
        ["zolta_s_5_v_2", "servoCloseVal", "eskin2MaxValue"],
        ["zolta_s_5_v_3", "servoCloseVal", "eskin2MaxValue"],
        ["zolta_s_5_v_4", "servoCloseVal", "eskin2MaxValue"],
        ["zolta_s_5_v_5", "servoCloseVal", "eskin2MaxValue"],
        ["zarowka_s_5_v_1", "servoCloseVal", "eskin2MaxValue"],
        ["zarowka_s_5_v_2", "servoCloseVal", "eskin2MaxValue"],
        ["zarowka_s_5_v_3", "servoCloseVal", "eskin2MaxValue"],
        ["zarowka_s_5_v_4", "servoCloseVal", "eskin2MaxValue"],
        ["zarowka_s_5_v_5", "servoCloseVal", "eskin2MaxValue"],
        //
        ["niebieska_s_5_v_1", "time", "eskin1AreaIndex"],
        ["niebieska_s_5_v_2", "time", "eskin1AreaIndex"],
        ["niebieska_s_5_v_3", "time", "eskin1AreaIndex"],
        ["niebieska_s_5_v_4", "time", "eskin1AreaIndex"],
        ["niebieska_s_5_v_5", "time", "eskin1AreaIndex"],
        ["zolta_s_5_v_1", "time", "eskin1AreaIndex"],
        ["zolta_s_5_v_2", "time", "eskin1AreaIndex"],
        ["zolta_s_5_v_3", "time", "eskin1AreaIndex"],
        ["zolta_s_5_v_4", "time", "eskin1AreaIndex"],
        ["zolta_s_5_v_5", "time", "eskin1AreaIndex"],
        ["zarowka_s_5_v_1", "time", "eskin1AreaIndex"],
        ["zarowka_s_5_v_2", "time", "eskin1AreaIndex"],
        ["zarowka_s_5_v_3", "time", "eskin1AreaIndex"],
        ["zarowka_s_5_v_4", "time", "eskin1AreaIndex"],
        ["zarowka_s_5_v_5", "time", "eskin1AreaIndex"],
        ["niebieska_s_5_v_1", "time", "eskin2AreaIndex"],
        ["niebieska_s_5_v_2", "time", "eskin2AreaIndex"],
        ["niebieska_s_5_v_3", "time", "eskin2AreaIndex"],
        ["niebieska_s_5_v_4", "time", "eskin2AreaIndex"],
        ["niebieska_s_5_v_5", "time", "eskin2AreaIndex"],
        ["zolta_s_5_v_1", "time", "eskin2AreaIndex"],
        ["zolta_s_5_v_2", "time", "eskin2AreaIndex"],
        ["zolta_s_5_v_3", "time", "eskin2AreaIndex"],
        ["zolta_s_5_v_4", "time", "eskin2AreaIndex"],
        ["zolta_s_5_v_5", "time", "eskin2AreaIndex"],
        ["zarowka_s_5_v_1", "time", "eskin2AreaIndex"],
        ["zarowka_s_5_v_2", "time", "eskin2AreaIndex"],
        ["zarowka_s_5_v_3", "time", "eskin2AreaIndex"],
        ["zarowka_s_5_v_4", "time", "eskin2AreaIndex"],
        ["zarowka_s_5_v_5", "time", "eskin2AreaIndex"],
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

function calcAreaIndex(eskin: number[][]): number {
    let areaIndex: number = 0;
    for (let row of eskin) {
        for (let cell of row) {
            let increase = cell / 50;
            if (increase > 1) increase = 1;
            areaIndex += increase;
        }
    }
    return areaIndex;
}

function clearNotUsedCells(data: DataFrame[]): DataFrame[] {
    const result: DataFrame[] = [];
    const usedRows = [3, 4, 5];
    const usedColumns = [1, 2, 3, 4, 5];
    data.forEach((frame) => {
        const clearedFrame = { ...frame };
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 16; j++) {
                if (usedRows.find((x) => x === i) || usedColumns.find((y) => y === j)) continue;
                clearedFrame.eskin1[i][j] = 0;
                clearedFrame.eskin2[i][j] = 0;
            }
        }
        result.push(clearedFrame);
    });
    return result;
}

function findCenterOfMass(data: number[][]): { x: number; y: number } {
    let totalWeight = 0;
    let weightedSumX = 0;
    let weightedSumY = 0;

    const numRows = data.length;
    const numCols = data[0].length;

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const value = data[i][j];
            totalWeight += value;
            weightedSumX += value * j;
            weightedSumY += value * i;
        }
    }

    const x = weightedSumX / totalWeight;
    const y = weightedSumY / totalWeight;

    return { x, y };
}

function findMaxValuePosition(data: number[][]): { x: number; y: number } {
    const numRows = data.length;
    const numCols = data[0].length;

    let maxValue = -Infinity;
    let x = -1;
    let y = -1;

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (data[i][j] > maxValue) {
                maxValue = data[i][j];
                x = j;
                y = i;
            }
        }
    }

    return { x, y };
}

const files = getJsonFiles(dataPath, ["s_5_"], ["top"]);
const workbook = XLSX.utils.book_new();

const errorData = readFile(path.join(dataPath, "pusty_v_1.json"));
const errorDatawithoutNotUsedCells = clearNotUsedCells(errorData);
const error = calculateError(errorDatawithoutNotUsedCells);

files.forEach((file) => {
    const data = readFile(file);
    const dataWithoutNotUsedCells = clearNotUsedCells(data);
    // const error = calculateError(dataWithoutNotUsedCells);
    const dataWithoutError = removeError(dataWithoutNotUsedCells, error);
    const workSheet = transformData(dataWithoutError);
    XLSX.utils.book_append_sheet(workbook, workSheet, path.basename(file, ".json"));
});

const config = createConfig();
XLSX.utils.book_append_sheet(workbook, config, "Config");

const resultPath = "results/all_results.xlsx";

XLSX.writeFile(workbook, resultPath);
console.log("Excel file created successfully!");
