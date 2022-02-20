/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/ButtonRenderer", "sap/ui/core/Renderer"],
	function (ButtonRenderer, Renderer) {
		"use strict";

		/**
		 * ObjectPageRenderer renderer.
		 * @namespace
		 */
		var ObjectPageHeaderActionButtonRenderer = Renderer.extend(ButtonRenderer);

		ObjectPageHeaderActionButtonRenderer.apiVersion = 2;

		return ObjectPageHeaderActionButtonRenderer;

	}, /* bExport= */ true);
