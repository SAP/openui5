/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Requestor
sap.ui.define(["jquery.sap.global"], function (jQuery) {
	"use strict";

	var mAllowedChangeSetMethods = {"POST" : true, "PUT" : true, "PATCH" : true, "DELETE" : true},
		rAmpersand = /&/g,
		rContentIdReference = /\$(?:\d*)*/,
		rEquals = /\=/g,
		rHash = /#/g,
		rHeaderParameter = /(\S*?)=(?:"(.+)"|(\S+))/,
		rPlus = /\+/g,
		rSemicolon = /;/g,
		Helper;

	Helper = {
		/**
		 * Builds a query string from the given parameter map. Takes care of encoding, but ensures
		 * that the characters "$", "(", ")" and "=" are not encoded, so that OData queries remain
		 * readable.
		 *
		 * @param {object} [mParameters]
		 *   a map of key-value pairs representing the query string, the value in this pair has to
		 *   be a string or an array of strings; if it is an array, the resulting query string
		 *   repeats the key for each array value.
		 *   Examples:
		 *   buildQuery({foo: "bar", "bar": "baz"}) results in the query string "?foo=bar&bar=baz"
		 *   buildQuery({foo: ["bar", "baz"]}) results in the query string "?foo=bar&foo=baz"
		 * @returns {string}
		 *   the query string; it is empty if there are no parameters; it starts with "?" otherwise
		 */
		buildQuery : function (mParameters) {
			var aKeys, aQuery;

			if (!mParameters) {
				return "";
			}

			aKeys = Object.keys(mParameters);
			if (aKeys.length === 0) {
				return "";
			}

			aQuery = [];
			aKeys.forEach(function (sKey) {
				var vValue = mParameters[sKey];

				if (Array.isArray(vValue)) {
					vValue.forEach(function (sItem) {
						aQuery.push(Helper.encodePair(sKey, sItem));
					});
				} else {
					aQuery.push(Helper.encodePair(sKey, vValue));
				}
			});

			return "?" + aQuery.join("&");
		},

		/**
		 * Returns an <code>Error</code> instance from a jQuery XHR wrapper.
		 *
		 * @param {object} jqXHR
		 *   a jQuery XHR wrapper as received by a failure handler
		 * @param {function} jqXHR.getResponseHeader
		 *   used to access the HTTP response header "Content-Type"
		 * @param {string} jqXHR.responseText
		 *   HTTP response body, sometimes in JSON format ("Content-Type" : "application/json")
		 *   according to OData "19 Error Response" specification, sometimes plain text
		 *   ("Content-Type" : "text/plain"); other formats are ignored
		 * @param {number} jqXHR.status
		 *   HTTP status code
		 * @param {string} jqXHR.statusText
		 *   HTTP status text
		 * @returns {Error}
		 *   an <code>Error</code> instance with the following properties:
		 *   <ul>
		 *     <li><code>error</code>: the "error" value from the OData v4 error response JSON
		 *     object (if available);
		 *     <li><code>isConcurrentModification</code>: <code>true</code> in case of a
		 *     concurrent modification detected via ETags (i.e. HTTP status code 412);
		 *     <li><code>message</code>: error message;
		 *     <li><code>status</code>: HTTP status code;
		 *     <li><code>statusText</code>: HTTP status text.
		 *   </ul>
		 * @see <a href=
		 * "http://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html"
		 * >"19 Error Response"</a>
		 */
		createError : function (jqXHR) {
			var sBody = jqXHR.responseText,
				sContentType = jqXHR.getResponseHeader("Content-Type").split(";")[0],
				oResult = new Error(jqXHR.status + " " + jqXHR.statusText);

			oResult.status = jqXHR.status;
			oResult.statusText = jqXHR.statusText;

			if (jqXHR.status === 412) {
				oResult.isConcurrentModification = true;
			}
			if (sContentType === "application/json") {
				try {
					// "The error response MUST be a single JSON object. This object MUST have a
					// single name/value pair named error. The value must be a JSON object."
					oResult.error = JSON.parse(sBody).error;
					oResult.message = oResult.error.message;
				} catch (e) {
					jQuery.sap.log.warning(e.toString(), sBody,
						"sap.ui.model.odata.v4.lib._Helper");
				}
			} else if (sContentType === "text/plain") {
				oResult.message = sBody;
			}

			return oResult;
		},

		/**
		 * Deserializes batch response body using batch boundary from the specified value of the
		 * 'Content-Type' header.
		 *
		 * @param {string} sContentType
		 *   value of the Content-Type header from the batch response
		 *   (e.g. "multipart/mixed; boundary=batch_123456")
		 * @param {string} sResponseBody
		 *   batch response body
		 * @returns {object[]} array containing responses from the batch response body. Each of the
		 *   returned responses has the following structure:
		 *   <ul>
		 *     <li><code>status</code>: {number} HTTP status code;
		 *     <li><code>statusText</code>: {string} HTTP status text;
		 *     <li><code>headers</code>: {object} map of the response headers;
		 *     <li><code>responseText</code>: {string} response body.
		 *   </ul>
		 *   If the specified <code>sResponseBody</code> contains responses for change sets, then
		 *   the corresponding response objects will be returned in a nested array.
		 * @throws {Error}
		 *   <ul>
		 *     <li>if <code>sContentType</code> parameter does not represent "multipart/mixed"
		 *       media type with "boundary" parameter
		 *     <li>if "charset" parameter of "Content-Type" header of a nested response has value
		 *       other than "utf-8".
		 *   </ul>
		 */
		deserializeBatchResponse : function (sContentType, sResponseBody) {
			/*
			 * See JSDoc for deserializeBatchResponse.
			 * Additional parameter bIsChangeSet indicates whether sResponseBody represents a
			 * change set.
			 */
			function _deserializeBatchResponse(sContentType, sResponseBody, bIsChangeSet) {
				var aBatchParts = sResponseBody.split(getBoundaryRegExp()),
					aResponses = [];

				function getBoundaryRegExp() {
					var sBatchBoundary = getHeaderParameterValue(sContentType, "boundary"),
						iMultiPartTypeIndex = sContentType.trim().indexOf("multipart/mixed");

					if (iMultiPartTypeIndex !== 0 || !sBatchBoundary) {
						throw new Error('Invalid $batch response header "Content-Type": '
							+ sContentType);
					}

					// escape RegExp-related characters
					sBatchBoundary = jQuery.sap.escapeRegExp(sBatchBoundary);
					return new RegExp('--' + sBatchBoundary + '-{0,2} *\r\n');
				}

				/**
				 * Extracts value of the parameter with the specified <code>sParameterName</code>
				 * from the specified <code>sHeaderValue</code>.
				 *
				 * @param {string} sHeaderValue
				 *   HTTP header value e.g. "application/json;charset=utf-8"
				 * @param {string} sParameterName
				 *   name of HTTP header parameter e.g. "charset"
				 * @returns {string} the HTTP header parameter value
				 */
				function getHeaderParameterValue(sHeaderValue, sParameterName) {
					var iParamIndex,
						aHeaderParts = sHeaderValue.split(";"),
						aMatches;

					sParameterName = sParameterName.toLowerCase();
					for (iParamIndex = 1; iParamIndex < aHeaderParts.length; iParamIndex++) {
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
				 *   section of MIME part representing HTTP headers
				 * @returns {string} Content-Type header value e.g.
				 *   "multipart/mixed; boundary=batch_id-0123456789012-345" or undefined
				 */
				function getChangeSetContentType(sMimeTypeHeaders) {
					var sContentType = getHeaderValue(sMimeTypeHeaders, "content-type");
					return sContentType.indexOf("multipart/mixed;") === 0
						? sContentType : undefined;
				}

				function getChangeSetResponseIndex(sMimeTypeHeaders) {
					var sContentID = getHeaderValue(sMimeTypeHeaders, "content-id"),
						iResponseIndex;

					if (!sContentID) {
						throw new Error(
							"Content-ID MIME header missing for the change set response.");
					}

					iResponseIndex = parseInt(sContentID, 10);
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
				 *   section of MIME part representing HTTP headers
				 * @param {string} sHeaderName
				 *   name of HTTP header in lower case
				 * @returns {string} the HTTP header value
				 */
				function getHeaderValue(sHeaders, sHeaderName) {
					var i,
						aHeaderParts,
						aHeaders = sHeaders.split("\r\n");

					for (i = 0; i < aHeaders.length; i++) {
						aHeaderParts = aHeaders[i].split(":");

						if (aHeaderParts[0].toLowerCase().trim() === sHeaderName) {
							return aHeaderParts[1].trim();
						}
					}
				}

				// skip preamble and epilogue
				aBatchParts = aBatchParts.slice(1, -1);

				aBatchParts.forEach(function (sBatchPart) {
					var sChangeSetContentType,
						sCharset,
						iColonIndex,
						sHeader,
						sHeaderName,
						sHeaderValue,
						aHttpHeaders,
						aHttpStatusInfos,
						i,
						sMimeHeaders,
						oResponse = {},
						iResponseIndex,
						aResponseParts;

					// aResponseParts will take 3 elements:
					// 0: general batch part headers
					// 1: HTTP response headers and status line
					// 2: HTTP response body
					aResponseParts = sBatchPart.split("\r\n\r\n");

					sMimeHeaders = aResponseParts[0];
					sChangeSetContentType = getChangeSetContentType(sMimeHeaders);
					if (sChangeSetContentType) {
						aResponses.push(_deserializeBatchResponse(sChangeSetContentType,
							aResponseParts.slice(1).join("\r\n\r\n"), true));
						return;
					}

					aHttpHeaders = aResponseParts[1].split("\r\n");
					// e.g. HTTP/1.1 200 OK
					aHttpStatusInfos = aHttpHeaders[0].split(" ");

					oResponse.status = parseInt(aHttpStatusInfos[1], 10);
					oResponse.statusText = aHttpStatusInfos.slice(2).join(' ');
					oResponse.headers = {};

					// start with index 1 to skip status line
					for (i = 1; i < aHttpHeaders.length; i++) {
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
					oResponse.responseText = aResponseParts[2].slice(0, -2);

					if (bIsChangeSet) {
						iResponseIndex = getChangeSetResponseIndex(sMimeHeaders);
						aResponses[iResponseIndex] = oResponse;
					} else {
						aResponses.push(oResponse);
					}
				});

				return aResponses;
			}
			return _deserializeBatchResponse(sContentType, sResponseBody, false);
		},

		/**
		 * Encodes a query part, either a key or a value.
		 *
		 * @param {string} sPart
		 *   the query part
		 * @param {boolean} bEncodeEquals
		 *   if true, "=" is encoded, too
		 * @returns {string}
		 *   the encoded query part
		 */
		encode : function (sPart, bEncodeEquals) {
			var sEncoded = encodeURI(sPart)
					.replace(rAmpersand, "%26")
					.replace(rHash, "%23")
					.replace(rPlus, "%2B")
					.replace(rSemicolon, "%3B");
			if (bEncodeEquals) {
				sEncoded = sEncoded.replace(rEquals, "%3D");
			}
			return sEncoded;
		},

		/**
		 * Encodes a key-value pair.
		 *
		 * @param {string} sKey
		 *   the key
		 * @param {string} sValue
		 *   the sValue
		 * @returns {string}
		 *   the encoded key-value pair in the form "key=value"
		 */
		encodePair : function (sKey, sValue) {
			return Helper.encode(sKey, true) + "=" + Helper.encode(sValue, false);
		},

		/**
		 * Checks that the value is a safe integer.
		 *
		 * @param {number} iNumber the value
		 * @returns {boolean}
		 *   true if the value is a safe integer
		 */
		isSafeInteger : function (iNumber) {
			if (typeof iNumber !== "number" || !isFinite(iNumber)) {
				return false;
			}
			iNumber = Math.abs(iNumber);
			// The safe integers consist of all integers from -(2^53 - 1) inclusive to 2^53 - 1
			// inclusive.
			// 2^53 - 1 = 9007199254740991
			return iNumber <= 9007199254740991 && Math.floor(iNumber) == iNumber;
		},

		/**
		 * Serializes an array of requests to an object containing the batch request body and
		 * mandatory headers for the batch request.
		 *
		 * @param {object[]} aRequests
		 *  an array consisting of request objects <code>oRequest</code> or out of array(s)
		 *  of request objects <code>oRequest</code>, in case requests need to be sent in scope of
		 *  a change set. See example below.
		 * @param {string} oRequest.method
		 *   HTTP method, e.g. "GET"
		 * @param {string} oRequest.url
		 *   absolute or relative URL. If the URL contains Content-ID reference then the reference
		 *   has to be specified as zero-based index of the referred request inside the change set.
		 *   See example below.
		 * @param {object} oRequest.headers
		 *   map of request headers. RFC-2047 encoding rules are not supported. Nevertheless non
		 *   US-ASCII values can be used.
		 * @param {string} oRequest.body
		 *   request body. If specified, oRequest.headers map must contain "Content-Type" header
		 *   either without "charset" parameter or with "charset" parameter having value "UTF-8".
		 * @returns {object} object containing the following properties:
		 *   <ul>
		 *     <li><code>body</code>: batch request body;
		 *     <li><code>Content-Type</code>: value for the 'Content-Type' header;
		 *     <li><code>MIME-Version</code>: value for the 'MIME-Version' header.
		 *   </ul>
		 * @example
		 *   var oBatchRequest = Helper.serializeBatchRequest([
		 *       {
		 *           method : "GET",
		 *           url : "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')",
		 *           headers : {
		 *               Accept : "application/json"
		 *           }
		 *       },
		 *       [{
		 *           method : "POST",
		 *           url : "/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS",
		 *           headers : {
		 *               "Content-Type" : "application/json"
		 *           },
		 *           body : '{"TEAM_ID" : "TEAM_03"}'
		 *       }, {
		 *           method : "POST",
		 *           url : "$0/TEAM_2_Employees",
		 *           headers : {
		 *               "Content-Type" : "application/json"
		 *           },
		 *           body : '{"Name" : "John Smith"}'
		 *       }],
		 *       {
		 *           method : "PATCH",
		 *           url : "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('3')",
		 *           headers : {
		 *               "Content-Type" : "application/json"
		 *           },
		 *           body : '{"TEAM_ID" : "TEAM_01"}'
		 *       }
		 *   ]);
		 */
		serializeBatchRequest : function (aRequests) {
			var sContentTypeBoundary;

			/**
			 * Serializes the given array of request objects into $batch request body.
			 *
			 * @param {object[]} aRequests
			 *   see parameter <code>aRequests</code> of serializeBatchRequest function
			 * @param {number} [iChangeSetIndex]
			 *   is only specified if the function is called to serialize change sets and
			 *   contains zero-based index of the change set within <code>aRequests</code> array.
			 * @returns {string}
			 *   the $batch request body
			 */
			function serializeBatchRequests(aRequests, iChangeSetIndex) {
				var sBatchBoundary = (iChangeSetIndex !== undefined ? "changeset_" : "batch_")
						+ jQuery.sap.uid(),
					bIsChangeSet = iChangeSetIndex !== undefined,
					aRequestBody = [];

				/**
				 * Serializes a map of request headers to be used in a $batch request.
				 *
				 * @param {object} mHeaders
				 *   a map of request headers
				 * @returns {object[]} array representing the serialized headers
				 */
				function serializeHeaders (mHeaders) {
					var sHeaderName,
						aHeaders = [];

					for (sHeaderName in mHeaders) {
						aHeaders = aHeaders.concat(sHeaderName, ":", mHeaders[sHeaderName], "\r\n");
					}

					return aHeaders;
				}

				if (bIsChangeSet) {
					aRequestBody = aRequestBody.concat("Content-Type: multipart/mixed;boundary=",
						sBatchBoundary, "\r\n\r\n");
				}

				aRequests.forEach(function(oRequest, iRequestIndex) {
					var sContentIdHeader = "";

					if (bIsChangeSet) {
						sContentIdHeader = "Content-ID:" + iRequestIndex + "." + iChangeSetIndex
							+ "\r\n";
					}

					aRequestBody = aRequestBody.concat("--", sBatchBoundary, "\r\n");
					if (Array.isArray(oRequest)) {
						if (bIsChangeSet) {
							throw new Error('Change set must not contain a nested change set.');
						}
						aRequestBody =
							aRequestBody.concat(serializeBatchRequests(oRequest, iRequestIndex));
					} else {
						if (bIsChangeSet && !mAllowedChangeSetMethods[oRequest.method]) {
							throw new Error("Invalid HTTP request method: " + oRequest.method +
								". Change set must contain only POST, PUT, PATCH or " +
								"DELETE requests.");
						}

						// adjust URL if it contains Content-ID reference by adding the change set
						// index
						oRequest.url = oRequest.url.replace(rContentIdReference,
							"$&." + iChangeSetIndex);

						aRequestBody = aRequestBody.concat(
							"Content-Type:application/http\r\n",
							"Content-Transfer-Encoding:binary\r\n",
							sContentIdHeader,
							"\r\n",
							oRequest.method, " ", oRequest.url, " HTTP/1.1\r\n",
							serializeHeaders(oRequest.headers),
							"\r\n",
							oRequest.body || "", "\r\n");
					}
				});
				aRequestBody = aRequestBody.concat("--", sBatchBoundary, "--\r\n");

				sContentTypeBoundary = sBatchBoundary;
				return aRequestBody;
			}

			return {
				body : serializeBatchRequests(aRequests).join(""),
				"Content-Type" : "multipart/mixed; boundary=" + sContentTypeBoundary,
				"MIME-Version" : "1.0"
			};
		}
	};

	return Helper;
}, /* bExport= */false);
