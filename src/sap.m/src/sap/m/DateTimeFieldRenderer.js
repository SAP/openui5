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

	return DateTimeFieldRenderer;

}, /* bExport= */ true);
