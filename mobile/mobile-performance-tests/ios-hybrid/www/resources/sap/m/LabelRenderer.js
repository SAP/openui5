/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

 
jQuery.sap.declare("sap.m.LabelRenderer");
jQuery.sap.require("sap.ui.core.Renderer");

/**
 * @class Label renderer. 
 * @static
 */
sap.m.LabelRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oLabel an object representation of the control that should be rendered
 */
sap.m.LabelRenderer.render = function(rm, oLabel){
	// return immediately if control is invisible
	if (!oLabel.getVisible()) {
		return;
	}

	// convenience variable
	var r = sap.m.LabelRenderer;
	var myStyles = "";
	
	// write the HTML into the render manager  
	rm.write("<label");
	rm.writeControlData(oLabel);
	
	// Styles
	rm.addClass("sapMLabel");    
	//set design to bold
	if (oLabel.getDesign() == sap.m.LabelDesign.Bold) {
		rm.addClass("sapMLabelBold");
	}
	
	if (oLabel.getLabelFor()) {
		var oFor = sap.ui.getCore().byId(oLabel.getLabelFor());
		rm.write(" for=\"");
		// for some controls the label must point to a special HTML element, not the outer one.
		if ( oFor && oFor.getIdForLabel) {
			rm.write(oFor.getIdForLabel());
		} else{
			rm.write(oLabel.getLabelFor());
		}
		rm.write("\"");
	}
	
	// Text direction
	var oTextDir = oLabel.getTextDirection();
	if (oTextDir) {
		rm.writeAttribute("dir", oTextDir);
	}
	
	// Style for width
	var sWidth = oLabel.getWidth();
	if(sWidth) {
		myStyles += "width:" + sWidth + ";";
	}
	
	// Style for text alignment
	var oTextAlign = oLabel.getTextAlign();
	if(oTextAlign) {
		myStyles += "text-align:" + r.getTextAlign(oTextAlign, oTextDir) + ";";
	}
	
	rm.writeAttribute("style", myStyles);
	rm.writeClasses();
	rm.write(">"); 
	
	// Write the label text
	if (oLabel.getText()) {
		rm.writeEscaped(oLabel.getText());
	}
	rm.write("</label>");
};

/**
 * Dummy inheritance of static methods/functions.
 * @see sap.ui.core.Renderer.getTextAlign
 * @private
 */
sap.m.LabelRenderer.getTextAlign = sap.ui.core.Renderer.getTextAlign;
