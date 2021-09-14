sap.ui.define([
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/model/Filter",
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/date/UniversalDateUtils',
	'sap/ui/model/FilterOperator'
], function (FilterOperatorUtil, Operator, RangeOperator, Filter, UniversalDate, UniversalDateUtils, ModelOperator) {
	"use strict";


	var getCustomYearFormat = function (date) {
		return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
	};


	var oMediEvalOperator = new RangeOperator({
		name: "MEDIEVAL",
		longText: "Medieval",
		tokenText: "Medieval",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		filterOperator: ModelOperator.BT,
		valueTypes: [Operator.ValueType.Static],
		calcRange: function() {
			return [new UniversalDate(500, 0, 1), new UniversalDate(1500, 0, 1)];
		},
		formatRange: function(aRange, oDataType) {
			return oDataType.formatValue(aRange[0], "string") + " - " + oDataType.formatValue(aRange[1], "string");
		}
	});

	var oRenaissanceOperator = new Operator({
		name: "RENAISSANCE",
		longText: "Renaissance",
		tokenText: "Renaissance",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [Operator.ValueType.Static],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "BT", value1: "1500-01-01", value2: "1600-01-01" });
		}
	});

	var oModernOperator = new Operator({
		name: "MODERN",
		longText: "Modern",
		tokenText: "Modern",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [Operator.ValueType.Static],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "BT", value1: "1600-01-01", value2: getCustomYearFormat(new Date()) });
		}
	});


	var oLastYearOperator = new Operator({
		name: "LASTYEAR",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [Operator.ValueType.Static],
		getModelFilter: function (oCondition, sFieldPath) {
			var currentDate = new Date();
			return new Filter({ path: sFieldPath, operator: "BT", value1: getCustomYearFormat(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())), value2: getCustomYearFormat(new Date(new Date().getFullYear(), currentDate.getMonth(), currentDate.getDate())) });

		}
	});

	var oCustomRangeOperator = new Operator({
		name: "CUSTOMRANGE",
		longText: "Custom Range",
		tokenText: "Custom Range: $0-$1",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "BT", value1: oCondition.values[0], value2: oCondition.values[1] });
		}
	});

	var oNotInRangeOperator = new Operator({
		name: "NOTINRANGE",
		longText: "Not in range",
		tokenText: "Not in range: $0-$1",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
		exclude: true,
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "BT", value1: oCondition.values[0], value2: oCondition.values[1] });
		}
	});

	var oEuropeOperator = new Operator({
		name: "EUROPE",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		tokenText: "Europe",
		longText: "European countries",
		valueTypes: [],
		getModelFilter: function (oCondition, sFieldPath) {
			var aFilters = Object.values({
				"Austria": "AT",
				"Belgium": "BE",
				"Bulgaria": "BG",
				"Croatia": "HR",
				"Cyprus": "CY",
				"Czech Republic": "CZ",
				"Denmark": "DK",
				"Estonia": "EE",
				"Finland": "FI",
				"France": "FR",
				"Germany": "DE",
				"Greece": "GR",
				"Hungary": "HU",
				"Ireland": "IE",
				"Italy": "IT",
				"Latvia": "LV",
				"Lithuania": "LT",
				"Luxembourg": "LU",
				"Malta": "MT",
				"Netherlands": "NL",
				"Poland": "PL",
				"Portugal": "PT",
				"Romania": "RO",
				"San Marino": "SM",
				"Slovakia": "SK",
				"Slovenia": "SI",
				"Spain": "ES",
				"Sweden": "SE",
				"United Kingdom": "GB",
				"Vatican City": "VA"
			}).map(function (code) {
				return new Filter({ path: sFieldPath, operator: "EQ", value1: code });
			});

			return new Filter({ filters: aFilters, and: false });
		}
	});


	[oRenaissanceOperator, oMediEvalOperator, oModernOperator, oCustomRangeOperator, oNotInRangeOperator, oLastYearOperator, oEuropeOperator].forEach(function (oOperator) {
		FilterOperatorUtil.addOperator(oOperator);
	});

});

