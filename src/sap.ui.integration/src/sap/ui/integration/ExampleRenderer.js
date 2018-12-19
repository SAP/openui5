/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	 * Example renderer.
	 * @namespace
	 */
	var ExampleRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl
	 *            the control to be rendered
	 */
	ExampleRenderer.render = function(oRm, oControl) {

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapExample");
		oRm.writeClasses();
		if (oControl.getTitle()) {
			oRm.writeAttributeEscaped("title", oControl.getTitle());
		}
		oRm.write(">");
		oRm.writeEscaped(oControl.getText() + "xxx");
		oRm.write("</div>");

	};

	return ExampleRenderer;

}, /* bExport= */ true);
