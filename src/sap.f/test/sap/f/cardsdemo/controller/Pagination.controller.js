sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/Host"
], function (Log,
			 Controller,
			 Host) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Pagination", {

		onInit: function () {
			var oHost = new Host({
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

			this.getView().byId('card2').setHost(oHost);
		},

		onAction: function () {
			Log.info("Action");
		}
	});
});