/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Cache
sap.ui.define(["sap/ui/thirdparty/URI"], function (URI) {
	"use strict";

	/**
	 * Builds a partial query string from the parameter map
	 *
	 * @param {object} mQueryParameters
	 *   a map of key-value pairs representing the query string
	 * @returns {string}
	 *   returns an encoded query string starting with "?" and ending with "&" if parameters are
	 *   available so that we can simply append further parameters
	 */
	function buildQueryString(mQueryParameters) {
		var sQueryString = URI.buildQuery(mQueryParameters);

		return sQueryString ? "?" + sQueryString + "&" : "?";
	}

	/**
	 * Fills the given array range with the given value. If iEnd is greater than the array length,
	 * elements are appended to the end, in contrast to Array.fill.
	 *
	 * @param {any[]} aArray
	 *   the array
	 * @param {any} vValue
	 *   the value
	 * @param {int} iStart
	 *   the start index
	 * @param {int} iEnd
	 *   the end index (will not be filled)
	 */
	function fill(aArray, vValue, iStart, iEnd) {
		var i;

		for (i = iStart; i < iEnd; i++) {
			aArray[i] = vValue;
		}
	}

	/**
	 * Requests the elements in the given range and places them into the aElements list. While the
	 * request is running, all indexes in this range contain the Promise.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Cache} oCache
	 *   the cache
	 * @param {int} iStart
	 *   the index of the first element to request ($skip)
	 * @param {int} iEnd
	 *   the position of the last element to request ($skip + $top)
	 */
	function requestElements(oCache, iStart, iEnd) {
		var iExpectedLength = iEnd - iStart,
			oPromise;

		oPromise = oCache.oRequestor.request("GET", oCache.sUrl + "$skip=" + iStart + "&$top="
				+ iExpectedLength)
			.then(function (oResult) {
				var i, iResultLength = oResult.value.length;

				oCache.sContext = oResult["@odata.context"];
				if (iResultLength < iExpectedLength) {
					oCache.iMaxElements = iStart + iResultLength;
					oCache.aElements.splice(oCache.iMaxElements, iExpectedLength - iResultLength);
				}
				for (i = 0; i < iResultLength; i++) {
					oCache.aElements[iStart + i] = oResult.value[i];
				}
			})["catch"](function (oError) {
				fill(oCache.aElements, undefined, iStart, iEnd);
				throw oError;
			});

		fill(oCache.aElements, oPromise, iStart, iEnd);
	}

	/**
	 * Creates a cache that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   the requestor
	 * @param {string} sUrl
	 *   the URL to request from
	 * @param {object} [mQueryParameters]
	 *   a map of key-value pairs representing the query string
	 */
	function Cache(oRequestor, sUrl, mQueryParameters) {
		this.oRequestor = oRequestor;
		this.sUrl = sUrl + buildQueryString(mQueryParameters);
		this.sContext = undefined;  // the "@odata.context" from the responses
		this.iMaxElements = -1;		// the max. number of elements if known, -1 otherwise
		this.aElements = [];		// the available elements
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
	 *   "@odata.context" and the rows as an array in the property <code>value</code>). If an HTTP
	 *   request fails, the error from the _Requestor is returned and the requested range is reset
	 *   to undefined.
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	Cache.prototype.read = function (iIndex, iLength) {
		var i,
			iEnd = iIndex + iLength,
			iGapStart = -1,
			that = this;

		if (iIndex < 0) {
			throw new Error("Illegal index " + iIndex + ", must be >= 0");
		}
		if (iLength < 0) {
			throw new Error("Illegal length " + iLength + ", must be >= 0");
		}

		if (this.iMaxElements >= 0 && iEnd > this.iMaxElements) {
			iEnd = this.iMaxElements;
		}

		for (i = iIndex; i < iEnd; i++) {
			if (this.aElements[i] !== undefined) {
				if (iGapStart >= 0) {
					requestElements(this, iGapStart, i);
					iGapStart = -1;
				}
			} else if (iGapStart < 0) {
				iGapStart = i;
			}
		}
		if (iGapStart >= 0) {
			requestElements(this, iGapStart, iEnd);
		}

		return Promise.all(this.aElements.slice(iIndex, iEnd)).then(function () {
			return {
				"@odata.context" : that.sContext,
				value: that.aElements.slice(iIndex, iEnd)
			};
		});
	};

	return {
		/**
		 * Creates a cache that performs requests using the given requestor.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   the requestor
		 * @param {string} sUrl
		 *   the URL to request from; it must not contain a query string
		 * @param {object} mQueryParameters
		 *   a map of key-value pairs representing the query string; if the value contained in a
		 *   key-value pair is an array, the resulting query string repeats the key for each array
		 *   value. (e.g. <code>{foo: ["bar", "baz"]}</code> results in the query string
		 *   "foo=bar&foo=baz")
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   the cache
		 */
		create: function _create(oRequestor, sUrl, mQueryParameters) {
			return new Cache(oRequestor, sUrl, mQueryParameters);
		}
	};
}, /* bExport= */false);
