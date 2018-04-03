/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Helper
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/thirdparty/URI"
], function (jQuery, URI) {
	"use strict";

	var rAmpersand = /&/g,
		rEquals = /\=/g,
		rEscapedCloseBracket = /%29/g,
		rEscapedOpenBracket = /%28/g,
		rEscapedTick = /%27/g,
		rHash = /#/g,
		// matches the rest of a segment after '(' and any segment that consists only of a number
		rNotMetaContext = /\([^/]*|\/-?\d+/g,
		rNumber = /^-?\d+$/,
		rPlus = /\+/g,
		rSingleQuote = /'/g,
		Helper;

	Helper = {
		/**
		 * Builds the value for a "$apply" system query option based on the given data aggregation
		 * information. The value is "groupby((&lt;dimension_1,...,dimension_N,unit_or_text_1,...,
		 * unit_or_text_K>),aggregate(&lt;measure> with &lt;method> as &lt;alias>, ...))" where the
		 * "aggregate" part is only present if measures are given and both "with" and "as" are
		 * optional. If at least one measure requesting a "min" or "max" value is contained, the
		 * resulting $apply looks like: "groupby((&lt;dimension_1,...,dimension_N,unit_or_text_1,
		 * ...,unit_or_text_K>),aggregate(&lt;measure> with &lt;method> as &lt;alias>, ...))
		 * /concat(aggregate(&lt;measure> with min as UI5min__&lt;measure>,&lt;measure_1> with max
		 * as UI5max__&lt;measure_1>,),identity)"
		 *
		 * @param {object[]} aAggregation
		 *   An array with objects holding the information needed for data aggregation; see also
		 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
		 *   Extension for Data Aggregation Version 4.0</a>
		 * @param {string} aAggregation[].name
		 *   The name of an OData property. Each property must be either a dimension or a measure,
		 *   see below.
		 * @param {boolean} [aAggregation[].grouped]
		 *   Its presence is used to detect a dimension
		 * @param {boolean} [aAggregation[].total]
		 *   Its presence is used to detect a measure
		 * @param {boolean} [aAggregation[].max]
		 *   Measures only: Whether the maximum value for this measure is needed
		 * @param {boolean} [aAggregation[].min]
		 *   Measures only: Whether the minimum value for this measure is needed
		 * @param {string} [aAggregation[].unit]
		 *   Measures only: The name of this measure's unit property
		 * @param {string} [aAggregation[].with]
		 *   Measures only: The name of the method (for example "sum") used for aggregation of this
		 *   measure; see "3.1.2 Keyword with"
		 * @param {string} [aAggregation[].as]
		 *   Measures only: The alias, that is the name of the dynamic property used for
		 *   aggregation of this measure; see "3.1.1 Keyword as"
		 * @param {object} [mAlias2MeasureAndMethod]
		 *   An optional map which is filled in case a measure requests minimum or maximum values;
		 *   the alias for that value becomes the key; an object with "measure" and "method" becomes
		 *   the corresponding value
		 * @returns {string}
		 *   The value for a "$apply" system query option
		 * @throws {Error}
		 *   In case a property is both a dimension and a measure, or neither a dimension nor a
		 *   measure
		 */
		buildApply : function (aAggregation, mAlias2MeasureAndMethod) {
			var aAggregate = [],
				aGroupBy = [],
				aGroupByNoDimension = [],
				aMinMax = [];

			// adds the min/max expression for /concat term and adds corresponding entry to the
			// alias map
			function processMinOrMax(oAggregation, sMinOrMax) {
				var sAlias;

				if (oAggregation[sMinOrMax]) {
					sAlias = "UI5" + sMinOrMax + "__" + oAggregation.name;
					aMinMax.push(oAggregation.name + " with " + sMinOrMax + " as " + sAlias);
					if (mAlias2MeasureAndMethod) {
						mAlias2MeasureAndMethod[sAlias] = {
							measure : oAggregation.name,
							method : sMinOrMax
						};
					}
				}
			}

			aAggregation.forEach(function (oAggregation) {
				var sAggregate, iIndex;

				if ("total" in oAggregation) { // measure
					if ("grouped" in oAggregation) {
						throw new Error("Both dimension and measure: " + oAggregation.name);
					}
					sAggregate = oAggregation.name;
					if ("with" in oAggregation) {
						sAggregate += " with " + oAggregation.with;
					}
					if ("as" in oAggregation) {
						sAggregate += " as " + oAggregation.as;
					}
					aAggregate.push(sAggregate);
					if ("unit" in oAggregation
							&& aGroupBy.indexOf(oAggregation.unit) < 0
							&& aGroupByNoDimension.indexOf(oAggregation.unit) < 0) {
						aGroupByNoDimension.push(oAggregation.unit);
					}
					processMinOrMax(oAggregation, "min");
					processMinOrMax(oAggregation, "max");
				} else if ("grouped" in oAggregation) { // dimension
					aGroupBy.push(oAggregation.name);
					iIndex = aGroupByNoDimension.indexOf(oAggregation.name);
					if (iIndex >= 0) {
						aGroupByNoDimension.splice(iIndex, 1);
					}
				} else {
					throw new Error("Neither dimension nor measure: " + oAggregation.name);
				}
			});

			return "groupby((" + aGroupBy.concat(aGroupByNoDimension).join(",")
				+ (aAggregate.length ? "),aggregate(" + aAggregate.join(",") + "))" : "))")
				+ (aMinMax.length
					? "/concat(aggregate(" + aMinMax.join(",") + "),identity)"
					: "");
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
		 * @returns {Error}
		 *   An <code>Error</code> instance with the following properties:
		 *   <ul>
		 *     <li><code>error</code>: The "error" value from the OData V4 error response JSON
		 *     object (if available)
		 *     <li><code>isConcurrentModification</code>: <code>true</code> In case of a
		 *     concurrent modification detected via ETags (i.e. HTTP status code 412)
		 *     <li><code>message</code>: Error message
		 *     <li><code>status</code>: HTTP status code
		 *     <li><code>statusText</code>: (optional) HTTP status text
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
					if (typeof oResult.message === "object") {
						// oResult.message is in OData V2 an object containing the human readable
						// error message in the property value
						oResult.message = oResult.error.message.value;
					}
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
		 * Returns a "get*" method corresponding to the given "fetch*" method.
		 *
		 * @param {string} sFetch
		 *   A "fetch*" method's name
		 * @param {boolean} [bThrow=false]
		 *   Whether the "get*" method throws if the promise is not fulfilled
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
		 * Returns the key predicate (see "4.3.1 Canonical URL") for the given entity using the
		 * given meta data.
		 *
		 * @param {object} oInstance
		 *   Entity instance runtime data
		 * @param {string} sMetaPath
		 *   The meta path of the entity in the cache including the cache's resource path
		 * @param {object} mTypeForMetaPath
		 *   Maps meta paths to the corresponding entity or complex types
		 * @returns {string}
		 *   The key predicate, e.g. "(Sector='DevOps',ID='42')" or "('42')" or undefined if at
		 *   least one key property is undefined
		 *
		 * @private
		 */
		getKeyPredicate : function (oInstance, sMetaPath, mTypeForMetaPath) {
			var aKeyProperties = [],
				mKey2Value = Helper.getKeyProperties(oInstance, sMetaPath, mTypeForMetaPath, true);

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
		 *   The meta path of the entity in the cache including the cache's resource path
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
		 *   - undefined, if at least one key property is undefined
		 *
		 * @private
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

				vValue = Helper.drillDown(oInstance, aPath);
				if (vValue === undefined) {
					return true;
				}

				// the last path segment is the name of the simple property
				sPropertyName = aPath.pop();
				// find the type containing the simple property
				oType = mTypeForMetaPath[Helper.buildPath(sMetaPath, aPath.join("/"))];
				vValue = Helper.formatLiteral(vValue, oType[sPropertyName].$Type);
				mKey2Value[sKey] = vValue;
			});

			return bFailed ? undefined : mKey2Value;
		},

		/**
		 * Returns the OData metadata model path corresponding to the given OData data model path.
		 *
		 * @param {string} sPath
		 *   An absolute data path within the OData data model, for example
		 *   "/EMPLOYEES/0/ENTRYDATE" or "/EMPLOYEES('42')/ENTRYDATE
		 * @returns {string}
		 *   The corresponding metadata path within the OData metadata model, for example
		 *   "/EMPLOYEES/ENTRYDATE"
		 *
		 * @private
		 */
		getMetaPath : function (sPath) {
			return sPath.replace(rNotMetaContext, "");
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
		 * Returns the properties that have been selected for the given path.
		 *
		 * @param {object} [mQueryOptions]
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
				return checkNaN(parseInt(sLiteral, 10));
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
			var vClone = Helper.clone(vValue);

			if (vClone) {
				delete vClone["@$ui5._"];
			}
			return vClone;
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
		 * @param {object} [oPatchValue] The value of the PATCH request/response
		 */
		updateCache : function (mChangeListeners, sPath, oCacheValue, oPatchValue) {
			// empty PATCH value from 204 response: Nothing to do
			if (!oPatchValue) {
				return;
			}

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
						oCacheValue[sProperty] = vNewValue;
						Helper.fireChanges(mChangeListeners, sPropertyPath, vOldValue, true);
					} else {
						// a primitive property
						oCacheValue[sProperty] = vNewValue;
						if (vOldValue !== vNewValue) {
							Helper.fireChange(mChangeListeners, sPropertyPath, vNewValue);
						}
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
