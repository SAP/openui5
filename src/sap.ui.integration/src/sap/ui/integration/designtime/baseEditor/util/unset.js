/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/base/util/isPlainObject",
	"sap/base/util/isEmptyObject"
], function (
	ObjectPath,
	isPlainObject,
	isEmptyObject
) {
	"use strict";

	/**
	 * @function
	 *
	 * Remove an objects attribute under a specified path and cleanup empty parents recursively.
	 *
	 * @since 1.76
	 * @param {string[]} aParts - Path to property to remove
	 * @param {object} oObject - Object to modify
	 * @return {object} The modified object
	 * @experimental
	 * @private
	 */

	function unset(aParts, oObject) {
		var mContainer = ObjectPath.get(aParts.slice(0, -1), oObject);
		if (mContainer) {
			delete mContainer[aParts[aParts.length - 1]];

			return (
				Array.isArray(mContainer) && mContainer.length === 0
				|| isPlainObject(mContainer) && isEmptyObject(mContainer)
					? unset(aParts.slice(0, -1), oObject)
					: oObject
			);
		}
	}

	return unset;
});