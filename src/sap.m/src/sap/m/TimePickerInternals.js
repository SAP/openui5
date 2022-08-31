/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/model/type/Date",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/LocaleData",
	"sap/ui/core/Locale",
	"./library",
	"./Button",
	'./TimePickerInternalsRenderer',
	"sap/ui/core/Configuration"
],
	function(
		coreLibrary,
		Control,
		SimpleDateType,
		ODataType,
		DateFormat,
		LocaleData,
		Locale,
		library,
		Button,
		TimePickerInternalsRenderer,
		Configuration
	) {
		"use strict";

		var DEFAULT_STEP = 1,
			ButtonType = library.ButtonType,
			CalendarType = coreLibrary.CalendarType;

		/**
		 * Constructor for a new <code>TimePickerInternals</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * TimePicker related internal class used inside the controls in {@link sap.m.TimePicker} that handle time editing.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.90
		 * @alias sap.m.TimePickerInternals
		 */

		var TimePickerInternals = Control.extend("sap.m.TimePickerInternals", /** @lends sap.m.TimePickerInternals.prototype */ {
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
					 * Defines the time <code>displayFormat</code> of the clocks.
					 * The <code>displayFormat</code> comes from the browser language settings if not set explicitly.
					 *
					 */
					displayFormat: {name: "displayFormat", type: "string", group: "Appearance"},

					/**
					 * Sets the minutes clock step. The step must be at least 1
					 */
					minutesStep: {type: "int", group: "Misc", defaultValue: DEFAULT_STEP},

					/**
					 * Sets the seconds clock step. The step must be at least 1
					 */
					secondsStep: {type: "int", group: "Misc", defaultValue: DEFAULT_STEP},

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
					 */
					support2400: {type: "boolean", group: "Misc", defaultValue: false},

					/**
					 * Determines whether there is a shortcut navigation to current time.
					 *
					 * @since 1.98
					 */
					showCurrentTimeButton : {type : "boolean", group : "Behavior", defaultValue : false}
				},
				aggregations: {
					/**
					 * Holds the inner AM/PM segmented button.
					 */
					_buttonAmPm: { type: "sap.m.SegmentedButton", multiple: false, visibility: "hidden" },

					/**
					 * Holds the inner button for shortcut navigation to current time.
					 */
					_nowButton: { type: "sap.m.Button", multiple: false, visibility: "hidden" }
				}
			}
		});

		/**
		 * Initializes the control.
		 *
		 * @private
		 */
		TimePickerInternals.prototype.init = function () {
			var oLocale = Configuration.getFormatSettings().getFormatLocale(),
				oLocaleData = LocaleData.getInstance(oLocale),
				aPeriods = oLocaleData.getDayPeriods("abbreviated"),
				sDefaultDisplayFormat = oLocaleData.getTimePattern("medium");

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			this._sAM = aPeriods[0];
			this._sPM = aPeriods[1];
			this._kbdBuffer = "";

			this.setDisplayFormat(sDefaultDisplayFormat);
			this._setTimeValues();
			this._sMinutes; //needed for the 2400 scenario to store the minutes and seconds when changing hour to 24 and back
			this._sSeconds; //needed for the 2400 scenario to store the minutes and seconds when changing hour to 24 and back
			this._clickAttached; // needed for focus capturing when click outside buttons

			this._setAriaLabel(this._oResourceBundle.getText("TIMEPICKER_CLOCK_DIAL_LABEL"));
			this._setAriaRoleDescription(this._oResourceBundle.getText("TIMEPICKER_INPUTS_ROLE_DESCRIPTION"));
		};

		/**
		 * Destroys the control.
		 *
		 * @private
		 */
		TimePickerInternals.prototype.exit = function () {
			this._destroyControls();
			this.destroyAggregation("_texts");
			if (this._oNowButton) {
				this._oNowButton.destroy();
				this._oNowButton = null;
			}
		};

		/**
		 * Sets the time <code>displayFormat</code>.
		 *
		 * @param {string} sFormat New display format
		 * @returns {this} <code>this</code> instance, used for chaining
		 * @public
		 */
		TimePickerInternals.prototype.setDisplayFormat = function (sFormat) {
			this.setProperty("displayFormat", sFormat, true);

			this._destroyControls();
			this._createControls();

			return this;
		};

		/**
		 * Sets the <code>localeId</code> property.
		 *
		 * @param {string} sLocaleId The ID of the Locale
		 * @returns {this} <code>this</code> instance, used for chaining
		 * @public
		 */
		TimePickerInternals.prototype.setLocaleId = function(sLocaleId) {
			var oLocale,
				aPeriods;

			sLocaleId = this.validateProperty("localeId", sLocaleId);

			this.setProperty("localeId", sLocaleId, true);

			if (sLocaleId) {
				oLocale = new Locale(sLocaleId);
				aPeriods = LocaleData.getInstance(oLocale).getDayPeriods("abbreviated");

				this._sAM = aPeriods[0];
				this._sPM = aPeriods[1];

				this._destroyControls();
				this._createControls();
			}

			return this;
		};

		/**
		 * Sets <code>support2400</code> property.
		 *
		 * @param {boolean} bSupport2400 Whether the control supports setting of 24:00 value
		 * @returns {this} <code>this</code> instance, used for chaining
		 * @public
		 */
		TimePickerInternals.prototype.setSupport2400 = function (bSupport2400) {
			this.setProperty("support2400", bSupport2400, true);

			this._destroyControls();
			this._createControls();

			return this;
		};

		/**
		 * Sets the minutes clock step.
		 * @param {int} value The step used to generate values for the minutes clock
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		TimePickerInternals.prototype.setMinutesStep = function(value) {
			this.setProperty("minutesStep", value, true);

			this._destroyControls();
			this._createControls();

			return this;
		};

		/**
		 * Sets the seconds clock step.
		 * @param {int} value The step used to generate values for the seconds clock
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		TimePickerInternals.prototype.setSecondsStep = function(value) {
			this.setProperty("secondsStep", value, true);

			this._destroyControls();
			this._createControls();

			return this;
		};

		TimePickerInternals.prototype.setShowCurrentTimeButton = function(bShow) {
			this._getCurrentTimeButton().setVisible(bShow);

			return this.setProperty("showCurrentTimeButton", bShow);
		};

		/*
		 * PRIVATE API
		 */

		/**
		 * Destroys Contols of the picker.
		 * Must be overridden by controls that extend TimePickerInternals.
		 * @private
		 */
		TimePickerInternals.prototype._destroyControls = function() {};

		/**
		 * Creates Contols of the picker.
		 * Must be overridden by controls that extend TimePickerInternals.
		 * @private
		 */
		TimePickerInternals.prototype._createControls = function() {};

		/**
		 * Set what picker controls show.
		 *
		 * @param {object} oDate JavaScript date object
		 * @param {boolean} bHoursValueIs24 whether the hours value is 24 or not
		 * @private
		 */
		 TimePickerInternals.prototype._setTimeValues = function(oDate, bHoursValueIs24) {};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._checkStyle = function (sPattern) {
			return (sPattern === "short" || sPattern === "medium" || sPattern === "long" || sPattern === "full");
		};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._getDisplayFormatPattern = function () {
			var sPattern = this.getDisplayFormat();

			if (this._checkStyle(sPattern)) {
				sPattern = this._getLocaleBasedPattern(sPattern);
			}

			return sPattern;
		};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._getValueFormatPattern = function () {
			var sPattern = this._getBoundValueTypePattern() || this.getValueFormat() || "medium";

			if (this._checkStyle(sPattern)) {
				sPattern = this._getLocaleBasedPattern(sPattern);
			}

			return sPattern;
		};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._getLocaleBasedPattern = function (sPlaceholder) {
			return LocaleData.getInstance(
				Configuration.getFormatSettings().getFormatLocale()
			).getTimePattern(sPlaceholder);
		};

		/**
		 * Returns the segmented button for the format.
		 * @returns {sap.m.SegmentedButton|null} Format segmented button
		 * @private
		 */
		TimePickerInternals.prototype._getFormatButton = function () {
			return this.getAggregation("_buttonAmPm");
		};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._parseValue = function (sValue) {
			return this._getFormatter().parse(sValue);
		};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._getFormatter = function () {
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
				sCalendarType = Configuration.getCalendarType();
			}

			return this._getFormatterInstance(sPattern, bRelative, sCalendarType);
		};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._getBoundValueTypePattern = function () {
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
		TimePickerInternals.prototype._getFormatterInstance = function (sPattern, bRelative, sCalendarType, bDisplayFormat) {
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
		TimePickerInternals.prototype._getFormatInstance = function (oArguments, bDisplayFormat) {
			return DateFormat.getTimeInstance(oArguments);
		};

		/**
		 * @private
		 */
		TimePickerInternals.prototype._formatValue = function (oDate) {
			if (oDate) {
				return this._getFormatter().format(oDate);
			}

			return "";
		};

		/**
		 * Returns an array of separators between separate parts of the display format.
		 * @returns {array} array of separators
		 * @private
		 */
		TimePickerInternals.prototype._getTimeSeparators = function (sDisplayFormat) {
			var aFormatParts = DateFormat.getInstance({ pattern: sDisplayFormat }).aFormatArray,
				aSeparators = [],
				bPreviousWasEntity,
				iIndex;

				for (iIndex = 0; iIndex < aFormatParts.length; iIndex++) {
					if (aFormatParts[iIndex].type !== "text") {
						if (bPreviousWasEntity) {
							// there was previous non-separator entity, and this one is the same too, so add empty separator
							aSeparators.push("");
						} else {
							// this is non-separator entity, set the entity flag
							bPreviousWasEntity = true;
						}
					} else {
						// add separator and clear non-separator entity flag
						aSeparators.push(aFormatParts[iIndex].value);
						bPreviousWasEntity = false;
					}
				}

				return aSeparators;
		};

		/**
		 * Returns if the displayFormatPattern is HH or H (24 hours format with or without leading zero).
		 * @returns {boolean} Is the displayFormatPattern is HH or H (24 hours format with or without leading zero).
		 * @private
		 */
		TimePickerInternals.prototype._isFormatSupport24 = function () {
			var sFormat = this._getDisplayFormatPattern();
			return sFormat.indexOf("HH") !== -1 || sFormat.indexOf("H") !== -1;
		};

		TimePickerInternals.prototype._formatNumberToString = function (iNumber, bPrependZero, iMax, sReplacement) {
			var sNumber;
			if (bPrependZero && iNumber < 10) {
				sNumber = "0" + iNumber;
			} else if (iNumber === iMax && sReplacement !== "") {
				sNumber = sReplacement;
			} else {
				sNumber = iNumber.toString();
			}
			return sNumber;
		};

		/**
		 * Sets the value for aria-label attribute.
		 * @param {string} sAriaLabel
		 * @return {this} this for chaining
		 * @private
		 */
		TimePickerInternals.prototype._setAriaLabel = function (sAriaLabel) {
			this._sAriaLabel = sAriaLabel;

			return this;
		};

		/**
		 * Returns the aria-roledescription value.
		 * @return {string} aria-roledescription
		 * @private
		 */
		TimePickerInternals.prototype._getAriaLabel = function () {
			return this._sAriaLabel;
		};

		/**
		 * Sets the value for aria-roledescription attribute.
		 * @param {string} sAriaRoleDescription
		 * @return {this} this for chaining
		 * @private
		 */
		 TimePickerInternals.prototype._setAriaRoleDescription = function (sAriaRoleDescription) {
			this._sAriaRoleDescription = sAriaRoleDescription;

			return this;
		};

		/**
		 * Returns the aria-roledescription value.
		 * @return {string} aria-roledescription
		 * @private
		 */
		TimePickerInternals.prototype._getAriaRoleDescription = function () {
			return this._sAriaRoleDescription;
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
		 * @param {string} sValue Value to replace the zeroes in
		 * @param {int} iIndexOfHH index of the HH in the displayFormat
		 * @param {int} iIndexOfH index of the H in the displayFormat
		 * @private
		 */
		TimePickerInternals._replaceZeroHoursWith24 = function (sValue, iIndexOfHH, iIndexOfH) {
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
		 * @param {string} sValue Value to replace the 24 with zeroes in
		 * @param {int} iIndexOfHH index of the HH in the displayFormat
		 * @param {int} iIndexOfH index of the H in the displayFormat
		 * @private
		 */
		TimePickerInternals._replace24HoursWithZero = function (sValue, iIndexOfHH, iIndexOfH) {
			var iHoursDigits = 2,
				iSubStringIndex = iIndexOfHH;

			if (iIndexOfHH === -1) {
				iHoursDigits = 1;
				iSubStringIndex = iIndexOfH;
			}

			return sValue.substr(0, iSubStringIndex) + strRepeat(0, iHoursDigits) + sValue.substr(iSubStringIndex + 2);
		};


		/**
		 * Return if provided value hours is equal to 24.
		 * @private
		 */
		TimePickerInternals._isHoursValue24 = function (sValue, iIndexOfHH, iIndexOfH) {
			if (iIndexOfHH === -1 && iIndexOfH === -1) {
				return false;
			}

			var iSubStringIndex = iIndexOfHH;

			if (iIndexOfHH === -1) {
				iSubStringIndex = iIndexOfH;
			}

			return sValue.substr(iSubStringIndex, 2) === "24";
		};

		/**
		 * Returns the button that navigates to the current time.
		 *
		 * @returns {sap.m.Button|null} button that displays seconds
		 * @private
		 */
		TimePickerInternals.prototype._getCurrentTimeButton = function() {
			if (!this._oNowButton) {
				this._oNowButton = new Button(this.getId() + "-now", {
					icon: "sap-icon://present",
					tooltip: this._oResourceBundle.getText("TIMEPICKER_TOOLTIP_NOW"),
					type: ButtonType.Transparent,
					visible: false,
					press: function () {
						this._setTimeValues(new Date());
					}.bind(this)
				}).addStyleClass("sapMTPNow");
			}
			return this._oNowButton;
		};

		function strRepeat(sStr, iCount) {
			var sResult = "";

			for (var i = 0; i < iCount; i++) {
				sResult += sStr;
			}

			return sResult;
		}

		return TimePickerInternals;
	});