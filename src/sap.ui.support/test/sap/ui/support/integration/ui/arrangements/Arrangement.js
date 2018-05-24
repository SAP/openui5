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
			this.iStartMyAppInAFrame(_sSupportAssistantPath);
		}

	});

});