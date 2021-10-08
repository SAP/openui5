/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/ui/core/library",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateUtil"
], function (
	BaseFilter,
	coreLibrary,
	DynamicDateRange,
	DynamicDateUtil
) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var MIN_DATE = new Date(-8640000000000000);
	var MIN_ODATA_DATE = new Date("1753-01-01");
	var MAX_DATE = new Date(8640000000000000);
	var MAX_ODATA_DATE = new Date("9999-12-31");

	/**
	 * @param {string} sOption sap.m.StandardDynamicDateRangeKeys option in upper case
	 * @returns {string} Option in camel case
	 */
	function optionToCamelCase(sOption) {
		var mOptions = {
			"DATE": "date",
			"TODAY": "today",
			"YESTERDAY": "yesterday",
			"TOMORROW": "tomorrow",

			"DATERANGE": "dateRange",
			"FROM": "from",
			"TO": "to",
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
			"NEXTYEAR": "nextYear"
		};

		return mOptions[sOption];
	}

	/**
	 * Constructor for a new <code>DateRangeFilter</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.cards.filters.BaseFilter
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.96
	 * @alias sap.ui.integration.cards.filters.DateRangeFilter
	 */
	var DateRangeFilter = BaseFilter.extend("sap.ui.integration.cards.filters.DateRangeFilter", {
		metadata: {
			library: "sap.ui.integration",
			aggregations: {
				/**
				 * The internally used sap.m.DynamicDateRange control instance.
				 */
				_ddr: { type: "sap.m.DynamicDateRange", multiple: false, visibility: "hidden" }
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	/**
	 * @override
	 */
	DateRangeFilter.prototype.getField = function () {
		return this._getDdr();
	};

	/**
	 * @override
	 */
	DateRangeFilter.prototype.getValueForModel = function () {
		var oDateRangeValue = this._getDdr().getValue();
		var oValue;
		var oRange;
		var oRangeOData;

		if (oDateRangeValue) {
			oValue = {
				option: optionToCamelCase(oDateRangeValue.operator),
				values: oDateRangeValue.values.slice()
			};

			var aDates = DynamicDateUtil.toDates(oDateRangeValue),
				dStart = aDates[0].getJSDate ? aDates[0].getJSDate() : aDates[0],
				dEnd = aDates[1].getJSDate ? aDates[1].getJSDate() : aDates[1];

			oRange = {
				start: dStart.toISOString(),
				end: dEnd.toISOString()
			};
			oRangeOData = {
				start: dStart.toISOString(),
				end: dEnd.toISOString()
			};

			if (oDateRangeValue.operator === "TO") {
				oRange.start = MIN_DATE.toISOString();
				oRangeOData.start = MIN_ODATA_DATE.toISOString();
			}

			if (oDateRangeValue.operator === "FROM") {
				oRange.end = MAX_DATE.toISOString();
				oRangeOData.end = MAX_ODATA_DATE.toISOString();
			}
		}

		return {
			value: oValue,
			range: oRange,
			rangeOData: oRangeOData
		};
	};

	DateRangeFilter.prototype._getDdr = function () {
		var oControl = this.getAggregation("_ddr");
		if (!oControl) {
			oControl = this._createDdr();
			this.setAggregation("_ddr", oControl);
		}

		return oControl;
	};

	/**
	 * Constructs a DynamicDateRange control configured with the Filter's properties.
	 *
	 * @private
	 * @returns {sap.m.DynamicDateRange} configured instance
	 */
	DateRangeFilter.prototype._createDdr = function () {
		var oConfig = Object.assign({}, this.getConfig());
		var oValue;

		if (oConfig.value) {
			var sOption = oConfig.value.option.toUpperCase();
			var aTypes = DynamicDateUtil.getOption(sOption).getValueTypes();
			oValue = {
				operator: sOption,
				values: oConfig.value.values.map(function (vValue, i) {
					if (aTypes[i] === "date") {
						return new Date(vValue);
					}
					return vValue;
				})
			};
		}

		oConfig.options = oConfig.options || this._getDefaultOptions();
		oConfig.options = oConfig.options.map(function (sOption) {
			return sOption.toUpperCase();
		});

		var oDdr = new DynamicDateRange({
			value: oValue,
			options: oConfig.options
		});

		oDdr.attachChange(function (oEvent) {
			if (oEvent.getParameter("valid")) {
				oDdr.setValueState(ValueState.None);
				this.setValue(this.getValueForModel());
			} else {
				oDdr.setValueState(ValueState.Error);
			}
		}.bind(this));

		return oDdr;
	};

	DateRangeFilter.prototype._getDefaultOptions = function () {
		return [
			"date",
			"today",
			"dateRange",
			"from",
			"to",
			"lastDays",
			"nextDays",
			"lastWeeks",
			"nextWeeks"
		];
	};

	return DateRangeFilter;
});