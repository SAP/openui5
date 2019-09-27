sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/m/Library"
], function(Controller, JSONModel, MLibrary) {
	"use strict";
	var URLHelper = MLibrary.URLHelper;

	return Controller.extend("sap.m.sample.ObjectHeader.C", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		handleLinkObjectAttributePress : function (oEvent) {
			URLHelper.redirect("http://www.sap.com", true);
		}
	});

});