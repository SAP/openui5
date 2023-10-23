sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	'sap/ui/test/Opa5'
], function(Library, coreLibrary, Helper, EnterText, Press, Opa5) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	Opa5.createPageObjects({
		onMainPage : {
			actions : {
				/**
				 * Enters the given value in the field with the given id.
				 *
				 * @param {string} sId
				 *   The field id
				 * @param {string} sValue
				 *   The new value
				 * @param {boolean} bInfoText
				 *   Whether to set an info text for a subsequent assertion
				 */
				_enterField : function (sId, sValue, bInfoText) {
					if (bInfoText) {
						this.getContext().infoText = "[Enter " + sId + " " + sValue + "] ";
					}
					this.waitFor({
						actions : new EnterText({text : sValue}),
						id : sId
					});
				},
				/**
				 * Selects the check box with the given id according to the given boolean value.
				 *
				 * @param {string} sId
				 *   The field id
				 * @param {boolean} bValue
				 *   The new value
				 */
				_enterCheckBox : function (sId, bValue) {
					this.waitFor({
						id : sId,
						success : function (oCheckBox) {
							oCheckBox.setSelected(bValue);
						}
					});
				},
				/**
				 * Enters the given unit or currency.
				 *
				 * @param {string} sUnit
				 *   The new unit or currency
				 */
				enterUnit : function (sUnit) {
					this._enterField("unit", sUnit, true);
				},
				/**
				 * Enters the given value.
				 *
				 * @param {string} sValue
				 *   The new value
				 */
				enterValue : function (sValue) {
					this._enterField("value", sValue, true);
				},
				/**
				 * Initializes the application with the given value and unit or currency.
				 *
				 * @param {boolean} bIsCurrency
				 *   Whether the given unit is interpreted as currency
				 * @param {object} [oValue]
				 *   Information for the value field
				 * @param {string|null} [oValue.content=""]
				 *   Value field content
				 * @param {boolean} [oValue.editable=true]
				 *   Whether the value field is editable
				 * @param {boolean} [oValue.enabled=true]
				 *   Whether the value field is enabled
				 * @param {object} [oUnit]
				 *   Information for the unit/currency field
				 * @param {string|null} [oUnit.content=""]
				 *   Unit/currency field content
				 * @param {boolean} [oUnit.editable=true]
				 *   Whether the unit/currency field is editable
				 * @param {boolean} [oUnit.enabled=true]
				 *   Whether the unit/currency field is enabled
				 */
				_initializeUnit : function (bIsCurrency, oValue, oUnit) {
					this._enterCheckBox("isCurrency", bIsCurrency);
					oValue = oValue || {};
					this._enterField("valueContent", oValue.content || "");
					this._enterCheckBox("valueEditable",
						oValue.editable === undefined ? true : oValue.editable);
					this._enterCheckBox("valueEnabled",
						oValue.enabled === undefined ? true : oValue.enabled);
					oUnit = oUnit || {};
					this._enterField("unitContent", oUnit.content || "");
					this._enterCheckBox("unitEditable",
						oUnit.editable === undefined ? true : oUnit.editable);
					this._enterCheckBox("unitEnabled",
						oUnit.enabled === undefined ? true : oUnit.enabled);
					this.waitFor({
						actions : new Press(),
						id : "rebind"
					});
				},
				/**
				 * Initializes the application with the given value and currency, see
				 * {@link #_initializeUnit}.
				 *
				 * @param {object} [oValue]
				 *   Information for the value field
				 * @param {object} [oCurrency]
				 *   Information for the currency field
				 */
				initializeCurrency : function (oValue, oCurrency) {
					this._initializeUnit(true, oValue, oCurrency);
				},
				/**
				 * Initializes the application with the given value and unit, see
				 * {@link #_initializeUnit}.
				 *
				 * @param {object} [oValue]
				 *   Information for the value field
				 * @param {object} [oUnit]
				 *   Information for the unit field
				 */
				initializeUnit : function (oValue, oUnit) {
					this._initializeUnit(false, oValue, oUnit);
				}
			},
			assertions : {
				/**
				 * Checks if the unit / currency field contains the given value, if the model
				 * contains the given model unit and if the value state of the unit field has the
				 * given state and text. See {@link #_checkField}.
				 *
				 * @param {string} sExpectedUnit
				 *   The expected unit
				 * @param {string} [sExpectedUnitInModel]
				 *   The expected unit in the model
				 * @param {sap.ui.core.ValueState} [sValueState="None"]
				 *   The expected value state
				 * @param {string} [sValueStateTextKey=""]
				 *   The key of the expected value state text in the core library resource bundle
				 * @param {any[]} [aValueStateTextParameters]
				 *   The parameters of the expected value state text
				 */
				checkUnit : function (sExpectedUnit, sExpectedUnitInModel, sValueState,
						sValueStateTextKey, aValueStateTextParameters) {
					this._checkField("unit", sExpectedUnit, sExpectedUnitInModel,
						sValueState, sValueStateTextKey, aValueStateTextParameters);
				},
				/**
				 * Checks if the value field contains the given value, if the model contains the
				 * given model value and if the value state of the value field has the given state
				 * and text. See {@link #_checkField}.
				 *
				 * @param {string} sExpectedValue
				 *   The expected value
				 * @param {string} [sExpectedValueInModel]
				 *   The expected value in the model
				 * @param {sap.ui.core.ValueState} [sValueState="None"]
				 *   The expected value state
				 * @param {string} [sValueStateTextKey=""]
				 *   The key of the expected value state text in the core library resource bundle
				 * @param {any[]} [aValueStateTextParameters]
				 *   The parameters of the expected value state text
				 */
				checkValue : function (sExpectedValue, sExpectedValueInModel, sValueState,
						sValueStateTextKey, aValueStateTextParameters) {
					this._checkField("value", sExpectedValue, sExpectedValueInModel,
						sValueState, sValueStateTextKey, aValueStateTextParameters);
				},
				/**
				 * Checks the value state of the value field for the given state and text.
				 *
				 * @param {string} sId
				 *   The id of the input control (value or unit)
				 * @param {string} sValue
				 *   The expected value of the control
				 * @param {string} [sValueInModel]
				 *   The expected value in the model; defaults to <code>sValue</code> or null if
				 *   this is falsy
				 * @param {sap.ui.core.ValueState} [sValueState="None"]
				 *   The expected value state
				 * @param {string} [sValueStateTextKey=""]
				 *   The key of the expected value state text in the core library resource bundle
				 * @param {any[]} [aValueStateTextParameters]
				 *   The parameters of the expected value state text
				 */
				_checkField : function (sId, sValue, sValueInModel, sValueState, sValueStateTextKey,
						aValueStateTextParameters) {
					var sInfoText = this.getContext().infoText || "",
						sValueStateText;

					this.getContext().infoText = "";
					if (sValueInModel === undefined) {
						sValueInModel = sValue || null;
					}
					sValueState = sValueState || ValueState.None;
					sValueStateText = sValueStateTextKey
						? Library.getResourceBundleFor("sap.ui.core")
							.getText(sValueStateTextKey, aValueStateTextParameters)
						: "";
					this.waitFor({
						enabled : false,
						id : sId,
						success : function (oInput) {
							var sActualModelValue = oInput.getBinding("value").getValue();

							if (sId === "value") {
								sActualModelValue = sActualModelValue[0]; // 1st part of composite
							} else if (sId === "unit") {
								sActualModelValue = sActualModelValue[1]; // 2nd part of composite
							}
							Opa5.assert.strictEqual(oInput.getValue(), sValue,
								sInfoText + sId + " is '" + sValue + "'");
							Opa5.assert.strictEqual(sActualModelValue, sValueInModel,
								sId + " in model is '" + sValueInModel + "'");
							Opa5.assert.strictEqual(oInput.getValueState(), sValueState,
								oInput.getId() + ": value state is '" + sValueState + "'");
							Opa5.assert.strictEqual(oInput.getValueStateText(), sValueStateText,
								oInput.getId() + ": value state text is '" + sValueStateText + "'");
						}
					});
				}
			},
			viewName : "sap.ui.core.internal.samples.odata.twoFields.Main"
		}
	});
});