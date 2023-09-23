sap.ui.define([
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/model/Filter",
	'sap/ui/model/FilterOperator',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/date/UniversalDateUtils',
	'sap/m/DatePicker',
	'sap/m/Slider',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/OperatorOverwrite',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/ui/mdc/enums/OperatorName'
], function (FilterOperatorUtil, Operator, RangeOperator, Filter, ModelOperator, UniversalDate, UniversalDateUtils, DatePicker, Slider, BaseType, OperatorOverwrite, OperatorValueType, OperatorName) {
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
		valueTypes: [OperatorValueType.Static],
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
		valueTypes: [OperatorValueType.Static],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: ModelOperator.BT, value1: "1500-01-01", value2: "1600-01-01" });
		}
	});

	var oModernOperator = new Operator({
		name: "MODERN",
		longText: "Modern",
		tokenText: "Modern",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [OperatorValueType.Static],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: ModelOperator.BT, value1: "1600-01-01", value2: getCustomYearFormat(new Date()) });
		}
	});


	var oLastYearOperator = new Operator({
		name: "LASTYEAR",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [OperatorValueType.Static],
		getModelFilter: function (oCondition, sFieldPath) {
			var currentDate = new Date();
			return new Filter({ path: sFieldPath, operator: ModelOperator.BT, value1: getCustomYearFormat(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())), value2: getCustomYearFormat(new Date(new Date().getFullYear(), currentDate.getMonth(), currentDate.getDate())) });

		}
	});

	var oCustomRangeOperator = new Operator({
		name: "CUSTOMRANGE",
		longText: "Custom Range",
		tokenText: "Custom Range: $0-$1",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [OperatorValueType.Self, OperatorValueType.Self],
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: ModelOperator.BT, value1: oCondition.values[0], value2: oCondition.values[1] });
		}
	});

	var oNotInRangeOperator = new Operator({
		name: "NOTINRANGE",
		longText: "Not in range",
		tokenText: "Not in range: $0-$1",
		tokenParse: "^#tokenText#$",
		tokenFormat: "#tokenText#",
		valueTypes: [OperatorValueType.Self, OperatorValueType.Self],
		exclude: true,
		getModelFilter: function (oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: ModelOperator.BT, value1: oCondition.values[0], value2: oCondition.values[1] });
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
				return new Filter({ path: sFieldPath, operator: ModelOperator.EQ, value1: code });
			});

			return new Filter({ filters: aFilters, and: false });
		}
	});

	var oMyDateOperator = new Operator({
		name: "MYDATE",
		alias: {Date: "DATE", DateTime: "DATE"},
		filterOperator: ModelOperator.EQ,
		longText: "Date", // only needed for MultiValue
		tokenText: "Date", // only needed for MultiValue
		tokenParse: "^=([^=].*)$", // only needed for MultiValue
		tokenFormat: "{0}", // only needed for MultiValue
		valueTypes: [{name: "sap.ui.model.odata.type.Date"}], // use date type to have no time part
		createControl: function(oType, sPath, iIndex, sId)  { // only needed for MultiValue
			var oDatePicker = new DatePicker(sId, { // render always a DatePicker, also for DateTime
				value: {path: sPath, type: oType, mode: 'TwoWay'},
				width: "100%"
			});

			return oDatePicker;
		},
		getModelFilter: function (oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
				var oOperatorType = this._createLocalType(this.valueTypes[0]);
				var sFrom = oCondition.values[0];
				var oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
				var oDate = oOperatorModelFormat.parse(sFrom, false);
				sFrom = oType.getModelValue(oDate);
				oDate.setHours(23);
				oDate.setMinutes(59);
				oDate.setSeconds(59);
				oDate.setMilliseconds(999);
				var sTo = oType.getModelValue(oDate);
				return new Filter({path: sFieldPath, operator: ModelOperator.BT, value1: sFrom, value2: sTo});
			} else {
				return new Filter({path: sFieldPath, operator: this.filterOperator, value1: oCondition.values[0]});
			}
		}
	});

	var oMyDateRangeOperator = new Operator({
		name: "MYDATERANGE",
		alias: {Date: "DATERANGE", DateTime: "DATERANGE"},
		filterOperator: ModelOperator.BT,
		longText: "Date Range", // only needed for MultiValue
		tokenText: "Date Range", // only needed for MultiValue
		tokenParse: "^([^!].*)\\.\\.\\.(.+)$", // only needed for MultiValue
		tokenFormat: "{0}...{1}", // only needed for MultiValue
		valueTypes: [{name: "sap.ui.model.odata.type.Date"}, {name: "sap.ui.model.odata.type.Date"}], // use date type to have no time part
		createControl: function(oType, sPath, iIndex, sId)  { // only needed for MultiValue
			var oDatePicker = new DatePicker(sId, { // render always a DatePicker, also for DateTime
				value: {path: sPath, type: oType, mode: 'TwoWay'},
				width: "100%"
			});

			return oDatePicker;
		},
		getModelFilter: function (oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
				var oOperatorType = this._createLocalType(this.valueTypes[0]);
				var sFrom = oCondition.values[0];
				var oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
				var oDate = oOperatorModelFormat.parse(sFrom, false);
				sFrom = oType.getModelValue(oDate);
				oOperatorType = this._createLocalType(this.valueTypes[1]);
				oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
				var sTo = oCondition.values[1];
				oDate = oOperatorModelFormat.parse(sTo, false);
				oDate.setHours(23);
				oDate.setMinutes(59);
				oDate.setSeconds(59);
				oDate.setMilliseconds(999);
				sTo = oType.getModelValue(oDate);
				return new Filter({path: sFieldPath, operator: ModelOperator.BT, value1: sFrom, value2: sTo});
			} else {
				return new Filter({path: sFieldPath, operator: this.filterOperator, value1: oCondition.values[0], value2: oCondition.values[1]});
			}
		}
	});
	var oMyNextDays = new RangeOperator({
		name: "MYNEXTDAYS",
		valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
		paramTypes: ["(\\d+)"],
		additionalInfo: "",
		longText: "Next X days",
		tokenText: "Next {0} days",
		createControl: function(oType, sPath, iIndex, sId)  { // only needed for MultiValue
			var oSlider = new Slider(sId, { // render always a DatePicker, also for DateTime
				value: {path: sPath, type: oType, mode: 'TwoWay'},
				width: "100%"
			});

			return oSlider;
		},
		calcRange: function(iDuration) {
			return UniversalDateUtils.ranges.nextDays(iDuration);
		}
	});

	var customDateEmpty = new Operator({
		name: "CustomDateEmpty",
		longText: "Empty",
		filterOperator: ModelOperator.EQ,
		tokenParse: "^<#tokenText#>$",
		tokenFormat: "<#tokenText#>",
		valueTypes: [],
		group: {id : 0, text: "Single Dates"},
		getModelFilter: function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			var isNullable = false;
			//TODO Check if the Date type is nullable
			if (oType) {
				var vResult = oType.parseValue("", "string");
				try {
					oType.validateValue(vResult);
					isNullable = vResult === null;
				} catch (oError) {
					isNullable = false;
				}
			}

			if (isNullable) {
				return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: null });
			} else {
				throw "Cannot create a Filter for fieldPath " + sFieldPath + " and operator " + this.name;
			}
		}
	});

	var customDateNotEmpty = new Operator({
		name: "CustomDateNotEmpty",
		longText: "Not Empty",
		filterOperator: ModelOperator.NE,
		tokenParse: "^!<#tokenText#>$",
		tokenFormat: "!(<#tokenText#>)",
		valueTypes: [],
		exclude: true,
		getModelFilter: function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			var isNullable = false;
			if (oType) {
				var vResult = oType.parseValue("", "string");
				try {
					oType.validateValue(vResult);
					isNullable = vResult === null;
				} catch (oError) {
					isNullable = false;
				}
			}
			if (isNullable) {
				return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: null });
			} else {
				throw "Cannot create a Filter for fieldPath " + sFieldPath + " and operator " + this.name;
			}
		}
	});

	[customDateEmpty, customDateNotEmpty, oRenaissanceOperator, oMediEvalOperator, oModernOperator, oCustomRangeOperator, oNotInRangeOperator, oLastYearOperator, oEuropeOperator, oMyDateOperator, oMyDateRangeOperator, oMyNextDays].forEach(function (oOperator) {
		FilterOperatorUtil.addOperator(oOperator);
	});

	// FilterOperatorUtil.addOperatorForType(BaseType.Date, customDateEmpty);
	// FilterOperatorUtil.addOperatorForType(BaseType.Date, customDateNotEmpty);


	var oTodayOp = FilterOperatorUtil.getOperator(OperatorName.TODAY);
	var fOrgTodayGetModelFilter = oTodayOp.overwrite(OperatorOverwrite.getModelFilter,
		function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			var oFilter = fOrgTodayGetModelFilter(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType);
			return new Filter({path: sFieldPath, operator: ModelOperator.EQ, value1: oFilter.oValue1});
		}
	);

	var oEmptyOp = FilterOperatorUtil.getOperator(OperatorName.Empty);
	FilterOperatorUtil.addOperatorForType(BaseType.Date, oEmptyOp);
	var fOrgEmptyGetModelFilter = oEmptyOp.overwrite(OperatorOverwrite.getModelFilter,
		function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			if (sBaseType === "Date") {
				var isNullable = false;
				if (oType) {
					var vResult = oType.parseValue("", "string");
					try {
						oType.validateValue(vResult);
						isNullable = vResult === null;
					} catch (oError) {
						isNullable = false;
					}
				}
				if (isNullable) {
					return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: null });
				} else {
					throw "Cannot create a Filter for fieldPath " + sFieldPath + " and operator " + this.name;
				}
			} else {
				//TODO this will not work!!!!!
				return fOrgEmptyGetModelFilter(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType);
			}

		}.bind(oEmptyOp)
	);

	var oYesterdayOp = FilterOperatorUtil.getOperator(OperatorName.YESTERDAY);
	var fOrgYesterdayGetModelFilter = oYesterdayOp.overwrite(OperatorOverwrite.getModelFilter,
		function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			var oFilter = fOrgYesterdayGetModelFilter(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType);
			return new Filter({path: sFieldPath, operator: ModelOperator.EQ, value1: oFilter.oValue1});
		}
	);


	var oLessOp = FilterOperatorUtil.getOperator(OperatorName.LT);
	var fOrgLessOpGetLongText = oLessOp.overwrite(OperatorOverwrite.getLongText,
		function(sBaseType) {
			if (sBaseType === "Date") {
				return "My Before";
			} else {
				return fOrgLessOpGetLongText(sBaseType);
			}
		}
	);

});

