/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"],
	function (Device) {
	"use strict";

	/**
	 * BoxContainerRenderer renderer.
	 * @namespace
	 */
	var BoxContainerRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	BoxContainerRenderer.render = function (oRm, oControl) {
		// Start control wrapper
		oRm.write("<div ");
		oRm.writeControlData(oControl);
		oRm.addClass("sapTntBoxContainer");
		oRm.writeClasses();
		oRm.addStyle("width", oControl.getWidth());
		oRm.writeStyles();
		oRm.write(">");

		oRm.renderControl(oControl.getAggregation("_list"));

		oRm.write("</div>");
	};

	return BoxContainerRenderer;

}, true);
