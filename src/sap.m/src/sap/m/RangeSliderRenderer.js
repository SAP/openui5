/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./SliderRenderer", "sap/ui/core/InvisibleText"], function (Renderer, SliderRenderer, InvisibleText) {
	"use strict";

	/**
	 * RangeSlider renderer.
	 * @namespace
	 */
	var RangeSliderRenderer = Renderer.extend(SliderRenderer);
	RangeSliderRenderer.apiVersion = 2;

	RangeSliderRenderer.renderHandles = function (oRM, oControl, sRangeSliderLabels) {
		this.renderHandle(oRM, oControl, {
			id: oControl.getId() + "-handle1",
			position: "start",
			forwardedLabels: sRangeSliderLabels
		});
		this.renderHandle(oRM, oControl, {
			id: oControl.getId() + "-handle2",
			position: "end",
			forwardedLabels: sRangeSliderLabels
		});

		// Render ARIA labels
		oRM.renderControl(oControl._mHandleTooltip.start.label);
		oRM.renderControl(oControl._mHandleTooltip.end.label);
		oRM.renderControl(oControl.getAggregation("_handlesLabels")[2]);
	};

	/**
	 * Used to render each of the handles of the RangeSlider.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
	 * @param {object} mOptions Options used for specificity of the handles
	 */
	RangeSliderRenderer.renderHandle = function (oRM, oControl, mOptions) {
		var fValue,
			aRange = oControl.getRange(),
			bEnabled = oControl.getEnabled(),
			bRTL = sap.ui.getCore().getConfiguration().getRTL();

		oRM.openStart("span");

		if (mOptions && (mOptions.id !== undefined)) {
			oRM.attr("id", mOptions.id);
		}
		if (mOptions && (mOptions.position !== undefined)) {
			fValue = aRange[mOptions.position === "start" ? 0 : 1];

			oRM.attr("data-range-val", mOptions.position);
			oRM.attr("aria-labelledby", (mOptions.forwardedLabels + " " + oControl._mHandleTooltip[mOptions.position].label.getId()).trim());

			if (oControl.getInputsAsTooltips()) {
				oRM.attr("aria-describedby", InvisibleText.getStaticId("sap.m", "SLIDER_INPUT_TOOLTIP"));
			}
		}
		if (oControl.getShowHandleTooltip() && !oControl.getShowAdvancedTooltip()) {
			this.writeHandleTooltip(oRM, oControl);
		}

		oRM.class(SliderRenderer.CSS_CLASS + "Handle");

		if (mOptions && (mOptions.id !== undefined) && mOptions.id === (oControl.getId() + "-handle1")) {
			oRM.style(bRTL ? "right" : "left", aRange[0]);
		}
		if (mOptions && (mOptions.id !== undefined) && mOptions.id === (oControl.getId() + "-handle2")) {
			oRM.style(bRTL ? "right" : "left", aRange[1]);
		}

		this.writeAccessibilityState(oRM, oControl, fValue);

		if (bEnabled) {
			oRM.attr("tabindex", "0");
		}
		oRM.openEnd().close("span");
	};

	/**
	 * Writes the accessibility state to the control.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
	 * @param {string} fValue The current value for the accessibility state
	 */
	RangeSliderRenderer.writeAccessibilityState = function(oRm, oSlider, fValue) {
		var bNotNumericalLabel = oSlider._isElementsFormatterNotNumerical(fValue),
			sScaleLabel = oSlider._formatValueByCustomElement(fValue),
			sValueNow;

		if (oSlider._getUsedScale() && !bNotNumericalLabel) {
			sValueNow = sScaleLabel;
		} else {
			sValueNow = oSlider.toFixed(fValue);
		}

		oRm.accessibilityState(oSlider, {
			role: "slider",
			orientation: "horizontal",
			valuemin: oSlider.toFixed(oSlider.getMin()),
			valuemax: oSlider.toFixed(oSlider.getMax()),
			valuenow: sValueNow
		});

		if (bNotNumericalLabel) {
			oRm.accessibilityState(oSlider, {
				valuetext: sScaleLabel
			});
		}
	};

	/**
	 * Renders the lower range label under the left part of the RangeSlider control.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
	 */
	RangeSliderRenderer.renderStartLabel = function (oRM, oControl) {
		oRM.openStart("div")
			.class(SliderRenderer.CSS_CLASS + "RangeLabel")
			.openEnd()
			.text(oControl.getMin())
			.close("div");
	};

	/**
	 * Renders the higher range label under the right part of the RangeSlider control.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
	 */
	RangeSliderRenderer.renderEndLabel = function (oRM, oControl) {
		oRM.openStart("div")
			.class(SliderRenderer.CSS_CLASS + "RangeLabel")
			.style("width", oControl._getMaxTooltipWidth() + "px")
			.openEnd()
			.text(oControl.getMax())
			.close("div");
	};

	/**
	 * Renders the label under the RangeSlider control.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
	 */
	RangeSliderRenderer.renderLabels = function (oRM, oControl) {
		oRM.openStart("div")
			.class(SliderRenderer.CSS_CLASS + "Labels")
			.openEnd();
		this.renderStartLabel(oRM, oControl);
		this.renderEndLabel(oRM, oControl);
		oRM.close("div");
	};

	RangeSliderRenderer.renderProgressIndicator = function(oRm, oSlider, sForwardedLabels) {
		var aRange = oSlider.getRange();

		aRange[0] = oSlider.toFixed(aRange[0], oSlider._iDecimalPrecision);
		aRange[1] = oSlider.toFixed(aRange[1], oSlider._iDecimalPrecision);

		oRm.openStart("div", oSlider.getId() + "-progress");
		if (oSlider.getEnabled()) {
			oRm.attr("tabindex", "0");
		}
		this.addProgressIndicatorClass(oRm, oSlider);
		oRm.style("width", oSlider._sProgressValue);

		oRm.accessibilityState(oSlider, {
			role: "slider",
			orientation: "horizontal",
			valuemin: oSlider.toFixed(oSlider.getMin()),
			valuemax: oSlider.toFixed(oSlider.getMax()),
			valuetext: oSlider._oResourceBundle.getText('RANGE_SLIDER_RANGE_ANNOUNCEMENT', aRange.map(oSlider._formatValueByCustomElement, oSlider)),
			labelledby: (sForwardedLabels + " " + oSlider.getAggregation("_handlesLabels")[2].getId()).trim() // range label
		}).openEnd().close("div");
	};

	RangeSliderRenderer.addClass = function(oRm, oSlider) {
		SliderRenderer.addClass(oRm, oSlider);
		oRm.class("sapMRangeSlider");
	};

	return RangeSliderRenderer;
}, /* bExport= */ true);