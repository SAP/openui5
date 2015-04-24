sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/masterdetail/test/integration/pages/Common"
	],
	function(Opa5, Common) {
		"use strict";

		var sNotFoundPageId = "page",
			sNotFoundView = "NotFound",
			sDetailNotFoundView = "DetailObjectNotFound";

		Opa5.createPageObjects({
			onTheNotFoundPage: {
				baseClass: Common,
				actions: { },
				assertions: {
					iShouldSeeTheNotFoundGeneralPage : function (sPageId, sPageViewName) {
						return this.waitFor({
							//controlType : "sap.m.MessagePage"
							id : sPageId,
							viewName : sPageViewName,
							success : function (oPage) {
								// workaround, we currently cannot test not loaded controls in Opa, awaiting fix
								QUnit.strictEqual(oPage.getMetadata().getName(), "sap.m.MessagePage", "shows the message page");
							},
							errorMessage: "did not reach the empty page"
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
							success: function (oPage) {
								QUnit.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "the not found text is shown as title");
								QUnit.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("notFoundText"), "the resource not found text is shown");
							},
							errorMessage: "did not display the resource not found text"
						});
					},

					theNotFoundPageShouldSayObjectNotFound : function () {
						return this.waitFor({
							id : sNotFoundPageId,
							viewName : sDetailNotFoundView,
							success: function (oPage) {
								QUnit.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("detailTitle"), "the object text is shown as title");
								QUnit.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noObjectFoundText"), "the object not found text is shown");
							},
							errorMessage: "did not display the object not found text"
						});
					}
				}
			}
		});
	});
