import { ServerController } from './ServerController';

let server: ServerController;
class Program {
    async main() {
        server = new ServerController();
    }

    static create(): Program {
        return new Program();
    }
}

Program.create().main();
