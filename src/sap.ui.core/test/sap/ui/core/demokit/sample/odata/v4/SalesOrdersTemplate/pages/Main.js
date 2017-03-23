/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties"
],
function (Opa5, Press, BindingPath, Interactable, Properties) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main";

	Opa5.extendConfig({autoWait : true});

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				pressValueHelpOnCurrencyCode : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Input",
						matchers : new BindingPath({path : "/BusinessPartnerList/0"}),
						success : function (oValueHelp) {
							Opa5.assert.ok(true, "ValueHelp on CurrencyCode pressed");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkLog : function () {
					return this.waitFor({
						success : function (oControl) {
							jQuery.sap.log.getLogEntries()
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
				}
			}
		}
	});
});