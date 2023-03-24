/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer'], function(Renderer, InputBaseRenderer) {
	"use strict";

	/**
	 * DateTimeFieldRenderer renderer.
	 * @namespace
	 */
	var DateTimeFieldRenderer = Renderer.extend(InputBaseRenderer);
	DateTimeFieldRenderer.apiVersion = 2;

	/**
	 * Returns aria accessibility role for the control.
	 * Hook for the subclasses.
	 *
	 * @protected
	 * @override
	 * @param {sap.m.DateTimeField} oControl an object representation of the control
	 * @returns {string}
	 */
	DateTimeFieldRenderer.getAriaRole = function (oControl) {
		return "";
	};
	
	/**
	 * add extra attributes to Picker's Input
	 *
	 * @overrides sap.m.InputBaseRenderer.writeInnerAttributes
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.DateTimeField} oControl an object representation of the control that should be rendered
	 */
	DateTimeFieldRenderer.writeInnerAttributes = function (oRm, oControl) {
		if (oControl._isMobileDevice() || oControl.getValueHelpOnly()) {
			oRm.attr("readonly", "readonly"); // readonly for mobile devices
		}
	};	

	return DateTimeFieldRenderer;

}, /* bExport= */ true);
