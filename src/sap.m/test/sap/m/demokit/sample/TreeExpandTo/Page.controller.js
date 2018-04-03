sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TreeExpandTo.Page", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.m.sample.TreeExpandTo", "/Tree.json"));
			this.getView().setModel(oModel);
			this.byId("Tree").expandToLevel(1);
		},

		handleSelectChange: function(oEvent) {
			var iLevel = oEvent.getParameter("selectedItem").getKey();
			this.byId("Tree").expandToLevel(iLevel);
		},

		onCollapseAllPress : function(evt) {
			var oTree = this.byId("Tree");
			oTree.collapseAll();
		}
	});

	return PageController;

});
