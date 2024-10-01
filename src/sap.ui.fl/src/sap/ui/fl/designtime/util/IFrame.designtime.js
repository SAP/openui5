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
		var oInitialSettings = oIFrame.get_settings();
		var mDialogSettings;
		return AddIFrameDialog.buildUrlBuilderParametersFor(oIFrame)
		.then(function(mURLParameters) {
			mDialogSettings = {
				parameters: mURLParameters,
				frameUrl: oInitialSettings.url,
				frameWidth: oInitialSettings.width,
				frameHeight: oInitialSettings.height,
				useLegacyNavigation: oInitialSettings.useLegacyNavigation,
				updateMode: true
			};
			return oAddIFrameDialog.open(mDialogSettings);
		})
		.then(function(mSettings) {
			if (!mSettings) {
				return []; // No change
			}
			var aChanges = [];
			var bContentChanged = false;
			var oNewContent = {
				url: oInitialSettings.url,
				height: oInitialSettings.height,
				width: oInitialSettings.width,
				useLegacyNavigation: oInitialSettings.useLegacyNavigation
			};

			if (mSettings.frameHeight + mSettings.frameHeightUnit !== oInitialSettings.height) {
				bContentChanged = true;
				oNewContent.height = mSettings.frameHeight + mSettings.frameHeightUnit;
			}
			if (mSettings.frameWidth + mSettings.frameWidthUnit !== oInitialSettings.width) {
				bContentChanged = true;
				oNewContent.width = mSettings.frameWidth + mSettings.frameWidthUnit;
			}
			if (mSettings.frameUrl !== oInitialSettings.url) {
				bContentChanged = true;
				oNewContent.url = mSettings.frameUrl;
			}
			if (mSettings.useLegacyNavigation !== !!oInitialSettings.useLegacyNavigation) {
				bContentChanged = true;
				oNewContent.useLegacyNavigation = mSettings.useLegacyNavigation;
			}

			if (bContentChanged) {
				aChanges.push({
					selectorControl: oIFrame,
					changeSpecificData: {
						changeType: "updateIFrame",
						content: oNewContent
					}
				});
			}
			return aChanges;
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
