/*
 * @copyright
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * ObjectAttributeA renderer. 
	 * @namespace
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
		if (!oOA._isEmpty()) {
			var oParent = oOA.getParent(),
				sTextDir = oOA.getTextDirection();
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
			
			// ARIA
			if (oOA.getActive()) {
				oRm.writeAccessibilityState(oOA, {
					role: "link"
				});
			}

			oRm.write(">");
			if (oParent && (oParent instanceof sap.m.ObjectHeader)) {
				if (oOA.getProperty("title")) {
					oRm.write("<span id=\"" + oOA.getId() + "-title\"");
					oRm.addClass("sapMObjectAttributeTitle");
					oRm.writeClasses();
					oRm.write(">");
					oRm.writeEscaped(oOA.getProperty("title"));
					oRm.write("</span>");
					oRm.write("<span id=\"" + oOA.getId() + "-colon\"");
					oRm.addClass("sapMObjectAttributeColon");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write(":&nbsp;");
					oRm.write("</span>");
				}
				oRm.write("<span id=\"" + oOA.getId() + "-text\"");
				oRm.addClass("sapMObjectAttributeText");
				if (sTextDir && sTextDir !== sap.ui.core.TextDirection.Inherit) {
					oRm.writeAttribute("dir", sTextDir.toLowerCase());
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oOA.getProperty("text"));
				oRm.write("</span>");
			} else {
				oRm.renderControl(oOA._getUpdatedTextControl());
			}
			oRm.write("</div>");
		}
	};

	return ObjectAttributeRenderer;

}, /* bExport= */ true);
