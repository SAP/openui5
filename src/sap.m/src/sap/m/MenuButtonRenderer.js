/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * <code>MenuButton</code> renderer.
		 * @namespace
		 */
		var MenuButtonRenderer = {
			apiVersion: 2
		};

		MenuButtonRenderer.CSS_CLASS = "sapMMenuBtn";

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm
		 *            The RenderManager that can be used for writing to
		 *            the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oMenuButton
		 *            The MenuButton to be rendered
		 */
		MenuButtonRenderer.render = function(oRm, oMenuButton) {
			var sWidth = oMenuButton.getWidth();

			oRm.openStart("div", oMenuButton);
			oRm.class(MenuButtonRenderer.CSS_CLASS).class(MenuButtonRenderer.CSS_CLASS + oMenuButton.getButtonMode());
			if (sWidth != "") {
				oRm.style("width", sWidth);
			}
			oRm.openEnd();
			oMenuButton._ensureBackwardsReference();
			oRm.renderControl(oMenuButton._getButtonControl());
			oRm.close("div");
		};

		return MenuButtonRenderer;

	}, /* bExport= */ true);