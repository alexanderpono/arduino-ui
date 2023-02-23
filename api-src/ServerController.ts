import { Serial } from './ports/Serial';
import { Ws } from './ports/Ws';
import { WebSocket } from 'ws';

interface JsonMessageFromUI {
    action: string;
    data: string;
}
export class ServerController {
    private serial: Serial;
    private ws: Ws;
    private wsServer;
    constructor() {
        this.serial = new Serial(this);
        this.ws = new Ws(this);

        const port = 3000;
        console.log(`ServerController: listening ${port}`);

        this.wsServer = new WebSocket.Server({ port });
        this.wsServer.on('connection', this.ws.onConnect);
    }

    onMessageFromSerial = (text: string) => {
        console.log('ServerController: Serial:', text);
        try {
            this.ws.send(JSON.stringify({ fromSerial: text }));
        } catch (e) {
            console.log('ServerController: Error send to WS:', text);
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
}
