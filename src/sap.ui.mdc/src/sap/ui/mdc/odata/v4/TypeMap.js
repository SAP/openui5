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
	* <li>sap.ui.model.type.Boolean (alias Boolean)</li>
	* <li>sap.ui.model.type.Currency (alias Currency)</li>
	* <li>sap.ui.model.type.Date (alias Date)</li>
	* <li>sap.ui.model.type.DateTime (alias DateTime)</li>
	* <li>sap.ui.model.type.Float (alias Float)</li>
	* <li>sap.ui.model.type.Integer (alias Integer)</li>
	* <li>sap.ui.model.type.String (alias String)</li>
	* <li>sap.ui.model.type.Time (alias Time)</li>
	* <li>sap.ui.model.type.Unit (alias Unit)</li>
	* <li>sap.ui.model.odata.type.Stream (alias Edm.Binary)</li>
	* <li>sap.ui.model.odata.type.Boolean (alias Edm.Boolean)</li>
	* <li>sap.ui.model.odata.type.Byte (alias Edm.Byte)</li>
	* <li>sap.ui.model.odata.type.Date (alias Edm.Date)</li>
	* <li>sap.ui.model.odata.type.DateTime (alias Edm.DateTime)</li>
	* <li>sap.ui.model.odata.type.DateTimeOffset (alias Edm.DateTimeOffset)</li>
	* <li>sap.ui.model.odata.type.Decimal (alias Edm.Decimal)</li>
	* <li>sap.ui.model.odata.type.Double (alias Edm.Double)</li>
	* <li>sap.ui.model.odata.type.Single (alias Edm.Float)</li>
	* <li>sap.ui.model.odata.type.Guid (alias Edm.Guid)</li>
	* <li>sap.ui.model.odata.type.Int16 (alias Edm.Int16)</li>
	* <li>sap.ui.model.odata.type.Int32 (alias Edm.Int32)</li>
	* <li>sap.ui.model.odata.type.Int64 (alias Edm.Int64)</li>
	* <li>sap.ui.model.odata.type.SByte (alias Edm.SByte)</li>
	* <li>sap.ui.model.odata.type.Single (alias Edm.Single)</li>
	* <li>sap.ui.model.odata.type.Stream (alias Edm.Stream)</li>
	* <li>sap.ui.model.odata.type.String (alias Edm.String)</li>
	* <li>sap.ui.model.odata.type.Time (alias Edm.Time)</li>
	* <li>sap.ui.model.odata.type.TimeOfDay (alias Edm.TimeOfDay)</li>
	* </ul>
	*
	* @author SAP SE
	* @version ${version}
	* @public
	* @since 1.114.0
	* @namespace
	* @alias module:sap/ui/mdc/odata/v4/TypeMap
	* @extends module:sap/ui/odata/TypeMap
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