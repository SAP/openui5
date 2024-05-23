/*!
 * ${copyright}
 */
sap.ui.define([
], () => {
	"use strict";

	const rCamelCase = /[-\.]([a-z0-9])/ig;
	const fnCamelize = function (sString) {
		const sNormalizedString = sString.replace( rCamelCase, function( sMatch, sChar ) {
			return sChar.toUpperCase();
		});
		if (/^[a-z][A-Za-z0-9]*$/.test(sNormalizedString)) {
			return sNormalizedString;
		}
		return undefined;
	};

	return fnCamelize;
});