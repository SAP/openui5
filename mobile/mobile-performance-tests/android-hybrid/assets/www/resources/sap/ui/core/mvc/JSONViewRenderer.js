/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for JSONView
jQuery.sap.declare("sap.ui.core.mvc.JSONViewRenderer");

/**
 * @class JSONView renderer.
 * @static
 */
sap.ui.core.mvc.JSONViewRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.ui.core.mvc.JSONViewRenderer.render = function(oRenderManager, oControl){
	// convenience variable
	var rm = oRenderManager;

	// write the HTML into the render manager
	rm.write("<div");
	rm.writeControlData(oControl);
	rm.addClass("sapUiView");
	rm.addClass("sapUiJSONView");
	rm.addStyle("width", oControl.getWidth());
	rm.addStyle("height", oControl.getHeight());
	rm.writeStyles();
	rm.writeClasses();
	rm.write(">");

	var content = oControl.getContent();
	if (content) {
		if (content.length && !(content instanceof sap.ui.core.Control)) {
			// looks like an Array
			for (var i = 0; i < content.length; i++) {
				rm.renderControl(content[i]);
			}

		} else {
			// should be a Control
			rm.renderControl(oControl.getContent());
		}
	}

	rm.write("</div>");
};
