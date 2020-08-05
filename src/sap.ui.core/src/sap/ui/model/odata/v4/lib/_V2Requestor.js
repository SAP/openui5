/*!
 * ${copyright}
 */
//Provides mixin sap.ui.model.odata.v4.lib._V2Requestor
sap.ui.define([
	"./_Helper",
	"./_Parser",
	"sap/ui/core/CalendarType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/odata/ODataUtils"
], function (_Helper, _Parser, CalendarType, DateFormat, ODataUtils) {
	"use strict";

	var // Example: "/Date(1395705600000)/", matching group: ticks in milliseconds
		rDate = /^\/Date\((-?\d+)\)\/$/,
		oDateFormatter,
		// Example "/Date(1420529121547+0530)/", the offset ("+0530") is optional
		// matches: 1 = ticks in milliseconds, 2 = offset sign, 3 = offset hours, 4 = offset minutes
		rDateTimeOffset = /^\/Date\((-?\d+)(?:([-+])(\d\d)(\d\d))?\)\/$/,
		oDateTimeOffsetFormatter,
		mPattern2Formatter = {},
		rPlus = /\+/g,
		rSegmentWithPredicate = /^([^(]+)(\(.+\))$/,
		rSlash = /\//g,
		// Example: "PT11H33M55S",
		// PT followed by optional hours, optional minutes, optional seconds with optional fractions
		rTime = /^PT(?:(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(\.\d+)?S)?)$/i,
		oTimeFormatter;

	/**
	 * A mixin for a requestor using an OData V2 service.
	 *
	 * @alias sap.ui.model.odata.v4.lib._V2Requestor
	 * @mixin
	 *
	 * @private
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
	 * OData V2 request headers reserved for internal use.
	 */
	_V2Requestor.prototype.mReservedHeaders = {
		accept : true,
		"content-id" : true,
		"content-transfer-encoding" : true,
		"content-type" : true,
		dataserviceversion : true,
		"if-match" : true,
		"if-none-match" : true,
		maxdataserviceversion : true,
		"sap-contextid" : true,
		"x-http-method" : true
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
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertBinary = function (sV2Value) {
		return sV2Value.replace(rPlus, "-").replace(rSlash, "_");
	};

	/**
	 * Converts an OData V2 value of type Edm.DateTime with <code>sap:display-format="Date"</code>
	 * to the corresponding OData V4 Edm.Date value
	 *
	 * @param {string} sV2Value
	 *   The OData V2 value
	 * @returns {string}
	 *   The corresponding OData V4 value
	 * @throws {Error}
	 *   If the V2 value is not convertible
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertDate = function (sV2Value) {
		var oDate,
			aMatches = rDate.exec(sV2Value);

		if (!aMatches) {
			throw new Error("Not a valid Edm.DateTime value '" + sV2Value + "'");
		}
		oDate = new Date(parseInt(aMatches[1]));
		if (Number(aMatches[1] % (24 * 60 * 60 * 1000)) !== 0) {
			throw new Error("Cannot convert Edm.DateTime value '" + sV2Value
				+ "' to Edm.Date because it contains a time of day");
		}
		return oDateFormatter.format(oDate);
	};

	/**
	 * Converts an OData V2 value of type Edm.DateTimeOffset or Edm.DateTime without
	 * <code>sap:display-format="Date"</code> to the corresponding OData V4 Edm.DateTimeOffset value
	 *
	 * @param {string} sV2Value
	 *   The OData V2 value
	 * @param {object} oPropertyMetadata
	 *   The property metadata
	 * @returns {string}
	 *   The corresponding OData V4 value
	 * @throws {Error}
	 *   If the V2 value is not convertible
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertDateTimeOffset = function (sV2Value, oPropertyMetadata) {
		var aMatches = rDateTimeOffset.exec(sV2Value),
			sOffset,
			iOffsetHours,
			iOffsetMinutes,
			iOffsetSign,
			sPattern = "yyyy-MM-dd'T'HH:mm:ss",
			iPrecision = oPropertyMetadata.$Precision,
			iTicks;

		if (!aMatches) {
			throw new Error("Not a valid Edm.DateTimeOffset value '" + sV2Value + "'");
		}
		iTicks = parseInt(aMatches[1]);
		iOffsetHours = parseInt(aMatches[3]);
		iOffsetMinutes = parseInt(aMatches[4]);
		if (!aMatches[2] || iOffsetHours === 0 && iOffsetMinutes === 0) {
			sOffset = "Z";
		} else {
			iOffsetSign = aMatches[2] === "-" ? -1 : 1;
			iTicks += iOffsetSign * (iOffsetHours * 60 * 60 * 1000 + iOffsetMinutes * 60 * 1000);
			sOffset = aMatches[2] + aMatches[3] + ":"  + aMatches[4];
		}
		if (iPrecision > 0) {
			sPattern += "." + "".padEnd(iPrecision, "S");
		}
		if (!mPattern2Formatter[sPattern]) {
			mPattern2Formatter[sPattern] = DateFormat.getDateTimeInstance({
				calendarType : CalendarType.Gregorian,
				pattern: sPattern,
				UTC : true
			});
		}
		return mPattern2Formatter[sPattern].format(new Date(iTicks)) + sOffset;
	};

	/**
	 * Converts an OData V2 value of type Edm.Double or Edm.Single (Edm.Float) to the corresponding
	 * OData V4 value.
	 *
	 * @param {string} sV2Value
	 *   The OData V2 value
	 * @returns {any}
	 *   The corresponding OData V4 value
	 *
	 * @private
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
	 * Converts the filter string literals to OData V2 syntax
	 *
	 * @param {string} sFilter The filter string
	 * @param {string} sMetaPath
	 *   The meta path corresponding to the resource path
	 * @returns {string} The filter string ready for a V2 query
	 * @throws {Error} If the filter path is invalid
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertFilter = function (sFilter, sMetaPath) {
		var oFilterTree = _Parser.parseFilter(sFilter),
			that = this;

		/*
		 * Converts the given literal operand to V2 syntax using the type of the other operand.
		 * @param {object} oLiteral The token for the literal
		 * @param {object} oOtherOperand The token for the other operand
		 */
		function convertLiteral(oLiteral, oOtherOperand) {
			var vModelValue,
				oTypeInfo = getType(oOtherOperand);

			if (oTypeInfo.$Type !== "Edm.String") {
				vModelValue = _Helper.parseLiteral(oLiteral.value, oTypeInfo.$Type, oTypeInfo.path);
				oLiteral.value = that.formatPropertyAsLiteral(vModelValue, oTypeInfo);
			}
		}

		/*
		 * Throws an error that the conversion to V2 failed.
		 * @param {object} oNode the node at which it failed
		 * @param {string} sMessage The error message
		 */
		function error(oNode, sMessage) {
			throw new Error("Cannot convert filter to V2, " + sMessage + " at " + oNode.at + ": "
				+ sFilter);
		}

		/*
		 * Determines the type of a node.
		 * @param {object} oNode A node
		 * @returns {object} A pseudo property with path, $Type (and poss. $v2Type) or undefined if
		 *   the type cannot be determined
		 */
		function getType(oNode) {
			var oPropertyMetadata;

			if (oNode.type) {
				return {
					$Type : oNode.type
				};
			}
			if (oNode.id === "PATH") {
				oPropertyMetadata = that.oModelInterface
					.fetchMetadata(sMetaPath + "/" + oNode.value).getResult();
				if (!oPropertyMetadata) {
					throw new Error("Invalid filter path: " + oNode.value);
				}
				return {
					path : oNode.value,
					$Type : oPropertyMetadata.$Type,
					$v2Type : oPropertyMetadata.$v2Type
				};
			}
			// oNode must have id "FUNCTION" and type undefined here. So it must be either ceiling,
			// floor or round and the return type is determined from the first and only parameter.
			return getType(oNode.parameters[0]);
		}

		/*
		 * Visits a node in the syntax recursively.
		 * @param {object} oNode A node
		 */
		function visitNode(oNode) {
			if (oNode) {
				if (oNode.id === "VALUE" && oNode.ambiguous) {
					error(oNode, "ambiguous type for the literal");
				}
				visitNode(oNode.left);
				visitNode(oNode.right);
				if (oNode.parameters) {
					if (oNode.value === "contains") {
						oNode.value = "substringof";
						oNode.parameters.push(oNode.parameters.shift()); // swap the parameters
					}
					oNode.parameters.forEach(visitNode);
				}
				if (oNode.left && oNode.right) {
					if (oNode.left.id === "VALUE") {
						if (oNode.right.id === "VALUE") {
							error(oNode, "saw literals on both sides of '" + oNode.id + "'");
						}
						convertLiteral(oNode.left, oNode.right);
					} else if (oNode.right.id === "VALUE") {
						convertLiteral(oNode.right, oNode.left);
					}
				}
			}
		}

		visitNode(oFilterTree);
		return _Parser.buildFilterString(oFilterTree);
	};

	/**
	 * Converts an OData V4 key predicate for the given type to OData V2.
	 *
	 * @param {string} sV4KeyPredicate
	 *   The OData V4 key predicate
	 * @param {string} sPath
	 *   The binding path of the entity described by the key predicate
	 * @returns {string}
	 *   The corresponding OData V2 key predicate
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertKeyPredicate = function (sV4KeyPredicate, sPath) {
		// Note: metadata can be fetched synchronously because ready() ensured that it's loaded
		var oEntityType = this.fetchTypeForPath(_Helper.getMetaPath(sPath)).getResult(),
			mKeyToValue = _Parser.parseKeyPredicate(decodeURIComponent(sV4KeyPredicate)),
			that = this;

		/*
		 * Converts the literal to V2 syntax.
		 * @param {string} sPropertyName The name of the property in the metadata
		 * @param {string} sValue The value in the key predicate in V4 syntax
		 * @returns {string} The value in V2 syntax
		 */
		function convertLiteral(sPropertyName, sValue) {
			var oPropertyMetadata = oEntityType[sPropertyName];

			if (oPropertyMetadata.$Type !== "Edm.String") {
				sValue = that.formatPropertyAsLiteral(
					_Helper.parseLiteral(sValue, oPropertyMetadata.$Type, sPath),
					oPropertyMetadata);
			}
			return encodeURIComponent(sValue);
		}

		if ("" in mKeyToValue) {
			return "(" + convertLiteral(oEntityType.$Key[0], mKeyToValue[""]) + ")";
		}
		return "(" + oEntityType.$Key.map(function (sPropertyName) {
			return encodeURIComponent(sPropertyName) + "="
				+ convertLiteral(sPropertyName, mKeyToValue[sPropertyName]);
		}).join(",") + ")";
	};

	/**
	 * Converts the resource path. Transforms literals in key predicates from V4 to V2 syntax.
	 *
	 * @param {string} sResourcePath The V4 resource path
	 * @returns {string} The resource path as required for V2
	 *
	 * @private
	 */
	// @override
	_V2Requestor.prototype.convertResourcePath = function (sResourcePath) {
		var iIndex = sResourcePath.indexOf("?"),
			sQueryString = "",
			aSegments,
			iSubPathLength = -1,
			that = this;

		if (iIndex > 0) {
			sQueryString = sResourcePath.slice(iIndex);
			sResourcePath = sResourcePath.slice(0, iIndex);
		}
		aSegments = sResourcePath.split("/");
		return aSegments.map(function (sSegment, i) {
			var aMatches = rSegmentWithPredicate.exec(sSegment);

			iSubPathLength += sSegment.length + 1;
			if (aMatches) {
				sSegment = aMatches[1] + that.convertKeyPredicate(aMatches[2],
					"/" + sResourcePath.slice(0, iSubPathLength));
			}
			return sSegment;
		}).join("/") + sQueryString;
	};

	/**
	 * Converts an OData V2 value of type Edm.Time to the corresponding OData V4 Edm.TimeOfDay value
	 *
	 *  @param {string} sV2Value
	 *   The OData V2 value
	 * @returns {string}
	 *   The corresponding OData V4 value
	 * @throws {Error}
	 *   If the V2 value is not convertible
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertTimeOfDay = function (sV2Value) {
		var oDate,
			aMatches = rTime.exec(sV2Value),
			iTicks;

		if (!aMatches) {
			throw new Error("Not a valid Edm.Time value '" + sV2Value + "'");
		}

		iTicks = Date.UTC(1970, 0, 1, aMatches[1] || 0, aMatches[2] || 0, aMatches[3] || 0);
		oDate = new Date(iTicks);
		return oTimeFormatter.format(oDate) + (aMatches[4] || "");
	};

	/**
	 * Converts a complex value or a collection of complex values from an OData V2 response payload
	 * to an object in OData V4 JSON format.
	 *
	 * @param {object} oObject
	 *   The object to be converted
	 * @returns {object}
	 *   The converted payload
	 * @throws {Error}
	 *   If oObject does not contain inline metadata with type information
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertNonPrimitive = function (oObject) {
		var sPropertyName,
			oType,
			sTypeName,
			vValue,
			that = this;

		// 'results' may be an array of entities in case of a collection request or the value when
		// requesting a property 'results' (which is not an array in V2 since collection of complex
		// or primitive values is only supported since OData V3)
		if (Array.isArray(oObject.results)) {
			oObject.results.forEach(function (oItem) {
				that.convertNonPrimitive(oItem);
			});
			return oObject.results;
		}

		// structured value
		if (!oObject.__metadata || !oObject.__metadata.type) {
			throw new Error("Cannot convert structured value without type information in "
				+ "__metadata.type: " + JSON.stringify(oObject));
		}

		sTypeName = oObject.__metadata.type;
		oType = that.getTypeForName(sTypeName); // can be entity type or complex type
		delete oObject.__metadata;
		for (sPropertyName in oObject) {
			vValue = oObject[sPropertyName];
			if (vValue === null) {
				continue;
			}
			if (typeof vValue === "object") { // non-primitive property value
				if (vValue.__deferred) {
					delete oObject[sPropertyName];
				} else {
					oObject[sPropertyName] = this.convertNonPrimitive(vValue);
				}
				continue;
			}
			// primitive property value
			oObject[sPropertyName] = this.convertPrimitive(vValue, oType[sPropertyName],
				sTypeName, sPropertyName);
		}
		return oObject;
	};

	/**
	 * Computes the OData V4 primitive value for the given OData V2 primitive value and type.
	 *
	 * @param {any} vValue
	 *   The value to be converted
	 * @param {object} oPropertyMetadata
	 *   The property metadata
	 * @param {string} sTypeName
	 *   The qualified name of the entity or complex type containing the property with the value to
	 *   be converted (for error message only)
	 * @param {string} sPropertyName
	 *   The name of the property in the entity or complex type (for error message only)
	 * @returns {any}
	 *   The converted value
	 * @throws {Error}
	 *   If the property type is unknown
	 *
	 * @private
	 */
	_V2Requestor.prototype.convertPrimitive = function (vValue, oPropertyMetadata, sTypeName,
			sPropertyName) {
		switch (oPropertyMetadata && oPropertyMetadata.$Type) {
			case "Edm.Binary":
				return this.convertBinary(vValue);
			case "Edm.Date":
				return this.convertDate(vValue);
			case "Edm.DateTimeOffset":
				return this.convertDateTimeOffset(vValue, oPropertyMetadata);
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
			case "Edm.TimeOfDay":
				return this.convertTimeOfDay(vValue);
			default:
				throw new Error("Type '" + (oPropertyMetadata && oPropertyMetadata.$Type)
					+ "' of property '" + sPropertyName + "' in type '" + sTypeName
					+ "' is unknown; cannot convert value: " + vValue);
		}
	};

	/**
	 * Checks whether the "DataServiceVersion" header is not set or has the value "1.0" or "2.0"
	 * otherwise an error is thrown.
	 *
	 * @param {function} fnGetHeader
	 *   A callback function to get a header attribute for a given header name with case-insensitive
	 *   search by header name
	 * @param {string} sResourcePath
	 *   The resource path of the request
	 * @param {boolean} [bVersionOptional=false]
	 *   Indicates whether the OData service version is optional, which is the case for all OData V2
	 *   responses. So this parameter is ignored.
	 * @throws {Error} If the "DataServiceVersion" header is neither "1.0" nor "2.0" nor not set at
	 *   all
	 *
	 * @private
	 */
	// @override
	_V2Requestor.prototype.doCheckVersionHeader = function (fnGetHeader, sResourcePath,
			bVersionOptional) {
		var sDataServiceVersion = fnGetHeader("DataServiceVersion"),
			vODataVersion = !sDataServiceVersion && fnGetHeader("OData-Version");

		if (vODataVersion) {
			throw new Error("Expected 'DataServiceVersion' header with value '1.0' or '2.0' but "
				+ "received 'OData-Version' header with value '" + vODataVersion
				+ "' in response for " + this.sServiceUrl + sResourcePath);
		}
		if (!sDataServiceVersion) {
			return;
		}
		sDataServiceVersion = sDataServiceVersion.split(";")[0];
		if (sDataServiceVersion === "1.0" || sDataServiceVersion === "2.0") {
			return;
		}
		throw new Error("Expected 'DataServiceVersion' header with value '1.0' or '2.0' but "
			+ "received value '" + sDataServiceVersion + "' in response for " + this.sServiceUrl
			+ sResourcePath);
	};

	/**
	 * Converts an OData V2 response payload to an OData V4 response payload.
	 *
	 * @param {object} oResponsePayload
	 *   The OData V2 response payload
	 * @param {string} [sMetaPath]
	 *   The meta path corresponding to the resource path; needed in case V2 response does not
	 *   contain <code>__metadata.type</code>, for example "2.2.7.2.4 RetrievePrimitiveProperty
	 *   Request" or "2.2.7.5 Invoke Request" for "a Function Import which returns a collection of
	 *   primitives"
	 * @returns {object}
	 *   The OData V4 response payload
	 * @throws {Error}
	 *   If the OData V2 response payload cannot be converted
	 *
	 * @private
	 */
	// @override
	_V2Requestor.prototype.doConvertResponse = function (oResponsePayload, sMetaPath) {
		var oCandidate, bIsArray, aKeys, oPayload, oPropertyMetadata, that = this;

		oResponsePayload = oResponsePayload.d;
		// 'results' may be an array of entities in case of a collection request or the value when
		// requesting a property 'results' (which is not an array in V2 since collection of complex
		// or primitive values is only supported since OData V3)
		bIsArray = Array.isArray(oResponsePayload.results);

		if (!bIsArray && !oResponsePayload.__metadata) {
			// Special cases for handling of objects (for arrays, see below).
			// Note: If oResponsePayload has __metadata, just call convertNonPrimitive() below.
			aKeys = Object.keys(oResponsePayload);
			oCandidate = oResponsePayload[aKeys[0]];
			if (aKeys.length === 1) {
				if (oCandidate === null) {
					// no conversion needed
					return {value : null};
				} else if (typeof oCandidate !== "object") {
					// treat as candidate for "entityPropertyInJson"
					return {
						value : this.convertPrimitive(oCandidate,
							this.oModelInterface.fetchMetadata(sMetaPath).getResult(),
							sMetaPath, aKeys[0])
					};
				} else if (oCandidate.__metadata) {
					// drill down into candidate for "entityComplexProperty"
					oResponsePayload = oCandidate;
				}
			}
		}

		if (bIsArray && !oResponsePayload.results.length) {
			oPayload = []; // no conversion needed
		} else if (bIsArray && !oResponsePayload.results[0].__metadata) {
			oPropertyMetadata = this.oModelInterface.fetchMetadata(sMetaPath).getResult();
			oPayload = oResponsePayload.results.map(function (vValue) {
				return that.convertPrimitive(vValue, oPropertyMetadata, sMetaPath, "");
			});
		} else {
			oPayload = this.convertNonPrimitive(oResponsePayload);
		}

		if (bIsArray) {
			oPayload = {value : oPayload};
			if (oResponsePayload.__count) {
				oPayload["@odata.count"] = oResponsePayload.__count;
			}
			if (oResponsePayload.__next) {
				oPayload["@odata.nextLink"] = oResponsePayload.__next;
			}
		}
		return oPayload;
	};

	/**
	 * Converts the supported V4 OData system query options to the corresponding V2 OData system
	 * query options.
	 *
	 * @param {string} sMetaPath
	 *   The meta path corresponding to the resource path
	 * @param {object} mQueryOptions The query options
	 * @param {function (string,any)} fnResultHandler
	 *   The function to process the converted options getting the name and the value
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @throws {Error}
	 *   If a system query option other than $expand and $select is used or if any $expand value is
	 *   not an object
	 *
	 * @private
	 */
	// @override
	_V2Requestor.prototype.doConvertSystemQueryOptions = function (sMetaPath, mQueryOptions,
			fnResultHandler, bDropSystemQueryOptions, bSortExpandSelect) {
		var aSelects,
			mSelects = {},
			that = this;

		/**
		 * Strips all selects to their first segment and adds them to mSelects.
		 *
		 * @param {string|string[]} vSelects The selects for the given expand path as
		 *   comma-separated list or array
		 * @param {string} [sExpandPath] The expand path
		 */
		function addSelects(vSelects, sExpandPath) {
			if (!Array.isArray(vSelects)) {
				vSelects = vSelects.split(",");
			}
			vSelects.forEach(function (sSelect) {
				var iIndex = sSelect.indexOf("/");

				if (iIndex >= 0 && sSelect.indexOf(".") < 0) {
					// only strip if there is no type cast and no bound action (avoid "correcting"
					// unsupported selects in V2)
					sSelect = sSelect.slice(0, iIndex);
				}
				mSelects[_Helper.buildPath(sExpandPath, sSelect)] = true;
			});
		}

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
					vExpandOptions = mExpandItem[sExpandPath]; // an object or true

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
								addSelects(vExpandOptions.$select, sAbsoluteExpandPath);
								break;
							default:
								throw new Error("Unsupported query option in $expand: "
									+ sQueryOption);
						}
					});
				}
				if (!vExpandOptions.$select) {
					mSelects[sAbsoluteExpandPath + "/*"] = true;
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
				case "$count":
					sName = "$inlinecount";
					vValue = vValue ? "allpages" : "none";
					break;
				case "$expand":
					vValue = convertExpand([], vValue, "");
					vValue = (bSortExpandSelect ? vValue.sort() : vValue).join(",");
					break;
				case "$orderby":
					break;
				case "$select":
					addSelects(vValue);
					return; // don't call fnResultHandler; this is done later
				case "$filter":
					vValue = that.convertFilter(vValue, sMetaPath);
					break;
				default:
					if (bIsSystemQueryOption) {
						throw new Error("Unsupported system query option: " + sName);
					}
			}
			fnResultHandler(sName, vValue);
		});

		// only if all (nested) query options are processed, all selects are known
		aSelects = Object.keys(mSelects);
		if (aSelects.length > 0) {
			if (!mQueryOptions.$select) {
				aSelects.push("*");
			}
			fnResultHandler("$select", (bSortExpandSelect ? aSelects.sort() : aSelects).join(","));
		}
	};

	/**
	 * Formats a given internal value into a literal suitable for usage in OData V2 URLs. See
	 * http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem.
	 *
	 * @param {*} vValue
	 *   The value
	 * @param {object} oPropertyMetadata
	 *   The property metadata
	 * @returns {string}
	 *   The literal for the URL
	 * @throws {Error}
	 *   When called for an unsupported type
	 * @see sap.ui.model.odata.ODataUtils#formatValue
	 *
	 * @private
	 */
	// @override
	_V2Requestor.prototype.formatPropertyAsLiteral = function (vValue, oPropertyMetadata) {

		// Parse using the given formatter and check that the result is valid
		function parseAndCheck(oDateFormat, sValue) {
			var oDate = oDateFormat.parse(sValue);
			if (!oDate) {
				throw new Error("Not a valid " + oPropertyMetadata.$Type + " value: " + sValue);
			}
			return oDate;
		}

		if (vValue === null) {
			return "null";
		}

		// Convert the value to V2 model format
		switch (oPropertyMetadata.$Type) {
			case "Edm.Boolean":
			case "Edm.Byte":
			case "Edm.Decimal":
			case "Edm.Double":
			case "Edm.Guid":
			case "Edm.Int16":
			case "Edm.Int32":
			case "Edm.Int64":
			case "Edm.SByte":
			case "Edm.Single":
			case "Edm.String":
				break;
			case "Edm.Date":
				vValue = parseAndCheck(oDateFormatter, vValue);
				break;
			case "Edm.DateTimeOffset":
				vValue = parseAndCheck(oDateTimeOffsetFormatter, vValue);
				break;
			case "Edm.TimeOfDay":
				vValue = {
					__edmType : "Edm.Time",
					ms : parseAndCheck(oTimeFormatter, vValue).getTime()
				};
				break;
			default:
				throw new Error("Type '" + oPropertyMetadata.$Type
					+ "' in the key predicate is not supported");
		}
		// Use the V2 function to format the value for a literal
		return ODataUtils.formatValue(vValue, oPropertyMetadata.$v2Type || oPropertyMetadata.$Type);
	};

	/**
	 * Returns the resource path relative to the service URL and adds query options in case of
	 * a bound operation (V2: "sap:action-for"). Operation parameters are moved to query options,
	 * undeclared parameters are removed. In case of a non-POST action, the V2 HTTP method is
	 * tunneled as a parameter "X-HTTP-Method".
	 *
	 * @param {string} sPath
	 *   The absolute binding path to the bound operation or operation import, e.g.
	 *   "/Entity('0815')/bound.Operation(...)" or "/OperationImport(...)"
	 * @param {object} oOperationMetadata
	 *   The operation's metadata
	 * @param {object} mParameters
	 *   A copy of the map of key-values pairs representing the operation's actual parameters
	 * @param {object} mQueryOptions
	 *   A copy of the map of key-value pairs representing the query string, the value in this pair
	 *   has to be a string or an array of strings
	 * @param {function|object} [vEntity]
	 *   The existing entity data (or a function which may be called to access it) in case of a
	 *   bound operation (V2: "sap:action-for")
	 * @returns {string}
	 *   The new path without leading slash and ellipsis
	 * @throws {Error}
	 *   If a collection-valued operation parameter is encountered
	 *
	 * @public
	 */
	// @override
	_V2Requestor.prototype.getPathAndAddQueryOptions = function (sPath, oOperationMetadata,
		mParameters, mQueryOptions, vEntity) {
		var sName,
			oTypeMetadata,
			that = this;

		sPath = sPath.slice(1, -5);

		if (oOperationMetadata.$IsBound) {
			sPath = sPath.slice(sPath.lastIndexOf(".") + 1);
			if (typeof vEntity === "function") {
				vEntity = vEntity();
			}
			// Note: $metadata is already available because oOperationMetadata has been read!
			oTypeMetadata = this.getTypeForName(oOperationMetadata.$Parameter[0].$Type);
			oTypeMetadata.$Key.forEach(function (sName) {
				mQueryOptions[sName]
					= that.formatPropertyAsLiteral(vEntity[sName], oTypeMetadata[sName]);
			});
		}

		if (oOperationMetadata.$Parameter) {
			oOperationMetadata.$Parameter.forEach(function (oParameter) {
				sName = oParameter.$Name;
				if (sName in mParameters) {
					if (oParameter.$isCollection) {
						throw new Error("Unsupported collection-valued parameter: " + sName);
					}
					mQueryOptions[sName]
						= that.formatPropertyAsLiteral(mParameters[sName], oParameter);
					delete mParameters[sName];
				}
			});
		}
		for (sName in mParameters) {
			delete mParameters[sName];
		}
		if (oOperationMetadata.$v2HttpMethod) {
			mParameters["X-HTTP-Method"] = oOperationMetadata.$v2HttpMethod;
		}

		return sPath;
	};

	/**
	 * Returns the type with the given qualified name.
	 *
	 * @param {string} sName The qualified type name
	 * @returns {object} The type
	 *
	 * @private
	 */
	_V2Requestor.prototype.getTypeForName = function (sName) {
		var oType;

		this.mTypesByName = this.mTypesByName || {};
		oType = this.mTypesByName[sName];
		if (!oType) {
			oType = this.mTypesByName[sName] =
				this.oModelInterface.fetchMetadata("/" + sName).getResult();
		}
		return oType;
	};

	/**
	 * Tells whether an empty object in the request body is optional for (parameterless) actions.
	 * For OData V2, this is true in the sense that the request body should be empty and parameters
	 * are all part of the resource path.
	 *
	 * @returns {boolean} <code>true</code>
	 *
	 * @private
	 */
	// @override
	_V2Requestor.prototype.isActionBodyOptional = function () {
		return true;
	};

	/**
	 * Tells whether change sets are optional. For OData V2, this is false, i.e. even single change
	 * requests must be wrapped within a change set.
	 *
	 * @returns {boolean} <code>false</code>
	 *
	 * @private
	 */
	// @override
	_V2Requestor.prototype.isChangeSetOptional = function () {
		return false;
	};

	/**
	 * Returns a sync promise that is resolved when the requestor is ready to be used. Waits for the
	 * metadata to be available.
	 *
	 * @returns {sap.ui.base.SyncPromise} A sync promise that is resolved with no result when the
	 * metadata is available
	 *
	 * @public
	 */
	// @override
	_V2Requestor.prototype.ready = function () {
		return this.oModelInterface.fetchEntityContainer().then(function () {});
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************
	function asV2Requestor(oRequestor) {
		Object.assign(oRequestor, _V2Requestor.prototype);
		oRequestor.oModelInterface.reportBoundMessages = function () {};
		oRequestor.oModelInterface.reportUnboundMessages = function () {};
	}

	/**
	 * Sets the static date and time formatter instances.
	 *
	 * @private
	 */
	asV2Requestor._setDateTimeFormatter = function () {
		oDateFormatter = DateFormat.getDateInstance({
			calendarType : CalendarType.Gregorian,
			pattern: "yyyy-MM-dd",
			UTC : true
		});
		oDateTimeOffsetFormatter = DateFormat.getDateTimeInstance({
			calendarType : CalendarType.Gregorian,
			pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
		});
		oTimeFormatter = DateFormat.getTimeInstance({
			calendarType : CalendarType.Gregorian,
			pattern: "HH:mm:ss",
			UTC : true
		});
	};

	asV2Requestor._setDateTimeFormatter();

	return asV2Requestor;
}, /* bExport= */ false);