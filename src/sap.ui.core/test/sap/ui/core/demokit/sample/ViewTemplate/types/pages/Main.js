/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5"
], function (Helper, Opa5) {
	"use strict";
	var sViewName = "sap.ui.core.sample.ViewTemplate.types.Types";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeBoolean : function () {
					this.waitFor({
						controlType : "sap.m.Input",
						id : "booleanInput",
						success : function (oControl) {
							var oBinding = oControl.getBinding("value");

							oBinding.setValue(!oControl.getBinding("value").getValue());
							Opa5.assert.ok(true, "Boolean value changed:"
								+ oControl.getBinding("value").getValue());
						},
						viewName : sViewName
					});
				},
				enterDateTimePickerValue : function (sId, sValue, sControlType) {
					return this.waitFor({
						controlType : sControlType || "sap.m.DateTimePicker",
						id : sId,
						success : function (oControl) {
							oControl.setValue(sValue);
							Opa5.assert.strictEqual(oControl.getValue(), sValue,
								"Control: " + sId + " Value is: " + oControl.getValue());
						},
						viewName : sViewName
					});
				},
				enterDatePickerValue : function (sId, sValue) {
					return this.enterDateTimePickerValue(sId, sValue, "sap.m.DatePicker");
				},
				enterTimePickerValue : function (sId, sValue) {
					return this.enterDateTimePickerValue(sId, sValue, "sap.m.TimePicker");
				},
				enterInputValue : function (sId, sValue, sViewName0) {
					Helper.changeInputValue(this, sViewName0 || sViewName, sId, sValue);
				},
				enterStepInputValue : function (sId, sValue, sExpectedValue) {
					Helper.changeStepInputValue(this, sViewName, sId, sValue, sExpectedValue);
				},
				pressButton : function (sId) {
					Helper.pressButton(this, sViewName, sId);
				}
			},
			assertions : {
				checkDateTimePickerValueState : function (sId, sState, sControlType) {
					return this.waitFor({
						controlType : sControlType || "sap.m.DateTimePicker",
						id : sId,
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValueState(), sState,
								"checkDateTimePickerValueState('" + sId + "', '" + sState + "')");
						},
						viewName : sViewName
					});
				},
				checkDatePickerValueState : function (sId, sValue) {
					return this.checkDateTimePickerValueState(sId, sValue, "sap.m.DatePicker");
				},
				checkTimePickerValueState : function (sId, sValue) {
					return this.checkDateTimePickerValueState(sId, sValue, "sap.m.TimePicker");
				},
				checkInputIsDirty : function (sId, bIsDirty, sViewName0) {
					Helper.checkInputIsDirty(this, sViewName0 || sViewName, sId, bIsDirty);
				},
				checkInputValue : function (sId, vValue, sViewName0) {
					Helper.checkInputValue(this, sViewName0 || sViewName, sId, vValue);
				},
				checkInputValueState : function (sId, sState, sMessage, sViewName0) {
					Helper.checkValueState(this, sViewName0 || sViewName, sId, sState, sMessage);
				},
				checkStepInputValueState : function (sId, sState, sMessage) {
					Helper.checkValueState(this, sViewName, sId, sState, sMessage);
				}
			}
		}
	});
});
