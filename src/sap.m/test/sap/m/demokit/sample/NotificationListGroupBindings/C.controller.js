sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Priority",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Priority, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.NotificationListGroupBindings.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/NotificationListGroupBindings/model/notifications.json"));
			this.getView().setModel(oModel);
		},

		priorityFormatter: function (sValue) {
			if (sValue in Priority) {
				return sValue;
			}

			return Priority.None;
		},

		onGroupClose: function (oEvent) {
			MessageToast.show('Group Closed: ' + oEvent.getSource().getTitle());
		},

		onListItemPress: function (oEvent) {
			MessageToast.show('Item Pressed: ' + oEvent.getSource().getTitle());
		},

		onItemButtonPress: function (oEvent) {
			MessageToast.show("Item Button '" + oEvent.getSource().getText() + "' Pressed");
		},

		onGroupButtonPress: function (oEvent) {
			MessageToast.show("Group Button '" + oEvent.getSource().getText() + "' Pressed");
		},

		onItemClose: function (oEvent) {
			var oItem = oEvent.getSource(),
				oList = oItem.getParent();

			oList.removeItem(oItem);
			MessageToast.show("Item Closed: " + oItem.getTitle());
		}

	});
});