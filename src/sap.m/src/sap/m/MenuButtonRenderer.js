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
		var MenuButtonRenderer = {};

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

			//write root DOM element
			oRm.write("<div");
			oRm.writeControlData(oMenuButton);

			//write aria attributes
			this.writeAriaAttributes(oRm, oMenuButton);

			//classes
			oRm.addClass(MenuButtonRenderer.CSS_CLASS);
			oRm.addClass(MenuButtonRenderer.CSS_CLASS + oMenuButton.getButtonMode());
			oRm.writeClasses();

			// set user defined width
			if (sWidth != "") {
				oRm.addStyle("width", sWidth);
			}
			oRm.writeStyles();

			oRm.write(">");

			oRm.renderControl(oMenuButton._getButtonControl());

			oRm.write("</div>");
		};

		MenuButtonRenderer.writeAriaAttributes = function(oRm, oMenuButton) {
			oRm.writeAttribute("aria-haspopup", "true");
		};

		return MenuButtonRenderer;

	}, /* bExport= */ true);