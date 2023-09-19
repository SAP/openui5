/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/util/TypeMap',
	'sap/ui/mdc/enums/BaseType'
], function(TypeMap, BaseType) {
"use strict";

	/**
	*
	* Generic <code>TypeMap</code> configuration for simplistic usecases
	*
	* <b>Note:</b> This <code>TypeMap</code> implementation contains the following types:
	*
	* <ul>
	* <li>{@link sap.ui.model.type.Boolean} (alias <code>Boolean</code>)</li>
	* <li>{@link sap.ui.model.type.Currency} (alias <code>Currency</code>)</li>
	* <li>{@link sap.ui.model.type.Date} (alias <code>Date</code>)</li>
	* <li>{@link sap.ui.model.type.DateTime} (alias <code>DateTime</code>)</li>
	* <li>{@link sap.ui.model.type.Float} (alias <code>Float</code>)</li>
	* <li>{@link sap.ui.model.type.Integer} (alias <code>Integer</code>)</li>
	* <li>{@link sap.ui.model.type.String} (alias <code>String</code>)</li>
	* <li>{@link sap.ui.model.type.Time} (alias <code>Time</code>)</li>
	* <li>{@link sap.ui.model.type.Unit} (alias <code>Unit</code>)</li>
	* </ul>
	*
	* @author SAP SE
	* @version ${version}
	* @public
	* @since 1.114.0
	* @namespace
	* @alias module:sap/ui/mdc/DefaultTypeMap
	* @extends module:sap/ui/mdc/util/TypeMap
	*/
	const DefaultTypeMap = Object.assign({}, TypeMap);

	DefaultTypeMap.getUnitBaseType = function (oFormatOptions, oConstraints) {
		if (!oFormatOptions || ((!oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure) && (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber))) {
			return BaseType.Unit;
		} else if (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber) {
			return BaseType.Numeric; // only number to show
		} else {
			return BaseType.String; // only unit to show
		}
	};

	DefaultTypeMap.getUnitOptions = function (oFormatOptions, oConstraints, oCustomOptions) {
		if (oCustomOptions) {
			oFormatOptions = Object.assign({}, oFormatOptions, {strictParsing: true, showNumber: !!oCustomOptions.showNumber, showMeasure: !!oCustomOptions.showMeasure});
		}
		if (oFormatOptions && oFormatOptions.hasOwnProperty("unitOptional")) { // as per default set if both, showNumber and showMeasure set
			delete oFormatOptions.unitOptional; // let the type determine the right default
		}
		return [oFormatOptions, oConstraints];
	};

	DefaultTypeMap.set("sap.ui.model.type.Boolean", BaseType.Boolean);
	DefaultTypeMap.set("sap.ui.model.type.Currency", DefaultTypeMap.getUnitBaseType, DefaultTypeMap.getUnitOptions);
	DefaultTypeMap.set("sap.ui.model.type.Date", BaseType.Date);
	DefaultTypeMap.set("sap.ui.model.type.DateTime", BaseType.DateTime);
	DefaultTypeMap.set("sap.ui.model.type.Float", BaseType.Numeric);
	DefaultTypeMap.set("sap.ui.model.type.Integer", BaseType.Numeric);
	DefaultTypeMap.set("sap.ui.model.type.String", BaseType.String);
	DefaultTypeMap.set("sap.ui.model.type.Time", BaseType.Time);
	DefaultTypeMap.set("sap.ui.model.type.Unit", DefaultTypeMap.getUnitBaseType, DefaultTypeMap.getUnitOptions);

	DefaultTypeMap.setAlias("Boolean", "sap.ui.model.type.Boolean");
	DefaultTypeMap.setAlias("Currency", "sap.ui.model.type.Currency");
	DefaultTypeMap.setAlias("Date", "sap.ui.model.type.Date");
	DefaultTypeMap.setAlias("DateTime", "sap.ui.model.type.DateTime");
	DefaultTypeMap.setAlias("Float", "sap.ui.model.type.Float");
	DefaultTypeMap.setAlias("Integer", "sap.ui.model.type.Integer");
	DefaultTypeMap.setAlias("String", "sap.ui.model.type.String");
	DefaultTypeMap.setAlias("Time", "sap.ui.model.type.Time");
	DefaultTypeMap.setAlias("Unit","sap.ui.model.type.Unit");

	DefaultTypeMap.freeze();

	return DefaultTypeMap;
});