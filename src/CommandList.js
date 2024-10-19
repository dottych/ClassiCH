const fs = require('fs');

const utils = require('./Utils');
const lists = require('./Lists');

let commandList = {};

for (let command of fs.readdirSync('../src/Commands/')) {
    // check if it's a module
    if (!command.endsWith('.js')) continue;

    // remove ".js" from the end
    command = command.slice(0, -3);

    // register command and add its information to list
    try {
        commandList[command.toLowerCase()] = require(`./Commands/${command}`);

        const tempCommand = new (commandList[command.toLowerCase()])(null, []);

        lists.commands[command.toLowerCase()] = {
            
            description: tempCommand.description,
            op: tempCommand.op,
            hidden: tempCommand.hidden
        
        };
    } catch(error) {
        console.log(error);
        delete commandList[command.toLowerCase()];
        delete lists.commands[command.toLowerCase()];
        utils.log(`"${command}" is NOT a valid command! Ignoring file`);
    }
}

module.exports = commandList;