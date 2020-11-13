require('dotenv').config();

const { Client } = require('discord.js');
const client = new Client();

const fetch = require('node-fetch');
const JSDOM = require('jsdom');

const mangaDict = {};

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

    if (CMD_NAME === 'add') {
      if (args.length === 2) {
        // Edit regex to limit only to mangaupdates.com/series.html?id=
        if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(args[1])) {
          if (!(args[0] in mangaDict)) {
            mangaDict[args[0]] = args[1];
            message.reply(`Added \`${args[0]}\` to manga dictionary.`);
          } else message.reply(`\`${args[0]}\` already exists in the manga dictionary.`);
        } else message.channel.send('Please enter a valid URL. The command format should be: `$add <manga-name> https://www.mangaupdates.com/series.html?id=<mangaupdates-ID>`');
      } else message.channel.send('Invalid command. The command format should be: `$add <manga-name> https://www.mangaupdates.com/series.html?id=<mangaupdates-ID>`');
    }
    
    if (CMD_NAME === 'check') {
      if (args.length === 1) {
        mangaName = args[0]
        const mangaUpdatesRSS = 'https://www.mangaupdates.com/rss.php';
        const DOMParser = new JSDOM.JSDOM('').window.DOMParser;
        const parser = new DOMParser;
        fetch(mangaUpdatesRSS)
        .then(response => response.text())
        .then(str => parser.parseFromString(str, "text/xml"))
        .then(data => {
          const links = data.getElementsByTagName('link');
          for(i = 1; i < links.length; i++) {
            if(args[0] in mangaDict) {
              if(links[i].textContent === mangaDict[args[0]]) {
                message.reply(`A new chapter of \`${args[0]}\` has been released.`);
                return;
              }
            } else {
              message.reply(`\`${args[0]}\` not found in manga dictionary.`);
              return;
            }
          }
          message.reply(`No new chapter of \`${args[0]}\` has been released.`);
        });
      } else {
        message.channel.send('Invalid command. The command format should be: `$check <manga-name>`')
      }
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);