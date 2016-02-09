/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataListBinding
sap.ui.define([
	"jquery.sap.global", "sap/ui/model/Binding", "sap/ui/model/ChangeReason",
	"sap/ui/model/ListBinding", "./_ODataHelper", "./lib/_Cache"
], function (jQuery, Binding, ChangeReason, ListBinding, Helper, Cache) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataListBinding";

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataListBinding</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#bindList bindList} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData v4 model
	 * @param {string} sPath
	 *   The path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {number} iIndex
	 *   The index of this list binding in the array of root bindings kept by the model, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList bindList}
	 * @param {object} [mParameters]
	 *   Map of OData query options as specified in "OData Version 4.0 Part 2: URL Conventions".
	 *   The following query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $expand and $select "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: Query options may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 * @throws {Error} When disallowed, OData query options are provided
	 * @class List binding for an OData v4 model.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataListBinding
	 * @extends sap.ui.model.ListBinding
	 * @public
	 */
	var ODataListBinding = ListBinding.extend("sap.ui.model.odata.v4.ODataListBinding", {
			constructor : function (oModel, sPath, oContext, iIndex, mParameters) {
				ListBinding.call(this, oModel, sPath, oContext);
				this.oCache = undefined;
				if (!this.isRelative()) {
					this.oCache = Cache.create(oModel.oRequestor, sPath.slice(1),
						Helper.buildQueryOptions(oModel.mUriParameters, mParameters,
							["$expand", "$select"]));
				} else if (mParameters) {
					throw new Error("Bindings with a relative path do not support parameters");
				}
				this.aContexts = [];
				// upper boundary for server-side list length (based on observations so far)
				this.iMaxLength = Infinity;
				this.iIndex = iIndex;
				// this.bLengthFinal = this.aContexts.length === this.iMaxLength
				this.bLengthFinal = false;
			}
		});

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * Registered event handlers are called without parameters.
	 *
	 * @name sap.ui.model.odata.v4.ODataListBinding#dataRequested
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @see sap.ui.base.Event
	 * @public
	 */

	/**
	 * The 'dataReceived' event is fired after the back end data has been processed and the
	 * registered 'change' event listeners have been notified.
	 * The 'dataReceived' event is also fired if a back end request failed.
	 *
	 * @name sap.ui.model.odata.v4.ODataListBinding#dataReceived
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {Error} [oEvent.getParameters.error] The error object if a back end request failed.
	 *   If there are multiple failed back end requests, the error of the first one is provided.
	 *   If all back end requests succeed, the event has no parameters.
	 * @see sap.ui.base.Event
	 * @public
	 */

	/**
	 * Always fires a change event on this list binding.
	 */
	ODataListBinding.prototype.checkUpdate = function () {
		this._fireChange({reason : ChangeReason.Change});
	};

	/**
	 * Returns already created binding contexts for all entities in this list binding for the range
	 * determined by the given start index <code>iStart</code> and <code>iLength</code>.
	 * If at least one of the entities in the given range has not yet been loaded, fires a change
	 * event on this list binding once these entities have been loaded <em>asynchronously</em>.
	 * A further call to this method in the change event handler with the same index range then
	 * yields the updated array of contexts.
	 *
	 * @param {number} [iStart=0]
	 *   The index where to start the retrieval of contexts
	 * @param {number} [iLength]
	 *   The number of contexts to retrieve beginning from the start index; defaults to the model's
	 *   size limit, see {@link sap.ui.model.Model#setSizeLimit}
	 * @return {sap.ui.model.Context[]}
	 *   The array of already created contexts with the first entry containing the context for
	 *   <code>iStart</code>
	 * @see sap.ui.model.Binding#attachChange
	 * @protected
	 */
	ODataListBinding.prototype.getContexts = function (iStart, iLength) {
		var oContext = this.getContext(),
			bDataRequested = false,
			oModel = this.getModel(),
			sResolvedPath = oModel.resolve(this.getPath(), oContext),
			that = this;

		function getBasePath(iIndex) {
			return sResolvedPath + "[" + iIndex + "];root=" + that.iIndex;
		}

		function getDependentPath(iIndex) {
			return sResolvedPath + "/" + iIndex;
		}

		/**
		 * Checks, whether the contexts exist for the requested range.
		 * @return {boolean}
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
		 * Fires "change" event if new contexts are created.
		 * @param {function} fnGetPath Function calculating base or dependent path
		 * @param {object} oResult Resolved OData result
		 */
		function createContexts(fnGetPath, oResult) {
			var bChanged = false,
				i,
				iResultLength = oResult.value.length,
				n = iStart + iResultLength;

			for (i = iStart; i < n; i += 1) {
				if (that.aContexts[i] === undefined) {
					bChanged = true;
					that.aContexts[i] = oModel.getContext(fnGetPath(i));
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
			// some controls use this flag instead of calling isLengthFinal
			that.bLengthFinal = that.aContexts.length === that.iMaxLength;

			if (bChanged) {
				that._fireChange({reason : ChangeReason.Change});
				// no code below this line
			}
		}

		iStart = iStart || 0;
		iLength = iLength || oModel.iSizeLimit;

		if (!sResolvedPath) {
			// oModel.resolve() called with relative path w/o context
			// -> e.g. nested listbinding but context not yet set
			return [];
		}

		if (!isRangeInContext(iStart, iLength)) {
			if (oContext) { // nested list binding
				oModel.read(sResolvedPath, true)
					.then(createContexts.bind(undefined, getDependentPath));
			} else { // absolute path
				this.oCache.read(iStart, iLength, function () {
						bDataRequested = true;
						that.fireDataRequested();
					}).then(createContexts.bind(undefined, getBasePath)).then(function () {
						//fire dataReceived after change event fired in createContexts()
						if (bDataRequested) {
							that.fireDataReceived(); // no try catch needed: uncaught in promise
						}
					}, function (oError) {
						if (!oError.canceled) {
							jQuery.sap.log.error("Failed to get contexts for "
								+ oModel.sServiceUrl + sResolvedPath.slice(1)
								+ " with start index " + iStart + " and length " + iLength, oError,
								sClassName);
						}
						//cache shares promises for concurrent read
						if (bDataRequested) {
							// no try catch needed: uncaught in promise
							that.fireDataReceived({error : oError});
						}
					});
			}
		}
		return this.aContexts.slice(iStart, iStart + iLength);
	};

	/**
	 * Returns the number of entries in the list. As long as the client does not know the size on
	 * the server an estimated length is returned.
	 *
	 * @return {number}
	 *   The number of entries in the list
	 * @see sap.ui.model.ListBinding#getLength
	 * @public
	 */
	ODataListBinding.prototype.getLength = function() {
		return this.bLengthFinal ? this.aContexts.length : this.aContexts.length + 10;
	};

	/**
	 * Returns <code>true</code> if the length has been determined by the data returned from
	 * server. If the length is a client side estimation <code>false</code> is returned.
	 *
	 * @return {boolean}
	 *   If <code>true</true> the length is determined by server side data
	 * @see sap.ui.model.ListBinding#isLengthFinal
	 * @public
	 */
	ODataListBinding.prototype.isLengthFinal = function() {
		return this.bLengthFinal;
	};

	/**
	 * Returns a promise to read the value for the given path in the list binding item with the
	 * given index.
	 *
	 * @param {string} sPath
	 *   The path to the property
	 * @param {boolean} bAllowObjectAccess
	 *   Whether access to whole objects is allowed
	 * @param {number} iIndex
	 *   The item's index
	 * @return {Promise}
	 *   The promise which is resolved with the value, e.g. <code>"foo"</code> for simple
	 *   properties, <code>[...]</code> for collections and <code>{"foo" : "bar", ...}</code> for
	 *   objects
	 * @private
	 */
	ODataListBinding.prototype.readValue = function (sPath, bAllowObjectAccess, iIndex) {
		var that = this;

		return new Promise(function (fnResolve, fnReject) {
			function reject(oError) {
				jQuery.sap.log.error("Failed to read value with index " + iIndex + " for "
					+ that.oCache + " and path " + sPath,
					oError, sClassName);
				fnReject(oError);
			}

			that.oCache.read(iIndex, 1).then(function (oData) {
				var oResult = oData.value[0];

				if (sPath) {
					sPath.split("/").every(function (sSegment) {
						if (!oResult){
							jQuery.sap.log.warning("Invalid segment " + sSegment, "path: " + sPath,
								sClassName);
							return false;
						}
						oResult = oResult[sSegment];
						return true;
					});
				}
				if (!bAllowObjectAccess && oResult && typeof oResult === "object") {
					reject(new Error("Accessed value is not primitive"));
					return;
				}
				fnResolve(oResult);
			}, reject);
		});
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
	ODataListBinding.prototype.refresh = function (bForceUpdate) {
		if (!bForceUpdate) {
			throw new Error("Falsy values for bForceUpdate are not supported");
		}
		if (!this.oCache) {
			throw new Error("Refresh on this binding is not supported");
		}
		this.oCache.refresh();
		this.aContexts = [];
		this.iMaxLength = Infinity;
		this.bLengthFinal = false;
		this._fireRefresh({reason : ChangeReason.Refresh});
	};

	/**
	 * Sets the context and resets the cached contexts of the list items.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context object
	 * @protected
	 * @override
	 */
	ODataListBinding.prototype.setContext = function (oContext) {
		this.aContexts = [];
		Binding.prototype.setContext.call(this, oContext);
	};

	return ODataListBinding;

}, /* bExport= */ true);
