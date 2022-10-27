/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Returns values from an object.
	 *
	 * <b>Note:</b>Whenever possible, please try to use the native function <code>Object.values</code> instead. Especially, if you don't need to rely on handling null values as argument.
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

			return Object.values(mObject);
	};

	return fnValues;
});
