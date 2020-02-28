/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Batch
sap.ui.define([
	"./_Helper",
	"sap/base/strings/escapeRegExp"
], function (_Helper, escapeRegExp) {
	"use strict";

	var mAllowedChangeSetMethods = {"POST" : true, "PUT" : true, "PATCH" : true, "DELETE" : true},
		oBatch,
		rContentIdReference = /\$\d+/,
		rHeaderParameter = /(\S*?)=(?:"(.+)"|(\S+))/;

	/**
	 * Create regular expression based on boundary parameter of the given "multipart/mixed"
	 * Content-Type header value.
	 * @param {string} sContentType
	 *   Value of the "multipart/mixed" Content-Type header value
	 * @returns {object} Regular expression which will be used to parse the $batch request body
	 * @throws {Error} If the specified Content-Type header value does not represent
	 *   "multipart/mixed" MIME type with "boundary" parameter.
	 */
	function getBoundaryRegExp(sContentType) {
		var sBatchBoundary = getHeaderParameterValue(sContentType, "boundary"),
			iMultiPartTypeIndex = sContentType.trim().indexOf("multipart/mixed");

		if (iMultiPartTypeIndex !== 0 || !sBatchBoundary) {
			throw new Error('Invalid $batch response header "Content-Type": ' + sContentType);
		}

		// escape RegExp-related characters
		sBatchBoundary = escapeRegExp(sBatchBoundary);
		return new RegExp('--' + sBatchBoundary + '(?:[ \t]*\r\n|--)');
	}

	/**
	 * Extracts value of the parameter with the specified <code>sParameterName</code>
	 * from the specified <code>sHeaderValue</code>.
	 *
	 * @param {string} sHeaderValue
	 *   HTTP header value e.g. "application/json;charset=utf-8"
	 * @param {string} sParameterName
	 *   Name of HTTP header parameter e.g. "charset"
	 * @returns {string} The HTTP header parameter value
	 */
	function getHeaderParameterValue(sHeaderValue, sParameterName) {
		var iParamIndex,
			aHeaderParts = sHeaderValue.split(";"),
			aMatches;

		sParameterName = sParameterName.toLowerCase();
		for (iParamIndex = 1; iParamIndex < aHeaderParts.length; iParamIndex += 1) {
			// remove possible quotes via reg exp
			// RFC7231: parameter = token "=" ( token / quoted-string )
			aMatches = rHeaderParameter.exec(aHeaderParts[iParamIndex]);
			if (aMatches[1].toLowerCase() === sParameterName) {
				return aMatches[2] || aMatches[3];
			}
		}
	}

	/**
	 * Extracts value of Content-Type header from the specified
	 * <code>sMimeTypeHeaders</code> if it is "multipart/mixed".
	 *
	 * @param {string} sMimeTypeHeaders
	 *   Section of MIME part representing HTTP headers
	 * @returns {string} Content-Type header value e.g.
	 *   "multipart/mixed; boundary=batch_id-0123456789012-345" or undefined
	 */
	function getChangeSetContentType(sMimeTypeHeaders) {
		var sContentType = getHeaderValue(sMimeTypeHeaders, "content-type");
		return sContentType.indexOf("multipart/mixed;") === 0 ? sContentType : undefined;
	}

	/**
	 * Returns index of the response inside of a change set by parsing the Content-ID header value
	 * available as a part of the specified change set response <code>sMimeTypeHeaders</code>.
	 * The function expects Content-ID header value to be specified in <code>i.j</code> notation,
	 * where <code>i</code> represents the index of the response inside of the change set.
	 *
	 * @param {string} sMimeTypeHeaders
	 *   Section of MIME part representing MIME HTTP headers of the change set response
	 * @returns {number} Zero-based index of the response inside of the change set
	 * @throws {Error} If there is no Content-ID header in the specified
	 *   <code>sMimeTypeHeaders</code> or the available Content-ID header value is not a number.
	 */
	function getChangeSetResponseIndex(sMimeTypeHeaders) {
		var sContentID = getHeaderValue(sMimeTypeHeaders, "content-id"),
			iResponseIndex;

		if (!sContentID) {
			throw new Error("Content-ID MIME header missing for the change set response.");
		}

		iResponseIndex = parseInt(sContentID);
		if (isNaN(iResponseIndex)) {
			throw new Error("Invalid Content-ID value in change set response.");
		}
		return iResponseIndex;
	}

	/**
	 * Returns value of the header with the specified <code>sHeaderName</code> from
	 * the specified <code>sHeaders</code> section of MIME part.
	 *
	 * @param {string} sHeaders
	 *   Section of MIME part representing HTTP headers
	 * @param {string} sHeaderName
	 *   Name of HTTP header in lower case
	 * @returns {string} The HTTP header value
	 */
	function getHeaderValue(sHeaders, sHeaderName) {
		var i,
			aHeaderParts,
			aHeaders = sHeaders.split("\r\n");

		for (i = 0; i < aHeaders.length; i += 1) {
			aHeaderParts = aHeaders[i].split(":");

			if (aHeaderParts[0].toLowerCase().trim() === sHeaderName) {
				return aHeaderParts[1].trim();
			}
		}
	}

	/*
	 * See JSDoc for oBatch.deserializeBatchResponse.
	 * Additional parameter bIsChangeSet indicates whether sResponseBody represents a
	 * change set.
	 */
	function _deserializeBatchResponse(sContentType, sResponseBody, bIsChangeSet) {
		var aBatchParts = sResponseBody.split(getBoundaryRegExp(sContentType)),
			aResponses = [];

		// skip preamble and epilogue
		aBatchParts = aBatchParts.slice(1, -1);

		aBatchParts.forEach(function (sBatchPart) {
			// a batch part contains 3 elements separated by a double "\r\n"
			// 0: general batch part headers
			// 1: HTTP response headers and status line
			// 2: HTTP response body

			var sChangeSetContentType,
				sCharset,
				iColonIndex,
				sHeader,
				sHeaderName,
				sHeaderValue,
				aHttpHeaders,
				sHttpHeaders,
				iHttpHeadersEnd,
				aHttpStatusInfos,
				i,
				sMimeHeaders,
				iMimeHeadersEnd,
				oResponse = {},
				iResponseIndex;

			iMimeHeadersEnd = sBatchPart.indexOf("\r\n\r\n");
			sMimeHeaders = sBatchPart.slice(0, iMimeHeadersEnd);
			iHttpHeadersEnd = sBatchPart.indexOf("\r\n\r\n", iMimeHeadersEnd + 4);
			sHttpHeaders = sBatchPart.slice(iMimeHeadersEnd + 4, iHttpHeadersEnd);

			sChangeSetContentType = getChangeSetContentType(sMimeHeaders);
			if (sChangeSetContentType) {
				aResponses.push(_deserializeBatchResponse(sChangeSetContentType,
					sBatchPart.slice(iMimeHeadersEnd + 4), true));
				return;
			}

			aHttpHeaders = sHttpHeaders.split("\r\n");
			// e.g. HTTP/1.1 200 OK
			aHttpStatusInfos = aHttpHeaders[0].split(" ");

			oResponse.status = parseInt(aHttpStatusInfos[1]);
			oResponse.statusText = aHttpStatusInfos.slice(2).join(' ');
			oResponse.headers = {};

			// start with index 1 to skip status line
			for (i = 1; i < aHttpHeaders.length; i += 1) {
				// e.g. Content-Type: application/json;odata.metadata=minimal
				sHeader = aHttpHeaders[i];
				iColonIndex = sHeader.indexOf(':');
				sHeaderName = sHeader.slice(0, iColonIndex).trim();
				sHeaderValue = sHeader.slice(iColonIndex + 1).trim();
				oResponse.headers[sHeaderName] = sHeaderValue;

				if (sHeaderName.toLowerCase() === "content-type") {
					sCharset = getHeaderParameterValue(sHeaderValue, "charset");
					if (sCharset && sCharset.toLowerCase() !== "utf-8") {
						throw new Error('Unsupported "Content-Type" charset: ' + sCharset);
					}
				}
			}

			// remove \r\n sequence from the end of the response body
			oResponse.responseText = sBatchPart.slice(iHttpHeadersEnd + 4, -2);

			if (bIsChangeSet) {
				iResponseIndex = getChangeSetResponseIndex(sMimeHeaders);
				aResponses[iResponseIndex] = oResponse;
			} else {
				aResponses.push(oResponse);
			}
		});

		return aResponses;
	}

	/**
	 * Serializes a map of request headers to be used in a $batch request.
	 *
	 * @param {object} mHeaders
	 *   A map of request headers
	 * @returns {object[]} Array representing the serialized headers
	 */
	function serializeHeaders(mHeaders) {
		var sHeaderName,
			aHeaders = [];

		for (sHeaderName in mHeaders) {
			aHeaders = aHeaders.concat(sHeaderName, ":", mHeaders[sHeaderName], "\r\n");
		}

		return aHeaders;
	}

	/**
	 * Serializes the given array of request objects into $batch request body.
	 *
	 * @param {object[]} aRequests
	 *   See parameter <code>aRequests</code> of serializeBatchRequest function
	 * @param {number} [iChangeSetIndex]
	 *   Is only specified if the function is called to serialize change sets and
	 *   contains zero-based index of the change set within <code>aRequests</code> array.
	 * @returns {object}
	 *   The $batch request object with the following structure
	 *   <ul>
	 *     <li><code>body</code>: {string[]} Array of strings representing batch request body
	 *     <li><code>batchBoundary</code>: {string} Batch boundary value
	 *   </ul>
	 */
	function _serializeBatchRequest(aRequests, iChangeSetIndex) {
		var sBatchBoundary = (iChangeSetIndex !== undefined ? "changeset_" : "batch_")
				+ _Helper.uid(),
			bIsChangeSet = iChangeSetIndex !== undefined,
			aRequestBody = [];

		if (bIsChangeSet) {
			aRequestBody = aRequestBody.concat("Content-Type: multipart/mixed;boundary=",
				sBatchBoundary, "\r\n\r\n");
		}

		aRequests.forEach(function (oRequest, iRequestIndex) {
			var sContentIdHeader = "",
				sUrl = oRequest.url;

			if (bIsChangeSet) {
				sContentIdHeader = "Content-ID:" + iRequestIndex + "." + iChangeSetIndex + "\r\n";
			}

			aRequestBody = aRequestBody.concat("--", sBatchBoundary, "\r\n");
			if (Array.isArray(oRequest)) {
				if (bIsChangeSet) {
					throw new Error('Change set must not contain a nested change set.');
				}
				aRequestBody = aRequestBody.concat(
					_serializeBatchRequest(oRequest, iRequestIndex).body);
			} else {
				if (bIsChangeSet && !mAllowedChangeSetMethods[oRequest.method]) {
					throw new Error("Invalid HTTP request method: " + oRequest.method +
						". Change set must contain only POST, PUT, PATCH or DELETE requests.");
				}

				// adjust URL if it contains Content-ID reference by adding the change set index
				sUrl = sUrl.replace(rContentIdReference, "$&." + iChangeSetIndex);

				aRequestBody = aRequestBody.concat(
					"Content-Type:application/http\r\n",
					"Content-Transfer-Encoding:binary\r\n",
					sContentIdHeader,
					"\r\n",
					oRequest.method, " ", sUrl, " HTTP/1.1\r\n",
					serializeHeaders(_Helper.resolveIfMatchHeader(oRequest.headers)),
					"\r\n",
					JSON.stringify(oRequest.body) || "", "\r\n");
			}
		});
		aRequestBody = aRequestBody.concat("--", sBatchBoundary, "--\r\n");

		return {body : aRequestBody, batchBoundary : sBatchBoundary};
	}

	oBatch = {
		/**
		 * Deserializes batch response body using batch boundary from the specified value of the
		 * 'Content-Type' header.
		 *
		 * @param {string} sContentType
		 *   Value of the Content-Type header from the batch response
		 *   (e.g. "multipart/mixed; boundary=batch_123456")
		 * @param {string} sResponseBody
		 *   Batch response body
		 * @returns {object[]} Array containing responses from the batch response body. Each of the
		 *   returned responses has the following structure:
		 *   <ul>
		 *     <li><code>status</code>: {number} HTTP status code
		 *     <li><code>statusText</code>: {string} (optional) HTTP status text
		 *     <li><code>headers</code>: {object} Map of the response headers
		 *     <li><code>responseText</code>: {string} Response body
		 *   </ul>
		 *   If the specified <code>sResponseBody</code> contains responses for change sets, then
		 *   the corresponding response objects will be returned in a nested array.
		 * @throws {Error}
		 *   <ul>
		 *     <li>If <code>sContentType</code> parameter does not represent "multipart/mixed"
		 *       media type with "boundary" parameter
		 *     <li>If "charset" parameter of "Content-Type" header of a nested response has value
		 *       other than "utf-8".
		 *   </ul>
		 */
		deserializeBatchResponse : function (sContentType, sResponseBody) {
			return _deserializeBatchResponse(sContentType, sResponseBody, false);
		},

		/**
		 * Serializes an array of requests to an object containing the batch request body and
		 * mandatory headers for the batch request.
		 *
		 * @param {object[]} aRequests
		 *  An array consisting of request objects <code>oRequest</code> or out of array(s)
		 *  of request objects <code>oRequest</code>, in case requests need to be sent in scope of
		 *  a change set. See example below.
		 * @param {string} oRequest.method
		 *   HTTP method, e.g. "GET"
		 * @param {string} oRequest.url
		 *   Absolute or relative URL. If the URL contains Content-ID reference then the reference
		 *   has to be specified as zero-based index of the referred request inside the change set.
		 *   See example below.
		 * @param {object} oRequest.headers
		 *   Map of request headers. RFC-2047 encoding rules are not supported. Nevertheless non
		 *   US-ASCII values can be used. If the value of an "If-Match" header is an object, that
		 *   object's ETag is used instead.
		 * @param {object} oRequest.body
		 *   Request body. If specified, oRequest.headers map must contain "Content-Type" header
		 *   either without "charset" parameter or with "charset" parameter having value "UTF-8".
		 * @returns {object} Object containing the following properties:
		 *   <ul>
		 *     <li><code>body</code>: Batch request body
		 *     <li><code>headers</code>: Batch-specific request headers
		 *     <ul>
		 *       <li><code>Content-Type</code>: Value for the 'Content-Type' header
		 *       <li><code>MIME-Version</code>: Value for the 'MIME-Version' header
		 *     </ul>
		 *   </ul>
		 * @example
		 *   var oBatchRequest = Batch.serializeBatchRequest([
		 *       {
		 *           method : "GET",
		 *           url : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/Employees('1')",
		 *           headers : {
		 *               Accept : "application/json"
		 *           }
		 *       },
		 *       [{
		 *           method : "POST",
		 *           url : "TEAMS",
		 *           headers : {
		 *               "Content-Type" : "application/json"
		 *           },
		 *           body : {"TEAM_ID" : "TEAM_03"}
		 *       }, {
		 *           method : "POST",
		 *           url : "$0/TEAM_2_Employees",
		 *           headers : {
		 *               "Content-Type" : "application/json",
		 *               "If-Match" : "etag0"
		 *           },
		 *           body : {"Name" : "John Smith"}
		 *       }],
		 *       {
		 *           method : "PATCH",
		 *           url : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/Employees('3')",
		 *           headers : {
		 *               "Content-Type" : "application/json",
		 *               "If-Match" : {
		 *                   "@odata.etag" : "etag1"
		 *               }
		 *           },
		 *           body : {"TEAM_ID" : "TEAM_01"}
		 *       }
		 *   ]);
		 */
		serializeBatchRequest : function (aRequests) {
			var oBatchRequest = _serializeBatchRequest(aRequests);

			return {
				body : oBatchRequest.body.join(""),
				headers : {
					"Content-Type" : "multipart/mixed; boundary=" + oBatchRequest.batchBoundary,
					"MIME-Version" : "1.0"
				}
			};
		}
	};

	return oBatch;
}, /* bExport= */false);