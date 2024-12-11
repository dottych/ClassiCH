const Behaviour = require('../../Behaviour');

const ServerSpawnPacket = require('../../Server/Spawn');
const ServerMessagePacket = require('../../Server/Message');
const ServerExtChangeModelPacket = require('../../Server/Ext/ChangeModel');
const ServerTwoWayPingPacket = require('../../Server/Ext/TwoWayPing');

const utils = require('../../../Utils');
const lists = require('../../../Lists');
const config = require('../../../Config');

class BehaviourIdentificationSpawn extends Behaviour {
    constructor(client, playerName) {
        super();

        this.client = client;

        this.name = playerName;

        this.successful = this.execute();
    }

    execute() {
        // spawn client for itself
        new ServerSpawnPacket(

            [this.client],
            true,
            this.client.id

        );

        // set default model for itself
        new ServerExtChangeModelPacket(

            [this.client],
            0xFF,
            "humanoid"

        );

        // spawn client for others
        new ServerSpawnPacket(

            utils.getOtherPlayerClients(this.client),
            false,
            this.client.id

        );

        // spawn other players for client with model
        for (let player of Object.values(lists.players)) 
            if (player.id != this.client.id) {
                new ServerSpawnPacket(

                    [this.client],
                    false,
                    player.id
        
                );

                if (player.model !== "humanoid")
                    new ServerExtChangeModelPacket(

                        [this.client],
                        player.id,
                        player.model
            
                    );

            }

        new ServerMessagePacket(utils.getAllPlayerClients(), 0x00, `&e${this.name} joined the game`);
        new ServerMessagePacket([this.client], 100, config.self.server.name);
        utils.log(`${this.name} joined the game`); 

        return true;
    }
}

module.exports = BehaviourIdentificationSpawn;