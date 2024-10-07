const lists = require('./Lists');
const utils = require('./Utils');

const ClientIdentificationPacket = require('./Packets/Client/Identification');
const ClientBlockPacket = require('./Packets/Client/Block');
const ClientMovementPacket = require('./Packets/Client/Movement');
const ClientMessagePacket = require('./Packets/Client/Message');
const ServerDisconnectPacket = require('./Packets/Server/Disconnect');

const ClientExtInfoPacket = require('./Packets/Client/Ext/ExtInfo');
const ClientExtEntryPacket = require('./Packets/Client/Ext/ExtEntry');

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

                case lists.clientPackets.ext.info:
                    if (lists.players[client.id] != undefined) break;
                    new ClientExtInfoPacket(client, client.packets[0]);
                    break;
            
                case lists.clientPackets.ext.entry:
                    if (lists.players[client.id] != undefined) break;
                    new ClientExtEntryPacket(client, client.packets[0]);
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
     * Splits combined packets.
     * @param {Buffer} packet Buffer with combined packets.
     * @returns Split packets.
     */
    splitPackets(packet) {
        let buffer = [];
        let _packet = [...packet];
        let cancelled = false;

        function split() {
            const packetLength = lists.clientPacketLengths[_packet[0]];

            if (packetLength == undefined) return [];

            const slicedPacket = _packet.slice(0, packetLength);

            if (slicedPacket.length == packetLength) {
                buffer.push([...slicedPacket]);
                _packet = _packet.slice(packetLength, _packet.length);
            } else {
                cancelled = true;
                utils.log("Received invalid (corrupted) packet!")
                new ServerDisconnectPacket([client], "You have sent an invalid packet!");
            }
            
            
            if (_packet.length > 0 && !cancelled) split();
        }

        split();

        return buffer;
    }
}

module.exports = new Packets();