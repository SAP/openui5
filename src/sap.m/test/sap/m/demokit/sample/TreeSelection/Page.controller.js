sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TreeSelection.Page", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel("test-resources/sap/m/demokit/sample/TreeSelection/Tree.json");
			this.getView().setModel(oModel);
		},

		handleSelectChange: function (oEvent) {
			var mode = oEvent.getParameter("selectedItem").getKey();
			this.byId("Tree").setMode(mode);
		}
	});

	return PageController;

});
