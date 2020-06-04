sap.ui.define([
		'sap/ui/core/Core',
		'sap/ui/core/library',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/InvisibleMessage'
	], function(Core, library, Controller, InvisibleMessage) {
	"use strict";

	var InvisibleMessageMode = library.InvisibleMessageMode;

	return Controller.extend("sap.ui.core.sample.InvisibleMessage.InvisibleMessage", {
		onInit: function () {
			this.oInvisibleMessage = InvisibleMessage.getInstance();
		},
		onPress: function (evt) {
			var sButtonId = evt.getSource().getId(),
				oButton = Core.byId(sButtonId),
				oViewTextId = this.getView().getId() + "--statustext",
				oText = Core.byId(oViewTextId),
				sMessage = "Button with type" + " " +  oButton.getType() + " " + "and text" +  " " + oButton.getText() + " is pressed";

			this.oInvisibleMessage.announce(sMessage, InvisibleMessageMode.Assertive);
			oText.setText('A new message with text: ' + '"' + sMessage + '"' + ' was sent to the invisible messaging service.');
		}
	});
});