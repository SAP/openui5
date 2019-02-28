sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	// in test library page object definition, OPA5 arrangements configuration can receive an instance of Common2
	// All methods defined here can be accessed directly on the Given, When or Then clauses (eg: Then.iLeaveMyApp())
	var Common2 = Opa5.extend("testLibrary.pageObjects.Common2", {

		iResetMyApp: function () {
			return this.waitFor({
				success: function () {
					Opa5.assert.ok(true, "Custom application teardown logic executed");
				}
			});
		}

	});

	return Common2;

});
