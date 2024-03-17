import dgram from "dgram";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 3001,
});

const PORT = 7;
const HOST = "192.168.0.111";
const startDataByte = 6;
const dataSize = 256;

const client = dgram.createSocket("udp4");

client.on("message", (msg, rinfo) => {
  const bytes = Array.from(msg);
  const ID = (bytes[0] << 8) | bytes[1];
  const nFrame = (bytes[2] << 8) | bytes[3];
  const nPocket = (bytes[4] << 8) | bytes[5];
  // const payload = bytes.slice(startDataByte, startDataByte + dataSize);
  const payload = bytes.slice(startDataByte);
  console.log(
    `${rinfo.address}:${rinfo.port} - ID:${ID} nFrame:${nFrame} nPocket:${nPocket} payloadSize:${msg.length}`
  );
  console.log(JSON.stringify(bytes));
  // console.log(JSON.stringify(msg));
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(payload));
  });
  // console.log(payload)
});

function start() {
  console.log("sent start msg");
  client.send(Buffer.from([0x02, 0x00, 0x04, 0x00]), PORT, HOST, (err) => {
    if (err) {
      console.log("asdad");
      throw err;
    }
    console.log("udp message sent");
  });
}

function stop() {
  client.send(Buffer.from([0x02, 0x00, 0x02, 0x00]), PORT, HOST, (err) => {
    if (err) {
      console.log("asdad");
      throw err;
    }
    console.log("udp message sent");
  });
}

start();
// setInterval(() => {}, 1000);

wss.on("connection", (ws) => {
  console.log("connected!");
  ws.on("close", () => {
    console.log("disconnected");
  });
});
