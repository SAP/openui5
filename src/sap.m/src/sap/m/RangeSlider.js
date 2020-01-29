/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/core/InvisibleText",
    "sap/base/Log",
    "./Slider",
    "./SliderTooltip",
    "./SliderUtilities",
    "./RangeSliderRenderer",
    "sap/ui/thirdparty/jquery",
    "sap/ui/events/KeyCodes"
],
    function(
        InvisibleText,
        log,
        Slider,
        SliderTooltip,
        SliderUtilities,
        RangeSliderRenderer,
        jQuery,
        KeyCodes
    ) {
        "use strict";

        /**
         * Constructor for a new <code>RangeSlider</code>.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no ID is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class
         * Represents a numerical interval and two handles to select a sub-range within it.
         * <h3>Overview</h3>
         * The purpose of the control is to enable visual selection of sub-ranges within a given interval.
         * <h4>Notes:<h4>
         * <ul>
         * <li>The RangeSlider extends the functionality of the {@link sap.m.Slider Slider}</li>
         * <li>The right and left handle can be moved individually and their positions could therefore switch.</li>
         * <li>The entire range can be moved along the interval.</li>
         * <li>The right and left handle can select the same value</li>
         * </ul>
         *
         * <h3>Usage</h3>
         * The most common usecase is to select and move sub-ranges on a continuous numerical scale.
         *
         * <h3>Responsive Behavior</h3>
         * You can move the currently selected range by clicking on it and dragging it along the interval.
         * @extends sap.m.Slider
         *
         * @author SAP SE
         * @version ${version}
         *
         * @constructor
         * @public
         * @since 1.38
         * @alias sap.m.RangeSlider
         * @see {@link fiori:https://experience.sap.com/fiori-design-web/range-slider/ Range Slider}
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var RangeSlider = Slider.extend("sap.m.RangeSlider", /** @lends sap.m.RangeSlider.prototype */ {
            metadata: {
                library: "sap.m",
                properties: {
                    /**
                     * Current second value of the slider. (Position of the second handle.)
                     *
                     * <b>Note:</b> If the value is not in the valid range (between <code>min</code> and <code>max</code>) it will be changed to be in the valid range.
                     * If it is smaller than <code>value</code> it will be set to the same value.
                     */
                    value2: {type: "float", group: "Data", defaultValue: 100},
                    /**
                     * Determines the currently selected range on the slider.
                     *
                     * If the value is lower/higher than the allowed minimum/maximum, a warning message will be output to the console.
                     */
                    range: {type: "float[]", group: "Data", defaultValue: [0,100]}
                },
                designtime: "sap/m/designtime/RangeSlider.designtime"
            }
        });

        RangeSlider.prototype.init = function () {
            var oStartLabel, oEndLabel, oRangeLabel;

            Slider.prototype.init.call(this, arguments);

            // Do not execute "_adjustRangeValue" before all initial setters are finished.
            // As max, min, range, value and value2 are dependent on each other,
            // we should be sure that at the first run they are set  properly and then to be validated.
            this._bInitialRangeChecks = true;

            // the initial focus range which should be used
            this._aInitialFocusRange = this.getRange();

            this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');

            this._ariaUpdateDelay = [];

            oStartLabel = new InvisibleText({
                text: this._oResourceBundle.getText("RANGE_SLIDER_LEFT_HANDLE")
            });
            oEndLabel = new InvisibleText({
                text: this._oResourceBundle.getText("RANGE_SLIDER_RIGHT_HANDLE")
            });

            oRangeLabel = new InvisibleText({
                text: this._oResourceBundle.getText("RANGE_SLIDER_RANGE_HANDLE")
            });

            // clear Slider's tooltip
            this.destroyAggregation("_handlesLabels", true);

            this.addAggregation("_handlesLabels", oStartLabel);
            this.addAggregation("_handlesLabels", oEndLabel);
            this.addAggregation("_handlesLabels", oRangeLabel);

            this._mHandleTooltip = {
                start: {
                    handle: null, // Handle is provided by the renderer, available onAfterRendering
                    tooltip: null,
                    label: oStartLabel
                },
                end: {
                    handle: null, // Handle is provided by the renderer, available onAfterRendering
                    tooltip: null,
                    label: oEndLabel
                }
            };
        };

        RangeSlider.prototype.exit = function () {
            this._oResourceBundle = null;
            this._aInitialFocusRange = null;
            this._liveChangeLastValue = null;
            this._mHandleTooltip.start.handle = null;
            this._mHandleTooltip.start.tooltip = null;
            this._mHandleTooltip.start.label = null;
            this._mHandleTooltip.end.handle = null;
            this._mHandleTooltip.end.tooltip = null;
            this._mHandleTooltip.end.label = null;
            this._ariaUpdateDelay = null;
        };

        RangeSlider.prototype.onBeforeRendering = function () {
            this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

            var aRange = this.getRange();

            if (this.getShowAdvancedTooltip()) {
                this.initAndSyncTooltips(["leftTooltip", "rightTooltip"]);
                this._storeTooltipsMetadata();
            }

            // At this point it's certain that all setters are executed and values of
            // min, max, value, value2 and range are set properly and are not using the Default values.
            // It's important however to keep the slider values within the boundaries defined by min and max.
            // Executing once again the range setter would adjust values accordingly. It should not matter if we do:
            // this.setRange(aRange) OR this.setValue(fValue) && this.setValue2(fValue2).
            // Note: this.getRange() is intended to have the same value as [this.getValue(), this.getValue2()]
            this._bInitialRangeChecks = false;

            // We need the decimal precision in order to be able to set the correct values.
            // It is well known that JavaScript has issues with handling floating point values.
            // E.g. 0.0001 + 0.0002 = 0.00029999999999999998
            this._iDecimalPrecision = this.getDecimalPrecisionOfNumber(this.getStep());

            this.setRange(aRange);

            this._validateProperties();

            // set the correct scale aggregation, if needed
            this._syncScaleUsage();
        };

        RangeSlider.prototype.onAfterRendering = function () {
            Slider.prototype.onAfterRendering.apply(this, arguments);

            var aRange = this.getRange();

            this._mHandleTooltip.start.handle = this.getDomRef("handle1");
            this._mHandleTooltip.end.handle = this.getDomRef("handle2");

            this._recalculateStyles();

            // Setting the handles to the Start and the End points of the provided or the default range
            this._updateHandle(this._mHandleTooltip.start.handle, aRange[0]);
            this._updateHandle(this._mHandleTooltip.end.handle, aRange[1]);

            //Swap tooltips so when range is with reversed values e.g. [12, 1]
            //to have properly updated tooltips
            if (this.getShowAdvancedTooltip() && (aRange[0] > aRange[1])) {
                this._swapTooltips(aRange);
            }
        };

        RangeSlider.prototype._storeTooltipsMetadata = function () {
            var aTooltips = this.getUsedTooltips();

            // Attach tooltips
            if (!this._mHandleTooltip.start.tooltip) {
                this._mHandleTooltip.start.tooltip = aTooltips[0];
            }
            if (!this._mHandleTooltip.end.tooltip) {
                this._mHandleTooltip.end.tooltip = aTooltips[1];
            }

            this._mHandleTooltip.bTooltipsSwapped = false; // Reset tooltips swapping
        };

        /**
         * Recalculates the progress range and updates the progress indicator styles.
         * @private
         */
        RangeSlider.prototype._recalculateRange = function () {
            var aHandlesLeftOffset, sStart, sEnd, oProgressIndicator,
                sSide = this._bRTL ? "right" : "left";

            aHandlesLeftOffset = [
                parseFloat(this._mHandleTooltip.start.handle.style[sSide]),
                parseFloat(this._mHandleTooltip.end.handle.style[sSide])
            ];

            sStart = Math.min.apply(Math, aHandlesLeftOffset) + "%";
            sEnd = (100 - Math.max.apply(Math, aHandlesLeftOffset)) + "%";

            oProgressIndicator = this.getDomRef("progress");

            if (this._bRTL) {
                oProgressIndicator.style.left = sEnd;
                oProgressIndicator.style.right = sStart;
            } else {
                oProgressIndicator.style.left = sStart;
                oProgressIndicator.style.right = sEnd;
            }
        };

        /**
         * Gets the closest to the oEvent x coordinate handle dom element.
         * @param {jQuery.Event} oEvent The event object
         * @returns {HTMLElement} The handle, from which the event comes from.
         * @private
         * @override
         */
        RangeSlider.prototype.getClosestHandleDomRef = function (oEvent) {
            var oHandle1 = this._mHandleTooltip.start.handle,
                oHandle2 = this._mHandleTooltip.end.handle,
                fPageXCalc = Math.abs(oEvent.pageX - oHandle1.offsetLeft - this._fSliderPaddingLeft - this._fSliderOffsetLeft),
                fClientXCalc = Math.abs(oEvent.clientX - oHandle2.offsetLeft - this._fSliderPaddingLeft - this._fSliderOffsetLeft);

            return fPageXCalc > fClientXCalc ? oHandle2 : oHandle1;
        };

        RangeSlider.prototype._getIndexOfHandle = function (oHandle) {
            if (oHandle && oHandle.getAttribute && oHandle.getAttribute("data-range-val") === "start") {
                return 0;
            } else if (oHandle && oHandle.getAttribute && oHandle.getAttribute("data-range-val") === "end") {
                return 1;
            } else {
                return -1;
            }
        };

        /**
         * Gets a handle corresponding to a tooltip
         * @param {sap.m.SliderTooltipBase} oTooltip Slider/Range slider tooltip
         * @returns {HTMLElement} The handle, from which the tooltip is responsible.
         * @private
         * @ui5-restricted sap.m.SliderTooltipContainer.js
         */
        RangeSlider.prototype._getHandleForTooltip = function (oTooltip) {
            var oHandle = oTooltip === this._mHandleTooltip.start.tooltip ?
                this._mHandleTooltip.start.handle : this._mHandleTooltip.end.handle;

            return oHandle;
        };

        /**
         * Updates the handle with the given new value and recalculates the progress indicator
         * @param {HTMLElement} oHandle The handle that should be updated
         * @param {float} fValue The new value of the handle
         * @private
         */
        RangeSlider.prototype._updateHandle = function (oHandle, fValue) {
            var oTooltip = (this._mHandleTooltip.start.handle === oHandle) ?
                    this._mHandleTooltip.start.tooltip : this._mHandleTooltip.end.tooltip,
                aRange = this.getRange(),
                iIndex = this._getIndexOfHandle(oHandle),
                fPercentVal = this._getPercentOfValue(fValue);

            aRange[iIndex] = fValue;
            this._updateRangePropertyDependencies(aRange);

            this._updateHandleDom(oHandle, aRange, iIndex, fValue, fPercentVal);

            if (this.getShowAdvancedTooltip()) {
                this._updateTooltipContent(oTooltip, fValue);
                this._adjustTooltipsContainer();
            }

            this._recalculateRange();
        };

        RangeSlider.prototype._updateHandleDom = function (oHandle, aRange, iIndex, sValue, fPercentVal) {
            var bMergedRanges,
                sCssClass = this.getRenderer().CSS_CLASS,
                oFormInput = this.getDomRef("input");

            if (!!this.getName()) {
                oFormInput.setAttribute(oHandle.getAttribute("data-range-val"), this.toFixed(aRange[iIndex], this._iDecimalPrecision));
                oFormInput.setAttribute("value", this.getValue());
            }

            if (this._bRTL) {
                oHandle.style.right = fPercentVal + "%";
            } else {
                oHandle.style.left = fPercentVal + "%";
            }

            if (this.getShowHandleTooltip() && !this.getShowAdvancedTooltip()) {
                oHandle.title = this._formatValueByCustomElement(sValue);
            }

            bMergedRanges = aRange[0] === aRange[1];
            this.$("handle1").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);
            this.$("handle2").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);

            // ARIA updates. Delay the update to prevent multiple updates- for example holding the arrow key.
            // We need only the latest state
            clearTimeout(this._ariaUpdateDelay[iIndex]);
            this._ariaUpdateDelay[iIndex] = setTimeout(this["_updateHandleAria"].bind(this, oHandle, sValue), 100);
        };

        RangeSlider.prototype._updateHandleAria = function (oHandle, sValue) {
            var aRange = this.getRange(),
                oProgressHandle = this.getDomRef("progress"),
                fNormalizedValue = this.toFixed(sValue, this._iDecimalPrecision),
                sScaleLabel = this._formatValueByCustomElement(fNormalizedValue);

            aRange[0] = this.toFixed(aRange[0], this._iDecimalPrecision);
            aRange[1] = this.toFixed(aRange[1], this._iDecimalPrecision);

            this._updateHandlesAriaLabels();

            this._updateHandleAriaAttributeValues(oHandle, sValue, sScaleLabel);

            if (oProgressHandle) {
                oProgressHandle.setAttribute("aria-valuetext",
                    this._oResourceBundle.getText('RANGE_SLIDER_RANGE_ANNOUNCEMENT', aRange.map(this._formatValueByCustomElement, this)));
            }
        };

        /**
         * Updates handles' ARIA Labels.
         * When handles are swapped, the corresponding labels should be swapped too. So the state would be always acurate
         *
         * @private
         */
        RangeSlider.prototype._updateHandlesAriaLabels = function () {
            var aRange = this.getRange(),
                oTempLabel = this._mHandleTooltip.start.label;

            if ((aRange[0] > aRange[1] && !this._mHandleTooltip.bAriaHandlesSwapped) ||
                (aRange[0] < aRange[1] && this._mHandleTooltip.bAriaHandlesSwapped)) {
                this._mHandleTooltip.start.label = this._mHandleTooltip.end.label;
                this._mHandleTooltip.end.label = oTempLabel;

                if (this._mHandleTooltip.start.handle) {
                    this._mHandleTooltip.start.handle.setAttribute("aria-labelledby", this._mHandleTooltip.start.label.getId());
                }
                if (this._mHandleTooltip.end.handle) {
                    this._mHandleTooltip.end.handle.setAttribute("aria-labelledby", this._mHandleTooltip.end.label.getId());
                }

                this._mHandleTooltip.bAriaHandlesSwapped = !this._mHandleTooltip.bAriaHandlesSwapped;
            }
        };

        /**
         * Adds aria-controls attribute, when the tooltips are rendered.
         *
         * @private
         */
        RangeSlider.prototype._setAriaControls = function () {
            if (!this.getShowAdvancedTooltip()) {
                return;
            }

            if (!this._mHandleTooltip.start.handle.getAttribute('aria-controls') && this._mHandleTooltip.start.tooltip) {
                this._mHandleTooltip.start.handle.setAttribute('aria-controls', this._mHandleTooltip.start.tooltip.getId());
            }

            if (!this._mHandleTooltip.end.handle.getAttribute('aria-controls') && this._mHandleTooltip.end.tooltip) {
                this._mHandleTooltip.end.handle.setAttribute('aria-controls', this._mHandleTooltip.end.tooltip.getId());
            }
        };

        /**
         * Updates the handle's tooltip value
         * @param {Object} oTooltip The tooltip object.
         * @param {float} fNewValue The new value
         * @private
         */
        RangeSlider.prototype._updateTooltipContent = function (oTooltip, fNewValue) {
            var sNewValue = this.toFixed(fNewValue, this._iDecimalPrecision);

            oTooltip.setValue(parseFloat(sNewValue));
        };

        RangeSlider.prototype._swapTooltips = function (aRange) {
            var oTempTooltip = this._mHandleTooltip.start.tooltip;

            if ((aRange[0] >= aRange[1] && !this._mHandleTooltip.bTooltipsSwapped) ||
                (aRange[0] <= aRange[1] && this._mHandleTooltip.bTooltipsSwapped)) {
                this._mHandleTooltip.start.tooltip = this._mHandleTooltip.end.tooltip;
                this._mHandleTooltip.end.tooltip = oTempTooltip;

                this._updateTooltipContent(this._mHandleTooltip.start.tooltip, aRange[0]);
                this._updateTooltipContent(this._mHandleTooltip.end.tooltip, aRange[1]);

                // After swapping tooltips, also some accessibility properties should be updated
                if (this.getInputsAsTooltips()) {
                    this._mHandleTooltip.start.handle.setAttribute("aria-controls", this._mHandleTooltip.start.tooltip.getId());
                    this._mHandleTooltip.end.handle.setAttribute("aria-controls", this._mHandleTooltip.end.tooltip.getId());
                }

                this._mHandleTooltip.bTooltipsSwapped = !this._mHandleTooltip.bTooltipsSwapped;
            }
        };

        RangeSlider.prototype._adjustTooltipsContainer = function () {
            var oTooltipsContainer = this.getAggregation("_tooltipContainer");

            if (!oTooltipsContainer.getDomRef()) {
                return;
            }

            oTooltipsContainer.repositionTooltips(this.getMin(), this.getMax());

            this._swapTooltips(this.getRange());
        };

        /**
         * Gets the tooltips that should be shown.
         * Returns custom tooltips if provided and more than 1 else default tooltips
         *
         * @protected
         * @override
         * @returns {sap.m.SliderTooltipBase[]} SliderTooltipBase instances.
         */
        RangeSlider.prototype.getUsedTooltips = function () {
            var aCustomTooltips = this.getCustomTooltips(),
                aDefaultTooltips = this.getAggregation("_defaultTooltips") || [];

            return aCustomTooltips.length > 1 ? aCustomTooltips : aDefaultTooltips;
        };

        /**
         * Handles changes in Tooltip Inputs
         * @param {jQuery.Event} oEvent The event object
         * @private
         * @override
         */
        RangeSlider.prototype.handleTooltipChange = function (oEvent) {
            this.updateTooltipsPositionAndState(oEvent.getSource(), Number(oEvent.getParameter("value")));
        };

        /**
         * Updates values of RangeSlider and repositions tooltips.
         *
         * @param {string} oTooltip Tooltip to be changed
         * @param {float} fValue New value of the RangeSlider
         * @private
         * @ui5-restricted sap.m.SliderTooltipBase
         */
        RangeSlider.prototype.updateTooltipsPositionAndState = function (oTooltip, fValue) {
            var oHandle, oActiveTooltip,
                bTooltipsInitialPositionTouched = this._mHandleTooltip.bTooltipsSwapped;

            fValue = this._adjustRangeValue(fValue);
            oHandle = this._mHandleTooltip.start.tooltip === oTooltip ?
                this._mHandleTooltip.start.handle : this._mHandleTooltip.end.handle;

            this._updateHandle(oHandle, fValue);

            // When tooltips are swapped, we should put the focus to the corresponding visual representation
            if (bTooltipsInitialPositionTouched !== this._mHandleTooltip.bTooltipsSwapped) {
                oActiveTooltip = this._mHandleTooltip.start.tooltip !== oTooltip ?
                    this._mHandleTooltip.start.tooltip : this._mHandleTooltip.end.tooltip;

                oActiveTooltip.focus();
            }

            this._fireChangeAndLiveChange({ range: this.getRange() });
            this.updateAdvancedTooltipDom();
        };

        RangeSlider.prototype._updateDOMAfterSetters = function (fValue, aRange, iHandleIndex) {
            var fPercentOfValue, oHandle;

            if (this.getDomRef()) {
                fPercentOfValue = this._getPercentOfValue(fValue);
                oHandle = iHandleIndex === 1 ? this._mHandleTooltip.end : this._mHandleTooltip.start;

                this._updateHandleDom(oHandle.handle, aRange, iHandleIndex, fValue, fPercentOfValue);

                if (this.getShowAdvancedTooltip()) {
                    this._updateTooltipContent(oHandle.tooltip, fValue);
                }

                return true;
            }

            return false;
        };

        RangeSlider.prototype.setRange = function (aRange) {
            aRange = aRange.map(this._adjustRangeValue, this);

            this._updateRangePropertyDependencies(aRange);

            if (this._updateDOMAfterSetters(aRange[0], aRange, 0) && this._updateDOMAfterSetters(aRange[1], aRange, 1)) {
                this._recalculateRange();
            }

            return this;
        };

        RangeSlider.prototype.setStep = function (fStep) {
            //Log warning in case fStep is not valid
            this._validateProperties();

            //Get the new decimal precision
            this._iDecimalPrecision = this.getDecimalPrecisionOfNumber(fStep);

            // invalidate as setStep is not called regularly
            return this.setProperty("step", fStep);
        };

        RangeSlider.prototype.setValue = function (fValue) {
            var aRange = this.getRange();

            // validate the new value before arithmetic calculations
            if (typeof fValue !== "number" || !isFinite(fValue)) {
                return this;
            }

            fValue = this._adjustRangeValue(fValue);
            aRange[0] = fValue;

            this._updateRangePropertyDependencies(aRange);
            if (this._updateDOMAfterSetters(aRange[0], aRange, 0)) {
                this._recalculateRange();
            }

            return this;
        };

        RangeSlider.prototype.setValue2 = function (fValue) {
            var aRange = this.getRange();

            fValue = this._adjustRangeValue(fValue);
            aRange[1] = fValue;

            this._updateRangePropertyDependencies(aRange);
            if (this._updateDOMAfterSetters(aRange[1], aRange, 1)) {
                this._recalculateRange();
            }

            return this;
        };

        RangeSlider.prototype._updateRangePropertyDependencies = function (aRange) {
            var aRangeCopy = Array.isArray(aRange) ? aRange.slice() : [],
                iDecimal = this._iDecimalPrecision ? this._iDecimalPrecision : 0,
                fNewValue = Number(aRangeCopy[0].toFixed(iDecimal)),
                fNewValue2 = Number(aRangeCopy[1].toFixed(iDecimal));

            if (this.getProperty("value") !== fNewValue) {
                this.setProperty("value", fNewValue, true);
                aRangeCopy[0] = fNewValue;
            }

            if (this.getProperty("value2") !== fNewValue2) {
                this.setProperty("value2", fNewValue2, true);
                aRangeCopy[1] = fNewValue2;
            }

            this.setProperty("range", aRangeCopy, true);
        };

        /**
         * Calculates the value for the handle of the RangeSlider based on the passed raw pageX event coordinates.
         * This will be later transformed to % of the total width of the RangeSlider in order for the handle to be
         * updated accordingly.
         * @param {float} fValue The new raw value of the handle.
         * @returns {float} The new calculated value of the handle.
         * @private
         */
        RangeSlider.prototype._calculateHandlePosition = function (fValue) {
            var fMax = this.getMax(),
                fMin = this.getMin(),
                fNewValue;

            fNewValue = ((fValue - this._fSliderPaddingLeft - this._fSliderOffsetLeft) / this._fSliderWidth) * (fMax - fMin) + fMin;

            // RTL mirror
            if (this._bRTL) {
                fNewValue = this._convertValueToRtlMode(fNewValue);
            }

            return this._adjustRangeValue(fNewValue);
        };

        /**
         * Checks and adjusts value according to Min and Max properties and checks RTL mode
         *
         * @param {float} fValue Value to be checked and adjusted
         * @returns {float} Adjusted value
         * @private
         */
        RangeSlider.prototype._adjustRangeValue = function (fValue) {
            var fMax = this.getMax(),
                fMin = this.getMin(),
                fStep = this.getStep(),
                fModStepVal;

            if (this._bInitialRangeChecks) {
                return fValue;
            }

            fModStepVal = Math.abs((fValue - fMin) % fStep);
            if (fModStepVal !== 0 /* division with remainder */) {
                // snap the new value to the nearest step
                fValue = fModStepVal * 2 >= fStep ? fValue + fStep - fModStepVal : fValue - fModStepVal;
            }

            if (fValue < fMin) {
                log.warning("Warning: " + "Min value (" + fValue + ") not in the range: ["
                    + fMin + "," + fMax + "]", this);
                fValue = fMin;
            } else if (fValue > fMax) {
                log.warning("Warning: " + "Max value (" + fValue + ") not in the range: ["
                    + fMin + "," + fMax + "]", this);
                fValue = fMax;
            }

            return fValue;
        };

        /**
         * Handle the touchstart event happening on the range slider.
         * @param {jQuery.Event} oEvent The event object.
         * @private
         * @override
         */
        RangeSlider.prototype.ontouchstart = function (oEvent) {
            var oTouch = oEvent.targetTouches[0],
                CSS_CLASS = this.getRenderer().CSS_CLASS,
                sEventNamespace = "." + CSS_CLASS, fMinValue, fMaxValue,
                fValue, aHandles, aRange, iHandleIndex, fHandlesDistance, oFocusItem,
                fTotalNumberOfValues, fPercentOfHandle, fHandleValue, fHandleHalfWidth;

            if (!this.getEnabled()) {
                return;
            }

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            // Should be prevent as in Safari while dragging the handle everything else gets selection.
            // As part of the RangeSlider, Inputs in the tooltips should be excluded
            if (oEvent.target.className.indexOf("sapMInput") === -1) {
                oEvent.preventDefault();
            }

            // we need to recalculate the styles since something may have changed
            // the screen size between touches.
            this._recalculateStyles();

            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

            fValue = this._calculateHandlePosition(oTouch.pageX);
            aRange = this.getRange();
            aHandles = [this._mHandleTooltip.start.handle, this._mHandleTooltip.end.handle];
            iHandleIndex = this._getIndexOfHandle(oEvent.target);
            fHandlesDistance = aHandles.reduce(function (fAccumulation, oHandle) {
                return Math.abs(fAccumulation - oHandle.offsetLeft);
            }, 0);

            fMinValue = Math.min.apply(Math, aRange);
            fMaxValue = Math.max.apply(Math, aRange);

            // half width of a handle (both are equal)
            fHandleHalfWidth = this.$("handle1").outerWidth() / 2;
            // total number of possible values
            fTotalNumberOfValues = Math.abs(this.getMin()) + Math.abs(this.getMax());
            // percents that half a handle takes from the width of the scale
            fPercentOfHandle = ((fHandleHalfWidth * 100) / this.$("inner").outerWidth());
            // number of values that takes half a handle
            fHandleValue = (fPercentOfHandle / 100) * fTotalNumberOfValues;

            // if the click is outside the range or distance between handles is below the threshold - update the closest slider handle
            if (fValue < fMinValue ||
                fValue < fMinValue + fHandleValue ||
                fValue > fMaxValue ||
                fValue > (fMaxValue - fHandleValue) ||
                fHandlesDistance <= SliderUtilities.CONSTANTS.RANGE_MOVEMENT_THRESHOLD) {
                aHandles = [this.getClosestHandleDomRef(oTouch)];
                this._updateHandle(aHandles[0], fValue);
                // _updateHandle would update the range and the check for change event fire would fail in _ontouchend
                this._fireChangeAndLiveChange({range: this.getRange()});
            } else if (iHandleIndex !== -1) { // Determine if the press event is on certain handle
                aHandles = [this.getDomRef(iHandleIndex === 0 ? "handle1" : "handle2")];
            }

            // registers event listeners
            jQuery(document)
                .on("touchend" + sEventNamespace + " touchcancel" + sEventNamespace + " mouseup" + sEventNamespace,
                    this._ontouchend.bind(this, aHandles))
                .on("touchmove" + sEventNamespace + (oEvent.originalEvent.type !== "touchstart" ? " mousemove" + sEventNamespace : ""),
                    this._ontouchmove.bind(this, fValue, this.getRange(), aHandles));

            // adds pressed state
            aHandles.map(function (oHandle) {
                if (oHandle.className.indexOf(CSS_CLASS + "HandlePressed") === -1) {
                    oHandle.className += " " + CSS_CLASS + "HandlePressed";
                }
            });

            oFocusItem = aHandles.length === 1 ? aHandles[0] : this.getDomRef("progress");
            setTimeout(oFocusItem["focus"].bind(oFocusItem), 0);
        };

        /**
         * Handle the touchmove event happening on the slider.
         * @param {Int} [fInitialPointerPosition] Mouse pointer's initial position
         * @param {Int} [aInitialRange] Initial range array
         * @param {HTMLElement} [aHandles] The handle that should be updated
         * @param {jQuery.Event} oEvent The event object.
         * @private
         * @override
         */
        RangeSlider.prototype._ontouchmove = function (fInitialPointerPosition, aInitialRange, aHandles, oEvent) {
            var fOffset, bRangesEquality, bRangeInBoudaries, bRangeOnBoudaries,
                iPageX = oEvent.targetTouches ? oEvent.targetTouches[0].pageX : oEvent.pageX,
                fMax = this.getMax(),
                fMin = this.getMin(),
                aRange = [],
                aRangeTemp = [];

            // note: prevent native document scrolling
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            // suppress the emulated mouse event from touch interfaces
            if (oEvent.isMarked("delayedMouseEvent") || !this.getEnabled() ||

                // detect which mouse button caused the event and only process the standard click
                // (this is usually the left button, oEvent.button === 0 for standard click)
                // note: if the current event is a touch event oEvent.button property will be not defined
                oEvent.button) {

                return;
            }

            //calculation of the new range based on the mouse position
            fOffset = this._calculateHandlePosition(iPageX) - fInitialPointerPosition;
            for (var i = 0; i < aInitialRange.length; i++) {
                aRange[i] = aInitialRange[i] + fOffset;
            }

            aRangeTemp = this._getNormalizedRange(this.getRange(), aInitialRange, aHandles);
            //check if the current range is equal to the new one
            bRangesEquality = aRange.every(function (fValue, iIndex) {return fValue === aRangeTemp[iIndex];});
            bRangeInBoudaries = aRange.every(function (fValue) {return (fValue >= fMin && fValue <= fMax );});
            bRangeOnBoudaries = aRangeTemp.indexOf(fMin) > -1 || aRangeTemp.indexOf(fMax) > -1;

            if (!bRangesEquality) {

                //check the need to update the handle depending of number of the selected handles and the handles position
                if ((aHandles.length === 1) || bRangeInBoudaries || !bRangeOnBoudaries) {
                    aHandles.map(function (oHandle) {this._updateHandle(oHandle, aInitialRange[this._getIndexOfHandle(oHandle)] + fOffset);}, this);
                }

                // adjust container if advanced tooltips have to be shown
                this.getShowAdvancedTooltip() && this._adjustTooltipsContainer();

                aRangeTemp = this._getNormalizedRange(this.getRange(), aInitialRange, aHandles);
            }

            this._triggerLiveChange();
            this.setRange(aRangeTemp);
        };

        /**
         * Updates values of the advanced tooltips.
         *
         * @param {string} sNewValue The new value
         * @protected
         */
        RangeSlider.prototype.updateAdvancedTooltipDom = function () {
            this.getAggregation("_tooltipContainer").repositionTooltips(this.getMin(), this.getMax());
        };

        RangeSlider.prototype._triggerLiveChange = function () {
            var bFireLiveChange,
                aRange = this.getRange();

            this._liveChangeLastValue = this._liveChangeLastValue || [];

            bFireLiveChange = aRange.some(function (fValue, index) {
                return fValue !== this._liveChangeLastValue[index];
            }, this);

            if (bFireLiveChange) {
                this._liveChangeLastValue = aRange.slice(); //Save a copy, not a reference
                this.fireLiveChange({range: aRange});
            }
        };

        /**
         * Get the range normalized in the boundaries.
         * @param {Array} aRange range value
         * @param {Array} aInitialRange last range values
         * @param {HTMLElement} [aHandles] The handles of the slider
         * @returns {number} The normalized range
         * @private
         * @override
         */
        RangeSlider.prototype._getNormalizedRange = function (aRange, aInitialRange, aHandles) {
            var fMax = this.getMax(),
                fMin = this.getMin(),
                iSelectedRange = Math.abs(aInitialRange[0] - aInitialRange[1]),
                aRangeNormalized = [],
                i, iOtherElementIndex;

            for (i = 0; i < aRange.length; i++) {
                aRangeNormalized[i] = (aRange[i] < fMin ? fMin : aRange[i]);
                aRangeNormalized[i] = (aRange[i] > fMax ? fMax : aRangeNormalized[i]);

                if (aHandles.length === 2) {

                    if (aRangeNormalized[0] == fMin) {
                        aRangeNormalized[1] = aRangeNormalized[0] + iSelectedRange;
                    } else {
                        iOtherElementIndex = Math.abs(i - 1);
                        aRangeNormalized[iOtherElementIndex] = (aRangeNormalized[i] <= fMin ? aRangeNormalized[i] + iSelectedRange : aRangeNormalized[iOtherElementIndex]);
                        aRangeNormalized[iOtherElementIndex] = (aRangeNormalized[i] >= fMax ? aRangeNormalized[i] - iSelectedRange : aRangeNormalized[iOtherElementIndex]);
                    }
                }
            }

            return aRangeNormalized;
        };

        /**
         * Handle the touchend event happening on the slider.
         * @param {HTMLElement} aHandle The handle that should be updated
         * @param {jQuery.Event} oEvent The event object.
         * @private
         * @override
         */
        RangeSlider.prototype._ontouchend = function (aHandle, oEvent) {
            var aNewRange = this.getRange(),
                sCSSClass = this.getRenderer().CSS_CLASS;

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            aHandle && aHandle.map(function (oHandle) {
                oHandle.className = oHandle.className.replace(new RegExp(" ?" + sCSSClass + "HandlePressed", "gi"), "");
            });
            jQuery(document).off("." + sCSSClass);

            this._recalculateRange();

            if (this._aInitialFocusRange[0] !== aNewRange[0] || this._aInitialFocusRange[1] !== aNewRange[1]) {
                this._aInitialFocusRange = Array.prototype.slice.call(aNewRange);
                this.fireChange({ range: aNewRange });
            }

            if (this.getShowAdvancedTooltip()) {
                this._updateTooltipContent(this._mHandleTooltip.start.tooltip, aNewRange[0]);
                this._updateTooltipContent(this._mHandleTooltip.end.tooltip, aNewRange[1]);
            }
        };

        /**
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onfocusin = function (oEvent) {
            var oTooltipsContainer = this.getAggregation("_tooltipContainer");

            if (this.getShowAdvancedTooltip()) {
                oTooltipsContainer.show(this);
                this._adjustTooltipsContainer();
                this._setAriaControls();
            }

            // remember the initial focus range so when esc key is pressed we can return to it
            if (document.activeElement !== this.getFocusDomRef()) {
                this._aInitialFocusRange = this.getRange();
            }
        };

        RangeSlider.prototype.getFocusDomRef = function() {
            return this.getDomRef("progress");
        };

        /* ----------------------------------------------------------- */
        /* Keyboard handling                                           */
        /* ----------------------------------------------------------- */

        /**
         * Moves handle / entire slider by specified offset
         *
         * @param {float} fOffset Default value: 1. Increase or decrease value by provided offset
         * @param {HTMLElement} oHandle DOM reference to the handle
         * @private
         */
        RangeSlider.prototype._updateSliderValues = function (fOffset, oHandle) {
            var aRange = this.getRange(),
                fMax = this.getMax(),
                fMin = this.getMin(),
                fRangeMax = Math.max.apply(null, aRange),
                fRangeMin = Math.min.apply(null, aRange),
                iIndex = this._getIndexOfHandle(oHandle),
                iOffsetSign = fOffset < 0 ? -1 : 1,
                aHandles = iIndex > -1 ? [oHandle] : [this._mHandleTooltip.start.handle, this._mHandleTooltip.end.handle];

            // If this is a single handle, both values should be equal
            if (aHandles.length === 1) {
                fRangeMin = fRangeMax = aRange[iIndex];
            }

            // Check the boundaries and recalculate the offset if exceeding
            if (fRangeMax + fOffset > fMax) {
                fOffset = iOffsetSign * (Math.abs(fMax) - Math.abs(fRangeMax));
            } else if (fRangeMin + fOffset < fMin) {
                fOffset = iOffsetSign * (Math.abs(fRangeMin) - Math.abs(fMin));
            }

            aHandles.map(function (oCurHandle) {
                this._updateHandle(oCurHandle, aRange[this._getIndexOfHandle(oCurHandle)] + fOffset);
            }, this);
        };


        RangeSlider.prototype.onkeydown = function (oEvent) {
            var bFocusableTooltip = this.getInputsAsTooltips(),
                bShowAdvancedTooltips = this.getShowAdvancedTooltip(),
                bF2Pressed = oEvent.keyCode === SliderUtilities.CONSTANTS.F2_KEYCODE,
                bStartTooltipFocused = (oEvent.target === this._mHandleTooltip.start.handle),
                bTargetIsHandle = jQuery(oEvent.target).hasClass(SliderUtilities.CONSTANTS.HANDLE_CLASS);

            if (bF2Pressed && bShowAdvancedTooltips && bFocusableTooltip && bTargetIsHandle) {
                this._mHandleTooltip[bStartTooltipFocused ? "start" : "end"].tooltip.focus();
            }

            if (oEvent.keyCode === KeyCodes.SPACE) {
                oEvent.preventDefault();
            }
        };

        /**
         * Handles the <code>sapincrease</code> event when right arrow or up arrow is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapincrease = function (oEvent) {

            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._updateSliderValues(this.getStep(), oEvent.target);
                this._fireChangeAndLiveChange({range: this.getRange()});
            }
        };

        /**
         * Handles the <code>onsapplus</code> event when "+" is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapplus = RangeSlider.prototype.onsapincrease;

        /**
         * Handles the <code>sapincreasemodifiers</code> event when Ctrl + right arrow or up arrow are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapincreasemodifiers = function (oEvent) {

            if (oEvent.altKey) {
                return;
            }

            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            oEvent.stopPropagation();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._updateSliderValues(this._getLongStep(), oEvent.target);
                this._fireChangeAndLiveChange({range: this.getRange()});
            }
        };

        /**
         * Handles the <code>sappageup</code> event when page up is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsappageup = RangeSlider.prototype.onsapincreasemodifiers;

        /**
         * Handles the <code>sapdecrease</code> event when left arrow or down arrow are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapdecrease = function (oEvent) {

            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._updateSliderValues(-1 * this.getStep(), oEvent.target);
                this._fireChangeAndLiveChange({range: this.getRange()});
            }
        };

        /**
         * Handles the <code>sapminus</code> event when "-" is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapminus = RangeSlider.prototype.onsapdecrease;

        /**
         * Handles the <code>sapdecreasemodifiers</code> event when Ctrl + left or Ctrl + down keys are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapdecreasemodifiers = function (oEvent) {

            if (oEvent.altKey) {
                return;
            }

            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            oEvent.stopPropagation();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._updateSliderValues(-1 * this._getLongStep(), oEvent.target);
                this._fireChangeAndLiveChange({range: this.getRange()});
            }
        };

        /**
         * Handles the <code>sappagedown</code> event when when page down is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsappagedown = RangeSlider.prototype.onsapdecreasemodifiers;

        /**
         * Handles the <code>saphome</code> event when home key is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsaphome = function (oEvent) {
            var iHandleIndex = 0,
                fRangeValue, oHandle, fMin;

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            // note: prevent document scrolling when Home key is pressed
            oEvent.preventDefault();

            iHandleIndex = this._getIndexOfHandle(oEvent.target);
            fRangeValue = this.getRange()[iHandleIndex];
            fMin = this.getMin();

            if (this.getEnabled() && (fRangeValue !== fMin)) {
                oHandle = (iHandleIndex === 1 ? this._mHandleTooltip.end : this._mHandleTooltip.start);
                this._updateHandle(oHandle.handle, fMin);
                this._fireChangeAndLiveChange({range: this.getRange()});
            }
        };

        /**
         * Handles the <code>sapend</code> event when the End key pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapend = function (oEvent) {

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            // note: prevent document scrolling when End key is pressed
            oEvent.preventDefault();

            if (this.getEnabled()) {
                this._updateSliderValues(this.getMax(), oEvent.target);
                this._fireChangeAndLiveChange({range: this.getRange()});
            }
        };

        /**
         * Handles the <code>sapescape</code> event when escape key is pressed.
         * @override
         */
        RangeSlider.prototype.onsapescape = function () {

            // reset the slider back to the value
            // which it had when it got the focus
            this.setRange(this._aInitialFocusRange);

            this._fireChangeAndLiveChange({range: this.getRange()});
        };


        return RangeSlider;
    });