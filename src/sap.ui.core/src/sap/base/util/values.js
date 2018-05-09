/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Returns values from an object
	 *
	 * @function
	 * @exports sap/base/util/values
	 * @param {object} mObject - Object to be extracted
	 * @returns {Array.<*>} - array of object values, if object does not contain values, an empty array will be returned
	 * @private
	 */
	return function values(mObject) {
		// Default is always an empty array
		if (
			typeof mObject === "undefined"
			|| mObject === null
			|| mObject !== mObject // eslint-disable-line no-self-compare
		) {
			return [];
		}

		// Object.values is not supported in IE
		if (typeof Object.values === 'function') {
			return Object.values(mObject);
		}

		if (typeof mObject === 'string') {
			return mObject.split('');
		}

		if (typeof mObject !== 'object') {
			return [];
		}

		return Object.keys(mObject).map(function (vValue) {
			return mObject[vValue];
		});
	};
});