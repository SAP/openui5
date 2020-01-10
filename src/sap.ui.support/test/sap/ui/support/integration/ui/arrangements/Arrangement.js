sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/support/integration/ui/data/CommunicationMock",
	"sap/ui/support/integration/ui/utils/Cookies",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/Constants"
], function (jQuery, Opa5, Communication, Cookies, PropertyStrictEquals, SupportAssistantStorage, Constants) {
	"use strict";

	var _sSupportAssistantPath = jQuery.sap.getResourcePath("sap/ui/support/supportRules/ui/overlay", ".html?sap-ui-animation=false");

	return Opa5.extend("sap.ui.support.integration.ui.arrangements.Arrangement", {

		iStartMyApp: function () {
			Communication.init(Opa5.getWindow);
			this.iStartMyAppInAFrame({
				source: _sSupportAssistantPath,
				autoWait: true
			});
			return this.waitFor({
				controlType: "sap.m.Text",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: "Support Assistant"
				}),
				success: function () {
					Opa5.assert.ok(true, "Support assistant UI is visible");
				}
			});
		},

		iDeletePersistedData: function () {
			// delete persistence cookie
			var sCookiePath = Cookies.resolvePath("sap/ui/support/supportRules/ui");
			Cookies.delete(Constants.COOKIE_NAME, sCookiePath);

			// delete localStorage data
			// it is shared between main window and application window so we can do it from here
			SupportAssistantStorage.removeAllData();

			Opa5.assert.ok(true, "Persistence cookie and local storage data are deleted");

			return this;
		}
	});

});