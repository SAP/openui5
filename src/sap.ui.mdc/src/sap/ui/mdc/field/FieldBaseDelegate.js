/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	'sap/ui/mdc/BaseDelegate',
	'sap/ui/mdc/DefaultTypeMap',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/model/FormatException',
	'sap/ui/core/Element'
], function(
	BaseDelegate,
	DefaultTypeMap,
	Condition,
	ConditionValidated,
	FieldDisplay,
	FormatException,
	Element
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.field.FieldBase FieldBase}.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.72.0
	 * @extends module:sap/ui/mdc/BaseDelegate
	 * @alias module:sap/ui/mdc/field/FieldBaseDelegate
	 */
	const FieldBaseDelegate = Object.assign({}, BaseDelegate);

	FieldBaseDelegate.getTypeMap = function () {
		return DefaultTypeMap;
	};

	/**
	 * Provides the possibility to convey custom data in conditions.
	 * This enables an application to enhance conditions with data relevant for combined key or out parameter scenarios.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.core.Control} [oControl] Instance of the calling control
	 * @param {any[]} aValues key, description pair for the condition which is to be created.
	 * @returns {undefined|object} Optionally returns a serializeable object to be stored in the condition payload field.
	 * @public
	 * @since 1.107.0
	 */
	FieldBaseDelegate.createConditionPayload = function (oField, oControl, aValues) {
		return undefined;
	};

	/**
	 * Enables applications to control condition updates based on <code>value</code> / <code>additionalvalue</code> property changes.
	 * <br/>By default, this method returns a condition with an <code>EQ</code> operator.
	 *
	 * <b>Note:</b> Custom implementations of this method may lead to intransparency as a field's condition may then differ from the state of the <code>value</code> / <code>additionalvalue</code> properties.
	 * Avoid expensive operations, as this can delay the rendering of the output.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.core.Control} [oControl] Instance of the calling control
	 * @param {any[]} aValues Key and description for the condition that is created
	 * @param {undefined|sap.ui.mdc.condition.ConditionObject} oCurrentCondition Currently available condition before the property change
 	 * @returns {undefined|sap.ui.mdc.condition.ConditionObject} Returns a condition object that is set on the control
	 * @public
	 * @since 1.107.0
	 */
	FieldBaseDelegate.createCondition = function (oField, oControl, aValues, oCurrentCondition) {
		const oNextCondition = Condition.createItemCondition(aValues[0], aValues[1], undefined, undefined, this.createConditionPayload(oField, oControl, aValues));
		oNextCondition.validated = ConditionValidated.Validated;
		return oNextCondition;
	};

	/**
	 * Defines if the input of the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control is
	 * checked to determine the key and description.
	 * <br/>By default, this method checks if the assigned {@link sap.ui.mdc.ValueHelp ValueHelp} supports input validation.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @returns {boolean} If <code>true</code>, the input is checked
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since: 1.78.0
	 */
	FieldBaseDelegate.isInputValidationEnabled = function(oField, oValueHelp) {

		if (oValueHelp && oValueHelp.isValidationSupported()) {
			return true;
		} else {
			return false;
		}

	};

	/**
	 * Defines, if input of the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control is accepted, even if it
	 * cannot be found in the assigned {@link sap.ui.mdc.ValueHelp ValueHelp} or custom logic of {@link #getItemForValue}.
	 * <br/>By default, this method checks if the {@link sap.ui.mdc.ValueHelp#validateInput validateInput} property of the assigned {@link sap.ui.mdc.ValueHelp ValueHelp} is set.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @returns {boolean} If <code>true</code>, invalid input is accepted
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since: 1.78.0
	 */
	FieldBaseDelegate.isInvalidInputAllowed = function(oField, oValueHelp) {

		if (oValueHelp) {
			return !oValueHelp.getValidateInput();
		} else {
			return true;
		}

	};

	/**
	 * Determines the key, description, and payload of a user input.
	 * <br/>By default, this method calls the {@link sap.ui.mdc.ValueHelp#getItemForValue getItemForValue} function of the assigned {@link sap.ui.mdc.ValueHelp ValueHelp}.
	 *
	 * If this needs to be determined asynchronously, a <code>Promise</code> is returned.
	 *
	 * If the item cannot be determined, a corresponding <code>ParseException<code> is thrown.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the {@link sap.ui.mdc.Field Field} or {@link sap.ui.mdc.FilterField FilterField} control
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} [oConfig] Configuration
	 * @returns {sap.ui.mdc.valuehelp.ValueHelpItem|Promise<sap.ui.mdc.valuehelp.ValueHelpItem>} Object containing description, key, and payload. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.ParseException} if item cannot be determined
	 * @since: 1.78.0
	 * @public
	 */
	FieldBaseDelegate.getItemForValue = function(oField, oValueHelp, oConfig) {

		if (oValueHelp) {
			return oValueHelp.getItemForValue(oConfig);
		}

	};

	/**
	 * Determines the description for a given key.
	 * <br/>By default, this method calls the {@link sap.ui.mdc.ValueHelp#getItemForValue getItemForValue} function of the assigned {@link sap.ui.mdc.ValueHelp ValueHelp}.
	 *
	 * This function is called while formatting the output of a {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control
	 * if a description should be displayed but only a key is given.
	 *
	 * If this needs to be determined asynchronously, a <code>Promise</code> is returned.
	 *
	 * As the key might change (uppercase), an object with key and description can be returned.
	 *
	 * If the description cannot be determined, a corresponding <code>FormatException<code> is thrown.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Field help assigned to the {@link sap.ui.mdc.Field Field} or {@link sap.ui.mdc.FilterField FilterField} control
	 * @param {any} vKey Key
	 * @param {object} oInParameters In parameters for the key (as a key is not necessarily unique.) (Only filled in conditions of old variants.)
	 * @param {object} oOutParameters Out parameters for the key (as a key is not necessarily unique.) (Only filled in conditions of old variants.)
	 * @param {sap.ui.model.Context} oBindingContext <code>BindingContext</code> of the checked field; Inside a table, the <code>ValueHelp</code> element might be connected to a different row.
	 * @param {undefined} [oConditionModel] <code>ConditionModel</code>, if bound to one - NO LONGER USED
	 * @param {undefined} [sConditionModelName] Name of the <code>ConditionModel</code>, if bound to one - NO LONGER USED
	 * @param {object} oConditionPayload Additional context information for this key
	 * @param {sap.ui.core.Control} oControl Instance of the calling control if it is not the field itself
	 * @param {sap.ui.model.Type} oType Type of the value
	 * @returns {string|sap.ui.mdc.valuehelp.ValueHelpItem|Promise<string|sap.ui.mdc.valuehelp.ValueHelpItem>} Description for key or object containing description, key, and payload. If it is not available right away (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException} if the description cannot be determined
	 * @since: 1.78.0
	 * @public
	 */
	FieldBaseDelegate.getDescription = function(oField, oValueHelp, vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName, oConditionPayload, oControl, oType) {
		const oConfig = {
			value: vKey,
			parsedValue: vKey,
			parsedDescription: undefined,
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
	 * Checks if entered text matches text found from value help
	 *
	 * This function is called during a user's type-ahead into a {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control.
	 *
	 * By Default this method checks if the text starts with the user input. Depending of the <code>bCaseSensitive</code> parameter this check is performed case sensitive.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {string} sUserInput Currently typed text (Could be changed when the type-ahed result is returned asynchronously.)
	 * @param {string} sText Text to be checked
	 * @param {boolean} bDescription If <code>true</code> this text is the description
	 * @param {boolean} bCaseSensitive If <code>true</code> the filtering was done case sensitive
	 * @returns {boolean} <code>true</code> if text matches user input
	 * @since: 1.121.0
	 * @public
	 */
	FieldBaseDelegate.isInputMatchingText = function(oField, sUserInput, sText, bDescription, bCaseSensitive) {

		if (bCaseSensitive) {
			// filtering was executed case sensitive, so comparision needs to be case sensitive too
			return sText.normalize().startsWith(sUserInput.normalize());
		}

		return sText.normalize().toLowerCase().startsWith(sUserInput.normalize().toLowerCase());

	};

	/**
	 * Determines the text for the autocomplete functionality.
	 *
	 * This function is called during a user's type-ahead into a {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control.
	 *
	 * The returned text will be shown as selected after the user input ends.
	 *
	 * By Default this method uses the {@link sap.ui.mdc.field.FieldBase#getDisplay display} property of the
	 * {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control
	 * to determine what text (key or description) is used as autocomplete-text. A text is only used if it matches the user input.
	 * If set to <code>Valur</code>, the key is used.
	 * If set to <code>Description</code>, the description is used.
	 * If set to <code>ValueDescription</code>, the key is used, if it maps, otherwise the description.
	 * If set to <code>DescriptionValue</code>, the description is used, if it maps, otherwise the key.
	 *
	 * <b>Note:</b> Whatever this function returns, the user input will not be overwritten, only the text after the user input will be added and shown as selected.
	 * Otherwise the cursor position might change or the user input changes while typing what would lead to confusion.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
	 * @param {string} sKey Formatted text of the key (value)
	 * @param {string} sDescription FormattedText of the description
	 * @param {boolean} bKeyMatch If <code>true</code> the key matches to the user input
	 * @param {boolean} bDescriptionMatch If <code>true</code> the description matches to the user input
	 * @returns {string} Output text
	 * @since: 1.121.0
	 * @public
	 */
	FieldBaseDelegate.getAutocompleteOutput = function(oField, oCondition, sKey, sDescription, bKeyMatch, bDescriptionMatch) {

		const sDisplay = oField.getDisplay();
		let sOutput;

		if (sDisplay === FieldDisplay.Value) {
			if (bKeyMatch) {
				sOutput = sKey;
			}
		} else if (sDisplay === FieldDisplay.Description) {
			if (bDescriptionMatch) {
				sOutput = sDescription;
			}
		} else if (sDisplay === FieldDisplay.ValueDescription) {
			if (bKeyMatch) {
				sOutput = sKey;
			} else if (bDescriptionMatch) {
				sOutput = sDescription;
			}
		} else if (sDisplay === FieldDisplay.DescriptionValue) {
			if (bDescriptionMatch) {
				sOutput = sDescription;
			} else if (bKeyMatch) {
				sOutput = sKey;
			}
		}

		return sOutput;

	};

	return FieldBaseDelegate;
});
