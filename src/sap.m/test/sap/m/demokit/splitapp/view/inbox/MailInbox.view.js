// This is the second level page in master area.
// The list mode needs to set according to the type of the device (see point 1). In phone, it triggers another page navigation 
// in master area (master and detail area are the same instance of sap.m.NavContainer), while in tablet it triggers
// a navigation in detail area.

sap.ui.jsview("view.inbox.MailInbox", {

	getControllerName: function() {
		return "view.inbox.MailInbox";
	},

	createContent: function(oController){
		this.oList = new sap.m.List({
			showUnread: true,
			// Point 1
			mode: sap.ui.Device.system.phone ? sap.m.ListMode.None : sap.m.ListMode.SingleSelectMaster,
			itemPress: [oController.onListSelect, oController]
		});

		this.page = new sap.m.Page({
			title: "ALL",
			icon: "{img>/icon/UI5}",
			navButtonText: "Home",
			showNavButton: true,
			navButtonPress: function(){ oController.handleNavBack(); },
			content: [this.oList]
		});

		// done
		return this.page;
	}
});