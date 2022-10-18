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

		onPreviousPage: function () {
			var oCard = this.byId("card1");
			oCard.getCardFooter().getPaginator().previous();
		},

		onNextPage: function () {
			var oCard = this.byId("card1");
			oCard.getCardFooter().getPaginator().next();
		},

		onChangeSelectFilter: function () {
			var oCard = this.byId("card1");
			oCard.setFilterValue("shipper", "2");
		},

		onInitialSelectFilter: function () {
			var oCard = this.byId("card1");
			oCard.setFilterValue("shipper", "3");
		},

		resolveManifest: function () {
			var oCard = this.byId("card1"),
				oCodeEditor = this.byId("output");

			ManifestResolver.resolveCard(oCard).then(function (oRes) {
				oCodeEditor.setValue(JSON.stringify(oRes, null, "\t"));
			});
		}
	});
});