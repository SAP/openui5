sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"./Common"
], function(Opa5, PropertyStrictEquals, Common) {
	"use strict";

	var sViewName = "App",
		sAppId = "app";

	Opa5.createPageObjects({
		onTheAppPage : {
			baseClass : Common,

			actions : {

				iCloseTheMessageBox : function () {
					return this.waitFor({
						id : "serviceErrorMessageBox",
						autoWait: false,
						success : function (oMessageBox) {
							oMessageBox.destroy();
							Opa5.assert.ok(true, "The MessageBox was closed");
						}
					});
				}
			},

			assertions : {

				iShouldSeeTheBusyIndicatorForTheWholeApp : function () {
						return this.waitFor({
						id : sAppId,
						viewName : sViewName,
						matchers : new PropertyStrictEquals({
							name : "busy",
							value : true
						}),
						autoWait: false,
						pollingInterval: 100,
						success : function () {
							// we set the view busy, so we need to query the parent of the app
							Opa5.assert.ok(true, "The app is busy");
						},
						errorMessage : "The App is not busy"
					});
				},

				iShouldSeeTheMessageBox : function () {
					return this.waitFor({
						id : "serviceErrorMessageBox",
						autoWait: false,
						success : function () {
							Opa5.assert.ok(true, "The correct MessageBox was shown");
						}
					});
				}
			}
		}

	});

});