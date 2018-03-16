sap.ui.require([
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/DesignTime"
],
function(
	Button,
	VerticalLayout,
	ElementOverlay,
	DesignTime
) {
	"use strict";

	// // Case #1 - single control
	// var oButton = new Button({
	// 	text: 'my button'
	// });
	// oButton.placeAt('content');
	//
	// var oOverlay = new ElementOverlay({
	// 	element: oButton,
	// 	designTimeMetadata: {}
	// });
	// oOverlay.placeInOverlayContainer();

	// ====================================================================================
	// Case #2 - composition
	var oButton1 = new Button({
		text: 'my button 1'
	});
	var oButton2 = new Button({
		text: 'my button 2'
	});
	var oLayout = new VerticalLayout({
		content: [oButton1, oButton2]
	});

	oLayout.placeAt('content');

	new DesignTime({
		rootElements: [oLayout]
	});

	sap.ui.getCore().applyChanges();
});
