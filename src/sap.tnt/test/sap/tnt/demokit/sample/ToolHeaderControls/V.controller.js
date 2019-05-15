sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/Popover',
	'sap/m/Button',
	'sap/m/library'
], function(jQuery, Controller, Popover, Button, mobileLibrary) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType,
		PlacementType = mobileLibrary.PlacementType;

	return Controller.extend("sap.tnt.sample.ToolHeaderControls.V", {

		onUserNamePress: function (oEvent) {
			var oPopover = new Popover({
				showHeader: false,
				placement: PlacementType.Bottom,
				content:[
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
