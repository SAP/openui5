/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/m/MultiInputRenderer', 'sap/ui/mdc/field/FieldInputRenderUtil'],
	(Renderer, MultiInputRenderer, FieldInputRenderUtil) => {
		"use strict";

		/**
		 * FieldMultiInput renderer.
		 * @namespace
		 */
		const FieldMultiInputRenderer = Renderer.extend(MultiInputRenderer);
		FieldMultiInputRenderer.apiVersion = 2;

		FieldMultiInputRenderer.addOuterClasses = function(oRm, oMultiInput) {

			MultiInputRenderer.addOuterClasses.apply(this, arguments);
			oRm.class("sapUiMdcFieldMultiInput");

		};

		FieldMultiInputRenderer.getAriaRole = function(oMultiInput) {

			return FieldInputRenderUtil.getAriaRole.call(this, oMultiInput, MultiInputRenderer);

		};

		FieldMultiInputRenderer.getAccessibilityState = function(oMultiInput) {

			return FieldInputRenderUtil.getAccessibilityState.call(this, oMultiInput, MultiInputRenderer);

		};

		FieldMultiInputRenderer.writeInnerAttributes = function(oRm, oMultiInput) {

			return FieldInputRenderUtil.writeInnerAttributes.call(this, oRm, oMultiInput, MultiInputRenderer);

		};

		return FieldMultiInputRenderer;
	});