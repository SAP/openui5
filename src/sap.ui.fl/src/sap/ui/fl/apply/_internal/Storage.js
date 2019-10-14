/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/StorageResultMerger",
	"sap/ui/fl/apply/_internal/storageResultDisassemble"
], function(
	ApplyUtils,
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
			var oConnectorSpecificPropertyBag = Object.assign(mPropertyBag, {url: oConnectorConfig.url});
			return oConnectorConfig.connectorModule.loadFlexData(oConnectorSpecificPropertyBag)
				.catch(ApplyUtils.logAndResolveDefault.bind(undefined, ApplyUtils.getEmptyFlexDataResponse(), oConnectorConfig, "loadFlexData"));
		});

		return Promise.all(aConnectorPromises);
	}

	function flattenResponses(mResponseObject) {
		var aFlattenedResponses = [];

		mResponseObject.responses.forEach(function (oResponse) {
			if (Array.isArray(oResponse)) {
				aFlattenedResponses = aFlattenedResponses.concat(oResponse);
			} else {
				aFlattenedResponses.push(oResponse);
			}
		});
		mResponseObject.responses = aFlattenedResponses;

		return mResponseObject;
	}

	function containsVariantData(aResponses) {
		return aResponses.some(function(oResponse) {
			return oResponse.variants && oResponse.variants.length > 0
				|| oResponse.variantChanges && oResponse.variantChanges.length > 0
				|| oResponse.variantDependentControlChanges && oResponse.variantDependentControlChanges.length > 0
				|| oResponse.variantManagementChanges && oResponse.variantManagementChanges.length > 0;
		});
	}

	function countVariantProvidingResponses(aResponses) {
		var iVariantProvidingResponses = 0;
		aResponses.forEach(function(oResponse) {
			if (oResponse.variantSection && Object.keys(oResponse.variantSection).length > 0) {
				iVariantProvidingResponses++;
			}
		});

		return iVariantProvidingResponses;
	}

	function disassembleVariantSectionsIfNecessary(aResponses) {
		var aDisassembledResponses = [];
		var bResponseContainingFilledVariantPropertyExists = containsVariantData(aResponses);
		var nNumberOfVariantProvidingResponses = countVariantProvidingResponses(aResponses);
		var bVariantSectionSufficient = !bResponseContainingFilledVariantPropertyExists && nNumberOfVariantProvidingResponses <= 1;

		if (bVariantSectionSufficient) {
			aDisassembledResponses = aResponses;
		} else {
			aDisassembledResponses = aResponses.map(function (oResponse) {
				return oResponse.variantSection ? storageResultDisassemble(oResponse) : oResponse;
			});
		}

		return {
			responses: aDisassembledResponses,
			variantSectionSufficient: bVariantSectionSufficient
		};
	}

	var Storage = {};

	/**
	 * Provides the flex data for a given application based on the configured connectors, the application reference and its version.
	 *
	 * @param {map} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.appVersion] version of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.cacheKey] cacheKey which can be used to etag / cachebuster the request
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.loadFlexData = function (mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("No reference was provided");
		}

		return ApplyUtils.getApplyConnectors()
			.then(loadFlexDataFromConnectors.bind(this, mPropertyBag))
			.then(disassembleVariantSectionsIfNecessary)
			.then(flattenResponses)
			.then(StorageResultMerger.merge);
	};

	return Storage;
}, true);
