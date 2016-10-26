/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.Gregorian
sap.ui.define(['jquery.sap.global', './UniversalDate', 'sap/ui/core/Locale', 'sap/ui/core/LocaleData'],
	function(jQuery, UniversalDate, Locale, LocaleData) {
	"use strict";


	/**
	 * The Gregorian date class
	 *
	 * @class
	 *
	 * @private
	 * @alias sap.ui.core.date.Gregorian
	 * @extends sap.ui.core.date.UniversalDate
	 */
	var Gregorian = UniversalDate.extend("sap.ui.core.date.Gregorian", /** @lends sap.ui.core.date.Gregorian.prototype */ {
		constructor: function() {
			this.oDate = this.createDate(Date, arguments);
			this.sCalendarType = sap.ui.core.CalendarType.Gregorian;
		}
	});

	Gregorian.UTC = function() {
		return Date.UTC.apply(Date, arguments);
	};

	Gregorian.now = function() {
		return Date.now();
	};

	return Gregorian;

});