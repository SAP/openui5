/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.CustomYearPicker
sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarRenderer",
	"sap/ui/unified/calendar/Header",
	"sap/ui/unified/DateRange"
],
	function(
		Renderer,
		Calendar,
		CalendarRenderer,
		Header,
		DateRange
	) {
	"use strict";

	var CustomYearPicker = Calendar.extend("sap.ui.unified.internal.CustomYearPicker", {
		renderer: Renderer.extend(CalendarRenderer)
	});

	CustomYearPicker.prototype._initializeHeader = function() {
		var oHeader = new Header(this.getId() + "--Head", {
			visibleButton1: false
		});

		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton2", this._handleButton2, this);
		this.setAggregation("header",oHeader);
	};

	CustomYearPicker.prototype.onBeforeRendering = function () {
		var oHeader = this.getAggregation("header");
		Calendar.prototype.onBeforeRendering.call(this, arguments);
		oHeader.setVisibleButton1(false);
		oHeader.setVisibleButton2(true);
	};

	CustomYearPicker.prototype.onAfterRendering = function () {
		Calendar.prototype.onAfterRendering.apply(this, arguments);
		this._showYearPicker(); //Opens the calendar picker always at the Year Picker page instead of the default one
	};

	CustomYearPicker.prototype.onThemeChanged = function () {
		Calendar.prototype.onThemeChanged.apply(this, arguments);
	};

	CustomYearPicker.prototype._selectYear = function () {
		var oDateRange = this.getSelectedDates()[0];

		if (!oDateRange) {
			oDateRange = new DateRange();
		}

		oDateRange.setStartDate(this.getAggregation("yearPicker").getDate());
		this.addSelectedDate(oDateRange);

		this.fireSelect();
	};

	CustomYearPicker.prototype.onsapescape = function(oEvent) {
		this.fireCancel();
	};

	return CustomYearPicker;

});

