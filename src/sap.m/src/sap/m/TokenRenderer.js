/*!

* ${copyright}

*/
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class Token renderer. 
	 * @static
	 */
	var TokenRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenRenderer.render = function(oRm, oControl){
		// write the HTML into the render manager
		oRm.write("<div tabindex=\"-1\"");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMToken");
		oRm.writeClasses();
		// add tooltip if available
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.write(">");
	
		TokenRenderer._renderInnerControl(oRm, oControl);
		
		if (oControl.getEditable()) {
			oRm.renderControl(oControl._deleteIcon);
		}
		
		oRm.write("</div>");
	};
	
	/**
	 * Renders the inner HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenRenderer._renderInnerControl = function(oRm, oControl){
		oRm.write("<span class=\"sapMTokenText\">");
		var title = oControl.getText();
		if (title) {
			oRm.writeEscaped(title);
		}
		oRm.write("</span>");
	};
	

	return TokenRenderer;

}, /* bExport= */ true);
