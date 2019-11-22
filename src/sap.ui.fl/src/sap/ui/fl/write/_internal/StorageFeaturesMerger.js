/*
 * ! ${copyright}
 */

sap.ui.define([
], function (
) {
	"use strict";

	/**
	 * ConnectorFeaturesMerger class for Connector implementations (write).
	 *
	 * @namespace sap.ui.fl.write._internal.StorageFeaturesMerger
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */

	var DEFAULT_FEATURES = {
		isKeyUser: false,
		isVariantSharingEnabled: false,
		isAtoAvailable: false,
		isAtoEnabled: false,
		isProductiveSystem: true,
		isZeroDowntimeUpgradeRunning: false,
		system: "",
		client: ""
	};

	return {
		/**
		 * Merges the results from all involved connectors otherwise take default value.
		 *
		 * @param {object[]} aResponses All responses provided by the different connectors
		 * @returns {object} Merged result
		 */
		mergeResults: function(aResponses) {
			var oResult = DEFAULT_FEATURES;
			aResponses.forEach(function (oResponse) {
				Object.keys(oResponse).forEach(function (sKey) {
					oResult[sKey] = oResponse[sKey];
				});
			});
			return oResult;
		}
	};
});
