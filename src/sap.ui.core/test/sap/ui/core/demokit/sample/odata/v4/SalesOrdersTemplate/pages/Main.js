/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Opa5, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				pressValueHelpOnCurrencyCode : function () {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Input",
						id : /-0-field/,
						matchers : function (oControl) {
							// Note: we need to press the inner Input, but the "value" binding is
							// on the outer ValueHelp control!
							return oControl.getParent().getMetadata().getName()
								=== "sap.ui.core.sample.common.ValueHelp"
							&& oControl.getParent().getBindingInfo("value").parts[0].path
								=== "CurrencyCode";
						},
						success : function () {
							Opa5.assert.ok(true, "ValueHelp on CurrencyCode pressed");
							this.waitFor({
								controlType : "sap.m.Popover",
								success : function (aControls) {
									aControls.forEach((oControl) => { oControl.close(); });
									Opa5.assert.ok(true, "ValueHelp Popover Closed");
								}
							});
						},
						viewName : sViewName
					});
				},
				pressValueHelpOnRole : function () {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.ComboBox",
						id : /-0-field/,
						success : function () {
							Opa5.assert.ok(true, "ValueHelp on Role pressed");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});
