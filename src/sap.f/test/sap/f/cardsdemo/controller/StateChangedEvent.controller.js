sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/util/ManifestResolver",
	"sap/m/MessageToast"
], function (Controller, ManifestResolver, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.StateChangedEvent", {

		onInit: function () {
		},

		onStateChanged: function () {
			MessageToast.show("State changed", {
				at: "center center",
				duration: 1000
			});

			this.resolveManifest();
		},

		onRefresh: function () {
			this.byId("card1").refresh();
		},

		onRefreshData: function () {
			this.byId("card1").refreshData();
		},

		resolveManifest: function () {
			var oCard = this.byId("card1"),
				oCodeEditor = this.byId("output");

			ManifestResolver.resolveCard(oCard).then(function (sRes) {
				oCodeEditor.setValue(JSON.stringify(JSON.parse(sRes), null, "\t"));
			});
		}
	});
});