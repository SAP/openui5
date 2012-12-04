/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.NavContainerRenderer");

/**
 * @class NavContainer renderer. 
 * @static
 */
sap.m.NavContainerRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.NavContainerRenderer.render = function(rm, oControl) { 
	// return immediately if control is invisible
	if (!oControl.getVisible()) {
		return;
	}
	
	rm.write("<div");
	rm.writeControlData(oControl);
	rm.addClass("sapMNav");
	if (jQuery.os.android && jQuery.os.fVersion === 2.3) {
		rm.addClass("sapMNavAndroid2-3");
	}
	rm.writeClasses();
	rm.addStyle("width", oControl.getWidth());
	rm.addStyle("height", oControl.getHeight());
	rm.writeStyles();
	rm.write(">"); // div element

	var oContent = oControl.getCurrentPage();
	if (oContent) {
		rm.renderControl(oContent);
	}

	rm.write("</div>");
};
