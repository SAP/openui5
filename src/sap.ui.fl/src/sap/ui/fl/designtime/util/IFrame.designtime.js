/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/m/library"
], function(
	Core,
	AddIFrameDialog
) {
	"use strict";

	function editIFrame (oIFrame/*, mPropertyBag*/) {
		var oAddIFrameDialog = new AddIFrameDialog();
		var oSettings = oIFrame.get_settings();
		var mRenameInfo = oIFrame.getRenameInfo();
		var mDialogSettings;
		var oContainer;

		// The title of the iFrame container could have changed
		// so we need to retrieve it before opening the dialog
		if (mRenameInfo) {
			oContainer = Core.byId(mRenameInfo.sourceControlId);
			oSettings.title = oContainer.getProperty(mRenameInfo.propertyName);
		}

		return AddIFrameDialog.buildUrlBuilderParametersFor(oIFrame)
			.then(function(mURLParameters) {
				mDialogSettings = {
					parameters: mURLParameters,
					frameUrl: oSettings.url,
					frameWidth: oSettings.width,
					frameHeight: oSettings.height,
					title: oSettings.title,
					asContainer: !!oSettings.title,
					updateMode: true
				};
				return oAddIFrameDialog.open(mDialogSettings);
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
				var aChanges = [];
				var mUpdateChange = {
					selectorControl: oIFrame,
					changeSpecificData: {
						changeType: "updateIFrame",
						content: {
							url: mSettings.frameUrl,
							width: sWidth,
							height: sHeight,
							title: mSettings.title
						}
					}
				};
				aChanges.push(mUpdateChange);
				// If the title changes a rename change must be created
				if (mSettings.title !== oSettings.title) {
					var mRenameChange = {
						selectorControl: Core.byId(mRenameInfo.selectorControlId),
						changeSpecificData: {
							changeType: "rename",
							content: {
								value: mSettings.title
							}
						}
					};
					aChanges.push(mRenameChange);
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
