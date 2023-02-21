const proxy = require("./lib/proxy.js");

module.exports = async function ({ options }) {
	return proxy(options.configuration);
}
