/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * ObjectStatus renderer. 
	 * @namespace
	 */
	var ObjectStatusRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ObjectStatusRenderer.render = function(oRm, oObjStatus){
		if (!oObjStatus._isEmpty()) {
			oRm.write("<div");
			oRm.writeControlData(oObjStatus);
			
			var sTooltip = oObjStatus.getTooltip_AsString();
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}
	
			oRm.addClass("sapMObjStatus");
			oRm.addClass("sapMObjStatus" + oObjStatus.getState());
			oRm.writeClasses();
			oRm.write(">");
	
			if (oObjStatus.getTitle()) {
				oRm.write("<span");
				oRm.addClass("sapMObjStatusTitle");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oObjStatus.getTitle() + ":");
				oRm.write("</span>");
			}
	
			if (oObjStatus.getIcon()) {
				oRm.write("<span");
				oRm.addClass("sapMObjStatusIcon");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oObjStatus._getImageControl());
				oRm.write("</span>");
			}
	
			if (oObjStatus.getText()) {
				oRm.write("<span");
				oRm.addClass("sapMObjStatusText");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oObjStatus.getText());
				oRm.write("</span>");
			}
	
			oRm.write("</div>");
		}
	};
	

	return ObjectStatusRenderer;

}, /* bExport= */ true);
