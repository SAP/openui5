sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
], function(MessageBox, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectHeaderResponsiveII.Page", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onPress: function () {
			MessageBox.alert("Link was clicked!");
		}
	});

});