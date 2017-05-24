/*!
 * ${copyright}
 */

// Provides control sap.m.RatingIndicator.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool', 'sap/ui/core/theming/Parameters'],
	function(jQuery, library, Control, IconPool, Parameters) {
	"use strict";



	/**
	 * Constructor for a new RatingIndicator.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * Enables users to rate an item on a numeric scale.
	 * @class
	 * The rating indicator is used to display a specific number of icons that are used to rate an item. Additionally it is also used to display the average over all ratings.
	 * <h3>Structure</h3>
	 * <ul>
	 * <li>The rating indicator can use different icons (default: stars) which are defined as URIs in the properties <code>iconHovered</code>, <code>iconSelected</code> and <code>iconUnselected</code>.</li>
	 * <li>The rating indicator can display half-values ({@link sap.m.RatingIndicatorVisualMode visualMode} = Half) when it is used to show the average. Half-values can't be selected by the user.</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * The preferred number of icons is between 5 (default) and 7.
	 * <h3>Responsive Behavior</h3>
	 * You can display icons in 4 recommended sizes:
	 * <ul>
	 * <li>large - 32px</li>
	 * <li>medium(default) - 22px</li>
	 * <li>small - 16px</li>
	 * <li>XS - 12px</li>
	 * </ul>
	 * <b>Note:</b> If no icon size is set, the rating indicator will set it according to the content density.</h4>
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.14
	 * @alias sap.m.RatingIndicator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RatingIndicator = Control.extend("sap.m.RatingIndicator", /** @lends sap.m.RatingIndicator.prototype */ { metadata : {

		library : "sap.m",
		properties : {
			/**
			 * Value "true" is required to let the user rate with this control. It is recommended to set this parameter to "false" for the "Small" size which is meant for indicating a value only
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The number of displayed rating symbols
			 */
			maxValue : {type : "int", group : "Behavior", defaultValue : 5},

			/**
			 * The indicated value of the rating
			 */
			value : {type : "float", group : "Behavior", defaultValue : 0, bindable : "bindable"},

			/**
			 * The Size of the image or icon to be displayed. The default value depends on the theme. Please be sure that the size is corresponding to a full pixel value as some browsers don't support subpixel calculations. Recommended size is 1.375rem (22px) for normal, 1rem (16px) for small, and 2rem (32px) for large icons correspondingly.
			 */
			iconSize : {type : "sap.ui.core.CSSSize", group : "Behavior", defaultValue : null},

			/**
			 * The URI to the icon font icon or image that will be displayed for selected rating symbols. A star icon will be used if the property is not set
			 */
			iconSelected : {type : "sap.ui.core.URI", group : "Behavior", defaultValue : null},

			/**
			 * The URI to the icon font icon or image that will be displayed for all unselected rating symbols. A star icon will be used if the property is not set
			 */
			iconUnselected : {type : "sap.ui.core.URI", group : "Behavior", defaultValue : null},

			/**
			 * The URI to the icon font icon or image that will be displayed for hovered rating symbols. A star icon will be used if the property is not set
			 */
			iconHovered : {type : "sap.ui.core.URI", group : "Behavior", defaultValue : null},

			/**
			 * Defines how float values are visualized: Full, Half (see enumeration RatingIndicatorVisualMode)
			 */
			visualMode : {type : "sap.m.RatingIndicatorVisualMode", group : "Behavior", defaultValue : sap.m.RatingIndicatorVisualMode.Half}
		},
		associations : {
			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" },

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events : {

			/**
			 * The event is fired when the user has done a rating.
			 */
			change : {
				parameters : {

					/**
					 * The rated value
					 */
					value : {type : "int"}
				}
			},

			/**
			 * This event is triggered during the dragging period, each time the rating value changes.
			 */
			liveChange : {
				parameters : {

					/**
					 * The current value of the rating after a live change event.
					 */
					value : {type : "float"}
				}
			}
		},
		designTime : true
	}});

	///**
	// * This file defines behavior for the control,
	// */

	/* =========================================================== */
	/*           temporary flags for jslint syntax check           */
	/* =========================================================== */
	/*jslint nomen: false */

	/* =========================================================== */
	/*           begin: API methods                                */
	/* =========================================================== */

	/**
	 * Initializes the control.
	 *
	 * @private
	 */
	RatingIndicator.prototype.init = function () {

		// deactivate text selection on drag events
		this.allowTextSelection(false);
		this._iIconCounter = 0;
		this._fHoverValue = 0;

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
	};

	/**
	 * Sets the rating value. The method is automatically checking whether the value is in the valid range of 0-{@link #getMaxValue maxValue} and if it is a valid number. Calling the setter with null or undefined will reset the value to it's default.
	 *
	 * @param {float} fValue The rating value to be set.
	 * @returns {sap.m.RatingIndicator} Returns <code>this</code> to facilitate method chaining.
	 * @override
	 * @public
	 */
	RatingIndicator.prototype.setValue = function (fValue) {
		// validates the property and sets null/undefined values to the default
		fValue = this.validateProperty("value", fValue);

		// do not set negative values (will be returned by calculation function if there is an error)
		if (fValue < 0) {
			return this;
		}

		// check for valid numbers
		if (isNaN(fValue)) {
			jQuery.sap.log.warning('Ignored new rating value "' + fValue + '" because it is NAN');

		// check if the number is in the range 0-maxValue (only if control is rendered)
		// if control is not rendered it is handled by onBeforeRendering()
		} else if (this.$().length && (fValue > this.getMaxValue())) {
			jQuery.sap.log.warning('Ignored new rating value "' + fValue + '" because it is out  of range (0-' + this.getMaxValue() + ')');
		} else {
			fValue = this._roundValueToVisualMode(fValue);
			this.setProperty("value", fValue, true);

			// always set hover value to current value to allow keyboard / mouse / touch navigation
			this._fHoverValue = fValue;

			// if control is already rendered reflect the changes in the UI as well
			if (this.$().length) {
				this._updateUI(fValue);
			}
		}
		return this;
	};

	/**
	 * Sets the icon size value. The method is automatically updating the UI components if the control has been rendered before.
	 *
	 * @param {sap.ui.core.CSSSize} sIconSize
	 * @returns {sap.m.RatingIndicator} Returns <code>this</code> to facilitate method chaining.
	 * @override
	 * @public
	 */
	RatingIndicator.prototype.setIconSize = function (sIconSize) {

		// if control is already rendered we calculate the new pixel values for the icon size once
		if (this.$().length) {
			this._iPxIconSize = this._toPx(sIconSize) || 16;
		}

		// then update the property and rerender since updating all widths would be too complex here
		this.setProperty("iconSize", sIconSize, false);
		return this;
	};

	/**
	 * Handler for theme changing
	 *
	 * @param {jQuery.Event} oEvent The event object passed to the event handler.
	 */
	RatingIndicator.prototype.onThemeChanged = function (oEvent) {
		this.invalidate(); // triggers a re-rendering
	};

	/**
	 * Called before rendering starts by the renderer to readjust values outside the range.
	 *
	 * @private
	 */
	RatingIndicator.prototype.onBeforeRendering = function () {
		var fVal = this.getValue(),
			iMVal = this.getMaxValue(),
			sIconSizeLessParameter;

		if (fVal > iMVal) {
			this.setValue(iMVal);
			jQuery.sap.log.warning("Set value to maxValue because value is > maxValue (" + fVal + " > " + iMVal + ").");
		} else if (fVal < 0) {
			this.setValue(0);
			jQuery.sap.log.warning("Set value to 0 because value is < 0 (" + fVal + " < 0).");
		}

		if (this.getIconSize()) {
			this._iPxIconSize = this._toPx(this.getIconSize());
			sIconSizeLessParameter = "sapUiRIIconPadding" + this._getIconSizeLabel(this._iPxIconSize);
			this._iPxPaddingSize = this._toPx(Parameters.get(sIconSizeLessParameter));
		} else {
			var sDensityMode = this._getDensityMode();
			this._iPxIconSize = this._toPx(Parameters.get("sapUiRIIconSize" + sDensityMode));
			this._iPxPaddingSize = this._toPx(Parameters.get("sapUiRIIconPadding" + sDensityMode));
		}
	};

	/**
	 * Called by the framework when rendering is completed.
	 *
	 * @private
	 */
	RatingIndicator.prototype.onAfterRendering = function() {
		this._updateAriaValues();
	};

	/**
	 * Destroys the control.
	 *
	 * @private
	 */
	RatingIndicator.prototype.exit = function () {
		this._iIconCounter = null;
		this._fStartValue = null;
		this._iPxIconSize = null;
		this._iPxPaddingSize = null;
		this._fHoverValue = null;

		this._oResourceBundle = null;
	};

	/* =========================================================== */
	/*           end: API methods                                  */
	/* =========================================================== */

	/* =========================================================== */
	/*           begin: internal methods and properties            */
	/* =========================================================== */

	/**
	 * get the form factor (Cozy/Compact/Condensed)
	 *
	 * @private
	 */
	RatingIndicator.prototype._getDensityMode = function () {
		var aDensityModes = [
			{name: "Cozy", style: "sapUiSizeCozy"},
			{name: "Compact",  style: "sapUiSizeCompact"},
			{name: "Condensed", style: "sapUiSizeCondensed"}
		],
		sDensityMode;

		aDensityModes.forEach(function(mode){
			if (jQuery("html").hasClass(mode.style) || this.$().is("." + mode.style) || this.$().closest("." + mode.style).length > 0) {
				sDensityMode = mode.name;
				return;
			}
		}, this);

		return sDensityMode || aDensityModes[0].name;
	};

		/**
		 * Get icon size label
		 *
		 * @private
		 */
	RatingIndicator.prototype._getIconSizeLabel = function (iPxIconSize) {
		switch (true) {
			case (iPxIconSize >= 32):
				return "L";
			case (this._iPxIconSize >= 22):
				return "M";
			case (this._iPxIconSize >= 16):
				return "S";
			case (this._iPxIconSize >= 12):
				return "XS";
			default:
				return "M";
		}
	};

	RatingIndicator.prototype._toPx = function (cssSize) {
		var scopeVal = Math.round(cssSize),
		scopeTest;

		if (isNaN(scopeVal)) {
			if (RegExp("^(auto|0)$|^[+-]?[0-9].?([0-9]+)?(px|em|rem|ex|%|in|cm|mm|pt|pc)$").test(cssSize)) {
				scopeTest = jQuery('<div style="display: none; width: ' + cssSize + '; margin: 0; padding:0; height: auto; line-height: 1; font-size: 1; border:0; overflow: hidden">&nbsp;</div>').appendTo(sap.ui.getCore().getStaticAreaRef());
				scopeVal = scopeTest.width();
				scopeTest.remove();
			} else {
				return false;
			}
		}
		return Math.round(scopeVal);
	};

	/**
	 * Updates the controls's interface to reflect a value change of the rating.
	 *
	 * @param {float} fValue the rating value to be set
	 * @param {boolean} bHover if this parameter is set to true, the hover mode is activated and the value is displayed with {@link #getIconHovered iconHovered} instead of {@link #getIconSelected iconSelected}
	 * @private
	 */
	RatingIndicator.prototype._updateUI = function (fValue, bHover) {

		// save a reference on all needed DOM elements
		var $SelectedDiv = this.$("sel"),
			$UnselectedContainerDiv = this.$("unsel-wrapper"),
			$HoveredDiv = this.$("hov"),

			// calculate padding, size, and measurement
			fIconSize = this._iPxIconSize,
			fIconPadding = this._iPxPaddingSize,
			sIconSizeMeasure = "px",
			iSymbolCount = this.getMaxValue(),

			// calculate the width for the selected elements and the complete width
			iSelectedWidth = fValue * fIconSize + (Math.round(fValue) - 1) * fIconPadding,

			iWidth = iSymbolCount * (fIconSize + fIconPadding) - fIconPadding;

		// always set hover value to current value to allow keyboard / mouse / touch navigation
		this._fHoverValue = fValue;

		if (iSelectedWidth < 0) {	// width should not be negative
			iSelectedWidth = 0;
		}

		this._updateAriaValues(fValue);

		// adjust unselected container with the remaining width
		$UnselectedContainerDiv.width((iWidth - iSelectedWidth) + sIconSizeMeasure);

		// update the DOM elements to reflect the value by setting the width of the div elements
		if (bHover) { // hide selected div & adjust hover div
			$HoveredDiv.width(iSelectedWidth + sIconSizeMeasure);
			$SelectedDiv.hide();
			$HoveredDiv.show();
		} else { // hide hovered div & adjust selected div
			$SelectedDiv.width(iSelectedWidth + sIconSizeMeasure);
			$HoveredDiv.hide();
			$SelectedDiv.show();
		}

		jQuery.sap.log.debug("Updated rating UI with value " + fValue + " and hover mode " + bHover);
	};

	/**
	 * Updates the ARIA values.
	 *
	 * @private
	 */
	RatingIndicator.prototype._updateAriaValues = function (newValue) {
		var $this = this.$();

		var fValue;
		if (newValue === undefined) {
			fValue = this.getValue();
		} else {
			fValue = newValue;
		}

		var fMaxValue = this.getMaxValue();

		$this.attr("aria-valuenow", fValue);
		$this.attr("aria-valuemax", fMaxValue);

		var sValueText = this._oResourceBundle.getText("RATING_VALUEARIATEXT", [fValue, fMaxValue]);
		$this.attr("aria-valuetext", sValueText);
	};

	/**
	 * Calculated the selected value based on the event position of the tap/move/click event.
	 * This function is called by the event handlers to determine the {@link #getValue value} of the rating.
	 *
	 * @param {jQuery.Event} oEvent The event object passed to the event handler.
	 * @returns {float} The rounded rating value based on {@link #getVisualMode visualMode}.
	 * @private
	 */
	RatingIndicator.prototype._calculateSelectedValue = function (oEvent) {
		var selectedValue = -1.0,
			percentageWidth = 0.0,
			oControlRoot = this.$(),
			fControlPadding = (oControlRoot.innerWidth() - oControlRoot.width()) / 2,
			oEventPosition,
			bRtl = sap.ui.getCore().getConfiguration().getRTL();

		if (oEvent.targetTouches) {
			oEventPosition = oEvent.targetTouches[0];
		} else {
			oEventPosition = oEvent;
		}

		// get the event position for tap/touch/click events
		if (!oEventPosition || !oEventPosition.pageX) { // desktop fallback
			oEventPosition = oEvent;
			if ((!oEventPosition || !oEventPosition.pageX) && oEvent.changedTouches) { // touchend fallback
				oEventPosition = oEvent.changedTouches[0];
			}
		}

		// if an event position is not present we stop
		if (!oEventPosition.pageX) { // TODO: find out why this happens
			return parseFloat(selectedValue);
		}

		// check if event is happening inside of the control area (minus padding of the control)
		if (oEventPosition.pageX < oControlRoot.offset().left) {
			selectedValue = 0;
		} else if ((oEventPosition.pageX - oControlRoot.offset().left) >  oControlRoot.innerWidth() - fControlPadding) {
			selectedValue = this.getMaxValue();
		} else {

			// calculate the selected value based on the percentage value of the event position
			percentageWidth = (oEventPosition.pageX - oControlRoot.offset().left - fControlPadding) / oControlRoot.width();
			selectedValue = percentageWidth * this.getMaxValue();
		}

		// rtl support
		if (bRtl) {
			selectedValue = this.getMaxValue() - selectedValue;
		}

		// return rounded value based on the control's visual mode
		return this._roundValueToVisualMode(selectedValue, true);
	};

	/**
	 * Rounds the float value according to the parameter {@link #getVisualMode visualMode}:
	 * - A value of "Full" will result in integer values.
	 * - A value of "Half" will result in float values rounded to 0.5.
	 *
	 * @param {float} fValue The rating value.
	 * @param {boolean} bInputMode whether the given value represents user input
	 * @returns {float} The rounded rating value.
	 * @private
	 */
	RatingIndicator.prototype._roundValueToVisualMode = function (fValue, bInputMode) {
		if (bInputMode) { // we only support full selection of stars
			if (fValue < 0.25) { // to be able to also select 0 stars
				fValue = 0;
			} else if (fValue < this.getMaxValue() - 0.25) { // to optimize selection behaviour
				fValue += 0.25;
			}
			fValue = Math.round(fValue);
		} else { // for display we round to the correct behavior
			if (this.getVisualMode() === sap.m.RatingIndicatorVisualMode.Full) {
				fValue = Math.round(fValue);
			} else if (this.getVisualMode() === sap.m.RatingIndicatorVisualMode.Half) {
				fValue = Math.round(fValue * 2) / 2;
			}
		}

		return parseFloat(fValue);
	};

	/**
	 * Gets the new value after a single value increase.
	 *
	 * @returns {float} The increased rating value.
	 * @private
	 */
	RatingIndicator.prototype._getIncreasedValue = function () {
		var iMaxValue = this.getMaxValue(),
			fValue = this.getValue() + this._getValueChangeStep();

		if (fValue > iMaxValue) {
			fValue = iMaxValue;
		}

		return fValue;
	};

	/**
	 * Gets the new value after a single value decrease.
	 *
	 * @returns {float} The decreased rating value.
	 * @private
	 */
	RatingIndicator.prototype._getDecreasedValue = function () {
		var fValue = this.getValue() - this._getValueChangeStep();

		if (fValue < 0) {
			fValue = 0;
		}

		return fValue;
	};

	/**
	 * Gets the step that should be used for single keyboard value change operation.
	 *
	 * @returns {float} The value change step.
	 * @private
	 */
	RatingIndicator.prototype._getValueChangeStep = function () {
		var sVisualMode = this.getVisualMode(),
			fStep;

		switch (sVisualMode) {
			case sap.m.RatingIndicatorVisualMode.Full:
				fStep = 1;
				break;
			case sap.m.RatingIndicatorVisualMode.Half:
				// If the value is half, we return 0.5 in order to allow/force only full value selection via keyboard.
				if (this.getValue() % 1 === 0.5) {
					fStep = 0.5;
				} else {
					fStep = 1;
				}
				break;
			default:
				jQuery.sap.log.warning("VisualMode not supported", sVisualMode);
		}

		return fStep;
	};

	/* =========================================================== */
	/*           end: internal methods                             */
	/* =========================================================== */

	/* =========================================================== */
	/*           begin: event handlers                             */
	/* =========================================================== */

	/**
	 * Handle the touch start event happening on the rating.
	 * The UI will be updated accordingly to show a preview of the rating value without actually setting the value.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	RatingIndicator.prototype.ontouchstart = function (oEvent) {
		if (oEvent.which == 2 || oEvent.which == 3 || !this.getEnabled()) {
			return;
		}

		// mark the event for components that needs to know if the event was handled by this Control
		oEvent.setMarked();

		if (!this._touchEndProxy) {
			this._touchEndProxy = jQuery.proxy(this._ontouchend, this);
		}

		if (!this._touchMoveProxy) {
			this._touchMoveProxy = jQuery.proxy(this._ontouchmove, this);
		}

		// here also bound to the mouseup mousemove event to enable it working in
		// desktop browsers
		jQuery(document).on("touchend.sapMRI touchcancel.sapMRI mouseup.sapMRI", this._touchEndProxy);
		jQuery(document).on("touchmove.sapMRI mousemove.sapMRI", this._touchMoveProxy);

		this._fStartValue = this.getValue();
		var fValue = this._calculateSelectedValue(oEvent);

		if (fValue >= 0 && fValue <= this.getMaxValue()) {
			this._updateUI(fValue, true);
			if (this._fStartValue !== fValue) {	// if the value if not the same
				this.fireLiveChange({ value: fValue });
			}
		}
	};

	/**
	 * Handle the touch move event on the rating.
	 * The UI will be updated accordingly to show a preview of the rating value without actually setting the value.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	RatingIndicator.prototype._ontouchmove = function (oEvent) {

		if (oEvent.isMarked("delayedMouseEvent")) {
			return;
		}

		// note: prevent native document scrolling
		oEvent.preventDefault();

		if (this.getEnabled()) {
			var fValue = this._calculateSelectedValue(oEvent);

			if (fValue >= 0 && fValue <= this.getMaxValue()) {
				this._updateUI(fValue, true);
				if (this._fStartValue !== fValue) {	// if the value if not the same
					this.fireLiveChange({value: fValue});
				}
			}
		}
	};

	/**
	 * Handle the touch end event on the rating.
	 * A change event will be fired when the touch ends, the value will be set, and the UI will be updated accordingly.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	RatingIndicator.prototype._ontouchend = function (oEvent) {

		if (oEvent.isMarked("delayedMouseEvent")) {
			return;
		}

		if (this.getEnabled()) {
			var fValue = this._calculateSelectedValue(oEvent);

			// When the value is 1 and the first star is pressed we should toggle to 0
			if (this.getValue() === 1 && fValue === 1) {
				fValue = 0;
			}

			this.setProperty("value", fValue, true);
			this._updateUI(fValue, false);

			if (this._fStartValue !== fValue) {	// if the value if not the same
				this.fireLiveChange({ value: fValue });
				this.fireChange({ value: fValue });
			}

			jQuery(document).off("touchend.sapMRI touchcancel.sapMRI mouseup.sapMRI", this._touchEndProxy);
			jQuery(document).off("touchmove.sapMRI mousemove.sapMRI", this._touchMoveProxy);

			// remove unused properties
			delete this._fStartValue;
		}
	};

	/**
	 * Handle the touch end event.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	RatingIndicator.prototype.ontouchcancel = RatingIndicator.prototype.ontouchend;

	/**
	 * Keyboard navigation event when the user presses Arrow Right (Left in RTL case) or Arrow Up.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	RatingIndicator.prototype.onsapincrease = function (oEvent) {
		var fValue = this._getIncreasedValue();
		this._handleKeyboardValueChange(oEvent, fValue);
	};

	/**
	 * Keyboard navigation event when the user presses Arrow Left (Right in RTL case) or Arrow Down.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	RatingIndicator.prototype.onsapdecrease = function (oEvent) {
		var fValue = this._getDecreasedValue();
		this._handleKeyboardValueChange(oEvent, fValue);
	};

	/**
	* Keyboard navigation event when the user presses Home.
	*
	* @param {jQuery.Event} oEvent
	* @private
	*/
	RatingIndicator.prototype.onsaphome = function (oEvent) {
		var fValue = 0;
		this._handleKeyboardValueChange(oEvent, fValue);
	};

	/**
	 * Keyboard navigation event when the user presses End.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RatingIndicator.prototype.onsapend = function (oEvent) {
		var fValue = this.getMaxValue();
		this._handleKeyboardValueChange(oEvent, fValue);
	};

	/**
	 * Keyboard navigation event when the user presses Enter or Space.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	RatingIndicator.prototype.onsapselect = function (oEvent) {
		var fValue;

		if (this.getValue() === this.getMaxValue()) { // if the max value is reached, set to 0
			fValue = 0;
		} else {
			fValue = this._getIncreasedValue();
		}

		this._handleKeyboardValueChange(oEvent, fValue);
	};

	/**
	* Keyboard handling event when the user presses number keys.
	*
	* @param {jQuery.Event} oEvent
	* @private
	*/
	RatingIndicator.prototype.onkeyup = function(oEvent) {
		var iMaxValue = this.getMaxValue();

		if (!this.getEnabled()) {
			return false;
		}

        switch (oEvent.which) {
            case jQuery.sap.KeyCodes.DIGIT_0:
            case jQuery.sap.KeyCodes.NUMPAD_0:
                this.setValue(0);
                break;
            case jQuery.sap.KeyCodes.DIGIT_1:
            case jQuery.sap.KeyCodes.NUMPAD_1:
                this.setValue(1);
                break;
            case jQuery.sap.KeyCodes.DIGIT_2:
            case jQuery.sap.KeyCodes.NUMPAD_2:
                this.setValue(Math.min(2, iMaxValue));
                break;
            case jQuery.sap.KeyCodes.DIGIT_3:
            case jQuery.sap.KeyCodes.NUMPAD_3:
                this.setValue(Math.min(3, iMaxValue));
                break;
            case jQuery.sap.KeyCodes.DIGIT_4:
            case jQuery.sap.KeyCodes.NUMPAD_4:
                this.setValue(Math.min(4, iMaxValue));
                break;
            case jQuery.sap.KeyCodes.DIGIT_5:
            case jQuery.sap.KeyCodes.NUMPAD_5:
                this.setValue(Math.min(5, iMaxValue));
                break;
            case jQuery.sap.KeyCodes.DIGIT_6:
            case jQuery.sap.KeyCodes.NUMPAD_6:
                this.setValue(Math.min(6, iMaxValue));
                break;
            case jQuery.sap.KeyCodes.DIGIT_7:
            case jQuery.sap.KeyCodes.NUMPAD_7:
                this.setValue(Math.min(7, iMaxValue));
                break;
            case jQuery.sap.KeyCodes.DIGIT_8:
            case jQuery.sap.KeyCodes.NUMPAD_8:
                this.setValue(Math.min(8, iMaxValue));
                break;
            case jQuery.sap.KeyCodes.DIGIT_9:
            case jQuery.sap.KeyCodes.NUMPAD_9:
                this.setValue(Math.min(9, iMaxValue));
                break;
        }
	};

	/**
	 * Handle the event and set the new value.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @param {float} fValue The new value that should be set.
	 * @private
	 */
	RatingIndicator.prototype._handleKeyboardValueChange = function (oEvent, fValue) {
		if (!this.getEnabled()) {
			return;
		}

		if (fValue !== this.getValue()) {
			this.setValue(fValue);
			this.fireLiveChange({value: fValue});
			this.fireChange({value: fValue});
		}

		// stop browsers default behavior
		if (oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/* =========================================================== */
	/*           end: event handlers                               */
	/* =========================================================== */

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	RatingIndicator.prototype.getAccessibilityInfo = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return {
			role: "slider",
			type: oBundle.getText("ACC_CTR_TYPE_RATING"),
			description: oBundle.getText("ACC_CTR_STATE_RATING", [this.getValue(), this.getMaxValue()]),
			focusable: this.getEnabled(),
			enabled: this.getEnabled()
		};
	};

	return RatingIndicator;

}, /* bExport= */ true);
