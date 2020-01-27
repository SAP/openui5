sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function(Opa5, Press) {
	"use strict";

	Opa5.createPageObjects({

		onTheNotFoundPage : {

			actions : {

				iPressTheMemberNotFoundShowPlanningCalendarLink : function () {
					return this.waitFor({
						id : "link",
						viewName : "ObjectNotFound",
						actions : new Press(),
						errorMessage : "Did not find the link on the not found page"
					});
				},

				iPressTheNotFoundShowPlanningCalendarLink : function () {
					return this.waitFor({
						id : "link",
						viewName : "NotFound",
						actions : new Press(),
						errorMessage : "Did not find the link on the not found page"
					});
				}
			},

			assertions : {

				iShouldSeeObjectNotFound : function () {
					return this.waitFor({
						id : "objectNotFoundPage",
						viewName : "ObjectNotFound",
						success: function (oPage) {
							Opa5.assert.strictEqual(oPage.getTitle(), "Team Member Calendar", "the object text is shown as title");
							Opa5.assert.strictEqual(oPage.getText(), "Team Member not found", "the object not found text is shown");
						},
						errorMessage: "Did not display the Member not found text"
					});
				},

				iShouldSeeResourceNotFound : function () {
					return this.waitFor({
						id : "notFoundPage",
						viewName : "NotFound",
						success: function (oPage) {
							Opa5.assert.strictEqual(oPage.getTitle(), "Page Not found", "the not found title is shown as title");
							Opa5.assert.strictEqual(oPage.getText(), "The requested page is missing", "the not found text is shown");
						},
						errorMessage: "Did not display the object not found text"
					});
				}

			}

		}

	});

});