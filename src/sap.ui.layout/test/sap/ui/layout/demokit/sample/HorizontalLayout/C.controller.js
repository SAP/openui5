sap.ui.controller("sap.ui.layout.sample.HorizontalLayout.C", {

	onInit: function () {
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			widthS: (sap.ui.Device.system.phone) ? "2em" : "5em",
			widthM: (sap.ui.Device.system.phone) ? "4em" : "10em",
			widthL: (sap.ui.Device.system.phone) ? "6em" : "15em"
		}));

		// set explored app's demo model on this sample
		var oImgModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
		this.getView().setModel(oImgModel, "img");
	}
});
