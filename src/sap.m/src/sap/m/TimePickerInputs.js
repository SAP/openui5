/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/library",
	"./TimePickerInternals",
	"./Input",
	"./InputRenderer",
	"sap/ui/core/Renderer",
	"./SegmentedButton",
	"./SegmentedButtonItem",
	"sap/ui/core/InvisibleText",
	"sap/ui/events/KeyCodes",
	"./TimePickerInputsRenderer",
	"sap/ui/thirdparty/jquery"
],
	function(
		library,
		coreLibrary,
		TimePickerInternals,
		Input,
		InputRenderer,
		Renderer,
		SegmentedButton,
		SegmentedButtonItem,
		InvisibleText,
		KeyCodes,
		TimePickerInputsRenderer,
		jQuery
	) {
		"use strict";

		var InputType = library.InputType,
			TextAlign = coreLibrary.TextAlign,
			TYPE_COOLDOWN_DELAY = 1000;

		/**
		 * Constructor for a new <code>TimePickerInputs</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A picker Inputs container control used inside the {@link sap.m.TimePicker}.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.90
		 * @alias sap.m.TimePickerInputs
		 */

		var TimePickerInputs = TimePickerInternals.extend("sap.m.TimePickerInputs", /** @lends sap.m.TimePickerInputs.prototype */ {
			metadata : {
				aggregations: {
					/**
					 * Holds the inner Inputs.
					 */
					_inputs: { type: "sap.m.Input", multiple: true, visibility: "hidden" },
					/**
					 * Holds the invisible texts for labelling the buttons.
					 */
					 _texts: { type: "sap.ui.core.InvisibleText", multiple: true, visibility: "hidden" }
				}
			},

			renderer: TimePickerInputsRenderer
		});

		/**
		 * After rendering.
		 *
		 * @private
		 */
		TimePickerInputs.prototype.onAfterRendering = function() {
			if (!this._clickAttached) {
				this._attachClickEvent();
			}
		};

		/**
		 * Attaches click events to the clocks control in order to keep entering of numbers.
		 *
		 * @private
		 */
		TimePickerInputs.prototype._attachClickEvent = function() {
			var oElement = this.getDomRef();

			oElement.addEventListener("click", jQuery.proxy(this._clickHandler, this), false);
			this._clickAttached = true;
		};

		/**
		 * Returns focus to the recently focused input in order to keep entering of numbers.
		 *
		 * @private
		 */
		TimePickerInputs.prototype._clickHandler = function(oEvent) {
			var aInputs = this.getAggregation("_inputs"),
				iActiveInput = this._getActiveInput();

			if (iActiveInput === -1 ) {
				iActiveInput = this._lastActiveInput;
			}

			!document.activeElement.classList.contains("sapMSegBBtn") && aInputs && aInputs[iActiveInput] && aInputs[iActiveInput].focus();
		};

		/**
		 * Keydown event handler - used to handle entering of numbers in focused inputs and switch focused inputs when necessary.
		 * Also filters unwanted characters.
		 *
		 * @param {object} oEvent keydown event
		 * @private
		 */
		TimePickerInputs.prototype.onkeydown = function(oEvent) {
			var iKey = oEvent.which || oEvent.keyCode,
				iChar = oEvent.key,
				oPicker,
				aInputs = this.getAggregation("_inputs"),
				iActiveInput = this._getActiveInput(),
				sActiveIndex = iActiveInput > -1 && aInputs[iActiveInput] ? aInputs[iActiveInput].getId().slice(-1) : "",
				aNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
				sValue,
				sBuffer = "",
				iBuffer,
				bIs24Hours = false,
				oInput,
				oAmPm;

			if (iChar === ":") {
				oEvent.preventDefault();
				this._kbdBuffer = "";
				this._resetCooldown(true);
				this._switchNextInput(true);
			} else if (iKey === KeyCodes.ENTER) {
				// Enter - close the popover and accept the selected time
				oPicker = this.getParent().getParent();
				oPicker && oPicker._handleNumericOkPress();
			} else if (iKey === KeyCodes.P || iKey === KeyCodes.A) {
				// AM/PM
				oEvent.preventDefault();
				oAmPm = this._getFormatButton();
				oAmPm && oAmPm.setSelectedKey(iKey === KeyCodes.P ? "pm" : "am");
			} else if ((iKey === KeyCodes.ARROW_UP || iKey === KeyCodes.ARROW_DOWN) && !oEvent.altKey && !oEvent.metaKey) {
				// Arrows up/down increase/decrease currently active input
				oEvent.preventDefault();
				oInput = this._getActiveInputObject();
				oInput && oInput.getEnabled() && this._keyboardUpdateInput(oInput, iKey === KeyCodes.ARROW_UP ? 1 : -1);
				if (sActiveIndex === "H") {
					this._handleHoursChange(oInput.getValue());
				}
			} else if (sActiveIndex !== "" && aNumbers.indexOf(iChar) !== -1) {
				// direct number enter
				oEvent.preventDefault();
				sBuffer = this._kbdBuffer + iChar;
				iBuffer = parseInt(sBuffer);

				this._resetCooldown(true);

				if (iBuffer > this._inputsProperties[sActiveIndex].max) {
					// value accumulated in the buffer (old entry + new entry) is greater than the input maximum value,
					// so assign old entry to the current inut and then switch to the next input, and add new entry as an old value
					sValue = this._formatNumberToString(parseInt(this._kbdBuffer), this._inputsProperties[sActiveIndex].prependZero, this._inputsProperties[sActiveIndex].max, "");
					aInputs[iActiveInput].setValue(sValue);
					this._handleHoursChange(sValue);
					this._inputsProperties[sActiveIndex].value = sValue;
					setTimeout(function() {
						this._switchNextInput();
						this._kbdBuffer = iChar;
						iActiveInput = this._getActiveInput();
						sActiveIndex = aInputs[iActiveInput].getId().slice(-1);
						sValue = this._formatNumberToString(parseInt(iChar), this._inputsProperties[sActiveIndex].prependZero, this._inputsProperties[sActiveIndex].max, "");
						aInputs[iActiveInput].setValue(sValue);
						this._inputsProperties[sActiveIndex].value = sValue;
						this._resetCooldown(true);
					}.bind(this), 0);
				} else {
					// value is less than clock's max value, so add new entry to the buffer
					this._kbdBuffer = sBuffer;
					sValue = this._formatNumberToString(parseInt(this._kbdBuffer), this._inputsProperties[sActiveIndex].prependZero, this._inputsProperties[sActiveIndex].max, "");
					aInputs[iActiveInput].setValue(sValue);
					this._inputsProperties[sActiveIndex].value = sValue;
					if (this._kbdBuffer.length === 2 || parseInt(this._kbdBuffer + "0") > this._inputsProperties[sActiveIndex].max) {
						// if buffer length is 2, or buffer value + one more (any) number is greater than clock's max value
						// there is no place for more entry - just set buffer as a value, and switch to the next clock
						this._resetCooldown(this._kbdBuffer.length === 2 ? false : true);
						if (sActiveIndex === "H") {
							// check for "24" in hours
							bIs24Hours = this._handleHoursChange(this._kbdBuffer);
						}
						this._kbdBuffer = "";
						if (!bIs24Hours || sActiveIndex !== "H") {
							setTimeout(function() {
								this._switchNextInput();
							}.bind(this), 0);
						}
					}
				}
			} else if (iKey !== KeyCodes.ARROW_LEFT && iKey !== KeyCodes.ARROW_RIGHT && iKey !== KeyCodes.BACKSPACE && iKey !== KeyCodes.DELETE && iKey !== KeyCodes.TAB) {
				// omit unwanted characters
				oEvent.preventDefault();
			}
		};

		/**
		 * Updates the value of an input as a result of keyboard interaction (increase/decrease) with arrows.
		 *
		 * @param {sap.m.Input} oInput a clock to update its value by keyboard interaction
		 * @param {int} iDirection direction of the value update: -1=decrease, 1=increase
		 * @private
		 */
		 TimePickerInputs.prototype._keyboardUpdateInput = function(oInput, iDirection) {

			var	iSelected = parseInt(oInput.getValue()),
				sActiveIndex = oInput.getId().slice(-1),
				iMin = this._inputsProperties[sActiveIndex].min,
				iMax = this._inputsProperties[sActiveIndex].max,
				iStep = this._inputsProperties[sActiveIndex].step;

			iSelected += iDirection * iStep;
			if (iSelected > iMax) {
				iSelected = iMax;
			} else if (iSelected < iMin) {
				iSelected = iMin;
			}
			oInput.setValue(this._formatNumberToString(iSelected, this._inputsProperties[sActiveIndex].prependZero, this._inputsProperties[sActiveIndex].max, ""));
		};

		/**
		 * Clears the currently existing cooldown period and starts new one if requested.
		 *
		 * @param {boolean} bStartNew whether to start new cooldown period after clearing previous one
		 * @private
		 */
		TimePickerInputs.prototype._resetCooldown = function(bStartNew) {
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
		 TimePickerInputs.prototype._startCooldown = function() {
			this._typeCooldownId = setTimeout(function() {
				var aInputs = this.getAggregation("_inputs");

				this._kbdBuffer = "";
				this._typeCooldownId = null;
				aInputs && aInputs[this._activeInput] && aInputs[this._activeInput].getDomRef("inner").select();
			}.bind(this), TYPE_COOLDOWN_DELAY);
		};

		/**
		 * Sets the value of the <code>TimePickerInputs</code> container.
		 *
		 * @param {string} sValue The value of the <code>TimePickerInputs</code>
		 * @returns {this} Pointer to the control instance to allow method chaining
		 * @public
		 */
		 TimePickerInputs.prototype.setValue = function (sValue) {
			var oHoursInput = this._getHoursInput(),
				sFormat = this._getValueFormatPattern(),
				iIndexOfHH = sFormat.indexOf("HH"),
				iIndexOfH = sFormat.indexOf("H"),
				bHoursClockValueIs24 = oHoursInput && oHoursInput.getValue() === "24",
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
		 * Switches to the next input that can de focused.
		 *
		 * @param {boolean} bWrapAround whether to start with first clock after reaching the last one, or not
		 * @private
		 */
		TimePickerInputs.prototype._switchNextInput = function(bWrapAround) {
			var iActiveInput = this._getActiveInput(),
				aInputs = this.getAggregation("_inputs"),
				iInputsCount = aInputs.length,
				iStartActiveInput = iActiveInput;

			if (!aInputs) {
				return;
			}

			do {
				iActiveInput++;
				if (iActiveInput >= aInputs.length) {
					iActiveInput = bWrapAround ? 0 : iInputsCount - 1;
				}
			// false-positive finding of no-unmodified-loop-condition rule
			// eslint-disable-next-line no-unmodified-loop-condition
			} while (!aInputs[iActiveInput].getEnabled() && iActiveInput !== iStartActiveInput && (bWrapAround || iActiveInput < iInputsCount - 1));

			if (iActiveInput !== iStartActiveInput && aInputs[iActiveInput].getEnabled()) {
				this._switchInput(iActiveInput);
			}
		};

		/**
		 * Gets the time values from the clocks, as a date object.
		 *
		 * @returns {Date} A JavaScript date object
		 * @public
		 */
		TimePickerInputs.prototype.getTimeValues = function() {
			var oHoursInput = this._getHoursInput(),
				oMinutesInput = this._getMinutesInput(),
				oSecondsInput = this._getSecondsInput(),
				oFormatButton = this._getFormatButton(),
				iHours = null,
				sAmpm = null,
				oDateValue = new Date();

			if (oHoursInput) {
				iHours = parseInt(oHoursInput.getValue());
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

			if (oMinutesInput) {
				oDateValue.setMinutes(oMinutesInput.getValue());
			}

			if (oSecondsInput) {
				oDateValue.setSeconds(oSecondsInput.getValue());
			}

			return oDateValue;
		};


		/*
		 * PRIVATE API
		 */

		/**
		 * Returns the index of the active input.
		 *
		 * @returns {int} Index of the active input
		 * @private
		 */
		TimePickerInputs.prototype._getActiveInput = function() {
			return this._activeInput;
		};

		/**
		 * Returns the active input as an object.
		 *
		 * @returns {sap.m.TimePickerClock} active input object
		 * @private
		 */
		TimePickerInputs.prototype._getActiveInputObject = function() {
			var iActiveInput = this._getActiveInput(),
				aInputs = this.getAggregation("_inputs");

			return aInputs && aInputs[iActiveInput] ? aInputs[iActiveInput] : null;
		};

		/**
		 * Set what inputs show.
		 *
		 * @param {object} oDate JavaScript date object
		 * @param {boolean} bHoursValueIs24 whether the hours value is 24 or not
		 * @private
		 */
		TimePickerInputs.prototype._setTimeValues = function(oDate, bHoursValueIs24) {
			var oHoursInput = this._getHoursInput(),
				oMinutesInput = this._getMinutesInput(),
				oSecondsInput = this._getSecondsInput(),
				oFormatButton = this._getFormatButton(),
				sValueFormat = this.getValueFormat(),
				iHours,
				sAmPm = null;

			oDate = oDate || new Date();

			// Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
			// because Date object in the test is different than the Date object in the application (due to the iframe).
			if (Object.prototype.toString.call(oDate) !== "[object Date]" || isNaN(oDate)) {
				throw new Error("Date must be a JavaScript date object; " + this);
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

			if ((sValueFormat.indexOf("a") !== -1 || sValueFormat === "") && oFormatButton) {
				sAmPm = iHours >= 12 ? "pm" : "am";
				iHours = (iHours > 12) ? iHours - 12 : iHours;
				iHours = (iHours === 0 ? 12 : iHours);
			}

			oHoursInput && oHoursInput.setValue(this._formatNumberToString(iHours, this._inputsProperties.H.prependZero, this._inputsProperties.H.max, ""));
			oMinutesInput && oMinutesInput.setValue(this._formatNumberToString(oDate.getMinutes(), this._inputsProperties.M.prependZero, this._inputsProperties.M.max, ""));
			oSecondsInput && oSecondsInput.setValue(this._formatNumberToString(oDate.getSeconds(), this._inputsProperties.S.prependZero, this._inputsProperties.S.max, ""));

			oFormatButton && oFormatButton.setSelectedKey(sAmPm);

			if (bHoursValueIs24) {
				oMinutesInput && oMinutesInput.setValue("00").setEnabled(false);
				oSecondsInput && oSecondsInput.setValue("00").setEnabled(false);
			} else {
				oMinutesInput && oMinutesInput.setEnabled(true);
				oSecondsInput && oSecondsInput.setEnabled(true);
			}


			if (oHoursInput) {
				this._inputsProperties.H.value = iHours;
			}
			if (oMinutesInput) {
				this._inputsProperties.M.value = oMinutesInput.getValue();
			}
			if (oSecondsInput) {
				this._inputsProperties.S.value = oSecondsInput.getValue();
			}
		};

		/**
		 * Returns the input for the hours.
		 *
		 * @returns {sap.m.Input|null} Hours input
		 * @private
		 */
		TimePickerInputs.prototype._getHoursInput = function() {
			var oInputs = this.getAggregation("_inputs");
			return oInputs && this._inputIndexes && oInputs[this._inputIndexes.H] ? oInputs[this._inputIndexes.H] : null;
		};

		/**
		 * Returns the input for the minutes.
		 *
		 * @returns {sap.m.Input|null} Minutes input
		 * @private
		 */
		TimePickerInputs.prototype._getMinutesInput = function() {
			var oInputs = this.getAggregation("_inputs");
			return oInputs && this._inputIndexes && oInputs[this._inputIndexes.M] ? oInputs[this._inputIndexes.M] : null;
		};

		/**
		 * Returns the input for the seconds.
		 *
		 * @returns {sap.m.Input|null} Seconds input
		 * @private
		 */
		TimePickerInputs.prototype._getSecondsInput = function() {
			var oInputs = this.getAggregation("_inputs");
			return oInputs && this._inputIndexes && oInputs[this._inputIndexes.S] ? oInputs[this._inputIndexes.S] : null;
		};

		/**
		 * Destroys the controls stored in internal aggregations.
		 *
		 * @private
		 */
		TimePickerInputs.prototype._destroyControls = function() {
			this.destroyAggregation("_inputs");
			this.destroyAggregation("_buttonAmPm");
		};

		/**
		 * Creates the controls according to <code>displayFormat</code>.
		 *
		 * @private
		 */
		TimePickerInputs.prototype._createControls = function() {
			var sFormat = this._getDisplayFormatPattern(),
				sId = this.getId(),
				bFormatSupport24 = this._isFormatSupport24(),
				bSupport2400 = this.getSupport2400(),
				iSelectedHours = 0,
				iSelectedMinutes = 0,
				iSelectedSeconds = 0,
				sSelectedAmPm = "",
				aTexts = this.getAggregation("_texts"),
				iMin = 0,
				iMax,
				aInputs,
				iIndex = 0,
				bHours,
				bPrependZero = false,
				iIndexOfHH,
				iIndexOfH,
				bHoursValueIs24,
				sValue,
				oDate;

			this._inputIndexes = {};
			this._inputsProperties = {};
			if (sFormat === undefined) {
				return;
			}

			iIndexOfHH = sFormat.indexOf("HH");
			iIndexOfH = sFormat.indexOf("H");

			if (!aTexts) {
				this.addAggregation("_texts", new InvisibleText(sId + "-textH", {text: this._oResourceBundle.getText("TIMEPICKER_INPUTS_ENTER_HOURS")}).toStatic());
				this.addAggregation("_texts", new InvisibleText(sId + "-textM", {text: this._oResourceBundle.getText("TIMEPICKER_INPUTS_ENTER_MINUTES")}).toStatic());
				this.addAggregation("_texts", new InvisibleText(sId + "-textS", {text: this._oResourceBundle.getText("TIMEPICKER_INPUTS_ENTER_SECONDS")}).toStatic());
			}

			if (iIndexOfHH !== -1) {
				bHours = true;
				bPrependZero = true;
				iMax = (bSupport2400) ? 24 : 23;
			} else if (iIndexOfH !== -1) {
				bHours = true;
				iMax = (bSupport2400) ? 24 : 23;
			} else if (sFormat.indexOf("hh") !== -1) {
				bHours = true;
				bPrependZero = true;
				iMin = 1;
				iMax = 12;
			} else if (sFormat.indexOf("h") !== -1) {
				bHours = true;
				iMin = 1;
				iMax = 12;
			}

			if (bHours) {
				// add Hours input
				this.addAggregation("_inputs", new CustomNumericInput(sId + "-inputH", {
					type: InputType.Number,
					tooltip: this._oResourceBundle.getText("TIMEPICKER_INPUTS_ENTER_HOURS"),
					textAlign: TextAlign.Center,
					width: "2.875rem",
					value: iSelectedHours,
					ariaLabelledBy: sId + "-textH"
				}));
				this._inputsProperties.H = {min: iMin, max: iMax, prependZero: bPrependZero, step: 1, value: iSelectedHours, format24: bFormatSupport24};
				this._inputIndexes.H = iIndex++;
			}

			if (sFormat.indexOf("m") !== -1) {
				bPrependZero = sFormat.indexOf("mm") !== -1;
				iMax = 59;
				// add Minutes input
				this.addAggregation("_inputs", new CustomNumericInput(sId + "-inputM", {
					type: InputType.Number,
					tooltip: this._oResourceBundle.getText("TIMEPICKER_INPUTS_ENTER_MINUTES"),
					textAlign: TextAlign.Center,
					width: "2.875rem",
					value: iSelectedMinutes,
					ariaLabelledBy: sId + "-textM"
				}));
				this._inputsProperties.M = {min: 0, max: iMax, prependZero: bPrependZero, step: this.getMinutesStep(), value: iSelectedMinutes};
				this._inputIndexes.M = iIndex++;
			}

			if (sFormat.indexOf("s") !== -1) {
				bPrependZero = sFormat.indexOf("ss") !== -1;
				iMax = 59;
				// add Seconds input
				this.addAggregation("_inputs", new CustomNumericInput(sId + "-inputS", {
					type: InputType.Number,
					tooltip: this._oResourceBundle.getText("TIMEPICKER_INPUTS_ENTER_SECONDS"),
					textAlign: TextAlign.Center,
					width: "2.875rem",
					value: iSelectedSeconds,
					ariaLabelledBy: sId + "-textS"
				}));
				this._inputsProperties.S = {min: 0, max: iMax, prependZero: bPrependZero, step: this.getSecondsStep(), value: iSelectedSeconds};
				this._inputIndexes.S = iIndex++;
			}

			if (sFormat.indexOf("a") !== -1) {
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

			aInputs = this.getAggregation("_inputs");
			this._inputCount = aInputs.length;
			this._switchInput(0);

			// attach events to the controls
			for (iIndex = 0; iIndex < this._inputCount; iIndex++) {
				this._attachEvents(aInputs[iIndex]);
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
		 * Attaches events of the inputs.
		 *
		 * @param {sap.m.Input} oInput Input object to attach events to
		 * @private
		 */
		TimePickerInputs.prototype._attachEvents = function(oInput) {

			oInput.onfocusin = function(oEvent) {
				var sSuffix = oEvent.currentTarget.id.slice(-1),
				aInputs = this.getAggregation("_inputs");
				this._activeInput = this._inputIndexes[sSuffix];
				aInputs[this._activeInput].addStyleClass("sapMFocus");
				aInputs[this._activeInput].getDomRef("inner").select();
			}.bind(this);

			oInput.onfocusout = function(oEvent) {
				var sSuffix = oEvent.currentTarget.id.slice(-1),
					aInputs = this.getAggregation("_inputs");

				if (this._inputsProperties[sSuffix].value === "") {
					this._inputsProperties[sSuffix].value = "00";
					aInputs[this._activeInput].setValue("00");
				} else if (sSuffix !== "H") {
					aInputs[this._activeInput].setValue(aInputs[this._activeInput].getValue());
				}

				if (sSuffix === "H" && !this._inputsProperties[sSuffix].format24 && parseInt(this._inputsProperties[sSuffix].value) === 0) {
					this._inputsProperties[sSuffix].value = "12";
					aInputs[this._activeInput].setValue("12");
				}

				aInputs[this._activeInput].removeStyleClass("sapMFocus");
				this._lastActiveInput = this._activeInput;
				this._activeInput = -1;
			}.bind(this);

			oInput.attachLiveChange(function(oEvent) {
				var sActiveIndex = oEvent.getParameter("id").slice(-1),
					sValue = oEvent.getParameter("value");
				if (sValue !== this._inputsProperties[sActiveIndex].value.toString()) {
					this._inputsProperties[sActiveIndex].value = sValue;
					this._kbdBuffer = sValue;
				}
			}.bind(this));
		};

		/**
		 * Switches to the specific input.
		 *
		 * @param {int} iInputIndex the index (in _inputs aggregation) of the input
		 * @private
		 */
		TimePickerInputs.prototype._switchInput = function(iInputIndex) {
			var aInputs = this.getAggregation("_inputs");
			if (iInputIndex >= this._inputCount) {
				iInputIndex = 0;
			}
			aInputs[iInputIndex].focus();
			this._activeInput = iInputIndex;
		};

		/**
		 * Handles minutes and seconds when hours are changed.
		 * When hours are 24, then the other inputs must be set to 0 and appear disabled.
		 *
		 * @param {string} sValue the value of the hours
		 * @private
		 */
		TimePickerInputs.prototype._handleHoursChange = function(sValue) {
			var oMinutesInput = this._getMinutesInput(),
				oSecondsInput = this._getSecondsInput();

			if (!this.getSupport2400()) {
				return;
			}

			if (sValue === "24") {
				// Store last values
				if (oMinutesInput && oMinutesInput.getEnabled()) {
					this._sMinutes = oMinutesInput.getValue();
					oMinutesInput.setEnabled(false).setValue("00");
				}
				if (oSecondsInput && oSecondsInput.getEnabled()) {
					this._sSeconds = oSecondsInput.getValue();
					oSecondsInput.setEnabled(false).setValue("00");
				}
				this._getHoursInput().focus();
				return true;
			} else {
				// restore last values
				if (oMinutesInput && !oMinutesInput.getEnabled()) {
					oMinutesInput.setEnabled(true).setValue(this._sMinutes); //set again the last value before snapping the hours to 24
				}
				if (oSecondsInput && !oSecondsInput.getEnabled()) {
					oSecondsInput.setEnabled(true).setValue(this._sSeconds); // set again the last value before snapping the hours to 24
				}
				this._getHoursInput().focus();
				return false;
			}

		};

		/* Numeric Input override */

		var CustomNumericInputRenderer = Renderer.extend(InputRenderer);

		CustomNumericInputRenderer.apiVersion = 2;

		CustomNumericInputRenderer.writeInnerAttributes = function(oRm, oControl) {
			InputRenderer.writeInnerAttributes.call(this, oRm, oControl);
			oRm.attr("pattern", "[0-9]*");
			oRm.attr("inputmode", "numeric");
		};

		var CustomNumericInput = Input.extend("sap.m.internal.CustomNumericInput", {
			renderer: CustomNumericInputRenderer
		});

		return TimePickerInputs;
	});