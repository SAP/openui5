/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/strings/hash",
	"sap/base/util/restricted/_uniqBy",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"
], function(
	hash,
	_uniqBy,
	each,
	merge,
	Layer,
	Utils,
	Version,
	BaseConnector,
	StorageUtils,
	ObjectStorageUtils
) {
	"use strict";

	const mFeatures = {
		isKeyUser: true,
		isVariantSharingEnabled: true,
		isProductiveSystem: false,
		isCondensingEnabled: true,
		isContextSharingEnabled: false,
		isVersioningEnabled: true,
		logonUser: "DEFAULT_USER"
	};

	function loadDataFromStorage(mPropertyBag) {
		var aFlexObjects = [];

		return ObjectStorageUtils.forEachObjectInStorage(mPropertyBag, function(mFlexObject) {
			aFlexObjects.push(mFlexObject.changeDefinition);
		}).then(function() {
			return aFlexObjects;
		});
	}

	function shouldChangeBeDeleted(mPropertyBag, oChangeDefinition) {
		var bDelete = true;

		if (mPropertyBag.selectorIds) {
			if (oChangeDefinition.selector) {
				bDelete = mPropertyBag.selectorIds.indexOf(oChangeDefinition.selector.id) > -1;
			} else {
				bDelete = false;
			}
		}

		if (bDelete && mPropertyBag.changeTypes) {
			bDelete = mPropertyBag.changeTypes.indexOf(oChangeDefinition.changeType) > -1;
		}

		return bDelete;
	}

	function setFlexObjectCreation(oFlexObject, iCounter) {
		if (!oFlexObject.creation) {
			// safari browser uses only 1 ms intervals to create a timestamp. This
			// generates creation timestamp duplicates. But creation timestamp is
			// used to define the order of the changes and needs to be unique
			var nCreationTimestamp = Date.now() + iCounter;
			oFlexObject.creation = new Date(nCreationTimestamp).toISOString();
		}
		return oFlexObject;
	}

	function calculateCacheKey(aFlexObjects) {
		return hash(aFlexObjects.reduce(function(sKey, oFlexObject) {
			return sKey + new Date(oFlexObject.creation).getTime();
		}, ""));
	}

	/* the structure of create and update is like
		{
			<fileType>:[
				{
					<fileName>: <content>
				},
				...
			],
			...
		}
	*/
	function forEveryMapInArrayInMap(mMap, fnCallback) {
		each(mMap, function(sOuterKey, aArray) {
			aArray.forEach(function(mInnerMap) {
				// eslint-disable-next-line max-nested-callbacks
				each(mInnerMap, function(sInnerKey, oContent) {
					fnCallback(oContent, sInnerKey);
				});
			});
		});
	}

	function handleCondenseCreate(oCreateInfos, mPropertyBag) {
		var aReturn = [];
		var iCounter = 0;

		forEveryMapInArrayInMap(oCreateInfos, function(oFlexObjectFileContent, sChangeId) {
			var sKey = ObjectStorageUtils.createFlexKey(sChangeId);
			var oFlexObject = mPropertyBag.condensedChanges.find(function(oCurrentFlexObject) {
				return oCurrentFlexObject.getId() === oFlexObjectFileContent.fileName;
			});

			if (!oFlexObject.getCreation()) {
				// new changes get the time stamp from the backend (see setFlexObjectCreation)
				var nCreationTimestamp = Date.now() + iCounter;
				iCounter++;
				oFlexObject.setCreation(new Date(nCreationTimestamp).toISOString());
			}
			aReturn.push({key: sKey, value: oFlexObject});
		});

		return aReturn;
	}

	function handleCondenseUpdate(oUpdateInfos, aCondenserChanges) {
		// the FlexObject instance is already up to date, so the new file content can be taken from there
		var aReturn = [];
		forEveryMapInArrayInMap(oUpdateInfos, function(oCurrentFlexObject, sChangeId) {
			var sKey = ObjectStorageUtils.createFlexKey(sChangeId);
			var oUpdatedFlexObject;
			aCondenserChanges.some(function(oCurrentFlexObject) {
				if (oCurrentFlexObject.getId() === sChangeId) {
					oUpdatedFlexObject = oCurrentFlexObject;
					return true;
				}
			});
			aReturn.push({key: sKey, value: oUpdatedFlexObject});
		});

		return aReturn;
	}

	function handleCondenseReorder(oReorderInfos, aCondensedChanges) {
		var aReturn = [];
		each(oReorderInfos, function(sFileType, aChangeIds) {
			if (aChangeIds.length < 2) {
				return;
			}

			// sorting is based solely on the creation timestamp
			// aCondensedChanges is already in the new, correct order
			// starting from the first FlexObject in the reorder section
			// each subsequent FlexObject has to have a higher creation timestamp
			// to achieve that the getTime result is increased by 1
			var aFilteredFlexObjects = aCondensedChanges.filter(function(oFlexObject) {
				return oFlexObject.getFileType() === sFileType;
			});
			aFilteredFlexObjects.forEach(function(oFlexObject, iIndex) {
				if (aChangeIds.indexOf(oFlexObject.getId()) > -1 && iIndex < aFilteredFlexObjects.length - 1) {
					var oNextFlexObject = aFilteredFlexObjects[iIndex + 1];
					var oCurrentDate = new Date(oFlexObject.getCreation());
					var oNextDate = new Date(oNextFlexObject.getCreation());

					if (oNextFlexObject && oCurrentDate >= oNextDate) {
						var oNewDateTime = oCurrentDate.getTime() + 1;
						oNextFlexObject.setCreation(new Date(oNewDateTime).toISOString());
						var sKey = ObjectStorageUtils.createFlexKey(oNextFlexObject.getId());
						aReturn.push({key: sKey, value: oNextFlexObject});
					}
				}
			});
		});

		return aReturn;
	}

	function handleCondenseDelete(oDeleteInformation) {
		var aPromises = [];
		if (oDeleteInformation) {
			Object.values(oDeleteInformation).forEach(function(aChangeIds) {
				aChangeIds.forEach(function(sChangeId) {
					var sKey = ObjectStorageUtils.createFlexKey(sChangeId);
					aPromises.push(this.storage.removeItem(sKey));
				}.bind(this));
			}.bind(this));
		}

		return aPromises;
	}

	/**
	 * Abstract connector class for requesting data from a storage.
	 * The inherited objects must implement the <code>storage</code> object.
	 *
	 * @alias sap.ui.fl.write.api.connectors.ObjectStorageConnector
	 * @namespace sap.ui.fl.write.api.connectors.ObjectStorageConnector
	 * @extends sap.ui.fl.write.connectors.BaseConnector
	 * @since 1.84
	 * @private
	 * @ui5-restricted sap.ui.fl, SAP Web IDE (Visual Editor), UX Tools
	 * @abstract
	 */
	var ObjectStorageConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write.api.connectors.ObjectStorageConnector */ {
		/**
		 * Object implementing the functions setItem, removeItem, clear, getItem and getItems.
		 * By default, the items are handled as stringified objects.
		 * If the saved are stored as js objects the property <code>_itemsStoredAsObjects</code> has to be set to true.
		 */
		storage: undefined,
		layers: [
			"ALL"
		],

		/**
		 * Provides the flex data stored in the session or local storage;
		 * Changes can be filtered by reference and layer.
		 *
		 * @param {object} mPropertyBag - Properties needed by the connectors
		 * @param {string} mPropertyBag.reference - Reference of the application
		 * @param {string} [mPropertyBag.version] - Version of the adaptation to be loaded
		 * @returns {Promise<Object>} - Resolving with an object containing a data contained in the changes-bundle
		 */
		async loadFlexData(mPropertyBag) {
			const aFlexObjects = await loadDataFromStorage({
				storage: this.storage,
				reference: mPropertyBag.reference
			});

			const aVersionChain = await this.versions.getVersionChain.call(this, mPropertyBag, mPropertyBag.version);
			const aFilteredFlexObjects = aFlexObjects.filter((oFlexObject) =>
				oFlexObject.version === undefined || aVersionChain.includes(oFlexObject.version)
			);
			const aSortedFilteredFlexObjects = StorageUtils.sortFlexObjects(aFilteredFlexObjects);
			const mGroupedFlexObjects = StorageUtils.getGroupedFlexObjects(aSortedFilteredFlexObjects);
			const aResponses = StorageUtils.filterAndSortResponses(mGroupedFlexObjects);
			if (aResponses.length) {
				aResponses[0].cacheKey = calculateCacheKey(aSortedFilteredFlexObjects);
			}
			return aResponses;
		},

		/**
		 * @inheritDoc
		 */
		async write(mPropertyBag) {
			const mFeatures = await this.loadFeatures();
			let sDraftVersionId;
			if (mFeatures.isVersioningEnabled && mPropertyBag.layer === Layer.CUSTOMER) {
				// the reference for the versions have to be determined by a flex object
				mPropertyBag.reference = mPropertyBag.flexObjects[0]?.reference;
				sDraftVersionId = await this.versions.getDraftId.call(this, mPropertyBag);
			}

			let iIndex = 0;
			const aUpdatedFlexObjects = [];
			for (const oFlexObject of mPropertyBag.flexObjects) {
				if (sDraftVersionId) {
					oFlexObject.version = sDraftVersionId;
				}
				const sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
				const oUpdatedFlexObject = setFlexObjectCreation(oFlexObject, ++iIndex);
				const vUpdatedFlexObject = this.storage._itemsStoredAsObjects ? oUpdatedFlexObject : JSON.stringify(oUpdatedFlexObject);
				await this.storage.setItem(sKey, vUpdatedFlexObject);
				aUpdatedFlexObjects.push(oUpdatedFlexObject);
			}
			// Return response structure like from the backend to update objects with creation data
			return {
				response: aUpdatedFlexObjects
			};
		},

		/**
		 * @inheritDoc
		 */
		async update(mPropertyBag) {
			var oFlexObject = mPropertyBag.flexObject;
			if (mFeatures.isVersioningEnabled && mPropertyBag.layer === Layer.CUSTOMER) {
				mPropertyBag.reference = oFlexObject.reference;
				const aVersions = await this.versions.load.call(this, mPropertyBag);
				const sDraftVersionId = aVersions.find((oVersion) => oVersion.isDraft)?.id;
				if (sDraftVersionId) {
					oFlexObject.version = sDraftVersionId;
				}
			}
			var sKey = ObjectStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			var vFlexObject = this.storage._itemsStoredAsObjects ? oFlexObject : JSON.stringify(oFlexObject);
			var vSetResponse = this.storage.setItem(sKey, vFlexObject);
			// ensure a Promise
			return Promise.resolve(vSetResponse);
		},

		/**
		 * @inheritDoc
		 */
		reset(mPropertyBag) {
			return ObjectStorageUtils.forEachObjectInStorage({
				storage: this.storage,
				reference: mPropertyBag.reference,
				layer: mPropertyBag.layer
			}, function(mFlexObject) {
				if (shouldChangeBeDeleted(mPropertyBag, mFlexObject.changeDefinition)) {
					return Promise.resolve(this.storage.removeItem(mFlexObject.key)).then(function() {
						return {
							fileName: mFlexObject.changeDefinition?.fileName || mFlexObject.changeDefinition?.id
						};
					});
				}
			}.bind(this))
			.then(function(aResponse) {
				return {
					response: aResponse.filter(function(oChangeDefinition) {
						return !!oChangeDefinition;
					})
				};
			});
		},

		/**
		 * @inheritDoc
		 */
		remove(mPropertyBag) {
			var sKey = ObjectStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			this.storage.removeItem(sKey);
			var vRemoveResponse = this.storage.removeItem(sKey);
			// ensure a Promise
			return Promise.resolve(vRemoveResponse);
		},

		/**
		 * @inheritDoc
		 */
		loadFeatures() {
			return Promise.resolve(mFeatures);
		},

		/**
		 * @inheritDoc
		 */
		loadVariantsAuthors() {
			return Promise.reject("loadVariantsAuthors is not implemented");
		},

		/**
		 * @inheritDoc
		 */
		getFlexInfo(mPropertyBag) {
			mPropertyBag.storage = this.storage;
			return ObjectStorageUtils.getAllFlexObjects(mPropertyBag).then(function(aFlexObjects) {
				return {
					isResetEnabled: aFlexObjects.length > 0
				};
			});
		},

		/**
		 * @inheritDoc
		 */
		async condense(mPropertyBag) {
			// the functionality below would normally be done in the back end
			// but in this case the storage can't be extended, so the logic has to be included in the connector
			var oCondenseInformation = mPropertyBag.flexObjects;
			var aObjectsToSet = [];
			// the same FlexObject can be in multiple sections of the condense information, so the instance has to be set in the array
			aObjectsToSet = aObjectsToSet.concat(handleCondenseCreate(oCondenseInformation.create, mPropertyBag));
			aObjectsToSet = aObjectsToSet.concat(handleCondenseUpdate(oCondenseInformation.update, mPropertyBag.condensedChanges));
			aObjectsToSet = aObjectsToSet.concat(handleCondenseReorder(oCondenseInformation.reorder, mPropertyBag.condensedChanges));
			aObjectsToSet = _uniqBy(aObjectsToSet, "key");

			var aPromises = [];
			var aResponse = [];
			aPromises = aPromises.concat(handleCondenseDelete.call(this, oCondenseInformation.delete));

			const mFeatures = await this.loadFeatures();
			let sDraftVersionId;
			if (
				mFeatures.isVersioningEnabled
				&& mPropertyBag.layer === Layer.CUSTOMER
				&& ((oCondenseInformation.create && Object.keys(oCondenseInformation.create).length !== 0)
				|| (oCondenseInformation.update && Object.keys(oCondenseInformation.update).length !== 0)
				|| (oCondenseInformation.reorder && Object.keys(oCondenseInformation.reorder).length !== 0))
			) {
				// the reference for the versions have to be determined by a flex object
				sDraftVersionId = await this.versions.getDraftId.call(this, mPropertyBag);
			}

			aObjectsToSet.forEach(function(oItemToSet) {
				var oFileContent = oItemToSet.value.convertToFileContent();
				if (sDraftVersionId) {
					oFileContent.version = sDraftVersionId;
				}
				aResponse.push(oFileContent);
				var vFlexObject = this.storage._itemsStoredAsObjects ? oFileContent : JSON.stringify(oFileContent);
				aPromises.push(this.storage.setItem(oItemToSet.key, vFlexObject));
			}.bind(this));
			// discard draft when last draft change is delete
			if (mFeatures.isVersioningEnabled && mPropertyBag.layer === Layer.CUSTOMER
				&& oCondenseInformation.delete && Object.keys(oCondenseInformation.delete).length !== 0) {
				const aVersions = await this.versions.load.call(this, mPropertyBag);
				if (aVersions.length) {
					const oDraftVersion = aVersions.find((oVersion) => oVersion.isDraft);
					Object.values(oCondenseInformation.delete).forEach(function(aChangeIds) {
						aChangeIds.forEach(function(sChangeId) {
							oDraftVersion.filenames = oDraftVersion.filenames.filter(function(filename) { return filename !== sChangeId; });
						});
					});
					if (!oDraftVersion.filenames.length) {
						await this.versions.discardDraft.call(this, mPropertyBag);
					}
				}
			}
			return Promise.all(aPromises).then(function() {
				return Promise.resolve({response: aResponse});
			});
		},

		/**
		 * @inheritDoc
		 */
		versions: {
			async getDraftId(mPropertyBag) {
				let aDraftFilenames = [];
				if (mPropertyBag.condensedChanges) {
					aDraftFilenames = mPropertyBag.condensedChanges.map((change) => {return change.sId;});
				} else {
					aDraftFilenames = mPropertyBag.flexObjects.map((flexObject) => {return flexObject.fileName;});
				}

				const aVersions = await this.versions.load.call(this, mPropertyBag);
				let oDraftVersion = aVersions.find((oVersion) => oVersion.isDraft);
				if (oDraftVersion && mPropertyBag.parentVersion === Version.Number.Draft) {
					if (mPropertyBag.condensedChanges) {
						oDraftVersion.filenames = [];
					}
					oDraftVersion.filenames = aDraftFilenames.concat(oDraftVersion.filenames);
				} else {
					// discard draft, when draft based on another parentVersion
					if (oDraftVersion && mPropertyBag.parentVersion !== Version.Number.Draft) {
						await this.versions.discardDraft.call(this, mPropertyBag);
					}
					// create new a draft version
					oDraftVersion = {
						version: Version.Number.Draft,
						id: Utils.createDefaultFileName("version"),
						isDraft: true,
						activatedAt: "",
						activatedBy: "",
						fileType: "version",
						layer: Layer.CUSTOMER,
						title: "",
						reference: mPropertyBag.reference,
						filenames: aDraftFilenames
					};
					if (mPropertyBag.parentVersion !== Version.Number.Original) {
						oDraftVersion.parentVersion = mPropertyBag.parentVersion;
					}
				}

				const sKey = ObjectStorageUtils.createFlexKey(`${oDraftVersion.id}`);
				const vVersion = this.storage._itemsStoredAsObjects ? oDraftVersion : JSON.stringify(oDraftVersion);
				await this.storage.setItem(sKey, vVersion);

				return oDraftVersion.id;
			},

			/**
			 * Determines recursive the chain of a given version by collecting their <code>parentVersion</code> relations.
			 *
			 * @param {object} mPropertyBag - Property bag
			 * @param {string} [sVersionId] - ID of the version for which the chain should be determined. In case no ID is provided, the latest non-draft is used.
			 * @returns {string[]} - List of version IDs needed to retrieve the data
			 *
			 * @private
			 */
			async getVersionChain(mPropertyBag, sVersionId) {
				const aVersionChain = [];
				const findVersion = (sVersionId, oVersion) => sVersionId === oVersion.version;
				const aVersions = await this.versions.load.call(this, mPropertyBag);
				// default is always the latest non-draft
				sVersionId ||= aVersions.find((oVersion) => !oVersion.isDraft)?.id;
				while (sVersionId && sVersionId !== Version.Number.Original) {
					const oVersion = aVersions.find(findVersion.bind(undefined, sVersionId));
					aVersionChain.push(oVersion.id);
					sVersionId = oVersion.parentVersion;
				}

				return aVersionChain;
			},

			/**
			 * @inheritDoc
			 */
			async load(mPropertyBag) {
				const aFlexObjects = await loadDataFromStorage({
					storage: this.storage,
					reference: mPropertyBag.reference
				});

				return aFlexObjects.filter((oFlexObject) => oFlexObject.fileType === "version").sort((a, b) => {
					if (a.isDraft) {
						return -1;
					}
					if (b.isDraft) {
						return 1;
					}
					return a.activatedAt < b.activatedAt ? 1 : -1;
				});
			},

			/**
			 * @inheritDoc
			 */
			async activate(mPropertyBag) {
				const mFeatures = await this.loadFeatures();
				const aVersions = await this.versions.load.call(this, mPropertyBag);
				var oActivateVersion = aVersions.find((oVersion) => oVersion.version === mPropertyBag.version);
				if (oActivateVersion) {
					// activate an older version
					if (!oActivateVersion.isDraft) {
						oActivateVersion.id = Utils.createDefaultFileName("version");
						oActivateVersion.parentVersion = mPropertyBag.version;
					}
				} else {
					// activate original version
					const sNewVersionId = Utils.createDefaultFileName("version");
					oActivateVersion = {
						version: sNewVersionId,
						id: sNewVersionId,
						fileType: "version",
						layer: Layer.CUSTOMER,
						reference: mPropertyBag.reference
					};
				}
				// when activate an older version and draft exists needs to discard the draft
				if (mPropertyBag.version !== Version.Number.Draft) {
					const oDraftVersion = aVersions.find((oVersion) => oVersion.isDraft);
					if (oDraftVersion) {
						await this.versions.discardDraft.call(this, mPropertyBag);
					}
				}
				const sKey = ObjectStorageUtils.createFlexKey(oActivateVersion.id);
				oActivateVersion.title = mPropertyBag.title;
				oActivateVersion.activatedAt = new Date(Date.now()).toISOString();
				oActivateVersion.activatedBy = mFeatures.logonUser;
				oActivateVersion.isDraft = false;
				oActivateVersion.version = oActivateVersion.id;
				delete oActivateVersion.filenames;
				const vFlexObject = this.storage._itemsStoredAsObjects ? oActivateVersion : JSON.stringify(oActivateVersion);
				this.storage.setItem(sKey, vFlexObject);
				return oActivateVersion;
			},

			/**
			 * @inheritDoc
			 */
			async discardDraft(mPropertyBag) {
				mPropertyBag.storage = this.storage;
				const aVersions = await this.versions.load.call(this, mPropertyBag);
				const sDraftVersionId = aVersions.find((oVersion) => oVersion.isDraft)?.id;
				if (!sDraftVersionId) {
					return Promise.reject("no version to discard");
				}

				const aFiles = await loadDataFromStorage(mPropertyBag);
				const aDraftFiles = aFiles.filter((oFlexObject) => oFlexObject.version === sDraftVersionId);
				// discard the version itself
				const oDraftVersion = aVersions.find((oVersion) => oVersion.id === sDraftVersionId);
				aDraftFiles.push(oDraftVersion);
				// discard flex objects
				const aDiscardPromises = aDraftFiles.map((oFlexObject) => {
					var sKey = ObjectStorageUtils.createFlexKey(oFlexObject.fileName || oFlexObject.id);
					return this.storage.removeItem(sKey);
				});

				await Promise.all(aDiscardPromises);
			}
		}
	});

	return ObjectStorageConnector;
});