/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.RadioButtonRenderer");

/**
 * @class RadioButton renderer. 
 * @static
 */
sap.m.RadioButtonRenderer = {
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oRadioButton an object representation of the control that should be rendered
 */
sap.m.RadioButtonRenderer.render = function(oRm, oRadioButton){ 
	// Return immediately if control is invisible
	if (!oRadioButton.getVisible()) {
		return;
	}

	// get control properties
	var bEnabled = oRadioButton.getEnabled();
	var bReadOnly = false;
	var myTabIndex = 0;

	// Radio Button style class
	oRm.addClass("sapMRb");

	// write the HTML into the render manager
	oRm.write("<div");						// Control - DIV
    oRm.writeControlData(oRadioButton);

	// ARIA
	oRm.writeAccessibilityState(oRadioButton, {
		role: "radio",
		checked: oRadioButton.getSelected() === true,
		disabled: !bEnabled
	});

	// Add classes and properties depending on the state
	if (oRadioButton.getSelected()) {
		oRm.addClass("sapMRbSel");
	}

	if (!bEnabled) {
		bReadOnly = true;
		oRm.addClass("sapMRbDis");
		myTabIndex = -1;
	}

	oRm.writeClasses();
	oRm.writeAttribute("tabIndex", myTabIndex);
    oRm.write(">");		// DIV element
    
     oRm.write("<div class='sapMRbB'>");
    if(jQuery.os.android || jQuery.os.blackberry) {
	    oRm.write("<div");	
	    oRm.addClass("sapMRbBOut");
	    oRm.writeClasses();
	    oRm.write(">");		// DIV element
	    oRm.write("<div");	
	    oRm.addClass("sapMRbBInn");
	    oRm.writeClasses();
	    oRm.write(">");		// DIV element
    }
    
	// Write the real - potentially hidden - HTML RadioButton element
	oRm.write("<input type='radio' tabindex='-1'");
	oRm.writeAttribute("id", oRadioButton.getId() + "-RB");
	oRm.writeAttribute("name", oRadioButton.getGroupName());
	if (oRadioButton.getSelected()) {
		oRm.writeAttribute("checked", "checked");
	}
	if (!bEnabled) {
		oRm.writeAttribute("disabled", "disabled")
	}
	//oRm.writeAttributeEscaped("title", oRadioButton.getTooltip_AsString());
	if(bReadOnly) {
		oRm.writeAttribute("readonly", "readonly");
		oRm.writeAttribute("disabled", "disabled");
	}	
	oRm.write(" />");	// Close RadioButton-input-element
	if(jQuery.os.android || jQuery.os.blackberry) {
		oRm.write("</div></div>");	// Control - DIVs close
	}
	oRm.write("</div>");
	oRm.renderControl(oRadioButton._oLabel);
	oRm.write("</div>");	// Control - DIVs close
};