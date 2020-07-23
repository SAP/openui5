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
	'sap/ui/core/date/UniversalDateUtils'
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
		UniversalDateUtils
	) {
		"use strict";

		/**
		 * Utilities to handle operators of conditions.
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.73.0
		 * @alias sap.ui.mdc.condition.FilterOperatorUtil
		 *
		 * @private
		 * @experimental
		 * @ui5-restricted
		 */
		var FilterOperatorUtil = {

				_mOperators: {
					equal: new Operator({
						name: "EQ",
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
						format: function(oCondition, oType, sDisplayFormat) {
							sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
							var iCount = this.valueTypes.length;
							var aValues = oCondition.values;
							var sTokenPrefix = (oCondition && oCondition.validated === ConditionValidated.Validated) || aValues.length === 2 ? "" : "=";
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

								if (i == 0 && oType && (typeof oType.formatValue === "function")) {
									// only the first value can be formatted. second value is the description string
									sReplace = oType.formatValue(vValue, "string");
								} else {
									sReplace = vValue;
								}

								sTokenText = sReplace == null ? null : sTokenText.replace(new RegExp("\\$" + i + "|" + i + "\\$" + "|" + "\\{" + i + "\\}", "g"), sReplace);
							}

							return sTokenText;
						},
						parse: function(sText, oType, sDisplayFormat, bDefaultOperator) {
							sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
							var aResult = Operator.prototype.parse.apply(this, [sText, oType, sDisplayFormat, bDefaultOperator]);

							if (bDefaultOperator && (!aResult || aResult[0] === null || aResult[0] === undefined) && sDisplayFormat !== FieldDisplay.Value) {
								// in default case and no key determined (simple-EQ case)-> use text as key (parse again to use type)
								sDisplayFormat = FieldDisplay.Value;
								aResult = Operator.prototype.parse.apply(this, [sText, oType, sDisplayFormat, bDefaultOperator]);
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
						filterOperator: ModelOperator.BT,
						tokenParse: "^([^!].*)\\.\\.\\.(.+)$", // TODO: does this work?? At least also matches crap like ".....". I guess validation of value types needs to get rid of those.
						tokenFormat: "{0}...{1}",
						valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
						validate: function(aValues, oType) {
							// in Between 2 Values must be defined
							// TODO: check if one greater than the other?
							if (aValues.length < 2) {
								throw new ValidateException("Between must have two values");
							}
							if (aValues[0] === aValues[1]) {
								throw new ValidateException("Between must have two different values");
							}

							Operator.prototype.validate.apply(this, [aValues, oType]);
						}
					}),
					betweenExclBoundaries: new Operator({
						name: "BTEX",
						filterOperator: ModelOperator.BT,
						tokenParse: "^([^!].*)\\.\\.(.+)$", // TODO: does this work?? At least also matches crap like ".....". I guess validation of value types needs to get rid of those.
						tokenFormat: "{0}..{1}",
						valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
						getModelFilter: function(oCondition, sFieldPath, oType) {
							return new Filter({ filters: [new Filter(sFieldPath, ModelOperator.GT, oCondition.values[0]),
														  new Filter(sFieldPath, ModelOperator.LT, oCondition.values[1])],
														  and: true});
						},
						validate: function(aValues, oType) {
							// in Between 2 Values must be defined
							// TODO: check if one greater than the other?
							if (aValues.length < 2) {
								throw new ValidateException("Between must have two values");
							}
							if (aValues[0] === aValues[1]) {
								throw new ValidateException("Between must have two different values");
							}

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
							// in Between 2 Values must be defined
							// TODO: check if one greater than the other?
							if (aValues.length < 2) {
								throw new ValidateException("NotBetween must have two values");
							}
							if (aValues[0] === aValues[1]) {
								throw new ValidateException("NotBetween must have two different values");
							}

							Operator.prototype.validate.apply(this, [aValues, oType]);
						}
					}),
					notBetweenExclBoundaries: new Operator({
						name: "NOTBTEX",
						filterOperator: ModelOperator.NB,
						tokenParse: "^!(.+)\\.\\.(.+)$",
						tokenFormat: "!({0}..{1})",
						valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
						exclude: true,
						getModelFilter: function(oCondition, sFieldPath, oType) {
							return new Filter({ filters: [new Filter(sFieldPath, ModelOperator.LE, oCondition.values[0]),
														  new Filter(sFieldPath, ModelOperator.GE, oCondition.values[1])],
														  and: false});
						},
						validate: function(aValues, oType) {
							// in Between 2 Values must be defined
							// TODO: check if one greater than the other?
							if (aValues.length < 2) {
								throw new ValidateException("NotBetween must have two values");
							}
							if (aValues[0] === aValues[1]) {
								throw new ValidateException("NotBetween must have two different values");
							}

							Operator.prototype.validate.apply(this, [aValues, oType]);
						}
					}),
					lowerThan: new Operator({
						name: "LT",
						filterOperator: ModelOperator.LT,
						tokenParse: "^<([^=].*)$",
						tokenFormat: "<{0}",
						valueTypes: [Operator.ValueType.Self]
					}),
					notLowerThan: new Operator({
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
						valueTypes: [Operator.ValueType.Self]
					}),
					notStartsWith: new Operator({
						name: "NotStartsWith",
						filterOperator: ModelOperator.NotStartsWith,
						tokenParse: "^!([^\\*].*)\\*$",
						tokenFormat: "!({0}*)",
						valueTypes: [Operator.ValueType.Self],
						exclude: true
					}),
					endsWith: new Operator({
						name: "EndsWith",
						filterOperator: ModelOperator.EndsWith,
						tokenParse: "^\\*(.*[^\\*])$",
						tokenFormat: "*{0}",
						valueTypes: [Operator.ValueType.Self]
					}),
					notEndsWith: new Operator({
						name: "NotEndsWith",
						filterOperator: ModelOperator.NotEndsWith,
						tokenParse: "^!\\*(.*[^\\*])$",
						tokenFormat: "!(*{0})",
						valueTypes: [Operator.ValueType.Self],
						exclude: true
					}),
					contains: new Operator({
						name: "Contains",
						filterOperator: ModelOperator.Contains,
						tokenParse: "^\\*(.*)\\*$",
						tokenFormat: "*{0}*",
						valueTypes: [Operator.ValueType.Self]
					}),
					notContains: new Operator({
						name: "NotContains",
						filterOperator: ModelOperator.NotContains,
						tokenParse: "^!\\*(.*)\\*$",
						tokenFormat: "!(*{0}*)",
						valueTypes: [Operator.ValueType.Self],
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
						getModelFilter: function(oCondition, sFieldPath, oType) {
							//TODO Type specific handling of empty is missing
							// if (Type == "date") {
							// 	return new Filter({ path: sFieldPath, operator: oOperator.filterOperator, value1: null });
							// } else {
							// 	if (isNullable) {
							// 		return new Filter({ filters: [new Filter(sFieldPath, ModelOperator.EQ, ""),
							// 									  new Filter(sFieldPath, ModelOperator.EQ, null)],
							// 							and: false});
							// 	} else {
							return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: "" });
							// 	}
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
						getModelFilter: function(oCondition, sFieldPath, oType) {
							//TODO Type specific handling of empty is missing
							// if (Type == "date") {
							// 	return new Filter({ path: sFieldPath, operator: oOperator.filterOperator, value1: null });
							// } else {
							// 	if (isNullable) {
							// 		return new Filter({ filters: [new Filter(sFieldPath, ModelOperator.EQ, ""),
							// 									  new Filter(sFieldPath, ModelOperator.EQ, null)],
							// 							and: false});
							// 	} else {
							return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: "" });
							// 	}
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
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastDays(iDuration);
						}
					}),
					nextDays: new RangeOperator({
						name: "NEXTDAYS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
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
					currentWeek: new RangeOperator({
						name: "CURRENTWEEK",
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
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastWeeks(iDuration);
						}
					}),
					nextWeeks: new RangeOperator({
						name: "NEXTWEEKS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
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
					currentMonth: new RangeOperator({
						name: "CURRENTMONTH",
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
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastMonths(iDuration);
						}
					}),
					nextMonths: new RangeOperator({
						name: "NEXTMONTHS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
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
					currentQuarter: new RangeOperator({
						name: "CURRENTQUARTER",
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
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastQuarters(iDuration);
						}
					}),
					nextQuarters: new RangeOperator({
						name: "NEXTQUARTERS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextQuarters(iDuration);
						}
					}),
					firstQuarter: new RangeOperator({
						name: "FIRSTQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(1);
						}
					}),
					secondQuarter: new RangeOperator({
						name: "SECONDQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(2);
						}
					}),
					thirdQuarter: new RangeOperator({
						name: "THIRDQUARTER",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(3);
						}
					}),
					fourthQuarter: new RangeOperator({
						name: "FOURTHQUARTER",
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
					currentYear: new RangeOperator({
						name: "CURRENTYEAR",
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
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastYears(iDuration);
						}
					}),
					nextYears: new RangeOperator({
						name: "NEXTYEARS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextYears(iDuration);
						}
					}),
					// month: new RangeOperator({
					// 	name: "MONTH",
					// 	valueTypes: ["sap.ui.model.type.Integer"],
					// 	paramTypes: ["(\\d+)"],
					// 	additionalInfo: "",
					// 	calcRange: function(iDuration) {
					// 		var iValue = parseInt(iDuration),
					// 			oDate = new UniversalDate();
					// 		oDate.setMonth(iValue);
					// 		oDate = UniversalDateUtils.getMonthStartDate(oDate);
					// 		return UniversalDateUtils.getRange(0, "MONTH", oDate);
					// 	}
					// }),
					yearToDate: new RangeOperator({
						name: "YEARTODATE",
						valueTypes: [Operator.ValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.yearToDate();
						}
					})
				},

				_mDefaultOpsForType: {}, // defines default operators for types

				/**
				 * Adds an operator to the list of known operators.
				 *
				 * @param {sap.ui.mdc.condition.Operator} oOperator Operator
				 *
				 * @public
				 */
				addOperator: function(oOperator) {

					FilterOperatorUtil._mOperators[oOperator.name] = oOperator; // TODO: use semantic name?

				},

				/**
				 * Adds an operator to the list of valid operators for a type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator[]} aOperators Operators
				 * @param {sap.ui.mdc.condition.Operator} oDefaultOperator Default operator
				 *
				 * @public
				 */
				setOperatorsForType: function(sType, aOperators, oDefaultOperator) {

					FilterOperatorUtil._mDefaultOpsForType[sType] = {
							operators: aOperators
					};

					if (oDefaultOperator) {
						FilterOperatorUtil._mDefaultOpsForType[sType].defaultOperator = oDefaultOperator;
					}

				},

				/**
				 * Returns all available default operators for the given type.
				 *
				 * @param {sap.ui.mdc.enum.BaseType} sType Basic type
				 * @returns {string[]} an array with the supported filter operators
				 *
				 * @public
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
				 * @returns {sap.ui.mdc.condition.Operator} the default filter operator for the given type
				 *
				 * @public
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
				 * @param {string[]} aOperators List of all supported operators
				 * @param {string} [sValue] Value entered (including operator)
				 * @returns {sap.ui.mdc.condition.Operator[]} the operator objects suitable for the given input string, depending on the given type
				 *
				 * @public
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
				 * @public
				 */
				getOperator: function(sOperator) {

					for (var sName in FilterOperatorUtil._mOperators) {
						var oOperator = FilterOperatorUtil._mOperators[sName];
						if ( oOperator.name === sOperator) {
							return oOperator;
						}
					}

					return undefined;

				},

				/**
				 * Returns the EQ operator object.
				 *
				 * This is required for <code>Field</code>
				 * @returns {sap.ui.mdc.condition.Operator} Operator object
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.Field sap.ui.mdc.field.FieldBase sap.ui.mdc.field.ConditionType
				 */
				getEQOperator: function() {

					return FilterOperatorUtil._mOperators.equal;

				},

				/**
				 * Checks if only EQ is supported. (<code>Field</code> case)
				 *
				 * @param {string[]} aOperators Array with the supported filter operators
				 * @returns {boolean} true if only EQ is supported
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase sap.ui.mdc.field.FieldValueHelp sap.ui.mdc.field.ConditionType
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
				 * @param {object[]} aConditions Conditions
				 *
				 * @public
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
				 * @param {object[]} aConditions Conditions
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
				 * updates the value range to have the right number of entries for one condition
				 *
				 * @param {object} oCondition condition
				 * @since: 1.75.0
				 * @public
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
				 * <b>Note:</b> If two or more identical conditions are in the array, the index is the first hit.
				 *
				 * @param {object} oCondition Condition to check
				 * @param {object[]} aConditions Array of conditions
				 * @returns {int} Index of the condition, -1 if not found
				 * @public
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
				 * @param {object} oCondition1 Condition to check
				 * @param {object} oCondition2 Condition to check
				 * @returns {boolean} True if conditions are equal
				 * @public
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
				 * @param {object[]} aConditions1 Conditions to check
				 * @param {object[]} aConditions2 Conditions to check
				 * @returns {boolean} True if conditions are equal
				 * @public
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
				 * Checks if a condition is validated and sets the <code>validated</code> flag.
				 *
				 * For EQ set <code>validated</code> flag if a description is given.
				 *
				 * @param {object} oCondition condition to check
				 * @public
				 * @since: 1.78.0
				 */
				checkConditionValidated: function(oCondition) {

					var oOperator = this.getOperator(oCondition.operator);
					if (!oCondition.validated && oOperator && oOperator.checkValidated) {
						// only check if not already validated, keep already validated conditions validated (description might be missing before loaded)
						oOperator.checkValidated(oCondition);
					}

				}
		};

		FilterOperatorUtil.setOperatorsForType(
				BaseType.String,
				[
				 FilterOperatorUtil._mOperators.contains,
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 //FilterOperatorUtil._mOperators.betweenExclBoundaries,
				 FilterOperatorUtil._mOperators.startsWith,
				 FilterOperatorUtil._mOperators.endsWith,
				 FilterOperatorUtil._mOperators.empty,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.lowerThan,
				 FilterOperatorUtil._mOperators.greaterEqual,
				 FilterOperatorUtil._mOperators.greaterThan,

				 FilterOperatorUtil._mOperators.notContains,
				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 //FilterOperatorUtil._mOperators.notBetweenExclBoundaries,
				 FilterOperatorUtil._mOperators.notStartsWith,
				 FilterOperatorUtil._mOperators.notEndsWith,
				 FilterOperatorUtil._mOperators.notEmpty,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notLowerThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan
				 ],
				 FilterOperatorUtil._mOperators.equal
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.Date,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.lowerThan,
				 FilterOperatorUtil._mOperators.greaterEqual,
				 FilterOperatorUtil._mOperators.greaterThan,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notLowerThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan,

				 FilterOperatorUtil._mOperators.lastDays,
				 FilterOperatorUtil._mOperators.yesterday,
				 FilterOperatorUtil._mOperators.today,
				 FilterOperatorUtil._mOperators.tomorrow,
				 FilterOperatorUtil._mOperators.nextDays,

				 FilterOperatorUtil._mOperators.lastWeeks,
				 FilterOperatorUtil._mOperators.lastWeek,
				 FilterOperatorUtil._mOperators.currentWeek,
				 FilterOperatorUtil._mOperators.nextWeek,
				 FilterOperatorUtil._mOperators.nextWeeks,

				 FilterOperatorUtil._mOperators.lastMonths,
				 FilterOperatorUtil._mOperators.lastMonth,
				 FilterOperatorUtil._mOperators.currentMonth,
				 FilterOperatorUtil._mOperators.nextMonth,
				 FilterOperatorUtil._mOperators.nextMonths,

				 FilterOperatorUtil._mOperators.lastQuarters,
				 FilterOperatorUtil._mOperators.lastQuarter,
				 FilterOperatorUtil._mOperators.currentQuarter,
				 FilterOperatorUtil._mOperators.nextQuarter,
				 FilterOperatorUtil._mOperators.nextQuarters,

				 FilterOperatorUtil._mOperators.firstQuarter,
				 FilterOperatorUtil._mOperators.secondQuarter,
				 FilterOperatorUtil._mOperators.thirdQuarter,
				 FilterOperatorUtil._mOperators.fourthQuarter,

				 FilterOperatorUtil._mOperators.lastYears,
				 FilterOperatorUtil._mOperators.lastYear,
				 FilterOperatorUtil._mOperators.currentYear,
				 FilterOperatorUtil._mOperators.nextYear,
				 FilterOperatorUtil._mOperators.nextYears,

				 FilterOperatorUtil._mOperators.yearToDate
				 // FilterOperatorUtil._mOperators.month
				 ]
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.DateTime,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.lowerThan,
				 FilterOperatorUtil._mOperators.greaterEqual,
				 FilterOperatorUtil._mOperators.greaterThan,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notLowerThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan

				 // FilterOperatorUtil._mOperators.lastDays,
				 // FilterOperatorUtil._mOperators.yesterday,
				 // FilterOperatorUtil._mOperators.today,
				 // FilterOperatorUtil._mOperators.tomorrow,
				 // FilterOperatorUtil._mOperators.nextDays,

				 // FilterOperatorUtil._mOperators.lastWeeks,
				 // FilterOperatorUtil._mOperators.lastWeek,
				 // FilterOperatorUtil._mOperators.currentWeek,
				 // FilterOperatorUtil._mOperators.nextWeek,
				 // FilterOperatorUtil._mOperators.nextWeeks,

				 // FilterOperatorUtil._mOperators.lastMonths,
				 // FilterOperatorUtil._mOperators.lastMonth,
				 // FilterOperatorUtil._mOperators.currentMonth,
				 // FilterOperatorUtil._mOperators.nextMonth,
				 // FilterOperatorUtil._mOperators.nextMonths,

				 // FilterOperatorUtil._mOperators.lastQuarters,
				 // FilterOperatorUtil._mOperators.lastQuarter,
				 // FilterOperatorUtil._mOperators.currentQuarter,
				 // FilterOperatorUtil._mOperators.nextQuarter,
				 // FilterOperatorUtil._mOperators.nextQuarters,

				 // FilterOperatorUtil._mOperators.firstQuarter,
				 // FilterOperatorUtil._mOperators.secondQuarter,
				 // FilterOperatorUtil._mOperators.thirdQuarter,
				 // FilterOperatorUtil._mOperators.fourthQuarter,

				 // FilterOperatorUtil._mOperators.lastYears,
				 // FilterOperatorUtil._mOperators.lastYear,
				 // FilterOperatorUtil._mOperators.currentYear,
				 // FilterOperatorUtil._mOperators.nextYear,
				 // FilterOperatorUtil._mOperators.nextYears,

				 // FilterOperatorUtil._mOperators.yearToDate
				 // FilterOperatorUtil._mOperators.month
				 ]
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.Numeric,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.lowerThan,
				 FilterOperatorUtil._mOperators.greaterEqual,
				 FilterOperatorUtil._mOperators.greaterThan,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notLowerThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan
				 ]
		);
		FilterOperatorUtil.setOperatorsForType(
				BaseType.Time,
				[
				 FilterOperatorUtil._mOperators.equal,
				 FilterOperatorUtil._mOperators.between,
				 FilterOperatorUtil._mOperators.lessEqual,
				 FilterOperatorUtil._mOperators.lowerThan,
				 FilterOperatorUtil._mOperators.greaterEqual,
				 FilterOperatorUtil._mOperators.greaterThan,

				 FilterOperatorUtil._mOperators.notEqual,
				 FilterOperatorUtil._mOperators.notBetween,
				 FilterOperatorUtil._mOperators.notLessEqual,
				 FilterOperatorUtil._mOperators.notLowerThan,
				 FilterOperatorUtil._mOperators.notGreaterEqual,
				 FilterOperatorUtil._mOperators.notGreaterThan
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

		return FilterOperatorUtil;

}, /* bExport= */ true);
