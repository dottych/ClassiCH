const ServerMessagePacket = require('./packets/server/Message');

const utils = require('./Utils');
const lists = require('./Lists');
const config = require('./Config');

class Announcer {
    constructor() {
        this.prefix = config.self.messages.announcer.prefix;
        this.interval = config.self.messages.announcer.interval * 1000 * 60;
        this.intervalFunction;

        this.lastAnnouncement = 0;
    }

    start() {
        this.intervalFunction = setInterval(() => {

            if (lists.announcements.length <= 0)
                this.stop();

            let currentAnnouncement = this.lastAnnouncement;
            while (currentAnnouncement === this.lastAnnouncement && lists.announcements.length > 1)
                currentAnnouncement = Math.floor(Math.random() * lists.announcements.length)
            
            const messages = utils.splitString(`${this.prefix}${lists.announcements[currentAnnouncement]}`, "&7");

            for (let message of messages)
                new ServerMessagePacket(utils.getAllPlayerClients(lists.players), 0x00, message);

            this.lastAnnouncement = currentAnnouncement;
            
        }, this.interval);
    }

    stop() {
        clearInterval(this.intervalFunction);
    }
}

module.exports = new Announcer();