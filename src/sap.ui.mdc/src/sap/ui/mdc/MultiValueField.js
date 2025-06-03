/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/library',
	'sap/ui/mdc/field/FieldBase',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/OperatorName'
], (
	library,
	FieldBase,
	FieldBaseRenderer,
	Condition,
	ConditionValidated,
	OperatorName
) => {
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
	 */
	const Field = FieldBase.extend("sap.ui.mdc.MultiValueField", /* @lends sap.ui.mdc.MultiValueField.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/field/MultiValueField.designtime",
			properties: {
				/**
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * The object has the following properties:
				 * <ul>
				 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module. The used delegate module must inherit from {@link module:sap/ui/mdc/field/MultiValueFieldDelegate MultiValueFieldDelegate}.</li>
				 * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
				 * </ul>
				 * <i>Sample delegate object:</i>
				 * <pre><code>{
				 * 	name: "sap/ui/mdc/field/MultiValueFieldDelegate",
				 * 	payload: {}
				 * }</code></pre>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
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
				 *
				 * The items are not updated by user input or value help selection automatically. That's because an aggregation binding can only be updated by the model,
				 * not by the bound aggregation. Therefore, the {@link module:sap/ui/mdc/field/MultiValueFieldDelegate.updateItems MultiValueFieldDelegate.updateItems} function needs to be implemented
				 * to update the items after a user interaction.
				 */
				items: {
					type: "sap.ui.mdc.field.MultiValueFieldItem",
					multiple: true,
					singularName: "item",
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

		this.setProperty("_operators", [OperatorName.EQ], true);

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
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code> control.
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
			this._oObserver.observe(oItem, { properties: true });
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
			this.awaitControlDelegate().then(() => {
				if (!this.bIsDestroyed) {
					_updateItems.call(this.getConditions());
				}
			});
			return;
		}

		this.getControlDelegate().updateItems(this.getPayload(), aConditions, this);

	}

	function _triggerConditionUpdate() {

		if (!this.bDelegateInitialized) {
			// wait until delegate is loaded
			this.awaitControlDelegate().then(() => {
				if (!this.bIsDestroyed) {
					_triggerConditionUpdate.call(this);
				}
			});
			return;
		}

		if (!this._iConditionUpdateTimer) {
			// call async. to update all items at the same time
			this._iConditionUpdateTimer = setTimeout(() => {
				_updateCondition.call(this);
				this._iConditionUpdateTimer = undefined;
			}, 0);
		}

	}

	function _updateCondition() {
		const aItems = this.getItems();
		const aConditions = [];
		const aCurrentConditions = this.getConditions();
		const oDelegate = this.getControlDelegate();
		let iIndex = 0;
		let bChanged = aItems.length !== aCurrentConditions.length;

		for (const oItem of aItems) {
			const oCurrentCondition = aCurrentConditions[iIndex];
			const vKey = _getInternalValue(oItem, "key");
			const vDescription = _getInternalValue(oItem, "description");
			let oCondition;
			if (vKey === undefined && vDescription === undefined) {
				// item exist but binding for key and description pending or has no values right now -> just create dummy condition for index.
				oCondition = Condition.createCondition(OperatorName.EQ, [vKey, vDescription], undefined, undefined, ConditionValidated.NotValidated, undefined);
			} else {
				oCondition = oDelegate.createCondition(this, this, [vKey, vDescription], oCurrentCondition);
			}
			aConditions.push(oCondition);
			if (!oCurrentCondition || !Condition.compareConditions(oCurrentCondition, oCondition)) { // We do a full comparison here as FilterOperatorUtils.compareConditions may ignore text changes
				bChanged = true;
			}
			iIndex++;
		}

		if (bChanged) {
			this._bConditionsUpdateFromItems = true;
			this.setConditions(aConditions);
			this._bConditionsUpdateFromItems = false;
		}
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

	Field.prototype.getBindingEventParameter = function (oEvent) {
		return null; // fire event on inner control until messaging on aggregations has been clarified
	};

	/**
	 * Sets a new value for property {@link #getConditions conditions}.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>items</code> aggregation instead.
	 *
	 * @param {object[]} aConditions Conditions to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.54, this property is not supported for the <code>MultiValueField</code>. Use the <code>items</code> aggregation to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setConditions
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getConditions conditions}.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>items</code> aggregation instead.
	 *
	 * @returns {object[]} conditions of the field
	 * @public
	 * @deprecated As of version 1.54, this property is not supported for the <code>MultiValueField</code>. Use the <code>items</code> aggregation to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#getConditions
	 * @function
	 */

	/**
	 * Binds property {@link #getConditions conditions} to model data.
	 *
	 * See {@link sap.ui.base.ManagedObject#bindProperty ManagedObject.bindProperty} for a detailed description of the possible properties of oBindingInfo
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>items</code> aggregation instead.
	 *
	 * @param {sap.ui.base.ManagedObject.PropertyBindingInfo} oBindingInfo The binding information
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. Use the <code>items</code> aggregation to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#bindConditions
	 * @function
	 */

	/**
	 * Unbinds property {@link #getConditions conditions} from model data.
	 *
	 * Do not use the <code>conditions</code> property,
	 * use the <code>items</code> aggregation instead.
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. Use the <code>items</code> aggregation to bind the control.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#unbindConditions
	 * @function
	 */

	/**
	 * Sets a new value for property {@link #getDataType dataType}.

	* The type of data handled by the field. The type is used to parse, format, and validate the value.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored.
	 *
	 * @param {string|undefined} sDataType DataType to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. The type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setDataType
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getDataType dataType}.
	 *
	 * The type of data handled by the field. The type is used to parse, format, and validate the value.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored.
	 *
	 * @returns {string} Value of property <code>dataType</code>
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. The type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#getDataType
	 * @function
	 */

	/**
	 * Sets a new value for property {@link #getDataTypeConstraints dataTypeConstraints}.
	 *
	 * The constraints of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeConstraints</code> property are ignored.
	 *
	 * @param {object|undefined} oDataTypeConstraints Constraints to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. The type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setDataTypeConstraints
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getDataTypeConstraints dataTypeConstraints}.
	 *
	 * The constraints of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeConstraints</code> property are ignored.
	 *
	 * @returns {object} Value of property <code>dataTypeConstraints</code>
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. The type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#getDataTypeConstraints
	 * @function
	 */

	/**
	 * Sets a new value for property {@link #getDataTypeFormatOptions dataTypeFormatOptions}.
	 *
	 * The format options of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeFormatOptions</code> property are ignored.
	 *
	 * @param {object|undefined} oDataTypeFormatOptions Format options to be set
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. The type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setDataTypeFormatOptions
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getDataTypeFormatOptions dataTypeFormatOptions}.
	 *
	 * The format options of the type specified in <code>dataType</code>.
	 *
	 * <b>Note:</b> If the <code>items</code> aggregation is bound to a model using a type, this type is used.
	 * In this case the values of the <code>dataType</code> property and the <code>dataTypeFormatOptions</code> property are ignored.
	 *
	 * @returns {object} Value of property <code>dataTypeFormatOptions</code>
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>. The type in the binding to the <code>items</code> aggregation is used.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#getDataTypeFormatOptions
	 * @function
	 */

	/**
	 * Sets a new value for property {@link #getMultipleLines multipleLines}.
	 *
	 * @param {boolean} [bMultipleLines=false] New value for property <code>multipleLines</code>
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#setMultipleLines
	 * @function
	 */

	/**
	 * Gets current value of property {@link #getMultipleLines multipleLines}.
	 *
	 * @returns {boolean} Value for property <code>multipleLines</code>
	 * @public
	 * @deprecated As of version 1.93, this property is not supported for the <code>MultiValueField</code>.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.MultiValueField#getMultipleLines
	 * @function
	 */

	return Field;

});