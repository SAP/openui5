/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/core/Lib",
		'sap/ui/model/FilterOperator',
		'sap/ui/model/Filter',
		'sap/ui/model/ValidateException',
		'sap/base/Log',
		'sap/ui/mdc/enums/FieldDisplay',
		'sap/ui/mdc/enums/OperatorName',
		'./Operator',
		'./RangeOperator',
		'sap/ui/mdc/enums/BaseType',
		'sap/ui/mdc/enums/ConditionValidated',
		'sap/ui/mdc/enums/OperatorValueType',
		'sap/ui/mdc/util/loadModules',
		'sap/ui/core/date/UniversalDate',
		'sap/ui/core/date/UniversalDateUtils',
		'sap/ui/core/date/UI5Date',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/StaticArea',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/type/Integer',
		'sap/ui/model/BindingMode',
		'sap/base/i18n/Localization'
	], (
	Library,
	ModelOperator,
	Filter,
	ValidateException,
	Log,
	FieldDisplay,
	OperatorName,
	Operator,
	RangeOperator,
	BaseType,
	ConditionValidated,
	OperatorValueType,
	loadModules,
	UniversalDate,
	UniversalDateUtils,
	UI5Date,
	DateFormat,
	StaticArea,
	JSONModel,
	// the Integer type must be  available for some of the RangeOperators
	Integer,
	BindingMode,
	Localization
) => {
	"use strict";

	// translation utils
	let oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	let oMessageBundleM = Library.getResourceBundleFor("sap.m");
	Localization.attachChange(() => {
		oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
		oMessageBundleM = Library.getResourceBundleFor("sap.m");
	});

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
			 * "Equal to" operator
			 */
			equal: new Operator({
				name: OperatorName.EQ,
				alias: { Date: "DATE", DateTime: "DATETIME" },
				filterOperator: ModelOperator.EQ,
				// tokenParse: "^=([^=].*)$",
				tokenTest: "^=(.+)?$", // To check if operator used, it needs to start with "="
				tokenParse: "^=?(.+)?$", // if "=" not entered the complete text should be parsed
				tokenFormat: "{1} ({0})", // all placeholder should use the {x} format - the text could be store in the resourcebundle file.
				longText: _getText(OperatorName.EQ, true),
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
				parse: function(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, bHideOperator) {
					sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
					let aResult = Operator.prototype.parse.apply(this, [sText,
						oType,
						sDisplayFormat,
						bDefaultOperator,
						aCompositeTypes,
						oAdditionalType,
						aAdditionalCompositeTypes,
						bHideOperator
					]);

					if (bDefaultOperator && (!aResult || aResult[0] === null || aResult[0] === undefined) && sDisplayFormat !== FieldDisplay.Value) {
						// in default case and no key determined (simple-EQ case)-> use text as key (parse again to use type)
						sDisplayFormat = FieldDisplay.Value;
						aResult = Operator.prototype.parse.apply(this, [sText,
							oType,
							sDisplayFormat,
							bDefaultOperator,
							aCompositeTypes,
							oAdditionalType,
							aAdditionalCompositeTypes,
							bHideOperator
						]);
					}
					if (aResult && (aResult[1] === null || aResult[1] === undefined) && sDisplayFormat === FieldDisplay.Value) {
						aResult = [aResult[0]]; // only key
					}

					return aResult;
				},
				getValues: function(sText, sDisplayFormat, bDefaultOperator, bHideOperator) {
					const regExp = bHideOperator ? this.hiddenOperatorRegExp : this.tokenParseRegExp; // if operator symbol is not used -> use complete text
					const aMatch = sText.match(regExp);
					let aValues;
					if (aMatch && aMatch.length > 1 && aMatch[1] !== undefined) { // only if a text was found
						const sValue = aMatch[1];
						const sTokenText = this.displayFormats[sDisplayFormat];
						const iKeyIndex = sTokenText.indexOf("{0}");
						const iDescriptionIndex = sTokenText.indexOf("{1}");
						let sKey;
						let sDescription;

						if (iKeyIndex >= 0 && iDescriptionIndex >= 0) {
							// split string
							// nested brackets are hard to parse as while typing they might be incomplete. So we assume that the key don't contains brackets, only the description.
							const bKeyFirst = iKeyIndex < iDescriptionIndex;
							let sStart = bKeyFirst ? sTokenText.substring(iKeyIndex + 3, iDescriptionIndex) : sTokenText.substring(iDescriptionIndex + 3, iKeyIndex);
							const sEnd = bKeyFirst ? sTokenText.slice(iDescriptionIndex + 3) : sTokenText.slice(iKeyIndex + 3);
							let iStart = bKeyFirst ? sValue.indexOf(sStart) : sValue.lastIndexOf(sStart); // we assume key will not contain a bracket

							if (iStart === -1) { // maybe space missing
								sStart = "(";
								iStart = bKeyFirst ? sValue.indexOf(sStart) : sValue.lastIndexOf(sStart);
							}

							if (iStart > 0 && (sValue.lastIndexOf(sEnd) === sValue.length - sEnd.length || sValue.lastIndexOf(sEnd) < iStart)) { // if closing bracket missing just take everything starting from opening bracket
								let iEnd = sValue.length;
								if (sValue.slice(iEnd - sEnd.length) === sEnd) {
									iEnd = iEnd - sEnd.length;
								}
								const sValue1 = sValue.substring(0, iStart);
								const sValue2 = sValue.substring(iStart + sStart.length, iEnd);
								if (bKeyFirst) {
									sKey = sValue1;
									sDescription = sValue2;
								} else {
									sKey = sValue2;
									sDescription = sValue1;
								}
							} else if (bKeyFirst) {
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
					return { value: oCondition.values[0] }; // compare only key
				},
				checkValidated: function(oCondition) {
					if (oCondition.values.length === 2 && oCondition.values[0] !== undefined && oCondition.values[1] !== null && oCondition.values[1] !== undefined) {
						// key known (even empty key) and description known
						oCondition.validated = ConditionValidated.Validated;
					} else {
						oCondition.validated = ConditionValidated.NotValidated;
					}
				},
				validateInput: true,
				getTextForCopy: function(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {
					if (oCondition.validated !== ConditionValidated.Validated) {
						// for not validated condition just return the output as description and let it be parsed on paste
						return Operator.prototype.getTextForCopy.apply(this, arguments);
					} else {
						const [vKey, vDescription] = oCondition.values;
						const sKey = this._formatValue(vKey, oType, aCompositeTypes);
						const sDescription = vDescription === undefined ? "" : this._formatValue(vDescription, oAdditionalType, aAdditionalCompositeTypes);

						return sKey + "\t" + sDescription;
					}
				}
			}),
			/*
			 * "Between" operator
			 */
			between: new Operator({
				name: OperatorName.BT,
				alias: { Date: "DATERANGE", DateTime: "DATETIMERANGE" },
				filterOperator: ModelOperator.BT,
				tokenTest: "^([^!].*)\\.\\.\\.(.+)$", // TODO: does this work?? At least also matches crap like ".....". I guess validation of value types needs to get rid of those.
				tokenParse: "^(.*)\\.\\.\\.(.*)$|^(.+)$",
				tokenFormat: "{0}...{1}",
				longText: _getText(OperatorName.BT, true),
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
			 * "Not Between" operator
			 */
			notBetween: new Operator({
				name: OperatorName.NOTBT,
				filterOperator: ModelOperator.NB,
				tokenTest: ["^!\\((.+)\\.\\.\\.(.+)\\)$", "^!(.+)\\.\\.\\.(.+)$"].join("|"),
				tokenParse: ["^!\\((.*)\\.\\.\\.(.*)\\)$", "^!(.*)\\.\\.\\.(.*)$", "^(.+)$"].join("|"),
				tokenFormat: "!({0}...{1})",
				longText: _getText(OperatorName.NOTBT, true),
				valueTypes: [OperatorValueType.Self, OperatorValueType.Self],
				exclude: true,
				validate: function(aValues, oType) {
					FilterOperatorUtil._mOperators.between.validate(aValues, oType);
				}
			}),
			/*
			 * "Less Than" operator
			 */
			lessThan: new Operator({
				name: OperatorName.LT,
				filterOperator: ModelOperator.LT,
				// tokenParse: "^<([^=].*)$",
				tokenTest: "^<([^=].*)?$", // To check if operator used, it needs to start with "<"
				tokenParse: "^<?(.+)?$", // if "<" not entered the complete text should be parsed
				tokenFormat: "<{0}",
				longText: _getText(OperatorName.LT, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.LT, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self]
			}),
			/*
			 * "Not Less Than" operator
			 */
			notLessThan: new Operator({
				name: OperatorName.NOTLT,
				filterOperator: ModelOperator.GE,
				// tokenParse: "^!<([^=].*)$",
				tokenTest: ["^!\\(<([^=].*)?\\)$", "^!<([^=].*)?$"].join("|"),
				tokenParse: ["^!\\(<?(.+)?\\)$", "^(!<)?(.+)?$"].join("|"),
				tokenFormat: "!(<{0})",
				longText: _getText(OperatorName.NOTLT, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.NOTLT, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self],
				exclude: true
			}),
			/*
			 * "Greater Than" operator
			 */
			greaterThan: new Operator({
				name: OperatorName.GT,
				filterOperator: ModelOperator.GT,
				// tokenParse: "^>([^=].*)$",
				tokenTest: "^>([^=].*)?$", // To check if operator used, it needs to start with ">"
				tokenParse: "^>?(.+)?$", // if ">" not entered the complete text should be parsed
				tokenFormat: ">{0}",
				longText: _getText(OperatorName.GT, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.GT, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self]
			}),
			/*
			 * "Not Greater Than" operator
			 */
			notGreaterThan: new Operator({
				name: OperatorName.NOTGT,
				filterOperator: ModelOperator.LE,
				// tokenParse: "^!>([^=].*)$",
				tokenTest: ["^!\\(>([^=].*)?\\)$","^!>([^=].*)?$"].join("|"),
				tokenParse: ["^!\\(>(.+)?\\)$", "^(!>)?(.+)?$"].join("|") ,
				tokenFormat: "!(>{0})",
				longText: _getText(OperatorName.NOTGT, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.NOTGT, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self],
				exclude: true
			}),
			/*
			 * "Less Than Or Equal To" operator
			 */
			lessEqual: new Operator({
				name: OperatorName.LE,
				alias: { Date: "TO", DateTime: "TODATETIME" },
				filterOperator: ModelOperator.LE,
				// tokenParse: "^<=(.+)$",
				tokenTest: "^<=(.+)?$",
				tokenParse: "^(<=)?(.+)?$",
				tokenFormat: "<={0}",
				longText: _getText(OperatorName.LE, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.LE, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self]
			}),
			/*
			 * "Not Less Than Or Equal To" operator
			 */
			notLessEqual: new Operator({
				name: OperatorName.NOTLE,
				filterOperator: ModelOperator.GT,
				// tokenParse: "^!<=(.+)$",
				tokenTest: ["^!\\(<=(.+)?\\)$", "^!<=(.+)?$"].join("|"),
				tokenParse: ["^!\\(<=(.+)?\\)$", "^(!<=)?(.+)?$"].join("|"),
				tokenFormat: "!(<={0})",
				longText: _getText(OperatorName.NOTLE, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.NOTLE, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self],
				exclude: true
			}),
			/*
			 * "Greater Than Or Equal To" operator
			 */
			greaterEqual: new Operator({
				name: OperatorName.GE,
				alias: { Date: "FROM", DateTime: "FROMDATETIME" },
				filterOperator: ModelOperator.GE,
				// tokenParse: "^>=(.+)$",
				tokenTest: "^>=(.+)?$",
				tokenParse: "^(>=)?(.+)?$",
				tokenFormat: ">={0}",
				longText: _getText(OperatorName.GE, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.GE, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self]
			}),
			/*
			 * "Not Greater Than Or Equal To" operator
			 */
			notGreaterEqual: new Operator({
				name: OperatorName.NOTGE,
				filterOperator: ModelOperator.LT,
				// tokenParse: "^!>=(.+)$",
				tokenTest: ["^!\\(>=(.+)?\\)$", "^!>=(.+)?$"].join("|"),
				tokenParse: ["^!\\(>=(.+)?\\)$", "^(!>=)?(.+)?$"].join("|"),
				tokenFormat: "!(>={0})",
				longText: _getText(OperatorName.NOTGE, true),
				longTextForTypes: _getLongTextForTypes(OperatorName.NOTGE, [BaseType.Date]),
				valueTypes: [OperatorValueType.Self],
				exclude: true
			}),
			/*
			 * "Starts With" operator
			 */
			startsWith: new Operator({
				name: OperatorName.StartsWith,
				filterOperator: ModelOperator.StartsWith,
				// tokenParse: "^([^!\\*]+.*)\\*$",
				tokenTest: "^([^!\\*]+.*)\\*$",
				tokenParse: "^(.+)\\*$|^(.*[^\\*])$",
				tokenFormat: "{0}*",
				longText: _getText(OperatorName.StartsWith, true),
				valueTypes: [OperatorValueType.SelfNoParse]
			}),
			/*
			 * "Does Not Start With" operator
			 */
			notStartsWith: new Operator({
				name: OperatorName.NotStartsWith,
				filterOperator: ModelOperator.NotStartsWith,
				// tokenParse: "^!([^\\*].*)\\*$",
				tokenTest: ["^!\\(([^\\*].*)\\*\\)$", "^!([^\\*].*)\\*$"].join("|"),
				tokenParse: ["^!\\((.+)\\*\\)$", "^!?(.+)\\*$", "^(.*[^\\*])$"].join("|"),
				tokenFormat: "!({0}*)",
				longText: _getText(OperatorName.NotStartsWith, true),
				valueTypes: [OperatorValueType.SelfNoParse],
				exclude: true
			}),
			/*
			 * "Ends With" operator
			 */
			endsWith: new Operator({
				name: OperatorName.EndsWith,
				filterOperator: ModelOperator.EndsWith,
				// tokenParse: "^\\*(.*[^\\*])$",
				tokenTest: "^\\*(.*[^\\*])$",
				tokenParse: "^\\*?(.+)?$",
				tokenFormat: "*{0}",
				longText: _getText(OperatorName.EndsWith, true),
				valueTypes: [OperatorValueType.SelfNoParse]
			}),
			/*
			 * "Does Not End With" operator
			 */
			notEndsWith: new Operator({
				name: OperatorName.NotEndsWith,
				filterOperator: ModelOperator.NotEndsWith,
				// tokenParse: "^!\\*(.*[^\\*])$",
				tokenTest: ["^!\\(\\*(.*[^\\*])\\)$", "^!\\*(.*[^\\*])$"].join("|"),
				tokenParse: ["^!\\(\\*(.+)?\\)$", "^(!\\*)?(.+)?$"].join("|"),
				tokenFormat: "!(*{0})",
				longText: _getText(OperatorName.NotEndsWith, true),
				valueTypes: [OperatorValueType.SelfNoParse],
				exclude: true
			}),
			/*
			 * "Contains" operator
			 */
			contains: new Operator({
				name: OperatorName.Contains,
				filterOperator: ModelOperator.Contains,
				// tokenParse: "^\\*(.*)\\*$",
				tokenTest: "^\\*(.*)\\*$",
				tokenParse: "^\\*(.+)?\\*$|^([^\\*]?.*[^\\*]?)$",
				tokenFormat: "*{0}*",
				longText: _getText(OperatorName.Contains, true),
				valueTypes: [OperatorValueType.SelfNoParse]
			}),
			/*
			 * "Does Not Contain" operator
			 */
			notContains: new Operator({
				name: OperatorName.NotContains,
				filterOperator: ModelOperator.NotContains,
				// tokenParse: "^!\\*(.*)\\*$",
				tokenTest: ["^!\\(\\*(.*)\\*\\)$", "^!\\*(.*)\\*$"].join("|"),
				tokenParse: ["^!\\(\\*(.+)?\\*\\)$", "^!\\*(.+)?\\*$", "^!?(.+)$"].join("|"),
				tokenFormat: "!(*{0}*)",
				longText: _getText(OperatorName.NotContains, true),
				valueTypes: [OperatorValueType.SelfNoParse],
				exclude: true
			}),
			/*
			 * "Not Equal To" operator
			 */
			notEqual: new Operator({
				name: OperatorName.NE,
				filterOperator: ModelOperator.NE,
				// tokenParse: "^!=(.+)$",
				tokenTest: ["^!\\(=(.+)?\\)$", "^!=(.+)?$"].join("|"),
				tokenParse: ["^!\\(=(.+)?\\)$", "^(!=)?(.+)?$"].join("|"),
				tokenFormat: "!(={0})",
				longText: _getText(OperatorName.NE, true),
				valueTypes: [OperatorValueType.Self],
				exclude: true
			}),
			/*
			 * "Empty" operator
			 */
			empty: new Operator({
				name: OperatorName.Empty,
				filterOperator: ModelOperator.EQ,
				tokenParse: "^<#tokenText#>$",
				tokenFormat: "<#tokenText#>",
				longText: _getText(OperatorName.Empty, true),
				tokenText: _getText(OperatorName.Empty, false),
				valueTypes: [],
				getModelFilter: function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
					const oAnyAllPath = _getAnyAllPath(sFieldPath);
					if (oAnyAllPath) {
						// Any or All Filter -> Empty needs to filter for non-existance of navigation targets
						// once the NOT-filtering exists this can be changed into NOT-Any (at least for oData V4)
						return new Filter({
							path: oAnyAllPath.navPath,
							operator: ModelOperator.All,
							variable: "L1",
							condition: new Filter({
									filters: [ // create a Filter that cannot bring a result
										new Filter({path: "L1/" + oAnyAllPath.propertyPath, operator: ModelOperator.EQ, value1: null}),
										new Filter({path: "L1/" + oAnyAllPath.propertyPath, operator: ModelOperator.NE, value1: null})
										],
									and: true
								})
							});
					} else if (sBaseType === BaseType.String) { // depending on backend and/or Type configuration filter is "" or null
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
							return new Filter({
								filters: [new Filter({ path: sFieldPath, operator: ModelOperator.EQ, value1: "" }), new Filter({ path: sFieldPath, operator: ModelOperator.EQ, value1: null })],
								and: false
							});
						} else {
							return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: "" });
						}
					} else { // per default filter for null
						return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: null });
					}
				}
			}),
			/*
			 * "Not Empty" operator
			 */
			notEmpty: new Operator({
				name: OperatorName.NotEmpty,
				filterOperator: ModelOperator.NE,
				tokenParse: ["^!\\(<#tokenText#>\\)$", "^!<#tokenText#>$"].join("|"),
				tokenFormat: "!(<#tokenText#>)",
				longText: _getText(OperatorName.NotEmpty, true),
				tokenText: _getText(OperatorName.NotEmpty, false),
				valueTypes: [],
				exclude: true,
				getModelFilter: function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
					const oAnyAllPath = _getAnyAllPath(sFieldPath);
					if (oAnyAllPath) {
						// Any or All Filter -> NotEmpty needs to filter for existance of navigation targets
						return new Filter({
							path: oAnyAllPath.navPath,
							operator: ModelOperator.Any
							});
					} else if (sBaseType === BaseType.String) { // depending on backend and/or Type configuration filter is "" or null
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
							return new Filter({
								filters: [new Filter({ path: sFieldPath, operator: ModelOperator.NE, value1: "" }), new Filter({ path: sFieldPath, operator: ModelOperator.NE, value1: null })],
								and: true
							});
						} else {
							return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: "" });
						}
					} else { // per default filter for not-null
						return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: null });
					}
				}
			}),
			/*
			 * "Yesterday" operator
			 */
			yesterday: new RangeOperator({
				name: OperatorName.YESTERDAY,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_YESTERDAY_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_YESTERDAY_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.yesterday();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Today" operator
			 */
			today: new RangeOperator({
				name: OperatorName.TODAY,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_TODAY_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_TODAY_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.today();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Tomorrow" operator
			 */
			tomorrow: new RangeOperator({
				name: OperatorName.TOMORROW,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_TOMORROW_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_TOMORROW_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.tomorrow();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Last X Days" operator
			 */
			lastDays: new RangeOperator({
				name: OperatorName.LASTDAYS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.lastDays(iDuration);
				}
			}),
			/*
			 * "First Date In This Week" operator
			 */
			firstDayWeek: new RangeOperator({
				name: OperatorName.FIRSTDAYWEEK,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYWEEK_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYWEEK_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.firstDayOfWeek();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Last Date In This Week" operator
			 */
			lastDayWeek: new RangeOperator({
				name: OperatorName.LASTDAYWEEK,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYWEEK_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYWEEK_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastDayOfWeek();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "First Date In This Month" operator
			 */
			firstDayMonth: new RangeOperator({
				name: OperatorName.FIRSTDAYMONTH,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYMONTH_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYMONTH_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.firstDayOfMonth();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Last Date In This Month" operator
			 */
			lastDayMonth: new RangeOperator({
				name: OperatorName.LASTDAYMONTH,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYMONTH_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYMONTH_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastDayOfMonth();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "First Date In This Quarter" operator
			 */
			firstDayQuarter: new RangeOperator({
				name: OperatorName.FIRSTDAYQUARTER,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYQUARTER_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYQUARTER_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.firstDayOfQuarter();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Last Date In This Quarter" operator
			 */
			lastDayQuarter: new RangeOperator({
				name: OperatorName.LASTDAYQUARTER,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYQUARTER_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYQUARTER_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastDayOfQuarter();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "First Date In This Year" operator
			 */
			firstDayYear: new RangeOperator({
				name: OperatorName.FIRSTDAYYEAR,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYYEAR_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_FIRSTDAYYEAR_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.firstDayOfYear();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Last Date In This Year" operator
			 */
			lastDayYear: new RangeOperator({
				name: OperatorName.LASTDAYYEAR,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYYEAR_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYYEAR_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastDayOfYear();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			}),
			/*
			 * "Today -X/ +Y days" operator
			 */
			todayFromTo: new RangeOperator({
				name: OperatorName.TODAYFROMTO,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_TODAYFROMTO_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", undefined, true),
				valueTypes: [
					{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null } }, { name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null } }
				],
				paramTypes: ["([-+]?\\d+)", "([-+]?\\d+)"],
				//label:["x", "y"],
				additionalInfo: "",
				format: function(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, sCustomFormat) {
					// format numbers into strings with leading "+" and "-"
					let sTokenText = sCustomFormat || this.tokenFormat;
					const iFrom = (oCondition.values[0] || 0) * -1;
					const iTo = oCondition.values[1] || 0;
					let sFrom = iFrom < 0 ? "" : "+";
					sFrom = sFrom + this._formatValue(iFrom, this._createLocalType(this.valueTypes[0], oType));
					let sTo = iTo < 0 ? "" : "+";
					sTo = sTo + this._formatValue(iTo, this._createLocalType(this.valueTypes[1], oType));

					if (iFrom <= iTo) {
						sTokenText = sTokenText.replace(new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g"), sFrom);
						sTokenText = sTokenText.replace(new RegExp("\\$" + 1 + "|" + 1 + "\\$" + "|" + "\\{" + 1 + "\\}", "g"), sTo);
					} else {
						sTokenText = sTokenText.replace(new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g"), sTo);
						sTokenText = sTokenText.replace(new RegExp("\\$" + 1 + "|" + 1 + "\\$" + "|" + "\\{" + 1 + "\\}", "g"), sFrom);
					}

					return sTokenText;
				},
				parse: function(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, bHideOperator) {
					const aValues = this.getValues(sText, sDisplayFormat, bDefaultOperator, bHideOperator);
					let iFrom = this._parseValue(aValues[0], this._createLocalType(this.valueTypes[0], oType));
					let iTo = this._parseValue(aValues[1], this._createLocalType(this.valueTypes[1], oType));

					if (iFrom > iTo) {
						const iTemp = iFrom;
						iFrom = iTo;
						iTo = iTemp;
					}
					iFrom = iFrom * -1;
					return [iFrom, iTo];
				},
				calcRange: function(xDays, yDays) {
					let oStart = xDays >= 0 ? UniversalDateUtils.ranges.lastDays(xDays)[0] : UniversalDateUtils.ranges.nextDays(-xDays)[1];
					let oEnd = yDays >= 0 ? UniversalDateUtils.ranges.nextDays(yDays)[1] : UniversalDateUtils.ranges.lastDays(-yDays)[0];

					if (oStart.oDate.getTime() > oEnd.oDate.getTime()) {
						oEnd = [oStart, oStart = oEnd][0];
					}

					return [UniversalDateUtils.resetStartTime(oStart), UniversalDateUtils.resetEndTime(oEnd)];
				}
			}),
			/*
			 * "Next X Days" operator
			 */
			nextDays: new RangeOperator({
				name: OperatorName.NEXTDAYS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTDAYS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.nextDays(iDuration);
				}
			}),
			/*
			 * "Last Week" operator
			 */
			lastWeek: new RangeOperator({
				name: OperatorName.LASTWEEK,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTWEEK_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTWEEK_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastWeek();
				}
			}),
			/*
			 * "This Week" operator
			 */
			thisWeek: new RangeOperator({
				name: OperatorName.THISWEEK,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_THISWEEK_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_THISWEEK_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.currentWeek();
				}
			}),
			/*
			 * "Next Week" operator
			 */
			nextWeek: new RangeOperator({
				name: OperatorName.NEXTWEEK,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTWEEK_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTWEEK_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.nextWeek();
				}
			}),
			/*
			 * "Last X Weeks" operator
			 */
			lastWeeks: new RangeOperator({
				name: OperatorName.LASTWEEKS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTWEEKS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.lastWeeks(iDuration);
				}
			}),
			/*
			 * "Next X Weeks" operator
			 */
			nextWeeks: new RangeOperator({
				name: OperatorName.NEXTWEEKS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTWEEKS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.nextWeeks(iDuration);
				}
			}),
			/*
			 * "Last Month" operator
			 */
			lastMonth: new RangeOperator({
				name: OperatorName.LASTMONTH,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTMONTH_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTMONTH_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastMonth();
				}
			}),
			/*
			 * "This Month" operator
			 */
			thisMonth: new RangeOperator({
				name: OperatorName.THISMONTH,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_THISMONTH_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_THISMONTH_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.currentMonth();
				}
			}),
			/*
			 * "Next Month" operator
			 */
			nextMonth: new RangeOperator({
				name: OperatorName.NEXTMONTH,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTMONTH_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTMONTH_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.nextMonth();
				}
			}),
			/*
			 * "Last X Months" operator
			 */
			lastMonths: new RangeOperator({
				name: OperatorName.LASTMONTHS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTMONTHS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.lastMonths(iDuration);
				}
			}),
			/*
			 * "Next X Months" operator
			 */
			nextMonths: new RangeOperator({
				name: OperatorName.NEXTMONTHS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTMONTHS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.nextMonths(iDuration);
				}
			}),
			/*
			 * "Last Quarter" operator
			 */
			lastQuarter: new RangeOperator({
				name: OperatorName.LASTQUARTER,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTQUARTER_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTQUARTER_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastQuarter();
				}
			}),
			/*
			 * "This Quarter" operator
			 */
			thisQuarter: new RangeOperator({
				name: OperatorName.THISQUARTER,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_THISQUARTER_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_THISQUARTER_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.currentQuarter();
				}
			}),
			/*
			 * "Next Quarter" operator
			 */
			nextQuarter: new RangeOperator({
				name: OperatorName.NEXTQUARTER,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTQUARTER_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTQUARTER_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.nextQuarter();
				}
			}),
			/*
			 * "Last X Quarters" operator
			 */
			lastQuarters: new RangeOperator({
				name: OperatorName.LASTQUARTERS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTQUARTERS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.lastQuarters(iDuration);
				}
			}),
			/*
			 * "Next X Quarters" operator
			 */
			nextQuarters: new RangeOperator({
				name: OperatorName.NEXTQUARTERS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTQUARTERS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.nextQuarters(iDuration);
				}
			}),
			/*
			 * "First Quarter" operator
			 */
			quarter1: new RangeOperator({
				name: OperatorName.QUARTER1,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER1_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER1_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.quarter(1);
				}
			}),
			/*
			 * "Second Quarter" operator
			 */
			quarter2: new RangeOperator({
				name: OperatorName.QUARTER2,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER2_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER2_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.quarter(2);
				}
			}),
			/*
			 * "Third Quarter" operator
			 */
			quarter3: new RangeOperator({
				name: OperatorName.QUARTER3,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER3_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER3_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.quarter(3);
				}
			}),
			/*
			 * "Fourth Quarter" operator
			 */
			quarter4: new RangeOperator({
				name: OperatorName.QUARTER4,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER4_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_QUARTER4_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.quarter(4);
				}
			}),
			/*
			 * "Last Year" operator
			 */
			lastYear: new RangeOperator({
				name: OperatorName.LASTYEAR,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_LASTYEAR_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTYEAR_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.lastYear();
				}
			}),
			/*
			 * "This Year" operator
			 */
			thisYear: new RangeOperator({
				name: OperatorName.THISYEAR,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_THISYEAR_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_THISYEAR_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.currentYear();
				}
			}),
			/*
			 * "Next Year" operator
			 */
			nextYear: new RangeOperator({
				name: OperatorName.NEXTYEAR,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTYEAR_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTYEAR_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.nextYear();
				}
			}),
			/*
			 * "Last X Years" operator
			 */
			lastYears: new RangeOperator({
				name: OperatorName.LASTYEARS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTYEARS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.lastYears(iDuration);
				}
			}),
			/*
			 * "Next X Years" operator
			 */
			nextYears: new RangeOperator({
				name: OperatorName.NEXTYEARS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTYEARS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.nextYears(iDuration);
				}
			}),
			/*
			 * "Month" operator
			 */
			specificMonth: new RangeOperator({
				name: OperatorName.SPECIFICMONTH,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_SPECIFICMONTH_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_SPECIFICMONTH_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", constraints: { minimum: 0, maximum: 11 } }],
				paramTypes: [_getMonthRegExp.call(this)],
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
					const [iValue] = oCondition.values;
					const sTokenText = this.tokenFormat;
					const sReplace = _getMonths.apply(this)[iValue];

					if (bHideOperator) {
						return sReplace;
					} else {
						return sReplace == null ? null : sTokenText.replace(new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g"), sReplace);
					}
				},
				getValues: function(sText, sDisplayFormat, bDefaultOperator, bHideOperator) {
					const aValues = Operator.prototype.getValues.apply(this, arguments);

					if (aValues) {
						return [_getIndexOfMonth.call(this, aValues[0])];
					}

					return null;
				},
				createControl: function(oType, sPath, iIndex, sId) {
					const Field = sap.ui.require("sap/ui/mdc/Field");
					const sValueHelp = _getMonthValueHelp.call(this);
					if (Field && sValueHelp) {

						const oField = new Field(sId, {
							value: { path: sPath, type: oType, mode: BindingMode.TwoWay, targetType: 'raw' },
							display: FieldDisplay.Description,
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
			 * "Month In Year" operator
			 */
			specificMonthInYear: new RangeOperator({
				name: OperatorName.SPECIFICMONTHINYEAR,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_SPECIFICMONTHINYEAR_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_SPECIFICMONTHINYEAR_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", constraints: { minimum: 0, maximum: 11 } }, { name: "sap.ui.model.type.Integer", constraints: { minimum: 1, maximum: 9999 } }],
				paramTypes: [_getMonthRegExp.call(this), "(.+)"],
				additionalInfo: "",
				label: [oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_MONTH.label"), oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_YEAR.label")],
				defaultValues: function() {
					const oDate = new UniversalDate();
					return [
						oDate.getMonth(), oDate.getFullYear()
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
					const [iValue, iYear] = oCondition.values;
					let sTokenText = this.tokenFormat;
					const sReplace = _getMonths.apply(this)[iValue];

					if (bHideOperator) {
						return sReplace + " " + iYear;
					} else {
						const replaceRegExp0 = new RegExp("\\$" + 0 + "|" + 0 + "\\$" + "|" + "\\{" + 0 + "\\}", "g");
						const replaceRegExp1 = new RegExp("\\$" + 1 + "|" + 1 + "\\$" + "|" + "\\{" + 1 + "\\}", "g");
						sTokenText = sReplace == null ? null : sTokenText.replace(replaceRegExp0, sReplace);
						return sTokenText.replace(replaceRegExp1, iYear);
					}
				},
				getValues: function(sText, sDisplayFormat, bDefaultOperator, bHideOperator) {
					const aValues = Operator.prototype.getValues.apply(this, arguments);

					if (aValues) {
						return [_getIndexOfMonth.call(this, aValues[0]), aValues[1]];
					}

					return null;
				},
				createControl: function(oType, sPath, iIndex, sId) {
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
								value: { path: sPath, type: oType, mode: BindingMode.TwoWay, targetType: 'raw' },
								display: FieldDisplay.Description,
								width: "100%",
								valueHelp: sValueHelp
							});
						} else {
							Log.warning("Operator.createControl", "not able to create the control for the operator " + this.name);
						}
					}

					if (iIndex == 1) {
						oField = new Field(sId, {
							value: { path: sPath, type: oType, mode: BindingMode.TwoWay, targetType: 'raw' },
							width: "100%"
						});
					}

					return oField;
				}
			}),
			/*
			 * "Year To Date" operator
			 */
			yearToDate: new RangeOperator({
				name: OperatorName.YEARTODATE,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_YEARTODATE_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_YEARTODATE_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.yearToDate();
				}
			}),
			/*
			 * "Date To Year" operator
			 */
			dateToYear: new RangeOperator({
				name: OperatorName.DATETOYEAR,
				longText: oMessageBundleM.getText("DYNAMIC_DATE_DATETOYEAR_TITLE", undefined, true),
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_DATETOYEAR_FORMAT", undefined, true),
				valueTypes: [OperatorValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.dateToYear();
				}
			}),
			/*
			 * "Last X Minutes" operator
			 */
			lastMinutes: new RangeOperator({
				name: OperatorName.LASTMINUTES,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTMINUTES_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.lastMinutes(iDuration);
				}
			}),
			/*
			 * "Next X Minutes" operator
			 */
			nextMinutes: new RangeOperator({
				name: OperatorName.NEXTMINUTES,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTMINUTES_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.nextMinutes(iDuration);
				}
			}),
			/*
			 * "Last X Hours" operator
			 */
			lastHours: new RangeOperator({
				name: OperatorName.LASTHOURS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTHOURS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.lastHours(iDuration);
				}
			}),
			/*
			 * "Next X Hours" operator
			 */
			nextHours: new RangeOperator({
				name: OperatorName.NEXTHOURS,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTHOURS_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					return UniversalDateUtils.ranges.nextHours(iDuration);
				}
			}),
			/*
			 * "Last X Minutes" operator including current minute
			 */
			lastMinutesIncluded: new RangeOperator({
				name: OperatorName.LASTMINUTESINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTMINUTESINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.lastMinutes(iDuration - 1);
					oResultValues[0].setSeconds(0);
					return oResultValues;
				}
			}),
			/*
			 * "Next X Minutes" operator including current minute
			 */
			nextMinutesIncluded: new RangeOperator({
				name: OperatorName.NEXTMINUTESINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTMINUTESINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.nextMinutes(iDuration - 1);
					oResultValues[1].setSeconds(59);
					return oResultValues;
				}
			}),
			/*
			 * "Last X Hours" operator including current hour
			 */
			lastHoursIncluded: new RangeOperator({
				name: OperatorName.LASTHOURSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTHOURSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.lastHours(iDuration - 1);
					oResultValues[0].setMinutes(0, 0);
					return oResultValues;
				}
			}),
			/*
			 * "Next X Hours" operator including current hour
			 */
			nextHoursIncluded: new RangeOperator({
				name: OperatorName.NEXTHOURSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTHOURSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.nextHours(iDuration - 1);
					oResultValues[1].setMinutes(59, 59);
					return oResultValues;
				}
			}),
			/*
			 * "Last X Days" operator including current day
			 */
			lastDaysIncluded: new RangeOperator({
				name: OperatorName.LASTDAYSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTDAYSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.lastDays(iDuration - 1);
					oResultValues[1] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Next X Days" operator including current day
			 */
			nextDaysIncluded: new RangeOperator({
				name: OperatorName.NEXTDAYSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTDAYSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.nextDays(iDuration - 1);
					oResultValues[0] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Last X Weeks" operator including current week
			 */
			lastWeeksIncluded: new RangeOperator({
				name: OperatorName.LASTWEEKSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTWEEKSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.lastWeeks(iDuration - 1);
					oResultValues[1] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Next X Weeks" operator including current week
			 */
			nextWeeksIncluded: new RangeOperator({
				name: OperatorName.NEXTWEEKSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTWEEKSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.nextWeeks(iDuration  - 1);
					oResultValues[0] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Last X Months" operator including current month
			 */
			lastMonthsIncluded: new RangeOperator({
				name: OperatorName.LASTMONTHSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTMONTHSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.lastMonths(iDuration - 1);
					oResultValues[1] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Next X Months" operator including current month
			 */
			nextMonthsIncluded: new RangeOperator({
				name: OperatorName.NEXTMONTHSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTMONTHSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.nextMonths(iDuration - 1);
					oResultValues[0] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Last X Quarters" operator including current quarter
			 */
			lastQuartersIncluded: new RangeOperator({
				name: OperatorName.LASTQUARTERSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTQUARTERSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.lastQuarters(iDuration - 1);
					oResultValues[1] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Next X Quarters" operator including current quarter
			 */
			nextQuartersIncluded: new RangeOperator({
				name: OperatorName.NEXTQUARTERSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTQUARTERSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.nextQuarters(iDuration - 1);
					oResultValues[0] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Last X Years" operator including current year
			 */
			lastYearsIncluded: new RangeOperator({
				name: OperatorName.LASTYEARSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_LASTYEARSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.lastYears(iDuration - 1);
					oResultValues[1] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			}),
			/*
			 * "Next X Years" operator including current year
			 */
			nextYearsIncluded: new RangeOperator({
				name: OperatorName.NEXTYEARSINCLUDED,
				tokenText: oMessageBundleM.getText("DYNAMIC_DATE_NEXTYEARSINCLUDED_FORMAT", undefined, true),
				valueTypes: [{ name: "sap.ui.model.type.Integer", formatOptions: { emptyString: null }, constraints: { minimum: 0 } }],
				paramTypes: ["(\\d+)"],
				additionalInfo: "",
				calcRange: function(iDuration) {
					const oResultValues = UniversalDateUtils.ranges.nextYears(iDuration - 1);
					oResultValues[0] = UniversalDate.getInstance(UI5Date.getInstance());
					return oResultValues;
				}
			})

		},

		_mDefaultOpsForType: {}, // defines default operators for types

		/**
		 * Adds an operator to the list of known operators.
		 *
		 * <b>Note:</b> For application-specific operators, use an application-specific name to prevent conflicts with different applications.
		 * @param {sap.ui.mdc.condition.Operator} oOperator Operator
		 *
		 * @public
		 */
		addOperator: function(oOperator) {

			if (FilterOperatorUtil._mOperators[oOperator.name]) {
				Log.warning("FilterOperatorUtil.addOperator", "Operator " + oOperator.name + " already exist. It will be overwritten.");
			}
			FilterOperatorUtil._mOperators[oOperator.name] = oOperator; // TODO: use semantic name?

		},

		/**
		 * Adds an array of operators to the list of known operators.
		 *
		 * <b>Note:</b> For application-specific operators, use an application-specific name to prevent conflicts with different applications.
		 * @param {sap.ui.mdc.condition.Operator[]} aOperators Array of operators
		 *
		 * @since: 1.88.0
		 * @public
		 */
		addOperators: function(aOperators) {
			if (!Array.isArray(aOperators)) {
				aOperators = [aOperators];
			}

			aOperators.forEach((oOperator) => {
				FilterOperatorUtil.addOperator(oOperator);
			});
		},

		/**
		 * Removes all given operators from the list of known operators.
		 *
		 * <b>Note</b>: <code>aOperators</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator}, the instance itself, or multiple operators inside an array.
		 *
		 * @param {sap.ui.mdc.condition.Operator[]|sap.ui.mdc.condition.Operator|string[]} aOperators Array of operators
		 *
		 * @since: 1.88.0
		 * @public
		 */
		removeOperators: function(aOperators) {
			if (!Array.isArray(aOperators)) {
				aOperators = [aOperators];
			}

			aOperators.forEach((oOperator) => {
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
			if (typeof vOperator === "string") {
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
		 * <b>Note</b>: <code>aOperators</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator}, the instance itself, or multiple operators inside an array.
		 *
		 * <b>Note</b>: <code>vDefaultOperator</code> must exist as a valid operator for the type.
		 *
		 * @param {sap.ui.mdc.enums.BaseType} sType Basic type
		 * @param {sap.ui.mdc.condition.Operator[]|sap.ui.mdc.condition.Operator|string[]} aOperators Operators
		 * @param {sap.ui.mdc.condition.Operator|string} vDefaultOperator The default operator instance or default operator name
		 *
		 * @public
		 */
		setOperatorsForType: function(sType, aOperators, vDefaultOperator) {
			if (!Array.isArray(aOperators)) {
				aOperators = [aOperators];
			}

			if (!FilterOperatorUtil._mDefaultOpsForType[sType]) {
				FilterOperatorUtil._mDefaultOpsForType[sType] = {};
			}
			FilterOperatorUtil._mDefaultOpsForType[sType].operators = [];

			aOperators.forEach((oOperator) => {
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
				FilterOperatorUtil._mDefaultOpsForType[sType] = {};
			}

			if (typeof vDefaultOperator === "string") {
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
				FilterOperatorUtil._mDefaultOpsForType[sType] = { operators: [] };
			}

			idx = idx === undefined ? FilterOperatorUtil._mDefaultOpsForType[sType].operators.length : idx;
			if (typeof vOperator === "string") {
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
			if (typeof vOperator === "string") {
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
		 * @param {sap.ui.mdc.enums.OperatorName|string} sOperator Name of the operator
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

			if (aOperators.length === 1 && aOperators[0] === OperatorName.EQ) {
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

			aConditions.forEach((oCondition) => {
				const oOperator = this.getOperator(oCondition.operator);
				if (oOperator) {
					oCondition.isEmpty = oOperator.isEmpty(oCondition);
				}
			});

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

				if (oOperator.valueTypes.length === 2 && oOperator.valueTypes[1] === null &&
					(oCondition.values.length < 2 || oCondition.values[1] === null || oCondition.values[1] === undefined)) {
					// IN EQ case (description) is used -> remove description part if empty -> ignore 2nd entry
					iValueTypesLength = iValueTypesLength - 1;
				}

				if (oOperator.valueTypes[0] === OperatorValueType.Static) {
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
		 * @param {string[]} aSupportedOperators List of all supported operator names
		 * @returns {sap.ui.mdc.condition.Operator|undefined} the operator object, or <code>undefined</code> if the operator with the requested name does not exist
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since: 1.100.0
		 */
		getOperatorForDynamicDateOption: function(sOption, sBaseType, aSupportedOperators) {

			const sName = sBaseType && sOption.startsWith(sBaseType) ? sOption.slice(sBaseType.length + 1) : sOption; // determine operator name if used as custom DynamicDateOption created in DateContent using getCustomDynamicDateOptionForOperator
			let oFoundOperator;

			for (const sOperatorName in FilterOperatorUtil._mOperators) {
				const oOperator = FilterOperatorUtil._mOperators[sOperatorName];
				if (aSupportedOperators.length > 0 && aSupportedOperators.indexOf(oOperator.name) < 0) {
					continue; // Operator not supported
				} else if (oOperator.name === sName || oOperator.alias?.[sBaseType] === sOption) {
					oFoundOperator = oOperator;
					break;
				}
			}

			return oFoundOperator;

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
			FilterOperatorUtil._mOperators.empty,

			FilterOperatorUtil._mOperators.notEqual,
			FilterOperatorUtil._mOperators.notBetween,
			FilterOperatorUtil._mOperators.notLessThan,
			FilterOperatorUtil._mOperators.notLessEqual,
			FilterOperatorUtil._mOperators.notGreaterThan,
			FilterOperatorUtil._mOperators.notGreaterEqual,
			FilterOperatorUtil._mOperators.notEmpty,

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
			FilterOperatorUtil._mOperators.lastDaysIncluded,
			FilterOperatorUtil._mOperators.nextDays,
			FilterOperatorUtil._mOperators.nextDaysIncluded,

			FilterOperatorUtil._mOperators.thisWeek,
			FilterOperatorUtil._mOperators.lastWeek,
			FilterOperatorUtil._mOperators.lastWeeks,
			FilterOperatorUtil._mOperators.lastWeeksIncluded,
			FilterOperatorUtil._mOperators.nextWeek,
			FilterOperatorUtil._mOperators.nextWeeks,
			FilterOperatorUtil._mOperators.nextWeeksIncluded,

			FilterOperatorUtil._mOperators.specificMonth,
			FilterOperatorUtil._mOperators.specificMonthInYear,
			FilterOperatorUtil._mOperators.thisMonth,
			FilterOperatorUtil._mOperators.lastMonth,
			FilterOperatorUtil._mOperators.lastMonths,
			FilterOperatorUtil._mOperators.lastMonthsIncluded,
			FilterOperatorUtil._mOperators.nextMonth,
			FilterOperatorUtil._mOperators.nextMonths,
			FilterOperatorUtil._mOperators.nextMonthsIncluded,

			FilterOperatorUtil._mOperators.thisQuarter,
			FilterOperatorUtil._mOperators.lastQuarter,
			FilterOperatorUtil._mOperators.lastQuarters,
			FilterOperatorUtil._mOperators.lastQuartersIncluded,
			FilterOperatorUtil._mOperators.nextQuarter,
			FilterOperatorUtil._mOperators.nextQuarters,
			FilterOperatorUtil._mOperators.nextQuartersIncluded,

			FilterOperatorUtil._mOperators.quarter1,
			FilterOperatorUtil._mOperators.quarter2,
			FilterOperatorUtil._mOperators.quarter3,
			FilterOperatorUtil._mOperators.quarter4,

			FilterOperatorUtil._mOperators.thisYear,
			FilterOperatorUtil._mOperators.lastYear,
			FilterOperatorUtil._mOperators.lastYears,
			FilterOperatorUtil._mOperators.lastYearsIncluded,
			FilterOperatorUtil._mOperators.nextYear,
			FilterOperatorUtil._mOperators.nextYears,
			FilterOperatorUtil._mOperators.nextYearsIncluded,

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
			FilterOperatorUtil._mOperators.empty,

			FilterOperatorUtil._mOperators.notEqual,
			FilterOperatorUtil._mOperators.notBetween,
			FilterOperatorUtil._mOperators.notLessThan,
			FilterOperatorUtil._mOperators.notLessEqual,
			FilterOperatorUtil._mOperators.notGreaterThan,
			FilterOperatorUtil._mOperators.notGreaterEqual,
			FilterOperatorUtil._mOperators.notEmpty,

			FilterOperatorUtil._mOperators.lastMinutes,
			FilterOperatorUtil._mOperators.lastMinutesIncluded,
			FilterOperatorUtil._mOperators.nextMinutes,
			FilterOperatorUtil._mOperators.nextMinutesIncluded,
			FilterOperatorUtil._mOperators.lastHours,
			FilterOperatorUtil._mOperators.lastHoursIncluded,
			FilterOperatorUtil._mOperators.nextHours,
			FilterOperatorUtil._mOperators.nextHoursIncluded,

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
			FilterOperatorUtil._mOperators.lastDaysIncluded,
			FilterOperatorUtil._mOperators.nextDays,
			FilterOperatorUtil._mOperators.nextDaysIncluded,

			FilterOperatorUtil._mOperators.thisWeek,
			FilterOperatorUtil._mOperators.lastWeek,
			FilterOperatorUtil._mOperators.lastWeeks,
			FilterOperatorUtil._mOperators.lastWeeksIncluded,
			FilterOperatorUtil._mOperators.nextWeek,
			FilterOperatorUtil._mOperators.nextWeeks,
			FilterOperatorUtil._mOperators.nextWeeksIncluded,

			FilterOperatorUtil._mOperators.specificMonth,
			FilterOperatorUtil._mOperators.specificMonthInYear,
			FilterOperatorUtil._mOperators.thisMonth,
			FilterOperatorUtil._mOperators.lastMonth,
			FilterOperatorUtil._mOperators.lastMonths,
			FilterOperatorUtil._mOperators.lastMonthsIncluded,
			FilterOperatorUtil._mOperators.nextMonth,
			FilterOperatorUtil._mOperators.nextMonths,
			FilterOperatorUtil._mOperators.nextMonthsIncluded,

			FilterOperatorUtil._mOperators.thisQuarter,
			FilterOperatorUtil._mOperators.lastQuarter,
			FilterOperatorUtil._mOperators.lastQuarters,
			FilterOperatorUtil._mOperators.lastQuartersIncluded,
			FilterOperatorUtil._mOperators.nextQuarter,
			FilterOperatorUtil._mOperators.nextQuarters,
			FilterOperatorUtil._mOperators.nextQuartersIncluded,

			FilterOperatorUtil._mOperators.quarter1,
			FilterOperatorUtil._mOperators.quarter2,
			FilterOperatorUtil._mOperators.quarter3,
			FilterOperatorUtil._mOperators.quarter4,

			FilterOperatorUtil._mOperators.thisYear,
			FilterOperatorUtil._mOperators.lastYear,
			FilterOperatorUtil._mOperators.lastYears,
			FilterOperatorUtil._mOperators.lastYearsIncluded,
			FilterOperatorUtil._mOperators.nextYear,
			FilterOperatorUtil._mOperators.nextYears,
			FilterOperatorUtil._mOperators.nextYearsIncluded,

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
			FilterOperatorUtil._mOperators.equal, FilterOperatorUtil._mOperators.notEqual
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

		for (const oOperator of aOperators) {
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
		aMonths.some((sElement, i) => {
			if (sElement.toLowerCase() === sLowerCaseMonth || Number.parseInt(sMonth) === i + 1) {
				iIndex = i;
				return true;
			}
		});
		return iIndex;
	}

	function _getMonthRegExp() {
		if (!this._sMonthRegExp) {
			const aMonths = _getMonths.apply(this);
			this._sMonthRegExp = "(" + aMonths.join("|") + "|[1-9]|1[0-2])";
		}
		return this._sMonthRegExp;
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
			]).then((aLoaded) => {
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
					const oControl = new Control(sId + "-parent", { dependents: [oMonthValueHelp] });
					oStaticUIArea.addContent(oControl, true); // do not invalidate UIArea
				} catch (e) {
					Log.error(e);
					throw new Error("MonthValueHelp cannot be assigned because static UIArea cannot be determined.");
				}

			});
		}

		return sId;

	}

	function _getText(sName, bLongText) {

		const sTextKey = "operators." + sName + (bLongText ? ".longText" : ".tokenText");
		return oMessageBundle.getText(sTextKey, undefined, true); // use bIgnoreKeyFallback=true to avoid assert messages in the console

	}

	function _getLongTextForTypes(sName, aBaseTypes) {

		const sTextKey = "operators." + sName + ".longText";
		const oTexts = {};

		for (let i = 0; i < aBaseTypes.length; i++) {
			oTexts[aBaseTypes[i]] = oMessageBundle.getText(sTextKey + "." + aBaseTypes[i].toLowerCase(), undefined, true);
		}
		return oTexts;

	}

	function _getAnyAllPath(sFieldPath) {

		const [sNavPath, sPattern, sPropertyPath, sWrongPart] = sFieldPath.split(/([\*\+]\/)/);
		if (sPattern) {
			// Any or All Filter -> Empty needs to filter for non-existance of navigation targets
			if (!sWrongPart) { // only one occurence of pattern allowed
				return {navPath: sNavPath, propertyPath: sPropertyPath};
			} else {
				throw new Error("FilterOperatorUtil: not supported binding " + sFieldPath);
			}
		}

	}

	return FilterOperatorUtil;

});