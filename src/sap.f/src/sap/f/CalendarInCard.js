/*!
 * ${copyright}
 */
//Provides control sap.f.CalendarInCard.
sap.ui.define([
	'sap/m/Button',
	'sap/m/Toolbar',
	'sap/ui/core/Core',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/IconPool',
	'sap/ui/core/InvisibleText',
	'sap/ui/unified/Calendar',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'./CalendarInCardRenderer'
], function(
	Button,
	Toolbar,
	Core,
	DateFormat,
	IconPool,
	InvisibleText,
	Calendar,
	CalendarDate,
	CalendarUtils,
	CalendarRenderer
) {
	"use strict";

	/**
	 * Constructor for a new CalendarInCard.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {Object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This calendar is used for card content of type Calendar. Its main purpose is to replace the header of type
	 * <code>sap.ui.unified.calendar.Header</code> from the <code>sap.ui.unified.Calendar</code> to
	 * <code>sap.m.Toolbar</code> with <code>sap.m.Buttons</code>.
	 *
	 * @extends sap.ui.unified.Calendar
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.84.0
	 * @alias sap.f.CalendarInCard
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarInCard = Calendar.extend("sap.f.CalendarInCard", /** @lends sap.f.CalendarInCard.prototype */ { metadata : {
			library : "sap.f"
		}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a month picker is shown.
	 * if 2 a year picker is shown.
	 * If 3 a year range picker is shown.
	 */

	CalendarInCard.prototype.init = function() {
		Calendar.prototype.init.apply(this, arguments);
		this.setProperty("_currentPicker", "month");
	};

	CalendarInCard.prototype.onBeforeRendering = function() {
		var aMonths = this.getAggregation("month"),
			oFocusedDate = this._getFocusedDate().toLocalJSDate();

		aMonths[0].displayDate(oFocusedDate);

		this._iSize = 0; // initialize to recalculate new after rendering

		switch (this._iMode) {
			case 0: // date picker
				this._oPickerBtn.setText(this._formatPickerText(oFocusedDate));
				break;
			case 1: // month picker
				this._oPickerBtn.setText(this._formatMonthPickerText());
				break;
			case 2: // year picker
			case 3: // year renge picker
				this._oPickerBtn.setText(this._formatYearPickerText());
				break;
			// no default
		}
		this._updateTodayButtonState();
	};

	CalendarInCard.prototype.onAfterRendering = function(oEvent) {};

	CalendarInCard.prototype.onsaptabnext = function(oEvent) {};

	CalendarInCard.prototype.onsaptabprevious = function(oEvent) {};

	/**
	 * Initializes the header part of the calendar.
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._initializeHeader = function() {
		var sNavToolbarId = this.getId() + "--Head",
			oRB = Core.getLibraryResourceBundle("sap.f"),
			oPrevBtn = new Button(sNavToolbarId + "-PrevBtn", {
				icon: IconPool.getIconURI('slim-arrow-left'),
				tooltip: oRB.getText("CALENDAR_BTN_PREV"),
				type: "Transparent",
				press: function () {
					this._handlePrevious();
				}.bind(this)}),
			oNextBtn = new Button({
				icon: IconPool.getIconURI('slim-arrow-right'),
				tooltip: oRB.getText("CALENDAR_BTN_NEXT"),
				type: "Transparent",
				press: function () {
					this._handleNext();
				}.bind(this)
			}),
			oHeader = new Toolbar(sNavToolbarId, {
				ariaLabelledBy: InvisibleText.getStaticId("sap.f", "CALENDAR_NAVIGATION")
			});

		this._oTodayBtn = new Button({
			text: oRB.getText("CALENDAR_TODAY"),
			ariaLabelledBy: InvisibleText.getStaticId("sap.f", "CALENDAR_NAVIGATE_TO_TODAY"),
			type: "Transparent",
			press: function () {
				this._handleTodayPress();
			}.bind(this)});

		this._oPickerBtn = new Button({
			type: "Transparent",
			ariaLabelledBy: InvisibleText.getStaticId("sap.f", "CALENDAR_SELECT_RANGE"),
			press: function () {
				this._handlePickerButtonPress();
			}.bind(this)
		});

		oHeader.addContent(oPrevBtn)
			.addContent(this._oTodayBtn)
			.addContent(oNextBtn)
			.addContent(this._oPickerBtn);

		this.setAggregation("header",oHeader);
	};

	/**
	 * Handles the <code>press</code> event of the picker button
	 * @private
	 */
	CalendarInCard.prototype._handlePickerButtonPress = function () {
		switch (this._iMode) {
			case 0: // date picker
				this._showMonthPicker();
				this._oPickerBtn.getDomRef().focus();
				break;

			case 1: // month picker
				this._showYearPicker();
				this._oPickerBtn.getDomRef().focus();
				break;

			case 2: // year picker
				this._showYearRangePicker();
				break;
			// no default
		}
	};

	/**
	 * Handles the <code>press</code> event of the Today button
	 * @private
	 */
	CalendarInCard.prototype._handleTodayPress = function () {
		var oDate = new Date(),
			oCalDate = CalendarDate.fromLocalJSDate(oDate);

		this.getAggregation("month")[0].setDate(oDate);
		this.getSelectedDates()[0].setStartDate(oDate);
		this._setFocusedDate(oCalDate);

		if (this._iMode === 3) {
			oDate.setFullYear(oDate.getFullYear() - (this._getYearRangePicker().getRangeSize() / 2));
			this._getYearRangePicker().setDate(oDate);
			this._oPickerBtn.setText(this._formatYearPickerText());
		} else if (this._iMode === 2) {
			this._getYearPicker().setDate(oDate);
			this._oPickerBtn.setText(this._formatYearPickerText());
		} else if (this._iMode === 1) {
			this.displayDate(oDate);
			this._getMonthPicker()._iYear = oDate.getFullYear();
			this._getMonthPicker().setMonth(oDate.getMonth());
			this._oPickerBtn.setText(this._formatMonthPickerText());
		} else {
			this._oPickerBtn.setText(this._formatPickerText());
		}

		this._addMonthFocusDelegate();
		this._updateTodayButtonState();
		this.fireStartDateChange();
		this.fireSelect();
	};

	/**
	 * Creates and formats a string to be displayed in the picker button from the header aggregation.
	 * @returns {string} The concatenated string to be displayed
	 * @private
	 */
	CalendarInCard.prototype._formatPickerText = function (oFocusedDate) {
		var oDate = oFocusedDate ? oFocusedDate : this.getSelectedDates()[0].getStartDate(),
			bRTL = Core.getConfiguration().getRTL(),
			oDateFormat = DateFormat.getDateInstance({format: "yMMMM"}),
			sBeginningResult = oDateFormat.format(oDate),
			sResult,
			sEndResult;

		if (!bRTL) {
			sResult = sBeginningResult;
			if (sEndResult) {
				sResult += " - " + sEndResult;
			}
		} else {
			if (sEndResult) {
				sResult = sEndResult + " - " + sBeginningResult;
			} else {
				sResult = sBeginningResult;
			}
		}

		return sResult;
	};

	/**
	 * Creates and formats a string to be displayed in the picker button from the header aggregation.
	 * @returns {string} The concatenated string to be displayed
	 * @private
	 */
	CalendarInCard.prototype._formatYearPickerText = function () {
		var iCurrentYear = this._getYearPicker().getDate().getFullYear(),
			iYearsShown = this._getYearPicker().getYears(),
			iStartYear = iCurrentYear - Math.floor(iYearsShown / 2),
			iEndYear = iCurrentYear + iYearsShown / 2 - 1;
		return "" + iStartYear + " - " + iEndYear;
	};

	/**
	 * Creates and formats a string to be displayed in the picker button from the header aggregation.
	 * @returns {string} The concatenated string to be displayed
	 * @private
	 */
	CalendarInCard.prototype._formatMonthPickerText = function () {
		return DateFormat.getDateInstance({format: "y"}).format(this.getStartDate());
	};

	/**
	 * Shows an embedded month picker.
	 * This function assumes there is a "monthPicker" & "yearPicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._showMonthPicker = function (bSkipFocus) {
		var oDate = this._getFocusedDate(),
			oMonthPicker = this._getMonthPicker();

		this.setProperty("_currentPicker", "monthPicker");

		oMonthPicker._setYear(oDate.getYear());
		oMonthPicker._setDate(oDate);

		if (!bSkipFocus){
			oMonthPicker.setMonth(oDate.getMonth());
			this._setDisabledMonths(oDate.getYear(), oMonthPicker);
		}

		this._iMode = 1;
		this._togglePrevNext(oDate, false);
		this._oPickerBtn.setText(this._formatMonthPickerText());
	};

	/**
	 * Shows an embedded year icker.
	 * This function assumes there is a "yearPicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._showYearPicker = function () {
		var oDate = this._getFocusedDate(),
			oYearPicker = this._getYearPicker();

		this.setProperty("_currentPicker", "yearPicker");

		this._togglePrevNexYearPicker();
		this._iMode = 2;

		oYearPicker.setDate(oDate.toLocalJSDate());
		this._oPickerBtn.setText(this._formatYearPickerText());
	};

	/**
	 * Shows an embedded year range picker.
	 * This function assumes there is a "yearRangePicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._showYearRangePicker = function () {
		Calendar.prototype._showYearRangePicker.apply(this, arguments);
		this._oPickerBtn.setVisible(false);
	};

	/**
	 * Handler for selecting a month from the MonthPicker.
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._selectMonth = function () {
		Calendar.prototype._selectMonth.apply(this, arguments);
		this._oPickerBtn.setText(this._formatPickerText());
		this._updateTodayButtonState();
	};

	/**
	 * Handler for selecting a year from the YearPicker.
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._selectYear = function () {
		Calendar.prototype._selectYear.apply(this, arguments);
		this._oPickerBtn.setText(this._formatMonthPickerText());
		this._showMonthPicker();
		this._updateTodayButtonState();
	};

	/**
	 * Handler for selecting a year range from the YearRangePicker.
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._selectYearRange = function() {
		var oYearRangePicker = this.getAggregation("yearRangePicker"),
			iRangeSize = oYearRangePicker.getRangeSize(),
			sPrimaryCalendarType = this.getPrimaryCalendarType(),
			oStartDate = CalendarDate.fromLocalJSDate(oYearRangePicker.getDate(), sPrimaryCalendarType),
			oFocusedDate = this._getFocusedDate();

		oStartDate.setMonth(oFocusedDate.getMonth(), oFocusedDate.getDate());
		oStartDate.setYear(oStartDate.getYear() + Math.floor(iRangeSize / 2));
		oFocusedDate.setYear(oStartDate.getYear());
		this._setFocusedDate(oFocusedDate);

		this._showYearPicker();

		this._oPickerBtn.setVisible(true)
			.setText(this._formatYearPickerText());
		this._updateTodayButtonState();
	};

	/**
	 * Handles navigation to previous date and adjusts the picker button text.
	 * @return {void}
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._handlePrevious = function() {
		Calendar.prototype._handlePrevious.apply(this, arguments);
		this._handleArrowNavigation(-1);
	};

	/**
	 * Handles navigation to next date and adjusts the picker button text.
	 * @return {void}
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._handleNext = function() {
		Calendar.prototype._handleNext.apply(this, arguments);
		this._handleArrowNavigation(1);
	};

	/**
	 * Handles navigation to previous/next date and adjusts the picker button text.
	 * @param {boolean} iBackwards Whether the left arrow button is pressed in the header
	 * @return {void}
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._handleArrowNavigation = function(iBackwards) {
		var oMonthPicker, oYearPicker, oYearRangePicker;

		if (this._iMode === 3) {
			oYearRangePicker = this._getYearRangePicker();
			oYearRangePicker.getDate().setFullYear(oYearRangePicker.getDate().getFullYear() + (iBackwards * oYearRangePicker.getYears()));
			this._oPickerBtn.setText(this._formatYearPickerText());
		} else if (this._iMode === 2) {
			oYearPicker = this._getYearPicker();
			oYearPicker.getDate().setFullYear(oYearPicker.getDate().getFullYear() + (iBackwards * oYearPicker.getYears()));
			this._oPickerBtn.setText(this._formatYearPickerText());
		} else if (this._iMode === 1) {
			oMonthPicker = this._getMonthPicker();
			this._getFocusedDate().setYear(oMonthPicker._iYear);
			this.getAggregation("month")[0].getDate().setYear(oMonthPicker._iYear);
			this._oPickerBtn.setText(this._formatMonthPickerText());
		} else {
			this._oPickerBtn.setText(this._formatPickerText(this._getFocusedDate().toLocalJSDate()));
		}
		this._updateTodayButtonState();
	};

	/**
	 * Verifies if the given date matches the range.
	 * @returns {boolean} if the date is in the visible range
	 * @private
	 */
	CalendarInCard.prototype._dateMatchesVisibleRange = function() {
		var oCalNewDate = CalendarDate.fromLocalJSDate(new Date()),
			oSelectedDate,
			bIsSameDate,
			oYearRangePicker,
			oYearRangePickerDate,
			oStartDate;

		switch (this._iMode) {
			case 0: // date picker
				oSelectedDate = this.getSelectedDates().length ? this.getSelectedDates()[0].getStartDate() : this.getStartDate();
				bIsSameDate = oSelectedDate.getDate() === oCalNewDate.getDate();
				return bIsSameDate && CalendarUtils._isSameMonthAndYear(CalendarDate.fromLocalJSDate(this.getStartDate()), oCalNewDate);
			case 1: // month picker
				return CalendarUtils._isSameMonthAndYear(CalendarDate.fromLocalJSDate(this.getStartDate()), oCalNewDate);
			case 2: // year picker
				return CalendarUtils._isSameMonthAndYear(CalendarDate.fromLocalJSDate(this._getYearPicker().getDate()), oCalNewDate);
			case 3: // year range picker
				oYearRangePicker = this._getYearRangePicker();
				oYearRangePickerDate = oYearRangePicker.getDate();
				oStartDate = new Date(oYearRangePickerDate.getFullYear() + (oYearRangePicker.getRangeSize() / 2),
					oYearRangePickerDate.getMonth(), oYearRangePickerDate.getDate());
				return CalendarUtils._isSameMonthAndYear(CalendarDate.fromLocalJSDate(oStartDate),
					oCalNewDate);
			// no default
		}
	};

	/**
	 * Handles the enabled/disabled state of the Today button based on the visibility of the current date.
	 * @private
	 */
	CalendarInCard.prototype._updateTodayButtonState = function() {
		if (this._oTodayBtn) {
			this._oTodayBtn.setEnabled(!this._dateMatchesVisibleRange());
		}
	};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._updateHeader = function() {};

	CalendarInCard.prototype.onsapescape = function() {
		this.fireCancel();
		this._closePickers();
		this._oPickerBtn.setVisible(true);
		this._oPickerBtn.setText(this._formatPickerText());
	};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._updateHeadersButtons = function() {};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._togglePrevNext = function() {};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._togglePrevNexYearPicker = function() {};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._initializeSecondMonthHeader = function() {};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._updateHeadersYearPrimaryText = function() {};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._updateHeadersYearAdditionalText = function() {};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._updateActiveHeaderYearButtonVisibility = function() {};

	/**
	 * @private
	 * @override
	 */
	CalendarInCard.prototype._setHeaderText = function() {};

	return CalendarInCard;

});