/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

 
jQuery.sap.declare("sap.m.SplitAppRenderer");
jQuery.sap.require("sap.ui.core.Renderer");

/**
 * @class SplitApp renderer. 
 * @static
 */
sap.m.SplitAppRenderer = {
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.SplitAppRenderer.render = function(rm, oControl){
	rm.write("<div");
	rm.writeControlData(oControl);
	rm.addClass("sapMSplitApp");
	if(jQuery.device.is.tablet) {
		if(!oControl._oldIsLandscape) {
			rm.addClass("sapMSplitAppPortrait");
		}
		switch(oControl.getMode()) {
			case "ShowHideMode":
				rm.addClass("sapMSplitAppShowHide");
				break;
			case "StretchCompress":
				rm.addClass("sapMSplitAppStretchCompress");
				break;
			case "PopoverMode":
				rm.addClass("sapMSplitAppShowHide");
				break;
		}
	}
	rm.writeClasses();
	rm.write(">"); // div element
	if(jQuery.device.is.tablet) {
		if(oControl.getMode() === "PopoverMode" && !oControl._oldIsLandscape) {
			oControl._oDetailNav.addStyleClass("sapMSplitAppDetail");
			rm.renderControl(oControl._oDetailNav);
		} else {
			oControl._oMasterNav.addStyleClass("sapMSplitAppMaster");
			rm.renderControl(oControl._oMasterNav);
			
			oControl._oDetailNav.addStyleClass("sapMSplitAppDetail");
			rm.renderControl(oControl._oDetailNav);
		}
	}else {
		oControl._oMasterNav.addStyleClass("sapMSplitAppMobile");
		rm.renderControl(oControl._oMasterNav);
	}
	
	 rm.write("</div>");
};