import express from 'express';

export interface RestController {
    onRestGetLight: (req, res) => void;
    onRestPutLight: (req, res) => void;
}
export class RestServer {
    private app;
    constructor(private port: number, private ctrl: RestController) {}

    run = () => {
        this.app = express();
        this.app.use(express.json());

        this.app.get('/api/light', this.ctrl.onRestGetLight);
        this.app.put('/api/light', this.ctrl.onRestPutLight);

        this.app.listen(this.port);
    };
}
