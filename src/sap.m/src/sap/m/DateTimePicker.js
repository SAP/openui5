/*!
 * ${copyright}
 */

//Provides control sap.m.DateTimePicker.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./InputBase',
	'./DatePicker',
	'sap/ui/model/type/Date',
	'sap/ui/unified/DateRange',
	'./library',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/LocaleData',
	'sap/ui/core/Core',
	'sap/ui/core/format/TimezoneUtil',
	'./TimePickerClocks',
	'./DateTimePickerRenderer',
	'./SegmentedButton',
	'./SegmentedButtonItem',
	'./ResponsivePopover',
	'./Button',
	"sap/ui/events/KeyCodes",
	"sap/ui/core/IconPool",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(
	jQuery,
	InputBase,
	DatePicker,
	Date1,
	DateRange,
	library,
	coreLibrary,
	Control,
	Device,
	DateFormat,
	LocaleData,
	Core,
	TimezoneUtil,
	TimePickerClocks,
	DateTimePickerRenderer,
	SegmentedButton,
	SegmentedButtonItem,
	ResponsivePopover,
	Button,
	KeyCodes,
	IconPool,
	waitForThemeApplied
) {
	"use strict";

	// shortcut for sap.m.PlacementType and sap.m.ButtonType
	var PlacementType = library.PlacementType,
		ButtonType = library.ButtonType,
		// From Device.media.RANGESETS.SAP_STANDARD - "Phone": For screens smaller than 600 pixels.
		STANDART_PHONE_RANGESET = "Phone",
		CalendarType = coreLibrary.CalendarType;

	/**
	 * Constructor for a new <code>DateTimePicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables the users to select date (between 0001-01-01 and 9999-12-31) and time values in a combined input.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>DateTimePicker</code> control consists of two parts: the input field and the
	 * date/time picker.
	 *
	 * <b>Note:</b> The application developer should add dependency to <code>sap.ui.unified</code> library
	 * on application level to ensure that the library is loaded before the module dependencies will be required.
	 * The {@link sap.ui.unified.Calendar} is used internally only if the
	 * <code>DateTimePicker</code> is opened (not used for the initial rendering). If
	 * the <code>sap.ui.unified</code> library is not loaded before the
	 * <code>DateTimePicker</code> is opened, it will be loaded upon opening. This
	 * could lead to CSP compliance issues and adds an additional waiting time when the <code>DateTimePicker</code> is opened for
	 * the first time. To prevent this, apps using the <code>DateTimePicker</code>
	 * should also load the <code>sap.ui.unified</code> library in advance.
	 *
	 * <h3>Usage</h3>
	 *
	 * Use this control if you need a combined date and time input control.
	 *
	 * Don't use it if you want to use either a date or a time value. In this case,
	 * use the {@link sap.m.DatePicker} or the {@link sap.m.TimePicker} controls
	 * instead.
	 *
	 * The user can enter a date by:
	 * <ul> <li>Using the calendar or a time selector that opens in a popup</li>
	 * <li>Typing it in directly in the input field</li></ul>
	 *
	 * On app level, there are two options to provide a date for the
	 * <code>DateTimePicker</code> - as a string to the <code>value</code> property
	 * or as a JavaScript Date object to the <code>dateValue</code> property (only one
	 * of these properties should be used at a time):
	 *
	 * <ul><li>Use the <code>value</code> property if you want to bind the
	 * <code>DateTimePicker</code> to a model using the
	 * <code>sap.ui.model.type.DateTime</code></li>
	 * <li>Use the <code>value</code> property if the date is provided as a string from
	 * the backend or inside the app (for example, as ABAP type DATS field)</li>
	 * <li>Use the <code>dateValue</code> property if the date is already provided as a
	 * JavaScript Date object or you want to work with a JavaScript Date object.
	 * Use <code>dateValue</code> as a helper property to easily obtain the day, month, year,
	 * hours, minutes and seconds of the chosen date and time. Although possible to bind it,
	 * the recommendation is not to do it.
	 * When binding is needed, use <code>value</code> property instead</li></ul>
	 *
	 * <h3>Formatting</h3>
	 *
	 * All formatting and parsing of dates from and to strings is done using the
	 * {@link sap.ui.core.format.DateFormat}. If a date is entered by typing it into
	 * the input field, it must fit to the used date format and locale.
	 *
	 * Supported format options are pattern-based on Unicode LDML Date Format notation.
	 * See {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
	 *
	 * For example, if the <code>valueFormat</code> is "yyyy-MM-dd-HH-mm-ss", the
	 * <code>displayFormat</code> is "MMM d, y, HH:mm:ss", and the used locale is
	 * English, a valid value string is "2015-07-30-10-30-15", which leads to an output
	 * of "Jul 30, 2015, 10:30:15".
	 *
	 * If no placeholder is set to the <code>DateTimePicker</code>, the used
	 * <code>displayFormat</code> is displayed as a placeholder. If another placeholder
	 * is needed, it must be set.
	 *
	 * <b>Note:</b> If the string does NOT match the <code>displayFormat</code>
	 * (from user input) or the <code>valueFormat</code> (on app level), the
	 * {@link sap.ui.core.format.DateFormat} makes an attempt to parse it based on the
	 * locale settings. For more information, see the respective documentation in the
	 * API Reference.
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * The <code>DateTimePicker</code> is responsive and fully adapts to all devices.
	 * For larger screens, such as tablet or desktop, it opens as a popover. For
	 * mobile devices, it opens in full screen.
	 *
	 * @extends sap.m.DatePicker
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38.0
	 * @alias sap.m.DateTimePicker
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/datetime-picker/ Date/Time Picker}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateTimePicker = DatePicker.extend("sap.m.DateTimePicker", /** @lends sap.m.DateTimePicker.prototype */ { metadata : {

		library : "sap.m",
		properties: {
			/**
			 * Sets the minutes step. If the step is less than 1, it will be automatically converted back to 1.
			 * The minutes clock is populated only by multiples of the step.
			 * @since 1.56
			 */
			minutesStep: {type: "int", group: "Misc", defaultValue: 1 },

			/**
			 * Sets the seconds step. If the step is less than 1, it will be automatically converted back to 1.
			 * The seconds clock is populated only by multiples of the step.
			 * @since 1.56
			 */
			secondsStep: {type: "int", group: "Misc", defaultValue: 1 },

			/**
			 * Determines whether there is a shortcut navigation to current time.
			 *
			 * @since 1.98
			 */
			showCurrentTimeButton: { type: "boolean", group: "Behavior", defaultValue: false },

			/**
			 * Determines whether to show the timezone or not.
			 * @since 1.99
			 */
			showTimezone: { type: "boolean", group: "Behavior" },

			/**
			 * The IANA timezone ID, e.g <code>"Europe/Berlin"</code>. Date and time are displayed in this timezone.
			 * The <code>value</code> property string is treated as if it is formatted in this timezone.
			 * However, the <code>dateValue</code> property is a JS Date object, which is the same point in time
			 * as the <code>value</code>, but in the local timezone. Thus, it is adjusted when the
			 * <code>timezone</code> changes.
			 * @since 1.99
			 */
			timezone: { type: "string", group: "Data" }
		},
		designtime: "sap/m/designtime/DateTimePicker.designtime",
		dnd: { draggable: false, droppable: true }
	}, constructor: function(sId, mSettings, oScope) {
		var mSortedSettings;

		if ( typeof sId !== 'string' && sId !== undefined ) {
			// shift arguments in case sId was missing, but mSettings was given
			oScope = mSettings;
			mSettings = sId;
			sId = mSettings && mSettings.id;
		}

		mSortedSettings = mSettings ? Object.keys(mSettings)
			.sort(function(sKey1, sKey2) {
				if (sKey1 === "timezone") {
					return -1;
				} else if (sKey2 === "timezone") {
					return 1;
				}

				return 0;
			})
			.reduce(function (acc, key) {
					acc[key] = mSettings[key];
					return acc;
			}, {}) : mSettings;

		DatePicker.call(this, sId, mSortedSettings, oScope);
	}});

	var DateTimeFormatStyles = {
		Short: "short",
		Medium: "medium",
		Long: "long",
		Full: "full"
	};

	var PopupContent = Control.extend("sap.m.internal.DateTimePickerPopup", {

		metadata: {
			library : "sap.m",
			properties: {
				/* This property can be set to force the Phone view even if the device is not a phone */
				forcePhoneView : {type : "boolean", group : "Behavior", defaultValue : false}
			},
			aggregations: {
				_switcher  : {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				calendar   : {type: "sap.ui.core.Control", multiple: false},
				clocks: {type: "sap.ui.core.Control", multiple: false}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oPopup) {

				oRm.openStart("div", oPopup);
				oRm.class("sapMDateTimePopupCont")
					.class("sapMTimePickerDropDown");
				oRm.openEnd();

				var oSwitcher = oPopup.getAggregation("_switcher");
				if (oSwitcher) {
					oRm.openStart("div");
					oRm.class("sapMTimePickerSwitch");
					oRm.openEnd();
					oRm.renderControl(oSwitcher);
					oRm.close("div");
				}

				var oCalendar = oPopup.getCalendar();
				if (oCalendar) {
					oRm.renderControl(oCalendar);
				}

				oRm.openStart("div");
				oRm.class("sapMTimePickerSep");
				oRm.openEnd();
				oRm.close("div");

				var oClocks = oPopup.getClocks();
				if (oClocks) {
					oRm.renderControl(oClocks);
				}

				oRm.close("div");
			}
		},

		init: function() {

		},

		onBeforeRendering: function() {

			var oSwitcher = this.getAggregation("_switcher");

			if (!oSwitcher) {
				var oResourceBundle = Core.getLibraryResourceBundle("sap.m");
				var sDateText = oResourceBundle.getText("DATETIMEPICKER_DATE");
				var sTimeText = oResourceBundle.getText("DATETIMEPICKER_TIME");


				oSwitcher = new SegmentedButton(this.getId() + "-Switch", {
					selectedKey: "Cal",
					items: [
						new SegmentedButtonItem(this.getId() + "-Switch-Cal", {key: "Cal", text: sDateText}),
						new SegmentedButtonItem(this.getId() + "-Switch-Clk", {key: "Clk", text: sTimeText})
					]
				});
				oSwitcher.attachSelect(this._handleSelect, this);

				this.setAggregation("_switcher", oSwitcher, true);
			}

			if (Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone") || this.getForcePhoneView()) {
				oSwitcher.setVisible(true);
				oSwitcher.setSelectedKey("Cal");
				this.getCalendar().addDelegate({
					onAfterRendering: function() {
						this._switchVisibility(oSwitcher.getSelectedKey());
					}.bind(this)
				});
			} else {
				oSwitcher.setVisible(false);
			}
		},

		_handleSelect: function(oEvent) {

			var sKey = oEvent.getParameter("key");

			this._switchVisibility(sKey);
			if (sKey === "Clk") {
				this.getClocks()._focusActiveButton();
			}

		},

		_switchVisibility: function(sKey) {

			var oCalendar = this.getCalendar(),
				oClocks = this.getClocks();

			if (!oCalendar || !oClocks) {
				return;
			}

			if (sKey === "Cal") {
				oCalendar.$().css("display", "flex");
				oClocks.$().css("display", "none");
				oCalendar.getFocusDomRef() && oCalendar.getFocusDomRef().focus();
			} else {
				oCalendar.$().css("display", "none");
				oClocks.$().css("display", "");
			}

		},

		switchToTime: function() {

			var oSwitcher = this.getAggregation("_switcher");
			if (oSwitcher && oSwitcher.getVisible()) {
				oSwitcher.setSelectedKey("Clk");
				this._switchVisibility("Clk");
			}

		},

		getSpecialDates: function() {

			return this._oDateTimePicker.getSpecialDates();

		}
	});

	DateTimePicker.prototype.init = function() {
		DatePicker.prototype.init.apply(this, arguments);

		this._bOnlyCalendar = false;
	};

	DateTimePicker.prototype.setValue = function(sValue) {
		var sFallbackValue;

		DatePicker.prototype.setValue.apply(this, arguments);

		delete this._prefferedValue;

		if (!this.getDateValue()) {
			sFallbackValue = this._fallbackParse(sValue);

			if (typeof sFallbackValue === "string") {
				this._bValid = true;
				this._prefferedValue = sFallbackValue;

				// there is a re-render comming, but this updates the dom immediately to avoid flickering
				if (this.getDomRef() && this._$input.val() !== sFallbackValue) {
					this._$input.val(sFallbackValue);
					this._curpos = this._$input.cursorPos();
				}
			}
		}

		return this;
	};

	DateTimePicker.prototype.setTimezone = function(sTimezone) {
		var oCurrentDateValue,
			sFormattedValue,
			oNewDateValue;

		if (this.getTimezone() === sTimezone) {
			return this;
		}

		oCurrentDateValue = this.getDateValue() || this._parseValue(this.getValue(), false);
		sFormattedValue = this._formatValue(oCurrentDateValue, false);

		this.setProperty("timezone", sTimezone);

		this._oDisplayFormat = null;
		this._oValueFormat = null;
		this._oDisplayFormatWithTimezone = null;
		this._oValueFormatWithTimezone = null;

		if (this._oTimezonePopup) {
			this._oTimezonePopup.setTitle(sTimezone);
		}

		// the dateValue should be adjusted, and the value re-formatted
		oNewDateValue = this._parseValue(sFormattedValue, true);
		if (oNewDateValue) {
			this.setProperty("dateValue", oNewDateValue);
			this.setProperty("value", this._formatValue(oNewDateValue, true));
		}

		return this;
	};

	DateTimePicker.prototype.ontap = function(oEvent) {
		if (oEvent.target.parentElement.classList.contains("sapMDTPTimezoneLabel")) {
			this._togglePopoverOpen(this._getTimezoneNamePopup(), oEvent.target);
			return;
		}

		DatePicker.prototype.ontap.apply(this, arguments);
	};

	DateTimePicker.prototype.onAfterRendering = function() {
		if (this._getShowTimezone()) {
			waitForThemeApplied().then(function() {
				var oDummyContentDomRef = this.$().find(".sapMDummyContent"),
					iDummyWidth;

				if (!oDummyContentDomRef || !oDummyContentDomRef.length) {
					return;
				}

				iDummyWidth = oDummyContentDomRef[0].getBoundingClientRect().width;
				this.$("inner").css("max-width", (iDummyWidth + 2) + "px");
			}.bind(this));
		}
	};

	/**
	 * Apply the correct icon to the used Date control
	 * @protected
	 */
	DateTimePicker.prototype.getIconSrc = function () {
		return IconPool.getIconURI("date-time");
	};

	DateTimePicker.prototype.exit = function(){

		DatePicker.prototype.exit.apply(this, arguments);

		if (this._oClocks) {
			this._oClocks.destroy();
			delete this._oClocks;
		}

		this._oTimezonePopup = undefined;
		this._oPopupContent = undefined; // is destroyed via popup aggregation - just remove reference
		Device.media.detachHandler(this._handleWindowResize, this);
	};

	DateTimePicker.prototype.setDisplayFormat = function(sDisplayFormat) {
		this._oDisplayFormatWithTimezone = null;
		DatePicker.prototype.setDisplayFormat.apply(this, arguments);

		if (this._oClocks) {
			this._oClocks.setValueFormat(_getTimePattern.call(this));
			this._oClocks.setDisplayFormat(_getTimePattern.call(this));
		}

		return this;

	};

	DateTimePicker.prototype.setValueFormat = function(sValueFormat) {
		this._oValueFormatWithTimezone = null;
		return DatePicker.prototype.setValueFormat.apply(this, arguments);
	};

	DateTimePicker.prototype.setMinutesStep = function(iMinutesStep) {

		this.setProperty('minutesStep', iMinutesStep, true);

		if (this._oClocks) {
			this._oClocks.setMinutesStep(iMinutesStep);
		}

		return this;

	};

	DateTimePicker.prototype._getDefaultValueStyle = function () {
		return DateTimeFormatStyles.Medium;
	};

	DateTimePicker.prototype.setMinDate = function (oDate) {
		DatePicker.prototype.setMinDate.call(this, oDate);

		if (oDate) { //make sure the time part is as the original one
			this._oMinDate.setHours(oDate.getHours(), oDate.getMinutes(), oDate.getSeconds());
		}
		return this;
	};

	DateTimePicker.prototype.setMaxDate = function (oDate) {
		DatePicker.prototype.setMaxDate.call(this, oDate);

		if (oDate) { //make sure the time part is as the original one
			this._oMaxDate.setHours(oDate.getHours(), oDate.getMinutes(), oDate.getSeconds());
		}
		return this;
	};

	DateTimePicker.prototype.setSecondsStep = function(iSecondsStep) {

		this.setProperty('secondsStep', iSecondsStep, true);

		if (this._oClocks) {
			this._oClocks.setSecondsStep(iSecondsStep);
		}

		return this;

	};

	DateTimePicker.prototype.setShowCurrentTimeButton = function(bShow) {
		var oClocks = this._oClocks;

		oClocks && oClocks.setShowCurrentTimeButton(bShow);

		return this.setProperty("showCurrentTimeButton", bShow);
	};

	DateTimePicker.prototype._getTimezoneNamePopup = function() {
		var oResourceBundle;

		if (this._oTimezonePopup) {
			this._oTimezonePopup.setTitle(this._getTimezone(true));
			return this._oTimezonePopup;
		}

		this._oTimezonePopup = new ResponsivePopover({
			showArrow: false,
			placement: PlacementType.VerticalPreferredBottom,
			offsetX: 0,
			offsetY: 3,
			horizontalScrolling: false,
			title: this._getTimezone(true)
		});

		this.addDependent(this._oTimezonePopup);

		if (Device.system.phone) {
			oResourceBundle = Core.getLibraryResourceBundle("sap.m");

			this._oTimezonePopup.setEndButton(new Button({
				text: oResourceBundle.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON"),
				type: ButtonType.Emphasized,
				press: function () {
					this._oTimezonePopup.close();
				}.bind(this)
			}));
		}

		return this._oTimezonePopup;
	};

	DateTimePicker.prototype._togglePopoverOpen = function(oPopover, oOpenerDomRef) {
		if (oPopover.isOpen()) {
			oPopover.close();
		} else {
			oPopover.openBy(oOpenerDomRef || this.getDomRef());
		}
	};

	DateTimePicker.prototype._getFormatter = function(bDisplayFormat) {
		var sCacheName = this._getTimezoneFormatterCacheName(bDisplayFormat);

		if (!this[sCacheName]) {
			this[sCacheName] = DateFormat.getDateTimeWithTimezoneInstance(this._getTimezoneFormatOptions(bDisplayFormat));
		}

		return this[sCacheName];
	};

	/**
	 * Gets the format options of the value or dateValue binding.
	 * @returns {object} The binding format options or undefined.
	 * @private
	 */
	DateTimePicker.prototype._getBindingFormatOptions = function() {
		var oBinding = this.getBinding("value") || this.getBinding("dateValue"),
			oBindingType;

		if (oBinding) {
			oBindingType = oBinding.getType();
		}

		if (this._isSupportedBindingType(oBindingType)) {
			return jQuery.extend({}, oBindingType.getFormatOptions());
		}
	};

	/**
	 * Gets the combined format options from both properties and binding for
	 * formatting dates with timezones.
	 * @param {boolean} bDisplayFormat Determines which formatter to create - for
	 * the display or for the value property string
	 * @returns {object} An object with DateFormat options
	 * @private
	 */
	DateTimePicker.prototype._getTimezoneFormatOptions = function(bDisplayFormat) {
		var oFormatOptions = this._getBindingFormatOptions() || {},
			sFormat = bDisplayFormat ? this.getDisplayFormat() : this.getValueFormat(),
			oBinding = this.getBinding("value") || this.getBinding("dateValue"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType();

		if (bDisplayFormat || !this._getTimezone() ||
			(oBindingType && !oBindingType.isA(["sap.ui.model.odata.type.DateTimeWithTimezone"]))) {
			oFormatOptions.showTimezone = false;
		}

		if (oFormatOptions.relative === undefined) {
			oFormatOptions.relative = false;
		}

		if (oFormatOptions.calendarType === undefined) {
			oFormatOptions.calendarType = bDisplayFormat
				? this.getDisplayFormatType()
				: CalendarType.Gregorian;
		}

		if (oFormatOptions.strictParsing === undefined) {
			oFormatOptions.strictParsing = true;
		}

		if (sFormat && !this._isSupportedBindingType(oBindingType)) {
			oFormatOptions[this._checkStyle(sFormat) ? "style" : "pattern"] = sFormat;
		}

		return oFormatOptions;
	};

	/**
	 * Returns the name of the cache property used for either the display formatter,
	 * or the value formatter with timezone.
	 * @private
	*/
	DateTimePicker.prototype._getTimezoneFormatterCacheName = function(bDisplayFormat) {
		return bDisplayFormat ? "_oDisplayFormatWithTimezone" : "_oValueFormatWithTimezone";
	};

	/**
	 * If the control should display a timezone label.
	 * The property is with priority over the binding options.
	 * @returns {boolean} Returns true, if the control should display a timezone
	 * @private
	 */
	DateTimePicker.prototype._getShowTimezone = function() {
		var oBinding = this.getBinding("value") || this.getBinding("dateValue"),
			oBindingType = oBinding && oBinding.getType();

		if (this.getShowTimezone() === undefined && oBindingType && oBindingType.isA(["sap.ui.model.odata.type.DateTimeWithTimezone"])) {
			return oBindingType.getFormatOptions().showTimezone !== false;
		}

		return this.getShowTimezone();
	};

	/**
	 * Gets the timezone that will be used by the control.
	 * The timezone property is with priority over the binding options.
	 * @param {boolean} bUseDefaultAsFallback Whether to use the application default as a fallback.
	 * @returns {string} The timezone IANA ID
	 * @private
	 */
	DateTimePicker.prototype._getTimezone = function(bUseDefaultAsFallback) {
		var oBinding = this.getBinding("value") || this.getBinding("dateValue"),
			oBindingType = oBinding && oBinding.getType();

		if (!this.getTimezone() && oBindingType
			&& oBindingType.isA(["sap.ui.model.odata.type.DateTimeWithTimezone"])
			&& oBinding.aValues[1]) {
			return oBinding.aValues[1];
		}

		return this.getTimezone() || (bUseDefaultAsFallback && Core.getConfiguration().getTimezone());
	};

	DateTimePicker.prototype._checkStyle = function(sPattern){

		if (DatePicker.prototype._checkStyle.apply(this, arguments)) {
			// it's a simple style
			return true;
		} else if (sPattern.indexOf("/") > 0) {
			// could be a mixed style
			var aStyles = [ DateTimeFormatStyles.Short, DateTimeFormatStyles.Medium, DateTimeFormatStyles.Long, DateTimeFormatStyles.Long];
			var bStyle = false;

			for (var i = 0; i < aStyles.length; i++) {
				var sStyle1 = aStyles[i];

				for (var j = 0; j < aStyles.length; j++) {
					var sStyle2 = aStyles[j];
					if (sPattern == sStyle1 + "/" + sStyle2) {
						bStyle = true;
						break;
					}
				}

				if (bStyle) {
					break;
				}
			}

			return bStyle;
		}

		// is something else
		return false;

	};

	DateTimePicker.prototype._parseValue = function(sValue, bDisplayFormat, sTimezone) {
		var oBinding = this.getBinding("value") || this.getBinding("dateValue"),
			oBindingType = oBinding && oBinding.getType(),
			aDateWithTimezone;

		if (oBindingType && oBindingType.isA(["sap.ui.model.odata.type.DateTimeWithTimezone"])) {
			var aCurrentBindingValues = oBinding.getCurrentValues().slice(0);
			aCurrentBindingValues[1] = sTimezone || this._getTimezone(true);
			return oBindingType.parseValue(sValue, "string", aCurrentBindingValues)[0];
		}

		aDateWithTimezone = this._getFormatter(bDisplayFormat)
			.parse(sValue, sTimezone || this._getTimezone(true));

		if (!aDateWithTimezone || !aDateWithTimezone.length) {
			return null;
		}

		return aDateWithTimezone[0];
	};

	DateTimePicker.prototype._formatValue = function(oDate, bValueFormat, sTimezone) {
		if (!oDate) {
			return "";
		}

		return this._getFormatter(!bValueFormat).format(oDate, sTimezone || this._getTimezone(true));
	};

	/**
	 * Tries to parse the value to see if it is a timezone only string.
	 * @param {string} sValue A value string
	 * @return {string|null} An empty string indicating success or null
	 * @private
	 */
	DateTimePicker.prototype._fallbackParse = function(sValue) {
		return this._getFallbackParser().parse(sValue) ? "" : null;
	};

	DateTimePicker.prototype._getFallbackParser = function() {
		if (!this._fallbackParser) {
			this._fallbackParser = DateFormat.getDateTimeWithTimezoneInstance({
				showDate: false,
				showTime: false,
				showTimezone: true
			});
		}

		return this._fallbackParser;
	};

	DateTimePicker.prototype._getPickerParser = function() {
		if (!this._clocksParser) {
			this._clocksParser = DateFormat.getDateTimeWithTimezoneInstance({ showTimezone: false });
		}

		return this._clocksParser;
	};

	DateTimePicker.prototype._getLocaleBasedPattern = function(sPlaceholder) {
		var oLocaleData = LocaleData.getInstance(
				Core.getConfiguration().getFormatSettings().getFormatLocale()
			),
			iSlashIndex = sPlaceholder.indexOf("/");

		if (iSlashIndex > 0) {
			return oLocaleData.getCombinedDateTimePattern(sPlaceholder.substr(0, iSlashIndex), sPlaceholder.substr(iSlashIndex + 1));
		} else {
			return oLocaleData.getCombinedDateTimePattern(sPlaceholder, sPlaceholder);
		}

	};

	DateTimePicker.prototype._createPopup = function(){

		var sLabelId, sLabel, oResourceBundle, sOKButtonText, sCancelButtonText, oPopover;

		if (!this._oPopup) {
			oResourceBundle = Core.getLibraryResourceBundle("sap.m");
			sOKButtonText = oResourceBundle.getText("TIMEPICKER_SET");
			sCancelButtonText = oResourceBundle.getText("TIMEPICKER_CANCEL");

			this._oPopupContent = new PopupContent(this.getId() + "-PC");
			this._oPopupContent._oDateTimePicker = this;

			this._oOKButton = new Button(this.getId() + "-OK", {
				text: sOKButtonText,
				type: ButtonType.Emphasized,
				press: _handleOkPress.bind(this)
			});
			var oHeader = this._getValueStateHeader();
			this._oPopup = new ResponsivePopover(this.getId() + "-RP", {
				showCloseButton: false,
				showHeader: false,
				placement: PlacementType.VerticalPreferedBottom,
				beginButton: this._oOKButton,
				content: [
					oHeader,
					this._oPopupContent
				],
				afterOpen: _handleAfterOpen.bind(this),
				afterClose: _handleAfterClose.bind(this)
			});
			oHeader.setPopup(this._oPopup._oControl);


			if (Device.system.phone) {
				sLabelId = this.$("inner").attr("aria-labelledby");
				sLabel = sLabelId ? document.getElementById(sLabelId).getAttribute("aria-label") : "";
				this._oPopup.setTitle(sLabel);
				this._oPopup.setShowHeader(true);
				this._oPopup.setShowCloseButton(true);
			} else {
				// We add time in miliseconds for opening and closing animations of the popup,
				// so the opening and closing event handlers are properly ordered in the event queue
				this._oPopup._getPopup().setDurations(0, 0);
				this._oPopup.setEndButton(new Button(this.getId() + "-Cancel", {
					text: sCancelButtonText,
					press: _handleCancelPress.bind(this)
				}));
			}

			this._oPopup.addStyleClass("sapMDateTimePopup");

			oPopover = this._oPopup.getAggregation("_popup");
			// hide arrow in case of popover as dialog does not have an arrow
			if (oPopover.setShowArrow) {
				oPopover.setShowArrow(false);
			}

			// define a parent-child relationship between the control's and the _picker pop-up
			this.setAggregation("_popup", this._oPopup, true);

		}

	};

	DateTimePicker.prototype._openPopup = function(oDomRef){

		if (!this._oPopup) {
			return;
		}
		if (!oDomRef) {
			oDomRef = this.getDomRef();
		}
		this.addStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);

		var oPopover = this._oPopup.getAggregation("_popup");
		oPopover.oPopup.setExtraContent([oDomRef]);

		this._oPopup.openBy(oDomRef || this);
	};

	DateTimePicker.prototype._createPopupContent = function(){

		var bNoCalendar = !this._oCalendar;

		DatePicker.prototype._createPopupContent.apply(this, arguments);

		if (bNoCalendar) {
			this._oPopupContent.setCalendar(this._oCalendar);
			this._oCalendar.attachSelect(_handleCalendarSelect, this);
		}

		if (!this._oClocks) {
			this._oClocks = new TimePickerClocks(this.getId() + "-Clocks", {
				minutesStep: this.getMinutesStep(),
				secondsStep: this.getSecondsStep(),
				valueFormat: _getTimePattern.call(this),
				displayFormat: _getTimePattern.call(this),
				localeId: this.getLocaleId(),
				showCurrentTimeButton: this.getShowCurrentTimeButton()
			});
			this._oPopupContent.setClocks(this._oClocks);
		}

	};

	/* Override of the DatePicker method - this delegate is not needed in DateTimePicker */
	DateTimePicker.prototype._attachAfterRenderingDelegate = function()	{
	};

	DateTimePicker.prototype._selectFocusedDateValue = function (oDateRange) {
		var oCalendar = this._oCalendar;

		oCalendar.removeAllSelectedDates();
		oCalendar.addSelectedDate(oDateRange);

		return this;
	};

	DateTimePicker.prototype._fillDateRange = function(){

		var oDate = this.getDateValue(),
			bDateFound = true,
			sFormattedDate;

		if (oDate) {
			oDate = new Date(oDate.getTime());
			this._oOKButton.setEnabled(true);
		} else {
			bDateFound = false;
			oDate = this.getInitialFocusedDateValue();
			if (!oDate) {
				oDate = new Date();
				this._oCalendar.removeAllSelectedDates();
			}
			var iMaxTimeMillis = this._oMaxDate.getTime();

			if (oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > iMaxTimeMillis) {
				oDate = this._oMinDate;
			}
			this._oOKButton.setEnabled(false);
		}

		// convert the date to local date for the calendar and the clocks
		sFormattedDate = this._getPickerParser().format(oDate, this._getTimezone(true));
		oDate = this._getPickerParser().parse(sFormattedDate, TimezoneUtil.getLocalTimezone())[0];

		this._oCalendar.focusDate(oDate);

		if (bDateFound) {
			if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() != oDate.getTime()) {
				this._oDateRange.setStartDate(oDate);
			}
		}

		this._oClocks._setTimeValues(oDate);
	};

	DateTimePicker.prototype._getSelectedDate = function(){

		var oDate = DatePicker.prototype._getSelectedDate.apply(this, arguments),
			sFormattedDate;

		if (oDate) {
			var oDateTime = this._oClocks.getTimeValues();
			var sPattern = this._oClocks._getDisplayFormatPattern();
			if (sPattern.search("h") >= 0 || sPattern.search("H") >= 0) {
				oDate.setHours(oDateTime.getHours());
			}
			if (sPattern.search("m") >= 0) {
				oDate.setMinutes(oDateTime.getMinutes());
			}
			if (sPattern.search("s") >= 0) {
				oDate.setSeconds(oDateTime.getSeconds());
			}

			if (oDate.getTime() < this._oMinDate.getTime()) {
				oDate = new Date(this._oMinDate.getTime());
			} else if (oDate.getTime() > this._oMaxDate.getTime()){
				oDate = new Date(this._oMaxDate.getTime());
			}
		}

		sFormattedDate = this._getPickerParser().format(oDate, TimezoneUtil.getLocalTimezone());
		oDate = this._getPickerParser().parse(sFormattedDate, this._getTimezone(true))[0];

		return oDate;
	};

	DateTimePicker.prototype.getLocaleId = function(){

		return Core.getConfiguration().getFormatSettings().getFormatLocale().toString();

	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {object} Current accessibility state of the control
	 * @protected
	 */
	DateTimePicker.prototype.getAccessibilityInfo = function() {
		var oInfo = DatePicker.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.type = Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT");
		return oInfo;
	};

	function _handleOkPress(oEvent){
		this._handleCalendarSelect();
	}

	function _handleCancelPress(oEvent){
		this.onsaphide(oEvent);
		if (!this.getDateValue()) {
			this._oCalendar.removeAllSelectedDates();
		}
	}

	/**
	 * @private
	 */
	DateTimePicker.prototype._handleWindowResize = function(mParams) {
		var oSwitcher = this.getAggregation("_popup").getContent()[1].getAggregation("_switcher"),
			oCalendar = this.getAggregation("_popup").getContent()[1].getCalendar(),
			oClocks = this.getAggregation("_popup").getContent()[1].getClocks();

		if (mParams.name === STANDART_PHONE_RANGESET) {
			oSwitcher.setVisible(true);
			// Getting "sap.m.internal.DateTimePickerPopup" instance in order to call "_switchVisibility(sKey)" method
			this.getAggregation("_popup").getContent()[1]._switchVisibility(oSwitcher.getSelectedKey());
		} else {
			oSwitcher.setVisible(false);
			oClocks.$().css("display", "");
			oCalendar.$().css("display", "flex");
		}
	};

	function _handleAfterOpen(oEvent){
		this._oCalendar.focus();

		Device.media.attachHandler(this._handleWindowResize, this);
		this.fireAfterValueHelpOpen();
	}

	function _handleAfterClose(){
		this.removeStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);

		this._oCalendar._closePickers();
		Device.media.detachHandler(this._handleWindowResize, this);
		this.fireAfterValueHelpClose();
	}

	function _getTimePattern(){

		var sDisplayFormat = this.getDisplayFormat();
		var sTimePattern;
		var oBinding = this.getBinding("value");

		if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
			sDisplayFormat = oBinding.oType.getOutputPattern();
		} else if (oBinding && oBinding.oType && oBinding.oType.oFormat) {
			sDisplayFormat = oBinding.oType.oFormat.oFormatOptions.pattern;
		} else {
			sDisplayFormat = this.getDisplayFormat();
		}

		if (!sDisplayFormat) {
			sDisplayFormat = DateTimeFormatStyles.Medium;
		}

		var iSlashIndex = sDisplayFormat.indexOf("/");
		if (iSlashIndex > 0 && this._checkStyle(sDisplayFormat)) {
			sDisplayFormat = sDisplayFormat.substr(iSlashIndex + 1);
		}

		if (sDisplayFormat == DateTimeFormatStyles.Short || sDisplayFormat == DateTimeFormatStyles.Medium || sDisplayFormat == DateTimeFormatStyles.Long || sDisplayFormat == DateTimeFormatStyles.Full) {
			var oLocale = Core.getConfiguration().getFormatSettings().getFormatLocale();
			var oLocaleData = LocaleData.getInstance(oLocale);
			sTimePattern = oLocaleData.getTimePattern(sDisplayFormat);
		} else {
			sTimePattern = sDisplayFormat;
		}

		return sTimePattern;

	}

	function _handleCalendarSelect(oEvent) {
		this._oPopupContent.switchToTime();
		this._oPopupContent.getClocks()._focusActiveButton();
		this._oOKButton.setEnabled(true);
	}

	return DateTimePicker;

});