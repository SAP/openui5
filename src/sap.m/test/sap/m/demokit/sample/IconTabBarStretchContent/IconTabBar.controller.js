sap.ui.controller("sap.m.sample.IconTabBarStretchContent.IconTabBar", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oImgModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
		this.getView().setModel(oImgModel, "img");
	}
});
