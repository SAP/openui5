"use strict";

const serialize = require("cookie").serialize;
const parse = require("set-cookie-parser").parse;
function noop($) {
	return $;
}

module.exports = function(cookies) {
	// Can't use cookie.parse as it only parses 'Cookie' headers, not 'Set-Cookie'
	// See https://github.com/jshttp/cookie/issues/58
	return parse(cookies, {
		// Do not decode as we don't want to change the value
		decodeValues: false,
		map: false // ensure to return array
	}).map(function(cookie) {
		return serialize(cookie.name, cookie.value, {
			// Do not pass "secure", "domain", "path", "sameSite" to remove them from the cookie
			expires: cookie.expires,
			maxAge: cookie.maxAge,
			httpOnly: cookie.httpOnly,

			// As we didn't decode, we should also not encode the value
			// Encoding can't be disabled so just providing a "noop" function
			// that returns the given value
			encode: noop
		});
	});
};
