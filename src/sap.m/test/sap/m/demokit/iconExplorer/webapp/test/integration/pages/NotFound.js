sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function(Opa5, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheNotFoundPage: {

			actions: {

				iPressTheNotFoundShowOverviewLink: function () {
					return this.waitFor({
						id: "link",
						viewName: "NotFound",
						actions: new Press(),
						errorMessage: "Did not find the link on the not found page"
					});
				}
			},

			assertions: {

				iShouldSeeResourceNotFound: function () {
					return this.waitFor({
						id: "page",
						viewName: "NotFound",
						success: function (oPage) {
							Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "the not found title is shown as title");
							Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("notFoundText"), "the not found text is shown");
						},
						errorMessage: "Did not display the object not found text"
					});
				}

			}

		}

	});

});