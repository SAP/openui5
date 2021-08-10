/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, TestUtils, EnterText, Press) {
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
				changeMinMaxField : function (sValue) {
					return this.waitFor({
						actions : new EnterText({ clearTextFirst : true, text : sValue }),
						controlType : "sap.m.Input",
						id : "decimalInput",
						success : function (oControl) {
							Opa5.assert.ok(true, "Value = " + sValue);
							oControl.attachValidationError(function(oEvent) {
								Opa5.assert.strictEqual(oEvent.getId(), "validationError",
								"Validation error raised: " + oEvent.getParameter("message") +
								" Entered value:" + oEvent.getParameter("newValue"));
							});
						},
						viewName : sViewName
					});
				},
				enterBoolean : function (sValue) {
					return this.waitFor({
						actions : new EnterText({ clearTextFirst : true, text : sValue }),
						controlType : "sap.m.Input",
						id : "booleanInput",
						success : function (oControl) {
							if (sValue !== true && sValue !== false) {
								oControl.attachEventOnce("parseError", function(oEvent) {
									Opa5.assert.strictEqual(oEvent.getId(), "parseError",
										"Parse error is raised: " + oEvent.getParameter("message") +
										" Entered value:" + oEvent.getParameter("newValue"));
								});
							}
						},
						viewName : sViewName
					});
				},
				pressButton : function (sID) {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : sID,
						success : function () {
							Opa5.assert.ok(true, "Button with ID: " + sID + " pressed");
						},
						viewName : sViewName
					});
				},
				pressV4Button : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "toggleV4",
						success : function () {
							Opa5.assert.ok(true, "switched to V4 model");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkBooleanValue : function (bValue) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "booleanInput",
						success : function (oControl) {
							Opa5.assert.strictEqual(
								oControl.getBinding("value").getValue(), bValue,
								"Value is: " + bValue);
						},
						viewName : sViewName
					});
				},
				checkControlIsDirty : function (sID, bIsDirty) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : sID,
						success : function (oControl) {
							Opa5.assert.strictEqual(
								oControl.getBinding("value").getDataState().isControlDirty(),
									bIsDirty, "Control: " + sID + " is " +
									(bIsDirty ? "dirty" : "clean"));
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});