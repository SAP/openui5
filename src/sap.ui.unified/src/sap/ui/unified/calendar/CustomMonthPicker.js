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


	var CustomMonthPickerRenderer = Renderer.extend(CalendarRenderer);
	CustomMonthPickerRenderer.apiVersion = 2;

	var CustomMonthPicker = Calendar.extend("sap.ui.unified.internal.CustomMonthPicker", {
		renderer: CustomMonthPickerRenderer
	});

	CustomMonthPicker.prototype._initializeHeader = function() {
		var oHeader = new Header(this.getId() + "--Head", {
			visibleButton1: false
		});

		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton2", this._handleButton2, this);

		this._afterHeaderRenderAdjustCSS = this._createOnAfterRenderingDelegate(oHeader);

		oHeader.addDelegate(this._afterHeaderRenderAdjustCSS);

		this.setAggregation("header",oHeader);
	};

	CustomMonthPicker.prototype.onBeforeRendering = function () {
		var oHeader = this.getAggregation("header");
		Calendar.prototype.onBeforeRendering.call(this, arguments);
		oHeader.setVisibleButton1(false);
		oHeader.setVisibleButton2(true);
	};

	CustomMonthPicker.prototype.onAfterRendering = function () {
		this._showMonthPicker(undefined, true);
	};

	CustomMonthPicker.prototype._selectYear = function () {
		var oMonthPicker = this._getMonthPicker(),
			oYearPicker = this._getYearPicker(),
			oFocusedDate = this._getFocusedDate();

		oFocusedDate.setYear(oYearPicker.getYear());
		oMonthPicker._setYear(oFocusedDate.getYear());

		this._focusDate(oFocusedDate, true);

		this._showMonthPicker();
	};

	CustomMonthPicker.prototype._selectMonth = function () {
		var oMonthPicker = this._getMonthPicker(),
			oSelectedDate = this.getSelectedDates()[0],
			oFocusedDate = this._getFocusedDate();

		if (!oSelectedDate) {
			oSelectedDate = new DateRange();
		}

		if (!oMonthPicker.getIntervalSelection()) {
			oFocusedDate.setMonth(oMonthPicker.getMonth());

			oSelectedDate.setStartDate(oFocusedDate.toLocalJSDate());
			this.addSelectedDate(oSelectedDate);
		}

		this.fireSelect();
	};

	CustomMonthPicker.prototype.onsapescape = function(oEvent) {
		this.fireCancel();
	};

	return CustomMonthPicker;

});

