sap.ui.controller("sap.m.sample.Link.LinkGroup", {

	handleLinkPress: function (evt) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert("Link was clicked!");
	}

});