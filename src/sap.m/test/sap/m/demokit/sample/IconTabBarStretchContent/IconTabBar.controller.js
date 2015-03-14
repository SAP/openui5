sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var IconTabBarController = Controller.extend("sap.m.sample.IconTabBarStretchContent.IconTabBar", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
			this.getView().setModel(oImgModel, "img");
		}
	});


	return IconTabBarController;

});
