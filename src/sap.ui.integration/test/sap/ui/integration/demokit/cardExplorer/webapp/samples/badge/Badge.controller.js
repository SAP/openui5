sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/integration/Host'
	], function(Controller, MessageToast, Host) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.Badge.Badge", {
		onButtonPress: function () {
			var oCard1 = this.getView().byId("cardId1"),
				oCard2 = this.getView().byId("cardId2");

			oCard1.getBadgeCustomData().setVisible(true);
			oCard2.getBadgeCustomData().setVisible(true);
		}
	});
});