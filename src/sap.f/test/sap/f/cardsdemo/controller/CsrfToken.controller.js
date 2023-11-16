sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/integration/Host'
	], function(Controller, MessageToast, Host) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.CsrfToken", {

		onInit: function () {
			var oHost = new Host({
				actions: [
					{
						type: 'Custom',
						text: 'Refresh',
						action: function (oCard, oButton) {
							oCard.refresh();
						}
					}
				]
			});

			this.getView().byId('card1').setHost(oHost);
			this.getView().byId('card2').setHost(oHost);
			this.getView().byId('card3').setHost(oHost);
			this.getView().byId('card4').setHost(oHost);
			this.getView().byId('card5').setHost(oHost);
			this.getView().byId('card6').setHost(oHost);
		}
	});
});