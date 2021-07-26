sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiComboBox.controller.MultiComboBox", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},


		handleSelectionChange: function(oEvent) {
			var changedItems = oEvent.getParameter("changedItems") || [oEvent.getParameter("changedItem")];
			var isSelected = oEvent.getParameter("selected");
			var isSelectAllTriggered = oEvent.getParameter("selectAll");
			var state = isSelected ? "Selected" : "Deselected";

			var fnLogChangedItems = function() {
				var changesLog = "Event 'selectionChange':\n Select all: " + isSelectAllTriggered +  ":\n ";

				changedItems.forEach(function(oItem) {
					changesLog += state + " '" + oItem.getText() + "'" + "\n";
				});

				return changesLog;
			};

			MessageToast.show(fnLogChangedItems());
		},

		handleSelectionFinish: function(oEvent) {
			var selectedItems = oEvent.getParameter("selectedItems");
			var messageText = "Event 'selectionFinished': [";

			for (var i = 0; i < selectedItems.length; i++) {
				messageText += "'" + selectedItems[i].getText() + "'";
				if (i != selectedItems.length - 1) {
					messageText += ",";
				}
			}

			messageText += "]";

			MessageToast.show(messageText, {
				width: "auto"
			});
		}
	});
});