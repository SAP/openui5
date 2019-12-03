sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.cardExplorer.test.integration.arrangements.Startup", {

		iStartMyApp: function (oOptions) {

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
		}
	});

});
