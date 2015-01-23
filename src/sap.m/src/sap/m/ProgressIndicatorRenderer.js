/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * ProgressIndicator renderer.
	 * @namespace
	 */
	var ProgressIndicatorRenderer = {};
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ProgressIndicatorRenderer.render = function(oRm, oC) {
		var fWidthBar = oC.getPercentValue();
		var iWidthControl = oC.getWidth();
		var iHeightControl = oC.getHeight();
		var sTextValue = oC.getDisplayValue();
		var bShowText = oC.getShowValue();
		var sState = oC.getState();
		var sTextDirectionLowerCase = oC.getTextDirection().toLowerCase();
		var sControlId = oC.getId();

		// write the HTML into the render manager
		//PI border
		oRm.write("<div");
		oRm.writeControlData(oC);
		oRm.addClass("sapMPI");
		if (fWidthBar > 50) {
			oRm.addClass("sapMPIValueGreaterHalf");
		}
		oRm.addStyle("width", iWidthControl);
		if (iHeightControl) {
			oRm.addStyle("height", iHeightControl);
		}
		oRm.writeStyles();

		if (oC.getEnabled()) {
			oRm.writeAttribute('tabIndex', '-1');
		} else {
			oRm.addClass("sapMPIBarDisabled");
		}
		oRm.writeClasses();
		oRm.write(">"); // div element

		//PI bar
		oRm.write("<div");
		oRm.addClass("sapMPIBar");

		switch (sState) {
		case sap.ui.core.ValueState.Warning:
			oRm.addClass("sapMPIBarCritical");
			break;
		case sap.ui.core.ValueState.Error:
			oRm.addClass("sapMPIBarNegative");
			break;
		case sap.ui.core.ValueState.Success:
			oRm.addClass("sapMPIBarPositive");
			break;
		case sap.ui.core.ValueState.None:
			oRm.addClass("sapMPIBarNeutral");
			break;
		default:
			oRm.addClass("sapMPIBarNeutral");
			break;
		}

		oRm.writeClasses();
		oRm.writeAttribute("id", sControlId + "-bar");
		oRm.writeAttribute("style", "width:" + fWidthBar + "%");
		oRm.write(">"); // div element

		//PI textLeft
		ProgressIndicatorRenderer._renderDisplayText(oRm, sTextDirectionLowerCase, "Left", sControlId);

		//textvalue is only showed if showValue set
		if (bShowText) {
			oRm.writeEscaped(sTextValue);
		}

		oRm.write("</span>");
		oRm.write("</div>"); // div element pi bar

		//PI textRight
		ProgressIndicatorRenderer._renderDisplayText(oRm, sTextDirectionLowerCase, "Right", sControlId);

		//textvalue is only showed if showValue set
		if (bShowText) {
			oRm.writeEscaped(sTextValue);
		}
		oRm.write("</span>");

		oRm.write("</div>"); //div element pi text
	};

	ProgressIndicatorRenderer._renderDisplayText = function(oRm, sTextDirectionLowerCase, sTextAlign, oControlId){
		oRm.write("<span class='sapMPIText sapMPIText" + sTextAlign + "' id='" + oControlId + "-text" + sTextAlign + "'");

		if (sTextDirectionLowerCase !== "inherit") {
			oRm.writeAttribute("dir", sTextDirectionLowerCase);
		}

		oRm.write('>');
	};

	return ProgressIndicatorRenderer;

}, /* bExport= */ true);
