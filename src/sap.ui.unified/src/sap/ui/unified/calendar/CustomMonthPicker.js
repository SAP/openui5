/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.CustomYearPicker
sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/unified/Calendar",
	'sap/ui/unified/CalendarRenderer',
	"sap/ui/unified/calendar/Header",
	"sap/ui/unified/DateRange",
	"sap/ui/dom/containsOrEquals"
],
	function(
		Renderer,
		Calendar,
		CalendarRenderer,
		Header,
		DateRange,
		containsOrEquals
	) {
	"use strict";

	var CustomMonthPicker = Calendar.extend("sap.ui.unified.internal.CustomMonthPicker", {
		renderer: Renderer.extend(CalendarRenderer)
	});

	CustomMonthPicker.prototype._initializeHeader = function() {
		var oHeader = new Header(this.getId() + "--Head", {
			visibleButton1: false
		});

		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton2", this._handleButton2, this);
		this.setAggregation("header",oHeader);
	};

	CustomMonthPicker.prototype.onBeforeRendering = function () {
		var oHeader = this.getAggregation("header");
		Calendar.prototype.onBeforeRendering.call(this, arguments);
		oHeader.setVisibleButton1(false);
		oHeader.setVisibleButton2(true);
	};

	CustomMonthPicker.prototype.onAfterRendering = function () {
		this._showMonthPicker();
	};

	CustomMonthPicker.prototype._selectYear = function () {
		var oFocusedDate = this._getFocusedDate();
		oFocusedDate.setYear(this.getAggregation("yearPicker").getYear());

		this._focusDate(oFocusedDate, true);

		this._showMonthPicker();
	};

	CustomMonthPicker.prototype._selectMonth = function () {
		var oMonthPicker = this.getAggregation("monthPicker");
		var oSelectedDate = this.getSelectedDates()[0];
		var oFocusedDate = this._getFocusedDate();

		oFocusedDate.setMonth(oMonthPicker.getMonth());

		if (!oSelectedDate) {
			oSelectedDate = new DateRange();
		}

		oSelectedDate.setStartDate(oFocusedDate.toLocalJSDate());
		this.addSelectedDate(oSelectedDate);

		this.fireSelect();
	};

	CustomMonthPicker.prototype.onsapescape = function(oEvent) {
		this.fireCancel();
	};

	return CustomMonthPicker;

});

