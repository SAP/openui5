sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageStrip',
	'sap/ui/core/InvisibleMessage',
	'sap/ui/core/library',
	"sap/ui/core/Core"
], function(Controller, MessageStrip, InvisibleMessage, library, oCore) {
	"use strict";

	var InvisibleMessageMode = library.InvisibleMessageMode;

	return Controller.extend("sap.m.sample.DynamicMessageStripGenerator.C", {
		onInit: function () {
			this.oInvisibleMessage = InvisibleMessage.getInstance();
		},
		showMsgStrip: function () {
			var oMs = oCore.byId("msgStrip");

			if (oMs) {
				oMs.destroy();
			}
			this._generateMsgStrip();
		},

		_generateMsgStrip: function () {
			var aTypes = ["Information", "Warning", "Error", "Success"],
				sText = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam, quis nostrud exercitation ullamco.",
				sType = aTypes[Math.round(Math.random() * 3)],
				oVC = this.byId("oVerticalContent"),
				oMsgStrip = new MessageStrip("msgStrip", {
					text: sText,
					showCloseButton: !(Math.round(Math.random())),
					showIcon: !(Math.round(Math.random())),
					type: sType
				});

			this.oInvisibleMessage.announce("New Information Bar of type " + sType + " " + sText, InvisibleMessageMode.Assertive);
			oVC.addContent(oMsgStrip);
		}
	});
});
