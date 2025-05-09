/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/mdc/condition/FilterOperatorUtil",
		"sap/ui/mdc/enums/BaseType",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/base/Log"
	],

	(
		FilterOperatorUtil,
		BaseType,
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
				let i, aLocalIncludeFilters, aLocalExcludeFilters, oOperator, oFilter, oNewFilter, oCondition;
				const aOverallFilters = [];

				const convertAnyAllFilter = function(oFilter, sFieldPath, sPropertyPath) {
					if ([FilterOperator.Any,FilterOperator.All].includes(oFilter.getOperator())) {
						// existing Any/All filters are not changed
						return {filter: null, anyAllFilters: [oFilter]};
					} else if (!oFilter.getPath() && oFilter.getFilters()) {
						// in case of nested inner filters call the convertAnyAllFilters for all sub filters.
						const aFilters = [];
						let aAnyAllFilters = [];
						oFilter.getFilters().forEach((oFilter) => {
							// aFilters.push(convertAnyAllFilter(oFilter, sFieldPath, sPropertyPath));
							const oConverted = convertAnyAllFilter(oFilter, sFieldPath, sPropertyPath);
							if (oConverted.filter) {
								aFilters.push(oConverted.filter);
							}
							if (oConverted.anyAllFilters.length > 0) {
								aAnyAllFilters = aAnyAllFilters.concat(oConverted.anyAllFilters);
							}
						});

						let oNewFilter;
						if (aFilters.length === 1) {
							[oNewFilter] = aFilters;
						} else if (aFilters.length > 1){
							oNewFilter = new Filter({filters: aFilters, and: oFilter.isAnd()});
						}
						return {filter: oNewFilter, anyAllFilters: aAnyAllFilters};
					} else if (oFilter.getPath() === sFieldPath) {
						oFilter.sPath = sPropertyPath;
						return {filter: oFilter, anyAllFilters: []};
					}
					return oFilter;
				};

				// Include-filters are combined in an OR-filter put into an All or A-filter
				// Exclude-filters are combined in an AND-filter and put into an All-filter (As the searched entry must be in none of the targets.)
				// Special case "empty", here the filter is created in the operator to allow custom empty-operators.
				const convertToAnyOrAllFilter = function(aFilters, sFieldPath, bExclude) {
					const [sNavPath, sPattern, sPropertyPath, sWrongPart] = sFieldPath.split(/([\*\+]\/)/);
					if (sPattern && aFilters.length > 0) {
						let oFilter;

						if (aFilters.length === 1) {
							[oFilter] = aFilters;
						} else if (aFilters.length > 1) {
							oFilter = new Filter({ filters: aFilters, and: bExclude });
						}

						if (oFilter) {
							const sVariable = "L1";

							if (!sWrongPart) { // only one occurence of pattern allowed
								const oConverted = convertAnyAllFilter(oFilter, sFieldPath, sVariable + "/" + sPropertyPath);
								let oNewFilter;
								if (oConverted.filter) {
									// the Any/All filter parameter for all filters of one FieldPath
									oNewFilter = new Filter({
										path: sNavPath,
										operator: sPattern === "*/" && !bExclude ? FilterOperator.Any : FilterOperator.All, // exclude filters are All-filters, even in Any case
										variable: sVariable,
										condition: oConverted.filter
									});
								}
								if (oConverted.anyAllFilters.length > 0) {
									if (oNewFilter) {
										oConverted.anyAllFilters.push(oNewFilter);
										oNewFilter = new Filter({
											filters: oConverted.anyAllFilters,
											and: bExclude
										});
									} else if (oConverted.anyAllFilters.length === 1) {
										[oNewFilter] = oConverted.anyAllFilters;
									} else {
										oNewFilter = new Filter({
											filters: oConverted.anyAllFilters,
											and: bExclude
										});
									}
								}

								return [oNewFilter];
							} else {
								throw new Error("FilterConverter: not supported binding " + sFieldPath);
							}
						}
					}

					return aFilters; // just use unchanged Filter
				};

				// OR-combine filters for each property
				for (const sFieldPath in oConditions) {
					aLocalIncludeFilters = [];
					aLocalExcludeFilters = [];
					const aConditions = oConditions[sFieldPath];

					if (sFieldPath === "$search") {
						continue;
					}

					let oDataType;
					let bCaseSensitiveType = true;
					let sBaseType = BaseType.String; // String is always default

					if (oConditionTypes) {
						if (oConditionTypes[sFieldPath]) {
							oDataType = oConditionTypes[sFieldPath].type;
							bCaseSensitiveType = oConditionTypes[sFieldPath].caseSensitive;
							sBaseType = oConditionTypes[sFieldPath].baseType || BaseType.String;

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

							aLocalIncludeFilters.push(oFilter);
						} else {
							aLocalExcludeFilters.push(oFilter);
						}
					}

					// support for Any or All filters - update the Any/All Filter in the include and exclude-filters
					// Any/All condition handling e.g. fieldPath "navPath*/propertyPath" or "navPath+/propertyPath"
					aLocalIncludeFilters = convertToAnyOrAllFilter(aLocalIncludeFilters, sFieldPath, false);
					aLocalExcludeFilters = convertToAnyOrAllFilter(aLocalExcludeFilters, sFieldPath, true);

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
						sRes = oFilter.sVariable ? oFilter.sVariable + ":" : "";
						sRes = sRes + oFilter.sPath + " " + oFilter.sOperator + " " + FilterConverter.prettyPrintFilters(oFilter.oCondition);
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

	}, /* bExport= */
	true);