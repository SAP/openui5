/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Layer"
], function(
	merge,
	Layer
) {
	"use strict";

	/**
	 * ConnectorFeaturesMerger class for Connector implementations (initial).
	 *
	 * @namespace sap.ui.fl.intial._internal.StorageFeaturesMerger
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage
	 */

	var DEFAULT_FEATURES = {
		isKeyUser: false,
		isKeyUserTranslationEnabled: false,
		isVariantSharingEnabled: false,
		isPublicFlVariantEnabled: false,
		isVariantPersonalizationEnabled: true,
		isContextSharingEnabled: true,
		isAtoAvailable: false,
		isAtoEnabled: false,
		versioning: {},
		isProductiveSystem: true,
		isPublicLayerAvailable: false,
		isLocalResetEnabled: false,
		isZeroDowntimeUpgradeRunning: false,
		isVariantAuthorNameAvailable: false,
		system: "",
		client: ""
	};

	function _getVersioningFromResponse(oResponse) {
		var oVersioning = {};
		var bVersioningEnabled = !!oResponse.features.isVersioningEnabled;

		if (oResponse?.layers && (oResponse.layers.includes(Layer.CUSTOMER) || oResponse.layers.includes("ALL"))) {
			oVersioning[Layer.CUSTOMER] = bVersioningEnabled;
		}

		return oVersioning;
	}

	return {
		/**
		 * Merges the results from all involved connectors otherwise take default value;
		 * The information if a draft is enabled for a given layer on write is determined by
		 * each connector individually; since getConnectorsForLayer allows no more than 1 connector
		 * for any given layer a merging is not necessary.
		 *
		 * @param {object[]} aResponses - All responses provided by the different connectors
		 * @returns {object} Merged result
		 */
		mergeResults(aResponses) {
			var oResult = DEFAULT_FEATURES;

			aResponses.forEach(function(oResponse) {
				Object.keys(oResponse.features).forEach(function(sKey) {
					if (sKey !== "isVersioningEnabled") {
						oResult[sKey] = oResponse.features[sKey];
					}
				});
				oResult.versioning = merge(oResult.versioning, _getVersioningFromResponse(oResponse));
				if (oResponse.isContextSharingEnabled !== undefined) {
					oResult.isContextSharingEnabled = oResponse.isContextSharingEnabled;
				}
			});
			return oResult;
		}
	};
});
