/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/base/util/each"
], function (
	isPlainObject,
	each
) {
	"use strict";

	/**
	* Escapes object literals (plain objects) which are passed as settings map to a ManagedObject
	* @param {object} oArguments - Array-like object with a set of arguments
	* @param {function} [fnValidator] - Validator function. The validator is invoked with 2 arguments: (sKey, oValue).
	*                                   When <code>true</code> is returned, then object will be escaped.
	* @returns {Array} Array of arguments with escaped object literals
	* @function
	* @experimental
	* @private
	*/
	return function (oArguments, fnValidator) {
		fnValidator = fnValidator || function () { return true; };
		var aArguments = Array.from(oArguments);
		var iSettingsPosition = typeof aArguments[0] !== "string" && aArguments[0] !== undefined ? 0 : 1;


		if (isPlainObject(aArguments[iSettingsPosition])) {
			var mSettings = Object.assign({}, aArguments[iSettingsPosition]);

			each(mSettings, function (sKey, vValue) {
				if (
					isPlainObject(vValue)
					&& fnValidator(vValue, sKey)
				) {
					mSettings[sKey] = Object.assign({}, vValue, {
						ui5object: true
					});
				}
			});

			aArguments[iSettingsPosition] = mSettings;
		}

		return aArguments;
	};
});
