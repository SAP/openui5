sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/toolpageapp/test/integration/pages/Common"
], function (Opa5,Common) {
	"use strict";
	var sViewName = "Home";
	Opa5.createPageObjects({
		baseClass: Common,
		onTheHomePage: {

			assertions: {
				iShouldSeeTheHomeView: function () {
					return this.waitFor({
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(sViewName,"The home view was displayed");
						},
						errorMessage: "The home view was not displayed"
					});
				}
			}
		}
	});
});