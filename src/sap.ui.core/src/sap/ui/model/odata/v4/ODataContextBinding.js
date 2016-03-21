/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"./_Context",
	"./_ODataHelper",
	"./lib/_Cache",
	"./lib/_Helper"
], function (jQuery, ChangeReason, ContextBinding, _Context, _ODataHelper, _Cache, _Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataContextBinding",
		mSupportedEvents = {
			change : true,
			dataReceived : true,
			dataRequested : true
		};

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataContextBinding</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#bindContext bindContext} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData V4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameter "$$groupId".
	 *   Note: Binding parameters may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $expand and $select "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {string} [mParameters.$$groupId]
	 *   The batch group ID to be used for requests triggered by this binding; if not specified,
	 *   the model's default group is used, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 * @throws {Error} When disallowed binding parameters are provided
	 *
	 * @alias sap.ui.model.odata.v4.ODataContextBinding
	 * @author SAP SE
	 * @class Context binding for an OData V4 model.
	 *   An event handler can only be attached to this binding for the following events: 'change',
	 *   'dataReceived', and 'dataRequested'.
	 *   For other events, an error is thrown.
	 *
	 *   A context binding can also be used as an <i>operation binding</i> to support function
	 *   imports with an absolute binding path. If you want to control the execution time of a
	 *   function import named "GetNumberOfAvailableItems", create a context binding for the path
	 *   "/GetNumberOfAvailableItems(...)" (as specified here, including the three dots). Such an
	 *   operation binding is <i>deferred</i>; meaning that it does not request automatically, but
	 *   only when you call {@link #execute}. {@link #refresh} is ignored if the OData function has
	 *   not been called yet. Refreshing the binding later results in another call of the function.
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @version ${version}
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				var iPos = sPath.indexOf("(...)"),
					bDeferred = iPos >= 0;

				ContextBinding.call(this, oModel, sPath, oContext);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				this.oCache = undefined;
				this.sGroupId = undefined;
				this.mOperationParameters = undefined;
				this.mQueryOptions = undefined;

				if (bDeferred) {
					this.mOperationParameters = {};
					if (iPos !== sPath.length - 5) {
						throw new Error("Composable functions are not supported: " + sPath);
					}
					if (this.bRelative) {
						throw new Error("Deferred bindings with a relative path are not supported: "
							+ sPath);
					}
				}

				if (!this.bRelative) {
					this.mQueryOptions = _ODataHelper.buildQueryOptions(oModel.mUriParameters,
						mParameters, ["$expand", "$select"]);
					this.sGroupId = _ODataHelper.buildBindingParameters(mParameters).$$groupId;
					if (!bDeferred) {
						this.oCache = _Cache.createSingle(oModel.oRequestor, sPath.slice(1),
							this.mQueryOptions);
					}
				} else if (mParameters) {
					throw new Error("Bindings with a relative path do not support parameters");
				}
			},
			metadata : {
				publicMethods : []
			}
		});

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataContextBinding.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataContextBinding#attachEvent");
		}
		return ContextBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * The 'change' event is fired when the binding is initialized or its parent context is changed.
	 * It is to be used by controls to get notified about changes to the bound context of this
	 * context binding.
	 * Registered event handlers are called with the change reason as parameter.
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
	 * @name sap.ui.model.odata.v4.ODataContextBinding#change
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
	 * @name sap.ui.model.odata.v4.ODataContextBinding#dataRequested
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back end data has been processed. It is to be
	 * used by applications for example to switch off a busy indicator or to process an error.
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
	 * @name sap.ui.model.odata.v4.ODataContextBinding#dataReceived
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * Calls the OData function that corresponds to this operation binding.
	 *
	 * Parameters for the operation must be set via {@link #setParameter} beforehand.
	 *
	 * The value of this binding is the result of the operation. To access the result, bind a
	 * control to the empty path, for example <code>&lt;Text text="{}"/&gt;<code>. The OData
	 * function is only called when a property binding relative to the operation binding exists.
	 *
	 * @throws {Error} If the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}).
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.execute = function () {
		var oMetaModel = this.oModel.getMetaModel(),
			that = this;

		if (!this.mOperationParameters) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (!this.oMetadataPromise) {
			// Note: undefined is more efficient than "" here
			this.oMetadataPromise = oMetaModel.requestObject(undefined,
					oMetaModel.getMetaContext(this.sPath))
				.then(function (oMetaData) {
					if (!oMetaData) {
						throw new Error("Unknown operation");
					}
					if (oMetaData.$kind !== "FunctionImport") {
						throw new Error("Not a FunctionImport");
					}
					return oMetaModel.requestObject("/" + oMetaData.$Function);
				}).then(function (aOperationMetaData) {
					var oOperationMetaData = aOperationMetaData[0];

					if (aOperationMetaData.length !== 1) {
						throw new Error("Unsupported: operation overloading");
					}
					if (oOperationMetaData.$IsBound) {
						throw new Error("Unsupported: bound operation");
					}
					return oOperationMetaData;
				});
		}
		this.oMetadataPromise.then(function (oOperationMetaData) {
			var aOperationParameters = oOperationMetaData.$Parameter,
				aParameters = [];

			if (aOperationParameters) {
				aOperationParameters.forEach(function (oParameter) {
					var sName = oParameter.$Name;

					if (sName in that.mOperationParameters) {
						if (oParameter.$IsCollection) {
							throw new Error("Unsupported: collection parameter");
						}
						aParameters.push(sName + "=" + _Helper.formatLiteral(
							that.mOperationParameters[sName], oParameter.$Type));
					}
				});
			}
			that.oCache = _Cache.createSingle(that.oModel.oRequestor,
				that.sPath.slice(1).replace("...", aParameters.join(',')),
				that.mQueryOptions);
			that.refresh(true);
		}).catch(function (oError) {
			jQuery.sap.log.error(oError.message, that.sPath, sClassName);
		});
	};

	/**
	 * Returns the batch group ID of the binding that has to be used for read requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
	 */
	ODataContextBinding.prototype.getGroupId = function() {
		return this.sGroupId || this.oModel.getGroupId();
	};

	/**
	 * Initializes the OData context binding. Fires a 'change' event in case the binding has a
	 * resolved path.
	 *
	 * @protected
	 * @see sap.ui.model.Binding#initialize
	 * @since 1.37.0
	 */
	// @override
	ODataContextBinding.prototype.initialize = function () {
		var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);

		if (!sResolvedPath) {
			return;
		}
		this.oElementContext = _Context.create(this.oModel, this, sResolvedPath);
		this._fireChange({reason : ChangeReason.Change});
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
	ODataContextBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: v4.ODataContextBinding#isInitial");
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server and notifies the
	 * control that new data is available. <code>bForceUpdate</code> has to be <code>true</code>.
	 * If <code>bForceUpdate</code> is not given or <code>false</code>, an error is thrown.
	 * Refresh is supported for absolute bindings.
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
	ODataContextBinding.prototype.refresh = function (bForceUpdate, sGroupId) {
		if (bForceUpdate !== true) {
			throw new Error("Unsupported operation: v4.ODataContextBinding#refresh, "
				+ "bForceUpdate must be true");
		}
		if (sGroupId !== undefined) {
			throw new Error("Unsupported operation: v4.ODataContextBinding#refresh, "
				+ "sGroupId parameter must not be set");
		}
		if (this.oCache) {
			this.oCache.refresh();
			this._fireChange({reason : ChangeReason.Refresh});
		} else if (!this.mOperationParameters) {
			throw new Error("Refresh on this binding is not supported");
		}
	};

	/**
	 * Requests the value for the given path; the value is requested from this binding's
	 * cache or from its context in case it has no cache.
	 *
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the cache's <code>read</code> call
	 *
	 *  @private
	 */
	ODataContextBinding.prototype.requestValue = function (sPath) {
		var bDataRequested = false,
			sGroupId,
			that = this;

		if (this.oCache) {
			sGroupId = this.getGroupId();
			return this.oCache.read(sGroupId, sPath, function () {
				bDataRequested = true;
				that.oModel.addedRequestToGroup(sGroupId, that.fireDataRequested.bind(that));
			}).then(function (vValue) {
				if (bDataRequested) {
					that.fireDataReceived();
				}
				return vValue;
			}, function (oError) {
				if (bDataRequested) {
					if (oError.canceled) {
						that.fireDataReceived();
					} else {
						// log error only once when data request failed
						jQuery.sap.log.error("Failed to read path " + that.sPath, oError,
							sClassName);
						that.fireDataReceived({error : oError});
					}
				}
				throw oError;
			});
		}
		if (this.oContext) {
			return this.oContext.requestValue(this.sPath + (sPath ? "/" + sPath : ""));
		}
		return Promise.resolve();
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
	ODataContextBinding.prototype.resume = function () {
		throw new Error("Unsupported operation: v4.ODataContextBinding#resume");
	};

	/**
	 * Sets the (base) context which is used when the binding path is relative.
	 * Fires a change event if the bound context is changed.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 *
	 * @private
	 * @see sap.ui.model.Binding#setContext
	 */
	// @override
	ODataContextBinding.prototype.setContext = function (oContext) {
		var oElementContext = this.oElementContext,
			sResolvedPath;

		if (this.oContext !== oContext) {
			this.oContext = oContext;
			if (this.bRelative) {
				sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
				this.oElementContext = sResolvedPath
					? _Context.create(this.oModel, this, sResolvedPath)
					: null;
				if (this.oElementContext !== oElementContext) {
					this._fireChange({reason : ChangeReason.Context});
				}
			}
		}
	};

	/**
	 * Sets a parameter for an operation call.
	 *
	 * @param {string} sParameterName
	 *   The parameter name
	 * @param {any} vValue
	 *   The parameter value
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding}
	 *   <code>this</code> to enable method chaining
	 * @throws {Error} If the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}).
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.setParameter = function (sParameterName, vValue) {
		if (!this.mOperationParameters) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		this.mOperationParameters[sParameterName] = vValue;
		return this;
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
	ODataContextBinding.prototype.suspend = function () {
		throw new Error("Unsupported operation: v4.ODataContextBinding#suspend");
	};

	/**
	 * Updates the value for the given property name inside the entity with the given relative path;
	 * the value is updated in this binding's cache or in its parent context in case it has no
	 * cache.
	 *
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the cache's <code>update</code> call
	 *
	 * @private
	 */
	ODataContextBinding.prototype.updateValue = function (sPropertyName, vValue, sEditUrl, sPath) {
		var sGroupId, oPromise;

		if (this.oCache) {
			sGroupId = this.getGroupId();
			oPromise = this.oCache.update(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
			this.oModel.addedRequestToGroup(sGroupId);
			return oPromise;
		}

		return this.oContext.updateValue(sPropertyName, vValue, sEditUrl, this.sPath + "/" + sPath);
	};

	return ODataContextBinding;
}, /* bExport= */ true);
