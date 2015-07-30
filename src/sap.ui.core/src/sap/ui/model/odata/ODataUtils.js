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
sap.ui.define(['jquery.sap.global', './Filter', 'sap/ui/model/Sorter', 'sap/ui/model/Filter', 'sap/ui/core/format/DateFormat'],
	function(jQuery, ODataFilter, Sorter, Filter, DateFormat) {
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
			}
		}
		//remove trailing comma
		sSortParam = sSortParam.slice(0, -1);
		return sSortParam;
	};

	/**
	 * Creates URL parameters strings for filtering.
	 * The Parameter string is prepended with the "$filter=" system query option to form
	 * a valid URL part for OData Request.
	 * @see ODataUtils._createFilterParams
	 * @see {array} aFilters an array of sap.ui.model.Filter
	 * @param {object} oEntityType the entity metadata object
	 * @return {string} the URL encoded filter parameters
	 * @private
	 */
	ODataUtils.createFilterParams = function(aFilters, oMetadata, oEntityType) {
		if (!aFilters || aFilters.length == 0) {
			return;
		}
		return "$filter=" + this._createFilterParams(aFilters, oMetadata, oEntityType);
	};

	/**
	 * Creates a string of logically (or/and) linked filter options,
	 * which will be used as URL query parameters for filtering.
	 * @param {array} aFilters an array of sap.ui.model.Filter
	 * @param {object} oEntityType the entity metadata object
	 * @return {string} the URL encoded filter parameters
	 * @private
	 */
	ODataUtils._createFilterParams = function(aFilters, oMetadata, oEntityType) {
		var sFilterParam;
		if (!aFilters || aFilters.length == 0) {
			return;
		}
		var oFilterGroups = {},
			iFilterGroupLength = 0,
			aFilterGroup,
			sFilterParam = "",
			iFilterGroupCount = 0,
			that = this;
		//group filters by path
		jQuery.each(aFilters, function(j, oFilter) {
			if (oFilter.sPath) {
				aFilterGroup = oFilterGroups[oFilter.sPath];
				if (!aFilterGroup) {
					aFilterGroup = oFilterGroups[oFilter.sPath] = [];
					iFilterGroupLength++;
				}
			} else {
				aFilterGroup = oFilterGroups["__multiFilter"];
				if (!aFilterGroup) {
					aFilterGroup = oFilterGroups["__multiFilter"] = [];
					iFilterGroupLength++;
				}
			}
			aFilterGroup.push(oFilter);
		});
		jQuery.each(oFilterGroups, function(sPath, aFilterGroup) {
			if (aFilterGroup.length > 1) {
				sFilterParam += '(';
			}
			jQuery.each(aFilterGroup, function(i,oFilter) {
				if (oFilter instanceof ODataFilter) {
					if (oFilter.aValues.length > 1) {
						sFilterParam += '(';
					}
					jQuery.each(oFilter.aValues, function(i, oFilterSegment) {
						if (i > 0) {
							if (oFilter.bAND) {
								sFilterParam += "%20and%20";
							} else {
								sFilterParam += "%20or%20";
							}
						}
						sFilterParam = that._createFilterSegment(oFilter.sPath, oMetadata, oEntityType, oFilterSegment.operator, oFilterSegment.value1, oFilterSegment.value2, sFilterParam);
					});
					if (oFilter.aValues.length > 1) {
						sFilterParam += ')';
					}
				} else if (oFilter._bMultiFilter) {
					sFilterParam += that._resolveMultiFilter(oFilter, oMetadata, oEntityType);
				} else {
					sFilterParam = that._createFilterSegment(oFilter.sPath, oMetadata, oEntityType, oFilter.sOperator, oFilter.oValue1, oFilter.oValue2, sFilterParam);
				}
				if (i < aFilterGroup.length - 1) {
					sFilterParam += "%20or%20";
				}
			});
			if (aFilterGroup.length > 1) {
				sFilterParam += ')';
			}
			if (iFilterGroupCount < iFilterGroupLength - 1) {
				sFilterParam += "%20and%20";
			}
			iFilterGroupCount++;
		});
		return sFilterParam;
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
			sName = jQuery.sap.startsWith(sName,'$') ? sName : encodeURIComponent(sName);
			aUrlParams.push(sName + "=" + oValue);
		});
		return aUrlParams.join("&");
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
					sFilterParam += that._createFilterSegment(oFilter.sPath, oMetadata, oEntityType, oFilter.sOperator, oFilter.oValue1, oFilter.oValue2, "");
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
	ODataUtils._createFilterSegment = function(sPath, oMetadata, oEntityType, sOperator, oValue1, oValue2, sFilterParam) {

		var oPropertyMetadata, sType;
		if (oEntityType) {
			oPropertyMetadata = oMetadata._getPropertyMetadata(oEntityType, sPath);
			sType = oPropertyMetadata && oPropertyMetadata.type;
			jQuery.sap.assert(oPropertyMetadata, "PropertyType for property " + sPath + " of EntityType " + oEntityType.name + " not found!");
		}

		if (sType) {
			oValue1 = this.formatValue(oValue1, sType);
			oValue2 = (oValue2 != null) ? this.formatValue(oValue2, sType) : null;
		} else {
			jQuery.sap.assert(null, "Type for filter property could not be found in metadata!");
		}

		if (oValue1) {
			oValue1 = jQuery.sap.encodeURL(String(oValue1));
		}
		if (oValue2) {
			oValue2 = jQuery.sap.encodeURL(String(oValue2));
		}

		// TODO embed 2nd value
		switch (sOperator) {
			case "EQ":
			case "NE":
			case "GT":
			case "GE":
			case "LT":
			case "LE":
				sFilterParam += sPath + "%20" + sOperator.toLowerCase() + "%20" + oValue1;
				break;
			case "BT":
				sFilterParam += "(" + sPath + "%20ge%20" + oValue1 + "%20and%20" + sPath + "%20le%20" + oValue2 + ")";
				break;
			case "Contains":
				sFilterParam += "substringof(" + oValue1 + "," + sPath + ")";
				break;
			case "StartsWith":
				sFilterParam += "startswith(" + sPath + "," + oValue1 + ")";
				break;
			case "EndsWith":
				sFilterParam += "endswith(" + sPath + "," + oValue1 + ")";
				break;
			default:
				sFilterParam += "true";
		}
		return sFilterParam;
	};

	/**
	 * Formats a JavaScript value according to the given
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * EDM type</a>.
	 *
	 * @param {any} vValue the value to format
	 * @param {string} sType the EDM type (e.g. Edm.Decimal)
	 * @return {string} the formatted value
	 * @public
	 */
	ODataUtils.formatValue = function(vValue, sType) {
		// Lazy creation of format objects
		if (!this.oDateTimeFormat) {
			this.oDateTimeFormat = DateFormat.getDateInstance({
				pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss''"
			});
			this.oDateTimeOffsetFormat = DateFormat.getDateInstance({
				pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss'Z'''"
			});
			this.oTimeFormat = DateFormat.getTimeInstance({
				pattern: "'time'''HH:mm:ss''"
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
				sValue = "'" + String(vValue).replace(/'/g, "''") + "'";
				break;
			case "Edm.Time":
				sValue = "time'" + vValue + "'";
				break;
			case "Edm.DateTime":
				sValue = this.oDateTimeFormat.format(new Date(vValue), true);
				break;
			case "Edm.DateTimeOffset":
				sValue = this.oDateTimeOffsetFormat.format(new Date(vValue), true);
				break;
			case "Edm.Guid":
				sValue = "guid'" + vValue + "'";
				break;
			case "Edm.Decimal":
				sValue = vValue + "M";
				break;
			case "Edm.Int64":
				sValue = vValue + "L";
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
	 * Compares the given values using <code>===</code> and <code>></code>.
	 *
	 * @param {any} vValue1
	 *   the first value to compare
	 * @param {any} vValue2
	 *   the second value to compare
	 * @return {integer}
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
	 * @return {integer}
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

	/**
	 * Extracts the milliseconds if the value is a date/time instance.
	 * @param {any} vValue
	 *   the value (may be <code>undefined</code> or <code>null</code>)
	 * @returns {any}
	 *   the number of milliseconds or the value itself
	 */
	function extractMilliseconds(vValue) {
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
	 * @return {integer}
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

	return ODataUtils;

}, /* bExport= */ true);
