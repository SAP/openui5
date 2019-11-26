/*!
 * ${copyright}
 */

sap.ui.define(['./SliderUtilities', "sap/ui/core/InvisibleText"],
	function(SliderUtilities, InvisibleText) {
		"use strict";

		/**
		 * Slider renderer.
		 * @namespace
		 */
		var SliderRenderer = {
			apiVersion: 2
		};

		/**
		 * CSS class to be applied to the HTML root element of the Slider control.
		 *
		 * @type {string}
		 */
		SliderRenderer.CSS_CLASS = "sapMSlider";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the slider that should be rendered.
		 */
		SliderRenderer.render = function(oRm, oSlider) {
			var bEnabled = oSlider.getEnabled(),
				sTooltip = oSlider.getTooltip_AsString(),
				CSS_CLASS = SliderRenderer.CSS_CLASS,
				sSliderLabels = oSlider.getAriaLabelledBy().reduce(function(sAccumulator, sId){
					return sAccumulator + " " + sId;
				}, "");

			oRm.openStart("div", oSlider);
			oRm.class(CSS_CLASS);

			if (!bEnabled) {
				oRm.class(CSS_CLASS + "Disabled");
			}

			oRm.style("width", oSlider.getWidth());

			if (sTooltip && oSlider.getShowHandleTooltip()) {
				oRm.attr("title", oSlider._formatValueByCustomElement(sTooltip));
			}

			oRm.openEnd();
			oRm.openStart('div', oSlider.getId() + "-inner");
			this.addInnerClass(oRm, oSlider);

			if (!bEnabled) {
				oRm.class(CSS_CLASS + "InnerDisabled");
			}

			oRm.openEnd();

			if (oSlider.getProgress()) {
				this.renderProgressIndicator(oRm, oSlider, sSliderLabels);
			}

			this.renderHandles(oRm, oSlider, sSliderLabels);
			oRm.close("div");

			if (oSlider.getEnableTickmarks()) {
				this.renderTickmarks(oRm, oSlider);
			}

			this.renderLabels(oRm, oSlider);

			if (oSlider.getName()) {
				this.renderInput(oRm, oSlider);
			}

			oRm.close("div");
		};

		SliderRenderer.renderProgressIndicator = function(oRm, oSlider) {
			oRm.openStart("div", oSlider.getId() + "-progress");
			this.addProgressIndicatorClass(oRm, oSlider);
			oRm.style("width", oSlider._sProgressValue);
			oRm.attr("aria-hidden", "true");
			oRm.openEnd().close("div");
		};

		/**
		 * This hook method is reserved for derived classes to render more handles.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the slider that should be rendered.
		 */
		SliderRenderer.renderHandles = function(oRm, oSlider, sForwardedLabels) {
			this.renderHandle(oRm, oSlider,  {
				id: oSlider.getId() + "-handle",
				forwardedLabels: sForwardedLabels
			});
		};

		SliderRenderer.renderHandle = function(oRm, oSlider, mOptions) {
			var bEnabled = oSlider.getEnabled();

			oRm.openStart("span");

			if (mOptions && (mOptions.id !== undefined)) {
				oRm.attr("id", mOptions.id);
			}

			if (oSlider.getShowHandleTooltip() && !oSlider.getShowAdvancedTooltip()) {
				this.writeHandleTooltip(oRm, oSlider);
			}

			if (oSlider.getInputsAsTooltips()) {
				oRm.attr("aria-describedby", InvisibleText.getStaticId("sap.m", "SLIDER_INPUT_TOOLTIP"));
			}

			this.addHandleClass(oRm, oSlider);
			oRm.style(sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left", oSlider._sProgressValue);
			this.writeAccessibilityState(oRm, oSlider, mOptions);


			if (bEnabled) {
				oRm.attr("tabindex", "0");
			}

			oRm.openEnd().close("span");
		};

		/**
		 * Writes the handle tooltip.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 */
		SliderRenderer.writeHandleTooltip = function(oRm, oSlider) {
			oRm.attr("title", oSlider._formatValueByCustomElement(oSlider.toFixed(oSlider.getValue())));
		};

		SliderRenderer.renderInput = function(oRm, oSlider) {
			oRm.voidStart("input", oSlider.getId() + "-input").attr("type", "text");
			oRm.class(SliderRenderer.CSS_CLASS + "Input");

			if (!oSlider.getEnabled()) {
				oRm.attr("disabled");
			}

			oRm.attr("name", oSlider.getName());
			oRm.attr("value", oSlider._formatValueByCustomElement(oSlider.toFixed(oSlider.getValue())));
			oRm.voidEnd();
		};

		/**
		 * Writes the accessibility state to the control.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 */
		SliderRenderer.writeAccessibilityState = function(oRm, oSlider, mOptions) {
			var fSliderValue = oSlider.getValue(),
				bNotNumericalLabel = oSlider._isElementsFormatterNotNumerical(fSliderValue),
				sScaleLabel = oSlider._formatValueByCustomElement(fSliderValue),
				sValueNow;

			if (oSlider._getUsedScale() && !bNotNumericalLabel) {
				sValueNow = sScaleLabel;
			} else {
				sValueNow = oSlider.toFixed(fSliderValue);
			}

			oRm.accessibilityState(oSlider, {
				role: "slider",
				orientation: "horizontal",
				valuemin: oSlider.toFixed(oSlider.getMin()),
				valuemax: oSlider.toFixed(oSlider.getMax()),
				valuenow: sValueNow,
				labelledby: {
					value: (mOptions.forwardedLabels + " " + oSlider.getAggregation("_handlesLabels")[0].getId()).trim()
				}
			});

			if (bNotNumericalLabel) {
				oRm.accessibilityState(oSlider, {
					valuetext: sScaleLabel
				});
			}
		};

		SliderRenderer.renderTickmarks = function (oRm, oSlider) {
			var i, iTickmarksToRender, fTickmarksDistance, iLabelsCount, fStep, fSliderSize, fSliderStep, bTickHasLabel,
				oScale = oSlider._getUsedScale();

			if (!oSlider.getEnableTickmarks() || !oScale) {
				return;
			}

			fSliderSize = Math.abs(oSlider.getMin() - oSlider.getMax());
			fSliderStep = oSlider.getStep();

			iLabelsCount = oScale.getTickmarksBetweenLabels();
			iTickmarksToRender = oScale.calcNumberOfTickmarks(fSliderSize, fSliderStep, SliderUtilities.CONSTANTS.TICKMARKS.MAX_POSSIBLE);
			fTickmarksDistance = oSlider._getPercentOfValue(
				this._calcTickmarksDistance(iTickmarksToRender, oSlider.getMin(), oSlider.getMax(), fSliderStep));


			oRm.openStart("ul")
				.class(SliderRenderer.CSS_CLASS + "Tickmarks")
				.openEnd();

			this.renderTickmarksLabel(oRm, oSlider, oSlider.getMin());
			oRm.openStart("li")
				.class(SliderRenderer.CSS_CLASS + "Tick")
				.style("width", fTickmarksDistance + "%;")
				.openEnd()
				.close("li");

			for (i = 1; i < iTickmarksToRender - 1; i++) {
				bTickHasLabel = false;
				if (iLabelsCount && (i % iLabelsCount === 0)) {
					bTickHasLabel = true;
					fStep = i * fTickmarksDistance;
					this.renderTickmarksLabel(oRm, oSlider, oSlider._getValueOfPercent(fStep));
				}

				oRm.openStart("li").class(SliderRenderer.CSS_CLASS + "Tick")
					.style("width", fTickmarksDistance + "%" + (bTickHasLabel ? " opacity: 0;" : ""))
					.openEnd()
					.close("li");
			}

			this.renderTickmarksLabel(oRm, oSlider, oSlider.getMax());
			oRm.openStart("li")
				.class(SliderRenderer.CSS_CLASS + "Tick")
				.style("width", "0")
				.openEnd()
				.close("li");

			oRm.close("ul");
		};

		SliderRenderer.renderTickmarksLabel = function (oRm, oSlider, fValue) {
			var fOffset = oSlider._getPercentOfValue(fValue);
			var sLeftOrRightPosition = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";
			var sValue;
			fValue = oSlider.toFixed(fValue, oSlider.getDecimalPrecisionOfNumber(oSlider.getStep()));

			// Call Scale's callback or use the plain value. Cast to string
			sValue = oSlider._formatValueByCustomElement(fValue, 'scale');

			oRm.openStart("li")
				.class(SliderRenderer.CSS_CLASS + "TickLabel")
				.style(sLeftOrRightPosition, (fOffset + "%"))
				.openEnd();

			oRm.openStart("div")
				.class(SliderRenderer.CSS_CLASS + "Label")
				.openEnd()
				.text(sValue)
				.close("div");

			oRm.close("li");
		};

		/**
		 * Calculate the distance between tickmarks.
		 *
		 * Actually this calculates the distance between the first and the second tickmark, but as it's
		 * assumed that the tickmarks are spread evenly, it doesn't matter.
		 *
		 * @param {int} iTickmarksCount Number of tickmarks that'd be drawn
		 * @param {float} fStart The start value of the scale.
		 * @param {float} fEnd The end value of the scale.
		 * @param {float} fStep The step walking from start to end.
		 * @returns {float} The distance between tickmarks
		 * @private
		 */
		SliderRenderer._calcTickmarksDistance = function (iTickmarksCount, fStart, fEnd, fStep) {
			var fScaleSize = Math.abs(fStart - fEnd),
				iMaxPossibleTickmarks = Math.floor(fScaleSize / fStep),
				iStepsCount = Math.ceil(iMaxPossibleTickmarks / iTickmarksCount);

			return fStart + (iStepsCount * fStep);
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the HTML root element of the control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.36
		 */
		SliderRenderer.addClass = function(oRm, oSlider) {
			oRm.class(SliderRenderer.CSS_CLASS);
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the inner element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addInnerClass = function(oRm, oSlider) {
			oRm.class(SliderRenderer.CSS_CLASS + "Inner");
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the progress indicator element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addProgressIndicatorClass = function(oRm, oSlider) {
			oRm.class(SliderRenderer.CSS_CLASS + "Progress");
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the handle element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addHandleClass = function(oRm, oSlider) {
			oRm.class(SliderRenderer.CSS_CLASS + "Handle");
		};

		/**
		 * This hook method is reserved for derived classes to render the labels.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 */
		SliderRenderer.renderLabels = function (oRm, oSlider) {
			oSlider.getAggregation("_handlesLabels").forEach(oRm.renderControl, oRm);
		};

		return SliderRenderer;

	}, /* bExport= */ true);