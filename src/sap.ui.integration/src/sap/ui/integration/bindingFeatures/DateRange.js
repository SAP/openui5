/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/date/UniversalDateUtils",
	"sap/base/Log"
], function (
	UniversalDateUtils,
	Log
) {
	"use strict";

	/**
	 * This class allows to create a date range like 'last 5 years' and get its start or end date.
	 *
	 * @class
	 * @private
	 */
	var DateRange = {

		/**
		 * Gets the start date of the specified date range.
		 * @param {string} sType The range type, for example lastYear.
		 * @param {int} iValue Optionally indicates how many days, months or years of the specified type to calculate.
		 * @returns {sap.ui.core.date.UniversalDate} The start date and time of the specified range.
		 */
		start: function (sType, iValue) {
			var aRange = this._getRange(sType, iValue);

			if (!aRange) {
				return null;
			}

			return aRange[0];
		},

		/**
		 * Gets the end date of the specified date range.
		 * @param {string} sType The range type, for example lastYear.
		 * @param {int} iValue Optionally indicates how many days, months or years of the specified type to calculate.
		 * @returns {sap.ui.core.date.UniversalDate} The end date and time of the specified range.
		 */
		end: function (sType, iValue) {
			var aRange = this._getRange(sType, iValue);

			if (!aRange) {
				return null;
			}

			return aRange[1];
		},

		/**
		 * Gets the specified date range.
		 * @param {string} sType The range type, for example lastYear.
		 * @param {int} iValue Optionally indicates how many days, months or years of the specified type to calculate.
		 * @returns {sap.ui.core.date.UniversalDate[]} The start and the end of the specified range.
		 */
		_getRange: function (sType, iValue) {
			var fnGetRange = UniversalDateUtils.ranges[sType];

			if (!fnGetRange) {
				Log.error("The requested date range type '" + sType + "' is not found", "sap.ui.integration.widgets.Card");
				return null;
			}

			return fnGetRange(iValue);
		}
	};

	return DateRange;
});
