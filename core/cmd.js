
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !cmd add !poop I poop back and forth.
 * !cmd edit !poop You do, not me.
 * !cmd delete !poop
 */

var static = {
    "help": "!cmd <add|edit|delete> <command> <output text>"
};
module.exports = static;

var intent = args[1];
var cmd = args[2];
var string = args.splice(3).join(" ");

// Add a new custom command
var add = () => {
    // Check for existance. If it exists already, output an error pointing to !cmd edit.
    db.find(db.db(), "customcommand", {
        "Channel": process.env.channel,
        "Command": cmd
    }, (rows) => {
        if( rows.length > 0 ){
            // We have a command already, output a warning
            util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " already exists, did you mean to use !cmd edit?");
        }
        else {
            // remove / if at the beginning of the string to prevent abuse.
            var rslashes = /^\/+/;
            string = string.replace(rslashes, "");

            db.insert(db.db(), "customcommand", {
                "Command": cmd,
                "OutputText": string,
                "Channel": process.env.channel
            }, (rows) => {
                if( rows.affectedRows === 1 ){
                    util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was created.");
                }
                else {
                    console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
                }
            });
        }
    });
};

var edit = () => {
    // Check for existance. If it exists already, output an error pointing to !cmd edit.
    db.find(db.db(), "customcommand", {
        "Channel": process.env.channel,
        "Command": cmd
    }, (rows) => {
        if( rows.length === 1 ){
            var rslashes = /^\/+/;
            string = string.replace(rslashes, "");
            
            db.update(db.db(), "customcommand", "Command='" + cmd + "'", {"OutputText": string}, (rows) => {
                if( rows.affectedRows === 1 ){
                    util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was updated.");
                }
                else {
                    console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
                }
            });
        }
        else if( rows.length > 1 ){
            console.error("ERROR: There are duplicate entries for the channel command " + cmd + " in channel " + process.env.channel + "!");
        }
        else {
            // We don't have a command, output a warning.
            util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " doesn't exist, did you mean to use !cmd add?");
        }
    });
};

var del = () => {
    // Check for existance. If it exists already, output an error pointing to !cmd edit.
    db.find(db.db(), "customcommand", {
        "Channel": process.env.channel,
        "Command": cmd
    }, (rows) => {
        if( rows.length > 0 ){
            if( rows.length > 1 )
                console.error("ERROR: There were duplicate entries for the channel command " + cmd + " in channel " + process.env.channel + "! They have all been removed now.");

            db.delete(db.db(), "customcommand", {"Command": cmd}, (rows) => {
                if( rows.affectedRows === 1 ){
                    util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was deleted.");
                }
                else {
                    console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
                }
            });
        }
        else {
            // We don't have a command, output a warning.
            util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " doesn't exist, did you mean to use !cmd add?");
        }
    });
};

// @NOTE: This function will be a mess. Fix it asap.
var list = (channel, userObj) => {
    var userlevel = 99;
    if( util.checkPermissionCore(channel, userObj, consts.access.broadcaster) )
        userlevel = consts.access.broadcaster;
    if( util.checkPermissionCore(channel, userObj, consts.access.moderator) )
        userlevel = consts.access.moderator;
    if( util.checkPermissionCore(channel, userObj, consts.access.subscriber) )
        userlevel = consts.access.subscriber;
    if(userlevel === 99)
        userlevel = consts.access.everybody;

    // some custom sql
    var sql =   "SELECT * FROM `customcommand` C \
                    INNER JOIN `commandpermission` P \
                ON C.`Command` = P.`Command` AND C.`Channel` = '" + channel + "'\
                WHERE P.`PermissionLevel` >= " + userlevel;

    console.log(sql);

    db.db().query(sql, (err, rows, fields) => {
        if(!err){
            var available_commands = [];

            for(var i = 0; i < rows.length; i++){
                if(rows[i].Command != null && rows[i].PermissionLevel != null){
                    if(util.checkPermissionCore(channel, user, rows[i].PermissionLevel)){
                        available_commands.push(rows[i].Command);
                    }
                }
            }

            util.whisper(user.username, "Commands available to you in chat for " + channel + ": " + available_commands.join(" "));
        }
    });
};

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
    switch(intent){
        case "add":
            add();
            break;
        case "edit":
            edit();
            break;
        case "delete":
            del();
            break;
        case "list":
            list(process.env.channel, user);
            break;
    }
}

// This is here so that we can create alias commands. !commands will be an alias for list
module.exports = {
    "list": list
};
