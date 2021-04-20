/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/ui/model/type/String',
	'sap/ui/mdc/enum/FieldDisplay',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Operator',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/base/util/merge',
	'sap/ui/base/SyncPromise'
],
	function(
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		StringType,
		FieldDisplay,
		FilterOperatorUtil,
		Operator,
		Condition,
		BaseType,
		ConditionValidated,
		merge,
		SyncPromise
		) {
	"use strict";

	/**
	 * Constructor for a Condition type.
	 *
	 * @class
	 * This class represents a type that is used to map a single condition to a single-value control
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @since 1.62.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 *
	 * @param {object} [oFormatOptions] Formatting options
	 * @param {sap.ui.model.Type} [oFormatOptions.valueType] Type of the value of the condition (used for formatting and parsing)
	 * @param {string[]} [oFormatOptions.operators] Possible operators to be used in the condition
	 * @param {sap.ui.mdc.enum.FieldDisplay} [oFormatOptions.display] DisplayFormat used to visualize value
	 * @param {string} [oFormatOptions.fieldHelpID] ID of the field help, to determine key and description // TODO: async request????
	 * @param {boolean} [oFormatOptions.hideOperator] If set, only the value of the condition is shown, but no operator //TODO
	 * @param {int} [oFormatOptions.maxConditions] Maximum number of allowed conditions
	 * @param {sap.ui.model.Context} [oFormatOptions.bindingContext] BindingContext of field. Used to get key or description from the value help using in/out parameters. (In table, the value help might be connected to different row)
	 * @param {sap.ui.model.Type} [oFormatOptions.originalDateType] Type used on field. E.g. for date types internally a different type is used internally to have different <code>formatOptions</code>
	 * @param {boolean} [oFormatOptions.isUnit] If set, the type is used for the unit part of a field
	 * @param {function} [oFormatOptions.getConditions] Function to get the existing conditions of the field. Only used if <code>isUnit</code> is set. // TODO: better solution
	 * @param {function} [oFormatOptions.asyncParsing] Callback function to tell the <code>Field</code> the parsing is asynchronous.
	 * @param {object} [oFormatOptions.navigateCondition] Condition of keyboard navigation. If this is filled, no real parsing is needed as the condition has already been determined. Just return it
	 * @param {object} [oFormatOptions.delegate] Field delegate to handle model-specific logic
	 * @param {object} [oFormatOptions.payload] Payload of the delegate
	 * @param {boolean} [oFormatOptions.preventGetDescription] If set, description is not read by <code>formatValue</code> as it is known that no description exist or it might be set later
	 * @param {sap.ui.mdc.condition.ConditionModel} [oFormatOptions.conditionModel] <code>ConditionModel</code>, if bound to one
	 * @param {string} [oFormatOptions.conditionModelName] Name of the <code>ConditionModel</code>, if bound to one
	 * @param {string} [oFormatOptions.defaultOperatorName] Name of the default <code>Operator</code>
	 * @param {object} [oConstraints] Value constraints
	 * @alias sap.ui.mdc.field.ConditionType
	 */
	var ConditionType = SimpleType.extend("sap.ui.mdc.field.ConditionType", /** @lends sap.ui.mdc.field.ConditionType.prototype */ {

		constructor : function (oFormatOptions, oConstraints) {
			SimpleType.apply(this, arguments);
			this.sName = "Condition";
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			this._oCalls = {active: 0, last: 0, condition: undefined, exception: undefined}; // if Multiple async. calls, just use the last result
		}

	});

	ConditionType.prototype.destroy = function() {

		SimpleType.prototype.destroy.apply(this, arguments);

		if (this._oDefaultType) {
			this._oDefaultType.destroy();
			delete this._oDefaultType;
		}

		this._bDestroyed = true;

	};

	ConditionType.prototype.formatValue = function(oCondition, sInternalType) {

		if (oCondition == undefined || oCondition == null || this._bDestroyed) { // if destroyed do nothing
			return null;
		}

		if (typeof oCondition !== "object" || !oCondition.operator || !oCondition.values ||
				!Array.isArray(oCondition.values)) {
			throw new FormatException("No valid condition provided");
		}

		if (!sInternalType) {
			sInternalType = "string";
		}

		var oType = _getValueType.call(this);
		var oOriginalDateType = _getOriginalDateType.call(this);
		var bIsUnit = this.oFormatOptions.isUnit;
		var bPreventGetDescription = this.oFormatOptions.preventGetDescription;

		_attachCurrentValueAtType.call(this, oCondition, oOriginalDateType); // use original condition

		if (bIsUnit) {
			// only use unit in condition
			oCondition = merge({}, oCondition);
			if (oCondition.values[0] && Array.isArray(oCondition.values[0])) {
				oCondition.values[0] = oCondition.values[0][1];
			}
			if (oCondition.operator !== "EQ") {
				// in the moment only single value supported
				oCondition.operator = "EQ";
				if (oCondition.values[1]) {
					oCondition.values.splice(1,1);
				}
			}
		}

		_attachCurrentValueAtType.call(this, oCondition, oType);

		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
			case "any":
				var sDisplay = _getDisplay.call(this);
				var aOperators = _getOperators.call(this);
				var oEQOperator = FilterOperatorUtil.getEQOperator(aOperators);
				this._oCalls.active++;
				this._oCalls.last++;
				var iCallCount = this._oCalls.last;

				if (!bPreventGetDescription && oCondition.operator === oEQOperator.name && sDisplay !== FieldDisplay.Value &&
						oCondition.validated === ConditionValidated.Validated && !oCondition.values[1]) {
					// handle sync case and async case similar
					var oBindingContext = this.oFormatOptions.bindingContext;
					var oConditionModel = this.oFormatOptions.conditionModel;
					var sConditionModelName = this.oFormatOptions.conditionModelName;

					return SyncPromise.resolve().then(function() {
						return _getDescription.call(this, oCondition.values[0], oCondition.inParameters, oCondition.outParameters, oBindingContext, oConditionModel, sConditionModelName);
					}.bind(this)).then(function(vDescription) { // if description needs to be requested -> return if it is resolved
						if (vDescription) {
							oCondition = merge({}, oCondition); // do not manipulate original object
							if (typeof vDescription === "object") {
								oCondition = _mapResultToCondition.call(this, oCondition, vDescription);
							} else if (oCondition.values.length === 1) {
								oCondition.values.push(vDescription);
							} else {
								oCondition.values[1] = vDescription;
							}
						}
						return _returnResult.call(this, oCondition, undefined, iCallCount, true, oType);
					}.bind(this)).catch(function(oException) {
						var oMyException;
						if (!(oException instanceof FormatException) || !_isInvalidInputAllowed.call(this)) {
							// if "invalid" input is allowed don't fire an exception
							oMyException = oException;
						}

						return _returnResult.call(this, oCondition, oMyException, iCallCount, true, oType);
					}.bind(this)).unwrap();
				}

				return _returnResult.call(this, oCondition, undefined, iCallCount, true, oType);
			default:
				// operators can only be formatted to string. But other controls (like Slider) might just use the value
				if (oType && oCondition.values.length >= 1) {
					return oType.formatValue(oCondition.values[0], sInternalType);
				}

				throw new FormatException("Don't know how to format Condition to " + sInternalType);
		}

	};

	function _formatToString(oCondition) {

		var sDisplay = _getDisplay.call(this);
		var oType = _getValueType.call(this);
		var bHideOperator = this.oFormatOptions.hideOperator && oCondition.values.length === 1;
		var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);

		if (!oOperator) {
			throw new FormatException("No valid condition provided, Operator wrong.");
		}

		return oOperator.format(oCondition, oType, sDisplay, bHideOperator);

	}

	function _returnResult(oCondition, oException, iCallCount, bFormat, oType) {

		this._oCalls.active--;
		if (iCallCount < this._oCalls.last && (this._oCalls.condition !== undefined || this._oCalls.exception !== undefined)) {
			// there is already a newer result
			oCondition = this._oCalls.condition;
			oException = this._oCalls.exception;
		}

		if (iCallCount === this._oCalls.last && this._oCalls.active > 0) {
			this._oCalls.condition = merge({}, oCondition); // don't use same object
			this._oCalls.exception = oException;
		} else if (this._oCalls.active === 0 && this._oCalls.last > 0) { // no pending calls -> clean up
			this._oCalls = {active: 0, last: 0, condition: undefined, exception: undefined};
		}

		if (oException) {
			throw oException; // just throw exception
		}

		// finalize condition. If Exception occurs here just throw it
		var vResult;
		if (bFormat) {
			vResult = _formatToString.call(this, oCondition);
		} else {
			vResult = _finishParseFromString.call(this, oCondition, oType);
		}

		return vResult;

	}

	ConditionType.prototype.parseValue = function(vValue, sInternalType) {

		if (this._bDestroyed) { // if destroyed do nothing
			return null;
		}

		if (!sInternalType) {
			sInternalType = "string";
		} else if (sInternalType === "any" && typeof vValue === "string") {
			sInternalType = "string";
		}

		var oNavigateCondition = this.oFormatOptions.navigateCondition;
		if (oNavigateCondition) {
			// condition already known from navigation. Just check if it is really the same as the input.
			var vOutput = this.formatValue(oNavigateCondition, sInternalType);
			if (vOutput === vValue) {
				return merge({}, oNavigateCondition); // use copy
			}
		}

		var sDisplay = _getDisplay.call(this);
		var bInputValidationEnabled = _isInputValidationEnabled.call(this);
		var oType = _getValueType.call(this);
		var oOriginalDateType = _getOriginalDateType.call(this);
		var aOperators = _getOperators.call(this);
		var bIsUnit = this.oFormatOptions.isUnit;
		var sDefaultOperator;

		if (vValue === null || vValue === undefined || (vValue === "" && !bInputValidationEnabled)) { // check if "" is a key in FieldHelp
			if (!_isCompositeType.call(this, oType) && !bIsUnit) {
				return null; // TODO: for all types???
			}
		}

		_initCurrentValueAtType.call(this, oType);
		_initCurrentValueAtType.call(this, oOriginalDateType);

		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				var oOperator;
				var bCheckForDefault = false;
				var bUseDefaultOperator = false;

				if (aOperators.length === 1) {
					// only one operator supported -> use it
					oOperator = FilterOperatorUtil.getOperator(aOperators[0]);
					bUseDefaultOperator = true;
				} else {
					var aMatchingOperators = FilterOperatorUtil.getMatchingOperators(aOperators, vValue);

					if (aMatchingOperators.length === 0) {
						// use default operator if nothing found
						oOperator = _getDefaultOperator.call(this, aOperators, oType);

						if (bInputValidationEnabled && !_isCompositeType.call(this, oType)) {
							// try first to use EQ and find it in FieldHelp. If not found try later with default operator
							var oEQOperator = FilterOperatorUtil.getEQOperator(aOperators);
							if (aOperators.indexOf(oEQOperator.name) >= 0) { // as EQ is returned if not in List
								bCheckForDefault = !!oOperator && oOperator.name !== oEQOperator.name; // only if default operator exists and is different
								oOperator = oEQOperator;
							}
						}

						bUseDefaultOperator = true;
					} else {
						oOperator = aMatchingOperators[0]; // TODO: multiple matches?
					}
				}

				if (oOperator) {
					var oCondition;
					var bCompositeType = _isCompositeType.call(this, oType);
					this._oCalls.active++;
					this._oCalls.last++;
					var iCallCount = this._oCalls.last;

					if (!bCompositeType && oOperator.validateInput && bInputValidationEnabled) {
						// use FieldHelp to determine condition
						oCondition = _parseDetermineKeyAndDescription.call(this, oOperator, vValue, oType, bUseDefaultOperator, bCheckForDefault, aOperators, sDisplay, true);
						if (oCondition instanceof Promise) {
							return _fnReturnPromise.call(this, oCondition);
						} else {
							return oCondition;
						}
					} else if (vValue === "" && !bCompositeType) {
						// nothing entered -> no condition ; but in unit case update existing condition
						return _returnResult.call(this, null, undefined, iCallCount, false, oType);
					} else {
						// just normal operator parsing
						try {
						if (vValue === "" && bCompositeType && bUseDefaultOperator) {
								// parse using unit part
								oCondition = Condition.createCondition(oOperator.name, [oType.parseValue(vValue, "string", oType._aCurrentValue)], undefined, undefined, ConditionValidated.NotValidated);
							} else {
								oCondition = oOperator.getCondition(vValue, oType, sDisplay, bUseDefaultOperator);
							}
						} catch (oException) {
							var oMyException = oException;
							if (oMyException instanceof ParseException && oOriginalDateType) {
								// As internal yyyy-MM-dd is used as pattern for dates (times similar) the
								// parse exception might contain this as pattern. The user should see the pattern thats shown
								// So try to parse date with the original type to get parseException with right pattern.
								try {
									oOriginalDateType.parseValue(vValue, "string", oOriginalDateType._aCurrentValue);
								} catch (oOriginalException) {
									oMyException = oOriginalException;
								}
							}
							return _returnResult.call(this, undefined, oMyException, iCallCount, false, oType); // to reuse it for pending calls
						}
					}

					if (oCondition) {
						return _returnResult.call(this, oCondition, undefined, iCallCount, false, oType);
					}
				}

				throw new ParseException("Cannot parse value " + vValue); // use original value in message

			default:
				// operators can only be formatted from string. But other controls (like Slider) might just use the value
				if (oType) {
					// TODO: other operator?
					if (aOperators.length === 1) {
						// only one operator supported -> use it
						sDefaultOperator = aOperators[0];
					} else {
						sDefaultOperator = _getDefaultOperator.call(this, aOperators, oType).name;
						if (aOperators.indexOf(sDefaultOperator) < 0) { // as EQ is returned if not in List
							sDefaultOperator = undefined;
						}
					}
					if (sDefaultOperator) {
						return Condition.createCondition(sDefaultOperator, [oType.parseValue(vValue, sInternalType)], undefined, undefined, ConditionValidated.NotValidated);
					}
				}
				throw new ParseException("Don't know how to parse Condition from " + sInternalType);
		}

	};

	function _finishParseFromString(oCondition, oType) {

		var bIsUnit = this.oFormatOptions.isUnit;
		var oOriginalDateType = _getOriginalDateType.call(this);
		var sUnit = null; // default for empty unit

		if (bIsUnit) {
			var vMeasure;
			if (oOriginalDateType._aCurrentValue) {
				vMeasure = oOriginalDateType._aCurrentValue[0];
			}

			if (oCondition) {
				if (oCondition.operator !== "EQ") {
					throw new ParseException("unsupported operator");
				}
				sUnit = oCondition.values[0]; // use key of unit
				oCondition.values = [[vMeasure, sUnit]];
			} else {
				// create a condition if no unit is entered
				oCondition = Condition.createCondition("EQ", [[vMeasure, null]], undefined, undefined, ConditionValidated.NotValidated);
			}
			_attachCurrentValueAtType.call(this, oCondition, oOriginalDateType);
		} else if (oCondition) {
			var sName = oType.getMetadata().getName();
			var oDelegate = this.oFormatOptions.delegate;
			var oPayload = this.oFormatOptions.payload;
			if (oDelegate && oDelegate.getTypeUtil(oPayload).getBaseType(sName) === BaseType.Unit &&
					!oCondition.values[0][1] && oType._aCurrentValue) {
				// TODO: if no unit provided use last one
				sUnit = oType._aCurrentValue[1] ? oType._aCurrentValue[1] : null; // if no unit set null
				oCondition.values[0][1] = sUnit;
				if (oCondition.operator === "BT") {
					oCondition.values[1][1] = sUnit;
				}
			}

			_attachCurrentValueAtType.call(this, oCondition, oType);
			_attachCurrentValueAtType.call(this, oCondition, oOriginalDateType);
		}

		return oCondition;

	}

	function _parseDetermineKeyAndDescription(oOperator, vValue, oType, bUseDefaultOperator, bCheckForDefault, aOperators, sDisplay, bFirstCheck) {

		var vKey;
		var vDescription;
		var bCheckKey = true;
		var bCheckKeyFirst = true;
		var bCheckDescription = false;
		var vCheckValue;
		var vCheckParsedValue;
		var oBindingContext = this.oFormatOptions.bindingContext;
		var oConditionModel = this.oFormatOptions.conditionModel;
		var sConditionModelName = this.oFormatOptions.conditionModelName;
		var aValues;

		if (vValue === "") {
			// check for empty key
			aValues = [];
			vKey = vValue;
			vCheckValue = vValue;
		} else {
			aValues = oOperator.getValues(vValue, sDisplay, bUseDefaultOperator);
			vKey = bFirstCheck ? aValues[0] : aValues[1];
			vDescription = bFirstCheck ? aValues[1] : aValues[0]; // in second run, use second value for check
			bCheckDescription = sDisplay !== FieldDisplay.Value;
			bCheckKeyFirst = sDisplay === FieldDisplay.Value || sDisplay === FieldDisplay.ValueDescription;
			vCheckValue = bCheckKeyFirst ? vKey || vDescription : vDescription || vKey; // just check input
		}

		// handle sync case and async case similar
		var fnError = function(oException) {
			if (oException && !(oException instanceof ParseException) && !(oException instanceof FormatException)) { // FormatException could also occur
				// unknown error -> just raise it
				throw oException;
			}

			if (!oException._bNotUnique) { // TODO: better solution?
				// not unique -> don't try to use default operator or search again
				if (vValue === "") {
					// empty string might be parsed to something else for check (e.g. 0000) -> if nothing found this is not an error
					// no empty key -> no condition
					return null;
				}

				if (bFirstCheck && aValues[0] && aValues[1]) {
					// key and description entered -> check now description
					return _parseDetermineKeyAndDescription.call(this, oOperator, vValue, oType, bUseDefaultOperator, bCheckForDefault, aOperators, sDisplay, false);
				}

				if (bCheckForDefault) {
					return _parseUseDefaultOperator.call(this, oType, aOperators, vValue, sDisplay);
				}
			}

			if (_isInvalidInputAllowed.call(this)) {
				return _returnUserInput.call(this, oType, aOperators, vValue, sDisplay);
			}
			throw new ParseException(oException.message); // to have ParseException
		};

		var fnSuccess = function(oResult) {
			if (oResult) {
				var aValues = [oResult.key];
				if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1] !== Operator.ValueType.Static) {
					// description is supported
					aValues.push(oResult.description);
				}
				return Condition.createCondition(oOperator.name, aValues, oResult.inParameters, oResult.outParameters, ConditionValidated.Validated);
			} else if (vValue === "") {
				// no empty key -> no condition
				return null;
			} else {
				// FieldHelp might not fire an exception if nothing found -> but handle this as error
				return fnError.call(this, new ParseException(this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue])));// use original value in message
			}
		};

		var iCallCount = this._oCalls.last;

		var fnGetResult = function(vResult, fnCheck) {
			var oCondition;
			var oMyException;
			try {
				oCondition = fnCheck.call(this, vResult);
			} catch (oException) {
				oMyException = oException; // to store for pending async calls
			}
			return _returnResult.call(this, oCondition, oMyException, iCallCount, false, oType);
		};

		try {
			vCheckParsedValue = oType.parseValue(vCheckValue, "string");
			oType.validateValue(vCheckParsedValue);
		} catch (oException) {
			if (oException && !(oException instanceof ParseException) && !(oException instanceof ValidateException)) {// FormatException could also occur
				// unknown error -> just raise it
				throw oException;
			}
			bCheckKey = false; // cannot be a valid key
			bCheckKeyFirst = false;
			vCheckParsedValue = undefined;
		}

		return SyncPromise.resolve().then(function() {
			return _getItemForValue.call(this, vCheckValue, vCheckParsedValue, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName);
		}.bind(this)).then(function(oResult) {
			return fnGetResult.call(this, oResult, fnSuccess);
		}.bind(this)).catch(function(oException) {
			return fnGetResult.call(this, oException, fnError);
		}.bind(this)).unwrap();

	}

	function _parseUseDefaultOperator(oType, aOperators, vValue, sDisplay) {

		var oOperator = _getDefaultOperator.call(this, aOperators, oType);
		var oCondition;

		if (oOperator && aOperators.indexOf(oOperator.name) >= 0) {
			oCondition = oOperator.getCondition(vValue, oType, FieldDisplay.Value, true); // use Value as displayFormat if nothing found in FieldHelp
			oCondition.validated = ConditionValidated.NotValidated;
		}

		return oCondition;

	}

	function _returnUserInput(oType, aOperators, vValue, sDisplay) {

		// Field accepts values that are not found -> must be checked by caller
		// if user input fits to the type, let the caller validate it
		var oOperator;
		if (aOperators.length === 1) {
			// just use the one supported type
			oOperator = FilterOperatorUtil.getOperator(aOperators[0]);
		} else {
			// use EQ operator
			oOperator = FilterOperatorUtil.getEQOperator(aOperators);
			if (aOperators.indexOf(oOperator.name) < 0) { // as EQ is returned if not in List
				oOperator = undefined;
			}
		}

		if (!oOperator) {
			throw new ParseException("Cannot parse value " + vValue); // use original value in message
		}

		var oCondition = oOperator.getCondition(vValue, oType, FieldDisplay.Value, true); // use display format Value as entered string should used as it is

		if (oCondition) {
			oCondition.validated = ConditionValidated.NotValidated;
		}

		return oCondition;

	}

	ConditionType.prototype.validateValue = function(oCondition) {

		var oType = _getValueType.call(this);
		var oOriginalDateType = _getOriginalDateType.call(this);
		var aOperators = _getOperators.call(this);
		var bIsUnit = this.oFormatOptions.isUnit;

		if (oCondition === undefined || this._bDestroyed) { // if destroyed do nothing
			return null;
		} else if (oCondition === null) {
			// check if type allows to be null
			if (FilterOperatorUtil.onlyEQ(aOperators)) {
				// TODO: also for FilterField case?
				try {
					if (oType.hasOwnProperty("_sParsedEmptyString") && oType._sParsedEmptyString !== null) { //TODO: find solution for all types
						// empty string is parsed as empty string or "0", so validate for this
						oType.validateValue(oType._sParsedEmptyString);
					} else {
						oType.validateValue(null);
					}
				} catch (oError) {
					if (oError instanceof ValidateException) {
						throw oError;
					} else {
						//validation breaks with runtime error -> just ignore
						//TODO: is this the right way?
						return null;
					}
				}
			}
			return null;
		}

		if (typeof oCondition !== "object" || !oCondition.operator || !oCondition.values ||
				!Array.isArray(oCondition.values)) {
			throw new ValidateException(this._oResourceBundle.getText("field.VALUE_NOT_VALID"));
		}

		var oOperator = FilterOperatorUtil.getOperator(oCondition.operator, aOperators);

		if (bIsUnit) {
			// only use unit in condition
			oCondition = merge({}, oCondition);
			if (oCondition.values[0] && Array.isArray(oCondition.values[0])) {
				oCondition.values[0] = oCondition.values[0][1];
			}
			oOperator = FilterOperatorUtil.getEQOperator(); // as only EQ is allowed for unit
		}

		if (!oOperator) {
			throw new ValidateException("No valid condition provided, Operator wrong.");
		}

		try {
			oOperator.validate(oCondition.values, oType);
		} catch (oException) {
			if (oException instanceof ValidateException && oOriginalDateType) {
				// As internal yyyy-MM-dd is used as pattern for dates (times similar) the
				// ValidateException might contain this as pattern. The user should see the pattern thats shown
				// So try to validate date with the original type to get ValidateException with right pattern.
				oOperator.validate(oCondition.values, oOriginalDateType);
			}
			throw oException;
		}

	};

	function _getDisplay() {

		var sDisplay = this.oFormatOptions.display;
		if (!sDisplay) {
			sDisplay = FieldDisplay.Value;
		}

		return sDisplay;

	}

	function _getValueType() {

		var oType = this.oFormatOptions.valueType;
		if (!oType) {
			// no type provided -> use string type as default
			if (!this._oDefaultType) {
				this._oDefaultType = new StringType();
			}
			oType = this._oDefaultType;
		}

		return oType;

	}

	function _getOriginalDateType() {

		return this.oFormatOptions.originalDateType;

	}

	function _getOperators() {

		var aOperators = this.oFormatOptions.operators;
		if (!aOperators || aOperators.length === 0) {
			aOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String); // TODO: check for type
		}

		return aOperators;

	}

	function _getFieldHelp() {

		var sID = this.oFormatOptions.fieldHelpID;
		if (sID) {
			var oFieldHelp = sap.ui.getCore().byId(sID);
			if (oFieldHelp && oFieldHelp.isUsableForValidation()) {
				return oFieldHelp;
			}
		}

		return null;

	}

	function _isCompositeType(oType) {

		return oType && oType.isA("sap.ui.model.CompositeType");

	}

	function _attachCurrentValueAtType(oCondition, oType) {

		if (_isCompositeType.call(this, oType) && oCondition && oCondition.values[0]) {
				oType._aCurrentValue = oCondition.values[0];
		}

	}

	function _initCurrentValueAtType(oType) {

		if (_isCompositeType.call(this, oType) && !oType._aCurrentValue) {
				oType._aCurrentValue = [];
		}

	}

	function _mapResultToCondition(oCondition, oResult) {

		oCondition.values = [oResult.key, oResult.description];

		if (oResult.inParameters) {
			oCondition.inParameters = oResult.inParameters;
		}
		if (oResult.outParameters) {
			oCondition.outParameters = oResult.outParameters;
		}

		return oCondition;

	}

	function _fnReturnPromise(oPromise) {

		if (this.oFormatOptions.asyncParsing) {
			this.oFormatOptions.asyncParsing(oPromise);
		}

		return oPromise;

	}

	function _getBaseType(oType) {

		var sType = oType.getMetadata().getName();
		var oFormatOptions = oType.getFormatOptions();
		var oConstraints = oType.getConstraints();
		var oDelegate = this.oFormatOptions.delegate;
		var oPayload = this.oFormatOptions.payload;
		var sBaseType = oDelegate ? oDelegate.getTypeUtil(oPayload).getBaseType(sType, oFormatOptions, oConstraints) : BaseType.String;

		if (sBaseType === BaseType.Unit) {
			sBaseType = BaseType.Numeric;
		}

		return sBaseType;

	}

	function _isInputValidationEnabled() {

		var oFieldHelp = _getFieldHelp.call(this);
		var oDelegate = this.oFormatOptions.delegate;
		var oPayload = this.oFormatOptions.payload;

		if (oDelegate) {
			return oDelegate.isInputValidationEnabled(oPayload, oFieldHelp);
		} else {
			return !!oFieldHelp;
		}

	}

	function _isInvalidInputAllowed() {

		var oFieldHelp = _getFieldHelp.call(this);
		var oDelegate = this.oFormatOptions.delegate;
		var oPayload = this.oFormatOptions.payload;

		if (oDelegate) {
			return oDelegate.isInvalidInputAllowed(oPayload, oFieldHelp);
		} else if (oFieldHelp) {
			return !oFieldHelp.getValidateInput();
		} else {
			return true;
		}

	}

	function _getItemForValue(vValue, vParsedValue, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName) {

		var oFieldHelp = _getFieldHelp.call(this);
		var oDelegate = this.oFormatOptions.delegate;
		var oPayload = this.oFormatOptions.payload;

		if (oDelegate) {
			return oDelegate.getItemForValue(oPayload, oFieldHelp, vValue, vParsedValue, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName);
		} else if (oFieldHelp) {
			return oFieldHelp.getItemForValue(vValue, vParsedValue, undefined, undefined, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName);
		}

	}

	function _getDescription(vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName) {

		var oFieldHelp = _getFieldHelp.call(this);
		var oDelegate = this.oFormatOptions.delegate;
		var oPayload = this.oFormatOptions.payload;

		if (oDelegate) {
			return oDelegate.getDescription(oPayload, oFieldHelp, vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName);
		} else if (oFieldHelp) {
			return oFieldHelp.getTextForKey(vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName);
		}

	}

	function _getDefaultOperator(aOperators, oType) {

		var sDefaultOperatorName = this.oFormatOptions.defaultOperatorName;
		var oOperator;
		if (sDefaultOperatorName) {
			oOperator = FilterOperatorUtil.getOperator(sDefaultOperatorName);
		} else {
			oOperator = FilterOperatorUtil.getDefaultOperator(_getBaseType.call(this, oType));
		}

		if (oOperator && aOperators.indexOf(oOperator.name) < 0) {
			// default operator not valid -> cannot use -> use first include-operator
			for (var i = 0; i < aOperators.length; i++) {
				oOperator = FilterOperatorUtil.getOperator(aOperators[i]);
				if (oOperator.exclude) {
					oOperator = undefined;
				} else {
					break;
				}
			}
		}

		return oOperator;

	}

	return ConditionType;

});
