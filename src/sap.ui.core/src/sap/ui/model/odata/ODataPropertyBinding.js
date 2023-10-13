/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides class sap.ui.model.odata.ODataPropertyBinding
sap.ui.define([
	'./ODataMetaModel',
	'sap/ui/model/Context',
	'sap/ui/model/ChangeReason',
	'sap/ui/model/PropertyBinding',
	"sap/base/util/deepEqual",
	'sap/ui/model/ChangeReason'
],
	function(ODataMetaModel, Context, ChangeReason, PropertyBinding, deepEqual) {
	"use strict";


	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v2.ODataModel#bindProperty} instead!
	 * @class
	 * Property binding implementation for OData format
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
			this.vOriginalValue = undefined;
			this.getDataState().setValue(this.oValue);
			this.setIgnoreMessages(mParameters && mParameters.ignoreMessages);
			this.bUseUndefinedIfUnresolved = mParameters && mParameters.useUndefinedIfUnresolved;
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
		return this.oModel._getObject(this.sPath, this.oContext, /*bOriginalValue*/undefined,
			this.bUseUndefinedIfUnresolved);
	};

	/*
	 * @see sap.ui.model.PropertyBinding.prototype.setValue
	 */
	ODataPropertyBinding.prototype.setValue = function(oValue){
		if (this.bSuspended) {
			return;
		}

		if (!deepEqual(oValue, this.oValue) && this.oModel.setProperty(this.sPath, oValue, this.oContext, true)) {
			this.oValue = oValue;

			var oDataState = this.getDataState();
			oDataState.setValue(this.oValue);
			this.oModel.firePropertyChange({reason: ChangeReason.Binding, path: this.sPath, context: this.oContext, value: oValue});
		}
	};


	/**
	 * Setter for context.
	 *
	 * @param {sap.ui.model.Context} oContext The context
	 */
	ODataPropertyBinding.prototype.setContext = function(oContext) {
		var bForceUpdate,
			oOldContext = this.oContext;

		if (oContext && oContext.isPreliminary && oContext.isPreliminary()) {
			return;
		}

		if (Context.hasChanged(this.oContext, oContext)) {
			this.oContext = oContext;
			if (this.isRelative()) {
				bForceUpdate = !!(oOldContext !== oContext && this.getDataState().getMessages().length);
				this.checkUpdate(bForceUpdate);
			}
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} [bForceUpdate=false]
	 *   Whether an update should be forced regardless of the bindings state
	 */
	ODataPropertyBinding.prototype.checkUpdate = function(bForceUpdate){
		var sCodeListTerm,
			that = this;

		if (this.bSuspended && !bForceUpdate) {
			return;
		}

		sCodeListTerm = ODataMetaModel.getCodeListTerm(this.sPath);
		if (sCodeListTerm) {
			if (this.bInitial) {
				this.oModel.getMetaModel().fetchCodeList(sCodeListTerm).then(function (mCodeList) {
					that.oValue = mCodeList;
					that._fireChange({reason: ChangeReason.Change});
				}, function () {
					// if the code list promise rejects the binding's value remains undefined; we
					// rely on error logging in ODataMetaModel#fetchCodeList
				});
			}
			return;
		}

		var oDataState = this.getDataState();
		var bChanged = false;

		var vOriginalValue = this.oModel.getOriginalProperty(this.sPath, this.oContext);
		if (bForceUpdate || !deepEqual(vOriginalValue, this.vOriginalValue)) {
			this.vOriginalValue = vOriginalValue;

			oDataState.setOriginalValue(vOriginalValue);
			bChanged = true;
		}

		var oValue = this._getValue();
		if (bForceUpdate || !deepEqual(oValue, this.oValue)) {
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
		var sCanonicalPath = this.oModel.resolve(this.sPath, this.oContext, true)
			|| this.getResolvedPath();

		this.getDataState().setLaundering(!!mPaths && !!(sCanonicalPath in mPaths));
		PropertyBinding.prototype._checkDataState.call(this, sCanonicalPath, mPaths);
	};

	/**
	 * Returns <code>true</code>, as this binding supports the feature of not propagating model
	 * messages to the control.
	 *
	 * @returns {boolean} <code>true</code>
	 *
	 * @public
	 * @see sap.ui.model.Binding#getIgnoreMessages
	 * @see sap.ui.model.Binding#setIgnoreMessages
	 * @since 1.82.0
	 */
	// @override sap.ui.model.Binding#supportsIgnoreMessages
	ODataPropertyBinding.prototype.supportsIgnoreMessages = function () {
		return true;
	};

	return ODataPropertyBinding;

});