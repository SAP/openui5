/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Helper
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/uid",
	"sap/ui/base/SyncPromise",
	"sap/ui/thirdparty/URI"
], function (Log, deepEqual, isEmptyObject, merge, uid, SyncPromise, URI) {
	"use strict";

	var rAmpersand = /&/g,
		rApplicationGroupID = /^\w+$/,
		sClassName = "sap.ui.model.odata.v4.lib._Helper",
		rEquals = /\=/g,
		rEscapedCloseBracket = /%29/g,
		rEscapedOpenBracket = /%28/g,
		rEscapedTick = /%27/g,
		rGroupID = /^(\$auto(\.\w+)?|\$direct|\w+)$/,
		rHash = /#/g,
		// matches the rest of a segment after '(' and any segment that consists only of a number
		rNotMetaContext = /\([^/]*|\/-?\d+/g,
		rPlus = /\+/g,
		rSingleQuote = /'/g,
		rSingleQuoteTwice = /''/g,
		rWhitespace = /\s+/g,
		/**
		 * @alias sap.ui.model.odata.v4.lib._Helper
		 */
		_Helper;

	/**
	 * Ensures that the key predicates in the given URL are not %-encoded.
	 *
	 * @param {string} sUrl - The URL
	 * @returns {string} The converted URL
	 */
	function preserveKeyPredicates(sUrl) {
		return sUrl.replace(rEscapedTick, "'")
			.replace(rEscapedOpenBracket, "(")
			.replace(rEscapedCloseBracket, ")");
	}

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
		 *
		 * @public
		 */
		addByPath : function (mMap, sPath, oItem) {
			if (oItem) {
				if (!mMap[sPath]) {
					mMap[sPath] = [oItem];
				} else if (!mMap[sPath].includes(oItem)) {
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
		 *
		 * @private
		 */
		addChildrenWithAncestor : function (aChildren, aAncestors, mChildren) {
			if (aAncestors.length) {
				aChildren.forEach(function (sPath) {
					var aSegments;

					if (aAncestors.includes(sPath)) {
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
		 * Adds a rejectable SyncPromise to a private annotation of the element and returns it.
		 *
		 * @param {object} oElement - The cache element
		 * @returns {sap.ui.base.SyncPromise} The promise
		 *
		 * @public
		 */
		addPromise : function (oElement) {
			return new SyncPromise(function (_fnResolve, fnReject) {
				_Helper.setPrivateAnnotation(oElement, "reject", fnReject);
			});
		},

		/**
		 * Adds the given delta to the collection's $count if there is one. Notifies the listeners.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the collection in the cache
		 * @param {array} aCollection The collection
		 * @param {number} iDelta The delta
		 *
		 * @public
		 */
		addToCount : function (mChangeListeners, sPath, aCollection, iDelta) {
			if (aCollection.$count !== undefined) {
				_Helper.setCount(mChangeListeners, sPath, aCollection, aCollection.$count + iDelta);
			}
		},

		/**
		 * Adds the given paths to $select of the given query options.
		 *
		 * @param {object} mQueryOptions The query options
		 * @param {string[]} aSelectPaths The paths to add to $select
		 *
		 * @public
		 */
		addToSelect : function (mQueryOptions, aSelectPaths) {
			mQueryOptions.$select ??= [];
			aSelectPaths.forEach(function (sPath) {
				if (!mQueryOptions.$select.includes(sPath)) {
					mQueryOptions.$select.push(sPath);
				}
			});
		},

		/**
		 * Adjusts the target and all additional targets of the given message according to the
		 * operation metadata.
		 *
		 * @param {object} oMessage
		 *   The message whose targets should be adjusted
		 * @param {object} oOperationMetadata
		 *   The operation metadata to determine whether a given message target is a parameter
		 *   of the operation
		 * @param {string} [sParameterContextPath]
		 *   The parameter context path, needed for adjusting a message target in case it is an
		 *   operation parameter, except the binding parameter
		 * @param {string} [sContextPath]
		 *   The context path for a bound operation
		 *
		 * @public
		 */
		adjustTargets : function (oMessage, oOperationMetadata, sParameterContextPath,
				sContextPath) {
			var sAdditionalTargetsKey = "additionalTargets" in oMessage
					? "additionalTargets"
					: _Helper.getAnnotationKey(oMessage, ".additionalTargets"),
				aTargets;

			aTargets = [oMessage.target].concat(oMessage[sAdditionalTargetsKey])
				.map(function (sTarget) {
					return sTarget && _Helper.getAdjustedTarget(sTarget, oOperationMetadata,
						sParameterContextPath, sContextPath);
				}).filter(function (sTarget) {
					return sTarget;
				});

			// Note: If oMessage.target is unknown, we use the first valid additional target!
			oMessage.target = aTargets[0];
			if (sAdditionalTargetsKey) {
				oMessage[sAdditionalTargetsKey] = aTargets.slice(1);
			}
		},

		/**
		 * Adjusts all targets and additional targets of the given error instance according to the
		 * operation metadata.
		 *
		 * @param {Error} oError
		 *   The error instance containing the error messages to adjust
		 * @param {object} oOperationMetadata
		 *   The operation metadata to determine whether a given message target is a parameter
		 *   of the operation
		 * @param {string} sParameterContextPath
		 *   The parameter context path
		 * @param {string} [sContextPath]
		 *   The context path for a bound operation
		 *
		 * @public
		 */
		adjustTargetsInError : function (oError, oOperationMetadata, sParameterContextPath,
				sContextPath) {
			if (!oError.error) {
				return;
			}

			_Helper.adjustTargets(oError.error, oOperationMetadata, sParameterContextPath,
				sContextPath);

			if (oError.error.details) {
				oError.error.details.forEach(function (oMessage) {
					_Helper.adjustTargets(oMessage, oOperationMetadata, sParameterContextPath,
						sContextPath);
				});
			}
		},

		/**
		 * Recursively merges $select and $expand from mQueryOptions into mAggregatedQueryOptions.
		 * All other query options in mAggregatedQueryOptions remain untouched.
		 *
		 * @param {object} mAggregatedQueryOptions The aggregated query options
		 * @param {object} mQueryOptions The query options to merge into the aggregated query
		 *   options
		 *
		 * @public
		 */
		aggregateExpandSelect : function (mAggregatedQueryOptions, mQueryOptions) {
			if (mQueryOptions.$select) {
				_Helper.addToSelect(mAggregatedQueryOptions, mQueryOptions.$select);
			}
			if (mQueryOptions.$expand) {
				mAggregatedQueryOptions.$expand ??= {};
				Object.keys(mQueryOptions.$expand).forEach(function (sPath) {
					if (mAggregatedQueryOptions.$expand[sPath]) {
						_Helper.aggregateExpandSelect(mAggregatedQueryOptions.$expand[sPath],
							mQueryOptions.$expand[sPath]);
					} else {
						mAggregatedQueryOptions.$expand[sPath] = mQueryOptions.$expand[sPath];
					}
				});
			}
		},

		/**
		 * Builds a path from the given arguments (absolute or relative depending on the first
		 * non-empty argument). Iterates over the arguments and appends them to the path if defined
		 * and non-empty. The arguments are expected to be strings or integers, but this is not
		 * checked. If any but the first non-empty argument starts with a "/", the result is
		 * invalid.
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
		 * buildPath("/base", "('predicate')") --> "/base('predicate')"
		 *
		 * @returns {string} a composite path built from all arguments
		 *
		 * @public
		 */
		buildPath : function () {
			var sPath = "",
				sSegment,
				i;

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
		 * @param {boolean} [bSortSystemQueryOptions]
		 *   Whether system query options are sorted alphabetically and moved to the query string's
		 *   end
		 * @returns {string}
		 *   The query string; it is empty if there are no parameters; it starts with "?" otherwise
		 *
		 * @public
		 */
		buildQuery : function (mParameters, bSortSystemQueryOptions) {
			var aKeys, aQuery;

			if (!mParameters) {
				return "";
			}

			aKeys = Object.keys(mParameters);
			if (aKeys.length === 0) {
				return "";
			}

			if (bSortSystemQueryOptions) { // sort only system query options, and keep them last
				aKeys = aKeys.filter((sKey) => sKey[0] !== "$")
					.concat(
						aKeys.filter((sKey) => sKey[0] === "$").sort()
					);
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
		 * Converts the select paths into an object where each of the selected properties has the
		 * value <code>true</code>, unless a (complex) parent property is also selected.
		 *
		 * @param {string[]} [aSelect] - The list of selected paths
		 * @returns {object|boolean} - An object marking the selected properties or
		 *   <code>true</code> if all properties are selected ("*")
		 *
		 * @private
		 */
		buildSelect : function (aSelect) {
			var oSelect = {};

			if (!aSelect || aSelect.includes("*")) {
				return true;
			}

			aSelect.forEach(function (sPath) {
				var aSegments = sPath.split("/"),
					iLast = aSegments.length - 1,
					oSubSelect = oSelect;

				aSegments.some(function (sSegment, i) {
					if (i === iLast || aSegments[i + 1] === "*") {
						oSubSelect[sSegment] = true;
						return true;
					}
					if (oSubSelect[sSegment] === true) {
						return true; // no need to descend when the complex property is selected
					}
					oSubSelect = oSubSelect[sSegment] ??= {};
				});
			});

			return oSelect;
		},

		/**
		 * Cancels all nested creates within the given element.
		 *
		 * @param {object} oElement - The entity data in the cache
		 * @param {string} sMessage - The error message to use
		 *
		 * @public
		 */
		cancelNestedCreates : function (oElement, sMessage) {
			Object.keys(oElement).forEach(function (sKey) {
				var oError,
					vProperty = oElement[sKey];

				if (vProperty && vProperty.$postBodyCollection) {
					oError = new Error(sMessage);
					oError.canceled = true;
					vProperty.forEach(function (oChildElement) {
						_Helper.getPrivateAnnotation(oChildElement, "reject")(oError);
						_Helper.cancelNestedCreates(oChildElement, sMessage);
					});
				}
			});
		},

		/**
		 * Checks whether the given group ID is valid, which means it is either undefined, '$auto',
		 * '$auto.*', '$direct' or an application group ID as specified in
		 * {@link sap.ui.model.odata.v4.ODataModel}.
		 *
		 * @param {string} sGroupId
		 *   The group ID
		 * @param {boolean} [bApplicationGroup]
		 *   Whether only an application group ID is considered valid
		 * @param {boolean} [bAllowSingle]
		 *   Whether "$single" is allowed as a group ID
		 * @param {string} [sErrorMessage]
		 *   The error message to be used if group ID is not valid; the group ID will be appended
		 * @throws {Error}
		 *   For invalid group IDs
		 *
		 * @public
		 */
		checkGroupId : function (sGroupId, bApplicationGroup, bAllowSingle, sErrorMessage) {
			if (!bApplicationGroup && sGroupId === undefined
					|| typeof sGroupId === "string"
						&& (bApplicationGroup ? rApplicationGroupID : rGroupID).test(sGroupId)
					|| bAllowSingle && sGroupId === "$single") {
				return;
			}
			throw new Error((sErrorMessage || "Invalid group ID: ") + sGroupId);
		},

		/**
		 * Returns a clone of the given value, according to the rules of
		 * <code>JSON.stringify</code>.
		 * <b>Warning: <code>Date</code> objects will be turned into strings</b>
		 *
		 * @param {any} vValue - Any value, including <code>undefined</code>
		 * @param {function} [fnReplacer] - The replacer function to transform the result, see
		 *   <code>JSON.stringify</code>
		 * @param {boolean} [bAsString] - Whether to return the result of JSON.stringify
		 * @returns {any} A clone or its string representation
		 *
		 * @public
		 */
		clone : function clone(vValue, fnReplacer, bAsString) {
			var sStringified;

			if (vValue === undefined || vValue === Infinity || vValue === -Infinity
					|| Number.isNaN(vValue)) {
				return vValue;
			}
			sStringified = JSON.stringify(vValue, fnReplacer);
			return bAsString ? sStringified : JSON.parse(sStringified);
		},

		/**
		 * Returns a clone of the given value, according to the rules of
		 * <code>JSON.stringify</code>, with all "$..." properties removed.
		 *
		 * @param {any} vValue - Any value, including <code>undefined</code>
		 * @returns {any} A clone
		 *
		 * @public
		 * @see .clone
		 */
		cloneNo$ : function cloneNo$(vValue) {
			return _Helper.clone(vValue, function (sKey, vValue0) {
				return sKey[0] === "$" ? undefined : vValue0;
			});
		},

		/**
		 * Converts $select and $expand of the given query options into corresponding paths. Expects
		 * $select to be always an array and $expand to be always an object (as delivered by
		 * ODataModel#buildQueryOptions). Other query options are ignored.
		 *
		 * $expand must not contain collection-valued navigation properties.
		 *
		 * @param {object} mQueryOptions - The query options
		 * @returns {string[]} The paths
		 *
		 * @public
		 */
		convertExpandSelectToPaths : function (mQueryOptions) {
			var aPaths = [];

			function convert(mQueryOptions0, sPathPrefix) {
				if (mQueryOptions0.$select) {
					mQueryOptions0.$select.forEach(function (sSelect) {
						aPaths.push(_Helper.buildPath(sPathPrefix, sSelect));
					});
				}
				if (mQueryOptions0.$expand) {
					Object.keys(mQueryOptions0.$expand).forEach(function (sExpandPath) {
						convert(mQueryOptions0.$expand[sExpandPath],
							_Helper.buildPath(sPathPrefix, sExpandPath));
						});
				}
			}

			convert(mQueryOptions, "");
			return aPaths;
		},

		/**
		 * Copies the value of the private client-side instance annotation with the given
		 * unqualified name from the given source to the given target object, if present at the
		 * source.
		 *
		 * @param {object} oSource
		 *   Any object
		 * @param {string} sAnnotation
		 *   The unqualified name of a private client-side instance annotation (hidden inside
		 *   namespace "@$ui5._")
		 * @param {object} oTarget
		 *   Any object
		 * @throws {Error}
		 *   If the annotation to be copied is already present at the target, no matter if the value
		 *   is the same or not
		 *
		 * @public
		 */
		copyPrivateAnnotation : function (oSource, sAnnotation, oTarget) {
			if (_Helper.hasPrivateAnnotation(oSource, sAnnotation)) {
				if (_Helper.hasPrivateAnnotation(oTarget, sAnnotation)) {
					throw new Error("Must not overwrite: " + sAnnotation);
				}
				_Helper.setPrivateAnnotation(oTarget, sAnnotation,
					_Helper.getPrivateAnnotation(oSource, sAnnotation));
			}
		},

		/**
		 * Sets "@$ui5.context.isSelected" in <code>oTarget</code> to true if it is truthy in
		 * <code>oSource</code>.
		 *
		 * @param {object} oSource - The source object
		 * @param {object} oTarget - The target object
		 *
		 * @public
		 */
		copySelected : function (oSource, oTarget) {
			if (oSource["@$ui5.context.isSelected"]) {
				oTarget["@$ui5.context.isSelected"] = true;
			}
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
		 *   The request URL, must be an absolute path starting with the service URL
		 * @param {string} [sResourcePath]
		 *   The path by which this resource has originally been requested
		 * @returns {Error}
		 *   An <code>Error</code> instance with the following properties:
		 *   <ul>
		 *     <li> <code>error</code>: (optional) The "error" value from the OData V4 error
		 *       response JSON object (if available)
		 *     <li> <code>isConcurrentModification</code>: (optional) <code>true</code> In case of a
		 *       concurrent modification detected via ETags (i.e. HTTP status code 412)
		 *     <li> <code>strictHandlingFailed</code>: (optional) <code>true</code> In case of HTTP
		 *       status code 412 and response header "Preference-Applied:handling=strict"
		 *     <li> <code>message</code>: Error message
		 *     <li> <code>requestUrl</code>: (optional) The absolute request URL
		 *     <li> <code>resourcePath</code>: (optional) The path by which this resource has
		 *       originally been requested
		 *     <li> <code>retryAfter</code>: (optional) The absolute <code>Date</code> value
		 *       corresponding to the value of the "Retry-After" HTTP response header, no matter if
		 *       that header value was an HTTP date or a delay in seconds.
		 *     <li> <code>status</code>: HTTP status code
		 *     <li> <code>statusText</code>: (optional) HTTP status text
		 *   </ul>
		 * @see <a href=
		 * "http://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html#_Representing_Errors_in"
		 * >"19 Error Response"</a>
		 *
		 * @public
		 */
		createError : function (jqXHR, sMessage, sRequestUrl, sResourcePath) {
			var sBody = jqXHR.responseText,
				sContentType = jqXHR.getResponseHeader("Content-Type"),
				sPreference,
				oResult = new Error(sMessage + ": " + jqXHR.status + " " + jqXHR.statusText),
				sRetryAfter = jqXHR.getResponseHeader("Retry-After"),
				iRetryAfter;

			oResult.status = jqXHR.status;
			oResult.statusText = jqXHR.statusText;
			oResult.requestUrl = sRequestUrl;
			oResult.resourcePath = sResourcePath;
			if (jqXHR.status === 0) {
				oResult.message = "Network error";
				return oResult;
			}
			sContentType &&= sContentType.split(";")[0];
			if (jqXHR.status === 412) {
				sPreference = jqXHR.getResponseHeader("Preference-Applied");

				if (sPreference && sPreference.replace(rWhitespace, "") === "handling=strict") {
					oResult.strictHandlingFailed = true;
				} else {
					oResult.isConcurrentModification = true;
				}
			}
			if (sRetryAfter) {
				iRetryAfter = parseInt(sRetryAfter);
				// no need to use UI5Date.getInstance as only the timestamp is relevant
				oResult.retryAfter = new Date(Number.isNaN(iRetryAfter)
					? sRetryAfter
					: Date.now() + iRetryAfter * 1000);
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
		 * @param {boolean} [bThrow]
		 *   Whether the "get*" method throws if the promise is not (yet) fulfilled instead of just
		 *   returning <code>undefined</code> (Note:
		 *   {@link sap.ui.model.odata.v4.ODataMetaModel#getObject} intentionally never throws
		 *   because it is used for data binding)
		 * @returns {function}
		 *   A "get*" method returning the "fetch*" method's result or
		 *   <code>undefined</code> in case the promise is not (yet) fulfilled
		 *
		 * @public
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
		 * Drills down into the given object according to the given path, creating missing objects
		 * along the way, and setting a <code>null<code> value at the end in case the final
		 * property is missing.
		 *
		 * @param {object} oObject
		 *   The object to start at
		 * @param {string[]} aSegments
		 *   Relative path to drill-down into, as array of segments
		 * @throws {Error}
		 *   If a property along the way exists, but has an <code>undefined</code> or
		 *   <code>null</code> value
		 *
		 * @public
		 */
		createMissing : function (oObject, aSegments) {
			aSegments.reduce(function (oCurrent, sSegment, i) {
				if (!(sSegment in oCurrent)) { // Note: TypeError if !oCurrent
					oCurrent[sSegment] = i + 1 < aSegments.length ? {} : null;
				}
				return oCurrent[sSegment];
			}, oObject);
		},

		/**
		 * Returns a "request*" method corresponding to the given "fetch*" method.
		 *
		 * @param {string} sFetch
		 *   A "fetch*" method's name
		 * @returns {function}
		 *   A "request*" method returning the "fetch*" method's result wrapped via
		 *   <code>Promise.resolve()</code>
		 *
		 * @public
		 */
		createRequestMethod : function (sFetch) {
			return function () {
				return Promise.resolve(this[sFetch].apply(this, arguments));
			};
		},

		/**
		 * Creates a technical details object that contains a property <code>originalMessage</code>
		 * and an optional property <code>httpStatus</code> with the original error's HTTP status.
		 * <code>isConcurrentModification</code> and <code>retryAfter</code> are copied as well.
		 *
		 * @param {object} oMessage
		 *   The message for which to get technical details
		 * @returns {object|undefined}
		 *    An object with a property <code>originalMessage</code> that contains a clone of either
		 *    the given message itself or if supplied, the "@$ui5.originalMessage" property.
		 *    If one of these is an <code>Error</code> instance, then <code>{}</code> is returned.
		 *    The clone is created lazily.
		 *
		 * @public
		 */
		createTechnicalDetails : function (oMessage) {
			var oClonedMessage,
				oError = oMessage["@$ui5.error"],
				oOriginalMessage = oMessage["@$ui5.originalMessage"] || oMessage,
				oTechnicalDetails = {};

			if (oError && (oError.status || oError.cause)) {
				// Note: cause always has a status; @see _Requestor#processBatch
				oError = oError.cause || oError;
				oTechnicalDetails.httpStatus = oError.status;
				if (oError.isConcurrentModification) {
					oTechnicalDetails.isConcurrentModification = true;
				}
				if (oError.retryAfter) {
					oTechnicalDetails.retryAfter = oError.retryAfter;
				}
			}
			// We don't need the original message for internal errors (errors NOT returned from the
			// back end, but raised within our framework)
			if (!(oOriginalMessage instanceof Error)) {
				Object.defineProperty(oTechnicalDetails, "originalMessage", {
					enumerable : true,
					get : function () {
						// use publicClone to ensure that private "@$ui5._" instance annotations
						// never become public
						oClonedMessage ??= _Helper.publicClone(oOriginalMessage);
						return oClonedMessage;
					}
				});
			}

			return oTechnicalDetails;
		},

		/**
		 * Decomposes the given error into an array of errors, one for each of the given requests.
		 *
		 * @param {Error} oError
		 *   The error created by {@link .createError}.
		 * @param {object} oError.error
		 *   An error response as sent from the OData server
		 * @param {object[]} [oError.error.details]
		 *   A list of detail messages sent from the OData server. These messages are filtered and
		 *   assigned to the corresponding request.
		 * @param {object[]} aRequests
		 *   Requests belonging to a single change set
		 * @param {string} sServiceUrl
		 *   URL of the service document used to resolve relative request URLs
		 * @returns {Error[]}
		 *   One error for each request given, suitable for
		 *   {@link sap.ui.model.odata.v4.ODataModel#reportError}
		 *
		 * @public
		 */
		decomposeError : function (oError, aRequests, sServiceUrl) {
			var aDetailContentIDs = oError.error.details
					&& oError.error.details.map(function (oDetail) {
						return _Helper.getContentID(oDetail);
					}),
				sTopLevelContentID = _Helper.getContentID(oError.error);

			return aRequests.map(function (oRequest, i) {
				var oClone = new Error(oError.message);

				/*
				 * Returns whether the given message with the given ContentID is relevant for the
				 * current request. Messages w/o a ContentID are assigned to the 1st request and
				 * turned into an unbound message.
				 *
				 * @param {object} oMessage - A message
				 * @param {string} [sContentID] - The message's ContentID, if any
				 * @returns {boolean} Whether the message is relevant
				 */
				function isRelevant(oMessage, sContentID) {
					if (i === 0 && !sContentID) {
						// w/o ContentID, report as unbound message at 1st request
						if (oMessage.target) {
							oMessage.message = oMessage.target + ": " + oMessage.message;
						}
						delete oMessage.target; // delete also empty target
						return true;
					}
					return sContentID === oRequest.$ContentID;
				}

				oClone.error = _Helper.clone(oError.error);
				oClone.requestUrl = sServiceUrl + oRequest.url;
				oClone.resourcePath = oRequest.$resourcePath;
				oClone.status = oError.status;
				oClone.statusText = oError.statusText;

				if (!isRelevant(oClone.error, sTopLevelContentID)) {
					oClone.error.$ignoreTopLevel = true;
				}
				if (oError.strictHandlingFailed) {
					oClone.strictHandlingFailed = true;
				}
				oClone.error.details &&= oClone.error.details.filter(function (oDetail, j) {
					return isRelevant(oDetail, aDetailContentIDs[j]);
				});

				return oClone;
			});
		},

		// Trampoline property to allow for mocking function module in unit tests.
		// @see sap.base.util.deepEqual
		deepEqual : deepEqual,

		/**
		 * Deletes the private client-side instance annotation with the given unqualified name at
		 * the given object.
		 *
		 * @param {object} oObject
		 *   Any object
		 * @param {string} sAnnotation
		 *   The unqualified name of a private client-side instance annotation (hidden inside
		 *   namespace "@$ui5._")
		 *
		 * @public
		 */
		deletePrivateAnnotation : function (oObject, sAnnotation) {
			var oPrivateNamespace = oObject["@$ui5._"];

			if (oPrivateNamespace) {
				delete oPrivateNamespace[sAnnotation];
			}
		},

		/**
		 * Deletes the property identified by the given path from the given object.
		 *
		 * @param {object} oObject - The object to start at
		 * @param {string} sPath - Some relative path
		 *
		 * @public
		 */
		deleteProperty : function (oObject, sPath) {
			var aSegments;

			if (sPath.includes("/")) {
				aSegments = sPath.split("/");
				sPath = aSegments.pop();
				oObject = _Helper.drillDown(oObject, aSegments);
				if (!oObject) {
					return;
				}
			}
			delete oObject[sPath];
		},

		/**
		 * Deletes within the given entity and property path the property annotation
		 * "@$ui5.updating".
		 *
		 * @param {string} sPropertyPath
		 *   The path of the property in the entity which might be annotated with "@$ui5.updating"
		 * @param {object} oEntity
		 *   The entity
		 *
		 * @public
		 */
		deleteUpdating : function (sPropertyPath, oEntity) {
			var oData = oEntity;

			sPropertyPath.split("/").some(function (sSegment) {
				var vValue = oData[sSegment];

				if (vValue === null || Array.isArray(vValue)) {
					return true;
				}
				if (typeof vValue === "object") {
					oData = vValue;
					return false;
				}
				delete oData[sSegment + "@$ui5.updating"];
			});
		},

		/**
		 * Drills down into the given object according to the given path.
		 *
		 * @param {object} oObject
		 *   The object to start at
		 * @param {string|string[]} vSegments
		 *   Relative path to drill-down into, may already be split as array of segments
		 * @returns {any}
		 *   The result matching to the given path, or <code>undefined</code> if the path leads
		 *   into void
		 *
		 * @public
		 */
		drillDown : function (oObject, vSegments) {
			if (typeof vSegments === "string") {
				vSegments = vSegments.split("/");
			}
			return vSegments.reduce(function (oCurrent, sSegment) {
				return (oCurrent && sSegment in oCurrent) ? oCurrent[sSegment] : undefined;
			}, oObject);
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
		 *
		 * @public
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
		 *
		 * @public
		 */
		encodePair : function (sKey, sValue) {
			return _Helper.encode(sKey, true) + "=" + _Helper.encode(sValue, false);
		},

		/**
		 * Extracts the mergeable query options "$expand" and "$select" from the given ones, returns
		 * them as a new map while replacing their value with "~" in the old map.
		 *
		 * @param {object} mQueryOptions
		 *   The original query options, will be modified
		 * @returns {object}
		 *   The extracted query options
		 *
		 * @public
		 */
		extractMergeableQueryOptions : function (mQueryOptions) {
			var mExtractedQueryOptions = {};

			if ("$expand" in mQueryOptions) {
				mExtractedQueryOptions.$expand = mQueryOptions.$expand;
				mQueryOptions.$expand = "~";
			}
			if ("$select" in mQueryOptions) {
				mExtractedQueryOptions.$select = mQueryOptions.$select;
				mQueryOptions.$select = "~";
			}

			return mExtractedQueryOptions;
		},

		/**
		 * Extracts all (top and detail) messages from the given error instance.
		 *
		 * @param {Error} oError
		 *   An error instance as created by {@link .createError} or {@link .decomposeError}
		 * @param {object} [oError.error]
		 *   An error response as sent from the OData server
		 * @param {object[]} [oError.error.details]
		 *   A list of detail messages sent from the OData server. These messages are reported, too.
		 * @param {boolean} [oError.error.$ignoreTopLevel]
		 *   Whether <code>oError.error</code> itself is not reported, but only the
		 *   <code>oError.error.details</code>
		 * @param {string} [oError.requestUrl]
		 *   The absolute request URL of the failed OData request; required to resolve a long text
		 *   URL
		 * @returns {object[]}
		 *   An array of raw message objects suitable for
		 *   {@link sap.ui.model.odata.v4.ODataModel#createUI5Message}
		 *
		 * @public
		 */
		extractMessages : function (oError) {
			var aMessages = [];

			/*
			 * Creates a raw message object taking all relevant properties, converts the annotations
			 * for numeric severity and longtext to the corresponding properties and adds it to one
			 * of the arrays to be reported later.
			 * @param {object} oMessage The message
			 * @param {number} [iNumericSeverity] The numeric severity
			 * @param {boolean} [bTechnical] Whether the message is reported as technical
			 */
			function addMessage(oMessage, iNumericSeverity, bTechnical) {
				var oRawMessage = {
						additionalTargets : _Helper.getAdditionalTargets(oMessage),
						code : oMessage.code,
						message : oMessage.message,
						numericSeverity : iNumericSeverity,
						technical : bTechnical || oMessage.technical,
						// use "@$ui5." prefix to overcome name collisions with instance annotations
						// returned from back end.
						"@$ui5.error" : oError,
						"@$ui5.originalMessage" : oMessage
					};

				Object.keys(oMessage).forEach(function (sProperty) {
					if (sProperty[0] === "@") {
						// cannot use .getAnnotation() for compatibility reasons
						if (sProperty.endsWith(".numericSeverity")) {
							oRawMessage.numericSeverity = oMessage[sProperty];
						} else if (sProperty.endsWith(".longtextUrl") && oError.requestUrl
								&& oMessage[sProperty]) {
							oRawMessage.longtextUrl
								= _Helper.makeAbsolute(oMessage[sProperty], oError.requestUrl);
						}
					}
				});

				if (typeof oMessage.target === "string") {
					if (oMessage.target[0] === "$" || !oError.resourcePath) {
						// target for the bound message is a system query option or cannot be
						// resolved -> report as unbound message
						oRawMessage.message = oMessage.target + ": " + oMessage.message;
					} else {
						oRawMessage.target = oMessage.target;
					}
				}
				oRawMessage.transition = true;
				aMessages.push(oRawMessage);
			}

			if (oError.error) {
				if (!oError.error.$ignoreTopLevel) {
					addMessage(oError.error, 4 /*Error*/, true);
				}
				if (oError.error.details) {
					oError.error.details.forEach(function (oMessage) {
						addMessage(oMessage);
					});
				}
			} else {
				addMessage(oError, 4 /*Error*/, true);
			}
			return aMessages;
		},

		/**
		 * Fetches the property that is reached by the meta path and (if necessary) its type.
		 *
		 * @param {function} fnFetchMetadata Function which fetches metadata for a given meta path
		 * @param {string} sMetaPath The meta path
		 * @returns {sap.ui.base.SyncPromise<object>} A promise resolving with the property reached
		 *   by the meta path or <code>undefined</code> otherwise.
		 *
		 * @public
		 */
		fetchPropertyAndType : function (fnFetchMetadata, sMetaPath) {
			return fnFetchMetadata(sMetaPath).then(function (oProperty) {
				if (oProperty && oProperty.$kind === "NavigationProperty") {
					// Ensure that the target type of the navigation property is available
					// synchronously. This is only necessary for navigation properties and may only
					// be done for them because it would fail for properties with a simple type like
					// "Edm.String".
					return fnFetchMetadata(sMetaPath + "/").then(function () {
						return oProperty;
					});
				}
				return oProperty;
			});
		},

		/**
		 * Filters out every path in <code>aPathsToFilter</code> if any meta path in
		 * <code>aMetaPaths</code> is a prefix of its meta path.
		 *
		 * @param {string[]} aMetaPaths
		 *   A list of absolute meta paths
		 * @param {string[]} aPathsToFilter
		 *   A list of absolute paths
		 * @returns {string[]}
		 *   The filtered list
		 *
		 * @public
		 */
		filterPaths : function (aMetaPaths, aPathsToFilter) {
			return aPathsToFilter.filter(function (sPathToFilter) {
				var sMetaPathToFilter = _Helper.getMetaPath(sPathToFilter);

				return aMetaPaths.every(function (sMetaPath) {
					return !_Helper.hasPathPrefix(sMetaPathToFilter, sMetaPath);
				});
			});
		},

		/**
		 * Fires a change event to all listeners for the given path in mChangeListeners.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPropertyPath The path
		 * @param {any} vValue The value to report to the listeners
		 * @param {boolean} bForceUpdate Whether a listener should force an update
		 *
		 * @public
		 */
		fireChange : function (mChangeListeners, sPropertyPath, vValue, bForceUpdate) {
			var aListeners = mChangeListeners[sPropertyPath],
				i;

			if (aListeners) {
				for (i = 0; i < aListeners.length; i += 1) {
					aListeners[i].onChange(vValue, bForceUpdate);
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
		 *
		 * @public
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
		 *
		 * @public
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
					return "'" + String(vValue).replace(rSingleQuote, "''") + "'";

				default:
					throw new Error("Unsupported type: " + sType);
			}
		},

		/**
		 * Returns the "@Org.OData.Core.V1.additionalTargets" annotation for the given message,
		 * ignoring the alias. Logs a warning if duplicates are found.
		 *
		 * @param {object} oMessage
		 *   A single message from an OData error response
		 * @returns {string[]|undefined}
		 *   The value of the additionalTargets annotation, or <code>undefined</code> in case there
		 *   is not exactly one such annotation (ignoring the alias)
		 *
		 * @private
		 */
		getAdditionalTargets : function (oMessage) {
			return _Helper.getAnnotation(oMessage, ".additionalTargets");
		},

		/**
		 * Returns the adjusted target according to the given operation metadata.
		 *
		 * For a bound operation:
		 * In case the original target is '_it/Property' with '_it' as the name of the
		 * binding parameter, the result is '/Set(key)/Property' where '/Set(key)' is
		 * the current context the operation is called on.
		 * In case the target points to a certain parameter like 'Param' the result is
		 * '/Set(key)/name.space.Operation(...)/$Parameter/Param' with
		 * 'name.space.Operation' as the fully-qualified operation name.
		 *
		 * For an unbound operation:
		 * In case the target points to a certain parameter like 'Param' the result is
		 * '/OperationImport/$Parameter/Param' with 'OperationImport' as the name of the
		 * operation import.
		 *
		 * All other targets are deleted because they can not be associated to operation
		 * parameters or the binding parameter and the message is reported as unbound.
		 *
		 * @param {string} sTarget
		 *   The message target
		 * @param {object} oOperationMetadata
		 *   The operation metadata to determine whether a given message target is a parameter
		 *   of the operation
		 * @param {string} [sParameterContextPath]
		 *   The parameter context path, needed for adjusting a message target in case it is an
		 *   operation parameter, except the binding parameter
		 * @param {string} [sContextPath]
		 *   The context path for a bound operation
		 * @returns {string|undefined} The adjusted target, or <code>undefined</code> if the target
		 *   is unknown
		 *
		 * @private
		 */
		getAdjustedTarget : function (sTarget, oOperationMetadata, sParameterContextPath,
				sContextPath) {
			var bIsParameterName,
				sParameterName,
				aSegments;

			aSegments = sTarget.split("/");
			sParameterName = aSegments.shift();
			if (sParameterName === "$Parameter") {
				sTarget = aSegments.join("/");
				sParameterName = aSegments.shift();
			}
			if (oOperationMetadata.$IsBound
					&& sParameterName === oOperationMetadata.$Parameter[0].$Name) {
				sTarget = _Helper.buildPath(sContextPath, aSegments.join("/"));
				return sTarget;
			}
			if (!sParameterContextPath) {
				return sTarget;
			}
			bIsParameterName = oOperationMetadata.$Parameter.some(function (oParameter) {
				return sParameterName === oParameter.$Name;
			});
			if (bIsParameterName) {
				sTarget = sParameterContextPath + "/" + sTarget;
				return sTarget;
			}
		},

		/**
		 * Returns the instance annotation with a given name for the given message, ignoring the
		 * alias. Logs a warning if duplicates are found.
		 *
		 * @param {object} oMessage
		 *   A single message from an OData error response
		 * @param {object} sName
		 *   The name of the annotation without prefix "@" and namespace, e.g. ".ContentID" for a
		 *   annotation "@Org.OData.Core.V1.ContentID"
		 * @returns {any}
		 *   The value of the annotation, or <code>undefined</code> in case there is not exactly one
		 *   such annotation (ignoring the alias)
		 *
		 * @public
		 */
		getAnnotation : function (oMessage, sName) {
			var sAnnotationKey = _Helper.getAnnotationKey(oMessage, sName);

			return sAnnotationKey && oMessage[sAnnotationKey];
		},

		/**
		 * Returns the instance annotation key with a given name for the given object, ignoring the
		 * alias. Logs a warning if duplicates are found.
		 *
		 * @param {object} oObject
		 *   Any object
		 * @param {string} sName
		 *   The name of the annotation w/o prefix "@" and namespace, e.g. ".ContentID" for a
		 *   annotation "@Org.OData.Core.V1.ContentID"
		 * @param {string} [sProperty]
		 *   The name of the annotated property, e.g. "Budget" in "Budget@Core.Permissions" for a
		 *   property "Budget" annotated with "@Core.Permissions"
		 * @returns {string|undefined}
		 *   The key of the annotation, or <code>undefined</code> in case there is not exactly one
		 *   such annotation (ignoring the alias)
		 *
		 * @public
		 */
		getAnnotationKey : function (oObject, sName, sProperty) {
			var sAnnotationKey,
				bDuplicate,
				sPrefix = (sProperty || "") + "@";

			Object.keys(oObject).forEach(function (sKey) {
				if (sKey.startsWith(sPrefix) && sKey.endsWith(sName)) {
					if (sAnnotationKey) {
						Log.warning("Cannot distinguish " + sAnnotationKey + " from " + sKey,
							undefined, sClassName);
						bDuplicate = true;
					}
					sAnnotationKey = sKey;
				}
			});

			return bDuplicate ? undefined : sAnnotationKey;
		},

		/**
		 * Returns the "@Org.OData.Core.V1.ContentID" annotation for the given message, ignoring
		 * the alias. Logs a warning if duplicates are found.
		 *
		 * @param {object} oMessage
		 *   A single message from an OData error response
		 * @returns {string|undefined}
		 *   The value of the ContentID annotation, or <code>undefined</code> in case there is not
		 *   exactly one such annotation (ignoring the alias)
		 *
		 * @private
		 */
		getContentID : function (oMessage) {
			return _Helper.getAnnotation(oMessage, ".ContentID");
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
		 * @param {Array<(string|object)>} [aKeyProperties]
		 *   A list of key properties, either as a string or an object with one property (its name
		 *   is the alias in the key predicate, its value is the path in the instance). If not
		 *   given, the entity's key is used.
		 * @returns {string|undefined}
		 *   A filter using key properties without URI encoding, e.g.
		 *   "Sector eq 'A/B&C' and ID eq 42)", or <code>undefined</code>, if at least one key
		 *   property is undefined
		 * @throws {Error}
		 *   In case the entity type has no key properties according to metadata
		 *
		 * @public
		 */
		getKeyFilter : function (oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties) {
			var aFilters = [],
				sKey,
				mKey2Value = _Helper.getKeyProperties(oInstance, sMetaPath, mTypeForMetaPath,
					aKeyProperties);

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
		 * given metadata.
		 *
		 * @param {object} oInstance
		 *   Entity instance runtime data
		 * @param {string} sMetaPath
		 *   The absolute meta path of the given instance
		 * @param {object} mTypeForMetaPath
		 *   Maps meta paths to the corresponding entity or complex types
		 * @param {Array<(string|object)>} [aKeyProperties]
		 *   A list of key properties, either as a string or an object with one property (its name
		 *   is the alias in the key predicate, its value is the path in the instance); if not
		 *   given, the entity's key is used
		 * @param {boolean} [bKeepSingleProperty]
		 *   If true, the property name is not omitted if there is only one property
		 *   (like "(ID='42')")
		 * @returns {string|undefined}
		 *   The key predicate with proper URI encoding, e.g. "(Sector='A%2FB%26C',ID='42')" or
		 *   "('42')", or <code>undefined</code>, if at least one key property is undefined
		 * @throws {Error}
		 *   In case the entity type has no key properties according to metadata
		 *
		 * @public
		 */
		getKeyPredicate : function (oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties,
				bKeepSingleProperty) {
			var mKey2Value = _Helper.getKeyProperties(oInstance, sMetaPath, mTypeForMetaPath,
					aKeyProperties, true);

			if (!mKey2Value) {
				return undefined;
			}
			aKeyProperties = Object.keys(mKey2Value).map(function (sAlias, _iIndex, aKeys) {
				var vValue = encodeURIComponent(mKey2Value[sAlias]);

				return bKeepSingleProperty || aKeys.length > 1
					? encodeURIComponent(sAlias) + "=" + vValue
					: vValue;
			});

			return "(" + aKeyProperties.join(",") + ")";
		},

		/**
		 * Returns the key properties mapped to values from the given entity using the given
		 * metadata.
		 *
		 * @param {object} oInstance
		 *   Entity instance runtime data
		 * @param {string} sMetaPath
		 *   The absolute meta path of the given instance
		 * @param {object} mTypeForMetaPath
		 *   Maps meta paths to the corresponding entity or complex types
		 * @param {Array<(string|object)>} [aKeyProperties]
		 *   A list of key properties, either as a string or an object with one property (its name
		 *   is the alias in the key predicate, its value is the path in the instance); if not
		 *   given, the entity's key is used
		 * @param {boolean} [bReturnAlias]
		 *   Whether to return the aliases instead of the keys
		 * @returns {object|undefined}
		 *   The key properties map. For the metadata
		 *   <Key>
		 *    <PropertyRef Name="Info/ID" Alias="EntityInfoID"/>
		 *   </Key>
		 *   the following map is returned:
		 *   - {EntityInfoID : 42}, if bReturnAlias = true;
		 *   - {"Info/ID" : 42}, if bReturnAlias = false;
		 *   - undefined, if at least one key property is undefined.
		 * @throws {Error}
		 *   In case the entity type has no key properties according to metadata
		 *
		 * @private
		 */
		getKeyProperties : function (oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties,
				bReturnAlias) {
			var bFailed,
				mKey2Value = {};

			aKeyProperties ??= mTypeForMetaPath[sMetaPath].$Key;
			bFailed = aKeyProperties.some(function (vKey) {
				var sKey, sKeyPath, oObject, sPropertyName, aSegments, oType, vValue;

				if (typeof vKey === "string") {
					sKey = sKeyPath = vKey;
				} else {
					sKey = Object.keys(vKey)[0]; // alias
					sKeyPath = vKey[sKey];
					if (!bReturnAlias) {
						sKey = sKeyPath;
					}
				}
				aSegments = sKeyPath.split("/");
				// the last path segment is the name of the simple property
				sPropertyName = aSegments.pop();

				oObject = _Helper.drillDown(oInstance, aSegments);
				vValue = oObject[sPropertyName];
				if (vValue === undefined || (sPropertyName + "@odata.type") in oObject) {
					return true;
				}

				// find the type containing the simple property
				oType = mTypeForMetaPath[_Helper.buildPath(sMetaPath, aSegments.join("/"))];
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
		 *
		 * @public
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
		 * Returns a list of properties that would be expected due to $select/$expand, but are
		 * missing in vEntityOrCollection. Does not analyze $expand any further, only checks whether
		 * there is data for the navigation property itself (relying on requestSideEffects to take
		 * care of the details).
		 *
		 * @param {object|object[]} vEntityOrCollection - The entity (collection)
		 * @param {object} mQueryOptions - The query options (only $select and $expand required)
		 * @returns {string[]}
		 *   A list of paths relative to vEntityOrCollection for which the property value is missing
		 * @throws {Error} If there is a path containing "*"
		 *
		 * @public
		 */
		getMissingPropertyPaths : function (vEntityOrCollection, mQueryOptions) {
			return (mQueryOptions.$select || []).concat(Object.keys(mQueryOptions.$expand || {}))
				.filter(function (sPath) {
					return _Helper.isMissingProperty(vEntityOrCollection, sPath);
				});
		},

		/**
		 * Returns the index of the key predicate in the last segment of the given path.
		 *
		 * @param {string} sPath - The path
		 * @returns {number} The index of the key predicate
		 * @throws {Error} If no path is given or the last segment contains no key predicate
		 *
		 * @public
		 */
		getPredicateIndex : function (sPath) {
			var iPredicateIndex = sPath
				? sPath.indexOf("(", sPath.lastIndexOf("/"))
				: -1;

			if (iPredicateIndex < 0 || !sPath.endsWith(")")) {
				throw new Error("Not a list context path to an entity: " + sPath);
			}

			return iPredicateIndex;
		},

		/**
		 * Returns the list of predicates corresponding to the given list of contexts, or
		 * <code>null</code if at least one predicate is missing.
		 *
		 * @param {sap.ui.model.odata.v4.Context[]} aContexts - A list of contexts
		 * @returns {string[]|null} The corresponding list of predicates
		 *
		 * @public
		 */
		getPredicates : function (aContexts) {
			var bMissingPredicate,
				aPredicates = aContexts.map(getPredicate);

			function getPredicate(oContext) {
				var sPredicate = _Helper.getPrivateAnnotation(oContext.getValue(), "predicate");

				if (!sPredicate) {
					bMissingPredicate = true;
				}
				return sPredicate;
			}

			return bMissingPredicate ? null : aPredicates;
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
		 * @param {any} [vDefault]
		 *   The default value to be used instead of <code>undefined</code>
		 * @returns {any}
		 *   The annotation's value or the given default if no such annotation exists (e.g.
		 *   because the private namespace object does not exist)
		 *
		 * @public
		 */
		getPrivateAnnotation : function (oObject, sAnnotation, vDefault) {
			const vResult = oObject["@$ui5._"]?.[sAnnotation];

			return vResult === undefined ? vDefault : vResult;
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
		 *
		 * @public
		 */
		getQueryOptionsForPath : function (mQueryOptions, sPath) {
			sPath = _Helper.getMetaPath(sPath);
			if (sPath) {
				sPath.split("/").some(function (sSegment) {
					mQueryOptions &&= mQueryOptions.$expand
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
		 * Returns the path suffix of <code>sPath</code> which is relative to
		 * <code>sBasePath</code>. Either both paths have to be absolute or none of them. Note that
		 * the resulting path may start with a key predicate.
		 *
		 * Examples: (The base path is "/foo/bar"):
		 * "/foo/bar/baz" -> "baz"
		 * "/foo/bar('baz')" -> "('baz')"
		 * "/foo/bar" -> ""
		 * "/foo/barolo" -> undefined
		 * "/foo" -> undefined
		 *
		 * @param {string} sPath
		 *   A path
		 * @param {string} sBasePath
		 *   The base path to strip off
		 * @returns {string}
		 *   The path suffix of <code>sPath</code> which is relative to <code>sBasePath</code>, or
		 *   <code>undefined</code> if there is no such suffix, or <code>sPath</code> if
		 *   <code>sBasePath</code> is empty.
		 *
		 * @public
		 * @see .hasPathPrefix
		 */
		getRelativePath : function (sPath, sBasePath) {
			if (sBasePath.length) {
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
			}
			return sPath;
		},

		/**
		 * Tells whether <code>sPath</code> has <code>sBasePath</code> as path prefix. It returns
		 * <code>true</code> iff {@link .getRelativePath} does not return <code>undefined</code>.
		 *
		 * @param {string} sPath The path
		 * @param {string} sBasePath The base path
		 * @returns {boolean} true if sBasePath path is a prefix of sPath
		 *
		 * @public
		 * @see .getRelativePath
		 */
		hasPathPrefix : function (sPath, sBasePath) {
			return _Helper.getRelativePath(sPath, sBasePath) !== undefined;
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
		 *
		 * @public
		 */
		hasPrivateAnnotation : function (oObject, sAnnotation) {
			var oPrivateNamespace = oObject["@$ui5._"];

			return oPrivateNamespace ? sAnnotation in oPrivateNamespace : false;
		},

		/**
		 * Fires change events for all properties that differ between the old and the new value.
		 * The function recursively handles modified, added or removed structural properties
		 * and fires change events for all modified/added/removed primitive properties therein. If
		 * the new value is <code>undefined</code>, the event is fired with <code>null</code> as a
		 * value unless <code>bAllowUndefined</code> is set.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of both values in mChangeListeners
		 * @param {any} vOld The old value
		 * @param {any} vNew The new value
		 * @param {boolean} [bAllowUndefined] Allows undefined values
		 *
		 * @public
		 */
		informAll : function (mChangeListeners, sPath, vOld, vNew, bAllowUndefined) {
			if (vNew === vOld) {
				return;
			}

			if (vNew && typeof vNew === "object") {
				Object.keys(vNew).forEach(function (sProperty) {
					_Helper.informAll(mChangeListeners, _Helper.buildPath(sPath, sProperty),
						vOld && vOld[sProperty], vNew[sProperty], bAllowUndefined);
				});
			} else {
				// must fire null to guarantee that a property binding has not
				// this.vValue === undefined, see ODataPropertyBinding.setValue
				_Helper.fireChange(mChangeListeners, sPath,
					!bAllowUndefined && vNew === undefined ? null : vNew);
				vNew = {};
			}

			if (vOld && typeof vOld === "object") {
				Object.keys(vOld).forEach(function (sProperty) {
					// not covered in the new value
					if (!Object.hasOwn(vNew, sProperty)) {
						_Helper.informAll(mChangeListeners, _Helper.buildPath(sPath, sProperty),
							vOld[sProperty], undefined, bAllowUndefined);
					}
				});
			}
		},

		/**
		 * Inherits a property value according to the given path from the given source object to the
		 * given target. That is, the value is copied unless the target already has a value. Creates
		 * missing objects along the way.
		 *
		 * Like the following, but for paths ;-)
		 * if (!(sProperty in oTarget)) {
		 *     oTarget[sProperty] = oSource[sProperty];
		 * }
		 *
		 * @param {string[]} aSegments
		 *   Relative path to drill-down into, as array of segments
		 * @param {object} oSource
		 *   The source object to inherit from
		 * @param {object} oTarget
		 *   The target object to inherit into
		 * @param {boolean} [bTolerateNull]
		 *   Whether a <code>null</code> value in the target is tolerated and treated as a missing
		 *   object, which is then created along the way
		 * @throws {Error}
		 *   If a property along the way exists, but has an <code>undefined</code> value or an
		 *   untolerated <code>null</code> value
		 *
		 * @public
		 */
		inheritPathValue : function (aSegments, oSource, oTarget, bTolerateNull) {
			aSegments.forEach(function (sSegment, i) {
				var bMissing = !(sSegment in oTarget) // Note: TypeError if !oTarget
					|| bTolerateNull && oTarget[sSegment] === null;

				if (i + 1 < aSegments.length) { // intermediate step
					if (bMissing) {
						oTarget[sSegment] = {};
					}
					oSource = oSource[sSegment];
					oTarget = oTarget[sSegment];
				} else if (bMissing) {
					oTarget[sSegment] = oSource[sSegment];
				}
			});
		},

		/**
		 * Inserts the given element into the given array at the given index, even it is beyond the
		 * array's current length.
		 *
		 * @param {any[]} aElements - Some array
		 * @param {number} iIndex - Some index
		 * @param {any} vElement - Some element
		 *
		 * @public
		 */
		insert : function (aElements, iIndex, vElement) {
			if (iIndex >= aElements.length) { // Note: #splice ignores iIndex then!
				aElements[iIndex] = vElement;
			} else {
				aElements.splice(iIndex, 0, vElement);
			}
		},

		/**
		 * Returns a copy of given query options where "$expand" and "$select" are replaced by the
		 * intersection with the given (navigation) property paths.
		 *
		 * Note: In case the meta path <code>sRootMetaPath</code> points to a single-valued
		 * navigation property, for example "/SalesOrderList/SO_2_BP", this methods adds the key
		 * properties of the related entity type to the "$select" query options. Although this is
		 * not needed in order to obtain the correct nested entity it enables
		 * {@link sap.ui.model.odata.v4.Context#requestSideEffects}) to check the consistency of the
		 * key predicate.
		 *
		 * @param {object} [mCacheQueryOptions]
		 *   A map of query options as returned by
		 *   {@link sap.ui.model.odata.v4.ODataModel#buildQueryOptions}
		 * @param {string[]} aPaths
		 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
		 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be
		 *   loaded because they may have changed due to side effects of a previous update; must not
		 *   be empty; "*" means all structural properties
		 * @param {function} fnFetchMetadata
		 *   Function which fetches metadata for a given meta path
		 * @param {string} sRootMetaPath
		 *   The meta path for the cache root's type, for example "/SalesOrderList/SO_2_BP" or
		 *   "/Artists/foo.EditAction/@$ui5.overload/0/$ReturnType/$Type", such that an OData simple
		 *   identifier may be appended
		 * @param {string} [sPrefix=""]
		 *   Optional prefix for navigation property meta paths used during recursion
		 * @param {boolean} bWithMessages
		 *   Whether the "@com.sap.vocabularies.Common.v1.Messages" path is treated specially
		 * @returns {object}
		 *   The updated query options or <code>null</code> if no request is needed
		 * @throws {Error}
		 *   If a path string is empty or the intersection requires a "$expand" of a
		 *   collection-valued navigation property
		 *
		 * @public
		 */
		intersectQueryOptions : function (mCacheQueryOptions, aPaths, fnFetchMetadata,
				sRootMetaPath, sPrefix, bWithMessages) {
			var aExpands = [],
				mExpands = {},
				sMessagesPath = bWithMessages && fnFetchMetadata(sRootMetaPath
					+ "/@com.sap.vocabularies.Common.v1.Messages/$Path").getResult(),
				mResult,
				oRootMetaData,
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
						|| sSegment === "$count"
						|| fnFetchMetadata(
								sRootMetaPath + "/" + aSegments.slice(0, i + 1).join("/")
							).getResult().$kind === "Property";
				});
			}

			if (aPaths.indexOf("") >= 0) {
				throw new Error("Unsupported empty navigation property path");
			}

			if (aPaths.indexOf("*") >= 0) {
				aSelects = (mCacheQueryOptions && mCacheQueryOptions.$select || []).slice();
				if (sMessagesPath && !aSelects.includes(sMessagesPath)) {
					aSelects.push(sMessagesPath);
				}
			} else if (mCacheQueryOptions && mCacheQueryOptions.$select
					&& mCacheQueryOptions.$select.indexOf("*") < 0) {
				_Helper.addChildrenWithAncestor(aPaths, mCacheQueryOptions.$select, mSelects);
				_Helper.addChildrenWithAncestor(mCacheQueryOptions.$select, aPaths, mSelects);
				if (sMessagesPath && aPaths.includes(sMessagesPath)) {
					mSelects[sMessagesPath] = true;
				}
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
							aStrippedPaths, fnFetchMetadata, sMetaPath,
							sPrefixedNavigationPropertyPath);
						if (mChildQueryOptions) {
							mExpands[sNavigationPropertyPath] = mChildQueryOptions;
						}
					}
				});
			}

			if (!aSelects.length && isEmptyObject(mExpands)) {
				return null;
			}

			mResult = Object.assign({}, mCacheQueryOptions, {$select : aSelects});
			oRootMetaData = fnFetchMetadata(sRootMetaPath).getResult();
			if (oRootMetaData.$kind === "NavigationProperty" && !oRootMetaData.$isCollection) {
				// for a collection we already have the key in the resource path
				_Helper.selectKeyProperties(mResult,
					fnFetchMetadata(sRootMetaPath + "/").getResult());
			}
			if (isEmptyObject(mExpands)) {
				delete mResult.$expand;
			} else {
				mResult.$expand = mExpands;
			}

			return mResult;
		},

		/**
		 * Tells whether the given map of binding parameters is defining data aggregation, but not a
		 * recursive hierarchy.
		 *
		 * @param {object} [mParameters] - Map of binding parameters
		 * @returns {boolean} Whether it's about data aggregation
		 *
		 * @public
		 */
		isDataAggregation : function (mParameters) {
			return mParameters
				&& mParameters.$$aggregation
				&& !mParameters.$$aggregation.hierarchyQualifier;
		},

		// Trampoline property to allow for mocking function module in unit tests.
		// @see sap.base.util.isEmptyObject
		isEmptyObject : isEmptyObject,

		/**
		 * Returns whether the given property is missing in vEntityOrCollection. This is the case if
		 * there is no value for it. It is not missing if a parent has a <code>null</code> value. In
		 * a collection it is missing if any member misses it.
		 *
		 * @param {object|object[]} vEntityOrCollection - The entity (collection)
		 * @param {string} sPath - The property path
		 * @returns {boolean} Whether the property is missing
		 * @throws {Error} If there is a path containing "*"
		 *
		 * @private
		 */
		isMissingProperty : function (vEntityOrCollection, sPath) {
			var aSegments = sPath.split("/");

			// Checks whether the sub-path in aSegments starting at index i is missing in vValue
			function isMissing(vValue, i) {
				var vProperty;

				if (Array.isArray(vValue)) {
					return vValue.some(function (vItem) {
						return isMissing(vItem, i);
					});
				}
				vProperty = vValue[aSegments[i]];
				if (vProperty && typeof vProperty === "object" && i + 1 < aSegments.length) {
					return isMissing(vProperty, i + 1);
				}
				return vProperty === undefined;
			}

			if (sPath.includes("*")) {
				throw new Error("Unsupported property path " + sPath);
			}
			return isMissing(vEntityOrCollection, 0);
		},

		/**
		 * Tells whether the value is a safe integer.
		 *
		 * @param {number} iNumber The value
		 * @returns {boolean}
		 *   True if the value is a safe integer
		 *
		 * @public
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
		 * Determines whether the given property path is selected in the given query options.
		 *
		 * A property path is selected if $select in the query options or the matching $expand
		 * <ul>
		 *   <li> is missing
		 *   <li> contains "*"
		 *   <li> contains the property or its surrounding complex type.
		 * </ul>
		 *
		 * Note: The function works w/o metadata, this means that not for all combinations of the
		 * given arguments the function might return the right result.
		 * Example: Assuming SO_2_BP is a navigation property, then
		 * <code>_Helper.isSelected("SO_2_BP/Picture", {$select : ["*"]})</code>
		 * will return true, because SO_2_BP would be taken as a structural property. So far this is
		 * ok, because within all known scenarios such combinations do not happen.
		 *
		 * @param {string} sPropertyPath The path to the structural property as meta path
		 * @param {object} [mQueryOptions] The query options to be analyzed
		 * @returns {boolean} Whether the property for the given path was already selected
		 *
		 * @public
		 */
		isSelected : function (sPropertyPath, mQueryOptions) {
			var sPath, sRelativePath;

			if (!mQueryOptions) {
				return false;
			}
			if (mQueryOptions.$expand) {
				for (sPath in mQueryOptions.$expand) {
					sRelativePath = _Helper.getRelativePath(sPropertyPath, sPath);
					if (sRelativePath) {
						return _Helper.isSelected(sRelativePath, mQueryOptions.$expand[sPath]);
					}
				}
			}
			return !mQueryOptions.$select
				|| mQueryOptions.$select.includes("*")
				|| mQueryOptions.$select.some(function (sSelect) {
					return _Helper.hasPathPrefix(sPropertyPath, sSelect);
				});
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
		 *
		 * @public
		 */
		makeAbsolute : function (sUrl, sBase) {
			return preserveKeyPredicates(new URI(sUrl).absoluteTo(sBase).toString());
		},

		/**
		 * Make the given absolute URL relative to the given base URL. The URLs must not contain a
		 * host or protocol part. Ensures that key predicates are not %-encoded.
		 *
		 * @param {string} sUrl
		 *   The URL
		 * @param {string} sBase
		 *   The base URL
		 * @returns {string}
		 *   The relative URL
		 *
		 * @public
		 */
		makeRelativeUrl : function (sUrl, sBase) {
			return preserveKeyPredicates(new URI(sUrl).relativeTo(sBase).toString());
		},

		/**
		 * Makes an object that has the given value exactly at the given property path allowing to
		 * use the result in _Helper.updateExisting().
		 *
		 * Examples:
		 * <ul>
		 *   <li> ["Age"], 42 -> {Age: 42}
		 *   <li> ["Address", "City"], "Walldorf" -> {Address: {City: "Walldorf"}}
		 * </ul>
		 *
		 * @param {string[]} aPropertyPath
		 *   The property path split into an array of segments
		 * @param {any} vValue
		 *   The property value
		 * @param {boolean} [bUpdating]
		 *   Whether the given property will not be overwritten by a creation POST(+GET) response
		 * @returns {object}
		 *   The resulting object
		 *
		 * @public
		 */
		makeUpdateData : function (aPropertyPath, vValue, bUpdating) {
			return aPropertyPath.reduceRight(function (vValue0, sSegment) {
				var oResult = {};

				oResult[sSegment] = vValue0;
				if (bUpdating) {
					oResult[sSegment + "@$ui5.updating"] = true;
					bUpdating = false;
				}
				return oResult;
			}, vValue);
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
		 * @param {string[]} [aFilters]
		 *   An array that consists of two filters, the first one ("$filter") has to be be applied
		 *   after and the second one ("$$filterBeforeAggregate") has to be applied before
		 *   aggregating the data. Both can be <code>undefined</code>.
		 * @returns {object}
		 *   The merged map of query options
		 *
		 * @public
		 */
		mergeQueryOptions : function (mQueryOptions, sOrderby, aFilters) {
			var mResult;

			function set(sProperty, sValue) {
				if (sValue && (!mQueryOptions || mQueryOptions[sProperty] !== sValue)) {
					mResult ??= mQueryOptions ? _Helper.clone(mQueryOptions) : {};
					mResult[sProperty] = sValue;
				}
			}

			set("$orderby", sOrderby);
			if (aFilters) {
				set("$filter", aFilters[0]);
				set("$$filterBeforeAggregate", aFilters[1]);
			}
			return mResult || mQueryOptions;
		},

		/**
		 * Determines the namespace of the given qualified name or annotation target.
		 *
		 * @param {string} sName
		 *   The qualified name or annotation target
		 * @returns {string}
		 *   The namespace
		 *
		 * @public
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
		 * Parses a literal to the model value. The type "Edm.Binary" is unsupported.
		 *
		 * @param {string} sLiteral The literal value
		 * @param {string} sType The type
		 * @param {string} sPath The path for this literal (for error messages)
		 * @returns {any} The model value
		 * @throws {Error} If the type is invalid or unsupported; the function only validates when a
		 *   conversion is required
		 *
		 * @public
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
				case "Edm.String":
					return sLiteral.slice(1, -1).replace(rSingleQuoteTwice, "'");
				default:
					throw new Error(sPath + ": Unsupported type: " + sType);
			}
		},

		/**
		 * Returns a map from HTTP response header names (in all lower case) to their string values.
		 *
		 * @param {string} sRawHeaders - A return value of XMLHttpRequest#getAllResponseHeaders
		 * @returns {Object<string>} - A map from names to values
		 *
		 * @public
		 */
		parseRawHeaders : function (sRawHeaders) {
			return sRawHeaders.split("\r\n")
				.slice(0, -1) // #split leaves an extra empty line
				.reduce((mHeaders, sRawLine) => {
					const iColon = sRawLine.indexOf(": ");
					if (iColon < 0) { // no value
						mHeaders[sRawLine] = "";
					} else {
						mHeaders[sRawLine.slice(0, iColon).toLowerCase()]
							= sRawLine.slice(iColon + 2);
					}
					return mHeaders;
				}, {});
		},

		/**
		 * Returns a clone of the given value where all occurrences of the private namespace
		 * object have been deleted. Also, properties starting with "$" are dropped from arrays.
		 *
		 * @param {any} vValue
		 *   Any value, including <code>undefined</code>
		 * @param {boolean} [bRemoveClientAnnotations]
		 *   Whether to remove all client-side annotations, not just private ones
		 * @param {boolean} [bAsString]
		 *   Whether to return the result of JSON.stringify
		 * @returns {any}
		 *   A public clone or its string representation
		 *
		 * @public
		 * @see sap.ui.model.odata.v4.lib._Helper.clone
		 */
		publicClone : function (vValue, bRemoveClientAnnotations, bAsString) {
			if (Array.isArray(vValue)) {
				vValue = vValue.slice(); // drop "$*" properties
			}
			return _Helper.clone(vValue, function (sKey, vValue0) {
				if (bRemoveClientAnnotations ? !sKey.startsWith("@$ui5.") : sKey !== "@$ui5._") {
					return vValue0;
				}
				// return undefined;
			}, bAsString);
		},

		/**
		 * Registers the listener for the given owner. Passes a deregister function to the listener.
		 *
		 * @param {object} oOwner - The owner with a map mChangeListeners (which may change)
		 * @param {string} sPath - The path
		 * @param {object} [oListener] - The listener
		 *
		 * @public
		 */
		registerChangeListener : function (oOwner, sPath, oListener) {
			if (oListener) {
				_Helper.addByPath(oOwner.mChangeListeners, sPath, oListener);
				oListener.setDeregisterChangeListener(function () {
					_Helper.removeByPath(oOwner.mChangeListeners, sPath, oListener);
				});
			}
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
		 *
		 * @public
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
		 * Restores an entity and its POST body to the initial state which is read from a private
		 * annotation. Key-value pairs are deleted if they are not in the initial state. Change
		 * listeners are notified about the changed or deleted values, and the "inactive" flag at
		 * the entity and at its corresponding context is reset to <code>true</code>.
		 *
		 * @param {object} mChangeListeners - A map of change listeners by path
		 * @param {string} sPath - The path to the entity; used to notify change listeners
		 * @param {object} oEntity - The entity to be restored.
		 *
		 * @public
		 */
		resetInactiveEntity : function (mChangeListeners, sPath, oEntity) {
			var oInitialData = _Helper.getPrivateAnnotation(oEntity, "initialData"),
				oPostBody = _Helper.getPrivateAnnotation(oEntity, "postBody"),
				oOldPostBody = Object.assign({}, oPostBody);

			Object.keys(oPostBody).forEach(function (sKey) {
				if (sKey in oInitialData) {
					oEntity[sKey] = oPostBody[sKey] = _Helper.clone(oInitialData[sKey]);
				} else {
					delete oPostBody[sKey];
					delete oEntity[sKey];
				}
			});

			_Helper.informAll(mChangeListeners, sPath, oOldPostBody, oPostBody, true);
			_Helper.updateAll(mChangeListeners, sPath, oEntity,
				{"@$ui5.context.isInactive" : true}
			);
			_Helper.getPrivateAnnotation(oEntity, "context").setInactive();
		},

		/**
		 * Resolves the "If-Match" header in the given map of request-specific headers.
		 * For lazy determination of the ETag, the "If-Match" header may contain an object
		 * containing the current ETag. If needed create a copy of the given map and replace the
		 * value of the "If-Match" header by the current ETag.
		 *
		 * @param {object} [mHeaders]
		 *   Map of request-specific headers.
		 * @param {boolean} [bIgnoreETag]
		 *   Whether the entity's ETag should be actively ignored (If-Match:*); ignored if there is
		 *   no ETag or if "If-Match" does not contain an object
		 * @returns {object}
		 *   The map of request-specific headers with the resolved If-Match header.
		 *
		 * @public
		 */
		resolveIfMatchHeader : function (mHeaders, bIgnoreETag) {
			var vIfMatchValue = mHeaders && mHeaders["If-Match"];

			if (vIfMatchValue && typeof vIfMatchValue === "object") {
				vIfMatchValue = vIfMatchValue["@odata.etag"];
				mHeaders = Object.assign({}, mHeaders);
				if (vIfMatchValue === undefined) {
					delete mHeaders["If-Match"];
				} else {
					mHeaders["If-Match"] = bIgnoreETag ? "*" : vIfMatchValue;
				}
			}
			return mHeaders;
		},

		/**
		 * Searches all properties in oOld annotated with "@$ui5.updating" and restores the property
		 * value in oNew.
		 *
		 * @param {object} [oOld]
		 *   The old element
		 * @param {object} [oNew]
		 *   The new element
		 * @returns {object}
		 *   The new element with the restored properties
		 *
		 * @public
		 */
		restoreUpdatingProperties : function (oOld, oNew) {
			var oTempNew = oNew || {};

			Object.keys(oOld || {}).forEach(function (sProperty) {
				if (sProperty.startsWith("@")) {
					return; // skip annotations
				}
				if (Array.isArray(oOld[sProperty])) {
					return; // skip arrays
				}
				if (typeof oOld[sProperty] === "object") {
					oTempNew[sProperty]
						= _Helper.restoreUpdatingProperties(oOld[sProperty], oTempNew[sProperty]);
				}
				if (oOld[sProperty + "@$ui5.updating"]) {
					oTempNew[sProperty] = oOld[sProperty];
					oTempNew[sProperty + "@$ui5.updating"] = oOld[sProperty + "@$ui5.updating"];
					oNew = oTempNew;
				}
			});
			return oNew;
		},

		/**
		 * Adds the key properties of the given entity type to $select of the given query options.
		 *
		 * @param {object} mQueryOptions
		 *   The query options
		 * @param {object} oType
		 *   The entity type's metadata "JSON"
		 *
		 * @public
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
		 * Sets the new value of the annotation with the given name at the given object; removes it
		 * in case of an <code>undefined</code> value.
		 *
		 * @param {object} oObject - Any object
		 * @param {string} sAnnotation - The annotation's name
		 * @param {any} [vValue] - The annotation's new value
		 *
		 * @public
		 */
		setAnnotation : function (oObject, sAnnotation, vValue) {
			if (vValue !== undefined) {
				oObject[sAnnotation] = vValue;
			} else {
				delete oObject[sAnnotation];
			}
		},

		/**
		 * Sets the collection's $count: a number representing the sum of the element count on
		 * server-side and the number of transient elements created on the client. It may be
		 * <code>undefined</code>, but not <code>Infinity</code>. Notifies the listeners. Requires
		 * that <code>$count</code> exists as an own property of the collection.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the collection in the cache
		 * @param {object[]} aCollection The collection
		 * @param {string|number} vCount The count
		 *
		 * @public
		 */
		setCount : function (mChangeListeners, sPath, aCollection, vCount) {
			// Note: @odata.count is of type Edm.Int64, represented as a string in OData responses;
			// $count should be a number and the loss of precision is acceptable
			if (typeof vCount === "string") {
				vCount = parseInt(vCount);
			}
			// Note: this relies on $count being present as an own property of aCollection
			_Helper.updateExisting(mChangeListeners, sPath, aCollection, {$count : vCount});
		},

		/**
		 * Adds the given language as "sap-language" URL parameter to the given URL, unless such a
		 * parameter is already present, and returns the resulting (or unchanged) URL.
		 *
		 * @param {string} sUrl - A URL w/o a fragment part
		 * @param {string} [sLanguage] - An optional value for "sap-language"
		 * @returns {string} The resulting (or unchanged) URL as described above
		 *
		 * @public
		 */
		setLanguage : function (sUrl, sLanguage) {
			if (sLanguage && !sUrl.includes("?sap-language=") && !sUrl.includes("&sap-language=")) {
				sUrl += (sUrl.includes("?") ? "&" : "?") + "sap-language="
					+ _Helper.encode(sLanguage);
			}

			return sUrl;
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
		 *
		 * @public
		 */
		setPrivateAnnotation : function (oObject, sAnnotation, vValue) {
			var oPrivateNamespace = oObject["@$ui5._"];

			oPrivateNamespace ??= oObject["@$ui5._"] = {};
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
		 *
		 * @public
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
		 * non-array value is wrapped with an array and an array is returned as a shallow copy.
		 *
		 * @param {any} [vElement]
		 *   The element to be converted into an array.
		 * @returns {Array}
		 *   The array for the given element.
		 *
		 * @public
		 */
		toArray : function (vElement) {
			if (vElement === undefined || vElement === null) {
				return [];
			}
			if (Array.isArray(vElement)) {
				return vElement.slice();
			}
			return [vElement];
		},

		// Trampoline property to allow for mocking function module in unit tests.
		// @see sap.base.util.uid
		uid : uid,

		/**
		 * Updates the target object with the source object. All properties of the source object are
		 * taken into account. Fires change events for all changed properties. The function
		 * recursively handles modified, added or removed structural properties (or single-valued
		 * navigation properties) and fires change events for all modified/added/removed primitive
		 * properties therein. It also fires for each collection encountered, no matter if changed
		 * or not.
		 *
		 * Restrictions:
		 * - oTarget and oSource are expected to have the same structure: when there is an
		 *   object at a given path in either of them, the other one must have an object or
		 *   <code>null</code>.
		 * - list bindings without own cache must refresh when updateAll is used to update cache
		 *   data.
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the old object in mChangeListeners
		 * @param {object} oTarget The target object
		 * @param {object} oSource The source object
		 * @returns {object} The target object
		 * @throws {Error} If a key predicate check fails
		 *
		 * @public
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
					// copy complete collection
					oTarget[sProperty] = vSourceProperty;
					_Helper.fireChange(mChangeListeners, sPropertyPath, vSourceProperty);
				} else if (vSourceProperty && typeof vSourceProperty === "object") {
					vTargetProperty = oTarget[sProperty]
						= _Helper.updateAll(mChangeListeners, sPropertyPath, vTargetProperty || {},
								vSourceProperty);
					_Helper.fireChange(mChangeListeners, sPropertyPath, vTargetProperty);
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
		 * advertised actions. It also fires for each collection encountered, no matter if changed
		 * or not.
		 *
		 * Restrictions:
		 * - oOldObject and oNewObject are expected to have the same structure: when there is an
		 *   object at a given path in either of them, the other one must have an object or
		 *   <code>null</code>.
		 * - does not update collection-valued navigation properties properly (ignores both key
		 *   predicates and $count)
		 *
		 * @param {object} mChangeListeners A map of change listeners by path
		 * @param {string} sPath The path of the old object in mChangeListeners
		 * @param {object} oOldObject The old object
		 * @param {object} [oNewObject] The new object
		 *
		 * @public
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
						// copy complete collection
						oOldObject[sProperty] = vNewProperty;
						_Helper.fireChange(mChangeListeners, sPropertyPath, vNewProperty);
					} else if (vNewProperty && typeof vNewProperty === "object") {
						if (vOldProperty) {
							// a structural property was modified
							_Helper.updateExisting(mChangeListeners, sPropertyPath, vOldProperty,
								vNewProperty);
							_Helper.fireChange(mChangeListeners, sPropertyPath, vOldProperty);
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
		 * Determines whether the response is a deep create response. Copies nested collections from
		 * the response into the target object and adjusts their additional properties ($count,
		 * $created, $byPredicate). Single nested entities are not copied here, assuming that they
		 * are updated together with the top-level entity (because with a deep create all properties
		 * incl. single-valued navigation properties are accepted).
		 *
		 * Note that this completely recreates nested collections destroying the previous transient
		 * elements. This is because the response may differ significantly from the request
		 * regarding order and count.
		 *
		 * @param {object} mChangeListeners - A map of change listeners by path
		 * @param {object} mQueryOptions - The query options
		 * @param {string} sPath
		 *   The path of the target entity relative to mChangeListeners and mQueryOptions
		 * @param {object} oTargetEntity - The target entity
		 * @param {object} oCreatedEntity - The created entity from the response
		 * @param {object} mSelectForMetaPath
		 *   A map of $select properties per meta path of the nested collections
		 * @returns {boolean} Whether there actually was a deep create
		 *
		 * @private
		 */
		updateNestedCreates : function (mChangeListeners, mQueryOptions, sPath, oTargetEntity,
				oCreatedEntity, mSelectForMetaPath) {
			let bDeepCreate = false;

			// single-valued
			const mQueryOptionsForEntity = _Helper.getQueryOptionsForPath(mQueryOptions, sPath);
			Object.keys(mQueryOptionsForEntity.$expand || {}).forEach(function (sExpandPath) {
				const oNestedTargetEntity = _Helper.drillDown(oTargetEntity, sExpandPath);
				// sent and single-valued
				if (oNestedTargetEntity && !Array.isArray(oNestedTargetEntity)) {
					bDeepCreate = true; // they are updated with the top-level entity
				}
			});

			// collection-valued
			Object.keys(mSelectForMetaPath || {}).filter(function (sMetaPath) {
				return !sMetaPath.includes("/"); // only look at the direct descendants
			}).forEach(function (sSegment) {
				const aNestedCreatedEntities = oCreatedEntity[sSegment];
				if (!aNestedCreatedEntities) { // create not called in this nested collection
					// #addTransientEntity added this in preparation of a deep create
					delete oTargetEntity[sSegment];
					return;
				}

				// copy the collection into the target entity and set the additional properties
				oTargetEntity[sSegment] = aNestedCreatedEntities;
				aNestedCreatedEntities.$count = undefined; // -> setCount must fire a change event
				aNestedCreatedEntities.$created = 0;
				aNestedCreatedEntities.$byPredicate = {};
				// If mSelectForMetaPath has query options, the corresponding nested ODLB will get a
				// cache later and must transfer the data to its own cache; otherwise, the nested
				// binding has no cache and must not lose its data (BCP: 2380101762)
				if (mSelectForMetaPath[sSegment]) {
					aNestedCreatedEntities.$transfer = true;
				}
				const sCollectionPath = sPath + "/" + sSegment;
				_Helper.setCount(mChangeListeners, sCollectionPath, aNestedCreatedEntities,
					aNestedCreatedEntities.length);
				// build the next level
				const mSelectForChildMetaPath = {};
				const sPrefix = sSegment + "/";
				Object.keys(mSelectForMetaPath).forEach(function (sMetaPath) {
					if (sMetaPath.startsWith(sPrefix)) {
						mSelectForChildMetaPath[sMetaPath.slice(sPrefix.length)]
							= mSelectForMetaPath[sMetaPath];
					}
				});
				aNestedCreatedEntities.forEach(function (oCreatedChildEntity) {
					const sPredicate
						= _Helper.getPrivateAnnotation(oCreatedChildEntity, "predicate");
					aNestedCreatedEntities.$byPredicate[sPredicate] = oCreatedChildEntity;
					// recurse for $count, $byPredicate of nested collections
					_Helper.updateNestedCreates(mChangeListeners, mQueryOptions,
						sCollectionPath + sPredicate, oCreatedChildEntity, oCreatedChildEntity,
						mSelectForChildMetaPath);
				});

				bDeepCreate = true;
			});

			return bDeepCreate;
		},

		/**
		 * Recursively adds all properties of oSource to oTarget that do not exist there yet.
		 * Ensures that object references in oTarget remain unchanged.
		 *
		 * Restrictions:
		 * - oTarget and oSource are expected to have the same structure: when there is an
		 *   object at a given path in either of them, the other one must have an object.
		 *   <code>null</code>, or no property at all.
		 * - arrays are not merged in any way, they are taken either from oSource or from oTarget
		 *
		 * @param {object} oTarget - The target
		 * @param {object} oSource - The source
		 *
		 * @public
		 */
		updateNonExisting : function (oTarget, oSource) {
			Object.keys(oSource).forEach(function (sKey) {
				var vSourceValue = oSource[sKey],
					vTargetValue;

				if (sKey in oTarget) {
					vTargetValue = oTarget[sKey];
					if (vSourceValue && vTargetValue
							&& typeof vSourceValue === "object" && !Array.isArray(vSourceValue)) {
						_Helper.updateNonExisting(vTargetValue, vSourceValue);
					}
				} else {
					oTarget[sKey] = vSourceValue;
				}
			});
		},

		/**
		 * Updates the old value with the given new value for the selected properties (see
		 * {@link #updateExisting}). If a property is missing in the new value, the old value
		 * remains unchanged. If no selected properties are given or if "*" is contained in the
		 * selected properties, then all properties are selected. Fires change events for all
		 * changed properties. An instance annotation is updated if the instance (which would be a
		 * complex-valued structural property then) or one of its properties is selected, a property
		 * annotation is updated if the property itself is selected.
		 *
		 * Restrictions:
		 * - oOldValue and oNewValue are expected to have the same structure: when there is an
		 *   object at a given path in either of them, the other one must have an object or
		 *   <code>null</code>.
		 * - "*" in aSelect does not work correctly if oNewValue contains navigation properties
		 * - does not update collection-valued navigation properties properly (ignores both key
		 *   predicates and $count)
		 *
		 * @param {object} mChangeListeners
		 *   A map of change listeners by path
		 * @param {string} sBasePath
		 *   The path of oOldValue in mChangeListeners
		 * @param {object} oOldValue
		 *   The old value
		 * @param {object} oNewValue
		 *   The new value
		 * @param {string[]} [aSelect]
		 *   The relative paths to properties to be updated in oOldValue; default is all properties
		 *   from oNewValue
		 * @param {function} [fnCheckKeyPredicate]
		 *   Callback function which tells whether the key predicate for the given path is checked
		 *   for equality instead of just being copied from source to target
		 * @param {boolean} [bOkIfMissing]
		 *   Whether this should not check for selected properties missing in the response
		 *
		 * @public
		 */
		updateSelected : function (mChangeListeners, sBasePath, oOldValue, oNewValue, aSelect,
			fnCheckKeyPredicate, bOkIfMissing) {
			/*
			 * Gets the property's value in vSelect. Instance annotations are always selected,
			 * property annotations only if the property is selected.
			 * @param {object|boolean} vSelect
			 *   The result from _Helper.buildSelect or true if the complex structure is selected
			 * @param {string} sProperty
			 *   The property name
			 * @returns {object|boolean|undefined}
			 *   undefined to ignore, {} to update it w/o event, true to update w/ event
			 */
			function getSelect(vSelect, sProperty) {
				var iAt;

				if (vSelect === true) {
					return true;
				}
				if (vSelect[sProperty]) {
					return vSelect[sProperty];
				}
				iAt = sProperty.indexOf("@");
				if (iAt === 0 || iAt > 0 && vSelect[sProperty.slice(0, iAt)]) {
					return true; // always fire changes for selected annotations
				}
			}

			/*
			 * The recursive update function.
			 * @param {string} sPath - The path of oTarget in the cache
			 * @param {object|boolean} vSelect
			 *   The result from _Helper.buildSelect or true if the complex structure is selected
			 * @param {object} oTarget - The update target
			 * @param {object} oSource - The update source
			 * @returns {object} oTarget
			 */
			function update(sPath, vSelect, oTarget, oSource) {
				// Remove annotations that are selected, but not in oSource anymore; except client
				// annotations
				Object.keys(oTarget).forEach(function (sProperty) {
					if (!(sProperty in oSource) && sProperty.includes("@")
							&& !sProperty.startsWith("@$ui5.") && getSelect(vSelect, sProperty)
							&& !sProperty.endsWith("@$ui5.updating")
						) {
						delete oTarget[sProperty];
						_Helper.fireChange(mChangeListeners, _Helper.buildPath(sPath, sProperty),
							undefined);
					}
				});

				// The actual update loop
				Object.keys(oSource).forEach(function (sProperty) {
					var sPropertyPath = _Helper.buildPath(sPath, sProperty),
						vSelected = getSelect(vSelect, sProperty),
						sSourcePredicate,
						vSourceProperty = oSource[sProperty],
						sTargetPredicate,
						vTargetProperty = oTarget[sProperty];

					if (!vSelected) {
						return;
					}
					if (sProperty === "@$ui5._") {
						sSourcePredicate = _Helper.getPrivateAnnotation(oSource, "predicate");
						if (fnCheckKeyPredicate && fnCheckKeyPredicate(sPath)) {
							sTargetPredicate = _Helper.getPrivateAnnotation(oTarget, "predicate");
							if (sSourcePredicate !== sTargetPredicate) {
								throw new Error("Key predicate of '" + sPath + "' changed from "
									+ sTargetPredicate + " to " + sSourcePredicate);
							}
						} else {
							_Helper.setPrivateAnnotation(oTarget, "predicate", sSourcePredicate);
						}
					} else if (Array.isArray(vSourceProperty)) {
						// copy complete collection; transient entity collections from a deep
						// create are handled elsewhere
						if (!(vTargetProperty && vTargetProperty.$postBodyCollection)) {
							oTarget[sProperty] = vSourceProperty;
							_Helper.fireChange(mChangeListeners, sPropertyPath, vSourceProperty);
						}
					} else if (vSourceProperty && typeof vSourceProperty === "object"
							&& !sProperty.includes("@")) {
						oTarget[sProperty] = update(sPropertyPath, vSelected, vTargetProperty || {},
							vSourceProperty);
						_Helper.fireChange(mChangeListeners, sPropertyPath, vSourceProperty);
					} else if (vTargetProperty !== vSourceProperty
							&& !oTarget[sProperty + "@$ui5.updating"]) {
						oTarget[sProperty] = vSourceProperty;
						if (vTargetProperty && typeof vTargetProperty === "object") {
							// a complex property is replaced by null
							_Helper.fireChanges(mChangeListeners, sPropertyPath, vTargetProperty,
								true);
						} else if (vSelected === true) {
							_Helper.fireChange(mChangeListeners, sPropertyPath, vSourceProperty);
						}
					}
				});

				if (bOkIfMissing) {
					return oTarget;
				}

				// Create annotations for a property which was selected but no data was received
				Object.keys(vSelect).forEach(function (sProperty) {
					if (oTarget[sProperty] === undefined && sProperty !== "*") {
						oTarget[sProperty + "@$ui5.noData"] = true;
						// Fire change event (useful for Edm.Stream in case of the URL stays the
						// same, but the content was changed)
						_Helper.fireChange(mChangeListeners, _Helper.buildPath(sPath, sProperty),
							undefined, true);
					}
				});

				return oTarget;
			}

			update(sBasePath, _Helper.buildSelect(aSelect), oOldValue, oNewValue);
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
		 *
		 * @public
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
		 * navigation properties. Requires that metadata for the meta path is already loaded so
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
		 * @returns {object|undefined} The query options for the child binding or
		 *   <code>undefined</code> in case the query options cannot be created, e.g. because $apply
		 *   cannot be wrapped into $expand
		 *
		 * @public
		 */
		wrapChildQueryOptions : function (sBaseMetaPath, sChildMetaPath, mChildQueryOptions,
				fnFetchMetadata) {
			var sExpandSelectPath = "",
				aMetaPathSegments = sChildMetaPath.split("/"),
				oProperty,
				sPropertyMetaPath = sBaseMetaPath,
				mQueryOptions = {},
				mQueryOptionsForPathPrefix = mQueryOptions,
				i;

			if (sChildMetaPath === "") {
				return mChildQueryOptions;
			}

			for (i = 0; i < aMetaPathSegments.length; i += 1) {
				sPropertyMetaPath = _Helper.buildPath(sPropertyMetaPath, aMetaPathSegments[i]);
				sExpandSelectPath = _Helper.buildPath(sExpandSelectPath, aMetaPathSegments[i]);
				if (aMetaPathSegments[i].endsWith("*")) {
					oProperty = null;
					continue; // no, don't break! fail in case path continues
				}
				oProperty = fnFetchMetadata(sPropertyMetaPath).getResult();
				if (oProperty.$kind === "NavigationProperty") {
					mQueryOptionsForPathPrefix.$expand = {};
					if (i === aMetaPathSegments.length - 1) {
						// avoid that mChildQueryOptions.$select is modified by selectKeyProperties
						mChildQueryOptions = Object.assign({}, mChildQueryOptions);
						mChildQueryOptions.$select &&= mChildQueryOptions.$select.slice();
					}
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
			if (!oProperty || oProperty.$kind === "Property") {
				if (!isEmptyObject(mChildQueryOptions)) {
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
});
