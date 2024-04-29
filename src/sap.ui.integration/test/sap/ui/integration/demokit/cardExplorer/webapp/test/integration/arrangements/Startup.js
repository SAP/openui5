sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], function(Opa5, Properties) {
	"use strict";

	return Opa5.extend("sap.ui.demo.cardExplorer.test.integration.arrangements.Startup", {

		iStartMyApp: function (options) {

			var oOptions = options || {};

			this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.demo.cardExplorer",
					settings : {
						id : "cardExplorer"
					},
					manifest: true
				},
				hash: oOptions.hash
			});

			return this.waitFor({
				controlType: "sap.m.Link",
				matchers: new Properties({ text: "UI Integration Cards" }),
				success: function () {
					Opa5.assert.ok(true, "Card Explorer has started");
				}
			});
		}
	});

});
