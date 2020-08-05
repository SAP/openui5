/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.Persian
sap.ui.define(['./UniversalDate', '../CalendarType', './_Calendars'],
	function(UniversalDate, CalendarType, _Calendars) {
	"use strict";


	/**
	 * The Persian date class
	 *
	 * @class
	 * The Persian date does conversion of day, month and year values based on the vernal equinox.
	 * Calculation taken from jalaali-js.
	 *
	 * @private
	 * @alias sap.ui.core.date.Persian
	 * @extends sap.ui.core.date.UniversalDate
	 */
	var Persian = UniversalDate.extend("sap.ui.core.date.Persian", /** @lends sap.ui.core.date.Persian.prototype */ {
		constructor: function() {
			var aArgs = arguments;
			if (aArgs.length > 1) {
				aArgs = toGregorianArguments(aArgs);
			}
			this.oDate = this.createDate(Date, aArgs);
			this.sCalendarType = CalendarType.Persian;
		}
	});

	Persian.UTC = function() {
		var aArgs = toGregorianArguments(arguments);
		return Date.UTC.apply(Date, aArgs);
	};

	Persian.now = function() {
		return Date.now();
	};

	var BASE_YEAR = 1300;

	/**
	 * Calculate Persian date from gregorian
	 *
	 * @param {object} oGregorian a JS object containing day, month and year in the gregorian calendar
	 * @private
	 */
	function toPersian(oGregorian) {
		var iJulianDayNumber = g2d(oGregorian.year, oGregorian.month + 1, oGregorian.day);
		return d2j(iJulianDayNumber);
	}

	/**
	 * Calculate gregorian date from Persian
	 *
	 * @param {object} oPersian a JS object containing day, month and year in the Persian calendar
	 * @private
	 */
	function toGregorian(oPersian) {
		var iJulianDayNumber = j2d(oPersian.year, oPersian.month + 1, oPersian.day);
		return d2g(iJulianDayNumber);
	}

	function toGregorianArguments(aArgs) {
		var aGregorianArgs = Array.prototype.slice.call(aArgs),
			oPersian, oGregorian;
		// Validate arguments
		if (typeof aArgs[0] !== "number" || typeof aArgs[1] !== "number" || (aArgs[2] !== undefined && typeof aArgs[2] != "number")) {
			aGregorianArgs[0] = NaN;
			aGregorianArgs[1] = NaN;
			aGregorianArgs[2] = NaN;
			return aGregorianArgs;
		}
		oPersian = {
			year: aArgs[0],
			month: aArgs[1],
			day: aArgs[2] !== undefined ? aArgs[2] : 1
		};
		oGregorian = toGregorian(oPersian);
		aGregorianArgs[0] = oGregorian.year;
		aGregorianArgs[1] = oGregorian.month;
		aGregorianArgs[2] = oGregorian.day;
		return aGregorianArgs;
	}

	/*
		This function determines if the Jalaali (Persian) year is
		leap (366-day long) or is the common year (365 days), and
		finds the day in March (Gregorian calendar) of the first
		day of the Jalaali year (jy).
		@param jy Jalaali calendar year (-61 to 3177)
		@return
			leap: number of years since the last leap year (0 to 4)
			gy: Gregorian year of the beginning of Jalaali year
			march: the March day of Farvardin the 1st (1st day of jy)
		@see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
		@see: http://www.fourmilab.ch/documents/calendar/
	*/
	function jalCal(jy) {
		// Jalaali years starting the 33-year rule.
		var breaks = [ -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178],
			bl = breaks.length,
			gy = jy + 621,
			leapJ = -14,
			jp = breaks[0],
			jm, jump, leap, leapG, march, n, i;

		// Find the limiting years for the Jalaali year jy.
		for (i = 1; i < bl; i += 1) {
			jm = breaks[i];
			jump = jm - jp;
			if (jy < jm) {
				break;
			}
			leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
			jp = jm;
		}
		n = jy - jp;

		// Find the number of leap years from AD 621 to the beginning
		// of the current Jalaali year in the Persian calendar.
		leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
		if (mod(jump, 33) === 4 && jump - n === 4) {
			leapJ += 1;
		}

		// And the same in the Gregorian calendar (until the year gy).
		leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;

		// Determine the Gregorian date of Farvardin the 1st.
		march = 20 + leapJ - leapG;

		// Find how many years have passed since the last leap year.
		if (jump - n < 6) {
			n = n - jump + div(jump + 4, 33) * 33;
		}
		leap = mod(mod(n + 1, 33) - 1, 4);
		if (leap === -1) {
			leap = 4;
		}

		return {
			leap: leap,
			gy: gy,
			march: march
		};
	}

	/*
		Converts a date of the Jalaali calendar to the Julian Day number.
		@param jy Jalaali year (1 to 3100)
		@param jm Jalaali month (1 to 12)
		@param jd Jalaali day (1 to 29/31)
		@return Julian Day number
	*/
	function j2d(jy, jm, jd) {
		// Correct month overflow/underflow for correct day calculation
		while (jm < 1) {
			jm += 12;
			jy--;
		}
		while (jm > 12) {
			jm -= 12;
			jy++;
		}
		var r = jalCal(jy);
		return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
	}

	/*
		Converts the Julian Day number to a date in the Jalaali calendar.
		@param jdn Julian Day number
		@return
			jy: Jalaali year (1 to 3100)
			jm: Jalaali month (1 to 12)
			jd: Jalaali day (1 to 29/31)
	*/
	function d2j(jdn) {
		var gy = d2g(jdn).year,
			jy = gy - 621,
			r = jalCal(jy),
			jdn1f = g2d(gy, 3, r.march),
			jd, jm, k;

		// Find number of days that passed since 1 Farvardin.
		k = jdn - jdn1f;
		if (k >= 0) {
			if (k <= 185) {
				// The first 6 months.
				jm = 1 + div(k, 31);
				jd = mod(k, 31) + 1;
				return {
					year: jy,
					month: jm - 1,
					day: jd
				};
			} else {
				// The remaining months.
				k -= 186;
			}
		} else {
			// Previous Jalaali year.
			jy -= 1;
			k += 179;
			if (r.leap === 1) {
				k += 1;
			}
		}
		jm = 7 + div(k, 30);
		jd = mod(k, 30) + 1;
		return {
			year: jy,
			month: jm - 1,
			day: jd
		};
	}

	/*
		Calculates the Julian Day number from Gregorian or Julian
		calendar dates. This integer number corresponds to the noon of
		the date (i.e. 12 hours of Universal Time).
		The procedure was tested to be good since 1 March, -100100 (of both
		calendars) up to a few million years into the future.
		@param gy Calendar year (years BC numbered 0, -1, -2, ...)
		@param gm Calendar month (1 to 12)
		@param gd Calendar day of the month (1 to 28/29/30/31)
		@return Julian Day number
	*/
	function g2d(gy, gm, gd) {
		var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
				+ div(153 * mod(gm + 9, 12) + 2, 5)
				+ gd - 34840408;
		d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
		return d;
	}

	/*
		Calculates Gregorian and Julian calendar dates from the Julian Day number
		(jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
		calendars) to some millions years ahead of the present.
		@param jdn Julian Day number
		@return
			gy: Calendar year (years BC numbered 0, -1, -2, ...)
			gm: Calendar month (1 to 12)
			gd: Calendar day of the month M (1 to 28/29/30/31)
	*/
	function d2g(jdn) {
		var j, i, gd, gm, gy;
		j = 4 * jdn + 139361631;
		j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
		i = div(mod(j, 1461), 4) * 5 + 308;
		gd = div(mod(i, 153), 5) + 1;
		gm = mod(div(i, 153), 12) + 1;
		gy = div(j, 1461) - 100100 + div(8 - gm, 6);
		return	{
			year: gy,
			month: gm - 1,
			day: gd
		};
	}

	/*
		Utility helper functions.
	*/

	function div(a, b) {
		return ~~(a / b);
	}

	function mod(a, b) {
		return a - ~~(a / b) * b;
	}

	/**
	 * Get the Persian date from the this.oDate
	 */
	Persian.prototype._getPersian = function() {
		return toPersian({
			day: this.oDate.getDate(),
			month: this.oDate.getMonth(),
			year: this.oDate.getFullYear()
		});
	};

	/**
	 * Set the Persian date to the current this.oDate object
	 * @param {object} oPersian a JS object containing day, month and year in the Persian calendar
	 */
	Persian.prototype._setPersian = function(oPersian) {
		var oGregorian = toGregorian(oPersian);
		return this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	/**
	 * Get the Persian date from the this.oDate
	 */
	Persian.prototype._getUTCPersian = function() {
		return toPersian({
			day: this.oDate.getUTCDate(),
			month: this.oDate.getUTCMonth(),
			year: this.oDate.getUTCFullYear()
		});
	};

	/**
	 * Set the Persian date to the current this.oDate object
	 * @param {object} oPersian a JS object containing day, month and year in the Persian calendar
	 */
	Persian.prototype._setUTCPersian = function(oPersian) {
		var oGregorian = toGregorian(oPersian);
		return this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	/*
	 * Override setters and getters specific to the Persian date
	 */
	Persian.prototype.getDate = function(iDate) {
		return this._getPersian().day;
	};
	Persian.prototype.getMonth = function() {
		return this._getPersian().month;
	};
	Persian.prototype.getYear = function() {
		return this._getPersian().year - BASE_YEAR;
	};
	Persian.prototype.getFullYear = function() {
		return this._getPersian().year;
	};
	Persian.prototype.setDate = function(iDate) {
		var oPersian = this._getPersian();
		oPersian.day = iDate;
		return this._setPersian(oPersian);
	};
	Persian.prototype.setMonth = function(iMonth, iDay) {
		var oPersian = this._getPersian();
		oPersian.month = iMonth;
		if (iDay !== undefined) {
			oPersian.day = iDay;
		}
		return this._setPersian(oPersian);
	};
	Persian.prototype.setYear = function(iYear) {
		var oPersian = this._getPersian();
		oPersian.year = iYear + BASE_YEAR;
		return this._setPersian(oPersian);
	};
	Persian.prototype.setFullYear = function(iYear, iMonth, iDay) {
		var oPersian = this._getPersian();
		oPersian.year = iYear;
		if (iMonth !== undefined) {
			oPersian.month = iMonth;
		}
		if (iDay !== undefined) {
			oPersian.day = iDay;
		}
		return this._setPersian(oPersian);
	};
	Persian.prototype.getUTCDate = function(iDate) {
		return this._getUTCPersian().day;
	};
	Persian.prototype.getUTCMonth = function() {
		return this._getUTCPersian().month;
	};
	Persian.prototype.getUTCFullYear = function() {
		return this._getUTCPersian().year;
	};
	Persian.prototype.setUTCDate = function(iDate) {
		var oPersian = this._getUTCPersian();
		oPersian.day = iDate;
		return this._setUTCPersian(oPersian);
	};
	Persian.prototype.setUTCMonth = function(iMonth, iDay) {
		var oPersian = this._getUTCPersian();
		oPersian.month = iMonth;
		if (iDay !== undefined) {
			oPersian.day = iDay;
		}
		return this._setUTCPersian(oPersian);
	};
	Persian.prototype.setUTCFullYear = function(iYear, iMonth, iDay) {
		var oPersian = this._getUTCPersian();
		oPersian.year = iYear;
		if (iMonth !== undefined) {
			oPersian.month = iMonth;
		}
		if (iDay !== undefined) {
			oPersian.day = iDay;
		}
		return this._setUTCPersian(oPersian);
	};

	_Calendars.set(CalendarType.Persian, Persian);

	return Persian;

});
