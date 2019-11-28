sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheExplorePage: {

			actions: {

			},

			assertions: {
				firstOpaTest: function () {
					Opa5.assert.ok(true, "First OPA test");
				}
			}
		}
	});
});
