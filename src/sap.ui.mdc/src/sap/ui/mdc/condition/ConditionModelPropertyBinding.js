/*!
 * ${copyright}
 */

// Provides the condition model implementation of a property binding
sap.ui.define([
		'sap/ui/model/ChangeReason',
		'sap/ui/model/json/JSONPropertyBinding',
		'sap/base/util/merge',
		'sap/base/util/deepEqual',
		'sap/ui/core/date/UI5Date'
	],
	(
		ChangeReason,
		JSONPropertyBinding,
		merge,
		deepEqual,
		UI5Date
	) => {
		"use strict";


		/**
		 * Creates a new <code>ConditionModelPropertyBinding</code>.
		 *
		 * This constructor must only be called by subclasses or model implementations, not by application or control code.
		 * Such code should use {@link sap.ui.mdc.condition.ConditionModel#bindProperty ConditionModel.bindProperty} on the corresponding model instance instead.
		 *
		 * @param {sap.ui.mdc.condition.ConditionModel} oModel Model instance that this binding is created for and that it belongs to
		 * @param {string} sPath Binding path to be used for this binding
		 * @param {sap.ui.model.Context} oContext Binding context relative to which a relative binding path will be resolved
		 * @param {object} [mParameters] Map of optional parameters as defined by subclasses; this class does not have any parameters of its own
		 *
		 * @class
		 * Property binding implementation for Conditions.
		 *
		 * @alias sap.ui.mdc.condition.ConditionModelPropertyBinding
		 * @extends sap.ui.model.json.JSONPropertyBinding
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.60.0
		 */
		const ConditionModelPropertyBinding = JSONPropertyBinding.extend("sap.ui.mdc.condition.ConditionModelPropertyBinding", {

			constructor: function(oModel, sPath, oContext, mParameters) {
				JSONPropertyBinding.apply(this, arguments);
				this.oValue = _copyValue.call(this, this._getValue());
			}

		});

		ConditionModelPropertyBinding.prototype.getValue = function() {
			return _copyValue.call(this, this.oValue);
		};

		ConditionModelPropertyBinding.prototype.setValue = function(oValue) {
			if (this.bSuspended) {
				return;
			}
			if (!deepEqual(this.oValue, oValue)) {
				if (this.oModel.setProperty(this.sPath, oValue, this.oContext, true)) {
					this.oValue = _copyValue.call(this, oValue);
					this.getDataState().setValue(this.oValue);
					this.oModel.firePropertyChange({ reason: ChangeReason.Binding, path: this._sOriginapPath, context: this.oContext, value: oValue });
				}
			}
		};

		ConditionModelPropertyBinding.prototype.checkUpdate = function(bForceupdate) {
			if (this.bSuspended && !bForceupdate) {
				return;
			}

			const oValue = this._getValue();
			if (!deepEqual(oValue, this.oValue) || bForceupdate) { // optimize for not firing the events when unneeded
				this.oValue = _copyValue.call(this, oValue);
				this.getDataState().setValue(this.oValue);
				this.checkDataState();
				this._fireChange({ reason: ChangeReason.Change });
			}
		};

		function _copyValue(oValue) {

			let oCopy;
			if (!oValue) {
				oCopy = oValue; // as null is an object
			} else if (Array.isArray(oValue)) {
				oCopy = merge([], oValue);
			} else if (oValue instanceof Date) {
				oCopy = UI5Date.getInstance(oValue);
			} else if (typeof oValue === "object") {
				oCopy = merge({}, oValue);
			} else {
				oCopy = oValue;
			}

			return oCopy;

		}

		return ConditionModelPropertyBinding;

	});