/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	"sap/ui/mdc/field/FieldBaseDelegate",
	"delegates/odata/v4/TypeUtil"
], function(
		FieldBaseDelegate,
		TypeUtil
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.field.FieldBase FieldBase}.<br>
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental As of version 1.74
	 * @since 1.74.0
	 * @extends module:sap/ui/mdc/field/FieldBaseDelegate
	 * @alias module:delegates/odata/v4/FieldBaseDelegate
	 */
	var ODataFieldBaseDelegate = Object.assign({}, FieldBaseDelegate);

	/**
	 * Maps the Edm type names to real type names
	 *
	 * If a real type has already been defined, this type is returned.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {string} sType Given EDM type
	 * @returns {string} Data type name
	 * @deprecated please use sap.ui.mdc.odata.v4.TypeUtil.getDataTypeClass instead
	 */
	ODataFieldBaseDelegate.getDataTypeClass = function(oPayload, sType) {
		return TypeUtil.getDataTypeClassName(sType);
	};

	/**
	 * To know what control is rendered the <code>Field</code> or </code>FilterField</code>
	 * needs to know if the type represents a date, a number or something else in a normalized way.
	 *
	 * As default <code>string</code> is returned.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {string} sType Given type
	 * @param {object} oFormatOptions Used <code>FormatOptions</code>
	 * @param {object} oConstraints Used <code>Constraints</code>
	 * @returns {sap.ui.mdc.condition.BaseType} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
 	 * @deprecated please use sap.ui.mdc.odata.v4.TypeUtil.getBaseType instead
	 */
	ODataFieldBaseDelegate.getBaseType = function(oPayload, sType, oFormatOptions, oConstraints) {
		return TypeUtil.getBaseType(sType, oFormatOptions, oConstraints);
	};


	ODataFieldBaseDelegate.initializeTypeFromBinding = function(oPayload, oType, vValue) {

		// V4 Unit and Currency types have a map with valid units and create an internal customizing for it.
		// The Field needs to keep this customizing logic when creating the internal type.
		// (As external RAW binding is used there is no formatting on parsing.)

		var oResult = {};
		if (oType && (oType.isA("sap.ui.model.odata.type.Unit") || oType.isA("sap.ui.model.odata.type.Currency"))
				&& Array.isArray(vValue) && vValue.length > 2 && vValue[2] !== undefined) {
			// format once to set internal customizing. Allow null as valid values for custom units
			oType.formatValue(vValue, "string");
			oResult.bTypeInitialized = true;
			oResult.mCustomUnits = vValue[2]; // TODO: find a better way to provide custom units to internal type
		}

		return oResult;

	};

	ODataFieldBaseDelegate.initializeInternalUnitType = function(oPayload, oType, oTypeInitialization) {

		if (oTypeInitialization && oTypeInitialization.mCustomUnits !== undefined) {
			// if already initialized initialize new type too.
			oType.formatValue([null, null, oTypeInitialization.mCustomUnits], "string");
		}

	};

	ODataFieldBaseDelegate.enhanceValueForUnit = function(oPayload, aValues, oTypeInitialization) {

		if (oTypeInitialization && oTypeInitialization.bTypeInitialized && aValues.length === 2) {
			aValues.push(oTypeInitialization.mCustomUnits);
			return aValues;
		}

	};

	ODataFieldBaseDelegate.getDefaultFieldValueHelpDelegate = function(oPayload) {

		return {name: "sap/ui/mdc/odata/v4/FieldValueHelpDelegate", payload: {}};

	};

	ODataFieldBaseDelegate.getDefaultValueHelpDelegate = function(oPayload) {

		return {name: "delegates/odata/v4/ValueHelpDelegate", payload: {}};

	};

	ODataFieldBaseDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return ODataFieldBaseDelegate;
});
