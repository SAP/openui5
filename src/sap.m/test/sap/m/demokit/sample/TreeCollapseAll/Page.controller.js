sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TreeCollapseAll.Page", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.m.sample.TreeCollapseAll", "/Tree.json"));
			this.getView().setModel(oModel);
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
