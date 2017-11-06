sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TreeInitialExpandState.Page", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel("test-resources/sap/m/demokit/sample/TreeInitialExpandState/Tree.json");
			this.getView().setModel(oModel);
			this.byId("Tree").expandToLevel(3);
		}
	});

	return PageController;

});
