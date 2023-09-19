/*!
 * ${copyright}
 */

// ------------------------------------------------------------------------------------------
// Utility class used mdc table and chart
// ------------------------------------------------------------------------------------------
sap.ui.define(['sap/ui/mdc/util/IdentifierUtil', 'sap/ui/mdc/enums/ConditionValidated', "sap/ui/mdc/condition/ConditionConverter", 'sap/ui/mdc/condition/FilterConverter', 'sap/base/Log', 'sap/base/util/merge'],
		function(IdentifierUtil, ConditionValidated, ConditionConverter, FilterConverter, Log, merge) {
	"use strict";

	// Added support for deprecated TypeUtil
	const _getTypeMap = function (vTypeProvider) {

		if (vTypeProvider && vTypeProvider.getTypeMap) {
			return vTypeProvider.getTypeMap();
		}

		if (vTypeProvider && vTypeProvider.getTypeUtil) {
			return vTypeProvider.getTypeUtil();
		}

		return vTypeProvider;
	};

	/**
	 * Utility class used by controls in the <code>sap.ui.mdc</code> library to create a filter statement
	 *
	 * @namespace
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.80.0
	 * @alias sap.ui.mdc.util.FilterUtil
	 */
		const FilterUtil = {

				/**
				 * Returns a specific <code>PropertyInfo</code> object by a given name.<br>
				 *
				 * @param {array} aPropertiesMetadata - array with all the property metadata
				 * @param {string} sKey - name of the property
				 * @returns {object}  PropertyInfo object for a given name, or <code>null</code>
				 * @public
				 */
				getPropertyByKey : function(aPropertiesMetadata, sKey) {
					let oPropertyInfo = null;

					aPropertiesMetadata.some(function(oProp) {
						if (IdentifierUtil.getPropertyPath(oProp) === sKey) {
							oPropertyInfo = oProp;
						}

						return oPropertyInfo != null;
					});

					if (!oPropertyInfo) {
						aPropertiesMetadata.some(function(oProp) {
							if (IdentifierUtil.getPropertyKey(oProp) === sKey) {
								oPropertyInfo = oProp;
							}

							return oPropertyInfo != null;
						});
					}

					return oPropertyInfo;
				},

				/**
				 * Returns internal conditions for a set of properties. Properties without a condition will be ignored.
				 * The resulting conditions are represented by the operation and by the values array.
				 * <b>Note:</b><br>The operation information will be returned as they are contained in the internal conditions model.
				 * This has to be considered, in case custom operations are used.
				 *
				 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
				 * @param {array} aPropertyNames List of property names to be taken into consideration
				 * @returns {map} mResultingConditions with property names as key and a list of internal conditions for each property
				 * @returns {array} mResultingConditions.["propertyName"] conditions addressed by the property name
				 * @returns {string} mResultingConditions.["propertyName"].operator operator for a single condition
				 * @returns {array} mResultingConditions.["propertyName"].values values for a single condition
				 * @public
				 */
				getConditionsMap : function(oFilterBar, aPropertyNames) {
					let aPropertyConditions, oPropertyCondition;
					const mResultingConditions = {};

					if (!oFilterBar || !oFilterBar.isA("sap.ui.mdc.FilterBar")) {
						Log.error("instance of sap.ui.mdc.FilterBar expected");
						return mResultingConditions;
					}

					const mConditions = oFilterBar.getInternalConditions();
					for (const sPropertyName in mConditions) {
						if (aPropertyNames.indexOf(sPropertyName) >= 0) {
							aPropertyConditions = [];
							if (mConditions[sPropertyName]) {
								for (let i = 0; i < mConditions[sPropertyName].length; i++) {
									oPropertyCondition = {};
									oPropertyCondition.operator = mConditions[sPropertyName][i].operator;

									if ((oPropertyCondition.operator === "EQ") && (mConditions[sPropertyName][i].validated === ConditionValidated.Validated)) {
										oPropertyCondition.values = [mConditions[sPropertyName][i].values[0]];
									} else {
										oPropertyCondition.values = mConditions[sPropertyName][i].values;
									}

									aPropertyConditions.push(oPropertyCondition);
								}

								mResultingConditions[sPropertyName] = aPropertyConditions;
							}
						}
					}

					return mResultingConditions;
				},

				/**
				 * Creates the filter statements based on the externalize conditions.<br>
				 *
				 * @param {sap.ui.mdc.Control|module:sap/ui/mdc/util/TypeMap} vTypeProvider the <code>Control</code>instance or <code>TypeMap</code>
				 * @param {map} mConditionsPerKey - Map with externalized conditions
				 * @param {array} aPropertiesMetadata - Array with all the property metadata
				 * @param {array} aIgnoreProperties - Array of property names not taken into consideration for filtering
				 * @returns {object} Object with filters
				 * @public
				 */
				getFilterInfo: function(vTypeProvider, mConditionsPerKey, aPropertiesMetadata, aIgnoreProperties) {

					const oFilterInfo = {};
					let mConditionsPerPath = {};

					/* In case a Table is used for example, the condition key is not necessarily a valid property path in the model
					* the later creation of filters in the FilterConverter is expecting the map to hold the valid paths to properties in the
					* used model, therefore we need to ensure to properly map the keys to its path to create service understandable filters
					*/
					if (aPropertiesMetadata && aPropertiesMetadata.length > 0) {
						Object.keys(mConditionsPerKey).forEach(function(sConditionKey){
							const oAffectedProperty = aPropertiesMetadata.find(function(oProperty){
								return oProperty.name === sConditionKey;
							});
							const sConditionPath = oAffectedProperty && oAffectedProperty.path ? oAffectedProperty.path : sConditionKey;
							mConditionsPerPath[sConditionPath] = mConditionsPerKey[sConditionKey];
						});
					} else {
						mConditionsPerPath = mConditionsPerKey;
					}

					aIgnoreProperties = aIgnoreProperties ? aIgnoreProperties : [];

					let i, sFieldPath, oConditionInternal;
					const mInternalFilterConditions = {};
					const mFilterTypes = {};

					if (aPropertiesMetadata && aPropertiesMetadata.length > 0) {
						for (sFieldPath in mConditionsPerPath) {
							if (aIgnoreProperties.indexOf(sFieldPath) < 0) {

								const oProperty = FilterUtil.getPropertyByKey(aPropertiesMetadata, sFieldPath);
								if (oProperty) {

									mFilterTypes[sFieldPath] = { type: oProperty.typeConfig.typeInstance, caseSensitive: oProperty.caseSensitive, baseType: oProperty.typeConfig.baseType };
									mInternalFilterConditions[sFieldPath] = [];

									//convert from externalized to model-specific value representation
									for (i = 0; i < mConditionsPerPath[sFieldPath].length; i++) {
										oConditionInternal = merge({}, mConditionsPerPath[sFieldPath][i]);
										mInternalFilterConditions[sFieldPath].push(ConditionConverter.toType(oConditionInternal, oProperty.typeConfig.typeInstance, _getTypeMap(vTypeProvider)));
									}

								} else {
									Log.error("sap.ui.mdc.util.FilterUitl.js :", "could not find propertyMetadata of : " + sFieldPath);
								}
							}
						}

						if (Object.keys(mInternalFilterConditions).length > 0) {
							// create filter statement
							oFilterInfo.filters = FilterConverter.createFilters(mInternalFilterConditions, mFilterTypes);
						}
					}

					return oFilterInfo;
				},

				/**
				 * Determines the required filter fields that have no value.
				 *
				 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
				 * @returns {string[]} Array containing the required field names without a value
				 * If there are no such fields, or all required filters are filled, an empty array is returned.
				 * @public
				 */
				getRequiredFieldNamesWithoutValues: function(oFilterBar) {
					const aReqFiltersWithoutValue = [];
					if (oFilterBar && oFilterBar._getRequiredPropertyNames && oFilterBar._getConditionModel) {
						oFilterBar._getRequiredPropertyNames().forEach(function(sName) {
							const aConditions = oFilterBar._getConditionModel().getConditions(sName);
							if (!aConditions || aConditions.length === 0) {
								aReqFiltersWithoutValue.push(sName);
							}
						});
					}

					return aReqFiltersWithoutValue;
				}
		};

		return FilterUtil;
});
