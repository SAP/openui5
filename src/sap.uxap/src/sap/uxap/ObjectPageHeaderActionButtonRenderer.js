/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/ButtonRenderer", "sap/ui/core/Renderer"],
	function (ButtonRenderer, Renderer) {
		"use strict";

		/**
		 * @class ObjectPageRenderer renderer.
		 * @static
		 */
		var ObjectPageHeaderActionButtonRenderer = Renderer.extend(ButtonRenderer);

		ObjectPageHeaderActionButtonRenderer.apiVersion = 2;

		return ObjectPageHeaderActionButtonRenderer;

	}, /* bExport= */ true);
