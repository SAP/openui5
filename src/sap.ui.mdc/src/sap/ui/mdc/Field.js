/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/field/FieldBase',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/OperatorName',
	'sap/ui/mdc/condition/Condition',
	'sap/base/util/deepEqual',
	'sap/base/util/merge',
	'sap/ui/model/BindingMode',
	'sap/ui/model/Context'
], (
	FieldBase,
	FieldBaseRenderer,
	FieldDisplay,
	BaseType,
	OperatorName,
	Condition,
	deepEqual,
	merge,
	BindingMode,
	Context
) => {
	"use strict";

	/**
	 * Constructor for a new <code>Field</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>Field</code> control is used to bind its value to data of a certain data type. Based on the data type settings, a default
	 * control is rendered by the <code>Field</code> as follows:
	 *
	 * <ul>
	 * <li>In display mode, usually a {@link sap.m.Text Text} control is rendered.</li>
	 * <li>If <code>multipleLines</code> is set, an {@link sap.m.ExpandableText ExpandableText} control is rendered.</li>
	 * <li>If <code>fieldInfo</code> is set and it is configured to be triggerable, a {@link sap.m.Link Link} control is rendered.</li>
	 * <li>In edit mode, usually an {@link sap.m.Input Input} control is rendered.</li>
	 * <li>If <code>multipleLines</code> is set, a {@link sap.m.TextArea TextArea} control is rendered.</li>
	 * <li>If a date type is used, a {@link sap.m.DatePicker DatePicker} control is rendered.</li>
	 * <li>If a date/time type is used, a {@link sap.m.DateTimePicker DateTimePicker} control is rendered.</li>
	 * <li>If a time type is used, a {@link sap.m.TimePicker TimePicker} control is rendered.</li>
	 * <li>If a currency or unit type is used, two {@link sap.m.Input Input} controls are rendered, one for number and one for unit.</li>
	 * </ul>
	 *
	 * @extends sap.ui.mdc.field.FieldBase
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent, sap.m.IOverflowToolbarContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.Field
	 * @version ${version}
	 * @since 1.54.0
	 *
	 * @public
	 */
	const Field = FieldBase.extend("sap.ui.mdc.Field", /* @lends sap.ui.mdc.Field.prototype */ {
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
					defaultValue: null,
					bindable: "bindable"
				},

				/**
				 * The additional value of the field.
				 *
				 * To display the key and the description in one field,
				 * the description must be set on the <code>additionalValue</code> property.
				 */
				additionalValue: {
					type: "any",
					defaultValue: null,
					bindable: "bindable"
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
						 * If a <code>ValueHelp</code> is assigned to the <code>Field</code>, the <code>value</code> is used as key for the <code>ValueHelp</code> items.
						 */
						value: { type: "string" },

						/**
						 * Flag that indicates if the entered <code>value</code> is valid
						 */
						valid: { type: "boolean" },

						/**
						 * Returns a <code>Promise</code> for the change. The <code>Promise</code> returns the value if it is resolved.
						 * If the <code>change</code> event is synchronous, the <code>Promise</code> has already been already resolved. If it is asynchronous,
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
		this.setProperty("_operators", [OperatorName.EQ], true);

		this._oObserver.observe(this, {
			properties: ["value", "additionalValue", "valueState"]
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

		let oDataType;
		let aTypes;
		let i = 0;

		if (sName === "value" && !oBindingInfo.formatter) { // not if a formatter is used, as this needs to be executed
			oBindingInfo.targetType = "raw"; // provide internal value to inner control
			oDataType = this.getContentFactory().getDataType();
			if (oBindingInfo.type && (!oDataType ||
					oDataType.getMetadata().getName() !== oBindingInfo.type.getMetadata().getName() ||
					!deepEqual(oDataType.getFormatOptions(), oBindingInfo.type.getFormatOptions()) ||
					!deepEqual(oDataType.getConstraints(), oBindingInfo.type.getConstraints()) ||
					oDataType._bCreatedByOperator !== oBindingInfo.type._bCreatedByOperator)) {
				this.getContentFactory().setDataType(oBindingInfo.type);
				this.getContentFactory().setDateOriginalType(undefined);
				this.getContentFactory().setUnitOriginalType(undefined);
				this.getContentFactory().setIsMeasure(false);
				if (oBindingInfo.type.isA("sap.ui.model.CompositeType") && oBindingInfo.parts) {
					aTypes = [];
					for (i = 0; i < oBindingInfo.parts.length; i++) {
						aTypes.push(oBindingInfo.parts[i].type);
					}
					this.getContentFactory().setCompositeTypes(aTypes);
				}
				this.getContentFactory().updateConditionType();
				this.invalidate(); // as new inner control might be needed
			}
		} else if (sName === "additionalValue" && !oBindingInfo.formatter) { // not if a formatter is used, as this needs to be executed
			oBindingInfo.targetType = "raw"; // provide internal value to inner control
			oDataType = this.getContentFactory().getAdditionalDataType();
			if (oBindingInfo.type && (!oDataType ||
					oDataType.getMetadata().getName() !== oBindingInfo.type.getMetadata().getName() ||
					!deepEqual(oDataType.getFormatOptions(), oBindingInfo.type.getFormatOptions()) ||
					!deepEqual(oDataType.getConstraints(), oBindingInfo.type.getConstraints()) ||
					oDataType._bCreatedByOperator !== oBindingInfo.type._bCreatedByOperator)) {
				this.getContentFactory().setAdditionalDataType(oBindingInfo.type);
				if (oBindingInfo.type.isA("sap.ui.model.CompositeType") && oBindingInfo.parts) {
					aTypes = [];
					for (i = 0; i < oBindingInfo.parts.length; i++) {
						aTypes.push(oBindingInfo.parts[i].type);
					}
					this.getContentFactory().setAdditionalCompositeTypes(aTypes);
				}
				this.getContentFactory().updateConditionType();
				this.invalidate(); // as new inner control might be needed
			}
		}

		FieldBase.prototype.bindProperty.apply(this, arguments);

	};

	Field.prototype.handleModelContextChange = function(oEvent) {

		FieldBase.prototype.handleModelContextChange.apply(this, arguments);

		const oBinding = this.getBinding("value");
		if (oBinding) {
			const oBindingContext = oBinding.isA("sap.ui.model.CompositeBinding") ? oBinding.getBindings()[0].getContext() : oBinding.getContext();

			if (Context.hasChanged(this._oBindingContext, oBindingContext)) {
				// BindingContextChanged -> if parsing error trigger update to remove valueState and wrong input
				this._oBindingContext = oBindingContext;
				this.getContentFactory().updateConditionType();
				if (this.isInvalidInput() || this._getValueHelp()) { // In ValueHelp case InParameters might need an update
					if (this._oManagedObjectModel) {
						this._oManagedObjectModel.checkUpdate(true, true); // async. to reduce updates
					}
					this.resetInvalidInput();
				}
			}

			if (!this.getContentFactory().getDataType()) {
				this.getContentFactory().setDataType(oBinding.getType());
				this.invalidate(); // as new inner control might be needed
			}
		}

	};

	Field.prototype.initDataType = function() {

		FieldBase.prototype.initDataType.apply(this, arguments);

		const oBinding = this.getBinding("value");
		if (oBinding) {
			this.getContentFactory().setDataType(oBinding.getType());
		}

	};

	Field.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		if (sPropertyName === "value" && this.isInvalidInput() && deepEqual(this.getValue(), this.validateProperty(sPropertyName, oValue))) {
			// in parse error and same value - no update on property - so remove error here
			if (this._oManagedObjectModel) {
				this._oManagedObjectModel.checkUpdate(true, true); // async. to reduce updates (additionalValue will follow)
			}
			this.resetInvalidInput();
		}

		return FieldBase.prototype.setProperty.apply(this, arguments);

	};

	/**
	 * This property must not be set for the <code>Field</code>
	 *
	 * @param {int} iMaxConditions Only 1 condition allowed in <code>Field</code>
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @deprecated Not supported, this property is not supported for the <code>Field</code>.
	 * @ui5-not-supported
	 */
	Field.prototype.setMaxConditions = function(iMaxConditions) {

		if (iMaxConditions !== 1) {
			throw new Error("Only one condition allowed for Field " + this);
		}

		return this.setProperty("maxConditions", iMaxConditions, true);

	};

	Field.prototype.observeChanges = function(oChanges) {

		FieldBase.prototype.observeChanges.apply(this, arguments);

		if (oChanges.name === "value") {
			const vValue = _adjustValue.call(this, oChanges.current, oChanges.old);
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

		if (oChanges.name === "valueState") {
			// if condition update is pending do not remove the value state later if set before from outside
			if (this._bPendingConditionUpdate) {
				this._bKeepValueState = true;
			}
		}

		if (oChanges.name === "conditions") {
			// keep value/additionalValue and conditions in sync
			// (value must be updated if conditions are changed in async parsing too, so not in change event)
			if (this.getCurrentContent().length <= 1) {
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
			this.awaitControlDelegate().then(() => {
				if (!this.isFieldDestroyed()) {
					_triggerConditionUpdate.call(this);
				}
			});
			this._bPendingConditionUpdate = true;
			return;
		}

		if (this.getDisplay() === FieldDisplay.Value) {
			// only value displayed -> no need to wait
			_updateCondition.call(this, _getValue.call(this), _getAdditionalValue.call(this));
		} else if (!this._iConditionUpdateTimer) {
			// call async. to update condition once if value and additionalValue set at same time
			this._iConditionUpdateTimer = setTimeout(() => {
				_updateCondition.call(this, _getValue.call(this), _getAdditionalValue.call(this));
				this._iConditionUpdateTimer = undefined;
			}, 0);
			this._bPendingConditionUpdate = true;
		}

	}

	function _updateCondition(vValue, vAdditionalValue) {

		const aConditions = this.getConditions();
		if (_isEmpty.call(this, vValue, vAdditionalValue)) {
			// if empty -> no condition
			if (aConditions.length > 0) {
				this.setConditions([]);
			}
		} else {
			const oCurrentCondition = aConditions[0];
			const vOldValue = oCurrentCondition && oCurrentCondition.values[0];
			const vOldAdditionalValue = oCurrentCondition && oCurrentCondition.values[1] ? oCurrentCondition.values[1] : null; // to compare with default value
			if (!oCurrentCondition || oCurrentCondition.operator !== OperatorName.EQ || !_compareValues.call(this, vOldValue, vValue) || !_compareAdditionalValues.call(this, vAdditionalValue, vOldAdditionalValue)) {
				const oDelegate = this.getControlDelegate();
				const oNextCondition = oDelegate.createCondition(this, this, [vValue, vAdditionalValue], oCurrentCondition);
				if (!Condition.compareConditions(oCurrentCondition, oNextCondition)) { // We do a full comparison here as FilterOperatorUtils.compareConditions may ignore text changes
					this.setConditions(oNextCondition ? [oNextCondition] : []);
				}
			}
		}

		this._bPendingConditionUpdate = false;
		this._bKeepValueState = false;

	}

	function _adjustValue(vValue, vOldValue) {

		const sDataType = this.getContentFactory().getDataType() ? this.getContentFactory().getDataType().getMetadata().getName() : this.getDataType(); // as type must not exist now

		if (vValue && vOldValue && (sDataType === "sap.ui.model.odata.type.Unit" || sDataType === "sap.ui.model.odata.type.Currency") &&
			!vValue[2] && vOldValue[2] !== undefined) {
			// if no unit table was provided use the old one.
			// As we cannot be sure that inner control is already rendered and dataType.formatValue was called with unit table.
			vValue = merge([], vValue); // do not change original array.
			vValue[2] = vOldValue[2];

			if (this._bPendingChange) { //change is pending because navigated between number and unit
				const oCondition = this.getConditions()[0];
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

		let bEqual = vValue1 === vValue2;
		const sDataType = this.getContentFactory().getDataType() ? this.getContentFactory().getDataType().getMetadata().getName() : this.getDataType(); // as type must not exist now

		if (!bEqual && this.getTypeMap().getBaseType(sDataType) === BaseType.Unit && Array.isArray(vValue1) && Array.isArray(vValue2)) {
			// in unit type the unit table is in there setting the value but not after parsing
			// units must be set at least once. so if not set compare too
			const vNumber1 = vValue1[0];
			const vUnit1 = vValue1[1];
			const vCustomUnit1 = vValue1.length >= 3 ? vValue1[2] : null; // if no custom units are given handle it like null
			const vNumber2 = vValue2[0];
			const vUnit2 = vValue2[1];
			const vCustomUnit2 = vValue2.length >= 3 ? vValue2[2] : null; // if no custom units are given handle it like null
			// null and undefined are handled different in Unit type, so don't handle it as equal
			if (vNumber1 === vNumber2 && vUnit1 === vUnit2 &&
				(((this._bUnitSet || bUpdateCheck) && (!vCustomUnit1 || !vCustomUnit2)) || deepEqual(vCustomUnit1, vCustomUnit2))) {
				bEqual = true;
			}
			if ((vCustomUnit1 || vCustomUnit2) && !bUpdateCheck) {
				this._bUnitSet = true;
			}
		}

		return bEqual;

	}

	function _compareAdditionalValues(vValue1, vValue2, bUpdateCheck) {

		let bEqual = vValue1 === vValue2;

		if (!bEqual && (vValue1 === null || vValue1 === undefined || vValue1 === "") && (vValue2 === null || vValue2 === undefined || vValue2 === "")) {
			// in the moment there is no real data type support for additionalValue, normally only String types are used.
			// As, depending on the data type configuration a "" can be converted into null or vice versa it needs to be handed both as initial.
			// In case of wrong user input with disabled ValueHelp input validation no addtitionalValue is added at all, so if set to "" by model it is no change.
			// TODO: This logic needs to be adopted if there is a real data type support like for value.
			bEqual = true;
		}

		return bEqual;

	}

	function _initializeType(vValue) {

		if (!this._oTypeInitialization) {
			if (!this.bDelegateInitialized) {
				// wait until delegate is loaded
				this.awaitControlDelegate().then(() => {
					if (!this.isFieldDestroyed()) {
						_initializeType.call(this, vValue);
					}
				});
				return;
			}

			const oBinding = this.getBinding("value");
			const oDataType = oBinding ? oBinding.getType() : this.getContentFactory().getDataType(); // use type from binding, not internal (might be a different one)

			if (oDataType) {
				this._oTypeInitialization = this.getTypeMap().initializeTypeFromValue(oDataType, vValue);
				if (this._oTypeInitialization && this.getContentFactory().getUnitOriginalType()) {
					this.getTypeMap().initializeInternalType(this.getContentFactory().getDataType(), this._oTypeInitialization);
					this.getTypeMap().initializeInternalType(this.getContentFactory().getUnitType(), this._oTypeInitialization);
				}
			}
		}

	}

	Field.prototype.fireChangeEvent = function(aConditions, bValid, vWrongValue, oPromise) {

		let vValue;

		if (aConditions) { // even if empty and error is returned, only in async case it is really empty
			if (bValid) {
				vValue = this.getResultForChangePromise(aConditions);
			} else {
				vValue = vWrongValue;
			}
		}

		if (this.getCurrentContent().length > 1) {
			// in unit/currency field update value with change event to prevent update by navigating from number to unit
			if (aConditions) {
				_updateValue.call(this, this.getConditions());
			} else if (oPromise) {
				// update value after Promise resolved
				oPromise = oPromise.then((vResult) => {
					_updateValue.call(this, this.getConditions());
					return vResult;
				});
			}
		}

		this.fireChange({ value: vValue, valid: bValid, promise: oPromise }); // TODO: format value in change event to external format?

	};

	Field.prototype.getResultForChangePromise = function(aConditions) {

		let vValue;
		if (aConditions.length === 0 && this.getContentFactory().getDataType()) {
			// parse "" to get type specific initial value
			vValue = this.getContentFactory().getDataType().parseValue("", "string", []); // we need the empty array when the type is Unit
		} else if (aConditions.length === 1) {
			vValue = aConditions[0].values[0];
		}

		return vValue;

	};

	function _updateValue(aConditions) {

		if (!this.bDelegateInitialized) {
			// wait until delegate is loaded
			this.awaitControlDelegate().then(() => {
				if (!this.isFieldDestroyed()) {
					_updateValue.call(this, aConditions);
				}
			});
			return;
		}

		let vValue = null; // use default of property for empty to avoid updates from null to undefined
		let vAdditionalValue = null; // use default of property for empty to avoid updates from null to undefined
		const vOldValue = this.getValue();
		const vOldAdditionalValue = this.getAdditionalValue();

		if (aConditions.length === 0 && _isEmpty.call(this, vOldValue, vOldAdditionalValue)) {
			// Field initialized from setter -> cannot have a condition -> no update needed
			return;
		}

		vValue = this.getResultForChangePromise(aConditions);
		vValue = _updateEmptyValue.call(this, vValue, vOldValue);
		if (aConditions.length === 0 || aConditions[0].values.length === 1) {
			if (vOldAdditionalValue) {
				const oDataType = this.getContentFactory().getAdditionalDataType();
				if (oDataType) {
					vAdditionalValue = oDataType.parseValue("", "string"); // we need the empty representation of the data type
				}
			} else {
				vAdditionalValue = vOldAdditionalValue; // to not update old initial value
			}
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
		if (!_compareAdditionalValues.call(this, vAdditionalValue, vOldAdditionalValue, true) && !_checkAdditionalValueOneWay.call(this)) {
			// to run not in V4 update issues if data not already loaded
			// do not update property in OneWay mode to keep in sync with model
			this.setProperty("additionalValue", vAdditionalValue, true);
		}

	}

	function _updateEmptyValue(vValue, vOldValue) {

		// if value of composite binding was "initial" before and not lead to a condition in the new value, only the changed parts
		// of the composite value must be updated. (Parsing in Operator and ConditionType sets it to null if no old value is known.)
		const sDataType = this.getContentFactory().getDataType() ? this.getContentFactory().getDataType().getMetadata().getName() : this.getDataType(); // as type must not exist now

		if (this.getTypeMap().getBaseType(sDataType) === BaseType.Unit && Array.isArray(vValue) && Array.isArray(vOldValue) && !this.checkValueInitial(vValue) && this.checkValueInitial(vOldValue)) {
			for (let i = 0; i < vValue.length; i++) {
				if (vValue[i] === null && vOldValue[i] !== undefined) {
					vValue[i] = vOldValue[i]; // take initial value from old value (might be "")
				}
			}
		}

		return vValue;

	}

	Field.prototype.getSupportedOperators = function() {

		return this.getProperty("_operators", []);

	};

	function _checkAdditionalValueOneWay() {

		const oBinding = this.getBinding("additionalValue");

		if (oBinding && oBinding.getBindingMode() === BindingMode.OneWay) {
			return true;
		}

		return false;

	}

	Field.prototype.checkCreateInternalContent = function() {

		if (!this.isFieldDestroyed() && this.getContentFactory().getDataType() && !this.isFieldPropertyInitial("editMode") && !this.isFieldPropertyInitial("multipleLines")) {
			// If DataType is provided via Binding and EditMode is set the internal control can be created
			// TODO: no control needed if just template for cloning
			FieldBase.prototype.checkCreateInternalContent.apply(this, arguments);
		}

	};

	Field.prototype.getOverflowToolbarConfig = function() {
		const oConfig = FieldBase.prototype.getOverflowToolbarConfig.apply(this, arguments);
		oConfig.propsUnrelatedToSize.push("value");
		oConfig.propsUnrelatedToSize.push("additionalValue");
		return oConfig;
	};

	Field.prototype.isSearchField = function() {

		return false; // Field cannot be a searchField (not supported for the moment)

	};

	function _isEmpty(vValue, vAdditionalValue) {

		return this.checkValueInitial(vValue) && !vAdditionalValue;

	}

	Field.prototype.getAdditionalDataTypeConfiguration = function() {

		const oBinding = this.getBinding("additionalValue");
		return oBinding && oBinding.getType();

	};

	/**
	 * Sets a new value for property {@link #getConditions conditions}.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @param {object[]} aConditions Conditions that are set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setConditions
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getConditions conditions}.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @returns {object[]} Conditions of the field
	 * @public
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getConditions
	 * @function
	 */

	/**
	 * Binds property {@link #getConditions conditions} to model data.
	 *
	 * See {@link sap.ui.base.ManagedObject#bindProperty ManagedObject.bindProperty} for a detailed description of the possible properties of oBindingInfo
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @param {sap.ui.base.ManagedObject.PropertyBindingInfo} oBindingInfo The binding information
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#bindConditions
	 * @function
	 */

	/**
	 * Unbinds property {@link #getConditions conditions} from model data.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#unbindConditions
	 * @function
	 */

	/**
	 * Sets a new value for property {@link #getDataType dataType}.
	 *
	 * The type of data handled by the field. The type is used to parse, format, and validate the value.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored.
	 *
	 * @param {string|undefined} sDataType DataType that is set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Not supported, the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setDataType
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getDataType dataType}.
	 *
	 * The type of data handled by the field. The type is used to parse, format, and validate the value.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored.
	 *
	 * @returns {string} Value of property <code>dataType</code>
	 * @public
	 * @deprecated Not supported, the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getDataType
	 * @function
	 */

	/**
	 * Sets a new value for property {@link #getDataTypeConstraints dataTypeConstraints}.
	 *
	 * The constraints of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeConstraints</code> property are ignored.
	 *
	 * @param {object|undefined} oDataTypeConstraints Constraints that are set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Not supported, the <code>Constraints</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setDataTypeConstraints
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getDataTypeConstraints dataTypeConstraints}.
	 *
	 * The constraints of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeConstraints</code> property are ignored.
	 *
	 * @returns {object} Value of property <code>dataTypeConstraints</code>
	 * @public
	 * @deprecated Not supported, the <code>Constraints</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getDataTypeConstraints
	 * @function
	 */

	/**
	 * Sets a new value for property {@link #getDataTypeFormatOptions dataTypeFormatOptions}.
	 *
	 * The format options of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeFormatOptions</code> property are ignored.
	 *
	 * @param {object|undefined} oDataTypeFormatOptions Format options that are set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Not supported, the <code>FormatOptions</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#setDataTypeFormatOptions
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getDataTypeFormatOptions dataTypeFormatOptions}.
	 *
	 * The format options of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeFormatOptions</code> property are ignored.
	 *
	 * @returns {object} Value of property <code>dataTypeFormatOptions</code>
	 * @public
	 * @deprecated Not supported, the <code>FormatOptions</code> of the type in the binding to the <code>value</code> property is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.Field#getDataTypeFormatOptions
	 * @function
	 */

	return Field;

});