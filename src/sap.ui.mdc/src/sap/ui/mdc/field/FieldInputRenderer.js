/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/m/InputRenderer', 'sap/ui/mdc/field/FieldInputRenderUtil'],
		function(Renderer, InputRenderer, FieldInputRenderUtil) {
	"use strict";

	/**
	 * FieldInput renderer.
	 * @namespace
	 */
	const FieldInputRenderer = Renderer.extend(InputRenderer);
	FieldInputRenderer.apiVersion = 2;

	FieldInputRenderer.addOuterClasses = function(oRm, oInput) {

		InputRenderer.addOuterClasses.apply(this, arguments);
		oRm.class("sapUiMdcFieldInput");

	};

	FieldInputRenderer.getAriaRole = function (oInput) {

		return FieldInputRenderUtil.getAriaRole.call(this, oInput, InputRenderer);

	};

	FieldInputRenderer.getAccessibilityState = function (oInput) {

		return FieldInputRenderUtil.getAccessibilityState.call(this, oInput, InputRenderer);

	};

	FieldInputRenderer.writeInnerAttributes = function(oRm, oInput) {

		return FieldInputRenderUtil.writeInnerAttributes.call(this, oRm, oInput, InputRenderer);

	};

	return FieldInputRenderer;
});
