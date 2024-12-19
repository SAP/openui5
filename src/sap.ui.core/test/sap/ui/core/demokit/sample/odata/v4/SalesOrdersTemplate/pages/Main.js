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
						// e.g. "__xmlview0--CurrencyCode-__table0-0-field-inner"
						id : /--CurrencyCode-.*-0-field/,
						success : function () {
							Opa5.assert.ok(true, "ValueHelp on CurrencyCode pressed");
							this.waitFor({
								controlType : "sap.m.Popover",
								success : function (aControls) {
									aControls.forEach((oControl) => { oControl.close(); });
									Opa5.assert.ok(true, "ValueHelp Popover Closed");
								}
							});
						}
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
