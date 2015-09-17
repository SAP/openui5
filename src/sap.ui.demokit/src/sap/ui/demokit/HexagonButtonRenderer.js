/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.demokit.HexagonButton
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class HexagonButton renderer. 
	 * @static
	 */
	var HexagonButtonRenderer = function() {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	HexagonButtonRenderer.render = function(oRenderManager, oControl){
		// convenience variable
		var rm = oRenderManager;
		
		// write the HTML into the render manager  
		rm.write("<div ");
		rm.writeControlData(oControl);
		rm.addClass("sapUiHexBtn");
		rm.addClass("sapUiHexBtn" + jQuery.sap.encodeHTML(oControl.getEnabled() ? oControl.getColor() : "Gray"));
		if ( oControl.getEnabled() && oControl.hasListeners('press') ) {
			rm.addClass("sapUiHexBtnActive");
		}
		rm.writeClasses();
		rm.write(" style='" + jQuery.sap.encodeHTML(oControl.getPosition()) + "'");
		if (oControl.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
		}
		rm.write(">");
		if ( oControl.getIcon() ) {
			rm.write("<IMG ");
			rm.writeAttributeEscaped("src", oControl.getIcon());
			var sImagePosition = oControl.getImagePosition();
			if (sImagePosition) {
				rm.write(" style='" + jQuery.sap.encodeHTML(sImagePosition) + "'");
			} else {
				rm.write(" style='position:relative;left:40px;top:45px;'");
			}
			rm.write(" border='0'");
			rm.write("/>");
		}
		rm.write("</div>");
	};
	

	return HexagonButtonRenderer;

}, /* bExport= */ true);
