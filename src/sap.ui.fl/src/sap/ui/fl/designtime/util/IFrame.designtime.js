/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/m/library"
], function(
	AddIFrameDialog
) {
	"use strict";

	function editIFrame (oIFrame/*, mPropertyBag*/) {
		var oAddIFrameDialog = new AddIFrameDialog();
		var oSettings = oIFrame.get_settings();
		var mDialogSettings;
		return AddIFrameDialog.buildUrlBuilderParametersFor(oIFrame)
			.then(function(mURLParameters) {
				mDialogSettings = {
					parameters: mURLParameters,
					frameUrl: oSettings.url,
					frameWidth: oSettings.width,
					frameHeight: oSettings.height,
					updateMode: true
				};
				return oAddIFrameDialog.open(oIFrame, mDialogSettings);
			})
			.then(function (mSettings) {
				if (!mSettings) {
					return []; // No change
				}
				var sWidth;
				var sHeight;
				if (mSettings.frameWidth) {
					sWidth = mSettings.frameWidth + mSettings.frameWidthUnit;
				} else {
					sWidth = "100%";
				}
				if (mSettings.frameHeight) {
					sHeight = mSettings.frameHeight + mSettings.frameHeightUnit;
				} else {
					sHeight = "100%";
				}
				return [{
					selectorControl: oIFrame,
					changeSpecificData: {
						changeType: "updateIFrame",
						content: {
							url: mSettings.frameUrl,
							width: sWidth,
							height: sHeight
						}
					}
				}];
			});
	}

	return {
		actions: {
			settings: function () {
				return {
					icon: "sap-icon://write-new",
					name: "CTX_EDIT_IFRAME",
					isEnabled: true,
					handler: editIFrame
				};
			},
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl"
			}
		}
	};
});
