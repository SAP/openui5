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
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control map
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.ui.fl
	 */
	return function (oChange, mPropertyBag, sIFrameId) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var oView = mPropertyBag.view;
		var oComponent = mPropertyBag.appComponent;
		var mIFrameSettings = {};
		["url", "width", "height"].forEach(function (sIFrameProperty) {
			mIFrameSettings[sIFrameProperty] = oChangeDefinition.content[sIFrameProperty];
		});
		var oIFrame = oModifier.createControl("sap.ui.fl.util.IFrame", oComponent, oView, sIFrameId, mIFrameSettings, false);
		return oIFrame;
	};
});
