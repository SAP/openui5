sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.TableContent", {
		onInit: function () {
			var oModel = new JSONModel("./cardcontent/tablecontent/tableManifests.json");
			this.getView().setModel(oModel);
		},
		onFormFactorChange: function (oEvent) {
			document.getElementsByClassName("sapFGridContainer")[0].classList.toggle("sapUiSizeCompact");
		}
	});
});
