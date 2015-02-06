sap.ui.controller("sap.m.sample.ScrollContainer.ScrollContainer", {

	onInit: function() {
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			width: (sap.ui.Device.system.phone) ? "50em" : "100em"
		}));

		// set explored app's demo model on this sample
		var oImgModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
		this.getView().setModel(oImgModel, "img");
	}
});
