/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Label",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/ButtonType"
], function(
	Dialog,
	DialogType,
	Label,
	TextArea,
	Button,
	ButtonType
) {
	"use strict";

	// Use a temporary dialog until the official one is ready
	function editIFrame (oControl/*, mPropertyBag*/) {
		return new Promise(function (fnResolve) {
			var oDialog = new Dialog({
				title: "Settings",
				type: DialogType.Message,
				content: [
					new Label({
						text: "Please enter the URL",
						labelFor: "settingsDialogTextarea"
					}),
					new TextArea('settingsDialogTextarea', {
						width: "100%",
						placeholder: "Enter URL (required)",
						value: oControl.getUrl(),
						liveChange: function(oEvent) {
							var sUrl = oEvent.getParameter('value');
							oDialog.getBeginButton().setEnabled(sUrl.length > 0);
						}
					})
				],
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'Submit',
					enabled: false,
					press: function () {
						fnResolve(sap.ui.getCore().byId('settingsDialogTextarea').getValue());
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						fnResolve();
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});
			oDialog.open();
		}).then(function (sUrl) {
			if (sUrl) {
				return [{
					selectorControl: oControl,
					changeSpecificData: {
						changeType: "updateIFrame",
						content: {
							url: sUrl
						}
					}
				}];
			}
			return []; // No change
		});
	}

	return {
		actions: {
			settings: function () {
				return {
					isEnabled: true,
					handler: editIFrame
				};
			},
			remove: {
				changeType: "hideControl"
			}
		}
	};
});
