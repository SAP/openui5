sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
		"use strict";

		var MBController = Controller.extend("sap.m.sample.MenuButton.MB", {
			onDefaultAction: function() {
				sap.m.MessageToast.show("Default action triggered");
			},
			onDefaultActionAccept: function() {
				sap.m.MessageToast.show("Accepted");
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