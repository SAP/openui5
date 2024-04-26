/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/util/IFrame"
], function(
) {
	"use strict";

	/**
	 * Create an IFrame control and set its properties
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control map
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} [oSelector] Selector to calculate the ID for the control that is created
	 * @param {string} [oSelector.id] Control ID targeted by the change
	 * @param {boolean} [oSelector.isLocalId] <code>true</code> if the ID within the selector is a local ID or a global ID
	 * @param {object} [mRenameInfo] Used to retrieve text from the iFrame container
	 * @returns {Promise} Promise resolving with the created IFrame
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	return function(oChange, mPropertyBag, oSelector, mRenameInfo) {
		var oModifier = mPropertyBag.modifier;
		var oChangeContent = oChange.getContent();
		var oView = mPropertyBag.view;
		var oComponent = mPropertyBag.appComponent;
		var mIFrameSettings = { _settings: {} };
		["url", "width", "height"].forEach(function(sIFrameProperty) {
			var vValue = oChangeContent[sIFrameProperty];
			mIFrameSettings[sIFrameProperty] = vValue;
			mIFrameSettings._settings[sIFrameProperty] = vValue;
		});

		if (oChangeContent?.advancedSettings) {
			mIFrameSettings.advancedSettings = oChangeContent.advancedSettings;
			mIFrameSettings._settings.advancedSettings = oChangeContent?.advancedSettings;
		}

		if (mRenameInfo) {
			mIFrameSettings.renameInfo = mRenameInfo;
			mIFrameSettings.asContainer = true;
		}

		return Promise.resolve()
		.then(function() {
			return oModifier.createControl("sap.ui.fl.util.IFrame", oComponent, oView, oSelector, mIFrameSettings, false);
		});
	};
});
