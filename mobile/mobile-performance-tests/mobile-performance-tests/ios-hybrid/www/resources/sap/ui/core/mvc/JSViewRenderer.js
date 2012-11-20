/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for JSView
jQuery.sap.declare("sap.ui.core.mvc.JSViewRenderer");

/**
 * @class JSView renderer.
 * @static
 */
sap.ui.core.mvc.JSViewRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.ui.core.mvc.JSViewRenderer.render = function(oRenderManager, oControl){
	// convenience variable
	var rm = oRenderManager;

	// write the HTML into the render manager
	rm.write("<div");
	rm.writeControlData(oControl);
	rm.addClass("sapUiView");
	rm.addClass("sapUiJSView");
	rm.addStyle("width", oControl.getWidth());
	rm.addStyle("height", oControl.getHeight());
	rm.writeStyles();
	rm.writeClasses();
	rm.write(">");

	var content = oControl.getContent();
	if (content) {
		if (jQuery.isArray(content)) {
			// looks like an Array
			for (var i = 0; i < content.length; i++) {
				rm.renderControl(content[i]);
			}

		} else if (content) {
			// should be a Control
			rm.renderControl(content);
		}
	}

	rm.write("</div>");
};
