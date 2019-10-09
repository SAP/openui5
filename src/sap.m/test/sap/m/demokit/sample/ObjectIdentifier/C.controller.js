sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageBox, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectIdentifier.C", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},
		titleClicked: function(oEvent){
			MessageBox.alert("Title was clicked!");
		}
	});

});