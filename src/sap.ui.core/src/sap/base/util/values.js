/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/util/isPlainObject"
], function(
	isPlainObject
) {
	"use strict";

	/**
	 * Returns values from the object
	 *
	 * @function
	 * @private
	 * @exports sap/base/util/values
	 * @param {object} mObject - Object to be extracted
	 * @returns {*[]} - array of object values
	 * @throws {TypeError} when mObject is not a plain object
	 * @private
	 */

	return function values(mObject) {
		if (!isPlainObject(mObject)) {
			throw new TypeError("mObject must be a plain javascript object");
		}

		return Object.keys(mObject).map(function (vValue) {
			return mObject[vValue];
		});
	};
});