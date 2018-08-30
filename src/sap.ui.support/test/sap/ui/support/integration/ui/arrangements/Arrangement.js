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
			this.iStartMyApp()
				.done(function () {
					var Storage = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Storage"),
						Constants = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/Constants"),
						SharedModel = Opa5.getWindow().sap.ui.require("sap/ui/support/supportRules/ui/models/SharedModel");

					Storage.deletePersistenceCookie(Constants.COOKIE_NAME);
					Storage.removeAllData();
					SharedModel.setProperty("/persistingSettings", false);
				});
		}

	});

});