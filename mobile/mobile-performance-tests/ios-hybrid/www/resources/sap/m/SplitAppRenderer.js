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
		if(oControl.getMode() === "ShowHideMode") {
			rm.addClass("sapMSplitAppShowHide");
		}else {
			rm.addClass("sapMSplitAppStretchCompress");
		}
	}
	rm.writeClasses();
	rm.write(">"); // div element
	if(jQuery.device.is.tablet) {
		rm.write("<div class='sapMSplitAppContainer'>");
		oControl._oMasterNav.addStyleClass("sapMSplitAppMaster", true);
		rm.renderControl(oControl._oMasterNav);
		
		oControl._oDetailNav.addStyleClass("sapMSplitAppDetail", true);
		rm.renderControl(oControl._oDetailNav);
		rm.write("</div>");
	}else {
		oControl._oMasterNav.addStyleClass("sapMSplitAppMobile", true);
		rm.renderControl(oControl._oMasterNav);
	}
	rm.write("</div>");
};