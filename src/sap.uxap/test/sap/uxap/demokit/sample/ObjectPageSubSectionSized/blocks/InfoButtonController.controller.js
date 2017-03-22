sap.ui.define(["sap/m/MessageToast", "sap/ui/core/mvc/Controller"], function (MessageToast, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageSubSectionSized.blocks.InfoButtonController", {
		onInit: function () {
		},
		onAfterRendering: function () {
			var button = this.getView().byId("infoButton");
			var layout = this.getView().getParent().getColumnLayout();
			button.setText("Layout : " + layout);
		},
		onPress: function (oEvent) {
			MessageToast.show(this.getView().getParent().getColumnLayout());
		},
		onParentBlockModeChange: function () {
		}
	});
}, true);
