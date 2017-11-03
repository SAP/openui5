/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataPropertyBinding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/Context', 'sap/ui/model/ChangeReason', 'sap/ui/model/PropertyBinding', 'sap/ui/model/ChangeReason'],
	function(jQuery, Context, ChangeReason, PropertyBinding) {
	"use strict";


	/**
	 *
	 * @class
	 * Property binding implementation for oData format
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {object} [mParameters]
	 *
	 * @public
	 * @alias sap.ui.model.odata.ODataPropertyBinding
	 * @extends sap.ui.model.PropertyBinding
	 */
	var ODataPropertyBinding = PropertyBinding.extend("sap.ui.model.odata.ODataPropertyBinding", /** @lends sap.ui.model.odata.ODataPropertyBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, mParameters){
			PropertyBinding.apply(this, arguments);
			this.bInitial = true;
			this.oValue = this._getValue();
			this.vOriginalValue;
			this.getDataState().setValue(this.oValue);
		}

	});

	/**
	 * Initialize the binding. The message should be called when creating a binding.
	 * If metadata is not yet available, do nothing, method will be called again when
	 * metadata is loaded.
	 *
	 * @protected
	 */
	ODataPropertyBinding.prototype.initialize = function() {
		if (this.oModel.oMetadata.isLoaded() && this.bInitial) {
			this.checkUpdate(true);
			this.bInitial = false;
		}
	};

	/**
	 * Returns the current value of the bound target
	 * @return {object} the current value of the bound target
	 * @protected
	 */
	ODataPropertyBinding.prototype.getValue = function(){
		return this.oValue;
	};

	/**
	 * Returns the current value of the bound target (incl. re-evaluation)
	 * @return {object} the current value of the bound target
	 */
	ODataPropertyBinding.prototype._getValue = function(){
		return this.oModel._getObject(this.sPath, this.oContext);
	};

	/**
	 * @see sap.ui.model.PropertyBinding.prototype.setValue
	 */
	ODataPropertyBinding.prototype.setValue = function(oValue){
		if (this.bSuspended) {
			return;
		}

		if (!jQuery.sap.equal(oValue, this.oValue) && this.oModel.setProperty(this.sPath, oValue, this.oContext, true)) {
			this.oValue = oValue;

			var oDataState = this.getDataState();
			oDataState.setValue(this.oValue);
			this.oModel.firePropertyChange({reason: ChangeReason.Binding, path: this.sPath, context: this.oContext, value: oValue});
		}
	};


	/**
	 * Setter for context
	 */
	ODataPropertyBinding.prototype.setContext = function(oContext) {
		if (oContext && oContext.isPreliminary()) {
			return;
		}

		if (Context.hasChanged(this.oContext, oContext)) {
			sap.ui.getCore().getMessageManager().removeMessages(this.getDataState().getControlMessages(), true);
			this.oContext = oContext;
			if (this.isRelative()) {
				this.checkUpdate();
			}
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} force no cache true/false: Default = false
	 *
	 */
	ODataPropertyBinding.prototype.checkUpdate = function(bForceUpdate){
		if (this.bSuspended && !bForceUpdate) {
			return;
		}

		var oDataState = this.getDataState();
		var bChanged = false;

		var vOriginalValue = this.oModel.getOriginalProperty(this.sPath, this.oContext);
		if (bForceUpdate || !jQuery.sap.equal(vOriginalValue, this.vOriginalValue)) {
			this.vOriginalValue = vOriginalValue;

			oDataState.setOriginalValue(vOriginalValue);
			bChanged = true;
		}

		var oValue = this._getValue();
		if (bForceUpdate || !jQuery.sap.equal(oValue, this.oValue)) {
			this.oValue = oValue;

			oDataState.setValue(this.oValue);
			this._fireChange({reason: ChangeReason.Change});
			bChanged = true;
		}
		if (bChanged) {
			this.checkDataState();
		}
	};

	/**
	 * Checks whether an update of the data state of this binding is required.
	 *
	 * @param {map} mPaths A Map of paths to check if update needed
	 * @private
	 */
	ODataPropertyBinding.prototype.checkDataState = function(mPaths) {
		var sCanonicalPath = this.oModel.resolve(this.sPath, this.oContext, true);

		if (!mPaths || sCanonicalPath && sCanonicalPath in mPaths) {
			var oDataState = this.getDataState();
			oDataState.setLaundering(!!mPaths && !!(sCanonicalPath in mPaths));
			PropertyBinding.prototype.checkDataState.apply(this, arguments);
			oDataState.setModelMessages(this.oModel.getMessagesByPath(sCanonicalPath));
		}
	};

	return ODataPropertyBinding;

});
