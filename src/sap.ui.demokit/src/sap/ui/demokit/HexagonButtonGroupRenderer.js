/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.demokit.HexagonButtonGroup
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class HexagonButtonGroup renderer. 
	 * @static
	 */
	var HexagonButtonGroupRenderer = function() {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	HexagonButtonGroupRenderer.render = function(oRenderManager, oControl){
		// convenience variable
		var rm = oRenderManager;
		
		// write the HTML into the render manager  
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.writeAttribute("class","sapUiHexGroup");
		rm.write(">");
		var iColspan = oControl.getColspan();
		var aButtons = oControl.getButtons();
		for (var i = 0; i < aButtons.length; i++) {
			// TODO fix layouting, needs relative positioning
			var ix = i % iColspan;
			var iy = Math.floor(i / iColspan);
			if ( ix < Math.floor(iColspan / 2) ) {
				ix = 1 + 2 * ix;
			} else {
				ix = 2 * (ix - Math.floor(iColspan / 2));
			}
			var x = 100 +  90 * ix;
			var y = 100 + 100 * iy + 100 - 50 * (ix % 2);
			var oButton = aButtons[i];
			oButton.setPosition("position:absolute;left:" + x + "px;top:" + y + "px;");
			oRenderManager.renderControl(oButton);
		}
		rm.write("</div>");
	};
	

	return HexagonButtonGroupRenderer;

}, /* bExport= */ true);
