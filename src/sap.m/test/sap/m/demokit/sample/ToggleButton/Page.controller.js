sap.ui.controller("sap.m.sample.ToggleButton.Page", {

		onPress: function (evt) {
		if (evt.getSource().getPressed()) {
			sap.m.MessageToast.show(evt.getSource().getId() + " Pressed");
		} else {
			sap.m.MessageToast.show(evt.getSource().getId() + " Unpressed");
		};
	}
});