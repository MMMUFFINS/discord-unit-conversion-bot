/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

'use strict';

// Import the discord.js module
const Discord = require('discord.js');
const fs = require('fs');
const parser = require('./includes/parser');

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const rawSecrets = fs.readFileSync('./secrets.json');

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
    // If the message is "ping"
    if (message.content === 'ping') {
        // Send "pong" to the same channel
        message.channel.send('pong');
    }
    else {
        parser.findValues(message);
    }
});

new Promise ((resolve, reject) => {    
    fs.readFile('./secrets.json', (err, data) => {
        if (err) return reject(err);
        
        console.log('read secret');
        return resolve(JSON.parse(data));
    });
})
.then((secrets) => {
    let token = secrets.token;
    client.login(token);
})
.catch((err) => {
    console.error('Error!');
    console.error(err.message);
})