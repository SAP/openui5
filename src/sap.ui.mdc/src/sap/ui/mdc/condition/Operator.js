/*!
 * ${copyright}
*/
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/model/Filter',
	'sap/ui/model/ParseException',
	'sap/ui/Device',
	'sap/base/Log',
	'sap/base/util/ObjectPath',
	'./Condition',
	'sap/ui/mdc/enum/ConditionValidated',
	"sap/base/strings/escapeRegExp"
], function(
		BaseObject,
		Filter,
		ParseException,
		Device,
		Log,
		ObjectPath,
		Condition,
		ConditionValidated,
		escapeRegExp
	) {
		"use strict";

		// translation utils
		var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		sap.ui.getCore().attachLocalizationChanged(function() {
			oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		});

		/**
		 * Creates an <code>sap.ui.mdc.condition.Operator</code> object.
		 * This is used in the <code>FilterField</code> control to define which filter operators are supported.
		 *
		 * If a function or property is initial, the default implementation is used.
		 *
		 * @extends sap.ui.base.Object
		 * @param {object} [oConfiguration] Properties of the operator
		 * @param {string} [oConfiguration.name] Name of the operator used in the condition
		 * @param {string} [oConfiguration.filterOperator] The operator's default filter operator that is created as defined in <code>sap.ui.model.FilterOperator</code>
		 * @param {string} [oConfiguration.tokenParse] The string representation of the regular expression that is used by the operator to parse a value
		 *                 to eliminate the operator and get the data string. A placeholder that refers to the translated tokenText can be used. <code>#tokenText#</code> refers to the
		 *                 <code>oConfiguration.tokenText</code> property if given.
		 * @param {string} [oConfiguration.tokenFormat] The string representation that is used by the operator to format a value
		 *                 into an output string. For the value placeholder <code>{0}</code> and <code>{1}</code> are used.
		 *                 A placeholder that refers to the translated tokenText can be used. <code>#tokenText#</code> refers to the <code>oConfiguration.tokenText</code> property if given.
		 * @param {string[]} [oConfiguration.valueTypes] Array of type to be used. The length of the array defines the number of values that
		 *                 need to be entered with the operator.
		 *                 If set to Operator.ValueType.Self the <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used.
		 *                 If set to Operator.ValueType.Static a simple string type is used to display static text.
		 *                 If set to a name of a data type an instance of this data type will be used.
		 *                 If set to an object with the properties <code>name</code>, <code>formatOptions</code> and <code>constraints</code>
		 *                 an instance of the corresponding data type will be used.
		 * @param {string[]} [oConfiguration.paramTypes] Array of type parameters //TODO
		 * @param {string} [oConfiguration.longText] String representation of the operator as a long text.
		 *                If longText is not given , it is looked up in the resource bundle of the <code>sap.ui.mdc</code> library by the key
		 *                <code>operators.{oConfiguration.name}.longText</code>
		 * @param {string} [oConfiguration.tokenText] String representation of the operator as a short text.
		 *                If the token text is not given, it is looked up in the resource bundle of the <code>sap.ui.mdc</code> library by the key
		 *                <code>operators.{oConfiguration.name}.tokenText</code>
		 * @param {object} [oConfiguration.displayFormats] Pattern how different <code>displayFormats</code> are rendered
		 * @param {function} [oConfiguration.format] Function to format condition
		 * @param {function} [oConfiguration.parse] Function to parse input into condition
		 * @param {function} [oConfiguration.validate] Function to validate condition
		 * @param {function} [oConfiguration.getModelFilter] Function create filter for a condition
		 * @param {function} [oConfiguration.isEmpty] Function to check if condition is empty
		 * @param {function} [oConfiguration.createControl] Function to create a control
		 * @param {function} [oConfiguration.splitText] Function to split text // TODO remove
		 * @param {function} [oConfiguration.getCheckValue] Function to get the value for condition compare
		 * @param {function} [oConfiguration.getValues] Function to get the real values without operator symbol
		 * @param {function} [oConfiguration.checkValidated] Function to check if a condition is validated (sets the <code>validated</code> flag
		 * @param {boolean} [oConfiguration.exclude] If set, the operator is handled as exclude filter when creating the filters of all conditions
		 * @param {boolean} [oConfiguration.validateInput] If set, the user input for this operator needs to be validated using a field help
		 * @constructor
		 * @private
		 * @alias sap.ui.mdc.condition.Operator
		 * @version 1.73.0
		 * @author SAP SE
		 */
		var Operator = BaseObject.extend("sap.ui.mdc.condition.Operator", /** @lends sap.ui.mdc.condition.Operator.prototype */ {
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

				// map given properties
				// TODO: for compatibility reasons just put to this.name... but is a API getName better at the end?
				this.name = oConfiguration.name;
				this.filterOperator = oConfiguration.filterOperator;
				this.valueTypes = oConfiguration.valueTypes;
				this.paramTypes = oConfiguration.paramTypes;
				this.displayFormats = oConfiguration.displayFormats;

				var sTextKey = "operators." + this.name;
				var sLongTextKey = sTextKey + ".longText";
				var sTokenTextKey = sTextKey + ".tokenText";
				this.longText = oConfiguration.longText || _getText(sLongTextKey) || "";
				this.tokenText = oConfiguration.tokenText || _getText(sTokenTextKey) || "";
				if (this.longText === sLongTextKey) {
					//use the tokenText as longText and replace the {0} placeholder
					//Example:
					//#XTIT: token text for "last x days" operator
					//operators.LASTDAYS.tokenText=Last {0} days
					//#XTIT: token long text for "last x days" operator
					//__operators.LASTDAYS.longText=Last x days
					this.longText = this.tokenText.replace(/\{0\}/g, "x");
				}
				if (this.tokenText === sTokenTextKey) {
					this.tokenText = this.longText;
				}

				if (this.tokenText) {
					// create token parsing RegExp
					var sRegExp;
					var sTokenText;
					if (oConfiguration.tokenParse) {
						sTokenText = escapeRegExp(this.tokenText);
						if (Device.browser.msie) { // IE cannot replace single $, $$ will be replaced to $
							sTokenText = sTokenText.replace(/\$/g, "$$$");
						}

						this.tokenParse = oConfiguration.tokenParse.replace(/#tokenText#/g, sTokenText);
						for (var i = 0; i < this.valueTypes.length; i++) {
							var sReplace = this.paramTypes ? this.paramTypes[i] : this.valueTypes[i];
							// the regexp will replace placeholder like $0, 0$ and {0}
							// the four \ are required, because the excapeRegExp will escape existing \\
							this.tokenParse = this.tokenParse.replace(new RegExp("\\\\\\$" + i + "|" + i + "\\\\\\$" + "|" + "\\\\\\{" + i + "\\\\\\}", "g"), sReplace);
						}
						sRegExp = this.tokenParse;
					} else {
						sRegExp = escapeRegExp(this.tokenText); // operator without value
					}
					this.tokenParseRegExp = new RegExp(sRegExp, "i");

					// create token formatter
					if (oConfiguration.tokenFormat) {
						sTokenText = this.tokenText;
						if (Device.browser.msie) { // IE cannot replace single $, $$ will be replaced to $
							sTokenText = sTokenText.replace(/\$/g, "$$$");
						}
						this.tokenFormat = oConfiguration.tokenFormat.replace(/\#tokenText\#/g, sTokenText);
					} else {
						this.tokenFormat = this.tokenText; // static operator with no value (e.g. "THIS YEAR")
					}
				}

				if (oConfiguration.format) {
					this.format = oConfiguration.format;
				}
				if (oConfiguration.parse) {
					this.parse = oConfiguration.parse;
				}
				if (oConfiguration.validate) {
					this.validate = oConfiguration.validate;
				}
				if (oConfiguration.getModelFilter) {
					this.getModelFilter = oConfiguration.getModelFilter;
				}
				if (oConfiguration.isEmpty) {
					this.isEmpty = oConfiguration.isEmpty;
				}
				if (oConfiguration.createControl) {
					this.createControl = oConfiguration.createControl; // TODO move default implementation from DefineConditionPanel to here
				}
				if (oConfiguration.splitText) {
					this.splitText = oConfiguration.splitText; // TODO as only used by EQ remove it from general api
				}
				if (oConfiguration.getCheckValue) {
					this.getCheckValue = oConfiguration.getCheckValue;
				}
				if (oConfiguration.getValues) {
					this.getValues = oConfiguration.getValues;
				}
				if (oConfiguration.checkValidated) {
					this.checkValidated = oConfiguration.checkValidated;
				}

				this.exclude = !!oConfiguration.exclude; // to have always a boolean value
				this.validateInput = !!oConfiguration.validateInput; // to have always a boolean value
			}
		});

		/**
		 * Defines whyt type is used for parse or format the operation
		 *
		 * @enum {string}
		 * @private
		 * @since 1.75
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		Operator.ValueType = {
				/**
				 * The <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used.
				 *
				 * @public
				 */
				Self: "self",

				/**
				 * A simple string type is used to display static text.
				 *
				 * @public
				 */
				Static: "static"
		};

		function _getText(sKey, sType) {

			var key = sKey + (sType ? "." + sType : ""),
				sText;

			if (oMessageBundle.hasText(key)) {
				sText = oMessageBundle.getText(key);
			} else
			if (sType) {
				sText = oMessageBundle.getText(sKey);
			} else {
				sText = key;
			}
			return sText;

		}

		// TODO: better API to get longtext (is it really type dependent?)
		/**
		 * Gets the text for an operator name.
		 *
		 * @param {string} sKey Text key
		 * @param {string} sType Name of type
		 * @returns {string} text
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc.field.DefineConditionPanel
		 */
		Operator.prototype.getTypeText = function(sKey, sType) { // for DefineConditionPanel Select items

			return _getText(sKey, sType);

		};

		/**
		 * Creates a filter object for a condition.
		 *
		 * @param {object} oCondition Condition
		 * @param {string} sFieldPath Path of filter
 		 * @param {sap.ui.model.Type} oType Data type of the used filter field
		 * @returns {sap.ui.model.Filter} filter object
		 * @public
		 */
		Operator.prototype.getModelFilter = function(oCondition, sFieldPath, oType) {

			var vValue = oCondition.values[0];
			var oFilter;
			var oFilterUnit;
			var aFieldPaths = sFieldPath.split(",");
			// TODO: CompositeType (Unit/Currency) -> also filter for unit
			if (Array.isArray(vValue) && aFieldPaths.length > 1) {
				vValue = vValue[0];
				sFieldPath = aFieldPaths[0];
				oFilterUnit = new Filter({path: aFieldPaths[1], operator: "EQ", value1: oCondition.values[0][1]});
			}
			if (oFilterUnit && vValue === undefined) {
				// filter only for unit
				oFilter = oFilterUnit;
				oFilterUnit = undefined;
			} else if (this.valueTypes.length == 1) {
				oFilter = new Filter({ path: sFieldPath, operator: this.filterOperator, value1: vValue });
			} else {
				var vValue2 = oCondition.values[1];
				if (Array.isArray(vValue2) && aFieldPaths.length > 1) {
					vValue2 = vValue2[0];
					// use same unit as for value1
				}
				oFilter = new Filter({ path: sFieldPath, operator: this.filterOperator, value1: vValue, value2: vValue2 });
			}

			if (oFilterUnit) {
				oFilter = new Filter({ filters: [oFilter, oFilterUnit], and: true });
			}

			// add filter for in-parameters
			if (oCondition.inParameters) {
				var aFilters = [oFilter];
				for ( var sInPath in oCondition.inParameters) {
					aFilters.push(new Filter({path: sInPath, operator: "EQ", value1: oCondition.inParameters[sInPath]}));
				}
				oFilter = new Filter({ filters: aFilters, and: true });
			}

			return oFilter;

		};

		/**
		 * Checks if a condition is empty.
		 *
		 * @param {object} oCondition Condition
		 * @param {sap.ui.model.Type} oType Data type
		 * @returns {boolean} true if empty
		 *
		 * @public
		 */
		Operator.prototype.isEmpty = function(oCondition, oType) {

			var isEmpty = false;

			if (oCondition) {
				for (var i = 0; i < this.valueTypes.length; i++) {
					if (this.valueTypes[i] !== Operator.ValueType.Static) {
						var vValue = oCondition.values[i];
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
		 * @param {object} oCondition Condition
		 * @param {sap.ui.model.Type} oType Data type
		 * @param {string} sDisplay Display mode
		 * @returns {string} formatted text
		 * @throws {sap.ui.model.FormatException} if the values cannot be formatted
		 *
		 * @public
		 */
		Operator.prototype.format = function(oCondition, oType, sDisplay) { // sDisplay needed in EQ formatter

			var aValues = oCondition.values;
			var sTokenText = this.tokenFormat;
			var iCount = this.valueTypes.length;
			for (var i = 0; i < iCount; i++) {
				if (this.valueTypes[i] !== Operator.ValueType.Static) {
					var v = aValues[i] !== undefined && aValues[i] !== null ? aValues[i] : "";
					if (this.valueTypes[i] !== Operator.ValueType.Self) {
						oType = this._createLocalType(this.valueTypes[i]);
					}
					var sReplace = oType ? oType.formatValue(v, "string") : v;
					// the regexp will replace placeholder like $0, 0$ and {0}
					sTokenText = sTokenText.replace(new RegExp("\\$" + i + "|" + i + "\\$" + "|" + "\\{" + i + "\\}", "g"), sReplace);
				}
			}
			return sTokenText;

		};

		/**
		 * Parses a text.
		 *
		 * @param {string} sText Text
		 * @param {sap.ui.model.Type} oType Data type
		 * @param {string} sDisplayFormat Display format
		 * @param {boolean} bDefaultOperator If true, operator is used as default. In this case parsing without operator also works
		 * @returns {any[]} array of values
		 * @throws {sap.ui.model.ParseException} if the text cannot be parsed
		 *
		 * @public
		 */
		Operator.prototype.parse = function(sText, oType, sDisplayFormat, bDefaultOperator) {

			var aValues = this.getValues(sText, sDisplayFormat, bDefaultOperator);
			var aResult; // might remain undefined - if no match
			if (aValues) {
				aResult = [];
				for (var i = 0; i < this.valueTypes.length; i++) {
					if (this.valueTypes[i] && [Operator.ValueType.Self, Operator.ValueType.Static].indexOf(this.valueTypes[i]) === -1) {
						oType = this._createLocalType(this.valueTypes[i]);
					}
					try {
						if (this.valueTypes[i] !== Operator.ValueType.Static) {
							var vValue;
							if (this.valueTypes[i]) {
								vValue = this._parseValue(aValues[i], oType);
							} else {
								vValue = aValues[i]; // Description -> just take value
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
		 * @returns {string} single value
		 * @throws {sap.ui.model.ParseException} if the text cannot be parsed
		 *
		 * @private
		 * ui5-restricted to be enhanced by operators inherit from operator
		 */
		Operator.prototype._parseValue = function(sValue, oType) { // needed in EQ operator to be accessed from outside

			if (sValue === undefined) {
				return sValue; // as some types running in errors with undefined and in this case there is nothing to parse
			}

			var aCurrentValue;
			if (oType instanceof sap.ui.model.CompositeType && oType._aCurrentValue && oType.getParseWithValues()) {
				aCurrentValue = oType._aCurrentValue;
			}

			var vValue = oType ? oType.parseValue(sValue, "string", aCurrentValue) : sValue;

			if (aCurrentValue && Array.isArray(vValue)) {
				// in case the user only entered a part of the CompositeType, we add the missing parts from aCurrentValue
				// but add only the parts that have entries in array after parsing ( not set one-time parts)
				for (var j = 0; j < vValue.length; j++) {
					if (vValue[j] === undefined) {
						vValue[j] = aCurrentValue[j];
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
		 * @throws {sap.ui.model.ValidateException} if the values are invalid
		 *
		 * @public
		 */
		Operator.prototype.validate = function(aValues, oType) {

			var iCount = this.valueTypes.length;
			for (var i = 0; i < iCount; i++) {
				var vValue = aValues[i] !== undefined && aValues[i] !== null ? aValues[i] : "";
				if (this.valueTypes[i] && this.valueTypes[i] !== Operator.ValueType.Static) { // do not validate Description in EQ case
					if ([Operator.ValueType.Self, Operator.ValueType.Static].indexOf(this.valueTypes[i]) === -1) {
						oType = this._createLocalType(this.valueTypes[i]);
					}
					if (oType) {
						oType.validateValue(vValue);
					}
				}
			}

		};

		// Local type is needed eg. for "next x days" operator.
		// Function also called in DefineConditionPanel
		/**
		 * Creates a local type.
		 *
		 * @param {string} sType Type name
		 * @returns {sap.ui.model.SimpleType} data type
		 * @private
		 * @ui5-restricted sap.ui.mdc.field.DefineConditionPanel
		 */
		Operator.prototype._createLocalType = function(vType) {

			if (!this._oType) {
				var sType;
				var oFormatOptions;
				var oConstraints;

				if (typeof vType === "string") {
					sType = vType;
				} else if (vType && typeof vType === "object") {
					sType = vType.name;
					oFormatOptions = vType.formatOptions;
					oConstraints = vType.constraints;
				}

				sap.ui.requireSync(sType.replace(/\./g, "/"));
				var oTypeClass = ObjectPath.get(sType || "");
				this._oType = new oTypeClass(oFormatOptions, oConstraints);
			}
			return this._oType;

		};

		/**
		 * Checks if a text is suitable for an operator.
		 *
		 * @param {string} sText Text
		 * @returns {boolean} true valid
		 *
		 * @public
		 */
		Operator.prototype.test = function(sText) {

			return this.tokenParseRegExp.test(sText);

		};

		/**
		 * Returns the real values without operator symbol.
		 *
		 * In this function no type validation takes place.
		 *
		 * @param {string} sText Text
		 * @param {string} sDisplayFormat Display format
		 * @param {boolean} bDefaultOperator If true, operator is used as default. In this case parsing without operator also works
		 * @returns {string[]} array of value parts without operator sign
		 *
		 * @public
		 * @since 1.77.0
		 */
		Operator.prototype.getValues = function(sText, sDisplayFormat, bDefaultOperator) {

			var aMatch = sText.match(this.tokenParseRegExp);
			var aValues;
			if (aMatch || (bDefaultOperator && sText)) {
				aValues = [];
				for (var i = 0; i < this.valueTypes.length; i++) {
					var sValue;
					if (aMatch) {
						sValue = aMatch[i + 1];
					} else if (bDefaultOperator) {
						if (i > 0) {
							break; // in default case only use the text as one entry
						}
						sValue = sText;
					}
					aValues.push(sValue);
				}
			}

			return aValues;

		};

		/**
		 * Creates a condition for a given text.
		 *
		 * @param {string} sText Text
		 * @param {sap.ui.model.Type} oType Data type
		 * @param {string} sDisplayFormat Display format
		 * @param {boolean} bDefaultOperator If true, operator is used as default. In this case parsing without operator also works
		 * @returns {object} condition
		 * @throws {sap.ui.model.ParseException} if the text cannot be parsed
		 *
		 * @public
		 */
		Operator.prototype.getCondition = function(sText, oType, sDisplayFormat, bDefaultOperator) {

			if (this.test(sText) || (bDefaultOperator && sText)) {
				var aValues = this.parse(sText, oType, sDisplayFormat, bDefaultOperator);
				if (aValues.length == this.valueTypes.length || this.valueTypes[0] === Operator.ValueType.Static
						|| (aValues.length === 1 && this.valueTypes.length === 2 && !this.valueTypes[1])) { // EQ also valid without description
					var oCondition =  Condition.createCondition( this.name, aValues );
					this.checkValidated(oCondition);
					return oCondition;
				} else {
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
		 * @returns {object} True if only one value is used.
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
		 * @param {object} oCondition Condition to check
		 * @returns {object} Object with check information
		 * @private
		 * @since: 1.76.0
		 */
		Operator.prototype.getCheckValue = function(oCondition) {

			if (this.valueTypes[0] && this.valueTypes[0] === Operator.ValueType.Static) {
				return {}; // don't check value for static operators (might contain static text)
			} else {
				return {values: oCondition.values};
			}

		};

		/**
		 * Compares two conditions
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
		Operator.prototype.compareConditions = function(oCondition1, oCondition2) {

			var bEqual = false;

			if (oCondition1.operator === this.name && oCondition1.operator === oCondition2.operator) {
				var oCheckValue1 = this.getCheckValue(oCondition1);
				var oCheckValue2 = this.getCheckValue(oCondition2);

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

				if (oCondition1.validated && oCondition2.validated) {
					// also compare validated (but only of set on both)
					oCheckValue1.validated = oCondition1.validated;
					oCheckValue2.validated = oCondition2.validated;
				}

				var sCheckValue1 = JSON.stringify(oCheckValue1);
				var sCheckValue2 = JSON.stringify(oCheckValue2);

				if (sCheckValue1 === sCheckValue2) {
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
		 * @param {object} oCondition condition to check
		 * @public
		 * @since: 1.78.0
		 */
		Operator.prototype.checkValidated = function(oCondition) {

			oCondition.validated = ConditionValidated.NotValidated;

		};

		return Operator;

});
