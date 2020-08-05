sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press"
], function(Opa5, Properties, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheToolHeader: {

			actions: {
				iPressOnSection: function (sTabName) {
					return this.waitFor({
						viewName: "App",
						controlType: "sap.m.IconTabFilter",
						matchers: new Properties({ text: sTabName }),
						actions: new Press(),
						errorMessage: "Could not find tab with name: " + sTabName
					});
				}
			},

			assertions: {
				iShouldBeOnSection: function (sTabName) {
					return this.waitFor({
						controlType: "sap.m.Page",
						viewName: sTabName,
						success: function () {
							Opa5.assert.ok(true, "The navigation ended on the correct section: " + sTabName);
						},
						errorMessage: "The navigation isn't ended on the correct section: " + sTabName
					});
				}
			}
		}
	});
});
