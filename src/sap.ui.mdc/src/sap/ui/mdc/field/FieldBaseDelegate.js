/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	'sap/ui/mdc/BaseDelegate', 'sap/ui/mdc/odata/TypeUtil' // TODO: FieldBase & Field currently expect odata types in default delegate!
], function(
	BaseDelegate, TypeUtil
) {
	"use strict";

	/**
	 * @class Delegate class for <code>sap.ui.mdc.field.FieldBase</code>.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.72
	 * @since 1.72.0
	 * @alias sap.ui.mdc.field.FieldBaseDelegate
	 */
	var FieldBaseDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Maps the Edm type names to real type names
	 *
	 * If a real type has already been defined, this type is returned.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {string} sType Given EDM type
	 * @returns {string} Data type name
	 * @private
	 * @deprecated please use sap.ui.mdc.util.TypeUtil.getDataTypeClass instead
	 */
	FieldBaseDelegate.getDataTypeClass = function(oPayload, sType) {
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
	 * @private
	 * @deprecated please use sap.ui.mdc.util.TypeUtil.getBaseType instead
	 */
	FieldBaseDelegate.getBaseType = function(oPayload, sType, oFormatOptions, oConstraints) {
		return TypeUtil.getBaseType(sType, oFormatOptions, oConstraints);
	};

	/**
	 * If the <code>Field</code> control is used, the used data type might come from the binding.
	 * In V4-unit or currency case it might need to be formatted once.
	 * To initialize the internal type later on, the currencies must be returned.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.SimpleType} oType Type from binding
	 * @param {any} vValue Given value
	 * @returns {object} Information needed to initialize internal type (needs to set bTypeInitialized to true if initialized)
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldBaseDelegate.initializeTypeFromBinding = function(oPayload, oType, vValue) {

		return {};

	};

	/**
	 * This function initializes the unit type.
	 * If the <code>Field</code> control is used, the used data type might come from the binding.
	 * If the type is a V4 unit or currency, it might need to be formatted once.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.SimpleType} oType Type from binding
	 * @param {object} oTypeInitialization Information needed to initialize internal type
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldBaseDelegate.initializeInternalUnitType = function(oPayload, oType, oTypeInitialization) {

	};

	/**
	 * Defines if the input of the <code>Field</code> or <code>FilterField</code> control is
	 * checked to determine the key and description.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.field.FieldHelpBase} oFieldHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @returns {boolean} If <code>true</code>, the input is checked
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since: 1.78.0
	 */
	FieldBaseDelegate.isInputValidationEnabled = function(oPayload, oFieldHelp) {

		if (oFieldHelp && oFieldHelp.isValidationSupported()) {
			return true;
		} else {
			return false;
		}

	};

	/**
	 * Defines if the input of the <code>Field</code> or <code>FilterField</code> control that
	 * is not found in the field help or custom logic is accepted.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.field.FieldHelpBase} oFieldHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @returns {boolean} If <code>true</code>, invalid input is accepted
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since: 1.78.0
	 */
	FieldBaseDelegate.isInvalidInputAllowed = function(oPayload, oFieldHelp) {

		if (oFieldHelp) {
			return !oFieldHelp.getValidateInput();
		} else {
			return true;
		}

	};

	/**
	 * Determines the key, description, and the in and out parameters of a user input.
	 *
	 * If this needs to be determined asynchronously, a <code>Promise</code> is returned.
	 *
	 * The result needs to be an object containing the following properties: description, key, and in and out parameters.
	 * <ul>
	 * <li><code>key</code>: Key of the item </li>
	 * <li><code>description</code>: Description of the item </li>
	 * <li><code>inParameters</code>: Object with in parameters and the corresponding value </li>
	 * <li><code>outParameters</code>: Object with out parameters and the corresponding value </li>
	 * </ul>
	 *
	 * If the item cannot be determined, a corresponding <code>ParseException<code> is thrown.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.field.FieldHelpBase} oFieldHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @param {any} vValue Value as entered by user
	 * @param {any} vParsedValue Value parsed by data type to fit the data type of the key
	 * @param {sap.ui.model.Context} oBindingContext <code>BindingContext</code> of the checked field. Inside a table the <code>FieldHelp</code> element might be connected to a different row.
	 * @param {boolean} bCheckKeyFirst If set, it first should be checked if the value fits a key
	 * @param {boolean} bCheckKey If set, it should be checked if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @param {boolean} bCheckDescription If set, it should be checked if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConditionModel] <code>ConditionModel</code>, if bound to one
	 * @param {string} [sConditionModelName] Name of the <code>ConditionModel</code>, if bound to one
	 * @returns {object|Promise} Object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.ParseException} if item cannot be determined
	 * @since: 1.78.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	FieldBaseDelegate.getItemForValue = function(oPayload, oFieldHelp, vValue, vParsedValue, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName) {

		if (oFieldHelp) {
			return oFieldHelp.getItemForValue(vValue, vParsedValue, undefined, undefined, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName);
		}

	};

	/**
	 * Determines the description for a given key.
	 *
	 * This function is called while formatting the output of a <code>Field</code> or <code>FilterField</code> control
	 * in case a description is to be displayed but only a key is given.
	 *
	 * If this needs to be determined asynchronously, a <code>Promise</code> is returned.
	 *
	 * As the key might change (uppercase), an object with key and description can be returned.
	 *
	 * If the description cannot be determined, a corresponding <code>FormatException<code> is thrown.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.field.FieldHelpBase} oFieldHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @param {any} vKey Key
	 * @param {object} oInParameters In parameters for the key (as a key must not be unique.)
	 * @param {object} oOutParameters Out parameters for the key (as a key must not be unique.)
	 * @param {sap.ui.model.Context} oBindingContext <code>BindingContext</code> of the checked field. Inside a table the <code>FieldHelp</code> element might be connected to a different row.
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConditionModel] <code>ConditionModel</code>, if bound to one
	 * @param {string} [sConditionModelName] Name of the <code>ConditionModel</code>, if bound to one
	 * @returns {string|object|Promise} Description for key or object containing description, key, in and out parameters. If it is not available right away (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException} if the description cannot be determined
	 * @since: 1.78.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	FieldBaseDelegate.getDescription = function(oPayload, oFieldHelp, vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName) {

		if (oFieldHelp) {
			return oFieldHelp.getTextForKey(vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName);
		}

	};

	/**
	 * This function returns which <code>FieldHelpBaseDelegate</code> is used
	 * if a default field help (for example, for Boolean values) is created.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @returns {object} Delegate object with <code>name</code and <code>payload</code>
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.78.0
	 */
	FieldBaseDelegate.getDefaultFieldHelpBaseDelegate = function(oPayload) {

		return {name: "sap/ui/mdc/field/FieldHelpBaseDelegate", payload: {}};

	};

	/**
	 * This function returns which <code>FieldValueHelpDelegate</code> is used
	 * if a default field help (for example, for defining conditions in </code>FilterField</code>)
	 * is created.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @returns {object} Delegate object with <code>name</code and <code>payload</code>
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.78.0
	 */
	FieldBaseDelegate.getDefaultFieldValueHelpDelegate = function(oPayload) {

		return {name: "sap/ui/mdc/field/FieldValueHelpDelegate", payload: {}};

	};

	FieldBaseDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return FieldBaseDelegate;
});
