/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Returns values from an object.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/util/values
	 * @param {object} mObject - Object to be extracted
	 * @returns {Array.<*>} - array of object values, if object does not contain values, an empty array will be returned
	 * @public
	 */
	var fnValues = function values(mObject) {
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

	return fnValues;
});