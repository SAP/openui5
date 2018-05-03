/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/base/util/values"
], function(
	isPlainObject,
	values
) {
	"use strict";

	/**
	 * Checks if value is in collection
	 *
	 * @function
	 * @private
	 * @exports sap/base/util/includes
	 * @param {Array|object} vCollection - Collection to be checked
	 * @param {*} vValue - The value to be checked
	 * @throws {TypeError} when vCollection is of an unsupported type
	 * @returns {boolean} - true if value is in the collection
	 * @private
	 */

	return function includes(vCollection, vValue) {
		if (Array.isArray(vCollection)) {
			return vCollection.indexOf(vValue) !== -1;
		} else if (isPlainObject(vCollection)) {
			return values(vCollection).indexOf(vValue) !== -1;
		} else {
			throw new TypeError('vCollection must be an array or a plain object');
		}
	};
});