/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/library"],
	function(coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	/**
	 * ProgressIndicator renderer.
	 * @namespace
	 */
	var ProgressIndicatorRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ProgressIndicator} oControl an object representation of the control that should be rendered
	 */
	ProgressIndicatorRenderer.render = function(oRm, oControl) {
		var fPercentValue = oControl.getPercentValue(),
			iWidthControl = oControl.getWidth(),
			iHeightControl = oControl.getHeight(),
			aPercentValueClassName = oControl._getCSSClassByPercentValue(fPercentValue),
			sTextValue = oControl.getDisplayValue(),
			bShowText = oControl.getShowValue(),
			sState = oControl.getState(),
			sTextDirectionLowerCase = oControl.getTextDirection().toLowerCase(),
			sControlId = oControl.getId(),
			bEnabled = oControl.getEnabled(),
			bAnimate = sap.ui.getCore().getConfiguration().getAnimation() && oControl.getDisplayAnimation();

		// PI container
		oRm.openStart("div", oControl);
		oRm.class("sapMPI");
		oRm.style("width", iWidthControl);
		aPercentValueClassName.forEach(function (sClass) {
			oRm.class(sClass);
		});

		oRm.style("height", iHeightControl);

		if (oControl.getEnabled()) {
			oRm.attr('tabindex', '-1');
		} else {
			oRm.class("sapMPIBarDisabled");
		}

		if (oControl.getDisplayOnly()) {
			oRm.class("sapMPIDisplayOnly");
		}

		oRm.accessibilityState(oControl, {
			role: "progressbar",
			valuemin: 0,
			valuenow: fPercentValue,
			valuemax: 100,
			valuetext: oControl._getAriaValueText({
				sText: sTextValue,
				fPercent: fPercentValue
			})
		});

		if (oControl.getTooltip_AsString()) {
			oRm.attr("title", oControl.getTooltip_AsString());
		}

		oRm.openEnd();

		// PI progress bar
		oRm.openStart("div", sControlId + "-bar");
		oRm.class("sapMPIBar");

		if (bEnabled) {
			switch (sState) {
				case ValueState.Warning:
					oRm.class("sapMPIBarCritical");
					break;
				case ValueState.Error:
					oRm.class("sapMPIBarNegative");
					break;
				case ValueState.Success:
					oRm.class("sapMPIBarPositive");
					break;
				case ValueState.Information:
					oRm.class("sapMPIBarInformation");
					break;
				default:
					oRm.class("sapMPIBarNeutral");
					break;
				}
		} else {
			oRm.class("sapMPIBarNeutral");
		}

		if (bAnimate) {
			oRm.style("transition-property", "flex-basis");
			oRm.style("transition-duration", (Math.abs(oControl._fPercentValueDiff) * 20) + "ms");
			oRm.style("transition-timing-function", "linear");
		}

		oRm.style("flex-basis", fPercentValue + "%");
		oRm.openEnd();

		// PI text in progress bar
		ProgressIndicatorRenderer._renderDisplayText(oRm, sTextDirectionLowerCase, "Left", sControlId);

		if (bShowText) {
			oRm.text(sTextValue);
		}

		oRm.close("span");
		oRm.close("div"); // div element pi bar

		// PI remaining bar div
		oRm.openStart("div", sControlId + "-remainingBar");
		oRm.class("sapMPIBarRemaining");

		oRm.openEnd();

		// PI text in remaining bar
		ProgressIndicatorRenderer._renderDisplayText(oRm, sTextDirectionLowerCase, "Right", sControlId);

		if (bShowText) {
			oRm.text(sTextValue);
		}

		oRm.close("span");
		oRm.close("div"); // PI Remaining bar div end

		oRm.close("div"); // PI container end
	};

	ProgressIndicatorRenderer._renderDisplayText = function(oRm, sTextDirectionLowerCase, sTextAlign, oControlId){
		oRm.openStart("span", oControlId + "-text" + sTextAlign);
		oRm.class("sapMPIText");
		oRm.class("sapMPIText" + sTextAlign);

		if (sTextDirectionLowerCase !== "inherit") {
			oRm.attr("dir", sTextDirectionLowerCase);
		}

		oRm.openEnd();
	};

	return ProgressIndicatorRenderer;

}, /* bExport= */ true);
