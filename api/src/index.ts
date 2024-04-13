import net from "net";
import { Address } from "./Address";
import { Instruction } from "./Instruction";
import { Size } from "./Size";
let index = 0;
const client = new net.Socket();
const ID = 11;

let startTime;

function calcCKSM(arr: number[]) {
    let CKSM = 0;
    for (let el of arr) {
        CKSM = CKSM + el;
    }
    let result = 255 - (CKSM % 256);
    return result;
}

const preq = [0xff, 0xff];

client.connect(10, "192.168.0.111", () => {
    console.log("Connected!");
    let a = true;
    let pos = 0;
    setInterval(() => {
        if (a) {
            // setValue(11, Address.GoalPosition, 0);
            setValue(9, Address.GoalPosition, 0);
            a = false;
        } else {
            // setValue(11, Address.GoalPosition, pos);
            setValue(9, Address.GoalPosition, pos);

            a = true;
        }
        pos += 20;
    }, 1000);
});

client.on("data", (data) => {
    // console.log(data);
});

client.on("error", (err) => {
    console.error(err);
});

client.on("close", () => {
    console.log("Connection closed!");
});

function setValue(id: number, address: Address, value: number) {
    const preq = [0xff, 0xff];
    const length = Size.get(address) + 3;

    let array = [id, length, Instruction.Write, address];
    console.log(`value: ${value} prepared: ${prepareValue(value, Size.get(address))}`);
    array = array.concat(prepareValue(value, Size.get(address)));
    array.push(calcCKSM(array));
    array = preq.concat(array);
    client.write(Buffer.from(array));
}

function prepareValue(value: number, size: number): number[] {
    if (size == 1) return [value % 256];
    return [value % 256, Math.floor(value / 256)];
}
