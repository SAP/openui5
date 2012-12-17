/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.m.ActionSheetRenderer");

/**
 * @class ActionSheet renderer. 
 * @static
 */
sap.m.ActionSheetRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.ActionSheetRenderer.render = function(oRm, oControl){ 
	var aActionButtons = oControl.getButtons(), i;
	 
	// write the HTML into the render manager
	oRm.write("<div");
	oRm.writeControlData(oControl);
	oRm.addClass("sapMActionSheet");
	oRm.writeClasses();
	oRm.write(">");
	
	for(i = 0 ; i < aActionButtons.length ; i++){
		oControl._preProcessActionButton(aActionButtons[i]);
		oRm.renderControl(aActionButtons[i].addStyleClass("sapMActionSheetButton"));
	}
	 
	if(jQuery.device.is.iphone && oControl.getShowCancelButton()){
		oRm.renderControl(oControl._getCancelButton());
	}
	
	oRm.write("</div>");
};
