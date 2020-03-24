sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], function (Opa5, Properties) {
	"use strict";

	// var sViewName = "App";

	Opa5.createPageObjects({
		onTheAppPage: {
			viewName: "App",

			actions: {
				// TODO - destroy() ?
				iCloseTheMessageBox: function () {
					return this.waitFor({
						id: "serviceErrorMessageBox",
						searchOpenDialogs: true,
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
						// viewName: sViewName,
						matchers: new Properties({
							layout: sLayout
						}),
						success: function () {
							Opa5.assert.ok(true, "The app shows " + sLayout + " layout");
						},
						errorMessage: "The app doesn't show " + sLayout + " layout"
					});
				}

			}

		}

	});

});
