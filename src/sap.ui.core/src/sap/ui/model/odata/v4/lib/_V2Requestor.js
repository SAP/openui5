/*!
 * ${copyright}
 */
//Provides mixin sap.ui.model.odata.v4.lib._V2Requestor
sap.ui.define([
	"./_Helper"
], function (_Helper) {
	"use strict";

	/**
	 * A mixin for a requestor using an OData V2 service.
	 *
	 * @alias sap.ui.model.odata.v4.lib._V2Requestor
	 * @mixin
	 */
	function _V2Requestor() {}

	/**
	 * Final (cannot be overridden) request headers for OData V2.
	 */
	_V2Requestor.prototype.mFinalHeaders = {
		"Content-Type" : "application/json;charset=UTF-8"
	};

	/**
	 * Predefined request headers in $batch parts for OData V2.
	 */
	_V2Requestor.prototype.mPredefinedPartHeaders = {
		"Accept" : "application/json"
	};

	/**
	 * Predefined request headers for all requests for OData V2.
	 */
	_V2Requestor.prototype.mPredefinedRequestHeaders = {
		"Accept" : "application/json",
		"MaxDataServiceVersion" : "2.0",
		"DataServiceVersion" : "2.0",
		"X-CSRF-Token" : "Fetch"
	};

	/**
	 * Converts an OData V2 value {@link https://tools.ietf.org/html/rfc3548#section-3} of type
	 * Edm.Binary to the corresponding OData V4 value
	 * {@link https://tools.ietf.org/html/rfc4648#section-5}.
	 *
	 * @param {string} sV2Value
	 *   The OData V2 value
	 * @returns {string}
	 *   The corresponding OData V4 value
	 */
	_V2Requestor.prototype.convertBinary = function (sV2Value) {
		return sV2Value.replace(/\+/g, "-").replace(/\//g, "_");
	};

	/**
	 * Converts an OData V2 value of type Edm.Double or Edm.Single (Edm.Float) to the corresponding
	 * OData V4 value.
	 *
	 * @param {string} sV2Value
	 *   The OData V2 value
	 * @returns {any}
	 *   The corresponding OData V4 value
	 */
	_V2Requestor.prototype.convertDoubleSingle = function (sV2Value) {
		switch (sV2Value) {
			case "NaN":
			case "INF":
			case "-INF":
				return sV2Value;
			default:
				return parseFloat(sV2Value);
		}
	};

	/**
	 * Converts a complex value or a collection of complex values from an OData V2 response payload
	 * to an object in OData V4 JSON format.
	 *
	 * @param {object} vObject
	 *   The object to be converted
	 * @param {object} mTypeByName
	 *   A map of type metadata by qualified name
	 * @throws {Error}
	 *   If oObject does not contain inline metadata with type information
	 */
	_V2Requestor.prototype.convertNonPrimitive = function (vObject, mTypeByName) {
		var sPropertyName,
			sPropertyType,
			oType,
			sTypeName,
			vValue,
			that = this;

		// collection of complex values, coll. of primitive values only supported since OData V3
		if (Array.isArray(vObject)) {
			vObject.forEach(function (vItem) {
				that.convertNonPrimitive(vItem, mTypeByName);
			});
			return;
		}

		// complex value
		if (!vObject.__metadata || !vObject.__metadata.type) {
			throw new Error("Cannot convert complex value without type information in "
					+ "__metadata.type: " + JSON.stringify(vObject));
		}

		sTypeName = vObject.__metadata.type;
		oType = mTypeByName[sTypeName]; // can be entity type or complex type
		delete vObject.__metadata;
		for (sPropertyName in vObject) {
			vValue = vObject[sPropertyName];
			if (vValue === null) {
				continue;
			}
			if (typeof vValue === "object") { // non-primitive property value
				if (vValue.__deferred) {
					delete vObject[sPropertyName];
				} else {
					this.convertNonPrimitive(vValue, mTypeByName);
				}
				continue;
			}
			sPropertyType = oType[sPropertyName] && oType[sPropertyName].$Type;
			// primitive property value
			vObject[sPropertyName] = this.convertPrimitive(vValue, sPropertyType,
				sTypeName, sPropertyName);
		}
	};

	/**
	 * Computes the OData V4 primitive value for the given OData V2 primitive value and type.
	 *
	 * @param {any} vValue
	 *   The value to be converted
	 * @param {string} sPropertyType
	 *   The name of the OData V4 primitive type for conversion such as "Edm.String"
	 * @param {string} sTypeName
	 *   The qualified name of the entity or complex type containing the property with the value to
	 *   be converted
	 * @param {string} sPropertyName
	 *   The name of the property in the entity or complex type
	 * @returns {any}
	 *   The converted value
	 * @throws {Error}
	 *   If the property type is unknown
	 */
	_V2Requestor.prototype.convertPrimitive = function (vValue, sPropertyType, sTypeName,
			sPropertyName) {
		switch (sPropertyType) {
			case "Edm.Binary":
				return this.convertBinary(vValue);
			case "Edm.Boolean":
			case "Edm.Byte":
			case "Edm.Decimal":
			case "Edm.Guid":
			case "Edm.Int16":
			case "Edm.Int32":
			case "Edm.Int64":
			case "Edm.SByte":
			case "Edm.String":
				return vValue;
			case "Edm.Double":
			case "Edm.Single":
				return this.convertDoubleSingle(vValue);
			default:
				throw new Error("Type '" + sPropertyType + "' of property '" + sPropertyName
					+ "' in type '" + sTypeName + "' is unknown; cannot convert value: " + vValue);
		}
	};

	/**
	 * Converts an OData V2 response payload to an OData V4 response payload.
	 *
	 * @param {object} oResponsePayload
	 *   The OData V2 response payload
	 * @returns {_SyncPromise}
	 *   A promise which resolves with the OData V4 response payload or rejects with an error if
	 *   the V2 response cannot be converted
	 */
	_V2Requestor.prototype.doFetchV4Response = function (oResponsePayload) {
		// d.results may be an array of entities in case of a collection request or the property
		// 'results' of a single request.
		var bIsCollection = oResponsePayload.d.results && !oResponsePayload.d.__metadata,
			oPayload = bIsCollection
				? {value : oResponsePayload.d.results}
				: oResponsePayload.d,
			that = this;

		if (oResponsePayload.d.__count) {
			oPayload["@odata.count"] = oResponsePayload.d.__count;
		}
		if (oResponsePayload.d.__next) {
			oPayload["@odata.nextLink"] = oResponsePayload.d.__next;
		}

		return this.fnFetchEntityContainer().then(function (mScope) {
			that.convertNonPrimitive(bIsCollection ? oPayload.value : oPayload, mScope);
			return oPayload;
		});
	};

	/**
	 * Converts the supported V4 OData system query options to the corresponding V2 OData system
	 * query options.
	 *
	 * @param {object} mQueryOptions The query options
	 * @param {function(string,any)} fnResultHandler
	 *   The function to process the converted options getting the name and the value
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @throws {Error}
	 *   If a system query option other than $expand and $select is used or if any $expand value is
	 *   not an object
	 */
	_V2Requestor.prototype.doConvertSystemQueryOptions = function (mQueryOptions, fnResultHandler,
			bDropSystemQueryOptions, bSortExpandSelect) {
		var aSelects = [];

		/**
		 * Converts the V4 $expand options to flat V2 $expand and $select structure.
		 *
		 * @param {string[]} aExpands The resulting list of $expand paths
		 * @param {object} mExpandItem The current $expand item to be processed
		 * @param {string} sPathPrefix The path prefix used to compute the absolute path
		 * @returns {string[]} The list of $expand paths
		 * @throws {Error}
		 *   If a system query option other than $expand and $select is used or if any $expand value
		 *   is not an object
		 */
		function convertExpand(aExpands, mExpandItem, sPathPrefix) {
			if (!mExpandItem || typeof mExpandItem !== "object") {
				throw new Error("$expand must be a valid object");
			}

			Object.keys(mExpandItem).forEach(function (sExpandPath) {
				var sAbsoluteExpandPath = _Helper.buildPath(sPathPrefix, sExpandPath),
					vExpandOptions = mExpandItem[sExpandPath], // an object or true
					vSelectsInExpand;

				aExpands.push(sAbsoluteExpandPath);

				if (typeof vExpandOptions === "object") {
					Object.keys(vExpandOptions).forEach(function (sQueryOption) {
						switch (sQueryOption) {
							case "$expand":
								// process nested expands
								convertExpand(aExpands, vExpandOptions.$expand,
									sAbsoluteExpandPath);
								break;
							case "$select":
								// process nested selects
								vSelectsInExpand = vExpandOptions.$select;
								if (!Array.isArray(vSelectsInExpand)) {
									vSelectsInExpand = vSelectsInExpand.split(",");
								}
								vSelectsInExpand.forEach(function (sSelect) {
									aSelects.push(_Helper.buildPath(sAbsoluteExpandPath, sSelect));
								});
								break;
							default:
								throw new Error("Unsupported query option in $expand: "
									+ sQueryOption);
						}
					});
				}
				if (!vExpandOptions.$select) {
					aSelects.push(sAbsoluteExpandPath + "/*");
				}
			});
			return aExpands;
		}

		Object.keys(mQueryOptions).forEach(function (sName) {
			var bIsSystemQueryOption = sName[0] === '$',
				vValue = mQueryOptions[sName];

			if (bDropSystemQueryOptions && bIsSystemQueryOption) {
				return;
			}

			switch (sName) {
				case "$expand":
					vValue = convertExpand([], vValue, "");
					vValue = (bSortExpandSelect ? vValue.sort() : vValue).join(",");
					break;
				case "$select":
					aSelects.push.apply(aSelects,
						Array.isArray(vValue) ? vValue : vValue.split(","));
					return; // don't call fnResultHandler; this is done later
				default:
					if (bIsSystemQueryOption) {
						throw new Error("Unsupported system query option: " + sName);
					}
			}
			fnResultHandler(sName, vValue);
		});

		// only if all (nested) query options are processed, all selects are known
		if (aSelects.length > 0) {
			if (!mQueryOptions.$select) {
				aSelects.push("*");
			}
			fnResultHandler("$select", (bSortExpandSelect ? aSelects.sort() : aSelects).join(","));
		}
	};


	return function (oObject) {
		jQuery.extend(oObject, _V2Requestor.prototype);
	};
}, /* bExport= */ false);