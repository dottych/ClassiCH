const lists = require('./Lists');
const utils = require('./Utils');

const ClientIdentificationPacket = require('./Packets/Client/Identification');
const ClientBlockPacket = require('./Packets/Client/Block');
const ClientMovementPacket = require('./Packets/Client/Movement');
const ClientMessagePacket = require('./Packets/Client/Message');
const ServerDisconnectPacket = require('./Packets/Server/Disconnect');

class Packets {
    constructor() {}

    async handle(client) {
        while (client.packets.length > 0) {
            client.busy = true;
            
            switch(client.packets[0][0]) {
                case lists.clientPackets.identification:
                    if (lists.players[client.id] != undefined) break;
                    new ClientIdentificationPacket(client, client.packets[0]);
                    break;

                case lists.clientPackets.block:
                    if (lists.players[client.id] == undefined) break;
                    new ClientBlockPacket(client, client.packets[0]);
                    break;

                case lists.clientPackets.movement:
                    if (lists.players[client.id] == undefined) break;
                    new ClientMovementPacket(client, client.packets[0]);
                    break;

                case lists.clientPackets.message:
                    if (lists.players[client.id] == undefined) break;
                    new ClientMessagePacket(client, client.packets[0]);
                    break;

                default:
                    if (client.id === -1)
                        utils.log("Received invalid packet from an unknown client!");

                    new ServerDisconnectPacket([client], "You have sent an invalid packet!");
                    break;
            }

            // remove old packet, since it's been handled
            client.packets.shift();
        }

        // handled all packets
        client.busy = false;
    }
}

module.exports = new Packets();