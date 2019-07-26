sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListModes.C", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridListModes/data.json"));
			this.getView().setModel(oModel);
		},

		onModeChange: function (oEvent) {
			var sMode = oEvent.getParameter("item").getKey();

			this.byId("gridList").setMode(sMode);
			this.byId("gridList").setHeaderText("GridList with mode " + sMode);
		},

		onSelectionChange: function (oEvent) {
			var oGridListItem = oEvent.getParameter("listItem"),
				bSelected = oEvent.getParameter("selected");

			MessageToast.show((bSelected ? "Selected" : "Unselected") + " item with Id " + oGridListItem.getId());
		},

		onDelete: function (oEvent) {
			var oGridListItem = oEvent.getParameter("listItem");

			MessageToast.show("Delete item with Id " + oGridListItem.getId());
		},

		onDetailPress: function (oEvent) {
			var oGridListItem = oEvent.getSource();

			MessageToast.show("Request details for item with Id " + oGridListItem.getId());
		}
	});

});

