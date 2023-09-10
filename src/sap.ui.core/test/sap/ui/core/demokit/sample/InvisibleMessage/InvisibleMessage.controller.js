sap.ui.define([
		'sap/ui/core/Element',
		'sap/ui/core/library',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/InvisibleMessage'
	], function(Element, library, Controller, InvisibleMessage) {
	"use strict";

	var InvisibleMessageMode = library.InvisibleMessageMode;

	return Controller.extend("sap.ui.core.sample.InvisibleMessage.InvisibleMessage", {
		onInit: function () {
			this.oInvisibleMessage = InvisibleMessage.getInstance();
		},
		onPress: function (evt) {
			var sButtonId = evt.getSource().getId(),
				oButton = Element.getElementById(sButtonId),
				oViewTextId = this.getView().getId() + "--statustext",
				oText = Element.getElementById(oViewTextId),
				sMessage = "Button with type" + " " +  oButton.getType() + " " + "and text" +  " " + oButton.getText() + " is pressed";

			this.oInvisibleMessage.announce(sMessage, InvisibleMessageMode.Assertive);
			oText.setText('A new message with text: ' + '"' + sMessage + '"' + ' was sent to the invisible messaging service.');
		}
	});
});