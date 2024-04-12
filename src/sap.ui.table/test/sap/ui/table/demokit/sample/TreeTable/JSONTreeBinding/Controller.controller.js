sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.TreeTable.JSONTreeBinding.Controller", {
		onInit: function() {
			const oModel = new JSONModel("test-resources/sap/ui/table/demokit/sample/TreeTable/JSONTreeBinding/Clothing.json");
			this.getView().setModel(oModel);
		},

		onCollapseAll: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.collapseAll();
		},

		onCollapseSelection: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.collapse(oTreeTable.getSelectedIndices());
		},

		onExpandFirstLevel: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.expandToLevel(1);
		},

		onExpandSelection: function() {
			const oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.expand(oTreeTable.getSelectedIndices());
		}
	});
});