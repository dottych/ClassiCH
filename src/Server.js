const fs = require('fs');
const net = require('net');
const request = require('request');

const config = require('./Config');
const utils = require('./Utils');

// crucial server folders
if (!fs.existsSync('./blocks')) {
    utils.log("Creating blocks folder");
    fs.mkdirSync('./blocks');
}
if (!fs.existsSync('./generations')) {
    utils.log("Creating generations folder");
    fs.mkdirSync('./generations');
}

const lists = require('./Lists');
const packets = require('./Packets');
const commandManager = require('./CommandManager');
const announcer = require('./Announcer');

utils.log(`Loaded ${commandManager.actualSize} command${commandManager.actualSize === 1 ? "" : "s"}`);
utils.log(`Loaded ${Object.keys(lists.customBlocks).length} custom block${Object.keys(lists.customBlocks).length === 1 ? "" : "s"}`);

// check if crucial config values are valid
if (!config.checkCrucialConfig()) {
    console.error("YOUR CONFIG IS INVALID!");
    process.exit(0);
}

// initialise world
const world = require('./World');

// generate world of configured type before initialising server
if (!world.generated) {
    const generationType = config.self.world.generationType;

    try {
        const generation = require(`../server/generations/${generationType}`);

        utils.log(`Generating ${world.x}x${world.y}x${world.z} world of type ${generationType}`);
        const start = performance.now();

        generation.generate();
        world.generated = true;

        utils.log(`Generating done, took ${Math.round(performance.now() - start)}ms`);
    } catch (e) {
        utils.log(`Invalid generation type ${generationType}, cancelling generation`);
    }
}

// main server class
class Server {
    constructor() {
        this.closing = false;
        this.initialBeat = true;

        config.salt = utils.generateRandomSalt();

        this.server = net.createServer(client => {
            client.data = []; // client's raw unhandled packets
            client.packets = []; // client's incoming packets
            client.busy = false; // is handling client's packets?
            client.id = -1; // client's player ID
            client.extensions = {};
            client.extensionCount = 0;
            client.blockSupportLevel = 0;

            // client events
            client.on('data', data => this.onData(client, data));
            client.on('error', error => this.onError(client, error));
            client.on('close', () => this.onClose(client));
        });

        // listen on defined port on TCP
        this.server.listen(config.self.server.port, () => {
            utils.log(`TCP: listening on ${config.self.server.port}`);
        });

        if (config.self.messages.announcer.enabled) announcer.start();

        // initiate heartbeat interval if enabled
        if (config.self.heartbeat.enabled) this.heartbeat();

        if (config.self.server.checkForUpdate) this.checkForUpdate();
    }

    onData(client, data) {
        client.data.push(...data);
        client.packets.push(...packets.splitPackets(client));

        if (!client.busy)
            packets.handle(client);
    }

    onError(client, error) {
        console.error(error);
        client.end();
        //this.onClose(client);
    }

    onClose(client) {
        const player = lists.players.get(client.id);

        // if client has a valid player, remove it
        if (player !== undefined)
            player.disconnect();
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
            console.error(error);
        }

        utils.log("Server is shutting down...");
        
        if (config.self.world.autoSave) world.save();
        if (config.self.messages.announcer.enabled) announcer.stop();

        process.exit();
    }

    heartbeat() {
        function send(initial, url) {
            // True and False as per the original heartbeat specification
            request(
                url +
                '?port=' + config.self.server.port +
                '&max=' + config.self.server.maxPlayers +
                '&name=' + encodeURIComponent(config.self.server.name) +
                '&public=' + config.self.server.public ? 'True' : 'False' +
                '&version=' + config.pvn +
                '&salt=' + config.salt +
                '&users=' + utils.getPlayerCount(lists.players) +
                '&software=' + encodeURIComponent(config.software) +
                '&web=' + 'False',
                (error, response, body) => {
                    if (body.indexOf("/play/") >= 0) {
                        if (initial)
                            utils.log(`Server URL: ${body}`);

                    } else {
                        utils.log(`Something went wrong during a heartbeat!`);

                        if (error != null)
                            utils.log(`Error code: ${error}`);

                        utils.log(body);
                    }
                }
            );
        }

        // initial heartbeat
        for (let url of config.self.heartbeat.URLs)
            send(this.initialBeat, url);

        this.initialBeat = false;

        // periodic heartbeat
        setInterval(async () => {

            for (let url of config.self.heartbeat.URLs)
                send(this.initialBeat, url);

        }, config.self.heartbeat.interval * 1000);
    }

    checkForUpdate() {
        if (config.softwareRaw.toLowerCase().includes("dev"))
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