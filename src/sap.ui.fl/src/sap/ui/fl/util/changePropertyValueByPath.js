/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	function setPropValueByPath(oEntityProp, oRoot) {
		var aPath = oEntityProp.propertyPath.split("/");
		var valueByPath = ObjectPath.get(aPath, oRoot);

		if (valueByPath && oEntityProp.operation === "INSERT") {
			throw new Error("Path has already a value. 'INSERT' operation is not appropriate.");
		}
		if (!valueByPath && oEntityProp.operation === "UPDATE") {
			throw new Error("Path does not contain a value. 'UPDATE' operation is not appropriate.");
		}

		ObjectPath.set(aPath, oEntityProp.propertyValue, oRoot);
	}

	/**
	 * Use to update property value for propertyPath which starts in provided root context
	 *
	 * @param {Array|Object} oChanges - changes to be merged which includes propertyPath and propertyValue
	 * @param {String} oRootPath - root context where the propertyPath starts
	 * @ui5-restricted sap.ui.fl
	 */
	return function (oChanges, oRootPath) {
		if (Array.isArray(oChanges)) {
			oChanges.forEach(function (oEntityProp) {
				setPropValueByPath(oEntityProp, oRootPath);
			});
		} else {
			setPropValueByPath(oChanges, oRootPath);
		}
	};
});
