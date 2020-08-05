/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a property binding
sap.ui.define(['./PropertyBinding'],
	function(PropertyBinding) {
	"use strict";


	/**
	 * Creates a new ClientPropertyBinding.
	 *
	 * This constructor should only be called by subclasses or model implementations, not by application or control code.
	 * Such code should use {@link sap.ui.model.Model#bindProperty Model#bindProperty} on the corresponding model implementation instead.
	 *
	 * @param {sap.ui.model.Model} oModel Model instance that this binding is created for and that it belongs to
	 * @param {string} sPath Binding path to be used for this binding, syntax depends on the concrete subclass
	 * @param {sap.ui.model.Context} oContext Binding context relative to which a relative binding path will be resolved
	 * @param {object} [mParameters] Map of optional parameters as defined by subclasses; this class does not introduce any own parameters
	 *
	 * @class
	 * Property binding implementation for client models.
	 *
	 * @alias sap.ui.model.ClientPropertyBinding
	 * @extends sap.ui.model.PropertyBinding
	 * @protected
	 */
	var ClientPropertyBinding = PropertyBinding.extend("sap.ui.model.ClientPropertyBinding", /** @lends sap.ui.model.ClientPropertyBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, mParameters){
			PropertyBinding.apply(this, arguments);
			this.oValue = this._getValue();
		}

	});

	/*
	 * @see sap.ui.model.PropertyBinding.prototype.getValue
	 */
	ClientPropertyBinding.prototype.getValue = function(){
		return this.oValue;
	};


	/**
	 * Returns the current value of the bound target (incl. re-evaluation)
	 * @return {object} the current value of the bound target
	 */
	ClientPropertyBinding.prototype._getValue = function(){
		var sProperty = this.sPath.substr(this.sPath.lastIndexOf("/") + 1);
		if (this.oContext && sProperty == "__name__") {
			var aPath = this.oContext.getPath().split("/");
			return aPath[aPath.length - 1];
		}
		return this.oModel.getProperty(this.sPath, this.oContext); // ensure to survive also not set model object
	};

	/**
	 * Setter for context
	 */
	ClientPropertyBinding.prototype.setContext = function(oContext) {
		if (this.oContext != oContext) {
			sap.ui.getCore().getMessageManager().removeMessages(this.getDataState().getControlMessages(), true);
			this.oContext = oContext;
			if (this.isRelative()) {
				this.checkUpdate();
			}
		}
	};

	return ClientPropertyBinding;

});
