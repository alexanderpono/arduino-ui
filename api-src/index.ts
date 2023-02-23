import { WebSocket } from 'ws';

const port = 3000;
console.log(`index.ts! listening ${3000}`);

const wsServer = new WebSocket.Server({ port });
wsServer.on('connection', onConnect);

function onConnect(wsClient) {
    console.log('Новый пользователь');
    // отправка приветственного сообщения клиенту
    wsClient.send('Привет');

    wsClient.on('message', function (message) {
        /* обработчик сообщений от клиента */
        try {
            // сообщение пришло текстом, нужно конвертировать в JSON-формат
            const jsonMessage = JSON.parse(message);
            switch (jsonMessage) {
                case 'ECHO':
                    wsClient.send(jsonMessage.data);
                    break;
                case 'PING':
                    setTimeout(function () {
                        wsClient.send('PONG');
                    }, 2000);
                    break;
                default:
                    console.log('Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });

    wsClient.on('close', function () {
        // отправка уведомления в консоль
        console.log('Пользователь отключился');
    });
}

// import { createExpressServer } from 'routing-controllers';
// import { ApiUserController } from './controllers/ApiUserController';
// import 'reflect-metadata';
// import { logger as loggerMiddleware } from './middleware/logger';

// const app = createExpressServer({
//     cors: {},
//     controllers: [ApiUserController],
//     middlewares: [loggerMiddleware]
// });

// app.use(loggerMiddleware);
// app.listen(port);
