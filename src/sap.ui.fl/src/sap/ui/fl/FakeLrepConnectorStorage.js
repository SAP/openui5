/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Utils"
], function(
	FakeLrepConnector,
	LrepConnector,
	Cache,
	ChangePersistenceFactory,
	Utils
) {
	"use strict";

	return function (oFakeLrepStorage) {

		FakeLrepConnectorStorage._oBackendInstances = {};

		/**
		 * Class for connecting to Fake LREP storing changes in localStorage
		 * @param {object} mSettings - map of FakeLrepConnector settings
		 *
		 * @class
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @private
		 * @static
		 * @since 1.48
		 * @alias sap.ui.fl.FakeLrepConnectorStorage
		 */
		function FakeLrepConnectorStorage(mSettings) {
			this.mSettings = Object.assign({
				"isKeyUser": true,
				"isAtoAvailable": false,
				"isProductiveSystem": false
			}, mSettings);
		}

		Object.assign(FakeLrepConnectorStorage.prototype, FakeLrepConnector.prototype);

		/**
		 * Creates a Fake Lrep change in localStorage
		 * @param  {Object|Array} vChangeDefinitions - single or multiple changeDefinitions
		 * @returns {Promise} Returns a promise to the result of the request
		 */
		FakeLrepConnectorStorage.prototype.create = function(vChangeDefinitions) {
			var response;
			if (Array.isArray(vChangeDefinitions)) {
				response = vChangeDefinitions.map(function(mChangeDefinition) {
					return this._saveChange(mChangeDefinition);
				}.bind(this));
			} else {
				response = this._saveChange(vChangeDefinitions);
			}

			return Promise.resolve({
				response: response,
				status: 'success'
			});
		};

		FakeLrepConnectorStorage.prototype._saveChange = function(mChangeDefinition) {
			if (!mChangeDefinition.creation){
				mChangeDefinition.creation = new Date().toISOString();
			}
			oFakeLrepStorage.saveChange(mChangeDefinition.fileName, mChangeDefinition);
			return mChangeDefinition;
		};


		FakeLrepConnectorStorage.prototype.update = function(mChangeDefinition, sChangeName, aChangelist, bIsVariant) {
			return Promise.resolve({
				response: this._saveChange(mChangeDefinition),
				status: 'success'
			});
		};

		FakeLrepConnectorStorage.prototype.send = function(sUri, sMethod, oData, mOptions) {
			if (sMethod === "DELETE") {
				return FakeLrepConnector.prototype.send.apply(this, arguments).then(function(oResponse) {
					oFakeLrepStorage.getChanges().forEach(function(oChangeDefinition) {
						if (
							oChangeDefinition.reference === oResponse.response.parameters[1] &&
							oChangeDefinition.layer === oResponse.response.parameters[2]
						) {
							oFakeLrepStorage.deleteChange(oChangeDefinition.fileName);
						}
					});
					return Promise.resolve({
						response: undefined,
						status: "nocontent"
					});
				});
			} else {
				return FakeLrepConnector.prototype.send.apply(this, arguments);
			}
		};

		/**
		 * Deletes a Fake Lrep change in localStorage
		 * @param  {Object} oChange - The change object
		 * @param  {Object} oChange.sChangeName - File name of the change object
		 * @returns {Promise} Returns a promise to the result of the request
		 */
		FakeLrepConnectorStorage.prototype.deleteChange = function(oChange) {

			oFakeLrepStorage.deleteChange(oChange.sChangeName);

			return Promise.resolve({
				response: undefined,
				status: "nocontent"
			});
		};

		/**
		 * Deletes all Fake Lrep changes in localStorage
		 * @returns {Promise} Returns a promise to the result of the request
		 */
		FakeLrepConnectorStorage.prototype.deleteChanges = function() {

			oFakeLrepStorage.deleteChanges();

			return Promise.resolve({
				response: undefined,
				status: "nocontent"
			});
		};

		/**
		 * Loads the changes for the given Component class name
		 * from the FakeLrepStorage
		 * and also loads the mandatory FakeLrepConnector.json file.
		 * The settings are take from the JSON file, but changes are replaced with
		 * the changes from the local storage.
		 *
		 * @param {String} sComponentClassName - Component class name
		 * @returns {Promise} Returns a Promise with the changes and componentClassName
		 * @public
		 */
		FakeLrepConnectorStorage.prototype.loadChanges = function(sComponentClassName) {
			var aChanges = oFakeLrepStorage.getChanges();

			return new Promise(function(resolve, reject) {
				var mResult = {};
				if (this.mSettings.sInitialComponentJsonPath) {
					jQuery.getJSON(this.mSettings.sInitialComponentJsonPath).done(function (oResponse) {
						mResult = {
							changes: oResponse,
							componentClassName: sComponentClassName
						};
						resolve(mResult);
					}).fail(function (error) {
						reject(error);
					});
				} else {
					resolve(mResult);
				}
			}.bind(this)).then(function(mResult) {
				var aVariants = [];
				var aControlVariantChanges = [];
				var aControlVariantManagementChanges = [];
				var aFilteredChanges = [];

				aChanges.forEach(function(oChange) {
					if (oChange.fileType === "ctrl_variant" && oChange.variantManagementReference) {
						aVariants.push(oChange);
					} else if (oChange.fileType === "ctrl_variant_change") {
						aControlVariantChanges.push(oChange);
					} else if (oChange.fileType === "ctrl_variant_management_change") {
						aControlVariantManagementChanges.push(oChange);
					} else {
						aFilteredChanges.push(oChange);
					}
				});

				mResult = this._createChangesMap(mResult, aVariants);
				mResult = this._sortChanges(mResult, aFilteredChanges, aControlVariantChanges, aControlVariantManagementChanges);
				mResult = this._assignVariantReferenceChanges(mResult);

				mResult.changes.contexts = [];
				mResult.changes.settings = this.mSettings;
				mResult.componentClassName = sComponentClassName;

				return mResult;
			}.bind(this));
		};

		FakeLrepConnectorStorage.prototype._createChangesMap = function(mResult, aVariants) {
			if (!mResult || !mResult.changes) {
				mResult = {
						changes: {}
				};
			}
			if (!mResult.changes.changes) {
				mResult.changes.changes = [];
			}
			if (!mResult.changes.variantSection) {
				mResult.changes.variantSection = {};
			}
			var fnCheckForDuplicates = function(aExistingVariants, oNewVariantFromChange) {
				return aExistingVariants.some(function(oVariant) {
					return oVariant.content.fileName === oNewVariantFromChange.fileName;
				});
			};

			var oVariantManagementSection = {};
			aVariants.forEach(function(oVariant) {
				oVariantManagementSection = mResult.changes.variantSection[oVariant.variantManagementReference];
				//if VariantManagement doesn't exist
				if (!oVariantManagementSection) {
					var oStandardVariant = this._fakeStandardVariant(oVariant.variantManagementReference);
					oVariantManagementSection = this._getVariantManagementStructure(
						[this._getVariantStructure(oStandardVariant, [], {}), this._getVariantStructure(oVariant, [], {})],
						{}
					);
					mResult.changes.variantSection[oVariant.variantManagementReference] = oVariantManagementSection;
				} else if (!fnCheckForDuplicates(oVariantManagementSection.variants, oVariant)) {
					oVariantManagementSection.variants.push(this._getVariantStructure(oVariant, [], {}));
				}
			}.bind(this));

			return mResult;
		};

		FakeLrepConnectorStorage.prototype._getVariantStructure = function (oVariant, aControlChanges, mVariantChanges) {
			return {
				content: oVariant,
				controlChanges: aControlChanges,
				variantChanges: mVariantChanges
			};
		};

		FakeLrepConnectorStorage.prototype._getVariantManagementStructure = function (aVariants, mVariantManagementChanges) {
			return {
				variants : aVariants,
				variantManagementChanges : mVariantManagementChanges
			};
		};

		FakeLrepConnectorStorage.prototype._assignVariantReferenceChanges = function(mResult) {
			Object.keys(mResult.changes.variantSection).forEach( function (sVariantManagementReference) {
				var aVariants = mResult.changes.variantSection[sVariantManagementReference].variants;
				aVariants.forEach(function (oVariant) {
					var sVariantReference = oVariant.content.variantReference;
					var aExistingChanges = oVariant.controlChanges;
					if (sVariantReference) {
						//Referenced changes should be applied first
						aExistingChanges = this._getReferencedChanges(mResult, oVariant).concat(aExistingChanges);
					}
					oVariant.controlChanges = aExistingChanges;
				}.bind(this));
			}.bind(this));
			return mResult;
		};

		FakeLrepConnectorStorage.prototype._getReferencedChanges = function(mResult, oCurrentVariant) {
			var aReferencedChanges = [];
			mResult.changes.variantSection[oCurrentVariant.content.variantManagementReference].variants.some( function (oVariant) {
				if (oCurrentVariant.content.variantReference === oVariant.content.fileName) {
					aReferencedChanges = oVariant.controlChanges.filter( function (oReferencedChange) {
						return Utils.isLayerAboveCurrentLayer(oReferencedChange.layer) === -1;
					});
					if (oVariant.content.variantReference) {
						aReferencedChanges = aReferencedChanges.concat(this._getReferencedChanges(mResult, oVariant));
					}
					return true;
				}
			}.bind(this));
			return aReferencedChanges;
		};

		FakeLrepConnectorStorage.prototype._sortChanges = function(mResult, aChanges, aControlVariantChanges, aControlVariantManagementChanges) {

			var fnAddChangeToVariant = function(mResult, sVariantManagementReference, oChange) {
				mResult.changes.variantSection[sVariantManagementReference].variants.some(function(oVariant) {
					if (oVariant.content.fileName === oChange.variantReference) {
						oVariant.controlChanges.push(oChange);
						return true;
					}
				});
			};

			var fnAddVariantChangeToVariant = function(mResult, sVariantManagementReference, oVariantChange) {
				mResult.changes.variantSection[sVariantManagementReference].variants.some(function(oVariant) {
					if (oVariant.content.fileName === oVariantChange.selector.id) {
						if (!oVariant.variantChanges[oVariantChange.changeType]) {
							oVariant.variantChanges[oVariantChange.changeType] = [];
						}
						oVariant.variantChanges[oVariantChange.changeType].push(oVariantChange);
						return true;
					}
				});
			};

			var mVariantManagementChanges = {};
			aControlVariantManagementChanges.forEach(function(oVariantManagementChange) {
				var sVariantManagementReference = oVariantManagementChange.selector.id;
				if (Object.keys(mResult.changes.variantSection).length === 0) {
					mResult.changes.variantSection[sVariantManagementReference] = this._getVariantManagementStructure(
						[this._getVariantStructure(this._fakeStandardVariant(sVariantManagementReference), [], {})],
						{}
					);
				}
				mVariantManagementChanges = mResult.changes.variantSection[sVariantManagementReference].variantManagementChanges;
				if (!mVariantManagementChanges[oVariantManagementChange.changeType]) {
					mVariantManagementChanges[oVariantManagementChange.changeType] = [];
				}
				mVariantManagementChanges[oVariantManagementChange.changeType].push(oVariantManagementChange);
			}.bind(this));

			aChanges.forEach(function(oChange) {
				if (!oChange.variantReference) {
					mResult.changes.changes.push(oChange);
				} else if (Object.keys(mResult.changes.variantSection).length === 0) {
						mResult.changes.variantSection[oChange.variantReference] = this._getVariantManagementStructure(
							[this._getVariantStructure(this._fakeStandardVariant(oChange.variantReference), [oChange], {})],
							{}
						);
				} else {
					Object.keys(mResult.changes.variantSection).forEach(function(sVariantManagementReference) {
						fnAddChangeToVariant(mResult, sVariantManagementReference, oChange);
					});
				}
			}.bind(this));

			aControlVariantChanges.forEach(function(oVariantChange) {
				if (Object.keys(mResult.changes.variantSection).length === 0) {
					var mVariantChanges = {};
					mVariantChanges[oVariantChange.changeType] = [oVariantChange];
					mResult.changes.variantSection[oVariantChange.selector.id] = this._getVariantManagementStructure(
						[this._getVariantStructure(this._fakeStandardVariant(oVariantChange.selector.id), [], mVariantChanges)],
						{}
					);
				} else {
					Object.keys(mResult.changes.variantSection).forEach(function (sVariantManagementReference) {
						fnAddVariantChangeToVariant(mResult, sVariantManagementReference, oVariantChange);
					});
				}
			}.bind(this));

			mResult.changes.changes = this._sortNonVariantChangesByLayer(mResult.changes.changes);

			return mResult;
		};

		FakeLrepConnectorStorage.prototype._fakeStandardVariant = function(sVariantManagementReference) {
			return {
					fileName: sVariantManagementReference,
					fileType: "ctrl_variant",
					variantManagementReference: sVariantManagementReference,
					variantReference: "",
					content: {
						title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText("STANDARD_VARIANT_TITLE")
					}
				};
		};

		FakeLrepConnectorStorage.prototype._sortNonVariantChangesByLayer = function(aChanges) {
			if (!aChanges || aChanges.length === 0) {
				return aChanges;
			}
			// temporary array holds changes grouped by layer
			var aGroupedByLayer = aChanges.reduce(function(aGroupedChanges, oChange) {
				var oChangeIndex = Utils.getLayerIndex(oChange.layer) || 0;
				aGroupedChanges[oChangeIndex] = aGroupedChanges[oChangeIndex] || [];
				aGroupedChanges[oChangeIndex].push(oChange);
				return aGroupedChanges;
			}, []);
			// concat grouped changes
			return aGroupedByLayer.reduce(function(aChanges, oChange) {
				return aChanges.concat(oChange);
			});
		};

		/**
		 * Loads the settings.
		 * The settings is actually an empty object and is required for mocking the customer/vendor based process.
		 *
		 * @returns {Promise} Returns a Promise with an empty object as current settings
		 * @public
		 */
		FakeLrepConnectorStorage.prototype.loadSettings = function() {

			return new Promise(function(resolve, reject){
				var oSettings = {};
				resolve(oSettings);
			});

		};

		/**
		 * Enables fake LRep connector.
		 *
		 * Hooks into the {@link sap.ui.fl.LrepConnector.createConnector} factory function to enable the fake LRep connector.
		 * If the <code>sAppComponentName</code> is provided, replaces the connector instance of corresponding {@link sap.ui.fl.ChangePersistence} by a fake one.
		 * After enabling fake LRep connector, function {@link sap.ui.fl.FakeLrepConnectorStorage.disableFakeConnector} must be called to restore the original connector.
		 *
		 * @param {object} [mSettings] - map of FakeLrepConnector settings
		 * @param {string} [sAppComponentName] - Name of application component to overwrite the existing LRep connector
		 * @param {string} [sAppVersion] - Version of application to overwrite the existing LRep connector
		 */
		FakeLrepConnectorStorage.enableFakeConnector = function(mSettings, sAppComponentName, sAppVersion){
			mSettings = mSettings || {};

			function replaceConnectorFactory() {
				FakeLrepConnectorStorage.enableFakeConnector.original = LrepConnector.createConnector;
				LrepConnector.createConnector = function() {
					if (!FakeLrepConnectorStorage._oFakeInstance){
						FakeLrepConnectorStorage._oFakeInstance = new FakeLrepConnectorStorage(mSettings);
					}
					return FakeLrepConnectorStorage._oFakeInstance;
				};
			}

			if (sAppComponentName && sAppVersion) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
				if (!(oChangePersistence._oConnector instanceof FakeLrepConnectorStorage)) {
					Cache.clearEntry(sAppComponentName, sAppVersion);
					if (!FakeLrepConnectorStorage._oBackendInstances[sAppComponentName]){
						FakeLrepConnectorStorage._oBackendInstances[sAppComponentName] = {};
					}
					FakeLrepConnectorStorage._oBackendInstances[sAppComponentName][sAppVersion] = oChangePersistence._oConnector;

					oChangePersistence._oConnector = new FakeLrepConnectorStorage(mSettings);

				}
				replaceConnectorFactory();
				return;
			}

			Cache.clearEntries();

			if (FakeLrepConnectorStorage.enableFakeConnector.original){
				return;
			}
			replaceConnectorFactory();
		};

		/**
		 * Restores the original {@link sap.ui.fl.LrepConnector.createConnector} factory function.
		 * If the <code>sAppComponentName</code> is provided, restores the connector instance of corresponding {@link sap.ui.fl.ChangePersistence} by the original one.
		 *
		 * @param {string} [sAppComponentName] - Name of application component to restore the original LRep connector
		 * @param {string} [sAppVersion] - Version of application to restore the original LRep connector
		 */
		FakeLrepConnectorStorage.disableFakeConnector = function(sAppComponentName, sAppVersion){

			function restoreConnectorFactory() {
				if (FakeLrepConnectorStorage.enableFakeConnector.original){
					LrepConnector.createConnector = FakeLrepConnectorStorage.enableFakeConnector.original;
					FakeLrepConnectorStorage.enableFakeConnector.original = undefined;
					FakeLrepConnectorStorage._oFakeInstance = undefined;
				}
			}

			if (sAppComponentName && sAppVersion) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
				if (!(oChangePersistence._oConnector instanceof LrepConnector)){
					Cache.clearEntry(sAppComponentName, sAppVersion);
					if (FakeLrepConnectorStorage._oBackendInstances[sAppComponentName] && FakeLrepConnectorStorage._oBackendInstances[sAppComponentName][sAppVersion]) {
						oChangePersistence._oConnector = FakeLrepConnectorStorage._oBackendInstances[sAppComponentName][sAppVersion];
						FakeLrepConnectorStorage._oBackendInstances[sAppComponentName][sAppVersion] = undefined;
					}
				}
				restoreConnectorFactory();
				return;
			}

			Cache.clearEntries();
			restoreConnectorFactory();
		};

		return FakeLrepConnectorStorage;
	};
}, /* bExport= */ true);