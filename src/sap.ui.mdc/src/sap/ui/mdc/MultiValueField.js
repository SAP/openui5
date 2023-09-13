/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/library',
	'sap/ui/mdc/field/FieldBase',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated'
], function(
		library,
		FieldBase,
		FieldBaseRenderer,
		Condition,
		ConditionValidated
	) {
	"use strict";

	/**
	 * Constructor for a new <code>MultiValueField</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>MultiValueField</code> control can hold multiple values. The values are stored as items.
	 * A <code>MultiValueField</code> control can be used to bind its items to data of a certain data type. Based on the data type settings, a default
	 * control is rendered by the <code>MultiValueField</code> control as follows:
	 *
	 * <ul>
	 * <li>In display mode, usually a {@link sap.m.Tokenizer Tokenizer} control is rendered.</li>
	 * <li>If <code>multipleLines</code> is set, an {@link sap.m.ExpandableText ExpandableText} control is rendered.</li>
	 * <li>In edit mode, usually a {@link sap.m.MultiInput MultiInput} control is rendered.</li>
	 * <li>If <code>multipleLines</code> is set, a {@link sap.m.TextArea TextArea} control is rendered.</li>
	 * </ul>
	 *
	 * @extends sap.ui.mdc.field.FieldBase
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent, sap.m.IOverflowToolbarContent
	 *
	 * @constructor
	 * @alias sap.ui.mdc.MultiValueField
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.93.0
	 *
	 * @public
   	 * @experimental As of version 1.93.0
	 */
	const Field = FieldBase.extend("sap.ui.mdc.MultiValueField", /* @lends sap.ui.mdc.MultiValueField.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/field/MultiValueField.designtime",
			properties: {
				/**
				 * Path to the <code>MultiValueFieldDelegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. Once the required module is associated, this property might not be needed any longer.
				 *
				 * @experimental
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/field/MultiValueFieldDelegate",
						payload: {}
					}
				}
			},
			aggregations: {
				/**
				 * Items of the <code>MultiValueField</code> control.
				 */
				items: {
					type: "sap.ui.mdc.field.MultiValueFieldItem",
					multiple: true,
					singularName : "item",
					bindable: "bindable"
				}
			},
			defaultAggregation: "items",
			events: {
				/**
				 * This event is fired when the <code>items</code> aggregation of the field is changed by user interaction.
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event.
				 */
				change: {
					parameters: {

						/**
						 * The new items of the <code>MultiValueField</code> control.
						 *
						 * If a <code>ValueHelp</code> element is assigned to the <code>MultiValueField</code> control, the <code>key</code> of the items is used as key for the <code>ValueHelp</code> items.
						 */
						items: { type: "sap.ui.mdc.field.MultiValueFieldItem[]" },

						/**
						 * Flag that indicates if the entered user input is valid
						 */
						valid: { type: "boolean" },

						/**
						 * Returns a <code>Promise</code> for the change. The <code>Promise</code> returns the items when it is resolved.
						 * If the <code>change</code> event is synchronous, the <code>Promise</code> has already been resolved. If it is asynchronous,
						 * it will be resolved after the items have been updated.
						 *
						 * The <code>MultiValueField</code> control should be set to busy during the parsing to prevent user input.
						 * As there might be a whole group of fields that need to be busy, this cannot be done automatically.
						 */
						promise: { type: "Promise" }
					}
				}
			}
		},
		renderer: FieldBaseRenderer
	});

	Field.prototype.init = function() {

		FieldBase.prototype.init.apply(this, arguments);

		this.setProperty("_operators", ["EQ"], true);

		this._oObserver.observe(this, {
			aggregations: ["items"]
		});

	};

	Field.prototype.exit = function() {

		FieldBase.prototype.exit.apply(this, arguments);

		if (this._iConditionUpdateTimer) {
			clearTimeout(this._iConditionUpdateTimer);
			delete this._iConditionUpdateTimer;
		}

	};

	Field.prototype.bindAggregation = function(sName, oBindingInfo) {

		if (sName === "items" && !oBindingInfo.formatter) { // not if a formatter is used, as this needs to be executed
			// use type from item template key
			_getDataType.call(this, oBindingInfo);
		}

		FieldBase.prototype.bindAggregation.apply(this, arguments);

	};

	function _getDataType(oBindingInfo) {

		// use type from item template key
		if (oBindingInfo.template) {
			let oDataType;
			if (oBindingInfo.template.mBindingInfos.key) {
				const oKeyBindingInfo = oBindingInfo.template.mBindingInfos.key;
				oDataType = this.getContentFactory().getDataType();
				if (oKeyBindingInfo.type && (!oDataType || oDataType.getMetadata().getName() !== oKeyBindingInfo.type.getMetadata().getName())) {
					this._oContentFactory.setDataType(oKeyBindingInfo.type);
					this.invalidate(); // as new inner control might be needed
				}
			}
			if (oBindingInfo.template.mBindingInfos.description) {
				const oDescriptionBindingInfo = oBindingInfo.template.mBindingInfos.description;
				oDataType = this.getContentFactory().getAdditionalDataType();
				if (oDescriptionBindingInfo.type && (!oDataType || oDataType.getMetadata().getName() !== oDescriptionBindingInfo.type.getMetadata().getName())) {
					this._oContentFactory.setAdditionalDataType(oDescriptionBindingInfo.type);
					this.invalidate(); // as new inner control might be needed
				}
			}
		}

	}

	Field.prototype.handleModelContextChange = function(oEvent) {

		FieldBase.prototype.handleModelContextChange.apply(this, arguments);

		if (!this._oDataType) {
			const oBindingInfo = this.getBinding("items");
			if (oBindingInfo) {
				_getDataType.call(this, oBindingInfo);
			}
		}

	};


	Field.prototype.initDataType = function() {

		FieldBase.prototype.initDataType.apply(this, arguments);

		const oBindingInfo = this.getBindingInfo("items");
		if (oBindingInfo) {
			_getDataType.call(this, oBindingInfo);
		}

	};

	/**
	 * This property must not be set for the <code>MultiValueField</code> control.
	 *
	 * @param {int} iMaxConditions More than 1 condition must be allowed in <code>MultiValueField</code>
	 * @returns {sap.ui.mdc.MultiValueField} <code>this</code> to allow method chaining.
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, this property is not supported for the <code>MultiValueField</code> control.
	 * @ui5-not-supported
	 */
	Field.prototype.setMaxConditions = function(iMaxConditions) {

		if (iMaxConditions === 1) {
			throw new Error("Multiple Conditions needed on MultiValueField " + this);
		}

		return this.setProperty("maxConditions", iMaxConditions, true);

	};

	Field.prototype.observeChanges = function(oChanges) {

		FieldBase.prototype.observeChanges.apply(this, arguments);

		if (oChanges.name === "items") {
			_itemsChanged.call(this, oChanges.child, oChanges.mutation);
		}

		if (oChanges.name === "key") {
			_triggerConditionUpdate.call(this);
		}

		if (oChanges.name === "description") {
			_triggerConditionUpdate.call(this);
		}

		if (oChanges.name === "conditions") {
			_updateItems.call(this, oChanges.current);
		}

	};

	function _itemsChanged(oItem, sMutation) {

		if (sMutation === "insert") {
			// observe items for update of key and text
			this._oObserver.observe(oItem, {properties: true});
		} else {
			this._oObserver.unobserve(oItem);
		}

		if (!this._bMyItemUpdate) {
			_triggerConditionUpdate.call(this);
		}

	}

	function _updateItems(aConditions) {
		// as via ListBinding no data can be added or be removed the data needs to be updated on the model

		if (this._bConditionsUpdateFromItems) {
			return;
		}

		if (!this.bDelegateInitialized) {
			// wait until delegate is loaded
			this.awaitControlDelegate().then(function() {
				if (!this.bIsDestroyed) {
					_updateItems.call(this.getConditions());
				}
			}.bind(this));
			return;
		}

		this.getControlDelegate().updateItems(this.getPayload(), aConditions, this);

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

		if (!this._iConditionUpdateTimer) {
			// call async. to update all items at the same time
			this._iConditionUpdateTimer = setTimeout(function() {
				_updateCondition.call(this);
				this._iConditionUpdateTimer = undefined;
			}.bind(this), 0);
		}

	}

	function _updateCondition() {

		const aItems = this.getItems();
		const aConditions = [];

		for (let i = 0; i < aItems.length; i++) {
			const oItem = aItems[i];
			const oCondition = Condition.createItemCondition(_getInternalValue(oItem, "key"), _getInternalValue(oItem, "description"));
			oCondition.validated = ConditionValidated.Validated; // see every value set from outside as validated (to determine description, if needed)
			aConditions.push(oCondition);
		}
		// TODO: update conditions only if really changed
		this._bConditionsUpdateFromItems = true;
		this.setConditions(aConditions);
		this._bConditionsUpdateFromItems = false;

	}

	function _getInternalValue(oItem, sProperty) {

		// as keyor description could have internally another type - use initial value of binding
		// TODO: better logic?
		const oBinding = oItem.getBinding(sProperty);
		if (oBinding) {
			return oBinding.getInternalValue();
		} else {
			return oItem.getProperty(sProperty);
		}

	}

	Field.prototype.fireChangeEvent = function(aConditions, bValid, vWrongValue, oPromise) {

		this.fireChange({ items: this.getItems(), valid: bValid, promise: oPromise });

	};

	Field.prototype.getResultForChangePromise = function(aConditions) {

		return this.getItems();

	};

	Field.prototype.getSupportedOperators = function() {

		return this.getProperty("_operators", []);

	};

	Field.prototype.checkCreateInternalContent = function() {

		if (!this.bIsDestroyed && this._oContentFactory.getDataType() && !this.isFieldPropertyInitial("editMode")) {
			// If DataType is provided via Binding and EditMode is set the internal control can be created
			// TODO: no control needed if just template for cloning
			FieldBase.prototype.checkCreateInternalContent.apply(this, arguments);
		}

	};

	Field.prototype.isSearchField = function() {

		return false; // MultiValueField cannot be a searchField (as this only supports single-value)

	};

	/**
	 * Sets conditions to the property <code>conditions</code>.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>items</code> aggregation instead.
	 *
	 * @param {object[]} aConditions Conditions to be set
	 * @returns {sap.ui.mdc.MultiValueField} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, use the <code>items</code> aggregation to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setConditions
	 * @function
	 */

	/**
	 * Gets conditions of the property <code>conditions</code>.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>items</code> aggregation instead.
	 *
	 * @returns {object[]} conditions of the field
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, use the <code>items</code> aggregation to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#getConditions
	 * @function
	 */

	/**
	 * Binds property <code>conditions</code> to model data.
	 *
	 * See {@link sap.ui.base.ManagedObject#bindProperty ManagedObject.bindProperty} for a detailed description of the possible properties of oBindingInfo
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @param {sap.ui.base.ManagedObject.PropertyBindingInfo} oBindingInfo The binding information
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#bindConditions
	 * @function
	 */

	/**
	 * Unbinds property <code>conditions</code> from model data.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>value</code> and <code>additionalValue</code> properties instead.
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, use the <code>value</code> property and <code>additionalValue</code> property to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#unbindConditions
	 * @function
	 */

	/**
	 * The type of data handled by the field. The type is used to parse, format, and validate the value.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored.
	 *
	 * @param {string} sDataType DataType to be set
	 * @returns {sap.ui.mdc.MultiValueField} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, the type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setDataType
	 * @function
	 */

	/**
	 * The constraints of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeConstraints</code> property are ignored.
	 *
	 * @param {string} oDataTypeConstraints Constraints to be set
	 * @returns {sap.ui.mdc.MultiValueField} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, the type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setDataTypeConstraints
	 * @function
	 */

	/**
	 * The format options of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeFormatOptions</code> property are ignored.
	 *
	 * @param {string} oDataTypeFormatOptions Format options to be set
	 * @returns {sap.ui.mdc.MultiValueField} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated Not supported, the type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setDataTypeFormatOptions
	 * @function
	 */

	/**
	 * Sets a new value for property <code>multipleLines</code>.
	 *
	 * @param {boolean} [bMultipleLines=false] New value for property <code>multipleLines</code>
	 * @returns {sap.ui.mdc.MultiValueField} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated This property is not supported for multi-value fields.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setMultipleLines
	 * @function
	 */

	 return Field;

});
