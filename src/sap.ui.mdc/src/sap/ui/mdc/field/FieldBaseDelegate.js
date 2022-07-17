/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	'sap/ui/mdc/BaseDelegate', 'sap/ui/mdc/odata/TypeUtil'/* TODO: FieldBase & Field currently expect odata types in default delegate! */, 'sap/ui/model/FormatException'
], function(
	BaseDelegate, TypeUtil, FormatException
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.field.FieldBase FieldBase}.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental As of version 1.72
	 * @since 1.72.0
	 * @extends module:sap/ui/mdc/BaseDelegate
	 * @alias module:sap/ui/mdc/field/FieldBaseDelegate
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
	 * This function enhances the value with unit or currency information if needed by the data type.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {any[]} aValues Values
	 * @param {object} oTypeInitialization Information needed to initialize internal type
	 * @returns {any[]} Values
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since: 1.93.0
	 */
	FieldBaseDelegate.enhanceValueForUnit = function(oPayload, aValues, oTypeInitialization) {

		return aValues;

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
	 * @param {object} [oConfig] Configuration
	 * @param {any} oConfig.value Value as entered by user
	 * @param {any} oConfig.parsedValue Value parsed by data type to fit the data type of the key
	 * @param {sap.ui.model.Context} oConfig.bindingContext <code>BindingContext</code> of the checked field. Inside a table the <code>FieldHelp</code> element might be connected to a different row.
	 * @param {boolean} oConfig.checkKeyFirst If set, it first should be checked if the value fits a key
	 * @param {boolean} oConfig.checkKey If set, it should be checked if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @param {boolean} oConfig.checkDescription If set, it should be checked if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConfig.conditionModel] <code>ConditionModel</code>, if bound to one
	 * @param {string} [oConfig.conditionModelName] Name of the <code>ConditionModel</code>, if bound to one
	 * @param {sap.ui.core.Control} oConfig.control Instance if the calling control
	 * @returns {object|Promise} Object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.ParseException} if item cannot be determined
	 * @since: 1.78.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
//	FieldBaseDelegate.getItemForValue = function(oPayload, oFieldHelp, vValue, vParsedValue, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName) {
//
//		if (oFieldHelp) {
//			return oFieldHelp.getItemForValue(vValue, vParsedValue, undefined, undefined, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName);
//		}
//
//	};
	FieldBaseDelegate.getItemForValue = function(oPayload, oFieldHelp, oConfig) {

		if (oFieldHelp) {
			return oFieldHelp.getItemForValue(oConfig);
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
	 * @param {object} oConditionPayload Additional context information for this key
	 * @param {sap.ui.core.Control} [oControl] Instance if the calling control
	 * @param {sap.ui.model.Type} oType Type of the value
	 * @returns {string|object|Promise} Description for key or object containing description, key, in and out parameters. If it is not available right away (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException} if the description cannot be determined
	 * @since: 1.78.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	FieldBaseDelegate.getDescription = function(oPayload, oFieldHelp, vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName, oConditionPayload, oControl, oType) {
		if (oFieldHelp && oFieldHelp.isA("sap.ui.mdc.ValueHelp")) {
			var oConfig = {
				value: vKey,
				parsedValue: vKey,
				dataType: oType,
				context: {inParameters: oInParameters, outParameters: oOutParameters, payload: oConditionPayload},
				bindingContext: oBindingContext,
				conditionModel: oConditionModel,
				conditionModelName: sConditionModelName,
				checkKey: true,
				checkDescription: false,
				caseSensitive: true, // case sensitive as used to get description for known key
				exception: FormatException,
				control: oControl
			};
			return oFieldHelp.getItemForValue(oConfig);
		} else if (oFieldHelp) {
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

	/**
	 * This function returns which <code>ValueHelpDelegate</code> is used
	 * if a default field help (for example, for defining conditions in </code>FilterField</code>)
	 * is created.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @returns {object} Delegate object with <code>name</code and <code>payload</code>
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.99.0
	 */
	FieldBaseDelegate.getDefaultValueHelpDelegate = function(oPayload) {

		return {name: "sap/ui/mdc/ValueHelpDelegate", payload: {}};

	};

	FieldBaseDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return FieldBaseDelegate;
});
