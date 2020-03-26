/*!
 * ${copyright}
 */

/**
 * OData-based DataBinding Utility Class
 *
 * @namespace
 * @name sap.ui.model.odata
 * @public
 */

// Provides class sap.ui.model.odata.ODataUtils
sap.ui.define([
	'sap/ui/model/Sorter',
	'sap/ui/model/FilterProcessor',
	'sap/ui/core/format/DateFormat',
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/base/security/encodeURL",
	"sap/ui/core/CalendarType"
],
	function(Sorter, FilterProcessor, DateFormat, Log, assert, jQuery, encodeURL, CalendarType ) {
	"use strict";

	var rDecimal = /^([-+]?)0*(\d+)(\.\d+|)$/,
		rTrailingDecimal = /\.$/,
		rTrailingZeroes = /0+$/;

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
			return;
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
	 * Creates URL parameters strings for filtering.
	 * The Parameter string is prepended with the "$filter=" system query option to form
	 * a valid URL part for OData Request.
	 * In case an array of filters is passed, they will be grouped in a way that filters on the
	 * same path are ORed and filters on different paths are ANDed with each other
	 * @see ODataUtils._createFilterParams
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} vFilter the root filter or filter array
	 * @param {object} oEntityType the entity metadata object
	 * @return {string} the URL encoded filter parameters
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
			return;
		}
		return "$filter=" + this._createFilterParams(oFilter, oMetadata, oEntityType);
	};

	/**
	 * Creates a string of logically (or/and) linked filter options,
	 * which will be used as URL query parameters for filtering.
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} vFilter the root filter or filter array
	 * @param {object} oEntityType the entity metadata object
	 * @return {string} the URL encoded filter parameters
	 * @private
	 */
	ODataUtils._createFilterParams = function(vFilter, oMetadata, oEntityType) {
		var that = this,
			oFilter = Array.isArray(vFilter) ? FilterProcessor.groupFilters(vFilter) : vFilter;

		function create(oFilter, bOmitBrackets) {
			oFilter = convertLegacyFilter(oFilter);

			if (oFilter.aFilters) {
				return createMulti(oFilter, bOmitBrackets);
			}
			return that._createFilterSegment(oFilter.sPath, oMetadata, oEntityType, oFilter.sOperator, oFilter.oValue1, oFilter.oValue2, oFilter.bCaseSensitive);
		}

		function createMulti(oMultiFilter, bOmitBrackets) {
			var aFilters = oMultiFilter.aFilters,
				bAnd = !!oMultiFilter.bAnd,
				sFilter = "";

			if (aFilters.length === 0) {
				return bAnd ? "true" : "false";
			}

			if (aFilters.length === 1) {
				if (aFilters[0]._bMultiFilter) {
					return create(aFilters[0]);
				}
				return create(aFilters[0], true);
			}

			if (!bOmitBrackets) {
				sFilter += "(";
			}
			sFilter += create(aFilters[0]);
			for (var i = 1; i < aFilters.length; i++) {
				sFilter += bAnd ? "%20and%20" : "%20or%20";
				sFilter += create(aFilters[i]);
			}
			if (!bOmitBrackets) {
				sFilter += ")";
			}
			return sFilter;
		}

		if (!oFilter) {
			return;
		}

		return create(oFilter, true);
	};

	/**
	 * Converts a string or object-map with URL Parameters into an array.
	 * If vParams is an object map, it will be also encoded properly.
	 *
	 * @private
	 * @param {string|object|array} vParams
	 */
	ODataUtils._createUrlParamsArray = function(vParams) {
		var aUrlParams, sType = jQuery.type(vParams), sParams;
		if (sType === "array") {
			return vParams;
		}

		aUrlParams = [];
		if (sType === "object") {
			sParams = this._encodeURLParameters(vParams);
			if (sParams) {
				aUrlParams.push(sParams);
			}
		} else if (sType === "string") {
			if (vParams) {
				aUrlParams.push(vParams);
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
		jQuery.each(mParams, function (sName, oValue) {
			if (jQuery.type(oValue) === "string") {
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
	 * @param {string} vParameters.force setting this flag to 'true' overrides the already existing origin
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
		var iAnnotationIndex = sAnnotationURL.indexOf("/Annotations(");
		var iHanaXsSegmentIndex = vParameters && vParameters.preOriginBaseUri ? vParameters.preOriginBaseUri.indexOf(".xsodata") : -1;

		if (iAnnotationIndex === -1){ // URL might be encoded, "(" becomes %28
			iAnnotationIndex = sAnnotationURL.indexOf("/Annotations%28");
		}

		if (iAnnotationIndex >= 0) { // annotation path is there
			if (sAnnotationURL.indexOf("/$value", iAnnotationIndex) === -1) { // $value missing
				Log.warning("ODataUtils.setAnnotationOrigin: Annotation url is missing $value segment.");
				sFinalAnnotationURL = sAnnotationURL;
			} else {
				// if the annotation URL is an SAP specific annotation url, we add the origin path segment...
				var sAnnotationUrlBase =  sAnnotationURL.substring(0, iAnnotationIndex);
				var sAnnotationUrlRest =  sAnnotationURL.substring(iAnnotationIndex, sAnnotationURL.length);
				var sAnnotationWithOrigin = ODataUtils.setOrigin(sAnnotationUrlBase, vParameters);
				sFinalAnnotationURL = sAnnotationWithOrigin + sAnnotationUrlRest;
			}
		} else if (iHanaXsSegmentIndex >= 0) {
			// Hana XS case: the Hana XS engine can provide static Annotation files for its services.
			// The services can be identifed by their URL segment ".xsodata"; if such a service uses the origin feature
			// the Annotation URLs need also adaption.
			sFinalAnnotationURL = ODataUtils.setOrigin(sAnnotationURL, vParameters);

		} else {
			// Legacy Code for compatibility reasons:
			// ... if not, we check if the annotation url is on the same service-url base-path
			sFinalAnnotationURL = sAnnotationURL.replace(vParameters.preOriginBaseUri, vParameters.postOriginBaseUri);
		}

		return sFinalAnnotationURL;
	};


	/**
	 * convert multi filter to filter string
	 *
	 * @private
	 */
	ODataUtils._resolveMultiFilter = function(oMultiFilter, oMetadata, oEntityType){
		var that = this,
			aFilters = oMultiFilter.aFilters,
			sFilterParam = "";

		if (aFilters) {
			sFilterParam += "(";
			jQuery.each(aFilters, function(i, oFilter) {
				if (oFilter._bMultiFilter) {
					sFilterParam += that._resolveMultiFilter(oFilter, oMetadata, oEntityType);
				} else if (oFilter.sPath) {
					sFilterParam += that._createFilterSegment(oFilter.sPath, oMetadata, oEntityType, oFilter.sOperator, oFilter.oValue1, oFilter.oValue2, "", oFilter.bCaseSensitive);
				}
				if (i < (aFilters.length - 1)) {
					if (oMultiFilter.bAnd) {
						sFilterParam += "%20and%20";
					} else {
						sFilterParam += "%20or%20";
					}
				}
			});
			sFilterParam += ")";
		}

		return sFilterParam;
	};

	/**
	 * Create a single filter segment of the OData filter parameters
	 *
	 * @private
	 */
	ODataUtils._createFilterSegment = function(sPath, oMetadata, oEntityType, sOperator, oValue1, oValue2, bCaseSensitive) {

		var oPropertyMetadata, sType;

		if (bCaseSensitive === undefined) {
			bCaseSensitive = true;
		}

		if (oEntityType) {
			oPropertyMetadata = oMetadata._getPropertyMetadata(oEntityType, sPath);
			sType = oPropertyMetadata && oPropertyMetadata.type;
			assert(oPropertyMetadata, "PropertyType for property " + sPath + " of EntityType " + oEntityType.name + " not found!");
		}

		if (sType) {
			oValue1 = this.formatValue(oValue1, sType, bCaseSensitive);
			oValue2 = (oValue2 != null) ? this.formatValue(oValue2, sType, bCaseSensitive) : null;
		} else {
			assert(null, "Type for filter property could not be found in metadata!");
		}

		if (oValue1) {
			oValue1 = encodeURL(String(oValue1));
		}
		if (oValue2) {
			oValue2 = encodeURL(String(oValue2));
		}

		if (!bCaseSensitive && sType === "Edm.String") {
			sPath =  "toupper(" + sPath + ")";
		}

		// TODO embed 2nd value
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
				Log.error("ODataUtils :: Unknown filter operator " + sOperator);
				return "true";
		}
	};

	/**
	 * Formats a JavaScript value according to the given
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * EDM type</a>.
	 *
	 * @param {any} vValue the value to format
	 * @param {string} sType the EDM type (e.g. Edm.Decimal)
	 * @param {boolean} bCaseSensitive Wether strings gets compared case sensitive or not
	 * @return {string} the formatted value
	 * @public
	 */
	ODataUtils.formatValue = function(vValue, sType, bCaseSensitive) {

		if (bCaseSensitive === undefined) {
			bCaseSensitive = true;
		}

		// Lazy creation of format objects
		if (!this.oDateTimeFormat) {
			this.oDateTimeFormat = DateFormat.getDateInstance({
				pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss''",
				calendarType: CalendarType.Gregorian
			});
			this.oDateTimeFormatMs = DateFormat.getDateInstance({
				pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss.SSS''",
				calendarType: CalendarType.Gregorian
			});
			this.oDateTimeOffsetFormat = DateFormat.getDateInstance({
				pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss'Z'''",
				calendarType: CalendarType.Gregorian
			});
			this.oTimeFormat = DateFormat.getTimeInstance({
				pattern: "'time''PT'HH'H'mm'M'ss'S'''",
				calendarType: CalendarType.Gregorian
			});
		}

		// null values should return the null literal
		if (vValue === null || vValue === undefined) {
			return "null";
		}

		// Format according to the given type
		var sValue;
		switch (sType) {
			case "Edm.String":
				// quote
				vValue = bCaseSensitive ? vValue : vValue.toUpperCase();
				sValue = "'" + String(vValue).replace(/'/g, "''") + "'";
				break;
			case "Edm.Time":
				if (typeof vValue === "object") {
					sValue = this.oTimeFormat.format(new Date(vValue.ms), true);
				} else {
					sValue = "time'" + vValue + "'";
				}
				break;
			case "Edm.DateTime":
				var oDate = new Date(vValue);

				if (oDate.getMilliseconds() > 0) {
					sValue = this.oDateTimeFormatMs.format(oDate, true);
				} else {
					sValue = this.oDateTimeFormat.format(oDate, true);
				}
				break;
			case "Edm.DateTimeOffset":
				var oDate = new Date(vValue);
				sValue = this.oDateTimeOffsetFormat.format(oDate, true);
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
		if (sValue[0] === "'") { // "Edm.String"
			return sValue.slice(1, -1).replace(/''/g, "'");
		} else if (sValue.startsWith("guid'")) { // "Edm.Guid"
			return sValue.slice(5, -1);
		} else if (sValue === "true" || sValue === "false") { // "Edm.Boolean"
			return sValue === "true";
		} else if (sValue === "null") { // null
			return null;
		} else if (sValue.startsWith("binary'")) { // "Edm.Binary"
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
	 * @param {string} [bAsDecimal=false]
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

	return ODataUtils;

}, /* bExport= */ true);