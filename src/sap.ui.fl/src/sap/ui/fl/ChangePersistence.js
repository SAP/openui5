/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Change", "sap/ui/fl/Utils", "jquery.sap.global", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache", "sap/ui/fl/context/ContextManager", "sap/ui/fl/registry/Settings"
], function(Change, Utils, $, LRepConnector, Cache, ContextManager, Settings) {
	"use strict";

	/**
	 * Helper object to access a change from the back end. Access helper object for each change (and variant) which was fetched from the back end
	 *
	 * @constructor
	 * @author SAP SE
	 * @version 1.37.0-SNAPSHOT
	 * @experimental Since 1.25.0
	 * @param {object} oComponent - Component data to initiate <code>ChangePersistence<code> instance
	 * @param {string} oComponent.name - Name of the component this instance is responsible for
	 * @param {string} oComponent.appVersion - Version of application
	 */
	var ChangePersistence = function(oComponent) {
		this._oComponent = oComponent;
		//_mChanges contains:
		// - mChanges: map of changes (selector id)
		// - mDependencies: map of changes (change key) that need to be applied before any change. Used to check if a change can be applied. Format:
		//		mDependencies: {
		//			"fileNameChange2USERnamespace": {
		//				"changeObject": oChange2,
		//				"dependencies": ["fileNameChange1USERnamespace"]
		//			},
		//			"fileNameChange3USERnamespace": {
		//				"changeObject": oChange3,
		//				"dependencies": ["fileNameChange2USERnamespace"]
		//			}
		//		}
		// - mDependentChangesOnMe: map of changes (change key) that cannot be applied before the change. Used to remove dependencies faster. Format:
		//		mDependentChangesOnMe: {
		//			"fileNameChange1USERnamespace": [oChange2],
		//			"fileNameChange2USERnamespace": [oChange3]
		//		}
		this._mChanges = {
			mChanges: {},
			mDependencies: {},
			mDependentChangesOnMe: {}
		};

		if (!this._oComponent || !this._oComponent.name) {
			Utils.log.error("The Control does not belong to an SAPUI5 component. Personalization and changes for this control might not work as expected.");
			throw new Error("Missing component name.");
		}

		this._oConnector = this._createLrepConnector();
		this._aDirtyChanges = [];
	};

	ChangePersistence.NOTAG = "<NoTag>";

	/**
	 * Return the name of the SAPUI5 component. All changes are assigned to 1 SAPUI5 component. The SAPUI5 component also serves as authorization
	 * object.
	 *
	 * @returns {String} component name
	 * @public
	 */
	ChangePersistence.prototype.getComponentName = function() {
		return this._oComponent.name;
	};

	/**
	 * Creates a new instance of the LRepConnector
	 *
	 * @returns {sap.ui.fl.LrepConnector} LRep connector instance
	 * @private
	 */
	ChangePersistence.prototype._createLrepConnector = function() {
		return LRepConnector.createConnector();
	};


	ChangePersistence.prototype.getCacheKey = function() {
		return Cache.getChangesFillingCache(this._oConnector, this._oComponent).then(function(oWrappedChangeFileContent) {
			if (oWrappedChangeFileContent && oWrappedChangeFileContent.etag) {
				return oWrappedChangeFileContent.etag;
			}

			return ChangePersistence.NOTAG;
		});
	};

	/**
	 * Verifies whether a change fulfils the preconditions.
	 *
	 * All changes need to be matched with current active contexts;
	 * only changes whose <code>fileType<code> is 'change' and whose <code>changeType<code> is different from 'defaultVariant' are valid;
	 * if <code>bIncludeVariants<code> parameter is true, the changes with 'variant' <code>fileType<code> or 'defaultVariant' <code>changeType<code> are also valid;
	 * standard UI changes must have a selector <code>id<code>, smart variants must have a selector <code>persistencyKey<code>.
	 *
	 * @param {sap.ui.fl.context.Context[]} aActiveContexts - Array of current active contexts
	 * @param {boolean} [bIncludeVariants] - Indicates that smart variants shall be included
	 * @param {object} oChangeContent - Content of the change
	 *
	 * @returns {boolean} <code>true<code> if all the preconditions are fulfilled
	 * @public
	 */
	ChangePersistence.prototype._preconditionsFulfilled = function(aActiveContexts, bIncludeVariants, oChangeContent) {

		function _isValidFileType () {
			return (oChangeContent.fileType === "change") || (oChangeContent.fileType === "variant" && bIncludeVariants);
		}

		function _isValidSelector () {
			if (!oChangeContent.selector) {
				return false;
			}
			if (!bIncludeVariants) {
				if (!oChangeContent.selector.id) {
					return false;
				}
			} else {
				if ((oChangeContent.fileType === "variant") || (oChangeContent.changeType === "defaultVariant")){
					return !!oChangeContent.selector.persistencyKey;
				}
				if ((oChangeContent.fileType === "change") && (oChangeContent.changeType !== "defaultVariant")) {
					return !!oChangeContent.selector.id;
				}
			}
			return true;
		}

		function _isValidContext () {
			return ContextManager.doesContextMatch(oChangeContent, aActiveContexts);
		}

		if (_isValidFileType() && _isValidSelector() && _isValidContext()){
				return true;
		}
		return false;
	};

	/**
	 * Calls the back end asynchronously and fetches all changes for the component
	 * New changes (dirty state) that are not yet saved to the back end won't be returned.
	 * @param {map} mPropertyBag - Contains additional data needed for reading changes
	 * @param {object} mPropertyBag.appDescriptor - Manifest that belongs to actual component
	 * @param {string} mPropertyBag.siteId - ID of the site belonging to actual component
	 * @param {string} [mPropertyBag.sCurrentLayer] - Specifies a single layer for loading changes. If this parameter is set, the max layer filtering is not applied
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that changes shall be loaded without layer filtering
	 * @param {boolean} [mPropertyBag.includeVariants] - Indicates that smart variants shall be included
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForComponent = function(mPropertyBag) {
		return Cache.getChangesFillingCache(this._oConnector, this._oComponent, mPropertyBag).then(function(oWrappedChangeFileContent) {
			this._bHasLoadedChangesFromBackEnd = true;

			if (oWrappedChangeFileContent.changes && oWrappedChangeFileContent.changes.settings){
				Settings._storeInstance(oWrappedChangeFileContent.changes.settings);
			}

			if (!oWrappedChangeFileContent.changes || !oWrappedChangeFileContent.changes.changes) {
				return [];
			}

			var aChanges = oWrappedChangeFileContent.changes.changes;
			var sCurrentLayer = mPropertyBag && mPropertyBag.currentLayer;
			if (sCurrentLayer) {
				var aCurrentLayerChanges = [];
				aChanges.forEach(function (oChange) {
					if (oChange.layer === sCurrentLayer) {
						aCurrentLayerChanges.push(oChange);
					}
				});
				aChanges = aCurrentLayerChanges;
			} else if (Utils.isLayerFilteringRequired() && !(mPropertyBag && mPropertyBag.ignoreMaxLayerParameter)) {
				//If layer filtering required, excludes changes in higher layer than the max layer
				var aFilteredChanges = [];
				aChanges.forEach(function (oChange) {
					if (!Utils.isOverMaxLayer(oChange.layer)) {
						aFilteredChanges.push(oChange);
					}
				});
				aChanges = aFilteredChanges;
			}

			var bIncludeVariants = mPropertyBag && mPropertyBag.includeVariants;

			var aContextObjects = oWrappedChangeFileContent.changes.contexts || [];
			return new Promise(function (resolve) {
				ContextManager.getActiveContexts(aContextObjects).then(function (aActiveContexts) {
					resolve(aChanges.filter(this._preconditionsFulfilled.bind(this, aActiveContexts, bIncludeVariants)).map(createChange));
				}.bind(this));
			}.bind(this));

		}.bind(this));

		function createChange(oChangeContent) {
			return new Change(oChangeContent);
		}
	};

	/**
	 * @param {sap.ui.core.UIComponent} component containing the control for which the change should be added
	 * @param {sap.ui.fl.Change} change which should be added into the mapping
	 * @see sap.ui.fl.Change
	 * @returns {map} mChanges - map with added change
	 * @private
	 */
	ChangePersistence.prototype._addChangeIntoMap = function (oComponent, oChange) {
		var oSelector = oChange.getSelector();
		if (oSelector && oSelector.id) {
			var sSelectorId = oSelector.id;
			if (oSelector.idIsLocal) {
				sSelectorId = oComponent.createId(sSelectorId);
			}

			if (!this._mChanges.mChanges[sSelectorId]) {
				this._mChanges.mChanges[sSelectorId] = [];
			}
			this._mChanges.mChanges[sSelectorId].push(oChange);
		}

		return this._mChanges;
	};

	ChangePersistence.prototype._addDependency = function (oDependentChange, oChange) {
		if (!this._mChanges.mDependencies[oDependentChange.getKey()]) {
			this._mChanges.mDependencies[oDependentChange.getKey()] = {
				changeObject: oDependentChange,
				dependencies: []
			};
		}
		this._mChanges.mDependencies[oDependentChange.getKey()].dependencies.push(oChange.getKey());

		if (!this._mChanges.mDependentChangesOnMe[oChange.getKey()]) {
			this._mChanges.mDependentChangesOnMe[oChange.getKey()] = [];
		}
		this._mChanges.mDependentChangesOnMe[oChange.getKey()].push(oDependentChange.getKey());
	};

	/**
	 * Calls the back end asynchronously and fetches all changes for the component
	 * New changes (dirty state) that are not yet saved to the back end won't be returned.
	 * @param {object} oComponent - Component instance used to prepare the IDs (e.g. local)
	 * @param {map} mPropertyBag - Contains additional data needed for reading changes
	 * @param {object} mPropertyBag.appDescriptor - Manifest belonging to actual component
	 * @param {string} mPropertyBag.siteId - ID of the site belonging to actual component
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Resolving with a getter for the changes map
	 * @public
	 */
	ChangePersistence.prototype.loadChangesMapForComponent = function (oComponent, mPropertyBag) {
		var that = this;
		var oAppComponent = Utils.getAppComponentForControl(oComponent);

		return this.getChangesForComponent(mPropertyBag).then(createChangeMap);

		function createChangeMap(aChanges) {
			//Since starting RTA does not recreate ChangePersistence instance, resets changes map is required to filter personalized changes
			that._mChanges = {
				mChanges: {},
				mDependencies: {},
				mDependentChangesOnMe: {}
			};
			aChanges.forEach(function (oChange, iIndex, aCopy) {
				that._addChangeIntoMap(oComponent, oChange);

				//create dependencies map
				var aDependentIdList = oChange.getDependentIdList(oAppComponent);
				var oPreviousChange;
				var aPreviousDependentIdList;
				var iDependentIndex;
				var bFound;

				for (var i = iIndex - 1; i >= 0; i--) {//loop over the changes
					oPreviousChange = aCopy[i];
					aPreviousDependentIdList = aCopy[i].getDependentIdList(oAppComponent);
					bFound = false;
					for (var j = 0; j < aDependentIdList.length && !bFound; j++) {
						iDependentIndex = aPreviousDependentIdList.indexOf(aDependentIdList[j]);
						if (iDependentIndex > -1) {
							that._addDependency(oChange, oPreviousChange);
							bFound = true;
						}
					}
				}
			});

			return that.getChangesMapForComponent.bind(that);
		}
	};

	/**
	 * Getter for the private aggregation containing sap.ui.fl.Change objects mapped by their selector ids.
	 * @return {map} mChanges mapping with changes sorted by their selector ids
	 * @public
	 */
	ChangePersistence.prototype.getChangesMapForComponent = function () {
		return this._mChanges;
	};

	/**
	 * Gets the changes for the given view id. The complete view prefix has to match.
	 *
	 * Example:
	 * Change has selector id:
	 * view1--view2--controlId
	 *
	 * Will match for view:
	 * view1--view2
	 *
	 * Will not match for view:
	 * view1
	 * view1--view2--view3
	 *
	 * @param {string} sViewId - the id of the view, changes should be retrieved for
	 * @param {map} mPropertyBag - contains additional data that are needed for reading of changes
	 * @param {object} mPropertyBag.appDescriptor - Manifest that belongs to actual component
	 * @param {string} mPropertyBag.siteId - id of the site that belongs to actual component
	 * @returns {Promise} resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForView = function(sViewId, mPropertyBag) {
		var that = this;
		return this.getChangesForComponent(mPropertyBag).then(function(aChanges) {
			return aChanges.filter(changesHavingCorrectViewPrefix.bind(that));
		});

		function changesHavingCorrectViewPrefix(oChange) {
			var sSelectorId = oChange.getSelector().id;
			if (!sSelectorId || !mPropertyBag) {
				return false;
			}
			var sSelectorIdViewPrefix = sSelectorId.slice(0, sSelectorId.lastIndexOf("--"));
			var sViewId;

			if (oChange.getSelector().idIsLocal) {
				var oAppComponent = mPropertyBag.appComponent;
				if (oAppComponent) {
					sViewId = oAppComponent.getLocalId(mPropertyBag.viewId);
				}
			} else {
				sViewId = mPropertyBag.viewId;
			}

			return sSelectorIdViewPrefix === sViewId;
		}
	};

	/**
	 * Adds a new change (could be variant as well) and returns the id of the new change.
	 *
	 * @param {object} vChange - The complete and finalized JSON object representation the file content of the change or a Change instance
	 * @param {object} oComponent Component instance
	 * @returns {sap.ui.fl.Change} the newly created change object
	 * @public
	 */
	ChangePersistence.prototype.addChange = function(vChange, oComponent) {
		var oNewChange;
		if (vChange instanceof Change){
			oNewChange = vChange;
		}else {
			oNewChange = new Change(vChange);
		}
		this._aDirtyChanges.push(oNewChange);
		this._addChangeIntoMap(oComponent, oNewChange);

		return oNewChange;
	};

	/**
	 * Saves all dirty changes by calling the appropriate back-end method (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 *
	 * @returns {Promise} resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveDirtyChanges = function() {
		var aDirtyChangesClone = this._aDirtyChanges.slice(0);
		var aDirtyChanges = this._aDirtyChanges;
		var aRequests = this._getRequests(aDirtyChangesClone);
		var aPendingActions = this._getPendingActions(aDirtyChangesClone);

		if (aPendingActions.length === 1 && aRequests.length === 1 && aPendingActions[0] === "NEW") {
			var sRequest = aRequests[0];
			var aPreparedDirtyChangesBulk = this._prepareDirtyChanges(aDirtyChanges);
			return this._oConnector.create(aPreparedDirtyChangesBulk, sRequest).then(this._massUpdateCacheAndDirtyState(aDirtyChanges, aDirtyChangesClone));
		} else {
			return aDirtyChangesClone.reduce(function (sequence, oDirtyChange) {
				var saveAction = sequence.then(this._performSingleSaveAction(oDirtyChange).bind(this));
				saveAction.then(this._updateCacheAndDirtyState(aDirtyChanges, oDirtyChange));

				return saveAction;
			}.bind(this), Promise.resolve());
		}
	};

	ChangePersistence.prototype._performSingleSaveAction = function (oDirtyChange) {
		return function() {
			if (oDirtyChange.getPendingAction() === "NEW") {
				return this._oConnector.create(oDirtyChange.getDefinition(), oDirtyChange.getRequest());
			}

			if (oDirtyChange.getPendingAction() === "DELETE") {
				return this._oConnector.deleteChange({
					sChangeName: oDirtyChange.getId(),
					sLayer: oDirtyChange.getLayer(),
					sNamespace: oDirtyChange.getNamespace(),
					sChangelist: oDirtyChange.getRequest()
				});
			}
		};
	};

	ChangePersistence.prototype._updateCacheAndDirtyState = function (aDirtyChanges, oDirtyChange) {
		var that = this;

		return function() {
			if (oDirtyChange.getPendingAction() === "NEW") {
				Cache.addChange(that._oComponent, oDirtyChange.getDefinition());
			}

			if (oDirtyChange.getPendingAction() === "DELETE") {
				Cache.deleteChange(that._oComponent, oDirtyChange.getDefinition());
			}

			var iIndex = aDirtyChanges.indexOf(oDirtyChange);
			if (iIndex > -1) {
				aDirtyChanges.splice(iIndex, 1);
			}
		};
	};

	ChangePersistence.prototype._massUpdateCacheAndDirtyState = function (aDirtyChanges, aDirtyChangesClone) {
		var that = this;

		jQuery.each(aDirtyChangesClone, function (index, oDirtyChange) {
			that._updateCacheAndDirtyState(aDirtyChanges, oDirtyChange)();
		});
	};

	ChangePersistence.prototype._getRequests = function (aDirtyChanges) {
		var aRequests = [];

		jQuery.each(aDirtyChanges, function (index, oChange) {
			var sRequest = oChange.getRequest();
			if (aRequests.indexOf(sRequest) === -1) {
				aRequests.push(sRequest);
			}
		});

		return aRequests;
	};

	ChangePersistence.prototype._getPendingActions = function (aDirtyChanges) {
		var aPendingActions = [];

		jQuery.each(aDirtyChanges, function (index, oChange) {
			var sPendingAction = oChange.getPendingAction();
			if (aPendingActions.indexOf(sPendingAction) === -1) {
				aPendingActions.push(sPendingAction);
			}
		});

		return aPendingActions;
	};

	ChangePersistence.prototype._prepareDirtyChanges = function (aDirtyChanges) {
		var aChanges = [];

		jQuery.each(aDirtyChanges, function (index, oChange) {
			aChanges.push(oChange.getDefinition());
		});

		return aChanges;
	};

	ChangePersistence.prototype.getDirtyChanges = function() {
		return this._aDirtyChanges;
	};

	/**
	 * Prepares a change to be deleted with the next call to
	 * @see {ChangePersistence#saveDirtyChanges};
	 *
	 * If the given change is already in the dirty changes and
	 * has pending action 'NEW' it will be removed, assuming,
	 * it has just been created in the current session;
	 *
	 * Otherwise it will be marked for deletion.
	 *
	 * @param {sap.ui.fl.Change} oChange - the change to be deleted
	 */
	ChangePersistence.prototype.deleteChange = function(oChange) {
		var nIndexInDirtyChanges = this._aDirtyChanges.indexOf(oChange);

		if (nIndexInDirtyChanges > -1) {
			if (oChange.getPendingAction() === "DELETE"){
				return;
			}
			this._aDirtyChanges.splice(nIndexInDirtyChanges, 1);
			this._deleteChangeInMap(oChange);
			return;
		}

		oChange.markForDeletion();
		this._aDirtyChanges.push(oChange);
		this._deleteChangeInMap(oChange);
	};

	/**
	 * Deletes a change object from the internal map.
	 *
	 * @param {sap.ui.fl.Change} oChange which has to be removed from the mapping
	 * @private
	 */
	ChangePersistence.prototype._deleteChangeInMap = function (oChange) {
		var that = this;

		Object.keys(this._mChanges.mChanges).some(function (key) {
			var aChanges = that._mChanges.mChanges[key];
			var nIndexInMapElement = aChanges.indexOf(oChange);
			if (nIndexInMapElement !== -1) {
				aChanges.splice(nIndexInMapElement, 1);
				return true;
			}
		});
	};

	return ChangePersistence;
}, true);
