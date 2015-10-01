/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"jquery.sap.global", "sap/ui/model/ChangeReason", "sap/ui/model/PropertyBinding"
], function (jQuery, ChangeReason, PropertyBinding) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding";

	/**
	 * Throws an error for a not yet implemented method with the given name called by the SAPUI5
	 * framework. The error message includes the arguments to the method call.
	 * @param {string} sMethodName - the method name
	 * @param {object} args - the arguments passed to this method when called by SAPUI5
	 */
	function notImplemented(sMethodName, args) {
		var sArgs;

		try {
			sArgs = JSON.stringify(args);
		} catch (e) {
			sArgs = "JSON.stringify error for arguments "  + String(args);
		}
		throw new Error("Not implemented method v4.ODataPropertyBinding." + sMethodName
			+ " called with arguments " + sArgs);
	}

	/**
	 * Constructor for a new ODataPropertyBinding.
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   the OData v4 model
	 * @param {string} sPath
	 *   the binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 *
	 * @class Property binding for an OData v4 model.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataPropertyBinding
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @since 1.31.0
	 */
	var ODataPropertyBinding = PropertyBinding.extend(sClassName,
			/** @lends sap.ui.model.odata.v4.ODataPropertyBinding.prototype */
			{
				constructor : function () {
					PropertyBinding.apply(this, arguments);
					this.bRequestTypeFailed = false;
					this.oValue = undefined;
				},
				metadata : {
					publicMethods : []
				}
		});

	/**
	 * Checks for an update of this binding's value. Triggers a read at the binding's resolved
	 * path. If the binding cannot be resolved or if the property value has not changed since the
	 * latest <code>checkUpdate</code> nothing else happens. Otherwise a change event is fired;
	 * this event will always be asynchronous.
	 *
	 * If the binding has no type, the property's type is requested from the meta model and set.
	 * In this case, the change event is only fired when the type and the value are known.
	 *
	 * @param {boolean} [bForceUpdate=false]
	 *   if <code>true</code> the change event is fired even if the value has not changed.
	 * @returns {Promise}
	 *   a Promise to be resolved when the check is finished
	 *
	 * @protected
	 */
	ODataPropertyBinding.prototype.checkUpdate = function (bForceUpdate) {
		var bFire = false,
			aPromises = [],
			sResolvedPath = this.getModel().resolve(this.getPath(), this.getContext()),
			that = this;

		if (!sResolvedPath) {
			return Promise.resolve();
		} else if ((bForceUpdate || !this.bRequestTypeFailed) && !this.getType()) {
			// request type only once
			aPromises.push(this.getModel().getMetaModel().requestUI5Type(sResolvedPath)
				.then(function (oType) {
					that.setType(oType, that.sInternalType);
				})["catch"](function (oError) {
					that.bRequestTypeFailed = true;
					jQuery.sap.log.warning(oError.message, sResolvedPath, sClassName);
				})
			);
		}
		aPromises.push(this.getModel().read(sResolvedPath).then(function (oData) {
			if (bForceUpdate || !jQuery.sap.equal(that.oValue, oData.value)) {
				that.oValue = oData.value;
				bFire = true;
			}
		})["catch"](function () {
			// do not rethrow, ManagedObject doesn't react on this either
			// throwing an exception would cause "Uncaught (in promise)" in Chrome
		}));

		return Promise.all(aPromises).then(function () {
			if (bFire) {
				that._fireChange({reason: ChangeReason.Change});
			}
		});
	};

	/**
	 * Returns the current value of the bound property.
	 *
	 * @returns {any}
	 *   the current value of the bound property
	 * @public
	 */
	ODataPropertyBinding.prototype.getValue = function () {
		return this.oValue;
	};

	/**
	 * Sets the (base) context which is used when the binding path is relative. This triggers a
	 * {@link #checkUpdate} to check for the current value.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 * @protected
	 */
	ODataPropertyBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			this.oContext = oContext;
			if (this.isRelative()) {
				this.checkUpdate(false);
			}
		}
	};

	/**
	 * TODO Sets the value for this binding. A model implementation should check if the current
	 * default binding mode permits setting the binding value and if so set the new value also in
	 * the model.
	 *
	 * @param {any} oValue the value to set for this binding
	 *
	 * @public
	 */
	ODataPropertyBinding.prototype.setValue = function () {
		notImplemented("setValue", arguments);
	};

	return ODataPropertyBinding;

}, /* bExport= */ true);
