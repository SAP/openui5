/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/mdc/util/TypeUtil"], function(TypeUtil) {
	"use strict";

	/**
	 * Utitlity class for metadata interpretation inside delegate classes
	 *
	 * @private
	 * @since 1.62
	 */
	var util = function() {};

	util.fetchAllAnnotations = function(oMetaModel, sEntityPath) {
		var oCtx = oMetaModel.getMetaContext(sEntityPath);
		return oMetaModel.requestObject("@", oCtx).then( function (mAnnos) {
			return mAnnos;
		});
	};

	/**
	 * The mapping of all annotations of a given entity set
	 *
	 * @param {object} mAnnos a list of annotations of the entity set
	 * @returns {object} mCustomAggregates a map to the custom aggregates keyed by theri qualifiers
	 */
	util.getAllCustomAggregates = function (mAnnos) {
		var mCustomAggregates = {}, sAnno;
		for (var sAnnoKey in mAnnos) {
			if (sAnnoKey.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")) {
				sAnno = sAnnoKey.replace("@Org.OData.Aggregation.V1.CustomAggregate#", "");
				var aAnno = sAnno.split("@");

				if (aAnno.length == 2) {
					//inner annotation that is not part of 	Validation.AggregatableTerms
					if (aAnno[1] == "Org.OData.Aggregation.V1.ContextDefiningProperties") {
						mCustomAggregates[aAnno[0]].contextDefiningProperties = mAnnos[sAnnoKey];
					}

					if (aAnno[1] == "com.sap.vocabularies.Common.v1.Label") {
						mCustomAggregates[aAnno[0]].label = mAnnos[sAnnoKey];
					}

				} else if (aAnno.length == 1) {
					mCustomAggregates[aAnno[0]] = {
						name: aAnno[0],
						propertyPath: aAnno[0],
						label: "Custom Aggregate (" + sAnno + ")",
						sortable: true,
						sortOrder: "both",
						custom: true
					};
				}
			}
		}

		return mCustomAggregates;
	};

	util.getAllAggregatableProperties = function (mAnnos) {
		var mAggregatableProperties = {}, aProperties, oProperty;
		if (mAnnos["@com.sap.vocabularies.Analytics.v1.AggregatedProperties"]) {
			aProperties = mAnnos["@com.sap.vocabularies.Analytics.v1.AggregatedProperties"];

			for (var i = 0; i < aProperties.length; i++) {
				oProperty = aProperties[i];

				mAggregatableProperties[oProperty.Value] = {
					name: oProperty.Value,
					propertyPath: oProperty.AggregatableProperty.$PropertyPath,
					aggregationMethod: oProperty.AggregationMethod,
					label: oProperty["@com.sap.vocabularies.Common.v1.Label"] || "Aggregatable property (" + oProperty.Value + ")",
					sortable: true,
					sortOrder: "both",
					custom: false
				};
			}
		}

		return mAggregatableProperties;
	};

	/**
	 * Retrieve and order all data points by their property and qaulifier
	 *
	 * @param mAnnos a named mapp of annotations from a given entity set
	 * @return mDataPoints a keyed mapped ordered by
	 * <ul>
	 *     <li> The properties value path </li>
	 *     <li> The qualifier of the data point <(li>
	 * </ul>
	 */
	util.getAllDataPoints = function(mAnnos) {
		var mDataPoints = {};
		for (var sAnnoKey in mAnnos) {
			if (sAnnoKey.startsWith("@com.sap.vocabularies.UI.v1.DataPoint")) {
				var sQualifier = sAnnoKey.replace("@com.sap.vocabularies.UI.v1.DataPoint#", "");
				var sValue = mAnnos[sAnnoKey].Value.$Path;
				mDataPoints[sValue] = mDataPoints[sValue] || {};
				mDataPoints[sValue][sQualifier] = util.createDataPointProperty(mAnnos[sAnnoKey]);
			}
		}

		return mDataPoints;
	};


	/**
	 * Format the data point as a JSON object
	 *
	 * @param oDataPointAnno
	 */
	util.createDataPointProperty = function(oDataPointAnno) {
		var oDataPoint = {};

		if (oDataPointAnno.TargetValue) {
			oDataPoint.targetValue = oDataPointAnno.TargetValue.$Path;
		}

		if (oDataPointAnno.ForeCastValue) {
			oDataPoint.foreCastValue = oDataPointAnno.ForeCastValue.$Path;
		}

		var oCriticality = null;
		if (oDataPointAnno.Criticality) {

			if (oDataPointAnno.Criticality.$Path) {
				//will be an aggregated property or custom aggregate
				oCriticality = {
					Calculated: oDataPointAnno.Criticality.$Path
				};
			} else {
				oCriticality = {
					Static: oDataPointAnno.Criticality.$EnumMember.replace("com.sap.vocabularies.UI.v1.CriticalityType/", "")
				};
			}

		} else if (oDataPointAnno.CriticalityCalculation) {
			var oThresholds = {};
			var bConstant = util._buildThresholds(oThresholds, oDataPointAnno.CriticalityCalculation);

			if (bConstant) {
				oCriticality = {
					ConstantThresholds: oThresholds
				};
			} else {
				oCriticality = {
					DynamicThresholds: oThresholds
				};
			}

		}

		if (oCriticality) {
			oDataPoint.criticality = oCriticality;
		}

		return oDataPoint;
	};

	/**
	 * Checks whether the thresholds are dynamic or constant.
	 * @param {object} oThresholds the threshold skeleton
	 * @param {object} oCriticalityCalculation the UI.DataPoint.CriticalityCalculation annotation
	 * @returns {boolean} <code>true</code> if the threshold should be supplied as ConstantThresholds, <code>false</code> if the threshold should
	 *          be supplied as DynamicThresholds
	 * @private
	 */
	util._buildThresholds = function(oThresholds, oCriticalityCalculation) {
		var aKeys = [
			"AcceptanceRangeLowValue", "AcceptanceRangeHighValue", "ToleranceRangeLowValue", "ToleranceRangeHighValue", "DeviationRangeLowValue", "DeviationRangeHighValue"
		];
		var bConstant = true, sKey;


		oThresholds.ImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember.replace("com.sap.vocabularies.UI.v1.ImprovementDirectionType/", "");


		var oDynamicThresholds = {
			oneSupplied: false,
			usedMeasures: []
			// combination to check whether at least one is supplied
		};
		var oConstantThresholds = {
			oneSupplied: false
			// combination to check whether at least one is supplied
		};

		for (var i = 0; i < aKeys.length; i++) {
			sKey = aKeys[i];
			oDynamicThresholds[sKey] = oCriticalityCalculation[sKey] ? oCriticalityCalculation[sKey].$Path : undefined;
			oDynamicThresholds.oneSupplied = oDynamicThresholds.oneSupplied || oDynamicThresholds[sKey];

			if (!oDynamicThresholds.oneSupplied) {
				// only consider in case no dynamic threshold is supplied
				oConstantThresholds[sKey] = oCriticalityCalculation[sKey];
				oConstantThresholds.oneSupplied = oConstantThresholds.oneSupplied || oConstantThresholds[sKey];
			} else if (oDynamicThresholds[sKey]) {
				oDynamicThresholds.usedMeasures.push((oDynamicThresholds[sKey]));
			}
		}

		// dynamic definition shall overrule constant definition
		if (oDynamicThresholds.oneSupplied) {
			bConstant = false;

			for (var i = 0; i < aKeys.length; i++) {
				if (oDynamicThresholds[aKeys[i]]) {
					oThresholds[aKeys[i]] = oDynamicThresholds[aKeys[i]];
				}
			}
			oThresholds.usedMeasures = oDynamicThresholds.usedMeasures;
		} else {
			var oAggregationLevel;
			oThresholds.AggregationLevels = [];

			// check if at least one static value is supplied
			if (oConstantThresholds.oneSupplied) {

				// add one entry in the aggregation level
				oAggregationLevel = {
					VisibleDimensions: null
				};

				for (var i = 0; i < aKeys.length; i++) {
					if (oConstantThresholds[aKeys[i]]) {
						oAggregationLevel[aKeys[i]] = oConstantThresholds[aKeys[i]];
					}
				}

				oThresholds.AggregationLevels.push(oAggregationLevel);

			}

			// further check for ConstantThresholds
			if (oCriticalityCalculation.ConstantThresholds && oCriticalityCalculation.ConstantThresholds.length > 0) {
				for (var i = 0; i < oCriticalityCalculation.ConstantThresholds.length; i++) {
					var oAggregationLevelInfo = oCriticalityCalculation.ConstantThresholds[i];

					var aVisibleDimensions = oAggregationLevelInfo.AggregationLevel ? [] : null;

					if (oAggregationLevelInfo.AggregationLevel && oAggregationLevelInfo.AggregationLevel.length > 0) {
						for (var j = 0; j < oAggregationLevelInfo.AggregationLevel.length; j++) {
							aVisibleDimensions.push(oAggregationLevelInfo.AggregationLevel[j].$PropertyPath);
						}
					}

					oAggregationLevel = {
						VisibleDimensions: aVisibleDimensions
					};

					for (var j = 0; j < aKeys.length; j++) {
						var nValue = oAggregationLevelInfo[aKeys[j]];
						if (nValue) {
							oAggregationLevel[aKeys[j]] = nValue;
						}
					}

					oThresholds.AggregationLevels.push(oAggregationLevel);
				}
			}
		}

		return bConstant;
	};

	/**
	 * Determines the sorting information from the restriction annotation
	 *
	 * @param oSortRestrictions The sort restrictions annotation
	 * @returns {{sortable: boolean, propertyInfo: {}}} An object containing the sort restriction information
	 */
	util.getSortRestrictionsInfo = function(oSortRestrictions) {
		var i, sPropertyName, oSortRestrictionsInfo = {
			sortable: true,
			propertyInfo: {}
		};

		if (oSortRestrictions) {
			oSortRestrictionsInfo.sortable = (oSortRestrictions.Sortable != null) ? oSortRestrictions.Sortable : true;
			if (oSortRestrictions.NonSortableProperties) {
				for (i = 0; i < oSortRestrictions.NonSortableProperties.length; i++) {
					sPropertyName = oSortRestrictions.NonSortableProperties[i].$PropertyPath;
					oSortRestrictionsInfo[sPropertyName] = {
						sortable: false
					};
				}
			}
			if (oSortRestrictions.AscendingOnlyProperties) {
				for (i = 0; i < oSortRestrictions.AscendingOnlyProperties; i++) {
					sPropertyName = oSortRestrictions.AscendingOnlyProperties[i].$PropertyPath;
					oSortRestrictionsInfo[sPropertyName] = {
						sortable: true,
						sortDirection: "asc"
					};
				}
			}

			if (oSortRestrictions.AscendingOnlyProperties) {
				for (i = 0; i < oSortRestrictions.DescendingOnlyProperties; i++) {
					sPropertyName = oSortRestrictions.DescendingOnlyProperties[i].$PropertyPath;
					oSortRestrictionsInfo[sPropertyName] = {
						sortable: true,
						sortDirection: "desc"
					};
				}
			}
		}

		return oSortRestrictionsInfo;
	};

	/**
	 *
	 * @param oProperty the Entity Property
	 * @param oSortRestrictionInfo the SortInformation restrictions
	 */
	util.addSortInfoForProperty = function(oProperty, oSortRestrictionInfo) {
		var oPropertyInfo = oSortRestrictionInfo[oProperty.name];
		oProperty.sortable = oSortRestrictionInfo.sortable && oPropertyInfo ? oPropertyInfo.sortable : true;

		if (oProperty.sortable) {
			oProperty.sortDirection = oPropertyInfo ? oPropertyInfo.sortDirection : "both";
		}
	};

	/**
	 * Determines the filter information based on the filter restrictions annoation
	 *
	 * @param oFilterRestrictions the filter restrictions annotation
	 * @return {{filterable: boolean, propertyInfo: {}}} An object containing the filter restriction information
	 */
	util.getFilterRestrictionsInfo = function(oFilterRestrictions) {
		var i, sPropertyName, oFilterRestrictionsInfo = {
			filterable: true,
			propertyInfo: {}
		};

		if (oFilterRestrictions) {
			oFilterRestrictionsInfo.filterable = (oFilterRestrictions.Filterable != null) ? oFilterRestrictions.Filterable : true;
			oFilterRestrictionsInfo.requiresFilter = (oFilterRestrictions.RequiresFilter != null) ? oFilterRestrictions.RequiresFilter : false;

			//Hierarchical Case
			oFilterRestrictionsInfo.requiredProperties = [];
			if (oFilterRestrictionsInfo.RequiredProperties) {
				for (i = 0; i < oFilterRestrictions.NonFilterableProperties; i++) {
					sPropertyName = oFilterRestrictions.NonFilterableProperties[i].$PropertyPath;
					oFilterRestrictionsInfo.requiredProperties.push(sPropertyName);
				}
			}

			if (oFilterRestrictions.NonFilterableProperties) {
				for (i = 0; i < oFilterRestrictions.NonFilterableProperties.length; i++) {
					sPropertyName = oFilterRestrictions.NonFilterableProperties[i].$PropertyPath;
					oFilterRestrictionsInfo[sPropertyName] = {
						filterable: false
					};
				}
			}

			if (oFilterRestrictions.FilterExpressionRestrictions) {
				//TBD
				for (i = 0; i < oFilterRestrictions.FilterExpressionRestrictions; i++) {
					sPropertyName = oFilterRestrictions.FilterExpressionRestrictions[i].$PropertyPath;
					oFilterRestrictionsInfo[sPropertyName] = {
						filterable: true,
						allowedExpressions: oFilterRestrictions.FilterExpressionRestrictions[i].AllowedExpressions
					};
				}
			}


		}

		return oFilterRestrictionsInfo;
	};

	util.isMultiValueFilterExpression = function(sFilterExpression) {
		var bIsMultiValue = true;

		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression

		switch (sFilterExpression) {
			case "SearchExpression":
			case "SingleRange":
			case "SingleValue": bIsMultiValue = false; break;
			default: break;
		}

		return bIsMultiValue;
	};

	/**
	 *
	 * @param oProperty the entity property
	 * @param oFilterRestrictionInfo the filter restrictions
	 */
	util.addFilterInfoForProperty = function(oProperty, oFilterRestrictionInfo) {
		var oPropertyInfo = oFilterRestrictionInfo[oProperty.name];
		oProperty.filterable = oFilterRestrictionInfo.filterable && oPropertyInfo ? oPropertyInfo.filterable : true;

		if (oProperty.filterable) {
			oProperty.allowedExpressions = oPropertyInfo ? oPropertyInfo.allowedExpressions : null;
		}
	};

	util.fetchCalendarTag = function(oMetaModel, oCtx) {
		var COMMON = "@com.sap.vocabularies.Common.v1.";
		return Promise.all([
			oMetaModel.requestObject(COMMON + "IsCalendarYear", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarHalfyear", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarQuarter", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarMonth", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarWeek", oCtx),
			oMetaModel.requestObject(COMMON + "IsDayOfCalendarMonth", oCtx),
			oMetaModel.requestObject(COMMON + "IsDayOfCalendarYear", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarYearHalfyear", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarYearQuarter", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarYearMonth", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarYearWeek", oCtx),
			oMetaModel.requestObject(COMMON + "IsCalendarDate", oCtx)
		]).then(function(aTag) {
			if (aTag[0]) {
				return "year";
			}

			if (aTag[1]) {
				return "halfYear";
			}

			if (aTag[2]) {
				return "quarter";
			}

			if (aTag[3]) {
				return "month";
			}

			if (aTag[4]) {
				return "week";
			}


			if (aTag[5]) {
				return "dayOfMonth";
			}

			if (aTag[6]) {
				return "dayOfYear";
			}


			if (aTag[7]) {
				return "yearHalfYear";
			}

			if (aTag[8]) {
				return "yearQuarter";
			}

			if (aTag[9]) {
				return "yearMonth";
			}

			if (aTag[10]) {
				return "yearWeek";
			}

			if (aTag[11]) {
				return "date";
			}

			return undefined;
		});

	};

	util.fetchFiscalTag = function(oMetaModel, oCtx) {
		var COMMON = "@com.sap.vocabularies.Common.v1.";
		return Promise.all([
			oMetaModel.requestObject(COMMON + "IsFiscalYear", oCtx),
			oMetaModel.requestObject(COMMON + "IsFiscalPeriod", oCtx),
			oMetaModel.requestObject(COMMON + "IsFiscalYearPeriod", oCtx),
			oMetaModel.requestObject(COMMON + "IsFiscalQuarter", oCtx),
			oMetaModel.requestObject(COMMON + "IsFiscalYearQuarter", oCtx),
			oMetaModel.requestObject(COMMON + "IsFiscalWeek", oCtx),
			oMetaModel.requestObject(COMMON + "IsFiscalYearWeek", oCtx),
			oMetaModel.requestObject(COMMON + "IsDayOfFiscalYear", oCtx),
			oMetaModel.requestObject(COMMON + "IsFiscalYearVariant", oCtx)
		]).then(function(aTag) {
			if (aTag[0]) {
				return "year";
			}

			if (aTag[1]) {
				return "period";
			}

			if (aTag[2]) {
				return "yearPeriod";
			}

			if (aTag[3]) {
				return "quarter";
			}

			if (aTag[4]) {
				return "yearQuarter";
			}


			if (aTag[5]) {
				return "week";
			}

			if (aTag[6]) {
				return "yearWeek";
			}


			if (aTag[7]) {
				return "dayOfYear";
			}

			if (aTag[8]) {
				return "yearVariant";
			}

			return undefined;
		});

	};

	util.fetchCriticality = function(oMetaModel, oCtx) {
		var UI = "@com.sap.vocabularies.UI.v1";
		return oMetaModel.requestObject(UI + ".ValueCriticality", oCtx).then(function(aValueCriticality) {
			var oCriticality, oValueCriticality;

			if (aValueCriticality) {
				oCriticality = {
					VeryPositive: [],
					Positive: [],
					Critical: [],
					VeryNegative: [],
					Negative: [],
					Neutral: []
				};

				for (var i = 0; i < aValueCriticality.length; i++) {
					oValueCriticality = aValueCriticality[i];

					if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryPositive")) {
						oCriticality.VeryPositive.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("Positive")) {
						oCriticality.Positive.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("Critical")) {
						oCriticality.Critical.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryNegative")) {
						oCriticality.VeryNegative.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("Negative")) {
							oCriticality.Negative.push(oValueCriticality.Value);
					} else {
							oCriticality.Neutral.push(oValueCriticality.Value);
					}

				}

				for (var sKey in oCriticality) {
					if (oCriticality[sKey].length == 0) {
						delete  oCriticality[sKey];
					}
				}
			}

			return oCriticality;
		});
	};

	return util;
});
