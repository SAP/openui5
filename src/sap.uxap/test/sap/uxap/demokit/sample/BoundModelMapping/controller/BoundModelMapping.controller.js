sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.BoundModelMapping.controller.BoundModelMapping", {
		onInit: function () {
			var oModel = new JSONModel({
				externalPath: "/Employee",
				Employee: {
					firstName: "John",
					lastName: "Miller"
				}
			});
			this.getView().setModel(oModel, "jsonModel");
		}
	});
});
