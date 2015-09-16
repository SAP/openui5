/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataListBinding
sap.ui.define([
	"jquery.sap.global", "sap/ui/model/Binding", "sap/ui/model/ChangeReason",
	"sap/ui/model/ListBinding", "./_ODataHelper"
], function (jQuery, Binding, ChangeReason, ListBinding, Helper) {
	"use strict";

	/*global odatajs */

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataListBinding</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#bindList bindList} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   the OData v4 model
	 * @param {string} sPath
	 *   the path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 * @param {number} iIndex
	 *   the index of this list binding in the array of list bindings kept by the model, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList bindList}
	 * @param {object} [mParameters]
	 *   map of parameters
	 * @param {string} [mParameters.$expand]
	 *   the expand parameter used in the url to read data
	 *
	 * @class List binding for an OData v4 model.
	 * @alias sap.ui.model.odata.v4.ODataListBinding
	 * @extends sap.ui.model.ListBinding
	 * @public
	 */
	var ODataListBinding = ListBinding.extend("sap.ui.model.odata.v4.ODataListBinding",
		/** @lends sap.ui.model.odata.v4.ODataListBinding.prototype */ {

		constructor : function (oModel, sPath, oContext, iIndex, mParameters) {
			ListBinding.call(this, oModel, sPath, oContext, undefined, undefined, mParameters);
			this.oCache = undefined;
			this.aContexts = [];
			this.iIndex = iIndex;
			this.sExpand = this.mParameters && this.mParameters["$expand"];
		}
	});

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
	 *   the index where to start the retrieval of contexts
	 * @param {number} [iLength]
	 *   the number of contexts to retrieve beginning from the start index; defaults to the model's
	 *   size limit, see {@link sap.ui.model.Model#setSizeLimit}
	 * @return {sap.ui.model.Context[]}
	 *   the array of already created contexts with the first entry containing the context for
	 *   <code>iStart</code>
	 * @see sap.ui.model.Binding#attachChange
	 * @protected
	 */
	ODataListBinding.prototype.getContexts = function (iStart, iLength) {
		var oContext = this.getContext(),
			oModel = this.getModel(),
			sResolvedPath = oModel.resolve(this.getPath(), oContext),
			sUrl,
			that = this;

		function getBasePath(iIndex) {
			return sResolvedPath + "[" + iIndex + "];list=" + that.iIndex;
		}

		function getDependentPath(iIndex) {
			return sResolvedPath + "/" + iIndex;
		}

		/**
		 * Checks, whether the contexts exist for the requested range
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
		 * Uses fnGetPath to create the context path
		 * Fires "change" event if new contexts are created
		 * @param {function} fnGetPath function calculating base or dependent path
		 * @param {object} oResult resolved OData result
		 */
		function createContexts(fnGetPath, oResult) {
			var bChanged = false,
				i,
				n = iStart + oResult.value.length;

			for (i = iStart; i < n; i += 1) {
				if (that.aContexts[i] === undefined) {
					bChanged = true;
					that.aContexts[i] = oModel.getContext(fnGetPath(i));
				}
			}

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
			}  else { // absolute path
				if (!this.oCache) {
					sUrl = oModel.sServiceUrl + sResolvedPath;
					if (this.sExpand) {
						sUrl += "?$expand=" + jQuery.sap.encodeURL(this.sExpand);
					}
					this.oCache = odatajs.cache.createDataCache({
						mechanism : "memory",
						name : sUrl,
						source : sUrl
					});
				}
				this.oCache.readRange(iStart, iLength)
					.then(createContexts.bind(undefined, getBasePath), function (oError) {
						jQuery.sap.log.error("Failed to get contexts for "
							+ oModel.sServiceUrl + sResolvedPath + " with start index " + iStart
							+ " and length " + iLength, oError,
							"sap.ui.model.odata.v4.ODataListBinding");
					});
			}
		}
		return this.aContexts.slice(iStart, iStart + iLength);
	};

	/**
	 * Returns a promise to read the value for the given path in the list binding item with the
	 * given index.
	 *
	 * @param {number} iIndex
	 *   the item's index
	 * @param {string} sPath
	 *   the path to the property
	 * @param {boolean} [bAllowObjectAccess=false]
	 *   whether access to whole objects is allowed
	 * @return {Promise}
	 *   the promise which is resolved with the value
	 * @private
	 */
	ODataListBinding.prototype.readValue = function (iIndex, sPath, bAllowObjectAccess) {
		var that = this;

		return new Promise(function (fnResolve, fnReject) {
			function reject(oError) {
				var oModel = that.getModel(),
					sUrl = oModel.sServiceUrl + oModel.resolve(that.getPath(), that.getContext());
				jQuery.sap.log.error("Failed to read value with index " + iIndex + " for "
					+ sUrl + " and path " + sPath,
					oError, "sap.ui.model.odata.v4.ODataListBinding");
				fnReject(oError);
			}

			that.oCache.readRange(iIndex, 1).then(function (oData) {
				var oResult = oData.value[0];

				sPath.split("/").every(function (sSegment) {
					if (!oResult){
						jQuery.sap.log.warning("Invalid segment " + sSegment, "path: " + sPath,
							"sap.ui.model.odata.v4.ODataListBinding");
						return false;
					}
					oResult = oResult[sSegment];
					return true;
				});
				if (!bAllowObjectAccess && typeof oResult === "object") {
					reject(new Error("Accessed value is not primitive"));
					return;
				}
				fnResolve(oResult);
			}, reject);
		});
	};

	/**
	 * Sets the context and resets the cached contexts of the list items
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   the context object
	 * @protected
	 * @override
	 */
	ODataListBinding.prototype.setContext = function (oContext) {
		this.aContexts = [];
		Binding.prototype.setContext.call(this, oContext);
	};

	return ODataListBinding;

}, /* bExport= */ true);
