/*!
 * ${copyright}
*/
sap.ui.define([
	'sap/ui/model/FilterOperator',
	'sap/ui/model/Filter',
	'sap/ui/model/ValidateException',
	'sap/base/Log',
	'sap/ui/mdc/enums/FieldDisplay',
	'./Operator',
	'./RangeOperator',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/date/UniversalDateUtils',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/StaticArea',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/type/Integer'
],

function(
		ModelOperator,
		Filter,
		ValidateException,
		Log,
		FieldDisplay,
		Operator,
		RangeOperator,
		BaseType,
		ConditionValidated,
		OperatorValueType,
		loadModules,
		UniversalDate,
		UniversalDateUtils,
		DateFormat,
		StaticArea,
		JSONModel,
		Integer	// the Integer type must be  available for some of the RangeOperators
	) {
		"use strict";

		// translation utils
		let oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		sap.ui.getCore().attachLocalizationChanged(function() {
			oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		});

		/*
		 * Standard operators for conditions
		 * @namespace
		 * @name sap.ui.mdc.condition.operators
		 * @since 1.73.0
		 * @public
		 */

		/**
		 * Utilities to handle {@link sap.ui.mdc.condition.Operator Operators} and {@link sap.ui.mdc.condition.ConditionObject conditions}.
		 *
		 * @namespace
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.73.0
		 * @alias sap.ui.mdc.condition.FilterOperatorUtil
		 *
		 * @public
		 */
		const FilterOperatorUtil = {

				_mOperators: {
					/*
					 * @class
					 * "Equal to" operator
					 *
					 * Depending on the used <code>DisplayFormat</code> the key, the description or both is used as output of formatting in parsing.
					 *
					 * The operator is available for all data types.
					 *
					 * If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output the operator is mapped to the <code>DATE</code> option if a date type is used
					 * and to the <code>DATETIME</code> option if a datetime type is used.
					 * @name sap.ui.mdc.condition.operators.EQ
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					equal: new Operator({
						name: "EQ",
						alias: {Date: "DATE", DateTime: "DATETIME"},
						filterOperator: ModelOperator.EQ,
						tokenParse: "^=([^=].*)$",
						tokenFormat: "{1} ({0})", // all placeholder should use the {x} format - the text could be store in the resourcebundle file.
						valueTypes: [OperatorValueType.Self, null],
						displayFormats: {
							DescriptionValue: "{1} ({0})",
							ValueDescription: "{0} ({1})",
							Description: "{1}",
							Value: "{0}"
						},
						format: function(oCondition, oType, sDisplayFormat, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {
							sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
							let iCount = this.valueTypes.length;
							const aValues = oCondition.values;
							const sTokenPrefix = (oCondition && oCondition.validated === ConditionValidated.Validated) || aValues.length === 2 || bHideOperator ? "" : "=";
							let sTokenText = sTokenPrefix + this.displayFormats[sDisplayFormat];

							if (!aValues[1]) {
								sTokenText = sTokenPrefix + this.displayFormats["Value"];
								iCount = 1;
							}

							for (let i = 0; i < iCount; i++) {
								let sReplace, vValue = aValues[i];

								if (vValue === null || vValue === undefined) { // support boolean
									vValue = "";
								}

								if (i === 0) {
									sReplace = this._formatValue(vValue, oType, aCompositeTypes);
								} else { // canot have more that 2 entries
									sReplace = this._formatValue(vValue, oAdditionalType, aAdditionalCompositeTypes);
								}

								if (sReplace === null) {
									sTokenText = null; // some types (like Unit) return null if no value is given, in this case stop formating and return null
									break;
								}
								if (typeof sReplace === "string") {
									sReplace = sReplace.replace(/\$/g, '$$$'); // as "$$" has a special handling in replace, it will be transformed into "$"
								}
								sTokenText = sTokenText.replace(new RegExp("\\$" + i + "|" + i + "\\$" + "|" + "\\{" + i + "\\}", "g"), sReplace);
							}

							return sTokenText;
						},
						parse: function(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {
							sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
							let aResult = Operator.prototype.parse.apply(this, [sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes]);

							if (bDefaultOperator && (!aResult || aResult[0] === null || aResult[0] === undefined) && sDisplayFormat !== FieldDisplay.Value) {
								// in default case and no key determined (simple-EQ case)-> use text as key (parse again to use type)
								sDisplayFormat = FieldDisplay.Value;
								aResult = Operator.prototype.parse.apply(this, [sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes]);
							}
							if (aResult && (aResult[1] === null || aResult[1] === undefined) && sDisplayFormat === FieldDisplay.Value) {
								aResult = [aResult[0]]; // only key
							}

							return aResult;
						},
						getValues: function(sText, sDisplayFormat, bDefaultOperator) {
							const aMatch = sText.match(this.tokenParseRegExp);
							let aValues;
							if (aMatch || (bDefaultOperator && sText)) {
								let sValue;
								const sTokenText = this.displayFormats[sDisplayFormat];
								const iKeyIndex = sTokenText.indexOf("{0}");
								const iDescriptionIndex = sTokenText.indexOf("{1}");
								let sKey;
								let sDescription;

								if (aMatch) {
									sValue = aMatch[1];
								} else if (bDefaultOperator) {
									sValue = sText;
								}

								if (iKeyIndex >= 0 && iDescriptionIndex >= 0) {
									// split string
									if (sValue.lastIndexOf("(") > 0 && (sValue.lastIndexOf(")") === sValue.length - 1 || sValue.lastIndexOf(")") === -1)) {
										let iEnd = sValue.length;
										if (sValue[iEnd - 1] === ")") {
											iEnd--;
										}
										let sValue1 = sValue.substring(0, sValue.lastIndexOf("("));
										if (sValue1[sValue1.length - 1] === " ") {
											sValue1 = sValue1.substring(0, sValue1.length - 1);
										}
										const sValue2 = sValue.substring(sValue.lastIndexOf("(") + 1, iEnd);
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
							let isEmpty = false;
							const v = oCondition.values[0];
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
					/*
					 * @class
					 * "Between" operator
					 *
					 * There is no validation if the first value is less than the second value as the comparison would be type dependent and cannot performed
					 * in a generic way.
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 *
					 * If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output the operator is mapped to the <code>DATERANGE</code> option if a date type is used
					 * and to the <code>DATETIMERANGE</code> option if a datetime type is used.
					 * @name sap.ui.mdc.condition.operators.BT
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					between: new Operator({
						name: "BT",
						alias: {Date: "DATERANGE", DateTime:"DATETIMERANGE"},
						filterOperator: ModelOperator.BT,
						tokenParse: "^([^!].*)\\.\\.\\.(.+)$", // TODO: does this work?? At least also matches crap like ".....". I guess validation of value types needs to get rid of those.
						tokenFormat: "{0}...{1}",
						valueTypes: [OperatorValueType.Self, OperatorValueType.Self],
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
					/*
					 * @class
					 * "Not Between" operator
					 *
					 * There is no validation if the first value is less than the second value as the comparison would be type dependent and cannot performed
					 * in a generic way.
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 * @name sap.ui.mdc.condition.operators.NOTBT
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notBetween: new Operator({
						name: "NOTBT",
						filterOperator: ModelOperator.NB,
						tokenParse: "^!(.+)\\.\\.\\.(.+)$",
						tokenFormat: "!({0}...{1})",
						valueTypes: [OperatorValueType.Self, OperatorValueType.Self],
						exclude: true,
						validate: function(aValues, oType) {
							FilterOperatorUtil._mOperators.between.validate(aValues, oType);
						}
					}),
					/*
					 * @class
					 * "Less Than" operator
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 * @name sap.ui.mdc.condition.operators.LT
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					lessThan: new Operator({
						name: "LT",
						filterOperator: ModelOperator.LT,
						tokenParse: "^<([^=].*)$",
						tokenFormat: "<{0}",
						valueTypes: [OperatorValueType.Self]
					}),
					/*
					 * @class
					 * "Not Less Than" operator
					 * @name sap.ui.mdc.condition.operators.NOTLT
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notLessThan: new Operator({
						name: "NOTLT",
						filterOperator: ModelOperator.GE,
						tokenParse: "^!<([^=].*)$",
						tokenFormat: "!(<{0})",
						valueTypes: [OperatorValueType.Self],
						exclude: true
					}),
					/*
					 * @class
					 * "Greater Than" operator
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 * @name sap.ui.mdc.condition.operators.GT
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					greaterThan: new Operator({
						name: "GT",
						filterOperator: ModelOperator.GT,
						tokenParse: "^>([^=].*)$",
						tokenFormat: ">{0}",
						valueTypes: [OperatorValueType.Self]
					}),
					/*
					 * @class
					 * "Not Greater Than" operator
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 * @name sap.ui.mdc.condition.operators.NOTGT
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notGreaterThan: new Operator({
						name: "NOTGT",
						filterOperator: ModelOperator.LE,
						tokenParse: "^!>([^=].*)$",
						tokenFormat: "!(>{0})",
						valueTypes: [OperatorValueType.Self],
						exclude: true
					}),
					/*
					 * @class
					 * "Less Then Or Equal To" operator
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 *
					 * If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output the operator is mapped to the <code>TO</code> option if a date type is used
					 * and to the <code>TODATETIME</code> option if a datetime type is used.
					 * @name sap.ui.mdc.condition.operators.LE
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					lessEqual: new Operator({
						name: "LE",
						alias: {Date: "TO", DateTime: "TODATETIME"},
						filterOperator: ModelOperator.LE,
						tokenParse: "^<=(.+)$",
						tokenFormat: "<={0}",
						valueTypes: [OperatorValueType.Self]
					}),
					/*
					 * @class
					 * "Not Less Than Or Equal To" operator
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 * @name sap.ui.mdc.condition.operators.NOTLE
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notLessEqual: new Operator({
						name: "NOTLE",
						filterOperator: ModelOperator.GT,
						tokenParse: "^!<=(.+)$",
						tokenFormat: "!(<={0})",
						valueTypes: [OperatorValueType.Self],
						exclude: true
					}),
					/*
					 * @class
					 * "Greater Than Ot Equal To" operator
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 *
					 * If a {@link sap.m.DynamicDateRange DynamicDateRange} control is used for the output the operator is mapped to the <code>FROM</code> option if a date type is used
					 * and to the <code>FROMDATETIME</code> option if a datetime type is used.
					 * @name sap.ui.mdc.condition.operators.GE
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					greaterEqual: new Operator({
						name: "GE",
						alias: {Date: "FROM", DateTime: "FROMDATETIME"},
						filterOperator: ModelOperator.GE,
						tokenParse: "^>=(.+)$",
						tokenFormat: ">={0}",
						valueTypes: [OperatorValueType.Self]
					}),
					/*
					 * @class
					 * "NOT Greater Than Or Equal To" operator
					 *
					 * The operator is available for string, numeric, date, time and datetime types.
					 * @name sap.ui.mdc.condition.operators.NOTGE
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notGreaterEqual: new Operator({
						name: "NOTGE",
						filterOperator: ModelOperator.LT,
						tokenParse: "^!>=(.+)$",
						tokenFormat: "!(>={0})",
						valueTypes: [OperatorValueType.Self],
						exclude: true
					}),
					/*
					 * @class
					 * "Starts With" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.StartsWith
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					startsWith: new Operator({
						name: "StartsWith",
						filterOperator: ModelOperator.StartsWith,
						tokenParse: "^([^!\\*]+.*)\\*$",
						tokenFormat: "{0}*",
						valueTypes: [OperatorValueType.SelfNoParse]
					}),
					/*
					 * @class
					 * "Does Not Start With" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.NotStartsWith
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notStartsWith: new Operator({
						name: "NotStartsWith",
						filterOperator: ModelOperator.NotStartsWith,
						tokenParse: "^!([^\\*].*)\\*$",
						tokenFormat: "!({0}*)",
						valueTypes: [OperatorValueType.SelfNoParse],
						exclude: true
					}),
					/*
					 * @class
					 * "Ends With" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.EndsWith
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					endsWith: new Operator({
						name: "EndsWith",
						filterOperator: ModelOperator.EndsWith,
						tokenParse: "^\\*(.*[^\\*])$",
						tokenFormat: "*{0}",
						valueTypes: [OperatorValueType.SelfNoParse]
					}),
					/*
					 * @class
					 * "Does Not End With" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.NotEndsWith
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notEndsWith: new Operator({
						name: "NotEndsWith",
						filterOperator: ModelOperator.NotEndsWith,
						tokenParse: "^!\\*(.*[^\\*])$",
						tokenFormat: "!(*{0})",
						valueTypes: [OperatorValueType.SelfNoParse],
						exclude: true
					}),
					/*
					 * @class
					 * "Contains" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.Contains
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					contains: new Operator({
						name: "Contains",
						filterOperator: ModelOperator.Contains,
						tokenParse: "^\\*(.*)\\*$",
						tokenFormat: "*{0}*",
						valueTypes: [OperatorValueType.SelfNoParse]
					}),
					/*
					 * @class
					 * "Does Not Contain" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.NotContains
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notContains: new Operator({
						name: "NotContains",
						filterOperator: ModelOperator.NotContains,
						tokenParse: "^!\\*(.*)\\*$",
						tokenFormat: "!(*{0}*)",
						valueTypes: [OperatorValueType.SelfNoParse],
						exclude: true
					}),
					/*
					 * @class
					 * "Not Equal To" operator
					 *
					 * The operator is available for all types.
					 * @name sap.ui.mdc.condition.operators.NE
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notEqual: new Operator({
						name: "NE",
						filterOperator: ModelOperator.NE,
						tokenParse: "^!=(.+)$",
						tokenFormat: "!(={0})",
						valueTypes: [OperatorValueType.Self],
						exclude: true
					}),
					/*
					 * @class
					 * "Empty" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.Empty
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					empty: new Operator({
						name: "Empty",
						filterOperator: ModelOperator.EQ,
						tokenParse: "^<#tokenText#>$",
						tokenFormat: "<#tokenText#>",
						valueTypes: [],
						getModelFilter: function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
							let isNullable = false;
							if (oType) {
								const vResult = oType.parseValue("", "string");
								try {
									oType.validateValue(vResult);
									isNullable = vResult === null;
								} catch (oError) {
									isNullable = false;
								}
							}
							if (isNullable) {
								return new Filter({ filters: [new Filter({path: sFieldPath, operator: ModelOperator.EQ, value1: ""}),
															new Filter({path: sFieldPath, operator: ModelOperator.EQ, value1: null})],
													and: false});
							} else {
								return new Filter({path: sFieldPath, operator: this.filterOperator, value1: ""});
							}
						}
					}),
					/*
					 * @class
					 * "Not Empty" operator
					 *
					 * The operator is available for string types.
					 * @name sap.ui.mdc.condition.operators.NotEmpty
					 * @extends sap.ui.mdc.condition.Operator
					 * @since 1.73.0
					 * @public
					 */
					notEmpty: new Operator({
						name: "NotEmpty",
						filterOperator: ModelOperator.NE,
						tokenParse: "^!<#tokenText#>$",
						tokenFormat: "!(<#tokenText#>)",
						valueTypes: [],
						exclude: true,
						getModelFilter: function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
							let isNullable = false;
							if (oType) {
								const vResult = oType.parseValue("", "string");
								try {
									oType.validateValue(vResult);
									isNullable = vResult === null;
								} catch (oError) {
									isNullable = false;
								}
							}
							if (isNullable) {
								return new Filter({ filters: [new Filter({path: sFieldPath, operator: ModelOperator.NE, value1: ""}),
															new Filter({path: sFieldPath, operator: ModelOperator.NE, value1: null})],
													and: true});
							} else {
								return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: "" });
							}
						}
					}),
					/*
					 * @class
					 * "Yesterday" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.YESTERDAY
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					yesterday: new RangeOperator({
						name: "YESTERDAY",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.yesterday();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Today" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.TODAY
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					today: new RangeOperator({
						name: "TODAY",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.today();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Tomorrow" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.TOMORROW
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					tomorrow: new RangeOperator({
						name: "TOMORROW",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.tomorrow();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Last X Days" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTDAYS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastDays: new RangeOperator({
						name: "LASTDAYS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastDays(iDuration);
						}
					}),
					/*
					 * @class
					 * "First Date In This Week" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.FIRSTDAYWEEK
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					firstDayWeek: new RangeOperator({
						name: "FIRSTDAYWEEK",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfWeek();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Last Date In This Week" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTDAYWEEK
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					lastDayWeek: new RangeOperator({
						name: "LASTDAYWEEK",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfWeek();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "First Date In This Month" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.FIRSTDAYMONTH
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					firstDayMonth: new RangeOperator({
						name: "FIRSTDAYMONTH",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfMonth();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Last Date In This Month" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTDAYMONTH
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					lastDayMonth: new RangeOperator({
						name: "LASTDAYMONTH",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfMonth();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "First Date In This Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.FIRSTDAYQUARTER
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					firstDayQuarter: new RangeOperator({
						name: "FIRSTDAYQUARTER",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfQuarter();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Last Date In This Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTDAYQUARTER
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					lastDayQuarter: new RangeOperator({
						name: "LASTDAYQUARTER",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfQuarter();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "First Date In This Year" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.FIRSTDAYYEAR
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					firstDayYear: new RangeOperator({
						name: "FIRSTDAYYEAR",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.firstDayOfYear();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Last Date In This Year" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTDAYYEAR
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					lastDayYear: new RangeOperator({
						name: "LASTDAYYEAR",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastDayOfYear();
						},
						formatRange: function(aRange, oDataType) {
							return oDataType.formatValue(aRange[0], "string");
						}
					}),
					/*
					 * @class
					 * "Today -X/ +Y days" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.TODAYFROMTO
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
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
							let oStart = xDays >= 0 ?  UniversalDateUtils.ranges.lastDays(xDays)[0] : UniversalDateUtils.ranges.nextDays(-xDays)[1];
							let oEnd = yDays >= 0 ? UniversalDateUtils.ranges.nextDays(yDays)[1] : UniversalDateUtils.ranges.lastDays(-yDays)[0];

							if (oStart.oDate.getTime() > oEnd.oDate.getTime()) {
								oEnd = [oStart, oStart = oEnd][0];
							}

							return [UniversalDateUtils.resetStartTime(oStart), UniversalDateUtils.resetEndTime(oEnd)];
						}
					}),
					/*
					 * @class
					 * "Next X Days" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTDAYS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextDays: new RangeOperator({
						name: "NEXTDAYS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextDays(iDuration);
						}
					}),
					/*
					 * @class
					 * "Last Week" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTWEEK
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastWeek: new RangeOperator({
						name: "LASTWEEK",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastWeek();
						}
					}),
					/*
					 * @class
					 * "This Week" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.THISWEEK
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					thisWeek: new RangeOperator({
						name: "THISWEEK",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentWeek();
						}
					}),
					/*
					 * @class
					 * "Next Week" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTWEEK
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextWeek: new RangeOperator({
						name: "NEXTWEEK",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextWeek();
						}
					}),
					/*
					 * @class
					 * "Last X Weeks" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTWEEKS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastWeeks: new RangeOperator({
						name: "LASTWEEKS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastWeeks(iDuration);
						}
					}),
					/*
					 * @class
					 * "Next X Weeks" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTWEEKS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextWeeks: new RangeOperator({
						name: "NEXTWEEKS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextWeeks(iDuration);
						}
					}),
					/*
					 * @class
					 * "Last Month" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTMONTH
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastMonth: new RangeOperator({
						name: "LASTMONTH",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastMonth();
						}
					}),
					/*
					 * @class
					 * "This Month" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.THISMONTH
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					thisMonth: new RangeOperator({
						name: "THISMONTH",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentMonth();
						}
					}),
					/*
					 * @class
					 * "Next Month" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTMONTH
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextMonth: new RangeOperator({
						name: "NEXTMONTH",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextMonth();
						}
					}),
					/*
					 * @class
					 * "Last X Months" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTMONTHS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastMonths: new RangeOperator({
						name: "LASTMONTHS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastMonths(iDuration);
						}
					}),
					/*
					 * @class
					 * "Next X Months" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTMONTHS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextMonths: new RangeOperator({
						name: "NEXTMONTHS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextMonths(iDuration);
						}
					}),
					/*
					 * @class
					 * "Last Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTQUARTER
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastQuarter: new RangeOperator({
						name: "LASTQUARTER",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastQuarter();
						}
					}),
					/*
					 * @class
					 * "This Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.THISQUARTER
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					thisQuarter: new RangeOperator({
						name: "THISQUARTER",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentQuarter();
						}
					}),
					/*
					 * @class
					 * "Next Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTQUARTER
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextQuarter: new RangeOperator({
						name: "NEXTQUARTER",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextQuarter();
						}
					}),
					/*
					 * @class
					 * "Last X Quarters" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTQUARTERS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastQuarters: new RangeOperator({
						name: "LASTQUARTERS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastQuarters(iDuration);
						}
					}),
					/*
					 * @class
					 * "Next X Quarters" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTQUARTERS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextQuarters: new RangeOperator({
						name: "NEXTQUARTERS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextQuarters(iDuration);
						}
					}),
					/*
					 * @class
					 * "First Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.QUARTER1
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					quarter1: new RangeOperator({
						name: "QUARTER1",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(1);
						}
					}),
					/*
					 * @class
					 * "Second Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.QUARTER2
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					quarter2: new RangeOperator({
						name: "QUARTER2",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(2);
						}
					}),
					/*
					 * @class
					 * "Third Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.QUARTER3
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					quarter3: new RangeOperator({
						name: "QUARTER3",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(3);
						}
					}),
					/*
					 * @class
					 * "Forth Quarter" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.QUARTER4
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					quarter4: new RangeOperator({
						name: "QUARTER4",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.quarter(4);
						}
					}),
					/*
					 * @class
					 * "Last Year" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTYEAR
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastYear: new RangeOperator({
						name: "LASTYEAR",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.lastYear();
						}
					}),
					/*
					 * @class
					 * "This Year" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.THISYEAR
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.86.0
					 * @public
					 */
					thisYear: new RangeOperator({
						name: "THISYEAR",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.currentYear();
						}
					}),
					/*
					 * @class
					 * "Next Year" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTYEAR
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextYear: new RangeOperator({
						name: "NEXTYEAR",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.nextYear();
						}
					}),
					/*
					 * @class
					 * "Last X Years" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTYEARS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					lastYears: new RangeOperator({
						name: "LASTYEARS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastYears(iDuration);
						}
					}),
					/*
					 * @class
					 * "Next X Years" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTYEARS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					nextYears: new RangeOperator({
						name: "NEXTYEARS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextYears(iDuration);
						}
					}),
					/*
					 * @class
					 * "Month" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.SPECIFICMONTH
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.85.0
					 * @public
					 */
					specificMonth: new RangeOperator({
						name: "SPECIFICMONTH",
						valueTypes: [{ name: "sap.ui.model.type.Integer", constraints: { minimum: 0, maximum: 11 }}],
						paramTypes: ["(.+)"],
						additionalInfo: "",
						label: [oMessageBundle.getText("operators.SPECIFICMONTH_MONTH.label")],
						defaultValues: function() {
							const oDate = new UniversalDate();
							return [
								oDate.getMonth()
							];
						},
						calcRange: function(iDuration) {
							let oDate = new UniversalDate();
							oDate.setMonth(iDuration);
							oDate = UniversalDateUtils.getMonthStartDate(oDate);
							return UniversalDateUtils.getRange(0, "MONTH", oDate);
						},
						format: function(oCondition, oType, sDisplayFormat, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {
							const iValue = oCondition.values[0];
							const sTokenText = this.tokenFormat;
							const sReplace = _getMonths.apply(this)[iValue];

							if (bHideOperator) {
								return sReplace;
							} else {
								return sReplace == null ? null : sTokenText.replace(new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g"), sReplace);
							}
						},
						getValues: function(sText, sDisplayFormat, bDefaultOperator) {
							const aMatch = sText.match(this.tokenParseRegExp);
							let aValues;
							if (aMatch || (bDefaultOperator && sText)) {
								aValues = [];
								for (let i = 0; i < this.valueTypes.length; i++) {
									let sValue;
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
						createControl: function(oType, sPath, iIndex, sId)  {
							const Field = sap.ui.require("sap/ui/mdc/Field");
							const sValueHelp = _getMonthValueHelp.call(this);
							if (Field && sValueHelp) {

								const oField = new Field(sId, {
									value: { path: sPath, type: oType, mode: 'TwoWay', targetType: 'raw' },
									display: 'Description',
									width: "100%",
									valueHelp: sValueHelp
								});

								return oField;
							} else {
								Log.warning("Operator.createControl", "not able to create the control for the operator " + this.name);
								return null;
							}
						}
					}),
					/*
					 * @class
					 * "Month In Year" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.SPECIFICMONTHINYEAR
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					specificMonthInYear: new RangeOperator({
						name: "SPECIFICMONTHINYEAR",
						valueTypes: [{ name: "sap.ui.model.type.Integer", constraints: { minimum: 0, maximum: 11 }},
									{ name: "sap.ui.model.type.Integer", constraints: { minimum: 1, maximum: 9999 }}],
						paramTypes: ["(.+)", "(.+)"],
						additionalInfo: "",
						label: [oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_MONTH.label"), oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_YEAR.label")],
						defaultValues: function() {
							const oDate = new UniversalDate();
							return [
								oDate.getMonth(),
								oDate.getFullYear()
							];
						},
						calcRange: function(iMonth, iYear) {
							let oDate = new UniversalDate();
							oDate.setMonth(iMonth);
							oDate.setYear(iYear);
							oDate = UniversalDateUtils.getMonthStartDate(oDate);
							return UniversalDateUtils.getRange(0, "MONTH", oDate);
						},
						format: function(oCondition, oType, sDisplayFormat, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {
							const iValue = oCondition.values[0];
							const iYear = oCondition.values[1];
							let sTokenText = this.tokenFormat;
							const sReplace = _getMonths.apply(this)[iValue];

							if (bHideOperator) {
								return sReplace + "," + iYear;
							} else {
								const replaceRegExp0 = new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g");
								const replaceRegExp1 = new RegExp("\\$" + 1 + "|" + 1 + "\\$" + "|" + "\\{" + 1 + "\\}", "g");
								sTokenText = sReplace == null ? null : sTokenText.replace(replaceRegExp0, sReplace);
								return sTokenText.replace(replaceRegExp1, iYear);
							}
						},
						getValues: function(sText, sDisplayFormat, bDefaultOperator) {
							const aMatch = sText.match(this.tokenParseRegExp);
							let aValues;
							if (aMatch || (bDefaultOperator && sText)) {
								aValues = [];
								for (let i = 0; i < this.valueTypes.length; i++) {
									let sValue;
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
						createControl: function(oType, sPath, iIndex, sId)  {
							let oField;
							const Field = sap.ui.require("sap/ui/mdc/Field");
							if (!Field) {
								Log.warning("Operator.createControl", "not able to create the control for the operator " + this.name);
								return null;
							}

							if (iIndex == 0) {
								const sValueHelp = _getMonthValueHelp.call(this);

								if (sValueHelp) {

									oField = new Field(sId, {
										value: { path: sPath, type: oType, mode: 'TwoWay', targetType: 'raw' },
										display: 'Description',
										width: "100%",
										valueHelp: sValueHelp
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
					/*
					 * @class
					 * "Year To Date" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.YEARTODATE
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.74.0
					 * @public
					 */
					yearToDate: new RangeOperator({
						name: "YEARTODATE",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.yearToDate();
						}
					}),
					/*
					 * @class
					 * "Date To Year" operator
					 *
					 * The operator is available for date and datetime types.
					 * @name sap.ui.mdc.condition.operators.DATETOYEAR
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.99.0
					 * @public
					 */
					dateToYear: new RangeOperator({
						name: "DATETOYEAR",
						valueTypes: [OperatorValueType.Static],
						calcRange: function() {
							return UniversalDateUtils.ranges.dateToYear();
						}
					}),
					/*
					 * @class
					 * "Last X Minutes" operator
					 *
					 * The operator is available for datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTMINUTES
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.112.0
					 * @public
					 */
					lastMinutes: new RangeOperator({
						name: "LASTMINUTES",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastMinutes(iDuration);
						}
					}),
					/*
					 * @class
					 * "Next X Minutes" operator
					 *
					 * The operator is available for datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTMINUTES
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.112.0
					 * @public
					 */
					nextMinutes: new RangeOperator({
						name: "NEXTMINUTES",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextMinutes(iDuration);
						}
					}),
					/*
					 * @class
					 * "Last X Hours" operator
					 *
					 * The operator is available for datetime types.
					 * @name sap.ui.mdc.condition.operators.LASTHOURS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.112.0
					 * @public
					 */
					lastHours: new RangeOperator({
						name: "LASTHOURS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.lastHours(iDuration);
						}
					}),
					/*
					 * @class
					 * "Next X Hours" operator
					 *
					 * The operator is available for datetime types.
					 * @name sap.ui.mdc.condition.operators.NEXTHOURS
					 * @extends sap.ui.mdc.condition.RangeOperator
					 * @since 1.112.0
					 * @public
					 */
					nextHours: new RangeOperator({
						name: "NEXTHOURS",
						valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
						paramTypes: ["(\\d+)"],
						additionalInfo: "",
						calcRange: function(iDuration) {
							return UniversalDateUtils.ranges.nextHours(iDuration);
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
				 * Adds an array of operators to the list of known operators.
				 *
				 * @param {sap.ui.mdc.condition.Operator[]} aOperators Array of operators
				 *
				 * @since: 1.88.0
				 * @public
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
				 * @public
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
				 * @public
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
				 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator[]} aOperators Operators
				 * @param {sap.ui.mdc.condition.Operator|string} vDefaultOperator The default operator instance or default operator name
				 *
 				 * <b>Note</b>: <code>aOperators</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator}, the instance itself, or multiple operators inside an array.
 				 * <b>Note</b>: <code>vDefaultOperator</code> must exist as a valid operator for the type.
				 *
				 * @public
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
				 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vDefaultOperator The default operator instance or default operator name
				 *
 				 * <b>Note</b>: <code>vDefaultOperator</code> must exist as a valid operator for the type.
				 *
				 * @since: 1.88.0
				 * @public
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
				 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
				 *
				 * @since: 1.88.0
				 * @public
				 */
				addOperatorForType: function(sType, vOperator) {
					FilterOperatorUtil.insertOperatorForType(sType, vOperator);
				},

				/**
				 * Inserts an operator into the list of valid operators for a type.
				 *
				 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
				 * @param {int} idx Index of the operator in the list of operators for this type
				 *
				 * @since: 1.88.0
				 * @public
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
				 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
				 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
				 *
				 * @since: 1.88.0
				 * @public
				 */
				removeOperatorForType: function(sType, vOperator) {
					let sName;
					if (typeof vOperator  === "string") {
						sName = vOperator;
					} else {
						sName = vOperator.name;
					}
					for (let i = 0; i < FilterOperatorUtil._mDefaultOpsForType[sType].operators.length; i++) {
						if (FilterOperatorUtil._mDefaultOpsForType[sType].operators[i].name === sName) {
							FilterOperatorUtil._mDefaultOpsForType[sType].operators.splice(i, 1);
							return;
						}
					}
				},

				/**
				 * Returns all available default operators for the given type.
				 *
				 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
				 * @returns {string[]} an array with the supported filter operator names
				 *
				 * @public
				 */
				getOperatorsForType: function(sType) {

					const aOperators = [];

					for (let i = 0; i < FilterOperatorUtil._mDefaultOpsForType[sType].operators.length; i++) {
						aOperators.push(FilterOperatorUtil._mDefaultOpsForType[sType].operators[i].name);

					}

					return aOperators;

				},

				/**
				 * Returns the default operator for the given basic type.
				 *
				 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
				 * @returns {sap.ui.mdc.condition.Operator} the default operator for the given type
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
				 * @param {string[]} aOperators List of all supported operator names
				 * @param {string} [sValue] Value entered (including operator)
				 * @returns {sap.ui.mdc.condition.Operator[]} the operator objects suitable for the given input string, depending on the given type
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				getMatchingOperators: function(aOperators, sValue) {

					const aMyOperators = [];

					for (let i = 0; i < aOperators.length; i++) {
						const oOperator = this.getOperator(aOperators[i]);
						if (oOperator) {
							aMyOperators.push(oOperator);
						}
					}

					return _getMatchingOperators.call(this, aMyOperators, sValue);

				},

				/**
				 * Returns the operator object for the given operator name.
				 * @param {string} sOperator Name of the operator
				 * @returns {sap.ui.mdc.condition.Operator|undefined} the operator object, or <code>undefined<code> if the operator with the requested name does not exist
				 *
				 * @public
				 */
				getOperator: function(sOperator) {

					for (const sName in FilterOperatorUtil._mOperators) {
						const oOperator = FilterOperatorUtil._mOperators[sName];
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
				 * @ui5-restricted sap.ui.mdc.Field, sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType, sap.ui.mdc.valuehelp.base.Content
				 */
				getEQOperator: function(aOperators) {

					if (aOperators) {
						for (let i = 0; i < aOperators.length; i++) {
							const oOperator = this.getOperator(aOperators[i]);
							if (oOperator && oOperator.validateInput && !oOperator.exclude && oOperator.valueTypes[0] && oOperator.valueTypes[0] !== OperatorValueType.Static) {
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
				 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
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
						const oOperator = this.getOperator(oCondition.operator);
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

					for (let i = 0; i < aConditions.length; i++) {
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

					const oOperator = this.getOperator(oCondition.operator);

					//update the values array length (Validated conditions are seen as OK)
					if (oOperator && oCondition.validated !== ConditionValidated.Validated) {
						let iValueTypesLength = oOperator.valueTypes.length;

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

					let iIndex = -1;

					// compare operator and value. in EQ case, compare only key
					for (let i = 0; i < aConditions.length; i++) {
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

					let bEqual = false;

					// compare operator and value. in EQ case, compare only key
					if (oCondition1.operator === oCondition2.operator) {
						const oOperator = this.getOperator(oCondition1.operator);
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

					let bEqual = false;

					if (aConditions1.length === aConditions2.length) {
						bEqual = true;
						for (let i = 0; i < aConditions1.length; i++) {
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

					const oOperator = this.getOperator(oCondition.operator);
					if (!oCondition.validated && oOperator && oOperator.checkValidated) {
						// only check if not already validated, keep already validated conditions validated (description might be missing before loaded)
						oOperator.checkValidated(oCondition);
					}

				},

				/**
				 * Returns the operator object for the given <code>DynamicDateOption</code> name.
				 * @param {string} sOption Name of the operator
				 * @param {sap.ui.mdc.enums.BaseType} [sBaseType] Basic type
				 * @returns {sap.ui.mdc.condition.Operator|undefined} the operator object, or <code>undefined</code> if the operator with the requested name does not exist
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since: 1.100.0
				 */
				 getOperatorForDynamicDateOption: function(sOption, sBaseType) {

					let oOperator;

					// determine operator name if used as custom DynamicDateOption created in DateContent using getCustomDynamicDateOptionForOperator
					if (sBaseType && sOption.startsWith(sBaseType)) {
						oOperator = this.getOperator(sOption.slice(sBaseType.length + 1));
					} else {
						oOperator = this.getOperator(sOption);
					}

					if (!oOperator && sBaseType) {
						for (const sName in FilterOperatorUtil._mOperators) {
							const oCheckOperator = FilterOperatorUtil._mOperators[sName];
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
				 * @param {sap.ui.mdc.enums.BaseType} sBaseType Basic type
				 * @returns {string} <code>DynamicDateOption</code>
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since: 1.100.0
				 */
				 getDynamicDateOptionForOperator: function(oOperator, oDynamicDateRangeKeys, sBaseType) {

					let sOption;
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
				 * @param {sap.ui.mdc.enums.BaseType} sBaseType Basic type
				 * @returns {string} <code>DynamicDateOption</code>
				 * @private
				 * @ui5-restricted sap.ui.mdc
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

				 FilterOperatorUtil._mOperators.lastMinutes,
				 FilterOperatorUtil._mOperators.nextMinutes,
				 FilterOperatorUtil._mOperators.lastHours,
				 FilterOperatorUtil._mOperators.nextHours,

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
			const aResult = [];

			for (let i = 0; i < aOperators.length; i++) {
				const oOperator = aOperators[i];
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
				const oDate = new UniversalDate(),
					oFormatter = DateFormat.getDateInstance({
						pattern: "LLLL"
					});
				oDate.setDate(15);
				oDate.setMonth(0);

				const aMonths = [];

				for (let i = 0; i < 12; i++) {
					aMonths.push(oFormatter.format(oDate));
					oDate.setMonth(oDate.getMonth() + 1);
				}

				this._aMonths = aMonths;
			}

			return this._aMonths;
		}

		function _getIndexOfMonth(sMonth) {
			const sLowerCaseMonth = sMonth.toLowerCase();
			const aMonths = _getMonths.apply(this);
			let iIndex = -1;
			aMonths.some(function(sElement, i) {
				if (sElement.toLowerCase() == sLowerCaseMonth) {
					iIndex = i;
					return true;
				}
			});
			return iIndex;
		}


		let bCreatingMonthValueHelp = false;

		function _getMonthValueHelp() {

			const sId = "LFHForSpecificMonth";

			if (!bCreatingMonthValueHelp) {
				bCreatingMonthValueHelp = true;

				loadModules([
					"sap/ui/mdc/valuehelp/content/FixedList",
					"sap/ui/mdc/valuehelp/content/FixedListItem",
					"sap/ui/mdc/ValueHelp",
					"sap/ui/mdc/valuehelp/Popover",
					"sap/ui/core/Control"
				]).then(function (aLoaded) {
					const FixedList = aLoaded[0];
					const FixedListItem = aLoaded[1];
					const ValueHelp = aLoaded[2];
					const Popover = aLoaded[3];
					const Control = aLoaded[4];

					const getMonthItems = function() {
						if (!this._aMonthsItems) {
							const aMonths = _getMonths.apply(this);
							this._aMonthsItems = [];

							for (let i = 0; i < 12; i++) {
								this._aMonthsItems.push({
									text: aMonths[i],
									key: i
								});
							}
						}

						return this._aMonthsItems;
					}.bind(this);

					const oMonthValueHelp = new ValueHelp(sId, {
						typeahead: new Popover(sId + "-pop", {
							content: [new FixedList(sId + "-FL", {
								filterList: false,
								useFirstMatch: true,
								items: {
									path: "$items>/",
									template: new FixedListItem({
										text: "{$items>text}",
										key: "{$items>key}"
									}),
									templateShareable: false
								}
							})]
						})
					}).setModel(new JSONModel(getMonthItems()), "$items");

					// put in static UIArea to have only one instance. As in UIArea only controls are alloweg we need a dummy Control
					try {
						const oStaticUIArea = StaticArea.getUIArea();
						const oControl = new Control(sId + "-parent", {dependents: [oMonthValueHelp]});
						oStaticUIArea.addContent(oControl, true); // do not invalidate UIArea
					} catch (e) {
						Log.error(e);
						throw new Error("MonthValueHelp cannot be assigned because static UIArea cannot be determined.");
					}

				}.bind(this));
			}

			return sId;

		}

		return FilterOperatorUtil;

}, /* bExport= */ true);
