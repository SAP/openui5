/*!
 * ${copyright}
 */
/*eslint-disable max-len */
/**
 * OData-based DataBinding Utility Class
 *
 * @namespace
 * @name sap.ui.model.odata
 * @public
 */

// Provides class sap.ui.model.odata.ODataUtils
sap.ui.define([
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/security/encodeURL",
	"sap/base/util/each",
	"sap/ui/core/CalendarType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/_Helper",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/Sorter"
], function(assert, Log, encodeURL, each, CalendarType, DateFormat, _Helper, FilterProcessor, Sorter) {
	"use strict";

	let oDateTimeFormat, oDateTimeFormatMs, oDateTimeOffsetFormat, oDateTimeOffsetFormatMs, oTimeFormat;
	const sClassName = "sap.ui.model.odata.ODataUtils";
	const rDecimal = /^([-+]?)0*(\d+)(\.\d+|)$/;
	// URL might be encoded, "(" becomes %28
	const rSegmentAfterCatalogService = /\/(Annotations|ServiceNames|ServiceCollection)(\(|%28)/;
	const rTrailingDecimal = /\.$/;
	const rTrailingSingleQuote = /'$/;
	const rTrailingZeroes = /0+$/;

	function setDateTimeFormatter () {
		// Lazy creation of format objects
		if (!oDateTimeFormat) {
			oDateTimeFormat = DateFormat.getDateInstance({
				pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss''",
				calendarType: CalendarType.Gregorian
			});
			oDateTimeFormatMs = DateFormat.getDateInstance({
				pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss.SSS''",
				calendarType: CalendarType.Gregorian
			});
			oDateTimeOffsetFormat = DateFormat.getDateInstance({
				pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss'Z'''",
				calendarType: CalendarType.Gregorian
			});
			oDateTimeOffsetFormatMs = DateFormat.getDateInstance({
				pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss.SSS'Z'''",
				calendarType: CalendarType.Gregorian
			});
			oTimeFormat = DateFormat.getTimeInstance({
				pattern: "'time''PT'HH'H'mm'M'ss'S'''",
				calendarType: CalendarType.Gregorian
			});
		}
	}

	// Static class

	/**
	 * @alias sap.ui.model.odata.ODataUtils
	 * @namespace
	 * @public
	 */
	var ODataUtils = function() {};

	/**
	 * Create URL parameters for sorting
	 * @param {array} aSorters an array of sap.ui.model.Sorter
	 * @return {string} the URL encoded sorter parameters
	 * @private
	 */
	ODataUtils.createSortParams = function(aSorters) {
		var sSortParam;
		if (!aSorters || aSorters.length == 0) {
			return undefined;
		}
		sSortParam = "$orderby=";
		for (var i = 0; i < aSorters.length; i++) {
			var oSorter = aSorters[i];
			if (oSorter instanceof Sorter) {
				sSortParam += oSorter.sPath;
				sSortParam += oSorter.bDescending ? "%20desc" : "%20asc";
				sSortParam += ",";
			} else {
				Log.error("Trying to use " + oSorter + " as a Sorter, but it is a " + typeof oSorter);
			}
		}
		//remove trailing comma
		sSortParam = sSortParam.slice(0, -1);
		return sSortParam;
	};

	function convertLegacyFilter(oFilter) {
		// check if sap.ui.model.odata.Filter is used. If yes, convert it to sap.ui.model.Filter
		if (oFilter && typeof oFilter.convert === "function") {
			oFilter = oFilter.convert();
		}
		return oFilter;
	}

	/**
	 * Creates the URL parameter string for filtering. The parameter string is prepended with the "$filter=" system
	 * query option to form a valid URL part for an OData request. In case an array of filters is passed, they are
	 * grouped in a way that filters on the same path are OR-ed and filters on different paths are AND-ed with each
	 * other.
	 *
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} vFilter The filter or filter array
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The model metadata
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType The entity type
	 * @return {string} The URL encoded <code>$filter</code> system query option
	 *
	 * @private
	 */
	ODataUtils.createFilterParams = function(vFilter, oMetadata, oEntityType) {
		var oFilter;
		if (Array.isArray(vFilter)) {
			vFilter = vFilter.map(convertLegacyFilter);
			oFilter = FilterProcessor.groupFilters(vFilter);
		} else {
			oFilter = convertLegacyFilter(vFilter);
		}

		if (!oFilter) {
			return undefined;
		}
		return "$filter=" + this._createFilterParams(oFilter, oMetadata, oEntityType);
	};

	/**
	 * Creates a string of logically (or/and) linked filter options, which can be used as a value for the
	 * <code>$filter</code> system query option.
	 *
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} vFilter The filter or filter array
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The model metadata
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType The entity type
	 * @return {string} The URL encoded value for <code>$filter</code> system query option
	 *
	 * @private
	 */
	ODataUtils._createFilterParams = function(vFilter, oMetadata, oEntityType) {
		const oFilter = Array.isArray(vFilter) ? FilterProcessor.groupFilters(vFilter) : vFilter;
		if (!oFilter) {
			return undefined;
		}
		return ODataUtils._processSingleFilter(oFilter, oMetadata, oEntityType, true);
	};

	/**
	 * Gets the filter string for a given filter object.
	 *
	 * @param {sap.ui.model.Filter} oFilter The filter object to be processed
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The model metadata
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType The entity type
	 * @param {boolean} [bOmitBrackets] Whether to omit brackets around the resulting filter string
	 * @returns {string} The URL encoded string representation of the given filter object
	 *
	 * @private
	 */
	ODataUtils._processSingleFilter = function (oFilter, oMetadata, oEntityType, bOmitBrackets) {
		oFilter = convertLegacyFilter(oFilter);

		if (oFilter.aFilters) {
			return ODataUtils._processMultiFilter(oFilter, oMetadata, oEntityType, bOmitBrackets);
		}
		return ODataUtils._createFilterSegment(oFilter, oMetadata, oEntityType);
	};

	/**
	 * Gets the filter string for a given multi-filter object.
	 *
	 * @param {sap.ui.model.Filter} oFilter The multi-filter object to be processed
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The model metadata
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType The entity type
	 * @param {boolean} [bOmitBrackets] Whether to omit brackets around the resulting filter string
	 * @returns {string} The URL encoded string representation of the given multi-filter object
	 *
	 * @private
	 */
	ODataUtils._processMultiFilter = function (oFilter, oMetadata, oEntityType, bOmitBrackets) {
		const aFilters = oFilter.aFilters;
		const bAnd = !!oFilter.bAnd;

		if (aFilters.length === 0) {
			return bAnd ? "true" : "false";
		}

		if (aFilters.length === 1) {
			if (aFilters[0]._bMultiFilter) {
				return ODataUtils._processSingleFilter(aFilters[0], oMetadata, oEntityType);
			}
			return ODataUtils._processSingleFilter(aFilters[0], oMetadata, oEntityType, true);
		}

		return (!bOmitBrackets ? "(" : "")
			+ aFilters.map((oFilter) => {
				return ODataUtils._processSingleFilter(oFilter, oMetadata, oEntityType);
			}).join(bAnd ? "%20and%20" : "%20or%20")
			+ (!bOmitBrackets ? ")" : "");
	};

	/**
	 * Converts a string or object-map with URL parameters into an array.
	 * If <code>vParams</code> is an object map, it will be also encoded properly.
	 *
	 * @param {string|object|array} vParams URL parameters
	 * @returns {string[]} Encoded URL parameters
	 *
	 * @private
	 */
	ODataUtils._createUrlParamsArray = function(vParams) {
		var aUrlParams, sType = typeof vParams, sParams;
		if (Array.isArray(vParams)) {
			return vParams;
		}

		aUrlParams = [];
		if (sType === "string" || vParams instanceof String) {
			if (vParams) {
				aUrlParams.push(vParams);
			}
		} else if (sType === "object") {
			sParams = this._encodeURLParameters(vParams);
			if (sParams) {
				aUrlParams.push(sParams);
			}
		}

		return aUrlParams;
	};

	/**
	 * Encode a map of parameters into a combined URL parameter string
	 *
	 * @param {map} mParams The map of parameters to encode
	 * @returns {string} sUrlParams The URL encoded parameters
	 * @private
	 */
	ODataUtils._encodeURLParameters = function(mParams) {
		if (!mParams) {
			return "";
		}
		var aUrlParams = [];
		each(mParams, function (sName, oValue) {
			if (typeof oValue === "string" || oValue instanceof String) {
				oValue = encodeURIComponent(oValue);
			}
			sName = sName.startsWith('$') ? sName : encodeURIComponent(sName);
			aUrlParams.push(sName + "=" + oValue);
		});
		return aUrlParams.join("&");
	};

	/**
	 * Adds an origin to the given service URL.
	 * If an origin is already present, it will only be replaced if the parameters object contains the flag "force: true".
	 * In case the URL already contains URL parameters, these will be kept.
	 * As a parameter, a sole alias is sufficient. The parameters vParameters.system and vParameters.client however have to be given in pairs.
	 * In case all three origin specifying parameters are given (system/client/alias), the alias has precedence.
	 *
	 * Examples:
	 * setOrigin("/backend/service/url/", "DEMO_123");
	 * - result: /backend/service/url;o=DEMO_123/
	 *
	 * setOrigin("/backend/service/url;o=OTHERSYS8?myUrlParam=true&x=4", {alias: "DEMO_123", force: true});
	 * - result /backend/service/url;o=DEMO_123?myUrlParam=true&x=4
	 *
	 * setOrigin("/backend/service;o=NOT_TOUCHED/url;v=2;o=OTHERSYS8;srv=XVC", {alias: "DEMO_123", force: true});
	 * - result /backend/service;o=NOT_TOUCHED/url;v=2;o=DEMO_123;srv=XVC
	 *
	 * setOrigin("/backend/service/url/", {system: "DEMO", client: 134});
	 * - result /backend/service/url;o=sid(DEMO.134)/
	 *
	 * @param {string} sServiceURL the URL which will be enriched with an origin
	 * @param {object|string} vParameters if string then it is asumed its the system alias, else if the argument is an object then additional Parameters can be given
	 * @param {string} vParameters.alias the system alias which will be used as the origin
	 * @param {string} vParameters.system the system id which will be used as the origin
	 * @param {string} vParameters.client the system's client
	 * @param {boolean} vParameters.force setting this flag to <code>true</code> overrides the already existing origin
	 *
	 * @public
	 * @since 1.30.7
	 * @returns {string} the service URL with the added origin.
	 */
	ODataUtils.setOrigin = function (sServiceURL, vParameters) {
		var sOrigin, sSystem, sClient;

		// if multi origin is set, do nothing
		if (!sServiceURL || !vParameters || sServiceURL.indexOf(";mo") > 0) {
			return sServiceURL;
		}

		// accept string as second argument -> only alias given
		if (typeof vParameters == "string") {
			sOrigin = vParameters;
		} else {
			// vParameters is an object
			sOrigin = vParameters.alias;

			if (!sOrigin) {
				sSystem = vParameters.system;
				sClient = vParameters.client;
				// sanity check
				if (!sSystem || !sClient) {
					Log.warning("ODataUtils.setOrigin: No Client or System ID given for Origin");
					return sServiceURL;
				}
				sOrigin = "sid(" + sSystem + "." + sClient + ")";
			}
		}

		// determine the service base url and the url parameters
		var aUrlParts = sServiceURL.split("?");
		var sBaseURL = aUrlParts[0];
		var sURLParams = aUrlParts[1] ? "?" + aUrlParts[1] : "";

		//trim trailing "/" from url if present
		var sTrailingSlash = "";
		if (sBaseURL[sBaseURL.length - 1] === "/") {
			sBaseURL = sBaseURL.substring(0, sBaseURL.length - 1);
			sTrailingSlash = "/"; // append the trailing slash later if necessary
		}

		// origin already included
		// regex will only match ";o=" occurrences which do not end in a slash "/" at the end of the string.
		// The last ";o=" occurrence at the end of the baseURL is the only origin that can match.
		var rSegmentCheck = /(\/[^\/]+)$/g;
		var rOriginCheck = /(;o=[^\/;]+)/g;

		var sLastSegment = sBaseURL.match(rSegmentCheck)[0];
		var aLastOrigin = sLastSegment.match(rOriginCheck);
		var sFoundOrigin = aLastOrigin ? aLastOrigin[0] : null;

		if (sFoundOrigin) {
			// enforce new origin
			if (vParameters.force) {
				// same regex as above

				var sChangedLastSegment = sLastSegment.replace(sFoundOrigin, ";o=" + sOrigin);
				sBaseURL = sBaseURL.replace(sLastSegment, sChangedLastSegment);

				return sBaseURL + sTrailingSlash + sURLParams;
			}
			//return the URL as it was
			return sServiceURL;
		}

		// new service url with origin
		sBaseURL = sBaseURL + ";o=" + sOrigin + sTrailingSlash;
		return sBaseURL + sURLParams;
	};


	/**
	 * Adds an origin to annotation urls.
	 * Checks if the annotation is based on a catalog service or it's a generic annotation url, which might be adapted based on the service url.
	 * The actual url modification is done with the setOrigin function.
	 *
	 * @param {string} sAnnotationURL the URL which will be enriched with an origin
	 * @param {object|string} vParameters explanation see setOrigin function
	 * @param {string} vParameters.preOriginBaseUri Legacy: Service url base path before adding an origin
	 * @param {string} vParameters.postOriginBaseUri Legacy: Service url base path after adding an origin
	 * @private
	 * @since 1.44.0
	 * @returns {string} the annotation service URL with the added origin.
	 */
	ODataUtils.setAnnotationOrigin = function(sAnnotationURL, vParameters){

		var sFinalAnnotationURL;
		var iSegmentAfterCatalogServiceIndex = sAnnotationURL.search(rSegmentAfterCatalogService);
		var iHanaXsSegmentIndex = vParameters && vParameters.preOriginBaseUri ? vParameters.preOriginBaseUri.indexOf(".xsodata") : -1;

		if (iSegmentAfterCatalogServiceIndex >= 0) {
			if (sAnnotationURL.indexOf("/$value", iSegmentAfterCatalogServiceIndex) === -1) { // $value missing
				Log.warning("ODataUtils.setAnnotationOrigin: Annotation url is missing $value segment.");
				sFinalAnnotationURL = sAnnotationURL;
			} else {
				// if the annotation URL is an SAP specific annotation url, we add the origin path segment...
				var sAnnotationUrlBase =  sAnnotationURL.substring(0, iSegmentAfterCatalogServiceIndex);
				var sAnnotationUrlRest =  sAnnotationURL.substring(iSegmentAfterCatalogServiceIndex, sAnnotationURL.length);
				var sAnnotationWithOrigin = ODataUtils.setOrigin(sAnnotationUrlBase, vParameters);
				sFinalAnnotationURL = sAnnotationWithOrigin + sAnnotationUrlRest;
			}
		} else if (iHanaXsSegmentIndex >= 0) {
			// Hana XS case: the Hana XS engine can provide static Annotation files for its
			// services. The services can be identified by their URL segment ".xsodata"; if such a
			// service uses the origin feature the Annotation URLs need also adaption.
			sFinalAnnotationURL = ODataUtils.setOrigin(sAnnotationURL, vParameters);

		} else {
			// Legacy Code for compatibility reasons:
			// ... if not, we check if the annotation url is on the same service-url base-path
			sFinalAnnotationURL = sAnnotationURL.replace(vParameters.preOriginBaseUri, vParameters.postOriginBaseUri);
		}

		return sFinalAnnotationURL;
	};


	/**
	 * Convert multi-filter to filter string.
	 *
	 * @param {object} oMultiFilter A multi-filter
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The model metadata
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType The entity type
	 * @returns {string} The URL encoded string representation of the given multi-filter object
	 *
	 * @private
	 */
	ODataUtils._resolveMultiFilter = function(oMultiFilter, oMetadata, oEntityType){
		const aFilters = oMultiFilter.aFilters;
		if (aFilters) {
			return "("
				+ aFilters.map((oFilter) => {
					let sFilterParam = "";
					if (oFilter._bMultiFilter) {
						sFilterParam = ODataUtils._resolveMultiFilter(oFilter, oMetadata, oEntityType);
					} else if (oFilter.sPath) {
						sFilterParam = ODataUtils._createFilterSegment(oFilter, oMetadata, oEntityType);
					}
					return sFilterParam;
				}).join(oMultiFilter.bAnd ? "%20and%20" : "%20or%20")
				+ ")";
		}

		return "";
	};

	/**
	 * Create a single filter segment for the given filter.
	 *
	 * @param {sap.ui.model.Filter} oFilter The filter object to be processed
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The model metadata
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType The entity type object
	 * @returns {string} The encoded string representation of the given filter
	 * @private
	 */
	ODataUtils._createFilterSegment = function(oFilter, oMetadata, oEntityType) {
		let {sPath, oValue1, oValue2} = oFilter;
		const {sOperator, bCaseSensitive = true, sFractionalSeconds1, sFractionalSeconds2} = oFilter;
		let sType;
		if (oEntityType) {
			const oPropertyMetadata = oMetadata._getPropertyMetadata(oEntityType, sPath);
			if (oPropertyMetadata) {
				sType = oPropertyMetadata.type;
				if (sType) {
					oValue1 = ODataUtils._formatValue(oValue1, sType, bCaseSensitive, sFractionalSeconds1);
					oValue2 = oValue2 === null || oValue2 === undefined
						? null
						: ODataUtils._formatValue(oValue2, sType, bCaseSensitive, sFractionalSeconds2);
				} else {
					Log.error("Type for property '" + sPath + "' of EntityType '" + oEntityType.name
						+ "' not found!", undefined, sClassName);
				}
			} else {
				Log.error("Property type for property '" + sPath + "' of EntityType '" + oEntityType.name
					+ "' not found!", undefined, sClassName);
			}
		}
		if (oValue1) {
			oValue1 = _Helper.encodeURL(String(oValue1));
		}
		if (oValue2) {
			oValue2 = _Helper.encodeURL(String(oValue2));
		}
		if (!bCaseSensitive && sType === "Edm.String") {
			sPath = "toupper(" + sPath + ")";
		}
		switch (sOperator) {
			case "EQ":
			case "NE":
			case "GT":
			case "GE":
			case "LT":
			case "LE":
				return sPath + "%20" + sOperator.toLowerCase() + "%20" + oValue1;
			case "BT":
				return "(" + sPath + "%20ge%20" + oValue1 + "%20and%20" + sPath + "%20le%20" + oValue2 + ")";
			case "NB":
				return "not%20(" + sPath + "%20ge%20" + oValue1 + "%20and%20" + sPath + "%20le%20" + oValue2 + ")";
			case "Contains":
				return "substringof(" + oValue1 + "," + sPath + ")";
			case "NotContains":
				return "not%20substringof(" + oValue1 + "," + sPath + ")";
			case "StartsWith":
				return "startswith(" + sPath + "," + oValue1 + ")";
			case "NotStartsWith":
				return "not%20startswith(" + sPath + "," + oValue1 + ")";
			case "EndsWith":
				return "endswith(" + sPath + "," + oValue1 + ")";
			case "NotEndsWith":
				return "not%20endswith(" + sPath + "," + oValue1 + ")";
			default:
				Log.error("Unknown filter operator '" + sOperator + "'", undefined, sClassName);
				return "true";
		}
	};

	/**
	 * Formats a JavaScript value according to the given
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * EDM type</a>.
	 *
	 * @param {any} vValue The value to format
	 * @param {string} sType The EDM type (e.g. Edm.Decimal)
	 * @param {boolean} bCaseSensitive Whether strings gets compared case sensitive or not
	 * @return {string} The formatted value
	 * @public
	 */
	ODataUtils.formatValue = function(vValue, sType, bCaseSensitive) {
		return ODataUtils._formatValue(vValue, sType, bCaseSensitive);
	};

	/**
	 * Like {@link #formatValue}, but allows for providing fractional seconds for Date values and if the given type
	 * is "Edm.DateTime" or "Edm.DateTimeOffset".
	 *
	 * @param {any} vValue The value to format
	 * @param {string} sType The EDM type (e.g. Edm.Decimal)
	 * @param {boolean} [bCaseSensitive=true] Whether strings gets compared case sensitive or not
	 * @param {string} [sFractionalSeconds] The fractional seconds to be appended to the given value in case it is a
	 *   <code>Date<code>
	 * @return {string} The formatted value
	 * @private
	 */
	ODataUtils._formatValue = function(vValue, sType, bCaseSensitive, sFractionalSeconds) {
		var oDate, sValue;

		if (bCaseSensitive === undefined) {
			bCaseSensitive = true;
		}

		// null values should return the null literal
		if (vValue === null || vValue === undefined) {
			return "null";
		}

		setDateTimeFormatter();

		// Format according to the given type
		switch (sType) {
			case "Edm.String":
				// quote
				vValue = bCaseSensitive ? vValue : vValue.toUpperCase();
				sValue = "'" + String(vValue).replace(/'/g, "''") + "'";
				break;
			case "Edm.Time":
				if (typeof vValue === "object") {
					// no need to use UI5Date.getInstance as only the UTC timestamp is used
					sValue = oTimeFormat.format(new Date(vValue.ms), true);
				} else {
					sValue = "time'" + vValue + "'";
				}
				break;
			case "Edm.DateTime":
				// no need to use UI5Date.getInstance as only the UTC timestamp is used
				oDate = vValue instanceof Date ? vValue : new Date(vValue);
				if (oDate.getMilliseconds() > 0) {
					sValue = oDateTimeFormatMs.format(oDate, true);
					if (sFractionalSeconds) {
						sValue = sValue.replace(rTrailingSingleQuote, sFractionalSeconds + "'");
					}
				} else {
					sValue = oDateTimeFormat.format(oDate, true);
					if (sFractionalSeconds) {
						sValue = sValue.replace(rTrailingSingleQuote, ".000" + sFractionalSeconds + "'");
					}
				}
				break;
			case "Edm.DateTimeOffset":
				// no need to use UI5Date.getInstance as only the UTC timestamp is used
				oDate = vValue instanceof Date ? vValue : new Date(vValue);
				if (oDate.getMilliseconds() > 0) {
					sValue = oDateTimeOffsetFormatMs.format(oDate, true);
					if (sFractionalSeconds) {
						sValue = sValue.replace("Z'", sFractionalSeconds + "Z'");
					}
				} else {
					sValue = oDateTimeOffsetFormat.format(oDate, true);
					if (sFractionalSeconds) {
						sValue = sValue.replace("Z'", ".000" + sFractionalSeconds + "Z'");
					}
				}
				break;
			case "Edm.Guid":
				sValue = "guid'" + vValue + "'";
				break;
			case "Edm.Decimal":
				sValue = vValue + "m";
				break;
			case "Edm.Int64":
				sValue = vValue + "l";
				break;
			case "Edm.Double":
				sValue = vValue + "d";
				break;
			case "Edm.Float":
			case "Edm.Single":
				sValue = vValue + "f";
				break;
			case "Edm.Binary":
				sValue = "binary'" + vValue + "'";
				break;
			default:
				sValue = String(vValue);
				break;
		}
		return sValue;
	};

	/**
	 * Parses a given Edm type value to a value as it is stored in the
	 * {@link sap.ui.model.odata.v2.ODataModel}. The value to parse must be a valid Edm type literal
	 * as defined in chapter 2.2.2 "Abstract Type System" of the OData V2 specification.
	 *
	 * @param {string} sValue The value to parse
	 * @return {any} The parsed value
	 * @throws {Error} If the given value is not of an Edm type defined in the specification
	 * @private
	 */
	ODataUtils.parseValue = function (sValue) {
		var sFirstChar = sValue[0],
			sLastChar = sValue[sValue.length - 1];

		setDateTimeFormatter();

		if (sFirstChar === "'") { // Edm.String
			return sValue.slice(1, -1).replace(/''/g, "'");
		} else if (sValue.startsWith("time'")) { // Edm.Time
			return {
				__edmType : "Edm.Time",
				ms : oTimeFormat.parse(sValue, true).getTime()
			};
		} else if (sValue.startsWith("datetime'")) { // Edm.DateTime
			return sValue.includes(".")
				? oDateTimeFormatMs.parse(sValue, true)
				: oDateTimeFormat.parse(sValue, true);
		} else if (sValue.startsWith("datetimeoffset'")) { // Edm.DateTimeOffset
			return sValue.includes(".")
				? oDateTimeOffsetFormatMs.parse(sValue, true)
				: oDateTimeOffsetFormat.parse(sValue, true);
		} else if (sValue.startsWith("guid'")) { // Edm.Guid
			return sValue.slice(5, -1);
		} else if (sValue === "null") { // null
			return null;
		} else if (sLastChar === "m" || sLastChar === "l" // Edm.Decimal, Edm.Int64
				|| sLastChar === "d" || sLastChar === "f") { // Edm.Double, Edm.Single
			return sValue.slice(0, -1);
		} else if (!isNaN(sFirstChar) || sFirstChar === "-") { // Edm.Byte, Edm.Int16/32, Edm.SByte
			return parseInt(sValue);
		} else if (sValue === "true" || sValue === "false") { // Edm.Boolean
			return sValue === "true";
		} else if (sValue.startsWith("binary'")) { // Edm.Binary
			return sValue.slice(7, -1);
		}

		throw new Error("Cannot parse value '" + sValue + "', no Edm type found");
	};

	/**
	 * Compares the given values using <code>===</code> and <code>></code>.
	 *
	 * @param {any} vValue1
	 *   the first value to compare
	 * @param {any} vValue2
	 *   the second value to compare
	 * @return {int}
	 *   the result of the compare: <code>0</code> if the values are equal, <code>-1</code> if the
	 *   first value is smaller, <code>1</code> if the first value is larger, <code>NaN</code> if
	 *   they cannot be compared
	 */
	function simpleCompare(vValue1, vValue2) {
		if (vValue1 === vValue2) {
			return 0;
		}
		if (vValue1 === null || vValue2 === null
				|| vValue1 === undefined || vValue2 === undefined) {
			return NaN;
		}
		return vValue1 > vValue2 ? 1 : -1;
	}

	/**
	 * Parses a decimal given in a string.
	 *
	 * @param {string} sValue
	 *   the value
	 * @returns {object}
	 *   the result with the sign in <code>sign</code>, the number of integer digits in
	 *   <code>integerLength</code> and the trimmed absolute value in <code>abs</code>
	 */
	function parseDecimal(sValue) {
		var aMatches;

		if (typeof sValue !== "string") {
			return undefined;
		}
		aMatches = rDecimal.exec(sValue);
		if (!aMatches) {
			return undefined;
		}
		return {
			sign: aMatches[1] === "-" ? -1 : 1,
			integerLength: aMatches[2].length,
			// remove trailing decimal zeroes and poss. the point afterwards
			abs: aMatches[2] + aMatches[3].replace(rTrailingZeroes, "")
					.replace(rTrailingDecimal, "")
		};
	}

	/**
	 * Compares two decimal values given as strings.
	 *
	 * @param {string} sValue1
	 *   the first value to compare
	 * @param {string} sValue2
	 *   the second value to compare
	 * @return {int}
	 *   the result of the compare: <code>0</code> if the values are equal, <code>-1</code> if the
	 *   first value is smaller, <code>1</code> if the first value is larger, <code>NaN</code> if
	 *   they cannot be compared
	 */
	function decimalCompare(sValue1, sValue2) {
		var oDecimal1, oDecimal2, iResult;

		if (sValue1 === sValue2) {
			return 0;
		}
		oDecimal1 = parseDecimal(sValue1);
		oDecimal2 = parseDecimal(sValue2);
		if (!oDecimal1 || !oDecimal2) {
			return NaN;
		}
		if (oDecimal1.sign !== oDecimal2.sign) {
			return oDecimal1.sign > oDecimal2.sign ? 1 : -1;
		}
		// So they have the same sign.
		// If the number of integer digits equals, we can simply compare the strings
		iResult = simpleCompare(oDecimal1.integerLength, oDecimal2.integerLength)
			|| simpleCompare(oDecimal1.abs, oDecimal2.abs);
		return oDecimal1.sign * iResult;
	}

	var rTime = /^PT(\d\d)H(\d\d)M(\d\d)S$/;

	/**
	 * Extracts the milliseconds if the value is a date/time instance or formatted string.
	 * @param {any} vValue
	 *   the value (may be <code>undefined</code> or <code>null</code>)
	 * @returns {any}
	 *   the number of milliseconds or the value itself
	 */
	function extractMilliseconds(vValue) {
		if (typeof vValue === "string" && rTime.test(vValue)) {
			vValue = parseInt(RegExp.$1) * 3600000 +
				parseInt(RegExp.$2) * 60000 +
				parseInt(RegExp.$3) * 1000;
		}
		if (vValue instanceof Date) {
			return vValue.getTime();
		}
		if (vValue && vValue.__edmType === "Edm.Time") {
			return vValue.ms;
		}
		return vValue;
	}

	/**
	 * Compares the given OData values based on their type. All date and time types can also be
	 * compared with a number. This number is then interpreted as the number of milliseconds that
	 * the corresponding date or time object should hold.
	 *
	 * @param {any} vValue1
	 *   the first value to compare
	 * @param {any} vValue2
	 *   the second value to compare
	 * @param {boolean} [bAsDecimal=false]
	 *   if <code>true</code>, the string values <code>vValue1</code> and <code>vValue2</code> are
	 *   compared as a decimal number (only sign, integer and fraction digits; no exponential
	 *   format). Otherwise they are recognized by looking at their types.
	 * @return {int}
	 *   the result of the compare: <code>0</code> if the values are equal, <code>-1</code> if the
	 *   first value is smaller, <code>1</code> if the first value is larger, <code>NaN</code> if
	 *   they cannot be compared
	 * @since 1.29.1
	 * @public
	 */
	ODataUtils.compare = function (vValue1, vValue2, bAsDecimal) {
		return bAsDecimal ? decimalCompare(vValue1, vValue2)
			: simpleCompare(extractMilliseconds(vValue1), extractMilliseconds(vValue2));
	};

	/**
	 * Returns a comparator function optimized for the given EDM type.
	 *
	 * @param {string} sEdmType
	 *   the EDM type
	 * @returns {function}
	 *   the comparator function taking two values of the given type and returning <code>0</code>
	 *   if the values are equal, <code>-1</code> if the first value is smaller, <code>1</code> if
	 *   the first value is larger and <code>NaN</code> if they cannot be compared (e.g. one value
	 *   is <code>null</code> or <code>undefined</code>)
	 * @since 1.29.1
	 * @public
	 */
	ODataUtils.getComparator = function (sEdmType) {
		switch (sEdmType) {
			case "Edm.Date":
			case "Edm.DateTime":
			case "Edm.DateTimeOffset":
			case "Edm.Time":
				return ODataUtils.compare;
			case "Edm.Decimal":
			case "Edm.Int64":
				return decimalCompare;
			default:
				return simpleCompare;
		}
	};

	/**
	 * Normalizes the given canonical key.
	 *
	 * Although keys contained in OData response must be canonical, there are
	 * minor differences (like capitalization of suffixes for Decimal, Double,
	 * Float) which can differ and cause equality checks to fail.
	 *
	 * @param {string} sKey The canonical key of an entity
	 * @returns {string} Normalized key of the entry
	 * @protected
	 */
	// Define regular expression and function outside function to avoid instantiation on every call
	var rNormalizeString = /([(=,])('.*?')([,)])/g,
		rNormalizeCase = /[MLDF](?=[,)](?:[^']*'[^']*')*[^']*$)/g,
		rNormalizeBinary = /([(=,])(X')/g,
		fnNormalizeString = function(value, p1, p2, p3) {
			return p1 + encodeURIComponent(decodeURIComponent(p2)) + p3;
		},
		fnNormalizeCase = function(value) {
			return value.toLowerCase();
		},
		fnNormalizeBinary = function(value, p1) {
			return p1 + "binary'";
		};

	ODataUtils._normalizeKey = function(sKey) {
		return sKey.replace(rNormalizeString, fnNormalizeString).replace(rNormalizeCase, fnNormalizeCase).replace(rNormalizeBinary, fnNormalizeBinary);
	};

	/**
	 * Merges the given intervals into a single interval. The start and end of the resulting
	 * interval are the start of the first interval and the end of the last interval.
	 *
	 * @param {object[]} aIntervals
	 *   The array of available intervals
	 * @returns {object|undefined}
	 *   The merged interval with a member <code>start</code> and <code>end</code>, or
	 *   <code>undefined</code> if no intervals are given.
	 *
	 * @private
	 */
	ODataUtils._mergeIntervals = function (aIntervals) {
		if (aIntervals.length) {
			return {start : aIntervals[0].start, end : aIntervals[aIntervals.length - 1].end};
		}
		return undefined;
	};

	/**
	 * Returns the array of gaps in the given array of elements, taking the given start index,
	 * length, and prefetch length into consideration.
	 *
	 * @param {any[]} aElements
	 *   The array of available elements; it is used read-only to check if an element at a given
	 *   index is not yet available (that is, is <code>undefined</code>)
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iLength
	 *   The length of the range; <code>Infinity</code> is supported
	 * @param {number} iPrefetchLength
	 *   The number of elements to read before and after the given range; with this it is possible
	 *   to prefetch data for a paged access. The read intervals are computed so that at least half
	 *   the prefetch length is available left and right of the requested range without a further
	 *   request. If data is missing on one side, the full prefetch length is added at this side.
	 *   <code>Infinity</code> is supported.
	 * @param {number} [iLimit=Infinity]
	 *   An upper limit on the number of elements
	 * @returns {object[]}
	 *   Array of right open intervals which need to be read; each interval is an object with
	 *   properties <code>start</code> and <code>end</code> with the interval's start and end index;
	 *   empty if no intervals need to be read
	 *
	 * @private
	 * @see sap.ui.model.ListBinding#getContexts
	 */
	ODataUtils._getReadIntervals = function (aElements, iStart, iLength, iPrefetchLength, iLimit) {
		var i, iEnd, n,
			iGapStart = -1,
			aIntervals = [],
			oRange = ODataUtils._getReadRange(aElements, iStart, iLength, iPrefetchLength);

		if (iLimit === undefined) {
			iLimit = Infinity;
		}
		iEnd = Math.min(oRange.start + oRange.length, iLimit);
		n = Math.min(iEnd, Math.max(oRange.start, aElements.length) + 1);

		for (i = oRange.start; i < n; i += 1) {
			if (aElements[i] !== undefined) {
				if (iGapStart >= 0) {
					aIntervals.push({start : iGapStart, end : i});
					iGapStart = -1;
				}
			} else if (iGapStart < 0) {
				iGapStart = i;
			}
		}
		if (iGapStart >= 0) {
			aIntervals.push({start : iGapStart, end : iEnd});
		}

		return aIntervals;
	};

	/**
	 * Calculates the index range to be read for the given start, length and prefetch length.
	 * Checks if <code>aElements</code> entries are available for at least half the prefetch length
	 * left and right to it. If not, the full prefetch length is added to this side, starting at the first missing
	 * index.
	 *
	 * @param {any[]} aElements
	 *   The array of available elements
	 * @param {number} iStart
	 *   The start index for the data request
	 * @param {number} iLength
	 *   The number of requested entries
	 * @param {number} iPrefetchLength
	 *   The number of entries to prefetch before and after the given range; <code>Infinity</code>
	 *   is supported
	 * @param {function(any):boolean} [fnIsMissing]
	 *   A function determining whether the given element is missing although it is not <code>undefined</code>
	 * @returns {object}
	 *   An object with a member <code>start</code> for the start index for the next read and
	 *   <code>length</code> for the number of entries to be read
	 *
	 * @private
	 */
	ODataUtils._getReadRange = function (aElements, iStart, iLength, iPrefetchLength, fnIsMissing) {
		// Returns the index of the first missing element in the element range iFrom (inclusive) to iTo (exclusive) or
		// -1 if no element is missing in the range
		function getFirstMissingIndex(iFrom, iTo) {
			const iStep = Math.sign(iTo - iFrom);
			for (let i = iFrom; i !== iTo; i += iStep) {
				if (aElements[i] === undefined || fnIsMissing?.(aElements[i])) {
					return i;
				}
			}

			return -1;
		}

		// Make sure that "half the prefetch length" is an integer. Round it up so that at least the
		// half is checked on both sides. (With a prefetch of 5 for example, 3 elements are checked
		// both to the left and to the right.)
		const iHalfPrefetchLength = Math.ceil(iPrefetchLength / 2);
		let iFirstMissingIndex = getFirstMissingIndex(iStart + iLength, iStart + iLength + iHalfPrefetchLength);
		if (iFirstMissingIndex !== -1) {
			const iAvailableElements = iFirstMissingIndex - (iStart + iLength);
			iLength += iAvailableElements + iPrefetchLength;
		}
		// for start index 0, both iFrom and iTo passed to getFirstMissingIndex are -1, so that it returns -1
		iFirstMissingIndex = getFirstMissingIndex(iStart - 1, Math.max(iStart - 1 - iHalfPrefetchLength, -1));
		if (iFirstMissingIndex !== -1) {
			const iAvailableElements = iStart - 1 - iFirstMissingIndex;
			const iAdditionalElements = iAvailableElements + iPrefetchLength;
			iLength += iAdditionalElements;
			iStart -= iAdditionalElements;
			if (iStart < 0) {
				iLength += iStart; // Note: Infinity + -Infinity === NaN
				if (isNaN(iLength)) {
					iLength = Infinity;
				}
				iStart = 0;
			}
		}

		return {length : iLength, start : iStart};
	};

	return ODataUtils;

});
