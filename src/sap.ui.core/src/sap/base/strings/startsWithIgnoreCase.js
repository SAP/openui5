/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Checks whether a given <code>sString</code> starts with <code>sStartString</code>
	 * ignoring the case of both strings.
	 *
	 * @function
	 * @exports sap/base/strings/startsWithIgnoreCase
	 * @param {string} sString String to be checked
	 * @param {string} sStartString The start string to be searched
	 * @returns {boolean} Whether <code>sString</code> starts with <code>sStartString</code>
	 * @see String.prototype.startsWith
	 * @private
	 * @example
	 * startsWithIgnoreCase("fooBaR", "bar") -> false
	 * startsWithIgnoreCase("fooBaR", "foO") -> true
	 * startsWithIgnoreCase("foobar", "") -> false
	 */
	var fnStartsWithIgnoreCase = function(sString, sStartString) {
		if (typeof (sStartString) != "string" || sStartString == "") {
			return false;
		}
		sString = sString.toUpperCase();
		sStartString = sStartString.toUpperCase();
		return sString.startsWith(sStartString);
	};
	return fnStartsWithIgnoreCase;

});


