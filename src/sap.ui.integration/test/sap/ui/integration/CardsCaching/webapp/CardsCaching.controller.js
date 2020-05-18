sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/integration/Host'
	], function(Controller, MessageToast, Host) {
	"use strict";

	return Controller.extend("sap.ui.CardsCaching.CardsCaching", {

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
		}
	});
});