/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.CustomYearPicker
sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarRenderer",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/calendar/Header",
	"sap/ui/unified/DateRange"
],
	function(
		Renderer,
		Calendar,
		CalendarRenderer,
		CalendarDate,
		Header,
		DateRange
	) {
	"use strict";

	var CustomYearPickerRenderer = Renderer.extend(CalendarRenderer);
	CustomYearPickerRenderer.apiVersion = 2;

	var CustomYearPicker = Calendar.extend("sap.ui.unified.internal.CustomYearPicker", {
		metadata: {
			library: "sap.ui.unified"
		},
		renderer: CustomYearPickerRenderer
	});

	/*
	 * Possible values for the "_currentPicker" aggregation: yearPicker.
	 */

	CustomYearPicker.prototype.init = function(){
		Calendar.prototype.init.apply(this, arguments);
		this.setProperty("_currentPicker", "yearPicker");
		this._bNamesLengthChecked = true;
	};

	CustomYearPicker.prototype.onBeforeRendering = function () {
		var aSelectedDates = this.getSelectedDates(),
			oFirstSelectedDate = aSelectedDates.length ? aSelectedDates[0].getStartDate() : undefined,
			oYearPicker = this._getYearPicker(),
			oCYPSelCalDate,
			oFocusedCalDate;

		if (oFirstSelectedDate) {
			oCYPSelCalDate = CalendarDate.fromLocalJSDate(oFirstSelectedDate);
			oCYPSelCalDate.setMonth(0, 1);
			oFocusedCalDate = new CalendarDate(this._getFocusedDate());
			oFocusedCalDate.setMonth(0, 1);

			if (oFocusedCalDate.isSame(oCYPSelCalDate)) {
				oYearPicker.setDate(oFirstSelectedDate);
			}
		} else {
			oYearPicker.setProperty("_middleDate", this._getFocusedDate());
			oYearPicker.setDate(this._getFocusedDate().toLocalJSDate());
		}

		Calendar.prototype.onBeforeRendering.call(this, arguments);
	};

	CustomYearPicker.prototype.exit = function(){
		Calendar.prototype.exit.apply(this, arguments);
		if (this._fnYPDelegate) {
			this.getAggregation("yearPicker").removeDelegate(this._fnYPDelegate);
		}
	};

	CustomYearPicker.prototype._initializeHeader = function() {
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

	CustomYearPicker.prototype._closePickers = function(){
		this.setProperty("_currentPicker", "yearPicker");

		this._togglePrevNexYearPicker();
	};

	CustomYearPicker.prototype._selectYear = function () {
		var oDateRange = this.getSelectedDates()[0],
			oYearPicker = this._getYearPicker();

		if (!oDateRange) {
			oDateRange = new DateRange();
		}

		if (!oYearPicker.getIntervalSelection()) {
			oDateRange.setStartDate(this._getYearPicker().getDate());
			this.addSelectedDate(oDateRange);
		}

		this.fireSelect();
	};

	CustomYearPicker.prototype.onsapescape = function(oEvent) {
		this.fireCancel();
	};

	/**
	 * Sets the visibility of the Current date button in the CustomYearPicker.
	 *
	 * This functionality is not supported for CustomYearPicker as there is no Day view in the Calendar.
	 *
	 * @param {boolean} bShow whether the Today button will be displayed
	 * @return {this} <code>this</code> for method chaining
	 * @public
	 * @deprecated Not supported
	 * @ui5-not-supported
	 */
	CustomYearPicker.prototype.setShowCurrentDateButton = function(bShow){
		return this;
	};

	return CustomYearPicker;

});

