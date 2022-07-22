/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/initial/_internal/StorageResultMerger",
	"sap/ui/fl/initial/_internal/storageResultDisassemble",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/FlexInfoSession"
], function(
	StorageUtils,
	StorageResultMerger,
	storageResultDisassemble,
	Version,
	Utils,
	FlexInfoSession
) {
	"use strict";

	function _addDraftLayerToResponsibleConnectorsPropertyBag(oConnectorSpecificPropertyBag, oConnectorConfig, mPropertyBag) {
		if (!oConnectorConfig.layers || (oConnectorConfig.layers[0] !== "ALL" && oConnectorConfig.layers.indexOf("CUSTOMER") === -1)) {
			delete oConnectorSpecificPropertyBag.version;
			return oConnectorSpecificPropertyBag;
		}

		if (_shouldAllContextsParameterBeSet(mPropertyBag.reference)) {
			oConnectorSpecificPropertyBag.allContexts = true;
		}

		if (mPropertyBag.version !== undefined) {
			// an API call set a version number
			oConnectorSpecificPropertyBag.version = mPropertyBag.version;
			return oConnectorSpecificPropertyBag;
		}

		var sVersion = Utils.getUrlParameter(Version.UrlParameter);
		if (sVersion === null) {
			// url parameter is not present --> remove an existing version entry copied from the original mPropertyBag
			delete oConnectorSpecificPropertyBag.version;
		} else {
			oConnectorSpecificPropertyBag.version = parseInt(sVersion);
		}
		return oConnectorSpecificPropertyBag;
	}


	function _shouldAllContextsParameterBeSet(sFlexReference) {
		var oFlexInfoSession = FlexInfoSession.getByReference(sFlexReference);
		// a sign that we are in the RTA mode and allContexts query parameter should be set for flex/data request
		return oFlexInfoSession && oFlexInfoSession.initialAllContexts;
	}

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
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			var oConnectorSpecificPropertyBag = Object.assign({}, mPropertyBag, {
				url: oConnectorConfig.url,
				path: oConnectorConfig.path
			});

			oConnectorSpecificPropertyBag = _addDraftLayerToResponsibleConnectorsPropertyBag(oConnectorSpecificPropertyBag, oConnectorConfig, mPropertyBag);

			return oConnectorConfig.loadConnectorModule.loadFlexData(oConnectorSpecificPropertyBag)
				.then(function (oResponse) {
					// ensure an object with the corresponding properties
					return oResponse || StorageUtils.getEmptyFlexDataResponse();
				})
				.catch(StorageUtils.logAndResolveDefault.bind(undefined, StorageUtils.getEmptyFlexDataResponse(), oConnectorConfig, "loadFlexData"));
		});

		return Promise.all(aConnectorPromises);
	}

	function _flattenResponses(aResponses) {
		var aFlattenedResponses = [];

		aResponses.forEach(function (oResponse) {
			if (Array.isArray(oResponse)) {
				aFlattenedResponses = aFlattenedResponses.concat(oResponse);
			} else {
				aFlattenedResponses.push(oResponse);
			}
		});

		return aFlattenedResponses;
	}

	function _disassembleVariantSectionsIfNecessary(aResponses) {
		return aResponses.map(function (oResponse) {
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

	var Storage = {};

	/**
	 * Provides the flex bundle data for a given application based on the application reference and its version.
	 *
	 * @param {map} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {object} mPropertyBag.partialFlexData contains partial FlexState
	 * @param {string} [mPropertyBag.componentName] componentName of the application which may differ from the reference in case of an app variant
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.completeFlexData = function (mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("No reference was provided");
		}

		return Promise.all([_loadFlexDataFromStaticFileConnector(mPropertyBag), mPropertyBag.partialFlexData])
			.then(_flattenAndMergeResultPromise);
	};

	/**
	 * Provides the flex data for a given application based on the configured connectors, the application reference and its version.
	 *
	 * @param {map} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.componentName] componentName of the application which may differ from the reference in case of an app variant
	 * @param {string} [mPropertyBag.cacheKey] cacheKey which can be used to etag / cachebuster the request
	 * @param {number} [mPropertyBag.version] - Number of the version for which the data should be loaded
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.loadFlexData = function (mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("No reference was provided");
		}

		return StorageUtils.getLoadConnectors()
			.then(_loadFlexDataFromConnectors.bind(this, mPropertyBag))
			.then(_flattenAndMergeResultPromise);
	};

	return Storage;
});
