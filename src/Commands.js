const fs = require('fs');

const utils = require('./Utils');
const lists = require('./Lists');

let commands = {};

for (let command of fs.readdirSync('../src/Commands/')) {
    // check if it's a module
    if (!command.endsWith('.js')) continue;

    // remove ".js" from the end
    command = command.slice(0, -3);

    // register command and add its information to list
    try {
        commands[command.toLowerCase()] = require(`./Commands/${command}`);

        const tempCommand = new (commands[command.toLowerCase()])(null, []);

        lists.commands[command.toLowerCase()] = {
            
            description: tempCommand.description,
            op: tempCommand.op,
            hidden: tempCommand.hidden
        
        };
    } catch(error) {
        console.log(error);
        delete commands[command.toLowerCase()];
        delete lists.commands[command.toLowerCase()]
        utils.log(`"${command}" is NOT a valid command! Ignoring file`);
    }
}

module.exports = commands;