sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.ResponsiveSplitter.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			var oModelSizes = new JSONModel({
				pane1: "auto",
				pane2: "auto",
				pane3: "auto"
			});

			this.getView().setModel(oModelSizes, "sizes");
		},

		onRootContainerResize: function (oEvent) {
			var aOldSizes = oEvent.getParameter("oldSizes"),
				aNewSizes = oEvent.getParameter("newSizes"),
				sMessage =  "Root container is resized.";

			if (aOldSizes && aOldSizes.length) {
				sMessage += "\nOld panes sizes = [" + aOldSizes + "]";
			}

			sMessage += "\nNew panes sizes = [" + aNewSizes + "]";

			MessageToast.show(sMessage);
		},

		onInnerContainerResize: function (oEvent) {
			var aOldSizes = oEvent.getParameter("oldSizes"),
				aNewSizes = oEvent.getParameter("newSizes"),
				sMessage =  "Inner container is resized.";

			if (aOldSizes && aOldSizes.length) {
				sMessage += "\nOld panes sizes = [" + aOldSizes + "]";
			}

			sMessage += "\nNew panes sizes = [" + aNewSizes + "]";

			MessageToast.show(sMessage);
		}
	});
});