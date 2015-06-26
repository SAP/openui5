/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataListBinding
sap.ui.define([
	"jquery.sap.global", "sap/ui/model/ChangeReason", "sap/ui/model/ListBinding",
	"sap/ui/thirdparty/odatajs-4.0.0"
], function (jQuery, ChangeReason, ListBinding, ODataModel, Olingo) {
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
	 *
	 * @class List binding for an OData v4 model.
	 * @alias sap.ui.model.odata.v4.ODataListBinding
	 * @extends sap.ui.model.ListBinding
	 * @public
	 */
	var ODataListBinding = ListBinding.extend("sap.ui.model.odata.v4.ODataListBinding",
		/** @lends sap.ui.model.odata.v4.ODataListBinding.prototype */ {

		constructor : function (oModel, sPath, oContext, iIndex) {
			ListBinding.apply(this, arguments);
			this.oCache = undefined;
			this.aContexts = [];
			this.iIndex = iIndex;
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
		var oModel = this.getModel(),
			sPath = oModel.resolve(this.getPath(), this.getContext()),
			sUrl = oModel.sServiceUrl + sPath,
			that = this;

		iStart = iStart || 0;
		if (iLength === undefined) {
			iLength = oModel.iSizeLimit;
		}

		if (!this.oCache) {
			this.oCache = odatajs.cache.createDataCache({
				mechanism : "memory",
				name : sUrl,
				source : sUrl
			});
		}
		this.oCache.readRange(iStart, iLength).then(function (mResult) {
			var bChanged = false;

			mResult.value.forEach(function (oEntity, i) {
				var iIndex = iStart + i;

				if (that.aContexts[iIndex] === undefined) {
					bChanged = true;
					that.aContexts[iIndex] =
						oModel.getContext(sPath + "[" + iIndex + "];list=" + that.iIndex);
				}
			});
			if (bChanged) {
				that._fireChange({reason : ChangeReason.Change});
				// no code below this line
			}
		}).then(undefined, function (oError) { // no ["catch"] as this is a jQuery.Deferred object
			jQuery.sap.log.error("Failed to get contexts for " + sUrl + " with start index "
					+ iStart + " and length " + iLength, oError,
					"sap.ui.model.odata.v4.ODataListBinding");
		});
		return this.aContexts.slice(iStart, iStart + iLength);
	};

	return ODataListBinding;

}, /* bExport= */ true);
