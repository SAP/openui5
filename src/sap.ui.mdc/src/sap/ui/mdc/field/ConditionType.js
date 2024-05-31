/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
		"sap/ui/core/Element",
		"sap/ui/core/Lib",
		'sap/ui/model/SimpleType',
		'sap/ui/model/FormatException',
		'sap/ui/model/ParseException',
		'sap/ui/model/ValidateException',
		'sap/ui/mdc/field/ConditionTypeMixin',
		'sap/ui/mdc/enums/FieldDisplay',
		'sap/ui/mdc/enums/OperatorName',
		'sap/ui/mdc/enums/OperatorValueType',
		'sap/ui/mdc/condition/FilterOperatorUtil',
		'sap/ui/mdc/condition/Condition',
		'sap/ui/mdc/condition/ConditionValidateException',
		'sap/ui/mdc/enums/BaseType',
		'sap/ui/mdc/enums/ConditionValidated',
		'sap/base/util/merge',
		'sap/base/strings/whitespaceReplacer',
		'sap/ui/base/SyncPromise'
	],
	(
		Element,
		Library,
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		ConditionTypeMixin,
		FieldDisplay,
		OperatorName,
		OperatorValueType,
		FilterOperatorUtil,
		Condition,
		ConditionValidateException,
		BaseType,
		ConditionValidated,
		merge,
		whitespaceReplacer,
		SyncPromise
	) => {
		"use strict";

		const sTargetTypeRaw = "sap.ui.mdc.raw";
		const sTargetTypeRawComposite = "sap.ui.mdc.raw:";

		/**
		 * Constructor for a Condition type.
		 *
		 * @class
		 * This class represents a type that is used to map a single condition to a single-value control.
		 *
		 * @extends sap.ui.model.SimpleType
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @since 1.62.0
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
		 * @param {boolean} [oFormatOptions.multipleLines] If set, the input and output might contain multiple lines
		 * @param {object} [oConstraints] Value constraints
		 * @alias sap.ui.mdc.field.ConditionType
		 */
		const ConditionType = SimpleType.extend("sap.ui.mdc.field.ConditionType", /** @lends sap.ui.mdc.field.ConditionType.prototype */ {

			constructor: function(oFormatOptions, oConstraints) {
				SimpleType.apply(this, arguments);
				this.sName = "Condition";
				this._oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
				this._oCalls = { active: 0, last: 0, condition: undefined, exception: undefined }; // if Multiple async. calls, just use the last result
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

		/**
		 * Formats the given condition to an output value of the given target type.
		 * These values are formatted using the given data type. Depending on the operator
		 * and the configuration (set in <code>FormatOptions</code>), a description will be determined by a given value help or delegate.
		 *
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition
		 *	The condition to be formatted
		 * @param {string} sTargetType
		 *	The target type; see {@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Allowed Property Types}.
		 *	In addition to the standard target types, <code>sap.ui.mdc.raw</code> can be used. In this case the value is not formatted and just
		 *	forwarded to the target. If the value is an array representing data for a <code>CompositeType</code>, the index of the needed raw value can be added to the
		 *	name (For example, if a unit should be forwarded as raw value, <code>sap.ui.mdc.raw:1</code> can be used).
		 * @return {any|Promise}
		 *	The formatted output value or a <code>Promise</code> resolving with the formatted value
		 * @throws {sap.ui.model.FormatException}
		 *	If formatting to the target type is not possible
		 *
		 * @public
		 */
		ConditionType.prototype.formatValue = function(oCondition, sTargetType) {

			let oType = this._getValueType();
			if (oCondition == undefined || oCondition == null || this._bDestroyed) { // if destroyed do nothing
				_attachCurrentValueAtType.call(this, oCondition, oType); // initialize current value
				return null;
			}

			if (typeof oCondition !== "object" || !oCondition.operator || !oCondition.values ||
				!Array.isArray(oCondition.values)) {
				throw new FormatException("No valid condition provided");
			}

			if (!sTargetType) {
				sTargetType = "string";
			}

			const oAdditionalType = this._getAdditionalValueType();
			const bIsUnit = this._isUnit(oType);
			const bPreventGetDescription = this.oFormatOptions.preventGetDescription;

			_attachCurrentValueAtType.call(this, oCondition, oType); // use original condition

			let sDisplay, aOperators, oEQOperator, iCallCount, iIndex;

			switch (this.getPrimitiveType(sTargetType)) {
				case "string":
				case "any":
					sDisplay = this._getDisplay();
					aOperators = this._getOperators();
					oEQOperator = FilterOperatorUtil.getEQOperator(aOperators);
					if (!this.oFormatOptions.maxConditions || this.oFormatOptions.maxConditions === 1) { // as Tokens in FilterField using the same ConditionType, do not use the last value
						this._oCalls.active++;
						this._oCalls.last++;
					}
					iCallCount = this._oCalls.last;

					if (!bPreventGetDescription && sDisplay !== FieldDisplay.Value && oCondition.validated === ConditionValidated.Validated &&
						(bIsUnit || (oCondition.operator === oEQOperator.name && !oCondition.values[1]))) {
						// handle sync case and async case similar
						const oBindingContext = this.oFormatOptions.bindingContext;
						const vKey = bIsUnit ? oCondition.values[0][1] : oCondition.values[0];

						return SyncPromise.resolve().then(() => {
							return _getDescription.call(this, vKey, oCondition, oType, oAdditionalType, oBindingContext);
						}).then((vDescription) => { // if description needs to be requested -> return if it is resolved
							if (vDescription) {
								oCondition = merge({}, oCondition); // do not manipulate original object
								if (bIsUnit) {
									// in unit case create "standard" condition using String type for text arrangement
									oType = this._getDefaultType();
									oCondition.operator = oEQOperator.name;
									if (typeof vDescription !== "object") {
										vDescription = { key: vKey, description: vDescription };
									}
								}

								if (typeof vDescription === "object") {
									oCondition = _mapResultToCondition.call(this, oCondition, vDescription);
								} else if (oCondition.values.length === 1) {
									oCondition.values.push(vDescription);
								} else {
									oCondition.values[1] = vDescription;
								}
							}
							return _returnResult.call(this, oCondition, undefined, iCallCount, true, oType, oAdditionalType);
						}).catch((oException) => {
							let oMyException;
							if (!(oException instanceof FormatException) || !_isInvalidInputAllowed.call(this)) {
								// if "invalid" input is allowed don't fire an exception
								oMyException = oException;
							}

							return _returnResult.call(this, oCondition, oMyException, iCallCount, true, oType, oAdditionalType);
						}).unwrap();
					}

					return _returnResult.call(this, oCondition, undefined, iCallCount, true, oType, oAdditionalType);
				default:
					iIndex = _getIndexOfRawValue(sTargetType);
					if (iIndex >= 0) {
						if (this._isCompositeType(oType)) {
							//used for compositeTypes if just one value needs to be transfered without any formatting (e.g. for Timezone)
							return oCondition.values.length >= 1 ? oCondition.values[0][iIndex] : null;
						}
					} else if (sTargetType === sTargetTypeRaw) {
						return oCondition.values.length >= 1 ? oCondition.values[0] : null; // TODO: how to handle operators <> EQ
					} else if (oType && oCondition.values.length >= 1) {
						// operators can only be formatted to string. But other controls (like Slider) might just use the value
						return oType.formatValue(oCondition.values[0], sTargetType);
					}

					throw new FormatException("Don't know how to format Condition to " + sTargetType);
			}

		};

		function _formatToString(oCondition, oType, oAdditionalType) {

			const sDisplay = this._getDisplay();
			const bIsUnit = this._isUnit(oType);

			if (bIsUnit && oCondition.values.length > 1 && oCondition.values[0][1] === oCondition.values[1][1]) { // in Between case format only one unit
				oCondition = merge({}, oCondition); // don't use same object
				oCondition.operator = OperatorName.EQ;
				oCondition.values.splice(1);
			}

			const bHideOperator = (this._getHideOperator() && oCondition.values.length === 1) || bIsUnit;
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			const aCompositeTypes = this._getCompositeTypes();
			const aAdditionalCompositeTypes = this._getAdditionalCompositeTypes();

			if (!oOperator) {
				throw new FormatException("No valid condition provided, Operator wrong.");
			}

			let sResult = oOperator.format(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes);
			const bConvertWhitespaces = this.oFormatOptions.convertWhitespaces;

			if (bConvertWhitespaces && (this._getBaseType(oType) === BaseType.String || sDisplay !== FieldDisplay.Value)) {
				// convert only string types to prevent unwanted side effects
				sResult = whitespaceReplacer(sResult);
			}

			return sResult;

		}

		function _returnResult(oCondition, oException, iCallCount, bFormat, oType, oAdditionalType) {

			if (this._oCalls.active > 0) {
				this._oCalls.active--;
			}
			if (iCallCount < this._oCalls.last && (this._oCalls.condition !== undefined || this._oCalls.exception !== undefined)) {
				// there is already a newer result
				oCondition = this._oCalls.condition;
				oException = this._oCalls.exception;
			}

			if (iCallCount === this._oCalls.last && this._oCalls.active > 0) {
				this._oCalls.condition = merge({}, oCondition); // don't use same object
				this._oCalls.exception = oException;
			} else if (this._oCalls.active === 0 && this._oCalls.last > 0) { // no pending calls -> clean up
				this._oCalls = { active: 0, last: 0, condition: undefined, exception: undefined };
			}

			if (oException) {
				throw oException; // just throw exception
			}

			// finalize condition. If Exception occurs here just throw it
			let vResult;
			if (bFormat) {
				vResult = _formatToString.call(this, oCondition, oType, oAdditionalType);
			} else {
				vResult = _finishParseFromString.call(this, oCondition, oType);
			}

			return vResult;

		}

		/**
		 * Determines the text what is copied to clipboard if a token or item with the condition
		 * is selected and copied.
		 * For equal-conditions key/description pairs needs to be copied to allow pasing of such conditions.
		 *
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition
		 *	The condition to be copied
		 * @return {string} key/description pair seperated by TAB
		 * @throws {sap.ui.model.FormatException}
		 *	If formatting to the target type is not possible
		 *
		 * @protected
		 */
		 ConditionType.prototype.getTextForCopy = function(oCondition) {

			// TODO: what if description is not known in the moment? Can copy be async?
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			const oType = this._getValueType();
			const sDisplay = this._getDisplay();
			const bIsUnit = this._isUnit(oType);
			const bHideOperator = (this._getHideOperator() && oCondition.values.length === 1) || bIsUnit;
			const aCompositeTypes = this._getCompositeTypes();
			const oAdditionalType = this._getAdditionalValueType();
			const aAdditionalCompositeTypes = this._getAdditionalCompositeTypes();

			return oOperator.getTextForCopy(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes);

		 };

		/**
		 * Parses an external value of the given source type to a condition that holds the value in model
		 * representation.
		 * These values are parsed using the given data type. Depending on the operator
		 * and the configuration (set in <code>FormatOptions</code>), a value will be determined by a given value help or delegate.
		 *
		 * @param {any} vValue
		 *	The value that is parsed
		 * @param {string} sSourceType
		 *	The type of the given value; see
		 *	{@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Allowed Property Types}
		 *	In addition to the standard source types, <code>sap.ui.mdc.raw</code> can be used. In this case the value is not parsed and just
		 *	used in the condition. If the value of the condition is an array representing data for a <code>CompositeType</code>, the index of the needed raw value can be added to the
		 *	name (For example, if a unit should be forwarded as raw value <code>sap.ui.mdc.raw:1</code> can be used).
		 * @return {null|sap.ui.mdc.condition.ConditionObject|Promise<null|sap.ui.mdc.condition.ConditionObject>}
		 *	The condition or a <code>Promise</code> resolving with the condition.
		 *  If there is no value, <code>null</code> is returned.
		 * @throws {sap.ui.model.ParseException}
		 *	If parsing to the model type is not possible; the message of the exception is language-dependent as it may be displayed on the UI
		 *
		 * @public
		 */
		ConditionType.prototype.parseValue = function(vValue, sSourceType) {

			const bInputValidationEnabled = _isInputValidationEnabled.call(this);
			if (!sSourceType) {
				sSourceType = "string";
			} else if (sSourceType === "any" && typeof vValue === "string") {
				sSourceType = "string";
			}

			return this._parseValue(vValue, sSourceType, bInputValidationEnabled);

		};

		// own function as API for parseValue cannot be extended by inherited class
		/**
		 * Parses an external value of the given source type to a condition that holds the value in model
		 * representation.
		 * These values are parsed using the given data type. Depending on the operator
		 * and the configuration (set in <code>FormatOptions</code>) a value will be determined by a given value help or delegate.
		 *
		 * @param {any} vValue
		 *	The value that is parsed
		 * @param {string} sSourceType
		 *	The type of the given value; see
		 *	{@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Allowed Property Types}
		 *	In addition to the standard source types, <code>sap.ui.mdc.raw</code> can be used. In this case the value is not parsed and just
		 *	used in the condition. If the value of the condition is an array representing data for a <code>CompositeType</code> ,the index of the needed raw value can be added to the
		 *	name (For example, if a unit should be forwarded as raw value <code>sap.ui.mdc.raw:1</code> can be used).
		 * @param {boolean} bInputValidationEnabled
		 *	If set, input validation is enabled, otherwise disabled, even if delegate or ValueHelp allows it. (Pasting multiple values)
		 * @param {sap.ui.mdc.enums.FieldDisplay} [sForceDisplay] Display mode to use, independend of configured one
		 * @return {null|sap.ui.mdc.condition.ConditionObject|Promise<null|sap.ui.mdc.condition.ConditionObject>}
		 *	The condition or a <code>Promise</code> resolving with the condition.
		 *  If there is no value, <code>null</code> is returned.
		 * @throws {sap.ui.model.ParseException}
		 *	If parsing to the model type is not possible; the message of the exception is language-dependent as it may be displayed on the UI
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc.field.ConditionsType
		 */
		ConditionType.prototype._parseValue = function(vValue, sSourceType, bInputValidationEnabled, sForceDisplay) {

			if (this._bDestroyed) { // if destroyed do nothing
				return null;
			}

			let oCondition;
			const oNavigateCondition = this.oFormatOptions.navigateCondition;
			if (oNavigateCondition) {
				// condition already known from navigation. Just check if it is really the same as the input.
				let vOutput;
				if (oNavigateCondition.hasOwnProperty("output")) {
					vOutput = oNavigateCondition.output;
				} else {
					vOutput = this.formatValue(oNavigateCondition, sSourceType);
				}
				if (vOutput === vValue) {
					oCondition = merge({}, oNavigateCondition); // use copy
					delete oCondition.output;
					return oCondition;
				}
			}

			const sDisplay = sForceDisplay ? sForceDisplay : this._getDisplay();
			const oType = this._getValueType();
			const oOriginalType = this._getOriginalType();
			const aOperators = this._getOperators();
			const bIsUnit = this._isUnit(oType);
			let sDefaultOperator;

			if (vValue === null || vValue === undefined || (vValue === "" && !bInputValidationEnabled)) { // check if "" is a key in ValueHelp
				if (!this._isCompositeType(oType)) {
					return null; // TODO: for all types???
				}
			}

			_initCurrentValueAtType.call(this, oType);

			let oOperator, bCheckForDefault, bUseDefaultOperator;
			let bHideOperator = this._getHideOperator(); // hide operator only supported if default operator used; If no matching operator found and EQ opeator used instead also hide operator

			switch (this.getPrimitiveType(sSourceType)) {
				case "string":
					bCheckForDefault = false;
					bUseDefaultOperator = false;

					if (aOperators.length === 1) {
						// only one operator supported -> use it
						oOperator = FilterOperatorUtil.getOperator(aOperators[0]);
						bUseDefaultOperator = true;
					} else {
						const aMatchingOperators = FilterOperatorUtil.getMatchingOperators(aOperators, vValue);

						if (aMatchingOperators.length === 0) {
							// use default operator if nothing found
							oOperator = this._getDefaultOperator(aOperators, oType);

							if (bInputValidationEnabled && !this._isCompositeType(oType)) {
								// try first to use EQ and find it in ValueHelp. If not found try later with default operator
								const oEQOperator = FilterOperatorUtil.getEQOperator(aOperators);
								if (aOperators.indexOf(oEQOperator.name) >= 0) { // as EQ is returned if not in List
									bCheckForDefault = !!oOperator && oOperator.name !== oEQOperator.name; // only if default operator exists and is different
									oOperator = oEQOperator;
								}
							}

							bUseDefaultOperator = true;
						} else {
							//in case of multiple matches we use the first operators without ValueType (if exist) / at the moment we have two matching operators for "<empty>"" --> LT and EMPTY
							const aOperatorsWithoutValueType = aMatchingOperators.filter((oOperator) => { return oOperator.valueTypes.length === 0; });
							if (aOperatorsWithoutValueType.length >= 1) {
								oOperator = aOperatorsWithoutValueType[0];
							} else {
								oOperator = aMatchingOperators[0]; // TODO: use the first of the matching operators
							}
							bHideOperator = false; // as operator is found for input
						}
					}

					if (oOperator) {
						if (bIsUnit && oOperator !== FilterOperatorUtil.getEQOperator(aOperators)) {
							throw new ParseException("unsupported operator");
						}
						const bCompositeType = this._isCompositeType(oType);
						const aCompositeTypes = this._getCompositeTypes();
						const oAdditionalType = this._getAdditionalValueType();
						const aAdditionalCompositeTypes = this._getAdditionalCompositeTypes();
						this._oCalls.active++;
						this._oCalls.last++;
						const iCallCount = this._oCalls.last;

						if ((!bCompositeType || bIsUnit) && oOperator.validateInput && bInputValidationEnabled) {
							// use ValueHelp to determine condition (for unit part also if composite type used)
							oCondition = _parseDetermineKeyAndDescription.call(this, oOperator, vValue, oType, oAdditionalType, bUseDefaultOperator, bHideOperator, bCheckForDefault, aOperators, sDisplay, true);
							return this._fnReturnPromise(oCondition);
						} else {
							// just normal operator parsing
							try {
								if (vValue === "" && bCompositeType && bUseDefaultOperator) {
									// parse using unit part
									oCondition = Condition.createCondition(oOperator.name, [oType.parseValue(vValue, "string", oType._aCurrentValue)], undefined, undefined, ConditionValidated.NotValidated);
								} else {
									oCondition = oOperator.getCondition(vValue, oType, sDisplay, bUseDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, bHideOperator);
								}
							} catch (oException) {
								let oMyException = oException;
								if (oMyException instanceof ParseException && oOriginalType && !bCompositeType) {
									// As internal yyyy-MM-dd is used as pattern for dates (times similar) the
									// parse exception might contain this as pattern. The user should see the pattern thats shown
									// So try to parse date with the original type to get parseException with right pattern.
									// Not for CompositeTypes as here the parts might have different configuartion what leads to different messages.
									try {
										oOriginalType.parseValue(vValue, "string", oOriginalType._aCurrentValue);
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

					if (oCondition !== null) { // if explicitly parsed to empty this is not an error
						throw new ParseException("Cannot parse value " + vValue); // use original value in message
					}
					break;

				default:
					// operators can only be formatted from string. But other controls (like Slider) might just use the value
					if (oType) {
						// TODO: other operator?
						if (aOperators.length === 1) {
							// only one operator supported -> use it
							sDefaultOperator = aOperators[0];
						} else {
							sDefaultOperator = this._getDefaultOperator(aOperators, oType).name;
							if (aOperators.indexOf(sDefaultOperator) < 0) { // as EQ is returned if not in List
								sDefaultOperator = undefined;
							}
						}
						if (sDefaultOperator) {
							const iIndex = _getIndexOfRawValue(sSourceType);
							if (iIndex >= 0) {
								if (this._isCompositeType(oType)) {
									//used for compositeTypes if just one value needs to be transfered without any parsing (Timezone)
									const aValue = merge([], oType._aCurrentValue);
									aValue[iIndex] = vValue;
									return Condition.createCondition(sDefaultOperator, [aValue], undefined, undefined, ConditionValidated.NotValidated);
								}
							} else if (sSourceType === sTargetTypeRaw) {
								return Condition.createCondition(sDefaultOperator, [vValue], undefined, undefined, ConditionValidated.NotValidated);
							} else {
								return Condition.createCondition(sDefaultOperator, [oType.parseValue(vValue, sSourceType)], undefined, undefined, ConditionValidated.NotValidated);
							}
						}
					}
					throw new ParseException("Don't know how to parse Condition from " + sSourceType);
			}

		};

		function _finishParseFromString(oCondition, oType) {

			const bIsUnit = this._isUnit(oType);
			const bCompositeType = this._isCompositeType(oType);

			if (oCondition && !bIsUnit && bCompositeType) {
				const oOriginalType = this._getOriginalType() || oType; // use original type for determination if unit as valueType might mapped different (if no original type, valueType is original)
				const sName = oOriginalType.getMetadata().getName();
				const oFormatOptions = oOriginalType.getFormatOptions();
				const oConstraints = oOriginalType.getConstraints();
				const oDelegate = this._getDelegate();
				const oField = this.oFormatOptions.control;
				const sBaseType = oDelegate.getTypeMap(oField).getBaseType(sName, oFormatOptions, oConstraints); // don't use _getBaseType to get "real" unit type
				if ((sBaseType === BaseType.Unit || sBaseType === BaseType.DateTime) &&
					!oCondition.values[0][1] && oType._aCurrentValue) {
					// TODO: if no unit provided use last one
					const sUnit = oType._aCurrentValue[1] === undefined ? null : oType._aCurrentValue[1]; // undefined in CompositeType means "not changed" -> if no current unit it needs to be null
					oCondition.values[0][1] = sUnit;
					if (oCondition.operator === OperatorName.BT) {
						oCondition.values[1][1] = sUnit;
					}
				}
			}

			_attachCurrentValueAtType.call(this, oCondition, oType);

			return oCondition;

		}

		function _parseDetermineKeyAndDescription(oOperator, vValue, oType, oAdditionalType, bUseDefaultOperator, bHideOperator, bCheckForDefault, aOperators, sDisplay, bFirstCheck) {

			let vKey;
			let vDescription;
			let bCheckKey = true;
			let bCheckDescription = false;
			let vCheckValue;
			let vCheckParsedDescription;
			const oBindingContext = this.oFormatOptions.bindingContext;
			const bOperatorSymbolEntered = bHideOperator ? false : oOperator.test(vValue); // if operator hidden it is always false
			let aValues = vValue !== "" && oOperator.getValues(vValue, sDisplay, bUseDefaultOperator, bHideOperator);
			let bExactMatch = true; // only allow exact matches (no first suggested one)

			if (!aValues) { // if only operator symbol entered handle it as nothing entered
				// check for empty key
				aValues = [];
				vKey = "";
				vCheckValue = "";
			} else {
				bExactMatch = bOperatorSymbolEntered; // if operator entered just take this value as unvalidated one, if no exact match found
				vKey = bFirstCheck ? aValues[0] : aValues[1];
				vDescription = bFirstCheck ? aValues[1] : aValues[0]; // in second run, use second value for check
				bCheckDescription = sDisplay !== FieldDisplay.Value;
				vCheckValue = vKey || vDescription; // just check input
			}

			// handle sync case and async case similar
			const fnError = function(oException) {
				if (oException && !(oException instanceof ParseException) && !(oException instanceof FormatException)) { // FormatException could also occur
					// unknown error -> just raise it
					throw oException;
				}

				if (!oException._bNotUnique) { // TODO: better solution?
					// not unique -> don't try to use default operator or search again
					if (vCheckValue === "") {
						// empty string might be parsed to something else for check (e.g. 0000) -> if nothing found this is not an error
						// no empty key -> no condition
						return null;
					}

					if (bFirstCheck && aValues[0] && aValues[1]) {
						// key and description entered -> check now description
						return _parseDetermineKeyAndDescription.call(this, oOperator, vValue, oType, oAdditionalType, bUseDefaultOperator, bHideOperator, bCheckForDefault, aOperators, sDisplay, false);
					}

					if (bCheckForDefault) {
						return _parseUseDefaultOperator.call(this, oType, oAdditionalType, aOperators, vValue, sDisplay, bHideOperator);
					}
				}

				if (bOperatorSymbolEntered || _isInvalidInputAllowed.call(this)) {
					return _returnUserInput.call(this, oType, oAdditionalType, aOperators, vValue, sDisplay, bHideOperator);
				}
				throw new ParseException(oException.message); // to have ParseException
			};

			const fnSuccess = function(oResult) {
				if (oResult) {
					const aValues = [oResult.key];
					if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1] !== OperatorValueType.Static) {
						// description is supported
						aValues.push(oResult.description);
					}
					return Condition.createCondition(oOperator.name, aValues, oResult.inParameters, oResult.outParameters, ConditionValidated.Validated, oResult.payload);
				} else if (vValue === "") {
					// no empty key -> no condition
					return null;
				} else {
					// ValueHelp might not fire an exception if nothing found -> but handle this as error
					return fnError.call(this, new ParseException(this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue]))); // use original value in message
				}
			};

			const iCallCount = this._oCalls.last;

			const fnGetResult = function(vResult, fnCheck) {
				let oCondition;
				let oMyException;
				try {
					oCondition = fnCheck.call(this, vResult);
					if (this._isUnit(oType)) {
						// create condition based on type
						if (oCondition) {
							if (oCondition.operator !== OperatorName.EQ) {
								throw new ParseException("unsupported operator");
							}
							const vNumber = oType._aCurrentValue && oType._aCurrentValue[0] !== undefined ? oType._aCurrentValue[0] : null; // undefined not valid for formatting, needs to be null
							const sUnit = oCondition.values[0]; // use key of unit
							oCondition.values = [
								[vNumber, sUnit]
							];
						} else if (vValue === "") {
							// create a condition if no unit is entered (use type to parse)
							oCondition = Condition.createCondition(oOperator.name, [oType.parseValue(vValue, "string", oType._aCurrentValue)], undefined, undefined, ConditionValidated.NotValidated);
						}
					}
				} catch (oException) {
					oMyException = oException; // to store for pending async calls
				}
				return _returnResult.call(this, oCondition, oMyException, iCallCount, false, oType);
			};

			const fnCheckForType = function(oType, aCompositeTypes, vCheckValue, bOtherCheck) {
				let vParsedValue;
				try {
					if (this._isUnit(oType)) {
						// for unit use part of composite type (as also useFirstMatch needs to be supported with incomplete keys)
						const oUsedType = aCompositeTypes && aCompositeTypes.length > 1 && aCompositeTypes[1] ? aCompositeTypes[1] : this._getDefaultType();
						vParsedValue = oUsedType.parseValue(vCheckValue, "string");
						oUsedType.validateValue(vParsedValue);
					} else {
						vParsedValue = oType.parseValue(vCheckValue, "string");
						oType.validateValue(vParsedValue);
					}
				} catch (oException) {
					if (oException && !(bOtherCheck && (oException instanceof ParseException || oException instanceof ValidateException)) && vCheckValue !== "") {
						// unknown error or no search for description -> just raise it
						// if empty value cannot be parsed, no value can be found. But this is not an error, it just makes the field empty
						throw oException;
					}
					vParsedValue = undefined;
				}
				return vParsedValue;
			}.bind(this);

			// check if is valid for key-type (if a key is determined use it, otherwise use checkValue)
			const vCheckParsedValue = fnCheckForType(oType, this._getCompositeTypes(), vKey || vCheckValue, bCheckDescription);
			bCheckKey = vCheckParsedValue !== undefined; // no check if cannot be parsed
			// check if is valid for description-type (if a description is determined use it, otherwise use checkValue)
			if (bCheckDescription) {
				vCheckParsedDescription = fnCheckForType(oAdditionalType, this._getAdditionalCompositeTypes(), vDescription || vCheckValue, bCheckKey);
				bCheckDescription = vCheckParsedDescription !== undefined; // no check if cannot be parsed
			}

			if (!bCheckKey && !bCheckDescription) {
				return null; // nothing to find -> no check needed
			}

			return SyncPromise.resolve().then(() => {
				return _getItemForValue.call(this, vCheckValue, vCheckParsedValue, vCheckParsedDescription, oType, oAdditionalType, oBindingContext, bCheckKey, bCheckDescription, bExactMatch);
			}).then((oResult) => {
				return fnGetResult.call(this, oResult, fnSuccess);
			}).catch((oException) => {
				return fnGetResult.call(this, oException, fnError);
			}).unwrap();

		}

		function _parseUseDefaultOperator(oType, oAdditionalType, aOperators, vValue, sDisplay, bHideOperator) {

			const oOperator = this._getDefaultOperator(aOperators, oType);
			let oCondition;

			if (oOperator && aOperators.indexOf(oOperator.name) >= 0) {
				oCondition = oOperator.getCondition(vValue, oType, FieldDisplay.Value, true, undefined, oAdditionalType, undefined, bHideOperator); // use Value as displayFormat if nothing found in ValueHelp
				oCondition.validated = ConditionValidated.NotValidated;
			}

			return oCondition;

		}

		function _returnUserInput(oType, oAdditionalType, aOperators, vValue, sDisplay, bHideOperator) {

			// Field accepts values that are not found -> must be checked by caller
			// if user input fits to the type, let the caller validate it
			let oOperator;
			if (this._isUnit(oType)) {
				// in unit case just use EQ operator
				oOperator = FilterOperatorUtil.getEQOperator();
			} else if (aOperators.length === 1) {
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

			const oCondition = oOperator.getCondition(vValue, oType, FieldDisplay.Value, true, undefined, oAdditionalType, undefined, bHideOperator); // use display format Value as entered string should used as it is

			if (oCondition) {
				oCondition.validated = ConditionValidated.NotValidated;
				if (this._isUnit(oType) && Array.isArray(oCondition.values[0])) {
					// user input is valid for type -> just return unit for further processing
					oCondition.values[0] = oCondition.values[0][1];
				}
			}

			return oCondition;

		}

		/**
		 * Validates a given condition. The values of the condition are validated using the given data type.
		 *
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition
		 *	The condition that is validated
		 * @returns {void|Promise}
		 *	<code>undefined</code> or a <code>Promise</code> resolving with an undefined value
		 * @throws {sap.ui.mdc.condition.ConditionValidateException}
		 *	If at least one of the values of the condition is not valid for the given data type; the message of the exception is
		 *	language-dependent as it may be displayed on the UI
		 *
		 * @public
		 */
		ConditionType.prototype.validateValue = function(oCondition) {

			const oType = this._getValueType();
			const oOriginalType = this._getOriginalType();
			const aOperators = this._getOperators();
			const bIsUnit = this._isUnit(oType);
			const bCompositeType = this._isCompositeType(oType);
			const aCompositeTypes = this._getCompositeTypes();
			let iCompositePart = 0;
			const oAdditionalType = this._getAdditionalValueType();
			const aAdditionalCompositeTypes = this._getAdditionalCompositeTypes();

			if (oCondition === undefined || this._bDestroyed) { // if destroyed do nothing
				return null;
			} else if (oCondition === null) {
				// check if type allows to be null
				if (FilterOperatorUtil.onlyEQ(aOperators)) {
					// TODO: also for FilterField case?
					let vCheckValue = null;
					try {
						if (oType.hasOwnProperty("_sParsedEmptyString") && oType._sParsedEmptyString !== null) { //TODO: find solution for all types
							// empty string is parsed as empty string or "0", so validate for this
							vCheckValue = oType._sParsedEmptyString;
						}
						oType.validateValue(vCheckValue);
					} catch (oException) {
						if (oException instanceof ValidateException) {
							try {
								if (oOriginalType && !bCompositeType) {
									// As internal yyyy-MM-dd is used as pattern for dates (times similar) the
									// ValidateException might contain this as pattern. The user should see the pattern thats shown
									// So try to validate date with the original type to get ValidateException with right pattern.
									// Not for CompositeTypes as here the parts might have different configuartion what leads to different messages.
									oOriginalType.validateValue(vCheckValue);
								}
								throw oException;
							} catch (oException) {
								if (oException instanceof ValidateException) {
									// add condition to exception to improve mapping in FieldBase handleValidationError
									throw new ConditionValidateException(oException.message, oException.violatedConstraints, null);
								}
								throw oException;
							}
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
				throw new ConditionValidateException(this._oResourceBundle.getText("field.VALUE_NOT_VALID"), undefined, typeof oCondition === "object" ? merge({}, oCondition) : oCondition);
			}

			let oOperator = FilterOperatorUtil.getOperator(oCondition.operator);

			if (bIsUnit) {
				oOperator = FilterOperatorUtil.getEQOperator(); // as only EQ is allowed for unit
				iCompositePart = 1;
			}

			if (!oOperator || aOperators.indexOf(oOperator.name) === -1) {
				throw new ConditionValidateException("No valid condition provided, Operator wrong.", undefined, merge({}, oCondition));
			}

			try {
				oOperator.validate(oCondition.values, oType, aCompositeTypes, iCompositePart, oAdditionalType, aAdditionalCompositeTypes);
			} catch (oException) {
				try {
					if (oException instanceof ValidateException && oOriginalType && !bCompositeType) {
						// As internal yyyy-MM-dd is used as pattern for dates (times similar) the
						// ValidateException might contain this as pattern. The user should see the pattern thats shown
						// So try to validate date with the original type to get ValidateException with right pattern.
						// Not for CompositeTypes as here the parts might have different configuartion what leads to different messages.
						oOperator.validate(oCondition.values, oOriginalType, aCompositeTypes, iCompositePart, oAdditionalType, aAdditionalCompositeTypes);
					}
					throw oException;
				} catch (oException) {
					if (oException instanceof ValidateException) {
						// add condition to exception to improve mapping in FieldBase handleValidationError
						throw new ConditionValidateException(oException.message, oException.violatedConstraints, merge({}, oCondition));
					}
					throw oException;
				}
			}

		};

		function _getValueHelp() {

			const sID = this.oFormatOptions.valueHelpID;
			if (sID) {
				const oValueHelp = Element.getElementById(sID);
				if (oValueHelp && oValueHelp.isValidationSupported()) {
					return oValueHelp;
				}
			}

			return null;

		}

		function _attachCurrentValueAtType(oCondition, oType) {

			if (this._isCompositeType(oType)) {
				let aCurrentValue;

				if (oCondition && oCondition.values[0]) {
					aCurrentValue = oCondition.values[0];
				} else {
					aCurrentValue = []; // need to have an array to process it in Operator._parseValue
				}
				oType._aCurrentValue = merge([], aCurrentValue); // use copy to prevent changes on original arry change aCurrentValue too

				const oAdditionalType = this._getAdditionalType();
				if (this._isCompositeType(oAdditionalType)) { // store in corresponding unit or measure type too
					oAdditionalType._aCurrentValue = merge([], aCurrentValue);
				}

				const oOriginalType = this._getOriginalType();
				if (this._isCompositeType(oOriginalType)) { // store in original type too (Currently not used in Unit/Currency type, but basically in CompositeType for parsing)
					oOriginalType._aCurrentValue = merge([], aCurrentValue);
				}
			}

		}

		function _initCurrentValueAtType(oType) {

			if (this._isCompositeType(oType)) {
				const oAdditionalType = this._getAdditionalType();
				if (this._isCompositeType(oAdditionalType)) {
					if (!oAdditionalType._aCurrentValue) {
						oAdditionalType._aCurrentValue = [];
					}

					oType._aCurrentValue = oAdditionalType._aCurrentValue; // to use before entered corresponding number or unit
				}
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
			if (oResult.payload) {
				oCondition.payload = oResult.payload;
			}

			return oCondition;

		}

		function _isInputValidationEnabled() {

			const oValueHelp = _getValueHelp.call(this);
			const oDelegate = this._getDelegate();

			return oDelegate.isInputValidationEnabled(this.oFormatOptions.control, oValueHelp);

		}

		function _isInvalidInputAllowed() {

			const oValueHelp = _getValueHelp.call(this);
			const oDelegate = this._getDelegate();

			return oDelegate.isInvalidInputAllowed(this, oValueHelp);

		}

		function _getItemForValue(vValue, vParsedValue, vParsedDescription, oType, oAdditionalType, oBindingContext, bCheckKey, bCheckDescription, bExactMatch) {

			const oValueHelp = _getValueHelp.call(this);
			const oDelegate = this._getDelegate();
			const oControl = this.oFormatOptions.control;
			const oConfig = {
				value: vValue,
				parsedValue: vParsedValue,
				parsedDescription: vParsedDescription,
				dataType: oType,
				bindingContext: oBindingContext,
				checkKey: bCheckKey,
				checkDescription: bCheckDescription,
				caseSensitive: bExactMatch ? true : undefined,
				exception: ParseException,
				exactMatch: bExactMatch,
				control: oControl
			};

			return oDelegate.getItemForValue(oControl, oValueHelp, oConfig);

		}

		function _getDescription(vKey, oCondition, oType, oAdditionalType, oBindingContext) {

			const oValueHelp = _getValueHelp.call(this);
			const oDelegate = this._getDelegate();
			const oControl = this.oFormatOptions.control;

			return oDelegate.getDescription(oControl, oValueHelp, vKey, oCondition.inParameters, oCondition.outParameters, oBindingContext, undefined, undefined, oCondition.payload, oControl, oType);

		}

		function _getIndexOfRawValue(sType) {

			let iIndex = -1;
			if (sType.startsWith(sTargetTypeRawComposite)) {
				iIndex = parseInt(sType[sTargetTypeRawComposite.length]);
			}
			return iIndex;

		}

		ConditionTypeMixin.call(ConditionType.prototype);

		return ConditionType;

	});