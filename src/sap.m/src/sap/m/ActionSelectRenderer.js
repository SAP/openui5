/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Renderer', './SelectRenderer'],
	function(Renderer, SelectRenderer) {
		"use strict";

		var ActionSelectRenderer = Renderer.extend(SelectRenderer);

		/**
		 * CSS class to be applied to the HTML root element of the ActionSelect control.
		 *
		 * @type {string}
		 */
		ActionSelectRenderer.ACTION_SELECT_CSS_CLASS = "sapMActionSelect";

		/**
		 * Apply a CSS class to the HTML root element of the ActionSelect control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oActionSelect An object representation of the control that should be rendered.
		 */
		ActionSelectRenderer.addClass = function(oRm, oActionSelect) {
			oRm.class(ActionSelectRenderer.ACTION_SELECT_CSS_CLASS);
		};

		return ActionSelectRenderer;

	}, /* bExport= */ true);