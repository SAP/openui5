/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/Opa5"
],
function (EnterText, Properties, Opa5) {
	"use strict";
	var sViewName = "sap.ui.core.sample.ViewTemplate.types.Types";

	Opa5.extendConfig({autoWait : true});

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeMinMaxField : function (sValue) {
					return this.waitFor({
						actions : new EnterText({ clearTextFirst : true, text : sValue }),
						controlType : "sap.m.Input",
						id : "Decimal_ID",
						success : function (oControl) {
							Opa5.assert.ok(true, "Value = " + sValue);
							oControl.attachValidationError(function(oEvent) {
								Opa5.assert.strictEqual(oEvent.getId(), "validationError",
									"Validation Error is raised");
							});
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkLog : function () {
					return this.waitFor({
						success : function (oControl) {
							Opa5.getWindow().jQuery.sap.log.getLogEntries()
								.forEach(function (oLog) {
									var sComponent = oLog.component || "";

									if ((sComponent.indexOf("sap.ui.model.odata.v4.") === 0
											|| sComponent.indexOf("sap.ui.model.odata.type.") === 0)
											&& oLog.level <= jQuery.sap.log.Level.WARNING) {
										Opa5.assert.ok(false,
											"Unexpected warning or error found: " + sComponent
											+ " Level: " + oLog.level
											+ " Message: " + oLog.message );
									}
								});
							Opa5.assert.ok(true, "Log checked");
						}
					});
				},
				checkMinMaxField : function () {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "Decimal_ID",
						success : function (oControl) {
							Opa5.assert.strictEqual(
								oControl.getBinding("value").getDataState().getInvalidValue(),
									"100", "DataState checked");
						},
						viewName : sViewName
					});

				}
			}
		}
	});
});