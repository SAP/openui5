/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/model/Filter"
], function (FilterOperatorUtil, Operator, Filter) {
	"use strict";


	var getCustomYearFormat = function (date) {
		return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
	};


	var oMediEvalOperator = new Operator({
		name: "MEDIEVAL",
		longText: "Medieval",
		tokenText: "Medieval",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "BT", value1: "0500-01-01", value2: "1500-01-01" });
		}
	});

	var oRenaissanceOperator = new Operator({
		name: "RENAISSANCE",
		longText: "Renaissance",
		tokenText: "Renaissance",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [],
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
		valueTypes: [],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "BT", value1: "1600-01-01", value2: getCustomYearFormat(new Date()) });
		}
	});


	var oLastYearOperator = new Operator({
		name: "LASTYEAR",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [],
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
		valueTypes: ["sap.ui.model.odata.type.Date", "sap.ui.model.odata.type.Date"],
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
		valueTypes: ["sap.ui.model.odata.type.Date", "sap.ui.model.odata.type.Date"],
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

