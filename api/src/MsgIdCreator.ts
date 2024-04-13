export class MsgIdCreator {
    private static msgId: number = 0;

    static create(): number {
        this.msgId++;
        if (this.msgId > 65535) this.msgId = 0;
        return this.msgId;
    }
}
