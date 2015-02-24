/*
 * @copyright
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";


	/**
	 * ObjectNumber renderer. 
	 * @namespace
	 */
	var ObjectNumberRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ObjectNumberRenderer.render = function(oRm, oON) {
		var sTooltip,
			sTextDir = oON.getTextDirection(),
			sTextAlign = oON.getTextAlign(),
			bPageRTL = sap.ui.getCore().getConfiguration().getRTL(),
			oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sARIAStateText = "";

		// write the HTML into the render manager
		oRm.write("<div"); // Number begins
		oRm.writeControlData(oON);

		// write the tooltip
		sTooltip = oON.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.addClass("sapMObjectNumber");
		if (oON.getEmphasized()) {
			oRm.addClass("sapMObjectNumberEmph");
		}
		oRm.addClass(oON._sCSSPrefixObjNumberStatus + oON.getState());

		sTextDir && oRm.writeAttribute("dir", sTextDir.toLowerCase());
		if (sTextAlign) {
			sTextAlign = Renderer.getTextAlign(sTextAlign, sTextDir);
			if (sTextAlign) {
				oRm.addStyle("text-align", sTextAlign);
			}
		}

		oRm.writeClasses();
		oRm.writeStyles();

		// ARIA
		oRm.writeAccessibilityState({
			labelledby: oON.getId() + "-state"
		});

		oRm.write(">");

		oRm.write("<span"); // Number text begins
		oRm.addClass("sapMObjectNumberText");
		oRm.writeClasses();

		oRm.write(">");
		oRm.writeEscaped(oON.getNumber());
		oRm.write("</span>"); // Number text ends

		oRm.write("<span"); // Number unit begins
		oRm.addClass("sapMObjectNumberUnit");

		//this handles the case where we want the opposite text direction, not that set on the page
		//in this case we want the padding of the object number unit element to be applied on the other side
		if ((sTextDir === sap.ui.core.TextDirection.LTR && bPageRTL) ||
			(sTextDir === sap.ui.core.TextDirection.RTL && !bPageRTL)) {
			oRm.addClass("sapMRTLOpposite");
		}

		oRm.writeClasses();
		oRm.write(">");

		var unit = oON.getUnit();
		if (!unit) {
			unit = oON.getNumberUnit();
		}
		oRm.writeEscaped(unit);
		oRm.write("</span>"); // Number unit ends

		if (oON.getState() != sap.ui.core.ValueState.None) {

			// Hidden state element for ARIA
			oRm.write("<span id='" + oON.getId() + "-state' class='sapUiInvisibleText' aria-hidden='true'>");

			switch (oON.getState()) {
				case sap.ui.core.ValueState.Error:
					sARIAStateText = oRB.getText("OBJECTNUMBER_ARIA_VALUE_STATE_ERROR");
					break;
				case sap.ui.core.ValueState.Warning:
					sARIAStateText = oRB.getText("OBJECTNUMBER_ARIA_VALUE_STATE_WARNING");
					break;
				case sap.ui.core.ValueState.Success:
					sARIAStateText = oRB.getText("OBJECTNUMBER_ARIA_VALUE_STATE_SUCCESS");
					break;
			}
			
			oRm.write(sARIAStateText);
			oRm.write("</span>"); // Hidden state ends
		}

		oRm.write("</div>"); // Number ends
	};
	
	/**
	 * Gets text alignment by calling the Renderer function getTextAlign
	 * 
	 * @param {sap.ui.core.TextAlign}
	 *            sTextAlign text align
	 * @param {sap.ui.core.TextDirection}
	 *            sTextDir text direction
	 * @private
	 */
	ObjectNumberRenderer._getTextAlignment = function(sTextAlign, sTextDir) {
		sTextAlign = Renderer.getTextAlign(sTextAlign, sTextDir);

		return sTextAlign;
	};
	
	return ObjectNumberRenderer;

}, /* bExport= */ true);
