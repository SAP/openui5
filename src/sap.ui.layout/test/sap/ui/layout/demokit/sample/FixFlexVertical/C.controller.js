sap.ui.controller("sap.ui.layout.sample.FixFlexVertical.C", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oImgModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
		this.getView().setModel(oImgModel, "img");
	}
});
