sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.TreeJSONLazyLoading.Page", {
		onInit: function() {
			var oModel = new JSONModel();
			this.getView().setModel(oModel);
			this.loadData(oModel);
		},

		onToggleOpenState: function(oEvent) {
			var iItemIndex = oEvent.getParameter("itemIndex");
			var oItemContext = oEvent.getParameter("itemContext");
			var bExpanded = oEvent.getParameter("expanded");

			MessageToast.show("Item index: " + iItemIndex
							  + "\nItem context (path): " + oItemContext
							  + "\nExpanded: " + bExpanded,
				{
					duration: 5000,
					width: "auto"
				});

			var oTree = this.byId("Tree");
			var oModel = this.getView().getModel();
			var sPath = oItemContext.getPath();
			var bChildIsDummyNode = oModel.getProperty(sPath + "/nodes/0").dummy === true;

			if (bExpanded && bChildIsDummyNode) {
				this.loadData(oModel, sPath, oTree.getItems()[iItemIndex].getLevel());
			}
		},

		loadData: function(oModel, sPath, iLevel) {
			var oTree = this.byId("Tree");

			// In this example we are just pretending to load data from the backend.
			oTree.setBusy(true);
			setTimeout(function() {
				var aNewNodes = [
					{
						text: "Node" + new Array(iLevel == null ? 2 : iLevel + 3).join("-1")
					},
					{
						text: "Node" + new Array(iLevel == null ? 2 : iLevel + 3).join("-2"),
						nodes: [
							{ // This dummy node is required to get an expandable item.
								text: iLevel === 5 ? "Last node" : "",
								dummy: !iLevel || iLevel < 5
							}
						]
					}
				];
				oModel.setProperty(sPath ? sPath + "/nodes" : "/", aNewNodes);
				oTree.setBusy(false);
			}, 2000);
		}
	});
});
