/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.testlib.TestButton
sap.ui.define([
	"sap/ui/core/Renderer"
], function(Renderer) {
	"use strict";

	/**
	 * @namespace
	 * @alias sap.ui.testlib.TestButtonRenderer
	 */
	var TestButtonRenderer = Renderer.extend("sap.ui.testlib.TestButtonRenderer", /** @lends sap.ui.testlib.TestButtonRenderer */ {
		apiVersion: 2
	});

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oButton An object representation of the control that should be rendered.
	 */
	TestButtonRenderer.render = function(oRm, oButton) {
		// button is rendered as a "<button>" element
		oRm.openStart("button", oButton)
			.class("sapUiTstBtn");
		if (oButton.getTooltip_AsString()) {
			oRm.attr("title", oButton.getTooltip_AsString());
		}

		//ARIA
		oRm.accessibilityState(oButton);
		oRm.attr('role', 'button');

		if (!oButton.getEnabled()) {
			oRm.attr("tabIndex", "-1");
			oRm.class("sapUiTstBtnDsbl");
		} else {
			oRm.attr("tabIndex", "0");
			oRm.class("sapUiTstBtnStd");
		}
		oRm.openEnd();

		// write the button label
		if (oButton.getText()) {
			oRm.text(oButton.getText());
		}

		// close button
		oRm.close("button");
	};

	return TestButtonRenderer;

});