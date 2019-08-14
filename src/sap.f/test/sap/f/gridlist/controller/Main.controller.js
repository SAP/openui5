sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel"
], function (Controller, Log, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.gridlist.controller.Main", {
		onInit: function () {
			var model = new JSONModel("./model/data.json");
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

