sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	// simple example of an OPA5 extension test library.
	// OPA5 test library configuration can receive an instance of this library.
	// All methods defined here can be accessed directly on the Given, When, Then clauses (eg: Given.iStartMyApp())
	var Common = Opa5.extend("testLibrary.pageObjects.Common", {

		arrangements: {
			iStartMyApp: function () {
				return this.iStartMyAppInAFrame("applicationUnderTest/index.html");
			}
		},

		assertions: {
			iLeaveMyApp: function () {
				return this.waitFor({
					success: function () {
						Opa5.assert.ok(true, "Custom application teardown logic executed");
					}
				});
			}
		}
	});

	return Common;

});
