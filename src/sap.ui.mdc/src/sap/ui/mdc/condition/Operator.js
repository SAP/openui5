/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/Object',
	"sap/ui/core/Lib",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/ParseException',
	'sap/base/Log',
	'sap/base/util/merge',
	'sap/base/util/deepEqual',
	'sap/base/i18n/Localization',
	'sap/base/strings/escapeRegExp',
	'./Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/mdc/enums/OperatorOverwrite',
	'sap/ui/mdc/enums/OperatorValueType'
], (
	BaseObject,
	Library,
	Filter,
	FilterOperator,
	ParseException,
	Log,
	merge,
	deepEqual,
	Localization,
	escapeRegExp,
	Condition,
	ConditionValidated,
	FieldDisplay,
	OperatorOverwrite,
	OperatorValueType
) => {
	"use strict";

	// translation utils
	let oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	Localization.attachChange(() => {
		oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	});

	/**
	 * Object type defining the structure of a <code>ValueType</code> for a {@link sap.ui.mdc.condition.Operator Operator}.
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.mdc.condition.ValueType
	 * @property {string} name name of the data type
	 * @property {object} formatOptions <code>formatOptions</code> of the data type
	 * @property {object} constraints <code>constraints</code> of the data type
	 * @public
	 */

	/**
	 * @class
	 * Creates an <code>sap.ui.mdc.condition.Operator</code> object.
	 * This is used in the {@link sap.ui.mdc.FilterField FilterField} control to define which filter operators are supported.
	 *
	 * If a function or property is initial, the default implementation is used.
	 *
	 * @extends sap.ui.base.Object
	 * @param {object} oConfiguration Properties of the operator
	 * @param {string} oConfiguration.name Name of the operator used in the condition
	 * @param {object} [oConfiguration.alias] Alias names based on <code>BaseType</code>, used to map to <code>DynamicDateOption</code> if <code>DynamicDateRange</code> is used
	 * @param {string} oConfiguration.filterOperator The operator's default filter operator that is created as defined in {@link sap.ui.model.FilterOperator FilterOperator}
	 * @param {string} oConfiguration.tokenParse The string representation of the regular expression that is used by the operator to parse a value
	 *                 to eliminate the operator and get the data string. A placeholder that refers to the translated tokenText can be used. <code>#tokenText#</code> refers to the
	 *                 <code>oConfiguration.tokenText</code> property if given.
	 * @param {string} [oConfiguration.tokenTest] The string representation of the regular expression that is used to test if the given text meets the operator.
	 *                 A placeholder that refers to the translated tokenText can be used. <code>#tokenText#</code> refers to the
	 *                 <code>oConfiguration.tokenText</code> property if given.
	 * 				   <br>If not provided, the <code>tokenParse</code> regular expression is used.
	 * @param {string} oConfiguration.tokenFormat The string representation that is used by the operator to format a value
	 *                 into an output string. For the value placeholder <code>{0}</code> and <code>{1}</code> are used.
	 *                 A placeholder that refers to the translated tokenText can be used. <code>#tokenText#</code> refers to the <code>oConfiguration.tokenText</code> property if given.
	 * @param {string[]|object[]} oConfiguration.valueTypes Array of type to be used. The length of the array defines the number of values that
	 *                 need to be entered with the operator.<br>
	 *                 If set to {@link sap.ui.mdc.enums.OperatorValueType.Self OperatorValueType.Self}, the <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used.<br>
	 *                 If set to {@link sap.ui.mdc.enums.OperatorValueType.SelfNoParse OperatorValueType.SelfNoParse} same as {@link sap.ui.mdc.enums.OperatorValueType.Self OperatorValueType.Self}, except that the input value parsing will not be called.<br>
	 *                 If set to {@link sap.ui.mdc.enums.OperatorValueType.Static OperatorValueType.Static}, a simple string type is used to display static text.<br>
	 *                 If set to a name of a data type, an instance of this data type is used.<br>
	 *                 If set to an object with structure {@link sap.ui.mdc.condition.ValueType},
	 *                 an instance of the corresponding data type is used. The type given via <code>name</code> must be loaded by the application.<br>
	 *                 If set to <code>null</code>, the corresponding value is interpreted as a description that holds no required data. To display this value,
	 *                 the additional <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used.<br>
	 * @param {string[]} [oConfiguration.paramTypes] Array of type parameters regexp
	 * @param {string} [oConfiguration.longText] String representation of the operator as a long text.<br>
	 *                If longText is not given , it is looked up in the resource bundle of the <code>sap.ui.mdc</code> library by the key
	 *                <code>operators.{oConfiguration.name}.longText</code>
	 * @param {string} [oConfiguration.tokenText] String representation of the operator as a short text.<br>
	 *                If the token text is not given, it is looked up in the resource bundle of the <code>sap.ui.mdc</code> library by the key
	 *                <code>operators.{oConfiguration.name}.tokenText</code>
	 * @param {object} [oConfiguration.displayFormats] Pattern how different {@link sap.ui.mdc.enums.FieldDisplay displayFormats} are rendered
	 * @param {function} [oConfiguration.format] Function to format condition
	 * @param {function} [oConfiguration.parse] Function to parse input into condition
	 * @param {function} [oConfiguration.validate] Function to validate condition
	 * @param {function} [oConfiguration.getModelFilter] Function create filter for a condition
	 * @param {function} [oConfiguration.isEmpty] Function to check if condition is empty
	 * @param {function} [oConfiguration.createControl] Function to create a control to be used in {@link sap.ui.mdc.valuehelp.content.Conditions Conditions}
	 * @param {function} [oConfiguration.getCheckValue] Function to get the value for condition compare
	 * @param {function} [oConfiguration.getValues] Function to get the real values without operator symbol
	 * @param {function} [oConfiguration.checkValidated] Function to check if a condition is validated (sets the <code>validated</code> property)
	 * @param {boolean} [oConfiguration.exclude] If set, the operator is handled as exclude filter when creating the filters of all conditions
	 * @param {boolean} [oConfiguration.validateInput] If set, the user input for this operator needs to be validated using a field help
	 * @param {string} [oConfiguration.additionalInfo] additionalInfo text for the operator. Will be shown in the operator suggest as second column. If not used (undefined) the Include or Exclude information of the operator is used.
	 * @param {object} [oConfiguration.group] Additional group settings for the operator. Will be used by the <code>DynamicDateRange</code>. If not used (undefined), the operators will be added to the include and exclude groups.
	 * @param {string} oConfiguration.group.id Group ID for the operator.
	 * @param {function} [oConfiguration.getTextForCopy] Function to determine the text copied into clipboard
	 * The following groups are available for the <code>DynamicDateRange</code> control:<br>
	 * <ul>
	 * <li>1 - Single Dates</li>
	 * <li>2 - Date Ranges</li>
	 * <li>3 - Weeks</li>
	 * <li>4 - Months</li>
	 * <li>5 - Quarters</li>
	 * <li>6 - Years</li>
	 * </ul>
	 * See {@link sap.m.DynamicDateRangeGroups DynamicDateRangeGroups}.<br>
	 * This only works for <code>FilterFields</code> with custom operators if <code>maxConditions=1</code> and no <code>valueHelp</code> is assigned to the <code>FilterField</code>.
	 * Example:<br>
	 * group: undefined - if group is not specified; default behavior include/exclude group with id 1 and 2 will be created<br>
	 * group: {id : 1} - adds the operator to existing group 1 'Single Dates'<br>
	 * group: {id : 2, text: "new group"} - inserts a new group with id 2. Existing group 2 will be shifted to 3, 4....<br>
	 * group: {id : 10, text: "new group at the end"} - adds a new group with id 10 and text "new group as the end" to the end of all groups<br>
	 * @param {string} [oConfiguration.group.text] Group title for the operator. When used a new group with this title will be added.
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.mdc.condition.Operator
	 * @since 1.73.0
	 * @author SAP SE
	 */
	const Operator = BaseObject.extend("sap.ui.mdc.condition.Operator", /** @lends sap.ui.mdc.condition.Operator.prototype */ {
		constructor: function(oConfiguration) {
			BaseObject.apply(this, arguments);

			if (!oConfiguration) {
				throw new Error("Operator configuration missing");
			}
			if (!oConfiguration.name) {
				Log.warning("Operator configuration expects a name property");
			}
			if (!oConfiguration.filterOperator && !oConfiguration.getModelFilter) {
				throw new Error("Operator configuration for " + oConfiguration.name + " needs a default filter operator from sap.ui.model.FilterOperator or the function getModelFilter");
			}

			this._enableOverwrites(oConfiguration);

			// map given properties
			// TODO: for compatibility reasons just put to this.name... but is a API getName better at the end?
			this.name = oConfiguration.name;
			if (oConfiguration.alias) {
				this.alias = oConfiguration.alias;
			}
			this.filterOperator = oConfiguration.filterOperator;
			this.valueTypes = oConfiguration.valueTypes;
			this.paramTypes = oConfiguration.paramTypes;
			this.displayFormats = oConfiguration.displayFormats;

			const sTextKey = "operators." + this.name;
			const sLongTextKey = sTextKey + ".longText";
			const sTokenTextKey = sTextKey + ".tokenText";
			this.longText = oConfiguration.longText || _getText(sLongTextKey) || "";
			this.tokenText = oConfiguration.tokenText || _getText(sTokenTextKey) || "";
			if (this.longText === sLongTextKey) {
				//use the tokenText as longText and replace the {0} and {1} placeholder
				//Example:
				//#XTIT: token text for "last x days" operator
				//operators.LASTDAYS.tokenText=Last {0} days
				//#XTIT: token long text for "last X days" operator
				//__operators.LASTDAYS.longText=Last X days
				this.longText = this.tokenText.replace(/\{0\}/g, "X")
					.replace(/\{1\}/g, "Y");
			}
			if (this.tokenText === sTokenTextKey) {
				this.tokenText = this.longText;
			}

			if (this.tokenText) {
				// create token parsing RegExp
				let sRegExp;
				let sTokenText;
				if (oConfiguration.tokenParse) {
					sTokenText = escapeRegExp(this.tokenText);

					this.tokenParse = oConfiguration.tokenParse.replace(/#tokenText#/g, sTokenText);
					for (let i = 0; i < this.valueTypes.length; i++) {
						const sReplace = this.paramTypes ? this.paramTypes[i] : "(.+)";
						// the regexp will replace placeholder like $0, 0$ and {0}
						// the four \ are required, because the excapeRegExp will escape existing \\
						this.tokenParse = this.tokenParse.replace(new RegExp("\\\\\\$" + i + "|" + i + "\\\\\\$" + "|" + "\\\\\\{" + i + "\\\\\\}", "g"), sReplace);
					}
					sRegExp = this.tokenParse;
				} else {
					sRegExp = escapeRegExp(this.tokenText); // operator without value
				}
				this.tokenParseRegExp = new RegExp(sRegExp, "i");
				if (oConfiguration.tokenTest) {
					sTokenText = escapeRegExp(this.tokenText);

					this.tokenTest = oConfiguration.tokenTest.replace(/#tokenText#/g, sTokenText);
					for (let i = 0; i < this.valueTypes.length; i++) {
						const sReplace = this.paramTypes ? this.paramTypes[i] : "(.+)";
						// the regexp will replace placeholder like $0, 0$ and {0}
						// the four \ are required, because the excapeRegExp will escape existing \\
						this.tokenTest = this.tokenTest.replace(new RegExp("\\\\\\$" + i + "|" + i + "\\\\\\$" + "|" + "\\\\\\{" + i + "\\\\\\}", "g"), sReplace);
					}
					this.tokenTestRegExp = new RegExp(this.tokenTest, "i");
				} else {
					this.tokenTestRegExp = this.tokenParseRegExp;
				}
				this.hiddenOperatorRegExp = new RegExp("^(.+)$", "is"); // empty is not valid (also allown line-breaks and tabs)

				// create token formatter
				if (oConfiguration.tokenFormat) {
					sTokenText = this.tokenText;
					this.tokenFormat = oConfiguration.tokenFormat.replace(/\#tokenText\#/g, sTokenText);
				} else {
					this.tokenFormat = this.tokenText; // static operator with no value (e.g. "THIS YEAR")
				}
			}

			if (oConfiguration.additionalInfo !== undefined) {
				this.additionalInfo = oConfiguration.additionalInfo;
			}

			this.exclude = !!oConfiguration.exclude; // to have always a boolean value
			this.validateInput = !!oConfiguration.validateInput; // to have always a boolean value

			if (oConfiguration.group) {
				this.group = oConfiguration.group;
			} else {
				this.group = { id: !this.exclude ? "1" : "2" };
				if (!this.group.text) {
					this.group.text = oMessageBundle.getText("VALUEHELP.OPERATOR.GROUP" + this.group.id);
				}
			}

			this.symbol = oConfiguration.symbol;
		},
		destroy: function() {
			this._oMethodOverwrites = null;
			BaseObject.protoype.destroy.apply(this, arguments);
		}
	});

	function _getText(sKey, sType) {

		if (sType === "time" || sType === "datetime") {
			sType = "date"; // use the date type operator longname (e.g. before) for all Time and DateTime types.
		}

		const key = sKey + (sType ? "." + sType : "");
		let sText;

		// try to get the resource bundle text (the key might not exist)
		sText = oMessageBundle.getText(key, undefined, true); // use bIgnoreKeyFallback=true to avoid assert messages in the console
		if (sText === key || sText === undefined) {
			if (sType) {
				sText = oMessageBundle.getText(sKey, undefined, true);
				if (sText === key || sText === undefined) {
					sText = sKey;
				}
			} else {
				sText = key;
			}
		}
		return sText;

	}

	/**
	 * Gets the long text for an operator.
	 *
	 * This function can be overwritten see <code>overwrite("getLongText", ...)</code>
	 *
	 * @param {sap.ui.mdc.enums.BaseType} sBaseType Basic type
	 * @returns {string} text
	 *
	 * @private
	 * @since 1.113
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.DefineConditionPanel
	 */
	Operator.prototype.getLongText = function(sBaseType) {
		const sTxtKey = this.textKey || "operators." + this.name + ".longText";
		let sLongText = _getText(sTxtKey, sBaseType.toLowerCase());

		if (sLongText === sTxtKey) {
			// when the returned text is the key, a type dependent longText does not exist and we use the default (custom) longText for the operator
			sLongText = this.longText;
		}

		return sLongText;

	};

	/**
	 * Creates a filter object for a condition.
	 *
	 * This function can be overwritten see <code>overwrite("getModelFilter", ...)</code>
	 *
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
	 * @param {string} sFieldPath Path of filter
	 * @param {sap.ui.model.Type} oType Data type of the used filter field
	 * @param {boolean} [bCaseSensitive] creates a caseSensitive filter
	 * @param {sap.ui.mdc.enums.BaseType} [sBaseType] Basic type
	 * @returns {sap.ui.model.Filter} filter object
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 */
	Operator.prototype.getModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {

		let vValue = oCondition.values[0];
		let oFilter;
		let oFilterUnit;
		const aFieldPaths = sFieldPath.split(",");
		// TODO: CompositeType (Unit/Currency) -> also filter for unit
		if (Array.isArray(vValue) && aFieldPaths.length > 1) {
			vValue = vValue[0];
			sFieldPath = aFieldPaths[0];
			oFilterUnit = new Filter({ path: aFieldPaths[1], operator: FilterOperator.EQ, value1: oCondition.values[0][1] });
		}
		if (oFilterUnit && vValue === undefined) {
			// filter only for unit
			oFilter = oFilterUnit;
			oFilterUnit = undefined;
		} else if (!this.valueTypes[1]) { // in EQ case ignore description
			if (!bCaseSensitive && oCondition.validated === ConditionValidated.Validated) {
				// for validated Item conditions we always set caseSensitive to true;
				bCaseSensitive = true;
			}
			oFilter = new Filter({ path: sFieldPath, operator: this.filterOperator, value1: vValue, caseSensitive: bCaseSensitive === false ? false : undefined });
		} else {
			let vValue2 = oCondition.values[1];
			if (Array.isArray(vValue2) && aFieldPaths.length > 1) {
				vValue2 = vValue2[0];
				// use same unit as for value1
			}
			oFilter = new Filter({ path: sFieldPath, operator: this.filterOperator, value1: vValue, value2: vValue2, caseSensitive: bCaseSensitive === false ? false : undefined });
		}

		if (oFilterUnit) {
			oFilter = new Filter({ filters: [oFilter, oFilterUnit], and: true });
		}

		// add filter for in-parameters
		if (oCondition.inParameters) {
			const aFilters = [oFilter];
			for (const sInPath in oCondition.inParameters) {
				if (sInPath.startsWith("conditions/")) { // only use InParameters that are in the same ConditionModel (Parameters from outside might not be valid filters)
					aFilters.push(new Filter({ path: sInPath.slice(11), operator: FilterOperator.EQ, value1: oCondition.inParameters[sInPath] }));
				}
			}
			if (aFilters.length > 1) {
				oFilter = new Filter({ filters: aFilters, and: true });
			}
		}

		return oFilter;

	};


	/**
	 * Checks if a condition is empty.
	 *
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
	 * @param {sap.ui.model.Type} oType Data type
	 * @returns {boolean} true if empty
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype.isEmpty = function(oCondition, oType) {

		let isEmpty = false;

		if (oCondition) {
			for (let i = 0; i < this.valueTypes.length; i++) {
				if (this.valueTypes[i] !== OperatorValueType.Static) {
					const vValue = oCondition.values[i];
					if (vValue === null || vValue === undefined || vValue === "") { //TODO:  empty has to use the oType information
						isEmpty = true;
						break;
					}
				}
			}
		}

		return isEmpty;

	};

	/**
	 * Formats a condition.
	 *
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
	 * @param {sap.ui.model.Type} [oType] Data type
	 * @param {sap.ui.mdc.enums.FieldDisplay} [sDisplay] Display mode
	 * @param {boolean} [bHideOperator=false] If set, the operator must not be visible for the user, so only the formatted value is shown
	 * @param {sap.ui.model.Type[]} [aCompositeTypes] Additional types used for each part of a <code>CompositeType</code>
	 * @param {sap.ui.model.Type} [oAdditionalType] Data type for additional value
	 * @param {sap.ui.model.Type[]} [aAdditionalCompositeTypes] Additional types used for each part of a <code>CompositeType</code> (if <code>oAdditionalType</code> is a <code>CompositeType</code>)
	 * @param {string} [sCustomFormat] Custom text format which should be formatted
	 * @returns {string} formatted text
	 * @throws {sap.ui.model.FormatException} if the values cannot be formatted
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype.format = function(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, sCustomFormat) { // sDisplay, oAdditionalType and aAdditionalCompositeTypes needed in EQ formatter

		const aValues = oCondition.values;
		const iCount = this.valueTypes.length;
		const sTextFormat = sCustomFormat || this.tokenFormat;
		let sTokenText = bHideOperator && iCount === 1 ? "{0}" : sTextFormat;
		for (let i = 0; i < iCount; i++) {
			let oUseType;
			let aUseCompositeTypes;
			if (this.valueTypes[i] !== OperatorValueType.Static) {
				if (this.valueTypes[i] === OperatorValueType.Self) {
					oUseType = oType;
					aUseCompositeTypes = aCompositeTypes;
				} else if (this.valueTypes[i] === null) { // description
					oUseType = oAdditionalType;
					aUseCompositeTypes = aAdditionalCompositeTypes;
				} else {
					oUseType = this._createLocalType(this.valueTypes[i], oType);
				}
				let vValue = aValues[i];
				if (vValue === undefined || vValue === null) {
					vValue = oUseType ? oUseType.parseValue("", "string") : ""; // for empty value use initial value of type
				}
				let sReplace = this._formatValue(vValue, oUseType, aUseCompositeTypes);
				if (typeof sReplace === "string") {
					sReplace = sReplace.replace(/\$/g, '$$$'); // as "$$" has a special handling in replace, it will be transformed into "$"
				}
				// the regexp will replace placeholder like $0, 0$ and {0}
				sTokenText = sTokenText.replace(new RegExp("\\$" + i + "|" + i + "\\$" + "|" + "\\{" + i + "\\}", "g"), sReplace);
			}
		}
		return sTokenText;

	};

	/**
	 * Formats a value using the data type.
	 *
	 * if a <code>CompositeType is used</code> and it needs internal values, the corresponding data types are used to provide these values.
	 *
	 * @param {any} vValue value
	 * @param {sap.ui.model.Type} [oType] Data type
	 * @param {sap.ui.model.Type[]} [aCompositeTypes] Additional types used for each part of a <code>CompositeType</code>
	 * @returns {string} formatted text
	 * @throws {sap.ui.model.FormatException} if the values cannot be formatted
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype._formatValue = function(vValue, oType, aCompositeTypes) {

		let sText;

		if (oType) {
			if (oType.isA("sap.ui.model.CompositeType") && oType.getUseInternalValues() && Array.isArray(vValue) && aCompositeTypes) {
				vValue = merge([], vValue); // use copy to not change original array
				for (let i = 0; i < vValue.length; i++) {
					if (aCompositeTypes[i]) {
						const oFormat = aCompositeTypes[i].getModelFormat();
						if (oFormat && typeof oFormat.parse === "function") {
							vValue[i] = oFormat.parse(vValue[i]);
						}
					}
				}
			}
			sText = oType.formatValue(vValue, "string");
		} else {
			sText = vValue;
		}

		return sText;

	};

	/**
	 * Parses a text.
	 *
	 * Parsing doesn't check operator validity. For checking if the text is valid for the operator use the {@link #test} function.
	 * Parsing just extracts the real text(s) from the given text and removes the operator information.
	 *
	 * @param {string} sText Text
	 * @param {sap.ui.model.Type} oType Data type
	 * @param {sap.ui.mdc.enums.FieldDisplay} sDisplayFormat Display format
	 * @param {boolean} bDefaultOperator If true, operator is used as default. In this case parsing without operator also works
	 * @param {sap.ui.model.Type[]} [aCompositeTypes] Additional types used for each part of a <code>CompositeType</code>
	 * @param {sap.ui.model.Type} [oAdditionalType] Data type for additional value
	 * @param {sap.ui.model.Type[]} [aAdditionalCompositeTypes] Additional types used for each part of a <code>CompositeType</code> (if <code>oAdditionalType</code> is a <code>CompositeType</code>)
	 * @param {boolean} [bHideOperator=false] If set, the operator must not be visible for the user, so if the user enters it, it is part of the text
	 * @returns {any[]} array of values
	 * @throws {sap.ui.model.ParseException} if the text cannot be parsed
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype.parse = function(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, bHideOperator) {

		const aValues = this.getValues(sText, sDisplayFormat, bDefaultOperator, bHideOperator);
		let aResult; // might remain undefined - if no match
		if (aValues) {
			aResult = [];
			for (let i = 0; i < this.valueTypes.length; i++) {
				let oUseType;
				let aUseCompositeTypes;
				if (this.valueTypes[i] === OperatorValueType.Self) {
					oUseType = oType;
					aUseCompositeTypes = aCompositeTypes;
				} else if (this.valueTypes[i] === null) { // description
					oUseType = oAdditionalType;
					aUseCompositeTypes = aAdditionalCompositeTypes;
				} else if (this.valueTypes[i] && this.valueTypes[i] !== OperatorValueType.Static) {
					oUseType = this._createLocalType(this.valueTypes[i], oType);
				}
				try {
					if (this.valueTypes[i] !== OperatorValueType.Static && aValues.length > i) {
						let vValue;
						if (oUseType && aValues[i] !== undefined) { // a value needs to be given
							vValue = this._parseValue(aValues[i], oUseType, aUseCompositeTypes);
						} else {
							vValue = aValues[i]; // just take value
						}
						aResult.push(vValue);
					}
				} catch (err) {
					// Error
					Log.warning(err.message);
					throw err;
				}
			}
		}

		return aResult; // currently returns empty array for operators without values, undefined for no match

	};

	/**
	 * Parses a text based on the data type.
	 *
	 * @param {string} sValue Text
	 * @param {sap.ui.model.Type} oType Data type
	 * @param {sap.ui.model.Type[]} [aCompositeTypes] Additional types used for each part of a <code>CompositeType</code>
	 * @returns {string} single value
	 * @throws {sap.ui.model.ParseException} if the text cannot be parsed
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype._parseValue = function(sValue, oType, aCompositeTypes) { // needed in EQ operator to be accessed from outside

		if (sValue === undefined) {
			return sValue; // as some types running in errors with undefined and in this case there is nothing to parse
		}

		let aCurrentValue;
		if (oType && oType.isA("sap.ui.model.CompositeType") && oType._aCurrentValue && oType.getParseWithValues()) {
			aCurrentValue = oType._aCurrentValue;
		}

		const vValue = oType ? oType.parseValue(sValue, "string", aCurrentValue) : sValue;

		if (oType && oType.isA("sap.ui.model.CompositeType") && Array.isArray(vValue) && (oType._aCurrentValue || (oType.getUseInternalValues() && aCompositeTypes))) {
			// in case the user only entered a part of the CompositeType, we add the missing parts from aCurrentValue
			// but add only the parts that have entries in array after parsing ( not set one-time parts)
			for (let i = 0; i < vValue.length; i++) {
				if (vValue[i] === undefined && oType._aCurrentValue) {
					vValue[i] = oType._aCurrentValue[i] === undefined ? null : oType._aCurrentValue[i]; // undefined in CompositeType means "not changed" -> if no current value it needs to be null
					// value in aCurrentValues is already in model-format, so it need not to be formatted again
				} else if (oType.getUseInternalValues() && aCompositeTypes && aCompositeTypes[i]) {
					// convert result into model-format
					const oFormat = aCompositeTypes[i].getModelFormat();
					if (oFormat && typeof oFormat.format === "function") {
						vValue[i] = oFormat.format(vValue[i]);
					}
				}
			}
		}

		return vValue;

	};

	/**
	 * Validates a value.
	 *
	 * @param {any} aValues Values
	 * @param {sap.ui.model.Type} oType Data type
	 * @param {sap.ui.model.Type[]} [aCompositeTypes] Additional types used for each part of a <code>CompositeType</code>
	 * @param {int} [iCompositePart] part of the composite type that needs to be validated against it's type
	 * @param {sap.ui.model.Type} [oAdditionalType] Data type for additional value
	 * @param {sap.ui.model.Type[]} [aAdditionalCompositeTypes] Additional types used for each part of a <code>CompositeType</code> (if <code>oAdditionalType</code> is a <code>CompositeType</code>)
	 * @throws {sap.ui.model.ValidateException} if the values are invalid
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype.validate = function(aValues, oType, aCompositeTypes, iCompositePart, oAdditionalType, aAdditionalCompositeTypes) {

		const iCount = this.valueTypes.length;

		for (let i = 0; i < iCount; i++) {
			if ((this.valueTypes[i] || this.valueTypes[i] === null) && this.valueTypes[i] !== OperatorValueType.Static) { // do not validate Description in EQ case
				let oUseType;
				let aUseCompositeTypes;
				if (this.valueTypes[i] === OperatorValueType.Self) {
					oUseType = oType;
					aUseCompositeTypes = aCompositeTypes;
				} else if (this.valueTypes[i] === null) { // description
					oUseType = oAdditionalType;
					aUseCompositeTypes = aAdditionalCompositeTypes;
				} else {
					oUseType = this._createLocalType(this.valueTypes[i], oType);
				}


				if (aValues.length < i + 1 && this.valueTypes[i]) {
					throw new Error("value " + i + " for operator " + this.name + " missing"); // no ValidateException as this error must not occur from user input
				}
				if (oUseType && aValues.length > i) { // test only if a value is given
					let vValue = aValues[i];
					if (vValue === undefined || vValue === null) {
						vValue = oUseType ? oUseType.parseValue("", "string") : ""; // for empty value use initial value of type
					}

					if (oUseType.isA("sap.ui.model.CompositeType") && Array.isArray(vValue) && aUseCompositeTypes) {
						// validate for basic types too
						vValue = merge([], vValue); // use copy to not change original array
						for (let j = 0; j < vValue.length; j++) {
							if (aUseCompositeTypes[j]) {
								if (iCompositePart === undefined || j === iCompositePart) { // validate only the part that has changed. (if number has changed but not unit, no validation for units type is needed)
									aUseCompositeTypes[j].validateValue(vValue[j]);
								}

								if (oUseType.getUseInternalValues()) {
									// use internal format for validation on CompositeType
									const oFormat = aUseCompositeTypes[j].getModelFormat();
									if (oFormat && typeof oFormat.parse === "function") {
										vValue[j] = oFormat.parse(vValue[j]);
									}
								}
							}
						}
					}

					oUseType.validateValue(vValue);
				}
			}
		}

	};

	/**
	 * Determines the text that is copied to clipboard.
	 *
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
	 * @param {sap.ui.model.Type} [oType] Data type
	 * @param {sap.ui.mdc.enums.FieldDisplay} [sDisplay] Display mode
	 * @param {boolean} [bHideOperator=false] If set, the operator must not be visible for the user, so only the formatted value is shown
	 * @param {sap.ui.model.Type[]} [aCompositeTypes] Additional types used for each part of a <code>CompositeType</code>
	 * @param {sap.ui.model.Type} [oAdditionalType] Data type for additional value
	 * @param {sap.ui.model.Type[]} [aAdditionalCompositeTypes] Additional types used for each part of a <code>CompositeType</code> (if <code>oAdditionalType</code> is a <code>CompositeType</code>)
	 * @returns {string} key/description piar seperated by TAB
	 * @throws {sap.ui.model.FormatException} if the values cannot be formatted
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype.getTextForCopy = function(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {

		// in default case just return the standard formatting as "description"
		// This needs to be parsed from the target FilterField to determine the operator
		return "\t" + this.format(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes);

	};

	// Local type is needed eg. for "next x days" operator.
	// Function also called in DefineConditionPanel
	/**
	 * Creates a local type.
	 *
	 * @param {string|object} vType Type name or object with type information
	 * @param {sap.ui.model.Type} oType original data type
	 * @returns {sap.ui.model.SimpleType} data type
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.DefineConditionPanel
	 */
	Operator.prototype._createLocalType = function(vType, oType) {
		if (!this._aTypes) {
			this._aTypes = []; // array as for SelfNoParse type depends on FilterField
		}

		let sType;
		let oFormatOptions;
		let oConstraints;
		let oUsedType;

		if (vType === OperatorValueType.SelfNoParse) {
			// create "clone" of original type but do not change value in parse or format
			sType = oType.getMetadata().getName(); // type is already loaded because instance is provided
			oFormatOptions = merge({}, oType.getFormatOptions());
			oConstraints = merge(oType.getConstraints());
		} else if (typeof vType === "string") {
			sType = vType;
		} else if (vType && typeof vType === "object") {
			sType = vType.name;
			oFormatOptions = vType.formatOptions;
			oConstraints = vType.constraints;
		}

		for (const oMyType of this._aTypes) {
			if (oMyType.name === sType && deepEqual(oMyType.formatOptions, oFormatOptions) && deepEqual(oMyType.constraints, oConstraints)) {
				oUsedType = oMyType.type;
				break;
			}
		}

		if (!oUsedType) {
			// The used type must be required by the application.
			const TypeClass = sap.ui.require(sType.replace(/\./g, "/"));
			oUsedType = new TypeClass(oFormatOptions, oConstraints);
			oUsedType._bCreatedByOperator = true; // to distinguish in Field between original type and Operator type on Operator change

			if (vType === OperatorValueType.SelfNoParse) {
				oUsedType.parseValue = function(vValue, sSourceType) {
					TypeClass.prototype.parseValue.apply(this, arguments); // to check for parse exception
					return vValue;
				};
				oUsedType.validateValue = function(vValue) {
					const sValue = TypeClass.prototype.parseValue.apply(this, [vValue, "string"]); // to check with parsed value
					TypeClass.prototype.validateValue.apply(this, [sValue]);
				};
				oUsedType.formatValue = function(vValue, sTargetType) {
					TypeClass.prototype.formatValue.apply(this, arguments); // to check for format exception
					return vValue;
				};
			}
			this._aTypes.push({ name: sType, formatOptions: oFormatOptions, constraints: oConstraints, type: oUsedType });
		}
		return oUsedType;
	};

	/**
	 * Checks if a text is suitable for an operator.
	 *
	 * @param {string} sText Text
	 * @returns {boolean} true valid
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype.test = function(sText) {

		return this.tokenTestRegExp.test(sText);

	};

	/**
	 * Returns the real values without operator symbol.
	 *
	 * In this function no type validation takes place.
	 *
	 * @param {string} sText Text
	 * @param {sap.ui.mdc.enums.FieldDisplay} sDisplayFormat Display format
	 * @param {boolean} bDefaultOperator If true, operator is used as default. In this case parsing without operator also works
	 * @param {boolean} [bHideOperator=false] If set, the operator must not be visible for the user, so if the user enters it, it is part of the text
	 * @returns {string[]} array of value parts without operator sign
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.77.0
	 */
	Operator.prototype.getValues = function(sText, sDisplayFormat, bDefaultOperator, bHideOperator) {

		const regExp = bHideOperator ? this.hiddenOperatorRegExp : this.tokenParseRegExp; // if operator symbol is not used -> use complete text
		let aMatch = sText.match(regExp); // as RegExp might be complex and return longer arry we take the last value(s)
		let aValues;
		if (aMatch) {
			aMatch.splice(0,1); // remove match part
			aMatch = aMatch.filter((oMatch) => oMatch !== undefined); // as RegExp could contain an OR operation what leads to empty parts
			aValues = [];
			for (let i = 0; i < this.valueTypes.length; i++) {
				const iMatchIndex = aMatch.length - this.valueTypes.length + i; // use last matches as first match might just be the operator
				if (aMatch.length >= i) { // there is a text found for this part
					const sValue = aMatch[iMatchIndex];
					aValues.push(sValue);
				}
			}
		}

		return aValues;

	};

	/**
	 * Creates a condition for a given text.
	 *
	 * @param {string} sText Text
	 * @param {sap.ui.model.Type} oType Data type
	 * @param {sap.ui.mdc.enums.FieldDisplay} sDisplayFormat Display format
	 * @param {boolean} bDefaultOperator If true, operator is used as default. In this case parsing without operator also works
	 * @param {sap.ui.model.Type[]} [aCompositeTypes] Additional types used for each part of a <code>CompositeType</code>
	 * @param {sap.ui.model.Type} [oAdditionalType] Data type for additional value
	 * @param {sap.ui.model.Type[]} [aAdditionalCompositeTypes] Additional types used for each part of a <code>CompositeType</code> (if <code>oAdditionalType</code> is a <code>CompositeType</code>)
	 * @param {boolean} [bHideOperator=false] If set, the operator must not be visible for the user, so if the user enters it, it is part of the text
	 * @returns {sap.ui.mdc.condition.ConditionObject} The condition for the text
	 * @throws {sap.ui.model.ParseException} if the text cannot be parsed
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Operator.prototype.getCondition = function(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, bHideOperator) {

		if (this.test(sText) || ((bDefaultOperator || bHideOperator) && sText && this.hasRequiredValues())) {
			const aValues = this.parse(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, bHideOperator);
			if ((aValues && aValues.length === this.valueTypes.length) || this.valueTypes[0] === OperatorValueType.Static ||
				(aValues && aValues.length === 1 && this.valueTypes.length === 2 && !this.valueTypes[1])) { // EQ also valid without description
				const oCondition = Condition.createCondition(this.name, aValues);
				this.checkValidated(oCondition);
				return oCondition;
			} else if (aValues && aValues.length > 0) { // only symbol entered leads to no text -> it's not an error
				throw new ParseException("Parsed value don't meet operator");
			}
		}
		return null;

	};

	/**
	 * Checks if an <code>Operator</code> contains only one value or not.
	 *
	 * For example, an equal Operator has only one value, a between operator two.
	 *
	 * @returns {boolean} <code>true</code> if only one value is used.
	 * @since 1.75.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	Operator.prototype.isSingleValue = function() {

		if (this.valueTypes.length > 1 && this.valueTypes[1]) {
			// second value is defined. (If only description it doesn't matter.)
			return false;
		}

		return true;

	};

	/**
	 * Creates an object containing information to compare conditions.
	 *
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition to check
	 * @returns {object} Object with check information
	 * @private
	 * @since: 1.76.0
	 */
	Operator.prototype.getCheckValue = function(oCondition) {

		if (this.valueTypes[0] && this.valueTypes[0] === OperatorValueType.Static) {
			return {}; // don't check value for static operators (might contain static text)
		} else {
			return { values: oCondition.values };
		}

	};

	/**
	 * Checks if the operator requires values. (Static operators, like TODAY, don't have values.)
	 *
	 * @returns {boolean} <code>true</code> if value is reqired
	 * @private
	 * @since: 1.90.0
	 */
	Operator.prototype.hasRequiredValues = function() {

		if (this.valueTypes[0] && this.valueTypes[0] !== OperatorValueType.Static) {
			return true;
		} else {
			return false;
		}

	};

	/**
	 * Compares two conditions
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
	Operator.prototype.compareConditions = function(oCondition1, oCondition2) {

		let bEqual = false;

		if (oCondition1.operator === this.name && oCondition1.operator === oCondition2.operator) {
			const oCheckValue1 = this.getCheckValue(oCondition1);
			const oCheckValue2 = this.getCheckValue(oCondition2);


			// In/outParameter logic still used as long as old FiledValueHelp is supported
			// Also may exist in older variants
			if (oCondition1.inParameters && oCondition2.inParameters) {
				// TODO: also compare in-parameters (but only of set on both)
				oCheckValue1.inParameters = oCondition1.inParameters;
				oCheckValue2.inParameters = oCondition2.inParameters;
			}
			if (oCondition1.outParameters && oCondition2.outParameters) {
				// TODO: also compare out-parameters (but only of set on both)
				oCheckValue1.outParameters = oCondition1.outParameters;
				oCheckValue2.outParameters = oCondition2.outParameters;
			}

			if (oCondition1.payload || oCondition2.payload) { // check payload also if only set on one condition
				oCheckValue1.payload = oCondition1.payload;
				oCheckValue2.payload = oCondition2.payload;
			}

			if (oCondition1.validated && oCondition2.validated) {
				// also compare validated (but only of set on both)
				oCheckValue1.validated = oCondition1.validated;
				oCheckValue2.validated = oCondition2.validated;
			}

			if (deepEqual(oCheckValue1, oCheckValue2)) { // deepEqual seems to be much faster as JSON-string comparison
				bEqual = true;
			}
		}

		return bEqual;

	};

	/**
	 * Checks if a condition is validated and sets the <code>validated</code> flag.
	 *
	 * For EQ set <code>validated</code> flag if a description is given.
	 *
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition to check
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since: 1.78.0
	 */
	Operator.prototype.checkValidated = function(oCondition) {

		oCondition.validated = ConditionValidated.NotValidated;

	};

	Operator.prototype._enableOverwrites = function(oConfiguration) {
		this._oMethodOverwrites = {};
		["format",
			"parse",
			"validate",
			"getModelFilter",
			"isEmpty",
			"createControl",
			"getCheckValue",
			"getValues",
			"checkValidated",
			"getLongText",
			"getTextForCopy"
		].forEach((sMethodName) => {
			Object.defineProperty(this, sMethodName, {
				get: function() {
					return (this._oMethodOverwrites && this._oMethodOverwrites[sMethodName]) || Object.getPrototypeOf(this)[sMethodName];
				}
			});
			if (oConfiguration && oConfiguration[sMethodName]) {
				this._oMethodOverwrites[sMethodName] = oConfiguration[sMethodName];
			}
		});
	};

	const aAllowedOverwrites = Object.values(OperatorOverwrite);
	/**
	 * Sets an overwrite function for some of the <code>operator</code> functions.
	 *
	 * @param {sap.ui.mdc.enums.OperatorOverwrite} sMethodName name of the function which will be overwritten
	 * @param {function} fnOverwrite new callback function
	 * @returns {function} the original function
	 * @public
	 * @since: 1.113.0
	 */
	Operator.prototype.overwrite = function(sMethodName, fnOverwrite) {
		if (aAllowedOverwrites.indexOf(sMethodName) >= 0) {
			const fnPrevious = this[sMethodName];
			this._oMethodOverwrites[sMethodName] = fnOverwrite;
			return fnPrevious.bind(this);
		}
		throw "Operator: Illegal overwrite detected. Please see sap.ui.mdc.enums.OperatorOverwrite";
	};

	return Operator;
});