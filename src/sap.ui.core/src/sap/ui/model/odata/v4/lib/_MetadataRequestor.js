/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MetadataRequestor
sap.ui.define([
	"jquery.sap.global",
	"./_Helper",
	"./_V2MetadataConverter",
	"./_V4MetadataConverter"
], function (jQuery, _Helper, _V2MetadataConverter, _V4MetadataConverter) {
	"use strict";

	return {
		/**
		 * Creates a requestor for metadata documents.
		 * @param {object} mHeaders
		 *   A map of headers
		 * @param {string} sODataVersion
		 *   The version of the OData service. Supported values are "2.0" and "4.0".
		 * @param {object} [mQueryParams={}]
		 *   A map of query parameters as described in {@link _Helper.buildQuery}
		 * @returns {object}
		 *   A new MetadataRequestor object
		 */
		create : function (mHeaders, sODataVersion, mQueryParams) {
			var sQueryStr = _Helper.buildQuery(mQueryParams);

			return {
				/**
				 * Reads a metadata document from the given URL.
				 * @param {string} sUrl
				 *   The URL of a metadata document, it must not contain a query string or a
				 *   fragment part
				 * @param {boolean} [bAnnotations=false]
				 *   <code>true</code> if an additional annotation file is read, otherwise it is
				 *   expected to be a metadata document in the correct OData version
				 * @returns {Promise}
				 *   A promise fulfilled with the metadata as a JSON object, enriched with a
				 *   "$LastModified" property that contains the value of the response header
				 *   "Last-Modified" (or, as a fallback, "Date"); the "$LastModified" property is
				 *   missing if there is no such header
				 */
				read : function (sUrl, bAnnotations) {
					return new Promise(function (fnResolve, fnReject) {
						jQuery.ajax(bAnnotations ? sUrl : sUrl + sQueryStr, {
							method : "GET",
							headers : mHeaders
						})
						.then(function (oData, sTextStatus, jqXHR) {
							var oConverter = sODataVersion === "4.0" || bAnnotations
									? _V4MetadataConverter : _V2MetadataConverter,
								oJSON = oConverter.convertXMLMetadata(oData, sUrl),
								sLastModified = jqXHR.getResponseHeader("Last-Modified")
									|| jqXHR.getResponseHeader("Date");

							if (sLastModified) {
								oJSON.$LastModified = sLastModified;
							}
							fnResolve(oJSON);
						}, function (jqXHR, sTextStatus, sErrorMessage) {
							var oError = _Helper.createError(jqXHR);

							jQuery.sap.log.error("GET " + sUrl, oError.message,
								"sap.ui.model.odata.v4.lib._MetadataRequestor");
							fnReject(oError);
						});
					});
				}
			};
		}
	};
}, /* bExport= */false);
