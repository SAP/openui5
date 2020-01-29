/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/library',
	'sap/ui/core/ResizeHandler',
	'sap/base/Log',
	'./library',
	'./SliderTooltipContainer',
	'./SliderTooltip',
	'./SliderUtilities',
	'./SliderRenderer',
	'./ResponsiveScale',
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
],
function(
	Control,
	EnabledPropagator,
	InvisibleText,
	coreLibrary,
	ResizeHandler,
	log,
	library,
	SliderTooltipContainer,
	SliderTooltip,
	SliderUtilities,
	SliderRenderer,
	ResponsiveScale,
	jQuery,
	KeyCodes
) {
		"use strict";

		// shortcut for sap.m.touch
		var touch = library.touch;

		/**
		 * Constructor for a new <code>Slider</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * <h3>Overview</h3>
		 *
		 * A {@link sap.m.Slider} control represents a numerical range and a handle.
		 * The purpose of the control is to enable visual selection of a value in a continuous numerical range by moving an adjustable handle.
		 *
		 * <b>Notes:</b>
		 * <ul><li>Only horizontal sliders are possible. </li>
		 * <li>The handle can be moved in steps of predefined size. This is done with the <code>step</code> property. </li>
		 * <li>Setting the property <code>showAdvancedTooltip</code> shows an input field above the handle</li>
		 * <li>Setting the property <code>inputsAsTooltips</code> enables the user to enter a specific value in the handle's tooltip. </li>
		 * </ul>
		 *
		 * <h3>Structure</h3>
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
		 * <li> <code>showAdvancedTooltip</code> - Determines if a tooltip should be displayed above the handle</li>
		 * <li> <code>inputsAsTooltips</code> - Determines if the tooltip displayed above the slider's handle should include an input field</li>
		 * </ul>
		 *
		 * <h3>Usage</h3>
		 *
		 * The most common usecase is to select values on a continuous numerical scale (e.g. temperature, volume, etc. ).
		 *
		 * <h3>Responsive Behavior</h3>
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
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/slider/ Slider}
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
				 * will ignore the value set in <code>showHandleTooltip</code>. This will cause only the advanced tooltip to be shown.
				 * @since 1.42
				 *
				 */
				showAdvancedTooltip: { type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Indicates whether input fields should be used as tooltips for the handles. <b>Note:</b> Setting this option to <code>true</code>
				 * will only work if <code>showAdvancedTooltip</code> is set to <code>true</code>.
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
				 * A Container popup that renders SliderTooltips
				 * The actual type should be sap.m.SliderTooltipContainer
				 *
				 * @since 1.54
				 */
				_tooltipContainer: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },
				/**
				 * Scale for visualisation of tickmarks and labels
				 *
				 * @since 1.46
				 */
				scale: { type: "sap.m.IScale", multiple: false, singularName: "scale" },
				/**
				 * Default scale for visualisation of tickmarks, if scale aggregation is not provided
				 *
				 * @since 1.56
				 */
				_defaultScale: { type: "sap.m.ResponsiveScale", multiple: false, visibility: "hidden" },

				/**
				 * Multiple Aggregation for Tooltips
				 *
				 * @since 1.56
				 */
				_defaultTooltips: { type: "sap.m.SliderTooltipBase", multiple: true, visibility: "hidden" },

				/**
				 * Aggregation for user-defined tooltips.
				 * <b>Note:</b> In case of Slider, only the first tooltip of the aggregation is used. In the RangeSlider case - the first two.
				 * If no custom tooltips are provided, the default are used
				 *
				 * @since 1.56
				 */
				customTooltips: { type: "sap.m.SliderTooltipBase", multiple: true },

				/**
				 * Invisible text for handles and progress announcement
				 *
				 * @since 1.54
				 */
				_handlesLabels: { type: "sap.ui.core.InvisibleText", multiple: true, visibility: "hidden" }
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
			designtime: "sap/m/designtime/Slider.designtime"
		}});

		EnabledPropagator.apply(Slider.prototype, [true]);

		/* =========================================================== */
		/* Private methods and properties                              */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		/**
		 * Returns the scale control that is used when tickmarks are enabled
		 *
		 * @private
		 * @returns {sap.m.IScale|undefined} The scale that is used or undefined,
		 * if tickmarks are not enabled
		 */
		Slider.prototype._getUsedScale = function () {
			if (!this.getEnableTickmarks()) {
				return;
			}

			return this.getAggregation('scale') || this.getAggregation('_defaultScale');
		};

		Slider.prototype._syncScaleUsage = function () {
			var bEnabledTickmarks = this.getEnableTickmarks(),
				oUserDefinedScale = this.getAggregation('scale'),
				oDefaultScale = this.getAggregation("_defaultScale");


			// if the default scale was set, but later on the user adds a scale
			// or set the enableTickmarks property to false, we should destroy the default one
			if ((oDefaultScale && !bEnabledTickmarks) || (oUserDefinedScale && oDefaultScale)) {
				this.destroyAggregation("_defaultScale", true);
			}

			// if there is no scale set, fall back to the default scale
			if (bEnabledTickmarks && !oUserDefinedScale && !oDefaultScale) {
				this.setAggregation("_defaultScale", new ResponsiveScale(), true);
			}
		};

		Slider.prototype._showTooltipsIfNeeded = function () {
			if (this.getShowAdvancedTooltip()) {
				this.getAggregation("_tooltipContainer").show(this);
				this.updateAdvancedTooltipDom(this.getValue());
			}
		};

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
			var $Slider = this.$();

			this._fSliderWidth = $Slider.width();
			this._fSliderPaddingLeft = parseFloat($Slider.css("padding-left"));
			this._fSliderOffsetLeft = $Slider.offset().left;
			this._fHandleWidth = this.$("handle").width();
		};

		/**
		 * Checks whether the minimum is lower than or equal to the maximum and
		 * whether the step is bigger than slider range.
		 *
		 * @private
		 * @returns {boolean} Whether the properties are correctly set
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
				log.warning("Warning: " + "Property wrong min: " + fMin + " >= max: " + fMax + " on ", this);
			}

			// if the step is negative or 0, set to 1 and log a warning
			if (fStep <= 0) {
				log.warning("Warning: " + "The step could not be negative on ", this);
			}

			// the step can't be bigger than slider range, log a warning
			if (fStep > (fMax - fMin) && !bMinbiggerThanMax) {
				bError = true;
				log.warning("Warning: " + "Property wrong step: " + fStep + " > max: " + fMax + " - " + "min: " + fMin + " on ", this);
			}

			return bError;
		};

		/**
		 * Calculate percentage.
		 *
		 * @param {float} fValue The value
		 * @private
		 * @returns {float} percent The corresponding percentage
		 */
		Slider.prototype._getPercentOfValue = function(fValue) {
			return SliderUtilities.getPercentOfValue(fValue, this.getMin(), this.getMax());
		};

		/**
		 * Get the value on certain position
		 *
		 * @param {float} fPercent The percent value
		 * @returns {number} The position value
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
		 * @param {int} iStep The step size
		 * @private
		 * @returns {int} The validated step size
		 */
		Slider.prototype._validateStep = function(iStep) {
			if (typeof iStep === "undefined") {
				return 1;	// default n = 1
			}

			if (typeof iStep !== "number") {
				log.warning('Warning: "iStep" needs to be a number', this);
				return 0;
			}

			if ((Math.floor(iStep) === iStep) && isFinite(iStep)) {
				return iStep;
			}

			log.warning('Warning: "iStep" needs to be a finite interger', this);

			return 0;
		};

		/**
		 * Handles resize of Slider.
		 *
		 * @private
		 */
		Slider.prototype._handleSliderResize = function (oEvent) {
			var oScale = this._getUsedScale();

			if (this.getEnableTickmarks() && oScale && oScale.handleResize) {
				oScale.handleResize(oEvent);
			}

			if (this.getShowAdvancedTooltip()) {
				this._handleTooltipContainerResponsiveness();
			}
		};

		Slider.prototype._handleTooltipContainerResponsiveness = function () {
			this.getAggregation("_tooltipContainer").setWidth(this.$().width() + "px");
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
			var oDomRef = this.getDomRef(),
				sScaleLabel = this._formatValueByCustomElement(sNewValue),
				oTooltipContainer = this.getAggregation("_tooltipContainer");

			if (!oDomRef) {
				return;
			}

			// note: round negative percentages to 0
			var sPerValue = Math.max(this._getPercentOfValue(+sNewValue), 0) + "%",
				oHandleDomRef = this.getDomRef("handle");

			if (!!this.getName()) {
				this.getDomRef("input").setAttribute("value", sScaleLabel);
			}

			if (this.getProgress()) {

				// update the progress indicator
				this.getDomRef("progress").style.width = sPerValue;
			}

			// update the position of the handle
			oHandleDomRef.style[sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left"] = sPerValue;

			// update the position of the advanced tooltip
			if (this.getShowAdvancedTooltip() && oTooltipContainer.getDomRef()) {
				this.updateAdvancedTooltipDom(sNewValue);
			}

			if (this.getShowHandleTooltip() && !this.getShowAdvancedTooltip()) {

				// update the tooltip
				oHandleDomRef.title = sScaleLabel;
			}

			this._updateHandleAriaAttributeValues(oHandleDomRef, sNewValue, sScaleLabel);
		};

		/**
		 * Updates the aria-valuenow and aria-valuetext.
		 *
		 * @param {object} oHandleDomRef The DOM reference of the slider handle
		 * @param {string} sValue The current value
		 * @param {string} sScaleLabel The label of the tickmark label
		 * @private
		 */
		Slider.prototype._updateHandleAriaAttributeValues = function (oHandleDomRef, sValue, sScaleLabel) {
			// update the ARIA attribute value
			if (this._isElementsFormatterNotNumerical(sValue)) {
				oHandleDomRef.setAttribute("aria-valuenow", sValue);
				oHandleDomRef.setAttribute("aria-valuetext", sScaleLabel);
			} else {
				oHandleDomRef.setAttribute("aria-valuenow", sScaleLabel);
				oHandleDomRef.removeAttribute("aria-valuetext");
			}
		};

		/**
		 * Format the value from the Scale or Tooltip callback.
		 *
		 * As the scale might want to display something else, but not numbers, we need to ensure that the format
		 * would be populated to the relevant parts of the Slider:
		 * - Handle tooltips
		 * - Accessibility values
		 * - Advanced tooltips are not taken into consideration as they need to implement their own formatting function.
		 * That way we'd keep components as loose as possible.
		 *
		 * @param {float} fValue The value to be formatted
		 * @param {string} sPriority Default priority is:
		 *    1) Float value from the Slider,
		 *    2) Scale formatter,
		 *    3) Tooltips formatter so #3 always overwrites the rest.
		 *    Priorities could be changed, so some formatter to prevail the others. Possible values are:
		 *    - 'slider' (uses default value from the Slider),
		 *    - 'scale' (use the Scale formatter),
		 *    - null/undefined (use the Tooltips' formatter)
		 *
		 * @returns {string} The formatted value
		 * @private
		 */
		Slider.prototype._formatValueByCustomElement = function (fValue, sPriority) {
			var oScale = this._getUsedScale(),
				oTooltip = this.getUsedTooltips()[0],
				sFormattedValue = "" + fValue;

			if (sPriority === 'slider') {
				return sFormattedValue;
			}

			// If there's a labelling for the scale, use it
			if (this.getEnableTickmarks() && oScale && oScale.getLabel) {
				sFormattedValue = "" + oScale.getLabel(fValue, this);
			}

			if (sPriority === 'scale') {
				return sFormattedValue;
			}

			// If there's a labelling for the tooltips, use it and overwrite previous
			if (this.getShowAdvancedTooltip() && oTooltip && oTooltip.getLabel) {
				sFormattedValue = "" + oTooltip.getLabel(fValue, this);
			}

			return sFormattedValue;
		};

		/**
		 * Checks whether the scale has a numerical label defined for a certain value
		 * of the slider.
		 *
		 * @param {float} fValue
		 * @returns {boolean} Returns true, when the scale has a not numerical label defined.
		 * @private
		 */
		Slider.prototype._isElementsFormatterNotNumerical = function (fValue) {
			var vValue = this._formatValueByCustomElement(fValue);
			return isNaN(vValue);
		};

		/**
		 * Updates value of the advanced tooltip.
		 *
		 * @param {string} sNewValue The new value
		 * @protected
		 */
		Slider.prototype.updateAdvancedTooltipDom = function (sNewValue) {
			var aTooltips = this.getUsedTooltips();

			this.updateTooltipsPositionAndState(aTooltips[0], parseFloat(sNewValue));
		};

		/**
		 * Gets the tooltips that should be shown.
		 * Returns custom tooltips if provided. Otherwise - default tooltips
		 *
		 * @protected
		 * @returns {sap.m.SliderTooltipBase[]} SliderTooltipBase instances.
		 */
		Slider.prototype.getUsedTooltips = function () {
			var aCustomTooltips = this.getCustomTooltips(),
				aDefaultTooltips = this.getAggregation("_defaultTooltips") || [];

			return aCustomTooltips.length ? aCustomTooltips : aDefaultTooltips;
		};

		/**
		 * Updates values of Slider and repositions tooltips.
		 *
		 * @param {string} oTooltip Tooltip to be changed
		 * @param {float} fValue New value of the Slider
		 * @private
		 * @ui5-restricted sap.m.SliderTooltipBase
		 */
		Slider.prototype.updateTooltipsPositionAndState = function (oTooltip, fValue) {
			var oTooltipsContainer = this.getAggregation("_tooltipContainer");

			oTooltip.setValue(fValue);
			oTooltipsContainer.repositionTooltips(this.getMin(), this.getMax());
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
		 * @param {int} fIncrement The increment size
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
		 * @param {int} fDecrement The decrement size
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

		/**
		 * Handles change of Tooltip's inputs.
		 *
		 * @param {jQuery.Event} oEvent
		 * @protected
		 */
		Slider.prototype.handleTooltipChange = function (oEvent) {
			var fNewValue = parseFloat(oEvent.getParameter("value"));

			this.setValue(fNewValue);
			this._fireChangeAndLiveChange({ value: fNewValue });
		};

		/**
		 * Register the ResizeHandler
		 *
		 * @private
		 */
		Slider.prototype._registerResizeHandler = function () {
			if (!this._parentResizeHandler) {
				setTimeout(function () {
					this._parentResizeHandler = ResizeHandler.register(this, this._handleSliderResize.bind(this));
				}.bind(this), 0);
			}
		};

		/**
		 * Deregister the ResizeHandler
		 *
		 * @private
		 */
		Slider.prototype._deregisterResizeHandler = function () {
			if (this._parentResizeHandler) {
				ResizeHandler.deregister(this._parentResizeHandler);
				this._parentResizeHandler = null;
			}
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		Slider.prototype.init = function () {
			var oSliderLabel;

			// used to track the id of touch points
			this._iActiveTouchId = -1;

			this._bSetValueFirstCall = true;

			this._fValueBeforeFocus = 0;

			// resize handler of the slider
			this._parentResizeHandler = null;

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			// a reference to the SliderTooltipContainer
			this._oTooltipContainer = null;

			oSliderLabel = new InvisibleText({
				text: this._oResourceBundle.getText("SLIDER_HANDLE")
			});

			this.addAggregation("_handlesLabels", oSliderLabel);
		};

		Slider.prototype.exit = function () {
			if (this._oResourceBundle) {
				this._oResourceBundle = null;
			}

			this._deregisterResizeHandler();
		};

		Slider.prototype.onBeforeRendering = function () {
			var bError = this._validateProperties();

			// update the value only if there aren't errors
			if (!bError) {
				this.setValue(this.getValue());

				// this is the current % value of the progress bar
				// note: round negative percentages to 0
				this._sProgressValue = Math.max(this._getPercentOfValue(this.getValue()), 0) + "%";
			}

			if (this.getShowAdvancedTooltip()) {
				this.initAndSyncTooltips(["leftTooltip"]);
			}

			this._deregisterResizeHandler();

			// set the correct scale aggregation, if needed
			this._syncScaleUsage();
		};

		/**
		 * Forwards properties to a given control
		 * @param {Array} [aProperties] Array of properties to forward
		 * @param {sap.ui.core.Element} [oControl] Control to which should be forward
		 * @protected
		 */
		Slider.prototype.forwardProperties = function (aProperties, oControl) {
			aProperties.forEach(function (sProperty) {
				oControl.setProperty(sProperty, this.getProperty(sProperty), true);
			}, this);
		};

		/**
		 * Forwards properties to default tooltips
		 *
		 * @param {number} [iTooltipCount] Count of the tooltips
		 * @protected
		 */
		Slider.prototype.forwardPropertiesToDefaultTooltips = function (iTooltipCount) {
			var aDefaultTooltips = this.getAggregation("_defaultTooltips") || [];

			for (var index = 0; index < iTooltipCount; index++) {
				this.forwardProperties(["min", "max", "step"], aDefaultTooltips[index]);

				aDefaultTooltips[index].setProperty("width", this._getMaxTooltipWidth() + "px", true);
				aDefaultTooltips[index].setProperty("editable", this.getInputsAsTooltips(), true);
			}
		};

		/**
		 * Creates custom tooltips, if needed, and forwards properties to them
		 *
		 * @param {number} [iTooltipCount] Count of the tooltips
		 * @protected
		 */
		Slider.prototype.associateCustomTooltips = function (iTooltipCount) {
			// destroy all default tooltips
			this.destroyAggregation("_defaultTooltips", true);

			// prevent invalidation of the children before rendering
			this._oTooltipContainer.removeAllAssociation("associatedTooltips", true);

			for (var index = 0; index < iTooltipCount; index++) {
				this._oTooltipContainer.addAssociation("associatedTooltips", this.getCustomTooltips()[index], true);
			}
		};

		/**
		 * Creates default tooltips, if needed, and forwards properties to them
		 *
		 * @param {Array} [aTooltipIds] Array of strings for ID generation
		 * @protected
		 */
		Slider.prototype.assignDefaultTooltips = function (aTooltipIds) {
			var aDefaultTooltips = this.getAggregation("_defaultTooltips") || [];

			// skip init tooltips if they are already there
			if (aDefaultTooltips.length === 0) {
				// clear the assoctiated tooltips from the container
				this._oTooltipContainer.removeAllAssociation("associatedTooltips", true);

				aTooltipIds.forEach(function (sId) {
					this.initDefaultTooltip(sId);
				}, this);
			}

			// forward properties to the default tooltips
			this.forwardProperties(["enabled"], this._oTooltipContainer);
			this.forwardPropertiesToDefaultTooltips(aTooltipIds.length);
		};

		/**
		 * Assigns tooltips and forwards properties to them
		 *
		 * @param {Array}[aTooltipIds] Array of strings for ID generation
		 * @protected
		 */
		Slider.prototype.initAndSyncTooltips = function (aTooltipIds) {
			var aCustomTooltips = this.getCustomTooltips(),
				iCustomTooltipsCount = aCustomTooltips.length,
				iMaxCustomTooltipCount = aTooltipIds.length;

			this.initTooltipContainer();

			// validates the count of passed tooltips and takes the needed count or fallbacks to default tooltips
			if (iCustomTooltipsCount < iMaxCustomTooltipCount) {
				this.assignDefaultTooltips(aTooltipIds);
			} else {

				// log a warning if tooltips are more than one for Slider or more than two for RangeSlider
				if (iCustomTooltipsCount > iMaxCustomTooltipCount) {
					log.warning("Warning: More than " + iMaxCustomTooltipCount + " Custom Tooltips are provided. Only the first will be used.");
				}

				// we use the first 2 tooltips of the aggregation
				this.associateCustomTooltips(iMaxCustomTooltipCount);
			}
		};

		/**
		 * Creates a default SliderTooltip instance and adds it as an aggregation
		 *
		 * @param {string}[sId] The tooltip ID
		 * @protected
		 */
		Slider.prototype.initDefaultTooltip = function (sId) {
			var oTooltip = new SliderTooltip(this.getId() + "-" + sId, {
				change: this.handleTooltipChange.bind(this)
			});

			this.getAggregation("_tooltipContainer").addAssociation("associatedTooltips", oTooltip, true);
			this.addAggregation("_defaultTooltips", oTooltip, true);
		};

		/**
		 * Creates a SliderTooltipContainer
		 *
		 * @protected
		 */
		Slider.prototype.initTooltipContainer = function () {
			if (!this._oTooltipContainer) {
				this._oTooltipContainer = new SliderTooltipContainer();
				this.setAggregation("_tooltipContainer", this._oTooltipContainer, true);
			}
		};

		Slider.prototype._getMaxTooltipWidth = function () {
			var aAbsRange = [Math.abs(this.getMin()), Math.abs(this.getMax())],
				iRangeIndex = aAbsRange[0] > aAbsRange[1] ? 0 : 1;

			return ((aAbsRange[iRangeIndex].toString()).length + this.getDecimalPrecisionOfNumber(this.getStep()) + 1) * SliderUtilities.CONSTANTS.CHARACTER_WIDTH_PX;
		};

		Slider.prototype.onAfterRendering = function () {
			if (this.getShowAdvancedTooltip()) {
				this._recalculateStyles();
				this._handleTooltipContainerResponsiveness();
			}
			this._handleSliderResize({control: this});
			this._registerResizeHandler();
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

			this.focus();

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
				setTimeout(oNearestHandleDomRef["focus"].bind(oNearestHandleDomRef), 0);
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
			this._fValueBeforeFocus = this.getValue();

			if (this.getShowAdvancedTooltip()) {
				this.getAggregation("_tooltipContainer").show(this);
				this._setAriaControls();
				this.updateAdvancedTooltipDom(this.getValue());
			}
		};

		/**
		 * Adds aria-controls attribute, when the tooltips are rendered.
		 *
		 * @private
		 */
		Slider.prototype._setAriaControls = function () {
			var oTooltip = this.getUsedTooltips()[0],
				oHandle = this.getFocusDomRef();

			if (this.getInputsAsTooltips() && oTooltip && oTooltip.getDomRef()) {
				oHandle.setAttribute("aria-controls", oTooltip.getId());
			}
		};

		/**
		 * Handles the <code>focusout</code> event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onfocusout = function(oEvent) {

			if (!this.getShowAdvancedTooltip()) {
				return;
			}

			var bSliderFocused = jQuery.contains(this.getDomRef(), oEvent.relatedTarget),
				bTooltipFocused = jQuery.contains(this.getAggregation("_tooltipContainer").getDomRef(), oEvent.relatedTarget);

			if (bSliderFocused || bTooltipFocused) {
				return;
			}

			this.getAggregation("_tooltipContainer").hide();
		};

		Slider.prototype.onmouseover = function(oEvent) {
			var bTooltipFocused, oTooltipContainer;

			if (this.getShowAdvancedTooltip()) {
				this.getAggregation("_tooltipContainer").show(this);

				oTooltipContainer = this.getAggregation("_tooltipContainer");
				bTooltipFocused = jQuery.contains(oTooltipContainer.getDomRef(), document.activeElement);
				this._setAriaControls();

				// do not update Tooltip's value if it is already focused
				if (bTooltipFocused) {
					return;
				}

				this.updateAdvancedTooltipDom(this.getValue());
			}
		};

		Slider.prototype.onmouseout = function (oEvent) {

			if (!this.getShowAdvancedTooltip()) {
				return;
			}

			var oTooltipContianerRef = this.getAggregation("_tooltipContainer").getDomRef(),
				oSliderRef = this.getDomRef(),
				bHandleFocused = jQuery.contains(oSliderRef, document.activeElement),
				bTooltipFocused = jQuery.contains(oTooltipContianerRef, document.activeElement);

			if (!oTooltipContianerRef || bHandleFocused || bTooltipFocused) {
				return;
			}

			if (jQuery.contains(this.getDomRef(), oEvent.toElement) || (oSliderRef === oEvent.toElement)) {
				return;
			}

			if (jQuery.contains(this.getAggregation("_tooltipContainer").getDomRef(), oEvent.toElement)) {
				return;
			}

			this.getAggregation("_tooltipContainer").hide();
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Slider should focus its inputs of they are advanced and editable on F2.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onkeydown = function (oEvent) {
			var aTooltips = this.getUsedTooltips();

			if (oEvent.keyCode === SliderUtilities.CONSTANTS.F2_KEYCODE && aTooltips[0] && this.getInputsAsTooltips()) {
				aTooltips[0].focus();
			}

			if (oEvent.keyCode === KeyCodes.SPACE) {
				oEvent.preventDefault();
			}
		};

		/**
		 * Handles the <code>sapincrease</code> event when right arrow or up arrow is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapincrease = function(oEvent) {
			var fValue,
				fNewValue;

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

			this._showTooltipsIfNeeded();
		};

		/**
		 * Handles the <code>sapincreasemodifiers</code> event when Ctrl + right arrow or up arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapincreasemodifiers = function(oEvent) {

			if (oEvent.altKey) {
				return;
			}

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();
			oEvent.stopPropagation();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			this._increaseValueBy(this._getLongStep());
			this._showTooltipsIfNeeded();
		};

		/**
		 * Handles the <code>sapdecrease</code> event when left arrow or down arrow are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapdecrease = function(oEvent) {
			var fValue,
				fNewValue;

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

			this._showTooltipsIfNeeded();
		};

		/**
		 * Handles the <code>sapdecreasemodifiers</code> event when Ctrl + left or Ctrl + down keys are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapdecreasemodifiers = function(oEvent) {

			if (oEvent.altKey) {
				return;
			}

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();
			oEvent.stopPropagation();

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			this._decreaseValueBy(this._getLongStep());

			this._showTooltipsIfNeeded();
		};

		/**
		 * Handles the <code>onsapplus</code> event when "+" is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapplus = function(oEvent) {
			var fValue,
				fNewValue;

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

			this._showTooltipsIfNeeded();
		};

		/**
		 * Handles the <code>sapminus</code> event when "-" is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapminus = function(oEvent) {
			var fValue,
				fNewValue;

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


			this._showTooltipsIfNeeded();
		};

		/**
		 * Handles the <code>sapescape</code> event when escape key is pressed.
		 *
		 */
		Slider.prototype.onsapescape = function() {

			// reset the slider back to the value
			// which it had when it got the focus
			this.setValue(this._fValueBeforeFocus);
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

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var fMin = this.getMin();

			// note: prevent document scrolling when Home key is pressed
			oEvent.preventDefault();

			if (this.getEnabled() && this.getValue() > fMin) {
				this.setValue(fMin);
				this._fireChangeAndLiveChange({ value: fMin });
			}

			this._showTooltipsIfNeeded();
		};

		/**
		 * Handles the <code>sapend</code> event when the End key pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		Slider.prototype.onsapend = function(oEvent) {

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var fMax = this.getMax();

			// note: prevent document scrolling when End key is pressed
			oEvent.preventDefault();

			if (this.getEnabled() && this.getValue() < fMax) {
				this.setValue(fMax);
				this._fireChangeAndLiveChange({ value: fMax });
			}

			this._showTooltipsIfNeeded();
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
		 * @type {sap.m.Slider}
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
		 * @type {sap.m.Slider}
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
		 * @param {object} mOptions The options object
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