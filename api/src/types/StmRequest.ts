export type StmRequest = {
    id: number;
    data: number[];
    callback: (data: number[]) => void;
};
