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
		var SliderRenderer = {};

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

			oRm.write("<div");
			this.addClass(oRm, oSlider);

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			oRm.addStyle("width", oSlider.getWidth());
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeControlData(oSlider);

			if (sTooltip && oSlider.getShowHandleTooltip()) {
				oRm.writeAttributeEscaped("title", oSlider._formatValueByCustomElement(sTooltip));
			}

			oRm.write(">");

			if (oSlider.getEnableTickmarks()) {
				this.renderTickmarks(oRm, oSlider);
			} else {
				// Keep the "old" labels for backwards compatibility
				this.renderLabels(oRm, oSlider);
			}

			oRm.write('<div');
			oRm.writeAttribute("id", oSlider.getId() + "-inner");
			this.addInnerClass(oRm, oSlider);

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "InnerDisabled");
			}

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			if (oSlider.getProgress()) {
				this.renderProgressIndicator(oRm, oSlider, sSliderLabels);
			}

			this.renderHandles(oRm, oSlider, sSliderLabels);
			oRm.write("</div>");

			if (oSlider.getName()) {
				this.renderInput(oRm, oSlider);
			}

			oSlider.getAggregation("_handlesLabels").forEach(oRm.renderControl, oRm);

			oRm.write("</div>");
		};

		SliderRenderer.renderProgressIndicator = function(oRm, oSlider) {
			oRm.write("<div");
			oRm.writeAttribute("id", oSlider.getId() + "-progress");
			this.addProgressIndicatorClass(oRm, oSlider);
			oRm.addStyle("width", oSlider._sProgressValue);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(' aria-hidden="true"></div>');
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

			oRm.write("<span");

			if (mOptions && (mOptions.id !== undefined)) {
				oRm.writeAttributeEscaped("id", mOptions.id);
			}

			if (oSlider.getShowHandleTooltip() && !oSlider.getShowAdvancedTooltip()) {
				this.writeHandleTooltip(oRm, oSlider);
			}

			if (oSlider.getInputsAsTooltips()) {
				oRm.writeAttribute("aria-describedby", InvisibleText.getStaticId("sap.m", "SLIDER_INPUT_TOOLTIP"));
			}

			this.addHandleClass(oRm, oSlider);
			oRm.addStyle(sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left", oSlider._sProgressValue);
			this.writeAccessibilityState(oRm, oSlider, mOptions);
			oRm.writeClasses();
			oRm.writeStyles();

			if (bEnabled) {
				oRm.writeAttribute("tabindex", "0");
			}

			oRm.write("></span>");
		};

		/**
		 * Writes the handle tooltip.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 */
		SliderRenderer.writeHandleTooltip = function(oRm, oSlider) {
			oRm.writeAttribute("title", oSlider._formatValueByCustomElement(oSlider.toFixed(oSlider.getValue())));
		};

		SliderRenderer.renderInput = function(oRm, oSlider) {
			oRm.write('<input type="text"');
			oRm.writeAttribute("id", oSlider.getId() + "-input");
			oRm.addClass(SliderRenderer.CSS_CLASS + "Input");

			if (!oSlider.getEnabled()) {
				oRm.write("disabled");
			}

			oRm.writeClasses();
			oRm.writeAttributeEscaped("name", oSlider.getName());
			oRm.writeAttribute("value", oSlider._formatValueByCustomElement(oSlider.toFixed(oSlider.getValue())));
			oRm.write("/>");
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

			oRm.writeAccessibilityState(oSlider, {
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
				oRm.writeAccessibilityState(oSlider, {
					valuetext: sScaleLabel
				});
			}
		};

		SliderRenderer.renderTickmarks = function (oRm, oSlider) {
			var i, iTickmarksToRender, fTickmarksDistance, iLabelsCount, fStep, fSliderSize,fSliderStep,
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


			oRm.write("<ul class=\"" + SliderRenderer.CSS_CLASS + "Tickmarks\">");
			this.renderTickmarksLabel(oRm, oSlider, oSlider.getMin());
			oRm.write("<li class=\"" + SliderRenderer.CSS_CLASS + "Tick\" style=\"width: " + fTickmarksDistance + "%;\"></li>");

			for (i = 1; i < iTickmarksToRender - 1; i++) {
				if (iLabelsCount && (i % iLabelsCount === 0)) {
					fStep = i * fTickmarksDistance;
					this.renderTickmarksLabel(oRm, oSlider, oSlider._getValueOfPercent(fStep));
				}

				oRm.write("<li class=\"" + SliderRenderer.CSS_CLASS + "Tick\" style=\"width: " + fTickmarksDistance + "%;\"></li>");
			}

			this.renderTickmarksLabel(oRm, oSlider, oSlider.getMax());
			oRm.write("<li class=\"" + SliderRenderer.CSS_CLASS + "Tick\" style=\"width: 0;\"></li>");
			oRm.write("</ul>");
		};

		SliderRenderer.renderTickmarksLabel = function (oRm, oSlider, fValue) {
			var fOffset = oSlider._getPercentOfValue(fValue);
			var sLeftOrRightPosition = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";
			var sValue;
			fValue = oSlider.toFixed(fValue, oSlider.getDecimalPrecisionOfNumber(oSlider.getStep()));

			// Call Scale's callback or use the plain value. Cast to string
			sValue = oSlider._formatValueByCustomElement(fValue, 'scale');

			oRm.write("<li class=\"" + SliderRenderer.CSS_CLASS + "TickLabel\"");

			oRm.addStyle(sLeftOrRightPosition, (fOffset + "%"));
			oRm.writeStyles();

			oRm.write(">");
			oRm.write("<div class=\"" + SliderRenderer.CSS_CLASS + "Label\">");
			oRm.writeEscaped(sValue);
			oRm.write("</div>");
			oRm.write("</li>");
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
			oRm.addClass(SliderRenderer.CSS_CLASS);
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the inner element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addInnerClass = function(oRm, oSlider) {
			oRm.addClass(SliderRenderer.CSS_CLASS + "Inner");
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the progress indicator element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addProgressIndicatorClass = function(oRm, oSlider) {
			oRm.addClass(SliderRenderer.CSS_CLASS + "Progress");
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the handle element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addHandleClass = function(oRm, oSlider) {
			oRm.addClass(SliderRenderer.CSS_CLASS + "Handle");
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