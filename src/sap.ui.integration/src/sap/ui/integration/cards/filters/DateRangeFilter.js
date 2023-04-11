/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/m/DynamicDateRange",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/core/date/UI5Date"
], function (
	BaseFilter,
	Log,
	coreLibrary,
	DynamicDateRange,
	BindingResolver,
	UI5Date
) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
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
	DateRangeFilter.prototype.setValueFromOutside = function (vValue) {
		Log.error("Setting a filter value programatically on a DateRangeFilter is currently unsupported.", null, "sap.ui.integration.widgets.Card");
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

			var aDates = DynamicDateRange.toDates(oDateRangeValue),
				dStart = aDates[0],
				bToOperator = oDateRangeValue.operator === "TO" || oDateRangeValue.operator === "TODATETIME",
				bFromOperator = oDateRangeValue.operator === "FROM" || oDateRangeValue.operator === "FROMDATETIME",
				iSecondIndex = bToOperator || bFromOperator ? 0 : 1,
				dEnd = aDates[iSecondIndex];

			oRange = {
				start: dStart.toISOString(),
				end: dEnd.toISOString()
			};
			oRangeOData = {
				start: dStart.toISOString(),
				end: dEnd.toISOString()
			};

			if (bToOperator) {
				oRange.start = MIN_DATE.toISOString();
				oRangeOData.start = MIN_ODATA_DATE.toISOString();
			}

			if (bFromOperator) {
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

		oConfig.options = oConfig.options || this._getDefaultOptions();
		oConfig.options = oConfig.options.map(function (sOption) {
			return sOption.toUpperCase();
		});

		var oDdr = new DynamicDateRange({
			standardOptions: oConfig.options
		}).addStyleClass("sapFCardDateRangeField");

		if (oConfig.value) {
			oConfig.value =  BindingResolver.resolveValue(oConfig.value, this.getCardInstance());
			var sOption = oConfig.value.option.toUpperCase();
			var aTypes = oDdr.getOption(sOption).getValueTypes();
			oValue = {
				operator: sOption,
				values: oConfig.value.values.map(function (vValue, i) {
					if (aTypes[i] === "date" || aTypes[i] === "datetime") {
						return UI5Date.getInstance(vValue);
					}
					return vValue;
				})
			};
		}

		oDdr.setValue(oValue);

		oDdr.attachChange(function (oEvent) {
			if (oEvent.getParameter("valid")) {
				oDdr.setValueState(ValueState.None);
				this._syncValue();
			} else {
				oDdr.setValueState(ValueState.Error);
			}
		}.bind(this));

		var oLabel = this.createLabel(oConfig);
		if (oLabel) {
			oDdr.addAriaLabelledBy(oLabel);
		}

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

	DateRangeFilter.prototype.getOptions = function () {
		return mOptions;
	};

	return DateRangeFilter;
});