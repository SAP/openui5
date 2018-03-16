/*!
 * ${copyright}
 */

// Provides an abstraction for list bindings
sap.ui.define(['./ContextBinding'],
	function(ContextBinding) {
	"use strict";


	/**
	 * Creates a new ClientContextBinding.
	 *
	 * This constructor should only be called by subclasses or model implementations, not by application or control code.
	 * Such code should use {@link sap.ui.model.Model#bindContext Model#bindContext} on the corresponding model implementation instead.
	 *
	 * @param {sap.ui.model.Model} oModel Model instance that this binding is created for and that it belongs to
	 * @param {string} sPath Binding path to be used for this binding, syntax depends on the concrete subclass
	 * @param {sap.ui.model.Context} oContext Binding context relative to which a relative binding path will be resolved
	 * @param {object} [mParameters] Map of optional parameters as defined by subclasses; this class does not introduce any own parameters
	 *
	 * @class
	 * The ContextBinding is a specific binding for setting a context for the model.
	 *
	 * @abstract
	 * @public
	 * @alias sap.ui.model.ClientContextBinding
	 * @extends sap.ui.model.ContextBinding
	 */
	var ClientContextBinding = ContextBinding.extend("sap.ui.model.ClientContextBinding", /** @lends sap.ui.model.ClientContextBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, mParameters, oEvents){
			ContextBinding.call(this, oModel, sPath, oContext, mParameters, oEvents);
			var that = this;
			oModel.createBindingContext(sPath, oContext, mParameters, function(oContext) {
				that.bInitial = false;
				that.oElementContext = oContext;
			});
		}

	});

	/*
	 * @see sap.ui.model.ContextBinding.prototype.refresh
	 */
	ClientContextBinding.prototype.refresh = function(bForceUpdate) {
		var that = this;
		//recreate Context: force update
		this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
			if (that.oElementContext === oContext && !bForceUpdate) {
				that.oModel.checkUpdate(true,oContext);
			} else {
				that.oElementContext = oContext;
				that._fireChange();
			}
		}, true);
	};

	/*
	 * @see sap.ui.model.ContextBinding.prototype.initialize
	 */
	ClientContextBinding.prototype.initialize = function() {
		var that = this;
		//recreate Context: force update
		this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
			that.oElementContext = oContext;
			that._fireChange();
		}, true);
	};

	/*
	 * @see sap.ui.model.ContextBinding.prototype.setContext
	 */
	ClientContextBinding.prototype.setContext = function(oContext) {
		var that = this;
		if (this.oContext != oContext) {
			this.oContext = oContext;
			this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
				that.oElementContext = oContext;
				that._fireChange();
			});
		}
	};

	return ClientContextBinding;

});
