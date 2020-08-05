sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	"sap/m/MenuItem"
], function(Controller, MessageToast, MenuItem) {
		"use strict";

		return Controller.extend("sap.m.sample.MenuButton.MB", {
			onDefaultAction: function() {
				MessageToast.show("Default action triggered");
			},
			onDefaultActionAccept: function() {
				MessageToast.show("Accepted");
			},
			onPress: function (evt) {
				MessageToast.show(evt.getSource().getId() + " Pressed");
			},
			onMenuAction: function(oEvent) {
				var oItem = oEvent.getParameter("item"),
					sItemPath = "";

				while (oItem instanceof MenuItem) {
					sItemPath = oItem.getText() + " > " + sItemPath;
					oItem = oItem.getParent();
				}

				sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

				MessageToast.show("Action triggered on item: " + sItemPath);
			}
		});

	});