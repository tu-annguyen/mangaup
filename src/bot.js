require('dotenv').config();

const { Client } = require('discord.js');
const client = new Client({
  partials: ['MESSAGE', 'REACTION']
});

const URL = 'https://www.mangaupdates.com/rss.php';
const fetch = require('node-fetch');
const JSDOM = require('jsdom');
const DOMParser = new JSDOM.JSDOM('').window.DOMParser;
const parser = new DOMParser;
const kaguya = 'https://www.mangaupdates.com/series.html?id=121872';

const PREFIX = "$";

client.on('ready', () => {
  console.log(`${client.user.tag}`)
});

client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === 'check-kaguya') {
      if (args.length === 0) {
        fetch(URL)
        .then(response => response.text())
        .then(str => parser.parseFromString(str, "text/xml"))
        .then(data => {
          const links = data.getElementsByTagName('link');
          var updated = 0;
          for(i = 1; i < links.length; i++) {
            if(links[i].textContent === kaguya) {
              updated = 1;
            }
          }
          if(updated) message.channel.send('A new chapter of Kaguya has been released.');
          else message.channel.send('No new chapter of Kaguya has been found.');
        });
      } else {
        message.channel.send('Invalid command. Please remove arguments.')
      }
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);