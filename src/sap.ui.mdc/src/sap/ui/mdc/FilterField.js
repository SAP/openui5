/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/field/FieldBase',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/base/util/merge'
], function(
		FieldBase,
		FieldBaseRenderer,
		merge
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FilterField</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>FilterField</code> control is used to filter data based on the conditions. The conditions are managed
	 * in the corresponding <code>ConditionModel</code>. That is why the <code>conditions</code> property must be bound to the
	 * related conditions in the <code>ConditionModel</code>. The type of this data must be defined in the <code>dataType</code>
	 * property.
	 *
	 * @extends sap.ui.mdc.field.FieldBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.FilterField
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.48.0
	 *
	 * @private
	 * @experimental
	 */
	var FilterField = FieldBase.extend("sap.ui.mdc.FilterField", /* @lends sap.ui.mdc.FilterField.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Supported operator names for conditions.
				 *
				 * If empty, default operators depending on used data type are used.
				 *
				 * @since 1.73.0
				 */
				operators: {
					type: "string[]",
					group: "Data",
					defaultValue: []
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
						 * @since 1.61.0
						 */
						conditions: { type: "object[]" },

						/**
						 * Returns a <code>Promise</code> for the change. The <code>Promise</code> returns the value if it is resolved.
						 * If the <code>change</code> event is synchronous, the promise has already been already resolved. If it is asynchronous,
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

	};

	FilterField.prototype.exit = function() {

		FieldBase.prototype.exit.apply(this, arguments);

	};

	FilterField.prototype._fireChange = function(aConditions, bValid, vWrongValue, oPromise) {

		var vValue;

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

	FilterField.prototype._getOperators = function() {

		var aOperators = this.getOperators();

		if (aOperators.length === 0) {
			// use default operators
			aOperators = FieldBase.prototype._getOperators.apply(this, arguments);
		}

		return aOperators;

	};

	return FilterField;

});
