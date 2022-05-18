/* !
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject"
], function(
	ObjectPath,
	FlexObject
) {
	"use strict";

	/**
	 * @enum {string}
	 * Valid flex object types.
	 *
	 * @alias sap.ui.fl.apply._internal.flexObjects.FlexObjectFactory.FLEX_OBJECT_TYPES
	 * @private
	 */
	var FLEX_OBJECT_TYPES = {
		BASE_FLEX_OBJECT: FlexObject
	};

	function getFlexObjectClass () {
		return FLEX_OBJECT_TYPES.BASE_FLEX_OBJECT;
	}

	/**
	 * Helper class to create any flex object.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexObjects.FlexObjectFactory
	 * @since 1.100
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var FlexObjectFactory = {};

	/**
	 * Creates a new flex object.
	 *
	 * @param {object} oFileContent - File content
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} The created flex object
	 */
	FlexObjectFactory.createFromFileContent = function (oFileContent) {
		var oNewFileContent = Object.assign({}, oFileContent);
		var FlexObjectClass = getFlexObjectClass(oNewFileContent);
		if (!FlexObjectClass) {
			throw new Error("Unknown file type");
		}
		oNewFileContent.support = Object.assign(
			{ generator: "FlexObjectFactory.createFromFileContent" },
			oNewFileContent.support || {}
		);
		var oMappingInfo = FlexObjectClass.getMappingInfo();
		var mCreationInfo = FlexObjectClass.mapFileContent(oNewFileContent, oMappingInfo);
		var mProperties = Object.entries(mCreationInfo).reduce(function (mPropertyMap, aProperty) {
			ObjectPath.set(aProperty[0].split('.'), aProperty[1], mPropertyMap);
			return mPropertyMap;
		}, {});
		var oFlexObject = new FlexObjectClass(mProperties);
		return oFlexObject;
	};

	return FlexObjectFactory;
});