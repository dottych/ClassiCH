const lists = require('./Lists');
const utils = require('./Utils');

const ClientIdentificationPacket = require('./packets/client/Identification');
const ClientBlockPacket = require('./packets/client/Block');
const ClientMovementPacket = require('./packets/client/Movement');
const ClientMessagePacket = require('./packets/client/Message');
const ServerDisconnectPacket = require('./packets/server/Disconnect');

const ClientExtInfoPacket = require('./packets/client/ext/ExtInfo');
const ClientExtEntryPacket = require('./packets/client/ext/ExtEntry');
const ClientCustomBlockSupportLevelPacket = require('./packets/client/ext/CustomBlockSupportLevel');
const ClientTwoWayPingPacket = require('./packets/client/ext/TwoWayPing');

class Packets {
    constructor() {}

    async handle(client) {
        while (client.packets.length > 0) {
            client.busy = true;
            
            // big emphasis on the != and == here, so watch out when copying
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

                case lists.clientPackets.ext.info:
                    if (lists.players[client.id] != undefined) break;
                    new ClientExtInfoPacket(client, client.packets[0]);
                    break;
            
                case lists.clientPackets.ext.entry:
                    if (lists.players[client.id] != undefined) break;
                    new ClientExtEntryPacket(client, client.packets[0]);
                    break;

                case lists.clientPackets.ext.customBlockSupportLevel:
                    if (lists.players[client.id] != undefined) break;
                    new ClientCustomBlockSupportLevelPacket(client, client.packets[0]);
                    break;

                case lists.clientPackets.ext.twoWayPing:
                    if (lists.players[client.id] == undefined) break;
                    new ClientTwoWayPingPacket(client, client.packets[0]);
                    break;

                default:
                    if (client.id === -1)
                        utils.log("Received unknown packet from an unknown client!");

                    new ServerDisconnectPacket([client], "You have sent an unknown packet!");
                    break;
            }

            // remove old packet, since it's been handled
            client.packets.shift();
        }

        // handled all packets
        client.busy = false;
    }

    /**
     * Splits combined or "incomplete" packets while removing the raw data.
     * @param {Socket} client Client that contains raw, unhandled packets.
     * @returns An array of split packets. (an array of arrays)
     */
    splitPackets(client) {
        let packets = [];
        let cancelled = false;

        while (client.data.length > 0 && !cancelled) {
            const packetLength = lists.clientPacketLengths[client.data[0]];

            // if there is no defined packet length for this specific packet...
            // which means it does not exist
            if (packetLength == undefined) {
                //utils.log("Received invalid (corrupted) packet!")

                if (client.id >= 0)
                    new ServerDisconnectPacket([client], "You have sent an invalid packet!");

                cancelled = true;
                return [];
            }

            // if packet is incomplete, stop, else put into packet array
            if (client.data.length < packetLength)
                cancelled = true;
            else {
                const splitPacket = client.data.splice(0, packetLength);
                packets.push([...splitPacket]);
            }
        }

        return packets;
    }
}

module.exports = new Packets();