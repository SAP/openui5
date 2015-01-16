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
			/* Get the library resource bundle in order to create localized strings */
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			var sTextDir = oObjStatus.getTextDirection();

			oRm.write("<div");
			oRm.writeControlData(oObjStatus);

			var sTooltip = oObjStatus.getTooltip_AsString();
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			oRm.addClass("sapMObjStatus");
			oRm.addClass("sapMObjStatus" + oObjStatus.getState());
			oRm.writeClasses();

			/* ARIA region adding the aria-describedby to ObjectStatus */
			oRm.writeAccessibilityState({
				describedby: {
					value: oObjStatus.getId() + "sapSRH",
					append: true
				}
			});

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

				if (sTextDir && sTextDir !== sap.ui.core.TextDirection.Inherit) {
					oRm.writeAttribute("dir", sTextDir.toLowerCase());
				}

				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oObjStatus.getText());
				oRm.write("</span>");
			}

			/* ARIA adding hidden node in span element */
			oRm.write("<span");
			oRm.writeAttributeEscaped("id", oObjStatus.getId() + "sapSRH");
			oRm.addClass("sapUiInvisibleText");
			oRm.writeClasses();
			oRm.writeAccessibilityState({
				hidden: false
			});
			oRm.write(">");
			switch (oObjStatus.getState()) {
				case sap.ui.core.ValueState.None:
					oRm.writeEscaped(oResourceBundle.getText("OBJSTATS_ARIA_NONESTATE"));
					break;
				case sap.ui.core.ValueState.Success:
					oRm.writeEscaped(oResourceBundle.getText("OBJSTATS_ARIA_SUCCESSSTATE"));
					break;
				case sap.ui.core.ValueState.Warning:
					oRm.writeEscaped(oResourceBundle.getText("OBJSTATS_ARIA_WARNINGSTATE"));
					break;
				case sap.ui.core.ValueState.Error:
					oRm.writeEscaped(oResourceBundle.getText("OBJSTATS_ARIA_ERRORSTATE"));
					break;
			}
			oRm.write("</span>");
			oRm.write("</div>");
		}
	};


	return ObjectStatusRenderer;

}, /* bExport= */ true);
