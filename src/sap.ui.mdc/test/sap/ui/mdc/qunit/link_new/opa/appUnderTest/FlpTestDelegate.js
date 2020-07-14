/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/flp/FlpLinkDelegate",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/library"
], function(LinkDelegate, Button, Dialog, Text, mobileLibrary) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	var SampleLinkDelegate = Object.assign({}, LinkDelegate);

	SampleLinkDelegate.beforeNavigationCallback = function(oPayload, oEvent) {
		return new Promise(function(resolve) {
			var oDialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new Text({ text: 'Are you sure you want to Navigate?' }),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'Navigate',
					press: function () {
						oDialog.close();
						resolve(true);
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						oDialog.close();
						resolve(false);
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});
			oDialog.open();
		});
	};

	return SampleLinkDelegate;
}, /* bExport= */ true);
