/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/LayerUtils"
], function(
	FakeLrepConnector,
	LrepConnector,
	Cache,
	ChangePersistenceFactory,
	LayerUtils
) {
	"use strict";

	return function (oFakeLrepStorage) {
		FakeLrepConnectorStorage._oBackendInstances = {};

		/**
		 * Class for connecting to Fake LREP storing changes in different storages
		 * @param {object} mSettings Map of FakeLrepConnector settings
		 *
		 * @class
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @private
		 * @static
		 * @since 1.58
		 * @alias sap.ui.fl.FakeLrepConnectorStorage
		 */
		function FakeLrepConnectorStorage(mSettings, mInfo) {
			this.mSettings = Object.assign({
				isKeyUser: true,
				isAtoAvailable: false,
				isProductiveSystem: false
			}, mSettings);
			this.mInfo = Object.assign({
				isResetEnabled: false,
				isPublishEnabled: false
			}, mInfo);
			this._iChangeCounter = 0;
		}

		Object.assign(FakeLrepConnectorStorage.prototype, FakeLrepConnector.prototype);

		/**
		 * Creates a Fake Lrep change in localStorage
		 * @param  {Object|Array} vChangeDefinitions Single or multiple changeDefinitions
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
			var nCreationTimestamp;
			if (!mChangeDefinition.creation) {
				// safari browser uses only 1 ms intervals to create a timestamp. This
				// generates creation timestamp duplicates. But creation timestamp is
				// used to define the order of the changes and needs to be unique
				nCreationTimestamp = Date.now() + this._iChangeCounter++;
				mChangeDefinition.creation = new Date(nCreationTimestamp).toISOString();
			}
			oFakeLrepStorage.saveChange(mChangeDefinition.fileName, mChangeDefinition);
			return mChangeDefinition;
		};


		FakeLrepConnectorStorage.prototype.update = function(mChangeDefinition) {
			return Promise.resolve({
				response: this._saveChange(mChangeDefinition),
				status: 'success'
			});
		};

		FakeLrepConnectorStorage.prototype.send = function() {
			return FakeLrepConnector.prototype.send.apply(this, arguments);
		};

		/**
		 * Resets changes; Filters by provided parameters like the application reference, layer,
		 * the change type or changes on specific controls by their selector IDs.
		 *
		 * @param {String} mParameters property bag
		 * @param {String} mParameters.sReference Application reference
		 * @param {String} mParameters.sLayer Possible layers: VENDOR,PARTNER,CUSTOMER_BASE,CUSTOMER,USER
		 * @param {String[]} mParameters.aSelectorIds Selector IDs of controls for which the reset should filter
		 * @param {String[]} mParameters.aChangeTypes Change types of the changes which should be reset
		 * @public
		 */
		FakeLrepConnectorStorage.prototype.resetChanges = function(mParameters) {
			function _changeShouldBeDeleted(oChangeDefinition) {
				var bDelete = true;

				if (mParameters.aSelectorIds) {
					if (oChangeDefinition.selector) {
						bDelete = mParameters.aSelectorIds.indexOf(oChangeDefinition.selector.id) > -1;
					} else {
						bDelete = false;
					}
				}

				if (bDelete && mParameters.aChangeTypes) {
					bDelete = mParameters.aChangeTypes.indexOf(oChangeDefinition.changeType) > -1;
				}

				return bDelete;
			}

			return this.send(this._getUrlPrefix(), "DELETE")
			.then(function() {
				var aResponse = [];
				oFakeLrepStorage.getChanges(mParameters.sReference, mParameters.sLayer).forEach(function(oChangeDefinition) {
					if (_changeShouldBeDeleted(oChangeDefinition)) {
						aResponse.push({
							layer: oChangeDefinition.layer,
							name: oChangeDefinition.fileName,
							namespace: oChangeDefinition.namespace,
							type: oChangeDefinition.fileType
						});
						oFakeLrepStorage.deleteChange(oChangeDefinition.fileName);
					}
				});
				return {
					response: aResponse,
					status: "success"
				};
			});
		};

		/**
		 * Deletes a Fake Lrep change in localStorage
		 * @param  {Object} oChange The change object
		 * @param  {Object} oChange.sChangeName File name of the change object
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
		 * from the FakeLrepStorage and also loads the mandatory FakeLrepConnector.json file;
		 * The settings are take from the JSON file, but changes are replaced with
		 * the changes from the local storage.
		 *
		 * @param {map} mComponent Map with information about the Component
		 * @param {string} mComponent.name name of the component
		 * @param {string} mComponent.appVersion version of the app
		 * @param {map} [mPropertyBag] Contains additional data needed for reading changes; Not used in this case
		 * @param {sap.ui.fl.Change[]} [aBackendChanges] array of changes that will get added to the result
		 * @returns {Promise} Returns a Promise with the changes and componentClassName
		 * @public
		 */
		FakeLrepConnectorStorage.prototype.loadChanges = function(mComponent, mPropertyBag, aBackendChanges) {
			var aChanges = oFakeLrepStorage.getChanges(mComponent.name);

			if (aBackendChanges) {
				aChanges = aChanges.concat(aBackendChanges);
			}

			return new Promise(function(resolve, reject) {
				var mResult = {};
				if (this.mSettings.sInitialComponentJsonPath) {
					jQuery.getJSON(this.mSettings.sInitialComponentJsonPath).done(function (oResponse) {
						mResult = {
							changes: oResponse,
							componentClassName: mComponent.name
						};
						resolve(mResult);
					}).fail(function (error) {
						reject(error);
					});
				} else {
					resolve(mResult);
				}
			}.bind(this))
			.then(function(mResult) {
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
				mResult = this._addChangesToMap(mResult, aFilteredChanges, aControlVariantChanges, aControlVariantManagementChanges);
				//now all changes are combined and in the right section => sort them all
				mResult = this._sortChanges(mResult);
				mResult = this._assignVariantReferenceChanges(mResult);

				mResult.changes.contexts = [];
				mResult.changes.settings = this.mSettings;
				mResult.componentClassName = mComponent.name;

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

		function sortByLayerThenCreation(aArray) {
			aArray.sort(byLayerThenCreation);
		}

		function byLayerThenCreation(oChangeA, oChangeB) {
			var iLayerA = LayerUtils.getLayerIndex(oChangeA.layer);
			var iLayerB = LayerUtils.getLayerIndex(oChangeB.layer);
			if (iLayerA !== iLayerB) {
				return iLayerA - iLayerB;
			}
			return new Date(oChangeA.creation) - new Date(oChangeB.creation);
		}

		FakeLrepConnectorStorage.prototype._sortChanges = function(mResult) {
			if (mResult.changes.changes) {
				sortByLayerThenCreation(mResult.changes.changes);
			}
			// variantManagementChanges
			forEachVariantManagementReference(mResult, function(oVariantManagement) {
				Object.keys(oVariantManagement.variantManagementChanges || {})
					.forEach(function(sVariantManagementChange) {
						sortByLayerThenCreation(oVariantManagement.variantManagementChanges[sVariantManagementChange]);
					});
			});
			forEachVariant(mResult, function (oVariant) {
				// variantChanges
				Object.keys(oVariant.variantChanges).forEach(function(sVariantChangeType) {
					sortByLayerThenCreation(oVariant.variantChanges[sVariantChangeType]);
				});
				// controlChanges
				sortByLayerThenCreation(oVariant.controlChanges);
			});
			return mResult;
		};

		function forEachVariantManagementReference(mResult, fnCallBack) {
			Object.keys(mResult.changes.variantSection).forEach(function(sVariantManagementReference) {
				fnCallBack(mResult.changes.variantSection[sVariantManagementReference]);
			});
		}

		function forEachVariant(mResult, fnCallback) {
			forEachVariantManagementReference(mResult, function (oVariantManagement) {
				oVariantManagement.variants.forEach(fnCallback);
			});
		}

		FakeLrepConnectorStorage.prototype._assignVariantReferenceChanges = function(mResult) {
			forEachVariant(mResult, function (oVariant) {
				var sVariantReference = oVariant.content.variantReference;
				var aExistingChanges = oVariant.controlChanges;
				if (sVariantReference) {
					//Referenced changes should be applied first
					aExistingChanges = this._getReferencedChanges(mResult, oVariant).concat(aExistingChanges);
				}
				oVariant.controlChanges = aExistingChanges;
			}.bind(this));
			return mResult;
		};

		function withVariant(mResult, sVariantManagementReference, sVariantReference, fnCallback) {
			mResult.changes.variantSection[sVariantManagementReference].variants.some(function(oVariant) {
				if (oVariant.content.fileName === sVariantReference) {
					fnCallback(oVariant);
					return true;
				}
			});
		}

		FakeLrepConnectorStorage.prototype._getReferencedChanges = function(mResult, oCurrentVariant) {
			var aReferencedChanges = [];
			withVariant(mResult, oCurrentVariant.content.variantManagementReference, oCurrentVariant.content.variantReference, function (oVariant) {
				aReferencedChanges = oVariant.controlChanges.filter(function (oReferencedChange) {
					return LayerUtils.compareAgainstCurrentLayer(oReferencedChange.layer, oCurrentVariant.layer) === -1;
				});
				if (oVariant.content.variantReference) {
					aReferencedChanges = aReferencedChanges.concat(this._getReferencedChanges(mResult, oVariant));
				}
			}.bind(this));
			return aReferencedChanges;
		};

		FakeLrepConnectorStorage.prototype._addChangesToMap = function(mResult, aChanges, aControlVariantChanges, aControlVariantManagementChanges) {
			var fnAddChangeToVariant = function(mResult, sVariantManagementReference, oChange) {
				withVariant(mResult, sVariantManagementReference, oChange.variantReference, function (oVariant) {
					oVariant.controlChanges.push(oChange);
				});
			};

			var fnAddVariantChangeToVariant = function(mResult, sVariantManagementReference, oVariantChange) {
				withVariant(mResult, sVariantManagementReference, oVariantChange.selector.id, function (oVariant) {
					if (!oVariant.variantChanges[oVariantChange.changeType]) {
						oVariant.variantChanges[oVariantChange.changeType] = [];
					}
					oVariant.variantChanges[oVariantChange.changeType].push(oVariantChange);
				});
			};

			function checkIfVariantExists(mResult, sVariantReference) {
				return Object.keys(mResult.changes.variantSection).some(function (sVariantManagementReference) {
					var aVariants = mResult.changes.variantSection[sVariantManagementReference].variants;
					return aVariants.some(function(oVariant) {
						return oVariant.content.fileName === sVariantReference;
					});
				});
			}

			var mVariantManagementChanges = {};
			aControlVariantManagementChanges.forEach(function(oVariantManagementChange) {
				var sVariantManagementReference = oVariantManagementChange.selector.id;
				if (!mResult.changes.variantSection[sVariantManagementReference]) {
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
				} else if (!checkIfVariantExists(mResult, oChange.variantReference)) {
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
				if (!checkIfVariantExists(mResult, oVariantChange.selector.id)) {
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

		/**
		 * Enables fake LRep connector.
		 *
		 * Hooks into the {@link sap.ui.fl.LrepConnector.createConnector} factory function to enable the fake LRep connector.
		 * If the <code>sAppComponentName</code> is provided, replaces the connector instance of corresponding {@link sap.ui.fl.ChangePersistence} by a fake one.
		 * After enabling fake LRep connector, function {@link sap.ui.fl.FakeLrepConnectorStorage.disableFakeConnector} must be called to restore the original connector.
		 *
		 * @param {object} [mSettings] Map of FakeLrepConnector settings
		 * @param {string} [sAppComponentName] Name of application component to overwrite the existing LRep connector
		 * @param {string} [sAppVersion] Version of application to overwrite the existing LRep connector
		 * @param {boolean} [bSuppressCacheInvalidation] If true the cache entry will not be deleted
		 */
		FakeLrepConnectorStorage.enableFakeConnector = function(mSettings, sAppComponentName, sAppVersion, bSuppressCacheInvalidation) {
			mSettings = mSettings || {};

			function replaceConnectorFactory() {
				FakeLrepConnectorStorage.enableFakeConnector.original = LrepConnector.createConnector;
				LrepConnector.createConnector = function() {
					if (!FakeLrepConnectorStorage._oFakeInstance) {
						FakeLrepConnectorStorage._oFakeInstance = new FakeLrepConnectorStorage(mSettings);
					}
					//when there is a change isResetEnabled and isPublishEnabled are true
					var aChanges = oFakeLrepStorage.getChanges(sAppComponentName);
					this.mInfo = {
						isResetEnabled: aChanges.length > 0,
						isPublishEnabled: aChanges.length > 0
					};
					FakeLrepConnectorStorage._oFakeInstance.setInfo(this.mInfo);

					return FakeLrepConnectorStorage._oFakeInstance;
				};
			}

			if (sAppComponentName && sAppVersion) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
				if (!(oChangePersistence._oConnector instanceof FakeLrepConnectorStorage)) {
					if (!bSuppressCacheInvalidation) {
						FakeLrepConnectorStorage.clearCacheAndResetVariants(sAppComponentName, sAppVersion, oChangePersistence);
					}
					if (!FakeLrepConnectorStorage._oBackendInstances[sAppComponentName]) {
						FakeLrepConnectorStorage._oBackendInstances[sAppComponentName] = {};
					}
					FakeLrepConnectorStorage._oBackendInstances[sAppComponentName][sAppVersion] = oChangePersistence._oConnector;

					oChangePersistence._oConnector = new FakeLrepConnectorStorage(mSettings);
				}
				replaceConnectorFactory();
				return;
			}

			if (!bSuppressCacheInvalidation) {
				Cache.clearEntries();
			}

			if (FakeLrepConnectorStorage.enableFakeConnector.original) {
				return;
			}
			replaceConnectorFactory();
		};

		/**
		 * Restores the original {@link sap.ui.fl.LrepConnector.createConnector} factory function.
		 * If the <code>sAppComponentName</code> is provided, restores the connector instance of corresponding {@link sap.ui.fl.ChangePersistence} by the original one.
		 *
		 * @param {string} [sAppComponentName] Name of application component to restore the original LRep connector
		 * @param {string} [sAppVersion] Version of application to restore the original LRep connector
		 */
		FakeLrepConnectorStorage.disableFakeConnector = function(sAppComponentName, sAppVersion) {
			function restoreConnectorFactory() {
				if (FakeLrepConnectorStorage.enableFakeConnector.original) {
					LrepConnector.createConnector = FakeLrepConnectorStorage.enableFakeConnector.original;
					FakeLrepConnectorStorage.enableFakeConnector.original = undefined;
					FakeLrepConnectorStorage._oFakeInstance = undefined;
				}
			}

			if (sAppComponentName && sAppVersion) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
				if (!(oChangePersistence._oConnector instanceof LrepConnector)) {
					FakeLrepConnectorStorage.clearCacheAndResetVariants(sAppComponentName, sAppVersion, oChangePersistence);
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

		FakeLrepConnectorStorage.clearCacheAndResetVariants = function (sComponentName, sAppVersion, oChangePersistence) {
			Cache.clearEntry(sComponentName, sAppVersion);
			oChangePersistence.resetVariantMap(/*bResetAtRuntime*/true);
		};

		return FakeLrepConnectorStorage;
	};
}, /* bExport= */ true);