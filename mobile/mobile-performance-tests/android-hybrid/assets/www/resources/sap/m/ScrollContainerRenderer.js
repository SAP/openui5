/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.ScrollContainerRenderer");

/**
 * @class ScrollContainer renderer. 
 * @static
 */
sap.m.ScrollContainerRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.ScrollContainerRenderer.render = function(oRm, oControl) { 
	// return immediately if control is invisible
	if (!oControl.getVisible()) {
		return;
	}

	oRm.write("<div");
	oRm.writeControlData(oControl);

	var width = oControl.getWidth(),
	height = oControl.getHeight();
	if (width) {
		oRm.addStyle("width", width);
	}
	if (height) {
		oRm.addStyle("height", height);
	}
	oRm.writeStyles();

	if (oControl.getVertical()) {
		if (!oControl.getHorizontal()) {
			oRm.addClass("sapMScrollContV");
		} else {
			oRm.addClass("sapMScrollContVH");
		}
	} else if (oControl.getHorizontal()) {
		oRm.addClass("sapMScrollContH");
	}

	oRm.addClass("sapMScrollCont");
	oRm.writeClasses();
	oRm.write("><div id='" + oControl.getId() + "-scroll' class='sapMScrollContScroll'>");

	// render child controls
	var aContent = oControl.getContent(), 
	l = aContent.length;
	for (var i = 0; i < l; i++) {
		oRm.renderControl(aContent[i]);
	}

	oRm.write("</div></div>");
};
