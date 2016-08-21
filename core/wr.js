
var util = require("../util.js");
var consts = require('../consts.js');
var user = JSON.parse(process.env.user);

var args = process.env.message.split(" ");

var request = require('request');
var channame = process.env.channel.substring(1);
var game = args.splice(1).join(" ").split(",")[0];
var category0 = process.env.message.split(", ")[1];

if(game === undefined || game === "") {
  request('https://api.twitch.tv/kraken/channels/' + channame, (err, res, body) => {
    var gamet = JSON.parse(body).game;
    request('http://www.speedrun.com/api/v1/games?name=' + gamet + '&max=1&embed=categories', (err, res, body) => {
      if(!err) {
        var category1 = JSON.parse(body).data[0].categories.data[0].name;
        var title = JSON.parse(body).data[0].names.international;
        request(JSON.parse(body).data[0].links[9].uri + '?embed=players', (err, res, body) => {
          if(!err) {
            var d = JSON.parse(body).data.runs[0].run.times.primary_t;
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            var time = ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
            var weblink = JSON.parse(body).data.runs[0].run.weblink;
            var player = JSON.parse(body).data.players.data[0].names.international
            util.say(process.env.channel, "The world record in " + title + ", " + category1 + " is " + time + " by " + player + " | Run page: " + weblink);
          }
        });
      }
    });
  });
} else if(game !== "" || game !== undefined) {
  if(category0 === "" || category0 === undefined) {
    request('http://www.speedrun.com/api/v1/games?name=' + game + '&max=1&embed=categories', (err, res, body) => {
      if(!err) {
        var category1 = JSON.parse(body).data[0].categories.data[0].name;
        var title = JSON.parse(body).data[0].names.international;
        var gameid = JSON.parse(body).data[0].id;
        var cateid =JSON.parse(body).data[0].categories.data[0].id;
        request('http://www.speedrun.com/api/v1/leaderboards/' + gameid + '/category/' + cateid + '?embed=players', (err, res, body) => {
          if(!err) {
            var d = JSON.parse(body).data.runs[0].run.times.primary_t;
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            var time = ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
            var weblink = JSON.parse(body).data.runs[0].run.weblink;
            var player = JSON.parse(body).data.players.data[0].names.international
            util.say(process.env.channel, "The world record in " + title + ", " + category1 + " is " + time + " by " + player + " | Run page: " + weblink);
          }
        });
      }
    });
  } else if(category0 !== "" || category0 !== undefined) {
    request('http://www.speedrun.com/api/v1/games?name=' + game + '&max=1&embed=categories', (err, res, body) => {
      var title = JSON.parse(body).data[0].names.international;
      var gameid = JSON.parse(body).data[0].id;
      request('http://www.speedrun.com/api/v1/leaderboards/' + gameid + '/category/' + category0 + '?embed=category,players', (err, res, body) => {
        if(!err) {
          var category3 = JSON.parse(body).data.category.data.name;
          var d = JSON.parse(body).data.runs[0].run.times.primary_t;
          var h = Math.floor(d / 3600);
          var m = Math.floor(d % 3600 / 60);
          var s = Math.floor(d % 3600 % 60);
          var time = ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
          var weblink = JSON.parse(body).data.runs[0].run.weblink;
          var userlink = JSON.parse(body).data.runs[0].run.players[0].uri;
          var player = JSON.parse(body).data.players.data[0].names.international;
          util.say(process.env.channel, "The world record in " + title + ", " + category3 + " is " + time + " by " + player + " | Run page: " + weblink);
        }
      });
    });
  }
}
