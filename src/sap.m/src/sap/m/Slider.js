/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'./library',
		'sap/ui/core/Control',
		'sap/ui/core/EnabledPropagator',
		'./Input',
		'sap/ui/core/InvisibleText',
		'sap/ui/core/library',
		'sap/ui/core/ResizeHandler'
	],
	function(jQuery, library, Control, EnabledPropagator, Input, InvisibleText, coreLibrary, ResizeHandler) {
		"use strict";

		// shortcut for sap.m.touch
		var touch = library.touch;

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		/**
		 * Constructor for a new <code>Slider</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * <strong><i>Overview</i></strong>
		 *
		 * A {@link sap.m.Slider} control represents a numerical range and a handle.
		 * The purpose of the control is to enable visual selection of a value in a continuous numerical range by moving an adjustable handle.
		 *
		 * <strong>Notes:</strong>
		 * <ul><li>Only horizontal sliders are possible. </li>
		 * <li>The handle can be moved in steps of predefined size. This is done with the <code>step</code> property. </li>
		 * <li>Setting the property <code>showAdvancedTooltips</code> shows an input field above the handle</li>
		 * <li>Setting the property <code>inputsAsTooltips</code> enables the user to enter a specific value in the handle's tooltip. </li>
		 * </ul>
		 * <strong><i>Structure</i></strong>
		 *
		 * The most important properties of the Slider are:
		 * <ul>
		 * <li> min - The minimum value of the slider range </li>
		 * <li> max - The maximum value of the slider range </li>
		 * <li> value - The current value of the slider</li>
		 * <li> progress - Determines if a progress bar will be shown on the slider range</li>
		 * <li> step - Determines the increments in which the slider will move</li>
		 * </ul>
		 * These properties determine the visualization of the tooltips:
		 * <ul>
		 * <li> showAdvancedTooltips - Determines if a tooltip should be displayed above the handle</li>
		 * <li> inputsAsTooltips - Determines if the tooltip displayed above the slider's handle should include an input field</li>
		 * </ul>
		 * <strong><i>Usage</i></strong>
		 *
		 * The most common usecase is to select values on a continuous numerical scale (e.g. temperature, volume, etc. ).
		 *
		 * <strong><i>Responsive Behavior</i></strong>
		 *
		 * The <code>sap.m.Slider</code> control adjusts to the size of its parent container by recalculating and resizing the width of the control.
		 * You can move the slider handle in several different ways:
		 * <ul>
		 * <li> Drag and drop to the desired value</li>
		 * <li> Click/tap on the range bar to move the handle to that location </li>
		 * <li> Enter the desired value in the input field (if available) </li>
		 * <li> Keyboard (Arrow keys, "+" and "-") </li>
		 * </ul>
		 *
		 * @extends sap.ui.core.Control
		 * @implements sap.ui.core.IFormContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.Slider
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Slider = Control.extend("sap.m.Slider", /** @lends sap.m.Slider.prototype */ { metadata: {

			interfaces: ["sap.ui.core.IFormContent"],
			library: "sap.m",
			properties: {

				/**
				 * Defines the width of the control.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },

				/**
				 * Indicates whether the user can change the value.
				 */
				enabled: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * The name property to be used in the HTML code for the slider (e.g. for HTML forms that send data to the server via submit).
				 */
				name: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * The minimum value.
				 */
				min: { type: "float", group: "Data", defaultValue: 0 },

				/**
				 * The maximum value.
				 */
				max: { type: "float", group: "Data", defaultValue: 100 },

				/**
				 * Define the amount of units to change the slider when adjusting by drag and drop.
				 *
				 * Defines the size of the slider's selection intervals. (e.g. min = 0, max = 10, step = 5 would result in possible selection of the values 0, 5, 10).
				 *
				 * The step must be positive, if a negative number is provided, the default value will be used instead.
				 * If the width of the slider converted to pixels is less than the range (max - min), the value will be rounded to multiples of the step size.
				 */
				step: { type: "float", group: "Data", defaultValue: 1 },

				/**
				 * Indicate whether a progress bar indicator is shown.
				 */
				progress: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Define the value.
				 *
				 * If the value is lower/higher than the allowed minimum/maximum, the value of the properties <code>min</code>/<code>max</code> are used instead.
				 */
				value: { type: "float", group: "Data", defaultValue: 0 },

				/**
				 * Indicate whether the handle tooltip is shown.
				 * @since 1.31
				 *
				 */
				showHandleTooltip: { type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * Indicate whether the handle's advanced tooltip is shown. <b>Note:</b> Setting this option to <code>true</code>
				 * will ignore the value set in <code>showHandleTooltips</code>. This will cause only the advanced tooltip to be shown.
				 * @since 1.42
				 *
				 */
				showAdvancedTooltip: { type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Indicates whether input fields should be used as tooltips for the handles. <b>Note:</b> Setting this option to <code>true</code>
				 * will only work if <code>showAdvancedTooltips</code> is set to <code>true</code>.
				 * @since 1.42
				 */
				inputsAsTooltips: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Enables tickmarks visualisation
				 *
				 * @since 1.44
				 */
				enableTickmarks: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			defaultAggregation: "scale",
			aggregations: {
				/**
				 * Scale for visualisation of tickmarks and labels
				 *
				 * @since 1.46
				 */
				scale: {type: "sap.m.IScale", multiple: false, singularName: "scale"}
			},
			associations: {

				/**
				 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
				 * @since 1.27.0
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			},
			events: {

				/**
				 * This event is triggered after the end user finishes interacting, if there is any change.
				 */
				change: {
					parameters: {

						/**
						 * The current value of the slider after a change.
						 */
						value: { type: "float" }
					}
				},

				/**
				 * This event is triggered during the dragging period, each time the slider value changes.
				 */
				liveChange: {
					parameters: {

						/**
						 * The current value of the slider after a live change.
						 */
						value: { type: "float" }
					}
				}
			},
			designTime: true
		}});

		//Defines object which contains constants used by the control.
		Slider.prototype._CONSTANTS = {
			CHARACTER_WIDTH_PX: 8,
			INPUT_STATE_NONE: "None",
			INPUT_STATE_ERROR: "Error",
			TICKMARKS: {
				MAX_POSSIBLE: 100,
				MIN_SIZE: {
					SMALL: 8,
					WITH_LABEL: 80
				}
			}
		};

		EnabledPropagator.apply(Slider.prototype, [true]);

		/* =========================================================== */
		/* Private methods and properties                              */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		/**
		 * Convert <code>fValue</code> for RTL-Mode.
		 *
		 * @param {float} fValue input value
		 * @private
		 * @returns {float} output value
		 */
		Slider.prototype._convertValueToRtlMode = function(fValue) {
			return this.getMax() - fValue + this.getMin();
		};

		/**
		 * Recalculate some styles.
		 *
		 * @private
		 */
		Slider.prototype._recalculateStyles = function() {
			var $Slider = this.$(),
				oHandle = this.$().find(".sapMSliderHandle").eq(0),
				fHandleWidthTotal = parseFloat(oHandle.css("width")) + 2 * parseFloat(oHandle.css("border-width")),
				fProgressParentWidth = parseFloat(this.$("progress").parent().css("width"));
			this._fSliderWidth = $Slider.width();
			this._fSliderPaddingLeft = parseFloat($Slider.css("padding-left"));
			this._fSliderOffsetLeft = $Slider.offset().left;
			this._fHandleWidth = this.$("handle").width();

			this._fTooltipHalfWidthPercent =
					((this._fSliderWidth - (this._fSliderWidth - (this._iLongestRangeTextWidth / 2 + this._CONSTANTS.CHARACTER_WIDTH_PX))) / this._fSliderWidth) * 100;

			this._fHandleWidthPercent = (fHandleWidthTotal / fProgressParentWidth * 100) / 2;

		};

		/**
		 * Checks whether the minimum is lower than or equal to the maximum and
		 * whether the step is bigger than slider range.
		 *
		 * @private
		 * @returns {boolean}
		 */
		Slider.prototype._validateProperties = function() {
			var fMin = this.getMin(),
				fMax = this.getMax(),
				fStep = this.getStep(),
				bMinbiggerThanMax = false,
				bError = false;

			// if the minimum is lower than or equal to the maximum, log a warning
			if (fMin >= fMax) {
				bMinbiggerThanMax = true;
				bError = true;
				jQuery.sap.log.warning("Warning: " + "Property wrong min: " + fMin + " >= max: " + fMax + " on ", this);
			}

			// if the step is negative or 0, set to 1 and log a warning
			if (fStep <= 0) {
				jQuery.sap.log.warning("Warning: " + "The step could not be negative on ", this);
			}

			// the step can't be bigger than slider range, log a warning
			if (fStep > (fMax - fMin) && !bMinbiggerThanMax) {
				bError = true;
				jQuery.sap.log.warning("Warning: " + "Property wrong step: " + fStep + " > max: " + fMax + " - " + "min: " + fMin + " on ", this);
			}

			return bError;
		};

		/**
		 * Calculate percentage.
		 *
		 * @param {float} fValue
		 * @private
		 * @returns {float} percent
		 */
		Slider.prototype._getPercentOfValue = function(fValue) {
			var fMin = this.getMin(),
				fPercent = ((fValue - fMin) / (this.getMax() - fMin)) * 100;

			return fPercent;
		};

		/**
		 * Get the value on certain position
		 *
		 * @param {float} fPercent
		 * @returns {number}
		 * @private
		 */
		Slider.prototype._getValueOfPercent = function(fPercent) {
			var fMin = this.getMin(),
				fValue = (fPercent * (this.getMax() - fMin) / 100) + fMin,
				sNewValueFixedPoint = this.toFixed(fValue, this.getDecimalPrecisionOfNumber(this.getStep()));

			return Number(sNewValueFixedPoint);
		};

		/**
		 * Checks whether the given step is of the proper type.
		 *
		 * @param {int} iStep
		 * @private
		 * @returns {int}
		 */
		Slider.prototype._validateStep = function(iStep) {
			if (typeof iStep === "undefined") {
				return 1;	// default n = 1
			}

			if (typeof iStep !== "number") {
				jQuery.sap.log.warning('Warning: "iStep" needs to be a number', this);
				return 0;
			}

			if ((Math.floor(iStep) === iStep) && isFinite(iStep)) {
				return iStep;
			}

			jQuery.sap.log.warning('Warning: "iStep" needs to be a finite interger', this);

			return 0;
		};

		/**
		 * Shows/hides tickmarks when some limitations are met.
		 *
		 * @private
		 */
		Slider.prototype._handleTickmarksResponsiveness = function () {
			var aLabelsInDOM, fOffsetLeftPct, fOffsetLeftPx, aHiddenLabels, oSiblingTickmark,
				oScale = this.getAggregation("scale"),
				aTickmarksInDOM = this.$().find(".sapMSliderTick"),
				iScaleWidth = this.$().find(".sapMSliderTickmarks").width(),
				bShowTickmarks = (iScaleWidth / aTickmarksInDOM.size()) >= this._CONSTANTS.TICKMARKS.MIN_SIZE.SMALL;

			//Small tickmarks should get hidden if their width is less than _SliderUtilities.CONSTANTS.TICKMARKS.MIN_SIZE.SMALL
			aTickmarksInDOM.css("visibility", bShowTickmarks ? '' /* visible */ : 'hidden');

			// Tickmarks with labels responsiveness
			aLabelsInDOM = this.$().find(".sapMSliderTickLabel");
			// The distance between the first and second label in % of Scale's width
			fOffsetLeftPct = parseFloat(aLabelsInDOM[1].style.left);
			// Convert to PX
			fOffsetLeftPx = iScaleWidth * fOffsetLeftPct / 100;
			// Get which labels should become hidden
			aHiddenLabels = oScale.getHiddenTickmarksLabels(iScaleWidth, aLabelsInDOM.size(), fOffsetLeftPx, this._CONSTANTS.TICKMARKS.MIN_SIZE.WITH_LABEL);

			aLabelsInDOM.each(function (iIndex, oElem) {
				// All the labels are positioned prior the corresponding tickmark, except for the last label.
				// That's why we're using the  previousSibling property
				oSiblingTickmark = oElem.nextSibling || oElem.previousSibling || {style: {visibility: null}};

				// As tickmarks are separated from the lables, we should ensure that if a label is visible,
				// the corresponding tickmark should be visible too and vice versa.
				if (aHiddenLabels[iIndex]) {
					oElem.style.display = "none";
					oSiblingTickmark.style.visibility = 'hidden'; //visible- inherit from CSS
				} else {
					oElem.style.display = ""; //inline-block- inherit from CSS
					oSiblingTickmark.style.visibility = ''; //visible- inherit from CSS
				}
			});
		};

		Slider.prototype.getDecimalPrecisionOfNumber = function(fValue) {

			// the value is an integer
			if (Math.floor(fValue) === fValue) {
				return 0;
			}

			var sValue = fValue.toString(),
				iIndexOfDot = sValue.indexOf("."),
				iIndexOfENotation = sValue.indexOf("e-"),
				bIndexOfENotationFound = iIndexOfENotation !== -1, // the "e-" is found in the value
				bIndexOfDotFound = iIndexOfDot !== -1; // the "." is found in the value

			// note: numbers such as 0.0000005 are represented using the e-notation
			// (for example, 0.0000005 becomes 5e-7)
			if (bIndexOfENotationFound) {

				// get the e-notation exponent e.g.: in the number 5e-7, the exponent is 7
				var iENotationExponent = +sValue.slice(iIndexOfENotation + 2);

				// If both, the e-notation and the dot character are found in the string representation of the number,
				// it means that the number has a format similar to e.g.: 1.15e-7.
				// In this case, the precision is calculated by adding the number of digits between the dot character
				// and the e character, e.g.: the number 1.15e-7 has a precision of 9
				if (bIndexOfDotFound) {
					return iENotationExponent + sValue.slice(iIndexOfDot + 1, iIndexOfENotation).length;
				}

				return iENotationExponent;
			}

			if (bIndexOfDotFound) {
				return sValue.length - iIndexOfDot - 1;
			}

			return 0;
		};

		/**
		 * Formats the <code>fNumber</code> using the fixed-point notation.
		 *
		 * <b>Note:</b> The number of digits to appear after the decimal point of the value
		 * should be between 0 and 20 to avoid a RangeError when calling the <code>Number.toFixed()</code> method.
		 *
		 * @param {float} fNumber The number to format.
		 * @param {int} [iDigits] The number of digits to appear after the decimal point.
		 * @returns {string} A string representation of <code>fNumber</code> that does not use exponential notation.
		 * @private
		 */
		Slider.prototype.toFixed = function(fNumber, iDigits) {

			if (iDigits === undefined) {
				iDigits = this.getDecimalPrecisionOfNumber(fNumber);
			}

			if (iDigits > 20) {
				iDigits = 20;
			} else if (iDigits < 0) {
				iDigits = 0;
			}

			// note: .toFixed() does not return a string when the number is negative
			return fNumber.toFixed(iDigits) + "";
		};

		Slider.prototype.setDomValue = function(sNewValue) {
			var oDomRef = this.getDomRef();

			if (!oDomRef) {
				return;
			}

			// note: round negative percentages to 0
			var sPerValue = Math.max(this._getPercentOfValue(+sNewValue), 0) + "%",
				oHandleDomRef = this.getDomRef("handle");

			if (!!this.getName()) {
				this.getDomRef("input").setAttribute("value", sNewValue);
			}

			if (this.getProgress()) {

				// update the progress indicator
				this.getDomRef("progress").style.width = sPerValue;
			}

			// update the position of the handle
			oHandleDomRef.style[sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left"] = sPerValue;

			// update the position of the advanced tooltip
			if (this.getShowAdvancedTooltip()) {
				this._updateAdvancedTooltipDom(sNewValue);
			}

			if (this.getShowHandleTooltip() && !this.getShowAdvancedTooltip()) {

				// update the tooltip
				oHandleDomRef.title = sNewValue;
			}

			// update the ARIA attribute value
			oHandleDomRef.setAttribute("aria-valuenow", sNewValue);
		};

		Slider.prototype._updateAdvancedTooltipDom = function (sNewValue) {

			var bInputTooltips = this.getInputsAsTooltips(),
				oTooltipsContainer = this.getDomRef("TooltipsContainer"),
				oTooltip = bInputTooltips && this._oInputTooltip ?
					this._oInputTooltip.tooltip : this.getDomRef("LeftTooltip"),
				sAdjustProperty = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";

			if (!bInputTooltips) {
				oTooltip.innerHTML = sNewValue;
			} else if (bInputTooltips && oTooltip.getValue() !== sNewValue) {
				oTooltip.setValueState(this._CONSTANTS.INPUT_STATE_NONE);
				oTooltip.setValue(sNewValue);
				oTooltip.$("inner").attr("value", sNewValue);
			}

			oTooltipsContainer.style[sAdjustProperty] = this._getTooltipPosition(sNewValue);
		};

		Slider.prototype._getTooltipPosition = function (sNewValue) {
			var fPerValue = this._getPercentOfValue(+sNewValue);

			if (fPerValue < this._fHandleWidthPercent / 2) {
				return -this._fHandleWidthPercent  + "%";
			} else if (fPerValue > 100 - this._fTooltipHalfWidthPercent + this._fHandleWidthPercent) {
				return (100 - this._fTooltipHalfWidthPercent * 2 + this._fHandleWidthPercent) + "%";
			} else {
				return fPerValue - this._fTooltipHalfWidthPercent + "%";
			}
		};

		/**
		 * Gets the closest handle to a <code>touchstart</code> event.
		 *
		 * @returns {object} The nearest handle DOM reference.
		 */
		Slider.prototype.getClosestHandleDomRef = function() {

			// there is only one handle, it is always the nearest
			return this.getDomRef("handle");
		};

		/**
		 * Increase the value of the slider by the given <code>fIncrement</code>.
		 *
		 * @param {int} [fIncrement=1]
		 * @private
		 */
		Slider.prototype._increaseValueBy = function(fIncrement) {
			var fValue,
				fNewValue;

			if (this.getEnabled()) {
				fValue = this.getValue();
				this.setValue(fValue + (fIncrement || 1));
				fNewValue = this.getValue();

				if (fValue < fNewValue) {
					this._fireChangeAndLiveChange({ value: fNewValue });
				}
			}
		};

		/**
		 * Decrease the value of the slider by the given <code>fDecrement</code>.
		 *
		 * @param {int} [fDecrement=1]
		 * @private
		 */
		Slider.prototype._decreaseValueBy = function(fDecrement) {
			var fValue,
				fNewValue;

			if (this.getEnabled()) {
				fValue = this.getValue();
				this.setValue(fValue - (fDecrement || 1));
				fNewValue = this.getValue();

				if (fValue > fNewValue) {
					this._fireChangeAndLiveChange({ value: fNewValue });
				}
			}
		};

		Slider.prototype._getLongStep = function() {
			var fMin = this.getMin(),
				fMax = this.getMax(),
				fStep = this.getStep(),
				fLongStep = (fMax - fMin) / 10,
				iStepsFromMinToMax = (fMax - fMin) / fStep;

			return iStepsFromMinToMax > 10 ? fLongStep : fStep;
		};

		Slider.prototype._fireChangeAndLiveChange = function(oParam) {
			this.fireChange(oParam);
			this.fireLiveChange(oParam);
		};

		Slider.prototype._hasFocus = function() {
			return document.activeElement === this.getFocusDomRef();
		};

		/**
		 * Creates an input field that will be used in slider's tooltip
		 *
		 * @param {String} sSuffix Suffix to append to the ID
		 * @param {Object} oAriaLabel Control that will be used as reference for the screen reader
		 * @returns {Object} sap.m.Input with all needed events attached and properties filled
		 * @private
		 */
		Slider.prototype._createInputField = function (sSuffix, oAriaLabel) {
			var oInput = new Input(this.getId() + "-" + sSuffix, {
				value: this.getMin(),
				width: this._iLongestRangeTextWidth + (2 * this._CONSTANTS.CHARACTER_WIDTH_PX) /*16 px in paddings for the input*/ + "px",
				type: "Number",
				textAlign: TextAlign.Center,
				ariaLabelledBy: oAriaLabel
			});

			oInput.attachChange(this._handleInputChange.bind(this, oInput));
			oInput.addEventDelegate({onsapdown: this._inputArrowDown}, this);
			oInput.addEventDelegate({onsapup: this._inputArrowUp}, this);

			oInput.addEventDelegate({
				onfocusout: function (oEvent) {
					if (oEvent.target.value !== undefined) {
						oEvent.srcControl.fireChange({value: oEvent.target.value});
					}
				}
			});

			return oInput;
		};

		Slider.prototype._inputArrowDown = function(oEvent) {
			var oModifiedEvent = oEvent;
			oModifiedEvent.srcControl = this;

			oEvent.preventDefault();
			oEvent.stopPropagation();

			this.onsapdecrease(oModifiedEvent);
		};

		Slider.prototype._inputArrowUp = function(oEvent) {
			var oModifiedEvent = oEvent;
			oModifiedEvent.srcControl = this;

			oEvent.preventDefault();
			oEvent.stopPropagation();

			this.onsapincrease(oModifiedEvent);
		};

		Slider.prototype._handleInputChange = function (oInput, oEvent) {
			var newValue = parseFloat(oEvent.getParameter("value"));

			if (oEvent.getParameter("value") == "" || isNaN(newValue) || newValue < this.getMin() || newValue > this.getMax()) {
				oInput.setValueState(this._CONSTANTS.INPUT_STATE_ERROR);
				return;
			}

			oInput.setValueState(this._CONSTANTS.INPUT_STATE_NONE);

			this.setValue(newValue);

			this._fireChangeAndLiveChange({value: this.getValue()});
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		Slider.prototype.init = function() {

			// used to track the id of touch points
			this._iActiveTouchId = -1;

			this._bSetValueFirstCall = true;

			// the width of the longest range value, which determines the width of the tooltips shown above the handles
			this._iLongestRangeTextWidth = 0;

			// half the width of the tooltip in percent of the total slider width
			this._fTooltipHalfWidthPercent = 0;

			// width of the handler in percent of the progress area width
			this._fHandleWidthPercent = 0;

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		};

		Slider.prototype.exit = function () {
			if (this._oInputTooltip) {
				this._oInputTooltip.label.destroy();
				this._oInputTooltip.label = null;

				this._oInputTooltip.tooltip.destroy();
				this._oInputTooltip.tooltip = null;

				this._oInputTooltip = null;
			}

			if (this._oResourceBundle) {
				this._oResourceBundle = null;
			}

			if (this._parentResizeHandler) {
				ResizeHandler.deregister(this._parentResizeHandler);
				this._parentResizeHandler = null;
			}
		};

		Slider.prototype.onBeforeRendering = function() {
			var bError = this._validateProperties(),
				aAbsRange = [Math.abs(this.getMin()), Math.abs(this.getMax())],
				iRangeIndex = aAbsRange[0] > aAbsRange[1] ? 0 : 1;

			// update the value only if there aren't errors
			if (!bError) {
				this.setValue(this.getValue());

				// this is the current % value of the progress bar
				// note: round negative percentages to 0
				this._sProgressValue = Math.max(this._getPercentOfValue(this.getValue()), 0) + "%";
			}

			if (!this._hasFocus()) {
				this._fInitialFocusValue = this.getValue();
			}

			if (this.getShowAdvancedTooltip()) {
				this._iLongestRangeTextWidth = ((aAbsRange[iRangeIndex].toString()).length
					+ this.getDecimalPrecisionOfNumber(this.getStep()) + 1) * this._CONSTANTS.CHARACTER_WIDTH_PX;
			}

			if (this.getInputsAsTooltips() && !this._oInputTooltip) {
				var oSliderLabel = new InvisibleText({text: this._oResourceBundle.getText("SLIDER_HANDLE")});
				this._oInputTooltip = {
					tooltip: this._createInputField("LeftTooltip", oSliderLabel),
					label: oSliderLabel
				};
			}

			// For backwards compatibility when tickmarks are enabled, should be visible
			if (this.getEnableTickmarks() && !this.getAggregation("scale")) {
				this.setAggregation("scale", new sap.m.ResponsiveScale());
			}
		};

		Slider.prototype.onAfterRendering = function () {
			if (this.getShowAdvancedTooltip()) {
				this._recalculateStyles();
				this._updateAdvancedTooltipDom(this.getValue());
			}

			if (this.getEnableTickmarks() && !this._parentResizeHandler) {
				jQuery.sap.delayedCall(0, this, function () {
					this._parentResizeHandler = ResizeHandler.register(this, this._handleTickmarksResponsiveness.bind(this));
				});
			} else if (this.getEnableTickmarks()) {
				jQuery.sap.delayedCall(0, this, function () {
					this._handleTickmarksResponsiveness();
				});
			}
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handles the <code>touchstart</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.ontouchstart = function(oEvent) {
			var fMin = this.getMin(),
				oTouch = oEvent.targetTouches[0],
				fNewValue,
				CSS_CLASS = this.getRenderer().CSS_CLASS,
				sEventNamespace = "." + CSS_CLASS;

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();
			// Should be prevent as in Safari while dragging the handle everything else gets selection.
			// As part of the Slider, Inputs in the tooltips should be excluded
			if (oEvent.target.className.indexOf("sapMInput") === -1) {
				oEvent.preventDefault();
			}

			// only process single touches
			if (touch.countContained(oEvent.touches, this.getId()) > 1 ||
				!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button ||

				// process the event if the target is not a composite control e.g.: a tooltip
				(oEvent.srcControl !== this)) {

				return;
			}

			// track the id of the first active touch point
			this._iActiveTouchId = oTouch.identifier;

			// registers event listeners
			jQuery(document).on("touchend" + sEventNamespace + " touchcancel" + sEventNamespace + " mouseup" + sEventNamespace, this._ontouchend.bind(this))
							.on(oEvent.originalEvent.type === "touchstart" ? "touchmove" + sEventNamespace : "touchmove" + sEventNamespace + " mousemove" + sEventNamespace, this._ontouchmove.bind(this));

			var oNearestHandleDomRef = this.getClosestHandleDomRef();

			if (oTouch.target !== oNearestHandleDomRef) {

				// set the focus to the nearest slider handle
				jQuery.sap.delayedCall(0, oNearestHandleDomRef, "focus");
			}

			if (!this._hasFocus()) {
				this._fInitialFocusValue = this.getValue();
			}

			// recalculate some styles,
			// those values may change when the device orientation changes
			this._recalculateStyles();
			this._fDiffX = this._fSliderPaddingLeft;
			this._fInitialValue = this.getValue();

			// add active state
			this.$("inner").addClass(CSS_CLASS + "Pressed");

			if (oTouch.target === this.getDomRef("handle")) {

				this._fDiffX = (oTouch.pageX - jQuery(oNearestHandleDomRef).offset().left) + this._fSliderPaddingLeft - (this._fHandleWidth / 2);
			} else {

				fNewValue = (((oTouch.pageX - this._fSliderPaddingLeft - this._fSliderOffsetLeft) / this._fSliderWidth) * (this.getMax() - fMin)) +  fMin;

				if (sap.ui.getCore().getConfiguration().getRTL()) {
					fNewValue = this._convertValueToRtlMode(fNewValue);
				}

				// update the value
				this.setValue(fNewValue);

				// new validated value
				fNewValue = this.getValue();

				if (this._fInitialValue !== fNewValue) {
					this.fireLiveChange({ value: fNewValue });
				}
			}
		};

		/**
		 * Handles the <code>touchmove</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Slider.prototype._ontouchmove = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent native document scrolling
			oEvent.preventDefault();

			// suppress the emulated mouse event from touch interfaces
			if (oEvent.isMarked("delayedMouseEvent") ||
				!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button) {

				return;
			}

			var fMin = this.getMin(),
				fValue = this.getValue(),
				oTouch = touch.find(oEvent.changedTouches, this._iActiveTouchId),	// find the active touch point
				iPageX = oTouch ? oTouch.pageX : oEvent.pageX,
				fNewValue = (((iPageX - this._fDiffX - this._fSliderOffsetLeft) / this._fSliderWidth) * (this.getMax() - fMin)) +  fMin;

			// RTL mirror
			if (sap.ui.getCore().getConfiguration().getRTL()) {
				fNewValue = this._convertValueToRtlMode(fNewValue);
			}

			this.setValue(fNewValue);

			// validated value
			fNewValue = this.getValue();

			if (fValue !== fNewValue) {
				this.fireLiveChange({ value: fNewValue });
			}
		};

		/**
		 * Handles the <code>touchend</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Slider.prototype._ontouchend = function(oEvent) {
			var CSS_CLASS = this.getRenderer().CSS_CLASS,
				sEventNamespace = "." + CSS_CLASS;

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// suppress the emulated mouse event from touch interfaces
			if (oEvent.isMarked("delayedMouseEvent") ||
				!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button) {

				return;
			}

			// removes the registered event listeners
			jQuery(document).off(sEventNamespace);

			var fValue = this.getValue();

			// remove the active state
			this.$("inner").removeClass(CSS_CLASS + "Pressed");

			if (this._fInitialValue !== fValue) {
				this.fireChange({ value: fValue });
			}
		};

		/**
		 * Handles the <code>focusin</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onfocusin = function(oEvent) {
			this.$("TooltipsContainer").addClass(this.getRenderer().CSS_CLASS + "HandleTooltipsShow");

			// remember the initial focus range so when esc key is pressed we can return to it
			if (!this._hasFocus()) {
				this._fInitialFocusValue = this.getValue();
			}
		};

		/**
		 * Handles the <code>focusout</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onfocusout = function(oEvent) {

			if (this.getInputsAsTooltips() && jQuery.contains(this.getDomRef(), oEvent.relatedTarget)) {
				return;
			}

			this.$("TooltipsContainer").removeClass(this.getRenderer().CSS_CLASS + "HandleTooltipsShow");
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handles the <code>sapincrease</code> event when right arrow or up arrow is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapincrease = function(oEvent) {
			var fValue,
				fNewValue;

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this) {
				return;
			}

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled()) {
				fValue = this.getValue();
				this.stepUp(1);
				fNewValue = this.getValue();

				if (fValue < fNewValue) {
					this._fireChangeAndLiveChange({ value: fNewValue });
				}
			}
		};

		/**
		 * Handles the <code>sapincreasemodifiers</code> event when Ctrl + right arrow or up arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapincreasemodifiers = function(oEvent) {

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this || oEvent.altKey) {
				return;
			}

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();
			oEvent.stopPropagation();
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			this._increaseValueBy(this._getLongStep());
		};

		/**
		 * Handles the <code>sapdecrease</code> event when left arrow or down arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapdecrease = function(oEvent) {
			var fValue,
				fNewValue;

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this) {
				return;
			}

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled()) {
				fValue = this.getValue();
				this.stepDown(1);
				fNewValue = this.getValue();

				if (fValue > fNewValue) {
					this._fireChangeAndLiveChange({ value: fNewValue });
				}
			}
		};

		/**
		 * Handles the <code>sapdecreasemodifiers</code> event when Ctrl + left or Ctrl + down keys are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapdecreasemodifiers = function(oEvent) {

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this || oEvent.altKey) {
				return;
			}

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();
			oEvent.stopPropagation();
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			this._decreaseValueBy(this._getLongStep());
		};

		/**
		 * Handles the <code>onsapplus</code> event when "+" is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapplus = function(oEvent) {
			var fValue,
				fNewValue;

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled()) {

				fValue = this.getValue();
				this.stepUp(1);
				fNewValue = this.getValue();

				if (fValue < fNewValue) {
					this._fireChangeAndLiveChange({ value: fNewValue });
				}
			}
		};

		/**
		 * Handles the <code>sapminus</code> event when "-" is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapminus = function(oEvent) {
			var fValue,
				fNewValue;

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			if (this.getEnabled()) {

				fValue = this.getValue();
				this.stepDown(1);
				fNewValue = this.getValue();

				if (fValue > fNewValue) {
					this._fireChangeAndLiveChange({ value: fNewValue });
				}
			}
		};

		/**
		 * Handles the <code>sappageup</code> event when page up is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsappageup = Slider.prototype.onsapincreasemodifiers;

		/**
		 * Handles the <code>sappagedown</code> event when when page down is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsappagedown = Slider.prototype.onsapdecreasemodifiers;

		/**
		 * Handles the <code>saphome</code> event when home key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsaphome = function(oEvent) {

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var fMin = this.getMin();

			// note: prevent document scrolling when Home key is pressed
			oEvent.preventDefault();

			if (this.getEnabled() && this.getValue() > fMin) {
				this.setValue(fMin);
				this._fireChangeAndLiveChange({ value: fMin });
			}
		};

		/**
		 * Handles the <code>sapend</code> event when the End key pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapend = function(oEvent) {

			// process the event if the target is not a composite control e.g.: a tooltip
			if (oEvent.srcControl !== this) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var fMax = this.getMax();

			// note: prevent document scrolling when End key is pressed
			oEvent.preventDefault();

			if (this.getEnabled() && this.getValue() < fMax) {
				this.setValue(fMax);
				this._fireChangeAndLiveChange({ value: fMax });
			}
		};

		/**
		 * Handles the <code>saptabnext</code> event when the tab key is pressed.
		 *
		 */
		Slider.prototype.onsaptabnext = function() {
			this._fInitialFocusValue = this.getValue();
		};

		/**
		 * Handles the <code>saptabprevious</code> event when the shift + tab keys are pressed.
		 *
		 */
		Slider.prototype.onsaptabprevious = function() {
			this._fInitialFocusValue = this.getValue();
		};

		/**
		 * Handles the <code>sapescape</code> event when escape key is pressed.
		 *
		 */
		Slider.prototype.onsapescape = function() {

			// reset the slider back to the value
			// which it had when it got the focus
			this.setValue(this._fInitialFocusValue);
		};

		/* =========================================================== */
		/* API method                                                  */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Public methods                                              */
		/* ----------------------------------------------------------- */

		Slider.prototype.getFocusDomRef = function() {
			return this.getDomRef("handle");
		};

		/**
		 * Increments the value by multiplying the <code>step</code> with the given parameter.
		 *
		 * @param {int} [iStep=1] The number of steps the slider goes up.
		 * @returns {sap.m.Slider} <code>this</code> to allow method chaining.
		 * @type sap.m.Slider
		 * @public
		 */
		Slider.prototype.stepUp = function(iStep) {
			return this.setValue(this.getValue() + (this._validateStep(iStep) * this.getStep()), { snapValue: false });
		};

		/**
		 * Decrements the value by multiplying the step the <code>step</code> with the given parameter.
		 *
		 * @param {int} [iStep=1] The number of steps the slider goes down.
		 * @returns {sap.m.Slider} <code>this</code> to allow method chaining.
		 * @type sap.m.Slider
		 * @public
		 */
		Slider.prototype.stepDown = function(iStep) {
			return this.setValue(this.getValue() - (this._validateStep(iStep) * this.getStep()), { snapValue: false });
		};

		/**
		 * Sets the property <code>value</code>.
		 *
		 * Default value is <code>0</code>.
		 *
		 * @param {float} fNewValue new value for property <code>value</code>.
		 * @param {object} mOptions
		 * @returns {sap.m.Slider} <code>this</code> to allow method chaining.
		 * @public
		 */
		Slider.prototype.setValue = function(fNewValue, mOptions) {

			// note: sometimes the setValue() method is call before the step, max and min
			// properties are set, in this case the value should not be adjusted
			if (this._bSetValueFirstCall) {
				this._bSetValueFirstCall = false;
				return this.setProperty("value", fNewValue, true);
			}

			var fMin = this.getMin(),
				fMax = this.getMax(),
				fStep = this.getStep(),
				fValue = this.getValue(),
				sNewValueFixedPoint,
				bSnapValue = true,
				fModStepVal;

			if (mOptions) {
				bSnapValue = !!mOptions.snapValue;
			}

			// validate the new value before arithmetic calculations
			if (typeof fNewValue !== "number" || !isFinite(fNewValue)) {
				return this;
			}

			fModStepVal = Math.abs((fNewValue - fMin) % fStep);

			if (bSnapValue && (fModStepVal !== 0) /* division with remainder */) {

				// snap the new value to the nearest step
				fNewValue = fModStepVal * 2 >= fStep ? fNewValue + fStep - fModStepVal : fNewValue - fModStepVal;
			}

			// constrain the new value between the minimum and maximum
			if (fNewValue < fMin) {
				fNewValue = fMin;
			} else if (fNewValue > fMax) {
				fNewValue = fMax;
			}

			sNewValueFixedPoint = this.toFixed(fNewValue, this.getDecimalPrecisionOfNumber(fStep));
			fNewValue = Number(sNewValueFixedPoint);

			// update the value and suppress re-rendering
			this.setProperty("value", fNewValue, true);

			// update the value in DOM only when it has changed
			if (fValue !== this.getValue()) {
				this.setDomValue(sNewValueFixedPoint);
			}

			return this;
		};

		return Slider;
	});