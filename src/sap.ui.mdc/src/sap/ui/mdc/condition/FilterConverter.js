/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/mdc/condition/FilterOperatorUtil",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/base/Log"
	], (
	FilterOperatorUtil,
	Filter,
	FilterOperator,
	Log
) => {
	"use strict";

	/**
	 *
	 * Utility to convert {@link sap.ui.mdc.condition.ConditionObject conditions} of a {@link sap.ui.mdc.condition.ConditionModel ConditionModel} into {@link sap.ui.model.Filter Filter}
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.78.0
	 * @alias sap.ui.mdc.condition.FilterConverter
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const FilterConverter = {

		/**
		 * creates a map with the types of the conditions.
		 *
		 * @param {object} oConditions map of {@link sap.ui.mdc.condition.ConditionObject conditions}
		 * @param {sap.ui.mdc.FilterBar} oFilterBar <code>FilterBar</code> control
		 * @returns {object} aConditionTypes map containing the types of the condition.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		createConditionTypesMapFromFilterBar: function(oConditions, oFilterBar) {
			const oResult = {};

			for (const sFieldPath in oConditions) {
				if (oFilterBar) {
					const oPropertyInfo = oFilterBar._getPropertyByName(sFieldPath);
					let oDataType;
					if (oPropertyInfo && oPropertyInfo.typeConfig) {
						oDataType = oPropertyInfo.typeConfig.typeInstance;
					} else {
						// try to find missing type from FilterField
						const oFilterField = oFilterBar._getFilterField(sFieldPath); // TODO: use official API
						if (oFilterField) {
							const oFormatOptions = oFilterField.getFormatOptions();
							if (oFormatOptions.originalDateType) {
								oDataType = oFormatOptions.originalDateType;
							} else {
								oDataType = oFormatOptions.valueType;
							}
						}
					}
					oResult[sFieldPath] = { type: oDataType };
				}
			}

			return oResult;
		},

		/**
		 * Converts all conditions given in a oConditions map into a {@link sap.ui.model.Filter Filter} object.
		 *
		 * @param {object} oConditions map of {@link sap.ui.mdc.condition.ConditionObject conditions}
		 * @param {object} oConditionTypes map containing the types of the condition. Will be used to convert the values of a condition.
		 * @param {function} [fConvert2FilterCallback] deprecated (since 1.113) and not called anymore.
		 * @param {boolean} [bCaseSensitive] If <code>true</code>, the filtering for search strings is case-sensitive
		 * @returns {sap.ui.model.Filter} Filter object for filtering a {@link sap.ui.model.ListBinding ListBinding}
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		createFilters: function(oConditions, oConditionTypes, fConvert2FilterCallback, bCaseSensitive) {
			let i, aLocalIncludeFilters, aLocalExcludeFilters, oOperator, oFilter, oNewFilter, oCondition, oAnyOrAllFilterParam;
			const aOverallFilters = [];

			const convertAnyAllFilter = function(oFilter, sOperator, sPattern) {
				// var sOperator = FilterOperator.Any;
				// var sPattern = "*/";
				const sVariable = "L1";

				// in case of nested inner filters call the convertAnyAllFilters for all sub filters.
				if (!oFilter.sPath && oFilter.aFilters) {
					let oFilterParam;
					oFilter.aFilters.forEach((oFilter) => { oFilterParam = convertAnyAllFilter(oFilter, sOperator, sPattern);} );
					return oFilterParam || false;
				}

				if (oFilter.sPath?.indexOf(sPattern) > -1) {
					const aSections = oFilter.sPath.split(sPattern);
					if (aSections.length === 2) {
						const [sNavPath, sPropertyPath] = aSections;
						oFilter.sPath = sVariable + "/" + sPropertyPath;

						// the Any/All filter parameter for all filters of one condition
						return {
							path: sNavPath,
							operator: sOperator,
							variable: sVariable,
							condition: null  // this will be set later with the filter statement for all ANY/ALL filters
						};
					} else {
						throw new Error("FilterConverter: not supported binding " + oFilter.sPath);
					}
				}
				return false;
			};

			const convertToAnyOrAllFilter = function(oFilter) {
				// ANY condition handling e.g. fieldPath "navPath*/propertyPath"
				const oFilterParam = convertAnyAllFilter(oFilter, FilterOperator.Any, "*/");
				if (oFilterParam) {
					return oFilterParam;
				} else {
					// ALL condition handling e.g. fieldPath "navPath+/propertyPath"
					return convertAnyAllFilter(oFilter, FilterOperator.All, "+/");
				}
			};


			// OR-combine filters for each property
			for (const sFieldPath in oConditions) {
				aLocalIncludeFilters = [];
				aLocalExcludeFilters = [];
				oAnyOrAllFilterParam = null;
				const aConditions = oConditions[sFieldPath];

				if (sFieldPath === "$search") {
					continue;
				}

				let oDataType;
				let bCaseSensitiveType = true;
				let sBaseType;

				if (oConditionTypes) {
					if (oConditionTypes[sFieldPath]) {
						oDataType = oConditionTypes[sFieldPath].type;
						bCaseSensitiveType = oConditionTypes[sFieldPath].caseSensitive;
						sBaseType = oConditionTypes[sFieldPath].baseType;

						if (!oDataType) {
							// We only shown a warning, because the oDataType might not be required for creating the Filter.
							Log.warning("FilterConverter", "Not able to retrieve the type of path '" + sFieldPath + "!");
						}
					}
				}

				for (i = 0; i < aConditions.length; i++) {
					oCondition = aConditions[i];

					oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
					if (!oOperator) {
						continue; // ignore unknown operators
					}

					try {
						oFilter = oOperator.getModelFilter(oCondition, sFieldPath, oDataType, bCaseSensitiveType, sBaseType);
					} catch (error) {
						if (error) {
							Log.error("FilterConverter", error);
						} else {
							// in case the getModelFilter fails - because the oDataType is missing - we show a console error.
							Log.error("FilterConverter", "Not able to convert the condition for path '" + sFieldPath + "' into a filter! The type is missing!");
						}
						continue;
					}

					if (!oOperator.exclude) {

						if (oFilter.sPath === "$search") {
							//ignore the $search conditions
							continue;
						}

						// basic search condition handling split the oFilter with sPath == "*xxx,yyy*" into multiple filter
						// e.g. fieldPath "*title,year*" - such fieldPath only works with type string and an operation with a single value (e.g. contains)
						//TODO this should be removed. Only $search will be supported as sPath. This mapping of a *fieldPath1,FieldPath2* is currently only used on the mockServer
						const $searchfilters = /^\*(.+)\*$/.exec(oFilter.sPath);
						if ($searchfilters) {
							// $search mapping
							const aFieldPath = $searchfilters[1].split(',');
							for (let j = 0; j < aFieldPath.length; j++) {
								aLocalIncludeFilters.push(new Filter({ path: aFieldPath[j], operator: oFilter.sOperator, value1: oFilter.oValue1, caseSensitive: bCaseSensitive }));
							}
							continue;
						}

						// support for Any/all filters for include operations
						// Any/All condition handling e.g. fieldPath "navPath*/propertyPath" or "navPath+/propertyPath"
						oAnyOrAllFilterParam = convertToAnyOrAllFilter(oFilter);
						aLocalIncludeFilters.push(oFilter);
					} else {

						// support for Any/All filters for exclude operations
						// Any/All condition handling e.g. fieldPath "navPath*/propertyPath" or "navPath+/propertyPath"
						oAnyOrAllFilterParam = convertToAnyOrAllFilter(oFilter);
						aLocalExcludeFilters.push(oFilter);
					}
				}

				// take the single Filter or combine all with OR
				oFilter = undefined;
				if (aLocalIncludeFilters.length === 1) {
					oFilter = aLocalIncludeFilters[0]; // could omit this and have an OR-ed array with only one filter, but it's nice this way.
				} else if (aLocalIncludeFilters.length > 1) {
					oFilter = new Filter({ filters: aLocalIncludeFilters, and: false });
				}

				// merge include-filter and all exclude-filter into the Overallfilter, they will be AND added to the result
				if (oFilter) {
					aLocalExcludeFilters.unshift(oFilter); // add include-filters to the beginning (better to read)
				}

				oNewFilter = undefined;
				if (aLocalExcludeFilters.length === 1) {
					oNewFilter = aLocalExcludeFilters[0];
				} else if (aLocalExcludeFilters.length > 1) {
					oNewFilter = new Filter({ filters: aLocalExcludeFilters, and: true }); // to have all filters for differents path AND grouped
				}

				// support for Any or All filters - update the Any/All Filter in the OverAllFilters array
				if (oAnyOrAllFilterParam) {
					// oAnyOrAllFilterParam.path = NavPath,
					// oAnyOrAllFilterParam.operator = "Any/All",
					// oAnyOrAllFilterParam.variable = "L1"
					oAnyOrAllFilterParam.condition = oNewFilter;
					oNewFilter = new Filter(oAnyOrAllFilterParam);
				}

				if (oNewFilter) {
					aOverallFilters.push(oNewFilter);
				}

			}

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

		prettyPrintFilters: function(oFilter) {
			let sRes;
			if (!oFilter) {
				return "no filters set";
			}
			if (oFilter._bMultiFilter) {
				sRes = "";
				const { bAnd } = oFilter;
				oFilter.aFilters.forEach((oFilter, index, aFilters) => {
					sRes += FilterConverter.prettyPrintFilters(oFilter);
					if (aFilters.length - 1 != index) {
						sRes += bAnd ? " and " : " or ";
					}
				}, this);
				return "(" + sRes + ")";
			} else {
				if (oFilter.sOperator === FilterOperator.Any || oFilter.sOperator === FilterOperator.All) {
					sRes = oFilter.sVariable + ":" + oFilter.sPath + " " + oFilter.sOperator + " " + FilterConverter.prettyPrintFilters(oFilter.oCondition);
				} else {
					if (oFilter.bCaseSensitive === false) {
						sRes = "tolower(" + oFilter.sPath + ") " + oFilter.sOperator + " tolower('" + oFilter.oValue1 + "')";
					} else {
						sRes = oFilter.sPath + " " + oFilter.sOperator + " '" + oFilter.oValue1 + "'";
					}
					if ([FilterOperator.BT, FilterOperator.NB].indexOf(oFilter.sOperator) >= 0) {
						sRes += "...'" + oFilter.oValue2 + "'";
					}
				}
				return sRes;
			}
		}
	};

	return FilterConverter;

});