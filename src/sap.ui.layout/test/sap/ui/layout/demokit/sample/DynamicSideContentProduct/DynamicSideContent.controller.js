sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var DynamicSideContent = Controller.extend("sap.ui.layout.sample.DynamicSideContentProduct.DynamicSideContent", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
			this.getView().setModel(oImgModel, "img");

			// set mock feed model
			var sPath = jQuery.sap.getModulePath("sap.ui.layout.sample.DynamicSideContentProduct", "/feed.json")
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		},
		onBeforeRendering: function() {
			this.getView().byId("DSCWidthSlider").setVisible(!sap.ui.Device.system.phone);
			this.getView().byId("DSCWidthHintText").setVisible(!sap.ui.Device.system.phone);
		},
		handleSliderChange: function (oEvent) {
			var iValue = oEvent.getParameter("value");
			this.updateControlWidth(iValue);
		},
		updateControlWidth: function (iValue) {
			var $DSCContainer = this.getView().byId("sideContentContainer").$();
			if (iValue) {
				$DSCContainer.width(iValue + "%");
			}
		},
		updateToggleButtonState: function (oEvent) {
			var oToggleButton = this.getView().byId("toggleButton"),
				sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");

			if (sCurrentBreakpoint === "S") {
				oToggleButton.setEnabled(true);
			} else {
				oToggleButton.setEnabled(false);
			}
		},
		handleToggleClick: function (oEvent) {
			this.getView().byId("DynamicSideContent").toggle();
		}
	});

	return DynamicSideContent;

});
