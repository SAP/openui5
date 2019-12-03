sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/support/integration/ui/data/CommunicationMock",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (jQuery, Opa5, Communication, PropertyStrictEquals) {
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
			// wait for the app to load and for the supportRules to be required
			return this.waitFor({
				controlType: "sap.m.Text",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: "Support Assistant"
				}),
				check: function() {
					// wait for the support assistant classes to be loaded (not covered by iStartMyApp)
					return Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Storage") != null
						&& Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Constants") != null
						&& Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/ui/models/SharedModel") != null;
				},
				success: function () {
					var Storage = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Storage");
					var Constants = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Constants");
					var SharedModel = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/ui/models/SharedModel");
					Storage.deletePersistenceCookie(Constants.COOKIE_NAME);
					Storage.removeAllData();
					SharedModel.setProperty("/persistingSettings", false);
				}
			});
		}

	});

});