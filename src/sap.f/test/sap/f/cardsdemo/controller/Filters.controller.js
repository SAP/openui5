sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Filters", {
		onInit: function () {
			this.getView().setModel(new JSONModel({
				cardWidth: 100
			}), "settings");
		}
	});

});