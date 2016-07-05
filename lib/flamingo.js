'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var Flamingo = function Constructor(settings) {
	this.settings = settings;
	this.settings.name = this.settings.name || 'flamingo';
	this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'flamingo.db');

	this.user = null;
	this.db = null;
};

util.inherits(Flamingo, Bot);

Flamingo.prototype.run = function () {
	Flamingo.super_.call(this, this.settings);

	this.on('start', this._onStart);
	this.on('message', this._onMessage);
};

Flamingo.prototype._onStart = function () {
	this._loadBotUser();
	this._connectDb();
	this._firstRunCheck();
};

Flamingo.prototype._loadBotUser = function () {
	var self = this;
	this.user = this.users.filter(function (user) {
		return user.name === self.name;
	})[0];
};

Flamingo.prototype._connectDb = function () {
	if (!fs.existsSync(this.dbPath)) {
		console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
	}

	this.db = new SQLite.Database(this.dbPath);
};

Flamingo.prototype._firstRunCheck = function () {
	var self = this;
	self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
		if (err) {
			return console.error('DATABASE ERROR: ', err);
		}

		var currentTime = (new Date()).toJSON();

		if(!record) {
			self._welcomeMessage();
			return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
		}

		self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
	});
};

Flamingo.prototype._welcomeMessage = function () {
	this.postMessageChannel(this.channels[0].name, 'Hi guys, roundhouse-kick anyone?' + 
		'\n I can tell jokes, but very honest ones. Just say `Chuck Norris` or `' + this.name + '` to invoke me!',
		{as_user: true});
};

Flamingo.prototype._onMessage = function (message) {
	if (this._isChatMessage(message) && this._isChannelConversation(message)
			&& !this._isFromFlamingo(message) && this._isMentioningChuckNorris(message)
		 ) {
		this._replyWithRandomJoke(message);
	}
};

Flamingo.prototype._isChatMessage = function (message) {
	return message.type === 'message' && Boolean(message.text);
};