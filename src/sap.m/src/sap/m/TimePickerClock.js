/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"./TimePickerClockRenderer",
	"sap/ui/Device",
	"sap/ui/core/ControlBehavior",
	"sap/ui/thirdparty/jquery"
],
	function(Control, TimePickerClockRenderer, Device, ControlBehavior, jQuery) {
		"use strict";

		var LONG_TOUCH_DURATION = 1000;		// duration for long-touch interaction

		/**
		 * Constructor for a new <code>TimePickerClock</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A picker control used inside a {@link sap.m.TimePicker} to choose a value using a clock dial.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.90
		 * @alias sap.m.TimePickerClock
		 */
		var TimePickerClock = Control.extend("sap.m.TimePickerClock", /** @lends sap.m.TimePickerClock.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * If set to <code>true</code>, the clock is interactive.
					 */
					enabled : {type : "boolean", group : "Misc", defaultValue : true},

					/**
					 * Minimum item value for the outer circle.
					 */
					itemMin: {type: "int", group: "Data", defaultValue: -1},

					/**
					 * Maximum item value for the outer circle.
					 */
					itemMax: {type: "int", group: "Data", defaultValue: -1},

					/**
					 * Label of the clock dial - for example, 'Hours', 'Minutes', or 'Seconds'.
					 */
					label: {type: "string", group: "Appearance", defaultValue: null},

					/**
					 * If set to <code>true</code>, a surrounding circle with markers (dots) will be displayed
					 * (for example, on the 'Minutes' clock-dial, markers represent minutes)
					 */
					fractions: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * If provided, this will replace the last item displayed. Usually, the last item '24' or '60' is replaced with '0'.
					 * Do not replace the last item if <code>support2400</code> is set to <code>true</code>.
					 */
					lastItemReplacement: {type: "int", group: "Data", defaultValue: -1},

					/**
					 * Prepend with zero flag. If <code>true</code>, values less than 10 will be prepend with 0.
					 */
					prependZero: {type: "boolean", group: "Appearance", defaultValue: false},

					/**
					 * The currently selected value of the clock.
					 */
					selectedValue: {type: "int", group: "Data", defaultValue: -1},

					/**
					 * The currently hovered value of the clock.
					 */
					hoveredValue: {type: "int", group: "Data", defaultValue: -1},

					/**
					 * The step for displaying of one unit of items.
					 * 1 means 1/60 of the circle.
					 * The default display step is 5 which means minutes and seconds are displayed as "0", "5", "10", etc.
					 * For hours the display step must be set to 1.
					 */
					displayStep: {type: "int", group: "Data", defaultValue: 5},

					/**
					 * The step for selection of items.
					 * 1 means 1 unit:
					 * - if the clock displays hours - 1 unit = 1 hour
					 * - if the clock displays minutes/seconds - 1 unit = 1 minute/second
					 */
					valueStep: {type: "int", group: "Data", defaultValue: 1},

					/**
					 * Allows to set a value of 24:00, used to indicate the end of the day.
					 * Works only with HH or H formats. Don't use it together with am/pm.
					 *
					 * When this property is set to <code>true</code>, the clock can display either 24 or 00 as last hour.
					 * The change between 24 and 00 (and vice versa) can be done as follows:
					 *
					 * - on a desktop device: hold down the <code>Ctrl</code> key (this changes 24 to 00 and vice versa), and either
					 * click with mouse on the 00/24 number, or navigate to this value using Arrow keys/PageUp/PageDown and press
					 * <code>Space</code> key (Space key selects the highlighted value and switch to the next available clock).
					 *
					 * - on mobile/touch device: make a long touch on 24/00 value - this action toggles the value to the opposite one.
					 *
					 * - on both device types, if there is a keyboard attached: 24 or 00 can be typed directly.
					 */
					support2400: {type: "boolean", group: "Misc", defaultValue: false},

					/**
					 * When set to <code>true</code>, the clock will be displayed without the animation.
					 */
					skipAnimation: {type: "boolean", group: "Misc", defaultValue: false},

					/**
					 * When set to <code>true</code>, the clock will fade in from transparent to full opacity, otherwise it will be hidden.
					 * If the skipAnimation property is set to <code>true</code>, the clock will fade in without the animation, otherwise
					 * the fade in will be animated.
					 */
					fadeIn: {type: "boolean", group: "Misc", defaultValue: false},

					/**
					 * When set to <code>true</code>, the clock will fade out to transparent
					 */
					fadeOut: {type: "boolean", group: "Misc", defaultValue: false}
				},
				events: {
					/**
					 * Fires when a value of clock is changed.
					 */
					change: {
						parameters: {
							/**
							 * The new <code>value</code> of the control.
							 */
							 value: { type: "int" },

							/**
							 * The new <code>value</code> of the control, as string, zero-prepended when necessary.
							 */
							 stringValue: { type: "string" },

							 /**
							 * <code>true</code> when a value is selected and confirmed
							 * <code>false</code> when a value is only selected but not confirmed
							 */
							 finalChange: { type: "boolean" }
						}
					}
				}
			},
			renderer: TimePickerClockRenderer
		});

		/**
		 * Initializes the control.
		 *
		 * @public
		 */
		TimePickerClock.prototype.init = function() {
			this._onMouseWheel = this._onMouseWheel.bind(this);
			this._bFinalChange = false;
		};

		/**
		 * Before rendering.
		 *
		 * @private
		 */
		TimePickerClock.prototype.onBeforeRendering = function() {
			var oDomRef = this.getDomRef();

			if (oDomRef) {
				this._bFocused = oDomRef.contains(document.activeElement);
				this._detachEvents();
			}

			if (this.getSupport2400() && this._get24HoursVisible() === undefined) {
				this._save2400State();
			}
		};

		/**
		 * After rendering.
		 *
		 * @private
		 */
		TimePickerClock.prototype.onAfterRendering = function() {
			this._attachEvents();
		};

		/**
		 * Destroy the control.
		 *
		 * @private
		 */
		TimePickerClock.prototype.exit = function() {
			this._detachEvents();
		};

		/**
		 * Handles the themeChanged event.
		 *
		 * Does a rerendering of the control.
		 * @param {jQuery.Event} oEvent Event object
		 */
		TimePickerClock.prototype.onThemeChanged = function(oEvent) {
			this.invalidate();
		};

		/**
		 * Value setter.
		 *
		 * @param {int} iValue value to set as selected for the clock
		 * @returns {this} the clock object for chaining
		 */
		TimePickerClock.prototype.setSelectedValue = function(iValue) {
			var iReplacement = this.getLastItemReplacement(),
				iMaxValue = this.getItemMax();

			if (!this.getSupport2400())	{
				if (iValue === 0) {
					iValue = iMaxValue;
				}
				if (iValue === iMaxValue && iReplacement !== -1) {
					iValue = iReplacement;
				}
			}

			this.setProperty("selectedValue", iValue);
			this.fireChange({value: iValue, stringValue: this._getStringValue(iValue), finalChange: this._bFinalChange});
			this._bFinalChange = false;

			return this;
		};

		/**
		 * Value getter.
		 *
		 * @returns {int} selected value of the clock
		 */
		TimePickerClock.prototype.getSelectedValue = function() {
			var iValue = this.getProperty("selectedValue"),
				iReplacement = this.getLastItemReplacement();

			if (this.getSupport2400() && this._get24HoursVisible() && iValue === this.getItemMax() && iReplacement !== -1)	{
				iValue = iReplacement;
			}

			return parseInt(iValue);
		};

		/**
		 * Returns value as a string and prepend it with zeroes if necessary.
		 *
		 * @param {int} iValue value to set as selected for the clock
		 * @returns {string} value as a string
		 */
		TimePickerClock.prototype._getStringValue = function(iValue) {
			var sValue = iValue.toString();

			if (this.getPrependZero()) {
				sValue = sValue.padStart(2, "0");
			}
			return sValue;
		};

		/**
		 * Saves the state when a clock has <code>support2400</code> property set.
		 * Sets the flag that says if "24" is visible or not.
		 *
		 * @private
		 */
		TimePickerClock.prototype._save2400State = function () {
			this._set24HoursVisible(this.getSupport2400() && this.getSelectedValue() === 0 ? false : true);
		};

		/**
		 * Sets the flag for "24" visibility and correxponding last item replacement
		 * when a clock has <code>support2400</code> property set.
		 *
		 * @param {boolean} bIsVisible is "24" visible or not
		 * @private
		 */
		TimePickerClock.prototype._set24HoursVisible = function (bIsVisible) {
			if (this.getSupport2400()) {
				this._is24HoursVisible = bIsVisible;
				this.setLastItemReplacement(bIsVisible ? 24 : 0);
			} else {
				this._is24HoursVisible = false;
			}
		};

		/**
		 * Gets the flag for "24" visibility (used when a clock has <code>support2400</code> property set).
		 *
		 * @returns {boolean} is "24" visible or not
		 * @private
		 */
		 TimePickerClock.prototype._get24HoursVisible = function () {
			return this.getSupport2400() ? this._is24HoursVisible : false;
		};

		/**
		 * Mark/unmark toggled element (24/00) as selected
		 *
		 * @param {boolean} bIsMarked Whether to mark 24/00 element as selected
		 * @returns {this} the clock object for chaining
		 */
		TimePickerClock.prototype._markToggleAsSelected = function (bIsMarked) {
			this._selectToggledElement = bIsMarked;
			return this;
		};

		/**
		 * Attaches all needed events to the clock.
		 *
		 * @private
		 */
		TimePickerClock.prototype._attachEvents = function() {
			var oElement = this._getClockCoverContainerDomRef();

			this.$().on(Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onMouseWheel);
			document.addEventListener("mouseup", jQuery.proxy(this._onMouseOutUp, this), false);
			if (oElement) {
				if (Device.system.combi || Device.system.phone || Device.system.tablet) {
					// Attach touch events
					oElement.addEventListener("touchstart", jQuery.proxy(this._onTouchStart, this), false);
					oElement.addEventListener("touchmove", jQuery.proxy(this._onTouchMove, this), false);
					oElement.addEventListener("touchend", jQuery.proxy(this._onTouchEnd, this), false);
				}
				if (Device.system.desktop || Device.system.combi) {
					// Attach mouse events
					oElement.addEventListener("mousedown", jQuery.proxy(this._onTouchStart, this), false);
					oElement.addEventListener("mousemove", jQuery.proxy(this._onTouchMove, this), false);
					oElement.addEventListener("mouseup", jQuery.proxy(this._onTouchEnd, this), false);
					oElement.addEventListener("mouseout",  jQuery.proxy(this._onMouseOut, this), false);
				}
			}
		};

		/**
		 * Detaches all attached events to the clock.
		 *
		 * @private
		 */
		TimePickerClock.prototype._detachEvents = function() {
			var oElement = this._getClockCoverContainerDomRef();

			this.$().off(Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onMouseWheel);
			document.removeEventListener("mouseup", jQuery.proxy(this._onMouseOutUp, this), false);
			if (oElement) {
				if (Device.system.combi || Device.system.phone || Device.system.tablet) {
					// Detach touch events
					oElement.removeEventListener("touchstart", jQuery.proxy(this._onTouchStart, this), false);
					oElement.removeEventListener("touchmove", jQuery.proxy(this._onTouchMove, this), false);
					oElement.removeEventListener("touchend", jQuery.proxy(this._onTouchEnd, this), false);
				}
				if (Device.system.desktop || Device.system.combi) {
					// Detach mouse events
					oElement.removeEventListener("mousedown", jQuery.proxy(this._onTouchStart, this), false);
					oElement.removeEventListener("mousemove", jQuery.proxy(this._onTouchMove, this), false);
					oElement.removeEventListener("mouseup", jQuery.proxy(this._onTouchEnd, this), false);
					oElement.removeEventListener("mouseout",  jQuery.proxy(this._onMouseOut, this), false);
				}
			}
		};

		/**
		 * Finds the clock's cover container in the DOM.
		 *
		 * @returns {object} Slider container's jQuery object
		 * @private
		 */
		TimePickerClock.prototype._getClockCoverContainerDomRef = function() {
			return this.getDomRef("cover");
		};

		/**
		 * Mouseup handler for whole document.
		 * Prevents selection movement when mouse is down inside the clock,
		 * then moved outside it, released (mouseup) and moved back to the clock.
		 *
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		TimePickerClock.prototype._onMouseOutUp = function(oEvent) {
			this._mouseOrTouchDown = false;
		};


		/**
		 * Mouseup handler for the clock.
		 * Restores normal state of currently hovered number.
		 *
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		 TimePickerClock.prototype._onMouseOut = function(oEvent) {
			this.setHoveredValue(-1);
		};

		/**
		 * Mousewheel handler. Increases/decreases value of the clock.
		 *
		 * @param {boolean} bIncreaseValue whether to increase or decrease the value
		 * @private
		 */
		 TimePickerClock.prototype.modifyValue = function(bIncreaseValue) {
			var iSelectedValue = this.getSelectedValue(),
				iReplacementValue = this.getLastItemReplacement(),
				iMin = this.getItemMin(),
				iMax = this.getItemMax(),
				iStep = this.getValueStep(),
				iNewSelectedValue;

			// fix step in order to change value to the nearest possible if step is > 1
			if (iSelectedValue % iStep !== 0) {
				iNewSelectedValue = bIncreaseValue ? Math.ceil(iSelectedValue / iStep) * iStep : Math.floor(iSelectedValue / iStep) * iStep;
				iStep = Math.abs(iSelectedValue - iNewSelectedValue);
			}

			if (this.getSupport2400() && !this._get24HoursVisible()) {
				iMin = 0;
				iMax = 23;
				iReplacementValue = -1;
			}

			if (iSelectedValue === iReplacementValue) {
				iSelectedValue = iMax;
			}
			if (bIncreaseValue) {
				iSelectedValue += iStep;
				if (iSelectedValue > iMax) {
					iSelectedValue = this.getSupport2400() ? iMin : iSelectedValue - iMax;
				}
			} else {
				iSelectedValue -= iStep;
				if (iSelectedValue < iMin) {
					iSelectedValue = iMax;
				}
			}

			this.setSelectedValue(iSelectedValue);
		};

		/**
		 * Mousewheel handler. Increases/decreases value of the clock.
		 *
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		TimePickerClock.prototype._onMouseWheel = function(oEvent) {
			var	oOriginalEvent = oEvent.originalEvent,
				bIncreaseValue = oOriginalEvent.detail ? (-oOriginalEvent.detail > 0) : (oOriginalEvent.wheelDelta > 0);

			oEvent.preventDefault();
			if (!this._mouseOrTouchDown) {
				this.modifyValue(bIncreaseValue);
			}
		};

		/**
		 * onTouchStart handler.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerClock.prototype._onTouchStart = function(oEvent) {
			this._cancelTouchOut = false;
			if (!this.getEnabled() || (oEvent.type === "mousedown" && oEvent.button !== 0) || this.getFadeOut()) {
				return;
			}

			this._iMovSelectedValue = this.getSelectedValue();

			this._calculateDimensions();
			this._x = oEvent.type === "touchstart" ? oEvent.touches[0].pageX : oEvent.pageX;
			this._y = oEvent.type === "touchstart" ? oEvent.touches[0].pageY : oEvent.pageY;
			this._calculatePosition(this._x, this._y);
			if (this.getSupport2400() && oEvent.type === "touchstart" && (this._iSelectedValue === 24 || this._iSelectedValue === 0)) {
				this._resetLongTouch();
				this._startLongTouch();
			}
			this._mouseOrTouchDown = true;
		};

		/**
		 * onTouchMove handler.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerClock.prototype._onTouchMove = function(oEvent) {
			if (this.getFadeOut()) {
				return;
			}
			oEvent.preventDefault();
			if (this._mouseOrTouchDown) {
				this._x = oEvent.type === "touchmove" ? oEvent.touches[0].pageX : oEvent.pageX;
				this._y = oEvent.type === "touchmove" ? oEvent.touches[0].pageY : oEvent.pageY;
				this._calculatePosition(this._x, this._y);
				if (this.getEnabled() && this._iSelectedValue !== -1 && this._iSelectedValue !== this._iMovSelectedValue) {
					this.setSelectedValue(this._iSelectedValue);
					this._iMovSelectedValue = this._iSelectedValue;
					if (this.getSupport2400() && oEvent.type === "touchmove" && (this._iSelectedValue === 24 || this._iSelectedValue === 0)) {
						this._resetLongTouch();
						this._startLongTouch();
					}
				}
			} else if (oEvent.type === "mousemove") {
				if (!this._dimensionParameters) {
					this._calculateDimensions();
				}
				this._x = oEvent.pageX;
				this._y = oEvent.pageY;
				this._calculatePosition(this._x, this._y);
			}
		};

		/**
		 * onTouchEnd handler.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerClock.prototype._onTouchEnd = function(oEvent) {
			if (!this._mouseOrTouchDown || this.getFadeOut()) {
				return;
			}

			this._mouseOrTouchDown = false;
			oEvent.preventDefault();

			if (!this.getEnabled() || this._iSelectedValue === -1) {
				return;
			}

			if (oEvent.type === "touchend") {
				this._resetLongTouch();
			}

			if (!this._cancelTouchOut) {
				this._bFinalChange = true;
				this.setSelectedValue(this._iSelectedValue);
			}
		};

		/**
		 * Clears the currently existing long touch period and starts new one if requested.
		 *
		 * @private
		 */
		TimePickerClock.prototype._resetLongTouch = function() {
			if (this._longTouchId) {
				clearTimeout(this._longTouchId);
			}
		};

		/**
		 * Starts new long touch period.
		 *
		 * @private
		 */
		TimePickerClock.prototype._startLongTouch = function() {
			this._longTouchId = setTimeout(function() {
				var iValue = this._iSelectedValue;
				this._longTouchId = null;
				if (iValue === 0 || iValue === 24) {
					this._toggle2400();
				}
			}.bind(this), LONG_TOUCH_DURATION);
		};

		/**
		 * Toggles 24 and 0 values when a clock has <code>support2400</code> property set.
		 *
		 * @param {boolean} bSkipSelection Whether to skip the setting of the toggled value
		 * @returns {this} the clock object for chaining
		 * @private
		 */
		TimePickerClock.prototype._toggle2400 = function(bSkipSelection) {
			var bIs24HoursVisible = this._get24HoursVisible(),
				iValue = bIs24HoursVisible ? 0 : 24;
			this._cancelTouchOut = true;
			this._set24HoursVisible(!bIs24HoursVisible);
			this.setLastItemReplacement(iValue);
			if (!bSkipSelection) {
				this._iMovSelectedValue = iValue;
				this.setSelectedValue(iValue);
			}

			return this;
		};

		/**
		 * Returns the number of items in the clock.
		 *
		 * @private
		 */
		TimePickerClock.prototype._getItemsCount = function(bForceRealCount) {
			return this.getItemMax() - this.getItemMin() + 1;
		};

		/**
		 * Returns the angle step for the clock.
		 *
		 * @private
		 */
		TimePickerClock.prototype._getAngleStep = function(bForceRealAngle) {
			const iItemsCount = this._getItemsCount();
			return iItemsCount === 12 ? 6 : 360 / this._getItemsCount();
		};

		/**
		 * Calculates dimension variables necessary for determining of item selection.
		 *
		 * @private
		 */
		TimePickerClock.prototype._calculateDimensions = function() {
			const oCover = this._getClockCoverContainerDomRef();

			if (!oCover) {
				return;
			}

			const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
				scrollTop = window.pageYOffset || document.documentElement.scrollTop,
				iRadius = Math.round(oCover.offsetHeight / 2),
				iDotHeight = jQuery('.sapMTPCDot').first().outerHeight(true),
				iNumberHeight = jQuery('.sapMTPCNumber').first().outerHeight(true),
				oOffset = oCover.getBoundingClientRect();

			this._dimensionParameters = {
				'radius': iRadius,
				'centerX': iRadius,
				'centerY': iRadius,
				'dotHeight': iDotHeight,
				'numberHeight': iNumberHeight,
				'radiusMax': iRadius,
				'radiusMin': iRadius - iNumberHeight * 1.6 - 1,
				'offsetX': oOffset.left + scrollLeft,
				'offsetY': oOffset.top + scrollTop
			};
		};

		/**
		 * Calculates item selection based on click/touch position.
		 *
		 * @param {int} iX X position of click/touch returned by the event
		 * @param {int} iY Y position of click/touch returned by the event
		 * @private
		 */
		TimePickerClock.prototype._calculatePosition = function(iX, iY) {
			var iItemMax = this.getItemMax(),
				iReplacement = this.getLastItemReplacement(),
				iValueStep = this.getValueStep(),
				iDx = iX - this._dimensionParameters.offsetX + 1 - this._dimensionParameters.radius,
				iDy = iY - this._dimensionParameters.offsetY + 1 - this._dimensionParameters.radius,
				iMod = iDx >= 0 ? 0 : 180,
				iAngle = (Math.atan(iDy / iDx) * 180 / Math.PI) + 90 + iMod,
				iAngleStep = this._getAngleStep(true),
				iRadius = Math.sqrt(iDx * iDx + iDy * iDy),
				iFinalAngle = Math.round((iAngle === 0 ? 360 : iAngle) / iAngleStep / iValueStep) * iAngleStep * iValueStep,
				bIsInActiveZone = iRadius <= this._dimensionParameters.radiusMax && iRadius > this._dimensionParameters.radiusMin,
				iMultiplier = 360 / this._getItemsCount() / iAngleStep,
				bSupport2400 = this.getSupport2400(),
				bIs24HoursVisible = this._get24HoursVisible();

			if (iFinalAngle === 0) {
				iFinalAngle = 360;
			}

			// selected item calculations
			if (bIsInActiveZone) {
				this._iSelectedValue = Math.round((iFinalAngle / iAngleStep / iMultiplier / iValueStep)) * iValueStep;
				if (this._iSelectedValue === 0 && iReplacement === -1) {
					this._iSelectedValue = iItemMax;
				}
				if (bSupport2400 && !bIs24HoursVisible && this._iSelectedValue === 24) {
					this._iSelectedValue = 0;
				}
			} else {
				this._iSelectedValue = -1;
			}

			if (this._iSelectedValue === iItemMax && iReplacement !== -1) {
				this._iSelectedValue = iReplacement;
			}

			// hover simulation calculations
			this.setHoveredValue(bIsInActiveZone ? this._iSelectedValue : -1);
		};

		/**
		 * Setter for enabling/disabling the sliders when 2400.
		 *
		 * @private
		 */
		TimePickerClock.prototype._setEnabled = function(bEnabled) {
			this.setEnabled(bEnabled);
			if (bEnabled) {
				this.$().removeClass("sapMTPDisabled");
			} else {
				this.$().addClass("sapMTPDisabled");
			}

			return this;
		};

		return TimePickerClock;

	});

