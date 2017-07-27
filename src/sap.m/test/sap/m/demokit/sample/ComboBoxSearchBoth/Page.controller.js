sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ComboBoxSearchBoth.Page", {

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/countriesCollection.json"));
			oModel.setProperty("/comboBoxValue", "");
			oModel.setProperty("/comboBoxKey", "");
			this.getView().setModel(oModel);
		},

		fnFormatter: function(text, key) {
			var sText = "";

			if (text && key) {
				sText += (text + " (" + key + ")");
			} else if (text) {
				sText += text;
			} else if (key) {
				sText += key;
			}

			return sText;
		}
	});

	return PageController;

});