/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/thirdparty/odatajs-4.0.0"
], function (ODataUtils, Olingo) {
	"use strict";

	/*global odatajs */

	var Helper,
		rNameWithPredicate = /^(\w+)\((.*)\)$/;

	Helper = {
		/**
		 * Returns an <code>Error</code> instance from an Olingo error response.
		 *
		 * @param {object} oError
		 *   an Olingo error object as received by a failure handler
		 * @param {string} oError.message
		 *   Olingo's error message
		 * @param {object} oError.response
		 *   Olingo's HTTP response object
		 * @param {string} oError.response.body
		 *   HTTP response body, sometimes in JSON format
		 * @param {number} oError.response.statusCode
		 *   HTTP status code
		 * @param {string} oError.response.statusText
		 *   HTTP status text
		 * @returns {Error}
		 *   an <code>Error</code> instance with a somehow readable message, containing the
		 *   original Olingo error object as "cause" property and the "error" value from the OData
		 *   v4 error response JSON object as "error" property (if available); it is flagged with
		 *   <code>isConcurrentModification</code> in case of HTTP status code 412
		 * @see <a href=
		 * "http://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html"
		 * >"19 Error Response"</a>
		 */
		createError : function (oError) {
			var sBody = oError.response.body,
				sContentType =  oError.response.headers["Content-Type"].split(";")[0],
				oResult = new Error(oError.message + " - " + oError.response.statusCode + " "
					+ oError.response.statusText);

			oResult.cause = oError;
			if (oError.response.statusCode === 412) {
				oResult.isConcurrentModification = true;
			}
			if (sContentType === "application/json") {
				try {
					// "The error response MUST be a single JSON object. This object MUST have a
					// single name/value pair named error. The value must be a JSON object."
					oResult.error = JSON.parse(sBody).error;
					oResult.message = oResult.error.message + " (" + oResult.message + ")";
				} catch (e) {
					jQuery.sap.log.warning(e.toString(), sBody,
						"sap.ui.model.odata.v4._ODataHelper");
				}
			} else if (sContentType === "text/plain") {
				oResult.message = oResult.message + ": " + sBody;
			}

			return oResult;
		},

		/**
		 * Assumes that the given path consists of a single selector only and extracts the value
		 * for the key with given name from that selector.
		 *
		 * @param {string} sPath
		 *   the path
		 * @param {string} sName
		 *   the expected name of the selector
		 * @param {string} sKey
		 *   the name of the selector's key
		 * @returns {string}
		 *   the value of the selector's key
		 * @throws {Error}
		 *   if expectations are not met
		 */
		extractSingleKey : function (sPath, sName, sKey) {
			var aSegments = Helper.splitPath(sPath),
				oSelector;

			if (aSegments.length !== 1) {
				throw new Error("Expected a single selector, but instead saw: " + sPath);
			}
			oSelector = Helper.parsePathSegment(aSegments[0]);
			if (oSelector.name !== sName) {
				throw new Error("Expected '" + sName + "', but instead saw '" + oSelector.name
					+ "': " + sPath);
			}
			return oSelector.key[sKey];
		},

		/**
		 * Finds an object which has a property <code>sProperty</code> with value
		 * <code>sValue</code> in the given array.
		 *
		 * @param {object[]} aObjects
		 *   the array to search in
		 * @param {string} sProperty
		 *   the name of the property to look at
		 * @param {string} sValue
		 *   the expected value
		 * @returns {object}
		 *   the matching object or <code>undefined</code> if not found
		 */
		findInArray : function (aObjects, sProperty, sValue) {
			var i;

			for (i = 0; i < aObjects.length; i++) {
				if (aObjects[i][sProperty] === sValue) {
					return aObjects[i];
				}
			}
			return undefined;
		},

		/**
		 * Finds an object in the given array having all properties of the key with the same
		 * values.
		 *
		 * @param {object[]} aObjects
		 *   the array to search in
		 * @param {object} oKey
		 *   the key
		 * @returns {object}
		 *   the matching object or <code>undefined</code> if not found
		 */
		findKeyInArray : function (aObjects, oKey) {
			var i;

			function matches(oObject) {
				var sProperty;

				for (sProperty in oKey) {
					if (oKey[sProperty] !== oObject[sProperty]) {
						return false;
					}
				}
				return true;
			}

			for (i = 0; i < aObjects.length; i++) {
				if (matches(aObjects[i])) {
					return aObjects[i];
				}
			}
			return undefined;
		},

		/**
		 * Returns the name of the entity set corresponding to the indicated navigation property.
		 *
		 * @param {object} oEntityContainer
		 *   the entity container as returned by {@link requestEntityContainer}
		 * @param {string} sSourceTypeName
		 *   the source entity type's qualified name, e.g.
		 *   "com.sap.gateway.iwbep.tea_busi.v0001.TEAM"
		 * @param {string} sNavigationPropertyName
		 *   the navigation property's name, e.g. "TEAM_2_EMPLOYEES"
		 * @returns {string}
		 *   the entity set's name, e.g. "EMPLOYEES"
		 * @throws {Error}
		 *   if no such entity set can be found
		 * @private
		 */
		getEntitySetName : function (oEntityContainer, sSourceTypeName, sNavigationPropertyName) {
			var sEntitySetName;

			oEntityContainer.EntitySets.some(function (oEntitySet) {
				var sQualifiedName = Helper.extractSingleKey(
						"/" + oEntitySet["EntityType@odata.navigationLink"],
						"Types", "QualifiedName"); // e.g. '§.TEAM'

				if (sQualifiedName === sSourceTypeName) {
					return oEntitySet.NavigationPropertyBindings.some(function (oBinding) {
						if (oBinding.Path === sNavigationPropertyName) {
							sEntitySetName = Helper.extractSingleKey(
									"/" + oBinding["Target@odata.navigationLink"],
									"EntitySets", "Fullname") // e.g. '§.Container/EMPLOYEES'
								.split("/")[1];
							return true;
						}
					});
				}
			});

			if (!sEntitySetName) {
				throw new Error("No target entity set found for source entity type '"
					+ sSourceTypeName + "' and navigation property '" + sNavigationPropertyName
					+ "'");
			}

			return sEntitySetName;
		},

		/**
		 * Returns the key predicate (see "4.3.1 Canonical URL") for the given entity type meta
		 * data and entity instance runtime data.
		 *
		 * @param {object} oEntityType
		 *   entity type meta data
		 * @param {object} oEntityInstance
		 *   entity instance runtime data
		 * @returns {string}
		 *   the key predicate, e.g. "(Sector='DevOps',ID='42')"
		 */
		getKeyPredicate : function (oEntityType, oEntityInstance) {
			var aKeyValuePairs = [];

			oEntityType.Key.forEach(function (oKey) {
				var sName = oKey.PropertyPath,
					oProperty = Helper.findInArray(oEntityType.Properties, "Name", sName),
					sType = oProperty.Type.QualifiedName,
					sValue = ODataUtils.formatValue(oEntityInstance[sName], sType);

				aKeyValuePairs.push(
					encodeURIComponent(sName) + "=" + encodeURIComponent(sValue));
			});

			return "(" + aKeyValuePairs.join(",") + ")";
		},

		/**
		 * Checks whether the given object has exactly the requested properties.
		 *
		 * @param {object} oObject
		 *   the object to check, may be <code>undefined</code> (which returns <code>false</code>)
		 * @param {string[]} aProperties
		 *   a list of expected properties
		 * @returns {boolean}
		 *   <code>true</code>, if the object has exactly the properties from the list
		 */
		hasProperties : function (oObject, aProperties) {
			var i;

			if (!oObject || Object.keys(oObject).length !== aProperties.length) {
				return false;
			}
			for (i = 0; i < aProperties.length; i++) {
				if (!(aProperties[i] in oObject)) {
					return false;
				}
			}
			return true;
		},

		/**
		 * Iterates over the given headers map and returns the first value for the requested key
		 * (case insensitive). If no such key is found, <code>undefined</code> is returned.
		 *
		 * @param {string} sKey
		 *   the requested key
		 * @param {object} [mHeaders={}]
		 *   an object treated as a <code>map&lt;string, any&gt;</code>
		 * @returns {any}
		 *   the header value or <code>undefined</code> if the header was not found
		 */
		headerValue : function (sKey, mHeaders) {
			var sCurrentKey;

			sKey = sKey.toLowerCase();
			for (sCurrentKey in mHeaders) {
				if (sCurrentKey.toLowerCase() === sKey) {
					return mHeaders[sCurrentKey];
				}
			}
//			return undefined;
		},

		/**
		 * Decodes a segment of an OData v4 path. Recognizes the key predicate. No URI decoding
		 * takes place, use {@link #splitPath} before!
		 *
		 * @param {string} sPathSegment
		 *   the path segment
		 * @returns {object}
		 *   the result with the name in <code>name</code> and the key predicate in
		 *   <code>key</code> or <code>undefined</code> if <code>sPathSegment</code> is
		 *   <code>undefined</code>.
		 */
		parsePathSegment : function (sPathSegment) {
			var aMatches,
				iNext = 0,
				sPredicate,
				oResult = {all: sPathSegment};

			/**
			 * Parses and removes a key from <code>sPredicate</code>.
			 *
			 * @returns {string}
			 *   the key
			 */
			function parseNextKey() {
				var iEnd = sPredicate.indexOf('=', iNext),
					sKey = sPredicate.slice(iNext, iEnd);
				iNext = iEnd + 1;
				return sKey;
			}

			/**
			 * Parses and removes a value from <code>sPredicate</code>. Recognizes a string in
			 * single quotes and a number.
			 *
			 * @returns {any}
			 *   the value
			 */
			function parseNextValue() {
				var i, vValue;

				if (sPredicate.charAt(iNext) === "'") {
					vValue = "";
					i = iNext = iNext + 1;
					for (;;) {
						i = i + 1;
						if (sPredicate.charAt(i) === "'") {
							vValue = vValue + sPredicate.slice(iNext, i);
							iNext = i = i + 1;
							if (sPredicate.charAt(i) !== "'") {
								break;
							}
						}
					}
				} else {
					i = iNext;
					while (sPredicate.charAt(i) >= '0' && sPredicate.charAt(i) <= '9') {
						i = i + 1;
					}
					vValue = parseInt(sPredicate.slice(iNext, i), 10);
					iNext = i;
				}
				return vValue;
			}

			if (!sPathSegment) {
				return undefined;
			}
			aMatches = rNameWithPredicate.exec(sPathSegment);
			if (aMatches) {
				oResult.name = aMatches[1];
				oResult.key = {};
				sPredicate = aMatches[2];
				for (;;) {
					oResult.key[parseNextKey()] = parseNextValue();
					if (sPredicate.charAt(iNext) !== ',') {
						break;
					}
					sPredicate = sPredicate.substring(1);
				}
			} else {
				oResult.name = sPathSegment;
			}
			return oResult;
		},

		/**
		 * Returns a promise for a call to <code>odatajs.oData.request</code> with the given request
		 * object. Takes care of CSRF token handling.
		 *
		 * @param {sap.ui.model.odata.v4.ODataModel} oModel
		 *   the model (used for headers and to refresh the security token)
		 * @param {object} oRequest
		 *   Olingo request object
		 * @param {boolean} [bIsFreshToken=false]
		 *   whether the CSRF token has already been refreshed and thus should not be refreshed
		 *   again
		 * @returns {Promise}
		 *   a promise which is resolved with the server's response data in case of success, or
		 *   rejected with an instance of <code>Error</code> in case of failure
		 *
		 * @private
		 */
		request : function (oModel, oRequest, bIsFreshToken) {
			oRequest.headers["X-CSRF-Token"] = oModel.mHeaders["X-CSRF-Token"];

			return new Promise(function (fnResolve, fnReject) {
				odatajs.oData.request(oRequest, function (oData, oResponse) {
					fnResolve(oData);
				}, function (oError) {
					var sCsrfToken = Helper.headerValue("X-CSRF-Token", oError.response.headers);

					if (!bIsFreshToken && oError.response.statusCode === 403
						&& sCsrfToken && sCsrfToken.toLowerCase() === "required") {
						// refresh CSRF token and repeat original request
						oModel.refreshSecurityToken().then(function() {
							fnResolve(Helper.request(oModel, oRequest, true));
						}, fnReject);
					} else {
						fnReject(Helper.createError(oError));
					}
				});
			});
		},

		/**
		 * Requests the entity container from the meta data model including the entity sets and the
		 * singletons. Keeps it in a cache and responds subsequent requests from the cache.
		 *
		 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel
		 *   the meta model
		 * @returns {Promise}
		 *   A promise which is resolved with the entity container as soon as it is available
		 * @private
		 */
		requestEntityContainer : function (oMetaModel) {
			if (!oMetaModel._oEntityContainerPromise) {
				oMetaModel._oEntityContainerPromise = oMetaModel.oModel.read("/EntityContainer");
			}
			return oMetaModel._oEntityContainerPromise;
		},

		/**
		 * Requests the name of the entity set corresponding to the given meta context.
		 *
		 * @param {sap.ui.model.Context} oMetaContext
		 *   a context within a v4 OData meta model pointing to either an entity set or a
		 *   navigation property
		 * @returns {Promise}
		 *   a promise which is resolved with the entity set's name (e.g. "EMPLOYEES") in case of
		 *   success, or rejected with an instance of <code>Error</code> in case of failure
		 * @private
		 */
		requestEntitySetName : function (oMetaContext) {
			var sEntitySetName,
				oMetaModel = oMetaContext.getModel(),
				// e.g. "/EntitySets(Name='foo')"
				// or   "/EntitySets(Name='foo')/EntityType/NavigationProperties(Name='bar')"
				sMetaPath = oMetaContext.getPath(),
				iLastSlash = sMetaPath.lastIndexOf("/");

			if (iLastSlash === 0) {
				sEntitySetName = Helper.extractSingleKey(sMetaPath, "EntitySets", "Name");
				return Promise.resolve(sEntitySetName);
			}

			return Helper.requestEntityContainer(oMetaModel)
				.then(function (oEntityContainer) {
					var sNavigationPropertyName = sMetaPath.slice(iLastSlash).split("'")[1],
						// path to entity type which is source of navigation property in question
						sSourceTypePath = sMetaPath.slice(0, iLastSlash);

					return oMetaContext.getModel().requestObject(sSourceTypePath)
						.then(function (oSourceType) {
							return Helper.getEntitySetName(oEntityContainer,
								oSourceType.QualifiedName, sNavigationPropertyName);
						});
				});
		},

		/**
		 * Requests the value of the given property at the given object if it is not available
		 * yet. This requires that the object has a property with the name of the requested
		 * property plus "@odata.navigationLink" appended. If the given property is undefined yet,
		 * the value is read from the model via the given navigation link, stored at the property
		 * and then given to the promise. If the property already has a value, it is returned
		 * asynchronously without any read.
		 *
		 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel
		 *   the meta model
		 * @param {object} oObject
		 *   the object having a navigation link
		 * @param {string} sProperty
		 *   the name of the property
		 * @param {string} sRequestPath
		 *   the request path (only used for the error message)
		 * @returns {Promise}
		 *   a promise that will be resolved with the requested property value
		 * @throws {Error} if the property or its navigation link are unsupported
		 * @private
		 */
		requestProperty : function (oMetaModel, oObject, sProperty, sRequestPath) {
			var sNavigationLink,
				sPath,
				aSegments,
				oSelector;

			if (sProperty in oObject) {
				return Promise.resolve(oObject[sProperty]);
			}

			sNavigationLink = sProperty + "@odata.navigationLink";
			if (!(sNavigationLink in oObject)) {
				throw new Error("Unknown: " + sProperty + ": " + sRequestPath);
			}
			sPath = oObject[sNavigationLink];
			aSegments = Helper.splitPath("/" + sPath);
			if (aSegments.length !== 1) {
				throw new Error("Invalid path: " + sPath);
			}
			oSelector = Helper.parsePathSegment(aSegments[0]);
			if (!oSelector.key) {
				throw new Error("Invalid path: " + aSegments[0]);
			}

			return Helper.requestEntityContainer(oMetaModel).then(function (oEntityContainer) {
				var oArray = oEntityContainer[oSelector.name],
					oResult;

				if (oArray) {
					oResult = Helper.findKeyInArray(oArray, oSelector.key);
					if (oResult) {
						return Promise.resolve(oResult);
					}
				} else {
					oEntityContainer[oSelector.name] = [];
				}

				return oMetaModel.oModel.read("/" + sPath).then(function (oResult) {
					oEntityContainer[oSelector.name].push(oResult); //TODO JsDoc
					oObject[sProperty] = oResult;
					return oResult;
				});
			});
		},

		/**
		 * Splits an absolute path at '/' into an array of path segments. URI-decodes the path
		 * segments. The empty path "/" results in an empty array.
		 *
		 * @param {string} sPath
		 *   the path
		 * @returns {string[]}
		 *   the path parts
		 * @throws {Error} if the path is not absolute
		 */
		splitPath : function (sPath) {
			var i, aSegments;

			if (sPath === '/') {
				return [];
			}
			if (sPath.charAt(0) !== '/') {
				throw new Error("Not an absolute path: " + sPath);
			}
			aSegments = sPath.substring(1).split('/');
			for (i = 0; i < aSegments.length; i++) {
				//TODO this does not fit to the way we partially encode key predicates!
				aSegments[i] = decodeURIComponent(aSegments[i]);
			}
			return aSegments;
		}
	};

	return Helper;
}, /* bExport= */ false);
