/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	'sap/ui/mdc/BaseDelegate', 'sap/ui/mdc/odata/TypeUtil'/* TODO: FieldBase & Field currently expect odata types in default delegate! */, 'sap/ui/model/FormatException', 'sap/ui/mdc/condition/Condition', 'sap/ui/mdc/enum/ConditionValidated'
], function(
	BaseDelegate, TypeUtil, FormatException, Condition, ConditionValidated
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
	 * Provides the possibility to convey custom data in conditions.
	 * This enables an application to enhance conditions with data relevant for combined key or outparameter scenarios.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.core.Control} [oControl] Instance of the calling control
	 * @param {any[]} aValues key, description pair for the condition which is to be created.
	 * @returns {undefined|object} Optionally returns a serializeable object to be stored in the condition payload field.
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.107.0
	 */
	FieldBaseDelegate.createConditionPayload = function (oPayload, oControl, aValues) {
		return undefined;
	};

	/**
	 * Enables applications to control condition updates based on <code>value</code> / <code>additionalvalue</code> property changes.
	 *
	 * <b>Note:</b> Use with care! Custom implementations of this method may lead to intransparency as a field's condition may then differ from the state of the <code>value</code> / <code>additionalvalue</code> properties. Please also avoid expensive operations!
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.core.Control} [oControl] Instance of the calling control
	 * @param {any[]} aValues key, description pair for the condition which is to be created.
	 * @param {undefined|sap.ui.mdc.condition.ConditionObject} oCurrentCondition currently available condition before the property change
 	 * @returns {undefined|sap.ui.mdc.condition.ConditionObject} Returns a condition object to be set on the control
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.107.0
	 */
	FieldBaseDelegate.createCondition = function (oPayload, oControl, aValues, oCurrentCondition) {
		var oNextCondition = Condition.createItemCondition(aValues[0], aValues[1], undefined, undefined, this.createConditionPayload(oPayload, oControl, aValues));
		oNextCondition.validated = ConditionValidated.Validated;
		return oNextCondition;
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
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @returns {boolean} If <code>true</code>, the input is checked
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since: 1.78.0
	 */
	FieldBaseDelegate.isInputValidationEnabled = function(oPayload, oValueHelp) {

		if (oValueHelp && oValueHelp.isValidationSupported()) {
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
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @returns {boolean} If <code>true</code>, invalid input is accepted
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since: 1.78.0
	 */
	FieldBaseDelegate.isInvalidInputAllowed = function(oPayload, oValueHelp) {

		if (oValueHelp) {
			return !oValueHelp.getValidateInput();
		} else {
			return true;
		}

	};

	/**
	 * Determines the key, description, and payload of a user input.
	 *
	 * If this needs to be determined asynchronously, a <code>Promise</code> is returned.
	 *
	 * If the item cannot be determined, a corresponding <code>ParseException<code> is thrown.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the {@link sap.ui.mdc.Field Field} or {@link sap.ui.mdc.FilterField FilterField} control
	 * @param {object} [oConfig] Configuration
	 * @param {any} oConfig.value Value as entered by user
	 * @param {any} oConfig.parsedValue Value parsed by data type to fit the data type of the key
	 * @param {sap.ui.model.Context} oConfig.bindingContext <code>BindingContext</code> of the checked field. Inside a table the <code>ValueHelp</code> element might be connected to a different row.
	 * @param {boolean} oConfig.checkKey If set, it should be checked if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @param {boolean} oConfig.checkDescription If set, it should be checked if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @param {sap.ui.core.Control} oConfig.control Instance if the calling control
	 * @returns {sap.ui.mdc.valuehelp.ValueHelpItem|Promise<sap.ui.mdc.valuehelp.ValueHelpItem>} Object containing description, key, and payload. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.ParseException} if item cannot be determined
	 * @since: 1.78.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	FieldBaseDelegate.getItemForValue = function(oPayload, oValueHelp, oConfig) {

		if (oValueHelp) {
			return oValueHelp.getItemForValue(oConfig);
		}

	};

	/**
	 * Determines the description for a given key.
	 *
	 * This function is called while formatting the output of a {@link sap.ui.mdc.Field Field} or {@link sap.ui.mdc.FilterField FilterField} control
	 * in case a description is to be displayed but only a key is given.
	 *
	 * If this needs to be determined asynchronously, a <code>Promise</code> is returned.
	 *
	 * As the key might change (uppercase), an object with key and description can be returned.
	 *
	 * If the description cannot be determined, a corresponding <code>FormatException<code> is thrown.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the {@link sap.ui.mdc.Field Field} or {@link sap.ui.mdc.FilterField FilterField} control
	 * @param {any} vKey Key
	 * @param {object} oInParameters In parameters for the key (as a key must not be unique.) (Only filled in conditions of old variants.)
	 * @param {object} oOutParameters Out parameters for the key (as a key must not be unique.) (Only filled in conditions of old variants.)
	 * @param {sap.ui.model.Context} oBindingContext <code>BindingContext</code> of the checked field. Inside a table the <code>ValueHelp</code> element might be connected to a different row.
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConditionModel] <code>ConditionModel</code>, if bound to one - NOT LONGER USED
	 * @param {string} [sConditionModelName] Name of the <code>ConditionModel</code>, if bound to one - NOT LONGER USED
	 * @param {object} oConditionPayload Additional context information for this key
	 * @param {sap.ui.core.Control} [oControl] Instance if the calling control
	 * @param {sap.ui.model.Type} oType Type of the value
	 * @returns {string|sap.ui.mdc.valuehelp.ValueHelpItem|Promise<string|sap.ui.mdc.valuehelp.ValueHelpItem>} Description for key or object containing description, key and payload. If it is not available right away (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException} if the description cannot be determined
	 * @since: 1.78.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	FieldBaseDelegate.getDescription = function(oPayload, oValueHelp, vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName, oConditionPayload, oControl, oType) {
		var oConfig = {
			value: vKey,
			parsedValue: vKey,
			dataType: oType,
			context: {inParameters: oInParameters, outParameters: oOutParameters, payload: oConditionPayload},
			bindingContext: oBindingContext,
			checkKey: true,
			checkDescription: false,
			caseSensitive: true, // case sensitive as used to get description for known key
			exception: FormatException,
			control: oControl
		};
		return oValueHelp && oValueHelp.getItemForValue(oConfig);

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
