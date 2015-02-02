sap.ui.controller("sap.m.sample.MultiComboBox.Page", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},


	handleSelectionChange: function(oEvent) {
		var changedItem = oEvent.getParameter("changedItem");
		var isSelected = oEvent.getParameter("selected");

		var state = "Selected";
		if (!isSelected) {
			state = "Deselected"
		}

		sap.m.MessageToast.show("Event 'selectionChange': " + state + " '" + changedItem.getText() + "'", {
			width: "auto"
		});
	},

	handleSelectionFinish: function(oEvent) {
		var selectedItems = oEvent.getParameter("selectedItems");
		var messageText = "Event 'selectionFinished': [";

		for (var i = 0; i < selectedItems.length; i++) {
			messageText += "'" + selectedItems[i].getText() + "'";
			if (i != selectedItems.length-1) {
				messageText += ",";
			}
		}

		messageText += "]";

		sap.m.MessageToast.show(messageText, {
			width: "auto"
		});
	}
});
