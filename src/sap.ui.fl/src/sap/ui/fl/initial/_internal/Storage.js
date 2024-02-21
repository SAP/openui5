/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_merge",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/storageResultDisassemble",
	"sap/ui/fl/initial/_internal/StorageFeaturesMerger",
	"sap/ui/fl/initial/_internal/StorageResultMerger",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Layer"
], function(
	_merge,
	FlexInfoSession,
	storageResultDisassemble,
	StorageFeaturesMerger,
	StorageResultMerger,
	StorageUtils,
	Layer
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistence like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.initial._internal.Storage
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */

	function _loadFlexDataFromConnectors(mPropertyBag, aConnectors) {
		var aConnectorPromises = aConnectors.map(function(oConnectorConfig) {
			var oConnectorSpecificPropertyBag = Object.assign({}, mPropertyBag, {
				url: oConnectorConfig.url,
				path: oConnectorConfig.path
			});

			var oFlexInfoSession = FlexInfoSession.getByReference(mPropertyBag.reference);
			if (
				!oConnectorConfig.layers
				|| (
					oConnectorConfig.layers[0] !== "ALL"
					&& oConnectorConfig.layers.indexOf(Layer.CUSTOMER) === -1
				)
			) {
				delete oConnectorSpecificPropertyBag.version;
			} else {
				// a sign that we are in the RTA mode and allContexts query parameter should be set for flex/data request
				if (oFlexInfoSession.initialAllContexts) {
					oConnectorSpecificPropertyBag.allContexts = true;
				}
				if (!oConnectorSpecificPropertyBag.version && oFlexInfoSession.version) {
					oConnectorSpecificPropertyBag.version = oFlexInfoSession.version;
				}
			}
			var bIsRtaStarting = !!window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
			// save change and activate version do not trigger a reload, need saveChangeKeepSession to keep values in the session
			if (!bIsRtaStarting && !oFlexInfoSession.saveChangeKeepSession) {
				delete oFlexInfoSession.version;
				delete oFlexInfoSession.maxLayer;
				delete oFlexInfoSession.adaptationLayer;
				FlexInfoSession.setByReference(oFlexInfoSession, mPropertyBag.reference);
			}

			return oConnectorConfig.loadConnectorModule.loadFlexData(oConnectorSpecificPropertyBag)
			.then(function(oResponse) {
				// ensure an object with the corresponding properties
				return oResponse || StorageUtils.getEmptyFlexDataResponse();
			})
			.catch(StorageUtils.logAndResolveDefault.bind(
				undefined,
				StorageUtils.getEmptyFlexDataResponse(),
				oConnectorConfig,
				"loadFlexData"
			));
		});

		return Promise.all(aConnectorPromises);
	}

	function _flattenResponses(aResponses) {
		var aFlattenedResponses = [];

		aResponses.forEach(function(oResponse) {
			if (Array.isArray(oResponse)) {
				aFlattenedResponses = aFlattenedResponses.concat(oResponse);
			} else {
				aFlattenedResponses.push(oResponse);
			}
		});

		return aFlattenedResponses;
	}

	function _disassembleVariantSectionsIfNecessary(aResponses) {
		return aResponses.map(function(oResponse) {
			return storageResultDisassemble(oResponse);
		});
	}

	function _flattenAndMergeResultPromise(aResponses) {
		return Promise.resolve(aResponses)
		.then(_flattenResponses)
		.then(_disassembleVariantSectionsIfNecessary)
		.then(_flattenResponses)
		.then(StorageResultMerger.merge);
	}

	function _loadFlexDataFromStaticFileConnector(mPropertyBag) {
		return StorageUtils.getStaticFileConnector().then(_loadFlexDataFromConnectors.bind(this, mPropertyBag));
	}

	function _sendLoadFeaturesToConnector(aConnectors) {
		var aConnectorPromises = aConnectors.map(function(oConnectorConfig) {
			// Tolerance for connectors that do not have loadFeature implemented
			if (!oConnectorConfig?.loadConnectorModule?.loadFeatures) {
				return Promise.resolve(StorageUtils.logAndResolveDefault({
					features: {},
					layers: oConnectorConfig.layers
				}, oConnectorConfig, "loadFeatures"));
			}
			return oConnectorConfig.loadConnectorModule.loadFeatures({url: oConnectorConfig.url})
			.then(function(oFeatures) {
				return {
					features: oFeatures,
					layers: oConnectorConfig.layers
				};
			})
			.catch(StorageUtils.logAndResolveDefault.bind(null, {
				features: {},
				layers: oConnectorConfig.layers
			}, oConnectorConfig, "loadFeatures"));
		});

		return Promise.all(aConnectorPromises);
	}

	async function loadVariantsAuthorsFromConnectors(sReference, aConnectors) {
		const aResponses = await Promise.all(aConnectors.map(function(oConnectorConfig) {
			// Tolerance for connectors that do not have loadFeature implemented
			if (!oConnectorConfig?.loadConnectorModule?.loadVariantsAuthors) {
				return Promise.resolve(StorageUtils.logAndResolveDefault({}, oConnectorConfig, "loadVariantsAuthors"));
			}
			const oConnectorSpecificPropertyBag = Object.assign({reference: sReference}, {
				url: oConnectorConfig.url
			});
			return oConnectorConfig.loadConnectorModule.loadVariantsAuthors(oConnectorSpecificPropertyBag)
			.then((oResponse) => oResponse || {})
			.catch(StorageUtils.logAndResolveDefault.bind(
				undefined,
				{},
				oConnectorConfig,
				"loadVariantsAuthors"
			));
		}));
		return _merge({}, ...aResponses);
	}

	var Storage = {};

	/**
	 * Provides the information which features are provided based on the responses of the involved connectors.
	 *
	 * @returns {Promise<Object>} Map feature flags and additional provided information from the connectors
	 */
	Storage.loadFeatures = function() {
		return StorageUtils.getLoadConnectors()
		.then(_sendLoadFeaturesToConnector)
		.then(StorageFeaturesMerger.mergeResults);
	};

	/**
	 * Provides the flex bundle data for a given application based on the application reference and its version.
	 *
	 * @param {object} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {object} mPropertyBag.partialFlexData contains partial FlexState
	 * @param {string} [mPropertyBag.componentName] componentName of the application which may differ from the reference in case of an app variant
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.completeFlexData = function(mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("No reference was provided");
		}

		return Promise.all([_loadFlexDataFromStaticFileConnector(mPropertyBag), mPropertyBag.partialFlexData])
		.then(_flattenAndMergeResultPromise);
	};

	/**
	 * Provides the flex data for a given application based on the configured connectors, the application reference and its version.
	 *
	 * @param {object} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.componentName] componentName of the application which may differ from the reference in case of an app variant
	 * @param {string} [mPropertyBag.cacheKey] cacheKey which can be used to etag / cachebuster the request
	 * @param {number} [mPropertyBag.version] - Number of the version for which the data should be loaded
	 * @param {boolean} [mPropertyBag.allContexts] Includes also restricted context
	 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation to be loaded
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.loadFlexData = function(mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("No reference was provided");
		}

		return StorageUtils.getLoadConnectors()
		.then(_loadFlexDataFromConnectors.bind(this, mPropertyBag))
		.then(_flattenAndMergeResultPromise);
	};

	/**
	 * Load the names of variants' authors for a given application.
	 *
	 * @param {string} sReference - Flex reference of application
	 * @returns {Promise<object>} Resolving with a list of maps between variant ID and author name
	 */
	Storage.loadVariantsAuthors = function(sReference) {
		if (!sReference) {
			return Promise.reject("No reference was provided");
		}
		return StorageUtils.getLoadConnectors()
		.then(loadVariantsAuthorsFromConnectors.bind(this, sReference));
	};

	return Storage;
});
