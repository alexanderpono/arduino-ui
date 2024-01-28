import { SerialCommand } from './Serial.types';
import { RestServer } from './ports/RestServer';
import { Serial } from './ports/Serial';
import { Ws } from './ports/Ws';
import { WebSocket } from 'ws';
const { object, string, number, date, array } = require('yup');

const putRgbSchema = object({
    r: number().required(),
    g: number().required(),
    b: number().required()
});
const ERR = {
    NO_PRIV: { error: 'not enough privileges' },
    SERVER_ERR: { error: 'Server error' },
    VALIDATE_ERR: (data) => ({ error: 'Validate error', data })
};
interface RGB {
    r: number;
    g: number;
    b: number;
}

interface JsonMessageFromUI {
    action: string;
    data: string;
}
export class ServerController {
    private serial: Serial;
    private rest: RestServer;
    // private a: WsMessage;

    private ws: Ws;
    private wsServer;
    constructor(private restPort: number) {
        this.serial = new Serial(this);
        this.ws = new Ws(this);
        this.rest = new RestServer(this.restPort, this);

        const port = 3000;
        console.log(`ServerController: listening WS ${port}, REST ${restPort}`);

        this.wsServer = new WebSocket.Server({ port });
        this.wsServer.on('connection', this.ws.onConnect);
        this.rest.run();
    }

    listenersTo0 = [];
    onMessageFromSerial = (text: string) => {
        console.log('onMessageFromSerial:', text.trim());
        if (
            text.trim().split(',').length > 1 &&
            text.trim().split(',')[0] === '' + SerialCommand.SET_RGB
        ) {
            if (this.listenersTo0.length) {
                const handler = this.listenersTo0.shift();
                if (typeof handler === 'function') {
                    handler(text.trim());
                }
            }
        }
    };

    onWsMesage = (message: string) => {
        console.log('on(message) message=', message);
        try {
            const jsonMessage: JsonMessageFromUI = JSON.parse(message);
            console.log('on(message) jsonMessage=', jsonMessage);
            switch (jsonMessage.action) {
                case 'TO_SERIAL':
                    console.log('jsonMessage=', jsonMessage);
                    this.serial.send(jsonMessage.data + '\n');
                    break;
                default:
                    console.log('Ws: Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ws: Ошибка', error);
        }
    };

    onRestGetLight = (req, response) => {
        response.send('Hello World');
        this.serial.send('0,0,0,0\n');
    };

    onRestPutLight = (req, res) => {
        console.log('onRestPutLight req.body=', req.body);

        putRgbSchema
            .validate(req.body)
            .then((validRgb: RGB) => {
                const signal = `${SerialCommand.SET_RGB},${validRgb.r},${validRgb.g},${validRgb.b}\n`;
                this.serial.send(signal);
                this.listenersTo0.push((text) => {
                    const serialAnswerAr = text.split(',');
                    if (serialAnswerAr[1] === '200') {
                        putRgbSchema
                            .validate({
                                r: serialAnswerAr[2],
                                g: serialAnswerAr[3],
                                b: serialAnswerAr[4]
                            })
                            .then((validRgb: RGB) => {
                                res.send(validRgb);
                            })
                            .catch((er) => {
                                res.status(500).send(er);
                            });
                    } else {
                        res.status(500).send(text);
                    }
                });
            })
            .catch((err) => {
                if (Array.isArray(err.errors)) {
                    res.status(400).send(ERR.VALIDATE_ERR(err.errors));
                } else {
                    console.log('validate err=', err);
                    res.status(500).send(ERR.SERVER_ERR);
                }
            });
    };
}
