/*!
 * ${copyright}
 */

//Provides control sap.f.PlanningCalendarInCard.
sap.ui.define([
	'sap/m/delegate/DateNavigation',
	'sap/ui/core/Control',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/ResizeHandler',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/YearRangePicker',
	'sap/ui/unified/calendar/YearPicker',
	'sap/ui/unified/calendar/MonthPicker',
	'sap/m/Column',
	'sap/m/library',
	'sap/m/PlanningCalendar',
	'sap/f/PlanningCalendarInCardLegend',
	'./PlanningCalendarInCardRenderer'
], function(
	DateNavigation,
	Control,
	DateFormat,
	ResizeHandler,
	CalendarUtils,
	CalendarDate,
	YearRangePicker,
	YearPicker,
	MonthPicker,
	Column,
	mLibrary,
	PlanningCalendar,
	PlanningCalendarInCardLegend,
	PlanningCalendarInCardRenderer
) {
	"use strict";

	/**
	 * Constructor for a new <code>PlanningCalendarInCard</code>.
	 *
	 * @param {string} [sID] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays rows with appointments for different entities (such as persons or teams) for the selected time interval.
	 *
	 * <h3>Overview</h3>
	 *
	 * @extends sap.f.PlanningCalendar
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.74
	 * @experimental Since 1.74.
	 * @alias sap.f.PlanningCalendarInCard
	 */
	var PlanningCalendarInCard = PlanningCalendar.extend("sap.f.PlanningCalendarInCard", {});

	// shortcut for sap.m.ScreenSize
	var ScreenSize = mLibrary.ScreenSize;

	//Defines the minimum screen width for the appointments column (it is a popin column)
	var APP_COLUMN_MIN_SCREEN_WIDTH = ScreenSize.Desktop;

	PlanningCalendarInCard.prototype.init = function () {
		PlanningCalendar.prototype.init.call(this, arguments);
		this._oInfoToolbar.addContent(this._getLegend());
		this.getAggregation("table").addColumn(new Column({
			minScreenWidth: APP_COLUMN_MIN_SCREEN_WIDTH,
			demandPopin: true
		}));
		this.getAggregation("table").setMode(mLibrary.ListMode.None);
	};

	PlanningCalendarInCard.prototype.onAfterRendering = function () {
		PlanningCalendar.prototype.onAfterRendering.call(this, arguments);
		if (!this._sTwoColumnsResizeListener) {
		 this._sTwoColumnsResizeListener = ResizeHandler.register(this, this.resizeHandler);
		}
	};

	PlanningCalendarInCard.prototype.exit = function () {
		if (this._sTwoColumnsResizeListener) {
			ResizeHandler.deregister(this._sTwoColumnsResizeListener);
			this._sTwoColumnsResizeListener = undefined;
		}
		PlanningCalendar.prototype.exit.call(this, arguments);
		if (this._oMonthPicker) {
			this._oMonthPicker.destroy();
			this._oMonthPicker = null;
		}
		if (this._oYearPicker) {
			this._oYearPicker.destroy();
			this._oYearPicker = null;
		}
		if (this._oYearRangePicker) {
			this._oYearRangePicker.destroy();
			this._oYearRangePicker = null;
		}
	};

	/**
	 * Handles the resizing in the control.
	 *
	 * @private
	 * @param {Object} oEvent The event object.
	 */
	PlanningCalendarInCard.prototype.resizeHandler = function (oEvent) {
		oEvent.control.toggleStyleClass("sapMPCInCardTwoColumns", oEvent.target.getBoundingClientRect().width > 576);
	};

	/**
	 * Handler for the picker button in the header aggregation.
	 * @param {object} oEvent the event object
	 * @private
	 */
	PlanningCalendarInCard.prototype._handlePickerButtonPress = function (oEvent) {
		var oCalStartDate;

		oEvent.preventDefault();

		if (this._bYearPickerView) {
			this._bYearRangePickerView = true;
			this._oYearPicker.setVisible(false);
			if (!this._oYearRangePicker) { // YearRangePicker
				this._createYearRangePicker();
				this._oInfoToolbar.insertAggregation("content", this._oYearRangePicker, 4);
			} else {
				this._oYearRangePicker.setVisible(true); // YearRangePicker
			}
			oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate());
			oCalStartDate.setMonth(0, 1);

			this._oYearRangePicker.setDate(oCalStartDate.toLocalJSDate());
			this._getHeader()._oPickerBtn.setVisible(false);
		} else if (this._bMonthPickerView) {
			this._bYearPickerView = true;
			this._oMonthPicker.setVisible(false);
			if (!this._oYearPicker) { // YearPicker
				this._createYearPicker();
				this._oInfoToolbar.insertContent(this._oYearPicker, 3);
			} else {
				this._oYearPicker.setVisible(true); // YearPicker
			}
			this._getHeader().setPickerText(this._formatYearPickerText());
		} else {
			this._bMonthPickerView = true;
			this._oInfoToolbar.getContent()[1].setVisible(false); // OneMonthDatesRow
			if (!this._oMonthPicker) { // MonthPicker
				this._createMonthPicker();
				this._oInfoToolbar.insertContent(this._oMonthPicker, 2);
			} else {
				this._oMonthPicker.setVisible(true); // MonthPicker
			}
			this._getHeader().setPickerText(this._formatMonthPickerText());
		}
	};

	/**
	 * Creates YearRangePicker.
	 * @private
	 */
	PlanningCalendarInCard.prototype._createYearRangePicker = function () {
		this._oYearRangePicker = new YearRangePicker({
			date: this.getStartDate(),
			select: function () {
				var oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate()),
					oStartDate;
				oCalStartDate.setYear(this._oYearRangePicker.getYear() + Math.floor(this._oYearRangePicker.getRangeSize() / 2));
				oStartDate = oCalStartDate.toLocalJSDate();
				this.setStartDate(oStartDate);
				this._oYearRangePicker.setYear(oStartDate.getFullYear());
				this._oYearPicker.setDate(oStartDate);
				this._getHeader()._oPickerBtn.setVisible(true);
				this._getHeader().setPickerText(this._formatYearPickerText());
				this._bYearRangePickerView = false;
				this._oYearPicker.setVisible(true); // YearPicker
				this._oYearRangePicker.setVisible(false); // YearRangePicker
			}.bind(this)
		});
	};

	/**
	 * Creates YearPicker.
	 * @private
	 */
	PlanningCalendarInCard.prototype._createYearPicker = function () {
		this._oYearPicker = new YearPicker({
			date: this.getStartDate(),
			select: function () {
				var oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate()),
					oStartDate;
				oCalStartDate.setYear(this._oYearPicker.getYear());
				oStartDate = oCalStartDate.toLocalJSDate();
				this.setStartDate(oStartDate);
				this._oYearPicker.setYear(oStartDate.getFullYear());
				this._getHeader().setPickerText(this._formatMonthPickerText());
				this._bYearPickerView = false;
				this._oMonthPicker.setVisible(true); // MonthPicker
				this._oYearPicker.setVisible(false); // YearPicker
			}.bind(this)
		});
	};

	/**
	 * Creates MonthPicker.
	 * @private
	 */
	PlanningCalendarInCard.prototype._createMonthPicker = function () {
		this._oMonthPicker = new MonthPicker({
			month: this.getStartDate().getMonth(),
			select: function () {
				var oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate());
				oCalStartDate.setMonth(this._oMonthPicker.getMonth());
				this.setStartDate(oCalStartDate.toLocalJSDate());
				this._getHeader().setPickerText(this._formatPickerText());
				this._bMonthPickerView = false;
				this._oInfoToolbar.getContent()[1].setVisible(true); // OneMonthDatesRow
				this._oMonthPicker.setVisible(false); // MonthPicker
			}.bind(this)
		});
	};

	/**
	 * Formats the month picker text.
	 * @returns {string} the formatted text
	 * @private
	 */
	PlanningCalendarInCard.prototype._formatMonthPickerText = function () {
		return DateFormat.getDateInstance({format: "y"}).format(this.getStartDate());
	};

	/**
	 * Formats the year picker text.
	 * @returns {string} the formatted text
	 * @private
	 */
	PlanningCalendarInCard.prototype._formatYearPickerText = function () {
		var iCurrentYear = this._oYearPicker.getYear(),
			iYearsShown = this._oYearPicker.getYears(),
			iStartYear = iCurrentYear - Math.floor(iYearsShown / 2),
			iEndYear = iCurrentYear + iYearsShown / 2 - 1;
		return "" + iStartYear + " - " + iEndYear;
	};

	/**
	 * Calculates and applies the logic for moving with the arrows from the header.
	 * @param {boolean} bBackwards is <code>true</code> if the backward navigation arrow is pressed
	 * @private
	 */
	PlanningCalendarInCard.prototype._applyArrowsLogic = function(bBackwards) {
		var iDirection = bBackwards ? -1 : 1,
			oCalStartDate,
			aContent = this._oInfoToolbar.getContent(),
			oContent;

		if (!this._bMonthPickerView) {
			PlanningCalendar.prototype._applyArrowsLogic.apply(this, arguments);
		} else {
			for (var i = 2; i < aContent.length; i++) {
				oContent = aContent[i];
				if (oContent.getVisible()) {
					oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate());
					if (oContent.isA("sap.ui.unified.calendar.MonthPicker")) {
						oCalStartDate.setYear(oCalStartDate.getYear() + iDirection);
						this.setStartDate(oCalStartDate.toLocalJSDate());
						this._getHeader().setPickerText(this._formatMonthPickerText());
						return;
					} else if (oContent.isA("sap.ui.unified.calendar.YearRangePicker")) {
						bBackwards ? oContent.previousPage() : oContent.nextPage();
						return;
					} else if (oContent.isA("sap.ui.unified.calendar.YearPicker")) {
						bBackwards ? oContent.previousPage() : oContent.nextPage();
						this._getHeader().setPickerText(this._formatYearPickerText());
						return;
					}
				}
			}
		}
	};

	/**
	 * Handles the <code>press</code> event of the <code>PlanningCalendar</code>'s today button
	 * @private
	 */
	PlanningCalendarInCard.prototype._handleTodayPress = function () {
		var oDate = new Date(),
			oCalDate = CalendarDate.fromLocalJSDate(oDate),
			oStartDate;

		if (this._bYearRangePickerView) {
			this._oYearRangePicker.setYear(oCalDate.toLocalJSDate().getFullYear());
			this.setStartDate(oCalDate.toLocalJSDate());
			return;
		}

		if (this._bYearPickerView) {
			this._oYearPicker.setYear(oCalDate.toLocalJSDate().getFullYear());
			this.setStartDate(oCalDate.toLocalJSDate());
			return;
		}

		if (this._bMonthPickerView) {
			this._oMonthPicker.setMonth(oCalDate.toLocalJSDate().getMonth());
			this.setStartDate(oCalDate.toLocalJSDate());
			return;
		}

		oStartDate = CalendarUtils.getFirstDateOfMonth(CalendarUtils._createUniversalUTCDate(oDate, undefined, true));
		this._adjustSelectedDate(CalendarDate.fromLocalJSDate(oDate), false);
		oDate = CalendarUtils._createLocalDate(oStartDate, true);
		this.setStartDate(oDate);
		this._dateNav.setCurrent(oDate);
		this._getHeader().setPickerText(this._formatPickerText());
		this._updateTodayButtonState();
		this.fireStartDateChange();
		this.fireEvent("_todayPressed");
	};

	/**
	 * Attaches handlers to the events in the _header aggregation.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	PlanningCalendarInCard.prototype._attachHeaderEvents = function () {
		PlanningCalendar.prototype._attachHeaderEvents.call(this, arguments);

		this._getHeader().attachEvent("_pickerButtonPress", this._handlePickerButtonPress, this);

		return this;
	};

	/**
	 * Creates or returns the legend to be placed below the calendar picker.
	 * @returns {sap.f.PlanningCalendarInCardLegend} the legend
	 * @private
	 */
	PlanningCalendarInCard.prototype._getLegend = function() {
		if (!this._oLegend) {
			this._oLegend = new PlanningCalendarInCardLegend({
				columnWidth: "120px",
				standardItems: []
			});
		}
		return this._oLegend;
	};

	PlanningCalendarInCard.prototype.addRow = function(oRow) {
		var oPCListItem = this._createPlanningCalendarListItem(oRow);
		oPCListItem.addCell(oRow._getMoreButton());
		this.addAggregation("rows", oRow, true);
		this.getAggregation("table").addItem(oPCListItem);

		return this;
	};

	PlanningCalendarInCard.prototype.insertRow = function(oRow, iIndex) {
		var oPCListItem = this._createPlanningCalendarListItem(oRow);
		oPCListItem.addCell(oRow._getMoreButton());
		this.insertAggregation("rows", oRow, iIndex);
		this.getAggregation("table").insertItem(oPCListItem, iIndex, true);

		return this;
	};

	/**
	 * Inserts the needed interval to the right position in the toolbar of the PlanningCalendar.
	 * When the screen is big, the interval should be placed at the end.
	 * Else - after(below) the calendar header.
	 * @param {object} oInterval The interval to be placed in the toolbar
	 * @private
	 */
	PlanningCalendarInCard.prototype._insertInterval = function  (oInterval) {
		PlanningCalendar.prototype._insertInterval.call(this, oInterval);
		this._oInfoToolbar.addContent(this._oInfoToolbar.removeContent(this._getLegend()));
	};

	/**
	 * Does not change the start date in case of having PlanningCalendarInCard. It returns it as is.
	 * @param {object} oStartDate the date to be shifted
	 * @returns {object} the shifted date
	 * @private
	 * @overrides
	 */
	PlanningCalendarInCard.prototype._shiftStartDate = function(oStartDate){
		return oStartDate;
	};

	/**
	 * Sets the selection mode of the inner used Table.
	 * @private
	 * @overrides
	 */
	PlanningCalendarInCard.prototype._setSelectionMode = function () {
		return;
	};

	return PlanningCalendarInCard;
});
