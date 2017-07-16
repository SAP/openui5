/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "./Slider", "./Input", "sap/ui/core/InvisibleText"],
    function (jQuery, Slider, Input, InvisibleText) {
        "use strict";

        /**
         * Constructor for a new <code>RangeSlider</code>.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no ID is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class
         * <strong><i>Overview</i></strong>
         *
         * A {@link sap.m.RangeSlider} control represents a numerical interval and two handles to select a sub-range within it.
         * The purpose of the control is to enable visual selection of sub-ranges within a given interval.
         *
         * <strong>Notes:</strong>
         * <ul>
         * <li>The RangeSlider extends the functionality of the {@link sap.m.Slider Slider}</li>
         * <li>The right and left handle can be moved individually and their positions could therefore switch.</li>
         * <li>The entire range can be moved along the interval.</li>
         * <li>The right and left handle can select the same value</li>
         * </ul>
         * <strong><i>Usage</i></strong>
         *
         * The most common usecase is to select and move sub-ranges on a continuous numerical scale.
         *
         * <strong><i>Responsive Behavior</i></strong>
         *
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
                }
            }
        });

        //Defines object which contains constants used by the control.
        var _CONSTANTS = {
            RANGE_MOVEMENT_THRESHOLD : 32, // Defines threshold for entire range movement (px)
            CHARACTER_WIDTH_PX : 8,
            INPUT_STATE_NONE: "None",
            INPUT_STATE_ERROR: "Error"
        };

        RangeSlider.prototype.init = function () {
            var oStartLabel, oEndLabel;

            Slider.prototype.init.call(this, arguments);


            // Do not execute "_adjustRangeValue" before all initial setters are finished.
            // As max, min, range, value and value2 are dependent on each other,
            // we should be sure that at the first run they are set  properly and then to be validated.
            this._bInitialRangeChecks = true;

            this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

            // the initial focus range which should be used
            this._aInitialFocusRange = this.getRange();

            // the width of the longest range value, which determines the width of the tooltips shown above the handles
            this._iLongestRangeTextWidth = 0;

            // half the width of the tooltip in percent of the total RangeSlider width
            this._fTooltipHalfWidthPercent = 0;

            this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');

            this._ariaUpdateDelay = [];

            oStartLabel = new InvisibleText({text: this._oResourceBundle.getText("RANGE_SLIDER_LEFT_HANDLE")});
            oEndLabel = new InvisibleText({text: this._oResourceBundle.getText("RANGE_SLIDER_RIGHT_HANDLE")});
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

            if (this._oRangeLabel) {
                this._oRangeLabel.destroy();
            }

            this._oRangeLabel = null;

            if (this.getInputsAsTooltips()) {

                if (this._mHandleTooltip.start.tooltip) {
                    this._mHandleTooltip.start.tooltip.destroy();
                }

                if (this._mHandleTooltip.end.tooltip) {
                    this._mHandleTooltip.end.tooltip.destroy();
                }
            }

            if (this._mHandleTooltip.start.label) {
                this._mHandleTooltip.start.label.destroy();
            }

            if (this._mHandleTooltip.end.label) {
                this._mHandleTooltip.end.label.destroy();
            }

            this._mHandleTooltip.start.handle = null;
            this._mHandleTooltip.start.tooltip = null;
            this._mHandleTooltip.start.label = null;
            this._mHandleTooltip.end.handle = null;
            this._mHandleTooltip.end.tooltip = null;
            this._mHandleTooltip.end.label = null;
            this._ariaUpdateDelay = null;
            this._iDecimalPrecision = null;
        };

        RangeSlider.prototype.onBeforeRendering = function () {
            var aAbsRange = [Math.abs(this.getMin()), Math.abs(this.getMax())],
                iRangeIndex = aAbsRange[0] > aAbsRange[1] ? 0 : 1,
                bInputsAsTooltips = !!this.getInputsAsTooltips(),
                aRange = this.getRange();

            // At this point it's certain that all setters are executed and values of
            // min, max, value, value2 and range are set properly and are not using the Default values.
            // It's important however to keep the slider values within the boundaries defined by min and max.
            // Executing once again the range setter would adjust values accordingly. It should not matter if we do:
            // this.setRange(aRange) OR this.setValue(fValue) && this.setValue2(fValue2).
            // Note: this.getRange() is intended to have the same value as [this.getValue(), this.getValue2()]
            this._bInitialRangeChecks = false;
            this.setRange(aRange);

            if (!this._oRangeLabel) {
                this._oRangeLabel = new InvisibleText({text: this._oResourceBundle.getText("RANGE_SLIDER_RANGE_HANDLE")});
            }

            this._validateProperties();

            //TODO: find a better way to determine this
            this._iLongestRangeTextWidth = ((aAbsRange[iRangeIndex].toString()).length
                + this.getDecimalPrecisionOfNumber(this.getStep()) + 1) * _CONSTANTS.CHARACTER_WIDTH_PX;

            // Attach tooltips
            if (!this._mHandleTooltip.start.tooltip) {
                this._mHandleTooltip.start.tooltip = bInputsAsTooltips ?
                    this._createInputField("LeftTooltip", this._mHandleTooltip.start.label) : null;
            }
            if (!this._mHandleTooltip.end.tooltip) {
                this._mHandleTooltip.end.tooltip = bInputsAsTooltips ?
                    this._createInputField("RightTooltip", this._mHandleTooltip.end.label) : null;
            }

            this._iDecimalPrecision = this.getDecimalPrecisionOfNumber(this.getStep());

            // For backwards compatibility when tickmarks are enabled, should be visible
            if (this.getEnableTickmarks() && !this.getAggregation("scale")) {
                this.setAggregation("scale", new sap.m.ResponsiveScale());
            }
        };

        RangeSlider.prototype.onAfterRendering = function () {
            Slider.prototype.onAfterRendering.apply(this, arguments);

            var aRange = this.getRange(),
                fMin = this.getMin(),
                fMax = this.getMax(),
                bRangeExceedsBoundaries = aRange.reduce(function (bResult, fValue) {
                    return bResult || fValue < fMin || fValue > fMax;
                });

            this._mHandleTooltip.start.handle = this.getDomRef("handle1");
            this._mHandleTooltip.end.handle = this.getDomRef("handle2");

            if (!this.getInputsAsTooltips()) {
                this._mHandleTooltip.start.tooltip = this.$("LeftTooltip");
                this._mHandleTooltip.end.tooltip = this.$("RightTooltip");
            }

            this._recalculateStyles();

            // No error in Min,Max,Step properties.
            // We need to validate the passed parameters
            // min and max parameters are superior to range
            if (bRangeExceedsBoundaries) {
                jQuery.sap.log.warning("Warning: " + "Property wrong range: [" + aRange + "] not in the range: ["
                    + fMin + "," + fMax + "]", this);
            }

            //TODO: May be this is not the best choice
            this.$("TooltipsContainer").css("min-width", (this._fTooltipHalfWidthPercent * 4) + "%");

            // Setting the handles to the Start and the End points of the provided or the default range
            this._updateHandle(this._mHandleTooltip.start.handle, aRange[0]);
            this._updateHandle(this._mHandleTooltip.end.handle, aRange[1]);
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
            this._updateTooltipContent(oTooltip, fValue);
            this._adjustTooltipsContainer(fPercentVal);
            this._recalculateRange();
        };

        RangeSlider.prototype._updateHandleDom = function (oHandle, aRange, iIndex, sValue, fPercentVal) {
            var bMergedRanges,
                sCssClass = this.getRenderer().CSS_CLASS,
                oFormInput = this.getDomRef("input");

            if (!!this.getName()) {
                oFormInput.setAttribute(oHandle.getAttribute("data-range-val"), aRange[iIndex]);
                oFormInput.setAttribute("value", this.getValue());
            }

            if (this._bRTL) {
                oHandle.style.right = fPercentVal + "%";
            } else {
                oHandle.style.left = fPercentVal + "%";
            }

            if (this.getShowHandleTooltip()) {
                oHandle.title = sValue;
            }

            bMergedRanges = aRange[0] === aRange[1];
            this.$("handle1").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);
            this.$("handle2").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);

            // ARIA updates. Delay the update to prevent multiple updates- for example holding the arrow key.
            // We need only the latest state
            jQuery.sap.clearDelayedCall(this._ariaUpdateDelay[iIndex]);
            this._ariaUpdateDelay[iIndex] = jQuery.sap.delayedCall(100, this, "_updateHandleAria", [oHandle, sValue]);
        };

        RangeSlider.prototype._updateHandleAria = function (oHandle, sValue) {
            var aRange = this.getRange(),
                oProgressHandle = this.getDomRef("progress");

            this._updateHandlesAriaLabels();

            oHandle.setAttribute("aria-valuenow", sValue);

            if (oProgressHandle) {
                oProgressHandle.setAttribute("aria-valuenow", aRange.join("-"));
                oProgressHandle.setAttribute("aria-valuetext",
                    this._oResourceBundle.getText('RANGE_SLIDER_RANGE_ANNOUNCEMENT', aRange));
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
         * Updates the handle's tooltip value
         * @param {Object} oTooltip The tooltip object.
         * @param {float} fNewValue The new value
         * @private
         */
        RangeSlider.prototype._updateTooltipContent = function (oTooltip, fNewValue) {
            var bInputTooltips = this.getInputsAsTooltips(),
                sNewValue = this.toFixed(fNewValue, this._iDecimalPrecision);

            if (!bInputTooltips) {
                oTooltip.text(sNewValue);
            } else if (bInputTooltips && oTooltip.getValue() !== sNewValue) {
                oTooltip.setValueState(_CONSTANTS.INPUT_STATE_NONE);
                oTooltip.setValue(sNewValue);
                oTooltip.$("inner").attr("value", sNewValue);
            }
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
            var iCorrection,
                oTooltipsContainer = this.getDomRef("TooltipsContainer"),
                sAdjustPropertyStart = this._bRTL ? "right" : "left",
                sAdjustPropertyEnd = this._bRTL ? "left" : "right",
                aRange = this.getRange(),
                fStartPct = this._getPercentOfValue(aRange[0] > aRange[1] ? aRange[1] : aRange[0]),
                fEndPct = this._getPercentOfValue(aRange[0] > aRange[1] ? aRange[0] : aRange[1]),
                fTooltipMinPosition =  this._fHandleWidthPercent / 2,
                fTooltipMaxPosition =  100 - 3 * this._fTooltipHalfWidthPercent + this._fHandleWidthPercent,
                fCalculatedStartPosition = parseFloat(oTooltipsContainer.style[sAdjustPropertyStart]),
                fCalculatedEndPosition = parseFloat(oTooltipsContainer.style[sAdjustPropertyEnd]);

            //Start Tooltip
            if (fStartPct <= fTooltipMinPosition) {
                //below the min tooltip position
                fCalculatedStartPosition = -1 * this._fHandleWidthPercent;
            } else if (fStartPct >= fTooltipMaxPosition) {
                //above the max tooltip position
                if (fCalculatedEndPosition < -1 * this._fHandleWidthPercent) {
                    //cover the case when the right end of the handler is out of the progress element
                    fCalculatedStartPosition = 100 - 4 * this._fTooltipHalfWidthPercent;
                } else {
                    fCalculatedStartPosition = (100 - 4 * this._fTooltipHalfWidthPercent) + this._fHandleWidthPercent;
                }

            //the tooltip position is between min and max tooltip position
            } else if ((fEndPct - fStartPct > this._fTooltipHalfWidthPercent * 2) && (fStartPct > -1 * this._fTooltipHalfWidthPercent)) {
                //the both tooltips are not adjoined
                fCalculatedStartPosition = fStartPct - this._fTooltipHalfWidthPercent;
            } else {
                //the both tooltips are adjoined
                iCorrection = fStartPct - this._fTooltipHalfWidthPercent - (this._fTooltipHalfWidthPercent * 2 - (fEndPct - fStartPct)) / 2;
                if (iCorrection <= -1 * this._fHandleWidthPercent) {
                    fCalculatedStartPosition = -1 * this._fHandleWidthPercent;
                } else {
                    fCalculatedStartPosition = iCorrection;
                }
            }

            //End Tooltip
            if (fEndPct >= (100 - fTooltipMinPosition) || (100 - fEndPct - this._fTooltipHalfWidthPercent) < -this._fHandleWidthPercent) {
                fCalculatedEndPosition = -1 * this._fHandleWidthPercent;
            } else {
                fCalculatedEndPosition = 100 - fEndPct - this._fTooltipHalfWidthPercent;
            }

            oTooltipsContainer.style[sAdjustPropertyStart] = fCalculatedStartPosition + "%";
            oTooltipsContainer.style[sAdjustPropertyEnd] = fCalculatedEndPosition + "%";

            this._swapTooltips(aRange);
        };

        /**
         * Handles changes in Tooltip Inputs
         * @param {Object} oInput The input which the event was fired from
         * @param {jQuery.Event} oEvent The event object
         * @private
         * @override
         */
        RangeSlider.prototype._handleInputChange = function (oInput, oEvent) {
            var oHandle, oActiveTooltip,
                bTooltipsInitialPositionTouched = this._mHandleTooltip.bTooltipsSwapped,
                newValue = Number(oEvent.getParameter("value"));

            if (oEvent.getParameter("value") === "" || isNaN(newValue) || newValue < this.getMin() || newValue > this.getMax()) {
                oInput.setValueState(_CONSTANTS.INPUT_STATE_ERROR);
                return;
            }

            newValue = this._adjustRangeValue(newValue);

            oInput.setValueState(_CONSTANTS.INPUT_STATE_NONE);

            oHandle = this._mHandleTooltip.start.tooltip === oInput ?
                this._mHandleTooltip.start.handle : this._mHandleTooltip.end.handle;

            this._updateHandle(oHandle, newValue);

            // When tooltips are swapped, we should put the focus to the corresponding visual representation
            if (bTooltipsInitialPositionTouched !== this._mHandleTooltip.bTooltipsSwapped) {
                oActiveTooltip = this._mHandleTooltip.start.tooltip !== oInput ?
                    this._mHandleTooltip.start.tooltip : this._mHandleTooltip.end.tooltip;

                oActiveTooltip.focus();
            }

            this._fireChangeAndLiveChange({range: this.getRange()});
        };

        RangeSlider.prototype._updateDOMAfterSetters = function (fValue, aRange, iHandleIndex) {
            var fPercentOfValue, oHandle;

            if (this.getDomRef()) {
                fPercentOfValue = this._getPercentOfValue(fValue);
                oHandle = iHandleIndex === 1 ? this._mHandleTooltip.end : this._mHandleTooltip.start;

                this._updateHandleDom(oHandle.handle, aRange, iHandleIndex, fValue, fPercentOfValue);
                this._updateTooltipContent(oHandle.tooltip, fValue);

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
            var aRangeCopy = Array.isArray(aRange) ? aRange.slice() : [];

            if (this.getProperty("value") !== aRangeCopy[0]) {
                this.setProperty("value", aRangeCopy[0], true);
            }

            if (this.getProperty("value2") !== aRangeCopy[1]) {
                this.setProperty("value2", aRangeCopy[1], true);
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
                fValue = fMin;
            } else if (fValue > fMax) {
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
                sEventNamespace = "." + CSS_CLASS,
                fValue, aHandles, aRange, iHandleIndex, fHandlesDistance, oFocusItem;

            if (!this.getEnabled()) {
                return;
            }

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

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

            // if the click is outside the range or distance between handles is below the threshold - update the closest slider handle
            if (fValue < Math.min.apply(Math, aRange) || fValue > Math.max.apply(Math, aRange) || fHandlesDistance <= _CONSTANTS.RANGE_MOVEMENT_THRESHOLD) {
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
            jQuery.sap.delayedCall(0, oFocusItem, "focus");
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
            bRangeInBoudaries = aRange.every(function (fValue) {return (fValue > fMin && fValue < fMax );});
            bRangeOnBoudaries = aRangeTemp.indexOf(fMin) > -1 || aRangeTemp.indexOf(fMax) > -1;
            if (!bRangesEquality) {
                //check the need to update the handle depending of number of the selected handles and the handles position
                if ((aHandles.length === 1) || bRangeInBoudaries || !bRangeOnBoudaries) {
                    aHandles.map(function (oHandle) {this._updateHandle(oHandle, aInitialRange[this._getIndexOfHandle(oHandle)] + fOffset);}, this);
                }
                this._adjustTooltipsContainer();
                aRangeTemp = this._getNormalizedRange(this.getRange(), aInitialRange, aHandles);
            }
            this.setRange(aRangeTemp);
        };

        /**
         * Get the range normalized in the boundaries.
         * @param {Array} aRange range value
         * @param {Array} aInitialRange last range values
         * @param {Array} aHandles
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
                aRangeNormalized[i] = (aRange[i] > fMax ? fMax : aRange[i]);
                if (aHandles.length === 2) {
                    iOtherElementIndex = Math.abs(i - 1);
                    aRangeNormalized[iOtherElementIndex] = (aRangeNormalized[i] <= fMin ? aRangeNormalized[i] + iSelectedRange : aRangeNormalized[iOtherElementIndex]);
                    aRangeNormalized[iOtherElementIndex] = (aRangeNormalized[i] >= fMax ? aRangeNormalized[i] - iSelectedRange : aRangeNormalized[iOtherElementIndex]);
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

            this._updateTooltipContent(this._mHandleTooltip.start.tooltip, aNewRange[0]);
            this._updateTooltipContent(this._mHandleTooltip.end.tooltip, aNewRange[1]);
        };

        /**
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onfocusin = function (oEvent) {
            var sCSSClass = this.getRenderer().CSS_CLASS;

            this.$("TooltipsContainer").addClass(sCSSClass + "HandleTooltipsShow");

            // remember the initial focus range so when esc key is pressed we can return to it
            if (!this._hasFocus()) {
                this._aInitialFocusRange = this.getRange();
            }
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

        /**
         * Handles the <code>sapincrease</code> event when right arrow or up arrow is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         * @override
         */
        RangeSlider.prototype.onsapincrease = function (oEvent) {
            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

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
            if (["number", "text"].indexOf(oEvent.target.type) > -1 || oEvent.altKey) {
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
            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

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
            if (["number", "text"].indexOf(oEvent.target.type) > -1 || oEvent.altKey) {
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
            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

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
            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

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
    }, /* bExport= */ true);
