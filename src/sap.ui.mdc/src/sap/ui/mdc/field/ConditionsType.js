/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/mdc/field/ConditionType',
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/base/util/merge',
	'sap/ui/base/SyncPromise'
],
	function(
		ConditionType,
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		merge,
		SyncPromise
		) {
	"use strict";


	/**
	 * Constructor for a Conditions type.
	 *
	 * @class
	 * This class represents a type that is used to map an array of conditions to a single-value control
	 * (such as <code>Input</code> or <code>Text</code> control).
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @param {object} [oFormatOptions] Formatting options
	 * @param {sap.ui.model.Type} [oFormatOptions.valueType] Type of the value of the condition (used for formatting and parsing)
	 * @param {string[]} [oFormatOptions.operators] Possible operators to be used in the condition
	 * @param {string} [oFormatOptions.display] DisplayFormat used to visualize value
	 * @param {string} [oFormatOptions.fieldHelpID] ID of the field help, to determine key and description // TODO: async request????
	 * @param {boolean} [oFormatOptions.hideOperator] If set, only the value of the condition is shown, but no operator //TODO
	 * @param {int} [oFormatOptions.maxConditions] Maximum number of allowed conditions
	 * @param {object} [oFormatOptions.bindingContext] BindingContext of field. Used to get key or description from the value help using in/out parameters. (In table, the value help might be connected to different row)
	 * @param {sap.ui.model.Type} [oFormatOptions.originalDateType] Type used on field. E.g. for date types internally a different type is used internally to have different <code>formatOptions</code>
	 * @param {boolean} [oFormatOptions.isUnit] If set, the type is used for the unit part of a field
	 * @param {function} [oFormatOptions.getConditions] Function to get the existing conditions of the field. Only used if <code>isUnit</code> is set. TODO: better solution
	 * @param {function} [oFormatOptions.asyncParsing] Callback function to tell the <code>Field</code> the parsing is asynchronous.
	 * @param {object} [oFormatOptions.navigateCondition] Condition of keyboard navigation. If this is filled, no real parsing is needed as the condition has already been determined. Just return it
	 * @param {object} [oFormatOptions.delegate] Field delegate to handle model-specific logic
	 * @param {object} [oFormatOptions.payload] Payload of the delegate
	 * @param {boolean} [oFormatOptions.preventGetDescription] If set, description is not read by <code>formatValue</code> as it is known that no description exist or it might be set later
	 * @param {object} [oConstraints] Value constraints
	 * @alias sap.ui.mdc.field.ConditionsType
	 * @since 1.62.0
	 */
	var ConditionsType = SimpleType.extend("sap.ui.mdc.field.ConditionsType", /** @lends sap.ui.mdc.field.ConditionsType.prototype */ {

		constructor : function (oFormatOptions, oConstraints) {
			SimpleType.apply(this, arguments);
			this.sName = "Conditions";
			oFormatOptions = _createFormatOptionsForConditionType(oFormatOptions);
//			var oConstraints = merge({}, this.oConstraints);
			this._oConditionType = new ConditionType(oFormatOptions, this.oConstraints);
		}

	});

	ConditionsType.prototype.destroy = function() {

		SimpleType.prototype.destroy.apply(this, arguments);

		if (this._oConditionType) { // to avoid issues in double destroy
			this._oConditionType.destroy();
			this._oConditionType = undefined;
		}

		this._bDestroyed = true;

	};

	ConditionsType.prototype.setFormatOptions = function(oFormatOptions) {

		SimpleType.prototype.setFormatOptions.apply(this, arguments);

		oFormatOptions = _createFormatOptionsForConditionType(oFormatOptions);
		if (this._oConditionType) {
			this._oConditionType.setFormatOptions(oFormatOptions);
		}

	};

	function _createFormatOptionsForConditionType(oFormatOptions) {

		oFormatOptions = merge({}, oFormatOptions);
		// remove asyncParsing as this is handled once for all conditions
		if (oFormatOptions.asyncParsing) {
			delete oFormatOptions.asyncParsing;
		}

		return oFormatOptions;

	}

	ConditionsType.prototype.setConstraints = function(oConstraints) {

		SimpleType.prototype.setConstraints.apply(this, arguments);

//		var oConstraints = merge({}, this.oConstraints);
		if (this._oConditionType) {
			this._oConditionType.setConstraints(this.oConstraints);
		}

	};

	ConditionsType.prototype.formatValue = function(aConditions, sInternalType) {

		if (aConditions == undefined || aConditions == null || this._bDestroyed) { // if destroyed do nothing
			return null;
		}

		if (!Array.isArray(aConditions)) {
			throw new FormatException("No valid conditions provided");
		}

		var vValue;

		if (!sInternalType || sInternalType === "string" || sInternalType === "any") {
			vValue = ""; // if string requested use string
		} else if (sInternalType === "float" || sInternalType === "int") {
			vValue = 0; // if number requested use number
		}

		var iMaxConditions = _getMaxConditions.call(this);

		var aSyncPromises = [];
		var fnCreateSyncPromise = function (oCondition, sInternalType) { // as function should not be declared inside a loop
			return SyncPromise.resolve().then(function() {
				return this._oConditionType.formatValue(oCondition, sInternalType);
			}.bind(this));
		};

		for (var i = 0; i < aConditions.length; i++) {
			aSyncPromises.push(fnCreateSyncPromise.call(this, aConditions[i], sInternalType));

			if (iMaxConditions > 0 && i >= iMaxConditions - 1) {
				break;
			}
		}

		return SyncPromise.all(aSyncPromises).then(function(aFormattedValues) {
			return _concatenateFormattedValues(aFormattedValues, vValue);
		}).unwrap();

	};

	function _concatenateFormattedValues(aFormattedValues, vValue) {

		for (var i = 0; i < aFormattedValues.length; i++) {
			if (vValue) {
				vValue = vValue + "; " +  aFormattedValues[i];
			} else {
				vValue =  aFormattedValues[i];
			}
		}

		return vValue;

	}

	ConditionsType.prototype.parseValue = function(sValue, sInternalType) {

		if (this._bDestroyed) { // if destroyed do nothing
			return null;
		}

		if (_getMaxConditions.call(this) !== 1) {
			throw new ParseException("Only one condition supported for parsing");
			// TODO: support multiple conditions (list separated by ";") ?
		}

		var oCondition =  SyncPromise.resolve().then(function() {
			return this._oConditionType.parseValue(sValue, sInternalType);
		}.bind(this)).then(function(oCondition) {
			return _parseConditionToConditions.call(this, oCondition);
		}.bind(this)).unwrap();

		if (oCondition instanceof Promise && this.oFormatOptions.asyncParsing) {
			this.oFormatOptions.asyncParsing(oCondition);
		}

		return oCondition;

	};

	function _parseConditionToConditions(oCondition) {

		var bIsUnit = this.oFormatOptions.isUnit;

		if (bIsUnit) {
			// update all conditions with unit
			// TODO better solution
			var sUnit = oCondition && oCondition.values[0][1];
			var oInParameters = oCondition && oCondition.inParameters;
			var oOutParameters = oCondition && oCondition.outParameters;
			var aConditions = this.oFormatOptions.getConditions();
			for (var i = 0; i < aConditions.length; i++) {
				aConditions[i].values[0][1] = sUnit;
				aConditions[i].values[0].splice(2); // do not have the unit table after parsing
				if (aConditions[i].operator === "BT") {
					aConditions[i].values[1][1] = sUnit;
					aConditions[i].values[1].splice(2); // do not have the unit table after parsing
				}
				if (oInParameters || aConditions[i].inParameters) {
					aConditions[i].inParameters = oInParameters;
				}
				if (oOutParameters || aConditions[i].outParameters) {
					aConditions[i].outParameters = oOutParameters;
				}
			}
			if (aConditions.length === 0) {
				aConditions.push(oCondition);
			}
			return aConditions;
		} else if (oCondition) {
			return [oCondition];
		} else {
			return [];
		}

	}

	ConditionsType.prototype.validateValue = function(aConditions) {

		if (aConditions === undefined || aConditions === null || this._bDestroyed) { // if destroyed do nothing
			return;
		}

		if (!Array.isArray(aConditions)) {
			throw new ValidateException("No valid conditions provided");
		}

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			this._oConditionType.validateValue(oCondition);
		}

		var iMaxConditions = _getMaxConditions.call(this);

		if (aConditions.length === 0 && iMaxConditions === 1) {
			// test if type is nullable. Only for single-value Fields. For MultiValue only real conditions should be checked for type
			this._oConditionType.validateValue(null);
		}

	};

	function _getMaxConditions() {

		var iMaxConditions = 1;

		if (this.oFormatOptions.hasOwnProperty("maxConditions")) {
			iMaxConditions = this.oFormatOptions.maxConditions;
		}

		return iMaxConditions;

	}

	return ConditionsType;

});
