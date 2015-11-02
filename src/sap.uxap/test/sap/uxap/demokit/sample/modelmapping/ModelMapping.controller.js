sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ModelMapping.ModelMapping", {

		onInit: function () {

			var oModel = new JSONModel({
				Employee: {
					firstName: "John",
					lastName: "Miller"
				}
			});

			this.getView().setModel(oModel, "jsonModel");
		}
	});

}, true);
