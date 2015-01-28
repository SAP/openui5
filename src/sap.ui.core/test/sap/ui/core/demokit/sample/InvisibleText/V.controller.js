sap.ui.controller("sap.ui.core.sample.InvisibleText.V", {

	onPress: function (evt) {
		sap.m.MessageToast.show(evt.getSource().getId() + " Pressed");
	}
});