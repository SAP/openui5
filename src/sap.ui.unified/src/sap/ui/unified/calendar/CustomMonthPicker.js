/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.CustomYearPicker
sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/unified/Calendar",
	'sap/ui/unified/CalendarRenderer',
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


	var CustomMonthPickerRenderer = Renderer.extend(CalendarRenderer);
	CustomMonthPickerRenderer.apiVersion = 2;

	var CustomMonthPicker = Calendar.extend("sap.ui.unified.internal.CustomMonthPicker", {
		metadata: {
			library: "sap.ui.unified"
		},
		renderer: CustomMonthPickerRenderer
	});

	/*
	 * Possible values for the "_currentPicker" aggregation: monthPicker and yearPicker.
	 */

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

	CustomMonthPicker.prototype.init = function(){
		Calendar.prototype.init.apply(this, arguments);
		this.setProperty("_currentPicker", "monthPicker");
		this._bNamesLengthChecked = true;
	};

	CustomMonthPicker.prototype.onBeforeRendering = function () {
		var oSelectedDates = this.getSelectedDates(),
			oYearPickerDate = this._getYearPicker().getDate(),
			oMonthPicker, oSelectedStartDate;

		Calendar.prototype.onBeforeRendering.apply(this, arguments);

		if (this._iMode === 1) {
			if (oSelectedDates.length && oSelectedDates[0].getStartDate() && (!oYearPickerDate || (oSelectedDates[0].getStartDate().getFullYear() === oYearPickerDate.getFullYear()))) {
				oMonthPicker = this._getMonthPicker();
				oSelectedStartDate = oSelectedDates[0].getStartDate();
				oMonthPicker.setMonth(oSelectedStartDate.getMonth());
				oMonthPicker._iYear = oSelectedStartDate.getFullYear();
			}
		}
	};

	CustomMonthPicker.prototype._closePickers = function(){
		this.setProperty("_currentPicker", "monthPicker");

		this._togglePrevNext(this._getFocusedDate(), true);
	};

	CustomMonthPicker.prototype._selectYear = function () {
		var oMonthPicker = this._getMonthPicker(),
			oYearPicker = this._getYearPicker(),
			oFocusedDate = this._getFocusedDate();

		oFocusedDate.setYear(oYearPicker.getYear());
		oMonthPicker._setYear(oFocusedDate.getYear());
		oMonthPicker._setDate(oFocusedDate);

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
			oFocusedDate.setMonth(oMonthPicker.getMonth(), 1);

			oSelectedDate.setStartDate(oFocusedDate.toLocalJSDate());
			this.addSelectedDate(oSelectedDate);
		}

		this.fireSelect();
	};

	CustomMonthPicker.prototype.onsapescape = function(oEvent) {
		this.fireCancel();
	};

	CustomMonthPicker.prototype._hideMonthPicker = function(){
		this._hideOverlay();
		this._togglePrevNext(this._getFocusedDate(), true);
		this._bActionTriggeredFromSecondHeader = false;
	};

	/**
	 * Sets the visibility of the Current date button in the CustomMonthPicker.
	 *
	 * This functionality is not supported for CustomMonthPicker as there is no Day view in the Calendar.
	 *
	 * @param {boolean} bShow whether the Today button will be displayed
	 * @return {this} <code>this</code> for method chaining
	 * @public
	 * @deprecated Not supported
	 * @ui5-not-supported
	 */
	CustomMonthPicker.prototype.setShowCurrentDateButton = function(bShow){
		return this;
	};
	return CustomMonthPicker;

});

