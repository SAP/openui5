sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSON, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.BoundModelMapping.BoundModelMapping", {
		onInit: function () {
			var oModel = new JSON({
				externalPath: "/Employee",
				Employee: {
					firstName: "John",
					lastName: "Miller"
				}
			});
			this.getView().setModel(oModel, "jsonModel");
		}
	});
}, true);
