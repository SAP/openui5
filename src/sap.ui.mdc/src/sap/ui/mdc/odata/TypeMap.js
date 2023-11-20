/*!
 * ${copyright}
 */

sap.ui.define([
	'../DefaultTypeMap',
	'sap/ui/mdc/enums/BaseType'
], function(DefaultTypeMap, BaseType) {
"use strict";

	/**
	* @class OData-specific {@link sap.ui.mdc.util.TypeMap TypeMap} configuration.
	*
	* <b>Note:</b> This {@link sap.ui.mdc.util.TypeMap TypeMap} implementation contains the following types:
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
	* <li>{@link sap.ui.model.odata.type.Stream} (alias <code>Edm.Binary</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Boolean} (alias <code>Edm.Boolean</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Byte} (alias <code>Edm.Byte</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Date} (alias <code>Edm.Date</code>)</li>
	* <li>{@link sap.ui.model.odata.type.DateTime} (alias <code>Edm.DateTime</code>)</li>
	* <li>{@link sap.ui.model.odata.type.DateTimeOffset} (alias <code>Edm.DateTimeOffset</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Decimal} (alias <code>Edm.Decimal</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Double} (alias <code>Edm.Double</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Single} (alias <code>Edm.Float</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Guid} (alias <code>Edm.Guid</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Int16} (alias <code>Edm.Int16</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Int32} (alias <code>Edm.Int32</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Int64} (alias <code>Edm.Int64</code>)</li>
	* <li>{@link sap.ui.model.odata.type.SByte} (alias <code>Edm.SByte</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Single} (alias <code>Edm.Single</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Stream} (alias <code>Edm.Stream</code>)</li>
	* <li>{@link sap.ui.model.odata.type.String} (alias <code>Edm.String</code>)</li>
	* <li>{@link sap.ui.model.odata.type.Time} (alias <code>Edm.Time</code>)</li>
	* <li>{@link sap.ui.model.odata.type.TimeOfDay} (alias <code>Edm.TimeOfDay</code>)</li>
	* </ul>
	*
	* @author SAP SE
	* @version ${version}
	* @public
	* @since 1.114.0
	* @namespace
	* @alias module:sap/ui/mdc/odata/TypeMap
	* @extends module:sap/ui/mdc/DefaultTypeMap
	*/
	const ODataTypeMap = Object.assign({}, DefaultTypeMap);

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

	/*
	 * For {@link sap.ui.model.odata.type.Currency} and {@link sap.ui.model.odata.type.Unit} the
	 * <code>CompositeBinding</code> consists of three parts, <code>Number</code>, <code>Currency</code>/<code>Unit</code> and <code>unit map</code>.
	 * On the first call of <code>formatValue</code> the <code>unit map</code> is analyzed and stored inside the
	 * <code>Type</code>. Later, it is used on parsing. The <code>unit map</code> parsing does not work
	 * without initialization.
	 *
	 * In the {@link sap.ui.mdc.Field} the <code>Type</code> is created via <code>Binding</code>. So when the value of the {@link sap.ui.mdc.Field Field}
	 * gets the <code>unit map</code> for the first time we need to initialize the type via <code>formatValue</code>.
	 * (As no condition is created if there is no number or unit <code>formatValue</code> might not be called before
	 * first user input.)
	 *
	 * We return the given <code>unit map</code> in the <code>TypeInitialization</code> <code>object</code> to allow to initialize the "cloned"
	 * <code>Currency</code>/<code>Unit</code>-Type (internally used by the two <code>Input</code> controls for number and unit) with the <code>unit map</code>.
	 */
	ODataTypeMap.initializeTypeFromValue = function(oType, vValue) {

		if (oType && this.getBaseType(oType.getMetadata().getName()) === BaseType.Unit && Array.isArray(vValue) && vValue.length > 2) {
			if (vValue[2] !== undefined) {
				const oTypeInitialization = {mCustomUnits: vValue[2]};
				this.initializeInternalType(oType, oTypeInitialization);
				return oTypeInitialization;
			}
		} else {
			return {}; // to mark initialization as finished as not needed for normal types
		}

		return null; // not all needed information are given right now.

	};

	ODataTypeMap.initializeInternalType = function(oType, oTypeInitialization) {

		if (oTypeInitialization && oTypeInitialization.mCustomUnits !== undefined) {
			// if already initialized initialize new type too.
			oType.formatValue([null, null, oTypeInitialization.mCustomUnits], "string");
		}

	};

	ODataTypeMap.freeze();

	return ODataTypeMap;
});