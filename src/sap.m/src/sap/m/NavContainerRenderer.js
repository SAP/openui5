/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class NavContainer renderer. 
	 * @static
	 */
	var NavContainerRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	NavContainerRenderer.render = function(rm, oControl) {
		// return immediately if control is invisible
		if (!oControl.getVisible()) {
			return;
		}
		
		rm.write("<div");
		rm.writeControlData(oControl);
		
		rm.addClass("sapMNav");
		rm.addStyle("width", oControl.getWidth());
		rm.addStyle("height", oControl.getHeight());
	
		if (this.renderAttributes) {
			this.renderAttributes(rm, oControl); // may be used by inheriting renderers, but DO NOT write class or style attributes! Instead, call addClass/addStyle.
		}
		
		rm.writeClasses();
		rm.writeStyles();
		
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		rm.write(">"); // div element
	
		if (this.renderBeforeContent) {
			this.renderBeforeContent(rm, oControl); // may be used by inheriting renderers
		}
		
		var oContent = oControl.getCurrentPage();
		if (oContent) {
			rm.renderControl(oContent);
		}
	
		rm.write("</div>");
	};
	

	return NavContainerRenderer;

}, /* bExport= */ true);
