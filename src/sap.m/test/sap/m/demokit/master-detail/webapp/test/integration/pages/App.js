sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], function (Opa5, Properties) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage: {
			viewName: "App",

			actions: {

				iCloseTheMessageBox: function () {
					return this.waitFor({
						searchOpenDialogs: true,
						id: "serviceErrorMessageBox",
						success: function (oMessageBox) {
							oMessageBox.destroy();
							Opa5.assert.ok(true, "The MessageBox was closed");
						}
					});
				}
			},

			assertions: {

				iShouldSeeTheMessageBox: function () {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Dialog",
						matchers: new Properties({
							type: "Message"
						}),
						success: function () {
							Opa5.assert.ok(true, "The correct MessageBox was shown");
						}
					});
				},

				theAppShowsFCLDesign: function (sLayout) {
					return this.waitFor({
						id: "layout",
						matchers: new Properties({
							layout: sLayout
						}),
						success: function () {
							Opa5.assert.ok(true, "the app shows " + sLayout + " layout");
						},
						errorMessage: "The app does not show " + sLayout + " layout"
					});
				}


			}

		}

	});

});
