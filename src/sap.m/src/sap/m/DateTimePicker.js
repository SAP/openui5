/*!
 * ${copyright}
 */

//Provides control sap.m.DateTimePicker.
sap.ui.define(['jquery.sap.global', './DatePicker', 'sap/ui/model/type/Date', './library'],
		function(jQuery, DatePicker, Date1, library) {
	"use strict";

	/**
	 * Constructor for a new DateTimePicker.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This is a date input control with a calendar and a time selector as date time picker.
	 *
	 * A date can be entered using a calendar or time selector that opens in a popup. Alternatively a value can be entered directly in the input field by typing it in.
	 * If a date is entered by typing it into the input field, it must fit the used date format and locale. (See <code>sap.ui.core.format.DateFormat</code>)
	 *
	 * There are two options to provide a date for the <code>DateTimePicker</code>.
	 * You can put a date as a string to the property <code>value</code> or you can put a JavaScript Date object to the property <code>dateValue</code>.
	 * Only one of the properties should be used at one time, but they are synchronized internally.
	 * What property you should use depends on the use case of the application:
	 * <ul>
	 * <li>Use the <code>value</code> property if you want to bind the <code>DateTimePicker</code> to a model using the <code>sap.ui.model.type.DateTime</code>.</li>
	 * <li>Use the <code>value</code> property if the date is provided as a string from the back end or inside the application (e.g. as ABAP type DATS field).</li>
	 * <li>Use the <code>dateValue</code> property if the date is already provided as a JavaScript Date object or you want to work with a JavaScript Date object.</li>
	 * </ul>
	 *
	 * All formatting and parsing of dates to and from strings is done using the {@link sap.ui.core.format.DateFormat}, so please read the corresponding documentation if you need more information about this.
	 *
	 * Supported format options are pattern-based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
	 *
	 * For example, if the <code>valueFormat</code> is "yyyy-MM-dd-HH-mm-ss", <code>displayFormat</code> is "MMM d, y, HH:mm:ss" and the used locale is English,
	 * a valid <code>value</code> string is "2015-07-30-10-30-15", which leads to an output of "Jul 30, 2015, 10:30:15".
	 *
	 * If no <code>placeholder</code> is set to the <code>DateTimePicker</code>, the used <code>displayFormat</code> is shown as a placeholder.
	 * If another placeholder is needed, it must be set.
	 *
	 * Internally the <code>sap.ui.unified.Calendar</code> is used, but it is only needed if the <code>DateTimePicker</code> is opened. This means that it is not needed for the initial rendering.
	 * If the <code>sap.ui.unified</code> library is not loaded before the <code>DateTimePicker</code> is opened, it will be loaded upon opening.
	 * This could lead to a waiting time before a <code>DateTimePicker</code> is opened the first time. To prevent this, applications using the <code>DateTimePicker</code> should also load
	 * the <code>sap.ui.unified</code> library.
	 *
	 * @extends sap.m.DatePicker
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38.0
	 * @alias sap.m.DateTimePicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateTimePicker = DatePicker.extend("sap.m.DateTimePicker", /** @lends sap.m.DateTimePicker.prototype */ { metadata : {

		library : "sap.m",

		aggregations: {
			/**
			 * Internal aggregation that contains the inner _picker pop-up.
			 */
			_popup: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" }
		}

	}});

	var PopupContent = sap.ui.core.Control.extend("DateTimePickerPopup", {

		metadata: {
			aggregations: {
				_switcher  : {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				calendar   : {type: "sap.ui.core.Control", multiple: false},
				timeSliders: {type: "sap.ui.core.Control", multiple: false}
			}
		},

		renderer: function(oRm, oPopup) {

			oRm.write("<div");
			oRm.writeControlData(oPopup);
			oRm.addClass("sapMDateTimePopupCont");
			oRm.addClass("sapMTimePickerDropDown");
			oRm.writeClasses();
			oRm.write(">");

			var oSwitcher = oPopup.getAggregation("_switcher");
			if (oSwitcher && oSwitcher.getVisible()) {
				oRm.write("<div");
				oRm.addClass("sapMTimePickerSwitch");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oSwitcher);
				oRm.write("</div>");
			}

			var oCalendar = oPopup.getCalendar();
			if (oCalendar) {
				oRm.renderControl(oCalendar);
			}

			oRm.write("<div");
			oRm.addClass("sapMTimePickerSep");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");

			var oSliders = oPopup.getTimeSliders();
			if (oSliders) {
				oRm.renderControl(oSliders);
			}

			oRm.write("</div>");
		},

		init: function() {

		},

		onBeforeRendering: function() {

			var oSwitcher = this.getAggregation("_switcher");

			if (sap.ui.Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				if (!oSwitcher) {
					var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
					var sDateText = oResourceBundle.getText("DATETIMEPICKER_DATE");
					var sTimeText = oResourceBundle.getText("DATETIMEPICKER_TIME");


					oSwitcher = new sap.m.SegmentedButton(this.getId() + "-Switch", {
						selectedKey: "Cal",
						items: [ new sap.m.SegmentedButtonItem(this.getId() + "-Switch-Cal", {key: "Cal", text: sDateText}),
						         new sap.m.SegmentedButtonItem(this.getId() + "-Switch-Sli", {key: "Sli", text: sTimeText})
						]
					});
					oSwitcher.attachSelect(this._handleSelect, this);

					this.setAggregation("_switcher", oSwitcher, true);
				} else {
					oSwitcher.setVisible(true);
					oSwitcher.setSelectedKey("Cal");
				}
			} else if (oSwitcher) {
				oSwitcher.setVisible(false);
			}

		},

		onAfterRendering: function() {

			if (sap.ui.Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				var oSwitcher = this.getAggregation("_switcher");
				var sKey = oSwitcher.getSelectedKey();
				this._switchVisibility(sKey);
				if (sap.ui.Device.system.phone) {
					this._adjustTimePickerHeightOnPhone();
				}
			}

		},

		_adjustTimePickerHeightOnPhone: function() {
			var oSwitcher = this.getAggregation("_switcher"),
				// height of the area containing the buttons that switch from date picker to time picker
				sSwhitcherButtonsHeight = oSwitcher.$().children(0).css("height").replace('px','');

			// we have to set the height of the DateTimePicker container ("sapMDateTimePopupCont")
			// so the TimePicker can calculate correctly it's height depending on the container height minus height of the dialog footer height
			// for doing this we get the document height and extract the switch buttons area height
			this.$().css("height", (document.documentElement.clientHeight - parseInt(sSwhitcherButtonsHeight, 10)) + "px");
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
				oSliders.updateSlidersValues();
				oSliders._onOrientationChanged();
				oSliders._initFocus();
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


	DateTimePicker.prototype.init = function(){

		DatePicker.prototype.init.apply(this, arguments);
		this._bOnlyCalendar = false;

	};

	DateTimePicker.prototype.exit = function(){

		DatePicker.prototype.exit.apply(this, arguments);

		if (this._oSliders) {
			this._oSliders.destroy();
			delete this._oSliders;
		}

		this._oPopupContent = undefined; // is destroyed via popup aggregation - just remove reference

	};

	DateTimePicker.prototype.setDisplayFormat = function(sDisplayFormat) {

		DatePicker.prototype.setDisplayFormat.apply(this, arguments);

		if (this._oSliders) {
			this._oSliders.setFormat(_getTimePattern.call(this));
		}

		return this;

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

			this._oDisplayFormatDate = sap.ui.core.format.DateFormat.getInstance(oDateArguments);
		}

		return sap.ui.core.format.DateFormat.getDateTimeInstance(oMyArguments);

	};

	DateTimePicker.prototype._checkStyle = function(sPattern){

		if (DatePicker.prototype._checkStyle.apply(this, arguments)) {
			// it's a simple style
			return true;
		} else if (sPattern.indexOf("/") > 0) {
			// could be a mixed style
			var aStyles = ["short", "medium", "long", "full"];
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

	DateTimePicker.prototype._getPlaceholderPattern = function(oLocaleData, sPlaceholder) {

		var iSlashIndex = sPlaceholder.indexOf("/");
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

			this._oPopup = new sap.m.ResponsivePopover(this.getId() + "-RP", {
				showCloseButton: false,
				showHeader: false,
				placement: sap.m.PlacementType.VerticalPreferedBottom,
				beginButton: new sap.m.Button(this.getId() + "-OK", { text: sOKButtonText, press: jQuery.proxy(_handleOkPress, this) }),
				endButton: new sap.m.Button(this.getId() + "-Cancel", { text: sCancelButtonText, press: jQuery.proxy(_handleCancelPress, this) }),
				content: this._oPopupContent
			});

			this._oPopup.addStyleClass("sapMDateTimePopup");

			var oPopover = this._oPopup.getAggregation("_popup");
			// hide arrow in case of popover as dialog does not have an arrow
			if (oPopover.setShowArrow) {
				oPopover.setShowArrow(false);
			}

			this._oPopup.attachBeforeOpen(_handleBeforeOpen, this);
			this._oPopup.attachAfterOpen(_handleAfterOpen, this);
			this._oPopup.attachAfterClose(_handleAfterClose, this);

			if (sap.ui.Device.system.desktop) {
				this._oPopoverKeydownEventDelegate = {
						onkeydown: function(oEvent) {
							var oKC = jQuery.sap.KeyCodes,
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

		var oPopover = this._oPopup.getAggregation("_popup");
		oPopover.oPopup.setAutoCloseAreas([this.getDomRef()]);

		this._oPopup.openBy(this);

		var oSliders = this._oPopup.getContent()[0] && this._oPopup.getContent()[0].getTimeSliders();
		if (oSliders) {//Sliders values need to be updated after a popup is (especially sliders) is really visible
			jQuery.sap.delayedCall(0, oSliders, oSliders.updateSlidersValues);
		}
	};

	DateTimePicker.prototype._createPopupContent = function(){

		var bNoCalendar = !this._oCalendar;

		DatePicker.prototype._createPopupContent.apply(this, arguments);

		if (bNoCalendar) {
			this._oPopupContent.setCalendar(this._oCalendar);
			this._oCalendar.attachSelect(_selectDate, this);
		}

		if (!this._oSliders) {
			jQuery.sap.require("sap.m.TimePickerSliders");
			this._oSliders = new sap.m.TimePickerSliders(this.getId() + "-Sliders", {
				format: _getTimePattern.call(this),
				invokedBy: this.getId()
			});
			this._oPopupContent.setTimeSliders(this._oSliders);
		}

	};

	DateTimePicker.prototype._fillDateRange = function(){

		var oDate = this.getDateValue();

		if (oDate) {
			oDate = new Date(oDate.getTime());
		} else {
			oDate = new Date();
		}

		this._oCalendar.focusDate(oDate);
		if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() != oDate.getTime()) {
			this._oDateRange.setStartDate(oDate);
		}

		this._oSliders.setTimeValues(oDate);

	};

	DateTimePicker.prototype._getSelectedDate = function(){

		var oDate = DatePicker.prototype._getSelectedDate.apply(this, arguments);

		if (oDate) {
			var oDateTime = this._oSliders.getTimeValues();
			var sPattern = this._oSliders.getFormat();
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

	DateTimePicker.prototype.getLocaleId = function(){

		return sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();

	};

	/**
	 * @see {sap.ui.core.Control#getAccessibilityInfo}
	 * @protected
	 */
	DateTimePicker.prototype.getAccessibilityInfo = function() {
		var oInfo = DatePicker.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT");
		return oInfo;
	};

	function _handleOkPress(oEvent){

		this._selectDate();

	}

	function _handleCancelPress(oEvent){

		this.onsaphide(oEvent);

	}

	function _handleBeforeOpen(oEvent){

	}

	function _handleAfterOpen(oEvent){
		this.$("inner").attr("aria-expanded", true);
		this._oCalendar.focus();
		this._oSliders._onOrientationChanged();

	}

	function _handleAfterClose(oEvent){
		this.$("inner").attr("aria-expanded", false);
	}

	function _getTimePattern(){

		var sDisplayFormat = this.getDisplayFormat();
		var sTimePattern;
		var oBinding = this.getBinding("value");

		if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
			sDisplayFormat = oBinding.oType.getOutputPattern();
		} else {
			sDisplayFormat = this.getDisplayFormat();
		}

		if (!sDisplayFormat) {
			sDisplayFormat = "medium";
		}

		var iSlashIndex = sDisplayFormat.indexOf("/");
		if (iSlashIndex > 0 && this._checkStyle(sDisplayFormat)) {
			sDisplayFormat = sDisplayFormat.substr(iSlashIndex + 1);
		}

		if (sDisplayFormat == "short" || sDisplayFormat == "medium" || sDisplayFormat == "long" || sDisplayFormat == "full") {
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
			var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
			sTimePattern = oLocaleData.getTimePattern(sDisplayFormat);
		} else {
			sTimePattern = sDisplayFormat;
		}

		return sTimePattern;

	}

	function _selectDate(oEvent) {

		this._oPopupContent.switchToTime();

	}

	return DateTimePicker;

}, /* bExport= */ true);
