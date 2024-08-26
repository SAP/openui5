/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/base/util/isEmptyObject"
], function(
	Log,
	FlexConfiguration,
	Layer,
	LayerUtils,
	isEmptyObject
) {
	"use strict";

	/**
	 * Util class for Storage implementations (apply); In addition the ObjectPathConnector and ObjectStorageConnector makes
	 * use of this class since they are very low level connector implementations without preparing structures of responses.
	 *
	 * @namespace sap.ui.fl.initial._internal.StorageUtils
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage,
	 * 	sap.ui.fl.initial._internal.connectors.ObjectStorageConnector, sap.ui.fl.initial._internal.connectors.ObjectPathConnector
	 */

	var mConnectorNamespaces = {
		load: {
			// Server Connectors
			LrepConnector: "sap/ui/fl/initial/_internal/connectors/LrepConnector",
			NeoLrepConnector: "sap/ui/fl/initial/_internal/connectors/NeoLrepConnector",
			PersonalizationConnector: "sap/ui/fl/initial/_internal/connectors/PersonalizationConnector",
			KeyUserConnector: "sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
			BtpServiceConnector: "sap/ui/fl/initial/_internal/connectors/BtpServiceConnector",
			StaticFileConnector: "sap/ui/fl/initial/_internal/connectors/StaticFileConnector",
			// Test & Demo Connectors
			JsObjectConnector: "sap/ui/fl/write/_internal/connectors/JsObjectConnector",
			ObjectPathConnector: "sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
			LocalStorageConnector: "sap/ui/fl/write/_internal/connectors/LocalStorageConnector",
			SessionStorageConnector: "sap/ui/fl/write/_internal/connectors/SessionStorageConnector"
		},
		write: {
			// Server Connectors
			LrepConnector: "sap/ui/fl/write/_internal/connectors/LrepConnector",
			NeoLrepConnector: "sap/ui/fl/write/_internal/connectors/NeoLrepConnector",
			PersonalizationConnector: "sap/ui/fl/write/_internal/connectors/PersonalizationConnector",
			KeyUserConnector: "sap/ui/fl/write/_internal/connectors/KeyUserConnector",
			BtpServiceConnector: "sap/ui/fl/write/_internal/connectors/BtpServiceConnector",
			StaticFileConnector: "sap/ui/fl/write/_internal/connectors/StaticFileConnector",
			// Test & Demo Connectors
			JsObjectConnector: "sap/ui/fl/write/_internal/connectors/JsObjectConnector",
			ObjectPathConnector: "sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
			LocalStorageConnector: "sap/ui/fl/write/_internal/connectors/LocalStorageConnector",
			SessionStorageConnector: "sap/ui/fl/write/_internal/connectors/SessionStorageConnector"
		}
	};

	var INITIAL_CONNECTOR_NAME_SPACE = "sap/ui/fl/initial/_internal/connectors/";
	var STATIC_FILE_CONNECTOR_CONFIGURATION = {
		connector: "StaticFileConnector"
	};

	function _filterValidLayers(aLayers, aConnectorLayers) {
		var aValidLayers = [];
		if (!aLayers) {
			aValidLayers = aConnectorLayers;
		} else {
			aValidLayers = aLayers.filter(function(sLayer) {
				return aConnectorLayers.indexOf(sLayer) !== -1 || aConnectorLayers[0] === "ALL";
			});
		}
		return aValidLayers;
	}

	function _getConnectorConfigurations(sNameSpace, bLoadConnectors, mConnectors) {
		return mConnectors.map(function(mConnectorConfiguration) {
			var sConnector = mConnectorConfiguration.connector;
			var sConnectorModuleName;

			// the applyConnector / loadConnector is used for a custom connector
			if (
				!mConnectorConfiguration.loadConnector
				&& !mConnectorConfiguration.applyConnector
				&& !mConnectorConfiguration.loadConnector
			) {
				sConnectorModuleName = bLoadConnectors ? mConnectorNamespaces.load[sConnector] : mConnectorNamespaces.write[sConnector];
			} else if (bLoadConnectors) {
				// fallback for configured custom connectors which specify a apply connector
				sConnectorModuleName = mConnectorConfiguration.loadConnector || mConnectorConfiguration.applyConnector;
			} else {
				// fall back for scenarios where only a loadConnector is provided
				sConnectorModuleName = mConnectorConfiguration.writeConnector || "sap/ui/fl/write/connectors/BaseConnector";
			}

			return sConnectorModuleName;
		});
	}

	function _requireConnectorsByConfiguration(sNameSpace, bLoadConnectors, mConnectors) {
		var aConnectors = _getConnectorConfigurations(sNameSpace, bLoadConnectors, mConnectors);

		return new Promise(function(resolve) {
			sap.ui.require(aConnectors, function(...aArgs) {
				aArgs.forEach(function(oConnector, iIndex) {
					if (!mConnectors[iIndex].layers) {
						mConnectors[iIndex].layers = oConnector.layers;
					} else {
						mConnectors[iIndex].layers = _filterValidLayers(mConnectors[iIndex].layers, oConnector.layers);
					}
					if (bLoadConnectors) {
						mConnectors[iIndex].loadConnectorModule = oConnector;
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
		 * @param {boolean} bLoadConnectors Flag to determine if the loading scenario is used and the StaticFileConnector should be included
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured connectors and their requested modules
		 */
		getConnectors(sNameSpace, bLoadConnectors) {
			var aConfiguredConnectors = FlexConfiguration.getFlexibilityServices();
			var mConnectors = [];
			if (bLoadConnectors) {
				mConnectors = [STATIC_FILE_CONNECTOR_CONFIGURATION];
			}

			mConnectors = mConnectors.concat(aConfiguredConnectors);

			return _requireConnectorsByConfiguration(sNameSpace, bLoadConnectors, mConnectors);
		},

		/**
		 * Provides all mandatory connectors required to read data for the initial case; these are the static
		 * file connector as well as all connectors mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured initial connectors and their requested modules
		 */
		getLoadConnectors() {
			return this.getConnectors(INITIAL_CONNECTOR_NAME_SPACE, true);
		},

		/**
		 * Provides only the static file connector.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps static file connector and its requested modules
		 */
		getStaticFileConnector() {
			return _requireConnectorsByConfiguration(INITIAL_CONNECTOR_NAME_SPACE, true, [STATIC_FILE_CONNECTOR_CONFIGURATION]);
		},

		/**
		 * Creates an Error messages in case of a failed Connector call while getting responses from multiple endpoints
		 *
		 * @param {object} oResponse Response from the sent request
		 * @param {object} oConnectorConfig Configured Connector
		 * @param {string} sFunctionName Name of the called function
		 * @param {string} [sErrorMessage] Error messages retrieved from the endpoint
		 * @returns {object} oResponse Response from the endpoint
		 */
		logAndResolveDefault(oResponse, oConnectorConfig, sFunctionName, sErrorMessage) {
			Log.error(
				`Connector (${oConnectorConfig.connector}) failed call '${sFunctionName}': ${sErrorMessage}
				Application startup continues without data from this storage.`
			);
			return oResponse;
		},

		/**
		 * Takes grouped flexibility objects as input and returns an array of non-empty responses sorted by layer.
		 *
		 * @param {object} mGroupedFlexObjects Grouped flexibility objects
		 * @returns {array} Array of non-empty responses sorted by layer
		 */
		filterAndSortResponses(mGroupedFlexObjects) {
			var aResponses = [];
			Object.keys(mGroupedFlexObjects).forEach(function(sLayer) {
				aResponses.push(mGroupedFlexObjects[sLayer]);
			});

			aResponses = aResponses.filter(function(oResponse) {
				return oResponse.changes.length > 0
					|| oResponse.appDescriptorChanges.length > 0
					|| oResponse.variants.length > 0
					|| oResponse.variantChanges.length > 0
					|| oResponse.variantManagementChanges.length > 0
					|| oResponse.variantDependentControlChanges.length > 0
					|| oResponse.comp.variants.length > 0
					|| oResponse.comp.changes.length > 0
					|| oResponse.comp.defaultVariants.length > 0
					|| oResponse.comp.standardVariants.length > 0;
			});

			aResponses.sort(function(a, b) {
				return a.index - b.index;
			});

			return aResponses;
		},

		sortFlexObjects(aFlexObjects) {
			const aFlexObjectsWithCreation = aFlexObjects.filter((oFlexObject) => oFlexObject.creation);
			// The Object Storage Connector also delivers "version" entries which don't contain creation
			// and don't require any particular sorting. Therefore they are placed at the beginning of the array.
			const aFlexObjectWithoutCreation = aFlexObjects.filter((oFlexObject) => !oFlexObject.creation);
			aFlexObjectsWithCreation.sort(function(oChangeA, oChangeB) {
				return Date.parse(oChangeA.creation) - Date.parse(oChangeB.creation);
			});
			return aFlexObjectWithoutCreation.concat(aFlexObjectsWithCreation);
		},

		/**
		 * Groups flexibility objects according to their layer and semantics.
		 *
		 * @param {array} aFlexObjects Flexibility objects
		 * @returns {object} Map of grouped flexibility objects per layer
		 */
		getGroupedFlexObjects(aFlexObjects) {
			const aSortedFlexObjects = this.sortFlexObjects(aFlexObjects);
			var mGroupedFlexObjects = {};

			// build empty groups
			Object.keys(Layer).forEach(function(sLayer) {
				mGroupedFlexObjects[sLayer] = this.getEmptyFlexDataResponse();
				mGroupedFlexObjects[sLayer].index = LayerUtils.getLayerIndex(sLayer);
			}.bind(this));

			// fill groups
			aSortedFlexObjects.forEach(function(oFlexObject) {
				var sLayer = oFlexObject.layer;

				if (oFlexObject.fileType === "ctrl_variant" && oFlexObject.variantManagementReference) {
					mGroupedFlexObjects[sLayer].variants.push(oFlexObject);
				} else if (oFlexObject.fileType === "ctrl_variant_change") {
					mGroupedFlexObjects[sLayer].variantChanges.push(oFlexObject);
				} else if (oFlexObject.fileType === "ctrl_variant_management_change") {
					mGroupedFlexObjects[sLayer].variantManagementChanges.push(oFlexObject);
				} else if (oFlexObject.fileType === "variant") {
					mGroupedFlexObjects[sLayer].comp.variants.push(oFlexObject);
				} else if (oFlexObject.fileType === "change") {
					if (oFlexObject.variantReference) {
						mGroupedFlexObjects[sLayer].variantDependentControlChanges.push(oFlexObject);
					} else if (oFlexObject.appDescriptorChange) {
						mGroupedFlexObjects[sLayer].appDescriptorChanges.push(oFlexObject);
					} else {
						switch (oFlexObject.changeType) {
							case "addFavorite":
							case "removeFavorite":
							case "updateVariant":
								mGroupedFlexObjects[sLayer].comp.changes.push(oFlexObject);
								break;
							case "defaultVariant":
								mGroupedFlexObjects[sLayer].comp.defaultVariants.push(oFlexObject);
								break;
							case "standardVariant":
								mGroupedFlexObjects[sLayer].comp.standardVariants.push(oFlexObject);
								break;
							default:
								mGroupedFlexObjects[sLayer].changes.push(oFlexObject);
						}
					}
				}
			});

			return mGroupedFlexObjects;
		},

		/**
		 * Internal function to allow the connectors to generate a response object with all needed properties;
		 * Also usable for tests to generate these responses.
		 *
		 * @returns {object} Object containing an empty flex data response
		 * @ui5-restricted sap.ui.fl.apply_internal.flexState.FlexState, sap.ui.fl.initial._internal.connectors.ObjectPathConnector,
		 * 	sap.ui.fl.apply_internal
		 */
		getEmptyFlexDataResponse() {
			return {
				appDescriptorChanges: [],
				annotationChanges: [],
				changes: [],
				comp: {
					variants: [],
					changes: [],
					defaultVariants: [],
					standardVariants: []
				},
				variants: [],
				variantChanges: [],
				variantDependentControlChanges: [],
				variantManagementChanges: [],
				ui2personalization: {}
			};
		},

		/**
		 * Internal function to identify if storage response has flex objects
		 *
		 * @param {object} oResponse Storage response
		 * @returns {boolean} Indicated if storage response contains flex objects
		 * @ui5-restricted sap.ui.fl
		 */
		isStorageResponseFilled(oResponse) {
			return Object.keys(oResponse || {}).some(function(sKey) {
				if (Array.isArray(oResponse[sKey])) {
					return oResponse[sKey].length !== 0;
				}
				return !isEmptyObject(oResponse[sKey]);
			});
		}
	};
});