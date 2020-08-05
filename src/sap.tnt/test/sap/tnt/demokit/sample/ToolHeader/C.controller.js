sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/Popover',
	'sap/m/Button',
	'sap/m/library'
], function (Controller, Popover, Button, library) {
	"use strict";

	var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType;

	return Controller.extend("sap.tnt.sample.ToolHeader.C", {

		onUserNamePress: function (oEvent) {
			var oPopover = new Popover({
				showHeader: false,
				placement: PlacementType.Bottom,
				content: [
					new Button({
						text: 'Feedback',
						type: ButtonType.Transparent
					}),
					new Button({
						text: 'Help',
						type: ButtonType.Transparent
					}),
					new Button({
						text: 'Logout',
						type: ButtonType.Transparent
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

			oPopover.openBy(oEvent.getSource());
		}

	});
});