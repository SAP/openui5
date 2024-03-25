/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/DynamicDateRange",
	"sap/m/DatePicker",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/core/date/UI5Date"
], function (
	DynamicDateRange,
	DatePicker,
	BindingResolver,
	BindingHelper,
	UI5Date
) {
	"use strict";

	var MIN_DATE = UI5Date.getInstance(-8640000000000000);
	var MIN_ODATA_DATE = UI5Date.getInstance("1753-01-01");
	var MAX_DATE = UI5Date.getInstance(8640000000000000);
	var MAX_ODATA_DATE = UI5Date.getInstance("9999-12-31");
	var mOptions = {
		"DATE": "date",
		"TODAY": "today",
		"YESTERDAY": "yesterday",
		"TOMORROW": "tomorrow",

		"DATERANGE": "dateRange",
		"DATETIMERANGE": "dateTimeRange",
		"FROM": "from",
		"TO": "to",
		"FROMDATETIME": "fromDateTime",
		"TODATETIME": "toDateTime",
		"YEARTODATE": "yearToDate",
		"LASTDAYS": "lastDays",
		"LASTWEEKS": "lastWeeks",
		"LASTMONTHS": "lastMonths",
		"LASTQUARTERS": "lastQuarters",
		"LASTYEARS": "lastYears",
		"NEXTDAYS": "nextDays",
		"NEXTWEEKS": "nextWeeks",
		"NEXTMONTHS": "nextMonths",
		"NEXTQUARTERS": "nextQuarters",
		"NEXTYEARS": "nextYears",
		"TODAYFROMTO": "todayFromTo",

		"THISWEEK": "thisWeek",
		"LASTWEEK": "lastWeek",
		"NEXTWEEK": "nextWeek",

		"SPECIFICMONTH": "specificMonth",
		"THISMONTH": "thisMonth",
		"LASTMONTH": "lastMonth",
		"NEXTMONTH": "nextMonth",

		"THISQUARTER": "thisQuarter",
		"LASTQUARTER": "lastQuarter",
		"NEXTQUARTER": "nextQuarter",
		"QUARTER1": "quarter1",
		"QUARTER2": "quarter2",
		"QUARTER3": "quarter3",
		"QUARTER4": "quarter4",

		"THISYEAR": "thisYear",
		"LASTYEAR": "lastYear",
		"NEXTYEAR": "nextYear",
		"DATETIME": "dateTime"
	};

	/**
	 * @param {string} sOption sap.m.StandardDynamicDateRangeKeys option in upper case
	 * @returns {string} Option in camel case
	 */
	function optionToCamelCase(sOption) {
		return mOptions[sOption];
	}

	/**
	 * @param {Date} oDate The date to format
	 * @returns {string} The formatted short date. E.g. 2023-05-23
	 */
	function toShortDate(oDate) {
		return oDate.getFullYear().toString().padStart(4, "0")
			+ "-" + (oDate.getMonth() + 1).toString().padStart(2, "0")
			+ "-" + oDate.getDate().toString().padStart(2, "0");
	}

	var DateRangeHelper = {};

	DateRangeHelper.createInput = function (oConfig, oCard, bIsFormInput) {
		var oControl;
		var aOptions = oConfig.options.map(function (sOption) {
			return sOption.toUpperCase();
		});

		if (aOptions.length === 1 && aOptions[0] === "DATE" && bIsFormInput) {
			oControl = new DatePicker();
		} else {
			oControl = new DynamicDateRange({
				standardOptions: aOptions
			});
		}

		DateRangeHelper.setValue(oControl, oConfig.value, oCard);

		return oControl;
	};

	DateRangeHelper.setValue = function (oControl, oValue, oCard) {
		if (!oValue) {
			return;
		}

		if (oControl.isA("sap.m.DatePicker")) {
			if (oValue.values) {
				oValue = oValue.values;
			}

			oControl.applySettings({
				value: oValue
			});
		} else {
			var oResolvedValue = BindingResolver.resolveValue(oValue, oCard);
			var sOption = oResolvedValue.option.toUpperCase();
			var aTypes = oControl.getOption(sOption).getValueTypes();
			oControl.setValue({
				operator: sOption,
				values: oResolvedValue.values.map(function (vValue, i) {
					if (aTypes[i] === "date" || aTypes[i] === "datetime") {
						return UI5Date.getInstance(vValue);
					}
					return vValue;
				})
			});
		}
	};

	DateRangeHelper.getValueForModel = function (oControl) {
		var oValue;
		var oRange;
		var oRangeOData;
		var oDateRangeValue;

		if (oControl.isA("sap.m.DatePicker") && oControl.getValue() && oControl.isValidValue()) {
			oDateRangeValue = {
				operator: "DATE",
				values: [UI5Date.getInstance(oControl.getValue())]
			};
		} else if (oControl.isA("sap.m.DynamicDateRange")) {
			oDateRangeValue = oControl.getValue();
		}

		if (oDateRangeValue) {
			oValue = {
				option: optionToCamelCase(oDateRangeValue.operator),
				values: oDateRangeValue.values.slice()
			};

			var aDates = DynamicDateRange.toDates(oDateRangeValue),
				dStart = aDates[0],
				bToOperator = oDateRangeValue.operator === "TO" || oDateRangeValue.operator === "TODATETIME",
				bFromOperator = oDateRangeValue.operator === "FROM" || oDateRangeValue.operator === "FROMDATETIME",
				iSecondIndex = bToOperator || bFromOperator ? 0 : 1,
				dEnd = aDates[iSecondIndex];

			oRange = {
				start: dStart.toISOString(),
				end: dEnd.toISOString(),
				startLocalDate: toShortDate(dStart),
				endLocalDate: toShortDate(dEnd)
			};
			oRangeOData = {
				start: dStart.toISOString(),
				end: dEnd.toISOString(),
				startLocalDate: toShortDate(dStart),
				endLocalDate: toShortDate(dEnd)
			};

			if (bToOperator) {
				oRange.start = MIN_DATE.toISOString();
				oRangeOData.start = MIN_ODATA_DATE.toISOString();
				oRange.startLocalDate = toShortDate(MIN_DATE);
				oRangeOData.startLocalDate = toShortDate(MIN_ODATA_DATE);
			}

			if (bFromOperator) {
				oRange.end = MAX_DATE.toISOString();
				oRangeOData.end = MAX_ODATA_DATE.toISOString();
				oRange.endLocalDate = toShortDate(MAX_DATE);
				oRangeOData.endLocalDate = toShortDate(MAX_ODATA_DATE);
			}
		}

		return {
			value: oValue,
			range: oRange,
			rangeOData: oRangeOData
		};
	};

	DateRangeHelper.getAllOptions = function () {
		return mOptions;
	};

	return DateRangeHelper;
});