sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.mdc.acc.field.Field", {

		onInit: function(oEvent) {

			var oView = this.getView();
			oView.bindElement("/ProductCollection('1239102')");

			var oViewModel = new JSONModel({
				editMode: false,
				ODataUnitCodeList: {
					"G" : {Text : "gram", UnitSpecificScale : 2},
					"KG" : {Text : "Kilogram", UnitSpecificScale : 3},
					"MG" : {Text : "Milligram", UnitSpecificScale : 4},
					"TO" : {Text : "ton", UnitSpecificScale : 5}
				}
			});
			oView.setModel(oViewModel, "view");
		}

	});
}, true);
