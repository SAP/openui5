sap.ui.controller("sap.m.sample.ToggleButton.Page", {

		onPress: function (evt) {
		jQuery.sap.require("sap.m.MessageToast");
		if (evt.getSource().getPressed()) {
			sap.m.MessageToast.show(evt.getSource().getId() + " Pressed");
		} else {
			sap.m.MessageToast.show(evt.getSource().getId() + " Unpressed");
		};
	}
});