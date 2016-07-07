'use strict';

var Flamingo = require('../lib/flamingo');

var token = process.env.BOT_API_KEY || require('../token');
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;

var flamingo = new Flamingo({
	token : token,
	dbPath : dbPath,
	name : name
});

flamingo.run();