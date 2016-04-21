/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"./_Context",
	"./_ODataHelper",
	"./lib/_Cache",
	"./lib/_Helper"
], function (jQuery, Binding, ChangeReason, ContextBinding, _Context, _ODataHelper, _Cache,
		_Helper) {
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
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameters "$$groupId"
	 *   and "$$updateGroupId".
	 *   Note: Binding parameters may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $expand, $filter, $orderby and $select "5.1 System Query Options"; OData V4 only
	 *   allows $filter and $orderby inside resource paths that identify a collection. In our case
	 *   here, this means you can only use them inside $expand.
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
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
	 *   <code>/TEAMS(Team_Id='TEAM_01')/tea_busi.AcChangeManagerOfTeam(...)</code>. This can be
	 *   used if the exact instance is known in advance. If you use a relative binding instead, the
	 *   operation path is a concatenation of the parent context's canonical path and the deferred
	 *   binding's path.
	 *
	 *   <b>Example</b>: You have a table with a list binding to <code>/TEAMS</code>. In each row
	 *   you have a button to change the team's manager, with the relative binding
	 *   <code>tea_busi.AcChangeManagerOfTeam(...)</code>. Then the parent context for such a button
	 *   refers to an instance of TEAMS, so its canonical path is
	 *   <code>/TEAMS(ID='<i>TeamID</i>')</code> and the resulting path for the action is
	 *   <code>/TEAMS(ID='<i>TeamID</i>')/tea_busi.AcChangeManagerOfTeam</code>.
	 *
	 *   This also works if the relative path of the deferred operation binding starts with a
	 *   navigation property. Then this navigation property will be part of the operation's
	 *   resource path, which is still valid.
	 *
	 *   A deferred operation binding is not allowed to have another deferred operation binding as
	 *   parent.
	 *
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @version ${version}
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				var oBindingParameters,
					iPos = sPath.indexOf("(...)"),
					bDeferred = iPos >= 0;

				ContextBinding.call(this, oModel, sPath, oContext);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				this.oCache = undefined;
				this.sGroupId = undefined;
				this.oOperation = undefined;
				this.mQueryOptions = undefined;
				this.sRefreshGroupId = undefined;
				this.sUpdateGroupId = undefined;

				if (!this.bRelative || bDeferred) {
					this.mQueryOptions = _ODataHelper.buildQueryOptions(oModel.mUriParameters,
						mParameters, ["$expand", "$filter", "$orderby", "$select"]);
					oBindingParameters = _ODataHelper.buildBindingParameters(mParameters);
					this.sGroupId = oBindingParameters.$$groupId;
					this.sUpdateGroupId = oBindingParameters.$$updateGroupId;
					if (bDeferred) {
						this.oOperation = {
							bAction : undefined,
							oMetadataPromise : undefined,
							mParameters : {}
						};
						if (iPos !== sPath.length - 5) {
							throw new Error(
								"The path must not continue after a deferred operation: " + sPath);
						}
					} else {
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

	/**
	 * Requests the metadata for this operation binding. Caches the result.
	 *
	 * @returns {Promise}
	 *   A promise that is resolved with the operation metadata.
	 *
	 * @private
	 */
	ODataContextBinding.prototype._requestOperationMetadata = function () {
		var oMetaModel = this.oModel.getMetaModel(),
			sOperationName,
			iPos;

		if (!this.oOperation.oMetadataPromise) {
			// take the last segment and remove "(...)" at the end
			// We do not need special code if there is no '/', because iPos + 1 === 0 then.
			iPos = this.sPath.lastIndexOf("/");
			sOperationName = this.sPath.slice(iPos + 1, -5);
			this.oOperation.oMetadataPromise = oMetaModel.requestObject("/" + sOperationName)
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
						return oMetaModel.requestObject("/" + vMetadata.$Action);
					}
					if (vMetadata.$kind === "FunctionImport") {
						return oMetaModel.requestObject("/" + vMetadata.$Function);
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
	 *   Valid values are <code>undefined</code>, <code>'$auto'</code>, <code>'$direct'</code> or
	 *   application group IDs as specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
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
		 * @returns {Promise} The request promise
		 */
		function createCacheAndRequest(oOperationMetadata, sPathPrefix) {
			var aOperationParameters,
				aParameters,
				sPath = (sPathPrefix + that.sPath).slice(1),
				oPromise;

			sGroupId = sGroupId || that.getGroupId();
			that.oOperation.bAction = oOperationMetadata.$kind === "Action";
			if (that.oOperation.bAction) {
				// the action may reuse the cache because the resource path never changes
				if (!that.oCache) {
					that.oCache = _Cache.createSingle(that.oModel.oRequestor, sPath.slice(0, -5),
						that.mQueryOptions, false, true);
				}
				oPromise = that.oCache.post(sGroupId, that.oOperation.mParameters);
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
							aParameters.push(sName + "=" + _Helper.formatLiteral(
									that.oOperation.mParameters[sName], oParameter.$Type));
						}
					});
				}
				that.oCache = _Cache.createSingle(that.oModel.oRequestor,
					sPath.replace("...", aParameters.join(',')), that.mQueryOptions);
				oPromise = that.oCache.read(sGroupId);
			}
			that.oModel.addedRequestToGroup(sGroupId);
			return oPromise;
		}

		_ODataHelper.checkGroupId(sGroupId);
		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (this.bRelative) {
			if (!this.oContext) {
				throw new Error("Unresolved binding: " + this.sPath);
			}
			if (this.oContext.getPath().indexOf("(...)") >= 0) {
				throw new Error("Nested deferred operation bindings not supported: "
					+ this.oModel.resolve(this.sPath, this.oContext));
			}
		}
		return this._requestOperationMetadata().then(function (oOperationMetaData) {
			if (that.bRelative) {
				return that.oModel.requestCanonicalPath(that.getContext()).then(function (sPath) {
					return createCacheAndRequest(oOperationMetaData, sPath + "/");
				});
			}
			return createCacheAndRequest(oOperationMetaData, "");
		}).then(function (oResult) {
			that._fireChange({reason : ChangeReason.Change});
			// do not return anything
		})["catch"](function (oError) {
			that.oModel.reportError("Failed to execute " + that.sPath, sClassName, oError);
			throw oError;
		});
	};

	/**
	 * Returns the group ID of the binding that is used for read requests.
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
	 * Returns the group ID of the binding that is used for update requests.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @private
	 */
	ODataContextBinding.prototype.getUpdateGroupId = function() {
		return this.sUpdateGroupId || this.oModel.getUpdateGroupId();
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
	 * Refreshes the binding. Prompts the model to retrieve data from the server using the given
	 * group ID and notifies the control that new data is available.
	 * Refresh is supported for absolute bindings.
	 *
	 * Note: When calling refresh multiple times, the result of the request triggered by the last
	 * call determines the binding's data; it is <b>independent</b>
	 * of the order of calls to {@link sap.ui.model.odata.v4.ODataModel#submitBatch} with the given
	 * group ID.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; if not specified, the group ID for this binding is
	 *   used, see {@link sap.ui.model.odata.v4.ODataContextBinding#constructor}.
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
	ODataContextBinding.prototype.refresh = function (sGroupId) {
		if (this.oCache) {
			if (!this.oOperation || !this.oOperation.bAction) {
				_ODataHelper.checkGroupId(sGroupId);
				this.sRefreshGroupId = sGroupId;
				this.oCache.refresh();
				this._fireChange({reason : ChangeReason.Refresh});
			}
		} else if (!this.oOperation) {
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
			sGroupId = this.sRefreshGroupId || this.getGroupId();
			this.sRefreshGroupId = undefined;
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
						that.oModel.reportError("Failed to read path " + that.sPath, sClassName,
							oError);
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
		if (this.oContext !== oContext) {
			if (this.bRelative && (this.oElementContext || oContext)) {
				// fire "change" iff. this.oElementContext changes
				// do not call Model#resolve in vain
				this.oElementContext = oContext
					? _Context.create(this.oModel, this, this.oModel.resolve(this.sPath, oContext))
					: null;
				// the binding parameter for a deferred context binding might have changed
				this.oCache = undefined;
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
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}).
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.setParameter = function (sParameterName, vValue) {
		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		this.oOperation.mParameters[sParameterName] = vValue;
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
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the cache's <code>update</code> call
	 *
	 * @private
	 */
	ODataContextBinding.prototype.updateValue = function (sGroupId, sPropertyName, vValue, sEditUrl,
		sPath) {
		var oPromise;

		if (this.oCache) {
			sGroupId = sGroupId || this.getUpdateGroupId();
			oPromise = this.oCache.update(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
			this.oModel.addedRequestToGroup(sGroupId);
			return oPromise;
		}

		return this.oContext.updateValue(sGroupId, sPropertyName, vValue, sEditUrl,
			this.sPath + (sPath ? "/" + sPath : ""));
	};

	return ODataContextBinding;
}, /* bExport= */ true);
