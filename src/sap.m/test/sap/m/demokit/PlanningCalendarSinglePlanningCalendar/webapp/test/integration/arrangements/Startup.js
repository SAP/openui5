sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("teamCalendar.test.integration.arrangements.Startup", {

		/**
		 * Initializes mock server, then starts the app component
		 * @param {object} oOptionsParameter An object that contains the configuration for starting up the app
		 * @param {int} oOptionsParameter.delay A custom delay to start the app with
		 * @param {string} [oOptionsParameter.hash] The in-app hash can also be passed separately for better readability in tests
		 * @param {boolean} [oOptionsParameter.autoWait=true] Automatically wait for pending requests while the application is starting up
		 */
		iStartMyApp : function (oOptionsParameter) {
			var oOptions = oOptionsParameter || {};

			// start the app with a minimal delay to make tests fast but still async to discover basic timing issues
			oOptions.delay = oOptions.delay || 1;

			// start the app UI component
			this.iStartMyUIComponent({
				componentConfig: {
					name: "teamCalendar",
					manifest: true
				},
				hash: oOptions.hash,
				autoWait: oOptions.autoWait
			});
		},
		iStartMyAppWithHash : function (oOptions, iMemberId) {
			this.waitFor({
				success : function() {
					oOptions.hash = "memberCalendar/" + iMemberId;
					this.iStartMyApp(oOptions);
				}
			});
		}
	});
});