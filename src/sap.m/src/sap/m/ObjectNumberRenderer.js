/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/library'],
	function(Renderer, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * ObjectNumber renderer.
	 * @namespace
	 */
	var ObjectNumberRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oON An object representation of the control that should be rendered
	 */
	ObjectNumberRenderer.render = function(oRm, oON) {
		var sTooltip = oON.getTooltip_AsString(),
			sTextDir = oON.getTextDirection(),
			sTextAlign = oON.getTextAlign();

		oRm.write("<div");
		oRm.writeControlData(oON);
		oRm.addClass("sapMObjectNumber");

		oRm.addClass(oON._sCSSPrefixObjNumberStatus + oON.getState());

		if (oON.getEmphasized()) {
			oRm.addClass("sapMObjectNumberEmph");
		}

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		if (sTextDir !== TextDirection.Inherit) {
			oRm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		sTextAlign = Renderer.getTextAlign(sTextAlign, sTextDir);

		if (sTextAlign) {
			oRm.addStyle("text-align", sTextAlign);
		}

		oRm.writeClasses();
		oRm.writeStyles();

		// ARIA
		// when the status is "None" there is nothing for reading
		if (oON.getState() !== ValueState.None) {
			oRm.writeAccessibilityState({
			labelledby: oON.getId() + "-state"
			});
		}

		oRm.write(">");

		this.renderText(oRm, oON);
		oRm.write("  "); // space between the number text and unit
		this.renderUnit(oRm, oON);
		this.renderHiddenARIAElement(oRm, oON);

		oRm.write("</div>");
	};

	ObjectNumberRenderer.renderText = function(oRm, oON) {
		oRm.write("<span");
		oRm.addClass("sapMObjectNumberText");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oON.getNumber());
		oRm.write("</span>");
	};

	ObjectNumberRenderer.renderUnit = function(oRm, oON) {
		var sUnit = oON.getUnit() || oON.getNumberUnit();

		if (sUnit !== "") {
			oRm.write("<span");
			oRm.addClass("sapMObjectNumberUnit");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sUnit);
			oRm.write("</span>");
		}
	};

	ObjectNumberRenderer.renderHiddenARIAElement = function(oRm, oON) {

		if (oON.getState() == ValueState.None) {
			return;
		}

		oRm.write("<span id='" + oON.getId() + "-state' class='sapUiInvisibleText' aria-hidden='true'>");
		oRm.write(oON._getStateText());
		oRm.write("</span>");
	};

	return ObjectNumberRenderer;

}, /* bExport= */ true);
