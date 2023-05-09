/*!
 * ${copyright}
 */

sap.ui.define([
	'../DefaultTypeMap',
	'sap/ui/mdc/enum/BaseType'
], function(DefaultTypeMap, BaseType) {
"use strict";

	/**
	* OData-specific type configuration map for MDC Delegates
	*
	* @extends sap.ui.mdc.DefaultTypeMap
	* @author SAP SE
	* @version ${version}
	* @private
	* @ui5-restricted sap.fe
	* @MDC_PUBLIC_CANDIDATE
	* @experimental As of version 1.114.0
	* @alias sap.ui.mdc.odata.TypeMap
	* @since 1.114.0
	* @author SAP SE
	*/
	var ODataTypeMap = Object.assign({}, DefaultTypeMap);

	ODataTypeMap.getDateTimeBaseType = function (oFormatOptions, oConstraints) {
		if (oConstraints && oConstraints.displayFormat === "Date") {
			return BaseType.Date;
		} else {
			return BaseType.DateTime;
		}
	};

	ODataTypeMap.import(DefaultTypeMap);

	ODataTypeMap.set("sap.ui.model.odata.type.Boolean", BaseType.Boolean);
	ODataTypeMap.set("sap.ui.model.odata.type.Byte", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Currency", DefaultTypeMap.getUnitBaseType, DefaultTypeMap.getUnitOptions);
	ODataTypeMap.set("sap.ui.model.odata.type.Date", BaseType.Date);
	ODataTypeMap.set("sap.ui.model.odata.type.DateTime", ODataTypeMap.getDateTimeBaseType);
	ODataTypeMap.set("sap.ui.model.odata.type.DateTimeOffset", BaseType.DateTime);
	ODataTypeMap.set("sap.ui.model.odata.type.DateTimeWithTimezone", BaseType.DateTime);
	ODataTypeMap.set("sap.ui.model.odata.type.Decimal", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Double", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Guid", BaseType.String);
	ODataTypeMap.set("sap.ui.model.odata.type.Int16", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Int32", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Int64", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.SByte", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Single", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Stream", BaseType.String);
	ODataTypeMap.set("sap.ui.model.odata.type.String", BaseType.String);
	ODataTypeMap.set("sap.ui.model.odata.type.Time", BaseType.Time);
	ODataTypeMap.set("sap.ui.model.odata.type.TimeOfDay", BaseType.Time);
	ODataTypeMap.set("sap.ui.model.odata.type.Unit", DefaultTypeMap.getUnitBaseType, DefaultTypeMap.getUnitOptions);


	// Alias configuration
	ODataTypeMap.setAlias("Edm.Binary", "sap.ui.model.odata.type.Stream");
	ODataTypeMap.setAlias("Edm.Boolean", "sap.ui.model.odata.type.Boolean");
	ODataTypeMap.setAlias("Edm.Byte", "sap.ui.model.odata.type.Byte");
	ODataTypeMap.setAlias("Edm.Date", "sap.ui.model.odata.type.Date");
	ODataTypeMap.setAlias("Edm.DateTime", "sap.ui.model.odata.type.DateTime");
	ODataTypeMap.setAlias("Edm.DateTimeOffset", "sap.ui.model.odata.type.DateTimeOffset");
	ODataTypeMap.setAlias("Edm.Decimal", "sap.ui.model.odata.type.Decimal");
	ODataTypeMap.setAlias("Edm.Double", "sap.ui.model.odata.type.Double");
	ODataTypeMap.setAlias("Edm.Float", "sap.ui.model.odata.type.Single");
	ODataTypeMap.setAlias("Edm.Guid", "sap.ui.model.odata.type.Guid");
	ODataTypeMap.setAlias("Edm.Int16", "sap.ui.model.odata.type.Int16");
	ODataTypeMap.setAlias("Edm.Int32", "sap.ui.model.odata.type.Int32");
	ODataTypeMap.setAlias("Edm.Int64", "sap.ui.model.odata.type.Int64");
	ODataTypeMap.setAlias("Edm.SByte", "sap.ui.model.odata.type.SByte");
	ODataTypeMap.setAlias("Edm.Single", "sap.ui.model.odata.type.Single");
	ODataTypeMap.setAlias("Edm.Stream", "sap.ui.model.odata.type.Stream");
	ODataTypeMap.setAlias("Edm.String", "sap.ui.model.odata.type.String");
	ODataTypeMap.setAlias("Edm.Time", "sap.ui.model.odata.type.Time");
	ODataTypeMap.setAlias("Edm.TimeOfDay", "sap.ui.model.odata.type.TimeOfDay");



	ODataTypeMap.freeze();

	return ODataTypeMap;
});