/*!
 * ${copyright}
*/
sap.ui.define([
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/model/Filter",
	"sap/base/Log"
],

function(
	FilterOperatorUtil,
	Filter,
	Log
) {
	"use strict";

	/**
	 *
	 * @class Utility to convert ConditionModel conditions into sap.ui.model.Filter
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.78.0
	 * @alias sap.ui.mdc.condition.FilterConverter
	 *
	 * @private
	 * @experimental
	 * @ui5-restricted
	 */
	var FilterConverter = {

			/**
			 * creates a map with the types of the conditions.
			 *
			 * @param {object} oConditions map of conditions
			 * @param {sap.ui.mdc.FilterBar} oFilterBar <code>FilterBar</code> control
			 * @returns {object} aConditionTypes map containing the types of the condition.
			 *
			 * @public
			 */
			createConditionTypesMapFromFilterBar: function (oConditions, oFilterBar) {
				var oResult = {};

				for (var sFieldPath in oConditions) {
					if (oFilterBar) {
						var oPropertyInfo = oFilterBar._getPropertyByName(sFieldPath);
						var oDataType = oPropertyInfo && oPropertyInfo.typeConfig && oPropertyInfo.typeConfig.typeInstance;
						oResult[sFieldPath] = {type : oDataType};
					}
				}

				return oResult;
			},

			/**
			 * Converts all conditions given in a oConditions map into a Filter statement.
			 *
			 * @param {object} oConditions map of conditions
			 * @param {object} oConditionTypes map containing the types of the condition. Will be used to convert the values of a condition.
			 * @param {function} [fConvert2FilterCallback] callback function
			 * @returns {sap.ui.model.Filter} Filter object for filtering a listbinding
			 *
			 * @public
			 */
			createFilters: function (oConditions, oConditionTypes, fConvert2FilterCallback) {
				var i, aLocalIncludeFilters, aLocalExcludeFilters, aOverallFilters = [],
				oOperator, oFilter, oCondition,
				oToAnyFilterParam, aSections, sNavPath, sPropertyPath;

				// OR-combine filters for each property
				for (var sFieldPath in oConditions) {
					aLocalIncludeFilters = [];
					aLocalExcludeFilters = [];
					oToAnyFilterParam = null;
					var aConditions = oConditions[sFieldPath];

					for (i = 0; i < aConditions.length; i++) {
						oCondition = aConditions[i];

						oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
						if (!oOperator) {
							continue; // ignore unknown operators
						}

						var oDataType;
						if (oConditionTypes) {
							if (oConditionTypes[sFieldPath]) {
								oDataType = oConditionTypes[sFieldPath].type;
								if (!oDataType) {
									// We only shown a warning, because the oDataType might not be required for creating the Filter.
									Log.warning("FilterConverter", "Not able to retrieve the type of path '" + sFieldPath + "!");
								}
							}
						}

						try {
							oFilter = oOperator.getModelFilter(oCondition, sFieldPath, oDataType);
						} catch (error) {
							// in case the getModelFilter fails - because the oDataType is missing - we show a console error.
							Log.error("FilterConverter", "Not able to convert the condition for path '" + sFieldPath + "' into a filter! The type is missing!");
							continue;
						}

						if (fConvert2FilterCallback) {
							oFilter = fConvert2FilterCallback(oCondition, sFieldPath, oDataType, oFilter);
							if (!oFilter) {
								continue;
							}
						}

						if (!oOperator.exclude) {

							if (oFilter.sPath === "$search") {
								//ignore the $search conditions
								continue;
							}

							// basic search condition handling split the oFilter with sPath == "*xxx,yyy*" into multiple filter
							// e.g. fieldPath "*title,year*" - such fieldPath only works with type string and an operation with a single value (e.g. contains)
							//TODO this should be removed. Only $search will be supported as sPath. This mapping of a *fieldPath1,FieldPath2* is currently only used on the mockServer
							var $searchfilters = /^\*(.+)\*$/.exec(oFilter.sPath);
							if ($searchfilters) {
								// $search mapping
								var aFieldPath = $searchfilters[1].split(',');
								for (var j = 0; j < aFieldPath.length; j++) {
									aLocalIncludeFilters.push(new Filter(aFieldPath[j], oFilter.sOperator, oFilter.oValue1));
								}
								continue;
							}

							// support for ToAny filters - currently not used and only experimental
							// ANY condition handling e.g. fieldPath "navPath*/propertyPath"
							if (oFilter.sPath && oFilter.sPath.indexOf('*/') > -1) {
								aSections = oFilter.sPath.split('*/');
								if (aSections.length === 2) {
									sNavPath = aSections[0];
									sPropertyPath = aSections[1];
									oFilter.sPath = 'L1/' + sPropertyPath;

									if (!oToAnyFilterParam) {
										oToAnyFilterParam = {
												path: sNavPath,
												operator: 'Any',
												variable: 'L1'
										};
									}
									aLocalIncludeFilters.push(oFilter);
								} else {
									throw new Error("Not Implemented");
								}
							} else {
								aLocalIncludeFilters.push(oFilter);
							}
						} else {
							//collect all exclude (NE) conditions as AND fieldPath != "value"
							aLocalExcludeFilters.push(oFilter);
						}
					}

					// support for ToAny filters - currently not used and only experimental
					if (oToAnyFilterParam) {
						if (aLocalIncludeFilters.length === 1) {
							oToAnyFilterParam.condition = aLocalIncludeFilters[0];
						} else if (aLocalIncludeFilters.length > 1) {
							oToAnyFilterParam.condition = new Filter({ filters: aLocalIncludeFilters, and: false });
						}
						aLocalIncludeFilters = [new Filter(oToAnyFilterParam)];
					}

					// if (fHandleFiltersOfSameFieldPathCallback) {
					// 	if (!fHandleFiltersOfSameFieldPathCallback(aLocalIncludeFilters, aLocalExcludeFilters, aOverallFilters) {
					// 		continue;
					// 	}
					// }

					// take the single Filter or combine all with OR
					oFilter = undefined;
					if (aLocalIncludeFilters.length === 1) {
						oFilter = aLocalIncludeFilters[0]; // could omit this and have an OR-ed array with only one filter, but it's nice this way.
					} else if (aLocalIncludeFilters.length > 1) {
						oFilter = new Filter({ filters: aLocalIncludeFilters, and: false });
					}

					// merge Include-filter and all NE-filter into the Overallfilter, they will be AND added to the result
					if (oFilter) {
						aLocalExcludeFilters.unshift(oFilter); // add in-filters to the beginning (better to read)
					}

					if (aLocalExcludeFilters.length === 1) {
						aOverallFilters.push(aLocalExcludeFilters[0]);
					} else if (aLocalExcludeFilters.length > 1) {
						aOverallFilters.push(new Filter({ filters: aLocalExcludeFilters, and: true })); // to have all filters for one path grouped
					}
				}

				// if (fHandleAllFiltersCallback) {
				// 	var oFilter = fHandleAllFiltersCallback(aOverallFilters);
				// 	if (oFilter) {
				// 		return oFilter;
				// 	}
				// }

				// AND-combine filters for different properties and apply filters
				if (aOverallFilters.length === 1) {
					oFilter = aOverallFilters[0]; // could omit this and have an ORed array with only one filter, but it's nice this way.
				} else if (aOverallFilters.length > 1) {
					oFilter = new Filter({ filters: aOverallFilters, and: true });
				} else { // no filters
					oFilter = null;
				}

				Log.info("FilterConverter", FilterConverter.prettyPrintFilters(oFilter));

				return oFilter;
			},

			prettyPrintFilters: function (oFilter) {
				var sRes;
				if (!oFilter) {
					return "";
				}
				if (oFilter._bMultiFilter) {
					sRes = "";
					var bAnd = oFilter.bAnd;
					oFilter.aFilters.forEach(function (oFilter, index, aFilters) {
						sRes += FilterConverter.prettyPrintFilters(oFilter);
						if (aFilters.length - 1 != index) {
							sRes += bAnd ? " and " : " or ";
						}
					}, this);
					return "(" + sRes + ")";
				} else {
					sRes = oFilter.sPath + " " + oFilter.sOperator + " '" + oFilter.oValue1 + "'";
					if (oFilter.sOperator === "BT") {
						sRes += "...'" + oFilter.oValue2 + "'";
					}
					return sRes;
				}
			}
	};

	return FilterConverter;

}, /* bExport= */ true);
