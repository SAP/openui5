/*!
 * ${copyright}
 */

// Provides control sap.m.DateTimeField.
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	'sap/ui/model/type/Date',
	'sap/ui/model/odata/type/ODataType',
	'sap/ui/model/odata/type/DateTimeBase',
	'./InputBase',
	'./ValueStateHeader',
	'sap/ui/core/LocaleData',
	'sap/ui/core/library',
	'sap/ui/core/format/DateFormat',
	'./DateTimeFieldRenderer',
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/date/UI5Date',
	'sap/ui/unified/calendar/CalendarUtils',
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos"
], function(
	Formatting,
	Library,
	Locale,
	SimpleDateType,
	ODataType,
	DateTimeBase,
	InputBase,
	ValueStateHeader,
	LocaleData,
	coreLibrary,
	DateFormat,
	DateTimeFieldRenderer,
	deepEqual,
	Log,
	jQuery,
	UI5Date,
	CalendarUtils
) {
	"use strict";

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>sap.m.DateTimeField</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.DateTimeField</code> control provides a basic functionality for date/time input controls.
	 *
	 * To be extended by date and time picker controls. For internal use only.
	 * @abstract
	 *
	 * @extends sap.m.InputBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.50.0
	 * @alias sap.m.DateTimeField
	 */
	var DateTimeField = InputBase.extend("sap.m.DateTimeField", /** @lends sap.m.DateTimeField.prototype */ {
		metadata: {
			"abstract" : true,
			library: "sap.m",
			properties: {
				/**
				 * Determines the format, displayed in the input field.
				 */
				displayFormat: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Determines the format of the value property.
				 */
				valueFormat: {type: "string", group: "Data", defaultValue: null},

				/**
				 * Holds a reference to a UI5Date or JavaScript Date object. The <code>value</code> (string)
				 * property will be set according to it. Alternatively, if the <code>value</code>
				 * and <code>valueFormat</code> pair properties are supplied instead,
				 * the <code>dateValue</code> will be instantiated according to the parsed
				 * <code>value</code>.
				 * Use <code>dateValue</code> as a helper property to easily obtain the day, month, year, hours, minutes
				 * and seconds of the chosen date and time. Although possible to bind it, the recommendation is not to do it.
				 * When binding is needed, use <code>value</code> property instead.
				 */
				dateValue: {type: "object", group: "Data", defaultValue: null},

				/**
				 * Holds a reference to a UI5Date or JavaScript Date object to define the initially focused
				 * date/time when the picker popup is opened.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>Setting this property does not change the <code>value</code> property.</li>
				 * <li>Depending on the context this property is used in ({@link sap.m.TimePicker},
				 * {@link sap.m.DatePicker} or {@link sap.m.DateTimePicker}), it takes into account only the time part, only
				 * the date part or both parts of the UI5Date or JavaScript Date object.</li>
				 * </ul>
				 * @since 1.54
				 */
				initialFocusedDateValue: {type: "object", group: "Data", defaultValue: null}
			},
			events : {

				/**
				 * Fired when the value of the <code>DateTimeField</code> is changed by user interaction - each keystroke, delete, paste, etc.
				 *
				 * <b>Note:</b> Browsing autocomplete suggestions doesn't fire the event.
				 * @since 1.104.0
				 */
				liveChange: {
					parameters : {
						/**
						 * The current value of the input, after a live change event.
						 */
						value: {type : "string"},

						/**
						 * The previous value of the input, before the last user interaction.
						 */
						previousValue: {type : "string"}
					}
				}
			}
		},

		renderer: DateTimeFieldRenderer
	});

	DateTimeField.prototype.setValue = function (sValue) {
		sValue = this.validateProperty("value", sValue); // to convert null and undefined to ""

		var sOldValue = this.getValue();
		if (sValue === sOldValue) {
			return this;
		} else {
			this.setLastValue(sValue);
		}

		// convert to date object and check validity on output
		var oDate = this._parseAndValidateValue(sValue);
		this.setProperty("dateValue", oDate, this._bPreferUserInteraction);

		// do not call InputBase.setValue because the displayed value and the output value might have different pattern
		this._formatValueAndUpdateOutput(oDate, sValue);
		this.setProperty("value", sValue, this._bPreferUserInteraction);

		return this;
	};

	DateTimeField.prototype._parseAndValidateValue = function(sValue) {
		this._bValid = true;

		// convert to date object
		var oDate;
		if (sValue) {
			try {
				oDate = this._parseValue(sValue);
			} catch (e) {
				//ignore parsing error
			}

			if (Array.isArray(oDate)) {
				oDate = oDate[0];
			}

			if (!oDate || !oDate.getTime || oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
				this._bValid = false;
				Log.warning("Value can not be converted to a valid date", this);
			}
		}

		return oDate;
	};

	DateTimeField.prototype._formatValueAndUpdateOutput = function(oDate, sValue) {
		if (!this.getDomRef()) {
			return;
		}
		// convert to output
		var sOutputValue = oDate ? this._formatValue(oDate) : sValue;

		if (this._bPreferUserInteraction) {
			// Handle the value concurrency before setting the value property of the control,
			// in order to distinguish whether the user only focused the input field or typed in it
			this.handleInputValueConcurrency(sOutputValue);
		} else if (this._$input.val() !== sOutputValue) {
			// update the DOM value when necessary
			// otherwise cursor can go to the end of text unnecessarily
			this._$input.val(sOutputValue);
			this._curpos = this._$input.cursorPos();
		}
	};

	/**
	 * Determines if a user is currently typing into the input field and this interaction should be taken with priority.
	 * @returns {boolean} True if a user interaction is currently getting handled with priority.
	 */
	DateTimeField.prototype._inPreferredUserInteraction = function() {
		if (this._bPreferUserInteraction && this.getDomRef()) {
			var oInnerDomRef = this.getFocusDomRef(),
				sInputDOMValue = oInnerDomRef && this._getInputValue(),
				sInputPropertyValue = this.getProperty("value"),
				bInputFocused = document.activeElement === oInnerDomRef;

			// if the user is currently in the field and he has typed a value,
			// the changes from the model should not overwrite the user input
			return bInputFocused && sInputDOMValue && (sInputPropertyValue !== sInputDOMValue);
		}

		return false;
	};

	/**
	 * Setter for property <code>dateValue</code>.
	 *
	 * The date and time in DateTimeField as UI5Date or JavaScript Date object.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	DateTimeField.prototype.setDateValue = function (oDate) {

		if (!this._isValidDate(oDate)) {
			throw new Error("Date must be a JavaScript or UI5Date date object; " + this);
		}

		if (deepEqual(this.getDateValue(), oDate)) {
			return this;
		}

		oDate = this._dateValidation(oDate);

		// convert date object to value
		var sValue = this._formatValue(oDate, true);

		if (sValue !== this.getValue()) {
			this.setLastValue(sValue);
		}
		// set the property in any case but check validity on output
		this.setProperty("value", sValue);

		if (this.getDomRef()) {
			// convert to output
			var sOutputValue = this._formatValue(oDate);

			if (this._$input.val() !== sOutputValue) {
				this._$input.val(sOutputValue);
				this._curpos = this._$input.cursorPos();
			}
		}

		return this;
	};

	DateTimeField.prototype.setValueFormat = function (sValueFormat) {
		// if valueFormat changes the value must be parsed again
		this.setProperty("valueFormat", sValueFormat, true); // no rerendering

		var sValue = this.getValue();

		if (sValue) {
			this._handleDateValidation(this._parseValue(sValue));
		}

		return this;
	};

	DateTimeField.prototype.setDisplayFormat = function (sDisplayFormat) {

		this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering

		this.updateDomValue(this._formatValue(this.getDateValue()));

		this.setPlaceholder(this._getPlaceholder());

		return this;
	};

	DateTimeField.prototype.getDisplayFormatType = function () {
		return null;
	};

	DateTimeField.prototype.onfocusin = function(oEvent) {

		if (!jQuery(oEvent.target).hasClass("sapUiIcon")) {
			this.addStyleClass("sapMFocus");
		}

		if (!jQuery(oEvent.target).hasClass("sapMInputBaseIconContainer") && !(this._oPopup && this._oPopup.isOpen())) {
			// open value state message popup when focus is in the input
			this.openValueStateMessage();
		} else if (this._oValueStateHeader) {
			this._oValueStateHeader
				.setValueState(this.getValueState())
				.setText(this._getTextForPickerValueStateContent())
				.setVisible(this.getValueState() !== ValueState.None);
		}

		this._sPreviousValue = this.getDOMValue();
	};

	/**
	 * Event handler for user input.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent User input.
	 */
	 DateTimeField.prototype.oninput = function(oEvent) {
		InputBase.prototype.oninput.call(this, oEvent);
		if (oEvent.isMarked("invalid")) {
			return;
		}

		var sValue = this.getDOMValue();

		if (sValue !== this._sPreviousValue) {
			this.fireLiveChange({
				value: sValue,
				previousValue : this._sPreviousValue
			});
			this._sPreviousValue = sValue;
		}
	 };

	/**
	 * Gets the inner input DOM value.
	 *
	 * @protected
	 * @returns {any} The value of the input.
	 */
	 DateTimeField.prototype.getDOMValue = function() {
		return this._$input.val();
	};

	DateTimeField.prototype._getValueStateHeader = function () {
		var sValueState;

		if (!this._oValueStateHeader) {
			sValueState = this.getValueState();

			this._oValueStateHeader = new ValueStateHeader({
				text: this._getTextForPickerValueStateContent(),
				valueState: sValueState,
				visible: sValueState !== ValueState.None
			});
		}

		return this._oValueStateHeader;
	};

	DateTimeField.prototype._dateValidation = function (oDate) {
		this._bValid = true;
		this.setProperty("dateValue", oDate);

		return oDate;
	};

	DateTimeField.prototype._handleDateValidation = function (oDate) {
		this._bValid = true;
		this.setProperty("dateValue", oDate);
	};

	DateTimeField.prototype._getPlaceholder = function() {

		var sPlaceholder = this.getPlaceholder(),
			oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType(),
			bDisplayFormat;

		if (!sPlaceholder) {
			if (oBindingType instanceof SimpleDateType) {
				return oBindingType.getPlaceholderText();
			}

			if (oBindingType instanceof ODataType && oBindingType.oFormat) {
				return oBindingType.oFormat.getPlaceholderText();
			}

			bDisplayFormat = !!this._getDisplayFormatPattern();

			sPlaceholder = this._getFormatter(bDisplayFormat).getPlaceholderText();
		}

		return sPlaceholder;

	};

	DateTimeField.prototype._getLocaleBasedPattern = function (sPlaceholder) {
		return LocaleData.getInstance(
			new Locale(Formatting.getLanguageTag())
		).getDatePattern(sPlaceholder);
	};

	DateTimeField.prototype._parseValue = function (sValue, bDisplayFormat) {
		var oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType(),
			// The internal "_getFormatter" method gets called now if there is a binding to the "value" property with
			// a supported binding type. As a result all needed internal control variables are created.
			oFormatter = this._getFormatter(bDisplayFormat),
			oFormatOptions,
			oDateLocal,
			oDate;

		if (this._isSupportedBindingType(oBindingType)) {
			try {
				oDate = oBindingType.parseValue(sValue, "string");

				if (typeof (oDate) === "string" && oBindingType instanceof DateTimeBase) {
					oDate = DateTimeBase.prototype.parseValue.call(oBindingType, sValue, "string");
				}

				oFormatOptions = oBindingType.oFormatOptions;
				if (oFormatOptions && oFormatOptions.source && oFormatOptions.source.pattern == "timestamp") {
					// convert timestamp back to Date
					oDate = UI5Date.getInstance(oDate);
				} else if (oFormatOptions && oFormatOptions.source && typeof oFormatOptions.source.pattern === "string") {
					oDate = oBindingType.oInputFormat.parse(sValue);
				}
			} catch (e) {
				// ignore, ParseException to be handled in ManagedObject.updateModelProperty()
			}

			if (oDate && ((oBindingType.oFormatOptions && this._isFormatOptionsUTC(oBindingType.oFormatOptions)) || (oBindingType.oConstraints && oBindingType.oConstraints.isDateOnly))) {
				// convert to local date because it was parsed as UTC date
				oDateLocal = UI5Date.getInstance(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate(),
					oDate.getUTCHours(), oDate.getUTCMinutes(), oDate.getUTCSeconds(), oDate.getUTCMilliseconds());

				oDateLocal.setFullYear(oDate.getUTCFullYear());
				oDate = oDateLocal;
			}
			return oDate;
		}

		return oFormatter.parse(sValue);
	};

	/* The bValueFormat variable defines whether the result is in valueFormat(true) or displayFormat(false) */
	DateTimeField.prototype._formatValue = function (oDate, bValueFormat) {
		if (!oDate) {
			return "";
		}

		var oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType(),
			oFormatOptions,
			oDateUTC;

		if (this._isSupportedBindingType(oBindingType)) {
			if ((oBindingType.oFormatOptions && oBindingType.oFormatOptions.UTC) || (oBindingType.oConstraints && oBindingType.oConstraints.isDateOnly)) {
				// convert to UTC date because it will be formatted as UTC date
				oDateUTC = CalendarUtils._createUTCDate(oDate, true);

				oDateUTC.setUTCFullYear(oDate.getFullYear());
				oDate = oDateUTC;
			}

			oFormatOptions = oBindingType.oFormatOptions;
			if (oFormatOptions && oFormatOptions.source && oFormatOptions.source.pattern == "timestamp") {
				// convert Date to timestamp
				oDate = oDate.getTime();
			} else if (oBindingType.oOutputFormat) {
				return oBindingType.oOutputFormat.format(oDate);
			}

			return oBindingType.formatValue(oDate, "string");
		}

		/* The logic of _getFormatter function expects the opposite boolean variable of bValueFormat */
		return this._getFormatter(!bValueFormat).format(oDate);
	};

	DateTimeField.prototype._isSupportedBindingType = function (oBindingType) {
		return !!oBindingType && oBindingType.isA([
			"sap.ui.model.type.Date",
			"sap.ui.model.odata.type.DateTime",
			"sap.ui.model.odata.type.DateTimeOffset"
		]);
	};

	DateTimeField.prototype._isFormatOptionsUTC = function (oBindingTypeFormatOptions) {
		// UTC can be set directly in oFormatOptions or inside the source along with the pattern
		return (oBindingTypeFormatOptions.UTC || (oBindingTypeFormatOptions.source && oBindingTypeFormatOptions.source.UTC));
	};

	DateTimeField.prototype._getDefaultDisplayStyle = function () {
		return "medium";
	};

	DateTimeField.prototype._getDefaultValueStyle = function () {
		return "short";
	};

	/* The bDisplayFormat variable defines whether the result is in displayFormat(true) or valueFormat(false) */
	DateTimeField.prototype._getFormatter = function (bDisplayFormat) {
		var sPattern = this._getBoundValueTypePattern(),
			bRelative = false, // if true strings like "Tomorrow" are parsed fine
			oFormat,
			oBinding = this.getBinding("value"),
			sCalendarType;

		if (oBinding && oBinding.oType && oBinding.oType.oOutputFormat) {
			bRelative = !!oBinding.oType.oOutputFormat.oFormatOptions.relative;
			sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
		}

		/* eslint-disable no-lonely-if */
		if (!sPattern) {
			// not databinding is used -> use given format
			if (bDisplayFormat) {
				sPattern = ( this.getDisplayFormat() || this._getDefaultDisplayStyle() );
				sCalendarType = this.getDisplayFormatType();
			} else {
				sPattern = ( this.getValueFormat() || this._getDefaultValueStyle() );
				sCalendarType = CalendarType.Gregorian;
			}
		}

		if (!sCalendarType) {
			sCalendarType = Formatting.getCalendarType();
		}

		if (bDisplayFormat) {
			if (sPattern === this._sUsedDisplayPattern && sCalendarType === this._sUsedDisplayCalendarType) {
				oFormat = this._oDisplayFormat;
			}
		} else {
			if (sPattern === this._sUsedValuePattern && sCalendarType === this._sUsedValueCalendarType) {
				oFormat = this._oValueFormat;
			}
		}

		if (oFormat) {
			return oFormat;
		}

		return this._getFormatterInstance(oFormat, sPattern, bRelative, sCalendarType, bDisplayFormat);
	};

	DateTimeField.prototype._getFormatterInstance = function (oFormat, sPattern, bRelative, sCalendarType, bDisplayFormat) {

		if (this._checkStyle(sPattern)) {
			oFormat = this._getFormatInstance({style: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType}, bDisplayFormat);
		} else {
			oFormat = this._getFormatInstance({pattern: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType}, bDisplayFormat);
		}

		if (bDisplayFormat) {
			this._sUsedDisplayPattern = sPattern;
			this._sUsedDisplayCalendarType = sCalendarType;
			this._oDisplayFormat = oFormat;
		} else {
			this._sUsedValuePattern = sPattern;
			this._sUsedValueCalendarType = sCalendarType;
			this._oValueFormat = oFormat;
		}

		return oFormat;
	};

	DateTimeField.prototype._getFormatInstance = function (oArguments, bDisplayFormat) {
		return DateFormat.getInstance(oArguments);
	};

	DateTimeField.prototype._checkStyle = function (sPattern) {
		return (sPattern === "short" || sPattern === "medium" || sPattern === "long" || sPattern === "full");
	};

	DateTimeField.prototype._getDisplayFormatPattern = function () {
		var sPattern = this._getBoundValueTypePattern();

		if (sPattern) {
			return sPattern;
		}

		sPattern = this.getDisplayFormat();

		if (this._checkStyle(sPattern)) {
			sPattern = this._getLocaleBasedPattern(sPattern);
		}

		return sPattern;
	};

	DateTimeField.prototype._getBoundValueTypePattern = function () {
		var oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType();

		if (oBindingType instanceof SimpleDateType) {
			return oBindingType.getOutputPattern();
		}

		if (oBindingType instanceof ODataType) {
			return oBindingType.getFormat().oFormatOptions.pattern;
		}

		return undefined;
	};

	// Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
	// because Date object in the test is different than the Date object in the application (due to the iframe).
	DateTimeField.prototype._isValidDate = function (oDate) {
		return !oDate || Object.prototype.toString.call(oDate) === "[object Date]";
	};

	/**
	 * Gets the text for the picker's subheader title.
	 * In case <code>valueStateText</code> is not set, a default value is returned.
	 * @returns {string}
	 * @private
	 */
	DateTimeField.prototype._getTextForPickerValueStateContent = function() {
		return this.getValueStateText() || this._getDefaultTextForPickerValueStateContent();
	};

	/**
	 * Gets the default text for the picker's subheader title.
	 * @returns {string}
	 * @private
	 */
	DateTimeField.prototype._getDefaultTextForPickerValueStateContent = function() {
		var sValueState = this.getValueState(),
			oResourceBundle,
			sText;

		if (sValueState === ValueState.None) {
			sText = "";
		} else {
			oResourceBundle = Library.getResourceBundleFor("sap.ui.core");
			sText = oResourceBundle.getText("VALUE_STATE_" + sValueState.toUpperCase());
		}

		return sText;
	};

	return DateTimeField;

});