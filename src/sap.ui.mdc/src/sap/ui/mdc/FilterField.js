/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/field/FieldBase',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/base/util/merge',
	'sap/base/util/deepEqual'
], function(
		FieldBase,
		FieldBaseRenderer,
		FieldDisplay,
		merge,
		deepEqual
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FilterField</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>FilterField</code> control is used to filter data based on the conditions. The conditions are managed
	 * in the corresponding {@link sap.ui.mdc.condition.ConditionModel ConditionModel}.
	 * That is why the <code>conditions</code> property must be bound to the related conditions in the {@link sap.ui.mdc.condition.ConditionModel ConditionModel}.
	 * The type of this data must be defined in the <code>dataType</code> property.
	 *
	 * Based on the data type settings, a default control is rendered by the <code>FilterField</code> as follows:
	 *
	 * <ul>
	 * <li>In display mode, usually a {@link sap.m.Text Text} control is rendered.</li>
	 * <li>If <code>multipleLines</code> is set, an {@link sap.m.ExpandableText ExpandableText} control is rendered.</li>
	 * <li>If multiple values are allowed, a {@link sap.m.Tokenizer Tokenizer} control is rendered.</li>
	 * <li>In edit mode, usually an {@link sap.m.Input Input} control is rendered.</li>
	 * <li>If multiple values are allowed, a {@link sap.m.MultiInput MultiInput} control is rendered.</li>
	 * <li>If <code>multipleLines</code> is set, a {@link sap.m.TextArea TextArea} control is rendered.</li>
	 * <li>If a date type or a date/time type is used, a {@link sap.m.DateRangeSelection DateRangeSelection} control is rendered.</li>
	 * <li>If a date type is used and only single values are allowed, a {@link sap.m.DatePicker DatePicker} control is rendered.</li>
	 * <li>If a date type is used and only single ranges are allowed, a {@link sap.m.DateRangeSelection DateRangeSelection} control is rendered.</li>
	 * <li>If a date/time type is used and only single values are allowed, a {@link sap.m.DateTimePicker DateTimePicker} control is rendered.</li>
	 * <li>If a time type is used and only single values are allowed, a {@link sap.m.TimePicker TimePicker} control is rendered.</li>
	 * <li>If used for search, a {@link sap.m.SearchField SearchField} control is rendered.</li>
	 * </ul>
	 *
	 * @extends sap.ui.mdc.field.FieldBase
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent, sap.m.IOverflowToolbarContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.FilterField
	 * @version ${version}
	 * @since 1.48.0
	 *
	 * @public
   	 * @experimental As of version 1.48.0
	 */
	const FilterField = FieldBase.extend("sap.ui.mdc.FilterField", /* @lends sap.ui.mdc.FilterField.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/field/FilterField.designtime",
			properties: {
				/**
				 * Supported operator names for conditions.
				 *
				 * If empty, default operators depending on used data type are taken.
				 *
				 * @since 1.73.0
				 */
				operators: {
					type: "string[]",
					group: "Data",
					defaultValue: []
				},
				/**
				 * Default operator name for conditions.
				 * If empty, the relevant default operator depending on the data type used is taken.
				 *
				 * <b>Note</b>: <code>defaultOperator</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator} or the instance itself.
				 *
				 * @since 1.88.0
				 */
				defaultOperator: {
					type: "string",
					group: "Data",
					defaultValue: null
				},
				/**
				 * Key of the property the <code>FilterField</code> represents.
				 *
				 * @since 1.115.0
				 */
				propertyKey: {
					type: "string",
					group: "Data",
					defaultValue: ""
				},
				/**
				 * The type of data for the description part of an "equal to" condition.
				 * This type is used to parse, format, and validate the value.
				 *
				 * Here a data type instance can be provided or an object containing <code>name</code>, <code>formatOptions</code>, and <code>constraints</code>.
				 *
				 * @since 1.118.0
				 */
				additionalDataType: {
					type: "object",
					group: "Data",
					defaultValue: null
				}
			},
			events: {
				/**
				 * This event is fired when the <code>value</code> property of the field is changed.
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event.
				 */
				change: {
					parameters: {

						/**
						 * The new value of the <code>control</code>
						 */
						value: { type: "string" },

						/**
						 * Flag that indicates if the entered <code>value</code> is valid
						 */
						valid: { type: "boolean" },

						/**
						 * Conditions of the field. This includes all conditions, not only the changed ones.
						 *
						 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
						 * @since 1.61.0
						 */
						conditions: { type: "object[]" },

						/**
						 * Returns a <code>Promise</code> for the change. The <code>Promise</code> returns the value if it is resolved.
						 * If the <code>change</code> event is synchronous, the <code>Promise</code> has already been resolved. If it is asynchronous,
						 * it will be resolved after the value has been updated.
						 *
						 * The <code>FilterField</code> should be set to busy during the parsing to prevent user input.
						 * As there might be a whole group of fields that needs to be busy, this cannot be done automatically.
						 *
						 * @since 1.69.0
						 */
						promise: { type: "boolean" }
					}
				}
			}
		},
		renderer: FieldBaseRenderer
	});

	FilterField.prototype.init = function() {

		FieldBase.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			properties: ["operators", "propertyKey", "additionalDataType"]
		});

	};

	FilterField.prototype.exit = function() {

		FieldBase.prototype.exit.apply(this, arguments);

	};

	// TODO: remove fallback if propertyKey is used by stakeholders
	FilterField.prototype.getPropertyKey = function() {
		let sPropertyKey = this.getProperty("propertyKey");
		if (!sPropertyKey) {
			sPropertyKey = this.getFieldPath();
		}

		return sPropertyKey;
	};

	FilterField.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		if (sPropertyName === "conditions" && this.isInvalidInput() && deepEqual(this.getConditions(), this.validateProperty(sPropertyName, oValue))) {
			// in parse error and same Conditions - no update on property - so remove error here
			// As ConditionModel triggers checkUpdate in forced mode on addCondition, setConditions... also unchanged conditions will be updated
			// So e.g. if a variant is applied an error will be removed.
			if (this._oManagedObjectModel) {
				this._oManagedObjectModel.checkUpdate(true, true); // async. to reduce updates (additionalValue will follow)
			}
			// TODO: prevent unneeded update of tokens?
			this.resetInvalidInput();
		}

		return FieldBase.prototype.setProperty.apply(this, arguments);
	};

	FilterField.prototype.observeChanges = function(oChanges) {

		FieldBase.prototype.observeChanges.apply(this, arguments);

		if (oChanges.name === "operators") { // could lead to change of internal control
			if (oChanges.current.length === 0) {
				FieldBase.prototype.getSupportedOperators.apply(this, []); // set default ones to _operators
			} else {
				this.setProperty("_operators", oChanges.current, true);
			}
			this.updateInternalContent();
		} else if (oChanges.name === "propertyKey") {
			this.updateInternalContent();
		} else if (oChanges.name === "additionalDataType") {
			_setAdditionalDataType.call(this, oChanges.current);
		}

	};

	FilterField.prototype.fireChangeEvent = function(aConditions, bValid, vWrongValue, oPromise) {

		let vValue;

		if (aConditions) { // even if empty and error is returned, only in async case it is really empty
			if (bValid) {
				if (aConditions.length == 1) {
					vValue = aConditions[0].values[0];
				}
			} else {
				vValue = vWrongValue;
			}
		}

		// do not return the original conditions to not change it by accident
		this.fireChange({ value: vValue, valid: bValid, conditions: merge([], aConditions), promise: oPromise });


	};

	FilterField.prototype.getSupportedOperators = function() {

		let aOperators = this.getOperators();

		if (aOperators.length === 0) {
			// use default operators
			aOperators = FieldBase.prototype.getSupportedOperators.apply(this, arguments);
		} else {
			this.setProperty("_operators", aOperators, true);
		}

		return aOperators;

	};

	FilterField.prototype.setOperators = function(aOperators) {
		const aOperatorNames = [];

		if (!Array.isArray(aOperators)) {
			// aOperators can be a comma separated string of operators.
			aOperators = aOperators.split(",");
		}

		aOperators.forEach(function(oOperator) {
			if (typeof oOperator === "string") {
				aOperatorNames.push(oOperator);
			} else {
				aOperatorNames.push(oOperator.name);
			}
		});

		this.setProperty("operators", aOperatorNames);
		return this;
	};


	/**
	 * Adds an operator to the list of known operators.
	 *
 	 * <b>Note</b>: If no operator is set, the used <code>datatType</code> of the <code>FilterField</code> defines the set of default operators.
	 *
	 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 *
	 * @since: 1.88.0
	 * @public
	 */
	FilterField.prototype.addOperator = function(vOperator) {
		const aOperators = this.getSupportedOperators();

		let sOpName = vOperator;
		if (typeof vOperator !== "string") {
			sOpName = vOperator.name;
		}

		if (aOperators.indexOf(sOpName) < 0) {
			aOperators.push(sOpName);
			this.setOperators(aOperators);
		}
		return this;
	};

	/**
	 * Adds an array of operators to the list of known operators.
	 *
	 * <b>Note</b>: <code>aOperators</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator}, the instance itself, or multiple operators inside an array.
	 *
	 * @param {sap.ui.mdc.condition.Operator[]} aOperators Array of operators
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 *
	 * @since: 1.88.0
	 * @public
	 */
	FilterField.prototype.addOperators = function(aOperators) {
		if (!Array.isArray(aOperators)) {
			aOperators = [aOperators];
		}

		aOperators.forEach(function(oOperator) {
			this.addOperator(oOperator);
		}.bind(this));

		return this;
	};

	/**
	 * Removes an operator from the list of known operators.
	 *
	 * @param {sap.ui.mdc.condition.Operator|string} vOperator The operator instance or operator name
	 *
	 * @since: 1.88.0
	 * @public
	 */
	FilterField.prototype.removeOperator = function(vOperator) {
		const aOperators = this.getSupportedOperators();
		let sOpName = vOperator;
		if (typeof vOperator !== "string") {
			sOpName = vOperator.name;
		}

		if (aOperators.indexOf(sOpName) > -1) {
			aOperators.splice(aOperators.indexOf(sOpName), 1);
			this.setOperators(aOperators);
		}
	};

	/**
	 * Removes all given operators from the list of known operators.
	 *
	 * <b>Note</b>: <code>aOperators</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator}, the instance itself, or multiple operators inside an array.
	 *
	 * @param {sap.ui.mdc.condition.Operator[]} aOperators Array of operators
	 *
	 * @since: 1.88.0
	 * @public
	*/
	FilterField.prototype.removeOperators = function(aOperators) {
		if (!Array.isArray(aOperators)) {
			aOperators = [aOperators];
		}

		aOperators.forEach(function(oOperator) {
			this.removeOperator(oOperator);
		}.bind(this));

	};

	/**
	 * Removes all operators from the list of known operators.
	 *
	 * @since: 1.88.0
	 * @public
	*/
	FilterField.prototype.removeAllOperators = function() {
		this.setOperators([]);
	};


	FilterField.prototype.setDefaultOperator = function(oOperator) {
		let sName = oOperator;
		if (oOperator && typeof oOperator !== "string") {
			sName = oOperator.name;
		}

		this.setProperty("defaultOperator", sName);
		return this;
	};

	FilterField.prototype.checkCreateInternalContent = function() {

		if (!this.isFieldDestroyed() && !this.isPropertyInitial("dataType")) {
			// If DataType is set in applySettings we can assume it is final and DataTypeFormatOptions and DataTypeContraints are set too
			// EditMode is not relevant as non editable FilterFields are not a use case in the moment.
			// MultipleLines is also not used for FilterFields in the moment.
			// MaxConditions should also be set on applySettings

			const sId = this._getValueHelp();
			const oValueHelp = sap.ui.getCore().byId(sId);
			const oBindingInfo = this.getBindingInfo("conditions");
			const oBinding = this.getBinding("conditions");
			if (this.getDisplay() !== FieldDisplay.Value && sId && (!oValueHelp || (oBindingInfo && !oBinding))) {
				// ValueHelp might need ConditionModel to determine value of InParameters to get the description.
				// So if ValueHelp not exists right now or binding to ConditionModel not already created, wait.
				return;
			}

			this.getContentFactory().retrieveDataType();
			FieldBase.prototype.checkCreateInternalContent.apply(this, arguments);
		}

	};

	FilterField.prototype.handleModelContextChange = function(oEvent) {

		FieldBase.prototype.handleModelContextChange.apply(this, arguments);

		if (this.getCurrentContent().length === 0) {
			// inner control not created, maybe it can be created bow (maybe ConditionModel assignment changed)
			this.triggerCheckCreateInternalContent();
		}

	};

	FilterField.prototype.isSearchField = function() {

		if (this.isPropertyInitial("propertyKey")) {
			return FieldBase.prototype.isSearchField.apply(this, arguments); // fallback to old logic based on binding path
		} else {
			const sPropertyKey = this.getPropertyKey();
			const regexp = new RegExp("^\\*(.*)\\*|\\$search$");
			return regexp.test(sPropertyKey) && this.getMaxConditions() === 1;
		}

	};

	function _setAdditionalDataType(oType) {

		if (!oType) {
			// type removed
			this.getContentFactory().setAdditionalDataType();
		} else if (oType.isA && oType.isA("sap.ui.model.Type")) {
			// type instance given
			this.getContentFactory().setAdditionalDataType(oType);
		} else if (oType.name) {
			// type instance will to be created if needed in ContentFactory.retrieveAdditionalDataType
			this.getContentFactory().setAdditionalDataType();
		} else {
			throw new Error("invalid type configuration");
		}

	}

	FilterField.prototype.getAdditionalDataTypeConfiguration = function() {

		return this.getAdditionalDataType();

	};

	return FilterField;

});
