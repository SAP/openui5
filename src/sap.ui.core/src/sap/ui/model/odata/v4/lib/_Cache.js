/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Cache
sap.ui.define([], function() {
	"use strict";

	/**
	 * Creates a cache that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   the requestor
	 * @param {string} sRelativeUrl
	 *   the URL to request from (relative to the requestor's base URL). This URL must not start
	 *   with '/'.
	 */
	function Cache(oRequestor, sRelativeUrl) {
		this.oRequestor = oRequestor;
		this.sRelativeUrl = sRelativeUrl;
		this.oRequestPromise = null;
	}

	/**
	 * Returns a promise resolved with an OData object for a range of the requested data.
	 *
	 * @param {int} iIndex
	 *   the start index of the range; the first row has index 0
	 * @param {int} iLength
	 *   the length of the range
	 * @returns {Promise}
	 *   a Promise to be resolved with the requested range given as an OData response object (with
	 *   "@odata.context" and the rows as an array in the property <code>value</code>)
	 */
	Cache.prototype.read = function (iIndex, iLength) {
		if (iIndex < 0) {
			throw new Error("Illegal index " + iIndex + ", must be >= 0");
		}
		if (iLength < 0) {
			throw new Error("Illegal length " + iLength + ", must be >= 0");
		}
		if (!this.oRequestPromise) {
			this.oRequestPromise = this.oRequestor.request("GET", this.sRelativeUrl);
		}

		return this.oRequestPromise.then(function (oResult) {
			return  {
				"@odata.context": oResult["@odata.context"],
				value:  oResult.value.slice(iIndex, iIndex + iLength)
			};
		});
	};



	return {
		/**
		 * Creates a cache that performs requests using the given requestor.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   the requestor
		 * @param {string} sRelativeUrl
		 *   the URL to request from (relative to the requestor's base URL). This URL must not start
		 *   with '/'.
		 * @return {sap.ui.model.odata.v4.lib._Cache}
		 *   the cache
		 */
		create: function _create(oRequestor, sRelativeUrl) {
			return new Cache(oRequestor, sRelativeUrl);
		}
	};
}, /* bExport= */false);
