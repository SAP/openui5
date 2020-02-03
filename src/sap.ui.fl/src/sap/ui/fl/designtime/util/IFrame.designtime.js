/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/iframe/SettingsDialog",
	"sap/m/library"
], function(
	IFrameSettingsDialog
) {
	"use strict";

	function editIFrame (oIFrame/*, mPropertyBag*/) {
		var oIFrameSettingsDialog = new IFrameSettingsDialog();
		var oSettings = oIFrame.get_settings();
		var mDialogSettings = {
			urlBuilderParameters: IFrameSettingsDialog.buildUrlBuilderParametersFor(oIFrame),
			frameUrl: oSettings.url,
			frameWidth: oSettings.width,
			frameHeight: oSettings.height
		};
		return oIFrameSettingsDialog.open(mDialogSettings)
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
					icon: "sap-icon://add-product",
					name: "CTX_EDIT_IFRAME",
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
