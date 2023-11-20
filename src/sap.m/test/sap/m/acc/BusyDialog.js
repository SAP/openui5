sap.ui.define([
	"sap/m/App",
	"sap/m/BusyDialog",
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/HTML",
	"sap/ui/core/InvisibleText"
], function(App, BusyDialog, Button, Page, HTML, InvisibleText) {
	"use strict";

	var app = new App('myApp', {initialPage: 'initialPage'});
	var _buttonWidth = '300px';

	var invText = new InvisibleText("hiddenTxt", {text: "Additional descriptive text added"}).toStatic();
	var defaultLightBusyDialog = new BusyDialog('defaultLightBusyDialog');
	var defaultLightBusyDialogARIA = new BusyDialog('defaultLightBusyDialogARIA', {
		ariaLabelledBy: invText
	});

	var standardBusyDialog = new BusyDialog('standardBusyDialog', {
		title: 'Dummy preloader',
		text: '... this is just a demo, we are not waiting for anything.',
		showCancelButton: true
	});

	/*
	var customCancelButtonTextBusyDialog = new BusyDialog('customCancelButtonTextBusyDialog', {
		tooltip: 'BusyDialog example with custom "cancel button text, custom icon and tooltip.',
		cancelButtonText: 'Custom Close Text',
		customIcon: '../images/synchronise_48.png',
		customIconRotationSpeed: 5000
	});
	*/

	var standardNoHeaderBusyDialog = new BusyDialog('standardNoHeaderBusyDialog', {
		text: 'Sending data...',
		showCancelButton: true
	});

	var standardNoHeaderAndFooterBusyDialog = new BusyDialog('standardNoHeaderAndFooterBusyDialog', {
		text: 'Loading data...'
	});

	var initialPage = new Page('initialPage', {
		title: 'Busy Dialog Control',
		content: [
			new Button('defaultBusyDialogButton', {
				text: 'Default (light)',
				width: _buttonWidth,
				press: function () {
					defaultLightBusyDialog.open();
					setTimeout(function () {
						defaultLightBusyDialog.close();
					}, 20000);
				}
			}),
			new Button('defaultARIABusyDialogButton', {
				text: 'Default (light) - ARIA',
				width: _buttonWidth,
				press: function () {
					defaultLightBusyDialogARIA.open();
					setTimeout(function () {
						defaultLightBusyDialogARIA.close();
					}, 20000);
				}
			}),
			new Button('standardBusyDialogButton', {
				text: 'Standard (static)',
				width: _buttonWidth,
				press: function () {
					standardBusyDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('standardNoNeaderBusyDialogButton', {
				text: 'Standard - no header',
				width: _buttonWidth,
				press: function () {
					standardNoHeaderBusyDialog.open();
				}
			}),
			new Button('standardNoNeaderAndFooterBusyDialogButton', {
				text: 'Standard without footer and header',
				width: _buttonWidth,
				press: function () {
					standardNoHeaderAndFooterBusyDialog.open();

					setTimeout(function () {
						standardNoHeaderAndFooterBusyDialog.close();
					}, 20000);
				}
			})
		]
	});

	app.addPage(initialPage).placeAt('content');
});
