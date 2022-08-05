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

	var rComma = /,|%2C|%2c/,
		mDataAggregationType = {
			aggregate : {
				"*" : {
					grandTotal : "boolean",
					max : "boolean",
					min : "boolean",
					name : "string",
					subtotals : "boolean",
					unit : "string",
					with : "string"
				}
			},
			"grandTotal like 1.84" : "boolean",
			grandTotalAtBottomOnly : "boolean",
			group : {
				"*" : {
					additionally : ["string"]
				}
			},
			groupLevels : ["string"],
			search : "string",
			subtotalsAtBottomOnly : "boolean"
		},
		// Example: "Texts/Country asc"
		// capture groups: 1 - the property path
		rOrderbyItem = new RegExp("^(" + _Parser.sODataIdentifier
			+ "(?:/" + _Parser.sODataIdentifier + ")*"
			+ ")(?:" + _Parser.sWhitespace + "+(?:asc|desc))?$"),
		mRecursiveHierarchyType = {
			expandTo : /^[1-9]\d*$/, // a positive integer
			hierarchyQualifier : "string"
		},
		/**
		 * Collection of helper methods for data aggregation.
		 *
		 * @alias sap.ui.model.odata.v4.lib._AggregationHelper
		 * @author SAP SE
		 * @private
		 */
		_AggregationHelper;

	/*
	 * Process an aggregatable property including its optional unit.
	 *
	 * @param {object} oAggregation - An object holding the information needed for data aggregation
	 * @param {string[]} aGroupBy - groupby((???),...) content
	 * @param {string[]} aAggregate - aggregate(???) content
	 * @param {boolean} bGrandTotalLike184 - Handle grand totals like 1.84?
	 * @param {string} sAlias - An aggregatable property name/alias
	 * @param {number} i - Index of sAlias in aAliases
	 * @param {string[]} aAliases - Array of all applicable aggregatable property names/aliases
	 * @throws {Error} If "average" or "countdistinct" are used together with grand totals like 1.84
	 */
	function aggregate(oAggregation, aGroupBy, aAggregate, bGrandTotalLike184, sAlias, i,
			aAliases) {
		var oDetails = oAggregation.aggregate[sAlias],
			sAggregate = oDetails.name || sAlias,
			sUnit = oDetails.unit,
			sWith = oDetails.with;

		if (bGrandTotalLike184) {
			if (sWith === "average" || sWith === "countdistinct") {
				throw new Error("Cannot aggregate totals with '" + sWith + "'");
			}
			sAggregate = sAlias;
			sAlias = "UI5grand__" + sAlias;
		}
		if (sWith) {
			sAggregate += " with " + sWith + " as " + sAlias;
		} else if (oDetails.name) {
			sAggregate += " as " + sAlias;
		}
		aAggregate.push(sAggregate);

		if (sUnit && !aAggregate.includes(sUnit) && !aAliases.includes(sUnit, i + 1)
				&& !aGroupBy.includes(sUnit)) {
			aAggregate.push(sUnit);
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
		* @param {string} [oAggregation.hierarchyQualifier]
		*   If present, a recursive hierarchy w/o data aggregation is defined and
		*   {@link _AggregationHelper.buildApply4Hierarchy} is invoked instead.
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
		 * @param {boolean} [mQueryOptions.$$leaves]
		 *   Tells whether the count of leaves is requested; it is removed from the returned map; it
		 *   is turned into an aggregate "$count as UI5__leaves" for the first request
		 * @param {string} [mQueryOptions.$orderby]
		 *   The value for a "$orderby" system query option; it is removed from the returned map and
		 *   turned into an "orderby()" transformation
		 * @param {number} [mQueryOptions.$skip]
		 *   The value for a "$skip" system query option; it is removed from the returned map and
		 *   turned into a "skip()" transformation
		 * @param {number} [mQueryOptions.$top]
		 *   The value for a "$top" system query option; it is removed from the returned map and
		 *   turned into a "top()" transformation
		 * @param {number} [iLevel=0]
		 *   The current level; use <code>0</code> to bypass group levels
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
		 *
		 * @public
		 */
		buildApply : function (oAggregation, mQueryOptions, iLevel, bFollowUp,
				mAlias2MeasureAndMethod) {
			var aAliases,
				sApply = "",
				aGrandTotalAggregate = [], // concat(aggregate(???),.) content for grand totals
				bGrandTotalLike184 = oAggregation["grandTotal like 1.84"],
				aGroupBy,
				bIsLeafLevel,
				sLeaves,
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

			if (oAggregation.hierarchyQualifier) {
				return _AggregationHelper.buildApply4Hierarchy(oAggregation, mQueryOptions);
			}

			mQueryOptions = Object.assign({}, mQueryOptions);
			oAggregation.groupLevels = oAggregation.groupLevels || [];
			bIsLeafLevel = !iLevel || iLevel > oAggregation.groupLevels.length;

			oAggregation.group = oAggregation.group || {};
			oAggregation.groupLevels.forEach(function (sGroup) {
				oAggregation.group[sGroup] = oAggregation.group[sGroup] || {};
			});
			aGroupBy = bIsLeafLevel
				? Object.keys(oAggregation.group).sort().filter(function (sGroup) {
					return !oAggregation.groupLevels.includes(sGroup);
				})
				: [oAggregation.groupLevels[iLevel - 1]];
			if (!iLevel) {
				aGroupBy = oAggregation.groupLevels.concat(aGroupBy);
			}

			oAggregation.aggregate = oAggregation.aggregate || {};
			aAliases = Object.keys(oAggregation.aggregate).sort();
			if (iLevel === 1 && !bFollowUp) {
				aAliases.filter(function (sAlias) {
					return oAggregation.aggregate[sAlias].grandTotal;
				}).forEach(
					aggregate.bind(null, oAggregation, [], aGrandTotalAggregate, bGrandTotalLike184)
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
				aggregate.bind(null, oAggregation, aGroupBy, aSubtotalsAggregate, false)
			);
			if (aSubtotalsAggregate.length) {
				sApply = "aggregate(" + aSubtotalsAggregate.join(",") + ")";
			}

			if (aGroupBy.length) {
				aGroupBy.forEach(function (sGroup) {
					var aAdditionally = oAggregation.group[sGroup].additionally;

					if (aAdditionally) {
						aGroupBy.push.apply(aGroupBy, aAdditionally);
					}
				});
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
			if (bGrandTotalLike184 && aGrandTotalAggregate.length) {
				if (oAggregation.groupLevels.length) {
					throw new Error("Cannot combine visual grouping with grand total");
				}
				sApply += "/concat(aggregate(" + aGrandTotalAggregate.join(",")
					// Note: because of $count=true, aMinMaxAggregate cannot be empty!
					+ "),aggregate(" + aMinMaxAggregate.join(",") + "),"
					+ (sSkipTop || "identity") + ")";
			} else {
				if (aMinMaxAggregate.length) {
					sApply += "/concat(aggregate(" + aMinMaxAggregate.join(",") + "),"
						+ (sSkipTop || "identity") + ")";
				} else if (sSkipTop) {
					sApply += "/" + sSkipTop;
				}
				if (iLevel === 1 && mQueryOptions.$$leaves && !bFollowUp) {
					sLeaves = "groupby(("
						+ Object.keys(oAggregation.group).sort().join(",")
						+ "))/aggregate($count as UI5__leaves)";
				}
				delete mQueryOptions.$$leaves;
				if (aGrandTotalAggregate.length) {
					sApply = "concat(" + (sLeaves ? sLeaves + "," : "") + "aggregate("
						+ aGrandTotalAggregate.join(",") + ")," + sApply + ")";
				} else if (sLeaves) {
					sApply = "concat(" + sLeaves + "," + sApply + ")";
				}
			}
			if (oAggregation.search) {
				sApply = "search(" + oAggregation.search + ")/" + sApply;
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
		 * Builds the value for a "$apply" system query option based on the given data aggregation
		 * information for a recursive hierarchy. If no query options are given, only a symbolic
		 * "$apply" is constructed to avoid timing issues with metadata.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for a recursive hierarchy; see
		 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
		 * @param {object} [mQueryOptions={}]
		 *   A map of key-value pairs representing the query string; it is not modified
		 * @param {string} [mQueryOptions.$filter]
		 *   The value for a "$filter" system query option; it is removed from the returned map and
		 *   turned into the filter expression parameter of an "ancestors()" transformation
		 * @param {string} [mQueryOptions.$orderby]
		 *   The value for a "$orderby" system query option; it is removed from the returned map and
		 *   turned into an "orderby()" transformation for the top levels of nodes
		 * @param {string[]} [mQueryOptions.$select]
		 *   The value for a "$select" system query option; additional technical properties are
		 *   added to the returned copy
		 * @returns {object}
		 *   A map of key-value pairs representing the query string, including a value for the
		 *   "$apply" system query option; it is a modified copy of <code>mQueryOptions</code>, with
		 *   values changed as described above
		 *
		 * @public
		 */
		buildApply4Hierarchy : function (oAggregation, mQueryOptions) {
			var sApply = "",
				sHierarchyQualifier = oAggregation.hierarchyQualifier,
				sPath = oAggregation.$path,
				sNodeProperty = mQueryOptions
					? oAggregation.$fetchMetadata(sPath
						+ "/@Org.OData.Aggregation.V1.RecursiveHierarchy#" + sHierarchyQualifier
						+ "/NodeProperty/$PropertyPath").getResult()
					: "???",
				mRecursiveHierarchy;

			function select(sProperty) {
				if (mQueryOptions.$select) {
					if (!mRecursiveHierarchy) {
						mRecursiveHierarchy = oAggregation.$fetchMetadata(sPath
							+ "/@com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy#"
							+ sHierarchyQualifier).getResult();
					}

					mQueryOptions.$select.push(mRecursiveHierarchy[sProperty].$PropertyPath);
				}
			}

			mQueryOptions = Object.assign({}, mQueryOptions); // shallow clone
			if (mQueryOptions.$select) {
				mQueryOptions.$select = mQueryOptions.$select.slice();
			}

			if (mQueryOptions.$filter) {
				sApply += "ancestors($root" + sPath
					+ "," + sHierarchyQualifier
					+ "," + sNodeProperty
					+ ",filter(" + mQueryOptions.$filter
					+ "),keep start)/";
				delete mQueryOptions.$filter;
			}
			if (mQueryOptions.$$filterBeforeAggregate) { // children of a given parent
				sApply += "descendants($root" + sPath + "," + sHierarchyQualifier
					+ "," + sNodeProperty
					+ ",filter(" + mQueryOptions.$$filterBeforeAggregate + "),1)";
				delete mQueryOptions.$$filterBeforeAggregate;
			} else { // top levels of nodes
				if (mQueryOptions.$orderby) {
					sApply += "orderby(" + mQueryOptions.$orderby + ")/";
					delete mQueryOptions.$orderby;
				}
				sApply += "com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root" + sPath
					+ ",HierarchyQualifier='" + sHierarchyQualifier
					+ "',NodeProperty='" + sNodeProperty
					+ "',Levels=" + (oAggregation.expandTo || 1)
					+ ")";
				if (oAggregation.expandTo > 1) {
					select("DescendantCountProperty");
					select("DistanceFromRootProperty");
				}
			}
			select("DrillStateProperty");
			mQueryOptions.$apply = sApply;

			return mQueryOptions;
		},

		/**
		 * Checks that the given value is of the given type. If <code>vType</code> is a string, then
		 * <code>typeof vValue === vType<code> must hold. If <code>vType</code> is an array (of
		 * length 1!), then <code>vValue</code> must be an array as well and each element is checked
		 * recursively. If <code>vType</code> is an object, then <code>vValue</code> must be an
		 * object (not an array, not <code>null</code>) as well, with a subset of keys, and each
		 * property is checked recursively. If <code>vType</code> is an object with a (single)
		 * property "*", it is deemed a map; in this case <code>vValue</code> must be an object (not
		 * an array, not <code>null</code>) as well, with an arbitrary set of keys, and each
		 * property is checked recursively against the type specified for "*". If <code>vType</code>
		 * is a regular expression, then we {@link RegExp#test test} whether it matches the given
		 * value.
		 *
		 * @param {any} vValue - Any value
		 * @param {string|string[]|RegExp} vType - The expected type
		 * @param {string} [sPath] - The path which lead to the given value
		 * @throws {Error} If the value is not of the given type
		 *
		 * @private
		 */
		checkTypeof : function (vValue, vType, sPath) {
			if (Array.isArray(vType)) {
				if (!Array.isArray(vValue)) {
					throw new Error("Not an array value for '" + sPath + "'");
				}
				vValue.forEach(function (vElement, i) {
					_AggregationHelper.checkTypeof(vElement, vType[0], sPath + "/" + i);
				});
			} else if (vType instanceof RegExp) {
				if (!vType.test(vValue)) {
					throw new Error("Not a matching value for '" + sPath + "'");
				}
			} else if (typeof vType === "object") {
				var bIsMap = "*" in vType;

				if (typeof vValue !== "object" || !vValue || Array.isArray(vValue)) {
					throw new Error("Not an object value for '" + sPath + "'");
				}
				Object.keys(vValue).forEach(function (sKey) {
					if (!bIsMap && !(sKey in vType)) {
						throw new Error("Unsupported property: '" + sPath + "/" + sKey + "'");
					}
					_AggregationHelper.checkTypeof(vValue[sKey], vType[bIsMap ? "*" : sKey],
						sPath + "/" + sKey);
				});
			} else if (typeof vValue !== vType) { // eslint-disable-line valid-typeof
				throw new Error("Not a " + vType + " value for '" + sPath + "'");
			}
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
		 *
		 * @private
		 */
		extractSubtotals : function (oAggregation, oGroupNode, oCollapsed, oExpanded) {
			var iLevel = oGroupNode["@$ui5.node.level"];

			Object.keys(oAggregation.aggregate).forEach(function (sAlias) {
				var oDetails = oAggregation.aggregate[sAlias],
					iIndex,
					sUnit = oDetails.unit;

				if (!oDetails.subtotals) {
					return;
				}

				oCollapsed[sAlias] = oGroupNode[sAlias];
				if (oExpanded) {
					oExpanded[sAlias] = null; // subtotals not shown here
					// Note: no need to remove "<sAlias>@odata.type"
				}
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
		 * Returns a copy of the given query options with a filtered "$orderby".
		 *
		 * @param {object} mQueryOptions
		 *   A map of key-value pairs representing the query string
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply})
		 * @param {number} [iLevel=0]
		 *   The current level; use <code>0</code> to bypass group levels
		 * @returns {object}
		 *   The filtered query options map
		 *
		 * @public
		 * @see .getFilteredOrderby
		 */
		filterOrderby : function (mQueryOptions, oAggregation, iLevel) {
			var sFilteredOrderby = _AggregationHelper.getFilteredOrderby(mQueryOptions.$orderby,
					oAggregation, iLevel);

			mQueryOptions = Object.assign({}, mQueryOptions);
			if (sFilteredOrderby) {
				mQueryOptions.$orderby = sFilteredOrderby;
			} else {
				delete mQueryOptions.$orderby;
			}

			return mQueryOptions;
		},

		/**
		 * Returns an unsorted list of all aggregatable or groupable properties, including units.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply})
		 * @returns {Array<(string|Array<string>)>}
		 *   An unsorted list of all aggregatable or groupable properties, including units and
		 *   additional properties (where paths are given as arrays of segments)
		 *
		 * @public
		 */
		getAllProperties : function (oAggregation) {
			var aAggregates = Object.keys(oAggregation.aggregate),
				aGroups = Object.keys(oAggregation.group),
				aAllProperties = aAggregates.concat(aGroups);

			aAggregates.forEach(function (sAlias) {
				var sUnit = oAggregation.aggregate[sAlias].unit;

				if (sUnit) {
					aAllProperties.push(sUnit);
				}
			});

			aGroups.forEach(function (sGroup) {
				var aAdditionally = oAggregation.group[sGroup].additionally;

				if (aAdditionally) {
					aAdditionally.forEach(function (sAdditionally) {
						aAllProperties.push(sAdditionally.includes("/")
							? sAdditionally.split("/")
							: sAdditionally);
					});
				}
			});

			return aAllProperties;
		},

		/**
		 * Returns the "$orderby" system query option filtered in such a way that only aggregatable
		 * or groupable properties, units, or additionally requested properties are used, provided
		 * they are contained in the given aggregation information and are relevant for the given
		 * level. Items which cannot be parsed (that is, everything more complicated than a simple
		 * path followed by an optional "asc"/"desc") are not filtered out.
		 *
		 * @param {string} [sOrderby]
		 *   The original "$orderby" system query option
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation;
		 *   (see {@link .buildApply})
		 * @param {number} [iLevel=0]
		 *   The current level; use <code>0</code> to bypass group levels
		 * @returns {string|undefined}
		 *   The filtered "$orderby" system query option or <code>undefined</code>
		 *
		 * @private
		 */
		getFilteredOrderby : function (sOrderby, oAggregation, iLevel) {
			var bIsLeaf = !iLevel || iLevel > oAggregation.groupLevels.length;

			/*
			 * Tells whether the given property name is used as a unit for some aggregatable
			 * property with subtotals.
			 *
			 * @param {string} sName - A property name
			 * @returns {boolean} Whether it is used for some aggregatable property with subtotals
			 */
			function isUnitForSubtotals(sName) {
				return Object.keys(oAggregation.aggregate).some(function (sAlias) {
					var oDetails = oAggregation.aggregate[sAlias];

					return oDetails.subtotals && sName === oDetails.unit;
				});
			}

			/*
			 * Tells whether the given property name is used for some leaf group.
			 *
			 * @param {string} sName - A property name
			 * @returns {boolean} Whether it is used for some leaf group
			 */
			function isUsedAtLeaf(sName) {
				if (sName in oAggregation.group
						&& (!iLevel || !oAggregation.groupLevels.includes(sName))) {
					return true; // "quick path"
				}

				return Object.keys(oAggregation.aggregate).some(function (sAlias) {
					return sName === oAggregation.aggregate[sAlias].unit;
				}) || Object.keys(oAggregation.group).some(function (sGroup) {
					return (!iLevel || !oAggregation.groupLevels.includes(sGroup))
						&& isUsedFor(sName, sGroup);
				});
			}

			/*
			 * Tells whether the given property name is used for the given group.
			 *
			 * @param {string} sName - A property name
			 * @param {string} sGroup - A group name
			 * @returns {boolean} Whether it is used for the given group
			 */
			function isUsedFor(sName, sGroup) {
				return sName === sGroup
					|| oAggregation.group[sGroup].additionally
					&& oAggregation.group[sGroup].additionally.includes(sName);
			}

			if (sOrderby) {
				return sOrderby.split(rComma).filter(function (sOrderbyItem) {
					var aMatches = rOrderbyItem.exec(sOrderbyItem),
						sName;

					if (aMatches) {
						sName = aMatches[1]; // drop optional asc/desc
						return sName in oAggregation.aggregate
								&& (bIsLeaf || oAggregation.aggregate[sName].subtotals)
							|| bIsLeaf && isUsedAtLeaf(sName)
							|| !bIsLeaf && (isUsedFor(sName, oAggregation.groupLevels[iLevel - 1])
								|| isUnitForSubtotals(sName));
					}
					return true;
				}).join(",");
			}
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
		 *
		 * @public
		 */
		getOrCreateExpandedObject : function (oAggregation, oGroupNode) {
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
		 * @param {object} [mAggregate]
		 *   A map from aggregatable property names/aliases to details objects
		 * @returns {boolean}
		 *   Whether grand total values are needed for at least one aggregatable property
		 *
		 * @public
		 */
		hasGrandTotal : function (mAggregate) {
			return mAggregate && Object.keys(mAggregate).some(function (sAlias) {
				return mAggregate[sAlias].grandTotal;
			});
		},

		/**
		 * Tells whether minimum or maximum values are needed for at least one aggregatable
		 * property.
		 *
		 * @param {object} [mAggregate]
		 *   A map from aggregatable property names/aliases to details objects
		 * @returns {boolean}
		 *   Whether minimum or maximum values are needed for at least one aggregatable
		 *   property
		 *
		 * @public
		 */
		hasMinOrMax : function (mAggregate) {
			return mAggregate && Object.keys(mAggregate).some(function (sAlias) {
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
		 *
		 * @public
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
		 * Removes any potential "UI5grand__" prefix from the given grand totals.
		 *
		 * @param {object} oGrandTotal - A grand total element
		 */
		removeUI5grand__ : function (oGrandTotal) {
			Object.keys(oGrandTotal).forEach(function (sKey) {
				if (sKey.startsWith("UI5grand__")) {
					oGrandTotal[sKey.slice(10)] = oGrandTotal[sKey];
					delete oGrandTotal[sKey];
				}
			});
		},

		/**
		 * Sets the "@$ui5.node.*" annotations for the given element as indicated and adds
		 * <code>null</code> values for all missing properties.
		 *
		 * @param {object} oElement
		 *   Any node or leaf element
		 * @param {boolean|undefined} [bIsExpanded]
		 *   The new value of "@$ui5.node.isExpanded"
		 * @param {boolean|undefined} [bIsTotal]
		 *   The new value of "@$ui5.node.isTotal"
		 * @param {number} iLevel
		 *   The new value of "@$ui5.node.level"
		 * @param {string[]} [aAllProperties=[]]
		 *   A list of all properties that might be missing in the given element and thus have to be
		 *   nulled to avoid drill-down errors
		 *
		 * @public
		 */
		setAnnotations : function (oElement, bIsExpanded, bIsTotal, iLevel, aAllProperties) {
			_Helper.setAnnotation(oElement, "@$ui5.node.isExpanded", bIsExpanded);
			_Helper.setAnnotation(oElement, "@$ui5.node.isTotal", bIsTotal);
			oElement["@$ui5.node.level"] = iLevel;
			if (aAllProperties) {
				// avoid "Failed to drill-down" for missing properties
				aAllProperties.forEach(function (vProperty) {
					if (Array.isArray(vProperty)) {
						_Helper.createMissing(oElement, vProperty);
					} else if (!(vProperty in oElement)) {
						oElement[vProperty] = null;
					}
				});
			}
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
		 *
		 * @public
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
		},

		/**
		 * Validates the given data aggregation information. If successful, the given path and
		 * function are stored inside that information as <code>$path</code> and
		 * <code>$fetchMetadata</code> respectively.
		 *
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see
		 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
		 * @param {string} sPath
		 *   The list binding's absolute data path
		 * @param {function} fnFetchMetadata
		 *   Function which fetches metadata for a given meta path
		 * @param {boolean} bAutoExpandSelect
		 *   The value of the model's parameter <code>autoExpandSelect</code>
		 * @throws {Error}
		 *   If the given data aggregation object is unsupported, or if a recursive hierarchy is
		 *   requested, but the model does not use the <code>autoExpandSelect</code> parameter.
		 *
		 * @public
		 */
		validateAggregation : function (oAggregation, sPath, fnFetchMetadata, bAutoExpandSelect) {
			if (oAggregation.hierarchyQualifier && !bAutoExpandSelect) {
				throw new Error("Missing parameter autoExpandSelect at model");
			}

			_AggregationHelper.checkTypeof(oAggregation,
				oAggregation.hierarchyQualifier ? mRecursiveHierarchyType : mDataAggregationType,
				"$$aggregation");

			oAggregation.$fetchMetadata = fnFetchMetadata;
			oAggregation.$path = sPath;
		}
	};

	return _AggregationHelper;
}, /* bExport= */false);
