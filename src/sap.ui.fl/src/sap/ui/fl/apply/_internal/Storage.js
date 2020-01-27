/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/_internal/StorageResultMerger",
	"sap/ui/fl/apply/_internal/storageResultDisassemble"
], function(
	StorageUtils,
	FlUtils,
	LayerUtils,
	StorageResultMerger,
	storageResultDisassemble
) {
	"use strict";

	function _addDraftLayerToResponsibleConnectorsPropertyBag(oConnectorSpecificPropertyBag, oConnectorConfig, sDraftLayer) {
		if (oConnectorConfig.layers && (oConnectorConfig.layers[0] === "ALL" || oConnectorConfig.layers.indexOf(sDraftLayer) !== -1)) {
			oConnectorSpecificPropertyBag.draftLayer = sDraftLayer;
		} else {
			// removes an existing draftLayer entry copied from the original mPropertyBag
			delete oConnectorSpecificPropertyBag.draftLayer;
		}

		return oConnectorSpecificPropertyBag;
	}

	/**
	 * Abstraction providing an API to handle communication with persistence like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.apply._internal.Storage
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */

	function _loadFlexDataFromConnectors(mPropertyBag, aConnectors) {
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			var oConnectorSpecificPropertyBag = Object.assign({}, mPropertyBag, {
				url: oConnectorConfig.url,
				path: oConnectorConfig.url
			});

			var sDraftLayer = mPropertyBag.draftLayer || FlUtils.getUrlParameter(LayerUtils.FL_DRAFT_PARAM) || "";
			oConnectorSpecificPropertyBag = _addDraftLayerToResponsibleConnectorsPropertyBag(oConnectorSpecificPropertyBag, oConnectorConfig, sDraftLayer);

			return oConnectorConfig.applyConnectorModule.loadFlexData(oConnectorSpecificPropertyBag)
				.then(function (oResponse) {
					// ensure an object with the corresponding propeties
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


	function _flattenInnerResponses(mResponseObject) {
		mResponseObject.responses = _flattenResponses(mResponseObject.responses);
		return mResponseObject;
	}

	function _disassembleVariantSectionsIfNecessary(aResponses) {
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
	 * @param {string} [mPropertyBag.draftLayer] - Layer for which the draft should be loaded
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.loadFlexData = function (mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject("No reference was provided");
		}

		return StorageUtils.getApplyConnectors()
			.then(_loadFlexDataFromConnectors.bind(this, mPropertyBag))
			.then(_flattenResponses)
			.then(_disassembleVariantSectionsIfNecessary)
			.then(_flattenInnerResponses)
			.then(StorageResultMerger.merge);
	};

	return Storage;
}, true);
