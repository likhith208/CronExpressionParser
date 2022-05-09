'use strict';

var CronExpression = require('./expression');

function CronParser() {}

/**
 * Wrapper for CronExpression.parser method
 *
 * @public
 * @param {String} expression Input expression
 * @return {Object}
 */
CronParser.parseExpression = function parseExpression (expression) {
  return CronExpression.parse(expression);
};


var args = process.argv ;
CronParser.parseExpression(args[2]);
var newTest = args[2];
var cronCommands = (newTest + '').trim().split(/\s+/);
//console.log("command       " + cronCommands[5]);

module.exports = CronParser;