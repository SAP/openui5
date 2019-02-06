/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties"
], function (Helper, Opa5, EnterText, Press, Properties) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.Products.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeMeasure : function (sValue) {
					return this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						id : /WeightMeasure/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === 0;
						},
						success : function (aControls) {
							var oInput = aControls[0];

							Opa5.assert.strictEqual(oInput.getValue(), sValue, "Content set to "
								+ oInput.getValue());
							// trigger PATCH: leave field by focussing different control via press
							return this.waitFor({
								actions : new Press(),
								matchers : function (oControl) {
									return oControl.getBindingContext().getIndex() === 0;
								},
								id : /ProductID/,
								success : function (aControls) {
									Opa5.assert.ok(true, "Selected Product: "
										+ aControls[0].getText());
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkMeasureValueState : function (sState) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : /WeightMeasure/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === 0;
						},
						success : function (aControls) {
							var oInput = aControls[0];

							Opa5.assert.strictEqual(oInput.getValueState(), sState,
								"WeightMeasure has valueState:" + sState);
						},
						viewName : sViewName
					});
				},
				checkMeasure : function (sValue) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : /WeightMeasure/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === 0;
						},
						success : function (aControls) {
							var oInput = aControls[0];

							Opa5.assert.strictEqual(oInput.getValue(), sValue,
								"WeightMeasure as expected: " + oInput.getValue());
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});