/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, EnterText, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.ViewTemplate.types.Types";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeBoolean : function () {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "booleanInput",
						success : function (oControl) {
							var oBinding = oControl.getBinding("value");
							oBinding.setValue(!oControl.getBinding("value").getValue());
							Opa5.assert.ok(true, "Boolean value changed:" +
								oControl.getBinding("value").getValue());
						},
						viewName : sViewName
					});
				},
				enterDateTimePickerValue : function (sId, sValue) {
					return this.waitFor({
						controlType : "sap.m.DateTimePicker",
						id : sId,
						success : function (oControl) {
							oControl.setValue(sValue);
							Opa5.assert.strictEqual(oControl.getValue(), sValue,
								"Control: " + sId + " Value is: " + oControl.getValue());
						},
						viewName : sViewName
					});
				},
				enterInputValue : function (sId, sValue, sViewName0) {
					return this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						id : sId,
						success : function (oControl) {
							Opa5.assert.strictEqual(oControl.getValue(), sValue,
								"Control: " + sId + " Value is: " + oControl.getValue());
						},
						viewName : sViewName0 || sViewName
					});
				},
				enterStepInputValue : function (sId, sValue) {
					return Helper.changeStepInputValue(this, sViewName, sId, sValue);
				},
				enterStepInputValueInteger : function (sId, fValue) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : fValue}),
						controlType : "sap.m.StepInput",
						id : sId,
						viewName : sViewName
					});
					return this.waitFor({
						controlType : "sap.m.StepInput",
						id : sId,
						success : function (oControl) {
							Opa5.assert.strictEqual(oControl.getValue(), Math.round(fValue),
								"Control: " + sId + " Value is: " + oControl.getValue());
						},
						viewName : sViewName
					});
				},
				pressButton : function (sId) {
					return Helper.pressButton(this, sViewName, sId);
				}
			},
			assertions : {
				checkDateTimePickerValueState : function (sId, sState) {
					return this.waitFor({
						controlType : "sap.m.DateTimePicker",
						id : sId,
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValueState(), sState,
								"checkDateTimePickerValueState('" + sId + "', '" + sState + "')");
						},
						viewName : sViewName
					});
				},
				checkInputIsDirty : function (sId, bIsDirty, sViewName0) {
					return Helper.checkInputIsDirty(this, sViewName0 || sViewName, sId, bIsDirty);
				},
				checkInputValue : function (sId, vValue, sViewName0) {
					return Helper.checkInputValue(this, sViewName0 || sViewName, sId, vValue);
				},
				checkInputValueState : function (sId, sState, sMessage, sViewName0) {
					return Helper.checkInputValueState(this, sViewName0 || sViewName, sId, sState,
						sMessage);
				},
				checkStepInputValueState : function (sId, sState, sMessage) {
					return this.waitFor({
						controlType : "sap.m.StepInput",
						id : sId,
						success : function (oStepInput) {
							Opa5.assert.strictEqual(oStepInput.getValueState(), sState,
								"checkStepInputValueState('" + sId + "', '" + sState + "')");
							if (sMessage) {
								Opa5.assert.strictEqual(oStepInput.getValueStateText(), sMessage,
									"ValueStateText: " + sMessage);
							}
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});