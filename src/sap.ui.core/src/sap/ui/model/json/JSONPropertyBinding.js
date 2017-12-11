/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a property binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ChangeReason', 'sap/ui/model/ClientPropertyBinding', 'sap/ui/model/ChangeReason'],
	function(jQuery, ChangeReason, ClientPropertyBinding) {
	"use strict";


	/**
	 * Creates a new JSONListBinding.
	 *
	 * This constructor should only be called by subclasses or model implementations, not by application or control code.
	 * Such code should use {@link sap.ui.model.json.JSONModel#bindProperty JSONModel#bindProperty} on the corresponding model instance instead.
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel Model instance that this binding is created for and that it belongs to
	 * @param {string} sPath Binding path to be used for this binding
	 * @param {sap.ui.model.Context} oContext Binding context relative to which a relative binding path will be resolved
	 * @param {object} [mParameters] Map of optional parameters as defined by subclasses; this class does not introduce any own parameters
	 *
	 * @class
	 * Property binding implementation for JSON format.
	 *
	 * @alias sap.ui.model.json.JSONPropertyBinding
	 * @extends sap.ui.model.ClientPropertyBinding
	 * @protected
	 */
	var JSONPropertyBinding = ClientPropertyBinding.extend("sap.ui.model.json.JSONPropertyBinding");

	/**
	 * @see sap.ui.model.PropertyBinding.prototype.setValue
	 */
	JSONPropertyBinding.prototype.setValue = function(oValue){
		if (this.bSuspended) {
			return;
		}
		if (!jQuery.sap.equal(this.oValue, oValue)) {
			if (this.oModel.setProperty(this.sPath, oValue, this.oContext, true)) {
				this.oValue = oValue;
				this.getDataState().setValue(this.oValue);
				this.oModel.firePropertyChange({reason: ChangeReason.Binding, path: this.sPath, context: this.oContext, value: oValue});
			}
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceupdate
	 *
	 */
	JSONPropertyBinding.prototype.checkUpdate = function(bForceupdate){
		if (this.bSuspended && !bForceupdate) {
			return;
		}

		var oValue = this._getValue();
		if (!jQuery.sap.equal(oValue, this.oValue) || bForceupdate) {// optimize for not firing the events when unneeded
			this.oValue = oValue;
			this.getDataState().setValue(this.oValue);
			this.checkDataState();
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	return JSONPropertyBinding;

});
