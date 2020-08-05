/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.Link
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * @author SAP SE
	 * @namespace
	 */
	var LinkRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLink An object representation of the control that should be rendered.
	 */
	LinkRenderer.render = function(rm, oLink) {
		// Link is rendered as a "<a>" element
		rm.write("<a");
		rm.writeControlData(oLink);

		rm.writeAccessibilityState(oLink);

		if (!oLink.getEnabled()) {
			rm.addClass("sapUiLnkDsbl");
			rm.writeAttribute("disabled", "true");
		} else {
			rm.addClass("sapUiLnk");
		}
		rm.writeClasses();

		if (oLink.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oLink.getTooltip_AsString());
		}

		if (oLink.getHref()) {
			rm.writeAttributeEscaped("href", oLink.getHref());
		}	else {
			rm.writeAttribute("href", "#");
		}

		if (oLink.getTarget()) {
			rm.writeAttributeEscaped("target", oLink.getTarget());
		}

		if (!oLink.getEnabled()) {
			rm.writeAttribute("tabindex", "-1");
		} else {
			rm.writeAttribute("tabindex", "0");
		}

		if (oLink.getWidth()) {
			rm.addStyle("width", oLink.getWidth());
		}
		rm.writeStyles();

		// Close the opening tag
		rm.write(">");

		// Write the Link text
		if (oLink.getText()) {
			rm.writeEscaped(oLink.getText());
		}

		// Close the tag
		rm.write("</a>");

	};


	return LinkRenderer;

}, /* bExport= */ true);
