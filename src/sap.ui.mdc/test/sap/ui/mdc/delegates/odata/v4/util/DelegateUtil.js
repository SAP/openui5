/*!
 * ${copyright}
 */

// ------------------------------------------------------------------------------------------
// Utility class used by mdc v4 delegates for parameter handling
// ------------------------------------------------------------------------------------------
sap.ui.define(['sap/ui/mdc/util/FilterUtil',
			   "sap/ui/mdc/condition/ConditionConverter",
			   'sap/base/Log',
			   'sap/base/util/merge',
			   "sap/ui/model/FilterOperator",
			   "sap/ui/model/odata/v4/ODataUtils"],
		function(FilterUtil, ConditionConverter, Log, merge, FilterOperator, ODataUtils) {
	"use strict";

	/**
	 * Utility class used by mdc v4 delegates for parameter handling
	 *
	 * @private
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

		/**
		 * Determines the parameter path
		 *
		 * @param {sap.ui.mdc.FilterBar} oMDCFilterBar - instance of the filter bar
		 * @returns {string | null} path information
		 * @protected
		 */
		getParametersInfo : function(oMDCFilterBar) {
			var oParameters = DelegateUtil._getParameters(oMDCFilterBar);

			return DelegateUtil._getParameterPath(oMDCFilterBar, oParameters);
		},

		_getParametersListUrl : function(oMDCFilterBar, aParameterNames) {
			var aParams = [];
			var mConditionsMap = FilterUtil.getConditionsMap(oMDCFilterBar, aParameterNames);
			var aPropertyInfos = oMDCFilterBar.getPropertyInfoSet();

			aParameterNames.forEach(function(sParameterName) {
				var oProperty = FilterUtil.getPropertyByKey(aPropertyInfos, sParameterName);

				if (oProperty && (oProperty.maxConditions === 1)) {    						// only single valued parameters are considered
					mConditionsMap[sParameterName].forEach(function(oCondition) {
						if (oCondition.operator === FilterOperator.EQ) {   		            // only the EQ operators are considered
							aParams.push(sParameterName + '=' + encodeURIComponent(ODataUtils.formatLiteral(oCondition.values[0], oProperty.typeConfig.className)));
						}
					});
				}
			});

			return aParams;
		},

		_getParameterPath: function(oMDCFilterBar, oParameters) {

			if (!oMDCFilterBar || !oMDCFilterBar.isA("sap.ui.mdc.FilterBar")) {
				return null;
			}

			if (!oParameters || (oParameters.parameters.length <= 0)) {
				return null;
			}

			var sEntitySetName = oMDCFilterBar.getDelegate().payload.collectionName;

			var aParams = DelegateUtil._getParametersListUrl(oMDCFilterBar, oParameters.parameters);

			// create parameter context
			return '/' + sEntitySetName + '(' + aParams.toString() + ")/" + oParameters.parameterNavigationName;
		},

		/**
		 * Static function that returns the parameter names..
		 *
		 * @param {sap.ui.mdc.FilterBar} oMDCFilterBar - instance of the filter bar
		 * @returns {array | null} list of parameter names
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
});
