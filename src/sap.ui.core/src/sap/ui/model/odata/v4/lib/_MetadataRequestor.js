/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MetadataRequestor
sap.ui.define([
	"./_Helper",
	"./_V2MetadataConverter",
	"./_V4MetadataConverter",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function (_Helper, _V2MetadataConverter, _V4MetadataConverter, Log, jQuery) {
	"use strict";

	return {
		/**
		 * Creates a requestor for metadata documents.
		 * @param {object} mHeaders
		 *   A map of headers
		 * @param {string} sODataVersion
		 *   The version of the OData service. Supported values are "2.0" and "4.0".
		 * @param {object} [mQueryParams={}]
		 *   A map of query parameters as described in
		 *   {@link sap.ui.model.odata.v4.lib._Helper.buildQuery}
		 * @returns {object}
		 *   A new MetadataRequestor object
		 */
		create : function (mHeaders, sODataVersion, mQueryParams) {
			var mUrl2Promise = {},
				sQueryStr = _Helper.buildQuery(mQueryParams);

			return {
				/**
				 * Reads a metadata document from the given URL.
				 * @param {string} sUrl
				 *   The URL of a metadata document, it must not contain a query string or a
				 *   fragment part
				 * @param {boolean} [bAnnotations=false]
				 *   <code>true</code> if an additional annotation file is read, otherwise it is
				 *   expected to be a metadata document in the correct OData version
				 * @param {boolean} [bPrefetch=false]
				 *   Whether to just read the metadata document, but not yet convert it from XML to
				 *   JSON. For any given URL, this is useful in an optional early call that precedes
				 *   a normal call without this flag.
				 * @returns {Promise}
				 *   A promise fulfilled with the metadata as a JSON object, enriched with a
				 *   <code>$Date</code>, <code>$ETag</code> or <code>$LastModified</code> property
				 *   that contains the value of the response header "Date", "ETag" or
				 *   "Last-Modified" respectively; these additional properties are missing if there
				 *   is no such header. In case of <code>bPrefetch</code>, the JSON object is
				 *   empty except for <code>$XML</code> (which contains the unconverted metadata as
				 *   XML) and the additional properties described before.
				 * @throws {Error}
				 *   If <code>bPrefetch</code> is set in two consecutive calls for the same URL
				 */
				read : function (sUrl, bAnnotations, bPrefetch) {
					var oPromise;

					function convertXMLMetadata(oJSON) {
						var Converter = sODataVersion === "4.0" || bAnnotations
								? _V4MetadataConverter
								: _V2MetadataConverter,
							oData = oJSON.$XML;

						delete oJSON.$XML; // be nice to the garbage collector
						return Object.assign(new Converter().convertXMLMetadata(oData, sUrl),
							oJSON);
					}

					if (sUrl in mUrl2Promise) {
						if (bPrefetch) {
							throw new Error("Must not prefetch twice: " + sUrl);
						}
						oPromise = mUrl2Promise[sUrl].then(convertXMLMetadata);
						delete mUrl2Promise[sUrl];
					} else {
						oPromise = new Promise(function (fnResolve, fnReject) {
							jQuery.ajax(bAnnotations ? sUrl : sUrl + sQueryStr, {
								method : "GET",
								headers : mHeaders
							}).then(function (oData, sTextStatus, jqXHR) {
								var sDate = jqXHR.getResponseHeader("Date"),
									sETag = jqXHR.getResponseHeader("ETag"),
									oJSON = {$XML : oData},
									sLastModified = jqXHR.getResponseHeader("Last-Modified");

								if (sDate) {
									oJSON.$Date = sDate;
								}
								if (sETag) {
									oJSON.$ETag = sETag;
								}
								if (sLastModified) {
									oJSON.$LastModified = sLastModified;
								}
								fnResolve(oJSON);
							}, function (jqXHR, sTextStatus, sErrorMessage) {
								var oError = _Helper.createError(jqXHR, "Could not load metadata");

								Log.error("GET " + sUrl, oError.message,
									"sap.ui.model.odata.v4.lib._MetadataRequestor");
								fnReject(oError);
							});
						});
						if (bPrefetch) {
							mUrl2Promise[sUrl] = oPromise;
						} else {
							oPromise = oPromise.then(convertXMLMetadata);
						}
					}
					return oPromise;
				}
			};
		}
	};
}, /* bExport= */false);