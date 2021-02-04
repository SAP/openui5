/*
 * ! ${copyright}
 */

// ------------------------------------------------------------------------------------------
// Utility class used mdc table and chart
// ------------------------------------------------------------------------------------------
sap.ui.define(['sap/ui/mdc/util/IdentifierUtil', "sap/ui/mdc/condition/ConditionConverter", 'sap/ui/mdc/condition/FilterConverter', 'sap/base/Log', 'sap/base/util/merge'],
		function(IdentifierUtil, ConditionConverter, FilterConverter, Log, merge) {
	"use strict";

	/**
	 * Utility class used by mdc controls to create the filter statement
	 *
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.mdc
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
				 * @ui5-restricted sap.ui.mdc
				 */
				getPropertyByKey : function(aPropertiesMetadata, sKey) {
					var oPropertyInfo = null;
					aPropertiesMetadata.some(function(oProp) {
						if (IdentifierUtil.getPropertyKey(oProp) === sKey) {
							oPropertyInfo = oProp;
						}

						return oPropertyInfo != null;
					});

					return oPropertyInfo;
				},

				/**
				 * Creates the filter statements based on the externalize conditions.<br>
				 *
				 * @param {sap.ui.mdc.Control} oMDCControl the MDC control instance
				 * @param {map} mConditions - map with externalized conditions
				 * @param {array} aPropertiesMetadata - array with all the property metadata
				 * @param {array} aIgnoreProperties - an array of property names which should be not considered for filtering
				 * @returns {object} Object with filters
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				getFilterInfo: function(oMDCControl, mConditions, aPropertiesMetadata, aIgnoreProperties) {

					var oFilterInfo = {};

					if (!oMDCControl) {
						Log.error("not an mdc control");
						return oFilterInfo;
					}
					if (!oMDCControl.bDelegateInitialized || !oMDCControl.getTypeUtil()) {
						Log.error("typeUtil not available");
						return oFilterInfo;
					}

					aIgnoreProperties = aIgnoreProperties ? aIgnoreProperties : [];

					var i, sFieldPath, mInternalFilterConditions = {}, oConditionInternal;
					var mFilterTypes = {};

					if (aPropertiesMetadata && aPropertiesMetadata.length > 0) {
						for (sFieldPath in mConditions) {
							if (aIgnoreProperties.indexOf(sFieldPath) < 0) {

								var oProperty = FilterUtil.getPropertyByKey(aPropertiesMetadata, sFieldPath);
								if (oProperty) {

									mFilterTypes[sFieldPath] = { type: oProperty.typeConfig.typeInstance };
									mInternalFilterConditions[sFieldPath] = [];

									//convert from externalized to model-specific value representation
									for (i = 0; i < mConditions[sFieldPath].length; i++) {
										oConditionInternal = merge({}, mConditions[sFieldPath][i]);
										mInternalFilterConditions[sFieldPath].push(ConditionConverter.toType(oConditionInternal, oProperty.typeConfig, oMDCControl.getTypeUtil()));
									}

								} else {
									Log.error("no such property: " + sFieldPath);
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
}, /* bExport= */true);
