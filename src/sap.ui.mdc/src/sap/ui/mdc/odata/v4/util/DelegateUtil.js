/*
 * ! ${copyright}
 */

// ------------------------------------------------------------------------------------------
// Utility class used by mdc v4 delegates for parameter handling
// ------------------------------------------------------------------------------------------
sap.ui.define(['sap/ui/mdc/util/FilterUtil', "sap/ui/mdc/condition/ConditionConverter", 'sap/base/Log', 'sap/base/util/merge', "sap/ui/model/odata/v4/ODataUtils"],
		function(FilterUtil, ConditionConverter, Log, merge, ODataUtils) {
	"use strict";

	/**
	 * Utility class used by mdc v4 delegates for parameter handling
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var DelegateUtil = {

		_getParameters: function(oMDCFilterBar) {
			var oParameters = null;

			if (oMDCFilterBar && oMDCFilterBar.getDelegate() && oMDCFilterBar.getDelegate().payload && oMDCFilterBar.getDelegate().payload.collectionName) {
				var sEntitySetName = oMDCFilterBar.getDelegate().payload.collectionName;

				if (window[oMDCFilterBar.getId() + '->' + sEntitySetName + "-Parameters"]) {
					oParameters = window[oMDCFilterBar.getId() + '->' + sEntitySetName + "-Parameters"];
				}
			}

			return oParameters;
		},

		_getParameterPath: function(oMDCFilterBar, mConditions, oParameters) {

			var i, sFieldPath,  mInternalParameterConditions = {}, oConditionInternal;
			var aParams, sEdmType;

			if (!oParameters || (oParameters.parameters.length <= 0)) {
				return null;
			}

			var aPropertiesMetadata = oMDCFilterBar.getPropertyInfoSet ? oMDCFilterBar.getPropertyInfoSet() : null;
			if (!aPropertiesMetadata) {
				return null;
			}

			var sEntitySetName = oMDCFilterBar.getDelegate().payload.collectionName;

			for (sFieldPath in mConditions) {
				var oProperty = FilterUtil.getPropertyByKey(aPropertiesMetadata, sFieldPath);
				if (oProperty && (oParameters.parameters.indexOf(sFieldPath) >= 0)) {

					mInternalParameterConditions[sFieldPath] = [];
					//convert from externalized to model-specific value representation
					for (i = 0; i < mConditions[sFieldPath].length; i++) {
						oConditionInternal = merge({}, mConditions[sFieldPath][i]);
						mInternalParameterConditions[sFieldPath].push(ConditionConverter.toType(oConditionInternal, oProperty.typeConfig, oMDCFilterBar.getTypeUtil()));
					}
				} else if (!oProperty) {
					Log.error("no such property: " + sFieldPath);
				}
			}

			aParams = [];
			for (i = 0; i < oParameters.parameters.length; i++) {
				sFieldPath = oParameters.parameters[i];
				if (mInternalParameterConditions[sFieldPath] && (mInternalParameterConditions[sFieldPath].length > 0)) {
					sEdmType = oParameters.parameterTypes[sFieldPath];
					aParams.push(sFieldPath + '=' + encodeURIComponent(ODataUtils.formatLiteral(mInternalParameterConditions[sFieldPath][0].values[0], sEdmType)));
				} else {
					Log.error("no value found parameter '" + sFieldPath + "'");
				}

			}


			// create parameter context
			return '/' + sEntitySetName + '(' + aParams.toString() + ")/" + oParameters.parameterNavigationName;
		},

		/**
		 * Determines the parameter path
		 *
		 * @param {sap.ui.mdc.FilterBar} oMDCFilterBar - instance of the filter bar
		 * @param {map} mConditions - map with externalized conditions
		 * @returns {string} path information
		 * @protected
		 */
		getParametersInfo : function(oMDCFilterBar, mConditions) {
			var oParameters = DelegateUtil._getParameters(oMDCFilterBar);

			return DelegateUtil._getParameterPath(oMDCFilterBar, mConditions, oParameters);
		},


		/**
		 * Static function that replaces special characters with a underscore.<br>
		 *
		 * @param {sap.ui.mdc.FilterBar} oMDCFilterBar - instance of the filter bar
		 * @param {map} mConditions - map with externalized conditions
		 * @returns {string} path information
		 * @protected
		 */
		getParameterNames : function(oMDCFilterBar) {
			var aParameterNames = null, oParameters = DelegateUtil._getParameters(oMDCFilterBar);

			if (oParameters) {
				aParameterNames = oParameters.parameters;
			}

			return aParameterNames;
		}
	};



	return DelegateUtil;
}, /* bExport= */true);
