/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/ui/model/type/Date',
	'sap/ui/model/odata/type/ODataType',
	'sap/ui/core/format/DateFormat',
	'./TimePickerSlidersRenderer',
	'./TimePickerSlider',
	'./VisibleItem',
	'sap/ui/core/LocaleData',
	'sap/ui/Device',
	'sap/ui/core/Locale',
	'./TimePickerSlidersRenderer',
	"sap/ui/thirdparty/jquery"
],
	function(
		coreLibrary,
		Control,
		SimpleDateType,
		ODataType,
		DateFormat,
		SlidersRenderer,
		TimePickerSlider,
		VisibleItem,
		LocaleData,
		Device,
		Locale,
		TimePickerSlidersRenderer,
		jQuery
	) {
		"use strict";

		var DEFAULT_STEP = 1,
			CalendarType = coreLibrary.CalendarType;

		/**
		 * Constructor for a new <code>TimePickerSliders</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A picker list container control used inside the {@link sap.m.TimePicker} or standalone to hold all the sliders.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.54
		 * @alias sap.m.TimePickerSliders
		 */
		var TimePickerSliders = Control.extend("sap.m.TimePickerSliders", /** @lends sap.m.TimePickerSliders.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {
					/**
					 * Defines the locale used to parse string values representing time.
					 *
					 * Determines the locale, used to interpret the string, supplied by the
					 * <code>value</code> property.
					 *
					 * Example: AM in the string "09:04 AM" is locale (language) dependent.
					 * The format comes from the browser language settings if not set explicitly.
					 * Used in combination with 12 hour <code>displayFormat</code> containing 'a', which
					 * stands for day period string.
					 */
					localeId: {type : "string", group: "Data"},

					/**
					 * Defines the time <code>displayFormat</code> of the sliders.
					 * The <code>displayFormat</code> comes from the browser language settings if not set explicitly.
					 *
					 */
					displayFormat: {name: "displayFormat", type: "string", group: "Appearance"},

					/**
					 * Defines the text of the picker label.
					 *
					 * It is read by screen readers. It is visible only on phone.
					 */
					labelText: {name: "labelText", type: "string"},

					/**
					 * Sets the minutes slider step. If step is less than 1, it will be automatically converted back to 1.
					 * The minutes slider is populated only by multiples of the step.
					 */
					minutesStep: {type: "int", group: "Misc", defaultValue: DEFAULT_STEP},

					/**
					 * Sets the seconds slider step. If step is less than 1, it will be automatically converted back to 1.
					 * The seconds slider is populated only by multiples of the step.
					 */
					secondsStep: {type: "int", group: "Misc", defaultValue: DEFAULT_STEP},

					/**
					 * Sets the width of the container.
					 * The minimum width is 320px.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Appearance"},

					/**
					 * Sets the height of the container. If percentage value is used the parent container should have
					 * specified height
					 */
					height: {type: "sap.ui.core.CSSSize", group: "Appearance"},

					/**
					 * Defines the value of the control.
					 */
					value: { type: "string", group: "Data", defaultValue: null},

					/**
					 * Determines the format of the <code>value</code> property.
					 */
					valueFormat: {type: "string", group: "Data", defaultValue: null},

					/**
					 * Allows to set a value of 24:00, used to indicate the end of the day.
					 * Works only with HH or H formats. Don't use it together with am/pm.
					 * @since 1.54
					 */
					support2400: {type: "boolean", group: "Misc", defaultValue: false}
				},
				aggregations: {
					/**
					 * Holds the inner sliders.
					 */
					_columns: { type: "sap.m.TimePickerSlider", multiple: true, visibility: "hidden" }
				},
				events: {
					/**
					 * Fired when the value is changed.
					 */
					change: {
						parameters: {

							/**
							 * The new <code>value</code> of the control.
							 */
							value: { type: "string" }
						}
					}
				}
			}
		});

		/**
		 * Initializes the control.
		 *
		 * @private
		 */
		TimePickerSliders.prototype.init = function () {
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
				oLocaleData = LocaleData.getInstance(oLocale),
				aPeriods = oLocaleData.getDayPeriods("abbreviated"),
				sDefaultDisplayFormat = oLocaleData.getTimePattern("medium");


			this._fnLayoutChanged = jQuery.proxy(this._onOrientationChanged, this);
			Device.resize.attachHandler(this._fnLayoutChanged);

			this._sAM = aPeriods[0];
			this._sPM = aPeriods[1];

			this._onSliderExpanded = this._onSliderExpanded.bind(this);
			this._onSliderCollapsed = this._onSliderCollapsed.bind(this);

			this.setDisplayFormat(sDefaultDisplayFormat);
			this._setTimeValues();
			this._iMinutes; //needed for the 2400 scenario to store the minutes when scrolling before and after 24
			this._iSeconds; //needed for the 2400 scenario to store the seconds when scrolling before and after 24
		};

		/**
		 * Destroys the control.
		 *
		 * @private
		 */
		TimePickerSliders.prototype.exit = function () {
			this.$().off(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
			Device.resize.detachHandler(this._fnOrientationChanged);
		};

		/**
		 * After rendering
		 * @private
		 */
		TimePickerSliders.prototype.onAfterRendering = function() {
			this.$().off(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
			this.$().on(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", jQuery.proxy(this._onmousewheel, this));

			this.$().on('selectstart', fnFalse);

			if (this._getShouldOpenSliderAfterRendering()) {
				/* This method is called here prematurely to ensure slider loading on time.
				 * Make sure _the browser native focus_ is not actually set on the early call (the "true" param)
				 * because that fires events and results in unexpected behaviors */
				if (Device.system.desktop) {
					this._getFirstSlider().setIsExpanded(true);
				}
			}
		};

		/*
		 * PUBLIC API
		 */

		/**
		 * Sets the <code>localeId</code> property.
		 *
		 * @param {string} sLocaleId The ID of the Locale
		 * @returns {sap.m.TimePickerSliders} this instance, used for chaining
		 * @public
		 */
		TimePickerSliders.prototype.setLocaleId = function(sLocaleId) {
			var oLocale,
				aPeriods;

			sLocaleId = this.validateProperty("localeId", sLocaleId);

			this.setProperty("localeId", sLocaleId, true);

			if (sLocaleId) {
				oLocale = new Locale(sLocaleId);
				aPeriods = LocaleData.getInstance(oLocale).getDayPeriods("abbreviated");

				this._sAM = aPeriods[0];
				this._sPM = aPeriods[1];

				this._destroyColumns();
				this._setupLists();
			}

			return this;
		};

		/**
		 * Sets <code>support2400</code>.
		 *
		 * @param {boolean} bSupport2400
		 * @returns {sap.m.TimePickerSliders} this instance, used for chaining
		 * @public
		 */
		TimePickerSliders.prototype.setSupport2400 = function (bSupport2400) {
			this.setProperty("support2400", bSupport2400, true);

			this._destroyColumns();
			this._setupLists();

			return this;
		};


		/**
		 * Sets the time <code>displayFormat</code>.
		 *
		 * @param {string} sFormat New display format
		 * @returns {sap.m.TimePickerSliders} this instance, used for chaining
		 * @public
		 */
		TimePickerSliders.prototype.setDisplayFormat = function (sFormat) {
			this.setProperty("displayFormat", sFormat, true);

			this._destroyColumns();
			this._setupLists();

			return this;
		};

		/**
		 * Sets the text for the picker label.
		 *
		 * @param {string} sLabelText A text for the label
		 * @returns {sap.m.TimePickerSliders} this instance, used for chaining
		 * @public
		 */
		TimePickerSliders.prototype.setLabelText = function(sLabelText) {
			var $ContainerLabel;

			this.setProperty("labelText", sLabelText, true);

			if (!Device.system.desktop) {
				$ContainerLabel = jQuery(this.getDomRef("label"));
				if ($ContainerLabel) {
					$ContainerLabel.html(sLabelText);
				}
			}

			return this;
		};

		/**
		 * Sets the minutes slider step.
		 * @param {int} value The step used to generate values for the minutes slider
		 * @returns {sap.m.TimePickerSliders} <code>this</code> to allow method chaining
		 * @public
		 */
		TimePickerSliders.prototype.setMinutesStep = function(value) {
			value = Math.max(DEFAULT_STEP, value || DEFAULT_STEP);
			this.setProperty("minutesStep", value, true);

			this._destroyColumns();
			this._setupLists();

			return this;
		};

		/**
		 * Sets the seconds slider step.
		 * @param {int} value The step used to generate values for the seconds slider
		 * @returns {sap.m.TimePickerSliders} <code>this</code> to allow method chaining
		 * @public
		 */
		TimePickerSliders.prototype.setSecondsStep = function(value) {
			value = Math.max(DEFAULT_STEP, value || DEFAULT_STEP);
			this.setProperty("secondsStep", value, true);

			this._destroyColumns();
			this._setupLists();

			return this;
		};

		/**
		 * Sets the width of the <code>TimepickerSliders</code> container.
		 * @param {sap.ui.core.CSSSize} sWidth The width of the <code>TimepickerSliders</code< as CSS size
		 * @returns {sap.m.TimePickerSliders} Pointer to the control instance to allow method chaining
		 * @public
		 */
		TimePickerSliders.prototype.setWidth = function (sWidth) {
			this.setProperty("width", sWidth, true);

			this.$().css("width", sWidth);

			return this;
		};

		/**
		 * Sets the height of the <code>TimepickerSliders</code> container.
		 * @param {sap.ui.core.CSSSize} sHeight The height of the <code>TimepickerSliders</code> as CSS size
		 * @returns {sap.m.TimePickerSliders} Pointer to the control instance to allow method chaining
		 * @public
		 */
		TimePickerSliders.prototype.setHeight = function (sHeight) {
			this.setProperty("height", sHeight, true);

			this.$().css("height", sHeight);

			return this;
		};

		/**
		 * Sets the value of the <code>TimepickerSliders</code> container.
		 * @param {string} sValue The value of the <code>TimepickerSliders</code>
		 * @returns {sap.m.TimePickerSliders} Pointer to the control instance to allow method chaining
		 * @public
		 */
		TimePickerSliders.prototype.setValue = function (sValue) {
			var oHoursSlider = this._getHoursSlider(),
				sFormat = this._getValueFormatPattern(),
				iIndexOfHH = sFormat.indexOf("HH"),
				iIndexOfH = sFormat.indexOf("H"),
				bHoursSliderValueIs24 = oHoursSlider && oHoursSlider.getSelectedValue() === "24",
				bHoursValueIs24 = TimePickerSliders._isHoursValue24(sValue, iIndexOfHH, iIndexOfH);

			if (bHoursSliderValueIs24 && this._isFormatSupport24() && !bHoursValueIs24) {
				sValue = TimePickerSliders._replaceZeroHoursWith24(sValue, iIndexOfHH, iIndexOfH);
			}

			sValue = this.validateProperty("value", sValue);
			this.setProperty("value", sValue, true); // no rerendering

			// convert to date object
			var oDate;
			if (sValue) {
				oDate = this._parseValue(bHoursValueIs24 ? TimePickerSliders._replace24HoursWithZero(sValue, iIndexOfHH, iIndexOfH) : sValue);
			}

			if (oDate) {
				this._setTimeValues(oDate, bHoursValueIs24);
			}

			return this;
		};

		/**
		 * Gets the time values from the sliders, as a date object.
		 *
		 * @returns {Object} A JavaScript date object
		 * @public
		 */
		TimePickerSliders.prototype.getTimeValues = function () {
			var oHoursSlider = this._getHoursSlider(),
				oMinutesSlider = this._getMinutesSlider(),
				oSecondsSlider = this._getSecondsSlider(),
				oFormatSlider = this._getFormatSlider(),
				iHours = null,
				sAmpm = null,
				oDateValue = new Date();

			if (oHoursSlider) {
				iHours = parseInt(oHoursSlider.getSelectedValue());
			}

			if (oFormatSlider) {
				sAmpm = oFormatSlider.getSelectedValue();
			}

			if (sAmpm === "am" && iHours === 12) {
				iHours = 0;
			} else if (sAmpm === "pm" && iHours !== 12) {
				iHours += 12;
			}

			if (iHours !== null) {
				oDateValue.setHours(iHours.toString());
			}

			if (oMinutesSlider) {
				oDateValue.setMinutes(oMinutesSlider.getSelectedValue());
			}

			if (oSecondsSlider) {
				oDateValue.setSeconds(oSecondsSlider.getSelectedValue());
			}

			return oDateValue;
		};

		/**
		 * Collapses all the slider controls.
		 *
		 * @returns {sap.m.TimePickerSliders} Pointer to the control instance to allow method chaining
		 * @public
		 *
		 */
		TimePickerSliders.prototype.collapseAll = function () {
			//collapse the expanded sliders
			var aSliders = this.getAggregation("_columns");

			if (aSliders) {
				for ( var iIndex = 0; iIndex < aSliders.length; iIndex++) {
					if (aSliders[iIndex].getIsExpanded()) {
						aSliders[iIndex].setIsExpanded(false);
					}
				}
			}

			return this;
		};

		/**
		 * Opens first slider.
		 *
		 * @returns {sap.m.TimePickerSliders} Pointer to the control instance to allow method chaining
		 *
		 * @public
		 */
		TimePickerSliders.prototype.openFirstSlider = function() {
			var oFirstSlider = this._getFirstSlider();

			oFirstSlider.setIsExpanded(true);
			oFirstSlider.focus();

			return this;
		};

		/*
		 * PRIVATE API
		 */
		/**
		 * Sets the values of the slider controls, given a JavaScript date object.
		 *
		 * @param {Object} oDate The date to use as a setting, if not provided the current date will be used
		 * @private
		 */
		TimePickerSliders.prototype._setTimeValues = function (oDate, bHoursValueIs24) {
			var oHoursSlider = this._getHoursSlider(),
				oMinutesSlider = this._getMinutesSlider(),
				oSecondsSlider = this._getSecondsSlider(),
				oFormatSlider = this._getFormatSlider(),
				iHours,
				sAmPm = null;

			oDate = oDate || new Date();

			// Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
			// because Date object in the test is different than the Date object in the application (due to the iframe).
			// We can use jQuery.type or this method:
			// function isValidDate (date) {
			//	return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
			//}
			if (oDate && jQuery.type(oDate) !== "date") {
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

			if (oFormatSlider) {
				//ToDo: Replace this hardcoded values with their translated text in order to have UI API value consistency
				sAmPm = iHours >= 12 ? "pm" : "am";
				iHours = (iHours > 12) ? iHours - 12 : iHours;
				iHours = (iHours === 0 ? 12 : iHours);
			}

			oHoursSlider && oHoursSlider.setSelectedValue(iHours.toString());
			oMinutesSlider && oMinutesSlider._updateStepAndValue(oDate.getMinutes(), this.getMinutesStep());
			oSecondsSlider && oSecondsSlider._updateStepAndValue(oDate.getSeconds(), this.getSecondsStep());
			oFormatSlider && oFormatSlider.setSelectedValue(sAmPm);

			if (bHoursValueIs24) {
				this._disableSlider(oMinutesSlider);
				oMinutesSlider && oMinutesSlider.setSelectedValue("0");
				this._disableSlider(oSecondsSlider);
				oSecondsSlider && oSecondsSlider.setSelectedValue("0");
			} else {
				this._enableSlider(oMinutesSlider);
				this._enableSlider(oSecondsSlider);
			}
		};

		/**
		 * Updates the values of all slider controls.
		 *
		 * @private
		 */
		TimePickerSliders.prototype._updateSlidersValues = function () {
			//collapse the expanded slider
			var aSliders = this.getAggregation("_columns");

			if (aSliders) {
				for ( var iIndex = 0; iIndex < aSliders.length; iIndex++) {
					aSliders[iIndex]._updateScroll(); //updates scroll position if needed
				}
			}
		};

		/**
		 * Handles the home key event.
		 *
		 * Focuses the first slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerSliders.prototype.onsaphome = function(oEvent) {
			var oNextSlider = this._getFirstSlider(),
				oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef() && this._isSliderEnabled(oNextSlider)) {
				oNextSlider.focus();
			}
		};

		/**
		 * Handles the end key event.
		 *
		 * Focuses the last slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerSliders.prototype.onsapend = function(oEvent) {
			var oNextSlider = this._getLastSlider(),
				oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef() && this._isSliderEnabled(oNextSlider)) {
				oNextSlider.focus();
			}
		};

		/**
		 * Handles the left arrow key event.
		 *
		 * Focuses the previous slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerSliders.prototype.onsapleft = function(oEvent) {
			var oNextSlider,
				oCurrentSlider = this._getCurrentSlider(),
				iCurrentSliderIndex = -1,
				iNextIndex = -1,
				aSliders = this.getAggregation("_columns");

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				iCurrentSliderIndex = aSliders.indexOf(oCurrentSlider);
				iNextIndex = iCurrentSliderIndex > 0 ? iCurrentSliderIndex - 1 : aSliders.length - 1;
				oNextSlider = aSliders[iNextIndex];
				if (this._isSliderEnabled(oNextSlider)) {
					oNextSlider.focus();
				}
			}
		};

		/**
		 * Handles the right arrow key event.
		 *
		 * Focuses the next slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerSliders.prototype.onsapright = function(oEvent) {
			var oNextSlider,
				oCurrentSlider = this._getCurrentSlider(),
				iCurrentSliderIndex = -1,
				iNextIndex = -1,
				aSliders = this.getAggregation("_columns");

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				iCurrentSliderIndex = aSliders.indexOf(oCurrentSlider);
				iNextIndex = iCurrentSliderIndex < aSliders.length - 1 ? iCurrentSliderIndex + 1 : 0;
				oNextSlider = aSliders[iNextIndex];
				if (this._isSliderEnabled(oNextSlider)) {
					oNextSlider.focus();
				}
			}
		};

		/**
		 * Handles the mouse scroll event.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		TimePickerSliders.prototype._onmousewheel = function(oEvent) {
			var currentSlider = this._getCurrentSlider();

			if (currentSlider) {
				currentSlider._onmousewheel(oEvent);
			}
		};

		/**
		 * Handles the orientation change event.
		 *
		 * @private
		 */
		TimePickerSliders.prototype._onOrientationChanged = function() {
			var aSliders = this.getAggregation("_columns");

			if (!aSliders) {
				return;
			}

			for ( var i = 0; i < aSliders.length; i++) {
				if (aSliders[i].getIsExpanded()) {
					aSliders[i]._updateSelectionFrameLayout();
				}
			}
		};

		/**
		 * Generates the sliders' control values in the provided number range.
		 *
		 * @param {number} iFrom Starting number
		 * @param {number} iTo Ending number
		 * @param {int} iStep The step used for the slider
		 * @param {number} bLeadingZeroes Whether to add leading zeroes to number values
		 * @returns {array} Array of key/value pairs
		 * @private
		 */
		TimePickerSliders.prototype._generatePickerListValues = function (iFrom, iTo, iStep, bLeadingZeroes) {
			var aValues = [],
				sText;

			for (var iIndex = iFrom; iIndex <= iTo; iIndex += 1) {
				if (iIndex < 10 && bLeadingZeroes) {
					sText = "0" + iIndex.toString();
				} else {
					sText = iIndex.toString();
				}

				var oItem = new VisibleItem({
					key: iIndex.toString(),
					text: sText
				});

				if (iIndex % iStep !== 0) {
					oItem.setVisible(false);
				}

				aValues.push(oItem);
			}

			return aValues;
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._checkStyle = function (sPattern) {
			return (sPattern === "short" || sPattern === "medium" || sPattern === "long" || sPattern === "full");
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getDisplayFormatPattern = function () {
			var sPattern = this.getDisplayFormat();

			if (this._checkStyle(sPattern)) {
				sPattern = this._getLocaleBasedPattern(sPattern);
			}

			return sPattern;
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getValueFormatPattern = function () {
			var sPattern = this._getBoundValueTypePattern() || this.getValueFormat() || "medium";

			if (this._checkStyle(sPattern)) {
				sPattern = this._getLocaleBasedPattern(sPattern);
			}

			return sPattern;
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getLocaleBasedPattern = function (sPlaceholder) {
			return LocaleData.getInstance(
				sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()
			).getTimePattern(sPlaceholder);
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._destroyColumns = function () {
			var aColumns = this.getAggregation("_columns");

			if (aColumns) {
				this.destroyAggregation("_columns");
			}
		};

		/**
		 * Creates the sliders of the picker based on the <code>format</code>.
		 *
		 * @param {string} sFormat Display format
		 * @private
		 */
		TimePickerSliders.prototype._setupLists = function () {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				sLabelHours = oRb.getText("TIMEPICKER_LBL_HOURS"),
				sLabelMinutes = oRb.getText("TIMEPICKER_LBL_MINUTES"),
				sLabelSeconds = oRb.getText("TIMEPICKER_LBL_SECONDS"),
				//ToDo This value will be always "AM/PM" due to bad translation string. Consider replacing it with something like this._sAM + / + this._sPM
				sLabelAMPM = oRb.getText("TIMEPICKER_LBL_AMPM"),
				iMinutesStep = this.getMinutesStep(),
				iSecondsStep = this.getSecondsStep(),
				sFormat = this._getDisplayFormatPattern();

			if (sFormat === undefined) {
				return;
			}

			var bHours = false, bHoursTrailingZero = false, iFrom, iTo;

			if (sFormat.indexOf("HH") !== -1) {
				bHours = true;
				iFrom = 0;
				iTo = this.getSupport2400() ? 24 : 23;
				bHoursTrailingZero = true;
			} else if (sFormat.indexOf("H") !== -1) {
				bHours = true;
				iFrom = 0;
				iTo = this.getSupport2400() ? 24 : 23;
			} else if (sFormat.indexOf("hh") !== -1) {
				bHours = true;
				iFrom = 1;
				iTo = 12;
				bHoursTrailingZero = true;
			} else if (sFormat.indexOf("h") !== -1) {
				bHours = true;
				iFrom = 1;
				iTo = 12;
			}

			if (bHours) {
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listHours", {
					items: this._generatePickerListValues(iFrom, iTo, 1, bHoursTrailingZero),
					expanded: this._onSliderExpanded,
					collapsed: this._onSliderCollapsed,
					label: sLabelHours
				}).attachEvent("_selectedValueChange", this._handleHoursChange, this));
			}

			if (sFormat.indexOf("m") !== -1) {
				var aValues = this._generatePickerListValues(0, 59, iMinutesStep, true);

				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listMins", {
					items: aValues,
					expanded: this._onSliderExpanded,
					collapsed: this._onSliderCollapsed,
					label: sLabelMinutes
				}));
			}

			if (sFormat.indexOf("s") !== -1) {
				var aValues = this._generatePickerListValues(0, 59, iSecondsStep, true);
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listSecs", {
					items: aValues,
					expanded: this._onSliderExpanded,
					collapsed: this._onSliderCollapsed,
					label: sLabelSeconds
				}));
			}

			if (sFormat.indexOf("a") !== -1) {
				this.addAggregation("_columns", new TimePickerSlider(this.getId() + "-listFormat", {
					items: [
						{ key: "am", text: this._sAM },
						{ key: "pm", text: this._sPM }
					],
					expanded: this._onSliderExpanded,
					collapsed: this._onSliderCollapsed,
					label: sLabelAMPM,
					isCyclic: false
				}).addStyleClass("sapMTimePickerSliderShort"));
			}

			// convert to date object
			var oDate,
				sValue = this.getValue();

			if (sValue) {
				oDate = this._parseValue(sValue);
			}
			if (oDate) {
				this._setTimeValues(oDate);
			}
		};

		/**
		 * Gets the currently expanded slider control.
		 *
		 * @returns {sap.m.TimePickerSlider|null} Currently expanded slider control or null if there is none
		 * @private
		 */
		TimePickerSliders.prototype._getCurrentSlider = function() {
			var aSliders = this.getAggregation("_columns");

			if (aSliders) {
				for (var i = 0; i < aSliders.length; i++) {
					if (aSliders[i].getIsExpanded()) {
						return aSliders[i];
					}
				}
			}

			return null;
		};

		/**
		 * Returns the sliders for the hours
		 * @returns {sap.m.TimePickerSlider|null} Hours slider
		 * @private
		 */
		TimePickerSliders.prototype._getHoursSlider = function () {
			return sap.ui.getCore().byId(this.getId() + "-listHours") || null;
		};

		/**
		 * Returns the sliders for the minutes
		 * @returns {sap.m.TimePickerSlider|null} Minutes slider
		 * @private
		 */
		TimePickerSliders.prototype._getMinutesSlider = function () {
			return sap.ui.getCore().byId(this.getId() + "-listMins") || null;
		};

		/**
		 * Returns the sliders for the seconds
		 * @returns {sap.m.TimePickerSlider|null} Seconds slider
		 * @private
		 */
		TimePickerSliders.prototype._getSecondsSlider = function () {
			return sap.ui.getCore().byId(this.getId() + "-listSecs") || null;
		};

		/**
		 * Returns the sliders for the format
		 * @returns {sap.m.TimePickerSlider|null} Format slider
		 * @private
		 */
		TimePickerSliders.prototype._getFormatSlider = function () {
			return sap.ui.getCore().byId(this.getId() + "-listFormat") || null;
		};

		/**
		 * Returns the first slider
		 * @returns {sap.m.TimePickerSlider|null} First slider
		 * @private
		 */
		TimePickerSliders.prototype._getFirstSlider = function () {
			return this.getAggregation("_columns")[0] || null;
		};

		/**
		 * Returns the last slider
		 * @returns {sap.m.TimePickerSlider|null} Last slider
		 * @private
		 */
		TimePickerSliders.prototype._getLastSlider = function () {
			var aSliders = this.getAggregation("_columns");

			return aSliders[aSliders.length - 1] || null;
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._parseValue = function (sValue) {
			return this._getFormatter().parse(sValue);
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._isSliderEnabled = function (oSlider) {
			return oSlider._getEnabled();
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getFormatter = function () {
			var sPattern = this._getBoundValueTypePattern(),
				bRelative = false, // if true strings like "Tomorrow" are parsed fine
				oBinding = this.getBinding("value"),
				sCalendarType;

			if (oBinding && oBinding.oType && oBinding.oType.oOutputFormat) {
				bRelative = !!oBinding.oType.oOutputFormat.oFormatOptions.relative;
				sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
			}

			if (!sPattern) {
				// not databinding is used -> use given format
				sPattern = this.getValueFormat() || "medium";
				sCalendarType = CalendarType.Gregorian;
			}

			if (!sCalendarType) {
				sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
			}

			return this._getFormatterInstance(sPattern, bRelative, sCalendarType);
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getBoundValueTypePattern = function () {
			var oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType();

			if (oBindingType instanceof SimpleDateType) {
				return oBindingType.getOutputPattern();
			}

			if (oBindingType instanceof ODataType && oBindingType.oFormat) {
				return oBindingType.oFormat.oFormatOptions.pattern;
			}

			return undefined;
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getFormatterInstance = function (sPattern, bRelative, sCalendarType, bDisplayFormat) {
			var oFormat;

			if (this._checkStyle(sPattern)) {
				oFormat = this._getFormatInstance({style: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType});
			} else {
				oFormat = this._getFormatInstance({pattern: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType});
			}

			return oFormat;
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getFormatInstance = function (oArguments, bDisplayFormat) {
			return DateFormat.getTimeInstance(oArguments);
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._formatValue = function (oDate) {
			if (oDate) {
				return this._getFormatter().format(oDate);
			}

			return "";
		};

		/**
		 * Default expanded handler
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		TimePickerSliders.prototype._onSliderExpanded = function (oEvent) {
			var aSliders = this.getAggregation("_columns");

			for (var i = 0; i < aSliders.length; i++) {
				if (aSliders[i] !== oEvent.oSource && aSliders[i].getIsExpanded()) {
					aSliders[i].setIsExpanded(false);
				}
			}
		};

		/**
		 * Default collapsed handler
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		TimePickerSliders.prototype._onSliderCollapsed = function (oEvent) {
			var oDate = this.getTimeValues();

			this.setValue(this._formatValue(oDate, true));

			this.fireChange({ value: this.getValue() });
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._getShouldOpenSliderAfterRendering = function () {
			return this._shouldOpenSliderAfterRendering;
		};

		/**
		 * @private
		 */
		TimePickerSliders.prototype._setShouldOpenSliderAfterRendering = function (bShouldOpenSliderAfterRendering) {
			this._shouldOpenSliderAfterRendering = bShouldOpenSliderAfterRendering;

			return this;
		};

		/**
		 * Returns if the displayFormatPattern is HH or H (24 hours format with or without leading zero)
		 * @returns {boolean} Is the displayFormatPattern is HH or H (24 hours format with or without leading zero).
		 * @private
		 */
		TimePickerSliders.prototype._isFormatSupport24 = function () {
			var sFormat = this._getDisplayFormatPattern();
			return sFormat.indexOf("HH") !== -1 || sFormat.indexOf("H") !== -1;
		};

		/**
		 * Disables the slider and set its value to 0
		 * @private
		 */
		TimePickerSliders.prototype._disableSlider = function (oSlider) {
			if (oSlider) {
				oSlider._setEnabled(false);
			}
			return this;
		};

		/**
		 * Enables the slider and sets its value to the provided value
		 * @private
		 */
		TimePickerSliders.prototype._enableSlider = function (oSlider) {
			if (oSlider) {
				oSlider._setEnabled(true);
			}
			return this;
		};

		/**
		 * Handles minutes and seconds when hours are changed.
		 * By spec when hours are 24, then the rest sliders must be set to 0 and look disabled.
		 * @private
		 */
		TimePickerSliders.prototype._handleHoursChange = function(oEvent) {
			var sValue = oEvent.getParameter("value"),
				oMinutesSlider = this._getMinutesSlider(),
				oSecondsSlider = this._getSecondsSlider();

			if (this.getSupport2400()) {
				if (sValue === "24") {
					// Store last values
					if (oMinutesSlider && oMinutesSlider._getEnabled()) {
						this._iMinutes = oMinutesSlider.getSelectedValue();
						this._disableSlider(oMinutesSlider);
						oMinutesSlider.setSelectedValue("0");
					}
					if (oSecondsSlider && oSecondsSlider._getEnabled()) {
						this._iSeconds = oSecondsSlider.getSelectedValue();
						this._disableSlider(oSecondsSlider);
						oSecondsSlider.setSelectedValue("0");
					}

				} else {
					// restore last values
					if (oMinutesSlider && !oMinutesSlider._getEnabled()) {
						this._enableSlider(oMinutesSlider);
						oMinutesSlider.setSelectedValue(this._iMinutes); //set again the last value before snapping the hours to 24
					}
					if (oSecondsSlider && !oSecondsSlider._getEnabled()) {
						this._enableSlider(oSecondsSlider);
						oSecondsSlider.setSelectedValue(this._iSeconds); // set again the last value before snapping the hours to 24
					}
				}
			}
		};

		// Static Methods
		/**
		 * Returns value with replaced zeros for the Hours.
		 *
		 * Example:
		 *  00:00:00 with displayFormat "HH:mm:ss" -> 24:00:00
		 *  00:00:00 with displayFormat "mm:HH:ss" -> 00:24:00
		 *  0:00:00 with displayFormat "H:mm:ss" -> 24:00:00
		 *  00:0:00 with displayFormat "mm:H:ss" -> 00:24:00
		 * @param iIndexHH index of the HH in the displayFormat
		 * @param iIndexH index of the H in the displayFormat
		 * @private
		 */
		TimePickerSliders._replaceZeroHoursWith24 = function (sValue, iIndexOfHH, iIndexOfH) {
			var iHoursDigits = 2,
				iSubStringIndex = iIndexOfHH;

			if (iIndexOfHH === -1) {
				iHoursDigits = 1;
				iSubStringIndex = iIndexOfH;
			}

			return sValue.substr(0, iSubStringIndex) + "24" + sValue.substr(iSubStringIndex + iHoursDigits);
		};

		/**
		 * Returns value with replaced zeros for the Hours.
		 *
		 * Example:
		 *  24:00:00 with displayFormat "HH:mm:ss" -> 00:00:00
		 *  00:24:00 with displayFormat "mm:HH:ss" -> 00:00:00
		 *  24:00:00 with displayFormat "H:mm:ss" -> 0:00:00
		 *  00:24:00 with displayFormat "mm:H:ss" -> 00:0:00
		 * @param iIndexHH index of the HH in the displayFormat
		 * @param iIndexH index of the H in the displayFormat
		 * @private
		 */
		TimePickerSliders._replace24HoursWithZero = function (sValue, iIndexOfHH, iIndexOfH) {
			var iHoursDigits = 2,
				iSubStringIndex = iIndexOfHH;

			if (iIndexOfHH === -1) {
				iHoursDigits = 1;
				iSubStringIndex = iIndexOfH;
			}

			return sValue.substr(0, iSubStringIndex) + strRepeat(0, iHoursDigits) + sValue.substr(iSubStringIndex + 2);
		};


		/**
		 * Return if provided value hours is equal to 24
		 * @private
		 */
		TimePickerSliders._isHoursValue24 = function (sValue, iIndexOfHH, iIndexOfH) {
			if (iIndexOfHH === -1 && iIndexOfH === -1) {
				return false;
			}

			var iSubStringIndex = iIndexOfHH;

			if (iIndexOfHH === -1) {
				iSubStringIndex = iIndexOfH;
			}

			return sValue.substr(iSubStringIndex, 2) === "24";
		};

		function strRepeat(sStr, iCount) {
			var sResult = "";

			for (var i = 0; i < iCount; i++) {
				sResult += sStr;
			}

			return sResult;
		}

		function fnFalse() {
			return false;
		}

		return TimePickerSliders;
	});