sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.TableContent", {
		onFormFactorChange: function (oEvent) {
			document.getElementsByClassName("sapMPanel")[0].classList.toggle("sapUiSizeCompact");
		}
	});
});