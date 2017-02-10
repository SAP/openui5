/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/unified/calendar/DatesRow', 'sap/ui/unified/library'],
	function(jQuery, DatesRow, library) {
		"use strict";

	var OneMonthDatesRow = DatesRow.extend("sap.ui.unified.calendar.OneMonthDatesRow", /** @lends sap.ui.unified.calendar.OneMonthDatesRow.prototype */ {
		metadata : {
			library : "sap.ui.unified"
		}
	});

	OneMonthDatesRow.prototype.init = function() {
		DatesRow.prototype.init.apply(this, arguments);
		this.iMode = 2; //default corresponds to size L
	};

	OneMonthDatesRow.prototype.setMode = function(iMode) {
		var oSelectedDates = this.getSelectedDates(),
			oStartDate,
			bChanged = this.iMode !== iMode;

		this.iMode = iMode;


		if (bChanged && oSelectedDates.length) {
			if (this.iMode < 2) {
				oStartDate = this.getStartDate();
			}

			//clear or set to first of the month
			oSelectedDates[0].setProperty('startDate', oStartDate, true);
		}

		return this;
	};

	/**
	 * Obtains the rendering mode.
	 * @returns {number|*} the mode - 0 - Tablet, 1 - Phone, 2 - Desktop
	 */
	OneMonthDatesRow.prototype.getMode = function () {
		return this.iMode;
	};

	OneMonthDatesRow.prototype.selectDate = function(oDate) {
		if (this.iMode < 2 && this.getSelectedDates().length) {
			this.getSelectedDates()[0].setStartDate(oDate);
		}
	};

	OneMonthDatesRow.prototype.setDate = function(oDate) {
		// check if in visible date range
		if (!this._bNoRangeCheck && !this.checkDateFocusable(oDate)) {
			return this;
		}

		DatesRow.prototype.setDate.apply(this, arguments);

		return this;
	};

	OneMonthDatesRow.prototype.displayDate = function(oDate){
		// check if in visible date range
		if (!this._bNoRangeCheck && !this.checkDateFocusable(oDate)) {
			return this;
		}

		DatesRow.prototype.displayDate.apply(this, arguments);

		return this;

	};

	return OneMonthDatesRow;

}, /* bExport=  */ true);