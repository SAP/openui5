sap.ui.controller("sap.m.sample.Image.ImageGroup", {

	onInit: function() {
		var bIsPhone = sap.ui.Device.system.phone;
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			imageWidth: bIsPhone ? "5em" : "10em",
		}));
	},

	handleImage3Press: function(evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("The image has been pressed");
	}

});