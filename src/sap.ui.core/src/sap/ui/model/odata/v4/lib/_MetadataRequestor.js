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
		 * Creates a requestor for meta data documents.
		 * @param {object} mHeaders
		 *   A map of headers
		 * @param {object} mQueryParams
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
				 * @returns {Promise}
				 *   A promise fulfilled with the metadata as a JSON object
				 */
				read : function (sUrl) {
					return new Promise(function (fnResolve, fnReject) {
						jQuery.ajax(sUrl + sQueryStr, {
							method : "GET",
							headers : mHeaders
						})
						.then(function (oData /*, sTextStatus, jqXHR */) {
							fnResolve(oData);
						}, function (jqXHR, sTextStatus, sErrorMessage) {
							fnReject(_Helper.createError(jqXHR));
						});
					}).then(function (oXMLMetadata) {
						return _MetadataConverter.convertXMLMetadata(oXMLMetadata);
					});
				}
			};
		}
	};
}, /* bExport= */false);
