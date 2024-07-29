/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	function splitEscapePath(sPropertyPath) {
		const sReplaceEscapeWithDummy = sPropertyPath.replaceAll("\\/", "*");
		const aPath = sReplaceEscapeWithDummy.split("/");
		return aPath.map((element) => element.replaceAll("*", "/"));
	}

	function setPropValueByPath(oEntityProp, oRoot) {
		let aPath;
		if (oEntityProp.propertyPath.includes("\\")) {
			aPath = splitEscapePath(oEntityProp.propertyPath);
		} else {
			aPath = oEntityProp.propertyPath.split("/");
		}
		const valueByPath = ObjectPath.get(aPath, oRoot);

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
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]|sap.ui.fl.apply._internal.flexObjects.FlexObject} vChanges - Changes to be merged which includes propertyPath and propertyValue
	 * @param {string} oRootPath - root context where the propertyPath starts
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.suite.ui.generic.template
	 */
	return function(vChanges, oRootPath) {
		if (Array.isArray(vChanges)) {
			vChanges.forEach(function(oEntityProp) {
				setPropValueByPath(oEntityProp, oRootPath);
			});
		} else {
			setPropValueByPath(vChanges, oRootPath);
		}
	};
});
