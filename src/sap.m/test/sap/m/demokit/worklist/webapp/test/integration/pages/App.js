sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"./Common"
], function(Opa5, PropertyStrictEquals, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage : {
			baseClass : Common,

			actions : {

				iCloseTheMessageBox : function () {
					return this.waitFor({
						searchOpenDialogs: true,
						id : "serviceErrorMessageBox",
						success : function (oMessageBox) {
							oMessageBox.close();
							Opa5.assert.ok(true, "The MessageBox was closed");
						}
					});
				}
			},

			assertions : {

				iShouldSeeTheMessageBox : function () {
					return this.waitFor({
						searchOpenDialogs: true,
						id : "serviceErrorMessageBox",
						success : function () {
							Opa5.assert.ok(true, "The correct MessageBox was shown");
						}
					});
				}
			}
		}
	});
});