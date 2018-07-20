/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._AggregationHelper
sap.ui.define([], function () {
	"use strict";

	var mAllowedAggregateDetails2Type =  {
			"max" : "boolean",
			"min" : "boolean",
			"name" : "string",
			"subtotals" : "boolean",
			"with" : "string"
		},
		mAllowedAggregationKeys2Type = {
			aggregate : "object",
			group : "object",
			groupLevels : "array"
		},
		_AggregationHelper;

	/*
	 * Checks that the given details object has only allowed keys.
	 *
	 * @param {object} oDetails
	 *   The details object
	 * @param {string[]} [mAllowedKeys2Type]
	 *   Maps keys which are allowed for the details objects to the expected type name
	 * @param {string} [sName]
	 *   The name of the property to which the details object belongs
	 * @throws {Error}
	 *   In case an unsupported key is found
	 */
	function checkKeys(oDetails, mAllowedKeys2Type, sName) {
		var sKey;

		function error(sMessage) {
			if (sName) {
				sMessage += " at property: " + sName;
			}
			throw new Error(sMessage);
		}

		function typeOf(vValue) {
			return Array.isArray(vValue) ? "array" : typeof vValue;
		}

		for (sKey in oDetails) {
			if (!(mAllowedKeys2Type && sKey in mAllowedKeys2Type)) {
				error("Unsupported '" + sKey + "'");
			} else if (typeOf(oDetails[sKey]) !== mAllowedKeys2Type[sKey]) {
				error("Not a " + mAllowedKeys2Type[sKey] + " value for '" + sKey + "'");
			}
		}
	}

	/*
	 * Checks that all details objects in the given map have only allowed keys.
	 *
	 * @param {object} mMap
	 *   Map from name to details object (for a groupable or aggregatable property)
	 * @param {string[]} [mAllowedKeys2Type]
	 *   Maps keys which are allowed for the details objects to the expected type name
	 * @throws {Error}
	 *   In case an unsupported key is found
	 */
	function checkKeys4AllDetails(mMap, mAllowedKeys2Type) {
		var sName;

		for (sName in mMap) {
			checkKeys(mMap[sName], mAllowedKeys2Type, sName);
		}
	}

	/**
	 * Collection of helper methods for data aggregation.
	 *
	 * @alias sap.ui.model.odata.v4.lib._AggregationHelper
	 * @author SAP SE
	 * @private
	 */
	_AggregationHelper = {
		/**
		 * Builds the value for a "$apply" system query option based on the given data aggregation
		 * information. The value is "groupby((&lt;groupable_1,...,groupable_N),aggregate(
		 * &lt;aggregatable> with &lt;method> as &lt;alias>,...))" where the "aggregate" part is
		 * only present if aggregatable properties are given and both "with" and "as" are optional.
		 * If mQueryOptions.$filter is given the resulting $apply is extended:
		 * ".../filter(&lt;mQueryOptions.$filter>)".
		 * If mQueryOptions.$orderby is given the resulting $apply is extended:
		 * ".../orderby(&lt;mQueryOptions.$orderby>)".
		 * If at least one aggregatable property requesting minimum or maximum values is contained,
		 * the resulting $apply is extended: ".../concat(aggregate(&lt;alias> with min as
		 * UI5min__&lt;alias>,&lt;alias> with max as UI5max__&lt;alias>,...),identity)".
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see also
		 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
		 *   Extension for Data Aggregation Version 4.0</a>; must be a clone which is normalized as
		 *   a side effect to contain all optional maps/lists
		 * @param {object} [oAggregation.aggregate]
		 *   A map from aggregatable property names or aliases to objects containing the following
		 *   details:
		 *   <ul>
		 *   <li><code>min</code>: An optional boolean that tells whether the minimum value
		 *     (ignoring currencies or units of measure) for this aggregatable property is needed
		 *   <li><code>max</code>: An optional boolean that tells whether the maximum value
		 *     (ignoring currencies or units of measure) for this aggregatable property is needed
		 *   <li><code>subtotals</code>: An optional boolean that tells whether subtotals for this
		 *     aggregatable property are needed
		 *   <li><code>with</code>: An optional string that provides the name of the method (for
		 *     example "sum") used for aggregation of this aggregatable property; see
		 *     "3.1.2 Keyword with"
		 *   <li><code>name</code>: An optional string that provides the original aggregatable
		 *     property name in case a different alias is chosen as the name of the dynamic property
		 *     used for aggregation of this aggregatable property; see "3.1.1 Keyword as"
		 *   </ul>
		 * @param {object} [oAggregation.group]
		 *   A map from groupable property names to empty objects
		 * @param {string[]} [oAggregation.groupLevels]
		 *   A list of groupable property names (which may, but don't need to be repeated in
		 *   <code>oAggregation.group</code>) used to determine group levels; only a single group
		 *   level is supported
		 * @param {object} [mQueryOptions={}]
		 *   A map of key-value pairs representing the query string
		 * @param {string} [mQueryOptions.$filter]
		 *   The value for a "$filter" system query option; it is removed from the returned map, but
		 *   not from <code>mQueryOptions</code> itself
		 * @param {string} [mQueryOptions.$orderby]
		 *   The value for a "$orderby" system query option; it is removed from the returned map,
		 *   but not from <code>mQueryOptions</code> itself
		 * @param {object} [mAlias2MeasureAndMethod]
		 *   An optional map which is filled in case an aggregatable property requests minimum or
		 *   maximum values; the alias (for example "UI5min__&lt;alias>") for that value becomes the
		 *   key; an object with "measure" and "method" becomes the corresponding value. Note that
		 *   "measure" holds the aggregatable property's alias in case "3.1.1 Keyword as" is used.
		 * @returns {object}
		 *   A map of key-value pairs representing the query string, including a value for the
		 *   "$apply" system query option; it is a modified copy of <code>mQueryOptions</code>
		 * @throws {Error}
		 *   If the given data aggregation object is unsupported
		 *
		 * @public
		 */
		buildApply : function (oAggregation, mQueryOptions, mAlias2MeasureAndMethod) {
			var aAggregate,
				sApply = "",
				aGroupBy,
				aMinMax = [];

			/*
			 * Returns the corresponding part of the "aggregate" term for an aggregatable property,
			 * for example "AggregatableProperty with method as Alias". Processes min/max as a side
			 * effect.
			 *
			 * @param {string} sAlias - An aggregatable property name
			 * @returns {string} - Part of the "aggregate" term
			 */
			function aggregate(sAlias) {
				var oDetails = oAggregation.aggregate[sAlias],
					sAggregate = oDetails.name || sAlias;

				if (oDetails.with) {
					sAggregate += " with " + oDetails.with + " as " + sAlias;
				} else if (oDetails.name) {
					sAggregate += " as " + sAlias;
				}
				if (oDetails.min) {
					processMinOrMax(sAlias, "min");
				}
				if (oDetails.max) {
					processMinOrMax(sAlias, "max");
				}
				return sAggregate;
			}

			/*
			 * Tells whether the given groupable property is not a group level.
			 *
			 * @param {string} sGroupable - A groupable property name
			 * @returns {boolean} - Whether it is not a group level
			 */
			function notGroupLevel(sGroupable) {
				return oAggregation.groupLevels.indexOf(sGroupable) < 0;
			}

			/*
			 * Builds the min/max expression for the "concat" term (for example
			 * "AggregatableProperty with min as UI5min__AggregatableProperty") and adds a
			 * corresponding entry to the optional alias map.
			 *
			 * @param {string} sName - An aggregatable property name
			 * @param {string} sMinOrMax - Either "min" or "max"
			 */
			function processMinOrMax(sName, sMinOrMax) {
				var sAlias = "UI5" + sMinOrMax + "__" + sName;

				aMinMax.push(sName + " with " + sMinOrMax + " as " + sAlias);
				if (mAlias2MeasureAndMethod) {
					mAlias2MeasureAndMethod[sAlias] = {
						measure : sName,
						method : sMinOrMax
					};
				}
			}

			checkKeys(oAggregation, mAllowedAggregationKeys2Type);
			oAggregation.groupLevels = oAggregation.groupLevels || [];
			if (oAggregation.groupLevels.length > 1) {
				throw new Error("More than one group level: " + oAggregation.groupLevels);
			}

			oAggregation.group = oAggregation.group || {};
			checkKeys4AllDetails(oAggregation.group);
			aGroupBy = oAggregation.groupLevels.concat(
				Object.keys(oAggregation.group).sort().filter(notGroupLevel));

			oAggregation.aggregate = oAggregation.aggregate || {};
			checkKeys4AllDetails(oAggregation.aggregate, mAllowedAggregateDetails2Type);
			aAggregate = Object.keys(oAggregation.aggregate).sort().map(aggregate);

			if (aAggregate.length) {
				sApply = "aggregate(" + aAggregate.join(",") + ")";
			}
			if (aGroupBy.length) {
				sApply = "groupby((" + aGroupBy.join(",") + (sApply ? ")," + sApply + ")" : "))");
			}
			mQueryOptions = jQuery.extend({}, mQueryOptions);
			if (mQueryOptions.$filter) {
				sApply += "/filter(" + mQueryOptions.$filter + ")";
				delete mQueryOptions.$filter;
			}
			if (mQueryOptions.$orderby) {
				sApply += "/orderby(" + mQueryOptions.$orderby + ")";
				delete mQueryOptions.$orderby;
			}
			if (aMinMax.length) {
				sApply += "/concat(aggregate(" + aMinMax.join(",") + "),identity)";
			}
			mQueryOptions.$apply = sApply;

			return mQueryOptions;
		},

		/**
		 * Tells whether minimum or maximum values are needed for at least one aggregatable
		 * property.
		 *
		 * @param {object} [mAggregate]
		 *   A map from aggregatable property names or aliases to details objects
		 * @returns {boolean}
		 *   Whether minimum or maximum values are needed for at least one aggregatable
		 *   property.
		 *
		 * @public
		 */
		hasMinOrMax : function (mAggregate) {
			return !!mAggregate && Object.keys(mAggregate).some(function (sAlias) {
				var oDetails = mAggregate[sAlias];

				return oDetails.min || oDetails.max;
			});
		}
	};

	return _AggregationHelper;
}, /* bExport= */false);
