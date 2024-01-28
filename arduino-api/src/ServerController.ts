import { WsMessage } from './WsMessage';
import { RestServer } from './ports/RestServer';
import { Serial } from './ports/Serial';
import { Ws } from './ports/Ws';
import { WebSocket } from 'ws';

interface JsonMessageFromUI {
    action: string;
    data: string;
}
export class ServerController {
    private serial: Serial;
    private rest: RestServer;
    private a: WsMessage;

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

    onMessageFromSerial = (text: string) => {
        // console.log('ServerController: Serial:', text);
        // try {
        //     this.ws.send(JSON.stringify({ fromSerial: text }));
        // } catch (e) {
        //     console.log('ServerController: Error send to WS:', text);
        // }
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
        this.serial.send('0,0,0\n');
    };

    onRestPutLight = (req, response) => {
        console.log('onRestPutLight req=', req);
        // PutLight
        response.send('Hello World');
        this.serial.send('0,0,255\n');
    };

}
