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
		 * Decodes a part of an OData v4 path. Recognizes the key predicate.
		 *
		 * @param {string} sPathPart
		 *   the path part
		 * @returns {object}
		 *   the result with the name in <code>name</code> and the key predicate in
		 *   <code>key</code> or <code>undefined</code> if <code>sPathPart</code> is
		 *   <code>undefined</code>.
		 */
		parsePathPart : function (sPathPart) {
			var aMatches,
				iNext = 0,
				sPredicate,
				oResult = {all: sPathPart};

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

			if (!sPathPart) {
				return undefined;
			}
			aMatches = rNameWithPredicate.exec(sPathPart);
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
				oResult.name = sPathPart;
			}
			return oResult;
		},

		/**
		 * Requests the entity set from the meta data model together with its type, the type's
		 * properties and navigation properties.
		 *
		 * @param {sap.ui.model.odata.v4.ODataDocumentModel} oModel
		 *   the model for the meta data
		 * @param {string} sName
		 *   the simple name of the entity set as used in the OData queries
		 * @returns {object}
		 *   the expanded entity set
		 * @private
		 */
		requestEntitySet : function (oModel, sName) {
			return oModel.read("/EntityContainer").then(function (oResult) {
				return oModel.read("/EntityContainer/EntitySets(Fullname='"
					+ encodeURIComponent(oResult.QualifiedName + '/' + sName) + "')"
				);
			});
		},

		/**
		 * Splits an absolute path at '/' into an array of path parts. URI-decodes the path parts.
		 *
		 * @param {string} sPath
		 *   the path
		 * @returns {string[]}
		 *   the path parts
		 * @throws Error if the path is not absolute
		 */
		splitPath : function (sPath) {
			var i, aParts;

			if (sPath.charAt(0) !== '/') {
				throw new Error("Not an absolute path: " + sPath);
			}
			aParts = sPath.substring(1).split('/');
			for (i = 0; i < aParts.length; i++) {
				aParts[i] = decodeURIComponent(aParts[i]);
			}
			return aParts;
		}
	};

	return Helper;
}, /* bExport= */ false);
