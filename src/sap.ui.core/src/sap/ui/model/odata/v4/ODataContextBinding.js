/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"./Context",
	"./lib/_Cache",
	"./lib/_Helper",
	"./lib/_SyncPromise",
	"./ODataParentBinding"
], function (jQuery, Binding, ChangeReason, ContextBinding, Context, _Cache, _Helper, _SyncPromise,
		asODataParentBinding) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataContextBinding",
		mSupportedEvents = {
			change : true,
			dataReceived : true,
			dataRequested : true
		};

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#bindContext} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData V4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 *
	 * @alias sap.ui.model.odata.v4.ODataContextBinding
	 * @author SAP SE
	 * @class Context binding for an OData V4 model.
	 *   An event handler can only be attached to this binding for the following events: 'change',
	 *   'dataReceived', and 'dataRequested'.
	 *   For other events, an error is thrown.
	 *
	 *   A context binding can also be used as an <i>operation binding</i> to support bound actions,
	 *   action imports and function imports. If you want to control the execution time of an
	 *   operation, for example a function import named "GetNumberOfAvailableItems", create a
	 *   context binding for the path "/GetNumberOfAvailableItems(...)" (as specified here,
	 *   including the three dots). Such an operation binding is <i>deferred</i>, meaning that it
	 *   does not request automatically, but only when you call {@link #execute}. {@link #refresh}
	 *   is always ignored for actions and action imports. For function imports, it is ignored if
	 *   {@link #execute} has not yet been called. Afterwards it results in another call of the
	 *   function with the parameter values of the last execute.
	 *
	 *   The binding parameter for bound actions may be given in the binding path, for example
	 *   "/SalesOrderList('42')/name.space.SalesOrder_Confirm". This can be
	 *   used if the exact entity for the binding parameter is known in advance. If you use a
	 *   relative binding instead, the operation path is a concatenation of the parent context's
	 *   canonical path and the deferred binding's path.
	 *
	 *   <b>Example</b>: You have a table with a list binding to "/SalesOrderList". In
	 *   each row you have a button to confirm the sales order, with the relative binding
	 *   "name.space.SalesOrder_Confirm(...)". Then the parent context for such a button
	 *   refers to an entity in "SalesOrderList", so its canonical path is
	 *   "/SalesOrderList('<i>SalesOrderID</i>')" and the resulting path for the action
	 *   is "/SalesOrderList('<i>SalesOrderID</i>')/name.space.SalesOrder_Confirm".
	 *
	 *   This also works if the relative path of the deferred operation binding starts with a
	 *   navigation property. Then this navigation property will be part of the operation's
	 *   resource path, which is still valid.
	 *
	 *   A deferred operation binding is not allowed to have another deferred operation binding as
	 *   parent.
	 *
	 * @extends sap.ui.model.ContextBinding
	 * @mixes sap.ui.model.odata.v4.ODataParentBinding
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 *
	 * @borrows sap.ui.model.odata.v4.ODataBinding#hasPendingChanges as #hasPendingChanges
	 * @borrows sap.ui.model.odata.v4.ODataBinding#isInitial as #isInitial
	 * @borrows sap.ui.model.odata.v4.ODataBinding#refresh as #refresh
	 * @borrows sap.ui.model.odata.v4.ODataBinding#resetChanges as #resetChanges
	 * @borrows sap.ui.model.odata.v4.ODataBinding#resume as #resume
	 * @borrows sap.ui.model.odata.v4.ODataBinding#suspend as #suspend
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#changeParameters as #changeParameters
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#initialize as #initialize
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				var iPos = sPath.indexOf("(...)");

				ContextBinding.call(this, oModel, sPath);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}

				this.mAggregatedQueryOptions = {};
				this.oCachePromise = _SyncPromise.resolve();
				this.mCacheByContext = undefined;
				this.sGroupId = undefined;
				this.oOperation = undefined;
				// auto-$expand/$select: promises to wait until child bindings have provided
				// their path and query options
				this.aChildCanUseCachePromises = [];
				this.sRefreshGroupId = undefined;
				this.sUpdateGroupId = undefined;

				if (iPos >= 0) { // deferred operation binding
					this.oOperation = {
						bAction : undefined,
						oMetadataPromise : undefined,
						mParameters : {},
						sResourcePath : undefined
					};
					if (iPos !== this.sPath.length - 5) {
						throw new Error(
							"The path must not continue after a deferred operation: " + this.sPath);
					}
				}

				this.applyParameters(jQuery.extend(true, {}, mParameters));
				this.oElementContext = this.bRelative
					? null
					: Context.create(this.oModel, this, sPath);
				this.setContext(oContext);
				oModel.bindingCreated(this);
			},
			metadata : {
				publicMethods : []
			}
		});

	asODataParentBinding(ODataContextBinding.prototype);

	/**
	 * Deletes the entity in <code>this.oElementContext</code>, identified by the edit URL.
	 *
	 * @param {string} [sGroupId=getUpdateGroupId()]
	 *   The group ID to be used for the DELETE request
	 * @param {string} sEditUrl
	 *   The edit URL to be used for the DELETE request
	 * @returns {Promise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure.
	 *
	 * @private
	 */
	ODataContextBinding.prototype._delete = function (sGroupId, sEditUrl) {
		var that = this;

		// a context binding without path can simply delegate to its parent context.
		if (this.sPath === "" && this.oContext["delete"]) {
			return this.oContext["delete"](sGroupId);
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot delete due to pending changes");
		}
		return this.deleteFromCache(sGroupId, sEditUrl, "", function () {
			that.oElementContext.destroy();
			that.oElementContext = null;
			that._fireChange({reason : ChangeReason.Remove});
		});
	};

	/**
	 * Requests the metadata for this operation binding. Caches the result.
	 *
	 * @returns {SyncPromise}
	 *   A promise that is resolved with the operation metadata.
	 *
	 * @private
	 */
	ODataContextBinding.prototype._fetchOperationMetadata = function () {
		var oMetaModel = this.oModel.getMetaModel(),
			sOperationName,
			iPos;

		if (!this.oOperation.oMetadataPromise) {
			// take the last segment and remove "(...)" at the end
			// We do not need special code if there is no '/', because iPos + 1 === 0 then.
			iPos = this.sPath.lastIndexOf("/");
			sOperationName = this.sPath.slice(iPos + 1, -5);
			this.oOperation.oMetadataPromise = oMetaModel.fetchObject("/" + sOperationName)
				.then(function (vMetadata) {
					if (!vMetadata) {
						throw new Error("Unknown operation: " + sOperationName);
					}
					if (Array.isArray(vMetadata) && vMetadata[0].$kind === "Action") {
						return vMetadata;
					}
					if (Array.isArray(vMetadata) && vMetadata[0].$kind === "Function") {
						throw new Error("Functions without import not supported: "
							+ sOperationName);
					}
					if (vMetadata.$kind === "ActionImport") {
						return oMetaModel.fetchObject("/" + vMetadata.$Action);
					}
					if (vMetadata.$kind === "FunctionImport") {
						return oMetaModel.fetchObject("/" + vMetadata.$Function);
					}
					throw new Error("Not an operation: " + sOperationName);
				}).then(function (aOperationMetadata) {
					if (aOperationMetadata.length !== 1) {
						throw new Error("Unsupported operation overloading: " + sOperationName);
					}
					return aOperationMetadata[0];
				});
		}
		return this.oOperation.oMetadataPromise;
	};

	/**
	 * Applies the given map of parameters to this binding's parameters.
	 *
	 * @param {object} [mParameters]
	 *   Map of binding parameters, {@link sap.ui.model.odata.v4.ODataModel#constructor}
	 * @param {sap.ui.model.ChangeReason} [sChangeReason]
	 *   A change reason, used to distinguish calls by {@link #constructor} from calls by
	 *   {@link sap.ui.model.odata.v4.ODataParentBinding#changeParameters}
	 *
	 * @private
	 */
	ODataContextBinding.prototype.applyParameters = function (mParameters, sChangeReason) {
		var oBindingParameters;

		this.mQueryOptions = this.oModel.buildQueryOptions(mParameters, true);

		oBindingParameters = this.oModel.buildBindingParameters(mParameters,
			["$$groupId", "$$updateGroupId"]);
		this.sGroupId = oBindingParameters.$$groupId;
		this.sUpdateGroupId = oBindingParameters.$$updateGroupId;
		this.mParameters = mParameters;
		this.fetchCache(this.oContext);
		if (!this.oOperation) {
			if (sChangeReason) {
				this.refreshInternal(undefined, true);
			} else {
				this.checkUpdate();
			}
		}
	};

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
	 *   The reason for the 'change' event: {@link sap.ui.model.ChangeReason.Change} when the
	 *   binding is initialized, {@link sap.ui.model.ChangeReason.Refresh} when the binding is
	 *   refreshed, and {@link sap.ui.model.ChangeReason.Context} when the parent context is changed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#change
	 * @public
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
	 * The 'dataReceived' event is fired after the back-end data has been processed. It is to be
	 * used by applications for example to switch off a busy indicator or to process an error.
	 *
	 * If back-end requests are successful, the event has no parameters. Use the binding's bound
	 * context via {@link #getBoundContext oEvent.getSource().getBoundContext()} to access the
	 * response data. Note that controls bound to this data may not yet have been updated, meaning
	 * it is not safe for registered event handlers to access data via control APIs.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {Error} [oEvent.getParameters.error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#dataReceived
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * Deregisters the given change listener.
	 *
	 * @param {string} sPath
	 *   The path
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} oListener
	 *   The change listener
	 *
	 * @private
	 */
	ODataContextBinding.prototype.deregisterChange = function (sPath, oListener) {
		var oCache;

		if (!this.oCachePromise.isFulfilled()) {
			// Be prepared for late deregistrations by dependents of parked contexts
			return;
		}

		oCache = this.oCachePromise.getResult();
		if (oCache) {
			oCache.deregisterChange(sPath, oListener);
		} else if (this.oContext) {
			this.oContext.deregisterChange(_Helper.buildPath(this.sPath, sPath), oListener);
		}
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.40.1
	 */
	// @override
	ODataContextBinding.prototype.destroy = function () {
		if (this.oElementContext) {
			this.oElementContext.destroy();
		}
		this.oModel.bindingDestroyed(this);
		this.oCachePromise = undefined;
		this.oContext = undefined;
		ContextBinding.prototype.destroy.apply(this);
	};

	/**
	 * Hook method for {@link sap.ui.model.odata.v4.ODataBinding#fetchCache} to create a cache for
	 * this binding with the given resource path and query options.
	 *
	 * @param {string} sResourcePath
	 *   The resource path, for example "EMPLOYEES('1')"
	 * @param {object} mQueryOptions
	 *   The query options
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The new cache instance
	 *
	 * @private
	 */
	ODataContextBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions) {
		return _Cache.createSingle(this.oModel.oRequestor, sResourcePath, mQueryOptions,
			this.oModel.bAutoExpandSelect);
	};

	/**
	 * Hook method for {@link sap.ui.model.odata.v4.ODataBinding#fetchQueryOptionsForOwnCache} to
	 * determine the query options for this binding.
	 *
	 * @returns {SyncPromise}
	 *   A promise resolving with the binding's query options
	 *
	 * @private
	 */
	ODataContextBinding.prototype.doFetchQueryOptions = function () {
		return _SyncPromise.resolve(this.mQueryOptions);
	};

	/**
	 * Calls the OData operation that corresponds to this operation binding.
	 *
	 * Parameters for the operation must be set via {@link #setParameter} beforehand.
	 *
	 * The value of this binding is the result of the operation. To access a result of primitive
	 * type, bind a control to the path "value", for example
	 * <code>&lt;Text text="{value}"/&gt;</code>. If the result has a complex or entity type, you
	 * can bind properties as usual, for example <code>&lt;Text text="{street}"/&gt;</code>.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the request; if not specified, the group ID for this binding is
	 *   used, see {@link sap.ui.model.odata.v4.ODataContextBinding#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @returns {Promise}
	 *   A promise that is resolved without data when the operation call succeeded, or rejected
	 *   with an instance of <code>Error</code> in case of failure.
	 * @throws {Error} If the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}), if the binding is not resolved, or if
	 *   the given group ID is invalid.
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.execute = function (sGroupId) {
		var that = this;

		/**
		 * Creates the cache (if necessary) and sends the GET/POST request.
		 *
		 * @param {object} oOperationMetadata The operation's metadata
		 * @param {string} sPathPrefix
		 *   The prefix for the path that results from the binding parameter
		 * @returns {SyncPromise} The request promise
		 */
		function createCacheAndRequest(oOperationMetadata, sPathPrefix) {
			var oCache,
				iIndex,
				aOperationParameters,
				sOperationPath,
				aParameters,
				oPromise,
				mQueryOptions = jQuery.extend({}, that.oModel.mUriParameters, that.mQueryOptions);

			sGroupId = sGroupId || that.getGroupId();
			that.oOperation.bAction = oOperationMetadata.$kind === "Action";
			if (that.oOperation.bAction) {
				// Recreate the cache, because the query options might have changed
				oCache = _Cache.createSingle(that.oModel.oRequestor,
					(sPathPrefix + that.sPath).slice(1, -5), mQueryOptions,
					that.oModel.bAutoExpandSelect, true);
				if (that.bRelative && that.oContext.getBinding) {
					// do not access @odata.etag directly to avoid "failed to drill-down" in cache
					// if it is not available
					iIndex = that.sPath.lastIndexOf("/");
					oPromise = that.oContext
						.fetchValue(iIndex >= 0 ? that.sPath.slice(0, iIndex) : "")
						.then(function (oEntity) { return oEntity["@odata.etag"]; });
				} else {
					oPromise = _SyncPromise.resolve(); // no parent cache -> no ETag
				}
				oPromise = oPromise.then(function (sETag) {
					return oCache.post(sGroupId, that.oOperation.mParameters, sETag);
				});
			} else {
				// the function must always recreate the cache because the parameters influence the
				// resource path
				aOperationParameters = oOperationMetadata.$Parameter;
				aParameters = [];
				if (aOperationParameters) {
					aOperationParameters.forEach(function (oParameter) {
						var sName = oParameter.$Name;

						if (sName in that.oOperation.mParameters) {
							if (oParameter.$IsCollection) {
								throw new Error("Unsupported: collection parameter");
							}
							aParameters.push(encodeURIComponent(sName) + "="
								+ encodeURIComponent(_Helper.formatLiteral(
									that.oOperation.mParameters[sName], oParameter.$Type)));
						}
					});
				}
				sOperationPath = (sPathPrefix + that.sPath.replace("...", aParameters.join(',')))
					.slice(1);
				oCache = _Cache.createSingle(that.oModel.oRequestor, sOperationPath, mQueryOptions,
					that.oModel.bAutoExpandSelect);
				oPromise = oCache.fetchValue(sGroupId);
			}
			that.oCachePromise = _SyncPromise.resolve(oCache);
			return oPromise;
		}

		this.oModel.checkGroupId(sGroupId);
		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (this.bRelative) {
			if (!this.oContext) {
				throw new Error("Unresolved binding: " + this.sPath);
			}
			if (this.oContext.isTransient && this.oContext.isTransient()) {
				throw new Error("Execute for transient context not allowed: "
					+ this.oModel.resolve(this.sPath, this.oContext));
			}
			if (this.oContext.getPath().indexOf("(...)") >= 0) {
				throw new Error("Nested deferred operation bindings not supported: "
					+ this.oModel.resolve(this.sPath, this.oContext));
			}
		}
		return this._fetchOperationMetadata().then(function (oOperationMetaData) {
			if (that.bRelative) {
				if (!that.oContext.getBinding) {
					return createCacheAndRequest(oOperationMetaData,
						that.oContext.getPath() === "/" ? "/" : that.oContext.getPath() + "/");
				}
				return that.getContext().fetchCanonicalPath().then(function (sPath) {
					return createCacheAndRequest(oOperationMetaData, sPath + "/");
				});
			}
			return createCacheAndRequest(oOperationMetaData, "");
		}).then(function (oResult) {
			that._fireChange({reason : ChangeReason.Change});
			that.oModel.getDependentBindings(that).forEach(function (oDependentBinding) {
				oDependentBinding.refreshInternal(sGroupId, true);
			});
			// do not return anything
		})["catch"](function (oError) {
			that.oModel.reportError("Failed to execute " + that.sPath, sClassName, oError);
			throw oError;
		});
	};

	/**
	 * Requests the value for the given path; the value is requested from this binding's
	 * cache or from its context in case it has no cache.
	 *
	 * @param {string} sPath
	 *   Some absolute path
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} [oListener]
	 *   A property binding which registers itself as listener at the cache
	 * @returns {SyncPromise}
	 *   A promise on the outcome of the cache's <code>read</code> call
	 *
	 * @private
	 */
	ODataContextBinding.prototype.fetchValue = function (sPath, oListener) {
		var that = this;

		return this.oCachePromise.then(function (oCache) {
			var bDataRequested = false,
				sGroupId,
				sRelativePath;

			if (oCache) {
				sRelativePath = that.getRelativePath(sPath);
				if (sRelativePath !== undefined) {
					sGroupId = that.sRefreshGroupId || that.getGroupId();
					that.sRefreshGroupId = undefined;
					return oCache.fetchValue(sGroupId, sRelativePath, function () {
						bDataRequested = true;
						that.fireDataRequested();
					}, oListener).then(function (vValue) {
						if (bDataRequested) {
							that.fireDataReceived();
						}
						return vValue;
					}, function (oError) {
						if (bDataRequested) {
							that.oModel.reportError("Failed to read path " + that.sPath, sClassName,
								oError);
							that.fireDataReceived(oError.canceled ? undefined : {error : oError});
						}
						throw oError;
					});
				}
			}
			if (!that.oOperation && that.oContext && that.oContext.fetchValue) {
				return that.oContext.fetchValue(sPath, oListener);
			}
		});
	};

	/**
	 * Returns the bound context.
	 *
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The bound context
	 *
	 * @function
	 * @name sap.ui.model.odata.v4.ODataContextBinding#getBoundContext
	 * @public
	 * @since 1.39.0
	 */

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataContextBinding.prototype.refreshInternal = function (sGroupId) {
		var that = this;

		this.oCachePromise.then(function (oCache) {
			if (!that.oElementContext) { // refresh after delete
				that.oElementContext = Context.create(that.oModel, that,
					that.oModel.resolve(that.sPath, that.oContext));
				if (!oCache) { // make sure event IS fired
					that._fireChange({reason : ChangeReason.Refresh});
				}
			}
			if (oCache) {
				that.fetchCache(that.oContext);
				if (!that.oOperation) {
					that.sRefreshGroupId = sGroupId;
					that.mCacheByContext = undefined;
					// Do not fire a change event, or else ManagedObject destroys and recreates the
					// binding hierarchy causing a flood of events
				} else if (!that.oOperation.bAction) {
					// ignore returned promise, error handling takes place in execute
					that.execute(sGroupId);
				}
			}
			that.oModel.getDependentBindings(that).forEach(function (oDependentBinding) {
				oDependentBinding.refreshInternal(sGroupId, true);
			});
		});
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
		if (this.oContext !== oContext) {
			if (this.bRelative && (this.oContext || oContext)) {
				if (this.oElementContext) {
					this.oElementContext.destroy();
					this.oElementContext = null;
				}
				this.fetchCache(oContext);
				if (oContext) {
					this.oElementContext = Context.create(this.oModel, this,
						this.oModel.resolve(this.sPath, oContext));
				}
				// call Binding#setContext because of data state etc.; fires "change"
				Binding.prototype.setContext.call(this, oContext);
			} else {
				// remember context even if no "change" fired
				this.oContext = oContext;
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
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}) or if the value is missing
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.setParameter = function (sParameterName, vValue) {
		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (vValue === undefined) {
			throw new Error("Missing value for parameter: " + sParameterName);
		}
		this.oOperation.mParameters[sParameterName] = vValue;
		return this;
	};

	/**
	 * Returns a string representation of this object including the binding path. If the binding is
	 * relative, the parent path is also given, separated by a '|'.
	 *
	 * @return {string} A string description of this binding
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.toString = function () {
		return sClassName + ": " + (this.bRelative  ? this.oContext + "|" : "") + this.sPath;
	};

	return ODataContextBinding;
});
