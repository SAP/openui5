/*!
 * ${copyright}
 */

sap.ui.define([
], function () {
	"use strict";

	var Helper,
		rNameWithPredicate = /^(\w+)\((.*)\)$/;

	Helper = {
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
		 * Handles an error of <code>odatajs.oData.request</code>. Parses the body for an
		 * specific OData error message, logs it and returns it.
		 *
		 * @param {object} oResult
		 *   the error result of an OData request
		 * @param {string} sMessage
		 *   the error message in case the response could not be parse (e.g. because it came from
		 *   the HTTP server and not from the OData service)
		 * @param {string} sComponent
		 *   the component for the error log entry
		 * @returns {string}
		 *   the extracted error message
		 */
		handleODataError : function (oResult, sMessage, sComponent) {
			var oErrorObject;
			try {
				oErrorObject = JSON.parse(oResult.response.body).error;
				if ("message" in oErrorObject) {
					sMessage = oErrorObject.message;
				}
			} catch (e) {
				// so the parameter message remains unchanged
			}
			jQuery.sap.log.error(sMessage, oResult.request.requestUri, sComponent);
			return sMessage;
		},

		/**
		 * Checks whether the given object has exactly the requested properties.
		 *
		 * @param {object} oObject
		 *   the object to check, may be <code>undefined</code>
		 * @param {string[]} aProperties
		 *   a list of expected properties
		 * @returns {boolean}
		 *   <code>true</code>, if the object has exactly the properties from the list
		 */
		hasProperties : function (oObject, aProperties) {
			/*eslint no-unused-vars: 0 */ // don't complain about sUnused
			var i  = 0,
				sUnused;

			for (sUnused in oObject) {
				i++;
			}
			if (i !== aProperties.length) {
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
		 * Decodes a segment of an OData v4 path. Recognizes the key predicate.
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
			if (oMetaModel._oEntityContainer) {
				return Promise.resolve(oMetaModel._oEntityContainer);
			}

			return oMetaModel.oModel.read("/EntityContainer").then(function (oResult) {
				oMetaModel._oEntityContainer = oResult;
				return oResult;
			});
		},

		/**
		 * Requests a the value of the given property at the given object if it is not available
		 * yet. This requires that the object has a property with the name of the requested
		 * property plus "@odata.navigationLink" appended. If the given property is undefined yet,
		 * the value is read from the model via the given navigation link, stored at the property
		 * and then given to the promise. If the property already has a value, it is returned
		 * asynchronously without any read.
		 *
		 * @param {sap.ui.model.odata.v4.ODataDocumentModel} oModel
		 *   the model for the meta data
		 * @param {object} oObject
		 *   the object having a navigation link
		 * @param {string} sProperty
		 *   the name of the property
		 * @param {string} sRequestPath
		 *   the request path (only used for the error message)
		 * @returns {Promise}
		 *   a promise that will be resolved with the requested property value
		 * @throws Error if both the property and its navigation link are unsupported
		 * @private
		 */
		requestProperty : function (oModel, oObject, sProperty, sRequestPath) {
			var sNavigationLink,
				sPath;

			if (sProperty in oObject) {
				return Promise.resolve(oObject[sProperty]);
			}
			sNavigationLink = sProperty + "@odata.navigationLink";
			if (!(sNavigationLink in oObject)) {
				throw new Error("Unknown: " + sProperty + ": " + sRequestPath);
			}
			sPath = "/" + oObject[sNavigationLink];
			return oModel.read(sPath).then(function (oResult) {
				oObject[sProperty] = oResult;
				return oObject[sProperty];
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
		 * @throws Error if the path is not absolute
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
				aSegments[i] = decodeURIComponent(aSegments[i]);
			}
			return aSegments;
		}
	};

	return Helper;
}, /* bExport= */ false);
