const net = require('net');
const fs = require('fs');
const request = require('request');

const config = require('./Config');
const utils = require('./Utils');
const lists = require('./Lists');
const packets = require('./Packets');
const commands = require('./Commands');

utils.log(`Loaded ${Object.keys(commands).length} command${Object.keys(commands).length === 1 ? "" : "s"}`);

// check if crucial config values are valid
if (!config.checkCrucialConfig()) {
    console.error("YOUR CONFIG IS INVALID!");
    process.exit(0);
}

const world = require('./World');

class Server {
    constructor() {
        this.closing = false;
        this.initialBeat = true;

        config.salt = utils.generateRandomSalt();

        this.server = net.createServer(client => {
            client.packets = []; // client's incoming packets
            client.busy = false; // is handling client's packets?
            client.id = -1; // client's player ID

            // client events
            client.on('data', data => this.onData(client, data));
            client.on('error', error => this.onError(client, error));
            client.on('close', () => this.onClose(client));
        });

        // listen on defined port on TCP
        this.server.listen(config.self.server.port, () => {
            utils.log(`TCP: listening on ${config.self.server.port}`);
        });

        // initiate heartbeat interval if enabled
        if (config.self.heartbeat.enabled) this.heartbeat();

        if (config.self.server.checkForUpdate) this.checkForUpdate();
    }

    onData(client, data) {
        client.packets.push(...(utils.splitPackets(data)));
        if (!client.busy) packets.handle(client);
    }

    onError(client, error) {
        console.error(error);
        client.end();
        //this.onClose(client);
    }

    onClose(client) {
        if (lists.players[client.id] !== undefined)
            lists.players[client.id].disconnect();
    }

    onServerClose(error) {
        if (this.closing) return;
        this.closing = true;

        if (
            
            error != undefined &&
            error != "exit" &&
            error != "SIGINT" &&
            error != "SIGUSR1" &&
            error != "SIGUSR2" &&
            error != 0

        ) {
            utils.log("Something went wrong!");
            console.log(error);
        }

        utils.log("Server is shutting down");
        
        world.save();

        process.exit();
    }

    heartbeat() {
        function send(initial) {
            request(
                config.self.heartbeat.url +
                '?port=' + config.self.server.port +
                '&max=' + config.self.server.maxPlayers +
                //'&name=' + utils.populate(config.self.server.name) +
                '&name=' + config.self.server.name +
                '&public=' + config.self.server.public +
                '&version=' + config.pvn +
                '&salt=' + config.salt +
                '&users=' + utils.getPlayerCount() +
                '&software=' + config.software +
                '&web=' + true,
                (error, response, body) => {
                    if (body.indexOf("/play/") >= 0) {
                        if (initial)
                            utils.log(`Server URL: ${body}`);

                    } else {
                        utils.log(`Something went wrong during a heartbeat!`);

                        if (error != null)
                            utils.log(`Error code: ${error}`);

                        utils.log(`${body}`);
                    }
                }
            );
        }

        // initial heartbeat
        send(this.initialBeat);
        this.initialBeat = false;

        // periodic heartbeat
        setInterval(async () => {

            send();

        }, config.self.heartbeat.interval * 1000);
    }

    checkForUpdate() {
        if (config.softwareRaw.toLowerCase().indexOf("dev") >= 0)
            return;

        request(
            config.versionUrl,
            (error, response, body) => {
                body = body.split('\n')[0];
                if (body.startsWith("ClassiCH") && body !== config.softwareRaw)
                    utils.log(`New version detected, ${body}! Go to: ${config.softwareUrl}`);
            }
        );
    }
}

// initialise server
const server = new Server();

// safe server closing
process.stdin.resume();
process.on('exit', server.onServerClose);
process.on('SIGINT', server.onServerClose);
process.on('SIGUSR1', server.onServerClose);
process.on('SIGUSR2', server.onServerClose);
process.on('uncaughtException', (code, error) => server.onServerClose.bind(error));