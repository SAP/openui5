sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageBox, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectIdentifier.C", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},
		titleClicked: function(){
			MessageBox.alert("Title was clicked!");
		}
	});

});