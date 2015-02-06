sap.ui.controller("sap.m.sample.Image.ImageGroup", {

	onInit: function() {
		var bIsPhone = sap.ui.Device.system.phone;
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			imageWidth: bIsPhone ? "5em" : "10em"
		}));

		// set explored app's demo model on this sample
		var oImgModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
		this.getView().setModel(oImgModel, "img");
	},

	handleImage3Press: function(evt) {
		sap.m.MessageToast.show("The image has been pressed");
	}
});
