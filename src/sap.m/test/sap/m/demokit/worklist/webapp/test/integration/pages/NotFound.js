sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./Common"
], function(Opa5, Press, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheNotFoundPage : {
			baseClass : Common,

			actions : {

				iWaitUntilISeeObjectNotFoundPage : function () {
					return this.waitFor({
						id : "page",
						viewName : "ObjectNotFound",
						success : function (oPage) {
							Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("objectTitle"), "the object text is shown as title");
							Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noObjectFoundText"), "the object not found text is shown");
						},
						errorMessage : "Did not display the object not found text"
					});
				},

				iWaitUntilISeeResourceNotFoundPage : function () {
					return this.waitFor({
						id : "page",
						viewName : "NotFound",
						success : function (oPage) {
							Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "the not found title is shown as title");
							Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("notFoundText"), "the not found text is shown");
						},
						errorMessage : "Did not display the object not found text"
					});
				},

				iPressTheObjectNotFoundShowWorklistLink : function () {
					return this.waitFor({
						id : "link",
						viewName : "ObjectNotFound",
						actions : new Press(),
						errorMessage : "Did not find the link on the not found page"
					});
				},

				iPressTheNotFoundShowWorklistLink : function () {
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
						id : "page",
						viewName : "ObjectNotFound",
						success: function (oPage) {
							Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("objectTitle"), "the object text is shown as title");
							Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noObjectFoundText"), "the object not found text is shown");
						},
						errorMessage: "Did not display the object not found text"
					});
				},

				iShouldSeeResourceNotFound : function () {
					return this.waitFor({
						id : "page",
						viewName : "NotFound",
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