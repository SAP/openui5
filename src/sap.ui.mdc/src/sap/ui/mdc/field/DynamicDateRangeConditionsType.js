/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/mdc/field/ConditionsType',
	'sap/ui/mdc/condition/ConditionValidateException',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/ui/mdc/util/DateUtil',
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/m/library',
	'sap/base/util/merge'
],
	function(
		ConditionsType,
		ConditionValidateException,
		FilterOperatorUtil,
		Condition,
		ConditionValidated,
		BaseType,
		OperatorValueType,
		DateUtil,
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		mLibrary,
		merge
		) {
	"use strict";

	/**
	 * Constructor for a <code>ConditionsType</code> to be used in <code>DynamicDateRange</code> control.
	 *
	 * @class
	 * This class represents a type to map an array of conditions used in a {@link sap.ui.mdc.FilterField FilterField} control to a value of a {@link sap.m.DynamicDateRange DynamicDateRange} control.
	 *
	 * @extends sap.ui.mdc.field.ConditionsType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @since 1.96.0
	 * @public
	 *
	 * @param {object} [oFormatOptions] Formatting options
	 * @param {sap.ui.model.Type} [oFormatOptions.valueType] Type of the value of the condition (used for formatting, parsing and validating)
	 * @param {sap.ui.model.Type} [oFormatOptions.additionalValueType] Type of the <code>additionalValue</code> (description) of the condition (used for formatting, parsing, and validating)
	 * @param {string[]} [oFormatOptions.operators] Possible operators to be used in the condition
	 * @param {sap.ui.mdc.enums.FieldDisplay} [oFormatOptions.display] DisplayFormat used to visualize a value
	 * @param {string} [oFormatOptions.valueHelpID] ID of the value help to determine the key and description
	 * @param {boolean} [oFormatOptions.hideOperator] If set, only the value of the condition is shown, but no operator. (Use it only if just one operator is supported.)
	 * @param {int} [oFormatOptions.maxConditions] Maximum number of allowed conditions
	 * @param {sap.ui.model.Context} [oFormatOptions.bindingContext] <code>BindingContext</code> of field. Used to get a key or description from the value help using in/out parameters. (In a table, the value help might be connected to a different row)
	 * @param {sap.ui.model.Type} [oFormatOptions.originalDateType] Type used on field, for example, for date types; a different type is used internally to have different <code>formatOptions</code>
	 * @param {sap.ui.model.Type} [oFormatOptions.additionalType] Additional type used for another part of a field (for example, for unit fields)
	 * @param {sap.ui.model.Type[]} [oFormatOptions.compositeTypes] Additional types used for each part of a <code>CompositeType</code> (if <code>valueType</code> is a <code>CompositeType</code>)
	 * @param {sap.ui.model.Type[]} [oFormatOptions.additionalCompositeTypes] Additional types used for each part of a <code>CompositeType</code> (if <code>additionalValueType</code> is a <code>CompositeType</code>)
	 * @param {function} [oFormatOptions.getConditions] Function to get the existing conditions of the field.
	 * @param {function} [oFormatOptions.asyncParsing] Callback function to tell the <code>Field</code> the parsing is asynchronous.
	 * @param {sap.ui.mdc.condition.ConditionObject} [oFormatOptions.navigateCondition] Condition of keyboard navigation. If this is filled, no real parsing is needed as the condition has already been determined and is just returned
	 * @param {object} [oFormatOptions.delegate] Field delegate to handle model-specific logic
	 * @param {object} [oFormatOptions.payload] Payload of the delegate
	 * @param {boolean} [oFormatOptions.preventGetDescription] If set, description is not read by <code>formatValue</code> as it is known that no description exists or might be set later
	 * @param {string} [oFormatOptions.defaultOperatorName] Name of the default <code>Operator</code>
	 * @param {boolean} [oFormatOptions.convertWhitespaces] If set, whitespaces will be replaced by special characters to display whitespaces in HTML
	 * @param {sap.ui.core.Control} [oFormatOptions.control] Instance of the calling control
	 * @param {boolean} [oFormatOptions.noFormatting] If set, the conditions will not be formatted (MultiInput <code>value</code> property case)
	 * @param {string} [oFormatOptions.keepValue] If <code>noFormatting</code> is set, this value is used as output to keep the typed value during value help selection
	 * @param {object} [oConstraints] Value constraints
	 * @alias sap.ui.mdc.field.DynamicDateRangeConditionsType
	 */
	const DynamicDateRangeConditionsType = ConditionsType.extend("sap.ui.mdc.field.DynamicDateRangeConditionsType", /** @lends sap.ui.mdc.field.DynamicDateRangeConditionsType.prototype */ {

		constructor : function (oFormatOptions, oConstraints) {
			SimpleType.apply(this, arguments);
			this.sName = "ConditionsDateRange";
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			//TODO: specialConditionDataRangeType if used for tokens in MultiValue FilterField
		}

	});

	DynamicDateRangeConditionsType.prototype.destroy = function() {

		SimpleType.prototype.destroy.apply(this, arguments);

		this._bDestroyed = true;

	};

	DynamicDateRangeConditionsType.prototype.formatValue = function(aConditions, sInternalType) {

		if (aConditions == undefined || aConditions == null || this._bDestroyed) { // if destroyed do nothing
			return null;
		}

		if (!Array.isArray(aConditions)) {
			throw new FormatException("No valid conditions provided");
		}

		const iMaxConditions = _getMaxConditions.call(this);
		let vResult;

		if (iMaxConditions !== 1) {
			throw new FormatException("MaxConditions must be 1");
		}

		if (aConditions.length === 1) {
			const oCondition = aConditions[0];

			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (!oCondition.operator || !oOperator) {
				throw new FormatException("No valid condition provided, Operator wrong.");
			}

			const aValues = [];
			const sBaseType = _getBaseType.call(this);
			let sOption = FilterOperatorUtil.getDynamicDateOptionForOperator(oOperator, mLibrary.StandardDynamicDateRangeKeys, sBaseType);

			for (let i = 0; i < oOperator.valueTypes.length; i++) {
				if (oOperator.valueTypes[i] && oOperator.valueTypes[i] !== OperatorValueType.Static) {
					if (sOption) { // only for standard operators  (dates are needed as local dates)
						if (oOperator.valueTypes[i] === OperatorValueType.Self) {
							aValues.push(DateUtil.typeToDate(oCondition.values[i], _getValueType.call(this), sBaseType));
						} else {
							const sOperatorBaseType = _getBaseTypeForValueType.call(this, oOperator.valueTypes[i]);
							if (sOperatorBaseType === BaseType.Date || sOperatorBaseType === BaseType.DateTime) {
								aValues.push(DateUtil.typeToDate(oCondition.values[i], _getOperatorType.call(this, oOperator, i), sOperatorBaseType));
							} else {
								aValues.push(oCondition.values[i]); // e.g integer value
							}
						}
					} else {
						aValues.push(oCondition.values[i]); // for custom operators just forward value. (Operator inside handle it)
					}
				}
			}

			if (!sOption) {
				sOption = FilterOperatorUtil.getCustomDynamicDateOptionForOperator(oOperator, sBaseType);
			}

			vResult = {operator: sOption, values: aValues};
		}

		return vResult;

	};

	DynamicDateRangeConditionsType.prototype.parseValue = function(oValue, sInternalType) {

		if (this._bDestroyed) { // if destroyed do nothing
			return null;
		}

		if (_getMaxConditions.call(this) !== 1) {
			throw new ParseException("Only one condition supported for parsing");
		}

		const aOperators = _getOperators.call(this);
		const aConditions = [];
		if (oValue && oValue.operator) {
			if (oValue.operator === "PARSEERROR") {
				throw new ParseException(oValue.values[0]);
			}

			const sOption = oValue.operator; // sOperator is the Option name
			const oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption(sOption, _getBaseType.call(this)); // search via name and alias

			if (oOperator) {
				const sBaseType = _getBaseType.call(this);
				const aValues = [];

				for (let i = 0; i < oOperator.valueTypes.length; i++) {
					if (oOperator.valueTypes[i] && oOperator.valueTypes[i] !== OperatorValueType.Static) {
						if (mLibrary.StandardDynamicDateRangeKeys[sOption]) { // only for standard operators (dates are returned as local dates)
							if (oOperator.valueTypes[i] === OperatorValueType.Self) {
								aValues.push(DateUtil.dateToType(oValue.values[i], _getValueType.call(this), sBaseType));
							} else {
								const sOperatorBaseType = oOperator.valueTypes[i] === OperatorValueType.Self ? sBaseType : _getBaseTypeForValueType.call(this, oOperator.valueTypes[i]);
								if (sOperatorBaseType === BaseType.Date || sOperatorBaseType === BaseType.DateTime) {
									aValues.push(DateUtil.dateToType(oValue.values[i], _getOperatorType.call(this, oOperator, i), sOperatorBaseType));
								} else {
									aValues.push(oValue.values[i]); // e.g integer values
								}
							}
						} else {
							aValues.push(oValue.values[i]); // for custom operators take what comes (inside the Operator already creted te right value)
						}
					}
				}

				const oCondition = Condition.createCondition(oOperator.name, aValues, undefined, undefined, ConditionValidated.NotValidated);
				FilterOperatorUtil.updateConditionValues(oCondition);
				FilterOperatorUtil.checkConditionsEmpty(oCondition, aOperators);
				aConditions.push(oCondition);
			}
		}

		return aConditions;

	};

	DynamicDateRangeConditionsType.prototype.validateValue = function(aConditions) {

		if (aConditions === undefined || aConditions === null || this._bDestroyed) { // if destroyed do nothing
			return;
		}

		if (!Array.isArray(aConditions)) {
			throw new ConditionValidateException("No valid conditions provided", undefined, undefined, aConditions);
		}

		const oType = _getValueType.call(this);
		const aOperators = _getOperators.call(this);

		for (let i = 0; i < aConditions.length; i++) {
			const oCondition = aConditions[i];
			if (typeof oCondition !== "object" || !oCondition.operator || !oCondition.values ||
					!Array.isArray(oCondition.values)) {
				throw new ConditionValidateException(this._oResourceBundle.getText("field.VALUE_NOT_VALID"), undefined, typeof oCondition === "object" ? merge({}, oCondition) : oCondition, aConditions);
			}

			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);

			if (!oOperator || aOperators.indexOf(oOperator.name) === -1) {
				throw new ConditionValidateException("No valid condition provided, Operator wrong.", undefined, merge({}, oCondition), aConditions);
			}

			try {
				oOperator.validate(oCondition.values, oType);
			} catch (oException) {
				if (oException instanceof ValidateException) {
					// add condition to exception to improve mapping in FieldBase handleValidationError
					throw new ConditionValidateException(oException.message, oException.violatedConstraints, merge({}, oCondition), aConditions);
				}
				throw oException;
			}
		}

	};

	function _getMaxConditions() {

		let iMaxConditions = 1;

		if (this.oFormatOptions.hasOwnProperty("maxConditions")) {
			iMaxConditions = this.oFormatOptions.maxConditions;
		}

		return iMaxConditions;

	}

	function _getValueType() {

		const oType = this.oFormatOptions.valueType;
		if (!oType) {
			throw new Error("Type missing");
		}

		return oType;

	}

	function _getOperators() {

		let aOperators = this.oFormatOptions.operators;
		if (!aOperators || aOperators.length === 0) {
			aOperators = FilterOperatorUtil.getOperatorsForType(_getBaseType.call(this));
		}

		return aOperators;

	}

	function _getBaseType() {

		const oType = _getValueType.call(this);
		const sType = oType.getMetadata().getName();
		const oFormatOptions = oType.getFormatOptions();
		const oConstraints = oType.getConstraints();

		return _getBaseTypeForValueType.call(this, {name: sType, formatOptions: oFormatOptions, constraints: oConstraints});

	}

	function _getBaseTypeForValueType(oValueType) {

		const oDelegate = this.oFormatOptions.delegate;
		const oField = this.oFormatOptions.control;
		const sBaseType = oDelegate ? oDelegate.getTypeMap(oField).getBaseType(oValueType.name, oValueType.formatOptions, oValueType.constraints) : BaseType.Date;

		return sBaseType;

	}

	function _getOperatorType(oOperator, iIndex) {

		return oOperator._createLocalType(oOperator.valueTypes[iIndex]);

	}

	return DynamicDateRangeConditionsType;

});
