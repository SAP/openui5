/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.UniversalDate
sap.ui.define(['sap/ui/base/Object', 'sap/ui/core/LocaleData', './_Calendars'],
	function(BaseObject, LocaleData, _Calendars) {
	"use strict";


	/**
	 * Constructor for UniversalDate.
	 *
	 * @class
	 * The UniversalDate is the base class of calendar date instances. It contains the static methods to create calendar
	 * specific instances.
	 *
	 * The member variable <code>this.oData</code> contains the JS Date object, which is the source value of the date information.
	 * The prototype is containing getters and setters of the JS Date and is delegating them to the internal date object.
	 * Implementations for specific calendars may override methods needed for their specific calendar (e.g. getYear
	 * and getEra for Japanese emperor calendar);
	 *
	 * @private
	 * @ui5-restricted
	 * @alias sap.ui.core.date.UniversalDate
	 */
	var UniversalDate = BaseObject.extend("sap.ui.core.date.UniversalDate", /** @lends sap.ui.core.date.UniversalDate.prototype */ {
		constructor: function() {
			var clDate = UniversalDate.getClass();
			return this.createDate(clDate, arguments);
		}
	});

	UniversalDate.UTC = function() {
		var clDate = UniversalDate.getClass();
		return clDate.UTC.apply(clDate, arguments);
	};

	UniversalDate.now = function() {
		return Date.now();
	};

	UniversalDate.prototype.createDate = function(clDate, aArgs) {
		switch (aArgs.length) {
			case 0: return new clDate();
			case 1: return new clDate(aArgs[0]);
			case 2: return new clDate(aArgs[0], aArgs[1]);
			case 3: return new clDate(aArgs[0], aArgs[1], aArgs[2]);
			case 4: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3]);
			case 5: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4]);
			case 6: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4], aArgs[5]);
			case 7: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4], aArgs[5], aArgs[6]);
		}
	};

	/**
	 * Returns an instance of Date, based on the calendar type from the configuration, or as explicitly
	 * defined by parameter. The object provides all methods also known on the JavaScript Date object.
	 *
	 * @param {Date} oDate A JavaScript date object
	 * @param {sap.ui.core.CalendarType} sCalendarType A calendar type
	 * @returns {sap.ui.core.date.UniversalDate} A date instance
	 * @public
	 */
	UniversalDate.getInstance = function(oDate, sCalendarType) {
		var clDate, oInstance;
		if (oDate instanceof UniversalDate) {
			oDate = oDate.getJSDate();
		}
		if (!sCalendarType) {
			sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		}
		clDate = UniversalDate.getClass(sCalendarType);
		oInstance = Object.create(clDate.prototype);
		oInstance.oDate = oDate;
		oInstance.sCalendarType = sCalendarType;
		return oInstance;
	};

	/**
	 * Returns a specific Date class, based on the calendar type from the configuration, or as explicitly
	 * defined by parameter. The object provides all methods also known on the JavaScript Date object.
	 *
	 * @param {sap.ui.core.CalendarType} sCalendarType the type of the used calendar
	 * @public
	 */
	UniversalDate.getClass = function(sCalendarType) {
		if (!sCalendarType) {
			sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		}
		return _Calendars.get(sCalendarType);
	};

	/*
	 * Loop through the Date class and create delegates of all Date API methods
	 */
	[
		"getDate", "getMonth", "getFullYear", "getYear", "getDay", "getHours", "getMinutes", "getSeconds", "getMilliseconds",
		"getUTCDate", "getUTCMonth", "getUTCFullYear", "getUTCDay", "getUTCHours", "getUTCMinutes", "getUTCSeconds", "getUTCMilliseconds",
		"getTime", "valueOf", "getTimezoneOffset", "toString", "toDateString",
		"setDate", "setFullYear", "setYear", "setMonth", "setHours", "setMinutes", "setSeconds", "setMilliseconds",
		"setUTCDate", "setUTCFullYear", "setUTCMonth", "setUTCHours", "setUTCMinutes", "setUTCSeconds", "setUTCMilliseconds"
	].forEach(function(sName) {
		UniversalDate.prototype[sName] = function() {
			return this.oDate[sName].apply(this.oDate, arguments);
		};
	});

	/**
	 * Returns the JS date object representing the current calendar date value.
	 *
	 * @returns {Date} The JS date object representing the current calendar date value
	 * @public
	 */
	UniversalDate.prototype.getJSDate = function() {
		return this.oDate;
	};

	/**
	 * Returns the calendar type of the current instance of a UniversalDate.
	 *
	 * @returns {sap.ui.core.CalendarType} The calendar type of the date
	 */
	UniversalDate.prototype.getCalendarType = function() {
		return this.sCalendarType;
	};

	/*
	 * Provide additional getters/setters, not yet covered by the JS Date
	 */
	UniversalDate.prototype.getEra = function() {
		return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getFullYear(), this.oDate.getMonth(), this.oDate.getDate());
	};
	UniversalDate.prototype.setEra = function(iEra) {
		// The default implementation does not support setting the era
	};
	UniversalDate.prototype.getUTCEra = function() {
		return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getUTCFullYear(), this.oDate.getUTCMonth(), this.oDate.getUTCDate());
	};
	UniversalDate.prototype.setUTCEra = function(iEra) {
		// The default implementation does not support setting the era
	};
	UniversalDate.prototype.getWeek = function() {
		return UniversalDate.getWeekByDate(this.sCalendarType, this.getFullYear(), this.getMonth(), this.getDate());
	};
	UniversalDate.prototype.setWeek = function(oWeek) {
		var oDate = UniversalDate.getFirstDateOfWeek(this.sCalendarType, oWeek.year || this.getFullYear(), oWeek.week);
		this.setFullYear(oDate.year, oDate.month, oDate.day);
	};
	UniversalDate.prototype.getUTCWeek = function() {
		return UniversalDate.getWeekByDate(this.sCalendarType, this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate());
	};
	UniversalDate.prototype.setUTCWeek = function(oWeek) {
		var oDate = UniversalDate.getFirstDateOfWeek(this.sCalendarType, oWeek.year || this.getFullYear(), oWeek.week);
		this.setUTCFullYear(oDate.year, oDate.month, oDate.day);
	};
	UniversalDate.prototype.getQuarter = function() {
		return Math.floor((this.getMonth() / 3));
	};
	UniversalDate.prototype.getUTCQuarter = function() {
		return Math.floor((this.getUTCMonth() / 3));
	};
	UniversalDate.prototype.getDayPeriod = function() {
		if (this.getHours() < 12) {
			return 0;
		} else {
			return 1;
		}
	};
	UniversalDate.prototype.getUTCDayPeriod = function() {
		if (this.getUTCHours() < 12) {
			return 0;
		} else {
			return 1;
		}
	};


	// TODO: These are currently needed for the DateFormat test, as the date used in the test
	// has been enhanced with these methods. Should be implemented using CLDR data.
	UniversalDate.prototype.getTimezoneShort = function() {
		if (this.oDate.getTimezoneShort) {
			return this.oDate.getTimezoneShort();
		}
	};
	UniversalDate.prototype.getTimezoneLong = function() {
		if (this.oDate.getTimezoneLong) {
			return this.oDate.getTimezoneLong();
		}
	};

	/*
	 * Helper methods for week calculations
	 */
	var iMillisecondsInWeek = 7 * 24 * 60 * 60 * 1000;

	UniversalDate.getWeekByDate = function(sCalendarType, iYear, iMonth, iDay) {
		var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
			clDate = this.getClass(sCalendarType),
			oFirstDay = getFirstDayOfFirstWeek(clDate, iYear),
			oDate = new clDate(clDate.UTC(iYear, iMonth, iDay)),
			iWeek, iLastYear, iNextYear, oLastFirstDay, oNextFirstDay;
		// If region is US, always calculate the week for the current year, otherwise
		// the week might be the last week of the previous year or first week of next year
		if (oLocale.getRegion() === "US") {
			iWeek = calculateWeeks(oFirstDay, oDate);
		} else {
			iLastYear = iYear - 1;
			iNextYear = iYear + 1;
			oLastFirstDay = getFirstDayOfFirstWeek(clDate, iLastYear);
			oNextFirstDay = getFirstDayOfFirstWeek(clDate, iNextYear);
			if (oDate >= oNextFirstDay) {
				iYear = iNextYear;
				iWeek = 0;
			} else if (oDate < oFirstDay) {
				iYear = iLastYear;
				iWeek = calculateWeeks(oLastFirstDay, oDate);
			} else {
				iWeek = calculateWeeks(oFirstDay, oDate);
			}
		}
		return {
			year: iYear,
			week: iWeek
		};
	};

	UniversalDate.getFirstDateOfWeek = function(sCalendarType, iYear, iWeek) {
		var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
			clDate = this.getClass(sCalendarType),
			oFirstDay = getFirstDayOfFirstWeek(clDate, iYear),
			oDate = new clDate(oFirstDay.valueOf() + iWeek * iMillisecondsInWeek);
		//If first day of week is in last year and region is US, return the
		//1st of January instead for symmetric behaviour
		if (oLocale.getRegion() === "US" && iWeek === 0 && oFirstDay.getUTCFullYear() < iYear) {
			return {
				year: iYear,
				month: 0,
				day: 1
			};
		}
		return {
			year: oDate.getUTCFullYear(),
			month: oDate.getUTCMonth(),
			day: oDate.getUTCDate()
		};
	};

	function getFirstDayOfFirstWeek(clDate, iYear) {
		var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
			oLocaleData = LocaleData.getInstance(oLocale),
			iMinDays = oLocaleData.getMinimalDaysInFirstWeek(),
			iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek(),
			oFirstDay = new clDate(clDate.UTC(iYear, 0, 1)),
			iDayCount = 7;
		// Find the first day of the first week of the year
		while (oFirstDay.getUTCDay() !== iFirstDayOfWeek) {
			oFirstDay.setUTCDate(oFirstDay.getUTCDate() - 1);
			iDayCount--;
		}
		// If less than min days are left, first week is one week later
		if (iDayCount < iMinDays) {
			oFirstDay.setUTCDate(oFirstDay.getUTCDate() + 7);
		}
		return oFirstDay;
	}

	function calculateWeeks(oFromDate, oToDate) {
		return Math.floor((oToDate.valueOf() - oFromDate.valueOf()) / iMillisecondsInWeek);
	}

	/*
	 * Helper methods for era calculations
	 */
	var mEras = {};

	UniversalDate.getEraByDate = function(sCalendarType, iYear, iMonth, iDay) {
		var aEras = getEras(sCalendarType),
			iTimestamp = new Date(0).setUTCFullYear(iYear, iMonth, iDay),
			oEra;
		for (var i = aEras.length - 1; i >= 0; i--) {
			oEra = aEras[i];
			if (!oEra) {
				continue;
			}
			if (oEra._start && iTimestamp >= oEra._startInfo.timestamp) {
				return i;
			}
			if (oEra._end && iTimestamp < oEra._endInfo.timestamp) {
				return i;
			}
		}
	};

	UniversalDate.getCurrentEra = function(sCalendarType) {
		var oNow = new Date();
		return this.getEraByDate(sCalendarType, oNow.getFullYear(), oNow.getMonth(), oNow.getDate());
	};

	UniversalDate.getEraStartDate = function(sCalendarType, iEra) {
		var aEras = getEras(sCalendarType),
			oEra = aEras[iEra] || aEras[0];
		if (oEra._start) {
			return oEra._startInfo;
		}
	};

	function getEras(sCalendarType) {
		var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
			oLocaleData = LocaleData.getInstance(oLocale),
			aEras = mEras[sCalendarType];
		if (!aEras) {
			// Get eras from localedata, parse it and add it to the array
			var aEras = oLocaleData.getEraDates(sCalendarType);
			if (!aEras[0]) {
				aEras[0] = {_start: "1-1-1"};
			}
			for (var i = 0; i < aEras.length; i++) {
				var oEra = aEras[i];
				if (!oEra) {
					continue;
				}
				if (oEra._start) {
					oEra._startInfo = parseDateString(oEra._start);
				}
				if (oEra._end) {
					oEra._endInfo = parseDateString(oEra._end);
				}
			}
			mEras[sCalendarType] = aEras;
		}
		return aEras;
	}

	function parseDateString(sDateString) {
		var aParts = sDateString.split("-"),
			iYear, iMonth, iDay;
		if (aParts[0] == "") {
			// negative year
			iYear = -parseInt(aParts[1]);
			iMonth = parseInt(aParts[2]) - 1;
			iDay = parseInt(aParts[3]);
		} else {
			iYear = parseInt(aParts[0]);
			iMonth = parseInt(aParts[1]) - 1;
			iDay = parseInt(aParts[2]);
		}
		return {
			timestamp: new Date(0).setUTCFullYear(iYear, iMonth, iDay),
			year: iYear,
			month: iMonth,
			day: iDay
		};
	}

	return UniversalDate;

});
