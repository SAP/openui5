sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/demo/masterdetail/test/integration/pages/Common"
	], function(Opa5, Common) {
		"use strict";

		var sNotFoundPageId = "page",
			sNotFoundView = "NotFound",
			sDetailNotFoundView = "DetailObjectNotFound";

		Opa5.createPageObjects({
			onTheNotFoundPage : {
				baseClass : Common,

				actions : {

					iPressTheBackButton : function (sViewName) {
						return this.waitFor({
							id : sNotFoundPageId,
							viewName : sViewName,
							success : function (oPage) {
								oPage.fireNavButtonPress();
							}
						});
					}

				},

				assertions : {

					iShouldSeeTheNotFoundGeneralPage : function (sPageId, sPageViewName) {
						return this.waitFor({
							controlType : "sap.m.MessagePage",
							viewName : sPageViewName,
							success : function () {
								Opa5.assert.ok(true, "Shows the message page");
							},
							errorMessage : "Did not reach the empty page"
						});
					},

					iShouldSeeTheNotFoundPage : function () {
						return this.iShouldSeeTheNotFoundGeneralPage(sNotFoundPageId, sNotFoundView);
					},

					iShouldSeeTheObjectNotFoundPage : function () {
						return this.iShouldSeeTheNotFoundGeneralPage(sNotFoundPageId, sDetailNotFoundView);
					},

					theNotFoundPageShouldSayResourceNotFound : function () {
						return this.waitFor({
							id : sNotFoundPageId,
							viewName : sNotFoundView,
							success : function (oPage) {
								Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "The not found text is shown as title");
								Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("notFoundText"), "The resource not found text is shown");
							},
							errorMessage : "Did not display the resource not found text"
						});
					},

					theNotFoundPageShouldSayObjectNotFound : function () {
						return this.waitFor({
							id : sNotFoundPageId,
							viewName : sDetailNotFoundView,
							success : function (oPage) {
								Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("detailTitle"), "The object text is shown as title");
								Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noObjectFoundText"), "The object not found text is shown");
							},
							errorMessage : "Did not display the object not found text"
						});
					}

				}

			}

		});

	}
);
