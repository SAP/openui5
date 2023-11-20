/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_isNil",
	"sap/base/util/each",
	"sap/base/util/isPlainObject",
	"sap/base/util/isEmptyObject"
], function(
	_isNil,
	each,
	isPlainObject,
	isEmptyObject
) {
	"use strict";

	/**
	 * Recursively removes undefined/null/[]/{} from an object while mutating the object.
	 *
	 * @param {object} oObjectToMutate - Object to clean up
	 *
	 * @since 1.81
	 *
	 * @private
	 * @experimental
	 * @ui5-restricted
	 */

	function cleanupDesigntimeMetadata (oObjectToMutate) {
		each(oObjectToMutate, function (sKey, vValue) {
			if (isPlainObject(vValue)) {
				cleanupDesigntimeMetadata(vValue);
			}

			if (
				_isNil(vValue)
				|| Array.isArray(vValue) && vValue.length === 0
				|| isPlainObject(vValue) && isEmptyObject(vValue)
			) {
				delete oObjectToMutate[sKey];
			}
		});
	}

	return cleanupDesigntimeMetadata;
});