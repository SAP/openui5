sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/base/Log",
	'sap/ui/integration/Host'
], function (Controller, Log, Host) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.interactionInGrid.InteractionInGrid", {

		onInit: function () {
			var oHost = new Host({
				resolveDestination: function () {
					return "https://services.odata.org/V3/Northwind/Northwind.svc";
				}
			});
			this.getView().byId('cardId1').setHost(oHost);
		}
	});
});