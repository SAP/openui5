/*!
 * ${copyright}
 */

sap.ui.define([
	'../TypeMap',
	'sap/ui/mdc/enums/BaseType'
], function(ODataTypeMap, BaseType) {
"use strict";

	/**
	* ODataV4-specific type configuration map for MDC Delegates
	*
	* @extends sap.ui.mdc.odata.TypeMap
	* @author SAP SE
	* @version ${version}
	* @public
	* @alias sap.ui.mdc.odata.v4.TypeMap
	* @since 1.114.0
	* @author SAP SE
	*/
	var ODataV4TypeMap = Object.assign({}, ODataTypeMap);

	ODataV4TypeMap.addV4Constraint = function (oFormatOptions, oConstraints, oCustomOptions) {
		return [oFormatOptions, Object.assign({}, oConstraints, {V4: true})];
	};

	ODataV4TypeMap.import(ODataTypeMap);

	ODataV4TypeMap.set("sap.ui.model.odata.type.DateTimeOffset", BaseType.DateTime, ODataV4TypeMap.addV4Constraint);

	ODataV4TypeMap.freeze();

	return ODataV4TypeMap;
});