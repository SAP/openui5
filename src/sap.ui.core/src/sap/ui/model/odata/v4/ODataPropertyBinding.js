/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"./lib/_Cache",
	"./_ODataHelper"
], function (jQuery, BindingMode, ChangeReason, PropertyBinding, _Cache, _ODataHelper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
		mSupportedEvents = {
			change : true,
			dataReceived : true,
			dataRequested : true
		};

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
	 * @alias sap.ui.model.odata.v4.ODataPropertyBinding
	 * @author SAP SE
	 * @class Property binding for an OData v4 model.
	 *   An event handler can only be attached to this binding for the following events: 'change',
	 *   'dataReceived', and 'dataRequested'.
	 *   For other events, an error is thrown.
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @version ${version}
	 */
	var ODataPropertyBinding = PropertyBinding.extend(sClassName, {
			constructor : function (oModel, sPath, oContext, mParameters) {
				PropertyBinding.call(this, oModel, sPath, oContext);

				if (!sPath || sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				this.oCache = undefined;
				if (!this.isRelative()) {
					this.oCache = _Cache.createSingle(oModel.oRequestor, sPath.slice(1),
						_ODataHelper.buildQueryOptions(oModel.mUriParameters, mParameters), true);
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
	 * The 'change' event is fired when the binding is initialized, refreshed or its parent context
	 * is changed. It is to be used by controls to get notified about changes to the value of this
	 * property binding. Registered event handlers are called with the change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'change' event: {@link sap.ui.model.ChangeReason.Change Change}
	 *   when the binding is initialized, {@link sap.ui.model.ChangeReason.Refresh Refresh} when
	 *   the binding is refreshed, and {@link sap.ui.model.ChangeReason.Context Context} when the
	 *   parent context is changed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#change
	 * @protected
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is to be used by applications for example to switch on a busy indicator. Registered event
	 * handlers are called without parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#dataRequested
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back end data has been processed and the
	 * registered 'change' event listeners have been notified. It is to be used by applications for
	 * example to switch off a busy indicator or to process an error.
	 *
	 * If back end requests are successful, the event has no parameters. The response data is
	 * available in the model. Note that controls bound to this data may not yet have been updated;
	 * it is thus not safe for registered event handlers to access data via control APIs.
	 *
	 * If a back end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {Error} [oEvent.getParameters.error] The error object if a back end request failed.
	 *   If there are multiple failed back end requests, the error of the first one is provided.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#dataReceived
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataPropertyBinding.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataPropertyBinding#attachEvent");
		}
		return PropertyBinding.prototype.attachEvent.apply(this, arguments);
	};

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
	 * @param {sap.ui.model.ChangeReason} [sChangeReason=ChangeReason.Change]
	 *   The change reason for the change event
	 * @returns {Promise}
	 *   A Promise to be resolved when the check is finished
	 *
	 * @private
	 * @see sap.ui.model.Binding#checkUpdate
	 */
	// @override
	ODataPropertyBinding.prototype.checkUpdate = function (bForceUpdate, sChangeReason) {
		var oChangeReason = {reason : sChangeReason || ChangeReason.Change},
			bDataRequested = false,
			bFire = false,
			mParametersForDataReceived,
			oPromise,
			aPromises = [],
			oReadPromise,
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			that = this;

		if (!sResolvedPath) {
			oPromise = Promise.resolve();
			if (that.vValue !== undefined) {
				oPromise = oPromise.then(function () {
					that._fireChange(oChangeReason);
				});
			}
			that.vValue = undefined; // ensure value is reset
			return oPromise;
		}
		if (!this.bRequestTypeFailed && !this.oType) { // request type only once
			aPromises.push(this.oModel.getMetaModel().requestUI5Type(sResolvedPath)
				.then(function (oType) {
					that.setType(oType, that.sInternalType);
				})["catch"](function (oError) {
					that.bRequestTypeFailed = true;
					jQuery.sap.log.warning(oError.message, sResolvedPath, sClassName);
				})
			);
		}
		oReadPromise = this.isRelative()
			? this.oContext.requestValue(this.sPath)
			: this.oCache.read(/*sGroupId*/"", /*sPath*/undefined, function () {
					bDataRequested = true;
					that.oModel.dataRequested("", that.fireDataRequested.bind(that));
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
				mParametersForDataReceived = {error : oError};
			}
			that.vValue = undefined;
		}));

		return Promise.all(aPromises).then(function () {
			if (bForceUpdate || bFire) {
				that._fireChange(oChangeReason);
			}
			if (bDataRequested) {
				that.fireDataReceived(mParametersForDataReceived);
			}
		});
	};

	/**
	 * Returns the current value of the bound property.
	 *
	 * @returns {any}
	 *   The current value of the bound property
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#getValue
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.getValue = function () {
		return this.vValue;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#isInitial
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: v4.ODataPropertyBinding#isInitial");
	};

	/**
	 * Refreshes this binding; refresh is supported for absolute bindings only.
	 * A refresh retrieves data from the server and fires a change event when new data is available.
	 * <code>bForceUpdate</code> has to be <code>true</code>.
	 * If <code>bForceUpdate</code> is not given or <code>false</code>, an error is thrown.
	 *
	 * @param {boolean} bForceUpdate
	 *   The parameter <code>bForceUpdate</code> has to be <code>true</code>.
	 * @param {string} [sGroupId]
	 *   The parameter <code>sGroupId</code> is not supported.
	 * @throws {Error} When <code>bForceUpdate</code> is not <code>true</code> or
	 *   <code>sGroupId</code> is set or refresh on this binding is not supported.
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.refresh = function (bForceUpdate, sGroupId) {
		if (bForceUpdate !== true) {
			throw new Error("Unsupported operation: v4.ODataPropertyBinding#refresh, "
					+ "bForceUpdate must be true");
		}
		if (sGroupId !== undefined) {
			throw new Error("Unsupported operation: v4.ODataPropertyBinding#refresh, "
				+ "sGroupId parameter must not be set");
		}
		if (!this.oCache) {
			throw new Error("Refresh on this binding is not supported");
		}
		this.oCache.refresh();
		this.checkUpdate(true, ChangeReason.Refresh);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#resume
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.resume = function () {
		throw new Error("Unsupported operation: v4.ODataPropertyBinding#resume");
	};

	/**
	 * Sets the binding mode of this property binding to the given value; the binding modes
	 * 'OneTime' and 'OneWay' are supported.
	 *
	 * @param {sap.ui.model.BindingMode} sBindingMode
	 *   The binding mode
	 * @returns {undefined}
	 * @throws {Error}
	 *   When 'TwoWay' binding mode is used (not supported)
	 *
	 * @protected
	 * @see sap.ui.model.PropertyBinding#setBindingMode
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.setBindingMode = function (sBindingMode) {
		if (sBindingMode !== BindingMode.OneTime && sBindingMode !== BindingMode.OneWay) {
			throw new Error("Unsupported operation: v4.ODataPropertyBinding#setBindingMode, "
					+ "sBindingMode must not be " + sBindingMode);
		}
		return PropertyBinding.prototype.setBindingMode.apply(this, arguments);
	};

	/**
	 * Sets the (base) context if the binding path is relative and triggers a
	 * {@link #checkUpdate} to check for the current value if the context has changed.
	 * In case of absolute bindings nothing is done.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 *
	 * @private
	 * @see sap.ui.model.Binding#setContext
	 */
	// @override
	ODataPropertyBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			this.oContext = oContext;
			if (this.isRelative()) {
				this.checkUpdate(false, ChangeReason.Context);
			}
		}
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#setValue
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.setValue = function () {
		throw new Error("Unsupported operation: v4.ODataPropertyBinding#setValue");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#suspend
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.suspend = function () {
		throw new Error("Unsupported operation: v4.ODataPropertyBinding#suspend");
	};
	return ODataPropertyBinding;

}, /* bExport= */ true);
