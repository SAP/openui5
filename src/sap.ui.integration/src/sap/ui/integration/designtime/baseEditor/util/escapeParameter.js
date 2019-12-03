/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isPlainObject"
], function (
	isPlainObject
) {
	"use strict";

	/**
	* Escapes a special parameter of a set of arguments.
	* @param {object} oArguments - Object with a set of arguments.
	* @param {string} sParameterName - Name of the parameter which has to be escaped.
	* @returns {Array} Array of arguments where the given parameter is escaped.
	* @function
	* @experimental
	* @private
	*/
	return function (oArguments, sParameterName) {
		var aArguments = Array.from(oArguments);
		var iSettingsPosition = typeof aArguments[0] !== "string" && aArguments[0] !== undefined ? 0 : 1;

		if (isPlainObject(aArguments[iSettingsPosition])) {
			var mSettings = Object.assign({}, aArguments[iSettingsPosition]);
			if (isPlainObject(mSettings[sParameterName])) {
				mSettings[sParameterName] = Object.assign({}, mSettings[sParameterName], {
					ui5object: true
				});
				aArguments[iSettingsPosition] = mSettings;
			}
		}

		return aArguments;
	};
});
