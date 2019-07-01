/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.CustomYearPicker
sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarRenderer",
	"sap/ui/unified/calendar/Header",
	"sap/ui/unified/DateRange",
	"sap/ui/thirdparty/jquery"
],
	function(
		Renderer,
		Calendar,
		CalendarRenderer,
		Header,
		DateRange,
		jQuery
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

	CustomYearPicker.prototype.onAfterRendering = function () {
		Calendar.prototype.onAfterRendering.apply(this, arguments);
		var oHeader = this.getAggregation("header");

		oHeader.$("B2")
			.css("background-color", "inherit")
			.css("color", "inherit")
			.css("cursor", "inherit")
			.css("pointer-events", "none");

		this._showYearPicker(); //Opens the calendar picker always at the Year Picker page instead of the default one
	};

	CustomYearPicker.prototype.onThemeChanged = function () {
		Calendar.prototype.onThemeChanged.apply(this, arguments);

		var oHeader = this.getAggregation("header");

		oHeader.$("B2")
			.css("background-color", "inherit")
			.css("color", "inherit")
			.css("cursor", "inherit")
			.css("pointer-events", "none");
	};

	CustomYearPicker.prototype._selectYear = function () {
		var oYearPicker = this.getAggregation("yearPicker");
		var oDateRange = this.getSelectedDates()[0];

		if (!oDateRange) {
			oDateRange = new DateRange();
		}

		oDateRange.setStartDate(oYearPicker.getDate());
		this.addSelectedDate(oDateRange);

		this.fireSelect();
	};

	CustomYearPicker.prototype.onsapescape = function(oEvent) {
		this.fireCancel();
	};

	CustomYearPicker.prototype._shouldFocusB2OnTabPrevious = function(oEvent) {
		return false; //in Months view, the year picker button is not focusable
	};

	return CustomYearPicker;

}, /* bExport= */ true);

