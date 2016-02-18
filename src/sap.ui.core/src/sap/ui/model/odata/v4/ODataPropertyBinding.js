/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"./lib/_Cache",
	"./_ODataHelper"
], function (jQuery, ChangeReason, PropertyBinding, Cache, Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding";

	/**
	 * Throws an error for a not yet implemented method with the given name called by the SAPUI5
	 * framework. The error message includes the arguments to the method call.
	 * @param {string} sMethodName The method name
	 * @param {object} args The arguments passed to this method when called by SAPUI5
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
	 *   The OData v4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of OData query options where only "5.2 Custom Query Options" are allowed (see
	 *   specification "OData Version 4.0 Part 2: URL Conventions"), except for those with a name
	 *   starting with "sap-". All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: Query options may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 * @throws {Error} When disallowed OData query options are provided
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

				if (!sPath || sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				this.oCache = undefined;
				if (!this.isRelative()) {
					this.oCache = Cache.createSingle(oModel.oRequestor, sPath.slice(1),
						Helper.buildQueryOptions(oModel.mUriParameters, mParameters), true);
				} else if (mParameters) {
					throw new Error("Bindings with a relative path do not support parameters");
				}
				this.bRequestTypeFailed = false;
				this.vValue = undefined;
			},
			metadata : {
				publicMethods : []
			}
		});

	/**
	 * Updates the binding's value and sends a change event if necessary. A change event is sent
	 * if the <code>bForceUpdate</code> parameter is set to <code>true</code> or if the value
	 * has changed. If a relative binding has no context the <code>bForceUpdate</code> parameter
	 * is ignored and the change event is only fired if the old value was not
	 * <code>undefined</code>.
	 * If the binding has no type, the property's type is requested from the meta model and set.
	 * Note: The change event is only sent asynchronously after reading the binding's value and
	 * type information.
	 * If the binding's path cannot be resolved or if reading the binding's value fails or if the
	 * value read is invalid (e.g. not a primitive value), the binding's value is reset to
	 * <code>undefined</code>. As described above, this may trigger a change event depending on the
	 * previous value and the <code>bForceUpdate</code> parameter.
	 *
	 * @param {boolean} [bForceUpdate=false]
	 *   If <code>true</code> the change event is always fired except there is no context for a
	 *   relative binding and the value is <code>undefined</code>.
	 * @returns {Promise}
	 *   A Promise to be resolved when the check is finished
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.checkUpdate = function (bForceUpdate) {
		var bFire = false,
			oPromise,
			aPromises = [],
			oReadPromise,
			sResolvedPath = this.getModel().resolve(this.getPath(), this.getContext()),
			that = this;

		if (!sResolvedPath) {
			oPromise = Promise.resolve();
			if (that.vValue !== undefined) {
				oPromise = oPromise.then(function () {
					that._fireChange({reason : ChangeReason.Change});
				});
			}
			that.vValue = undefined; // ensure value is reset
			return oPromise;
		}
		if (!this.bRequestTypeFailed && !this.getType()) { // request type only once
			aPromises.push(this.getModel().getMetaModel().requestUI5Type(sResolvedPath)
				.then(function (oType) {
					that.setType(oType, that.sInternalType);
				})["catch"](function (oError) {
					that.bRequestTypeFailed = true;
					jQuery.sap.log.warning(oError.message, sResolvedPath, sClassName);
				})
			);
		}
		oReadPromise = this.isRelative()
			? this.getContext().requestValue(this.getPath())
			: this.oCache.read(/*sGroupId*/"", /*sPath*/undefined, function () {
					that.getModel().dataRequested("", function () {});
				});
		aPromises.push(oReadPromise.then(function (vValue) {
			if (vValue && typeof vValue === "object") {
				jQuery.sap.log.error("Accessed value is not primitive", sResolvedPath, sClassName);
				vValue = undefined;
			}
			bFire = that.vValue !== vValue;
			that.vValue = vValue;
		})["catch"](function (oError) {
			// do not rethrow, ManagedObject doesn't react on this either
			// throwing an exception would cause "Uncaught (in promise)" in Chrome
			if (!oError.canceled) {
				jQuery.sap.log.error("Failed to read path " + sResolvedPath, oError, sClassName);
				// fire change event only if error was not caused by refresh and value was undefined
				bFire = that.vValue !== undefined;
			}
			that.vValue = undefined;
		}));

		return Promise.all(aPromises).then(function () {
			if (bForceUpdate || bFire) {
				that._fireChange({reason : ChangeReason.Change});
			}
		});
	};

	/**
	 * Returns the current value of the bound property.
	 *
	 * @returns {any}
	 *   The current value of the bound property
	 * @public
	 */
	ODataPropertyBinding.prototype.getValue = function () {
		return this.vValue;
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server and notifies the
	 * control that new data is available. <code>bForceUpdate</code> has to be <code>true</code>.
	 * If <code>bForceUpdate</code> is not given or <code>false</code>, an error is thrown.
	 * Refresh is supported for absolute bindings.
	 *
	 * @param {boolean} bForceUpdate
	 *   The parameter <code>bForceUpdate</code> has to be <code>true</code>.
	 * @throws {Error} When <code>bForceUpdate</code> is not given or <code>false</code>, refresh
	 *   on this binding is not supported
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 */
	ODataPropertyBinding.prototype.refresh = function (bForceUpdate) {
		if (!bForceUpdate) {
			throw new Error("Falsy values for bForceUpdate are not supported");
		}
		if (!this.oCache) {
			throw new Error("Refresh on this binding is not supported");
		}
		this.oCache.refresh();
		this.checkUpdate(true);
	};

	/**
	 * Sets the (base) context if the binding path is relative and triggers a
	 * {@link #checkUpdate} to check for the current value if the context has changed.
	 * In case of absolute bindings nothing is done.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
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
	 * Sets the value for this binding. A model implementation should check if the current default
	 * binding mode permits setting the binding value and if so set the new value also in the model.
	 *
	 * @param {any} vValue The value to set for this binding
	 *
	 * @public
	 */
	ODataPropertyBinding.prototype.setValue = function () {
		notImplemented("setValue", arguments);
	};

	return ODataPropertyBinding;

}, /* bExport= */ true);
