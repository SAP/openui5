sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("v4server.integration.arrangements.Startup", {

		/**
		 * Starts the app component
		 */
		iStartMyApp: function () {
			// start the app UI component
			this.iStartMyUIComponent({
				componentConfig: {
					name: "v4server.integration.app",
					async: true
				}
			});
		}
	});
});
