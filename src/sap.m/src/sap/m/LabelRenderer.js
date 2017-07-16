/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.m.Label
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";

	/**
	 * Label renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var LabelRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.ui.core.Control} oLabel An object representation of the control that should be rendered
	 */
	LabelRenderer.render = function(rm, oLabel){
		// convenience variable
		var r = LabelRenderer,
			sTextDir = oLabel.getTextDirection(),
			sTextAlign = oLabel.getTextAlign(),
			sWidth = oLabel.getWidth(),
			sLabelText = oLabel.getText(),
			sTooltip = oLabel.getTooltip_AsString(),
			// render bdi tag only if the browser is different from IE and Edge since it is not supported there
			bIE_Edge = sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.edge,
			bRenderBDI = (sTextDir === sap.ui.core.TextDirection.Inherit) && !bIE_Edge;

		// write the HTML into the render managerr
		rm.write("<label");
		rm.writeControlData(oLabel);

		// styles
		rm.addClass("sapMLabel");
		rm.addClass("sapUiSelectable");
		// set design to bold
		if (oLabel.getDesign() == sap.m.LabelDesign.Bold) {
			rm.addStyle("font-weight", "bold");
		}

		if (oLabel.isRequired()) {
			rm.addClass("sapMLabelRequired");
		}

		if (oLabel.getLabelForRendering()) {
			sap.ui.core.LabelEnablement.writeLabelForAttribute(rm, oLabel);
		} else if (oLabel.getParent() instanceof sap.m.Toolbar) {
			rm.addClass("sapMLabelTBHeader");
		}

		// text direction
		if (sTextDir !== sap.ui.core.TextDirection.Inherit){
			rm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		// style for width
		if (sWidth) {
			rm.addStyle("width", sWidth);
		} else {
			rm.addClass("sapMLabelMaxWidth");
		}

		// style for text alignment
		if (sTextAlign) {
			sTextAlign = r.getTextAlign(sTextAlign, sTextDir);
			if (sTextAlign) {
				rm.addStyle("text-align", sTextAlign);
			}
		}

		if (sLabelText == "") {
			rm.addClass("sapMLabelNoText");
		}

		rm.writeStyles();
		rm.writeClasses();

		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}

		rm.write(">");

		// write the label text
		if (sLabelText) {
			if (bRenderBDI) {
				//TODO: To be removed after change completion of BLI incident #1770022720
				rm.write('<bdi>');
				rm.writeEscaped(sLabelText);
				rm.write('</bdi>');
			} else {
				rm.writeEscaped(sLabelText);
			}
		}
		rm.write("</label>");
	};

	/**
	 * Dummy inheritance of static methods/functions.
	 * @see sap.ui.core.Renderer.getTextAlign
	 * @private
	 */
	LabelRenderer.getTextAlign = Renderer.getTextAlign;

	return LabelRenderer;

}, /* bExport= */ true);
