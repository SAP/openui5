sap.ui.controller("sap.ui.core.sample.Icon.IconGroup", {
	handleStethoscopePress: function(evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Over budget!");
	}
});