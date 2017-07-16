/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Helper
sap.ui.define([
	"jquery.sap.global"
], function (jQuery) {
	"use strict";

	var rAmpersand = /&/g,
		rEquals = /\=/g,
		rHash = /#/g,
		rNumber = /^-?\d+$/,
		rPlus = /\+/g,
		rSingleQuote = /'/g,
		Helper;

	Helper = {
		/**
		 * Builds a relative path from the given arguments. Iterates over the arguments and appends
		 * them to the path if defined and non-empty. The arguments are expected to be strings or
		 * integers, but this is not checked.
		 *
		 * Examples:
		 * buildPath() --> ""
		 * buildPath("base", "relative") --> "base/relative"
		 * buildPath("base", "") --> "base"
		 * buildPath("", "relative") --> "relative"
		 * buildPath("base", undefined, "relative") --> "base/relative"
		 * buildPath("base", 42, "relative") --> "base/42/relative"
		 * buildPath("base", 0, "relative") --> "base/0/relative"
		 *
		 * @returns {string} a composite path built from all arguments
		 */
		buildPath : function () {
			var i,
				aPath = [],
				sSegment;

			for (i = 0; i < arguments.length; i++) {
				sSegment = arguments[i];
				if (sSegment || sSegment === 0) {
					aPath.push(sSegment === "/" ? "" : sSegment); //avoid duplicated '/'
				}
			}
			return aPath.join("/");
		},

		/**
		 * Builds a query string from the given parameter map. Takes care of encoding, but ensures
		 * that the characters "$", "(", ")", ";" and "=" are not encoded, so that OData queries
		 * remain readable.
		 *
		 * ';' is not encoded although RFC 1866 encourages its usage as separator between query
		 * parameters. However OData Version 4.0 Part 2 specifies that only '&' is a valid
		 * separator.
		 *
		 * @param {object} [mParameters]
		 *   A map of key-value pairs representing the query string, the value in this pair has to
		 *   be a string or an array of strings; if it is an array, the resulting query string
		 *   repeats the key for each array value
		 *   Examples:
		 *   buildQuery({foo : "bar", "bar" : "baz"}) results in the query string "?foo=bar&bar=baz"
		 *   buildQuery({foo : ["bar", "baz"]}) results in the query string "?foo=bar&foo=baz"
		 * @returns {string}
		 *   The query string; it is empty if there are no parameters; it starts with "?" otherwise
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
		 *   A jQuery XHR wrapper as received by a failure handler
		 * @param {function} jqXHR.getResponseHeader
		 *   Used to access the HTTP response header "Content-Type"
		 * @param {string} jqXHR.responseText
		 *   HTTP response body, sometimes in JSON format ("Content-Type" : "application/json")
		 *   according to OData "19 Error Response" specification, sometimes plain text
		 *   ("Content-Type" : "text/plain"); other formats are ignored
		 * @param {number} jqXHR.status
		 *   HTTP status code
		 * @param {string} jqXHR.statusText
		 *   HTTP status text
		 * @returns {Error}
		 *   An <code>Error</code> instance with the following properties:
		 *   <ul>
		 *     <li><code>error</code>: The "error" value from the OData V4 error response JSON
		 *     object (if available)
		 *     <li><code>isConcurrentModification</code>: <code>true</code> In case of a
		 *     concurrent modification detected via ETags (i.e. HTTP status code 412)
		 *     <li><code>message</code>: Error message
		 *     <li><code>status</code>: HTTP status code
		 *     <li><code>statusText</code>: HTTP status text
		 *   </ul>
		 * @see <a href=
		 * "http://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html"
		 * >"19 Error Response"</a>
		 */
		createError : function (jqXHR) {
			var sBody = jqXHR.responseText,
				sContentType = jqXHR.getResponseHeader("Content-Type"),
				oResult = new Error(jqXHR.status + " " + jqXHR.statusText);

			oResult.status = jqXHR.status;
			oResult.statusText = jqXHR.statusText;
			if (jqXHR.status === 0) {
				oResult.message = "Network error";
				return oResult;
			}
			if (sContentType) {
				sContentType = sContentType.split(";")[0];
			}
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
		 *   The query part
		 * @param {boolean} bEncodeEquals
		 *   If true, "=" is encoded, too
		 * @returns {string}
		 *   The encoded query part
		 */
		encode : function (sPart, bEncodeEquals) {
			var sEncoded = encodeURI(sPart)
					.replace(rAmpersand, "%26")
					.replace(rHash, "%23")
					.replace(rPlus, "%2B");
			if (bEncodeEquals) {
				sEncoded = sEncoded.replace(rEquals, "%3D");
			}
			return sEncoded;
		},

		/**
		 * Encodes a key-value pair.
		 *
		 * @param {string} sKey
		 *   The key
		 * @param {string} sValue
		 *   The sValue
		 * @returns {string}
		 *   The encoded key-value pair in the form "key=value"
		 */
		encodePair : function (sKey, sValue) {
			return Helper.encode(sKey, true) + "=" + Helper.encode(sValue, false);
		},

		/**
		 * Fires a change event to all listeners for the given path in mChangeListeners.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPropertyPath The path
		 * @param {any} vValue The value to report to the listeners
		 */
		fireChange : function (mChangeListeners, sPropertyPath, vValue) {
			var aListeners = mChangeListeners[sPropertyPath],
				i;

			if (aListeners) {
				for (i = 0; i < aListeners.length; i++) {
					aListeners[i].onChange(vValue);
				}
			}
		},

		/**
		 * Iterates recursively over all properties of the given value and fires change events
		 * to all listeners.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the current value
		 * @param {object} oValue The value
		 * @param {boolean} bRemoved If true the value is assumed to have been removed and the
		 *   change event reports undefined as the new value
		 */
		fireChanges : function (mChangeListeners, sPath, oValue, bRemoved) {
			Object.keys(oValue).forEach(function (sProperty) {
				var sPropertyPath = Helper.buildPath(sPath, sProperty),
					vValue = oValue[sProperty];

				if (vValue && typeof vValue === "object") {
					Helper.fireChanges(mChangeListeners, sPropertyPath, vValue, bRemoved);
				} else {
					Helper.fireChange(mChangeListeners, sPropertyPath,
						bRemoved ? undefined : vValue);
				}
			});
		},

		/**
		 * Formats a given internal value into a literal suitable for usage in URLs.
		 *
		 * @param {any} vValue
		 *   The value according to "OData JSON Format Version 4.0" section "7.1 Primitive Value"
		 * @param {string} sType
		 *   The OData Edm type, e.g. "Edm.String"
		 * @returns {string}
		 *   The literal according to "OData Version 4.0 Part 2: URL Conventions" section
		 *   "5.1.1.6.1 Primitive Literals"
		 * @throws {Error}
		 *   If the value is undefined or the type is not supported
		 */
		formatLiteral : function (vValue, sType) {
			if (vValue === undefined) {
				throw new Error("Illegal value: undefined");
			}
			if (vValue === null) {
				return "null";
			}

			switch (sType) {
			case "Edm.Binary":
				return "binary'" + vValue + "'";

			case "Edm.Boolean":
			case "Edm.Byte":
			case "Edm.Double":
			case "Edm.Int16":
			case "Edm.Int32":
			case "Edm.SByte":
			case "Edm.Single":
				return String(vValue);

			case "Edm.Date":
			case "Edm.DateTimeOffset":
			case "Edm.Decimal":
			case "Edm.Guid":
			case "Edm.Int64":
			case "Edm.TimeOfDay":
				return vValue;

			case "Edm.Duration":
				return "duration'" + vValue + "'";

			case "Edm.String":
				return "'" + vValue.replace(rSingleQuote, "''") + "'";

			default:
				throw new Error("Unsupported type: " + sType);
			}
		},

		/**
		 * Returns the key predicate (see "4.3.1 Canonical URL") for the given entity type metadata
		 * and entity instance runtime data.
		 *
		 * @param {object} oEntityType
		 *   Entity type metadata
		 * @param {object} oEntityInstance
		 *   Entity instance runtime data
		 * @returns {string}
		 *   The key predicate, e.g. "(Sector='DevOps',ID='42')" or "('42')"
		 * @throws {Error}
		 *   If there is no entity instance or if one key property is undefined
		 *
		 * @private
		 */
		getKeyPredicate : function (oEntityType, oEntityInstance) {
			var aKeyProperties = [],
				bSingleKey = oEntityType.$Key.length === 1;

			if (!oEntityInstance) {
				throw new Error("No instance to calculate key predicate");
			}
			oEntityType.$Key.forEach(function (sName) {
				var vValue = oEntityInstance[sName];

				if (vValue === undefined) {
					throw new Error("Missing value for key property '" + sName + "'");
				}
				vValue = encodeURIComponent(Helper.formatLiteral(vValue, oEntityType[sName].$Type));
				aKeyProperties.push(bSingleKey ? vValue : encodeURIComponent(sName) + "=" + vValue);
			});

			return "(" + aKeyProperties.join(",") + ")";
		},

		/**
		 * Returns the properties that have been selected for the given path.
		 *
		 * @param {objekt} mQueryOptions
		 *   A map of query options as returned by
		 *   {@link sap.ui.model.odata.v4.ODataModel#buildQueryOptions}
		 * @param {string} sPath
		 *   The path of the cache value in the cache
		 * @returns {string[]} aSelect
		 *   The properties that have been selected for the given path or undefined otherwise
		 *
		 * @private
		 */
		getSelectForPath : function (mQueryOptions, sPath) {
			if (sPath) {
				sPath.split("/").some(function (sSegment) {
					if (!rNumber.test(sSegment)) {
						mQueryOptions = mQueryOptions && mQueryOptions.$expand
							&& mQueryOptions.$expand[sSegment];
					}
				});
			}
			return mQueryOptions && mQueryOptions.$select;
		},

		/**
		 * Checks that the value is a safe integer.
		 *
		 * @param {number} iNumber The value
		 * @returns {boolean}
		 *   True if the value is a safe integer
		 */
		isSafeInteger : function (iNumber) {
			if (typeof iNumber !== "number" || !isFinite(iNumber)) {
				return false;
			}
			iNumber = Math.abs(iNumber);
			// The safe integers consist of all integers from -(2^53 - 1) inclusive to 2^53 - 1
			// inclusive.
			// 2^53 - 1 = 9007199254740991
			return iNumber <= 9007199254740991 && Math.floor(iNumber) === iNumber;
		},

		/**
		 * Determines the namespace of the given qualified name.
		 *
		 * @param {string} sName
		 *   The qualified name
		 * @returns {string}
		 *   The namespace
		 */
		namespace : function (sName) {
			var iIndex = sName.indexOf("/");

			if (iIndex >= 0) {
				// consider only the first path segment
				sName = sName.slice(0, iIndex);
			}
			// now we have a qualified name, drop the last segment (the name)
			iIndex = sName.lastIndexOf(".");

			return iIndex < 0 ? "" : sName.slice(0, iIndex);
		},

		/**
		 * Converts given value to an array.
		 * <code>null</code> and <code>undefined</code> are converted to the empty array, a
		 * non-array value is wrapped with an array and an array is returned as it is.
		 *
		 * @param {any} [vElement]
		 *   The element to be converted into an array.
		 * @returns {Array}
		 *   The array for the given element.
		 */
		toArray : function (vElement) {
			if (vElement === undefined || vElement === null) {
				return [];
			}
			if (Array.isArray(vElement)) {
				return vElement;
			}
			return [vElement];
		},

		/**
		 * Updates the cache with the object sent to the PATCH request or the object returned by the
		 * PATCH response. Fires change events for all changed properties. The function recursively
		 * handles modified, added or removed structural properties and fires change events for all
		 * modified/added/removed primitive properties therein.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the cache value in the cache
		 * @param {object} oCacheValue The object in the cache
		 * @param {object} oPatchValue The value of the PATCH request/response
		 */
		updateCache : function (mChangeListeners, sPath, oCacheValue, oPatchValue) {

			// iterate over all properties in the cache
			Object.keys(oCacheValue).forEach(function (sProperty) {
				var sPropertyPath = Helper.buildPath(sPath, sProperty),
					vOldValue = oCacheValue[sProperty],
					vNewValue;

				if (sProperty in oPatchValue) {
					// the property was patched
					vNewValue = oPatchValue[sProperty];
					if (vNewValue && typeof vNewValue === "object") {
						if (vOldValue) {
							// a structural property in cache and patch -> recursion
							Helper.updateCache(mChangeListeners, sPropertyPath, vOldValue,
								vNewValue);
						} else {
							// a structural property was added
							oCacheValue[sProperty] = vNewValue;
							Helper.fireChanges(mChangeListeners, sPropertyPath, vNewValue, false);
						}
					} else if (vOldValue && typeof vOldValue === "object") {
						// a structural property was removed
						Helper.fireChanges(mChangeListeners, sPropertyPath, vOldValue, true);
						oCacheValue[sProperty] = vNewValue;
					} else {
						// a primitive property
						if (vOldValue !== vNewValue) {
							Helper.fireChange(mChangeListeners, sPropertyPath, vNewValue);
						}
						oCacheValue[sProperty] = vNewValue;
					}
				}
			});
		},

		/**
		 * Updates the cache with the given values for the selected properties (see
		 * {@link #updateCache}). If no selected properties are given or if "*" is contained in the
		 * selected properties, then all properties are selected. <code>@odata.etag</code> is always
		 * selected. Fires change events for all changed properties.
		 *
		 * @param {object} mChangeListeners
		 *   A map of change listeners by path
		 * @param {string} sPath
		 *   The path of the cache value in the cache
		 * @param {object} oCacheValue
		 *   The object in the cache
		 * @param {object} oPostValue
		 *   The value of the POST response
		 * @param {string[]} [aSelect]
		 *   The properties to be updated in the cache; default is all properties from the response
		 */
		updateCacheAfterPost : function (mChangeListeners, sPath, oCacheValue, oPostValue,
			aSelect) {

			/*
			 * Take over the property value from source to target and fires an event if the property
			 * is changed
			 * @param {string} sPath The path of the cache value in the cache
			 * @param {string} sProperty The property
			 * @param {object} oCacheValue The object in the cache
			 * @param {object} oPostValue The value of the response
			 */
			function copyPathValue(sPath, sProperty, oCacheValue , oPostValue) {
				var aSegments = sProperty.split("/");

				aSegments.every(function(sSegment, iIndex) {
					if (oPostValue[sSegment] === null) {
						oCacheValue[sSegment] = null;
						if (iIndex < aSegments.length - 1) {
							return false;
						}
						Helper.fireChange(mChangeListeners, Helper.buildPath(sPath, sProperty),
							oCacheValue[sSegment]);
					} else if (typeof oPostValue[sSegment] === "object") {
						oCacheValue[sSegment] = oCacheValue[sSegment] || {};
					} else {
						if (oCacheValue[sSegment] !== oPostValue[sSegment]) {
							oCacheValue[sSegment] = oPostValue[sSegment];
							Helper.fireChange(mChangeListeners, Helper.buildPath(sPath, sProperty),
								oCacheValue[sSegment]);
						}
						return false;
					}
					oCacheValue = oCacheValue[sSegment];
					oPostValue = oPostValue[sSegment];
					return true;
				});
			}

			/*
			 * Creates an array of all property paths for a given object
			 * @param {object} oObject
			 * @param {object} [sObjectName] The name of the complex property
			 */
			function buildPropertyPaths(oObject, sObjectName) {
				Object.keys(oObject).forEach(function (sProperty) {
					var sPropertyPath = sObjectName ? sObjectName + "/" + sProperty : sProperty,
						vPropertyValue = oObject[sProperty];

					if (vPropertyValue !== null && typeof vPropertyValue === "object") {
						buildPropertyPaths(vPropertyValue, sPropertyPath);
					} else {
						aSelect.push(sPropertyPath);
					}
				});
			}

			if (!aSelect || aSelect.indexOf("*") >= 0) {
				// no individual properties selected, fetch all properties of the result
				aSelect = [];
				buildPropertyPaths(oPostValue);
			} else {
				// fetch the selected properties plus the ETag
				aSelect = aSelect.concat("@odata.etag");
			}

			// take over properties from server response and fire change events
			aSelect.forEach(function (sProperty) {
				copyPathValue(sPath, sProperty, oCacheValue, oPostValue);
			});
		}
	};

	return Helper;
}, /* bExport= */false);
