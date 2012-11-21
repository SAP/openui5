/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.CheckBoxRenderer");

/**
 * @class CheckBox renderer. 
 * @static
 */
sap.m.CheckBoxRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oCheckBox an object representation of the control that should be rendered
 */
sap.m.CheckBoxRenderer.render = function(oRm, oCheckBox){ 
	// Return immediately if control is invisible
	if (!oCheckBox.getVisible()) {
		return;
	}

	// get control properties
	var bEnabled = oCheckBox.getEnabled();
	var myTabIndex = 0;
	
	// CheckBox wrapper
	oRm.write("<div");
	oRm.addClass("sapMCb");
	oRm.writeControlData(oCheckBox); 
	oRm.writeClasses();
	oRm.write(">");		// DIV element
	
	
	// write the HTML into the render manager
	oRm.write("<div");
	
	// CheckBox style class
	oRm.addClass("sapMCbBg");
	
	if (!bEnabled) {
		oRm.addClass("sapMCbBgDis");
		myTabIndex = -1;
	}

	if (!oCheckBox.getActiveHandling()){
		oRm.addClass("sapMCbActiveStateOff");
	}
	oRm.writeClasses();
	oRm.writeAttribute("tabIndex", myTabIndex);
	oRm.write(">");		// DIV element

	oRm.write("<input type='CheckBox' tabindex='-1' id='");
	oRm.write(oCheckBox.getId() + "-CB'");
	oRm.write(" class='sapMCbMark");
	
	if (oCheckBox.getSelected()) {
		oRm.write(" sapMCbMarkChecked'");
		oRm.writeAttribute("checked", "checked");
	} else {
		oRm.write("' ");
	}
	
	if (oCheckBox.getName()) {
		oRm.writeAttributeEscaped('name', oCheckBox.getName());
	}

	if (!bEnabled) {
		oRm.write(" disabled='disabled'");
	}

	oRm.write(" /></div>");
	oRm.renderControl(oCheckBox._oLabel);
	oRm.write("</div>");
};
