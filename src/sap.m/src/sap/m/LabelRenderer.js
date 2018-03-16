/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.m.Label
sap.ui.define(['sap/ui/core/Renderer', 'sap/m/library', 'sap/ui/core/library'],
	function(Renderer, library, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.LabelDesign
	var LabelDesign = library.LabelDesign;

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
			sLabelForRendering = oLabel.getLabelForRendering(),
			sHtmlTagToRender = sLabelForRendering ? "label" : "span",
			bDisplayOnly = oLabel.isDisplayOnly(),
			sVerticalAlign = oLabel.getVAlign();
		// write the HTML into the render manager
		// for accessibility reasons when a label doesn't have a "for" attribute, pointing at a HTML element it is rendered as span
		rm.write("<" + sHtmlTagToRender);
		rm.writeControlData(oLabel);

		// styles
		rm.addClass("sapMLabel");
		rm.addClass("sapUiSelectable");

		// label wrapping
		if (oLabel.isWrapping()) {
			rm.addClass("sapMLabelWrapped");
		}
		// set design to bold
		if (oLabel.getDesign() == LabelDesign.Bold) {
			rm.addStyle("font-weight", "bold");
		}

		if (oLabel.isRequired()) {
			rm.addClass("sapMLabelRequired");
		}

		if (sLabelForRendering) {
			sap.ui.core.LabelEnablement.writeLabelForAttribute(rm, oLabel);
		} else if (oLabel.getParent() instanceof sap.m.Toolbar) {
			rm.addClass("sapMLabelTBHeader");
		}

		// text direction
		if (sTextDir !== TextDirection.Inherit){
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

		if (bDisplayOnly) {
			rm.addClass("sapMLabelDisplayOnly");
		}

		if (sVerticalAlign != sap.ui.core.VerticalAlign.Inherit) {
			rm.addStyle("vertical-align", sVerticalAlign.toLowerCase());
		}

		rm.writeStyles();
		rm.writeClasses();

		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}

		rm.write(">");

		// write the label text
		rm.write("<bdi id=\"" + oLabel.getId() + "-bdi\" >");
		if (sLabelText) {
			rm.writeEscaped(sLabelText);
		}
		rm.write("</bdi>");

		rm.write("</" + sHtmlTagToRender + ">");

		// add invisible ":" span in "display only" mode
		if (!sLabelForRendering && oLabel.isDisplayOnly && oLabel.isDisplayOnly()) {
			rm.write('<span id="' + oLabel.getId() + '-colon" class="sapUiPseudoInvisibleText">:</span>');
		}
	};

	/**
	 * Dummy inheritance of static methods/functions.
	 * @see sap.ui.core.Renderer.getTextAlign
	 * @private
	 */
	LabelRenderer.getTextAlign = Renderer.getTextAlign;

	return LabelRenderer;

}, /* bExport= */ true);
