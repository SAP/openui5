sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ListController", {

		onFormFactorChange: function () {
			document.getElementsByClassName("sapFGridContainer")[0].classList.toggle("sapUiSizeCompact");
		}

	});
});