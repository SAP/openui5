/*!
 * ${copyright}
 */

sap.ui.define(["./Slider"],
    function (Slider) {
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
                    range: {type: "any", group: "Data", defaultValue: []} //Default value of [0, 100] would be set onInit
                }
            }
        });

        // Defines threshold for entire range movement (px)
        var RANGE_MOVEMENT_THRESHOLD = 32;

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
        };

        RangeSlider.prototype.onBeforeRendering = function () {
            var aAbsRange = [Math.abs(this.getMin()), Math.abs(this.getMax())],
                iWidthOfCharPX = 8; //TODO: find a better way to determine this

            this._validateProperties();

            if (aAbsRange[0] > aAbsRange[1]) {
                //TODO: find a better way to determine this
                this._iLongestRangeTextWidth = ((aAbsRange[0].toString()).length + 1) * iWidthOfCharPX;
            } else {
                this._iLongestRangeTextWidth = ((aAbsRange[1].toString()).length + 1) * iWidthOfCharPX;
            }
        };

        RangeSlider.prototype.onAfterRendering = function () {
            var aRange = this.getRange(),
                fMin = this.getMin(),
                fMax = this.getMax(),
                oHandle1 = this.getDomRef("handle1"),
                oHandle2 = this.getDomRef("handle2"),
                bRangeExceedsBoundaries = aRange.reduce(function (bResult, fValue) {
                    return bResult || fValue < fMin || fValue > fMax;
                });

            this._recalculateStyles(); //TODO: Refactor the layout trashing

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
            this._updateHandle(oHandle1, aRange[0]);
            this._updateHandle(oHandle2, aRange[1]);
        };

        RangeSlider.prototype.exit = function () {
            this._aInitialFocusRange = null;
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
                ((this._fSliderWidth - (this._fSliderWidth - (this._iLongestRangeTextWidth / 2 + 8))) / this._fSliderWidth) * 100;
        };

        /**
         * Recalculates the progress range and updates the progress indicator styles.
         * @private
         */
        RangeSlider.prototype._recalculateRange = function () {
            var aHandlesLeftOffset;

            if (this._bRTL) {
                aHandlesLeftOffset = [
                    parseFloat(this.getDomRef("handle1").style.right),
                    parseFloat(this.getDomRef("handle2").style.right)
                ];
            } else {
                aHandlesLeftOffset = [
                    parseFloat(this.getDomRef("handle1").style.left),
                    parseFloat(this.getDomRef("handle2").style.left)
                ];
            }

            var sStart = Math.min.apply(Math, aHandlesLeftOffset) + "%";
            var sEnd = (100 - Math.max.apply(Math, aHandlesLeftOffset)) + "%";

            var oProgressIndicator = this.getDomRef("progress");
            //oProgressIndicator.style.width = "auto";

            if (this._bRTL) {
                oProgressIndicator.style.left = sEnd;
                oProgressIndicator.style.right = sStart;
            } else {
                oProgressIndicator.style.left = sStart;
                oProgressIndicator.style.right = sEnd;
            }
        };

        RangeSlider.prototype.getClosestHandleDomRef = function (oEvent) {
            var oHandle1 = this.getDomRef("handle1"),
                oHandle2 = this.getDomRef("handle2"),
                fPageXCalc = Math.abs(oEvent.pageX - oHandle1.offsetLeft - this._fSliderPaddingLeft - this._fSliderOffsetLeft),
                fClientXCalc = Math.abs(oEvent.clientX - oHandle2.offsetLeft - this._fSliderPaddingLeft - this._fSliderOffsetLeft);

            return fPageXCalc > fClientXCalc ? oHandle2 : oHandle1;
        };

        RangeSlider.prototype._getIndexOfHandle = function (oHandle) {
            if (oHandle.getAttribute("data-range-val") === "start") {
                return 0;
            } else if (oHandle.getAttribute("data-range-val") === "end") {
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
            var bMergedRanges,
                aRange = this.getRange(),
                iIndex = this._getIndexOfHandle(oHandle),
                fPercentVal = this._getPercentOfValue(fValue),
                sCssClass = this.getRenderer().CSS_CLASS,
                oFormInput = this.getDomRef("input");


            aRange[iIndex] = fValue;
            this.setRange(aRange);

            if (!!this.getName()) {
                oFormInput.setAttribute(oHandle.getAttribute("data-range-val"), aRange[iIndex]);
                oFormInput.setAttribute("value", this.getValue());
            }

            if (this._bRTL) {
                oHandle.style.right = fPercentVal + "%";
            } else {
                oHandle.style.left = fPercentVal + "%";
            }

            oHandle.setAttribute("aria-valuenow", fValue);

            if (this.getShowHandleTooltip()) {
                oHandle.title = fValue;
            }

            bMergedRanges = aRange[0] === aRange[1];
            this.$("handle1").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);
            this.$("handle2").toggleClass(sCssClass + "HandleOverlap", bMergedRanges);

            this._updateTooltips(iIndex, aRange, fPercentVal);
            this._recalculateRange();
        };

        /**
         * Updates the handles tooltip's value and position for the newly provided handle value
         * @param {int} iIndex The index of the handle being moved
         * @param {Array} aRange The new range values
         * @param {float} fPercentVal The new value of the tooltip as percent of the RangeSlider's width
         * @private
         */
        RangeSlider.prototype._updateTooltips = function (iIndex, aRange, fPercentVal) {
            var iNewValue = parseInt(aRange[iIndex], 10),
                bZeroIndex = iIndex === 0,
                bALessB = aRange[0] < aRange[1],
                bAGreaterB = aRange[0] > aRange[1];

            if ((bALessB && bZeroIndex) || (bAGreaterB && !bZeroIndex)) {
                this._updateLeftTooltip(fPercentVal, iNewValue);
            } else if ((bALessB && !bZeroIndex) || (bAGreaterB && bZeroIndex)) {
                this._updateRightTooltip(fPercentVal, iNewValue);
            } else {
                this._updateLeftTooltip(fPercentVal, iNewValue);
                this._updateRightTooltip(fPercentVal, iNewValue);
            }
        };

        RangeSlider.prototype._updateLeftTooltip = function (fPercentVal, iNewValue) {
            var oTooltip = this.$("LeftTooltip"),
                oTooltipsContainer = this.getDomRef("TooltipsContainer"),
                sAdjustProperty = this._bRTL ? "right" : "left";

            oTooltip.text(iNewValue);

            if (fPercentVal <= this._fTooltipHalfWidthPercent) {
                oTooltipsContainer.style[sAdjustProperty] = 0 + "%";
            } else if (fPercentVal >= (100 - 3 * this._fTooltipHalfWidthPercent)) {
                oTooltipsContainer.style[sAdjustProperty] = (100 - 4 * this._fTooltipHalfWidthPercent) + "%";
            } else {
                oTooltipsContainer.style[sAdjustProperty] = fPercentVal - this._fTooltipHalfWidthPercent + "%";
            }
        };

        RangeSlider.prototype._updateRightTooltip = function (fPercentVal, iNewValue) {
            var oTooltip = this.$("RightTooltip"),
                oTooltipsContainer = this.getDomRef("TooltipsContainer"),
                sAdjustProperty = this._bRTL ? "left" : "right";

            oTooltip.text(iNewValue);

            if (fPercentVal >= (100 - this._fTooltipHalfWidthPercent)) {
                oTooltipsContainer.style[sAdjustProperty] = 0 + "%";
            } else {
                oTooltipsContainer.style[sAdjustProperty] = (100 - fPercentVal - this._fTooltipHalfWidthPercent) + "%";
            }
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

            fValue = this._calculateHandlePosition(oTouch.pageX);
            aRange = this.getRange();
            aHandles = [this.getDomRef("handle1"), this.getDomRef("handle2")];
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

            // TODO: Remove or uncomment the code bellow when there's a decision for KH & Accessibility
            // oFocusItem = aHandles.length === 1 ? aHandles[0] : this.getDomRef("progress");
            oFocusItem = aHandles[0];
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

            this._updateTooltips(0, aNewRange, this._getPercentOfValue(aNewRange[0]));
            this._updateTooltips(1, aNewRange, this._getPercentOfValue(aNewRange[1]));
        };

        RangeSlider.prototype.onfocusin = function (oEvent) {
            var sCSSClass = this.getRenderer().CSS_CLASS;

            this.$("LeftTooltip").toggleClass(sCSSClass + "HandleTooltipShow");
            this.$("RightTooltip").toggleClass(sCSSClass + "HandleTooltipShow");
            // remember the initial focus range so when esc key is pressed we can return to it
            if (!this._hasFocus()) {
                this._aInitialFocusRange = Array.prototype.slice.call(this.getRange());
            }
        };

        RangeSlider.prototype.onfocusout = function (oEvent) {
            var sCSSClass = this.getRenderer().CSS_CLASS;

            this.$("LeftTooltip").toggleClass(sCSSClass + "HandleTooltipShow");
            this.$("RightTooltip").toggleClass(sCSSClass + "HandleTooltipShow");
        };

        RangeSlider.prototype._fireChangeAndLiveChange = function(oParam) {
            this.fireChange(oParam);
            this.fireLiveChange(oParam);
        };

        /* ----------------------------------------------------------- */
        /* Keyboard handling                                           */
        /* ----------------------------------------------------------- */

        /**
         * Increases the value of the RangeSlider's focused handle by the given <code>fIncrement</code>.
         *
         * @param {int} [fIncrement=1]
         * @param {jQuery.Event} oHandle The event object
         * @private
         */
        RangeSlider.prototype._increaseValueBy = function (fIncrement, oHandle) {
            var fNewValue,
                fMax = this.getMax(),
                aRange = this.getRange(),
                iIndex = this._getIndexOfHandle(oHandle);

            fNewValue = aRange[iIndex] + fIncrement;

            if (fNewValue < fMax) {
                this._updateHandle(oHandle, fNewValue);
            } else {
                this._updateHandle(oHandle, fMax);
            }

            this._fireChangeAndLiveChange({range: this.getRange()});
        };

        /**
         * Decreases the value of the RangeSlider's focused handle by the given <code>fDecrement</code>.
         *
         * @param {int} [fDecrement=1]
         * @param {jQuery.Event} oHandle The event object
         * @private
         */
        RangeSlider.prototype._decreaseValueBy = function (fDecrement, oHandle) {
            var fNewValue,
                fMin = this.getMin(),
                aRange = this.getRange(),
                iIndex = this._getIndexOfHandle(oHandle);

            fNewValue = aRange[iIndex] - fDecrement;

            if (fNewValue > fMin) {
                this._updateHandle(oHandle, fNewValue);
            } else {
                this._updateHandle(oHandle, fMin);
            }

            this._fireChangeAndLiveChange({range: this.getRange()});
        };

        /**
         * Handles the <code>sapincrease</code> event when right arrow or up arrow is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapincrease = function (oEvent) {
            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._increaseValueBy(this.getStep(), oEvent.target);
            }
        };

        /**
         * Handles the <code>sapincreasemodifiers</code> event when Ctrl + right arrow or up arrow are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapincreasemodifiers = function (oEvent) {

            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._increaseValueBy(this._getLongStep(), oEvent.target);
            }
        };

        /**
         * Handles the <code>sapdecrease</code> event when left arrow or down arrow are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapdecrease = function (oEvent) {
            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._decreaseValueBy(this.getStep(), oEvent.target);
            }
        };

        /**
         * Handles the <code>sapdecreasemodifiers</code> event when Ctrl + left or Ctrl + down keys are pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapdecreasemodifiers = function (oEvent) {
            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._decreaseValueBy(this._getLongStep(), oEvent.target);
            }
        };

        /**
         * Handles the <code>onsapplus</code> event when "+" is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapplus = function (oEvent) {
            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._increaseValueBy(this.getStep(), oEvent.target);
            }
        };

        /**
         * Handles the <code>sapminus</code> event when "-" is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapminus = function (oEvent) {
            // note: prevent document scrolling when arrow keys are pressed
            oEvent.preventDefault();

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            if (this.getEnabled()) {
                this._decreaseValueBy(this.getStep(), oEvent.target);
            }
        };

        /**
         * Handles the <code>sappageup</code> event when page up is pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsappageup = RangeSlider.prototype.onsapincreasemodifiers;

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
            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            // note: prevent document scrolling when Home key is pressed
            oEvent.preventDefault();

            if (this.getEnabled()) {
                this._updateHandle(oEvent.target, this.getMin());
            }

            this._fireChangeAndLiveChange({range: this.getRange()});
        };

        /**
         * Handles the <code>sapend</code> event when the End key pressed.
         *
         * @param {jQuery.Event} oEvent The event object.
         */
        RangeSlider.prototype.onsapend = function (oEvent) {

            // mark the event for components that needs to know if the event was handled
            oEvent.setMarked();

            // note: prevent document scrolling when End key is pressed
            oEvent.preventDefault();

            if (this.getEnabled()) {
                this._updateHandle(oEvent.target, this.getMax());
            }

            this._fireChangeAndLiveChange({range: this.getRange()});
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
