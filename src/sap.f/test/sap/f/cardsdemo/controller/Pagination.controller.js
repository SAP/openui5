sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/Host",
	"sap/ui/model/json/JSONModel"
], function (Log, Controller, Host, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Pagination", {

		onInit: function () {
			const oHost = new Host({
				actions: [
					{
						type: 'Custom',
						text: 'Refresh',
						icon: 'sap-icon://refresh',
						action: function (oCard, oButton) {
							oCard.refresh();
						}
					},
					{
						type: 'Custom',
						text: 'Refresh Data',
						icon: 'sap-icon://refresh',
						action: function (oCard, oButton) {
							oCard.refreshData();
						}
					}
				]
			});

			const oModel = new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/tablecontent/tableManifests.json"));

			this.getView().byId('card2').setHost(oHost);
			this.getView().setModel(oModel, "manifests");
		},

		onAction: function () {
			Log.info("Action");
		}
	});
});