sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/integration/Host'
	], function(Controller, Host) {
	"use strict";

	var mStoredChanges = new WeakMap();

	return Controller.extend("sap.ui.integration.sample.ConfigurationChanges.ConfigurationChanges", {

		onInit: function () {
			var oCard1 = this.getView().byId('card1'),
				oCard2 = this.getView().byId('card2'),
				oHost = new Host({
					cardConfigurationChange: function (oEvent) {
						var oCard = oEvent.getParameter("card"),
							mChanges = oEvent.getParameter("changes");

						if (!mStoredChanges.get(oCard)) {
							mStoredChanges.set(oCard, {});
						}

						Object.assign(mStoredChanges.get(oCard), mChanges);
					}
				});

			oCard1.setHost(oHost);
			oCard2.setHost(oHost);
		},

		changeFilters: function () {
			var oCard1 = this.getView().byId('card1'),
				oCard2 = this.getView().byId('card2');

			if (mStoredChanges.get(oCard1)) {
				oCard1.setManifestChanges([Object.assign({}, mStoredChanges.get(oCard1))]);
			}

			if (mStoredChanges.get(oCard2)) {
				oCard2.setManifestChanges([Object.assign({}, mStoredChanges.get(oCard2))]);
			}
		},

		refreshCards: function () {
			var oCard1 = this.getView().byId('card1'),
				oCard2 = this.getView().byId('card2');

			oCard1.setManifestChanges([]);
			oCard1.refresh();

			oCard2.setManifestChanges([]);
			oCard2.refresh();
		}
	});
});