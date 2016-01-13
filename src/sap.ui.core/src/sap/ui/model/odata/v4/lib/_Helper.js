/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Requestor
sap.ui.define(["jquery.sap.global"], function (jQuery) {
	"use strict";

	var rAmpersand = /&/g,
		rEquals = /\=/g,
		rHash = /#/g,
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
		}
	};

	return Helper;
}, /* bExport= */false);
