/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Cache
sap.ui.define(["./_Helper"], function (Helper) {
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
		var sQueryString = Helper.buildQuery(mQueryParameters);

		return sQueryString ? sQueryString + "&" : "?";
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
	 * A refresh cancels processing of all pending requests by throwing an error that has a
	 * property <code>canceled</code> which is set to <code>true</code>.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Cache} oCache
	 *   the cache
	 * @param {int} iStart
	 *   the index of the first element to request ($skip)
	 * @param {int} iEnd
	 *   the position of the last element to request ($skip + $top)
	 */
	function requestElements(oCache, iStart, iEnd) {
		var aElements = oCache.aElements,
			iExpectedLength = iEnd - iStart,
			oPromise,
			sUrl = oCache.sUrl + "$skip=" + iStart + "&$top=" + iExpectedLength;

		oPromise = oCache.oRequestor.request("GET", sUrl)
			.then(function (oResult) {
				var i, iResultLength = oResult.value.length, oError;

				if (aElements !== oCache.aElements) {
					oError = new Error("Refresh canceled processing of pending request: " + sUrl);
					oError.canceled = true;
					throw oError;
				}
				oCache.sContext = oResult["@odata.context"];
				if (iResultLength < iExpectedLength) {
					oCache.iMaxElements = iStart + iResultLength;
					oCache.aElements.splice(oCache.iMaxElements, iExpectedLength - iResultLength);
				}
				for (i = 0; i < iResultLength; i++) {
					oCache.aElements[iStart + i] = oResult.value[i];
				}
			})["catch"](function (oError) {
				if (aElements === oCache.aElements) {
					fill(oCache.aElements, undefined, iStart, iEnd);
				}
				throw oError;
			});

		fill(oCache.aElements, oPromise, iStart, iEnd);
	}

	/**
	 * Creates a cache for a collection of entities that performs requests using the given
	 * requestor.
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
		this.iMaxElements = -1;     // the max. number of elements if known, -1 otherwise
		this.aElements = [];        // the available elements
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
	 *   A refresh cancels processing of all pending promises by throwing an error that has a
	 *   property <code>canceled</code> which is set to <code>true</code>.
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

	/**
	 * Clears cache and cancels processing of all pending read requests.
	 */
	Cache.prototype.refresh = function () {
		this.sContext = undefined;
		this.iMaxElements = -1;
		this.aElements = [];
	};

	/**
	 * Creates a cache for a single entity that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   the requestor
	 * @param {string} sUrl
	 *   the URL to request from
	 * @param {object} [mQueryParameters]
	 *   a map of key-value pairs representing the query string
	 */
	function SingleCache(oRequestor, sUrl, mQueryParameters) {
		this.oRequestor = oRequestor;
		this.sUrl = sUrl + Helper.buildQuery(mQueryParameters);
		this.oPromise = null;
	}

	/**
	 * Returns a promise resolved with an OData object for the requested data.
	 *
	 * @returns {Promise}
	 *   a Promise to be resolved with the element.
	 *   A refresh cancels processing a pending promise by throwing an error that has a
	 *   property <code>canceled</code> which is set to <code>true</code>.
	 */
	SingleCache.prototype.read = function () {
		var that = this,
			oError,
			oPromise,
			sUrl = this.sUrl;

		if (!this.oPromise) {
			oPromise = this.oRequestor.request("GET", sUrl).then(function (oResult) {
				if (that.oPromise !== oPromise) {
					oError = new Error("Refresh canceled processing of pending request: " + sUrl);
					oError.canceled = true;
					throw oError;
				}
				return oResult;
			});
			this.oPromise = oPromise;
		}
		return this.oPromise;
	};

	/**
	 * Clears cache and cancels processing of a pending read request.
	 */
	SingleCache.prototype.refresh = function () {
		this.oPromise = undefined;
	};

	return {
		/**
		 * Creates a cache for a collection of entities that performs requests using the given
		 * requestor.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   the requestor
		 * @param {string} sUrl
		 *   the URL to request from; it must contain the path to the OData service, it must not
		 *   contain a query string<br>
		 *   Example: /V4/Northwind/Northwind.svc/Products
		 * @param {object} mQueryParameters
		 *   a map of key-value pairs representing the query string, the value in this pair has to
		 *   be a string or an array of strings; if it is an array, the resulting query string
		 *   repeats the key for each array value.
		 *   Examples:
		 *   {foo: "bar", "bar": "baz"} results in the query string "foo=bar&bar=baz"
		 *   {foo: ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   the cache
		 */
		create: function _create(oRequestor, sUrl, mQueryParameters) {
			return new Cache(oRequestor, sUrl, mQueryParameters);
		},

		/**
		 * Creates a cache for a single entity that performs requests using the given requestor.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   the requestor
		 * @param {string} sUrl
		 *   the URL to request from; it must contain the path to the OData service, it must not
		 *   contain a query string<br>
		 *   Example: /V4/Northwind/Northwind.svc/Products(ProductID=1)
		 * @param {object} mQueryParameters
		 *   a map of key-value pairs representing the query string, the value in this pair has to
		 *   be a string or an array of strings; if it is an array, the resulting query string
		 *   repeats the key for each array value.
		 *   Examples:
		 *   {foo: "bar", "bar": "baz"} results in the query string "foo=bar&bar=baz"
		 *   {foo: ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   the cache
		 */
		createSingle: function _createSingle(oRequestor, sUrl, mQueryParameters) {
			return new SingleCache(oRequestor, sUrl, mQueryParameters);
		}
	};
}, /* bExport= */false);
