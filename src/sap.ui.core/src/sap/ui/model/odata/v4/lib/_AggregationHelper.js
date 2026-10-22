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
		rPositiveInteger = /^[1-9]\d*$/, // a positive integer
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
			expandTo : rPositiveInteger,
			/** @deprecated As of version 1.89.0 */
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
		sExpandAfterConcatSupported = "/@com.sap.vocabularies.Common.v1.ExpandAfterConcatSupported",
		oFrozenCollapsed = Object.freeze({"@$ui5.node.isExpanded" : false}),
		oFrozenExpanded = Object.freeze({"@$ui5.node.isExpanded" : true}),
		sMultiLevelExpand = "com.sap.vocabularies.Analytics.v1.MultiLevelExpand",
		// Example: "Texts/Country asc"
		// capture groups: 1 - the property path, 2 - optional "asc|desc"
		rOrderbyItem = new RegExp("^(" + _Parser.sODataIdentifier
			+ "(?:/" + _Parser.sODataIdentifier + ")*"
			+ ")(?:" + _Parser.sWhitespace + "+(asc|desc))?$"),
		mRecursiveHierarchyType = {
			createInPlace : true,
			expandTo : rPositiveInteger,
			hierarchyQualifier : "string",
			search : "string"
		},
		sSapHierarchy = "com.sap.vocabularies.Hierarchy.v1.",
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
	 * @param {Set} [oSelect] - Optional set to add aggregate and unit to
	 * @param {string} sAlias - An aggregatable property name/alias
	 * @param {number} i - Index of sAlias in aAliases
	 * @param {string[]} aAliases - Array of all applicable aggregatable property names/aliases
	 * @throws {Error} If "average" or "countdistinct" are used together with grand totals like 1.84
	 */
	function aggregate(oAggregation, aGroupBy, aAggregate, bGrandTotalLike184, oSelect, sAlias, i,
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
		} else { // Note: needed only for "identity" which is incompatible w/ "with ... as"
			oSelect?.add(sAlias);
		}
		aAggregate.push(sAggregate);

		if (sUnit && !aAggregate.includes(sUnit) && !aAliases.includes(sUnit, i + 1)
				&& !aGroupBy.includes(sUnit)) {
			aAggregate.push(sUnit);
			oSelect?.add(sUnit);
		}
	}

	/*
	 * Takes care of the $skip/$top system query options and returns the corresponding
	 * transformation(s).
	 *
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
		 * Before overwriting the given placeholder with the given element, perform some sanity
		 * checks and restore some data from the placeholder to the element.
		 *
		 * @param {object} oPlaceholder - A placeholder
		 * @param {object} oElement - Any node or leaf element
		 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache
		 *   The group level cache which the given element has been read from
		 * @param {number|undefined} [iRank]
		 *   The rank (aka. $skip index) of the given element within the cache's collection, or
		 *   <code>undefined</code> for created elements (where it may be unknown)
		 * @param {string} [sNodeProperty]
		 *   Optional property path to the hierarchy node value
		 * @throws {Error}
		 *   In case an unexpected element or placeholder would be overwritten, or in case of a
		 *   structural change
		 *
		 * @private
		 */
		beforeOverwritePlaceholder : function (oPlaceholder, oElement, oCache, iRank,
				sNodeProperty) {
			var oParent = _Helper.getPrivateAnnotation(oPlaceholder, "parent");

			if (!_Helper.hasPrivateAnnotation(oPlaceholder, "placeholder")) {
				throw new Error("Unexpected element");
			}
			if (oParent !== oCache
				|| _Helper.getPrivateAnnotation(oPlaceholder, "rank") !== iRank
				|| oPlaceholder["@$ui5.node.level"] !== oElement["@$ui5.node.level"]
				// Note: level 0 is used for initial placeholders of 1st level cache in case
				// expandTo > 1
				&& oPlaceholder["@$ui5.node.level"] !== 0) {
				throw new Error("Wrong placeholder");
			}
			["descendants", "predicate"].forEach(function (sAnnotation) {
				if (_Helper.hasPrivateAnnotation(oPlaceholder, sAnnotation)
					&& _Helper.getPrivateAnnotation(oPlaceholder, sAnnotation)
						!== _Helper.getPrivateAnnotation(oElement, sAnnotation)) {
					throw new Error("Unexpected structural change: " + sAnnotation);
				}
			});
			if (sNodeProperty) {
				_AggregationHelper.checkNodeProperty(oPlaceholder, oElement, sNodeProperty);
			}

			if (_Helper.getPrivateAnnotation(oPlaceholder, "placeholder") === 1) {
				if ((oPlaceholder["@$ui5.node.isExpanded"] === undefined)
						!== (oElement["@$ui5.node.isExpanded"] === undefined)) {
					throw new Error("Not a leaf anymore (or vice versa)");
				}
				if (oPlaceholder["@$ui5.node.isExpanded"] !== undefined) {
					// restore previous expansion state
					oElement["@$ui5.node.isExpanded"] = oPlaceholder["@$ui5.node.isExpanded"];
				}
			}
			_Helper.copyPrivateAnnotation(oPlaceholder, "cache", oElement);
			_Helper.copyPrivateAnnotation(oPlaceholder, "context", oElement);
			_Helper.copyPrivateAnnotation(oPlaceholder, "spliced", oElement);
			if ("@$ui5.context.isTransient" in oPlaceholder) {
				oElement["@$ui5.context.isTransient"] = false;
			}
		},

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
		 * If the leaf level represents single entity instances (not aggregated data), an "identity"
		 * transformation is used instead of "groupby((...),aggregate(...))". Unless "concat()" is
		 * needed, "$apply" can be avoided altogether in favor of plain system query options.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see
		 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}. The properties
		 *   "aggregate", "group", "groupLevels", and "expandTo" are normalized if applicable!
		 * @param {function} oAggregation.$fetchMetadata
		 *   Function which fetches metadata for a given meta path
		 * @param {number} [oAggregation.expandTo=1]
		 *   The number (as a positive integer) of different levels initially available
		 * @param {string} [oAggregation.hierarchyQualifier]
		 *   If present, a recursive hierarchy w/o data aggregation is defined and
		 *   {@link _AggregationHelper.buildApply4Hierarchy} is invoked instead.
		 * @param {string} [oAggregation.search]
		 *   Like the value for a "$search" system query option (remember ODATA-1452); it is turned
		 *   either into a "search()" transformation or into the search expression parameter of an
		 *   "ancestors()" transformation
		 * @param {object} [mQueryOptions={}]
		 *   A read-only map of key-value pairs representing the query string
		 * @param {boolean} [mQueryOptions.$count]
		 *   The value for a "$count" system query option; it is removed from the returned map for a
		 *   follow-up request or in case it is turned into an aggregate "$count as UI5__count"
		 * @param {string} [mQueryOptions.$filter]
		 *   The value for a "$filter" system query option; it is removed from the returned map and
		 *   turned into a "filter()" transformation. MUST NOT be combined with "identity"!
		 * @param {string} [mQueryOptions.$$filterBeforeAggregate]
		 *   The value for a filter which is applied before the aggregation; it is removed from the
		 *   returned map and turned into a "filter()" transformation
		 * @param {string} [mQueryOptions.$$filterOnAggregate]
		 *   The value for a filter which is applied on aggregates and thus contains the special
		 *   syntax "$these/aggregate(...)"; it is removed from the returned map and turned into a
		 *   "groupby((...),filter(...)" transformation. MUST NOT be combined with "identity"!
		 * @param {boolean} [mQueryOptions.$$leaves]
		 *   Tells whether the count of leaves is requested; it is removed from the returned map; it
		 *   is turned into an aggregate "$count as UI5__leaves" for the first request. MUST NOT be
		 *   combined with "identity"!
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
		 *   The current level; use <code>0</code> to bypass group levels; use <code>-1</code> to
		 *   build the apply expression for grand totals only (only the query option
		 *   "$$filterBeforeAggregate" is used, all other system or internal query options are
		 *   discarded)
		 * @param {boolean} [bFollowUp=false]
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
		 *   <code>mQueryOptions</code>, with values removed as described above and
		 *   "$$applyWithSelect" added as either <code>false</code> (which means that "$apply" must
		 *   not be combined with "$expand" and "$select" at all) or a sorted <code>string[]</code>
		 *   containing all property names which need to be added to "$select" later on (while
		 *   keeping "$expand" as is)
		 * @throws {Error}
		 *   If the given data aggregation object is unsupported, or if the preconditions for an
		 *   "identity" transformation hold (see above) while <code>mQueryOptions</code> contains an
		 *    option which cannot be combined (see above)
		 *
		 * @public
		 */
		buildApply : function (oAggregation, mQueryOptions, iLevel = 0, bFollowUp = false,
				mAlias2MeasureAndMethod = undefined) {
			var oSelect = new Set(),
				aAliases,
				sApply = "",
				iExpandTo = oAggregation.expandTo,
				aGrandTotalAggregate = [], // concat(aggregate(???),.) content for grand totals
				bGrandTotalLike184 = oAggregation["grandTotal like 1.84"],
				aGroupBy,
				sLeaves,
				aMinMaxAggregate = [], // concat(aggregate(???),.) content for min/max or count
				sSkipTop,
				aSortedGroups,
				aSubtotalsAggregate = [], // groupby(.,aggregate(???)) content for subtotals/leaves
				bUseIdentity,
				bUseLeafLevel,
				bUseMultiLevelExpand = iExpandTo && iLevel > 0;

			/*
			 * Appends the given transformation part to the current $apply expression.
			 *
			 * @param {string} sPart - A part to be added to the end of the current $apply
			 */
			function append(sPart) {
				sApply = sApply ? sApply + "/" + sPart : sPart;
			}

			/*
			 * Returns a read-only list of paths, sorted and w/o duplicates, which need to be added
			 * to "$select" later on.
			 *
			 * @returns {string[]} Read-only list of paths, sorted and w/o duplicates
			 *
			 * @see sap.ui.model.odata.v4.lib._Helper.getJoinedPaths
			 */
			function getApplyWithSelect() {
				return Object.freeze(Array.from(oSelect).sort());
			}

			/*
			 * Returns whether the "ExpandAfterConcatSupported" annotation is set.
			 *
			 * @returns {boolean} Whether the "ExpandAfterConcatSupported" annotation is set
			 */
			function isExpandAfterConcatSupported() {
				return oAggregation.$fetchMetadata(sExpandAfterConcatSupported).getResult();
			}

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
					oSelect.add(sAlias);

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
				return _AggregationHelper
					.buildApply4Hierarchy(oAggregation, mQueryOptions, !iLevel);
			}

			if (bGrandTotalLike184 && iExpandTo) {
				throw new Error("Cannot combine 'grandTotal like 1.84' with 'expandTo'");
			}

			mQueryOptions = Object.assign({}, mQueryOptions);
			oAggregation.aggregate ??= {};
			aAliases = Object.keys(oAggregation.aggregate).sort();
			if (iLevel < 0 || iLevel === 1 && !bFollowUp) {
				aAliases.filter(function (sAlias) {
					return oAggregation.aggregate[sAlias].grandTotal;
				}).forEach(aggregate.bind(null,
					oAggregation, [], aGrandTotalAggregate, bGrandTotalLike184,
					// Note: no oSelect needed here! w/ bUseIdentity, bIsLeafLevel is true
					// and thus all aggregates are (also) handled below
					/*oSelect*/null));
			}
			if (iLevel < 0) { // grand totals only
				if (!aGrandTotalAggregate.length) {
					throw new Error("No grand total aggregate found");
				}
				sApply = "aggregate(" + aGrandTotalAggregate.join(",") + ")";
				if (oAggregation.search) {
					sApply = "search(" + oAggregation.search + ")/" + sApply;
				}
				if (mQueryOptions.$$filterBeforeAggregate) {
					sApply = "filter(" + mQueryOptions.$$filterBeforeAggregate + ")/" + sApply;
				}
				// discard all other system and internal query options for grand totals
				for (const sKey in mQueryOptions) {
					if (sKey[0] === "$") {
						delete mQueryOptions[sKey];
					}
				}
				mQueryOptions.$apply = sApply;
				mQueryOptions.$$applyWithSelect = false;

				return mQueryOptions;
			}

			oAggregation.groupLevels ??= [];
			oAggregation.group ??= {};
			oAggregation.groupLevels.forEach(function (sGroup) {
				oAggregation.group[sGroup] ??= {};
			});
			aSortedGroups = Object.keys(oAggregation.group).sort();
			if (aSortedGroups.length === oAggregation.groupLevels.length) {
				// no other groups than those in groupLevels
				oAggregation.groupLevels.pop();
			}

			bUseLeafLevel = bUseMultiLevelExpand || !iLevel
				|| iLevel > oAggregation.groupLevels.length;
			bUseIdentity = bUseLeafLevel && !bGrandTotalLike184 && iLevel >= 0
				&& !!oAggregation.$autoExpandSelect && oAggregation.$leafLevelAggregated === false
				&& !aAliases.some((sAlias) => oAggregation.aggregate[sAlias].name);
			aGroupBy = bUseLeafLevel
				? aSortedGroups.filter(function (sGroup) {
					return !oAggregation.groupLevels.includes(sGroup);
				})
				: [oAggregation.groupLevels[iLevel - 1]];
			if (!iLevel || bUseIdentity || bUseMultiLevelExpand) {
				// Note: group levels are in front, in original order, followed by leaf level
				aGroupBy = oAggregation.groupLevels.concat(aGroupBy);
				// Note: bUseIdentity cannot be reset below due to "ExpandAfterConcatSupported"
				// because with visual grouping, there is no need for "concat" on leaf level (and
				// no $apply is used at all)!
			}
			if (aGroupBy.length) {
				aGroupBy.forEach(function (sGroup) {
					var aAdditionally = oAggregation.group[sGroup].additionally;

					if (aAdditionally && !bUseMultiLevelExpand) {
						// Note: addt'l properties intentionally at end
						aGroupBy.push.apply(aGroupBy, aAdditionally);
					}
					oSelect.add(sGroup);
				});
			}

			if (!bFollowUp) {
				aAliases.forEach(function (sAlias) {
					processMinOrMax(sAlias, "min");
					processMinOrMax(sAlias, "max");
				});
			}
			aAliases.filter(function (sAlias) {
				return bUseLeafLevel || oAggregation.aggregate[sAlias].subtotals;
			}).forEach(aggregate.bind(null,
				oAggregation, aGroupBy, aSubtotalsAggregate, false, oSelect));

			if (bUseMultiLevelExpand) {
				if (mQueryOptions.$filter) {
					throw new Error("Cannot combine '$filter' query option with 'expandTo'");
				}
				sApply = sMultiLevelExpand + "(LevelProperties=";
				const aLevelProperties = aGroupBy.map((sGroup) => ({
					DimensionProperties : [sGroup],
					AdditionalProperties : oAggregation.group[sGroup].additionally?.toSorted() ?? []
				}));
				sApply += JSON.stringify(aLevelProperties);
				sApply += ",Aggregation=";
				sApply += JSON.stringify(aSubtotalsAggregate);
				sApply += ",SiblingOrder=";
				const aSiblingOrder = mQueryOptions.$orderby?.split(rComma)
					.map((sOrderbyItem) => {
						const aMatches = rOrderbyItem.exec(sOrderbyItem);
						if (!aMatches) {
							throw new Error(`Unsupported $orderby item: "${sOrderbyItem}"`);
						}
						return {
							Property : aMatches[1],
							Descending : aMatches[2] === "desc"
						};
					}) ?? [];
				sApply += JSON.stringify(aSiblingOrder);
				delete mQueryOptions.$orderby;
				if (iExpandTo < Number.MAX_SAFE_INTEGER) {
					sApply += ",Levels=";
					sApply += iExpandTo;
				}
				if (oAggregation.$ExpandLevels) {
					sApply += ",ExpandLevels=";
					sApply += oAggregation.$ExpandLevels;
				}
				if (aSubtotalsAggregate.length
						&& oAggregation.subtotalsAtBottomOnly !== undefined) {
					sApply += ",SubtotalsAtBottom=true";
				}
				sApply += ")";
			} else {
				if (aSubtotalsAggregate.length) {
					sApply = "aggregate(" + aSubtotalsAggregate.join(",") + ")";
				}

				if (bUseIdentity) {
					for (const sOption of ["$filter", "$$filterOnAggregate", "$$leaves"]) {
						if (mQueryOptions[sOption]) {
							throw new Error("Cannot combine identity with " + sOption);
						}
					}
					if (iLevel > 1 || !aMinMaxAggregate.length && !aGrandTotalAggregate.length) {
						// no $apply needed, just plain system query options
						delete mQueryOptions.$apply;
						if (bFollowUp) {
							delete mQueryOptions.$count;
						}
						if (oAggregation.search) {
							mQueryOptions.$search = oAggregation.search;
						}
						if (mQueryOptions.$$filterBeforeAggregate) {
							mQueryOptions.$filter = mQueryOptions.$$filterBeforeAggregate;
							delete mQueryOptions.$$filterBeforeAggregate;
						}
						// needed to enhance $select
						mQueryOptions.$$applyWithSelect = getApplyWithSelect();

						return mQueryOptions;
					}

					if (!isExpandAfterConcatSupported()) {
						bUseIdentity = false; // identity below would be inside concat, avoid!
					}
				}

				if (aGroupBy.length) {
					if (bUseIdentity) {
						sApply = ""; // identity; override aSubtotalsAggregate
					} else {
						sApply = "groupby((" + aGroupBy.join(",")
							+ (sApply ? ")," + sApply + ")" : "))");
					}
				}

				if (mQueryOptions.$filter) { // filter after aggregation
					sApply += "/filter(" + mQueryOptions.$filter + ")";
					delete mQueryOptions.$filter;
				}
				if (mQueryOptions.$orderby) {
					append("orderby(" + mQueryOptions.$orderby + ")");
					delete mQueryOptions.$orderby;
				}
			}

			if (bFollowUp) {
				delete mQueryOptions.$count;
			} else if (mQueryOptions.$count) {
				aMinMaxAggregate.push("$count as UI5__count");
				oSelect.add("UI5__count");
				delete mQueryOptions.$count;
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
				let bConcatUsed = false;
				if (aMinMaxAggregate.length) {
					append("concat(aggregate(" + aMinMaxAggregate.join(",") + "),"
						+ (sSkipTop || "identity") + ")");
					bConcatUsed = true;
				} else if (sSkipTop) {
					append(sSkipTop);
				}
				if (iLevel === 1 && mQueryOptions.$$leaves && !bFollowUp) {
					sLeaves = "groupby((" + aSortedGroups.join(",")
						+ "))/aggregate($count as UI5__leaves)";
				}
				delete mQueryOptions.$$leaves;
				if (aGrandTotalAggregate.length) {
					sApply = "concat(" + (sLeaves ? sLeaves + "," : "") + "aggregate("
						+ aGrandTotalAggregate.join(",") + ")," + (sApply || "identity") + ")";
					bConcatUsed = true;
				} else if (sLeaves) {
					sApply = "concat(" + sLeaves + "," + sApply + ")";
					bConcatUsed = true;
				}
				if (bConcatUsed && bUseIdentity && !isExpandAfterConcatSupported()) {
					bUseIdentity = false;
				}
			}
			if (mQueryOptions.$$filterOnAggregate) {
				sApply = "groupby((" + aSortedGroups.join(",") + "),filter("
					+ mQueryOptions.$$filterOnAggregate + "))/" + sApply;
				delete mQueryOptions.$$filterOnAggregate;
			}
			if (oAggregation.search) {
				sApply = "search(" + oAggregation.search + ")/" + sApply;
			}
			if (mQueryOptions.$$filterBeforeAggregate) {
				sApply = "filter(" + mQueryOptions.$$filterBeforeAggregate + ")/" + sApply;
				delete mQueryOptions.$$filterBeforeAggregate;
			}
			if (sApply) {
				// allow to combine w/ $expand/$select?
				mQueryOptions.$$applyWithSelect = bUseIdentity && getApplyWithSelect();
				mQueryOptions.$apply = sApply;
			}

			return mQueryOptions;
		},

		/**
		 * Builds the value for a "$apply" system query option based on the given data aggregation
		 * information for a recursive hierarchy. If no query options are given, only a symbolic
		 * "$apply" is constructed to avoid timing issues with metadata. The paths for
		 * DistanceFromRoot, DrillState, LimitedDescendantCount, LimitedRank, NodeProperty, and
		 * ParentNavigationProperty are stored at <code>oAggregation</code> using a "$" prefix (if
		 * not already stored). The "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyActions"
		 * annotation is stored as "$Actions". "expandTo" is normalized.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for a recursive hierarchy; see
		 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}. The property
		 *   "expandTo" is normalized if applicable!
		 * @param {function} [oAggregation.$fetchMetadata]
		 *   Function which fetches metadata for a given meta path - NOT always available!
		 * @param {string} [oAggregation.$metaPath]
		 *   Meta path as set by {@link #setPath}
		 * @param {string} [oAggregation.$path]
		 *   Data path as set by {@link #setPath}
		 * @param {number} [oAggregation.expandTo=1]
		 *   The number (as a positive integer) of different levels initially available
		 * @param {string} [oAggregation.hierarchyQualifier]
		 *   The qualifier for the pair of "Org.OData.Aggregation.V1.RecursiveHierarchy" and
		 *   "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy" annotations
		 * @param {string} [oAggregation.search]
		 *   Like the value for a "$search" system query option (remember ODATA-1452); it is turned
		 *   into the search expression parameter of an "ancestors()" transformation
		 * @param {object} [mQueryOptions={}]
		 *   A read-only map of key-value pairs representing the query string
		 * @param {string} [mQueryOptions.$$filterBeforeAggregate]
		 *   The value for a filter which identifies a parent node; it is removed from the returned
		 *   map and turned into a "filter()" transformation
		 * @param {string} [mQueryOptions.$filter]
		 *   The value for a "$filter" system query option; it is removed from the returned map and
		 *   turned into the filter expression parameter of an "ancestors()" transformation
		 * @param {string} [mQueryOptions.$orderby]
		 *   The value for a "$orderby" system query option; it is removed from the returned map and
		 *   turned into an "orderby()" transformation
		 * @param {string[]} [mQueryOptions.$select]
		 *   The value for a "$select" system query option; additional technical properties
		 *   including NodeProperty ("the hierarchy node value") are added to the returned copy
		 * @param {boolean} [bAllLevels]
		 *   Whether to expand all levels
		 * @returns {object}
		 *   A map of key-value pairs representing the query string, including a value for the
		 *   "$apply" system query option; it is a modified copy of <code>mQueryOptions</code>, with
		 *   values changed as described above
		 *
		 * @public
		 */
		buildApply4Hierarchy : function (oAggregation, mQueryOptions, bAllLevels) {
			let mRecursiveHierarchy; // cache it on 1st access

			function select(sProperty) {
				if (mQueryOptions.$select) {
					let sPropertyPath = oAggregation["$" + sProperty];
					if (!sPropertyPath) {
						mRecursiveHierarchy ??= oAggregation.$fetchMetadata(oAggregation.$metaPath
								+ "/@" + sSapHierarchy + "RecursiveHierarchy#"
								+ oAggregation.hierarchyQualifier
							).getResult();

						sPropertyPath = oAggregation["$" + sProperty]
							= mRecursiveHierarchy[sProperty + "Property"]?.$PropertyPath
							?? mRecursiveHierarchy[sProperty]?.$Path;
					}
					mQueryOptions.$select.push(sPropertyPath);
				}
			}

			let sNodeProperty = oAggregation.$NodeProperty;
			if (!sNodeProperty) {
				sNodeProperty = "???";
				if (mQueryOptions) {
					const oSyncPromise = oAggregation.$fetchMetadata(oAggregation.$metaPath
						+ "/@Org.OData.Aggregation.V1.RecursiveHierarchy#"
						+ oAggregation.hierarchyQualifier);
					if (oSyncPromise.isFulfilled()) {
						sNodeProperty = oAggregation.$NodeProperty
							= oSyncPromise.getResult().NodeProperty.$PropertyPath;
						oAggregation.$ParentNavigationProperty = oSyncPromise.getResult()
							.ParentNavigationProperty.$NavigationPropertyPath;
					}
				}
			}

			mQueryOptions = Object.assign({}, mQueryOptions); // shallow clone
			if (mQueryOptions.$select) {
				mQueryOptions.$select = mQueryOptions.$select.slice();
				if (!mQueryOptions.$select.includes(sNodeProperty)) {
					mQueryOptions.$select.push(sNodeProperty);
				}
				oAggregation.$Actions ??= oAggregation.$fetchMetadata(
						oAggregation.$metaPath + "/@" + sSapHierarchy
						+ "RecursiveHierarchyActions#" + oAggregation.hierarchyQualifier
					).getResult();
			}

			let sApply = "";
			if (mQueryOptions.$filter || oAggregation.search) {
				let sSeparator = "";
				if (mQueryOptions.$filter) {
					sApply = "filter(" + mQueryOptions.$filter;
					sSeparator = ")/";
					delete mQueryOptions.$filter;
				}
				if (oAggregation.search) {
					sApply += sSeparator + "search(" + oAggregation.search;
				}
				sApply = "ancestors($root" + oAggregation.$path
					+ "," + oAggregation.hierarchyQualifier
					+ "," + sNodeProperty
					+ "," + sApply
					+ "),keep start)/";
			}
			if (mQueryOptions.$$filterBeforeAggregate) { // children of a given parent
				sApply += "descendants($root" + oAggregation.$path
					+ "," + oAggregation.hierarchyQualifier + "," + sNodeProperty
					+ ",filter(" + mQueryOptions.$$filterBeforeAggregate
					+ (bAllLevels ? "))" : "),1)");
				delete mQueryOptions.$$filterBeforeAggregate;
				if (mQueryOptions.$orderby) {
					sApply += "/orderby(" + mQueryOptions.$orderby + ")";
					delete mQueryOptions.$orderby;
				}
			} else { // top levels of nodes
				if (mQueryOptions.$orderby) {
					sApply += "orderby(" + mQueryOptions.$orderby + ")/";
					delete mQueryOptions.$orderby;
				}
				oAggregation.expandTo ??= 1;
				if (oAggregation.expandTo > Number.MAX_SAFE_INTEGER) { // normalization
					oAggregation.expandTo = Number.MAX_SAFE_INTEGER;
				}
				const sExpandLevels = !bAllLevels && oAggregation.$ExpandLevels;
				sApply += sSapHierarchy + "TopLevels(HierarchyNodes=$root"
					+ (oAggregation.$path || "")
					+ ",HierarchyQualifier='" + oAggregation.hierarchyQualifier
					+ "',NodeProperty='" + sNodeProperty + "'"
					+ (bAllLevels || oAggregation.expandTo >= Number.MAX_SAFE_INTEGER
						? "" // "all levels"
						: ",Levels=" + oAggregation.expandTo)
					+ (sExpandLevels ? ",ExpandLevels=" + sExpandLevels : "")
					+ ")";
				if (bAllLevels) {
					select("DistanceFromRoot");
				} else if (oAggregation.expandTo > 1 || sExpandLevels) {
					select("DistanceFromRoot");
					select("LimitedDescendantCount");
				}
			}
			select("DrillState");
			if (mRecursiveHierarchy && !oAggregation.$LimitedRank) {
				oAggregation.$LimitedRank = mRecursiveHierarchy.LimitedRank?.$Path
					?? oAggregation.$DrillState.slice(0,
							oAggregation.$DrillState.lastIndexOf("/") + 1)
						+ "LimitedRank";
			}
			mQueryOptions.$apply = sApply;

			return mQueryOptions;
		},

		/**
		 * Checks that the NodeProperty ("the hierarchy node value") has not changed (if available).
		 *
		 * @param {object} oOld
		 *   The old node object
		 * @param {object} oNew
		 *   The new node object
		 * @param {string} sNodeProperty
		 *   The path to the property which provides the hierarchy node value
		 * @param {boolean} [bMandatory]
		 *   Whether a hierarchy node value is mandatory for the old node object (else it may be
		 *   missing because old node object is just a placeholder)
		 * @throws {Error} In case of a structural change
		 */
		checkNodeProperty : function (oOld, oNew, sNodeProperty, bMandatory) {
			var vNewNodeID = _Helper.drillDown(oNew, sNodeProperty),
				vOldNodeID = _Helper.drillDown(oOld, sNodeProperty);

			if ((bMandatory || vOldNodeID !== undefined) && vNewNodeID !== undefined
					 && vOldNodeID !== vNewNodeID) {
				throw new Error("Unexpected structural change: " + sNodeProperty
					+ " from " + JSON.stringify(vOldNodeID)
					+ " to " + JSON.stringify(vNewNodeID));
			}
		},

		/**
		 * Checks that the given value is of the given type. If <code>vType</code> is a string, then
		 * <code>typeof vValue === vType</code> must hold. If <code>vType</code> is an array (of
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
				const bIsMap = "*" in vType;

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
			} else if (vType === true) {
				if (vValue !== true) {
					throw new Error("Not a true value for '" + sPath + "'");
				}
			} else if (typeof vValue !== vType) { // eslint-disable-line valid-typeof
				throw new Error("Not a " + vType + " value for '" + sPath + "'");
			}
		},

		/**
		 * Creates a placeholder.
		 *
		 * A placeholder is recognized by the private annotation "placeholder" which may have the
		 * following values:
		 * <ul>
		 *   <li> <code>true</code>: an initial placeholder as created by this function
		 *   <li> <code>1</code>: A placeholder converted back from a node in
		 *     {@link sap.ui.model.odata.v4.lib._AggregationCache#turnIntoPlaceholder}
		 * </ul>
		 *
		 * @param {number} iLevel - The level
		 * @param {number|undefined} [iRank]
		 *   The rank (aka. $skip index) within the parent cache's collection, or
		 *   <code>undefined</code> for created elements (where it may be unknown)
		 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oParentCache - The parent cache
		 * @returns {object} A placeholder object
		 *
		 * @public
		 */
		createPlaceholder : function (iLevel, iRank, oParentCache) {
			var oPlaceholder = {"@$ui5.node.level" : iLevel};

			_Helper.setPrivateAnnotation(oPlaceholder, "parent", oParentCache);
			_Helper.setPrivateAnnotation(oPlaceholder, "placeholder", true);
			_Helper.setPrivateAnnotation(oPlaceholder, "rank", iRank);

			return oPlaceholder;
		},

		/**
		 * Drops all aggregates and their units from the given element which are not used for
		 * subtotals.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation but no recursive
		 *   hierarchy; see {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
		 * @param {object} oElement
		 *   The element to drop aggregates without subtotals from
		 * @param {Set<string>} oUsedSubtotalUnits
		 *   A set of unit names which are used by subtotals
		 */
		dropAggregatesWithoutSubtotals : function (oAggregation, oElement, oUsedSubtotalUnits) {
			for (const sAlias in oAggregation.aggregate) {
				const oAggregate = oAggregation.aggregate[sAlias];
				if (!oAggregate.subtotals) {
					delete oElement[sAlias];
					const sUnit = oAggregate.unit;
					if (!oUsedSubtotalUnits.has(sUnit)) {
						delete oElement[sUnit];
					}
				}
			}
		},

		/**
		 * Drops filter, search, and other stuff from the given query options and recursive
		 * hierarchy information, then adds the corresponding "$apply" system query option.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for a recursive hierarchy; see
		 *   {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
		 * @param {string} [oAggregation.search] - Ignored
		 * @param {object} mQueryOptions
		 *   A read-only map of key-value pairs representing the query string
		 * @param {string} [mQueryOptions.$$filterBeforeAggregate] - Removed from the returned map
		 * @param {string} [mQueryOptions.$apply] - Replaced in the returned map
		 * @param {string} [mQueryOptions.$count] - Removed from the returned map
		 * @param {string} [mQueryOptions.$expand] - Removed from the returned map
		 * @param {string} [mQueryOptions.$filter] - Removed from the returned map
		 * @param {string} [mQueryOptions.$orderby] - Removed from the returned map
		 * @param {string} [mQueryOptions.$select] - Removed from the returned map
		 * @param {string} [sFilterBeforeAggregate]
		 *   The value for a filter which identifies a parent node; see
		 *   {@link #buildApply4Hierarchy}
		 * @returns {object}
		 *   A map of key-value pairs representing the query string, including a value for the
		 *   "$apply" system query option; it is a modified copy of <code>mQueryOptions</code>, with
		 *   values changed as described above
		 */
		dropFilter : function (oAggregation, mQueryOptions, sFilterBeforeAggregate) {
			oAggregation = {...oAggregation};
			delete oAggregation.search;

			mQueryOptions = {...mQueryOptions};
			delete mQueryOptions.$count;
			delete mQueryOptions.$expand;
			delete mQueryOptions.$filter;
			delete mQueryOptions.$orderby;
			delete mQueryOptions.$select;
			if (sFilterBeforeAggregate) {
				mQueryOptions.$$filterBeforeAggregate = sFilterBeforeAggregate;
			} else {
				delete mQueryOptions.$$filterBeforeAggregate;
			}

			return _AggregationHelper.buildApply4Hierarchy(oAggregation, mQueryOptions);
		},

		/**
		 * Extract subtotals and their units from the given group node, so that they can be used
		 * for an extra row showing subtotals at the bottom and also to restore them when
		 * collapsing. If requested, adds corresponding <code>null</code> updates for expansion.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
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
		 *   A read-only map of key-value pairs representing the query string
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
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
		 * Finds the index of the previous sibling within the given list of elements (which is meant
		 * to contain different levels), starting from an original node at the given index.
		 *
		 * @param {object[]} aElements - A list of elements with possible holes
		 * @param {number} iIndex - The original node's index within list of elements
		 * @returns {number}
		 *   The previous sibling's index, or -1 if there is no previous sibling for sure, or
		 *   <code>undefined</code> if we cannot tell
		 *
		 * @public
		 */
		findPreviousSiblingIndex : function (aElements, iIndex) {
			let bHole;
			const iLevel = aElements[iIndex]["@$ui5.node.level"];
			for (let iSibling = iIndex - 1; iSibling >= 0; iSibling -= 1) {
				const oCandidate = aElements[iSibling];
				if (!oCandidate) {
					bHole = true;
					continue; // skip holes
				}
				if (oCandidate["@$ui5.node.level"] < iLevel) {
					break; // sibling missed or no such sibling
				}
				if (oCandidate["@$ui5.node.level"] > iLevel) {
					continue; // ignore descendants
				}
				// else: same level
				if (iSibling + _Helper.getPrivateAnnotation(oCandidate, "descendants", 0)
						=== iIndex - 1) {
					return iSibling; // sibling found
				}
				break; // sibling missed (implies bHole)
			}

			return bHole ? undefined : -1;
		},

		/**
		 * Returns an unsorted list of all aggregatable or groupable properties, including units.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {object} [mQueryOptions]
		 *   An optional read-only map of key-value pairs representing the query string
		 * @param {string[]} [mQueryOptions.$select]
		 *   Optional array of paths
		 * @param {boolean} [bLeaf]
		 *   Whether we are targeting the aggregation's leaf level; if we do and it represents
		 *   single entity instances rather than aggregated data, <code>mQueryOptions.$select</code>
		 *   is ignored in order not to prevent late property requests by setting
		 *   <code>"...@$ui5.noData" : true</code> later on
		 * @returns {Array<(string|Array<string>)>}
		 *   An unsorted list of all aggregatable or groupable properties, including units and
		 *   additional properties (where paths are given as arrays of segments)
		 *
		 * @public
		 */
		getAllProperties : function (oAggregation, mQueryOptions, bLeaf) {
			var aAggregates = Object.keys(oAggregation.aggregate),
				aGroups = Object.keys(oAggregation.group),
				aAllProperties = aAggregates.concat(aGroups);

			function push(sPath) {
				aAllProperties.push(sPath.includes("/") ? sPath.split("/") : sPath);
			}

			aAggregates.forEach(function (sAlias) {
				var sUnit = oAggregation.aggregate[sAlias].unit;

				if (sUnit) {
					aAllProperties.push(sUnit);
				}
			});

			aGroups.forEach(function (sGroup) {
				oAggregation.group[sGroup].additionally?.forEach(push);
			});

			if (!bLeaf || oAggregation.$leafLevelAggregated) {
				mQueryOptions?.$select?.forEach(push);
			}

			return aAllProperties;
		},

		/**
		 * Gets an object with property updates to be applied when collapsing the given group node.
		 *
		 * @param {object} oGroupNode
		 *   The group node which is about to be expanded
		 * @returns {object}
		 *   An object with property updates to be applied when collapsing the given group node
		 *
		 * @public
		 * @see .getOrCreateExpandedObject
		 */
		getCollapsedObject : function (oGroupNode) {
			return _Helper.getPrivateAnnotation(oGroupNode, "collapsed", oFrozenCollapsed);
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
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
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
					|| oAggregation.group[sGroup].additionally?.includes(sName);
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
		 * when collapsing the node again, if needed. Takes placement of subtotals into account.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {object} oGroupNode
		 *   The group node which is about to be expanded
		 * @returns {object}
		 *   An object with property updates to be applied when expanding the given group node
		 *
		 * @public
		 * @see .getCollapsedObject
		 */
		getOrCreateExpandedObject : function (oAggregation, oGroupNode) {
			var oCollapsed, oExpanded;

			if (oAggregation.subtotalsAtBottomOnly === undefined) { // "top only"
				return oFrozenExpanded;
			}

			oExpanded = _Helper.getPrivateAnnotation(oGroupNode, "expanded");
			if (!oExpanded) {
				oCollapsed = {"@$ui5.node.isExpanded" : false};
				_Helper.setPrivateAnnotation(oGroupNode, "collapsed", oCollapsed);
				oExpanded = {"@$ui5.node.isExpanded" : true};
				_Helper.setPrivateAnnotation(oGroupNode, "expanded", oExpanded);
				_AggregationHelper.extractSubtotals(oAggregation, oGroupNode, oCollapsed,
					oAggregation.subtotalsAtBottomOnly ? oExpanded : null);
			}

			return oExpanded;
		},

		/**
		 * Returns the property metadata for a filter which has an alias as path. The EDM type is
		 * determined either based on the filter value's type (number, boolean, null) or falls back
		 * to the alias' original property type.
		 *
		 * @param {sap.ui.model.Filter} oFilter
		 *   A filter for which the EDM type should be determined
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {string} sResolvedPath
		 *   The resolved meta path for <code>oFilter</code>
		 * @returns {{$Type: string}|undefined}
		 *   An object containing the determined EDM type; or <code>undefined</code> if no type
		 *   could be found
		 *
		 * @public
		 */
		getPropertyMetadataForFilter : function (oFilter, oAggregation, sResolvedPath) {
			const sAlias = oFilter.getPath();
			const sOriginalPropertyName = oAggregation?.aggregate?.[sAlias]?.name;
			if (!sOriginalPropertyName) {
				return;
			}

			const vValue = oFilter.getValue1();
			if (typeof vValue === "number" || vValue === null) { // null: type is irrelevant
				return {$Type : "Edm.Decimal"};
			}
			if (typeof vValue === "boolean") {
				return {$Type : "Edm.Boolean"};
			}
			const sPath = sResolvedPath.slice(0, -sAlias.length) + sOriginalPropertyName;
			return oAggregation.$fetchMetadata(sPath).getResult();
		},

		/**
		 * Creates the query options for requesting the data (all required $selects for UI) of
		 * out-of-place nodes. The result is also used to check whether they still have the same
		 * parent (resp. still are root).
		 *
		 * @param {object} oOutOfPlace
		 *   Out-of-place node information containing key filters
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {object} mQueryOptions
		 *   A read-only map of key-value pairs representing the query string
		 * @returns {object}
		 *   The created query options
		 *
		 * @public
		 */
		getQueryOptionsForOutOfPlaceNodesData : function (oOutOfPlace, oAggregation,
				mQueryOptions) {
			oAggregation = Object.assign({}, oAggregation);
			oAggregation.expandTo = 1;
			delete oAggregation.search;
			delete oAggregation.$ExpandLevels;
			mQueryOptions = Object.assign({}, mQueryOptions);
			if (oOutOfPlace.parentFilter) {
				// with $$filterBeforeAggregate the data is requested with descendants(...) instead
				// of TopLevels(...)
				mQueryOptions.$$filterBeforeAggregate = oOutOfPlace.parentFilter;
			}
			// count/filter/sorter are not relevant for the data request
			delete mQueryOptions.$count;
			delete mQueryOptions.$filter;
			delete mQueryOptions.$orderby;
			mQueryOptions = _AggregationHelper.buildApply(oAggregation, mQueryOptions, 1);
			mQueryOptions.$select.pop(); // undo select("DrillState") from buildApply()
			const aNodeFilters = oOutOfPlace.nodeFilters.slice().sort();
			mQueryOptions.$filter = aNodeFilters.join(" or ");
			mQueryOptions.$top = aNodeFilters.length;

			return mQueryOptions;
		},

		/**
		 * Creates the query options for requesting the rank of all out-of-place nodes and their
		 * parents based on the current hierarchy transformation.
		 *
		 * @param {object[]} aOutOfPlaceByParent
		 *   Out-of-place node information containing key filters grouped by parent
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {object} mQueryOptions
		 *   A read-only map of key-value pairs representing the query string
		 * @returns {object}
		 *   The created query options
		 *
		 * @public
		 */
		getQueryOptionsForOutOfPlaceNodesRank : function (aOutOfPlaceByParent, oAggregation,
				mQueryOptions) {
			const oNodeFilters = new Set();
			aOutOfPlaceByParent.forEach(function (oOutOfPlace) {
				if (oOutOfPlace.parentFilter) {
					oNodeFilters.add(oOutOfPlace.parentFilter);
				}
				oOutOfPlace.nodeFilters.forEach(function (sNodeFilter) {
					oNodeFilters.add(sNodeFilter);
				});
			});
			const aSelect = [
				oAggregation.$DistanceFromRoot,
				oAggregation.$DrillState,
				oAggregation.$LimitedRank
			];
			if (oAggregation.$LimitedDescendantCount) {
				aSelect.push(oAggregation.$LimitedDescendantCount);
			}
			mQueryOptions = Object.assign({}, mQueryOptions, {
				$filter : [...oNodeFilters].sort().join(" or "),
				$select : aSelect,
				$top : oNodeFilters.size
			});
			delete mQueryOptions.$count;
			delete mQueryOptions.$orderby;
			_Helper.selectKeyProperties(mQueryOptions,
				oAggregation.$fetchMetadata(oAggregation.$metaPath + "/").getResult());

			return mQueryOptions;
		},

		/**
		 * Handles the given server response for a grand total row and updates it as needed by the
		 * client.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {object} oGrandTotal
		 *   An object representing a grand total row response from the server
		 * @param {object} mQueryOptions
		 *   A read-only map of key-value pairs representing the query string
		 *
		 * @public
		 */
		handleGrandTotal : function (oAggregation, oGrandTotal, mQueryOptions) {
			if (oAggregation["grandTotal like 1.84"]) { // rename measures
				_AggregationHelper.removeUI5grand__(oGrandTotal);
			}
			_AggregationHelper.setAnnotations(oGrandTotal, true, true, 0,
				_AggregationHelper.getAllProperties(oAggregation, mQueryOptions, false));

			if (oAggregation.grandTotalAtBottomOnly === false) {
				// Note: make shallow copy *before* there are private annotations!
				const oGrandTotalCopy = Object.assign({}, oGrandTotal, {
					"@$ui5.node.isExpanded" : undefined // treat copy as a leaf
				});
				_Helper.setPrivateAnnotation(oGrandTotal, "copy", oGrandTotalCopy);
				_Helper.setPrivateAnnotation(oGrandTotalCopy, "predicate", "($isTotal=true)");
			}
			_Helper.setPrivateAnnotation(oGrandTotal, "predicate", "()");
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
		 * Tells whether grand total values are needed for at least one aggregatable property and
		 * whether that grand total is shown (also) at the bottom.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @returns {boolean}
		 *   Whether there is a grand total (also) at bottom
		 *
		 * @public
		 */
		hasGrandTotalAtBottom : function (oAggregation) {
			return oAggregation?.grandTotalAtBottomOnly !== undefined
				&& _AggregationHelper.hasGrandTotal(oAggregation.aggregate);
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
		 * Tells whether a binding with the given aggregation data and filters is affected when
		 * requesting side effects for the given paths.
		 *
		 * @param {object} [oAggregation]
		 *   An object holding the information needed for data aggregation, see
		 *   {@link #.buildApply}; if omitted, aggregation related checks are skipped
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
			return aSideEffectPaths.some(function (sSideEffectPath) {
				// returns true if the mandatory property path is affected by the side effect path
				function isAffected(sPropertyPath) {
					return _Helper.isAffectedBy(sPropertyPath, sSideEffectPath)
						|| _Helper.hasPathPrefix(sSideEffectPath, sPropertyPath);
				}

				// returns true if the array contains a filter affected by the side effect path
				function hasAffectedFilter(aFilters0) {
					return aFilters0.some(function (oFilter) {
						return oFilter.getFilters()
							? hasAffectedFilter(oFilter.getFilters())
							: isAffected(oFilter.getPath());
					});
				}

				return sSideEffectPath === "" || sSideEffectPath === "*"
					|| hasAffectedFilter(aFilters)
					|| oAggregation && Object.keys(oAggregation.aggregate).some((sAlias) => {
						const oDetails = oAggregation.aggregate[sAlias];

						return isAffected(oDetails.name || sAlias)
							|| oDetails.unit && isAffected(oDetails.unit);
					})
					|| oAggregation && Object.keys(oAggregation.group).some((sGroup) => {
						return isAffected(sGroup)
							|| oAggregation.group[sGroup].additionally
								?.some((sPath) => isAffected(sPath));
					});
			});
		},

		/**
		 * Tells whether the given "$orderby" system query option is affected by at least one of the
		 * given side-effects paths.
		 *
		 * @param {string} [sOrderby]
		 *   The "$orderby" system query option, or <code>undefined</code>
		 * @param {string[]} aPaths
		 *   The "14.4.1.5 Expression edm:NavigationPropertyPath" or
		 *   "14.4.1.6 Expression edm:PropertyPath" strings describing which properties may have
		 *   changed due to an update or side effects of a previous update, see
		 *   {@link sap.ui.model.odata.v4.Context#requestSideEffects}
		 * @returns {boolean}
		 *   Whether the given "$orderby" system query option is affected by at least one of the
		 *   given side-effects paths
		 *
		 * @public
		 */
		isOrderedBy : function (sOrderby, aPaths) {
			if (!sOrderby) {
				return false;
			}

			return sOrderby.split(rComma).some((sOrderbyItem) => {
				const aMatches = rOrderbyItem.exec(sOrderbyItem);
				// handle unparseable items as "used in $orderby"
				return !aMatches
					|| aPaths.some((sPath) => _Helper.isAffectedBy(aMatches[1], sPath));
			});
		},

		/**
		 * Tells whether any property affected by the given side-effects paths is used to compute
		 * the grand total.
		 *
		 * @param {string[]} aPaths
		 *   The "14.4.1.5 Expression edm:NavigationPropertyPath" or
		 *   "14.4.1.6 Expression edm:PropertyPath" strings describing which properties may have
		 *   changed due to an update or side effects of a previous update, see
		 *   {@link sap.ui.model.odata.v4.Context#requestSideEffects}
		 * @param {object} [mAggregate]
		 *   A map from aggregatable property names/aliases to details objects
		 * @returns {boolean}
		 *   Whether any property affected by the given side-effects paths is used to compute the
		 *   grand total
		 *
		 * @public
		 */
		isUsedForGrandTotal : function (aPaths, mAggregate) {
			if (mAggregate) {
				const bWithWildcard = aPaths.includes("*");
				for (const [sAlias, oDetails] of Object.entries(mAggregate)) {
					if (oDetails.grandTotal
						&& (bWithWildcard
							|| aPaths.includes(sAlias) || aPaths.includes(oDetails.unit))) {
						return true;
					}
				}
			}

			return false;
		},

		/**
		 * Keeps only the subtotal-related properties in the given element, all others, including
		 * private annotations, are removed.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation but no recursive
		 *   hierarchy; see {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
		 * @param {object} oElement
		 *   The element to keep only subtotal-related properties
		 * @param {Set<string>} oUsedSubtotalUnits
		 *   A set of unit names which are used by subtotals
		 */
		keepSubtotalsOnly : function (oAggregation, oElement, oUsedSubtotalUnits) {
			for (const sProperty in oElement) {
				if (!oAggregation.aggregate[sProperty]?.subtotals
						&& !oUsedSubtotalUnits.has(sProperty)) {
					delete oElement[sProperty];
				}
			}
		},

		/**
		 * Marks the value of the given element's private annotation "spliced" with
		 * <code>$stale : true</code>, if available.
		 *
		 * @param {object} oElement - Any node or leaf element
		 */
		markSplicedStale : function (oElement) {
			var aSpliced = _Helper.getPrivateAnnotation(oElement, "spliced");

			if (aSpliced) { // => collapsed
				aSpliced.$stale = true;
			}
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
		 * "...@$ui5.noData" annotations for all missing properties.
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
						oElement[vProperty] = undefined;
						oElement[vProperty + "@$ui5.noData"] = true;
					}
				});
			}
		},

		/**
		 * Stores the given path and its corresponding meta path inside the given data aggregation
		 * information as <code>$metaPath</code> and <code>$path</code>.
		 *
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {string} [sPath]
		 *   The list binding's absolute data path, <code>undefined</code> if currently unresolved
		 *
		 * @public
		 */
		setPath : function (oAggregation, sPath) {
			oAggregation.$metaPath = sPath && _Helper.getMetaPath(sPath);
			oAggregation.$path = sPath;
		},

		/**
		 * Splits a filter depending on the aggregation information into an array that consists of
		 * three filters, depending on how they are related to data aggregation.
		 *
		 * @param {sap.ui.model.Filter} oFilter
		 *   The filter object that is split
		 * @param {object} [oAggregation]
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @returns {sap.ui.model.Filter[]}
		 *   An array that consists of three filters where each can be <code>undefined</code>. The
		 *   first one has to be applied after data aggregation. The second one can simply be
		 *   applied before data aggregation (which improves performance) because it is unrelated to
		 *   aggregates. The third one is special in that it has to be applied before data
		 *   aggregation via the special syntax "$these/aggregate(...)" because it relates to
		 *   aggregates; it is present only in case of visual grouping or if grand totals are used,
		 *   but "grandTotal like 1.84" is not. If the third one is present, then there is an
		 *   additional fourth element which again is an array of filters: those exceptions where
		 *   the special syntax is not applicable (for example, a currency filter that accompanies
		 *   its amount).
		 *
		 * @public
		 */
		splitFilter : function (oFilter, oAggregation) {
			var aFiltersNoAggregate = [],
				aFiltersNoThese = [], // filters for some aggregate's unit
				aFiltersOnAggregate = [];

			/*
			 * Tells whether the given filter relates to an aggregate.
			 *
			 * @param {sap.ui.model.Filter} oFilter
			 *   A filter
			 * @returns {boolean}
			 *   Whether the filter relates to an aggregate
			 */
			function isRelatedToAggregate(oFilter0) {
				return oFilter0.getFilters()
					? oFilter0.getFilters().some(isRelatedToAggregate)
					: oFilter0.getPath() in oAggregation.aggregate;
			}

			/*
			 * Tells whether the given filter path relates to the unit of an aggregate and one of
			 * the given filters relates to that same aggregate.
			 *
			 * @param {string} sPath
			 *   A filter's path (must not be <code>undefined</code>!)
			 * @param {sap.ui.model.Filter[]} aFilters
			 *   Some filters
			 * @returns {boolean}
			 *   Whether the path relates (via the unit) to a filter for an aggregate
			 */
			function isRelatedToFilter4Aggregate(sPath, aFilters) {
				return aFilters.some((oFilter0) => {
					return oFilter0.getFilters()
						? isRelatedToFilter4Aggregate(sPath, oFilter0.getFilters())
						: oAggregation.aggregate[oFilter0.getPath()]?.unit === sPath;
				});
			}

			/*
			 * Tells whether the given filter path relates to an aggregate's unit.
			 *
			 * @param {string} sPath
			 *   A filter's path (must not be <code>undefined</code>!)
			 * @returns {boolean}
			 *   Whether the filter path relates to an aggregate's unit
			 */
			function isRelatedToUnit(sPath) {
				return Object.keys(oAggregation.aggregate).some((sAlias) => {
						return oAggregation.aggregate[sAlias].unit === sPath;
					});
			}

			/*
			 * Splits the given filter tree along AND operations into filters that must be applied
			 * with or without "$these/aggregate(...)".
			 *
			 * @param {sap.ui.model.Filter} oFilter
			 *   A filter
			 */
			function split(oFilter0) {
				if (oFilter0.getFilters() && oFilter0.isAnd()) {
					oFilter0.getFilters().forEach(split);
				} else if (oFilter0.getPath() && isRelatedToUnit(oFilter0.getPath())) {
					aFiltersNoAggregate.push(oFilter0);
					aFiltersNoThese.push(oFilter0); // avoid "$these/..." here
				} else {
					(isRelatedToAggregate(oFilter0) ? aFiltersOnAggregate : aFiltersNoAggregate)
						.push(oFilter0);
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

			if (!oAggregation?.aggregate) {
				// no data aggregation at all
				return [oFilter];
			}
			if (!oAggregation.$leafLevelAggregated) {
				// no data aggregation on leaf level (all keys used for grouping)
				return [undefined, oFilter];
			}

			split(oFilter);
			aFiltersOnAggregate.unshift(...aFiltersNoThese.filter((oUnitFilter) => {
				return isRelatedToFilter4Aggregate(oUnitFilter.getPath(), aFiltersOnAggregate);
			}));

			let aResult = [wrap(aFiltersOnAggregate), wrap(aFiltersNoAggregate)];
			if (oAggregation.groupLevels.length
					|| !oAggregation["grandTotal like 1.84"]
					&& _AggregationHelper.hasGrandTotal(oAggregation.aggregate)) {
				aResult = [undefined, aResult[1], aResult[0], aFiltersNoThese];
			}

			return aResult;
		},

		/**
		 * Validates the given data aggregation information.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {boolean} bAutoExpandSelect
		 *   The value of the model's parameter <code>autoExpandSelect</code>
		 * @throws {Error}
		 *   If the given data aggregation object is unsupported, or if a recursive hierarchy is
		 *   requested, but the model does not use the <code>autoExpandSelect</code> parameter.
		 *
		 * @private
		 * @see validateAggregationAndSetPath
		 */
		validateAggregation : function (oAggregation, bAutoExpandSelect) {
			if (oAggregation.hierarchyQualifier && !bAutoExpandSelect) {
				throw new Error("Missing parameter autoExpandSelect at model");
			}
			if (oAggregation.expandTo && oAggregation.aggregate
					&& Object.values(oAggregation.aggregate)
						.some((oAggregate) => oAggregate.name || oAggregate.with)) {
				throw new Error(
					"Cannot combine 'expandTo' with aggregates having 'name' or 'with'");
			}

			_AggregationHelper.checkTypeof(oAggregation,
				oAggregation.hierarchyQualifier ? mRecursiveHierarchyType : mDataAggregationType,
				"$$aggregation");
		},

		/**
		 * Validates the given data aggregation information. If successful, the given path and its
		 * corresponding meta path as well as the given function are stored inside that information
		 * as <code>$metaPath</code>, <code>$path</code>, and <code>$fetchMetadata</code>
		 * respectively. <code>$autoExpandSelect</code> is stored there as well.
		 *
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see {@link #.buildApply}
		 * @param {boolean} bAutoExpandSelect
		 *   The value of the model's parameter <code>autoExpandSelect</code>
		 * @param {function} fnFetchMetadata
		 *   Function which fetches metadata for a given meta path
		 * @param {string} [sPath]
		 *   The list binding's absolute data path, <code>undefined</code> if currently unresolved
		 * @throws {Error}
		 *   If the given data aggregation object is unsupported, or if a recursive hierarchy is
		 *   requested, but the model does not use the <code>autoExpandSelect</code> parameter.
		 *
		 * @public
		 * @see setPath
		 * @see validateAggregation
		 */
		validateAggregationAndSetPath : function (oAggregation, bAutoExpandSelect, fnFetchMetadata,
				sPath) {
			_AggregationHelper.validateAggregation(oAggregation, bAutoExpandSelect);

			oAggregation.$autoExpandSelect = bAutoExpandSelect;
			oAggregation.$fetchMetadata = fnFetchMetadata;
			_AggregationHelper.setPath(oAggregation, sPath);
		}
	};

	return _AggregationHelper;
}, /* bExport= */false);
