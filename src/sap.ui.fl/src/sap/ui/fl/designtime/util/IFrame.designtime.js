/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/core/IconPool",
	"sap/m/library"
], function(
	AddIFrameDialog,
	IconPool
) {
	"use strict";

	// register TNT icon font
	IconPool.registerFont({
		collectionName: "tnt",
		fontFamily: "SAP-icons-TNT",
		fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),
		lazy: true
	});

	function editIFrame (oIFrame/*, mPropertyBag*/) {
		var oAddIFrameDialog = new AddIFrameDialog();
		var oSettings = oIFrame.get_settings();
		var mDialogSettings = {
			parameters: AddIFrameDialog.buildUrlBuilderParametersFor(oIFrame),
			frameUrl: oSettings.url,
			frameWidth: oSettings.width,
			frameHeight: oSettings.height,
			updateMode: true
		};
		return oAddIFrameDialog.open(mDialogSettings)
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
					icon: "sap-icon://tnt/content-enricher",
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
