/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Collects the operators that are included in the library.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.119
	 * @alias sap.ui.mdc.enums.OperatorName
	 */
	const OperatorName = {
		/**
		* "equal to" operator
		*
		* Depending on the used <code>DisplayFormat</code>, the key, the description, or both are used as output of formatting during parsing.
		*
		* The operator is available for all data types.
		*
		* If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output, the operator is mapped to the <code>DATE</code> option if a date type is used
		* and to the <code>DATETIME</code> option if a date/time type is used.
		* @since 1.73.0
		* @public
		*/
		EQ: "EQ",

		/**
		 * "not equal to" operator
		 *
		 * The operator is available for all types.
		 * @since 1.73.0
		 * @public
		 */
		NE: "NE",

		/**
		 * "between" operator
		 *
		 * There is no validation if the first value is less than the second value as the comparison would be type-dependent and cannot be performed
		 * in a generic way.
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 *
		 * If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output, the operator is mapped to the <code>DATERANGE</code> option if a date type is used
		 * and to the <code>DATETIMERANGE</code> option if a date/time type is used.
		 * @since 1.73.0
		 * @public
		 */
		BT: "BT",

		/**
		 * "not between" operator
		 *
		 * There is no validation if the first value is less than the second value as the comparison would be type-dependent and cannot be performed
		 * in a generic way.
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 * @since 1.73.0
		 * @public
		 */
		NOTBT: "NOTBT",

		/**
		 * "less than" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 * @since 1.73.0
		 * @public
		 */
		LT: "LT",

		/**
		 * "not less than" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 * @since 1.73.0
		 * @public
		 */
		NOTLT: "NOTLT",

		/**
		 * "greater than" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 * @since 1.73.0
		 * @public
		*/
		GT: "GT",

		/**
		 * "not greater than" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 * @since 1.73.0
		 * @public
		 */
		NOTGT: "NOTGT",

		/**
		 * "less than or equal to" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 *
		 * If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output the operator, is mapped to the <code>TO</code> option if a date type is used
		 * and to the <code>TODATETIME</code> option if a date/time type is used.
		 * @since 1.73.0
		 * @public
		 */
		LE: "LE",

		/**
		 * "not less than or equal to" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 * @since 1.73.0
		 * @public
		 */
		NOTLE: "NOTLE",

		/**
		 * "greater than or equal to" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 *
		 * If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output the operator, is mapped to the <code>FROM</code> option if a date type is used
		 * and to the <code>FROMDATETIME</code> option if a date/time type is used.
		 * @since 1.73.0
		 * @public
		 */
		GE: "GE",

		/**
		 * "not greater than or equal to" operator
		 *
		 * The operator is available for string, numeric, date, time, and date/time types.
		 * @since 1.73.0
		 * @public
		 */
		NOTGE: "NOTGE",

		/**
		 * "starts with" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		StartsWith: "StartsWith",

		/**
		 * "does not start with" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		NotStartsWith: "NotStartsWith",

		/**
		 * "ends with" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		EndsWith: "EndsWith",

		/**
		 * "does not end with" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		NotEndsWith: "NotEndsWith",

		/**
		 * "contains" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		Contains: "Contains",

		/**
		 * "does not contain" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		NotContains: "NotContains",

		/**
		 * "empty" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		Empty: "Empty",

		/**
		 * "not empty" operator
		 *
		 * The operator is available for string types.
		 * @since 1.73.0
		 * @public
		 */
		NotEmpty: "NotEmpty",

		/**
		 * "Yesterday" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		YESTERDAY: "YESTERDAY",

		/**
		 * "Today" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		TODAY: "TODAY",

		/**
		 * "Tomorrow" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		TOMORROW: "TOMORROW",

		/**
		 * "Last X Days" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTDAYS: "LASTDAYS",

		/**
		 * "First Day in This Week" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		FIRSTDAYWEEK: "FIRSTDAYWEEK",

		/**
		 * "Last Day in This Week" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		LASTDAYWEEK: "LASTDAYWEEK",

		/**
		 * "First Day in This Month" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		FIRSTDAYMONTH: "FIRSTDAYMONTH",

		/**
		 * "Last Day in This Month" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		LASTDAYMONTH: "LASTDAYMONTH",

		/**
		 * "First Day in This Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		FIRSTDAYQUARTER: "FIRSTDAYQUARTER",

		/**
		 * "Last Day in This Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		LASTDAYQUARTER: "LASTDAYQUARTER",

		/**
		 * "First Day in This Year" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		FIRSTDAYYEAR: "FIRSTDAYYEAR",

		/**
		 * "Last Day in This Year" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		LASTDAYYEAR: "LASTDAYYEAR",

		/**
		 * "Today -X / +Y Days" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		TODAYFROMTO: "TODAYFROMTO",

		/**
		 * "Next X Days" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTDAYS: "NEXTDAYS",

		/**
		 * "Last Week" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTWEEK: "LASTWEEK",

		/**
		 * "This Week" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		THISWEEK: "THISWEEK",

		/**
		 * "Next Week" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTWEEK: "NEXTWEEK",

		/**
		 * "Last X Weeks" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTWEEKS: "LASTWEEKS",

		/**
		 * "Next X Weeks" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTWEEKS: "NEXTWEEKS",

		/**
		 * "Last Month" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTMONTH: "LASTMONTH",

		/**
		 * "This Month" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		THISMONTH: "THISMONTH",

		/**
		 * "Next Month" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTMONTH: "NEXTMONTH",

		/**
		 * "Last X Months" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTMONTHS: "LASTMONTHS",

		/**
		 * "Next X Months" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTMONTHS: "NEXTMONTHS",

		/**
		 * "Last Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTQUARTER: "LASTQUARTER",

		/**
		 * "This Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		THISQUARTER: "THISQUARTER",

		/**
		 * "Next Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTQUARTER: "NEXTQUARTER",

		/**
		 * "Last X Quarters" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTQUARTERS: "LASTQUARTERS",

		/**
		 * "Next X Quarters" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTQUARTERS: "NEXTQUARTERS",

		/**
		 * "First Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		QUARTER1: "QUARTER1",

		/**
		 * "Second Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		QUARTER2: "QUARTER2",

		/**
		 * "Third Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		QUARTER3: "QUARTER3",

		/**
		 * "Fourth Quarter" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		QUARTER4: "QUARTER4",

		/**
		 * "Last Year" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTYEAR: "LASTYEAR",

		/**
		 * "This Year" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.86.0
		 * @public
		 */
		THISYEAR: "THISYEAR",

		/**
		 * "Next Year" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTYEAR: "NEXTYEAR",

		/**
		 * "Last X Years" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		LASTYEARS: "LASTYEARS",

		/**
		 * "Next X Years" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		NEXTYEARS: "NEXTYEARS",

		/**
		 * "Month" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.85.0
		 * @public
		 */
		SPECIFICMONTH: "SPECIFICMONTH",

		/**
		 * "Month in Year" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		SPECIFICMONTHINYEAR: "SPECIFICMONTHINYEAR",

		/**
		 * "Year to Date" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.74.0
		 * @public
		 */
		YEARTODATE: "YEARTODATE",

		/**
		 * "Date to Year" operator
		 *
		 * The operator is available for date and date/time types.
		 * @since 1.99.0
		 * @public
		 */
		DATETOYEAR: "DATETOYEAR",

		/**
		 * "Last X Minutes" operator
		 *
		 * The operator is available for date/time types.
		 * @since 1.112.0
		 * @public
		 */
		LASTMINUTES: "LASTMINUTES",

		/**
		 * "Next X Minutes" operator
		 *
		 * The operator is available for date/time types.
		 * @since 1.112.0
		 * @public
		 */
		NEXTMINUTES: "NEXTMINUTES",

		/**
		 * "Last X Hours" operator
		 *
		 * The operator is available for date/time types.
		 * @since 1.112.0
		 * @public
		 */
		LASTHOURS: "LASTHOURS",

		/**
		 * "Next X Hours" operator
		 *
		 * The operator is available for date/time types.
		 * @since 1.112.0
		 * @public
		 */
		NEXTHOURS: "NEXTHOURS"
	};

	return OperatorName;

}, /* bExport= */ true);
