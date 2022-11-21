/*!
 * ${copyright}
 */

// ------------------------------------------------------------------------------------------
// Utility class used mdc table and chart
// ------------------------------------------------------------------------------------------
sap.ui.define(['sap/ui/mdc/util/IdentifierUtil', 'sap/ui/mdc/enum/ConditionValidated', "sap/ui/mdc/condition/ConditionConverter", 'sap/ui/mdc/condition/FilterConverter', 'sap/base/Log', 'sap/base/util/merge'],
		function(IdentifierUtil, ConditionValidated, ConditionConverter, FilterConverter, Log, merge) {
	"use strict";

	/**
	 * Utility class used by mdc controls to create the filter statement
	 *
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 * @since 1.80.0
	 * @alias sap.ui.mdc.util.FilterUtil
	 */
		var FilterUtil = {

				/**
				 * Returns a specific PropertyInfo object by a given name<br>
				 *
				 * @param {array} aPropertiesMetadata - array with all the property metadata
				 * @param {string} sKey - name of the property
				 * @returns {object}  PropertyInfo object for a given name, or <code>null</code>
				 * @private
				 * @ui5-restricted sap.ui.mdc, sap.fe
				 */
				getPropertyByKey : function(aPropertiesMetadata, sKey) {
					var oPropertyInfo = null;

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
				 * @param {sap.ui.mdc.FilterBar} oFilterBar instance of the filter bar
				 * @param {array} aPropertyNames list of property names to be considered
				 * @returns {map} mResultingConditions with property names as key and a list of internal conditions for each property
				 * @returns {array} mResultingConditions.["propertyName"] conditions addressed by the property name
				 * @returns {string} mResultingConditions.["propertyName"].operator operator for a single condition
				 * @returns {array} mResultingConditions.["propertyName"].values values for a single condition
				 * @private
				 * @ui5-restricted sap.ui.mdc, sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */
				getConditionsMap : function(oFilterBar, aPropertyNames) {
					var aPropertyConditions, oPropertyCondition, mResultingConditions = {};

					if (!oFilterBar || !oFilterBar.isA("sap.ui.mdc.FilterBar")) {
						Log.error("instance of sap.ui.mdc.FilterBar expected");
						return mResultingConditions;
					}

					var mConditions = oFilterBar.getInternalConditions();
					for (var sPropertyName in mConditions) {
						if (aPropertyNames.indexOf(sPropertyName) >= 0) {
							aPropertyConditions = [];
							if (mConditions[sPropertyName]) {
								for (var i = 0; i < mConditions[sPropertyName].length; i++) {
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
				 * @param {sap.ui.mdc.Control|sap.ui.mdc.util.TypeUtil} vTypeProvider the MDC control instance or TypeUtil
				 * @param {map} mConditions - map with externalized conditions
				 * @param {array} aPropertiesMetadata - array with all the property metadata
				 * @param {array} aIgnoreProperties - an array of property names which should be not considered for filtering
				 * @returns {object} Object with filters
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				getFilterInfo: function(vTypeProvider, mConditions, aPropertiesMetadata, aIgnoreProperties) {

					var oFilterInfo = {};

					aIgnoreProperties = aIgnoreProperties ? aIgnoreProperties : [];

					var i, sFieldPath, mInternalFilterConditions = {}, oConditionInternal;
					var mFilterTypes = {};

					if (aPropertiesMetadata && aPropertiesMetadata.length > 0) {
						for (sFieldPath in mConditions) {
							if (aIgnoreProperties.indexOf(sFieldPath) < 0) {

								var oProperty = FilterUtil.getPropertyByKey(aPropertiesMetadata, sFieldPath);
								if (oProperty) {

									mFilterTypes[sFieldPath] = { type: oProperty.typeConfig.typeInstance, caseSensitive: oProperty.caseSensitive, baseType: oProperty.typeConfig.baseType };
									mInternalFilterConditions[sFieldPath] = [];

									//convert from externalized to model-specific value representation
									for (i = 0; i < mConditions[sFieldPath].length; i++) {
										oConditionInternal = merge({}, mConditions[sFieldPath][i]);
										mInternalFilterConditions[sFieldPath].push(ConditionConverter.toType(oConditionInternal, oProperty.typeConfig.typeInstance, vTypeProvider.getTypeUtil ? vTypeProvider.getTypeUtil() : vTypeProvider));
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
				}

		};

		return FilterUtil;
});
