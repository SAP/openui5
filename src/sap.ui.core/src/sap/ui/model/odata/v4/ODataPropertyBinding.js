/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/PropertyBinding"
], function (jQuery, ChangeReason, Cache, Helper, PropertyBinding) {
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
	 * DO NOT CALL this private constructor for a new <code>ODataPropertyBinding</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#bindProperty bindProperty} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   the OData v4 model
	 * @param {string} sPath
	 *   the binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   map of OData query options where only "5.2 Custom Query Options" (see OData V4
	 *   specification part 2) are allowed. All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: Query options may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 * @throws {Error} when disallowed OData query options are provided
	 *
	 * @class Property binding for an OData v4 model.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataPropertyBinding
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 */
	var ODataPropertyBinding = PropertyBinding.extend(sClassName, {
			constructor : function (oModel, sPath, oContext, mParameters) {
				PropertyBinding.call(this, oModel, sPath, oContext);
				this.oCache = undefined;
				if (!this.isRelative()) {
					this.oCache = Cache.createSingle(oModel.oRequestor,
						oModel.sServiceUrl + sPath.slice(1),
						Helper.buildQueryOptions(oModel.mUriParameters, mParameters));
				} else if (mParameters) {
					throw new Error("Bindings with a relative path do not support parameters");
				}
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
	 * @private
	 */
	ODataPropertyBinding.prototype.checkUpdate = function (bForceUpdate) {
		var bFire = false,
			aPromises = [],
			oReadPromise,
			sResolvedPath = this.getModel().resolve(this.getPath(), this.getContext()),
			that = this;

		if (!sResolvedPath) {
			return Promise.resolve();
		} else if ((bForceUpdate || !this.bRequestTypeFailed) && !this.getType()) {
			// request type only once
			aPromises.push(this.getModel().getMetaModel().requestUI5Type(sResolvedPath)
				.then(function (oType) {
					that.setType(oType, that.sInternalType);
					bFire = true;
				})["catch"](function (oError) {
					that.bRequestTypeFailed = true;
					jQuery.sap.log.warning(oError.message, sResolvedPath, sClassName);
				})
			);
		}
		oReadPromise = this.isRelative() ? this.getModel().read(sResolvedPath) : this.oCache.read();
		aPromises.push(oReadPromise.then(function (oData) {
			if (oData.value === undefined || typeof oData.value === "object") {
				jQuery.sap.log.error("Accessed value is not primitive", sResolvedPath, sClassName);
			} else if (bForceUpdate || !jQuery.sap.equal(that.oValue, oData.value)) {
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
