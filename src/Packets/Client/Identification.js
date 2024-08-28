const zlib = require('zlib');

const ClientPacket = require('../ClientPacket');

const ServerIdentificationPacket = require('../Server/Identification');
const ServerPingPacket = require('../Server/Ping');
const ServerInitPacket = require('../Server/Init');
const ServerChunkPacket = require('../Server/Chunk');
const ServerFinalPacket = require('../Server/Final');
const ServerSpawnPacket = require('../Server/Spawn');
const ServerMessagePacket = require('../Server/Message');
const ServerDisconnectPacket = require('../Server/Disconnect');

const Player = require('../../Player');

const lists = require('../../Lists');
const utils = require('../../Utils');
const config = require('../../Config');
const world = require('../../World');

class IdentificationPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.identification);

        this.pvn;
        this.name;
        this.key;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.pvn = this.buffer[1];
        this.name = utils.readSpacelessString(this.buffer, 2);
        this.key = utils.readSpacelessString(this.buffer, 2+64);
    }

    handle() {
        // does client's PVN match server's PVN?
        if (this.pvn !== config.pvn) {
            new ServerDisconnectPacket([this.client], "Version mismatch!");
            return;
        }

        // does client's name's length fit?
        if (this.name.length <= 0 || this.name.length > 16) {
            new ServerDisconnectPacket([this.client], "Invalid name!");
            return;
        }

        // does client's name have illegal characters?
        for (let char of this.name) {
            if (lists.characters.indexOf(char) < 0) {
                new ServerDisconnectPacket([this.client], "Invalid name!");
                return;
            }
        }

        // is client's key valid? (if server has authentication enabled)
        if (config.self.server.authentication && this.key !== utils.generatePlayerKey(this.name)) {
            new ServerDisconnectPacket([this.client], "Invalid login!");
            return;
        }

        // is server full?
        if (utils.getPlayerCount() >= config.self.server.maxPlayers) {
            new ServerDisconnectPacket([this.client], "The server is full!");
            return;
        }
        
        // is client's name already connected? (if joinKick is on)
        if (!config.self.server.joinKick) {
            if (utils.isNameOnline(this.name)) {
                new ServerDisconnectPacket([this.client], "You are already connected!");
                return;
            }
        }
        else {
            if (utils.isNameOnline(this.name))
                new ServerDisconnectPacket([utils.findPlayerByName(this.name).client], "Connected from another session!");
        }
        

        // is client's name banned?
        let ban = lists.bans[this.name];
        if (ban != undefined) {
            if (ban.trim() === "")
                new ServerDisconnectPacket([this.client], "You are banned!");
            else
                new ServerDisconnectPacket([this.client], `Banned: ${ban}`);
            
            return;
        }

        // give client its identity
        this.client.id = utils.findFirstUnusedID();
        
        let isOp = lists.ops.indexOf(this.name) >= 0;

        // create player object in list
        lists.players[this.client.id] = new Player(

            this.client,
            this.client.id,
            this.name,
            isOp

        );

        lists.players[this.client.id].lastActivity = Math.round(performance.now());

        // give client initial data
        new ServerIdentificationPacket(

            [this.client],
            config.pvn,
            utils.populate(config.self.server.motdTitle, {playerName: this.name}),
            utils.populate(
                
                isOp ? config.self.server.motdDescriptionOP : config.self.server.motdDescription,
                {playerName: this.name}

            ),
            isOp

        );

        // initial ping to client
        new ServerPingPacket([this.client]);

        // world init packet
        new ServerInitPacket([this.client]);

        // compressed world data
        const compressedWorld = zlib.gzipSync(world.buffer);

        // compressed world data chunk loop
        for (let i = 0; i < compressedWorld.length; i += 1024) {
            let sliceBuffer = Buffer.alloc(1024, 0x00);
            let slicedChunk = compressedWorld.subarray(i, Math.min(i + 1024, compressedWorld.length));

            // this loop can be done better?
            for (let j = 0; j < slicedChunk.length; j++)
                sliceBuffer[j] = slicedChunk[j];

            let progress = i == 0 ? 0 : Math.ceil(i / compressedWorld.length * 100);

            // send compressed world data chunk with progress to client
            new ServerChunkPacket(

                [this.client],
                sliceBuffer,
                progress

            );
        }

        // tell client the world is final
        new ServerFinalPacket([this.client]);

        // spawn client for itself
        new ServerSpawnPacket(

            [this.client],
            true,
            this.client.id

        );

        // spawn client for others
        new ServerSpawnPacket(

            utils.getOtherPlayerClients(this.client),
            false,
            this.client.id

        );

        // spawn other players for client
        for (let player of Object.values(lists.players)) 
            if (player.id != this.client.id)
                new ServerSpawnPacket(

                    [this.client],
                    false,
                    player.id
        
                );

        new ServerMessagePacket(utils.getAllPlayerClients(), 0xFF, `${this.name} joined the game`);
        utils.log(`${this.name} joined the game`);
    }
}

module.exports = IdentificationPacket;