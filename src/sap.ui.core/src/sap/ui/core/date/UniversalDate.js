/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.UniversalDate
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/core/LocaleData'],
	function(jQuery, BaseObject, LocaleData) {
	"use strict";


	/**
	 * Constructor for UniversalDate
	 *
	 * @class
	 * The Date is the base class of calendar date instances. It contains the static methods to create calendar
	 * specific instances.
	 * 
	 * The member variable this.oData contains the JS Date object, which is the source value of the date information. 
	 * The prototype is containing getters and setters of the JS Date and is delegating them to the internal date object. 
	 * Implementations for specific calendars may override methods needed for their specific calendar (e.g. getYear 
	 * and getEra for japanese emperor calendar);
	 *
	 * @private
	 * @alias sap.ui.core.date.UniversalDate
	 */
	var UniversalDate = BaseObject.extend("sap.ui.core.date.UniversalDate", /** @lends sap.ui.core.BaseObject.prototype */ {
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
	 * @param [Date] oDate the JavaScript Date object
	 * @param [sap.ui.core.CalendarType] sCalendarType the type of the used calendar
	 * @public
	 */
	UniversalDate.getInstance = function(oDate, sCalendarType) {
		var clDate, oInstance;
		if (oDate instanceof UniversalDate) {
			return oDate;
		}
		clDate = UniversalDate.getClass(sCalendarType);
		oInstance = jQuery.sap.newObject(clDate.prototype);
		oInstance.oDate = oDate;
		oInstance.sCalendarType = sCalendarType;
		return oInstance;
	};

	/**
	 * Returns a specific Date class, based on the calendar type from the configuration, or as explicitly
	 * defined by parameter. The object provides all methods also known on the JavaScript Date object.
	 * 
	 * @param [sap.ui.core.CalendarType] sCalendarType the type of the used calendar
	 * @public
	 */
	UniversalDate.getClass = function(sCalendarType) {
		var sClassName, clDate;
		if (!sCalendarType) {
			sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		}
		sClassName = "sap.ui.core.date." + sCalendarType;
		jQuery.sap.require(sClassName);
		clDate = jQuery.sap.getObject(sClassName);
		return clDate;
	};
	
	/*
	 * Loop through the Date class and create delegates of all Date API methods
	 */
	var aMethods = [
		"getDate", "getMonth", "getFullYear", "getYear", "getDay", "getHours", "getMinutes", "getSeconds", "getMilliseconds",
		"getUTCDate", "getUTCMonth", "getUTCFullYear", "getUTCDay", "getUTCHours", "getUTCMinutes", "getUTCSeconds", "getUTCMilliseconds",
		"getTime", "valueOf", "getTimezoneOffset", "toString", "toDateString",
		"setDate", "setFullYear", "setYear", "setMonth", "setHours", "setMinutes", "setSeconds", "setMilliseconds",
		"setUTCDate", "setUTCFullYear", "setUTCMonth", "setUTCHours", "setUTCMinutes", "setUTCSeconds", "setUTCMilliseconds"
    ];
	jQuery.each(aMethods, function(iIndex, sName) {
		UniversalDate.prototype[sName] = function() {
			return this.oDate[sName].apply(this.oDate, arguments);
		};
	});

	/**
	 * Returns the JS date object representing the current calendar date value
	 * 
	 * @return {Date} 
	 * @public
	 */	
	UniversalDate.prototype.getJSDate = function() {
		return this.oDate;
	};

	/**
	 * Returns the calendar type of the current instance of a UniversalDate
	 * 
	 * @return [string] the calendar type 
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
		// The default implementation does not support week
	};
	UniversalDate.prototype.getUTCWeek = function() {
		// The default implementation does not support week
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
	 * Helper methods for era calculations
	 */
	var mEras = {};
	
	UniversalDate.getEraByDate = function(sCalendarType, iYear, iMonth, iDay) {
		var aEras = getEras(sCalendarType),
			iTimestamp = Date.UTC(iYear, iMonth, iDay),
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
	
	UniversalDate.getEraStartDate = function(sCalendarType, iEra) {
		var aEras = getEras(sCalendarType),
			oEra = aEras[iEra] || aEras[0];
		if (oEra._start) {
			return oEra._startInfo;
		}
	};

	function getEras(sCalendarType) {
		var aEras = mEras[sCalendarType];
		if (!aEras) {
			// Get eras from localedata, parse it and add it to the array
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
				oLocaleData = LocaleData.getInstance(oLocale),
				aEras = oLocaleData.getEraDates(sCalendarType);
			if (!aEras[0]) {
				aEras[0] = {_start: "0-1-1"};
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
			iYear = -parseInt(aParts[1], 10);
			iMonth = parseInt(aParts[2], 10) - 1;
			iDay = parseInt(aParts[3], 10);
		} else {
			iYear = parseInt(aParts[0], 10);
			iMonth = parseInt(aParts[1], 10) - 1;
			iDay = parseInt(aParts[2], 10);
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