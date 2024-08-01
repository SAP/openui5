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
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/model/FormatException',
	'sap/ui/mdc/enums/OperatorName'
], (
	BaseDelegate,
	DefaultTypeMap,
	Condition,
	FilterOperatorUtil,
	ConditionValidated,
	FieldDisplay,
	FormatException,
	OperatorName
) => {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.field.FieldBase FieldBase}.<br>
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.72.0
	 * @extends module:sap/ui/mdc/BaseDelegate
	 * @alias module:sap/ui/mdc/field/FieldBaseDelegate
	 */
	const FieldBaseDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Provides the possibility to customize / replace the internal content of a field
	 *
 	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.enums.ContentMode} sContentMode A given content mode
	 * @param {string} sId ID of the internal control to be created.
	 * @returns {Promise<sap.ui.core.Control[]>} Array containing the created controls
	 *
	 * @protected
	 * @since 1.124.0
	 */
	FieldBaseDelegate.createContent = function(oField, sContentMode, sId) {
		const oContentType = oField.getContentFactory().getContentType(oField.getBaseType(), oField.getMaxConditions(), oField._bTriggerable);
		return oField.getContentFactory().createContent(oContentType, sContentMode, sId);
	};

	FieldBaseDelegate.getTypeMap = function() {
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
	FieldBaseDelegate.createConditionPayload = function(oField, oControl, aValues) {
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
	FieldBaseDelegate.createCondition = function(oField, oControl, aValues, oCurrentCondition) {
		const oNextCondition = Condition.createItemCondition(aValues[0], aValues[1], undefined, undefined, this.createConditionPayload(oField, oControl, aValues));
		oNextCondition.validated = ConditionValidated.Validated;
		return oNextCondition;
	};

	/**
	 * Enables applications to control condition updates based on pasted values.
	 * <br/>By default, this method returns conditions with an <code>EQ</code> operator without using the description, as it does not ensure the description is valid.
	 *
	 * <b>Note:</b> Returned values can either be strings which should be parsed by the ConditionType itself or pre-created conditions.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
 	 * @param {Array.<{value:string, additionalValue:string}>} aParsedData Pre-parsed paste data
	 * @param {object} oSettings Condition-related settings object
 	 * @param {sap.ui.mdc.condition.Operator} oSettings.defaultOperator Default operator for the current field
	 * @param {sap.ui.model.SimpleType} oSettings.valueType Configured type for a value
	 * @param {sap.ui.model.SimpleType} oSettings.additionalValueType Configured type for an additional value
	 * @returns {Array<sap.ui.mdc.condition.ConditionObject|string>|Promise<array<sap.ui.mdc.condition.ConditionObject|string>>} Array of <code>ConditionObject</code>/<code>string</code> values. If it is not available right away, a <code>Promise</code> is returned.
	 * @throws {Exception} if the pasted data cannot be converted to conditions
	 * @protected
	 * @since 1.124
	 */
	FieldBaseDelegate.parsePasteDataToConditions = function(oField, aParsedData, oSettings) {
		const {defaultOperator} = oSettings;
		const aResult = [];
		const bBetweenUsed = defaultOperator?.name === OperatorName.BT;
		for (let i = 0; i < aParsedData.length; i++) {
			const oParsedData = aParsedData[i];
			if (oParsedData.value || bBetweenUsed) {// key/value given, use it
				aResult.push(Condition.createCondition(defaultOperator.name, bBetweenUsed ? [oParsedData.value, oParsedData.additionalValue] : [oParsedData.value], undefined, undefined, ConditionValidated.NotValidated, undefined)); // only use key, ignore description
			} else if (oParsedData.additionalValue) { // only additionalValue given, might be an copy of a non-EQ-Token
				// TODO: how to handle "" as Key with Description?
				aResult.push(oParsedData.additionalValue);
			}
		}
		return aResult;
	};

	/**
	 * Defines if the input of the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control is
	 * checked to determine the key and description.
	 * <br/>By default, this method checks if the assigned {@link sap.ui.mdc.ValueHelp ValueHelp} supports input validation.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Value help assigned to the <code>Field</code> or <code>FilterField</code> control
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
	 * Defines if input of the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control is accepted, even if it
	 * cannot be found in the assigned {@link sap.ui.mdc.ValueHelp ValueHelp} or custom logic of {@link #getItemForValue}.
	 * <br/>By default, this method checks if the {@link sap.ui.mdc.ValueHelp#validateInput validateInput} property of the assigned {@link sap.ui.mdc.ValueHelp ValueHelp} is set.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Value help assigned to the <code>Field</code> or <code>FilterField</code> control
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
	 * If the item cannot be determined, a corresponding {@link sap.ui.model.ParseException ParseException} is thrown.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Value help assigned to the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control
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
	 * If the description cannot be determined, a corresponding {@link sap.ui.model.FormatException FormatException} is thrown.
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Value help assigned to the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField}, or {@link sap.ui.mdc.MultiValueField MultiValueField} control
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
			context: { inParameters: oInParameters, outParameters: oOutParameters, payload: oConditionPayload },
			bindingContext: oBindingContext,
			checkKey: true,
			checkDescription: false,
			caseSensitive: true, // case sensitive as used to get description for known key
			exception: FormatException,
			exactMatch: true,
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
	 * If set to <code>Value</code>, the key is used.
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
	 * @returns {string|boolean} Output text or boolean true, if the autocomplete value should be accepted without modifying the visible input
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

	/**
	 * Returns the index of a condition in an array of conditions.
	 *
	 * This function is called when a <code>Condition</code> is created by user input or value help selection to determine if a similar <code>Condition</code> already exists.
	 * This is done to prevent duplicates.
	 *
	 * By default, if a <code>ValueHelp</code> exists, the <code>ValueHelp</code> logic is used to compare each condition. (See {@link sap.ui.mdc.ValueHelpDelegate#compareConditions ValueHelpDelegate.compareConditions})
	 *
	 * @param {sap.ui.mdc.field.FieldBase} oField <code>Field</code> control instance
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp Value help assigned to the <code>Field</code> or <code>FilterField</code> control
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition to check
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Array of conditions
	 * @returns {int} Index of the condition, -1 if not found
	 * @protected
	 * @since: 1.128.0
	 */
	FieldBaseDelegate.indexOfCondition = function(oField, oValueHelp, oCondition, aConditions) {

		if (oValueHelp && oValueHelp.bDelegateInitialized) { // on comparing new conditions ValueHelp needs to be somehow initialized (Call via Select, Navigated or getItemForValue)
			const oValueHelpDelegate = oValueHelp.getControlDelegate();
			let iIndex = -1;

			for (let i = 0; i < aConditions.length; i++) {
				if (oValueHelpDelegate.compareConditions(oValueHelp, oCondition, aConditions[i])) {
					iIndex = i;
					break;
				}
			}

			return iIndex;
		} else {
			return FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		}

	};

	return FieldBaseDelegate;
});