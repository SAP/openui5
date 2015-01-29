sap.ui.controller("sap.m.sample.MessagePageNoItems.Page", {

	onInit: function() {
		var oSplitApp = this.byId('splitApp');

		// load the master page
		var oMaster = sap.ui.xmlview("MessagePageNoItemsMaster", "sap.m.sample.MessagePageNoItems.Master");
		oSplitApp.addMasterPage(oMaster, true);

		// load the MessagePage
		var oMessagePage = new sap.m.MessagePage("MessagePageNoItemsNoItemsPage", {title:"No items are currently available", text:"No items are currently available"});
		oSplitApp.addDetailPage(oMessagePage, false);
	}
});
