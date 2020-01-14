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
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/LocaleData',
	'./DateTimePickerRenderer',
	'./TimePickerSliders',
	'./SegmentedButton',
	'./SegmentedButtonItem',
	'./ResponsivePopover',
	'./Button',
	"sap/ui/events/KeyCodes",
	"sap/ui/core/IconPool"
], function(
	jQuery,
	InputBase,
	DatePicker,
	Date1,
	DateRange,
	library,
	Control,
	Device,
	DateFormat,
	LocaleData,
	DateTimePickerRenderer,
	TimePickerSliders,
	SegmentedButton,
	SegmentedButtonItem,
	ResponsivePopover,
	Button,
	KeyCodes,
	IconPool
) {
	"use strict";

	// shortcut for sap.m.PlacementType and sap.m.ButtonType
	var PlacementType = library.PlacementType,
		ButtonType = library.ButtonType,
		// From sap.ui.Device.media.RANGESETS.SAP_STANDARD - "Phone": For screens smaller than 600 pixels.
		STANDART_PHONE_RANGESET = "Phone";

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
	 * <b>Note:</b> The {@link sap.ui.unified.Calendar} is used internally only if the
	 * <code>DateTimePicker</code> is opened (not used for the initial rendering). If
	 * the <code>sap.ui.unified</code> library is not loaded before the
	 * <code>DateTimePicker</code> is opened, it will be loaded upon opening. This
	 * could lead to a waiting time when the <code>DateTimePicker</code> is opened for
	 * the first time. To prevent this, apps using the <code>DateTimePicker</code>
	 * should also load the <code>sap.ui.unified</code> library.
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
			 * Sets the minutes slider step. If the step is less than 1, it will be automatically converted back to 1.
			 * The minutes slider is populated only by multiples of the step.
			 * @since 1.56
			 */
			minutesStep: {type: "int", group: "Misc", defaultValue: 1 },

			/**
			 * Sets the seconds slider step. If the step is less than 1, it will be automatically converted back to 1.
			 * The seconds slider is populated only by multiples of the step.
			 * @since 1.56
			 */
			secondsStep: {type: "int", group: "Misc", defaultValue: 1 }
		},
		designtime: "sap/m/designtime/DateTimePicker.designtime",
		dnd: { draggable: false, droppable: true }
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
			aggregations: {
				_switcher  : {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				calendar   : {type: "sap.ui.core.Control", multiple: false},
				timeSliders: {type: "sap.ui.core.Control", multiple: false}
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

				var oSliders = oPopup.getTimeSliders();
				if (oSliders) {
					oRm.renderControl(oSliders);
				}

				oRm.close("div");
			}
		},

		init: function() {

		},

		onBeforeRendering: function() {

			var oSwitcher = this.getAggregation("_switcher");

			if (!oSwitcher) {
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
				var sDateText = oResourceBundle.getText("DATETIMEPICKER_DATE");
				var sTimeText = oResourceBundle.getText("DATETIMEPICKER_TIME");


				oSwitcher = new SegmentedButton(this.getId() + "-Switch", {
					selectedKey: "Cal",
					items: [
						new SegmentedButtonItem(this.getId() + "-Switch-Cal", {key: "Cal", text: sDateText}),
						new SegmentedButtonItem(this.getId() + "-Switch-Sli", {key: "Sli", text: sTimeText})
					]
				});
				oSwitcher.attachSelect(this._handleSelect, this);

				this.setAggregation("_switcher", oSwitcher, true);
			}

			if (Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				oSwitcher.setVisible(true);
				oSwitcher.setSelectedKey("Cal");
			} else {
				oSwitcher.setVisible(false);
			}

		},

		onAfterRendering: function() {

			if (Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				var oSwitcher = this.getAggregation("_switcher");
				var sKey = oSwitcher.getSelectedKey();
				this._switchVisibility(sKey);
			}
		},

		_handleSelect: function(oEvent) {

			this._switchVisibility(oEvent.getParameter("key"));
		},

		_switchVisibility: function(sKey) {

			var oCalendar = this.getCalendar();
			var oSliders = this.getTimeSliders();

			if (!oCalendar || !oSliders) {
				return;
			}

			if (sKey == "Cal") {
				oCalendar.$().css("display", "");
				oSliders.$().css("display", "none");
			} else {
				oCalendar.$().css("display", "none");
				oSliders.$().css("display", "");
				oSliders._updateSlidersValues();
				oSliders._onOrientationChanged();
				oSliders.openFirstSlider();
			}

		},

		switchToTime: function() {

			var oSwitcher = this.getAggregation("_switcher");
			if (oSwitcher && oSwitcher.getVisible()) {
				oSwitcher.setSelectedKey("Sli");
				this._switchVisibility("Sli");
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

	/**
	 * Apply the correct icon to the used Date control
	 * @protected
	 */
	DateTimePicker.prototype.getIconSrc = function () {
		return IconPool.getIconURI("date-time");
	};

	DateTimePicker.prototype.exit = function(){

		DatePicker.prototype.exit.apply(this, arguments);

		if (this._oSliders) {
			this._oSliders.destroy();
			delete this._oSliders;
		}

		this._oPopupContent = undefined; // is destroyed via popup aggregation - just remove reference
		Device.media.detachHandler(this._handleWindowResize, this);
	};

	DateTimePicker.prototype.setDisplayFormat = function(sDisplayFormat) {

		DatePicker.prototype.setDisplayFormat.apply(this, arguments);

		if (this._oSliders) {
			this._oSliders.setDisplayFormat(_getTimePattern.call(this));
		}

		return this;

	};

	DateTimePicker.prototype.setMinutesStep = function(iMinutesStep) {

		this.setProperty('minutesStep', iMinutesStep, true);

		if (this._oSliders) {
			this._oSliders.setMinutesStep(iMinutesStep);
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

		if (this._oSliders) {
			this._oSliders.setSecondsStep(iSecondsStep);
		}

		return this;

	};

	DateTimePicker.prototype._getFormatInstance = function(oArguments, bDisplayFormat){

		var oMyArguments = jQuery.extend({}, oArguments);

		// check for mixed styles
		var iSlashIndex = -1;

		if (oMyArguments.style) {
			iSlashIndex = oMyArguments.style.indexOf("/");
		}

		if (bDisplayFormat) {
			// also create a date formatter as fallback for parsing
			var oDateArguments = jQuery.extend({}, oMyArguments);

			if (iSlashIndex > 0) {
				oDateArguments.style = oDateArguments.style.substr(0, iSlashIndex);
			}

			this._oDisplayFormatDate = DateFormat.getInstance(oDateArguments);
		}

		return DateFormat.getDateTimeInstance(oMyArguments);

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

	DateTimePicker.prototype._parseValue = function(sValue, bDisplayFormat) {

		var oDate = DatePicker.prototype._parseValue.apply(this, arguments);

		if (bDisplayFormat && !oDate) {
			// maybe only a date is entered
			oDate = this._oDisplayFormatDate.parse(sValue);
			if (oDate) {
				// use time of existing date or current time
				var oOldDate = this.getDateValue();
				if (!oOldDate) {
					oOldDate = new Date();
				}
				oDate.setHours(oOldDate.getHours());
				oDate.setMinutes(oOldDate.getMinutes());
				oDate.setSeconds(oOldDate.getSeconds());
				oDate.setMilliseconds(oOldDate.getMilliseconds());
			}
		}

		return oDate;

	};

	DateTimePicker.prototype._getLocaleBasedPattern = function(sPlaceholder) {
		var oLocaleData = LocaleData.getInstance(
				sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()
			),
			iSlashIndex = sPlaceholder.indexOf("/");

		if (iSlashIndex > 0) {
			return oLocaleData.getCombinedDateTimePattern(sPlaceholder.substr(0, iSlashIndex), sPlaceholder.substr(iSlashIndex + 1));
		} else {
			return oLocaleData.getCombinedDateTimePattern(sPlaceholder, sPlaceholder);
		}

	};

	DateTimePicker.prototype._createPopup = function(){

		if (!this._oPopup) {
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			var sOKButtonText = oResourceBundle.getText("TIMEPICKER_SET");
			var sCancelButtonText = oResourceBundle.getText("TIMEPICKER_CANCEL");

			this._oPopupContent = new PopupContent(this.getId() + "-PC");
			this._oPopupContent._oDateTimePicker = this;

			this._oPopup = new ResponsivePopover(this.getId() + "-RP", {
				showCloseButton: false,
				showHeader: false,
				placement: PlacementType.VerticalPreferedBottom,
				beginButton: new Button(this.getId() + "-OK", { text: sOKButtonText,type: ButtonType.Emphasized, press: jQuery.proxy(_handleOkPress, this) }),
				endButton: new Button(this.getId() + "-Cancel", { text: sCancelButtonText, press: jQuery.proxy(_handleCancelPress, this) }),
				content: this._oPopupContent
			});

			this._oPopup.addStyleClass("sapMDateTimePopup");

			var oPopover = this._oPopup.getAggregation("_popup");
			// hide arrow in case of popover as dialog does not have an arrow
			if (oPopover.setShowArrow) {
				oPopover.setShowArrow(false);
			}

			this._oPopup.attachAfterOpen(_handleAfterOpen, this);
			this._oPopup.attachAfterClose(_handleAfterClose, this);

			if (Device.system.desktop) {
				this._oPopoverKeydownEventDelegate = {
						onkeydown: function(oEvent) {
							var oKC = KeyCodes,
							iKC = oEvent.which || oEvent.keyCode,
							bAlt = oEvent.altKey;

							// Popover should be closed when Alt+Arrow key or F4 is pressed
							if ((bAlt && (iKC === oKC.ARROW_UP || iKC === oKC.ARROW_DOWN)) || iKC === oKC.F4) {
								_handleOkPress.call(this, oEvent);
								//focus the input
								this.focus();
								oEvent.preventDefault();
							}
						}
				};

				this._oPopup.addEventDelegate(this._oPopoverKeydownEventDelegate, this);
			}

			// define a parent-child relationship between the control's and the _picker pop-up
			this.setAggregation("_popup", this._oPopup, true);

		}

	};

	DateTimePicker.prototype._openPopup = function(){

		if (!this._oPopup) {
			return;
		}
		this.addStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);
		this._storeInputSelection(this._$input.get(0));

		var oPopover = this._oPopup.getAggregation("_popup");
		oPopover.oPopup.setAutoCloseAreas([this.getDomRef()]);

		this._oPopup.openBy(this);

		var oSliders = this._oPopup.getContent()[0] && this._oPopup.getContent()[0].getTimeSliders();
		if (oSliders) {//Sliders values need to be updated after a popup is (especially sliders) is really visible
			setTimeout(oSliders._updateSlidersValues.bind(oSliders), 0);
		}
	};

	DateTimePicker.prototype._createPopupContent = function(){

		var bNoCalendar = !this._oCalendar;

		DatePicker.prototype._createPopupContent.apply(this, arguments);

		if (bNoCalendar) {
			this._oPopupContent.setCalendar(this._oCalendar);
			this._oCalendar.attachSelect(_handleCalendarSelect, this);

			var that = this,
				oHideMonthPicker = this._oCalendar._hideMonthPicker,
				oHideYearPicker = this._oCalendar._hideYearPicker;

			this._oCalendar._hideMonthPicker = function (bSkipFocus) {
				oHideMonthPicker.apply(this, arguments);

				if (!bSkipFocus) {
					that._selectFocusedDateValue(new DateRange().setStartDate(this._getFocusedDate().toLocalJSDate()));

				}
			};

			this._oCalendar._hideYearPicker = function (bSkipFocus) {
				oHideYearPicker.apply(this, arguments);

				if (!bSkipFocus) {
					that._selectFocusedDateValue(new DateRange().setStartDate(this._getFocusedDate().toLocalJSDate()));

				}
			};
		}

		if (!this._oSliders) {
			this._oSliders = new TimePickerSliders(this.getId() + "-Sliders", {
				minutesStep: this.getMinutesStep(),
				secondsStep: this.getSecondsStep(),
				displayFormat: _getTimePattern.call(this),
				localeId: this.getLocaleId()
			})._setShouldOpenSliderAfterRendering(true);
			this._oPopupContent.setTimeSliders(this._oSliders);
		}

	};

	DateTimePicker.prototype._selectFocusedDateValue = function (oDateRange) {
		var oCalendar = this._oCalendar;

		oCalendar.removeAllSelectedDates();
		oCalendar.addSelectedDate(oDateRange);

		return this;
	};

	DateTimePicker.prototype._fillDateRange = function(){

		var oDate = this.getDateValue();

		if (oDate) {
			oDate = new Date(oDate.getTime());
		} else {
			oDate = this._getInitialFocusedDateValue();
			var iMaxTimeMillis = this._oMaxDate.getTime();

			if (oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > iMaxTimeMillis) {
				oDate = this._oMinDate;
			}
		}

		this._oCalendar.focusDate(oDate);
		if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() != oDate.getTime()) {
			this._oDateRange.setStartDate(oDate);
		}

		this._oSliders._setTimeValues(oDate);

	};

	DateTimePicker.prototype._getSelectedDate = function(){

		var oDate = DatePicker.prototype._getSelectedDate.apply(this, arguments);

		if (oDate) {
			var oDateTime = this._oSliders.getTimeValues();
			var sPattern = this._oSliders._getDisplayFormatPattern();
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
			}else if (oDate.getTime() > this._oMaxDate.getTime()){
				oDate = new Date(this._oMaxDate.getTime());
			}
		}

		return oDate;

	};

	DateTimePicker.prototype._getInitialFocusedDateValue = function () {
		return this.getInitialFocusedDateValue() || new Date();
	};

	DateTimePicker.prototype.getLocaleId = function(){

		return sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();

	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {Object} Current accessibility state of the control
	 * @protected
	 */
	DateTimePicker.prototype.getAccessibilityInfo = function() {
		var oInfo = DatePicker.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT");
		return oInfo;
	};

	function _handleOkPress(oEvent){

		this._handleCalendarSelect();

	}

	function _handleCancelPress(oEvent){

		this.onsaphide(oEvent);
		this._oCalendar.removeAllSelectedDates();
		this._oCalendar.addSelectedDate(new DateRange().setStartDate(this._getInitialFocusedDateValue()));
	}

	/**
	 * @private
	 */
	DateTimePicker.prototype._handleWindowResize = function(mParams) {
		var oSwitcher = this.getAggregation("_popup").getContent()[0].getAggregation("_switcher"),
			oCalendar = this.getAggregation("_popup").getContent()[0].getCalendar(),
			oSliders = this.getAggregation("_popup").getContent()[0].getTimeSliders();

		if (mParams.name === STANDART_PHONE_RANGESET) {
			oSwitcher.setVisible(true);
			// Getting "sap.m.internal.DateTimePickerPopup" instance in order to call "_switchVisibility(sKey)" method
			this.getAggregation("_popup").getContent()[0]._switchVisibility(oSwitcher.getSelectedKey());
		} else {
			oSwitcher.setVisible(false);
			oSliders.$().css("display", "");
			oCalendar.$().css("display", "");
		}
	};

	function _handleAfterOpen(oEvent){
		this.$("inner").attr("aria-expanded", true);
		this._oCalendar.focus();
		this._oSliders._onOrientationChanged();

		Device.media.attachHandler(this._handleWindowResize, this);
	}

	function _handleAfterClose(){
		this.removeStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);
		this.$("inner").attr("aria-expanded", false);
		this._restoreInputSelection(this._$input.get(0));

		this._oCalendar._closedPickers();
		Device.media.detachHandler(this._handleWindowResize, this);
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
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
			var oLocaleData = LocaleData.getInstance(oLocale);
			sTimePattern = oLocaleData.getTimePattern(sDisplayFormat);
		} else {
			sTimePattern = sDisplayFormat;
		}

		return sTimePattern;

	}

	function _handleCalendarSelect(oEvent) {

		this._oPopupContent.switchToTime();

	}

	return DateTimePicker;

});