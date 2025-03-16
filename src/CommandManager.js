const fs = require('fs');

const utils = require('./Utils');
const lists = require('./Lists');

let list = {};
let actualSize = 0;

for (let command of fs.readdirSync('../src/commands/')) {
    // check if it's a module
    if (!command.endsWith('.js')) continue;

    // remove ".js" from the end
    command = command.slice(0, -3);

    // register command and add its information to list
    try {
        list[command.toLowerCase()] = require(`./commands/${command}`);

        // main command
        const tempCommand = new (list[command.toLowerCase()])(null, []);

        lists.commands[command.toLowerCase()] = {
            
            name: tempCommand.name,
            description: tempCommand.description,
            aliases: tempCommand.aliases,
            op: tempCommand.op,
            hidden: tempCommand.hidden,
            alias: false
        
        };

        actualSize++;

        // command aliases
        for (let alias of tempCommand.aliases) {
            list[alias.toLowerCase()] = require(`./commands/${command}`);

            lists.commands[alias.toLowerCase()] = {
            
                name: tempCommand.name,
                description: tempCommand.description,
                aliases: tempCommand.aliases,
                op: tempCommand.op,
                hidden: tempCommand.hidden,
                alias: true
            
            };
        }
    } catch(error) {
        console.log(error);
        delete list[command.toLowerCase()];
        delete lists.commands[command.toLowerCase()];
        utils.log(`"${command}" is NOT a valid command! Ignoring file`);
    }
}

module.exports = { list, actualSize };