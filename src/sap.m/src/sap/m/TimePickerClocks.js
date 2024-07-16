/*!
 * ${copyright}
 */

sap.ui.define([
	"./TimePickerInternals",
	"./TimePickerClock",
	"./ToggleButton",
	"./SegmentedButton",
	"./SegmentedButtonItem",
	"./TimePickerClocksRenderer",
	"./ToggleButtonRenderer",
	"sap/ui/core/Renderer",
	"sap/ui/events/KeyCodes",
	'sap/ui/core/library',
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/date/UI5Date'
],
	function(
		TimePickerInternals,
		TimePickerClock,
		ToggleButton,
		SegmentedButton,
		SegmentedButtonItem,
		TimePickerClocksRenderer,
		ToggleButtonRenderer,
		Renderer,
		KeyCodes,
		coreLibrary,
		jQuery,
		UI5Date
	) {
		"use strict";

		var TYPE_COOLDOWN_DELAY = 1000; // Cooldown delay; 0 = disabled cooldown

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		/**
		 * Constructor for a new <code>TimePickerClocks</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A picker clocks container control used inside the {@link sap.m.TimePicker}.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.90
		 * @alias sap.m.TimePickerClocks
		 */

		var TimePickerClocks = TimePickerInternals.extend("sap.m.TimePickerClocks", /** @lends sap.m.TimePickerClocks.prototype */ {
			metadata : {
				aggregations: {
					/**
					 * Holds the inner buttons.
					 */
					_buttons: { type: "sap.m.internal.ToggleSpinButton", multiple: true, visibility: "hidden" },
					/**
					 * Holds the inner clocks.
					 */
					_clocks: { type: "sap.m.TimePickerClock", multiple: true, visibility: "hidden" }
				}
			},

			renderer: TimePickerClocksRenderer
		});

		/*********************************************************************************************************
		 * ToggleSpinButton Control and Renderer*/

		 var ToggleSpinButtonRenderer = Renderer.extend(ToggleButtonRenderer);

		 ToggleSpinButtonRenderer.apiVersion = 2;

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm
		 *            the RenderManager that can be used for writing to
		 *            the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oButton
		 *            the button to be rendered
		 */
		ToggleSpinButtonRenderer.render = function(oRm, oButton) {

			// get control properties
			var sButtonId = oButton.getId(),
				sType = oButton.getType(),
				bEnabled = oButton.getEnabled(),
				sWidth = oButton.getWidth(),
				sTooltip = oButton._getTooltip(),
				sText = oButton._getText(),
				sTextDir = oButton.getTextDirection(),
				bIE_Edge = false,
				// render bdi tag only if the browser is different from IE and Edge since it is not supported there
				bRenderBDI = (sTextDir === TextDirection.Inherit) && !bIE_Edge;

			// start button tag
			oRm.openStart("div", oButton);
			oRm.class("sapMBtnBase");
			oRm.class("sapMBtn");

			//ARIA attributes
			var mAccProps = this.generateAccProps(oButton);
			mAccProps["pressed"] = null;
			mAccProps["valuemin"] = oButton.getMin();
			mAccProps["valuemax"] = oButton.getMax();
			mAccProps["valuenow"] = parseInt(oButton.getText());
			mAccProps["label"] = oButton.getLabel();
			mAccProps["valuetext"] = parseInt(oButton.getText()).toString() + " " + oButton.getLabel();
			mAccProps["role"] = "spinbutton";

			oRm.accessibilityState(oButton, mAccProps);

			// check if the button is disabled
			if (!bEnabled) {
				oRm.attr("disabled", "disabled");
				oRm.class("sapMBtnDisabled");
			}

			// set user defined width
			if (sWidth != "" || sWidth.toLowerCase() === "auto") {
				oRm.style("width", sWidth);
				oRm.style("min-width", "2.25rem");
			}

			// set tabindex
			oRm.attr("tabindex", "0");

			// close button tag
			oRm.openEnd();

			// start inner button tag
			oRm.openStart("span", sButtonId + "-inner");

			// button style class
			oRm.class("sapMBtnInner");

			// check if button is hoverable
			if (oButton._isHoverable()) {
				oRm.class("sapMBtnHoverable");
			}

			// check if button is focusable (not disabled)
			if (bEnabled) {
				oRm.class("sapMFocusable");
				// special focus handling for IE
				if (bIE_Edge) {
					oRm.class("sapMIE");
				}
			}

			if (sText) {
				oRm.class("sapMBtnText");
			}

			if (oButton.getPressed()) {
				oRm.class("sapMToggleBtnPressed");
			}

			// set button specific styles
			if (sType !== "") {
				// set button specific styles
				oRm.class("sapMBtn" + sType);
			}

			// close inner button tag
			oRm.openEnd();

			// write button text
			if (sText) {
				oRm.openStart("span", sButtonId + "-content");
				oRm.class("sapMBtnContent");
				// check if textDirection property is not set to default "Inherit" and add "dir" attribute
				if (sTextDir !== TextDirection.Inherit) {
					oRm.attr("dir", sTextDir.toLowerCase());
				}
				oRm.openEnd();

				if (bRenderBDI) {
					oRm.openStart("bdi", sButtonId + "-BDI-content");
					oRm.openEnd();
				}
				oRm.text(sText);
				if (bRenderBDI) {
					oRm.close("bdi");
				}
				oRm.close("span");
			}

			// special handling for IE focus outline
			if (bIE_Edge && bEnabled) {
				oRm.openStart("span");
				oRm.class("sapMBtnFocusDiv");
				oRm.openEnd();
				oRm.close("span");
			}

			// end inner button tag
			oRm.close("span");

			// add tooltip if available
			if (sTooltip) {
				oRm.openStart("span", sButtonId + "-tooltip");
				oRm.class("sapUiInvisibleText");
				oRm.openEnd();
				oRm.text(sTooltip);
				oRm.close("span");
			}

			// end button tag
			oRm.close("div");
		};

		var ToggleSpinButton = ToggleButton.extend("sap.m.internal.ToggleSpinButton", {
			metadata: {
				library: "sap.m",
				properties: {
					label: {type : "string", defaultValue : ""},
					min: {type: "int", defaultValue: 0},
					max: {type: "int", defaultValue: 0}
				}
			},
			renderer: ToggleSpinButtonRenderer
		});

		/********************************************************************************************************/


		/**
		 * Initializes the control.
		 *
		 * @public
		 */
		 TimePickerClocks.prototype.init = function() {
			TimePickerInternals.prototype.init.apply(this, arguments);
			this._activeClock = 0;
		};

		/**
		 * After rendering.
		 *
		 * @private
		 */
		 TimePickerClocks.prototype.onAfterRendering = function() {
			if (!this._clickAttached) {
				this._attachClickEvent();
			}
			this._clockConstraints = this._getClocksConstraints();
		};

		/**
		 * Keyup event handler - used to handle Ctrl and Space keys releasing.
		 *
		 * @param {object} oEvent keydown event
		 * @private
		 */
		 TimePickerClocks.prototype.onkeyup = function(oEvent) {
			var iKey = oEvent.which || oEvent.keyCode;
			if (iKey === KeyCodes.CONTROL) {
				oEvent.preventDefault();
				if (this._clockIndexes.H === this._getActiveClockIndex() && this.getSupport2400() && this._ctrlKeyDown === 1) {
					this._getActiveClock()._toggle2400(true)._markToggleAsSelected(false);
				}
				this._ctrlKeyDown = 0; // 0 = Ctrl is released, 1 = Ctrl is pressed, 2 = Ctrl key down flag must be reset due to value change
			} else if ( iKey === KeyCodes.SPACE) {
				this._spaceKeyDown = false;
			}
		};

		/**
		 * Keydown event handler - used to handle entering of numbers to set as value of currently selected clock.
		 *
		 * @param {object} oEvent keydown event
		 * @private
		 */
		TimePickerClocks.prototype.onkeydown = function(oEvent) {
			var iKey = oEvent.which || oEvent.keyCode,
				iChar = oEvent.key,
				aClocks = this.getAggregation("_clocks"),
				oClock = this._getActiveClock(),
				iActiveClock = this._getActiveClockIndex(),
				bSupport2400 = this.getSupport2400(),
				aNumbersAndColon = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":"],
				oAmPm,
				iHoursVisible,
				iValue,
				sBuffer = "",
				iBuffer,
				iIndex,
				sIndex,
				iMatching = 0,
				iValueMatching = -1,
				bEventTargetOverButtons = oEvent.srcControl && oEvent.srcControl.getMetadata().getName().indexOf("ToggleSpinButton") === -1 ? false : true;

			if (this._clockIndexes.H === iActiveClock && bSupport2400 && iKey === KeyCodes.CONTROL && !this._ctrlKeyDown) {
				oEvent.preventDefault();
				this._ctrlKeyDown = 1; // 0 = Ctrl is released, 1 = Ctrl is pressed, 2 = Ctrl key down flag must be reset due to value change
				oClock._toggle2400(true)._markToggleAsSelected(true);
			} else if (iKey === KeyCodes.ENTER) {
				// check if the ENTER is pressed over the hours/minutes/seconds Buttons and return if it is not
				if (!bEventTargetOverButtons) {
					return;
				}
				// otherwise close the popover and accept the selected time
				if (typeof this._parentAcceptCallback === "function") {
					this._parentAcceptCallback();
				}
			} else if ((iKey === KeyCodes.ARROW_UP || iKey === KeyCodes.ARROW_DOWN) && !oEvent.altKey && !oEvent.metaKey) {
				// Arrows up/down increase/decrease currently active clock
				oClock && oClock.getEnabled() && oClock.modifyValue(iKey === KeyCodes.ARROW_UP);
				oEvent.preventDefault();
			} else if ((iKey === KeyCodes.PAGE_UP || iKey === KeyCodes.PAGE_DOWN) && !oEvent.altKey && !oEvent.metaKey) {
				oEvent.preventDefault();
				if (!oEvent.shiftKey && !oEvent.ctrlKey) {
					// Hours
					oClock = this._getHoursClock();
				} else if (oEvent.shiftKey && !oEvent.ctrlKey) {
					// Minutes
					oClock = this._getMinutesClock();
				} else {
					// Seconds
					oClock = this._getSecondsClock();
				}
				oClock && oClock.getEnabled() && oClock.modifyValue(iKey === KeyCodes.PAGE_UP);
				oClock && this._switchClock(this._getClockIndex(oClock));
			} else if (iKey === KeyCodes.P || iKey === KeyCodes.A) {
				// AM/PM
				oEvent.preventDefault();
				oAmPm = this._getFormatButton();
				oAmPm && oAmPm.setSelectedKey(iKey === KeyCodes.P ? "pm" : "am");
			} else if (iKey === KeyCodes.SPACE && !this._spaceKeyDown) {
				// check if the SPACE is pressed over the hours/minutes/seconds Buttons and return if it is not
				if (!bEventTargetOverButtons) {
					return;
				}
				oEvent.preventDefault();
				this._spaceKeyDown = true;
				iValue = oClock.getSelectedValue();
				iHoursVisible = oClock._get24HoursVisible() ? 24 : 0;
				if (this._clockIndexes.H === iActiveClock && bSupport2400 && iValue !== iHoursVisible && (iValue === 24 || iValue === 0)) {
					oClock.setSelectedValue(iHoursVisible);
				}
				this._kbdBuffer = "";
				this._resetCooldown(true);
				setTimeout(function() {
					this._switchNextClock(true);
				}.bind(this), 0);
			} else if (aNumbersAndColon.indexOf(iChar) !== -1) {
				// direct number enter
				this._exactMatch = null;
				this._resetCooldown(true);

				if (iChar === ":") {
					this._kbdBuffer = "";
					this._resetCooldown(true);
					this._switchNextClock(true);
				} else if (this._clockConstraints[iActiveClock]) {

					sBuffer = this._kbdBuffer + iChar;
					iBuffer = parseInt(sBuffer);

					if (this._clockConstraints[iActiveClock].step === 1) {
						// when the step=1, there is "direct" approach - while typing, the exact value is selected
						if (iBuffer > this._clockConstraints[iActiveClock].max) {
							// value accumulated in the buffer (old entry + new entry) is greater than the clock maximum value,
							// so assign old entry to the current clock and then switch to the next clock, and add new entry as an old value
							aClocks[iActiveClock].setSelectedValue(parseInt(this._kbdBuffer));
							this._switchNextClock();
							this._kbdBuffer = iChar;
							iActiveClock = this._getActiveClockIndex();
							aClocks[iActiveClock].setSelectedValue(parseInt(iChar));
							this._resetCooldown(true);
						} else {
							// value is less than clock's max value, so add new entry to the buffer
							this._kbdBuffer = sBuffer;
							aClocks[iActiveClock].setSelectedValue(parseInt(this._kbdBuffer));
							if (this._kbdBuffer.length === 2 || parseInt(this._kbdBuffer + "0") > this._clockConstraints[iActiveClock].max) {
								// if buffer length is 2, or buffer value + one more (any) number is greater than clock's max value
								// there is no place for more entry - just set buffer as a value, and switch to the next clock
								this._resetCooldown(this._kbdBuffer.length === 2 ? false : true);
								this._kbdBuffer = "";
								this._switchNextClock();
							}
						}
					} else {
						// when the step is > 1, while typing, the exact match is searched, otherwise the first value that starts with entered value, is being selected
						// find matches
						for (iIndex = this._clockConstraints[iActiveClock].min; iIndex <= this._clockConstraints[iActiveClock].max; iIndex++) {
							if (iIndex % this._clockConstraints[iActiveClock].step === 0) {
								sIndex = iIndex.toString();
								if (sBuffer === sIndex.substr(0, sBuffer.length) || iBuffer === iIndex) {
									iMatching++;
									iValueMatching = iMatching === 1 ? iIndex : -1;
									if (iBuffer === iIndex) {
										this._exactMatch = iIndex;
									}
								}
							}
						}
						if (iMatching === 1) {
							// only one item is matching
							aClocks[iActiveClock].setSelectedValue(iValueMatching);
							this._exactMatch = null;
							this._kbdBuffer = "";
							this._resetCooldown(true);
							this._switchNextClock();
						} else if (sBuffer.length === 2) {
							// no matches, but 2 numbers are entered, start again
							this._exactMatch = null;
							this._kbdBuffer = "";
							this._resetCooldown(true);
						} else {
							// no match, add last number to buffer
							this._kbdBuffer = sBuffer;
						}
					}
				}
			}
		};

		/**
		 * Sets the value of the <code>TimePickerClocks</code> container.
		 *
		 * @param {string} sValue The value of the <code>TimePickerClocks</code>
		 * @returns {this} Pointer to the control instance to allow method chaining
		 * @public
		 */
		TimePickerClocks.prototype.setValue = function (sValue) {
			var oHoursClock = this._getHoursClock(),
				sFormat = this._getValueFormatPattern(),
				iIndexOfHH = sFormat.indexOf("HH"),
				iIndexOfH = sFormat.indexOf("H"),
				bHoursClockValueIs24 = oHoursClock && oHoursClock.getSelectedValue() === 24,
				bHoursValueIs24 = TimePickerInternals._isHoursValue24(sValue, iIndexOfHH, iIndexOfH),
				oDate;

			if (bHoursClockValueIs24 && this._isFormatSupport24() && !bHoursValueIs24) {
				sValue = TimePickerInternals._replaceZeroHoursWith24(sValue, iIndexOfHH, iIndexOfH);
			}

			sValue = this.validateProperty("value", sValue);
			this.setProperty("value", sValue, true); // no rerendering

			// convert to date object
			if (sValue) {
				oDate = this._parseValue(bHoursValueIs24 ? TimePickerInternals._replace24HoursWithZero(sValue, iIndexOfHH, iIndexOfH) : sValue);
			}

			if (oDate) {
				this._setTimeValues(oDate, bHoursValueIs24);
			}

			return this;
		};

		/**
		 * Gets the time values from the clocks, as a date object.
		 *
		 * @returns {Date|module:sap/ui/core/date/UI5Date} A date instance
		 * @public
		 */
		TimePickerClocks.prototype.getTimeValues = function() {
			var oHoursClock = this._getHoursClock(),
				oMinutesClock = this._getMinutesClock(),
				oSecondsClock = this._getSecondsClock(),
				oFormatButton = this._getFormatButton(),
				iHours = null,
				sAmpm = null,
				oDateValue = UI5Date.getInstance();

			if (oHoursClock) {
				iHours = parseInt(oHoursClock.getSelectedValue());
			}

			if (oFormatButton) {
				sAmpm = oFormatButton.getSelectedKey();
			}

			if (sAmpm === "am" && iHours === 12) {
				iHours = 0;
			} else if (sAmpm === "pm" && iHours !== 12) {
				iHours += 12;
			}

			if (iHours !== null) {
				oDateValue.setHours(iHours.toString());
			}

			if (oMinutesClock) {
				oDateValue.setMinutes(oMinutesClock.getSelectedValue());
			}

			if (oSecondsClock) {
				oDateValue.setSeconds(oSecondsClock.getSelectedValue());
			}

			return oDateValue;
		};

		/**
		 * Opens first clock.
		 *
		 * @returns {this} Pointer to the control instance to allow method chaining
		 * @public
		 */
		TimePickerClocks.prototype.showFirstClock = function() {
			this._switchClock(0);
			return this;
		};


		/*
		 * PRIVATE API
		 */

		/**
		 * Attaches click events to the clocks control.
		 *
		 * @private
		 */
		 TimePickerClocks.prototype._attachClickEvent = function() {
			var oElement = this.getDomRef();

			oElement.addEventListener("click", jQuery.proxy(this._focusActiveButton, this), false);
			this._clickAttached = true;
		};

		/**
		 * Returns focus to the recently focused input in order to keep entering of numbers.
		 *
		 * @private
		 */
		TimePickerClocks.prototype._focusActiveButton = function() {
			var aButtons = this.getAggregation("_buttons"),
				iActiveClock = this._getActiveClockIndex();

			aButtons && aButtons[iActiveClock] && aButtons[iActiveClock].focus();
		};

		/**
		 * An instance of a callback that is called after accepting the selected value.
		 *
		 * @private
		 */
		 TimePickerClocks.prototype._setAcceptCallback = function(oCallback) {
			this._parentAcceptCallback = oCallback;
		};

		/**
		 * Clears the currently existing cooldown period and starts new one if requested.
		 *
		 * @param {boolean} bStartNew whether to start new cooldown period after clearing previous one
		 * @private
		 */
		 TimePickerClocks.prototype._resetCooldown = function(bStartNew) {
			if (TYPE_COOLDOWN_DELAY === 0) {
				return; // if delay is 0, cooldown is disabled
			}

			if (this._typeCooldownId) {
				clearTimeout(this._typeCooldownId);
			}
			if (bStartNew) {
				this._startCooldown();
			}
		};

		/**
		 * Starts new cooldown period.
		 *
		 * @private
		 */
		 TimePickerClocks.prototype._startCooldown = function() {
			if (TYPE_COOLDOWN_DELAY === 0) {
				return; // if delay is 0, cooldown is disabled
			}

			this._typeCooldownId = setTimeout(function() {
				this._kbdBuffer = "";
				this._typeCooldownId = null;
				if (this._exactMatch) {
					this._getActiveClock().setSelectedValue(this._exactMatch);
					this._exactMatch = null;
				}
				}.bind(this), TYPE_COOLDOWN_DELAY);
		};

		/**
		 * Switches to the next clock that can de focused.
		 *
		 * @param {boolean} bWrapAround whether to start with first clock after reaching the last one, or not
		 * @private
		 */
		 TimePickerClocks.prototype._switchNextClock = function(bWrapAround) {
			var	iActiveClock = this._getActiveClockIndex(),
				aClocks = this.getAggregation("_clocks"),
				iClocksCount = aClocks.length,
				oActiveClock = this._getActiveClock(),
				iStartActiveClock = iActiveClock;

			if (!aClocks) {
				return;
			}

			if (this._clockIndexes.H === iActiveClock && this.getSupport2400()) {
				oActiveClock._save2400State();
				if (oActiveClock.getSelectedValue() === 24) {
					return; // the rest of the clocks are disabled, so do nothing
				}
			}

			do {
				iActiveClock++;
				if (iActiveClock >= iClocksCount) {
					iActiveClock = bWrapAround ? 0 : iClocksCount - 1;
				}
			// false-positive finding of no-unmodified-loop-condition rule
			// eslint-disable-next-line no-unmodified-loop-condition
			} while (!oActiveClock.getEnabled() && iActiveClock !== iStartActiveClock && (bWrapAround || iActiveClock < iClocksCount - 1));

			this._ctrlKeyDown = 0; // 0 = Ctrl is released, 1 = Ctrl is pressed, 2 = Ctrl key down flag must be reset due to value change
			if (iActiveClock !== iStartActiveClock && aClocks[iActiveClock].getEnabled()) {
				this._switchClock(iActiveClock);
			}
		};

		/**
		 * Get some useful constraints of clocks.
		 *
		 * @returns {array} an array with constraints for each clock; each clock constraints object contain its min, max, step and prependZero properties
		 * @private
		 */
		TimePickerClocks.prototype._getClocksConstraints = function() {
			var aClocks = this.getAggregation("_clocks"),
				bSupport2400 = this.getSupport2400(),
				aConstraints = [],
				iMin,
				iMax,
				iStep,
				iReplacement,
				iIndex;

			if (aClocks) {

				for (iIndex = 0; iIndex < aClocks.length; iIndex++) {
					iMin = aClocks[iIndex].getItemMin();
					iMax = aClocks[iIndex]._getMaxValue();
					iStep = aClocks[iIndex].getValueStep();
					iReplacement = aClocks[iIndex].getLastItemReplacement();
					if (iReplacement !== -1 && iReplacement < iMin) {
							iMin = iReplacement;
							if (iMax !== 24 || !bSupport2400) {
								iMax--;
							}
					} else if (iMax === 24 && bSupport2400) {
						iMin = 0;
					}
					aConstraints[iIndex] = {min: iMin, max: iMax, step: iStep, prependZero: aClocks[iIndex].getPrependZero()};
				}

			}

			return aConstraints;
		};

		/**
		 * Returns the index of the active clock.
		 *
		 * @returns {int} Index of the active clock
		 * @private
		 */
		TimePickerClocks.prototype._getActiveClockIndex = function() {
			return this._activeClock || 0;
		};

		/**
		 * Returns the active clock.
		 *
		 * @returns {sap.m.TimePickerClock} active clock object
		 * @private
		 */
		TimePickerClocks.prototype._getActiveClock = function() {
			var iActiveClock = this._getActiveClockIndex(),
				aClocks = this.getAggregation("_clocks");

			return aClocks && aClocks[iActiveClock] ? aClocks[iActiveClock] : null;
		};

		/**
		 * Set what clocks show.
		 *
		 * @param {object} oDate date instance
		 * @param {boolean} bHoursValueIs24 whether the hours value is 24 or not
		 * @private
		 */
		TimePickerClocks.prototype._setTimeValues = function(oDate, bHoursValueIs24) {
			var oHoursClock = this._getHoursClock(),
				oMinutesClock = this._getMinutesClock(),
				oSecondsClock = this._getSecondsClock(),
				oMinutesButton = this._getMinutesButton(),
				oSecondsButton = this._getSecondsButton(),
				oFormatButton = this._getFormatButton(),
				sValueFormat = this.getValueFormat(),
				iHours,
				sAmPm = null,
				bTwelveHourFormatDueToB = !this._isFormatSupport24() && sValueFormat.indexOf("B") !== -1,
				bTwelveHourFormatDueToA = sValueFormat.indexOf("a") !== -1 || sValueFormat === "";

			oDate = oDate || UI5Date.getInstance();

			// Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
			// because Date object in the test is different than the Date object in the application (due to the iframe).
			if (Object.prototype.toString.call(oDate) !== "[object Date]" || isNaN(oDate)) {
				throw new Error("Date must be a JavaScript or UI5Date date object; " + this);
			}

			if (!bHoursValueIs24) {
				// convert date object to value
				var sValue = this._formatValue(oDate, true);

				// set the property in any case but check validity on output
				this.setProperty("value", sValue, true); // no rerendering
				iHours = oDate.getHours();
			} else {
				iHours = 24;
			}

			if ((bTwelveHourFormatDueToA || bTwelveHourFormatDueToB) && oFormatButton) {
				sAmPm = iHours >= 12 ? "pm" : "am";
				iHours = (iHours > 12) ? iHours - 12 : iHours;
				iHours = (iHours === 0 ? 12 : iHours);
				oFormatButton && oFormatButton.setSelectedKey(sAmPm);
			}

			oHoursClock && oHoursClock.setSelectedValue(iHours);
			oMinutesClock && oMinutesClock.setSelectedValue(oDate.getMinutes());
			oSecondsClock && oSecondsClock.setSelectedValue(oDate.getSeconds());

			oHoursClock && this.getSupport2400() && oHoursClock._save2400State();

			if (bHoursValueIs24) {
				oMinutesClock && oMinutesClock.setSelectedValue(0).setEnabled(false);
				oSecondsClock && oSecondsClock.setSelectedValue(0).setEnabled(false);
				oMinutesButton && oMinutesButton.setEnabled(false);
				oSecondsButton && oSecondsButton.setEnabled(false);
			} else {
				oMinutesClock && oMinutesClock.setEnabled(true);
				oSecondsClock && oSecondsClock.setEnabled(true);
				oMinutesButton && oMinutesButton.setEnabled(true);
				oSecondsButton && oSecondsButton.setEnabled(true);
			}
		};

		/**
		 * Returns the clock for the hours.
		 *
		 * @returns {sap.m.TimePickerClock|null} Hours clock
		 * @private
		 */
		TimePickerClocks.prototype._getHoursClock = function() {
			var oClocks = this.getAggregation("_clocks");
			return oClocks && this._clockIndexes && oClocks[this._clockIndexes.H] ? oClocks[this._clockIndexes.H] : null;
		};

		/**
		 * Returns the clock for the minutes.
		 *
		 * @returns {sap.m.TimePickerClock|null} Minutes clock
		 * @private
		 */
		TimePickerClocks.prototype._getMinutesClock = function() {
			var oClocks = this.getAggregation("_clocks");
			return oClocks && this._clockIndexes && oClocks[this._clockIndexes.M] ? oClocks[this._clockIndexes.M] : null;
		};

		/**
		 * Returns the clock for the seconds.
		 *
		 * @returns {sap.m.TimePickerClock|null} Seconds clock
		 * @private
		 */
		TimePickerClocks.prototype._getSecondsClock = function() {
			var oClocks = this.getAggregation("_clocks");
			return oClocks && this._clockIndexes && oClocks[this._clockIndexes.S] ? oClocks[this._clockIndexes.S] : null;
		};

		/**
		 * Returns the button that displays hours.
		 *
		 * @returns {sap.m.Button|null} button that displays hours
		 * @private
		 */
		TimePickerClocks.prototype._getHoursButton = function() {
			var oButtons = this.getAggregation("_buttons");
			return oButtons && this._clockIndexes && oButtons[this._clockIndexes.H] ? oButtons[this._clockIndexes.H] : null;
		};

		/**
		 * Returns the button that displays minutes.
		 *
		 * @returns {sap.m.Button|null} button that displays minutes
		 * @private
		 */
		TimePickerClocks.prototype._getMinutesButton = function() {
			var oButtons = this.getAggregation("_buttons");
			return oButtons && this._clockIndexes && oButtons[this._clockIndexes.M] ? oButtons[this._clockIndexes.M] : null;
		};

		/**
		 * Returns the button that displays seconds.
		 *
		 * @returns {sap.m.Button|null} button that displays seconds
		 * @private
		 */
		TimePickerClocks.prototype._getSecondsButton = function() {
			var oButtons = this.getAggregation("_buttons");
			return oButtons && this._clockIndexes && oButtons[this._clockIndexes.S] ? oButtons[this._clockIndexes.S] : null;
		};

		/**
		 * Destroys the controls stored in internal aggregations.
		 *
		 * @private
		 */
		TimePickerClocks.prototype._destroyControls = function() {
			this.destroyAggregation("_buttons");
			this.destroyAggregation("_clocks");
			this.destroyAggregation("_buttonAmPm");
		};

		/**
		 * Creates the controls according to <code>displayFormat</code>.
		 *
		 * @private
		 */
		TimePickerClocks.prototype._createControls = function() {
			var sFormat = this._getDisplayFormatPattern(),
				sId = this.getId(),
				bFormatSupport24 = this._isFormatSupport24(),
				bSupport2400 = this.getSupport2400(),
				iSelectedHours = 0,
				iSelectedMinutes = 0,
				iSelectedSeconds = 0,
				sSelectedAmPm = "",
				iLastReplacement = -1,
				iIndexOfHH,
				iIndexOfH,
				bHoursValueIs24,
				aButtons,
				aClocks,
				iIndex = 0,
				bHours,
				iHoursMin,
				iHoursMax,
				bPrependZero = false,
				sValue,
				oDate;

			this._clockIndexes = {};
			if (sFormat === undefined) {
				return;
			}

			iIndexOfHH = sFormat.indexOf("HH");
			iIndexOfH = sFormat.indexOf("H");

			if (iIndexOfHH !== -1) {
				bHours = true;
				bPrependZero = true;
				iLastReplacement = (bSupport2400) ? 24 : 0;
				iHoursMin = 0;
				iHoursMax = 23;
			} else if (iIndexOfH !== -1) {
				bHours = true;
				iLastReplacement = (bSupport2400) ? 24 : 0;
				iHoursMin = 0;
				iHoursMax = 23;
			} else if (sFormat.indexOf("hh") !== -1) {
				bHours = true;
				bPrependZero = true;
				iHoursMin = 1;
				iHoursMax = 12;
			} else if (sFormat.indexOf("h") !== -1) {
				bHours = true;
				iHoursMin = 1;
				iHoursMax = 12;
			}

			if (bHours) {
				// add Hours clock
				this.addAggregation("_clocks", new TimePickerClock(sId + "-clockH", {
					label: this._oResourceBundle.getText("TIMEPICKER_LBL_HOURS"),
					selectedValue: iSelectedHours,
					itemMin: 1,
					itemMax: 12,
					valueStep: 1,
					displayStep: 1,
					innerItems: bFormatSupport24,
					lastItemReplacement: iLastReplacement,
					prependZero: bPrependZero,
					support2400: bSupport2400
				}));
				// add Hours button
				if (bSupport2400) {
					iHoursMax++;
				}
				this.addAggregation("_buttons", new ToggleSpinButton(sId + "-btnH", {
					label: this._oResourceBundle.getText("TIMEPICKER_LBL_HOURS"),
					min: iHoursMin,
					max: iHoursMax
				}));
				this._clockIndexes.H = iIndex++;
			}

			if (sFormat.indexOf("m") !== -1) {
				if (sFormat.indexOf("mm") !== -1) {
					iLastReplacement = 0;
					bPrependZero = true;
				} else {
					iLastReplacement = 0;
					bPrependZero = false;
				}
				// add Minutes clock
				this.addAggregation("_clocks", new TimePickerClock(sId + "-clockM", {
					label: this._oResourceBundle.getText("TIMEPICKER_LBL_MINUTES"),
					selectedValue: iSelectedMinutes,
					itemMin: 1,
					itemMax: 60,
					valueStep: this.getMinutesStep(),
					lastItemReplacement: iLastReplacement,
					prependZero: bPrependZero
				}));
				// add Minutes button
				this.addAggregation("_buttons", new ToggleSpinButton(sId + "-btnM", {
					label: this._oResourceBundle.getText("TIMEPICKER_LBL_MINUTES"),
					min: 0,
					max: 59
				}));
				this._clockIndexes.M = iIndex++;
			}

			if (sFormat.indexOf("s") !== -1) {
				if (sFormat.indexOf("ss") !== -1) {
					iLastReplacement = 0;
					bPrependZero = true;
				} else {
					iLastReplacement = 0;
					bPrependZero = false;
				}
				// add Seconds clock
				this.addAggregation("_clocks", new TimePickerClock(sId + "-clockS", {
					label: this._oResourceBundle.getText("TIMEPICKER_LBL_SECONDS"),
					selectedValue: iSelectedSeconds,
					itemMin: 1,
					itemMax: 60,
					valueStep: this.getSecondsStep(),
					lastItemReplacement: iLastReplacement,
					prependZero: bPrependZero
				}));
				// add Seconds button
				this.addAggregation("_buttons", new ToggleSpinButton(sId + "-btnS", {
					label: this._oResourceBundle.getText("TIMEPICKER_LBL_SECONDS"),
					min: 0,
					max: 59
				}));
				this._clockIndexes.S = iIndex++;
			}

			if (sFormat.indexOf("a") !== -1 || (sFormat.indexOf("B") !== -1 && !this._isFormatSupport24())) {
				// add AM/PM segmented button
				this.setAggregation("_buttonAmPm", new SegmentedButton(sId + "-format", {
					items: [
						new SegmentedButtonItem({
							text: this._sAM,
							key: "am"
						}),
						new SegmentedButtonItem({
							text: this._sPM,
							key: "pm"
						})
					],
					selectedKey: sSelectedAmPm,
					tooltip: this._oResourceBundle.getText("TIMEPICKER_AMPM_BUTTON_TOOLTIP")
				}));
			}

			if (!this.getAggregation("_nowButton")) {
				this.setAggregation("_nowButton", this._getCurrentTimeButton());
			}

			aButtons = this.getAggregation("_buttons");
			aClocks = this.getAggregation("_clocks");
			this._clockCount = aClocks ? aClocks.length : 0;
			if (this._clockCount) {
				this._switchClock(0);
			}

			// attach events to the controls
			for (iIndex = 0; iIndex < this._clockCount; iIndex++) {
				this._attachEvents(aClocks[iIndex], aButtons[iIndex]);
			}

			// restore control values when recreating controls
			sValue = this.getValue();
			if (sValue) {
				bHoursValueIs24 = TimePickerInternals._isHoursValue24(sValue, iIndexOfHH, iIndexOfH);
				oDate = this._parseValue(bHoursValueIs24 ? TimePickerInternals._replace24HoursWithZero(sValue, iIndexOfHH, iIndexOfH) : sValue);
				if (oDate) {
					this._setTimeValues(oDate, bHoursValueIs24);
				}
			}

		};

		/**
		 * Attaches events of the clocks.
		 *
		 * @param {sap.m.TimePickerClock} oClock Clock to attach events to
		 * @param {sap.m.internal.ToggleSpinButton} oButton button to attach events to
		 * @private
		 */
		TimePickerClocks.prototype._attachEvents = function(oClock, oButton) {

			oClock.attachChange(function(oEvent) {
				var iSelected = oEvent.getParameter("value"),
					bIsFinal = oEvent.getParameter("finalChange"),
					sValue = oEvent.getParameter("stringValue"),
					aButtons = this.getAggregation("_buttons"),
					sClockSuffix = oEvent.getParameter("id").slice(-1);

				// update corresponding button
				aButtons[this._clockIndexes[sClockSuffix]] && aButtons[this._clockIndexes[sClockSuffix]].setText(sValue).focus();

				// "soft" change event (only for Hours change)
				if (!bIsFinal) {
					if (sClockSuffix === "H") {
						this._handleHoursChange(oEvent);
					}
					return;
				}

				// switch to the next clock (if possible)
				if (!this.getSupport2400() || iSelected !== 24) {
					setTimeout(function() {
						this._switchNextClock();
					}.bind(this), 0);
				}
			}.bind(this));

			oButton.attachPress(function(oEvent) {
				var sButtonSuffix = oEvent.getParameter("id").slice(-1),
					aClocks = this.getAggregation("_clocks");

				if (aClocks[this._clockIndexes[sButtonSuffix]].getEnabled()) {
					this._switchClock(this._clockIndexes[sButtonSuffix]);
				}
			}.bind(this));

			oButton.onfocusin = function(oEvent) {
				var sButtonSuffix = oEvent.target.id.slice(-1),
					aClocks = this.getAggregation("_clocks");

				if (aClocks[this._clockIndexes[sButtonSuffix]].getEnabled()) {
					this._switchClock(this._clockIndexes[sButtonSuffix]);
				}
			}.bind(this);

		};

		/**
		 * Switches to the specific clock.
		 *
		 * @param {int} iClockIndex the index (in _clocks aggregation) of the clock
		 * @private
		 */
		TimePickerClocks.prototype._switchClock = function(iClockIndex) {
			var aClocks = this.getAggregation("_clocks"),
				aButtons = this.getAggregation("_buttons"),
				oActiveClock = this._getActiveClock();

			if (iClockIndex !== this._activeClock) {
				oActiveClock._save2400State();
			}

			if (this._activeClock !== undefined) {
				aButtons[this._activeClock].setPressed(false);
				aClocks[this._activeClock].removeStyleClass("sapMTPCActive");
			}

			aClocks[iClockIndex].addStyleClass("sapMTPCActive");
			aButtons[iClockIndex].setPressed(true);
			aButtons[iClockIndex].focus();
			this._activeClock = iClockIndex;
		};

		/**
		 * Returns the index (in _clocks aggreagtion) of specific clock.
		 *
		 * @param {sap.m.TimePickerClock} oClock a clock to return index of
		 * @returns {int} index of the clock
		 * @private
		 */
		TimePickerClocks.prototype._getClockIndex = function(oClock) {
			var sSuffix = oClock.getId().slice(-1);

			return this._clockIndexes[sSuffix];
		};

		/**
		 * Handles minutes and seconds when hours are changed.
		 * When hours are 24, then the other buttons must be set to 0 and appear disabled.
		 *
		 * @param {object} oEvent change event
		 * @private
		 */
		TimePickerClocks.prototype._handleHoursChange = function(oEvent) {
			var iValue = parseInt(oEvent.getParameter("value")),
				oMinutesClock = this._getMinutesClock(),
				oSecondsClock = this._getSecondsClock(),
				oMinutesButton = this._getMinutesButton(),
				oSecondsButton = this._getSecondsButton();

			if (!this.getSupport2400()) {
				return;
			}

			this._ctrlKeyDown = this._ctrlKeyDown ? 2 : 0; // 0 = Ctrl is released, 1 = Ctrl is pressed, 2 = Ctrl key down flag must be reset due to value change
			if (iValue === 24) {
				// Store last values
				if (oMinutesClock && oMinutesClock.getEnabled()) {
					this._sMinutes = oMinutesClock.getSelectedValue();
					this._setControlValueAndEnabled(oMinutesClock, oMinutesButton, 0, false);
				}
				if (oSecondsClock && oSecondsClock.getEnabled()) {
					this._sSeconds = oSecondsClock.getSelectedValue();
					this._setControlValueAndEnabled(oSecondsClock, oSecondsButton, 0, false);
				}
			} else {
				// restore last values
				if (oMinutesClock && !oMinutesClock.getEnabled()) {
					this._setControlValueAndEnabled(oMinutesClock, oMinutesButton, this._sMinutes, true); //set again the last value before snapping the hours to 24
				}
				if (oSecondsClock && !oSecondsClock.getEnabled()) {
					this._setControlValueAndEnabled(oSecondsClock, oSecondsButton, parseInt(this._sSeconds), true); // set again the last value before snapping the hours to 24
				}
			}
			this._getHoursButton().focus();
		};

		/**
		 * Sets <code>value</code> and <code>enabled</code> properties of a clock and corresponding button.
		 *
		 * @param {sap.m.TimePickerClock} oClock A clock which value and enabled properties are being set
		 * @param {sap.m.ToggleButton} oButton A button which enabled property is being set
		 * @param {int|string} vValue A value to be set
		 * @param {boolean} bEnabled An enabled state
		 * @private
		 */
		TimePickerClocks.prototype._setControlValueAndEnabled = function (oClock, oButton, vValue, bEnabled) {
			oClock.setSelectedValue(parseInt(vValue));
			oClock.setEnabled(bEnabled);
			oButton.setEnabled(bEnabled);
		};

		/**
		 * Return a value as string, formatted and prepended with zero if necessary.
		 *
		 * @param {int} iNumber A number to format
		 * @param {boolean} bPrependZero Whether to prepend with zero or not
		 * @param {int} iMax Max value of the number for this clock
		 * @param {string} sReplacement A string to replace the maximum value
		 * @returns {string} Formatted value
		 * @private
		 */
		TimePickerClocks.prototype._formatNumberToString = function(iNumber, bPrependZero, iMax, sReplacement) {
			var sNumber;
			if (bPrependZero && iNumber < 10) {
				sNumber = iNumber.toString().padStart(2, "0");
			} else if (iNumber === iMax && sReplacement !== "") {
				sNumber = sReplacement;
			} else {
				sNumber = iNumber.toString();
			}
			return sNumber;
		};

		return TimePickerClocks;
	});