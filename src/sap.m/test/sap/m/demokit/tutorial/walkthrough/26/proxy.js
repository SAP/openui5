/* global require */
var cors_proxy = require('cors-anywhere');

// Listen on a specific IP Address
// 0.0.0.0 equals localhost
var host = '0.0.0.0';

// Listen on a specific port, adjust if necessary
var port = 8081;

cors_proxy.createServer({
	originWhitelist: [], // Allow all origins
	requireHeader: ['origin', 'x-requested-with'],
	removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function () {
	"use strict";

	/* eslint-disable no-console */
	console.log('Running CORS Anywhere on ' + host + ':' + port);
	/* eslint-enable no-console */
});