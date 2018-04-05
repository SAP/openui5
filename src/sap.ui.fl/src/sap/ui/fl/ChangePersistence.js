/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Change", "sap/ui/fl/Variant", "sap/ui/fl/Utils", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache", "sap/ui/fl/context/ContextManager", "sap/ui/fl/registry/Settings", "sap/ui/fl/transport/TransportSelection", "sap/ui/fl/variants/VariantController", "sap/ui/core/BusyIndicator", "sap/m/MessageBox"
], function(Change, Variant, Utils, LRepConnector, Cache, ContextManager, Settings, TransportSelection, VariantController, BusyIndicator, MessageBox) {
	"use strict";

	/**
	 * Helper object to access a change from the back end. Access helper object for each change (and variant) which was fetched from the back end
	 *
	 * @constructor
	 * @author SAP SE
	 * @version 1.37.0-SNAPSHOT
	 * @experimental Since 1.25.0
	 * @param {object} mComponent Component data to initiate <code>ChangePersistence</code> instance
	 * @param {string} mComponent.name Name of the component this instance is responsible for
	 * @param {string} mComponent.appVersion Version of application
	 */
	var ChangePersistence = function(mComponent) {
		this._mComponent = mComponent;
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

		this._mChangesInitial = {};

		this._mVariantsChanges = {};

		if (!this._mComponent || !this._mComponent.name) {
			Utils.log.error("The Control does not belong to an SAPUI5 component. Personalization and changes for this control might not work as expected.");
			throw new Error("Missing component name.");
		}

		this._oVariantController = new VariantController(this._mComponent.name, this._mComponent.appVersion, {});
		this._oTransportSelection = new TransportSelection();
		this._oConnector = this._createLrepConnector();
		this._aDirtyChanges = [];
		this._oMessagebundle = undefined;
		this._mChangesEntries = {};
	};

	/**
	 * Return the name of the SAPUI5 component. All changes are assigned to 1 SAPUI5 component. The SAPUI5 component also serves as authorization
	 * object.
	 *
	 * @returns {String} component name
	 * @public
	 */
	ChangePersistence.prototype.getComponentName = function() {
		return this._mComponent.name;
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


	/**
	 * Returns an cache key for caching views.
	 *
	 * @returns {string} Returns an ETag for caching
	 * @private
	 * @restricted sap.ui.fl
	 */
	ChangePersistence.prototype.getCacheKey = function() {
		return Cache.getCacheKey(this._mComponent);
	};

	/**
	 * Verifies whether a change fulfils the preconditions.
	 *
	 * All changes need to have a fileName;
	 * changes need to be matched with current active contexts;
	 * only changes whose <code>fileType</code> is 'change' and whose <code>changeType</code> is different from 'defaultVariant' are valid;
	 * if <code>bIncludeVariants</code> parameter is true, the changes with 'variant' <code>fileType</code> or 'defaultVariant' <code>changeType</code> are also valid
	 * if it has a selector <code>persistencyKey</code>.
	 *
	 * @param {sap.ui.fl.context.Context[]} aActiveContexts Array of current active contexts
	 * @param {boolean} [bIncludeVariants] Indicates that smart variants shall be included
	 * @param {object} oChangeContent Content of the change
	 *
	 * @returns {boolean} <code>true</code> if all the preconditions are fulfilled
	 * @public
	 */
	ChangePersistence.prototype._preconditionsFulfilled = function(aActiveContexts, bIncludeVariants, oChangeContent) {

		if (!oChangeContent.fileName) {
			Utils.log.warning("A change without fileName is detected and excluded from component: " + this._mComponent.name);
			return false;
		}

		function _isValidFileType () {
			if (bIncludeVariants) {
				return (oChangeContent.fileType === "change") || (oChangeContent.fileType === "variant");
			}
			return (oChangeContent.fileType === "change") && (oChangeContent.changeType !== "defaultVariant");
		}

		function _isValidSelector () {
			if (bIncludeVariants) {
				if ((oChangeContent.fileType === "variant") || (oChangeContent.changeType === "defaultVariant")){
					return oChangeContent.selector && oChangeContent.selector.persistencyKey;
				}
			}
			return true;
		}

		function _isValidContext () {
			return ContextManager.doesContextMatch(oChangeContent, aActiveContexts);
		}

		function _isControlVariantChange () {
			if ((oChangeContent.fileType === "ctrl_variant") || (oChangeContent.fileType === "ctrl_variant_change") || (oChangeContent.fileType === "ctrl_variant_management_change")){
				return oChangeContent.variantManagementReference || oChangeContent.variantReference || (oChangeContent.selector && oChangeContent.selector.id);
			}
		}

		if ((_isValidFileType() && _isValidSelector() && _isValidContext()) || _isControlVariantChange()){
				return true;
		}
		return false;
	};

	/**
	 * Calls the back end asynchronously and fetches all changes for the component
	 * New changes (dirty state) that are not yet saved to the back end won't be returned.
	 * @param {map} mPropertyBag Contains additional data needed for reading changes
	 * @param {object} mPropertyBag.appDescriptor Manifest that belongs to the current running component
	 * @param {string} mPropertyBag.siteId ID of the site belonging to the current running component
	 * @param {string} [mPropertyBag.sCurrentLayer] Specifies a single layer for loading changes. If this parameter is set, the max layer filtering is not applied
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] Indicates that changes shall be loaded without layer filtering
	 * @param {boolean} [mPropertyBag.includeVariants] Indicates that smart variants shall be included
	 * @param {string} [mPropertyBag.cacheKey] Key to validate the cache entry stored on client side
	 * @param {string} [mPropertyBag.url] Address to which the request for change should be sent in case the data is not cached
	 * @param {sap.ui.core.Component} [mPropertyBag.oComponent] App component instance of component
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Promise resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForComponent = function(mPropertyBag) {
		return Cache.getChangesFillingCache(this._oConnector, this._mComponent, mPropertyBag).then(function(oWrappedChangeFileContent) {
			var oComponent = mPropertyBag && mPropertyBag.oComponent;

			if (oWrappedChangeFileContent.changes && oWrappedChangeFileContent.changes.settings){
				Settings._storeInstance(oWrappedChangeFileContent.changes.settings);
			}

			if (!oWrappedChangeFileContent.changes ||
				((!oWrappedChangeFileContent.changes.changes || oWrappedChangeFileContent.changes.changes.length == 0) &&
				(!oWrappedChangeFileContent.changes.variantSection || jQuery.isEmptyObject(oWrappedChangeFileContent.changes.variantSection)))) {
				return [];
			}

			var aChanges = oWrappedChangeFileContent.changes.changes;

			//Binds a json model of message bundle to the component the first time a change within the vendor layer was detected
			//It enables the translation of changes

			if (!this._oMessagebundle && oWrappedChangeFileContent.messagebundle && oComponent) {
				if (!oComponent.getModel("i18nFlexVendor")) {
					if (aChanges.some(function(oChange) {
							return oChange.layer === "VENDOR";
						})) {
							this._oMessagebundle = oWrappedChangeFileContent.messagebundle;
							var oModel = new sap.ui.model.json.JSONModel(this._oMessagebundle);
							oComponent.setModel(oModel, "i18nFlexVendor");
					}
				}
			}

			if ( oWrappedChangeFileContent.changes.variantSection
					&& Object.keys(oWrappedChangeFileContent.changes.variantSection).length !== 0
					&& Object.keys(this._oVariantController._getChangeFileContent()).length === 0 ) {
				this._oVariantController._setChangeFileContent(oWrappedChangeFileContent, oComponent);
			}

			var bIncludeControlVariants = mPropertyBag && mPropertyBag.includeCtrlVariants;
			if (Object.keys(this._oVariantController._getChangeFileContent()).length > 0) {
				var aVariantChanges = this._oVariantController.loadInitialChanges();
				aChanges = bIncludeControlVariants ? aChanges : aChanges.concat(aVariantChanges);

			}
			if (bIncludeControlVariants && oWrappedChangeFileContent.changes.variantSection) {
				aChanges = aChanges.concat(this._getAllCtrlVariantChanges(oWrappedChangeFileContent.changes.variantSection));
			}

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
					resolve(aChanges.filter(this._preconditionsFulfilled.bind(this, aActiveContexts, bIncludeVariants)).map(getChange.bind(this)));
				}.bind(this));
			}.bind(this));
		}.bind(this));

		function getChange(oChangeContent) {
			var oChange;
			if (!this._mChangesEntries[oChangeContent.fileName]) {
				this._mChangesEntries[oChangeContent.fileName] = new Change(oChangeContent);
			}
			oChange = this._mChangesEntries[oChangeContent.fileName];
			oChange.setState(Change.states.PERSISTED);
			return oChange;
		}
	};

	ChangePersistence.prototype._getAllCtrlVariantChanges = function(mVariantManagementReference) {
		var aCtrlVariantChanges = [];
		Object.keys(mVariantManagementReference).forEach(function(sVariantManagementReference) {
			var oVariantManagementContent = mVariantManagementReference[sVariantManagementReference];

			oVariantManagementContent.variants.forEach( function(oVariant) {
				if (Array.isArray(oVariant.variantChanges.setVisible) &&
					oVariant.variantChanges.setVisible.length > 0) {
					var oActiveChangeContent = oVariant.variantChanges.setVisible.slice(-1)[0];
					if (!oActiveChangeContent.content.visible && oActiveChangeContent.content.createdByReset) {
						return;
					}
				}

				//variant_change
				Object.keys(oVariant.variantChanges).forEach(function(sVariantChange) {
					aCtrlVariantChanges = aCtrlVariantChanges.concat(oVariant.variantChanges[sVariantChange].slice(-1)[0]); /*last change*/
				});

				//control_change
				aCtrlVariantChanges = aCtrlVariantChanges.concat(oVariant.controlChanges);

				//variant - don't copy standard variant
				aCtrlVariantChanges = (oVariant.content.fileName !== sVariantManagementReference) ?
											aCtrlVariantChanges.concat([oVariant.content]) :
											aCtrlVariantChanges;
			});

			//variant_management_change
			Object.keys(oVariantManagementContent.variantManagementChanges).forEach(function(sVariantManagementChange) {
				aCtrlVariantChanges = aCtrlVariantChanges.concat(oVariantManagementContent.variantManagementChanges[sVariantManagementChange].slice(-1)[0]); /*last change*/
			});
		});
		return aCtrlVariantChanges;
	};

	/**
	 * Gets all changes which belong to a specific smart variant, such as filter bar or table.
	 * @param {string} sStableIdPropertyName Property name of variant stable ID
	 * @param {string} sStableId Value of variant stable ID
	 * @param {map} mPropertyBag Contains additional data needed for reading changes
	 * @param {object} mPropertyBag.appDescriptor Manifest that belongs to the current running component
	 * @param {string} mPropertyBag.siteId ID of the site belonging to the current running component
	 * @param {boolean} mPropertyBag.includeVariants Indicates whether smart variants shall be included
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Promise resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForVariant = function(sStableIdPropertyName, sStableId, mPropertyBag) {
		if (this._mVariantsChanges[sStableId]) {
			return Promise.resolve(this._mVariantsChanges[sStableId]);
		}

		var isChangeValidForVariant = function(oChange) {
			var isValid = false;
			var oSelector = oChange._oDefinition.selector;
			jQuery.each(oSelector, function(id, value){
				if (id === sStableIdPropertyName && value === sStableId) {
					isValid = true;
				}
			});
			return isValid;
		};

		var fLogError = function(key, text) {
			Utils.log.error("key : " + key + " and text : " + text.value);
		};

		return this.getChangesForComponent(mPropertyBag).then(function(aChanges) {
			return aChanges.filter(isChangeValidForVariant);
		}).then(function(aChanges) {
			this._mVariantsChanges[sStableId] = {};
			if (aChanges && aChanges.length === 0) {
				return LRepConnector.isFlexServiceAvailable().then(function (bStatus) {
					if (bStatus === false) {
						return Promise.reject();
					}
					return Promise.resolve(this._mVariantsChanges[sStableId]);
				}.bind(this));
			}
			var sId;
			aChanges.forEach(function (oChange){
				sId = oChange.getId();
				if (oChange.isValid()) {
					if (this._mVariantsChanges[sStableId][sId] && oChange.isVariant()) {
						Utils.log.error("Id collision - two or more variant files having the same id detected: " + sId);
						jQuery.each(oChange.getDefinition().texts, fLogError);
						Utils.log.error("already exists in variant : ");
						jQuery.each(this._mVariantsChanges[sStableId][sId].getDefinition().texts, fLogError);
					}
					this._mVariantsChanges[sStableId][sId] = oChange;
				}
			}.bind(this));
			return this._mVariantsChanges[sStableId];
		}.bind(this));
	};

	/**
	 * Adds a new change (could be variant as well) for a smart variant, such as filter bar or table, and returns the ID of the new change.
	 * @param {string} sStableIdPropertyName Property name of variant stable ID
	 * @param {string} sStableId Value of variant stable ID
	 * @param {object} mParameters Map of parameters, see below
	 * @param {string} mParameters.type Type <filterVariant, tableVariant, etc>
	 * @param {string} mParameters.ODataService Name of the OData service --> can be null
	 * @param {object} mParameters.texts A map object containing all translatable texts which are referenced within the file
	 * @param {object} mParameters.content Content of the new change
	 * @param {boolean} mParameters.isVariant Indicates if the change is a variant
	 * @param {string} [mParameters.packageName] Package name for the new entity <default> is $tmp
	 * @param {boolean} mParameters.isUserDependent Indicates if a change is only valid for the current user
	 * @param {boolean} [mParameters.id] ID of the change. The ID has to be globally unique and should only be set in exceptional cases, for example
	 *        downport of variants
	 * @returns {string} The ID of the newly created change
	 * @public
	 */
	ChangePersistence.prototype.addChangeForVariant = function( sStableIdPropertyName, sStableId, mParameters) {
		var oFile, oInfo, mInternalTexts, oChange, sId;

		if (!mParameters) {
			return undefined;
		}
		if (!mParameters.type) {
			Utils.log.error("sap.ui.fl.Persistence.addChange : type is not defined");
		}
		//if (!mParameters.ODataService) {
		//	Utils.log.error("sap.ui.fl.Persistence.addChange : ODataService is not defined");
		//}
		var sContentType = jQuery.type(mParameters.content);
		if (sContentType !== 'object' && sContentType !== 'array') {
			Utils.log.error("mParameters.content is not of expected type object or array, but is: " + sContentType, "sap.ui.fl.Persistence#addChange");
		}
		// convert the text object to the internal structure
		mInternalTexts = {};
		if (typeof (mParameters.texts) === "object") {
			jQuery.each(mParameters.texts, function(id, text) {
				mInternalTexts[id] = {
					value: text,
					type: "XFLD"
				};
			});
		}

		var oValidAppVersions = {
			creation: this._mComponent.appVersion,
			from: this._mComponent.appVersion
		};
		if (this._mComponent.appVersion && mParameters.developerMode) {
			oValidAppVersions.to = this._mComponent.appVersion;
		}

		oInfo = {
			changeType: mParameters.type,
			service: mParameters.ODataService,
			texts: mInternalTexts,
			content: mParameters.content,
			reference: this._mComponent.name, //in this case the component name can also be the value of sap-app-id
			isVariant: mParameters.isVariant,
			packageName: mParameters.packageName,
			isUserDependent: mParameters.isUserDependent,
			validAppVersions: oValidAppVersions
		};

		oInfo.selector = {};
		oInfo.selector[sStableIdPropertyName] = sStableId;

		oFile = Change.createInitialFileContent(oInfo);

		// If id is provided, overwrite generated id
		if (mParameters.id) {
			oFile.fileName = mParameters.id;
		}

		oChange = new Change(oFile);

		sId = oChange.getId();
		if (!this._mVariantsChanges[sStableId]) {
			this._mVariantsChanges[sStableId] = {};
		}
		this._mVariantsChanges[sStableId][sId] = oChange;
		return oChange.getId();
	};

	/**
	 * Saves/flushes all current changes of a smart variant to the backend.
	 *
	 * @returns {Promise} Promise resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	ChangePersistence.prototype.saveAllChangesForVariant = function(sStableId) {
		var aPromises = [];
		var that = this;
		jQuery.each(this._mVariantsChanges[sStableId], function(id, oChange) {
			var sChangeId = oChange.getId();
			switch (oChange.getPendingAction()) {
				case "NEW":
					aPromises.push(that._oConnector.create(oChange.getDefinition(), oChange.getRequest(), oChange.isVariant()).then(function(result) {
						oChange.setResponse(result.response);
						if (Cache.isActive()) {
							Cache.addChange({ name: that._mComponent.name, appVersion: that._mComponent.appVersion}, result.response);
						}
						return result;
					}));
					break;
				case "UPDATE":
					aPromises.push(that._oConnector.update(oChange.getDefinition(), oChange.getId(), oChange.getRequest(), oChange.isVariant()).then(function(result) {
						oChange.setResponse(result.response);
						if (Cache.isActive()) {
							Cache.updateChange({ name: that._mComponent.name, appVersion: that._mComponent.appVersion}, result.response);
						}
						return result;
					}));
					break;
				case "DELETE":
					aPromises.push(that._oConnector.deleteChange({
						sChangeName: oChange.getId(),
						sLayer: oChange.getLayer(),
						sNamespace: oChange.getNamespace(),
						sChangelist: oChange.getRequest()
					}, oChange.isVariant()).then(function(result) {
						var oChange = that._mVariantsChanges[sStableId][sChangeId];
						if (oChange.getPendingAction() === "DELETE") {
							delete that._mVariantsChanges[sStableId][sChangeId];
						}
						if (Cache.isActive()) {
							Cache.deleteChange({ name: that._mComponent.name, appVersion: that._mComponent.appVersion}, oChange.getDefinition());
						}
						return result;
					}));
					break;
				default:
					break;
			}
		});

		// TODO Consider not rejecting with first error, but wait for all promises and collect the results
		return Promise.all(aPromises);
	};

	/**
	 * @param {sap.ui.core.UIComponent} oComponent component containing the control for which the change should be added
	 * @param {sap.ui.fl.Change} oChange change which should be added into the mapping
	 * @see sap.ui.fl.Change
	 * @returns {map} mChanges map with added change
	 * @private
	 */
	ChangePersistence.prototype._addChangeIntoMap = function (oComponent, oChange) {
		var oSelector = oChange.getSelector();
		if (oSelector && oSelector.id) {
			var sSelectorId = oSelector.id;
			if (oSelector.idIsLocal) {
				sSelectorId = oComponent.createId(sSelectorId);
			}

			this._addMapEntry(sSelectorId, oChange);

			// if the localId flag is missing and the selector has a component prefix that is not matching the
			// application component, adds the change for a second time replacing the component ID prefix with
			// the application component ID prefix
			if (oSelector.idIsLocal === undefined && sSelectorId.indexOf("---") != -1) {
				var sComponentPrefix = sSelectorId.split("---")[0];

				if (sComponentPrefix !== oComponent.getId()) {
					sSelectorId = sSelectorId.split("---")[1];
					sSelectorId = oComponent.createId(sSelectorId);
					this._addMapEntry(sSelectorId, oChange);
				}
			}
		}

		return this._mChanges;
	};

	/**
	 *
	 * @param {string} sSelectorId Key in the mapping for which the entry is written
	 * @param {sap.ui.fl.Change} oChange Change object to be added to the mapping
	 * @private
	 */
	ChangePersistence.prototype._addMapEntry = function (sSelectorId, oChange) {
		if (!this._mChanges.mChanges[sSelectorId]) {
			this._mChanges.mChanges[sSelectorId] = [];
		}
		this._mChanges.mChanges[sSelectorId].push(oChange);
	};

	ChangePersistence.prototype._addDependency = function (oDependentChange, oChange) {
		if (!this._mChanges.mDependencies[oDependentChange.getId()]) {
			this._mChanges.mDependencies[oDependentChange.getId()] = {
				changeObject: oDependentChange,
				dependencies: []
			};
		}
		this._mChanges.mDependencies[oDependentChange.getId()].dependencies.push(oChange.getId());

		if (!this._mChanges.mDependentChangesOnMe[oChange.getId()]) {
			this._mChanges.mDependentChangesOnMe[oChange.getId()] = [];
		}
		this._mChanges.mDependentChangesOnMe[oChange.getId()].push(oDependentChange.getId());
	};

	ChangePersistence.prototype._addControlsDependencies = function (oDependentChange, aControlIdList) {
		if (aControlIdList.length > 0) {
			if (!this._mChanges.mDependencies[oDependentChange.getId()]) {
				this._mChanges.mDependencies[oDependentChange.getId()] = {
					changeObject: oDependentChange,
					dependencies: [],
					controlsDependencies: []
				};
			}
			this._mChanges.mDependencies[oDependentChange.getId()].controlsDependencies = aControlIdList;
		}
	};

	/**
	 * Calls the back end asynchronously and fetches all changes for the component
	 * New changes (dirty state) that are not yet saved to the back end won't be returned.
	 * @param {object} oComponent Component instance used to prepare the IDs (e.g. local)
	 * @param {map} mPropertyBag Contains additional data needed for reading changes
	 * @param {object} mPropertyBag.appDescriptor Manifest belonging to actual component
	 * @param {string} mPropertyBag.siteId ID of the site belonging to actual component
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Promise resolving with a getter for the changes map
	 * @public
	 */
	ChangePersistence.prototype.loadChangesMapForComponent = function (oComponent, mPropertyBag) {

		mPropertyBag.oComponent = oComponent;
		return this.getChangesForComponent(mPropertyBag).then(createChangeMap.bind(this));

		function createChangeMap(aChanges) {
			//Since starting RTA does not recreate ChangePersistence instance, resets changes map is required to filter personalized changes
			this._mChanges = {
				mChanges: {},
				mDependencies: {},
				mDependentChangesOnMe: {}
			};
			aChanges.forEach(this._addChangeAndUpdateDependencies.bind(this, oComponent));

			if (Utils.isDebugEnabled()) {
				this._mChangesInitial = jQuery.extend(true, {}, this._mChanges);
			}

			return this.getChangesMapForComponent.bind(this);
		}
	};

	ChangePersistence.prototype._addChangeAndUpdateDependencies = function(oComponent, oChange, iIndex, aChangesCopy) {
		this._addChangeIntoMap(oComponent, oChange);

		var oAppComponent = Utils.getAppComponentForControl(oComponent);

		//create dependencies map
		var aDependentIdList = oChange.getDependentIdList(oAppComponent);
		var aDependentControlIdList = oChange.getDependentControlIdList(oAppComponent);
		this._addControlsDependencies(oChange, aDependentControlIdList);
		var oPreviousChange;
		var aPreviousDependentIdList;
		var iDependentIndex;
		var bFound;

		for (var i = iIndex - 1; i >= 0; i--) {//loop over the changes
			oPreviousChange = aChangesCopy[i];
			aPreviousDependentIdList = aChangesCopy[i].getDependentIdList(oAppComponent);
			bFound = false;
			for (var j = 0; j < aDependentIdList.length && !bFound; j++) {
				iDependentIndex = aPreviousDependentIdList.indexOf(aDependentIdList[j]);
				if (iDependentIndex > -1) {
					this._addDependency(oChange, oPreviousChange);
					bFound = true;
				}
			}
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
	 * @param {string} sViewId the id of the view, changes should be retrieved for
	 * @param {map} mPropertyBag contains additional data that are needed for reading of changes
	 * @param {object} mPropertyBag.appDescriptor Manifest that belongs to actual component
	 * @param {string} mPropertyBag.siteId id of the site that belongs to actual component
	 * @returns {Promise} resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForView = function(sViewId, mPropertyBag) {
		var that = this;
		return this.getChangesForComponent(mPropertyBag).then(function(aChanges) {
			return aChanges.filter(changesHavingCorrectViewPrefix.bind(that));
		});

		function changesHavingCorrectViewPrefix(oChange) {
			var oSelector = oChange.getSelector();
			if (!oSelector){
				return false;
			}
			var sSelectorId = oSelector.id;
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
	 * @param {object} vChange The complete and finalized JSON object representation the file content of the change or a Change instance
	 * @param {object} oComponent Component instance
	 * @returns {sap.ui.fl.Change|sap.ui.fl.variant} the newly created change or variant
	 * @public
	 */
	ChangePersistence.prototype.addChange = function(vChange, oComponent) {
		var oChange = this.addDirtyChange(vChange);
		//control variants are not needed in map
		//if (oChange.getFileType() !== "ctrl_variant") {
		this._addChangeIntoMap(oComponent, oChange);
		//}
		this._addPropagationListener(oComponent);
		return oChange;
	};

	/**
	 * Adds a new dirty change (could be variant as well).
	 *
	 * @param {object} vChange - JSON object of change/variant or change/variant object
	 * @returns {sap.ui.fl.Change|sap.ui.fl.Variant} oNewChange - Prepared change or variant
	 * @public
	 */
	ChangePersistence.prototype.addDirtyChange = function(vChange) {
		var oNewChange;
		if (vChange instanceof Change || vChange instanceof Variant){
			oNewChange = vChange;
		} else {
			oNewChange = new Change(vChange);
		}
		this._aDirtyChanges.push(oNewChange);
		return oNewChange;
	};

	/**
	 * If the first changes were created, the <code>propagationListener</code> of <code>sap.ui.fl</code> might not yet
	 * be attached to the application component and must be added then.
	 *
	 * @param {sap.ui.core.UiComponent} oComponent Application component that might not have a propagation listener yet
	 * @private
	 */
	ChangePersistence.prototype._addPropagationListener = function (oComponent) {
		if (oComponent) {
			var fnCheckIsNotFlPropagationListener = function (fnPropagationListener) {
				return !fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			};
			var bNoFlPropagationListenerAttached = oComponent.getPropagationListeners().every(fnCheckIsNotFlPropagationListener);

			if (bNoFlPropagationListenerAttached) {
				var oManifest = oComponent.getManifest();
				var sVersion = Utils.getAppVersionFromManifest(oManifest);
				var oFlexController = sap.ui.fl.FlexControllerFactory.create(this.getComponentName(), sVersion);
				var fnPropagationListener = oFlexController.getBoundApplyChangesOnControl(this.getChangesMapForComponent.bind(this), oComponent);
				oComponent.addPropagationListener(fnPropagationListener);
			}
		}
	};

	/**
	 * Saves all dirty changes by calling the appropriate back-end method (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 *
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 * @returns {Promise} resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveDirtyChanges = function(bSkipUpdateCache) {
		var aDirtyChangesClone = this._aDirtyChanges.slice(0);
		var aDirtyChanges = this._aDirtyChanges;
		var aRequests = this._getRequests(aDirtyChangesClone);
		var aPendingActions = this._getPendingActions(aDirtyChangesClone);

		if (aPendingActions.length === 1 && aRequests.length === 1 && aPendingActions[0] === "NEW") {
			var sRequest = aRequests[0];
			var aPreparedDirtyChangesBulk = this._prepareDirtyChanges(aDirtyChanges);
			return this._oConnector.create(aPreparedDirtyChangesBulk, sRequest).then(this._massUpdateCacheAndDirtyState(aDirtyChanges, aDirtyChangesClone, bSkipUpdateCache));
		} else {
			return aDirtyChangesClone.reduce(function (sequence, oDirtyChange) {
				var saveAction = sequence.then(this._performSingleSaveAction(oDirtyChange));
				saveAction.then(this._updateCacheAndDirtyState(aDirtyChanges, oDirtyChange, bSkipUpdateCache));
				return saveAction;
			}.bind(this), Promise.resolve());
		}
	};

	/**
	 * Saves a sequence of dirty changes by calling the appropriate back-end method (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 *
	 * @param {sap.ui.fl.Change[] || sap.ui.fl.Variant[]} aDirtyChanges - Array of dirty changes to be saved.
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 * @returns {Promise} resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveSequenceOfDirtyChanges = function(aDirtyChanges, bSkipUpdateCache) {
		var aAllDirtyChanges = this.getDirtyChanges();

		return aDirtyChanges.reduce(function (sequence, oDirtyChange) {
			var saveAction = sequence.then(this._performSingleSaveAction(oDirtyChange));
			saveAction.then(this._updateCacheAndDirtyState(aAllDirtyChanges, oDirtyChange, bSkipUpdateCache));
			return saveAction;
		}.bind(this), Promise.resolve());
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
		}.bind(this);
	};

	/**
	  * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	  * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 */
	ChangePersistence.prototype._updateCacheAndDirtyState = function (aDirtyChanges, oDirtyChange, bSkipUpdateCache) {
		return function() {
			if (!bSkipUpdateCache) {
				if (oDirtyChange.getPendingAction() === "NEW" &&
					oDirtyChange.getFileType() !== "ctrl_variant_change" &&
					oDirtyChange.getFileType() !== "ctrl_variant_management_change" &&
					oDirtyChange.getFileType() !== "ctrl_variant" &&
					!oDirtyChange.getVariantReference()
				) {
					Cache.addChange(this._mComponent, oDirtyChange.getDefinition());
				} else if (oDirtyChange.getPendingAction() === "DELETE") {
					Cache.deleteChange(this._mComponent, oDirtyChange.getDefinition());
				}
			}

			var iIndex = aDirtyChanges.indexOf(oDirtyChange);
			if (iIndex > -1) {
				aDirtyChanges.splice(iIndex, 1);
			}
		}.bind(this);
	};

	/**
	  * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	  * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 */
	ChangePersistence.prototype._massUpdateCacheAndDirtyState = function (aDirtyChanges, aDirtyChangesClone, bSkipUpdateCache) {
		aDirtyChangesClone.forEach(function(oDirtyChange) {
			this._updateCacheAndDirtyState(aDirtyChanges, oDirtyChange, bSkipUpdateCache)();
		}, this);
	};

	ChangePersistence.prototype._getRequests = function (aDirtyChanges) {
		var aRequests = [];

		aDirtyChanges.forEach(function(oChange) {
			var sRequest = oChange.getRequest();
			if (aRequests.indexOf(sRequest) === -1) {
				aRequests.push(sRequest);
			}
		});

		return aRequests;
	};

	ChangePersistence.prototype._getPendingActions = function (aDirtyChanges) {
		var aPendingActions = [];

		aDirtyChanges.forEach(function(oChange) {
			var sPendingAction = oChange.getPendingAction();
			if (aPendingActions.indexOf(sPendingAction) === -1) {
				aPendingActions.push(sPendingAction);
			}
		});

		return aPendingActions;
	};

	ChangePersistence.prototype._prepareDirtyChanges = function (aDirtyChanges) {
		var aChanges = [];

		aDirtyChanges.forEach(function(oChange) {
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
	 * @param {sap.ui.fl.Change} oChange the change to be deleted
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
		this.addDirtyChange(oChange);
		this._deleteChangeInMap(oChange);
	};

	/**
	 * Deletes a change object from the internal map.
	 *
	 * @param {sap.ui.fl.Change} oChange which has to be removed from the mapping
	 * @private
	 */
	ChangePersistence.prototype._deleteChangeInMap = function (oChange) {
		var sChangeKey = oChange.getId();
		var mChanges = this._mChanges.mChanges;
		var mDependencies = this._mChanges.mDependencies;
		var mDependentChangesOnMe = this._mChanges.mDependentChangesOnMe;

		//mChanges
		Object.keys(mChanges).some(function (key) {
			var aChanges = mChanges[key];
			var nIndexInMapElement = aChanges
				.map(function(oExistingChange){
					return oExistingChange.getId();
				}).indexOf(oChange.getId());
			if (nIndexInMapElement !== -1) {
				aChanges.splice(nIndexInMapElement, 1);
				return true;
			}
		});

		//mDependencies
		Object.keys(mDependencies).forEach( function(key) {
			if (key === sChangeKey) {
				delete mDependencies[key];
			} else if ( mDependencies[key].dependencies
				&& jQuery.isArray(mDependencies[key].dependencies)
				&& mDependencies[key].dependencies.indexOf(sChangeKey) !== -1 ) {
				mDependencies[key].dependencies.splice(mDependencies[key].dependencies.indexOf(sChangeKey), 1);
				if (mDependencies[key].dependencies.length === 0) {
					delete mDependencies[key];
				}
			}
		});

		//mDependentChangesOnMe
		Object.keys(mDependentChangesOnMe).forEach( function(key) {
			if (key === sChangeKey) {
				delete mDependentChangesOnMe[key];
			} else if ( jQuery.isArray(mDependentChangesOnMe[key])
				&& mDependentChangesOnMe[key].indexOf(sChangeKey) !== -1 ) {
				mDependentChangesOnMe[key].splice(mDependentChangesOnMe[key].indexOf(sChangeKey), 1);
				if (mDependentChangesOnMe[key].length === 0) {
					delete mDependentChangesOnMe[key];
				}
			}
		});
	};

	/**
	 * TODO!!!
	 *
	 * @param {sap.ui.fl.Change} oChange the change to be deleted
	 */
	ChangePersistence.prototype.loadSwitchChangesMapForComponent = function(sVariantManagementId, sCurrentVariant, sNewVariant) {
		return this._oVariantController.getChangesForVariantSwitch(sVariantManagementId, sCurrentVariant, sNewVariant, this._mChanges.mChanges);
	};

	ChangePersistence.prototype.transportAllUIChanges = function(oRootControl, sStyleClass, sLayer) {
		var fnHandleAllErrors = function (oError) {
			BusyIndicator.hide();
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
			var sMessage = oResourceBundle.getText("MSG_TRANSPORT_ERROR", oError ? [oError.message || oError] : undefined);
			var sTitle = oResourceBundle.getText("HEADER_TRANSPORT_ERROR");
			Utils.log.error("transport error" + oError);
			MessageBox.show(sMessage, {
				icon: MessageBox.Icon.ERROR,
				title: sTitle,
				styleClass: sStyleClass
			});
			return "Error";
		};

		return this._oTransportSelection.openTransportSelection(null, oRootControl, sStyleClass)
			.then(function(oTransportInfo) {
				if (this._oTransportSelection.checkTransportInfo(oTransportInfo)) {
					BusyIndicator.show(0);
					return this.getChangesForComponent({currentLayer: sLayer, includeCtrlVariants: true})
						.then(function(aAllLocalChanges) {
							return this._oTransportSelection._prepareChangesForTransport(oTransportInfo, aAllLocalChanges)
								.then(function() {
									BusyIndicator.hide();
								});
						}.bind(this));
				} else {
					return "Cancel";
				}
			}.bind(this))
			['catch'](fnHandleAllErrors);
	};

	/**
	 * Reset changes on the server.
	 *
	 * @returns {Promise} promise that resolves without parameters
	 */
	ChangePersistence.prototype.resetChanges = function (sLayer, sGenerator) {
		return this.getChangesForComponent({currentLayer: sLayer, includeCtrlVariants: true})
			.then(function(aChanges) {
				return Settings.getInstance(this.getComponentName())
					.then(function(oSettings) {
						if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
							return this._oTransportSelection.setTransports(aChanges, sap.ui.getCore().getComponent(this.getComponentName()));
						}
					}.bind(this))
						.then(function() {
							var sUriOptions =
								"?reference=" + this.getComponentName() +
								"&appVersion=" + this._mComponent.appVersion +
								"&layer=" + sLayer +
								"&generator=" + sGenerator;
							if (aChanges.length > 0) {
								sUriOptions = sUriOptions + "&changelist=" + aChanges[0].getRequest();
							}

							return this._oConnector.send("/sap/bc/lrep/changes/" + sUriOptions, "DELETE");
						}.bind(this));
			}.bind(this));
	};

	return ChangePersistence;
}, true);
