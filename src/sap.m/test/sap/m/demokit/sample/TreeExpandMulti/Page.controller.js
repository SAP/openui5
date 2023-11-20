sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TreeExpandMulti.Page", {
		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel("test-resources/sap/m/demokit/sample/TreeExpandMulti/Tree.json");
			this.getView().setModel(oModel);
			this.byId("Tree").expandToLevel(1);
		},

		onExpandMultiPress : function(evt) {
			var oTree = this.byId("Tree"),
				aSelectedItems = oTree.getSelectedItems(),
				aSelectedIndices = [];

			for (var i = 0; i < aSelectedItems.length; i++) {
				aSelectedIndices.push(oTree.indexOfItem(aSelectedItems[i]));
			}

			oTree.expand(aSelectedIndices);
		},

		onCollapseMultiPress : function(evt) {
			var oTree = this.byId("Tree"),
			aSelectedItems = oTree.getSelectedItems(),
			aSelectedIndices = [];

			for (var i = 0; i < aSelectedItems.length; i++) {
				aSelectedIndices.push(oTree.indexOfItem(aSelectedItems[i]));
			}

			oTree.collapse(aSelectedIndices);
		},

		onSelectionFinish: function(oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var oTree = this.byId("Tree");
			var aSticky = aSelectedItems.map(function(oItem) {
				return oItem.getKey();
			});

			oTree.setSticky(aSticky);
		},

		onToggleInfoToolbar: function(oEvent) {
			var oTree = this.byId("Tree");
			oTree.getInfoToolbar().setVisible(!oEvent.getParameter("pressed"));
		}
	});

	return PageController;

});
