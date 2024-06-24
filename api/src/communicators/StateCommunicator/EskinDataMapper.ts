type EskinPatchSetup = {
    transpose: boolean;
    xShift: number;
    yShift: number;
    mapX: number[];
    mapY: number[];
};

type EskinMsg = {
    nFrame: number;
    nPocket: number;
    payload: number[];
};

export class EskinDataMaper {
    private _driverMapX: number[][];
    private _leftFingerPatchSetup: EskinPatchSetup;
    private _rightFingerPatchSetup: EskinPatchSetup;
    private _vec: number[];
    private _width: number;
    private _hight: number;
    private _packetsCount: number;
    private _framesCount: number;
    private _dataReady: boolean;

    private _leftFingerPatch: number[][];
    private _rightFingerPatch: number[][];

    get data(): { eskin1: number[][]; eskin2: number[][] } {
        this._dataReady = false;
        return { eskin1: this._leftFingerPatch, eskin2: this._rightFingerPatch };
    }

    dataReady() {
        return this._dataReady;
    }

    constructor() {
        this._dataReady = false;
        this._driverMapX = [
            [56, 45, 16, 61, 32, 21, 48, 37, 8, 53, 24, 13, 40, 29, 0, 5],
            [59, 46, 19, 62, 35, 22, 51, 38, 11, 54, 27, 14, 43, 30, 3, 6],
            [57, 47, 17, 63, 33, 23, 49, 39, 9, 55, 25, 15, 41, 31, 1, 7],
            [58, 44, 18, 60, 34, 20, 50, 36, 10, 52, 26, 12, 42, 28, 2, 4],
        ];

        this._leftFingerPatchSetup = {
            transpose: true,
            xShift: 32,
            yShift: 32,
            mapX: [8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15, 0],
            mapY: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        };

        this._rightFingerPatchSetup = {
            transpose: false,
            xShift: 48,
            yShift: 48,
            mapX: [7, 8, 6, 9, 5, 10, 4, 11, 3, 12, 2, 13, 1, 14, 0, 15],
            mapY: [7, 8, 9, 10, 11, 12, 13, 14, 15],
        };
        this._width = 16;
        this._hight = 16;
        this._packetsCount = 4;
        this._framesCount = 4;
        this._vec = new Array(this._packetsCount * this._framesCount * this._width * this._hight).fill(0);
    }

    handleData(data: number[]) {
        let nFrame = data.at(2);
        let nPocket = data.at(4);
        const payload = data.slice(6);

        nPocket++;
        if (nPocket >= this._packetsCount) {
            nPocket = 0;
            nFrame++;
            if (nFrame >= this._framesCount) {
                nFrame = 0;
            }
        }

        this._updateData({ nFrame, nPocket, payload });

        if (nFrame === 3 && nPocket === 3) {
            this._leftFingerPatch = this._mapPatch(this._leftFingerPatchSetup);
            this._rightFingerPatch = this._mapPatch(this._rightFingerPatchSetup);

            this._dataReady = true;
            return;
            console.log("LEFT");
            this._logPatch(this._leftFingerPatch);
            console.log("RIGHT");
            this._logPatch(this._rightFingerPatch);
        }
    }

    private _updateData(data: EskinMsg) {
        for (let i = 0; i < this._hight; i++) {
            for (let j = 0; j < this._width; j++) {
                const vX = this._driverMapX[data.nFrame][j];
                this._vec[((data.nPocket + 1) * this._hight - 1 - i) * (this._packetsCount * this._width) + vX] =
                    data.payload[i * this._width + j];
            }
        }
    }

    private _mapPatch(patchSetup: EskinPatchSetup): number[][] {
        const patch = [];
        for (let i = 0; i < patchSetup.mapY.length; i++) {
            const row = [];
            for (let j = 0; j < patchSetup.mapX.length; j++) {
                let x = 0,
                    y = 0;
                if (patchSetup.transpose) {
                    y = patchSetup.yShift + patchSetup.mapX[j];
                    x = patchSetup.xShift + patchSetup.mapY[i];
                } else {
                    x = patchSetup.xShift + patchSetup.mapX[j];
                    y = patchSetup.yShift + patchSetup.mapY[i];
                }
                row.push(this._vec[y * this._width * this._packetsCount + x]);
            }
            patch.push(row);
        }
        return patch;
    }

    private _logPatch(patch: number[][]) {
        console.log("----------------------------------------");
        for (let row of patch) {
            console.log(JSON.stringify(row));
        }
    }
}
