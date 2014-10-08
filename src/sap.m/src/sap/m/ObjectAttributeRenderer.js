/*
 * @copyright
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class ObjectAttributeA renderer. 
	 * @static
	 */
	var ObjectAttributeRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ObjectAttributeRenderer.render = function(oRm, oOA) {
	
		// return immediately if control is invisible
		if (oOA.getVisible() && !oOA._isEmpty()) {
			oRm.write("<div");
			oRm.writeControlData(oOA);
			oRm.addClass("sapMObjectAttributeDiv");
			if (oOA.getActive()) {
				oRm.addClass("sapMObjectAttributeActive");
				oRm.writeAttribute("tabindex", "0");
			}
			oRm.writeClasses();
	
			var sTooltip = oOA.getTooltip_AsString();
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}
			oRm.write(">");
			oRm.renderControl(oOA._getUpdatedTextControl());
			oRm.write("</div>");
		}
	};
	

	return ObjectAttributeRenderer;

}, /* bExport= */ true);
