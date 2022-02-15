/*!
 * ${copyright}
*/
sap.ui.define([
	'sap/ui/model/FilterOperator',
	'sap/ui/model/Filter',
	'sap/ui/model/ValidateException',
	'sap/base/Log',
	'sap/base/util/merge',
	'sap/ui/mdc/enum/FieldDisplay',
	'./Operator',
	'./RangeOperator',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/date/UniversalDateUtils',
	'sap/ui/core/format/DateFormat',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/type/Integer'
],

function(
		ModelOperator,
		Filter,
		ValidateException,
		Log,
		merge,
		FieldDisplay,
		Operator,
		RangeOperator,
		BaseType,
		ConditionValidated,
		UniversalDate,
		UniversalDateUtils,
		DateFormat,
		JSONModel,
		Integer	// the Integer type must be  available for some of the RangeOperators
	) {
		"use strict";

		// translation utils
		var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		sap.ui.getCore().attachLocalizationChanged(function() {
			oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		});

		// shared ListFieldHelp for month operators
		var oMonthFieldHelp;



		/**
		 * Utilities to handle {@link sap.ui.mdc.condition.Operator Operators} and {@link sap.ui.mdc.condition.ConditionObject conditions}.
		 *
		 * @namespace
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.73.0
		 * @alias sap.ui.mdc.condition.FilterOperatorUtil
		 *
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 * @experimental As of version 1.73
		 */
		var FilterOperatorUtil = {

				_mOperators: {
					equal: new Operator({
						name: "EQ",
						alias: {Date: "DATE", DateTime: "DATETIME"},
						filterOperator: ModelOperator.EQ,
						tokenParse: "^=([^=].*)$",
						tokenFormat: "{1} ({0})", // all placeholder should use the {x} format - the text could be store in the resourcebundel file.
						valueTypes: [Operator.ValueType.Self, null],
						displayFormats: {
							DescriptionValue: "{1} ({0})",
							ValueDescription: "{0} ({1})",
							Description: "{1}",
							Value: "{0}"
						},
						format: function(oCondition, oType, sDisplayFormat, bHideOperator, aCompositeTypes) {
							sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
							var iCount = this.valueTypes.length;
							var aValues = oCondition.values;
							var sTokenPrefix = (oCondition && oCondition.validated === ConditionValidated.Validated) || aValues.length === 2 || bHideOperator ? "" : "=";
							var sTokenText = sTokenPrefix + this.displayFormats[sDisplayFormat];

							if (!aValues[1]) {
								sTokenText = sTokenPrefix + this.displayFormats["Value"];
								iCount = 1;
							}

							for (var i = 0; i < iCount; i++) {
								var sReplace, vValue = aValues[i];

								if (vValue === null || vValue === undefined) { // support boolean
									vValue = "";
								}

								if (i == 0) {
									// only the first value can be formatted. second value is the description string
									sReplace = this._formatValue(vValue, oType, aCompositeTypes);
								} else {
									sReplace = vValue;
								}

								if (sReplace === null) {
									sTokenText = null; // some types (like Unit) return null if no value is given, in this case stop formating and return null
									break;
								}
								sTokenText = sTokenText.replace(new RegExp("\\$" + i + "|" + i + "\\$" + "|" + "\\{" + i + "\\}", "g"), sReplace);
							}

							return sTokenText;
						},
						parse: function(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes) {
							sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
							var aResult = Operator.prototype.parse.apply(this, [sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes]);

							if (bDefaultOperator && (!aResult || aResult[0] === null || aResult[0] === undefined) && sDisplayFormat !== FieldDisplay.Value) {
								// in default case and no key determined (simple-EQ case)-> use text as key (parse again to use type)
								sDisplayFormat = FieldDisplay.Value;
								aResult = Operator.prototype.parse.apply(this, [sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes]);
							}
							if (aResult && (aResult[1] === null || aResult[1] === undefined) && sDisplayFormat === FieldDisplay.Value) {
								aResult = [aResult[0]]; // only key
							}

							return aResult;
						},
						getValues: function(sText, sDisplayFormat, bDefaultOperator) {
							var aMatch = sText.match(this.tokenParseRegExp);
							var aValues;
							if (aMatch || (bDefaultOperator && sText)) {
								var sValue;
								var sTokenText = this.displayFormats[sDisplayFormat];
								var iKeyIndex = sTokenText.indexOf("{0}");
								var iDescriptionIndex = sTokenText.indexOf("{1}");
								var sKey;
								var sDescription;

								if (aMatch) {
									sValue = aMatch[1];
								} else if (bDefaultOperator) {
									sValue = sText;
								}

								if (iKeyIndex >= 0 && iDescriptionIndex >= 0) {
									// split string
									if (sValue.lastIndexOf("(") > 0 && (sValue.lastIndexOf(")") === sValue.length - 1 || sValue.lastIndexOf(")") === -1)) {
										var iEnd = sValue.length;
										if (sValue[iEnd - 1] === ")") {
											iEnd--;
										}
										var sValue1 = sValue.substring(0, sValue.lastIndexOf("("));
										if (sValue1[sValue1.length - 1] === " ") {
											sValue1 = sValue1.substring(0, sValue1.length - 1);
										}
										var sValue2 = sValue.substring(sValue.lastIndexOf("(") + 1, iEnd);
										if (iKeyIndex < iDescriptionIndex) {
											sKey = sValue1;
											sDescription = sValue2;
										} else {
											sKey = sValue2;
											sDescription = sValue1;
										}
									} else if (iKeyIndex < iDescriptionIndex) {
										sKey = sValue;
									} else {
										sDescription = sValue;
									}
								} else if (iKeyIndex >= 0) {
									// use as key
									sKey = sValue;
								} else {
									// use as description
									sDescription = sValue;
								}

								aValues = [sKey];
								if (iDescriptionIndex >= 0) {
									aValues.push(sDescription);
								}
							}
							return aValues;
						},
						isEmpty: function(oCondition, oType) {
							var isEmpty = false;
							var v = oCondition.values[0];
							if ((v === null || v === undefined || v === "") && !oCondition.values[1]) { // empty has to use the oType information
								// if key is empty but description set, condition is not empty (empty key possible)
								isEmpty = true;
							}
							return isEmpty;
						},
						getCheckValue: function(oCondition) {
							return {value: oCondition.values[0]}; // compare only key
						},
						checkValidated: function(oCondition) {
							if (oCondition.values.length === 2 && oCondition.values[0] !== undefined && oCondition.values[1] !== null && oCondition.values[1] !== undefined) {
								// key known (even empty key) and description known
								oCondition.validated = ConditionValidated.Validated;
							} else {
								oCondition.validated = ConditionValidated.NotValidated;
							}
						},
						validateInput: true
					}),
					between: new Operator({
						name: "BT",
						alias: {Date: "DATERANGE", DateTime:"DATETIMERANGE"},
						filterOperator: ModelOperator.BT,
						tokenParse: "^([^!].*)\\.\\.\\.(.+)$", // TODO: does this work?? At least also matches crap like ".....". I guess validation of value types needs to get rid of those.
						tokenFormat: "{0}...{1}",
						valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
						validate: function(aValues, oType) {
							// in Between 2 different Values must be defined
							if (aValues.length === 2) { // if aValues has wrong length this is checked in default logic
								if (_valueIsEmpty(aValues[0]) && _valueIsEmpty(aValues[1])) {
									return; // let empty condition be valid
								} else if ((_valueIsEmpty(aValues[0]) || _valueIsEmpty(aValues[1]))) {
									throw new ValidateException(oMessageBundle.getText("operator.between.validate.missingValue")); //"Between must have two values"
								} else if (aValues[0] === aValues[1]) {
									throw new ValidateException(oMessageBundle.getText("operator.between.validate.sameValues")); //"Between must have two different values"
								}
							}
							// the comparison of values only works for some types of values. e.g. int, float, some Date types, but not for Int64.
							// we should try to bring such a compare function into the TypeUtils class
							// if (TypeUtils.compare(aValues[0], aValues[1], oType) === 1 ) {
							// if (aValues[0] > aValues[1]) {
							// 	throw new ValidateException(oMessageBundle.getText("operator.between.validate.compare")); //"Between should have a to value which is > the from value"
							// }

							Operator.prototype.validate.apply(this, [aValues, oType]);
						}
					}),
					notBetween: new Operator({
						name: "NOTBT",
						filterOperator: ModelOperator.NB,
						tokenParse: "^!(.+)\\.\\.\\.(.+)$",
						tokenFormat: "!({0}...{1})",
						valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
						exclude: true,
						validate: function(aValues, oType) {
							FilterOperatorUtil._mOperators.between.validate(aValues, oType);
						}
					}),
					lessThan: new Operator({
						name: "LT",
						filterOperator: ModelOperator.LT,
						tokenParse: "^<([^=].*)$",
						tokenFormat: "<{0}",
						valueTypes: [Operator.ValueType.Self]
					}),
					notLessThan: new Operator({
						name: "NOTLT",
						filterOperator: ModelOperator.GE,
						tokenParse: "^!<([^=].*)$",
						tokenFormat: "!(<{0})",
						valueTypes: [Operator.ValueType.Self],
						exclude: true
					}),
					greaterThan: new Operator({
						name: "GT",
						filterOperator: ModelOperator.GT,
						tokenParse: "^>([^=].*)$",
						tokenFormat: ">{0}",
						valueTypes: [Operator.ValueType.Self]
					}),
					notGreaterThan: new Operator({
						name: "NOTGT",
						filterOperator: ModelOperator.LE,
						tokenParse: "^!>([^=].*)$",
						tokenFormat: "!(>{0})",
						valueTypes: [Operator.ValueType.Self],
						exclude: true
					}),
					lessEqual: new Operator({
						name: "LE",
						alias: {Date: "TO", DateTime: "TODATETIME"},
						filterOperator: ModelOperator.LE,
						tokenParse: "^<=(.+)$",
						tokenFormat: "<={0}",
						valueTypes: [Operator.ValueType.Self]
					}),
					notLessEqual: new Operator({
						name: "NOTLE",
						filterOperator: ModelOperator.GT,
						tokenParse: "^!<=(.+)$",
						tokenFormat: "!(<={0})",
						valueTypes: [Operator.ValueType.Self],
						exclude: true
					}),
					greaterEqual: new Operator({
						name: "GE",
						alias: {Date: "FROM", DateTime: "FROMDATETIME"},
						filterOperator: ModelOperator.GE,
						tokenParse: "^>=(.+)$",
						tokenFormat: ">={0}",
						valueTypes: [Operator.ValueType.Self]
					}),
					notGreaterEqual: new Operator({
						name: "NOTGE",
						filterOperator: ModelOperator.LT,
						tokenParse: "^!>=(.+)$",
						tokenFormat: "!(>={0})",
						valueTypes: [Operator.ValueType.Self],
						exclude: true
					}),
					startsWith: new Operator({
						name: "StartsWith",
						filterOperator: ModelOperator.StartsWith,
						tokenParse: "^([^!\\*]+.*)\\*$",
						tokenFormat: "{0}*",
						valueTypes: [Operator.ValueType.SelfNoParse]
					}),
					notStartsWith: new Operator({
						name: "NotStartsWith",
						filterOperator: ModelOperator.NotStartsWith,
						tokenParse: "^!([^\\*].*)\\*$",
						tokenFormat: "!({0}*)",
						valueTypes: [Operator.ValueType.SelfNoParse],
						exclude: true
					}),
					endsWith: new Operator({
						name: "EndsWith",
						filterOperator: ModelOperator.EndsWith,
						tokenParse: "^\\*(.*[^\\*])$",
						tokenFormat: "*{0}",
						valueTypes: [Operator.ValueType.SelfNoParse]
					}),
					notEndsWith: new Operator({
						name: "NotEndsWith",
						filterOperator: ModelOperator.NotEndsWith,
						tokenParse: "^!\\*(.*[^\\*])$",
						tokenFormat: "!(*{0})",
						valueTypes: [Operator.ValueType.SelfNoParse],
						exclude: true
					}),
					contains: new Operator({
						name: "Contains",
						filterOperator: ModelOperator.Contains,
						tokenParse: "^\\*(.*)\\*$",
						tokenFormat: "*{0}*",
						valueTypes: [Operator.ValueType.SelfNoParse]
					}),
					notContains: new Operator({
						name: "NotContains",
						filterOperator: ModelOperator.NotContains,
						tokenParse: "^!\\*(.*)\\*$",
						tokenFormat: "!(*{0}*)",
						valueTypes: [Operator.ValueType.SelfNoParse],
						exclude: true
					}),
					notEqual: new Operator({
						name: "NE",
						filterOperator: ModelOperator.NE,
						tokenParse: "^!=(.+)$",
						tokenFormat: "!(={0})",
						valueTypes: [Operator.ValueType.Self],
						exclude: true
					}),
					empty: new Operator({
						name: "Empty",
						filterOperator: ModelOperator.EQ,
						tokenParse: "^<#tokenText#>$",
						tokenFormat: "<#tokenText#>",
						valueTypes: [],
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
							//TODO Type specific handling of empty is missing. Empty is currently only available for type String
							// if (oType == "date") {
							// 	return new Filter(sFieldPath, oOperator.filterOperator, null});
							// } else {
							if (isNullable) {
								return new Filter({ filters: [new Filter({path: sFieldPath, operator: ModelOperator.EQ, value1: ""}),
															new Filter({path: sFieldPath, operator: ModelOperator.EQ, value1: null})],
													and: false});
							} else {
								return new Filter({path: sFieldPath, operator: this.filterOperator, value1: ""});
							}
							// }
						}
					}),
					notEmpty: new Operator({
						name: "NotEmpty",
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
							//TODO Type specific handling of empty is missing. Empty is currently only available for type String
							// if (Type == "date") {
							// 	return new Filter({ path: sFieldPath, operator: oOperator.filterOperator, value1: null });
							// } else {
							if (isNullable) {
								return new Filter({ filters: [new Filter({path: sFieldPath, operator: ModelOperator.NE, value1: ""}),
															new Filter({path: sFieldPath, operator: ModelOperator.NE, value1: null})],
													and: true});
							} else {
								return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: "" });
							}
							// }
						}
					}),
					yesterday: new RangeOperator({
						name: "YESTERDAY",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.yesterday();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					today: new RangeOperator({
						name: "TODAY",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							//TODO how to convert the UniversalDate back into an odata.type.Date value (or the correct type )?
							// we need the oType instance in this function
							return UniversalDateUtils.ranges.today();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					tomorrow: new RangeOperator({
						name: "TOMORROW",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.tomorrow();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					lastDays: new RangeOperator({
						name: "LASTDAYS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastDays(iDuration);
						}
					}),
					firstDayWeek: new RangeOperator({
						name: "FIRSTDAYWEEK",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfWeek();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					lastDayWeek: new RangeOperator({
						name: "LASTDAYWEEK",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfWeek();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					firstDayMonth: new RangeOperator({
						name: "FIRSTDAYMONTH",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfMonth();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					lastDayMonth: new RangeOperator({
						name: "LASTDAYMONTH",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfMonth();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					firstDayQuarter: new RangeOperator({
						name: "FIRSTDAYQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfQuarter();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					lastDayQuarter: new RangeOperator({
						name: "LASTDAYQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfQuarter();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					firstDayYear: new RangeOperator({
						name: "FIRSTDAYYEAR",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfYear();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					lastDayYear: new RangeOperator({
						name: "LASTDAYYEAR",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfYear();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					todayFromTo: new RangeOperator({
						name: "TODAYFROMTO",
						valueTypes: [
							{name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }},
							{name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }}
						],
						paramTypes: ["([-+]?\\d+)", "([-+]?\\d+)"],
						//label:["x", "y"],
						additionalInfo: "",
						calcRange: function (xDays, yDays) {
							var oStart = xDays >= 0 ?  UniversalDateUtils.ranges.lastDays(xDays)[0] : UniversalDateUtils.ranges.nextDays(-xDays)[1];
							var oEnd = yDays >= 0 ? UniversalDateUtils.ranges.nextDays(yDays)[1] : UniversalDateUtils.ranges.lastDays(-yDays)[0];

							if (oStart.oDate.getTime() > oEnd.oDate.getTime()) {
								oEnd = [oStart, oStart = oEnd][0];
							}

							return [UniversalDateUtils.resetStartTime(oStart), UniversalDateUtils.resetEndTime(oEnd)];
						}
					}),
					nextDays: new RangeOperator({
						name: "NEXTDAYS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextDays(iDuration);
						}
					}),
					lastWeek: new RangeOperator({
						name: "LASTWEEK",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastWeek();
						}
					}),
					thisWeek: new RangeOperator({
						name: "THISWEEK",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentWeek();
						}
					}),
					nextWeek: new RangeOperator({
						name: "NEXTWEEK",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextWeek();
						}
					}),
					lastWeeks: new RangeOperator({
						name: "LASTWEEKS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastWeeks(iDuration);
						}
					}),
					nextWeeks: new RangeOperator({
						name: "NEXTWEEKS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextWeeks(iDuration);
						}
					}),
					lastMonth: new RangeOperator({
						name: "LASTMONTH",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastMonth();
						}
					}),
					thisMonth: new RangeOperator({
						name: "THISMONTH",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentMonth();
						}
					}),
					nextMonth: new RangeOperator({
						name: "NEXTMONTH",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextMonth();
						}
					}),
					lastMonths: new RangeOperator({
						name: "LASTMONTHS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastMonths(iDuration);
						}
					}),
					nextMonths: new RangeOperator({
						name: "NEXTMONTHS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextMonths(iDuration);
						}
					}),
					lastQuarter: new RangeOperator({
						name: "LASTQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastQuarter();
						}
					}),
					thisQuarter: new RangeOperator({
						name: "THISQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentQuarter();
						}
					}),
					nextQuarter: new RangeOperator({
						name: "NEXTQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextQuarter();
						}
					}),
					lastQuarters: new RangeOperator({
						name: "LASTQUARTERS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastQuarters(iDuration);
						}
					}),
					nextQuarters: new RangeOperator({
						name: "NEXTQUARTERS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextQuarters(iDuration);
						}
					}),
					quarter1: new RangeOperator({
						name: "QUARTER1",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(1);
						}
					}),
					quarter2: new RangeOperator({
						name: "QUARTER2",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(2);
						}
					}),
					quarter3: new RangeOperator({
						name: "QUARTER3",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(3);
						}
					}),
					quarter4: new RangeOperator({
						name: "QUARTER4",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(4);
						}
					}),
					lastYear: new RangeOperator({
						name: "LASTYEAR",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastYear();
						}
					}),
					thisYear: new RangeOperator({
						name: "THISYEAR",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentYear();
						}
					}),
					nextYear: new RangeOperator({
						name: "NEXTYEAR",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextYear();
						}
					}),
					lastYears: new RangeOperator({
						name: "LASTYEARS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastYears(iDuration);
						}
					}),
					nextYears: new RangeOperator({
						name: "NEXTYEARS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextYears(iDuration);
						}
					}),
					specificMonth: new RangeOperator({
						name: "SPECIFICMONTH",
						valueTypes: [{ name: "sap.ui.model.type.Integer", constraints: { minimum: 0, maximum: 11 }}],
						paramTypes: ["(.+)"],
						additionalInfo: "",
						label: [oMessageBundle.getText("operators.SPECIFICMONTH_MONTH.label")],
						defaultValues: function() {
							var oDate = new UniversalDate();
							return [
								oDate.getMonth()
							];
						},
						calcRange: function(iDuration) {
							var oDate = new UniversalDate();
							oDate.setMonth(iDuration);
							oDate = UniversalDateUtils.getMonthStartDate(oDate);
							return UniversalDateUtils.getRange(0, "MONTH", oDate);
						},
						format: function(oCondition, oType, sDisplayFormat, bHideOperator, aCompositeTypes) {
							var iValue = oCondition.values[0];
							var sTokenText = this.tokenFormat;
							var sReplace = _getMonths.apply(this)[iValue];

							if (bHideOperator) {
								return sReplace;
							} else {
								return sReplace == null ? null : sTokenText.replace(new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g"), sReplace);
							}
						},
						getValues: function(sText, sDisplayFormat, bDefaultOperator) {
							var aMatch = sText.match(this.tokenParseRegExp);
							var aValues;
							if (aMatch || (bDefaultOperator && sText)) {
								aValues = [];
								for (var i = 0; i < this.valueTypes.length; i++) {
									var sValue;
									if (aMatch) {
										sValue = aMatch[i + 1];
									} else if ((bDefaultOperator && sText)) { // only month provided
										sValue = sText;
									}
									aValues.push(sValue);
								}
								return [_getIndexOfMonth.call(this, aValues[0])];
							}

							return null;
						},
						createControl: function(oType, sPath, iIndex, sId, aClass)  {
							var Field = sap.ui.require("sap/ui/mdc/Field");
							if (Field && _getMonthFieldHelp.call(this)) {

								var oField = new Field(sId, {
									value: { path: sPath, type: oType, mode: 'TwoWay', targetType: 'raw' },
									additionalValue: { path: sPath, formatter: function(iValue) { return oMonthFieldHelp.getTextForKey(iValue); }, mode: 'OneWay' },
									display: 'Description',
									width: "100%",
									fieldHelp: "LFHForSpecificMonth"
								});

								return oField;
							} else {
								Log.warning("Operator.createControl", "not able to create the control for the operator " + this.name);
								return null;
							}
						}
					}),
					specificMonthInYear: new RangeOperator({
						name: "SPECIFICMONTHINYEAR",
						valueTypes: [{ name: "sap.ui.model.type.Integer", constraints: { minimum: 0, maximum: 11 }},
									{ name: "sap.ui.model.type.Integer", constraints: { minimum: 1, maximum: 9999 }}],
						paramTypes: ["(.+)", "(.+)"],
						additionalInfo: "",
						label: [oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_MONTH.label"), oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_YEAR.label")],
						defaultValues: function() {
							var oDate = new UniversalDate();
							return [
								oDate.getMonth(),
								oDate.getFullYear()
							];
						},
						calcRange: function(iMonth, iYear) {
							var oDate = new UniversalDate();
							oDate.setMonth(iMonth);
							oDate.setYear(iYear);
							oDate = UniversalDateUtils.getMonthStartDate(oDate);
							return UniversalDateUtils.getRange(0, "MONTH", oDate);
						},
						format: function(oCondition, oType, sDisplayFormat, bHideOperator, aCompositeTypes) {
							var iValue = oCondition.values[0];
							var iYear = oCondition.values[1];
							var sTokenText = this.tokenFormat;
							var sReplace = _getMonths.apply(this)[iValue];

							if (bHideOperator) {
								return sReplace + "," + iYear;
							} else {
								var replaceRegExp0 = new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g");
								var replaceRegExp1 = new RegExp("\\$" + 1 + "|" + 1 + "\\$" + "|" + "\\{" + 1 + "\\}", "g");
								sTokenText = sReplace == null ? null : sTokenText.replace(replaceRegExp0, sReplace);
								return sTokenText.replace(replaceRegExp1, iYear);
							}
						},
						getValues: function(sText, sDisplayFormat, bDefaultOperator) {
							var aMatch = sText.match(this.tokenParseRegExp);
							var aValues;
							if (aMatch || (bDefaultOperator && sText)) {
								aValues = [];
								for (var i = 0; i < this.valueTypes.length; i++) {
									var sValue;
									if (aMatch) {
										sValue = aMatch[i + 1];
									} else if ((bDefaultOperator && sText)) { // only month provided
										sValue = sText;
									}
									aValues.push(sValue);
								}
								return [_getIndexOfMonth.call(this, aValues[0]), aValues[1]];
							}

							return null;
						},
						createControl: function(oType, sPath, iIndex, sId, aClass)  {
							var oField;
							var Field = sap.ui.require("sap/ui/mdc/Field");
							if (!Field) {
								Log.warning("Operator.createControl", "not able to create the control for the operator " + this.name);
								return null;
							}

							if (iIndex == 0) {
								if (_getMonthFieldHelp.call(this)) {

									oField = new Field(sId, {
										value: { path: sPath, type: oType, mode: 'TwoWay', targetType: 'raw' },
										additionalValue: { path: sPath, formatter: function(iValue) { return oMonthFieldHelp.getTextForKey(iValue); }, mode: 'OneWay' },
										display: 'Description',
										width: "100%",
										fieldHelp: "LFHForSpecificMonth"
									});
								} else {
									Log.warning("Operator.createControl", "not able to create the control for the operator " + this.name);
								}
							}

							if (iIndex == 1) {
								oField = new Field(sId, {
									value: { path: "$this>", type: oType, mode: 'TwoWay', targetType: 'raw' },
									width: "100%"
								});
							}

							return oField;
						}
					}),
					yearToDate: new RangeOperator({
						name: "YEARTODATE",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.yearToDate();
						}
					}),
					dateToYear: new RangeOperator({
						name: "DATETOYEAR",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.dateToYear();
						}
					})
				},

				_mDefaultOpsForType: {}, // defines default operators for types

				/**
				 * Adds an operator to the list of known operators.
				 *
				 * @param {sap.ui.mdc.condition.Operator} oOperator Operator
				 *
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				addOperator: function(oOperator) {

					FilterOperatorUtil._mOperators[oOperator.name] = oOperator; // TODO: use semantic name?

				},

				/**
				 * Adds an array of operators to the list of known operators.
				 *
				 * @param {sap.ui.mdc.condition.Operator[]} aOperators Array of operators
				 *
				 * @since: 1.88.0
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				addOperators: function(aOperators) {
					if (!Array.isArray(aOperators)) {
						aOperators = [aOperators];
					}

					aOperators.forEach(function(oOperator) {
						FilterOperatorUtil.addOperator(oOperator);
					});
				},

				/**
				 * Removes all given operators from the list of known operators.
				 *
				 * @param {sap.ui.mdc.condition.Operator[]} aOperators Array of operators
				 *
 				 * <b>Note</b>: <code>aOperators</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator}, the instance itself, or multiple operators inside an array.
				 *
				 * @since: 1.88.0
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				removeOperators: function(aOperators) {
					if (!Array.isArray(aOperators)) {
						aOperators = [aOperators];
					}

					aOperators.forEach(function(oOperator) {
						FilterOperatorUtil.removeOperator(oOperator);
					});
				},

				/**
				 * Removes an operator from the list of known operators.
				 *
				 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
				 *
				 * @since: 1.88.0
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				 removeOperator: function(vOperator) {
					if (typeof vOperator  === "string") {
						delete FilterOperatorUtil._mOperators[vOperator];
					} else {
						delete FilterOperatorUtil._mOperators[vOperator.name];
					}

					// check if the removed Operator is still used and remove it
					// ["String", "Date", ....].forEach(function(sType) {
					// 	FilterOperatorUtil.removeOperatorForType(sType, oOperator);
					// });
				},

				/**
				 * Adds operators to the list of valid operators for a type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator[]} aOperators Operators
				 * @param {sap.ui.mdc.condition.Operator|string} vDefaultOperator The default operator instance or default operator name
				 *
 				 * <b>Note</b>: <code>aOperators</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator}, the instance itself, or multiple operators inside an array.
 				 * <b>Note</b>: <code>vDefaultOperator</code> must exist as a valid operator for the type.
				 *
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				setOperatorsForType: function(sType, aOperators, vDefaultOperator) {
					if (!Array.isArray(aOperators)) {
						aOperators = [aOperators];
					}

					if (!FilterOperatorUtil._mDefaultOpsForType[sType]) {
						FilterOperatorUtil._mDefaultOpsForType[sType] = { };
					}
					FilterOperatorUtil._mDefaultOpsForType[sType].operators = [];

					aOperators.forEach(function(oOperator) {
						FilterOperatorUtil.addOperatorForType(sType, oOperator);
					});

					if (vDefaultOperator) {
						FilterOperatorUtil.setDefaultOperatorForType(sType, vDefaultOperator);
					}

				},

				/**
				 * Sets the default operator for the list of operators for a type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vDefaultOperator The default operator instance or default operator name
				 *
 				 * <b>Note</b>: <code>vDefaultOperator</code> must exist as a valid operator for the type.
				 *
				 * @since: 1.88.0
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				setDefaultOperatorForType: function(sType, vDefaultOperator) {
					if (!FilterOperatorUtil._mDefaultOpsForType[sType]) {
						FilterOperatorUtil._mDefaultOpsForType[sType] = { };
					}

					if (typeof vDefaultOperator  === "string") {
						vDefaultOperator = FilterOperatorUtil.getOperator(vDefaultOperator);
					}

					FilterOperatorUtil._mDefaultOpsForType[sType].defaultOperator = vDefaultOperator;

				},

				/**
				 * Adds an operator to the list of valid operators for a type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
				 *
				 * @since: 1.88.0
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				addOperatorForType: function(sType, vOperator) {
					FilterOperatorUtil.insertOperatorForType(sType, vOperator);
				},

				/**
				 * Inserts an operator into the list of valid operators for a type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
				 * @param {int} idx Index of the operator in the list of operators for this type
				 *
				 * @since: 1.88.0
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				insertOperatorForType: function(sType, vOperator, idx) {
					if (!FilterOperatorUtil._mDefaultOpsForType[sType]) {
						FilterOperatorUtil._mDefaultOpsForType[sType] = { operators : [] };
					}

					idx = idx === undefined ? FilterOperatorUtil._mDefaultOpsForType[sType].operators.length : idx;
					if (typeof vOperator  === "string") {
						vOperator = FilterOperatorUtil.getOperator(vOperator);
					}
					FilterOperatorUtil._mDefaultOpsForType[sType].operators.splice(idx, 0, vOperator);
				},

				/**
				 * Removes an operator from the list of valid operators for a type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
				 *
				 * @since: 1.88.0
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				removeOperatorForType: function(sType, vOperator) {
					var sName;
					if (typeof vOperator  === "string") {
						sName = vOperator;
					} else {
						sName = vOperator.name;
					}
					for (var i = 0; i < FilterOperatorUtil._mDefaultOpsForType[sType].operators.length; i++) {
						if (FilterOperatorUtil._mDefaultOpsForType[sType].operators[i].name === sName) {
							FilterOperatorUtil._mDefaultOpsForType[sType].operators.splice(i, 1);
							return;
						}
					}
				},

				/**
				 * Returns all available default operators for the given type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @returns {string[]} an array with the supported filter operator names
				 *
				 * @private
				 * @ui5-restricted ap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				getOperatorsForType: function(sType) {

					var aOperators = [];

					for (var i = 0; i < FilterOperatorUtil._mDefaultOpsForType[sType].operators.length; i++) {
						aOperators.push(FilterOperatorUtil._mDefaultOpsForType[sType].operators[i].name);

					}

					return aOperators;

				},

				/**
				 * Returns the default operator for the given basic type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @returns {sap.ui.mdc.condition.Operator} the default operator for the given type
				 *
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				getDefaultOperator: function(sType) {

					return FilterOperatorUtil._mDefaultOpsForType[sType].defaultOperator || FilterOperatorUtil._mOperators.equal;

				},

				/**
				 * Returns the possible operators for the given value from the given array of operators.
				 *
				 * <b>Note</b> The value must be valid for the current type as this function only checks the operator against values.
				 * No type check is performed.
				 *
				 * @param {string[]} aOperators List of all supported operator names
				 * @param {string} [sValue] Value entered (including operator)
				 * @returns {sap.ui.mdc.condition.Operator[]} the operator objects suitable for the given input string, depending on the given type
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				getMatchingOperators: function(aOperators, sValue) {

					var aMyOperators = [];

					for (var i = 0; i < aOperators.length; i++) {
						var oOperator = this.getOperator(aOperators[i]);
						if (oOperator) {
							aMyOperators.push(oOperator);
						}
					}

					return _getMatchingOperators.call(this, aMyOperators, sValue);

				},

				/**
				 * Returns the operator object for the given operator name.
				 * @param {string} sOperator Name of the operator
				 * @returns {sap.ui.mdc.condition.Operator} the operator object, or undefined if the operator with the requested name does not exist
				 *
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				getOperator: function(sOperator) {

					for (var sName in FilterOperatorUtil._mOperators) {
						var oOperator = FilterOperatorUtil._mOperators[sName];
						if (oOperator.name === sOperator) {
							return oOperator;
						}
					}

					return undefined;

				},

				/**
				 * Returns the "equal to" (EQ) operator object.
				 *
				 * If an array of operators is given, and an EQ-like operator exists there, this is returned.
				 * Otherwise the EQ operator is returned.
				 *
				 * This is required for {@link sap.ui.mdc.Field Field}.
				 * @param {string[]} [aOperators] Array with the supported filter operators
				 * @returns {sap.ui.mdc.condition.Operator} Operator object
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.Field, sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType, sap.ui.mdc.field.FieldHelpBase
				 */
				getEQOperator: function(aOperators) {

					if (aOperators) {
						for (var i = 0; i < aOperators.length; i++) {
							var oOperator = this.getOperator(aOperators[i]);
							if (oOperator && oOperator.validateInput && !oOperator.exclude && oOperator.valueTypes[0] && oOperator.valueTypes[0] !== Operator.ValueType.Static) {
								return oOperator;
							}
						}
					}

					return FilterOperatorUtil._mOperators.equal;

				},

				/**
				 * Checks if only EQ is supported. ({@link sap.ui.mdc.Field Field} case)
				 *
				 * @param {string[]} aOperators Array with the supported filter operators
				 * @returns {boolean} true if only EQ is supported
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.FieldValueHelp, sap.ui.mdc.field.ConditionType
				 */
				onlyEQ: function(aOperators) {

					if (aOperators.length === 1 && aOperators[0] === "EQ") {
						return true;
					} else {
						return false;
					}

				},

				/**
				 * Checks if conditions are empty.
				 *
				 * Modifies the <code>isEmpty</code> parameter of the conditions.
				 *
				 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Conditions
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				checkConditionsEmpty: function(aConditions) {

					if (!Array.isArray(aConditions)) {
						aConditions = [aConditions];
					}

					aConditions.forEach(function(oCondition) {
						var oOperator = this.getOperator(oCondition.operator);
						if (oOperator) {
							oCondition.isEmpty = oOperator.isEmpty(oCondition);
						}
					}.bind(this));

				},

				/**
				 * Updates the value range to have the correct number of entries for an array of conditions
				 *
				 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Conditions
				 * @since: 1.75.0
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				updateConditionsValues: function(aConditions) {

					if (!Array.isArray(aConditions)) {
						aConditions = [aConditions];
					}

					for (var i = 0; i < aConditions.length; i++) {
						this.updateConditionValues(aConditions[i]);
					}

				},

				/**
				 * Updates the value range to have the right number of entries for one condition.
				 *
				 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
				 * @since: 1.75.0
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				updateConditionValues: function(oCondition) {

					var oOperator = this.getOperator(oCondition.operator);

					//update the values array length (Validated conditions are seen as OK)
					if (oOperator && oCondition.validated !== ConditionValidated.Validated) {
						var iValueTypesLength = oOperator.valueTypes.length;

						if (oOperator.valueTypes.length === 2 && oOperator.valueTypes[1] === null
								&& (oCondition.values.length < 2 || oCondition.values[1] === null || oCondition.values[1] === undefined)) {
							// IN EQ case (description) is used -> remove description part if empty -> ignore 2nd entry
							iValueTypesLength = iValueTypesLength - 1;
						}

						if (oOperator.valueTypes[0] === "static") {
							oCondition.values = []; // static operators have no values
						} else {
							while (oCondition.values.length != iValueTypesLength) {
								if (oCondition.values.length < iValueTypesLength) {
									oCondition.values.push(null);
								}
								if (oCondition.values.length > iValueTypesLength) {
									oCondition.values = oCondition.values.slice(0, oCondition.values.length - 1);
								}
							}
						}
					}

				},

				/**
				 * Returns the index of a condition in an array of conditions.
				 *
				 * For EQ conditions, only the key part of the values is compared as the text part
				 * might be different (if the translation is missing, for example).
				 *
				 * <b>Note:</b> If two or more identical conditions are in the array, the index is the first one is used.
				 *
				 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition to check
				 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Array of conditions
				 * @returns {int} Index of the condition, -1 if not found
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since: 1.76.0
				 */
				indexOfCondition: function(oCondition, aConditions) {

					var iIndex = -1;

					// compare operator and value. in EQ case, compare only key
					for (var i = 0; i < aConditions.length; i++) {
						if (this.compareConditions(oCondition, aConditions[i])) {
							iIndex = i;
							break;
						}
					}

					return iIndex;

				},

				/**
				 * Compares two conditions.
				 *
				 * For EQ conditions, only the key part of the values is compared as the text part
				 * might be different (if the translation is missing, for example).
				 *
				 * @param {sap.ui.mdc.condition.ConditionObject} oCondition1 Condition to check
				 * @param {sap.ui.mdc.condition.ConditionObject} oCondition2 Condition to check
				 * @returns {boolean} <code>true</code> if conditions are equal
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since: 1.76.0
				 */
				compareConditions: function(oCondition1, oCondition2) {

					var bEqual = false;

					// compare operator and value. in EQ case, compare only key
					if (oCondition1.operator === oCondition2.operator) {
						var oOperator = this.getOperator(oCondition1.operator);
						if (oOperator) {
							bEqual = oOperator.compareConditions(oCondition1, oCondition2);
						}
					}

					return bEqual;

				},

				/**
				 * Compares two arrays of conditions
				 *
				 * For EQ conditions only the key part of the values is compared as the text part
				 * might be different (translation missing...)
				 *
				 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions1 Conditions to check
				 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions2 Conditions to check
				 * @returns {boolean} <code>true</code> if conditions are equal
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since: 1.76.0
				 */
				compareConditionsArray: function(aConditions1, aConditions2) {

					var bEqual = false;

					if (aConditions1.length === aConditions2.length) {
						bEqual = true;
						for (var i = 0; i < aConditions1.length; i++) {
							if (!this.compareConditions(aConditions1[i], aConditions2[i])) {
								bEqual = false;
								break;
							}
						}
					}

					return bEqual;
				},

				/**
				 * Checks if a condition is validated and sets the <code>validated</code> property.
				 *
				 * For EQ set <code>validated</code> flag if a description is given.
				 *
				 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition to check
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since: 1.78.0
				 */
				checkConditionValidated: function(oCondition) {

					var oOperator = this.getOperator(oCondition.operator);
					if (!oCondition.validated && oOperator && oOperator.checkValidated) {
						// only check if not already validated, keep already validated conditions validated (description might be missing before loaded)
						oOperator.checkValidated(oCondition);
					}

				},

				/**
				 * Returns the operator object for the given <code>DynamicDateOption</code> name.
				 * @param {string} sOption Name of the operator
				 * @param {sap.ui.mdc.enum.BaseType} [sBaseType] Basic type
				 * @returns {sap.ui.mdc.condition.Operator} the operator object, or undefined if the operator with the requested name does not exist
				 *
				 * @protected
				 * @since: 1.100.0
				 */
				 getOperatorForDynamicDateOption: function(sOption, sBaseType) {

					var oOperator;

					// determine operator name if used as custom DynamicDateOption created in DateContent using getCustomDynamicDateOptionForOperator
					if (sBaseType && sOption.startsWith(sBaseType)) {
						oOperator = this.getOperator(sOption.slice(sBaseType.length + 1));
					} else {
						oOperator = this.getOperator(sOption);
					}

					if (!oOperator && sBaseType) {
						for (var sName in FilterOperatorUtil._mOperators) {
							var oCheckOperator = FilterOperatorUtil._mOperators[sName];
							if (oCheckOperator.alias && oCheckOperator.alias[sBaseType] === sOption) {
								oOperator = oCheckOperator;
								break;
							}
						}
					}

					return oOperator;

				},

				/**
				 * Determines the corresponding <code>DynamicDateOption</code> for an <code>Operator</code>
				 * from a map of known keys
				 *
				 * @param {sap.ui.mdc.condition.Operator} oOperator Condition to check
				 * @param {object} oDynamicDateRangeKeys Keys for <code>DynamicDateOption</code>
				 * @param {sap.ui.mdc.enum.BaseType} sBaseType Basic type
				 * @returns {string} <code>DynamicDateOption</code>
				 * @protected
				 * @since: 1.100.0
				 */
				 getDynamicDateOptionForOperator: function(oOperator, oDynamicDateRangeKeys, sBaseType) {

					var sOption;
					if (oOperator) {
						if (oDynamicDateRangeKeys[oOperator.name]) {
							sOption = oOperator.name;
						} else if (oOperator.alias && oDynamicDateRangeKeys[oOperator.alias[sBaseType]]) {
							sOption = oOperator.alias[sBaseType];
						}
					}

					return sOption;

				},

				/**
				 * Determines the corresponding custom <code>DynamicDateOption</code> for an <code>Operator</code>
				 *
				 * @param {sap.ui.mdc.condition.Operator} oOperator Condition to check
				 * @param {sap.ui.mdc.enum.BaseType} sBaseType Basic type
				 * @returns {string} <code>DynamicDateOption</code>
				 * @protected
				 * @since: 1.100.0
				 */
				 getCustomDynamicDateOptionForOperator: function(oOperator, sBaseType) {

					return sBaseType + "-" + oOperator.name;

				}
		};

		FilterOperatorUtil.setOperatorsForType(
				BaseType.String,
				[
				 FilterOperatorUtil._mOperators.contains,
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.startsWith,
				 FilterOperatorUtil._mOperators.endsWith,
				 FilterOperatorUtil._mOperators.lessThan,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.greaterThan,
				 FilterOperatorUtil._mOperators.greaterEqual,
				 FilterOperatorUtil._mOperators.empty,

				 FilterOperatorUtil._mOperators.notContains,
				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notStartsWith,
				 FilterOperatorUtil._mOperators.notEndsWith,
				 FilterOperatorUtil._mOperators.notLessThan,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,
				 FilterOperatorUtil._mOperators.notEmpty
				],
				FilterOperatorUtil._mOperators.equal
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.Date,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessThan,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.greaterThan,
				 FilterOperatorUtil._mOperators.greaterEqual,
				//  FilterOperatorUtil._mOperators.empty,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessThan,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,
				//  FilterOperatorUtil._mOperators.notEmpty,

				 FilterOperatorUtil._mOperators.today,
				 FilterOperatorUtil._mOperators.yesterday,
				 FilterOperatorUtil._mOperators.tomorrow,
				 FilterOperatorUtil._mOperators.firstDayWeek,
				 FilterOperatorUtil._mOperators.lastDayWeek,
				 FilterOperatorUtil._mOperators.firstDayMonth,
				 FilterOperatorUtil._mOperators.lastDayMonth,
				 FilterOperatorUtil._mOperators.firstDayQuarter,
				 FilterOperatorUtil._mOperators.lastDayQuarter,
				 FilterOperatorUtil._mOperators.firstDayYear,
				 FilterOperatorUtil._mOperators.lastDayYear,
				 FilterOperatorUtil._mOperators.todayFromTo,
				 FilterOperatorUtil._mOperators.lastDays,
				 FilterOperatorUtil._mOperators.nextDays,

				 FilterOperatorUtil._mOperators.thisWeek,
				 FilterOperatorUtil._mOperators.lastWeek,
				 FilterOperatorUtil._mOperators.lastWeeks,
				 FilterOperatorUtil._mOperators.nextWeek,
				 FilterOperatorUtil._mOperators.nextWeeks,

				 FilterOperatorUtil._mOperators.specificMonth,
				 FilterOperatorUtil._mOperators.specificMonthInYear,
				 FilterOperatorUtil._mOperators.thisMonth,
				 FilterOperatorUtil._mOperators.lastMonth,
				 FilterOperatorUtil._mOperators.lastMonths,
				 FilterOperatorUtil._mOperators.nextMonth,
				 FilterOperatorUtil._mOperators.nextMonths,

				 FilterOperatorUtil._mOperators.thisQuarter,
				 FilterOperatorUtil._mOperators.lastQuarter,
				 FilterOperatorUtil._mOperators.lastQuarters,
				 FilterOperatorUtil._mOperators.nextQuarter,
				 FilterOperatorUtil._mOperators.nextQuarters,

				 FilterOperatorUtil._mOperators.quarter1,
				 FilterOperatorUtil._mOperators.quarter2,
				 FilterOperatorUtil._mOperators.quarter3,
				 FilterOperatorUtil._mOperators.quarter4,

				 FilterOperatorUtil._mOperators.thisYear,
				 FilterOperatorUtil._mOperators.lastYear,
				 FilterOperatorUtil._mOperators.lastYears,
				 FilterOperatorUtil._mOperators.nextYear,
				 FilterOperatorUtil._mOperators.nextYears,

				 FilterOperatorUtil._mOperators.yearToDate,
				 FilterOperatorUtil._mOperators.dateToYear
				]
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.DateTime,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessThan,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.greaterThan,
				 FilterOperatorUtil._mOperators.greaterEqual,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessThan,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,

				 FilterOperatorUtil._mOperators.today,
				 FilterOperatorUtil._mOperators.yesterday,
				 FilterOperatorUtil._mOperators.tomorrow,
				 FilterOperatorUtil._mOperators.firstDayWeek,
				 FilterOperatorUtil._mOperators.lastDayWeek,
				 FilterOperatorUtil._mOperators.firstDayMonth,
				 FilterOperatorUtil._mOperators.lastDayMonth,
				 FilterOperatorUtil._mOperators.firstDayQuarter,
				 FilterOperatorUtil._mOperators.lastDayQuarter,
				 FilterOperatorUtil._mOperators.firstDayYear,
				 FilterOperatorUtil._mOperators.lastDayYear,
				 FilterOperatorUtil._mOperators.todayFromTo,
				 FilterOperatorUtil._mOperators.lastDays,
				 FilterOperatorUtil._mOperators.nextDays,

				 FilterOperatorUtil._mOperators.thisWeek,
				 FilterOperatorUtil._mOperators.lastWeek,
				 FilterOperatorUtil._mOperators.lastWeeks,
				 FilterOperatorUtil._mOperators.nextWeek,
				 FilterOperatorUtil._mOperators.nextWeeks,

				 FilterOperatorUtil._mOperators.specificMonth,
				 FilterOperatorUtil._mOperators.specificMonthInYear,
				 FilterOperatorUtil._mOperators.thisMonth,
				 FilterOperatorUtil._mOperators.lastMonth,
				 FilterOperatorUtil._mOperators.lastMonths,
				 FilterOperatorUtil._mOperators.nextMonth,
				 FilterOperatorUtil._mOperators.nextMonths,

				 FilterOperatorUtil._mOperators.thisQuarter,
				 FilterOperatorUtil._mOperators.lastQuarter,
				 FilterOperatorUtil._mOperators.lastQuarters,
				 FilterOperatorUtil._mOperators.nextQuarter,
				 FilterOperatorUtil._mOperators.nextQuarters,

				 FilterOperatorUtil._mOperators.quarter1,
				 FilterOperatorUtil._mOperators.quarter2,
				 FilterOperatorUtil._mOperators.quarter3,
				 FilterOperatorUtil._mOperators.quarter4,

				 FilterOperatorUtil._mOperators.thisYear,
				 FilterOperatorUtil._mOperators.lastYear,
				 FilterOperatorUtil._mOperators.lastYears,
				 FilterOperatorUtil._mOperators.nextYear,
				 FilterOperatorUtil._mOperators.nextYears,

				 FilterOperatorUtil._mOperators.yearToDate,
				 FilterOperatorUtil._mOperators.dateToYear
				]
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.Numeric,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessThan,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.greaterThan,
				 FilterOperatorUtil._mOperators.greaterEqual,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessThan,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual
				]
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.Time,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessThan,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.greaterThan,
				 FilterOperatorUtil._mOperators.greaterEqual,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessThan,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual
				]
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.Boolean,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.notEqual
				]
		);

		/**
		 * Returns those of the given operators which match the given value.
		 *
		 * <b>Note</b> The value must be valid for the current type as this function only checks the operator against values.
		 * No type check is performed.
		 *
		 * @param {sap.ui.mdc.condition.Operator[]} aOperators Operators which are checked for matching
		 * @param {string} sValue Value used to check for the operators
		 * @returns {sap.ui.mdc.condition.Operator[]} the operator objects suitable for the given input string
		 *
		 * @private
		 */
		function _getMatchingOperators(aOperators, sValue) {
			// TODO: sType will be needed for checking the value content:   "=5" matches the EQ operator, but should only match when type is e.g. number, not for e.g. boolean
			var aResult = [];

			for (var i = 0; i < aOperators.length; i++) {
				var oOperator = aOperators[i];
				if (oOperator && oOperator.test && oOperator.test(sValue)) {
					aResult.push(oOperator);
				}
			}

			return aResult;

		}

		function _valueIsEmpty(vValue) {

			// TODO: is type specific check needed?
			return vValue === null || vValue === undefined || vValue === "";

		}

		function _getMonths() {
			if (!this._aMonths) {
				var oDate = new UniversalDate(),
					oFormatter = DateFormat.getDateInstance({
						pattern: "LLLL"
					});
				oDate.setDate(15);
				oDate.setMonth(0);

				var aMonths = [];

				for (var i = 0; i < 12; i++) {
					aMonths.push(oFormatter.format(oDate));
					oDate.setMonth(oDate.getMonth() + 1);
				}

				this._aMonths = aMonths;
			}

			return this._aMonths;
		}

		function _getIndexOfMonth(sMonth) {
			var sLowerCaseMonth = sMonth.toLowerCase();
			var aMonths = _getMonths.apply(this);
			var iIndex = -1;
			aMonths.some(function(sElement, i) {
				if (sElement.toLowerCase() == sLowerCaseMonth) {
					iIndex = i;
					return true;
				}
			});
			return iIndex;
		}

		function _getMonthFieldHelp() {
			if (!oMonthFieldHelp) {
				var ListFieldHelp = sap.ui.require("sap/ui/mdc/field/ListFieldHelp");
				var ListItem = sap.ui.require("sap/ui/core/ListItem");
				if (!ListFieldHelp || !ListItem) {
					Log.warning("Operator.createControl", "not able to create the control for the operator " + this.name);
					return null;
				}

				var getMonthItems = function() {
					if (!this._aMonthsItems) {
						var aMonths = _getMonths.apply(this);
						this._aMonthsItems = [];

						for (var i = 0; i < 12; i++) {
							this._aMonthsItems.push({
								text: aMonths[i],
								key: i
							});
						}
					}

					return this._aMonthsItems;
				}.bind(this);

				oMonthFieldHelp = new ListFieldHelp({
					id: "LFHForSpecificMonth",
					items: {
						path: "$items>/",
						template: new ListItem({
							text: {
								path: "$items>text"
							},
							key: {
								path: "$items>key"
							}
						}),
						templateShareable: false
					}
				}).setModel(new JSONModel(getMonthItems()), "$items");
			}

			return oMonthFieldHelp;
		}

		return FilterOperatorUtil;

}, /* bExport= */ true);
