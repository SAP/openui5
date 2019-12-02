sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

	return Controller.extend("sap.m.sample.MessageBoxInitialFocus.controller.MessageBoxInitialFocus", {

		handleConfirmMessageBoxPressInitialFocus: function () {
			MessageBox.warning(
				"Initial button focus is set by attribute \n initialFocus: sap.m.MessageBox.Action.CANCEL",
				{
					icon: MessageBox.Icon.WARNING,
					title: "Focus on a Button",
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					styleClass: sResponsivePaddingClasses,
					initialFocus: MessageBox.Action.CANCEL
				}
			);
		},

		handleShowMessageBoxPressInitialFocus: function () {
			MessageBox.show(
				'Initial button focus is set by attribute \n initialFocus: \"Custom button\" \n Note: The name is not case sensitive',
				{
					icon: MessageBox.Icon.WARNING,
					title: "Focus on a Custom Button",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO, "Custom Button"],
					styleClass: sResponsivePaddingClasses,
					initialFocus: "Custom Button"
				}
			);
		}

	});
});