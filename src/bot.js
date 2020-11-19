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
        fetch(mangaUpdatesRSS, {
          method: 'GET',
          headers: {'If-Modified-Since': new Date().toUTCString()}
        })
        .then(res => {
          console.log(res.status);
          res.text().then((htmlTxt) => {
            var parser = new DOMParser();
            let doc = parser.parseFromString(htmlTxt, 'text/xml');
            var items = doc.querySelectorAll('item');
            for(i = 0; i < items.length; i++) {
              var mangaLink = items[i].querySelector('link').textContent;
              if(mangaName in mangaDict) {
                if(mangaLink === mangaDict[mangaName]) {
                  message.reply(`A new chapter of \`${mangaName}\` has been released.`);
                  return;
                }
              } else {
                message.reply(`\`${args[0]}\` not found in manga dictionary.`);
                return;
              }
            }
            message.reply(`No new chapter of \`${args[0]}\` has been released.`);
            })
          }).catch(() => console.error('Error in fetching the website.'));
      } else {
        message.channel.send('Invalid command. The command format should be: `$check <manga-name>`');
      }
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);