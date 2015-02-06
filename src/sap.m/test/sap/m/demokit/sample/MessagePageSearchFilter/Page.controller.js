
sap.ui.controller("sap.m.sample.MessagePageSearchFilter.Page", {

	onInit: function() {
		var oModelE = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/salesOrder.json");
		this.getView().setModel(oModelE);

		var oSplitApp = this.byId("splitApp");

		// load the master page
		var oMaster = sap.ui.xmlview("Master", "sap.m.sample.MessagePageSearchFilter.Master");
		oMaster.getController().oSplitApp = oSplitApp;
		oSplitApp.addMasterPage(oMaster);

		// load the detail pages
		var oEmpty = sap.ui.xmlview("Empty", "sap.m.sample.MessagePageSearchFilter.Empty"),
			oDetail = sap.ui.xmlview("Detail", "sap.m.sample.MessagePageSearchFilter.Detail"),
			oMessagePageSearch = new sap.m.MessagePage("MessagePageSearchNoItems", {
				text:"No items are currently available"
			}),
			oMessagePageFilter = new sap.m.MessagePage("MessagePageFilterNoItems", {
				text:"No completed items are currently available",
				icon: "decline"
			});

		oSplitApp.addDetailPage(oEmpty);
		oSplitApp.addDetailPage(oDetail);
		oSplitApp.addDetailPage(oMessagePageSearch);
		oSplitApp.addDetailPage(oMessagePageFilter);

		oModelE.attachRequestCompleted(oMaster, function (oResponse, oMaster) {
			oMaster.byId("list").setVisible(true);
		});
	}
});
