/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/base/util/isPlainObject",
	"sap/base/util/isEmptyObject"
], function(
	ObjectPath,
	isPlainObject,
	isEmptyObject
) {
	"use strict";

	/**
	 * Removes a specified key from an object or an array and recursively cleans up the hierarchy.
	 * The passed object or array is mutated.
	 *
	 * @example <caption>Unsetting an Object Key</caption>
	 * unset({
	 *   a: {
	 *     b: "Hello World"
	 *   }
	 * }, ["a", "b"]);
	 *
	 * // Result:
	 * // {}
	 *
	 * @example <caption>Unsetting an Object Key with a Maximum Cleanup Depth</caption>
	 * unset({
	 *   a: {
	 *     b: "Hello World"
	 *   }
	 * }, ["a", "b"], 0);
	 *
	 * // Result:
	 * // {
	 * //   a: {}
	 * // }
	 *
	 * @example <caption>Unsetting an Array Item</caption>
	 * unset({
	 *   a: ["foo", "bar"]
	 * }, ["a", "0"]);
	 *
	 * // Result:
	 * // {
	 * //   a: ["Bar"]
	 * // }
	 *
	 * @param {object|array} oObject - Plain object or array to modify
	 * @param {string[]} aParts - Path to property to remove
	 * @param {int} [iMaxCleanupDepth] - Maximum depth for recursive cleanup of empty parents.
	 * By default, there is no limit.
	 * @return {object|array} The modified object or array
	 *
	 * @alias module:sap/ui/integration/designtime/baseEditor/util/unset
	 * @author SAP SE
	 * @since 1.76
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.76
	 * @ui5-restricted
	 */

	function unset(oObject, aParts, iMaxCleanupDepth) {
		var aContainerParts = aParts.slice(0, -1);
		var oContainer = aContainerParts.length > 0
			? ObjectPath.get(aContainerParts, oObject)
			: oObject;

		var sKey = aParts[aParts.length - 1];
		if (Array.isArray(oContainer)) {
			oContainer.splice(sKey, 1);
		} else {
			delete oContainer[sKey];
		}

		return (
			aContainerParts.length > 0
			&& !(iMaxCleanupDepth <= 0)
			&& ((
					Array.isArray(oContainer)
					&& oContainer.length === 0
				) || (
					isPlainObject(oContainer)
					&& isEmptyObject(oContainer)
				)
			)
				? unset(oObject, aContainerParts, iMaxCleanupDepth ? iMaxCleanupDepth - 1 : undefined)
				: oObject
		);
	}

	return unset;
});