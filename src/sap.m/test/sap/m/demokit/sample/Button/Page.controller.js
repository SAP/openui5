sap.ui.controller("sap.m.sample.Button.Page", {

	onPress: function (evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show(evt.getSource().getId() + " Pressed");
	}
});