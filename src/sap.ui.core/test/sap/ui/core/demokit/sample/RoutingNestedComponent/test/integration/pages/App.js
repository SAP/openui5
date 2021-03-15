sap.ui.define([
	"sap/ui/test/Opa5",
	"./Base",
	"sap/ui/test/actions/Press"
], function (Opa5, Base, Press) {
	"use strict";

	var sViewName = "App";

	Opa5.createPageObjects({
		onTheAppPage: {
			baseClass: Base,
			actions: {

				iSelectMenuItem: function (sMenuItemId) {
					return this.waitFor({
						id: sMenuItemId,
						viewName: sViewName,
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "The MenuItem '" + sMenuItemId + "' was closed.");
						}
					});
				}
			}

		}

	});

});