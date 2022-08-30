/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/write/_internal/StorageFeaturesMerger",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/base/util/ObjectPath"
], function(
	StorageUtils,
	StorageFeaturesMerger,
	States,
	ObjectPath
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistencies like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.write._internal.Storage
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */

	var WRITE_CONNECTOR_NAME_SPACE = "sap/ui/fl/write/_internal/connectors/";

	/**
	 * Provides all mandatory connectors to write data; these are the connector mentioned in the core-Configuration.
	 *
	 * @returns {Promise<map[]>} Resolving with a list of maps for all configured write connectors and their requested modules
	 */
	function _getWriteConnectors() {
		return StorageUtils.getConnectors(WRITE_CONNECTOR_NAME_SPACE, false);
	}

	function findConnectorConfigForLayer(sLayer, aConnectors) {
		var aFilteredConnectors = aConnectors.filter(function (oConnector) {
			return oConnector.layers.indexOf("ALL") !== -1 || oConnector.layers.indexOf(sLayer) !== -1;
		});

		if (aFilteredConnectors.length === 1) {
			return aFilteredConnectors[0];
		}

		if (aFilteredConnectors.length === 0) {
			throw new Error("No Connector configuration could be found to write into layer: " + sLayer);
		}

		if (aFilteredConnectors.length > 1) {
			throw new Error("sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: Multiple Connector configurations were found to write into layer: " + sLayer);
		}
	}

	function _sendLoadFeaturesToConnector(aConnectors) {
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			return oConnectorConfig.writeConnectorModule.loadFeatures({url: oConnectorConfig.url})
				.then(function (oFeatures) {
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

	/**
	 * Determines the connector in charge for a given layer.
	 *
	 * @param {string} sLayer - Layer on which the file should be stored
	 * @returns {Promise<sap.ui.fl.write.connectors.BaseConnector>} Returns the connector in charge for the layer or rejects in case no connector can be determined
	 */
	function _getConnectorConfigByLayer(sLayer) {
		if (!sLayer) {
			return Promise.reject("No layer was provided");
		}
		return _getWriteConnectors()
			.then(findConnectorConfigForLayer.bind(this, sLayer));
	}

	function _validateDraftScenario(mPropertyBag) {
		if (mPropertyBag.draft) {
			return new Promise(function (resolve, reject) {
				// no loop of classes included since loadFeatures is not using executeActionsByName
				sap.ui.require(["sap/ui/fl/write/api/FeaturesAPI"], function (FeaturesAPI) {
					FeaturesAPI.isVersioningEnabled(mPropertyBag.layer)
						.then(function (bDraftEnabled) {
							if (bDraftEnabled) {
								resolve();
							} else {
								reject("Draft is not supported for the given layer: " + mPropertyBag.layer);
							}
						});
				});
			});
		}

		return Promise.resolve();
	}

	function evaluateCondensing(mPropertyBag) {
		var mCondense;
		if (
			mPropertyBag.allChanges
			&& mPropertyBag.allChanges.length
			&& mPropertyBag.condensedChanges
		) {
			mCondense = {
				namespace: mPropertyBag.allChanges[0].convertToFileContent().namespace,
				layer: mPropertyBag.layer,
				"delete": {
					change: []
				},
				update: {
					change: []
				},
				reorder: {
					change: []
				},
				create: {
					change: [],
					ctrl_variant_change: [],
					ctrl_variant_management_change: []
				}
			};

			var iOffset = 0;
			var bAlreadyReordered = false;
			mPropertyBag.allChanges.forEach(function(oChange, index) {
				if (oChange.getFileType() === "ctrl_variant") {
					return;
				}
				var iChangeCreateIndex = mCondense.create[oChange.getFileType()].length;
				if (oChange.condenserState) {
					var bDifferentOrder = false;
					if (oChange.condenserState === "delete") {
						if (oChange.getState() === States.PERSISTED) {
							mCondense.delete.change.push(oChange.getId());
						}
						iOffset++;
					} else if (mPropertyBag.condensedChanges.length) {
						bDifferentOrder = mPropertyBag.allChanges[index].getId() !== mPropertyBag.condensedChanges[index - iOffset].getId();
					}
					if ((oChange.condenserState === "select" || oChange.condenserState === "update") && bDifferentOrder && !bAlreadyReordered) {
						var aReorderedChanges = mPropertyBag.condensedChanges.slice(index - iOffset).map(function(oChange) {
							return oChange.getId();
						});
						mCondense.reorder.change = aReorderedChanges;
						bAlreadyReordered = true;
					}
					if (oChange.condenserState === "select" && oChange.getState() === States.NEW) {
						mCondense.create.change[iChangeCreateIndex] = {};
						mCondense.create.change[iChangeCreateIndex][oChange.getId()] = oChange.convertToFileContent();
					} else if (oChange.condenserState === "update") {
						var iChangeUpdateIndex = mCondense.update.change.length;
						mCondense.update.change[iChangeUpdateIndex] = {};
						mCondense.update.change[iChangeUpdateIndex][oChange.getId()] = {
							content: oChange.getContent()
						};
					}

					delete oChange.condenserState;
				} else if (oChange.getState() === States.NEW) {
					mCondense.create[oChange.getFileType()][iChangeCreateIndex] = {};
					mCondense.create[oChange.getFileType()][iChangeCreateIndex][oChange.getId()] = oChange.convertToFileContent();
				}
			});
		}

		return mCondense;
	}

	function _executeActionByName(sActionName, mPropertyBag) {
		return _validateDraftScenario(mPropertyBag)
			.then(_getConnectorConfigByLayer.bind(undefined, mPropertyBag.layer))
			.then(function (oConnectorConfig) {
				mPropertyBag.url = oConnectorConfig.url;
				var oConnector = ObjectPath.get(sActionName, oConnectorConfig.writeConnectorModule);
				return oConnector.call(oConnectorConfig.writeConnectorModule, mPropertyBag);
			});
	}

	var Storage = {};

	/**
	 * Stores the flex data by calling the according write of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag - Contains additional information for all the Connectors
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer on which the file should be stored
	 * @param {object[]} mPropertyBag.flexObjects - Data to be stored
	 * @param {string} [mPropertyBag._transport] - The transport ID which will be handled internally, so there is no need to be passed
	 * @param {boolean} [mPropertyBag.isLegacyVariant] - Whether the update data has file type .variant or not
	 * @param {number} [nParentVersion] - Indicates if changes should be written as a draft and on which version the changes should be based on
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Storage.write = function(mPropertyBag) {
		return _executeActionByName("write", mPropertyBag);
	};

	/**
	 * Stores the flex data by calling the according condense of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag - Contains additional information for all the Connectors
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer on which the file should be stored
	 * @param {sap.ui.fl.Change[]} mPropertyBag.allChanges - All changes for the given layer and app
	 * @param {sap.ui.fl.Change[]} mPropertyBag.condensedChanges - The changes returned by the condenser
	 * @param {string} [mPropertyBag._transport] - The transport ID which will be handled internally, so there is no need to be passed
	 * @param {boolean} [mPropertyBag.isLegacyVariant] - Whether the update data has file type .variant or not
	 * @param {number} [nParentVersion] - Indicates if changes should be written as a draft and on which version the changes should be based on
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Storage.condense = function(mPropertyBag) {
		mPropertyBag.flexObjects = evaluateCondensing(mPropertyBag);
		if (!mPropertyBag.flexObjects) {
			return Promise.reject("No changes were provided");
		}
		return _executeActionByName("condense", mPropertyBag);
	};

	/**
	 * Delete an existing flex data by calling the according remove of the connector in charge of the passed layer;
	 * The promise is rejected in case the removing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag - Contains additional information for all the Connectors
	 * @param {sap.ui.fl.Change} mPropertyBag.flexObject - Flex Object to be deleted
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer on which the data should be deleted
	 * @param {string} [mPropertyBag._transport] - The transport ID which will be handled internally, so there is no need to be passed
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Storage.remove = function(mPropertyBag) {
		return _executeActionByName("remove", mPropertyBag);
	};

	/**
	 * Update an existing flex data by calling the according update of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag - Contains additional information for all the Connectors
	 * @param {object} mPropertyBag.flexObject - Flex object to be deleted
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer on which the data should be deleted
	 * @param {string} [mPropertyBag._transport] - The transport ID which will be handled internally, so there is no need to be passed
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Storage.update = function(mPropertyBag) {
		return _executeActionByName("update", mPropertyBag);
	};

	/**
	 * @typedef {object} ResetResponseEntry
	 * @property {string} fileName
	 */

	/**
	 * Resets the flex data by calling the according reset of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag - Contains additional information for all the Connectors
	 * @param {string} mPropertyBag.reference - Flexibility reference
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer on which the reset should take place
	 * @param {sap.ui.fl.Change[]} mPropertyBag.changes - Changes of the selected layer and flex reference
	 * @param {string} [mPropertyBag.generator] - Generator with which the changes were created
	 * @param {string[]} [mPropertyBag.selectorIds] - Selector IDs of controls for which the reset should filter
	 * @param {string} [mPropertyBag.changeTypes] - Change types of the changes which should be reset
	 *
	 * @returns {Promise<ResetResponseEntry[]>} Resolves as an array after the reset is completed and returns the reset changes; rejects in case of an error
	 */
	Storage.reset = function(mPropertyBag) {
		return _executeActionByName("reset", mPropertyBag);
	};

	/**
	 * Gets the flexibility info for a given application and layer.
	 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
	 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
	 * @param {string} mPropertyBag.reference - Flex reference
	 * @param {string} [mPropertyBag.url] - Configured url for the connector
	 * @returns {Promise<object>} Promise resolves as soon as the writing was completed
	 */
	Storage.getFlexInfo = function(mPropertyBag) {
		return _executeActionByName("getFlexInfo", mPropertyBag);
	};

	/**
	 * Gets the variant management context information.
	 * The context information is a JSON object that has boolean property 'lastHitReached'
	 * indicating that the result is paginated and whether there are more contexts that can be fetched from the backend.
	 * The context also contains a JSON object 'types' which has a string property 'type' denoting the type of context (e.g. 'ROLE')
	 * and an array property 'values' containing the id and description of each context.
	 * The context can be filtered by setting the $filter parameter and the next page of results can be retrieved by setting the $skip parameter.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
	 * @param {string} mPropertyBag.type - Type of context
	 * @param {string} [mPropertyBag.$skip] - Offset for paginated request
	 * @param {string} [mPropertyBag.$filter] - Filters full raw data
	 * @returns {Promise<object>} Promise resolves as soon as context has been retrieved
	 */
	Storage.getContexts = function(mPropertyBag) {
		return _executeActionByName("getContexts", mPropertyBag);
	};

	/**
	 * Loads the variant management context description in the correct language based on the browser configuration.
	 *
	 * @param {object} mPropertyBag Property bag
	 * @param {string} mPropertyBag.flexObjects Payload for the post request
	 * @returns {Promise<object>} Promise resolves as soon as context descriptions have been retrieved
	 */
	Storage.loadContextDescriptions = function(mPropertyBag) {
		return _executeActionByName("loadContextDescriptions", mPropertyBag);
	};

	/**
	 * Checks if variant management context sharing is enabled.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
	 * @returns {Promise<boolean>} Promise resolves true if context sharing is enabled
	 */
	Storage.isContextSharingEnabled = function(mPropertyBag) {
		return _executeActionByName("isContextSharingEnabled", mPropertyBag);
	};

	/**
	 * Provides the information which features are provided based on the responses of the involved connectors.
	 *
	 * @returns {Promise<Object>} Map feature flags and additional provided information from the connectors
	 */
	Storage.loadFeatures = function() {
		return _getWriteConnectors()
			.then(_sendLoadFeaturesToConnector)
			.then(StorageFeaturesMerger.mergeResults);
	};

	/**
	 * Transports all the UI changes and app variant descriptor (if exists) to the target system.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.url - Configured url for the connector
	 * @param {object} mPropertyBag.transportDialogSettings - Settings for Transport dialog
	 * @param {object} mPropertyBag.transportDialogSettings.rootControl - The root control of the running application
	 * @param {string} mPropertyBag.transportDialogSettings.styleClass - Style class name to be added in the TransportDialog
	 * @param {string} mPropertyBag.layer - Working layer
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {sap.ui.fl.Change[]} mPropertyBag.localChanges - Local changes to be published
	 * @param {object[]} [mPropertyBag.appVariantDescriptors] - An array of app variant descriptors which needs to be transported
	 * @returns {Promise<string>} Promise that can resolve to the following strings:
	 * - "Cancel" if publish process was canceled
	 * - <sMessage> when all the artifacts are successfully transported fl will return the message to show
	 * - "Error" in case of a problem
	 */
	Storage.publish = function(mPropertyBag) {
		return _executeActionByName("publish", mPropertyBag);
	};

	Storage.contextBasedAdaptation = {
		create: function(mPropertyBag) {
			return _getWriteConnectors()
				.then(_executeActionByName.bind(undefined, "contextBasedAdaptation.create", mPropertyBag));
		}
	};
	Storage.versions = {
		/**
		 * Loads the versions for a given application and layer.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
		 * @param {string} mPropertyBag.reference - Flex reference
		 * @param {string} mPropertyBag.limit - Maximum number of required versions
		 * @returns {Promise<sap.ui.fl.Version[]>} Promise resolving with a list of versions if available;
		 * rejects if an error occurs or the layer does not support draft handling
		 */
		load: function (mPropertyBag) {
			return _getWriteConnectors()
				.then(_executeActionByName.bind(undefined, "versions.load", mPropertyBag));
		},

		/**
		 * Activates the draft for a given application and layer.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
		 * @param {string} mPropertyBag.reference - Flex reference
		 * @param {string} mPropertyBag.title - Title of the to be activated version
		 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the activated version;
		 * rejects if an error occurs or the layer does not support draft handling
		 */
		activate: function (mPropertyBag) {
			return _getWriteConnectors()
				.then(_executeActionByName.bind(undefined, "versions.activate", mPropertyBag));
		},

		/**
		 * Discards the draft for a given application and layer.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
		 * @param {string} mPropertyBag.reference - Flex reference
		 * @returns {Promise} Promise resolving after the draft is discarded;
		 * rejects if an error occurs or the layer does not support draft handling
		 */
		discardDraft: function (mPropertyBag) {
			return _getWriteConnectors()
				.then(_executeActionByName.bind(undefined, "versions.discardDraft", mPropertyBag));
		},

		publish: function (mPropertyBag) {
			return _getWriteConnectors()
			.then(_executeActionByName.bind(undefined, "versions.publish", mPropertyBag));
		}
	};

	Storage.translation = {
		/**
		 * Gets the source languages for the given application.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
		 * @param {string} mPropertyBag.reference - Flexibility reference
		 * @returns {Promise} Resolving after the languages are retrieved;
		 * rejects if an error occurs
		 */
		getSourceLanguages: function (mPropertyBag) {
			// TODO: cache the request & invalidate it in case of a writing operation
			return _getWriteConnectors()
				.then(_executeActionByName.bind(undefined, "translation.getSourceLanguages", mPropertyBag));
		},

		/**
		 * Gets the translatable texts for the given source & target language for the given application
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
		 * @param {string} mPropertyBag.sourceLanguage - Source language for for which the request should be made
		 * @param {string} mPropertyBag.targetLanguage - Target language for for which the request should be made
		 * @param {string} mPropertyBag.reference - Flexibility reference
		 * @returns {Promise} Resolving after the languages are retrieved;
		 * rejects if an error occurs
		 */
		getTexts: function (mPropertyBag) {
			return _getWriteConnectors()
			.then(_executeActionByName.bind(undefined, "translation.getTexts", mPropertyBag));
		},

		/**
		 * Uploads an XLIFF file.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
		 * @param {object} mPropertyBag.payload - The file to be uploaded
		 * @returns {Promise} Resolves after the file was uploaded;
		 * rejects if an error occurs or the parameter is missing
		 */
		postTranslationTexts: function (mPropertyBag) {
			return _getWriteConnectors()
			.then(_executeActionByName.bind(undefined, "translation.postTranslationTexts", mPropertyBag));
		}
	};

	return Storage;
});
