/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Helper
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/uid",
	"sap/ui/thirdparty/URI"
], function (Log, isEmptyObject, merge, uid, URI) {
	"use strict";

	var rAmpersand = /&/g,
		sClassName = "sap.ui.model.odata.v4.lib._Helper",
		rEquals = /\=/g,
		rEscapedCloseBracket = /%29/g,
		rEscapedOpenBracket = /%28/g,
		rEscapedTick = /%27/g,
		rHash = /#/g,
		_Helper,
		// matches the rest of a segment after '(' and any segment that consists only of a number
		rNotMetaContext = /\([^/]*|\/-?\d+/g,
		rPlus = /\+/g,
		rSingleQuote = /'/g;

	_Helper = {
		/**
		 * Adds an item to the given map by path.
		 *
		 * @param {object} mMap
		 *   A map from path to a list of items
		 * @param {string} sPath
		 *   The path
		 * @param {object} [oItem]
		 *   The item; if it is <code>undefined</code>, nothing happens
		 */
		addByPath : function (mMap, sPath, oItem) {
			if (oItem) {
				if (!mMap[sPath]) {
					mMap[sPath] = [oItem];
				} else if (mMap[sPath].indexOf(oItem) < 0) {
					mMap[sPath].push(oItem);
				}
			}
		},

		/**
		 * Adds all given children to the given hash set which either appear in the given list or
		 * have some ancestor in it.
		 *
		 * Note: "a/b/c" is deemed a child of the ancestors "a/b" and "a", but not "b" or "a/b/c/d".
		 *
		 * @param {string[]} aChildren - List of non-empty child paths (unmodified)
		 * @param {string[]} aAncestors - List of ancestor paths (unmodified)
		 * @param {object} mChildren - Hash set of child paths, maps string to <code>true</code>;
		 *   is modified
		 */
		addChildrenWithAncestor : function (aChildren, aAncestors, mChildren) {
			if (aAncestors.length) {
				aChildren.forEach(function (sPath) {
					var aSegments;

					if (aAncestors.indexOf(sPath) >= 0) {
						mChildren[sPath] = true;
						return;
					}

					aSegments = sPath.split("/");
					aSegments.pop();
					while (aSegments.length) {
						if (aAncestors.indexOf(aSegments.join("/")) >= 0) {
							mChildren[sPath] = true;
							break;
						}
						aSegments.pop();
					}
				});
			}
		},

		/**
		 * Adds the given paths to $select of the given query options.
		 *
		 * @param {object} mQueryOptions The query options
		 * @param {string[]} aSelectPaths The paths to add to $select
		 */
		addToSelect : function (mQueryOptions, aSelectPaths) {
			mQueryOptions.$select = mQueryOptions.$select || [];
			aSelectPaths.forEach(function (sPath) {
				if (mQueryOptions.$select.indexOf(sPath) < 0) {
					mQueryOptions.$select.push(sPath);
				}
			});
		},

		/**
		 * Recursively merges $select and $expand from mQueryOptions into mAggregatedQueryOptions.
		 * All other query options in mAggregatedQueryOptions remain untouched.
		 *
		 * @param {object} mAggregatedQueryOptions The aggregated query options
		 * @param {object} mQueryOptions The query options to merge into the aggregated query
		 *   options
		 */
		aggregateQueryOptions : function (mAggregatedQueryOptions, mQueryOptions) {
			if (mQueryOptions.$select) {
				_Helper.addToSelect(mAggregatedQueryOptions, mQueryOptions.$select);
			}
			if (mQueryOptions.$expand) {
				mAggregatedQueryOptions.$expand = mAggregatedQueryOptions.$expand || {};
				Object.keys(mQueryOptions.$expand).forEach(function (sPath) {
					if (mAggregatedQueryOptions.$expand[sPath]) {
						_Helper.aggregateQueryOptions(mAggregatedQueryOptions.$expand[sPath],
							mQueryOptions.$expand[sPath]);
					} else {
						mAggregatedQueryOptions.$expand[sPath] = mQueryOptions.$expand[sPath];
					}
				});
			}
		},

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
		 * buildPath("base", "('predicate')") --> "base('predicate')"
		 *
		 * @returns {string} a composite path built from all arguments
		 */
		buildPath : function () {
			var i,
				sPath = "",
				sSegment;

			for (i = 0; i < arguments.length; i += 1) {
				sSegment = arguments[i];
				if (sSegment || sSegment === 0) {
					if (sPath && sPath !== "/" && sSegment[0] !== "(") {
						sPath += "/";
					}
					sPath += sSegment;
				}
			}
			return sPath;
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
						aQuery.push(_Helper.encodePair(sKey, sItem));
					});
				} else {
					aQuery.push(_Helper.encodePair(sKey, vValue));
				}
			});

			return "?" + aQuery.join("&");
		},

		/**
		 * Returns a clone of the given value, according to the rules of
		 * <code>JSON.stringify</code>.
		 * <b>Warning: <code>Date</code> objects will be turned into strings</b>
		 *
		 * @param {*} vValue - Any value, including <code>undefined</code>
		 * @returns {*} - A clone
		 */
		clone : function clone(vValue) {
			return vValue === undefined || vValue === Infinity || vValue === -Infinity
				|| /*NaN?*/vValue !== vValue // eslint-disable-line no-self-compare
				? vValue
				: JSON.parse(JSON.stringify(vValue));
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
		 * @param {string} sMessage
		 *   The message for the <code>Error</code> instance; code and status text of the HTTP error
		 *   are appended
		 * @param {string} [sRequestUrl]
		 *   The request URL
		 * @param {string} [sResourcePath]
		 *   The path by which this resource has originally been requested
		 * @returns {Error}
		 *   An <code>Error</code> instance with the following properties:
		 *   <ul>
		 *     <li><code>error</code>: The "error" value from the OData V4 error response JSON
		 *     object (if available)
		 *     <li><code>isConcurrentModification</code>: <code>true</code> In case of a
		 *     concurrent modification detected via ETags (i.e. HTTP status code 412)
		 *     <li><code>message</code>: Error message
		 *     <li><code>requestUrl</code>: The request URL
		 *     <li><code>resourcePath</code>: The path by which this resource has originally been
		 *     requested
		 *     <li><code>status</code>: HTTP status code
		 *     <li><code>statusText</code>: (optional) HTTP status text
		 *   </ul>
		 * @see <a href=
		 * "http://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html"
		 * >"19 Error Response"</a>
		 */
		createError : function (jqXHR, sMessage, sRequestUrl, sResourcePath) {
			var sBody = jqXHR.responseText,
				sContentType = jqXHR.getResponseHeader("Content-Type"),
				oResult = new Error(sMessage + ": " + jqXHR.status + " " + jqXHR.statusText);

			oResult.status = jqXHR.status;
			oResult.statusText = jqXHR.statusText;
			oResult.requestUrl = sRequestUrl;
			oResult.resourcePath = sResourcePath;
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
					if (typeof oResult.message === "object") {
						// oResult.message is in OData V2 an object containing the human readable
						// error message in the property value
						oResult.message = oResult.error.message.value;
					}
				} catch (e) {
					Log.warning(e.toString(), sBody, sClassName);
				}
			} else if (sContentType === "text/plain") {
				oResult.message = sBody;
			}

			return oResult;
		},

		/**
		 * Returns a "get*" method corresponding to the given "fetch*" method.
		 *
		 * @param {string} sFetch
		 *   A "fetch*" method's name
		 * @param {boolean} [bThrow=false]
		 *   Whether the "get*" method throws if the promise is not (yet) fulfilled instead of just
		 *   returning <code>undefined</code> (Note:
		 *   {@link sap.ui.model.odata.v4.ODataMetaModel#getObject} intentionally never throws
		 *   because it is used for data binding)
		 * @returns {function}
		 *   A "get*" method returning the "fetch*" method's result or
		 *   <code>undefined</code> in case the promise is not (yet) fulfilled
		 */
		createGetMethod : function (sFetch, bThrow) {
			return function () {
				var oSyncPromise = this[sFetch].apply(this, arguments);

				if (oSyncPromise.isFulfilled()) {
					return oSyncPromise.getResult();
				} else if (bThrow) {
					if (oSyncPromise.isRejected()) {
						oSyncPromise.caught();
						throw oSyncPromise.getResult();
					} else {
						throw new Error("Result pending");
					}
				}
			};
		},

		/**
		 * Returns a "request*" method corresponding to the given "fetch*" method.
		 *
		 * @param {string} sFetch
		 *   A "fetch*" method's name
		 * @returns {function}
		 *   A "request*" method returning the "fetch*" method's result wrapped via
		 *   <code>Promise.resolve()</code>
		 */
		createRequestMethod : function (sFetch) {
			return function () {
				return Promise.resolve(this[sFetch].apply(this, arguments));
			};
		},

		/**
		 * Creates a technical details object that contains a property <code>originalMessage</code>.
		 *
		 * @param {object} oMessage
		 *   The message for which to get technical details
		 * @returns {object|undefined}
		 *    An object with a property <code>originalMessage</code> that contains a clone of either
		 *    the given message itself or if supplied, the "@$ui5.originalMessage" property.
		 *    If one of these is an <code>Error</code> instance, then <code>{}</code> is returned.
		 *    The clone is created lazily.
		 *
		 * @private
		 */
		createTechnicalDetails : function (oMessage) {
			var oClonedMessage,
				oOriginalMessage = oMessage["@$ui5.originalMessage"] || oMessage,
				oTechnicalDetails = {};

			// We don't need the original message for internal errors (errors NOT returned from the
			// back-end, but raised within our framework)
			if (!(oOriginalMessage instanceof Error)) {
				Object.defineProperty(oTechnicalDetails, "originalMessage", {
					enumerable : true,
					get : function () {
						if (!oClonedMessage) {
							// use publicClone to ensure that private "@$ui5._" instance annotations
							// never become public
							oClonedMessage = _Helper.publicClone(oOriginalMessage);
						}
						return oClonedMessage;
					}
				});
			}

			return oTechnicalDetails;
		},

		/**
		 * Deletes the private client-side instance annotation with the given unqualified name at
		 * the given object.
		 *
		 * @param {object} oObject
		 *   Any object
		 * @param {string} sAnnotation
		 *   The unqualified name of a private client-side instance annotation (hidden inside
		 *   namespace "@$ui5._")
		 */
		deletePrivateAnnotation : function (oObject, sAnnotation) {
			var oPrivateNamespace = oObject["@$ui5._"];

			if (oPrivateNamespace) {
				delete oPrivateNamespace[sAnnotation];
			}
		},

		/**
		 * Drills down into the given object according to <code>aPath</code>.
		 *
		 * @param {object} oData
		 *   The object to start at
		 * @param {string[]} aPath
		 *   Relative path to drill-down into, as array of segments
		 * @returns {*}
		 *   The result matching to <code>aPath</code> or <code>undefined</code> if the path leads
		 *   into void
		 */
		drillDown : function (oData, aPath) {
			return aPath.reduce(function (oData, sSegment) {
				return (oData && sSegment in oData) ? oData[sSegment] : undefined;
			}, oData);
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
			return _Helper.encode(sKey, true) + "=" + _Helper.encode(sValue, false);
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
				for (i = 0; i < aListeners.length; i += 1) {
					aListeners[i].onChange(vValue);
				}
			}
		},

		/**
		 * Iterates recursively over all properties of the given value and fires change events
		 * to all listeners. Also fires a change event for the object itself, for example in case of
		 * an advertised action.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the current value
		 * @param {object} oValue The value
		 * @param {boolean} bRemoved If true the value is assumed to have been removed and the
		 *   change event reports undefined as the new value
		 */
		fireChanges : function (mChangeListeners, sPath, oValue, bRemoved) {
			Object.keys(oValue).forEach(function (sProperty) {
				var sPropertyPath = _Helper.buildPath(sPath, sProperty),
					vValue = oValue[sProperty];

				if (vValue && typeof vValue === "object") {
					_Helper.fireChanges(mChangeListeners, sPropertyPath, vValue, bRemoved);
				} else {
					_Helper.fireChange(mChangeListeners, sPropertyPath,
						bRemoved ? undefined : vValue);
				}
			});

			_Helper.fireChange(mChangeListeners, sPath, bRemoved ? undefined : oValue);
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
		 * Returns a filter identifying the given instance via its key properties.
		 *
		 * @param {object} oInstance
		 *   Entity instance runtime data
		 * @param {string} sMetaPath
		 *   The absolute meta path of the given instance
		 * @param {object} mTypeForMetaPath
		 *   Maps meta paths to the corresponding entity or complex types
		 * @returns {string}
		 *   A filter using key properties, e.g. "Sector eq 'DevOps' and ID eq 42)", or undefined,
		 *   if at least one key property is undefined
		 * @throws {Error}
		 *   In case the entity type has no key properties according to metadata
		 */
		getKeyFilter : function (oInstance, sMetaPath, mTypeForMetaPath) {
			var aFilters = [],
				sKey,
				mKey2Value = _Helper.getKeyProperties(oInstance, sMetaPath, mTypeForMetaPath);

			if (!mKey2Value) {
				return undefined;
			}
			for (sKey in mKey2Value) {
				aFilters.push(sKey + " eq " + mKey2Value[sKey]);
			}

			return aFilters.join(" and ");
		},

		/**
		 * Returns the key predicate (see "4.3.1 Canonical URL") for the given entity using the
		 * given meta data.
		 *
		 * @param {object} oInstance
		 *   Entity instance runtime data
		 * @param {string} sMetaPath
		 *   The absolute meta path of the given instance
		 * @param {object} mTypeForMetaPath
		 *   Maps meta paths to the corresponding entity or complex types
		 * @returns {string}
		 *   The key predicate, e.g. "(Sector='DevOps',ID='42')" or "('42')", or undefined, if at
		 *   least one key property is undefined
		 * @throws {Error}
		 *   In case the entity type has no key properties according to metadata
		 */
		getKeyPredicate : function (oInstance, sMetaPath, mTypeForMetaPath) {
			var aKeyProperties = [],
				mKey2Value = _Helper.getKeyProperties(oInstance, sMetaPath, mTypeForMetaPath, true);

			if (!mKey2Value) {
				return undefined;
			}
			aKeyProperties = Object.keys(mKey2Value).map(function (sAlias, iIndex, aKeys) {
				var vValue = encodeURIComponent(mKey2Value[sAlias]);

				return aKeys.length === 1 ? vValue : encodeURIComponent(sAlias) + "=" + vValue;
			});

			return "(" + aKeyProperties.join(",") + ")";
		},

		/**
		 * Returns the key properties mapped to values from the given entity using the given
		 * meta data.
		 *
		 * @param {object} oInstance
		 *   Entity instance runtime data
		 * @param {string} sMetaPath
		 *   The absolute meta path of the given instance
		 * @param {object} mTypeForMetaPath
		 *   Maps meta paths to the corresponding entity or complex types
		 * @param {boolean} [bReturnAlias=false]
		 *   Whether to return the aliases instead of the keys
		 * @returns {object}
		 *   The key properties map. For the meta data
		 *   <Key>
		 *    <PropertyRef Name="Info/ID" Alias="EntityInfoID"/>
		 *   </Key>
		 *   the following map is returned:
		 *   - {EntityInfoID : 42}, if bReturnAlias = true;
		 *   - {"Info/ID" : 42}, if bReturnAlias = false;
		 *   - undefined, if at least one key property is undefined.
		 * @throws {Error}
		 *   In case the entity type has no key properties according to metadata
		 */
		getKeyProperties : function (oInstance, sMetaPath, mTypeForMetaPath, bReturnAlias) {
			var bFailed,
				mKey2Value = {};

			bFailed = mTypeForMetaPath[sMetaPath].$Key.some(function (vKey) {
				var sKey, sKeyPath, aPath, sPropertyName, oType, vValue;

				if (typeof vKey === "string") {
					sKey = sKeyPath = vKey;
				} else {
					sKey = Object.keys(vKey)[0]; // alias
					sKeyPath = vKey[sKey];
					if (!bReturnAlias) {
						sKey = sKeyPath;
					}
				}
				aPath = sKeyPath.split("/");

				vValue = _Helper.drillDown(oInstance, aPath);
				if (vValue === undefined) {
					return true;
				}

				// the last path segment is the name of the simple property
				sPropertyName = aPath.pop();
				// find the type containing the simple property
				oType = mTypeForMetaPath[_Helper.buildPath(sMetaPath, aPath.join("/"))];
				vValue = _Helper.formatLiteral(vValue, oType[sPropertyName].$Type);
				mKey2Value[sKey] = vValue;
			});

			return bFailed ? undefined : mKey2Value;
		},

		/**
		 * Returns the OData metadata model path corresponding to the given OData data model path.
		 * May also be used on relative paths.
		 *
		 * Examples:
		 * getMetaPath("/EMPLOYEES/0/ENTRYDATE") --> "/EMPLOYEES/ENTRYDATE"
		 * getMetaPath("/EMPLOYEES('42')/ENTRYDATE") --> "/EMPLOYEES/ENTRYDATE"
		 * getMetaPath("0/ENTRYDATE") --> "ENTRYDATE"
		 * getMetaPath("('42')/ENTRYDATE") --> "ENTRYDATE"
		 *
		 * @param {string} sPath
		 *   A data path within the OData data model
		 * @returns {string}
		 *   The corresponding metadata path within the OData metadata model
		 */
		getMetaPath : function (sPath) {
			if (sPath[0] === "/") {
				return sPath.replace(rNotMetaContext, "");
			}
			if (sPath[0] !== "(") {
				sPath = "/" + sPath;
			}
			return sPath.replace(rNotMetaContext, "").slice(1);
		},

		/**
		 * Returns the value of the private client-side instance annotation with the given
		 * unqualified name at the given object.
		 *
		 * @param {object} oObject
		 *   Any object
		 * @param {string} sAnnotation
		 *   The unqualified name of a private client-side instance annotation (hidden inside
		 *   namespace "@$ui5._")
		 * @returns {any}
		 *   The annotation's value or <code>undefined</code> if no such annotation exists (e.g.
		 *   because the private namespace object does not exist)
		 */
		getPrivateAnnotation : function (oObject, sAnnotation) {
			var oPrivateNamespace = oObject["@$ui5._"];

			return oPrivateNamespace && oPrivateNamespace[sAnnotation];
		},

		/**
		 * Returns the query options corresponding to the given path.
		 *
		 * @param {object} [mQueryOptions]
		 *   A map of query options as returned by
		 *   {@link sap.ui.model.odata.v4.ODataModel#buildQueryOptions}
		 * @param {string} sPath
		 *   The path of the cache value in the cache
		 * @returns {object}
		 *   The corresponding query options (live reference, no clone!); may be empty, but not
		 *   falsy
		 */
		getQueryOptionsForPath : function (mQueryOptions, sPath) {
			sPath = _Helper.getMetaPath(sPath);
			if (sPath) {
				sPath.split("/").some(function (sSegment) {
					mQueryOptions = mQueryOptions && mQueryOptions.$expand
						&& mQueryOptions.$expand[sSegment];
					if (!mQueryOptions || mQueryOptions === true) {
						mQueryOptions = {};
						return true;
					}
				});
			}

			return mQueryOptions || {};
		},

		/**
		 * Returns the relative path for a given absolute path by stripping off the base path. Note
		 * that the resulting path may start with a key predicate.
		 *
		 * Examples: (The base path is "/foo/bar"):
		 * "/foo/bar/baz" -> "baz"
		 * "/foo/bar('baz')" -> "('baz')"
		 * "/foo/bar" -> ""
		 * "/foo/barolo" -> undefined
		 * "/foo" -> undefined
		 *
		 * @param {string} sPath
		 *   An absolute path
		 * @param {string} sBasePath
		 *   The absolute base path to strip off
		 * @returns {string}
		 *   The path relative to the base path or <code>undefined</code> if the path does not start
		 *   with the base path
		 *
		 * @private
		 */
		getRelativePath : function (sPath, sBasePath) {
			if (!sPath.startsWith(sBasePath)) {
				return undefined;
			}
			sPath = sPath.slice(sBasePath.length);
			if (sPath) {
				if (sPath[0] === "/") {
					return sPath.slice(1);
				}
				if (sPath[0] !== "(") {
					return undefined;
				}
			}
			return sPath;
		},

		/**
		 * Tells whether the given object has a private client-side instance annotation with the
		 * given unqualified name (no matter what the value is).
		 *
		 * @param {object} oObject
		 *   Any object
		 * @param {string} sAnnotation
		 *   The unqualified name of a private client-side instance annotation (hidden inside
		 *   namespace "@$ui5._")
		 * @returns {boolean}
		 *   Whether such an annotation exists
		 */
		hasPrivateAnnotation : function (oObject, sAnnotation) {
			var oPrivateNamespace = oObject["@$ui5._"];

			return oPrivateNamespace ? sAnnotation in oPrivateNamespace : false;
		},

		/**
		 * Fires change events for all properties that differ between the old and the new value.
		 * The function recursively handles modified, added or removed structural properties
		 * and fires change events for all modified/added/removed primitive properties therein.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of both values in mChangeListeners
		 * @param {any} vOld The old value
		 * @param {any} vNew The new value
		 *
		 * @private
		 */
		informAll : function (mChangeListeners, sPath, vOld, vNew) {
			if (vNew === vOld) {
				return;
			}

			if (vNew && typeof vNew === "object") {
				Object.keys(vNew).forEach(function (sProperty) {
					_Helper.informAll(mChangeListeners, _Helper.buildPath(sPath, sProperty),
						vOld && vOld[sProperty], vNew[sProperty]);
				});
			} else {
				// must fire null to guarantee that a property binding has not
				// this.vValue === undefined, see ODataPropertyBinding.setValue
				_Helper.fireChange(mChangeListeners, sPath,  vNew === undefined ? null : vNew);
				vNew = {};
			}

			if (vOld && typeof  vOld === "object") {
				Object.keys(vOld).forEach(function (sProperty) {
					// not covered in the new value
					if (!vNew.hasOwnProperty(sProperty)) {
						_Helper.informAll(mChangeListeners, _Helper.buildPath(sPath, sProperty),
							vOld[sProperty], undefined);
					}
				});
			}
		},

		/**
		 * Returns a copy of given query options where "$expand" and "$select" are replaced by the
		 * intersection with the given (navigation) property paths.
		 *
		 * @param {object} [mCacheQueryOptions]
		 *   A map of query options as returned by
		 *   {@link sap.ui.model.odata.v4.ODataModel#buildQueryOptions}
		 * @param {string[]} aPaths
		 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
		 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be
		 *   loaded because they may have changed due to side effects of a previous update; must not
		 *   be empty
		 * @param {function} fnFetchMetadata
		 *   Function which fetches metadata for a given meta path
		 * @param {string} sRootMetaPath
		 *   The meta path for the cache root's type, for example "/SalesOrderList/SO_2_BP" or
		 *   "/Artists/foo.EditAction/@$ui5.overload/0/$ReturnType/$Type", such that an OData simple
		 *   identifier may be appended
		 * @param {object} mNavigationPropertyPaths
		 *   Hash set of collection-valued navigation property meta paths (relative to the cache's
		 *   root, that is without the root meta path prefix) which need to be refreshed, maps
		 *   string to <code>true</code>; is modified
		 * @param {string} [sPrefix=""]
		 *   Optional prefix for navigation property meta paths used during recursion
		 * @param {boolean} [bAllowEmptySelect]
		 *   Whether an empty "$select" is allowed
		 * @returns {object}
		 *   The updated query options or <code>null</code> if no request is needed
		 * @throws {Error}
		 *   If a path string is empty or the intersection requires a "$expand" of a
		 *   collection-valued navigation property
		 */
		intersectQueryOptions : function (mCacheQueryOptions, aPaths, fnFetchMetadata,
				sRootMetaPath, mNavigationPropertyPaths, sPrefix, bAllowEmptySelect) {
			var aExpands = [],
				mExpands = {},
				mResult,
				aSelects,
				mSelects = {};

			/*
			 * Filter where only structural properties pass through.
			 *
			 * @param {boolean} bSkipFirstSegment
			 *   Whether first segment of the path is known to be a structural property
			 * @param {string} sMetaPath
			 *   A meta path relative to the cache's root
			 * @returns {boolean}
			 *   Whether the given meta path contains only structural properties
			 */
			function filterStructural(bSkipFirstSegment, sMetaPath) {
				var aSegments = sMetaPath.split("/");

				return aSegments.every(function (sSegment, i) {
					return i === 0 && bSkipFirstSegment
						|| fnFetchMetadata(
								sRootMetaPath + "/" + aSegments.slice(0, i + 1).join("/")
							).getResult().$kind === "Property";
				});
			}

			if (aPaths.indexOf("") >= 0) {
				throw new Error("Unsupported empty navigation property path");
			}

			if (mCacheQueryOptions && mCacheQueryOptions.$select
					&& mCacheQueryOptions.$select.indexOf("*") < 0) {
				_Helper.addChildrenWithAncestor(aPaths, mCacheQueryOptions.$select, mSelects);
				_Helper.addChildrenWithAncestor(mCacheQueryOptions.$select, aPaths, mSelects);
				aSelects = Object.keys(mSelects).filter(filterStructural.bind(null, true));
			} else {
				aSelects = aPaths.filter(filterStructural.bind(null, false));
			}

			if (mCacheQueryOptions && mCacheQueryOptions.$expand) {
				aExpands = Object.keys(mCacheQueryOptions.$expand);
				aExpands.forEach(function (sNavigationPropertyPath) {
					var mChildQueryOptions,
						sMetaPath = sRootMetaPath + "/" + sNavigationPropertyPath,
						sPrefixedNavigationPropertyPath
							= _Helper.buildPath(sPrefix, sNavigationPropertyPath),
						mSet = {},
						aStrippedPaths;

					_Helper.addChildrenWithAncestor([sNavigationPropertyPath], aPaths, mSet);
					if (!isEmptyObject(mSet)) {
						if (fnFetchMetadata(sMetaPath).getResult().$isCollection) {
							mNavigationPropertyPaths[sPrefixedNavigationPropertyPath] = true;
						}
						// complete navigation property may change, same expand as initially
						mExpands[sNavigationPropertyPath]
							= mCacheQueryOptions.$expand[sNavigationPropertyPath];
						return;
					}

					aStrippedPaths = _Helper.stripPathPrefix(sNavigationPropertyPath, aPaths);
					if (aStrippedPaths.length) {
						if (fnFetchMetadata(sMetaPath).getResult().$isCollection) {
							throw new Error("Unsupported collection-valued navigation property "
								+ sMetaPath);
						}
						// details of the navigation property may change, compute intersection
						// recursively
						mChildQueryOptions = _Helper.intersectQueryOptions(
							mCacheQueryOptions.$expand[sNavigationPropertyPath] || {},
							aStrippedPaths, fnFetchMetadata,
							sRootMetaPath + "/" + sNavigationPropertyPath,
							mNavigationPropertyPaths, sPrefixedNavigationPropertyPath);
						if (mChildQueryOptions) {
							mExpands[sNavigationPropertyPath] = mChildQueryOptions;
						}
					}
				});
			}

			if (!aSelects.length && isEmptyObject(mExpands)) {
				return null;
			}

			if (!aSelects.length && !bAllowEmptySelect) {
				// avoid $select= in URL, use any navigation property
				aSelects = Object.keys(mExpands).slice(0, 1);
			}

			mResult = Object.assign({}, mCacheQueryOptions, {$select : aSelects});
			if (isEmptyObject(mExpands)) {
				delete mResult.$expand;
			} else {
				mResult.$expand = mExpands;
			}

			return mResult;
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
		 * Make the given URL absolute using the given base URL. The URLs must not contain a host
		 * or protocol part. Ensures that key predicates are not %-encoded.
		 *
		 * @param {string} sUrl
		 *   The URL
		 * @param {string} sBase
		 *   The base URL
		 * @returns {string}
		 *   The absolute URL
		 */
		makeAbsolute : function (sUrl, sBase) {
			return new URI(sUrl).absoluteTo(sBase).toString()
				.replace(rEscapedTick, "'")
				.replace(rEscapedOpenBracket, "(")
				.replace(rEscapedCloseBracket, ")");
		},

		// Trampoline property to allow for mocking function module in unit tests.
		// @see sap.base.util.merge
		merge : merge,

		/**
		 * Merges the given values for "$orderby" and "$filter" into the given map of query options.
		 * Ensures that the original map is left unchanged, but creates a copy only if necessary.
		 *
		 * @param {object} [mQueryOptions]
		 *   The map of query options
		 * @param {string} [sOrderby]
		 *   The new value for the query option "$orderby"
		 * @param {string} [sFilter]
		 *   The new value for the query option "$filter"
		 * @returns {object}
		 *   The merged map of query options
		 */
		mergeQueryOptions : function (mQueryOptions, sOrderby, sFilter) {
			var mResult;

			function set(sProperty, sValue) {
				if (sValue && (!mQueryOptions || mQueryOptions[sProperty] !== sValue)) {
					if (!mResult) {
						mResult = mQueryOptions ? _Helper.clone(mQueryOptions) : {};
					}
					mResult[sProperty] = sValue;
				}
			}

			set("$orderby", sOrderby);
			set("$filter", sFilter);
			return mResult || mQueryOptions;
		},

		/**
		 * Determines the namespace of the given qualified name or annotation target.
		 *
		 * @param {string} sName
		 *   The qualified name or annotation target
		 * @returns {string}
		 *   The namespace
		 */
		namespace : function (sName) {
			var iIndex;

			sName = sName
				// consider only the first path segment
				.split("/")[0]
				// remove signature if sName is an annotation target in 4.01 syntax like
				// special.cases.Create(Collection(special.cases.ArtistsType))/Countryoforigin
				.split("(")[0];

			// now we have a qualified name, drop the last segment (the name)
			iIndex = sName.lastIndexOf(".");

			return iIndex < 0 ? "" : sName.slice(0, iIndex);
		},

		/**
		 * Parses a literal to the model value. The types "Edm.Binary" and "Edm.String" are
		 * unsupported.
		 *
		 * @param {string} sLiteral The literal value
		 * @param {string} sType The type
		 * @param {string} sPath The path for this literal (for error messages)
		 * @returns {*} The model value
		 * @throws {Error} If the type is invalid or unsupported; the function only validates when a
		 *   conversion is required
		 */
		parseLiteral : function (sLiteral, sType, sPath) {

			function checkNaN(nValue) {
				if (!isFinite(nValue)) { // this rejects NaN, Infinity, -Infinity
					throw new Error(sPath + ": Not a valid " + sType + " literal: " + sLiteral);
				}
				return nValue;
			}

			if (sLiteral === "null") {
				return null;
			}

			switch (sType) {
			case "Edm.Boolean":
				return sLiteral === "true";
			case "Edm.Byte":
			case "Edm.Int16":
			case "Edm.Int32":
			case "Edm.SByte":
				return checkNaN(parseInt(sLiteral));
			case "Edm.Date":
			case "Edm.DateTimeOffset":
			case "Edm.Decimal":
			case "Edm.Guid":
			case "Edm.Int64":
			case "Edm.TimeOfDay":
				return sLiteral;
			case "Edm.Double":
			case "Edm.Single":
				return sLiteral === "INF" || sLiteral === "-INF" || sLiteral === "NaN"
					? sLiteral
					: checkNaN(parseFloat(sLiteral));
			default:
				throw new Error(sPath + ": Unsupported type: " + sType);
			}
		},

		/**
		 * Returns a clone of the given value where the private namespace object has been deleted.
		 *
		 * @param {any} vValue
		 *   Any value, including <code>undefined</code>
		 * @returns {any}
		 *   A public clone
		 *
		 * @see sap.ui.model.odata.v4.lib._Helper.clone
		 */
		publicClone : function (vValue) {
			var vClone = _Helper.clone(vValue);

			if (vClone) {
				delete vClone["@$ui5._"];
			}
			return vClone;
		},

		/**
		 * Removes an item from the given map by path.
		 *
		 * @param {object} mMap
		 *   A map from path to a list of items
		 * @param {string} sPath
		 *   The path
		 * @param {object} oItem
		 *   The item
		 */
		removeByPath : function (mMap, sPath, oItem) {
			var aItems = mMap[sPath],
				iIndex;

			if (aItems) {
				iIndex = aItems.indexOf(oItem);
				if (iIndex >= 0) {
					if (aItems.length === 1) {
						delete mMap[sPath];
					} else {
						aItems.splice(iIndex, 1);
					}
				}
			}
		},

		/**
		 * Resolves the "If-Match" header in the given map of request-specific headers.
		 * For lazy determination of the ETag, the "If-Match" header may contain an object
		 * containing the current ETag. If needed create a copy of the given map and replace the
		 * value of the "If-Match" header by the current ETag.
		 *
		 * @param {object} [mHeaders]
		 *   Map of request-specific headers.
		 * @returns {object}
		 *   The map of request-specific headers with the resolved If-Match header.
		 */
		resolveIfMatchHeader : function (mHeaders) {
			var vIfMatchValue = mHeaders && mHeaders["If-Match"];

			if (vIfMatchValue && typeof vIfMatchValue === "object") {
				vIfMatchValue = vIfMatchValue["@odata.etag"];
				mHeaders = Object.assign({}, mHeaders);
				if (vIfMatchValue === undefined) {
					delete mHeaders["If-Match"];
				} else {
					mHeaders["If-Match"] = vIfMatchValue;
				}
			}
			return mHeaders;
		},

		/**
		 * Adds the key properties of the given entity type to $select of the given query options.
		 *
		 * @param {object} mQueryOptions
		 *   The query options
		 * @param {object} oType
		 *   The entity type's metadata "JSON"
		 */
		selectKeyProperties : function (mQueryOptions, oType) {
			if (oType && oType.$Key) {
				_Helper.addToSelect(mQueryOptions, oType.$Key.map(function (vKey) {
					if (typeof vKey === "object") {
						return vKey[Object.keys(vKey)[0]];
					}
					return vKey;
				}));
			}
		},

		/**
		 * Sets the new value of the private client-side instance annotation with the given
		 * unqualified name at the given object.
		 *
		 * @param {object} oObject
		 *   Any object
		 * @param {string} sAnnotation
		 *   The unqualified name of a private client-side instance annotation (hidden inside
		 *   namespace "@$ui5._")
		 * @param {any} vValue
		 *   The annotation's new value; <code>undefined</code> is a valid value
		 */
		setPrivateAnnotation : function (oObject, sAnnotation, vValue) {
			var oPrivateNamespace = oObject["@$ui5._"];

			if (!oPrivateNamespace) {
				oPrivateNamespace = oObject["@$ui5._"] = {};
			}
			oPrivateNamespace[sAnnotation] = vValue;
		},

		/**
		 * Strips the given prefix from all given paths. If a path does not start with the prefix,
		 * it is ignored (note that "A" is not a path prefix of "AA", but of "A/A").
		 * A remainder never starts with a slash and may well be empty.
		 *
		 * @param {string} sPrefix
		 *   A prefix (which must not end with a slash); "" is a path prefix of each path
		 * @param {string[]} aPaths
		 *   A list of paths
		 * @returns {string[]}
		 *   The list of remainders for all paths which start with the given prefix
		 */
		stripPathPrefix : function (sPrefix, aPaths) {
			var sPathPrefix = sPrefix + "/";

			if (sPrefix === "") {
				return aPaths;
			}

			return aPaths.filter(function (sPath) {
				return sPath === sPrefix || sPath.startsWith(sPathPrefix);
			}).map(function (sPath) {
				return sPath.slice(sPathPrefix.length);
			});
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

		// Trampoline property to allow for mocking function module in unit tests.
		// @see sap.base.util.uid
		uid : uid,

		/**
		 * Updates the target object with the source object. All properties of the source object are
		 * taken into account. Fires change events for all changed properties. The function
		 * recursively handles modified, added or removed structural properties and fires change
		 * events for all modified/added/removed primitive properties therein.
		 *
		 * Restrictions:
		 * - oTarget and oSource are expected to have the same structure; when there is an
		 *   object at a given path in either of them, the other one must have an object or
		 *   <code>null</code>.
		 * - no change events for collection-valued properties
		 * - does not update collection-valued navigation properties
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the old object in mChangeListeners
		 * @param {object} oTarget The target object
		 * @param {object} oSource The source object
		 * @returns {object} The target object
		 */
		updateAll : function (mChangeListeners, sPath, oTarget, oSource) {
			Object.keys(oSource).forEach(function (sProperty) {
				var sPropertyPath = _Helper.buildPath(sPath, sProperty),
					vSourceProperty = oSource[sProperty],
					vTargetProperty = oTarget[sProperty];

				if (sProperty === "@$ui5._") {
					_Helper.setPrivateAnnotation(oTarget, "predicate",
						_Helper.getPrivateAnnotation(oSource, "predicate"));
				} else if (Array.isArray(vSourceProperty)) {
					// copy complete collection; no change events as long as collection-valued
					// properties are not supported
					oTarget[sProperty] = vSourceProperty;
				} else if (vSourceProperty && typeof vSourceProperty === "object") {
					oTarget[sProperty]
						= _Helper.updateAll(mChangeListeners, sPropertyPath, vTargetProperty || {},
								vSourceProperty);
				} else if (vTargetProperty !== vSourceProperty) {
					oTarget[sProperty] = vSourceProperty;
					if (vTargetProperty && typeof vTargetProperty === "object") {
						_Helper.fireChanges(mChangeListeners, sPropertyPath, vTargetProperty, true);
					} else {
						_Helper.fireChange(mChangeListeners, sPropertyPath, vSourceProperty);
					}
				}
			});

			return oTarget;
		},

		/**
		 * Updates the old object with the new object. Only existing properties of the old object
		 * are updated. Fires change events for all changed properties. The function recursively
		 * handles modified, added or removed structural properties and fires change events for all
		 * modified/added/removed primitive properties therein. Also fires change events for new
		 * advertised actions.
		 *
		 * Restrictions:
		 * - oOldObject and oNewObject are expected to have the same structure; when there is an
		 *   object at a given path in either of them, the other one must have an object or
		 *   <code>null</code>.
		 * - no change events for collection-valued properties
		 * - does not update collection-valued navigation properties
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the old object in mChangeListeners
		 * @param {object} oOldObject The old object
		 * @param {object} [oNewObject] The new object
		 */
		updateExisting : function (mChangeListeners, sPath, oOldObject, oNewObject) {
			if (!oNewObject) {
				return;
			}

			// iterate over all properties in the old object
			Object.keys(oOldObject).forEach(function (sProperty) {
				var sPropertyPath = _Helper.buildPath(sPath, sProperty),
					vOldProperty = oOldObject[sProperty],
					vNewProperty = oNewObject[sProperty];

				if (sProperty in oNewObject || sProperty[0] === "#") {
					if (Array.isArray(vNewProperty)) {
						// copy complete collection; no change events as long as collection-valued
						// properties are not supported
						oOldObject[sProperty] = vNewProperty;
					} else if (vNewProperty && typeof vNewProperty === "object") {
						if (vOldProperty) {
							// a structural property was modified
							_Helper.updateExisting(mChangeListeners, sPropertyPath, vOldProperty,
								vNewProperty);
						} else {
							// a structural property was added; copy the whole structure because we
							// cannot tell which primitive properties are required therein
							oOldObject[sProperty] = vNewProperty;
							_Helper.fireChanges(mChangeListeners, sPropertyPath, vNewProperty,
								false);
						}
					} else if (vOldProperty !== vNewProperty) {
						oOldObject[sProperty] = vNewProperty;
						if (vOldProperty && typeof vOldProperty === "object") {
							// a structural property was removed
							_Helper.fireChanges(mChangeListeners, sPropertyPath, vOldProperty,
								true);
						} else {
							_Helper.fireChange(mChangeListeners, sPropertyPath, vNewProperty);
						}
					}
				}
			});

			// iterate over all new advertised actions
			Object.keys(oNewObject).filter(function (sProperty) {
				return sProperty[0] === "#";
			}).filter(function (sAdvertisedAction) {
				return !(sAdvertisedAction in oOldObject);
			}).forEach(function (sNewAdvertisedAction) {
				var vNewProperty = oNewObject[sNewAdvertisedAction],
					sPropertyPath = _Helper.buildPath(sPath, sNewAdvertisedAction);

				// a structural property was added
				oOldObject[sNewAdvertisedAction] = vNewProperty;
				_Helper.fireChanges(mChangeListeners, sPropertyPath, vNewProperty, false);
			});
		},

		/**
		 * Updates the old value with the given new value for the selected properties (see
		 * {@link #updateExisting}). If no selected properties are given or if "*" is contained in
		 * the selected properties, then all properties are selected. <code>@odata.etag</code> is
		 * always selected. Fires change events for all changed properties.
		 *
		 * Restrictions:
		 * - oOldValue and oNewValue are expected to have the same structure; when there is an
		 *   object at a given path in either of them, the other one must have an object or
		 *   <code>null</code>.
		 * - "*" in aSelect does not work correctly if oNewValue contains navigation properties
		 * - no change events for collection-valued properties
		 * - does not update navigation properties
		 *
		 * @param {object} mChangeListeners
		 *   A map of change listeners by path
		 * @param {string} sPath
		 *   The path of oOldValue in mChangeListeners
		 * @param {object} oOldValue
		 *   The old value
		 * @param {object} oNewValue
		 *   The new value
		 * @param {string[]} [aSelect]
		 *   The relative paths to properties to be updated in oOldValue; default is all properties
		 *   from oNewValue
		 */
		updateSelected : function (mChangeListeners, sPath, oOldValue, oNewValue, aSelect) {
			var sPredicate;

			/*
			 * Take over the property value from source to target and fires an event if the property
			 * is changed
			 * @param {string} sPropertyPath The property path
			 * @param {object} oSource The source object
			 * @param {object} oTarget The target object
			 */
			function copyPathValue(sPropertyPath, oSource, oTarget) {
				var aSegments = sPropertyPath.split("/");

				aSegments.every(function (sSegment, iIndex) {
					var vSourceProperty = oSource[sSegment],
						vTargetProperty = oTarget[sSegment];

					if (Array.isArray(vSourceProperty)) {
						// copy complete collection; no change events as long as collection-valued
						// properties are not supported
						oTarget[sSegment] = vSourceProperty;
					} else if (vSourceProperty && typeof vSourceProperty === "object") {
						oTarget = oTarget[sSegment] = vTargetProperty || {};
						oSource = vSourceProperty;
						return true;
					} else if (vTargetProperty !== vSourceProperty) {
						oTarget[sSegment] = vSourceProperty;
						if (vTargetProperty && typeof vTargetProperty === "object") {
							_Helper.fireChanges(mChangeListeners,
								_Helper.buildPath(sPath, aSegments.slice(0, iIndex + 1).join("/")),
								vTargetProperty, true);
						} else if (iIndex === aSegments.length - 1) {
							_Helper.fireChange(mChangeListeners,
								_Helper.buildPath(sPath, sPropertyPath), vSourceProperty);
						}
						// else a change from undefined to null where an object is expected along a
						// property path from aSelect
					}
					return false;
				});
			}

			if (!aSelect || aSelect.indexOf("*") >= 0) {
				// no individual properties selected, fetch all properties of the new value
				_Helper.updateAll(mChangeListeners, sPath, oOldValue, oNewValue);
				return;
			}

			// fetch the selected properties plus the ETag;
			// _Cache#visitResponse is called with the response data before updateSelected
			// copies the selected values to the cache. visitResponse computes
			// - $count values for collections, which are not relevant for POST (deep create is
			//   not yet supported);
			// - key predicates, which are relevant only for the top level element as no deep
			//   create is supported
			// and reports bound messages. Messages need to be copied only if they are selected.
			aSelect = aSelect.concat("@odata.etag");

			// take over properties from the new value and fire change events
			aSelect.forEach(function (sProperty) {
				copyPathValue(sProperty, oNewValue, oOldValue);
			});
			// copy key predicate, but do not fire change event
			sPredicate = _Helper.getPrivateAnnotation(oNewValue, "predicate");
			if (sPredicate) {
				_Helper.setPrivateAnnotation(oOldValue, "predicate", sPredicate);
			}
		},

		/**
		 * Updates certain transient paths from the given map, replacing the given transient
		 * predicate with the given key predicate.
		 *
		 * @param {object} mMap
		 *   A map from path to anything
		 * @param {string} sTransientPredicate
		 *   A (temporary) key predicate for the transient entity: "($uid=...)"
		 * @param {string} sPredicate
		 *   The key predicate
		 */
		updateTransientPaths : function (mMap, sTransientPredicate, sPredicate) {
			var sPath;

			for (sPath in mMap) {
				if (sPath.includes(sTransientPredicate)) {
					// A path may contain multiple different transient predicates ($uid=...) but a
					// certain transient predicate can only be once in the path and cannot collide
					// with an identifier (keys must not start with $) and with a value of a key
					// predicate (they are encoded by encodeURIComponent which encodes $ with %24
					// and = with %3D)
					mMap[sPath.replace(sTransientPredicate, sPredicate)] = mMap[sPath];
					delete mMap[sPath];
				}
			}
		},

		/**
		 * Creates the query options for a child binding with the meta path given by its base
		 * meta path and relative meta path. Adds the key properties to $select of all expanded
		 * navigation properties. Requires that meta data for the meta path is already loaded so
		 * that synchronous access to all prefixes of the relative meta path is possible.
		 * If the relative meta path contains segments which are not a structural property or a
		 * navigation property, the child query options cannot be created and the method returns
		 * undefined.
		 *
		 * @param {string} sBaseMetaPath
		 *   The meta path which is the starting point for the relative meta path
		 * @param {string} sChildMetaPath
		 *   The relative meta path
		 * @param {object} mChildQueryOptions
		 *   The child binding's query options
		 * @param {function} fnFetchMetadata
		 *   Function which fetches metadata for a given meta path
		 *
		 * @returns {object} The query options for the child binding or <code>undefined</code> in
		 *   case the query options cannot be created, e.g. because $apply cannot be wrapped into
		 *   $expand
		 */
		wrapChildQueryOptions : function (sBaseMetaPath, sChildMetaPath, mChildQueryOptions,
				fnFetchMetadata) {
			var sExpandSelectPath = "",
				i,
				aMetaPathSegments = sChildMetaPath.split("/"),
				oProperty,
				sPropertyMetaPath = sBaseMetaPath,
				mQueryOptions = {},
				mQueryOptionsForPathPrefix = mQueryOptions;

			if (sChildMetaPath === "") {
				return mChildQueryOptions;
			}

			for (i = 0; i < aMetaPathSegments.length; i += 1) {
				sPropertyMetaPath = _Helper.buildPath(sPropertyMetaPath, aMetaPathSegments[i]);
				sExpandSelectPath = _Helper.buildPath(sExpandSelectPath, aMetaPathSegments[i]);
				oProperty = fnFetchMetadata(sPropertyMetaPath).getResult();
				if (oProperty.$kind === "NavigationProperty") {
					mQueryOptionsForPathPrefix.$expand = {};
					mQueryOptionsForPathPrefix
						= mQueryOptionsForPathPrefix.$expand[sExpandSelectPath]
						= (i === aMetaPathSegments.length - 1) // last segment in path
							? mChildQueryOptions
							: {};
					_Helper.selectKeyProperties(mQueryOptionsForPathPrefix,
						fnFetchMetadata(sPropertyMetaPath + "/").getResult());
					sExpandSelectPath = "";
				} else if (oProperty.$kind !== "Property") {
					return undefined;
				}
			}
			if (oProperty.$kind === "Property") {
				if (Object.keys(mChildQueryOptions).length > 0) {
					Log.error("Failed to enhance query options for auto-$expand/$select as the"
							+ " child binding has query options, but its path '" + sChildMetaPath
							+ "' points to a structural property",
						JSON.stringify(mChildQueryOptions), sClassName);
					return undefined;
				}
				_Helper.addToSelect(mQueryOptionsForPathPrefix, [sExpandSelectPath]);
			}
			if ("$apply" in mChildQueryOptions) {
				Log.debug("Cannot wrap $apply into $expand: " + sChildMetaPath,
					JSON.stringify(mChildQueryOptions), sClassName);
				return undefined;
			}
			return mQueryOptions;
		}
	};

	return _Helper;
}, /* bExport= */false);