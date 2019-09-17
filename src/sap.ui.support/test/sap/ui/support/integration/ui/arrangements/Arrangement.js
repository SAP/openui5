sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/support/integration/ui/data/CommunicationMock"
], function (jQuery, Opa5, Communication) {
	"use strict";

	var _sSupportAssistantPath = jQuery.sap.getResourcePath("sap/ui/support/supportRules/ui/overlay", ".html");

	return Opa5.extend("sap.ui.support.integration.ui.arrangements.Arrangement", {

		iStartMyApp: function () {
			Communication.init(Opa5.getWindow);
			return this.iStartMyAppInAFrame(_sSupportAssistantPath);
		},

		iStartMyAppAndDeletePersistedData: function () {
			// first start the app
			this.iStartMyApp();
			// then clear the persistent storage
			this.waitFor({
				check: function() {
					// wait for the support assistant classes to be loaded (not covered by iStartMyApp)
					return Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Storage") != null
						&& Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Constants") != null
						&& Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/ui/models/SharedModel") != null;
				},
				success: function() {
					var Storage = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Storage"),
						Constants = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Constants"),
						SharedModel = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/ui/models/SharedModel");

					Storage.deletePersistenceCookie(Constants.COOKIE_NAME);
					Storage.removeAllData();
					SharedModel.setProperty("/persistingSettings", false);
				}
			});
		}

	});

});