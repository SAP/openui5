/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer', "sap/ui/core/Lib"], function(Renderer, InputBaseRenderer, Lib) {
	"use strict";

	/**
	 * MaskInputRenderer renderer.
	 * @namespace
	 */
	var MaskInputRenderer = Renderer.extend(InputBaseRenderer);

	MaskInputRenderer.apiVersion = 2;

	/**
	 * Returns the accessibility state of the control.
	 *
	 * @override
	 * @param {sap.m.MaskInput} oControl an object representation of the control.
	 * @returns {Object}
	 */
	MaskInputRenderer.getAccessibilityState = function (oControl) {
		var oResourceBundle = Lib.getResourceBundleFor("sap.m"),
			sCustomRole = oResourceBundle.getText("MASKINPUT_ROLE_DESCRIPTION"),
			mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		mAccessibilityState["roledescription"] = sCustomRole;

		return mAccessibilityState;
	};

	MaskInputRenderer.getLabelledByAnnouncement = function(oControl) {
		var sMask = oControl.getMask();

		if (sMask && sMask.length) {
			return oControl.getPlaceholder() || "";
		}

		return InputBaseRenderer.getLabelledByAnnouncement.apply(this, arguments);
	};

	return MaskInputRenderer;

}, /* bExport= */ true);
