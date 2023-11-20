sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/integration/Host'
	], function(Controller, MessageToast, Host) {
	"use strict";

	var aMobileCards = [];

	return Controller.extend("sap.ui.integration.sample.HostActions.HostActions", {

		onInit: function () {

			var oHost = new Host({
				actions: [
					{
						type: 'Navigation',
						text: 'Open SAP website',
						icon: 'sap-icon://globe',
						url: "http://www.sap.com",
						target: "_blank",
						enabled: function (oCard) {
							return oCard.getId().indexOf('card1') > -1;
						}
					},
					{
						type: 'Custom',
						text: 'Add to Mobile',
						icon: 'sap-icon://add',
						visible: function (oCard) {
							return new Promise(function (resolve) {
								resolve(aMobileCards.indexOf(oCard) === -1);
							});
						},
						action: function (oCard, oButton) {
							if (aMobileCards.indexOf(oCard) === -1) {
								aMobileCards.push(oCard);

								MessageToast.show("Card successfully added to Mobile.");
							}
						}
					},
					{
						type: 'Custom',
						text: 'Remove from Mobile',
						icon: 'sap-icon://decline',
						visible: function (oCard) {
							return new Promise(function (resolve) {
								resolve(aMobileCards.indexOf(oCard) > -1);
							});
						},
						action: function (oCard, oButton) {
							var iIndex = aMobileCards.indexOf(oCard);
							if (iIndex > -1) {
								aMobileCards.splice(iIndex, 1);

								MessageToast.show("Card successfully removed from Mobile.");
							}
						}
					}
				]
			});

			this.getView().byId('card1').setHost(oHost);
			this.getView().byId('card2').setHost(oHost);
		}
	});
});