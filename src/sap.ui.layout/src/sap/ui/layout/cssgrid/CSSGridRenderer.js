/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * CSSGrid renderer.
	 * @namespace
	 */
	var CSSGridRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.layout.cssgrid.CSSGrid} oControl an object representation of the control that should be rendered
	 */
	CSSGridRenderer.render = function (oRM, oControl) {
		oRM.openStart("div", oControl)
			.class("sapUiLayoutCSSGrid");

		if (oControl.getWidth()) {
			oRM.style("width", oControl.getWidth());
		}

		oControl.getGridLayoutConfiguration().addGridStyles(oRM);

		oRM.openEnd();

		oControl.getItems().forEach(oRM.renderControl, oRM);

		oRM.close("div");
	};

	return CSSGridRenderer;
});