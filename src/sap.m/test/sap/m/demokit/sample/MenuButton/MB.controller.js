sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
		"use strict";

		var MBController = Controller.extend("sap.m.sample.MenuButton.MB", {
			onDefaultAction: function() {
				sap.m.MessageToast.show("Default action triggered");
			},
			onDefaultActionAccept: function() {
				sap.m.MessageToast.show("Accepted");
			},
			onPress: function (evt) {
				MessageToast.show(evt.getSource().getId() + " Pressed");
			},
			onMenuAction: function(oEvent) {
				var oItem = oEvent.getParameter("item"),
					sItemPath = "";
				while (oItem instanceof sap.m.MenuItem) {
					sItemPath = oItem.getText() + " > " + sItemPath;
					oItem = oItem.getParent();
				}

				sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

				sap.m.MessageToast.show("Action triggered on item: " + sItemPath);
			}
		});

		return MBController;

	});