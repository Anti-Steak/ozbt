var util = require("../util.js");
var consts = require('../consts.js');
var user = JSON.parse(process.env.user);

var args = process.env.message.split(" ");

var request = require('request');
var channame = process.env.channel.substring(1);
var game = args.splice(1).join(" ");

if(game === undefined || game === "") {
  request('https://api.twitch.tv/kraken/channels/' + channame, (err, res, body) => {
    var gamet = JSON.parse(body).game;
    request('http://www.speedrun.com/api/v1/games?name=' + gamet + '&max=1&embed=categories', (err, res, body) => {
      if(!err) {
        var link = 'http://www.speedrun.com/' + JSON.parse(body).data[0].abbreviation;
        util.say(process.env.channel, "The leaderboards for " + gamet + " can be found here: " + link);
      }
    });
  });
} else {
  request('http://www.speedrun.com/api/v1/games?name=' + game + '&max=1&embed=categories', (err, res, body) => {
    if(!err) {
      var link = 'http://www.speedrun.com/' + JSON.parse(body).data[0].abbreviation;
      var title = JSON.parse(body).data[0].names.international
      util.say(process.env.channel, "The leaderboards for " + title + " can be found here: " + link);
    }
  });
}
