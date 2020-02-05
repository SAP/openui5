/*
 * ! ${copyright}
 */

/* global XMLHttpRequest */

sap.ui.define([
	"sap/base/security/encodeURLParameters",
	"sap/base/Log",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils"
], function (
	encodeURLParameters,
	Log,
	Layer,
	LayerUtils
) {
	"use strict";

	/**
	 * Util class for Storage implementations (apply); In addition the ObjectPathConnector and ObjectStorageConnector makes
	 * use of this class since they are very low level connector implementations without preparing structures of responses.
	 *
	 * @namespace sap.ui.fl.apply._internal.StorageUtils
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage, sap.ui.fl.write._internal.Storage,
	 * 	sap.ui.fl.apply._internal.connectors.ObjectStorageConnector, sap.ui.fl.apply._internal.connectors.ObjectPathConnector
	 */

	var APPLY_CONNECTOR_NAME_SPACE = "sap/ui/fl/apply/_internal/connectors/";
	var STATIC_FILE_CONNECTOR_CONFIGURATION = {
		connector: "StaticFileConnector"
	};

	function _filterValidLayers(aLayers, aValidLayers) {
		return aLayers.filter(function (sLayer) {
			return aValidLayers.indexOf(sLayer) !== -1 || aValidLayers[0] === "ALL";
		});
	}

	/**
	 * Sort grouped flexibility objects by their creation timestamp.
	 *
	 * @param {object} [mResult] Grouped flexibility objects
	 * @returns {object} Map of grouped flexibility objects per layer sorted by their creation timestamp
	 */
	function sortGroupedFlexObjects(mResult) {
		function byCreation(oChangeA, oChangeB) {
			return new Date(oChangeA.creation) - new Date(oChangeB.creation);
		}

		[
			"changes",
			"variantChanges",
			"variants",
			"variantDependentControlChanges",
			"variantManagementChanges"
		].forEach(function (sSectionName) {
			mResult[sSectionName] = mResult[sSectionName].sort(byCreation);
		});

		return mResult;
	}

	function _getConnectorConfigurations(sNameSpace, bLoadApplyConnectors, mConnectors) {
		return mConnectors.map(function (mConnectorConfiguration) {
			var sConnector = mConnectorConfiguration.connector;
			var sConnectorModuleName;

			if (!mConnectorConfiguration.custom) {
				sConnectorModuleName = sNameSpace + sConnector;
			} else {
				sConnectorModuleName = bLoadApplyConnectors ? mConnectorConfiguration.applyConnector : mConnectorConfiguration.writeConnector;
			}

			return sConnectorModuleName;
		});
	}

	function _requireConnectorsByConfiguration(sNameSpace, bLoadApplyConnectors, mConnectors) {
		var aConnectors = _getConnectorConfigurations(sNameSpace, bLoadApplyConnectors, mConnectors);

		return new Promise(function (resolve) {
			sap.ui.require(aConnectors, function () {
				Array.from(arguments).forEach(function (oConnector, iIndex) {
					if (!bLoadApplyConnectors) {
						if (!mConnectors[iIndex].layers) {
							mConnectors[iIndex].layers = oConnector.layers;
						} else {
							mConnectors[iIndex].layers = _filterValidLayers(mConnectors[iIndex].layers, oConnector.layers);
						}
					}
					if (bLoadApplyConnectors) {
						mConnectors[iIndex].applyConnectorModule = oConnector;
					} else {
						mConnectors[iIndex].writeConnectorModule = oConnector;
					}
				});

				resolve(mConnectors);
			});
		});
	}

	return {
		/**
		 * Provides all mandatory connectors required to apply or write data depending on the given namespace.
		 *
		 * @param {string} sNameSpace Namespace to determine the path to the configured connectors
		 * @param {boolean} bLoadApplyConnectors Flag to determine if StaticFileConnector should be included and write layers should be checked
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured connectors and their requested modules
		 */
		getConnectors: function (sNameSpace, bLoadApplyConnectors) {
			var aConfiguredConnectors = sap.ui.getCore().getConfiguration().getFlexibilityServices();
			var mConnectors = [];
			if (bLoadApplyConnectors) {
				mConnectors = [STATIC_FILE_CONNECTOR_CONFIGURATION];
			}

			mConnectors = mConnectors.concat(aConfiguredConnectors);

			return _requireConnectorsByConfiguration(sNameSpace, bLoadApplyConnectors, mConnectors);
		},

		/**
		 * Provides all mandatory connectors required to read data for the apply case; these are the static file connector as well as all connectors
		 * mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured apply connectors and their requested modules
		 */
		getApplyConnectors: function () {
			return this.getConnectors(APPLY_CONNECTOR_NAME_SPACE, true);
		},


		/**
		 * Provides only the static file connector.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps static file connector and its requested modules
		 */
		getStaticFileConnector: function () {
			return _requireConnectorsByConfiguration(APPLY_CONNECTOR_NAME_SPACE, true, [STATIC_FILE_CONNECTOR_CONFIGURATION]);
		},

		/**
		 * Creates a Error messages in case of a failed Connector call while getting responses from multiple endpoints
		 *
		 * @param {object} oResponse Response from the sent request
		 * @param {object} oConnectorConfig Configured Connector
		 * @param {string} sFunctionName Name of the called function
		 * @param {string} sErrorMessage Error messages retrieved from the endpoint
		 * @returns {object} oResponse Response from the endpoint
		 */
		logAndResolveDefault: function (oResponse, oConnectorConfig, sFunctionName, sErrorMessage) {
			Log.error("Connector (" + oConnectorConfig.connector + ") failed call '" + sFunctionName + "': " + sErrorMessage);
			return oResponse;
		},

		/**
		 * Takes grouped flexibility objects as input and returns an array of non-empty responses sorted by layer.
		 *
		 * @param {object} mGroupedFlexObjects Grouped flexibility objects
		 * @returns {array} Array of non-empty responses sorted by layer
		 */
		filterAndSortResponses: function (mGroupedFlexObjects) {
			var aResponses = [];
			Object.keys(mGroupedFlexObjects).forEach(function (sLayer) {
				aResponses.push(mGroupedFlexObjects[sLayer]);
			});

			aResponses = aResponses.filter(function (oResponse) {
				return oResponse.changes.length > 0
					|| oResponse.variants.length > 0
					|| oResponse.variantChanges.length > 0
					|| oResponse.variantManagementChanges.length > 0
					|| oResponse.variantDependentControlChanges.length > 0;
			});

			aResponses.sort(function (a, b) {
				return a.index - b.index;
			});

			return aResponses;
		},

		/**
		 * Groups flexibility objects according to their layer and semantics.
		 *
		 * @param {array} aFlexObjects Flexibility objects
		 * @returns {object} Map of grouped flexibility objects per layer
		 */
		getGroupedFlexObjects: function (aFlexObjects) {
			var mGroupedFlexObjects = {};

			// build empty groups
			Object.keys(Layer).forEach(function (sLayer) {
				mGroupedFlexObjects[sLayer] = this.getEmptyFlexDataResponse();
				mGroupedFlexObjects[sLayer].index = LayerUtils.getLayerIndex(sLayer);
			}.bind(this));

			// fill groups
			aFlexObjects.forEach(function (oFlexObject) {
				var sLayer = oFlexObject.layer;

				if (oFlexObject.fileType === "ctrl_variant" && oFlexObject.variantManagementReference) {
					mGroupedFlexObjects[sLayer].variants.push(oFlexObject);
				} else if (oFlexObject.fileType === "ctrl_variant_change") {
					mGroupedFlexObjects[sLayer].variantChanges.push(oFlexObject);
				} else if (oFlexObject.fileType === "ctrl_variant_management_change") {
					mGroupedFlexObjects[sLayer].variantManagementChanges.push(oFlexObject);
				} else if (oFlexObject.fileType === "change" || oFlexObject.fileType === "variant") {
					if (oFlexObject.variantReference) {
						mGroupedFlexObjects[sLayer].variantDependentControlChanges.push(oFlexObject);
					} else {
						mGroupedFlexObjects[sLayer].changes.push(oFlexObject);
					}
				}
			});

			// sort groups
			Object.keys(mGroupedFlexObjects).forEach(function (sLayer) {
				sortGroupedFlexObjects(mGroupedFlexObjects[sLayer]);
			});

			return mGroupedFlexObjects;
		},

		/**
		 * Internal function to allow the connectors to generate a response object with all needed properties;
		 * Also usable for tests to generate these responses.
		 *
		 * @returns {object} Object containing an empty flex data response
		 * @ui5-restricted sap.ui.fl.apply_internal.flexState.FlexState, sap.ui.fl.apply_internal.connectors.ObjectPathConnector,
		 * 	sap.ui.fl.apply_internal
		 */
		getEmptyFlexDataResponse: function () {
			return Object.assign({}, {
				appDescriptorChanges: [],
				changes: [],
				variants: [],
				variantChanges: [],
				variantDependentControlChanges: [],
				variantManagementChanges: [],
				ui2personalization: {}
			});
		}
	};
});