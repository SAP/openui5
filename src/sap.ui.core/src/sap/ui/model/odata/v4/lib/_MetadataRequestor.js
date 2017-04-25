/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MetadataRequestor
sap.ui.define([
	"jquery.sap.global",
	"./_Helper",
	"./_MetadataConverter"
], function (jQuery, _Helper, _MetadataConverter) {
	"use strict";

	return {
		/**
		 * Creates a requestor for metadata documents.
		 * @param {object} mHeaders
		 *   A map of headers
		 * @param {object} [mQueryParams={}]
		 *   A map of query parameters as described in {@link _Helper.buildQuery}
		 * @returns {object}
		 *   A new MetadataRequestor object
		 */
		create : function (mHeaders, mQueryParams) {
			var sQueryStr = _Helper.buildQuery(mQueryParams);

			return {
				/**
				 * Reads a metadata document from the given URL.
				 * @param {string} sUrl
				 *   The URL of a metadata document, it must not contain a query string or a
				 *   fragment part
				 * @param {boolean} [bSkipQuery=false]
				 *   Indicates whether to omit the query string
				 * @returns {Promise}
				 *   A promise fulfilled with the metadata as a JSON object, enriched with a
				 *   "$LastModified" property that contains the value of the response header
				 *   "Last-Modified" (or, as a fallback, "Date"); the "$LastModified" property is
				 *   missing if there is no such header
				 */
				read : function (sUrl, bSkipQuery) {
					return new Promise(function (fnResolve, fnReject) {
						jQuery.ajax(bSkipQuery ? sUrl : sUrl + sQueryStr, {
							method : "GET",
							headers : mHeaders
						})
						.then(function (oData, sTextStatus, jqXHR) {
							var oJSON = _MetadataConverter.convertXMLMetadata(oData),
								sLastModified = jqXHR.getResponseHeader("Last-Modified")
									|| jqXHR.getResponseHeader("Date");

							if (sLastModified) {
								oJSON.$LastModified = sLastModified;
							}
							fnResolve(oJSON);
						}, function (jqXHR, sTextStatus, sErrorMessage) {
							fnReject(_Helper.createError(jqXHR));
						});
					});
				}
			};
		}
	};
}, /* bExport= */false);
