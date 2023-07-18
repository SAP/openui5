/*!
 * ${copyright}
 */

sap.ui.define([
	'../TypeMap',
	'sap/ui/mdc/enums/BaseType'
], function(ODataTypeMap, BaseType) {
"use strict";

	/**
	* @class ODataV4-specific <code>TypeMap</code> configuration
	*
	* <b>Note:</b> This <code>TypeMap</code> implementation contains the following types including ODataV4-specific configuration:
	*
	* <ul>
	* <li>{@link sap.ui.model.type.Boolean} (alias <code>Boolean</code></code>)</li>
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
	* @alias module:sap/ui/mdc/odata/v4/TypeMap
	* @extends module:sap/ui/mdc/odata/TypeMap
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