/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/mdc/field/FieldBase',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/ui/mdc/enum/FieldDisplay',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/base/util/deepEqual',
	'sap/base/util/merge',
	'sap/ui/model/BindingMode',
	'sap/ui/model/Context'
], function(
	ManagedObjectObserver,
	FieldBase,
	FieldBaseRenderer,
	FieldDisplay,
	Condition,
	FilterOperatorUtil,
	BaseType,
	ConditionValidated,
	deepEqual,
	merge,
	BindingMode,
	Context
) {
	"use strict";

	/**
	 * Constructor for a new <code>Field</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>Field</code> control is used to bind its value to data of a certain data type. Based on the data type settings, a default
	 * control is rendered by the <code>Field</code>. For example, if a date type is used, a {@link sap.m.DatePicker DatePicker} is rendered.
	 *
	 * @extends sap.ui.mdc.field.FieldBase
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.Field
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.54.0
	 * @experimental As of version 1.54
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var Field = FieldBase.extend("sap.ui.mdc.Field", /* @lends sap.ui.mdc.Field.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/field/Field.designtime",
			properties: {
				/**
				 * The value of the field.
				 *
				 * To display the key and the description in one field,
				 * the key must be set on the <code>value</code> property.
				 */
				value: {
					type: "any",
					defaultValue: null
				},

				/**
				 * The additional value of the field.
				 *
				 * To display the key and the description in one field,
				 * the description must be set on the <code>additionalValue</code> property.
				 */
				additionalValue: {
					type: "any",
					defaultValue: null
				}
			},
			events: {
				/**
				 * This event is fired when the <code>value</code> property of the field is changed by user interaction.
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event.
				 */
				change: {
					parameters: {

						/**
						 * The new value of the <code>Field</code>.
						 *
						 * If a <code>FieldHelp</code> is assigned to the <code>Field</code>, the <code>value</code> is used as key for the <code>FieldHelp</code> items.
						 */
						value: { type: "string" },

						/**
						 * Flag that indicates if the entered <code>value</code> is valid
						 */
						valid: { type: "boolean" },

						/**
						 * Returns a <code>Promise</code> for the change. The <code>Promise</code> returns the value if it is resolved.
						 * If the <code>change</code> event is synchronous, the promise has already been already resolved. If it is asynchronous,
						 * it will be resolved after the value has been updated.
						 *
						 * The <code>Field</code> should be set to busy during the parsing to prevent user input.
						 * As there might be a whole group of fields that needs to be busy, this cannot be done automatically.
						 *
						 * @since 1.69.0
						 */
						promise: { type: "Promise" }
					}
				}
			},
			defaultProperty: "value"
		},
		renderer: FieldBaseRenderer
	});

	Field.prototype.init = function() {

		this._vValue = null; // to compare with default values
		this._vAdditionalValue = null;

		FieldBase.prototype.init.apply(this, arguments);

		this.setMaxConditions(1);

		this._oObserver.observe(this, {
			properties: ["value", "additionalValue"]
		});

	};

	Field.prototype.exit = function() {

		FieldBase.prototype.exit.apply(this, arguments);

		if (this._iConditionUpdateTimer) {
			clearTimeout(this._iConditionUpdateTimer);
			delete this._iConditionUpdateTimer;
			delete this._bPendingConditionUpdate;
		}

		this._oBindingContext = undefined;

	};

	Field.prototype.bindProperty = function(sName, oBindingInfo) {

		if (sName === "value" && !oBindingInfo.formatter) { // not if a formatter is used, as this needs to be executed
			oBindingInfo.targetType = "raw"; // provide internal value to inner control
			var oDataType = this._oContentFactory.getDataType();
			if (oBindingInfo.type && (!oDataType ||
				oDataType.getMetadata().getName() !== oBindingInfo.type.getMetadata().getName() ||
				!deepEqual(oDataType.getFormatOptions(), oBindingInfo.type.getFormatOptions()) ||
				!deepEqual(oDataType.getConstraints(), oBindingInfo.type.getConstraints()) ||
				oDataType._bCreatedByOperator !== oBindingInfo.type._bCreatedByOperator)) {
				this._oContentFactory.setDataType(oBindingInfo.type);
				if (oBindingInfo.type.isA("sap.ui.model.CompositeType") && oBindingInfo.parts) {
					var aTypes = [];
					for (var i = 0; i < oBindingInfo.parts.length; i++) {
						aTypes.push(oBindingInfo.parts[i].type);
					}
					this._oContentFactory.setCompositeTypes(aTypes);
				}
				this._oContentFactory.updateConditionType();
				this.invalidate(); // as new inner control might be needed
			}
		}

		FieldBase.prototype.bindProperty.apply(this, arguments);

	};

	Field.prototype._handleModelContextChange = function(oEvent) {

		FieldBase.prototype._handleModelContextChange.apply(this, arguments);

		var oBinding = this.getBinding("value");
		if (oBinding) {
			var oBindingContext = oBinding.isA("sap.ui.model.CompositeBinding") ? oBinding.getBindings()[0].getContext() : oBinding.getContext();

			if (Context.hasChanged(this._oBindingContext, oBindingContext)) {
				// BindingContextChanged -> if parsing error trigger update to remove valueState and wrong input
				this._oBindingContext = oBindingContext;
				this._oContentFactory.updateConditionType();
				if (this._bParseError || this.getFieldHelp()) { // In FieldHelp case InParameters might need an update
					if (this._oManagedObjectModel) {
						this._oManagedObjectModel.checkUpdate(true, true); // async. to reduce updates
					}
					this._bParseError = false;
				}
			}

			if (!this._oContentFactory.getDataType()) {
				this._oContentFactory.setDataType(oBinding.getType());
				this.invalidate(); // as new inner control might be needed
			}
		}

	};

	Field.prototype._initDataType = function() {

		FieldBase.prototype._initDataType.apply(this, arguments);

		var oBinding = this.getBinding("value");
		if (oBinding) {
			this._oContentFactory.setDataType(oBinding.getType());
		}

	};

	Field.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		if (sPropertyName === "value" && this._bParseError && deepEqual(this.getValue(), this.validateProperty(sPropertyName, oValue))) {
			// in parse error and same value - no update on property - so remove error here
			if (this._oManagedObjectModel) {
				this._oManagedObjectModel.checkUpdate(true, true); // async. to reduce updates (additionalValue will follow)
			}
			this._bParseError = false;
		}

		return FieldBase.prototype.setProperty.apply(this, arguments);

	};

	/**
	 * This property must not be set for the <code>Field</code>
	 *
	 * @param {int} iMaxConditions Only 1 condition allowed in <code>Field</code>
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, this property is not supported for the <code>Field</code>.
	 * @ui5-not-supported
	 */
	Field.prototype.setMaxConditions = function(iMaxConditions) {

		if (iMaxConditions !== 1) {
			throw new Error("Only one condition allowed for Field " + this);
		}

		return this.setProperty("maxConditions", iMaxConditions, true);

	};

	Field.prototype._observeChanges = function(oChanges) {

		FieldBase.prototype._observeChanges.apply(this, arguments);

		if (oChanges.name === "value") {
			var vValue = _adjustValue.call(this, oChanges.current, oChanges.old);
			if (this._vAdditionalValue !== null && _checkAdditionalValueOneWay.call(this) && !_compareValues.call(this, vValue, this._vValue, true)) {
				// additionalValue is bound OneWay. Value is changed from outside, not from Field user input.
				// -> use model value for additionalValue. (Only use internal additionalValue if set by user input.)
				this._vAdditionalValue = this.getAdditionalValue();
			}
			this._vValue = vValue;
			_initializeType.call(this, oChanges.current);
			_triggerConditionUpdate.call(this);
		}

		if (oChanges.name === "additionalValue") {
			this._vAdditionalValue = oChanges.current;
			_triggerConditionUpdate.call(this);
		}

		if (oChanges.name === "conditions") {
			// keep value/additionalValue and conditions in sync
			// (value must be updated if conditions are changed in async parsing too, so not in change event)
			if (this._getContent().length <= 1) {
				// in unit/currency field update value with change event to prevent update by navigating from number to unit
				_updateValue.call(this, oChanges.current);
			}
		}

	};

	function _getValue() {

		// as on update value and additional value are set both, but properties can only be handled one after the other
		// store here to have them independent of the order.
		return this._vValue;

	}

	function _getAdditionalValue() {

		// as on update value and additional value are set both, but properties can only be handled one after the other
		// store here to have them independent of the order.
		return this._vAdditionalValue;

	}

	function _triggerConditionUpdate() {

		if (!this.bDelegateInitialized) {
			// wait until delegate is loaded
			this.awaitControlDelegate().then(function() {
				if (!this.bIsDestroyed) {
					_triggerConditionUpdate.call(this);
				}
			}.bind(this));
			return;
		}

		if (this.getDisplay() === FieldDisplay.Value) {
			// only value displayed -> no need to wait
			_updateCondition.call(this, _getValue.call(this), _getAdditionalValue.call(this));
		} else if (!this._iConditionUpdateTimer) {
			// call async. to update condition once if value and additionalValue set at same time
			this._iConditionUpdateTimer = setTimeout(function() {
				_updateCondition.call(this, _getValue.call(this), _getAdditionalValue.call(this));
				this._iConditionUpdateTimer = undefined;
				this._bPendingConditionUpdate = false;
			}.bind(this), 0);
			this._bPendingConditionUpdate = true;
		}

	}

	function _updateCondition(vValue, vAdditionalValue) {

		var aConditions = this.getConditions();
		if (this._checkValueInitial(vValue) && !vAdditionalValue) {
			// if empty -> no condition
			if (aConditions.length > 0) {
				this.setConditions([]);
			}
		} else {
			var vOldValue = aConditions[0] && aConditions[0].values[0];
			var sOldAdditionalValue = aConditions[0] && aConditions[0].values[1] ? aConditions[0].values[1] : null; // to compare with default value
			if (!aConditions[0] || aConditions[0].operator !== "EQ" || !_compareValues.call(this, vOldValue, vValue) ||
				sOldAdditionalValue !== vAdditionalValue) {
				// update conditions only if changed (keep out-parameter)
				var oCondition = Condition.createItemCondition(vValue, vAdditionalValue);
				oCondition.validated = ConditionValidated.Validated; // see every value set from outside as validated (to determine description, if needed)
				this.setConditions([oCondition]);
			}
		}

	}

	function _adjustValue(vValue, vOldValue) {

		var sDataType = this._oContentFactory.getDataType() ? this._oContentFactory.getDataType().getMetadata().getName() : this.getDataType(); // as type must not exist now

		if (vValue && vOldValue && (sDataType === "sap.ui.model.odata.type.Unit" || sDataType === "sap.ui.model.odata.type.Currency")
			&& !vValue[2] && vOldValue[2] !== undefined) {
			// if no unit table was provided use the old one.
			// As we cannot be sure that inner control is already rendered and dataType.formatValue was called with unit table.
			vValue = merge([], vValue); // do not change original array.
			vValue[2] = vOldValue[2];

			if (this._bPendingChange) { //change is pending because navigated between number and unit
				var oCondition = this.getConditions()[0];
				if (oCondition) {
					// check what was updated
					if (vValue[0] === vOldValue[0] && vValue[0] !== oCondition.values[0][0]) {
						// number not changed -> use pending value from condition
						vValue[0] = oCondition.values[0][0];
					}
					if (vValue[1] === vOldValue[1] && vValue[1] !== oCondition.values[0][1]) {
						// unit not changed -> use pending value from condition
						vValue[1] = oCondition.values[0][1];
					}
				}
			}
		}

		return vValue;

	}

	function _compareValues(vValue1, vValue2, bUpdateCheck) {

		var bEqual = vValue1 === vValue2;
		var sDataType = this._oContentFactory.getDataType() ? this._oContentFactory.getDataType().getMetadata().getName() : this.getDataType(); // as type must not exist now

		if (!bEqual && this.getTypeUtil().getBaseType(sDataType) === BaseType.Unit && Array.isArray(vValue1) && Array.isArray(vValue2)) {
			// in unit type the unit table is in there setting the value but not after parsing
			// units must be set at least once. so if not set compare too
			var vNumber1 = vValue1[0];
			var vUnit1 = vValue1[1];
			var vCustomUnit1 = vValue1.length >= 3 ? vValue1[2] : null; // if no custom units are given handle it like null
			var vNumber2 = vValue2[0];
			var vUnit2 = vValue2[1];
			var vCustomUnit2 = vValue2.length >= 3 ? vValue2[2] : null; // if no custom units are given handle it like null
			// null and undefined are handled different in Unit type, so don't handle it as equal
			if (vNumber1 === vNumber2 && vUnit1 === vUnit2
				&& (((this._bUnitSet || bUpdateCheck) && (!vCustomUnit1 || !vCustomUnit2)) || deepEqual(vCustomUnit1, vCustomUnit2))) {
				bEqual = true;
			}
			if ((vCustomUnit1 || vCustomUnit2) && !bUpdateCheck) {
				this._bUnitSet = true;
			}
		}

		return bEqual;

	}

	function _initializeType(vValue) {

		if (!this._bTypeInitialized) {
			if (!this.bDelegateInitialized) {
				// wait until delegate is loaded
				this.awaitControlDelegate().then(function() {
					if (!this.bIsDestroyed) {
						_initializeType.call(this, vValue);
					}
				}.bind(this));
				return;
			}

			var oBinding = this.getBinding("value");
			var oDataType = oBinding ? oBinding.getType() : this._oContentFactory.getDataType(); // use type from binding, not internal (might be a different one)
			this._oTypeInitialization = this.getControlDelegate().initializeTypeFromBinding(this.getPayload(), oDataType, vValue);
			this._bTypeInitialized = this._oTypeInitialization.bTypeInitialized;
			if (this._bTypeInitialized && this._oContentFactory.getUnitOriginalType()) {
				// internal type already created, initialize it too
				this.getControlDelegate().initializeInternalUnitType(this.getPayload(), this._oContentFactory.getDataType(), this._oTypeInitialization);
				this.getControlDelegate().initializeInternalUnitType(this.getPayload(), this._oContentFactory.getUnitType(), this._oTypeInitialization);
			}
		}

	}

	Field.prototype._fireChange = function(aConditions, bValid, vWrongValue, oPromise) {

		var vValue;

		if (aConditions) { // even if empty and error is returned, only in async case it is really empty
			if (bValid) {
				vValue = this._getResultForPromise(aConditions);
			} else {
				vValue = vWrongValue;
			}
		}

		if (this._getContent().length > 1) {
			// in unit/currency field update value with change event to prevent update by navigating from number to unit
			if (aConditions) {
				_updateValue.call(this, this.getConditions());
			} else if (oPromise) {
				// update value after Promise resolved
				oPromise = oPromise.then(function(vResult) {
					_updateValue.call(this, this.getConditions());
					return vResult;
				}.bind(this));
			}
		}

		this.fireChange({ value: vValue, valid: bValid, promise: oPromise }); // TODO: format value in change event to external format?

	};

	Field.prototype._getResultForPromise = function(aConditions) {

		var vValue;
		if (aConditions.length === 0 && this._oContentFactory.getDataType()) {
			// parse "" to get type specific initial value
			vValue = this._oContentFactory.getDataType().parseValue("", "string", []); // we need the empty array when the type is Unit
		} else if (aConditions.length === 1) {
			vValue = aConditions[0].values[0];
		}

		return vValue;

	};

	function _updateValue(aConditions) {

		if (!this.bDelegateInitialized) {
			// wait until delegate is loaded
			this.awaitControlDelegate().then(function() {
				if (!this.bIsDestroyed) {
					_updateValue.call(this, aConditions);
				}
			}.bind(this));
			return;
		}

		var vValue = null; // use default of property for empty to avoid updates from null to undefined
		var vAdditionalValue = null; // use default of property for empty to avoid updates from null to undefined
		var vOldValue = this.getValue();
		var vOldAdditionalValue = this.getAdditionalValue();

		if (aConditions.length === 0 && vOldValue === null && vOldAdditionalValue === null) {
			// Field initialized from setter -> cannot have a condition -> no update needed
			return;
		}

		vValue = this._getResultForPromise(aConditions);
		if (aConditions.length === 0 && !vOldAdditionalValue) {
			vAdditionalValue = vOldAdditionalValue; // to not update old initial value
		} else if (aConditions.length === 1 && aConditions[0].values.length > 1) {
			vAdditionalValue = aConditions[0].values[1];
		}

		// save internal as observer is called for each property and so might have the old value in getProperty.
		this._vValue = vValue;
		this._vAdditionalValue = vAdditionalValue;

		if (!_compareValues.call(this, vValue, vOldValue, true)) {
			// to run not in V4 update issues if data not already loaded
			this.setProperty("value", vValue, true);
		}
		if (vAdditionalValue !== vOldAdditionalValue && !_checkAdditionalValueOneWay.call(this)) {
			// to run not in V4 update issues if data not already loaded
			// do not update property in OneWay mode to keep in sync with model
			this.setProperty("additionalValue", vAdditionalValue, true);
		}

	}

	Field.prototype._getOperators = function() {

		return ["EQ"];

	};

	function _checkAdditionalValueOneWay() {

		var oBinding = this.getBinding("additionalValue");

		if (oBinding && oBinding.getBindingMode() === BindingMode.OneWay) {
			return true;
		}

		return false;

	}

	Field.prototype._checkCreateInternalContent = function() {

		if (!this.bIsDestroyed && this._oContentFactory.getDataType() && !this._isPropertyInitial("editMode") && !this._isPropertyInitial("multipleLines")) {
			// If DataType is provided via Binding and EditMode is set the internal control can be created
			// TODO: no control needed if just template for cloning
			FieldBase.prototype._checkCreateInternalContent.apply(this, arguments);
		}

	};

	/**
	 * Sets conditions to the property <code>conditions</code>.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @param {object[]} aConditions Conditions to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setConditions
	 * @function
	 */

	/**
	 * Gets conditions of the property <code>conditions</code>.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @returns {object[]} conditions of the field
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getConditions
	 * @function
	 */

	/**
	 * Sets a new value for property <code>dataType</code>.
	 *
	 * The type of data handled by the field. The type is used to parse, format, and validate the value.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored.
	 *
	 * @param {string} sDataType DataType to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setDataType
	 * @function
	 */

	/**
	 * Gets a new value for property <code>dataType</code>.
	 *
	 * The type of data handled by the field. The type is used to parse, format, and validate the value.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored.
	 *
	 * @param {string} sDataType DataType to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getDataType
	 * @function
	 */

	/**
	 * Sets a new value for property <code>dataTypeConstraints</code>.
	 *
	 * The constraints of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeConstraints</code> property are ignored.
	 *
	 * @param {string} oDataTypeConstraints Constraints to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the <code>Constraints</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setDataTypeConstraints
	 * @function
	 */

	/**
	 * Gets a new value for property <code>dataTypeConstraints</code>.
	 *
	 * The constraints of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeConstraints</code> property are ignored.
	 *
	 * @param {string} oDataTypeConstraints Constraints to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the <code>Constraints</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getDataTypeConstraints
	 * @function
	 */

	/**
	 * Sets a new value for property <code>dataTypeFormatOptions</code>.
	 *
	 * The format options of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeFormatOptions</code> property are ignored.
	 *
	 * @param {string} oDataTypeFormatOptions Format options to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the <code>FormatOptions</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setDataTypeFormatOptions
	 * @function
	 */

	/**
	 * Gets a new value for property <code>dataTypeFormatOptions</code>.
	 *
	 * The format options of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeFormatOptions</code> property are ignored.
	 *
	 * @param {string} oDataTypeFormatOptions Format options to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the <code>FormatOptions</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getDataTypeFormatOptions
	 * @function
	 */

	return Field;

});
