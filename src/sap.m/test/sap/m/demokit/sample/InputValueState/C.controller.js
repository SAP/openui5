sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
		"use strict";

		return Controller.extend("sap.m.sample.InputValueState.C", {

			handleFormattedTextLinkPress: function(oEvent) {
				oEvent.preventDefault();
				sap.m.MessageToast.show('You have pressed a link in value state message',
					{
						my: sap.ui.core.Popup.Dock.CenterCenter,
						at: sap.ui.core.Popup.Dock.CenterCenter
					}
				);
			}
		});
});