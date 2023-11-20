sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListModes.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridListModes/model/data.json"));
			this.getView().setModel(oModel);
		},

		onModeChange: function (oEvent) {
			var sMode = oEvent.getParameter("item").getKey();
			this.byId("gridList").setMode(sMode);
			this.byId("gridList").setHeaderText("GridList with mode " + sMode);
		},

		onSelectionChange: function (oEvent) {
			var bSelected = oEvent.getParameter("selected");
			MessageToast.show((bSelected ? "Selected" : "Unselected") + " item with ID " + oEvent.getParameter("listItem").getId());
		},

		onDelete: function (oEvent) {
			MessageToast.show("Delete item with ID " + oEvent.getParameter("listItem").getId());
		},

		onDetailPress: function (oEvent) {
			MessageToast.show("Request details for item with ID " + oEvent.getSource().getId());
		},

		onPress: function (oEvent) {
			MessageToast.show("Pressed item with ID " + oEvent.getSource().getId());
		}

	});
});