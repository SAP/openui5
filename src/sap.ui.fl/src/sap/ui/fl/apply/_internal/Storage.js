/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/StorageResultMerger",
	"sap/ui/fl/apply/_internal/storageResultDisassemble"
], function(
	StorageUtils,
	StorageResultMerger,
	storageResultDisassemble
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistence like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.apply._internal.Storage
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */

	function loadFlexDataFromConnectors (mPropertyBag, aConnectors) {
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			var oConnectorSpecificPropertyBag = Object.assign(mPropertyBag, {url: oConnectorConfig.url, path: oConnectorConfig.url});
			return oConnectorConfig.applyConnectorModule.loadFlexData(oConnectorSpecificPropertyBag)
				.then(function (oResponse) {
					// ensure an object with the corresponding propeties
					return oResponse || StorageUtils.getEmptyFlexDataResponse();
				})
				.catch(StorageUtils.logAndResolveDefault.bind(undefined, StorageUtils.getEmptyFlexDataResponse(), oConnectorConfig, "loadFlexData"));
		});

		return Promise.all(aConnectorPromises);
	}

	function flattenResponses(aResponses) {
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


	function flattenInnerResponses(mResponseObject) {
		mResponseObject.responses = flattenResponses(mResponseObject.responses);
		return mResponseObject;
	}

	function disassembleVariantSectionsIfNecessary(aResponses) {
		var aDisassembledResponses = aResponses.map(function (oResponse) {
			return oResponse.variantSection ? storageResultDisassemble(oResponse) : oResponse;
		});

		return {
			responses: aDisassembledResponses
		};
	}

	var Storage = {};

	/**
	 * Provides the flex data for a given application based on the configured connectors, the application reference and its version.
	 *
	 * @param {map} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.componentName] componentName of the application which may differ from the reference in case of an app variant
	 * @param {string} [mPropertyBag.appVersion] version of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.cacheKey] cacheKey which can be used to etag / cachebuster the request
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.loadFlexData = function (mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("No reference was provided");
		}

		return StorageUtils.getApplyConnectors()
			.then(loadFlexDataFromConnectors.bind(this, mPropertyBag))
			.then(flattenResponses)
			.then(disassembleVariantSectionsIfNecessary)
			.then(flattenInnerResponses)
			.then(StorageResultMerger.merge);
	};

	return Storage;
}, true);
