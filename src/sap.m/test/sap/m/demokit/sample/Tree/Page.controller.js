sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.Tree.Page", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/Tree") + "/Tree.json");
			this.getView().setModel(oModel);
		}

	});

	return PageController;

});