sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel"
], function (Controller, Log, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.gridlist.controller.Main", {
		onInit: function () {
			var sDataUrl = sap.ui.require.toUrl("sap/f/gridlist/model/data.json"); // resolve the correct path for GridListVisualTests
			var model = new JSONModel(sDataUrl);
			this.getView().setModel(model);
		},
        onLayoutChange: function (oEvent) {
            Log.error("[TEST] Layout Changed to " + oEvent.getParameter("layout"));
        },
        onSliderMoved: function (oEvent) {
            var value = oEvent.getParameter("value");
            this.getView().byId("growingGridListBoxes").getDomRef().style.width = value + "%";
		}
    });

});

