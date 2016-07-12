/*!
 * ${copyright}
 */
sap.ui.define(["./Slider", "./Input", 'sap/ui/core/InvisibleText'],
    function (Slider, Input, InvisibleText) {
        "use strict";

        /**
         * Constructor for a new <code>sap.m.RangeSlider</code>.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
         * @param {object} [mSettings] Initial settings for the new control.
         *
         * @class
         * A range slider is a user interface control that enables the user
         * to select a value range in a predifined numerical interval.
         * @extends sap.m.Slider
         *
         * @author SAP SE
         * @version ${version}
         *
         * @constructor
         * @public
         * @since 1.38
         * @alias sap.m.RangeSlider
         * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
         */
        var RangeSlider = Slider.extend("sap.m.RangeSlider", /** @lends sap.m.RangeSlider.prototype */ {
            metadata: {
                library: "sap.m",
                properties: {
                    /**
                     * Determines the range in which the user can select values.
                     *
                     * If the value is lower/higher than the allowed minimum/maximum,
                     * a warning message will be output to the console.
                     */
                    range: {type: "any", group: "Data", defaultValue: []}, //Default value of [0, 100] would be set onInit

                    /**
                     * Indicates whether an Input fields should be used as tooltips for the handles.
                     */
                    inputsAsTooltips : {type: "boolean", group: "Appearance", defaultValue: false}
                }
            }
        });

        // Defines threshold for entire range movement (px)
        var RANGE_MOVEMENT_THRESHOLD = 32,
            CHARACTER_WIDTH_PX = 8;

        RangeSlider.prototype.init = function () {
            var aRange;
            Slider.prototype.init.call(this, arguments);

            /**
             * Workaround for range property issue where range's value is shared across RangeSlider instances.
             * Changing range's value in a RangeSlider instance would change the range of another instance
             * with the same initial value.
             */
            aRange = this.getRange();
            aRange = Array.isArray(aRange) && aRange.length === 2 ? aRange : [0, 100]/* Default value */;
            this.setRange(aRange);

            this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

            // the initial focus range which should be used
            this._aInitialFocusRange = Array.prototype.slice.call(this.getRange());

            // the width of the longest range value, which determines the width of the tooltips shown above the handles
            this._iLongestRangeTextWidth = 0;

            // half the width of the tooltip in percent of the total RangeSlider width
            this._fTooltipHalfWidthPercent = 0;

            this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');

            this._ariaUpdateDelay = [];
        };

        RangeSlider.prototype.exit = function () {
            this._oResourceBundle = null;
            this._aInitialFocusRange = null;
            this._oRangeLabel.destroy();
            this._oRangeLabel = null;

            if (this.getInputsAsTooltips()) {
                this._mHandleTooltip.start.tooltip.destroy();
                this._mHandleTooltip.end.tooltip.destroy();
            }
            this._mHandleTooltip.start.label.destroy();
            this._mHandleTooltip.end.label.destroy();

            this._mHandleTooltip.start.handle = null;
            this._mHandleTooltip.start.tooltip = null;
            this._mHandleTooltip.start.label = null;
            this._mHandleTooltip.end.handle = null;
            this._mHandleTooltip.end.tooltip = null;
            this._mHandleTooltip.end.label = null;
            this._ariaUpdateDelay = null;
        };

        RangeSlider.prototype.onBeforeRendering = function () {
            var aAbsRange = [Math.abs(this.getMin()), Math.abs(this.getMax())],
                iRangeIndex = aAbsRange[0] > aAbsRange[1] ? 0 : 1,
                bInputsAsTooltips = !!this.getInputsAsTooltips(),
                oStartLabel = new InvisibleText({text: this._oResourceBundle.getText("RANGE_SLIDER_LEFT_HANDLE")}),
                oEndLabel = new InvisibleText({text: this._oResourceBundle.getText("RANGE_SLIDER_RIGHT_HANDLE")});

            this._oRangeLabel = new InvisibleText({text: this._oResourceBundle.getText("RANGE_SLIDER_RANGE_HANDLE")});

            this._validateProperties();

            //TODO: find a better way to determine this
            this._iLongestRangeTextWidth = ((aAbsRange[iRangeIndex].toString()).length + 1) * CHARACTER_WIDTH_PX;

            this._mHandleTooltip = {
                start: {
                    handle: null, // Handle is provided by the renderer, available onAfterRendering
                    tooltip: bInputsAsTooltips ? this._createInputField("LeftTooltip", oStartLabel) : null,
                    label: oStartLabel
                },
                end: {
                    handle: null, // Handle is provided by the renderer, available onAfterRendering
                    tooltip: bInputsAsTooltips ? this._createInputField("RightTooltip", oEndLabel) : null,
                    label: oEndLabel
                }
            };
        };

        RangeSlider.prototype.onAfterRendering = function () {
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

        RangeSlider.prototype.exit = function () {
            this._aInitialFocusRange = null;
        };

		/**
         * Creates input field that will be used in slider's tooltip
         *
         * @param {String} sSuffix Suffix to append to the ID
         * @param {Object} oAriaLabel Control that will be used as reference for the screen reader
         * @returns {Object} sap.m.Input with all needed events attached and properties filled
         * @private
         */
        RangeSlider.prototype._createInputField = function (sSuffix, oAriaLabel) {
            var oInput = new Input(this.getId() + "-" + sSuffix, {
                value: this.getMin(),
                width: this._iLongestRangeTextWidth + (2 * CHARACTER_WIDTH_PX) /*16 px in paddings for the input*/ + "px",
                type: "Number",
                textAlign: sap.ui.core.TextAlign.Center,
                ariaLabelledBy: oAriaLabel
            });

            oInput.attachChange(this._handleInputChange.bind(this, oInput));

            oInput.addEventDelegate({
                onfocusout: function (oEvent) {
                    oEvent.srcControl.fireChange({value: oEvent.target.value});
                }
            });

            return oInput;
        };

        /**
         * Recalculate some styles.
         *
         * @private
         */
        RangeSlider.prototype._recalculateStyles = function () {
            Slider.prototype._recalculateStyles.call(this, arguments);

            // Here we take the value of the tooltip width as percent value of the total range of the slider
            // This will help us decide if the tooltip should move along with the handle or not based
            // on the interaction specification
            this._fTooltipHalfWidthPercent =
                ((this._fSliderWidth - (this._fSliderWidth - (this._iLongestRangeTextWidth / 2 + CHARACTER_WIDTH_PX))) / this._fSliderWidth) * 100;
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
            this.setProperty("range", Array.prototype.slice.call(aRange), true);

            this._updateHandleDom(oHandle, aRange, iIndex, fValue, fPercentVal);
            this._updateTooltipContent(oTooltip, fValue);
            this._adjustTooltipsContainer(fPercentVal);
            this._recalculateRange();
        };

        RangeSlider.prototype._updateHandleDom = function (oHandle, aRange, iIndex, fValue, fPercentVal) {
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
                oHandle.title = fValue;
            }

            bMergedRanges = aRange[0] === aRange[1];
            this.$("handle1").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);
            this.$("handle2").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);

            // ARIA updates. Delay the update to prevent multiple updates- for example holding the arrow key.
            // We need only the latest state
            jQuery.sap.clearDelayedCall(this._ariaUpdateDelay[iIndex]);
            this._ariaUpdateDelay[iIndex] = jQuery.sap.delayedCall(100, this, "_updateHandleAria", [oHandle, fValue]);
        };

        RangeSlider.prototype._updateHandleAria = function (oHandle, fValue) {
            var aRange = this.getRange(),
                oProgressHandle = this.getDomRef("progress");

            this._updateHandlesAriaLabels();

            oHandle.setAttribute("aria-valuenow", fValue);

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

                this._mHandleTooltip.start.handle.setAttribute("aria-labelledby", this._mHandleTooltip.start.label.getId());
                this._mHandleTooltip.end.handle.setAttribute("aria-labelledby", this._mHandleTooltip.end.label.getId());

                this._mHandleTooltip.bAriaHandlesSwapped = !this._mHandleTooltip.bAriaHandlesSwapped;
            }
        };

        /**
         * Updates the handle's tooltip value
         * @param {Object} oTooltip The tooltip object.
         * @param {int} iNewValue The new value
         * @private
         */
        RangeSlider.prototype._updateTooltipContent = function (oTooltip, iNewValue) {
            var bInputTooltips = this.getInputsAsTooltips();

            if (!bInputTooltips) {
                oTooltip.text(iNewValue);
            } else if (bInputTooltips && oTooltip.getValue() !== iNewValue) {
                oTooltip.setValue(iNewValue);
                oTooltip.$("inner").attr("value", iNewValue);
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
            var oTooltipsContainer = this.getDomRef("TooltipsContainer"),
                sAdjustPropertyStart = this._bRTL ? "right" : "left",
                sAdjustPropertyEnd = this._bRTL ? "left" : "right",
                aRange = this.getRange(),
                fStartPct = this._getPercentOfValue(aRange[0] > aRange[1] ? aRange[1] : aRange[0]),
                fEndPct = this._getPercentOfValue(aRange[0] > aRange[1] ? aRange[0] : aRange[1]);

            //Left Tooltip
            if (fStartPct <= this._fTooltipHalfWidthPercent) {
                oTooltipsContainer.style[sAdjustPropertyStart] = 0 + "%";
            } else if (fStartPct >= (100 - 3 * this._fTooltipHalfWidthPercent)) {
                oTooltipsContainer.style[sAdjustPropertyStart] = (100 - 4 * this._fTooltipHalfWidthPercent) + "%";
            } else {
                oTooltipsContainer.style[sAdjustPropertyStart] = fStartPct - this._fTooltipHalfWidthPercent + "%";
            }

            //Right Tooltip
            if (fEndPct >= (100 - this._fTooltipHalfWidthPercent)) {
                oTooltipsContainer.style[sAdjustPropertyEnd] = 0 + "%";
            } else {
                oTooltipsContainer.style[sAdjustPropertyEnd] = (100 - fEndPct - this._fTooltipHalfWidthPercent) + "%";
            }

            this._swapTooltips(aRange);
        };

        RangeSlider.prototype._handleInputChange = function (oInput, oEvent) {
            var oHandle, oActiveTooltip,
                bTooltipsInitialPositionTouched = this._mHandleTooltip.bTooltipsSwapped,
                newValue = parseInt(oEvent.getParameter("value"), 10);

            if (isNaN(newValue) || newValue < this.getMin() || newValue > this.getMax()) {
                oInput.setValueState("Error");
                return;
            }

            oInput.setValueState("None");

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

        RangeSlider.prototype.setRange = function (aRange) {
            var fMax = this.getMax(),
                fMin = this.getMin();


            if (!Array.isArray(aRange)) {
                jQuery.sap.log.error("Error: " + "Cannot set property range: " + aRange + " not an array in the range: ["
                    + fMin + "," + fMax + "]", this);
                return this;
            }

            aRange = aRange.map(this._adjustRangeValue, this);

            this.setProperty("range", Array.prototype.slice.call(aRange), true);

            if (this.getDomRef()) {
                var fPercentValStart = this._getPercentOfValue(aRange[0]),
                    fPercentValEnd = this._getPercentOfValue(aRange[1]);

                this._updateHandleDom(this._mHandleTooltip.start.handle, aRange, 0, aRange[0], fPercentValStart);
                this._updateHandleDom(this._mHandleTooltip.end.handle, aRange, 1, aRange[1], fPercentValEnd);

                this._updateTooltipContent(this._mHandleTooltip.start.tooltip, parseInt(aRange[0], 10));
                this._updateTooltipContent(this._mHandleTooltip.end.tooltip, parseInt(aRange[1], 10));
                this._recalculateRange();
            }
            return this;
        };

        RangeSlider.prototype.setValue = RangeSlider.prototype.setRange;

        RangeSlider.prototype.getValue = function () {
            var aRange = this.getRange();
            return Math.abs(aRange[1] - aRange[0]);
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
            iHandleIndex = aRange.indexOf(fValue);
            fHandlesDistance = aHandles.reduce(function (fAccumulation, oHandle) {
                return Math.abs(fAccumulation - oHandle.offsetLeft);
            }, 0);

            // if the click is outside the range or distance between handles is below the threshold - update the closest slider handle
            if (fValue < Math.min.apply(Math, aRange) || fValue > Math.max.apply(Math, aRange) || fHandlesDistance <= RANGE_MOVEMENT_THRESHOLD) {
                aHandles = [this.getClosestHandleDomRef(oTouch)];
                this._updateHandle(aHandles[0], fValue);
            } else if (iHandleIndex !== -1) { // Determine if the press event is on certain handle
                aHandles = [this.getDomRef(iHandleIndex === 0 ? "handle1" : "handle2")];
            }

            // registers event listeners
            jQuery(document)
                .on("touchend" + sEventNamespace + " touchcancel" + sEventNamespace + " mouseup" + sEventNamespace,
                    this._ontouchend.bind(this, aHandles))
                .on("touchmove" + sEventNamespace + (oEvent.originalEvent.type !== "touchstart" ? " mousemove" + sEventNamespace : ""),
                    this._ontouchmove.bind(this, fValue, Array.prototype.slice.call(this.getRange()), aHandles));

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
         * @param {Int} [aInitialRange] Mouse pointer's initial position
         * @param {HTMLElement} [aHandles] The handle that should be updated
         * @param {jQuery.Event} oEvent The event object.
         * @private
         */
        RangeSlider.prototype._ontouchmove = function (fInitialPointerPosition, aInitialRange, aHandles, oEvent) {
            var fOffset, bInBoundaries, fMax, fMin,
                iPageX = oEvent.targetTouches ? oEvent.targetTouches[0].pageX : oEvent.pageX;

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

            // Check slider's boundaries
            fMax = this.getMax();
            fMin = this.getMin();
            fOffset = this._calculateHandlePosition(iPageX) - fInitialPointerPosition;
            bInBoundaries = aInitialRange.every(function (fRange) {
                var fMovement = fRange + fOffset;
                if (aHandles.length === 1) {
                    return fMax >= fMovement || fMovement >= fMin;
                } else {
                    return fMax >= fMovement && fMovement >= fMin;
                }
            });

            bInBoundaries && aHandles.map(function (oHandle) {
                this._updateHandle(oHandle, aInitialRange[this._getIndexOfHandle(oHandle)] + fOffset);
            }, this);

            this.fireLiveChange({range: this.getRange()});
        };

        /**
         * Handle the touchend event happening on the slider.
         * @param {HTMLElement} aHandle The handle that should be updated
         * @param {jQuery.Event} oEvent The event object.
         * @private
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

        RangeSlider.prototype.onfocusin = function (oEvent) {
            var sCSSClass = this.getRenderer().CSS_CLASS;

            this.$("TooltipsContainer").addClass(sCSSClass + "HandleTooltipsShow");

            // remember the initial focus range so when esc key is pressed we can return to it
            if (!this._hasFocus()) {
                this._aInitialFocusRange = Array.prototype.slice.call(this.getRange());
            }
        };

        RangeSlider.prototype.onfocusout = function (oEvent) {
            var sCSSClass = this.getRenderer().CSS_CLASS,
                bInputTooltips = this.getInputsAsTooltips();

            if (bInputTooltips && jQuery.contains(this.getDomRef(),oEvent.relatedTarget)) {
                return;
            }

            this.$("TooltipsContainer").removeClass(sCSSClass + "HandleTooltipsShow");
        };


        RangeSlider.prototype._fireChangeAndLiveChange = function(oParam) {
            this.fireChange(oParam);
            this.fireLiveChange(oParam);
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
            var aRange = Array.prototype.slice.call(this.getRange()),
                fMax = this.getMax(),
                fMin = this.getMin(),
                fRangeMax = Math.max.apply(null, aRange),
                fRangeMin = Math.min.apply(null, aRange),
                iIndex = this._getIndexOfHandle(oHandle),
                aHandles = iIndex > -1 ? [oHandle] : [this._mHandleTooltip.start.handle, this._mHandleTooltip.end.handle];


            // Check the boundaries and recalculate the offset if exceeding
            if (fRangeMax + fOffset > fMax) {
                fOffset = Math.abs(fMax) - Math.abs(fRangeMax);
            } else if (fRangeMin + fOffset < fMin) {
                fOffset = Math.abs(fRangeMin) - Math.abs(fMin);
            }

            aHandles.map(function (oCurHandle) {
                this._updateHandle(oCurHandle, aRange[this._getIndexOfHandle(oCurHandle)] + fOffset);
            }, this);
        };

        /**
         * Handles the <code>sapincrease</code> event when right arrow or up arrow is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
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
         */
        RangeSlider.prototype.onsapplus = RangeSlider.prototype.onsapincrease;

        /**
         * Handles the <code>sapincreasemodifiers</code> event when Ctrl + right arrow or up arrow are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapincreasemodifiers = function (oEvent) {
            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

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
         */
        RangeSlider.prototype.onsappageup = RangeSlider.prototype.onsapincreasemodifiers;

        /**
         * Handles the <code>sapdecrease</code> event when left arrow or down arrow are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
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
         */
        RangeSlider.prototype.onsapminus = RangeSlider.prototype.onsapdecrease;

        /**
         * Handles the <code>sapdecreasemodifiers</code> event when Ctrl + left or Ctrl + down keys are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapdecreasemodifiers = function (oEvent) {
            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

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
         */
        RangeSlider.prototype.onsappagedown = RangeSlider.prototype.onsapdecreasemodifiers;

        /**
         * Handles the <code>saphome</code> event when home key is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsaphome = function (oEvent) {
            if (["number", "text"].indexOf(oEvent.target.type) > -1) {
                return;
            }

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            // note: prevent document scrolling when Home key is pressed
            oEvent.preventDefault();

            if (this.getEnabled()) {
                this._updateSliderValues(this.getMin(), oEvent.target);
                this._fireChangeAndLiveChange({range: this.getRange()});
            }
        };

        /**
         * Handles the <code>sapend</code> event when the End key pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
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
         *
         */
        RangeSlider.prototype.onsapescape = function () {
            // reset the slider back to the value
            // which it had when it got the focus
            this.setRange(this._aInitialFocusRange);

            this._fireChangeAndLiveChange({range: this.getRange()});
        };


        return RangeSlider;
    }, /* bExport= */ true);
