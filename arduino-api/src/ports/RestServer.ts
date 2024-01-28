import express from 'express';
// import { Serializable, jsonProperty } from 'ts-serializable';
// const { Serializable, jsonProperty } = require('ts-serializable');
// import { WsEvent } from '@config/WsEvent';

// export class PutLight extends Serializable {
//     @jsonProperty(Number)
//     public r = 0;

//     @jsonProperty(Number)
//     public g = 0;

//     @jsonProperty(Number)
//     public b = 0;
// }
// export const defaultPutLight = new PutLight().fromJSON({});

export interface RestController {
    onRestGetLight: (req, res) => void;
    onRestPutLight: (req, res) => void;
    // onRestGetRootFolder: (req, res) => void;
    // onRestGetFile: (req, res) => void;
    // onRestEject: (req, res) => void;
}
export class RestServer {
    private app;
    constructor(private port: number, private ctrl: RestController) {}

    run = () => {
        this.app = express();

        this.app.get('/api/light', this.ctrl.onRestGetLight);
        this.app.put('/api/light', this.ctrl.onRestPutLight);

        this.app.listen(this.port);
    };
}
