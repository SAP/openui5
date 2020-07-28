/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/m/MultiInputRenderer'],
		function(Renderer, MultiInputRenderer) {
	"use strict";

	/**
	 * FieldMultiInput renderer.
	 * @namespace
	 */
	var FieldMultiInputRenderer = Renderer.extend(MultiInputRenderer);
	FieldMultiInputRenderer.apiVersion = 2;

	FieldMultiInputRenderer.addOuterClasses = function(oRm, oMultiInput) {

		MultiInputRenderer.addOuterClasses.apply(this, arguments);
		oRm.class("sapUiMdcFieldMultiInput");

	};

	FieldMultiInputRenderer.getAriaRole = function (oMultiInput) {

		var oAriaAttributes = oMultiInput.getAriaAttributes();

		if (oAriaAttributes.role) {
			return oAriaAttributes.role;
		} else {
			return MultiInputRenderer.getAriaRole.apply(this, arguments);
		}

	};

	FieldMultiInputRenderer.getAccessibilityState = function (oMultiInput) {

		var oAriaAttributes = oMultiInput.getAriaAttributes();
		var mAccessibilityState = MultiInputRenderer.getAccessibilityState.apply(this, arguments);

		// add aria attributes
		if (oAriaAttributes.aria) {
			for (var sAttribute in oAriaAttributes.aria) {
				mAccessibilityState[sAttribute] = oAriaAttributes.aria[sAttribute];
			}
		}

		return mAccessibilityState;

	};

	FieldMultiInputRenderer.writeInnerAttributes = function(oRm, oMultiInput) {

		MultiInputRenderer.writeInnerAttributes.apply(this, arguments);

		var oAriaAttributes = oMultiInput.getAriaAttributes();

		// add all not aria specific attributes
		for (var sAttribute in oAriaAttributes) {
			if (sAttribute !== "aria" && sAttribute !== "role") {
				oRm.attr(sAttribute, oAriaAttributes[sAttribute]);
			}
		}

	};

	return FieldMultiInputRenderer;
});
