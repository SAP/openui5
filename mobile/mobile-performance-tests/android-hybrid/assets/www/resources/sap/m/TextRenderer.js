/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for control sap.m.Text
jQuery.sap.declare("sap.m.TextRenderer");
jQuery.sap.require("sap.ui.core.Renderer");

/**
 * @class Text renderer
 * @author SAP AG
 * @static
 */
sap.m.TextRenderer = {
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the render output buffer.
 * @param {sap.ui.core.Control} oText An object representation of the control that should be rendered.
 */
sap.m.TextRenderer.render = function(oRenderManager, oText) {
	// return immediately if control is invisible
	if (!oText.getVisible()) {
		return;
	}

	var rm = oRenderManager;

	// add styles for non-wrapping
	if(!oText.getWrapping()){
		rm.addStyle("white-space", "nowrap");
		rm.addStyle("overflow", "hidden");
		rm.addStyle("text-overflow", "ellipsis");
	}

	// add styles for width
	if (oText.getWidth() && oText.getWidth() != '') {
		rm.addStyle("width", oText.getWidth());
	}

	// start writing html
	rm.write("<span");
	rm.writeControlData(oText);
	rm.addClass("sapMText");

	// write direction
	var oTextDir = oText.getTextDirection();
	if (oTextDir) {
		rm.writeAttribute("dir", oTextDir);
	}

	// write alignment
	var oTextAlign = oText.getTextAlign();
	if (oTextAlign) {
		rm.addStyle("text-align", sap.m.TextRenderer.getTextAlign(oTextAlign, oTextDir));
	}

	// finish writing html
	rm.writeClasses();
	rm.writeStyles();
	rm.write(">");
	rm.writeEscaped(oText.getText(), true);
	rm.write("</span>");
};

/**
 * Dummy inheritance of static methods/functions.
 * @see sap.ui.core.Renderer.getTextAlign
 * @private
 */
sap.m.TextRenderer.getTextAlign = sap.ui.core.Renderer.getTextAlign;