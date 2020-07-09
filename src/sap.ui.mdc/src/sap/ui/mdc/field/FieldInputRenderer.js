/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/m/InputRenderer'],
		function(Renderer, InputRenderer) {
	"use strict";

	/**
	 * FieldInput renderer.
	 * @namespace
	 */
	var FieldInputRenderer = Renderer.extend(InputRenderer);
	FieldInputRenderer.apiVersion = 2;

	FieldInputRenderer.addOuterClasses = function(oRm, oInput) {

		InputRenderer.addOuterClasses.apply(this, arguments);
		oRm.class("sapUiMdcFieldInput");

	};

	FieldInputRenderer.getAriaRole = function (oInput) {

		var oAriaAttributes = oInput.getAriaAttributes();

		if (oAriaAttributes.role) {
			return oAriaAttributes.role;
		} else {
			return InputRenderer.getAriaRole.apply(this, arguments);
		}

	};

	FieldInputRenderer.getAccessibilityState = function (oInput) {

		var oAriaAttributes = oInput.getAriaAttributes();
		var mAccessibilityState = InputRenderer.getAccessibilityState.apply(this, arguments);

		// add aria attributes
		if (oAriaAttributes.aria) {
			for (var sAttribute in oAriaAttributes.aria) {
				mAccessibilityState[sAttribute] = oAriaAttributes.aria[sAttribute];
			}
		}

		return mAccessibilityState;

	};

	FieldInputRenderer.writeInnerAttributes = function(oRm, oInput) {

		InputRenderer.writeInnerAttributes.apply(this, arguments);

		var oAriaAttributes = oInput.getAriaAttributes();

		// add all not aria specific attributes
		for (var sAttribute in oAriaAttributes) {
			if (sAttribute !== "aria" && sAttribute !== "role") {
				oRm.attr(sAttribute, oAriaAttributes[sAttribute]);
			}
		}

	};
	return FieldInputRenderer;
});
