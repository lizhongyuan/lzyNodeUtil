

const log4js = require('log4js');
const log4jsConfig = require('../../log4js.json');
log4js.configure(log4jsConfig, {cwd:'./logs'});

module.exports = log4js;
