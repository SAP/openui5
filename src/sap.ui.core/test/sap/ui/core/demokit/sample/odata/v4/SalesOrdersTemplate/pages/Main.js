/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath"
],
function (Opa5, Press, BindingPath) {
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
							return this.waitFor({
								controlType : "sap.m.Popover",
								success : function (aControls) {
									aControls[0].close();
									Opa5.assert.ok(true, "ValueHelp Popover Closed");
								}
							});
						},
						viewName : sViewName
					});
				},
				pressValueHelpOnRole : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.ComboBox",
						matchers : new BindingPath({path : "/BusinessPartnerList/0"}),
						success : function (oValueHelp) {
							Opa5.assert.ok(true, "ValueHelp on Role pressed");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});