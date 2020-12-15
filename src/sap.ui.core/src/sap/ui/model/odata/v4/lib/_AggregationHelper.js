/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._AggregationHelper
sap.ui.define([
	"./_Helper",
	"./_Parser",
	"sap/ui/model/Filter"
], function (_Helper, _Parser, Filter) {
	"use strict";

	var mAllowedAggregateDetails2Type =  {
			grandTotal : "boolean",
			max : "boolean",
			min : "boolean",
			name : "string",
			subtotals : "boolean",
			unit : "string",
			"with" : "string"
		},
		mAllowedAggregationKeys2Type = {
			aggregate : "object",
			grandTotalAtBottomOnly : "boolean",
			group : "object",
			groupLevels : "array",
			subtotalsAtBottomOnly : "boolean"
		},
		// "required white space"
		rComma = /,|%2C|%2c/,
		rRws = new RegExp(_Parser.sWhitespace + "+"),
		rODataIdentifier = new RegExp("^" + _Parser.sODataIdentifier
			+ "(?:" + _Parser.sWhitespace + "+(?:asc|desc))?$"),
		_AggregationHelper;

	/*
	 * Process an aggregatable property including its optional unit.
	 *
	 * @param {object} oAggregation - An object holding the information needed for data aggregation
	 * @param {string[]} aGroupBy - groupby((???),...) content
	 * @param {string[]} aAggregate - aggregate(???) content
	 * @param {string} sAlias - An aggregatable property name/alias
	 * @param {number} i - Index of sAlias in aAliases
	 * @param {string[]} aAliases - Array of all applicable aggregatable property names/aliases
	 */
	function aggregate(oAggregation, aGroupBy, aAggregate, sAlias, i, aAliases) {
		var oDetails = oAggregation.aggregate[sAlias],
			sAggregate = oDetails.name || sAlias,
			sUnit = oDetails.unit,
			sWith = oDetails.with;

		if (sWith) {
			sAggregate += " with " + sWith + " as " + sAlias;
		} else if (oDetails.name) {
			sAggregate += " as " + sAlias;
		}
		aAggregate.push(sAggregate);

		if (sUnit && aAggregate.indexOf(sUnit) < 0 && aAliases.indexOf(sUnit, i + 1) < 0
				&& aGroupBy.indexOf(sUnit) < 0) {
			aAggregate.push(sUnit);
		}
	}

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

	/*
	 * Takes care of the $skip/$top system query options and returns the corresponding
	 * transformation(s).
	 * @param {object} mQueryOptions
	 *   A modifiable map of key-value pairs representing the query string
	 * @param {number} [mQueryOptions.$skip]
	 *   The value for a "$skip" system query option; it is removed
	 * @param {number} [mQueryOptions.$top]
	 *   The value for a "$top" system query option; it is removed
	 *
	 * @returns {string} The transformation(s) corresponding to $skip/$top or "".
	 */
	function skipTop(mQueryOptions) {
		var aTransformations = [];

		if (mQueryOptions.$skip) {
			aTransformations.push("skip(" + mQueryOptions.$skip + ")");
		}
		delete mQueryOptions.$skip; // delete 0 value even w/o skip(0)
		if (mQueryOptions.$top < Infinity) { // ignore +Infinity, undefined, NaN, ...
			aTransformations.push("top(" + mQueryOptions.$top + ")");
		}
		delete mQueryOptions.$top;

		return aTransformations.join("/");
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
		 * If <code>mQueryOptions.$filter</code> is given, the resulting "$apply" is extended:
		 * ".../filter(&lt;mQueryOptions.$filter>)".
		 * If <code>mQueryOptions.$orderby</code> is given, the resulting "$apply" is extended:
		 * ".../orderby(&lt;mQueryOptions.$orderby>)".
		 * If at least one aggregatable property requesting minimum or maximum values is contained,
		 * the resulting "$apply" is extended: ".../concat(aggregate(&lt;alias> with min as
		 * UI5min__&lt;alias>,&lt;alias> with max as UI5max__&lt;alias>,...),identity)". Grand
		 * total values are requested in a similar way.
		 * If <code>mQueryOptions.$skip</code> is given, it is inserted as a transformation:
		 * ".../skip(&lt;mQueryOptions.$skip>))". Same for <code>mQueryOptions.$top</code>.
		 * Unnecessary transformations like "identity/" or "skip(0)" are actually avoided.
		 * In case of a "concat", if <code>mQueryOptions.$count</code> is given, it is inserted as
		 * an additional aggregate "$count as UI5__count"; this way it still works with "skip()" and
		 * "top()".
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see
		 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
		 * @param {object} [mQueryOptions={}]
		 *   A map of key-value pairs representing the query string; it is not modified
		 * @param {boolean} [mQueryOptions.$count]
		 *   The value for a "$count" system query option; it is removed from the returned map for a
		 *   follow-up request or in case it is turned into an aggregate "$count as UI5__count"
		 * @param {string} [mQueryOptions.$filter]
		 *   The value for a "$filter" system query option; it is removed from the returned map and
		 *   turned into a "filter()" transformation
		 * @param {string} [mQueryOptions.$$filterBeforeAggregate]
		 *   The value for a filter which is applied before the aggregation; it is removed from the
		 *   returned map and turned into a "filter()" transformation
		 * @param {string} [mQueryOptions.$orderby]
		 *   The value for a "$orderby" system query option; it is removed from the returned map and
		 *   turned into an "orderby()" transformation
		 * @param {number} [mQueryOptions.$skip]
		 *   The value for a "$skip" system query option; it is removed from the returned map and
		 *   turned into a "skip()" transformation
		 * @param {number} [mQueryOptions.$top]
		 *   The value for a "$top" system query option; it is removed from the returned map and
		 *   turned into a "top()" transformation
		 * @param {number} [iLevel=1]
		 *   The current level
		 * @param {boolean} [bFollowUp]
		 *   Tells whether this method is called for a follow-up request, not for the first one; in
		 *   this case, neither the count nor grand totals or minimum or maximum values are
		 *   requested again and <code>mAlias2MeasureAndMethod</code> is ignored
		 * @param {object} [mAlias2MeasureAndMethod]
		 *   An optional map which is filled in case an aggregatable property requests minimum or
		 *   maximum values; the alias (for example "UI5min__&lt;alias>") for that value becomes the
		 *   key; an object with "measure" and "method" becomes the corresponding value. Note that
		 *   "measure" holds the aggregatable property's alias in case "3.1.1 Keyword as" is used.
		 * @returns {object}
		 *   A map of key-value pairs representing the query string, including a value for the
		 *   "$apply" system query option if needed; it is a modified copy of
		 *   <code>mQueryOptions</code>, with values removed as described above
		 * @throws {Error}
		 *   If the given data aggregation object is unsupported
		 *
		 * @public
		 */
		buildApply : function (oAggregation, mQueryOptions, iLevel, bFollowUp,
				mAlias2MeasureAndMethod) {
			var aAliases,
				sApply = "",
				aGrandTotalAggregate = [], // concat(aggregate(???),.) content for grand totals
				aGroupBy,
				bIsLeafLevel,
				aMinMaxAggregate = [], // concat(aggregate(???),.) content for min/max or count
				sSkipTop,
				aSubtotalsAggregate = []; // groupby(.,aggregate(???)) content for subtotals/leaves

			/*
			 * Builds the min/max expression for the "concat" term (for example
			 * "AggregatableProperty with min as UI5min__AggregatableProperty") and adds a
			 * corresponding entry to the optional alias map if requested in the details.
			 *
			 * @param {string} sName - An aggregatable property name/alias
			 * @param {string} sMinOrMax - Either "min" or "max"
			 */
			function processMinOrMax(sName, sMinOrMax) {
				var sAlias,
					oDetails = oAggregation.aggregate[sName];

				if (oDetails[sMinOrMax]) {
					sAlias = "UI5" + sMinOrMax + "__" + sName;

					aMinMaxAggregate.push(sName + " with " + sMinOrMax + " as " + sAlias);
					if (mAlias2MeasureAndMethod) {
						mAlias2MeasureAndMethod[sAlias] = {
							measure : sName,
							method : sMinOrMax
						};
					}
				}
			}

			mQueryOptions = Object.assign({}, mQueryOptions);
			iLevel = iLevel || 1;

			checkKeys(oAggregation, mAllowedAggregationKeys2Type);
			oAggregation.groupLevels = oAggregation.groupLevels || [];
			bIsLeafLevel = iLevel > oAggregation.groupLevels.length;

			oAggregation.group = oAggregation.group || {};
			checkKeys4AllDetails(oAggregation.group);
			oAggregation.groupLevels.forEach(function (sGroup) {
				oAggregation.group[sGroup] = oAggregation.group[sGroup] || {};
			});
			aGroupBy = bIsLeafLevel
				? Object.keys(oAggregation.group).sort().filter(function (sGroupable) {
					return oAggregation.groupLevels.indexOf(sGroupable) < 0;
				})
				: [oAggregation.groupLevels[iLevel - 1]];

			oAggregation.aggregate = oAggregation.aggregate || {};
			checkKeys4AllDetails(oAggregation.aggregate, mAllowedAggregateDetails2Type);
			aAliases = Object.keys(oAggregation.aggregate).sort();
			if (iLevel <= 1 && !bFollowUp) {
				aAliases.filter(function (sAlias) {
					return oAggregation.aggregate[sAlias].grandTotal;
				}).forEach(
					aggregate.bind(null, oAggregation, [], aGrandTotalAggregate)
				);
			}
			if (!bFollowUp) {
				aAliases.forEach(function (sAlias) {
					processMinOrMax(sAlias, "min");
					processMinOrMax(sAlias, "max");
				});
			}
			aAliases.filter(function (sAlias) {
				return bIsLeafLevel || oAggregation.aggregate[sAlias].subtotals;
			}).forEach(
				aggregate.bind(null, oAggregation, aGroupBy, aSubtotalsAggregate)
			);
			if (aSubtotalsAggregate.length) {
				sApply = "aggregate(" + aSubtotalsAggregate.join(",") + ")";
			}

			if (aGroupBy.length) {
				sApply = "groupby((" + aGroupBy.join(",") + (sApply ? ")," + sApply + ")" : "))");
			}

			if (bFollowUp) {
				delete mQueryOptions.$count;
			} else if (mQueryOptions.$count) {
				aMinMaxAggregate.push("$count as UI5__count");
				delete mQueryOptions.$count;
			}

			if (mQueryOptions.$filter) {
				sApply += "/filter(" + mQueryOptions.$filter + ")";
				delete mQueryOptions.$filter;
			}
			if (mQueryOptions.$orderby) {
				sApply += "/orderby(" + mQueryOptions.$orderby + ")";
				delete mQueryOptions.$orderby;
			}
			sSkipTop = skipTop(mQueryOptions);
			if (aMinMaxAggregate.length) {
				sApply += "/concat(aggregate(" + aMinMaxAggregate.join(",") + "),"
					+ (sSkipTop || "identity") + ")";
			} else if (sSkipTop) {
				sApply += "/" + sSkipTop;
			}
			if (aGrandTotalAggregate.length) {
				sApply = "concat(aggregate(" + aGrandTotalAggregate.join(",") + ")," + sApply + ")";
			}
			if (mQueryOptions.$$filterBeforeAggregate) {
				sApply = "filter(" + mQueryOptions.$$filterBeforeAggregate + ")/" + sApply;
				delete mQueryOptions.$$filterBeforeAggregate;
			}
			if (sApply) {
				mQueryOptions.$apply = sApply;
			}

			return mQueryOptions;
		},

		/**
		 * Creates a placeholder.
		 *
		 * @param {number} iLevel - The level
		 * @param {number} iIndex - The index within the parent cache
		 * @param {object} oParentCache - The parent cache
		 * @returns {object} A placeholder object
		 *
		 * @public
		 */
		createPlaceholder : function (iLevel, iIndex, oParentCache) {
			var oPlaceholder = {"@$ui5.node.level" : iLevel};

			_Helper.setPrivateAnnotation(oPlaceholder, "index", iIndex);
			_Helper.setPrivateAnnotation(oPlaceholder, "parent", oParentCache);

			return oPlaceholder;
		},

		/**
		 * Extract subtotals and their units from the given group node, so that they can be used
		 * for an extra row showing subtotals at the bottom and also to restore them when
		 * collapsing. If requested, adds corresponding <code>null</code> updates for expansion.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply})
		 * @param {object} oGroupNode
		 *   The group node which is about to be expanded
		 * @param {object} oCollapsed
		 *   An object to be filled with subtotals and their units from the given group node
		 * @param {object} [oExpanded]
		 *   An object to be filled with <code>null</code> updates for subtotals and their units;
		 *   useful if subtotals are shown at the bottom only
		 */
		extractSubtotals : function (oAggregation, oGroupNode, oCollapsed, oExpanded) {
			var iLevel = oGroupNode["@$ui5.node.level"];

			Object.keys(oAggregation.aggregate).forEach(function (sAlias) {
				var iIndex, sUnit;

				oCollapsed[sAlias] = oGroupNode[sAlias];
				if (oExpanded) {
					oExpanded[sAlias] = null; // subtotals not shown here
					// Note: no need to remove "<sAlias>@odata.type"
				}
				sUnit = oAggregation.aggregate[sAlias].unit;
				if (sUnit) {
					oCollapsed[sUnit] = oGroupNode[sUnit];
					if (oExpanded) {
						iIndex = oAggregation.groupLevels.indexOf(sUnit);
						if (iIndex < 0 || iIndex >= iLevel) {
							// unit not used as a groupLevel up to here
							oExpanded[sUnit] = null;
						}
					}
				}
			});
		},

		/**
		 * Returns the "$orderby" system query option filtered in such a way that only aggregatable
		 * or groupable properties contained in the given aggregation information are used.
		 *
		 * @param {string} [sOrderby]
		 *   The original "$orderby" system query option
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply})
		 * @param {number} iLevel
		 *   The current level
		 * @returns {string}
		 *   The filtered "$orderby" system query option
		 *
		 * @private
		 */
		filterOrderby : function (sOrderby, oAggregation, iLevel) {
			var bIsLeafLevel = iLevel > oAggregation.groupLevels.length;

			if (sOrderby) {
				return sOrderby.split(rComma).filter(function (sOrderbyItem) {
					var sName;

					if (rODataIdentifier.test(sOrderbyItem)) {
						sName = sOrderbyItem.split(rRws)[0]; // drop optional asc/desc
						return sName in oAggregation.aggregate
								&& (bIsLeafLevel || oAggregation.aggregate[sName].subtotals)
							|| bIsLeafLevel && sName in oAggregation.group
								&& oAggregation.groupLevels.indexOf(sName) < 0
							|| !bIsLeafLevel && oAggregation.groupLevels[iLevel - 1] === sName;
					}
					return true;
				}).join(",");
			}
		},

		/**
		 * Returns an unsorted list of all aggregatable or groupable properties, including units.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply})
		 * @returns {string[]}
		 *   An unsorted list of all aggregatable or groupable properties, including units
		 *
		 * @private
		 */
		getAllProperties : function (oAggregation) {
			var aAllProperties
				= Object.keys(oAggregation.aggregate).concat(Object.keys(oAggregation.group));

			Object.keys(oAggregation.aggregate).forEach(function (sAlias) {
				var sUnit = oAggregation.aggregate[sAlias].unit;

				if (sUnit) {
					aAllProperties.push(sUnit);
				}
			});

			return aAllProperties;
		},

		/**
		 * Gets an object with property updates to be applied when expanding the given group node,
		 * creating it when needed for the first time. Creates a corresponding object to be applied
		 * when collapsing the node again. Takes placement of subtotals into account.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply})
		 * @param {object} oGroupNode
		 *   The group node which is about to be expanded
		 * @returns {object}
		 *   An object with property updates to be applied when expanding the given group node
		 */
		getOrCreateExpandedOject : function (oAggregation, oGroupNode) {
			var oCollapsed,
				oExpanded = _Helper.getPrivateAnnotation(oGroupNode, "expanded");

			if (!oExpanded) {
				oCollapsed = {"@$ui5.node.isExpanded" : false};
				_Helper.setPrivateAnnotation(oGroupNode, "collapsed", oCollapsed);
				oExpanded = {"@$ui5.node.isExpanded" : true};
				_Helper.setPrivateAnnotation(oGroupNode, "expanded", oExpanded);
				if (oAggregation.subtotalsAtBottomOnly !== undefined) { // "only or also at bottom"
					_AggregationHelper.extractSubtotals(oAggregation, oGroupNode, oCollapsed,
						oAggregation.subtotalsAtBottomOnly ? oExpanded : null);
				}
			}

			return oExpanded;
		},

		/**
		 * Tells whether grand total values are needed for at least one aggregatable property.
		 *
		 * @param {object} mAggregate
		 *   A map from aggregatable property names/aliases to details objects
		 * @returns {boolean}
		 *   Whether grand total values are needed for at least one aggregatable property
		 *
		 * @public
		 */
		hasGrandTotal : function (mAggregate) {
			return Object.keys(mAggregate).some(function (sAlias) {
				return mAggregate[sAlias].grandTotal;
			});
		},

		/**
		 * Tells whether minimum or maximum values are needed for at least one aggregatable
		 * property.
		 *
		 * @param {object} mAggregate
		 *   A map from aggregatable property names/aliases to details objects
		 * @returns {boolean}
		 *   Whether minimum or maximum values are needed for at least one aggregatable
		 *   property
		 *
		 * @public
		 */
		hasMinOrMax : function (mAggregate) {
			return Object.keys(mAggregate).some(function (sAlias) {
				var oDetails = mAggregate[sAlias];

				return oDetails.min || oDetails.max;
			});
		},

		/**
		 * Tells whether the binding with the given aggregation data and filters is affected when
		 * requesting side effects for the given paths.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply}).
		 * @param {sap.ui.model.Filter[]} aFilters
		 *   The binding's current filters
		 * @param {string[]} aSideEffectPaths
		 *   The paths to request side effects for
		 * @returns {boolean}
		 *   <code>true</code> if the binding is affected
		 */
		isAffected : function (oAggregation, aFilters, aSideEffectPaths) {
			// returns true if the side effect path affects the property path
			function affects(sSideEffectPath, sPropertyPath) {
				if (sSideEffectPath.endsWith("/*")) {
					// To avoid metadata access, we do not distinguish between properties and
					// navigation properties, so there is no need to look at "/*".
					sSideEffectPath = sSideEffectPath.slice(0, -2);
				}
				return _Helper.hasPathPrefix(sPropertyPath, sSideEffectPath)
					|| _Helper.hasPathPrefix(sSideEffectPath, sPropertyPath);
			}

			// returns true if the array contains a filter affected by the side effect path
			function hasAffectedFilter(sSideEffectPath, aFilters0) {
				return aFilters0.some(function (oFilter) {
					return oFilter.aFilters
						? hasAffectedFilter(sSideEffectPath, oFilter.aFilters)
						: affects(sSideEffectPath, oFilter.sPath);
				});
			}

			return aSideEffectPaths.some(function (sSideEffectPath) {
				var fnAffects = affects.bind(null, sSideEffectPath);

				return sSideEffectPath === "" || sSideEffectPath === "*"
					|| Object.keys(oAggregation.aggregate).some(function (sAlias) {
							var oDetails = oAggregation.aggregate[sAlias];

							return affects(sSideEffectPath, oDetails.name || sAlias);
						})
					|| Object.keys(oAggregation.group).some(fnAffects)
					|| oAggregation.groupLevels.some(fnAffects)
					|| hasAffectedFilter(sSideEffectPath, aFilters);
			});
		},

		/**
		 * Sets the "@$ui5.node.*" annotations for the given element as indicated and adds
		 * <code>null</code> values for all missing properties.
		 *
		 * @param {object} oElement
		 *   Any node or leaf element
		 * @param {boolean} bIsExpanded
		 *   The new value of "@$ui5.node.isExpanded"
		 * @param {boolean} bIsTotal
		 *   The new value of "@$ui5.node.isTotal"
		 * @param {number} iLevel
		 *   The new value of "@$ui5.node.level"
		 * @param {string[]} aAllProperties
		 *   A list of all properties that might be missing in the given element and thus have to be
		 *   nulled to avoid drill-down errors
		 */
		setAnnotations : function (oElement, bIsExpanded, bIsTotal, iLevel, aAllProperties) {
			oElement["@$ui5.node.isExpanded"] = bIsExpanded;
			oElement["@$ui5.node.isTotal"] = bIsTotal;
			oElement["@$ui5.node.level"] = iLevel;
			// avoid "Failed to drill-down" for missing properties
			aAllProperties.forEach(function (sProperty) {
				if (!(sProperty in oElement)) {
					oElement[sProperty] = null;
				}
			});
		},

		/**
		 * Splits a filter depending on the aggregation information into an array that consists of
		 * two filters, one that must be applied after and one that must be applied before
		 * aggregating the data.
		 *
		 * @param {sap.ui.model.Filter} oFilter
		 *   The filter object that is split
		 * @param {object} [oAggregation]
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply}).
		 * @returns {sap.ui.model.Filter[]}
		 *   An array that consists of two filters, the first one has to be applied after and the
		 *   second one has to be applied before aggregating the data. Both can be
		 *   <code>undefined</code>.
		 */
		splitFilter : function (oFilter, oAggregation) {
			var aFiltersAfterAggregate = [],
				aFiltersBeforeAggregate = [];

			/*
			 * Tells whether the given filter must be applied after aggregating data
			 *
			 * @param {sap.ui.model.Filter} oFilter
			 *   A filter
			 * @returns {boolean}
			 *   Whether the filter must be applied after aggregating
			 */
			function isAfter(oFilter) {
				return oFilter.aFilters
					? oFilter.aFilters.some(isAfter)
					: oFilter.sPath in oAggregation.aggregate;
			}

			/*
			 * Splits the given filter tree along AND operations into filters that must be applied
			 * after and filters that must be applied before aggregating the data.
			 *
			 * @param {sap.ui.model.Filter} oFilter
			 *   A filter
			 */
			function split(oFilter) {
				if (oFilter.aFilters && oFilter.bAnd) {
					oFilter.aFilters.forEach(split);
				} else {
					(isAfter(oFilter) ? aFiltersAfterAggregate : aFiltersBeforeAggregate)
						.push(oFilter);
				}
			}

			/*
			 * Wraps the given filters into a multi-filter concatenated with AND, if needed.
			 *
			 * @param {sap.ui.model.Filter[]} aFilters
			 *   Some filters
			 * @returns {sap.ui.model.Filter}
			 *   A multi-filter, a single filter, or <code>undefined</code>
			 */
			function wrap(aFilters) {
				return aFilters.length > 1 ? new Filter(aFilters, true) : aFilters[0];
			}

			if (!oAggregation || !oAggregation.aggregate) {
				return [oFilter];
			}

			split(oFilter);

			return [wrap(aFiltersAfterAggregate), wrap(aFiltersBeforeAggregate)];
		}
	};

	return _AggregationHelper;
}, /* bExport= */false);
