sap.ui.controller("sap.m.sample.Button.Page", {

	onPress: function (evt) {
		sap.m.MessageToast.show(evt.getSource().getId() + " Pressed");
	}
});