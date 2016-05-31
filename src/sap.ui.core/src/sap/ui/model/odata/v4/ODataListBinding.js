/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataListBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ListBinding",
	"sap/ui/model/odata/OperationMode",
	"./_ODataHelper",
	"./Context",
	"./lib/_Cache",
	"./lib/_Helper"
], function (jQuery, Binding, ChangeReason, ListBinding, OperationMode, _ODataHelper, Context,
	_Cache, _Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataListBinding",
		mSupportedEvents = {
			change : true,
			dataReceived : true,
			dataRequested : true,
			refresh : true
		};

	/**
	 * Creates a cache proxy and attaches it to the given binding.
	 *
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oBinding
	 *   The OData list binding instance
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context instance to be used
	 */
	function createCacheProxy(oBinding, oContext) {
		function createCache(sPath) {
			return _Cache.create(oBinding.oModel.oRequestor,
				_Helper.buildPath(sPath.slice(1), oBinding.sPath),
				_ODataHelper.mergeQueryOptions(oBinding.mQueryOptions, oBinding.sOrderby));
		}

		oBinding.oCache = _ODataHelper.createCacheProxy(oBinding, createCache,
			oContext.requestCanonicalPath());
		oBinding.oCache.promise.then(function (oCache) {
			oBinding.oCache = oCache;
		})["catch"](function (oError) {
			oBinding.oModel.reportError("Failed to create cache for binding " + oBinding,
				sClassName, oError);
		});
	}

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataListBinding</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#bindList bindList} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData V4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   The parent context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [vSorters]
	 *   The dynamic sorters to be used initially; they can be replaced using the {@link #sort}
	 *   method. Static sorters, as defined in the '$orderby' binding parameter, are always executed
	 *   after the dynamic sorters.
	 *   Supported since 1.39.0.
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameters "$$groupId"
	 *   and "$$updateGroupId".
	 *   Note: If parameters are provided for a relative binding path, the binding accesses data
	 *   with its own service requests instead of using its parent binding.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $expand, $filter, $orderby and $select "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.$$operationMode]
	 *   The operation mode for sorting with the model's operation mode as default. Since 1.39.0,
	 *   the operation mode {@link sap.ui.model.odata.OperationMode.Server} is supported. All other
	 *   operation modes including <code>undefined</code> lead to an error if 'vSorters' are given
	 *   or if {@link #sort} is called.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, the model's group ID is used, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, <code>'$auto'</code>, <code>'$direct'</code> or
	 *   application group IDs as specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests triggered by this binding;
	 *   if not specified, the model's update group ID is used,
	 *   see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   For valid values, see parameter "$$groupId".
	 * @throws {Error}
	 *   If disallowed binding parameters are provided or an unsupported operation mode is used
	 *
	 * @alias sap.ui.model.odata.v4.ODataListBinding
	 * @author SAP SE
	 * @class List binding for an OData V4 model.
	 *   An event handler can only be attached to this binding for the following events: 'change',
	 *   'dataReceived', 'dataRequested', and 'refresh'.
	 *   For other events, an error is thrown.
	 * @extends sap.ui.model.ListBinding
	 * @public
	 * @version ${version}
	 */
	var ODataListBinding = ListBinding.extend("sap.ui.model.odata.v4.ODataListBinding", {
			constructor : function (oModel, sPath, oContext, vSorters, mParameters) {
				var oBindingParameters,
					bSortersGiven = vSorters !== undefined && vSorters !== null;

				ListBinding.call(this, oModel, sPath);

				if (!sPath || sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				oBindingParameters = _ODataHelper.buildBindingParameters(mParameters,
					["$$groupId", "$$operationMode", "$$updateGroupId"]);
				this.sGroupId = oBindingParameters.$$groupId;
				this.sOperationMode = oBindingParameters.$$operationMode || oModel.sOperationMode;
				this.sUpdateGroupId = oBindingParameters.$$updateGroupId;

				if (!this.sOperationMode && bSortersGiven) {
					throw new Error("Unsupported operation mode: " + this.sOperationMode);
				}

				this.oCache = undefined;
				this.sChangeReason = undefined;
				this.mQueryOptions = undefined;
				this.sRefreshGroupId = undefined;
				this.aSorters = _ODataHelper.toArray(vSorters);

				if (!this.bRelative || mParameters) {
					this.mQueryOptions = _ODataHelper.buildQueryOptions(oModel.mUriParameters,
						mParameters, ["$expand", "$filter", "$orderby", "$select"]);
				}
				this.sOrderby = _ODataHelper.buildOrderbyOption(this.aSorters,
					this.mQueryOptions && this.mQueryOptions.$orderby);
				if (!this.bRelative) {
					this.oCache = _Cache.create(oModel.oRequestor, sPath.slice(1),
						_ODataHelper.mergeQueryOptions(this.mQueryOptions, this.sOrderby));
				}

				this.reset();
				this.setContext(oContext);
			}
		});

	/**
	 * Returns <code>true</code> if the binding has pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The path
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @private
	 */
	ODataListBinding.prototype._hasPendingChanges = function (sPath) {
		if (this.oCache) {
			return this.oCache.hasPendingChanges(sPath);
		}
		if (this.oContext) {
			return this.oContext.hasPendingChanges(_Helper.buildPath(this.sPath, sPath));
		}
		return false;
	};

	/**
	 * The 'change' event is fired when the binding is initialized or new contexts are created or
	 * its parent context is changed. It is to be used by controls to get notified about changes to
	 * the binding contexts of this list binding. Registered event handlers are called with the
	 * change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'change' event: {@link sap.ui.model.ChangeReason.Change Change}
	 *   when the binding is initialized and or a new context is created, or
	 *   {@link sap.ui.model.ChangeReason.Context Context} when the parent context is changed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#change
	 * @protected
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is to be used by applications for example to switch on a busy indicator.
	 * Registered event handlers are called without parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#dataRequested
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back-end data has been processed and the
	 * registered 'change' event listeners have been notified.
	 * It is to be used by applications for example to switch off a busy indicator or to process an
	 * error.
	 * If back-end requests are successful, the event has no parameters. Use the binding's contexts
	 * via {@link #getCurrentContexts oEvent.getSource().getCurrentContexts()} to access the
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
	 * @name sap.ui.model.odata.v4.ODataListBinding#dataReceived
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataListBinding.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataListBinding#attachEvent");
		}
		return ListBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Deregisters the given change listener.
	 *
	 * @param {string} sPath
	 *   The path
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} oListener
	 *   The change listener
	 * @param {number} iIndex
	 *   Index corresponding to some current context of this binding
	 *
	 * @private
	 */
	ODataListBinding.prototype.deregisterChange = function (sPath, oListener, iIndex) {
		if (this.oCache) {
			this.oCache.deregisterChange(iIndex, sPath, oListener);
		} else if (this.oContext) {
			this.oContext.deregisterChange(_Helper.buildPath(this.sPath, iIndex, sPath), oListener);
		}
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#filter
	 * @since 1.37.0
	 */
	ODataListBinding.prototype.filter = function () {
		throw new Error("Unsupported operation: v4.ODataListBinding#filter");
	};

	 /**
	 * Returns already created binding contexts for all entities in this list binding for the range
	 * determined by the given start index <code>iStart</code> and <code>iLength</code>.
	 * If at least one of the entities in the given range has not yet been loaded, fires a
	 * {@link sap.ui.model.Binding#attachChange 'change'} event on this list binding once these
	 * entities have been loaded <b>asynchronously</b>. A further call to this method in the
	 * 'change' event handler with the same index range then yields the updated array of contexts.
	 *
	 * @param {number} [iStart=0]
	 *   The index where to start the retrieval of contexts
	 * @param {number} [iLength]
	 *   The number of contexts to retrieve beginning from the start index; defaults to the model's
	 *   size limit, see {@link sap.ui.model.Model#setSizeLimit}
	 * @param {number} [iThreshold]
	 *   The parameter <code>iThreshold</code> is not supported.
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   The array of already created contexts with the first entry containing the context for
	 *   <code>iStart</code>
	 * @throws {Error}
	 *   If <code>iThreshold</code> is given
	 *
	 * @protected
	 * @see sap.ui.model.ListBinding#getContexts
	 * @since 1.37.0
	 */
	ODataListBinding.prototype.getContexts = function (iStart, iLength, iThreshold) {
		var sChangeReason,
			oContext = this.oContext,
			bDataRequested = false,
			sGroupId,
			oModel = this.oModel,
			oPromise,
			sResolvedPath = oModel.resolve(this.sPath, oContext),
			that = this;

		/**
		 * Checks, whether the contexts exist for the requested range.
		 *
		 * @returns {boolean}
		 *   <code>true</code> if the contexts in the range exist
		 */
		function isRangeInContext() {
			var i,
				n = iStart + iLength;

			for (i = iStart; i < n; i += 1) {
				if (that.aContexts[i] === undefined) {
					return false;
				}
			}
			return true;
		}

		/**
		 * Creates entries in aContexts for each value in oResult.
		 * Uses fnGetPath to create the context path.
		 * Fires 'change' event if new contexts are created.
		 *
		 * @param {array|object} vResult Resolved OData result
		 */
		function createContexts(vResult) {
			var bChanged = false,
				i,
				bNewLengthFinal,
				iResultLength = Array.isArray(vResult) ? vResult.length : vResult.value.length,
				n = iStart + iResultLength;

			for (i = iStart; i < n; i += 1) {
				if (that.aContexts[i] === undefined) {
					bChanged = true;
					that.aContexts[i] = Context.create(oModel, that, sResolvedPath + "/" + i, i);
				}
			}
			if (that.aContexts.length > that.iMaxLength) {
				// upper boundary obsolete: reset it
				that.iMaxLength = Infinity;
			}
			if (iResultLength < iLength) {
				// less data -> reduce upper boundary for list length and delete obsolete content
				that.iMaxLength = Math.min(iStart + iResultLength, that.iMaxLength);
				if (that.aContexts.length > that.iMaxLength) {
					// delete all contexts after iMaxLength
					that.aContexts.splice(that.iMaxLength,
						that.aContexts.length - that.iMaxLength);
				}
			}
			bNewLengthFinal = that.aContexts.length === that.iMaxLength;
			if (that.bLengthFinal !== bNewLengthFinal) {
				// some controls use this flag instead of calling isLengthFinal
				that.bLengthFinal = bNewLengthFinal;
				// bLengthFinal changed --> control needs to be informed even if no new data is
				// available
				bChanged = true;
			}

			if (bChanged) {
				that._fireChange({reason : sChangeReason});
				// no code below this line
			}
		}

		if (iThreshold !== undefined) {
			throw new Error("Unsupported operation: v4.ODataListBinding#getContexts, "
				+ "iThreshold parameter must not be set");
		}

		sChangeReason = this.sChangeReason || ChangeReason.Change;
		this.sChangeReason = undefined;

		iStart = iStart || 0;
		iLength = iLength || oModel.iSizeLimit;

		if (!sResolvedPath) {
			// oModel.resolve() called with relative path w/o context
			// -> e.g. nested listbinding but context not yet set
			return [];
		}

		if (!isRangeInContext(iStart, iLength)) {
			if (this.oCache) {
				sGroupId = this.sRefreshGroupId || this.getGroupId();
				this.sRefreshGroupId = undefined;
				oPromise = this.oCache.read(iStart, iLength, sGroupId, undefined, function () {
					bDataRequested = true;
					that.oModel.addedRequestToGroup(sGroupId, that.fireDataRequested.bind(that));
				});
			} else {
				oPromise = oContext.fetchValue(this.sPath);
			}
			oPromise.then(function (vResult) {
				createContexts(vResult || []);
				//fire dataReceived after change event fired in createContexts()
				if (bDataRequested) {
					that.fireDataReceived(); // no try catch needed: uncaught in promise
				}
			}, function (oError) {
				//cache shares promises for concurrent read
				if (bDataRequested) {
					if (oError.canceled) {
						that.fireDataReceived();
					} else {
						oModel.reportError("Failed to get contexts for "
								+ oModel.sServiceUrl + sResolvedPath.slice(1)
								+ " with start index " + iStart + " and length " + iLength,
							sClassName, oError);
						that.fireDataReceived({error : oError});
					}
				}
			})["catch"](function (oError) {
				jQuery.sap.log.error(oError.message, oError.stack, sClassName);
			});
		}
		this.iCurrentBegin = iStart;
		this.iCurrentEnd = iStart + iLength;
		return this.aContexts.slice(iStart, iStart + iLength);
	};

	/**
	 * Returns the contexts that were requested by a control last time. Does not trigger a
	 * data request. In the time between the {@link #event:dataRequested dataRequested} event and
	 * the {@link #event:dataReceived dataReceived} event, the resulting array contains
	 * <code>undefined</code> at those indexes where the data is not yet available.
	 *
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   The contexts
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getCurrentContexts
	 * @since 1.39.0
	 */
	// @override
	ODataListBinding.prototype.getCurrentContexts = function () {
		var aContexts = this.aContexts.slice(this.iCurrentBegin, this.iCurrentEnd),
			iLength = Math.min(this.iCurrentEnd, this.iMaxLength) - this.iCurrentBegin;

		while (aContexts.length < iLength) {
			aContexts.push(undefined);
		}
		return aContexts;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getDistinctValues
	 * @since 1.37.0
	 */
	// @override
	ODataListBinding.prototype.getDistinctValues = function () {
		throw new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues");
	};

	/**
	 * Returns the group ID of the binding that is used for read requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
	 */
	ODataListBinding.prototype.getGroupId = function() {
		return this.sGroupId || this.oModel.getGroupId();
	};

	/**
	 * Returns the number of entries in the list. As long as the client does not know the size on
	 * the server an estimated length is returned.
	 *
	 * @returns {number}
	 *   The number of entries in the list
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getLength
	 * @since 1.37.0
	 */
	 // @override
	ODataListBinding.prototype.getLength = function() {
		return this.bLengthFinal ? this.aContexts.length : this.aContexts.length + 10;
	};

	/**
	 * Returns the group ID of the binding that is used for update requests.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @private
	 */
	ODataListBinding.prototype.getUpdateGroupId = function() {
		return this.sUpdateGroupId || this.oModel.getUpdateGroupId();
	};

	/**
	 * Returns <code>true</code> if the binding has pending changes, that is updates via two-way
	 * binding that have not yet been sent to the server.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataListBinding.prototype.hasPendingChanges = function () {
		return this._hasPendingChanges(this.oCache ? "" : this.sPath);
	};

	/**
	 * Initializes the OData list binding. Fires a 'change' event in case the binding has a
	 * resolved path.
	 *
	 * @protected
	 * @see sap.ui.model.Binding#initialize
	 * @since 1.37.0
	 */
	// @override
	ODataListBinding.prototype.initialize = function () {
		if (!this.bRelative || this.oContext) {
			this._fireChange({reason : ChangeReason.Change});
		}
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
	ODataListBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: v4.ODataListBinding#isInitial");
	};

	/**
	 * Returns <code>true</code> if the length has been determined by the data returned from
	 * server. If the length is a client side estimation <code>false</code> is returned.
	 *
	 * @returns {boolean}
	 *   If <code>true</true> the length is determined by server side data
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#isLengthFinal
	 * @since 1.37.0
	 */
	// @override
	ODataListBinding.prototype.isLengthFinal = function() {
		return this.bLengthFinal;
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server using the given
	 * group ID and notifies the control that new data is available.
	 * Refresh is supported if the binding retrieves data with its own service request.
	 *
	 * Note: When calling refresh multiple times, the result of the request triggered by the last
	 * call determines the binding's data; it is <b>independent</b>
	 * of the order of calls to {@link sap.ui.model.odata.v4.ODataModel#submitBatch} with the given
	 * group ID.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; if not specified, the group ID for this binding is
	 *   used, see {@link sap.ui.model.odata.v4.ODataListBinding#constructor}.
	 *   Valid values are <code>undefined</code>, <code>'$auto'</code>, <code>'$direct'</code> or
	 *   application group IDs as specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @throws {Error}
	 *   If the given group ID is invalid or refresh on this binding is not supported.
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataListBinding.prototype.refresh = function (sGroupId) {
		var that = this;

		if (!this.oCache) {
			throw new Error("Refresh on this binding is not supported");
		}

		_ODataHelper.checkGroupId(sGroupId);

		this.sRefreshGroupId = sGroupId;
		if (this.mCacheByContext) {
			Object.keys(this.mCacheByContext).forEach(function (sCanonicalPath) {
				if (that.oCache !== that.mCacheByContext[sCanonicalPath]) {
					delete that.mCacheByContext[sCanonicalPath];
				}
			});
		}
		this.oCache.refresh();
		this.reset();
		this._fireRefresh({reason : ChangeReason.Refresh});
	};

	/**
	 * Requests the value for the given path and index; the value is requested from this binding's
	 * cache or from its context in case it has no cache.
	 *
	 * @param {string} [sPath]
	 *   Some relative path
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} [oListener]
	 *   A property binding which registers itself as listener at the cache
	 * @param {number} iIndex
	 *   Index corresponding to some current context of this binding
	 * @returns {SyncPromise}
	 *   A promise on the outcome of the cache's <code>read</code> call
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchValue = function (sPath, oListener, iIndex) {
		return this.oCache
			? this.oCache.read(iIndex, /*iLength*/1, undefined, sPath, undefined, oListener)
			: this.oContext.fetchValue(_Helper.buildPath(this.sPath, iIndex, sPath), oListener);
	};

	/**
	 * Resets the binding's contexts array and its members related to current contexts and length
	 * calculation.
	 *
	 * @private
	 */
	ODataListBinding.prototype.reset = function () {
		this.aContexts = [];
		// the range for getCurrentContexts
		this.iCurrentBegin = this.iCurrentEnd = 0;
		// upper boundary for server-side list length (based on observations so far)
		this.iMaxLength = Infinity;
		// this.bLengthFinal = this.aContexts.length === this.iMaxLength
		this.bLengthFinal = false;
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
	ODataListBinding.prototype.resume = function () {
		throw new Error("Unsupported operation: v4.ODataListBinding#resume");
	};

	/**
	 * Sets the context and resets the cached contexts of the list items.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context object
	 *
	 * @private
	 * @see sap.ui.model.Binding#setContext
	 */
	// @override
	ODataListBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			if (this.bRelative) {
				this.reset();
				if (this.oCache) {
					this.oCache.deregisterChange();
					this.oCache = undefined;
				}
				if (this.mQueryOptions && oContext) {
					createCacheProxy(this, oContext);
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
	 * Sort the entries represented by this list binding according to the given sorters.
	 * The sorters are stored at this list binding and they are used for each following data
	 * request.
	 *
	 * If there are pending changes an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch) to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * 'sort'.
	 *
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [vSorters]
	 *   The dynamic sorters to be used; they replace the dynamic sorters given in
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *   Static sorters, as defined in the '$orderby' binding parameter, are always executed after
	 *   the dynamic sorters.
	 * @returns {sap.ui.model.odata.v4.ODataListBinding}
	 *   <code>this</code> to facilitate method chaining
	 * @throws {Error}
	 *   If there are pending changes or if an unsupported operation mode is used (see
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList}).
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#sort
	 * @since 1.39.0
	 */
	ODataListBinding.prototype.sort = function (vSorters) {
		if (this.sOperationMode !== OperationMode.Server) {
			throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot sort due to pending changes");
		}
		// update aSorters to enable grouping
		this.aSorters = _ODataHelper.toArray(vSorters);

		// append orderby value from constructor to the orderby value given by sorters
		this.sOrderby = _ODataHelper.buildOrderbyOption(this.aSorters,
			this.mQueryOptions && this.mQueryOptions.$orderby);

		// replace cache and reset contexts and length properties
		if (this.bRelative) {
			this.mCacheByContext = undefined;
			if (!this.oContext) {
				return this; //postpone cache creation
			}
			createCacheProxy(this, this.oContext);
		} else {
			this.oCache = _Cache.create(this.oModel.oRequestor, this.sPath.slice(1),
				_ODataHelper.mergeQueryOptions(this.mQueryOptions, this.sOrderby));
		}
		this.reset();

		// store change reason for next change event
		this.sChangeReason = ChangeReason.Sort;
		this._fireRefresh({reason : ChangeReason.Sort});

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
	ODataListBinding.prototype.suspend = function () {
		throw new Error("Unsupported operation: v4.ODataListBinding#suspend");
	};

	/**
	 * Returns a string representation of this object including the binding path. If the binding is
	 * relative, the parent path is also given, separated by a '|'.
	 *
	 * @return {string} A string description of this binding
	 * @public
	 * @since 1.37.0
	 */
	ODataListBinding.prototype.toString = function () {
		return sClassName + ": " + (this.bRelative  ? this.oContext + "|" : "") + this.sPath;
	};

	/**
	 * Updates the value for the given property name inside the entity with the given relative path;
	 * the value is updated in this binding's cache or in its parent context in case it has no
	 * cache.
	 *
	 * @param {string} [sGroupId=getUpdateGroupId()]
	 *   The group ID to be used for this update call.
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated
	 * @param {string} sPath
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the cache's <code>update</code> call
	 *
	 * @private
	 */
	ODataListBinding.prototype.updateValue = function (sGroupId, sPropertyName, vValue, sEditUrl,
		sPath) {
		var oPromise;

		if (this.oCache) {
			sGroupId = sGroupId || this.getUpdateGroupId();
			oPromise = this.oCache.update(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
			this.oModel.addedRequestToGroup(sGroupId);
			return oPromise;
		}

		return this.oContext.updateValue(sGroupId, sPropertyName, vValue, sEditUrl,
			_Helper.buildPath(this.sPath, sPath));
	};

	return ODataListBinding;
}, /* bExport= */ true);
