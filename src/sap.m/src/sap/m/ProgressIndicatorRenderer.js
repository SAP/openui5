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
	ProgressIndicatorRenderer.render = function(oRm, oControl) {
		var fWidthBar = oControl.getPercentValue(),
			iWidthControl = oControl.getWidth(),
			iHeightControl = oControl.getHeight(),
			sTextValue = oControl.getDisplayValue(),
			bShowText = oControl.getShowValue(),
			sState = oControl.getState(),
			sTextDirectionLowerCase = oControl.getTextDirection().toLowerCase(),
			sControlId = oControl.getId();

		// PI container
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMPI");
		oRm.addStyle("width", iWidthControl);

		if (fWidthBar > 50) {
			oRm.addClass("sapMPIValueGreaterHalf");
		}

		if (fWidthBar === 100) {
			oRm.addClass("sapMPIValueMax");
		}

		if (iHeightControl) {
			oRm.addStyle("height", iHeightControl);
		}

		if (oControl.getEnabled()) {
			oRm.writeAttribute('tabIndex', '-1');
		} else {
			oRm.addClass("sapMPIBarDisabled");
		}

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.writeAccessibilityState(oControl, {
			role: "progressbar",
			valuemin: 0,
			valuenow: fWidthBar,
			valuemax: 100,
			valuetext: oControl._getAriaValueText({
				sText: sTextValue,
				fPercent: fWidthBar
			})
		});

		if (oControl.getTooltip_AsString()) {
			oRm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
		}

		oRm.write(">");

		// PI progress bar
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
		default:
			oRm.addClass("sapMPIBarNeutral");
			break;
		}

		oRm.writeClasses();
		oRm.writeAttribute("id", sControlId + "-bar");
		oRm.writeAttribute("style", "width:" + fWidthBar + "%");
		oRm.write(">");

		// PI text in progress bar
		ProgressIndicatorRenderer._renderDisplayText(oRm, sTextDirectionLowerCase, "Left", sControlId);

		if (bShowText) {
			oRm.writeEscaped(sTextValue);
		}

		oRm.write("</span>");
		oRm.write("</div>"); // div element pi bar

		// PI remaining bar div
		oRm.write("<div");
		oRm.addClass("sapMPIBarRemaining");

		oRm.writeAttribute("id", sControlId + "-remainingBar");
		oRm.writeClasses();
		oRm.write(">");

		// PI text in remaining bar
		ProgressIndicatorRenderer._renderDisplayText(oRm, sTextDirectionLowerCase, "Right", sControlId);

		if (bShowText) {
			oRm.writeEscaped(sTextValue);
		}

		oRm.write("</span>");
		oRm.write("</div>"); // PI Remaining bar div end

		oRm.write("</div>"); // PI container end
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
