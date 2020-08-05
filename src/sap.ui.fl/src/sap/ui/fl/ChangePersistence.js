/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Variant",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Cache",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/includes",
	"sap/base/util/merge",
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/write/_internal/condenser/Condenser"
], function(
	DependencyHandler,
	StorageUtils,
	Change,
	Layer,
	Variant,
	Utils,
	LayerUtils,
	Cache,
	Applier,
	Storage,
	JsControlTreeModifier,
	Component,
	JSONModel,
	Measurement,
	jQuery,
	includes,
	merge,
	UriParameters,
	Log,
	VariantManagementState,
	Condenser
) {
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

		this._mChanges = DependencyHandler.createEmptyDependencyMap();
		this._bChangesMapCreated = false;

		//_mChangesInitial contains a clone of _mChanges to recreated dependencies if changes need to be reapplied
		this._mChangesInitial = merge({}, this._mChanges);

		this._mVariantsChanges = {};

		if (!this._mComponent || !this._mComponent.name) {
			Log.error("The Control does not belong to an SAPUI5 component. Personalization and changes for this control might not work as expected.");
			throw new Error("Missing component name.");
		}

		this._aDirtyChanges = [];
		this._oMessagebundle = undefined;
		this._mChangesEntries = {};
		this._bHasChangesOverMaxLayer = false;
		this.HIGHER_LAYER_CHANGES_EXIST = "higher_layer_changes_exist";
	};

	function replaceChangeContentWithInstance(oVariant, oChange) {
		return oVariant.controlChanges.some(function(oChangeContent, index) {
			if (oChangeContent.fileName === oChange.getDefinition().fileName) {
				oVariant.controlChanges.splice(index, 1, oChange);
				return true;
			}
		});
	}

	function getChangeInstance(oFileContent, oChangeOrChangeContent) {
		var oChange;
		if (oChangeOrChangeContent instanceof Change) {
			oChange = oChangeOrChangeContent; // can have other states
			this._mChangesEntries[oChange.getFileName()] = oChange;
		} else {
			if (!this._mChangesEntries[oChangeOrChangeContent.fileName]) {
				this._mChangesEntries[oChangeOrChangeContent.fileName] = new Change(oChangeOrChangeContent);
			}
			oChange = this._mChangesEntries[oChangeOrChangeContent.fileName];
			oChange.setState(Change.states.PERSISTED); // persisted change

			// if change instance was passed, it will be already present in the variant
			// if change content was passed, then replace the newly created change instance in the variant
			var sVariantReference = oChange.getVariantReference();
			if (sVariantReference) {
				var oVariant = VariantManagementState.getVariant({
					vReference: sVariantReference,
					reference: this._mComponent.name
				});
				if (oVariant) {
					replaceChangeContentWithInstance(oVariant, oChange);
				}
			}
		}
		return oChange;
	}

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
	 * Returns an cache key for caching views.
	 *
	 * @param {object} oAppComponent - Application component
	 * @returns {Promise} Returns a promise with an ETag for caching
	 * @private
	 * @restricted sap.ui.fl
	 */
	ChangePersistence.prototype.getCacheKey = function(oAppComponent) {
		return Cache.getCacheKey(this._mComponent, oAppComponent);
	};

	/**
	 * Verifies whether a change fulfils the preconditions.
	 *
	 * All changes need to have a fileName;
	 * only changes whose <code>fileType</code> is 'change' and whose <code>changeType</code> is different from 'defaultVariant' are valid;
	 * if <code>bIncludeVariants</code> parameter is true, the changes with 'variant' <code>fileType</code> or 'defaultVariant' <code>changeType</code> are also valid
	 * if it has a selector <code>persistencyKey</code>.
	 *
	 * @param {boolean} [bIncludeVariants] Indicates that smart variants shall be included
	 * @param {object} oChangeOrChangeContent Change instance or content of the change
	 *
	 * @returns {boolean} <code>true</code> if all the preconditions are fulfilled
	 * @public
	 */
	ChangePersistence.prototype._preconditionsFulfilled = function(bIncludeVariants, oChangeOrChangeContent) {
		var oChangeContent = oChangeOrChangeContent instanceof Change ? oChangeOrChangeContent.getDefinition() : oChangeOrChangeContent;
		if (!oChangeContent.fileName) {
			Log.warning("A change without fileName is detected and excluded from component: " + this._mComponent.name);
			return false;
		}

		function _isValidFileType() {
			if (bIncludeVariants) {
				return (oChangeContent.fileType === "change") || (oChangeContent.fileType === "variant");
			}
			return (oChangeContent.fileType === "change") && (oChangeContent.changeType !== "defaultVariant");
		}

		function _isValidSelector() {
			if (bIncludeVariants) {
				if ((oChangeContent.fileType === "variant") || (oChangeContent.changeType === "defaultVariant")) {
					return oChangeContent.selector && oChangeContent.selector.persistencyKey;
				}
			}
			return true;
		}

		function _isControlVariantChange() {
			if ((oChangeContent.fileType === "ctrl_variant") || (oChangeContent.fileType === "ctrl_variant_change") || (oChangeContent.fileType === "ctrl_variant_management_change")) {
				return oChangeContent.variantManagementReference || oChangeContent.variantReference || (oChangeContent.selector && oChangeContent.selector.id);
			}
		}

		if (_isValidFileType() && _isValidSelector() || _isControlVariantChange()) {
			return true;
		}
		return false;
	};

	/**
	 * Calls the back end asynchronously and fetches all changes for the component
	 * New changes (dirty state) that are not yet saved to the back end won't be returned.
	 * @param {map} mPropertyBag Contains additional data needed for reading changes
	 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to the current running component
	 * @param {string} [mPropertyBag.siteId] ID of the site belonging to the current running component
	 * @param {string} [mPropertyBag.currentLayer] Specifies a single layer for loading changes. If this parameter is set, the max layer filtering is not applied
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] Indicates that changes shall be loaded without layer filtering
	 * @param {boolean} [mPropertyBag.includeVariants] Indicates that smart variants shall be included
	 * @param {string} [mPropertyBag.cacheKey] Key to validate the cache entry stored on client side
	 * @param {sap.ui.core.Component} [mPropertyBag.component] - Component instance
	 * @param {boolean} bInvalidateCache - should the cache be invalidated
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Promise resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForComponent = function(mPropertyBag, bInvalidateCache) {
		return Cache.getChangesFillingCache(this._mComponent, mPropertyBag, bInvalidateCache).then(function(mPropertyBag, oWrappedChangeFileContent) {
			var oChangeFileContent = merge({}, oWrappedChangeFileContent);
			var oAppComponent = mPropertyBag && mPropertyBag.component && Utils.getAppComponentForControl(mPropertyBag.component);

			var bHasFlexObjects = StorageUtils.isStorageResponseFilled(oChangeFileContent.changes);

			if (!bHasFlexObjects) {
				return [];
			}

			var aChanges = oChangeFileContent.changes.changes;

			//Binds a json model of message bundle to the component the first time a change within the vendor layer was detected
			//It enables the translation of changes
			if (!this._oMessagebundle && oChangeFileContent.messagebundle && oAppComponent) {
				if (!oAppComponent.getModel("i18nFlexVendor")) {
					if (aChanges.some(function(oChange) {
						return oChange.layer === Layer.VENDOR;
					})) {
						this._oMessagebundle = oChangeFileContent.messagebundle;
						var oModel = new JSONModel(this._oMessagebundle);
						oAppComponent.setModel(oModel, "i18nFlexVendor");
					}
				}
			}

			var sCurrentLayer = mPropertyBag && mPropertyBag.currentLayer;
			var bFilterMaxLayer = !(mPropertyBag && mPropertyBag.ignoreMaxLayerParameter);
			var fnFilter = function() { return true; };
			if (sCurrentLayer) {
				fnFilter = this._filterChangeForCurrentLayer.bind(this, sCurrentLayer);
				aChanges = aChanges.filter(fnFilter);
			} else if (LayerUtils.isLayerFilteringRequired() && bFilterMaxLayer) {
				fnFilter = this._filterChangeForMaxLayer.bind(this);
				//If layer filtering required, excludes changes in higher layer than the max layer
				aChanges = aChanges.filter(fnFilter);
			} else if (this._bHasChangesOverMaxLayer && !bFilterMaxLayer) {
				// ignoreMaxLayerParameter = true is set from flexController.hasHigherLayerChanges(),
				// triggered by rta.stop(), to check if reload needs to be performed
				// as ctrl variant changes are already gone and to improve performance, just return the constant
				this._bHasChangesOverMaxLayer = false;
				return this.HIGHER_LAYER_CHANGES_EXIST;
			}

			var bIncludeControlVariants = oChangeFileContent.changes && mPropertyBag && mPropertyBag.includeCtrlVariants;
			var aFilteredVariantChanges = this._getAllCtrlVariantChanges(oChangeFileContent, bIncludeControlVariants, fnFilter);
			aChanges = aChanges.concat(aFilteredVariantChanges);

			var bIncludeVariants = mPropertyBag && mPropertyBag.includeVariants;

			return this._checkAndGetChangeInstances(aChanges, bIncludeVariants, oChangeFileContent);
		}.bind(this, mPropertyBag));
	};

	ChangePersistence.prototype._checkAndGetChangeInstances = function(aChanges, bIncludeVariants, oChangeFileContent) {
		return aChanges
			.filter(this._preconditionsFulfilled.bind(this, bIncludeVariants))
			.map(getChangeInstance.bind(this, oChangeFileContent));
	};

	ChangePersistence.prototype._filterChangeForMaxLayer = function(oChangeOrChangeContent) {
		if (LayerUtils.isOverMaxLayer(this._getLayerFromChangeOrChangeContent(oChangeOrChangeContent))) {
			if (!this._bHasChangesOverMaxLayer) {
				this._bHasChangesOverMaxLayer = true;
			}
			return false;
		}
		return true;
	};

	ChangePersistence.prototype._filterChangeForCurrentLayer = function(sLayer, oChangeOrChangeContent) {
		return sLayer === this._getLayerFromChangeOrChangeContent(oChangeOrChangeContent);
	};

	ChangePersistence.prototype._getLayerFromChangeOrChangeContent = function(oChangeOrChangeContent) {
		var sChangeLayer;
		if (oChangeOrChangeContent instanceof Variant || oChangeOrChangeContent instanceof Change) {
			sChangeLayer = oChangeOrChangeContent.getLayer();
		} else {
			sChangeLayer = oChangeOrChangeContent.layer;
		}
		return sChangeLayer;
	};

	ChangePersistence.prototype._getAllCtrlVariantChanges = function(oChangeFileContent, bIncludeCtrlVariants, fnFilter) {
		if (!bIncludeCtrlVariants) {
			return VariantManagementState.getInitialChanges({reference: this._mComponent.name});
		}
		return ["variants", "variantChanges", "variantDependentControlChanges", "variantManagementChanges"]
			.reduce(function(aResult, sVariantChangeType) {
				if (oChangeFileContent.changes[sVariantChangeType]) {
					return aResult.concat(oChangeFileContent.changes[sVariantChangeType]);
				}
				return aResult;
			}, [])
			.filter(fnFilter);
	};

	/**
	 * Returns internal change map of all SmartVariantManagement controls, such as SmartFilterBar or SmartTable.
	 * @returns {object} A map of "persistencyKey" and belonging changes
	 * @public
	 */
	ChangePersistence.prototype.getSmartVariantManagementChangeMap = function() {
		return this._mVariantsChanges;
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
	ChangePersistence.prototype.getControlChangesForVariant = function(sStableIdPropertyName, sStableId, mPropertyBag) {
		if (this._mVariantsChanges[sStableId]) {
			return Promise.resolve(this._mVariantsChanges[sStableId]);
		}

		var isChangeValidForVariant = function(oChange) {
			var isValid = false;
			var oSelector = oChange._oDefinition.selector;
			jQuery.each(oSelector, function(id, value) {
				if (id === sStableIdPropertyName && value === sStableId) {
					isValid = true;
				}
			});
			return isValid;
		};

		var fLogError = function(key, text) {
			Log.error("key : " + key + " and text : " + text.value);
		};

		return this.getChangesForComponent(mPropertyBag).then(function(aChanges) {
			return aChanges.filter(isChangeValidForVariant);
		}).then(function(aChanges) {
			if (!this._mVariantsChanges[sStableId]) {
				this._mVariantsChanges[sStableId] = {};
			}

			var sId;
			aChanges.forEach(function(oChange) {
				sId = oChange.getId();
				if (oChange.isValid()) {
					if (this._mVariantsChanges[sStableId][sId] && oChange.isVariant()) {
						Log.error("Id collision - two or more variant files having the same id detected: " + sId);
						jQuery.each(oChange.getDefinition().texts, fLogError);
						Log.error("already exists in variant : ");
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
	ChangePersistence.prototype.addChangeForVariant = function(sStableIdPropertyName, sStableId, mParameters) {
		var oFile;
		var oInfo;
		var mInternalTexts;
		var oChange;
		var sId;

		if (!mParameters) {
			return undefined;
		}
		if (!mParameters.type) {
			Log.error("sap.ui.fl.Persistence.addChange : type is not defined");
		}
		//if (!mParameters.ODataService) {
		//	Log.error("sap.ui.fl.Persistence.addChange : ODataService is not defined");
		//}
		var sContentType = typeof mParameters.content;
		if (!mParameters.content || (sContentType !== 'object' && !Array.isArray(mParameters.content))) {
			Log.error("mParameters.content is not of expected type object or array, but is: " + sContentType, "sap.ui.fl.Persistence#addChange");
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
	 * @private
	 */
	ChangePersistence.prototype.saveAllChangesForVariant = function(sStableId) {
		var aPromises = [];
		jQuery.each(this._mVariantsChanges[sStableId], function(id, oChange) {
			var sChangeId = oChange.getId();
			switch (oChange.getPendingAction()) {
				case "NEW":
					var oCreatePromise = Storage.write({
						flexObjects: [oChange.getDefinition()],
						layer: oChange.getLayer(),
						transport: oChange.getRequest(),
						isLegacyVariant: oChange.isVariant()
					}).then(function(result) {
						if (result && result.response && result.response[0]) {
							oChange.setResponse(result.response[0]);
						} else {
							oChange.setState(Change.states.PERSISTED);
						}
						Cache.addChange({
							name: this._mComponent.name,
							appVersion: this._mComponent.appVersion
						}, oChange.getDefinition());
						return result;
					}.bind(this));

					aPromises.push(oCreatePromise);
					break;
				case "UPDATE":
					var oUpdatePromise = Storage.update({
						flexObject: oChange.getDefinition(),
						layer: oChange.getLayer(),
						transport: oChange.getRequest()
					}).then(function(result) {
						if (result && result.response) {
							oChange.setResponse(result.response);
						} else {
							oChange.setState(Change.states.PERSISTED);
						}
						Cache.updateChange({
							name: this._mComponent.name,
							appVersion: this._mComponent.appVersion
						}, oChange.getDefinition());
						return result;
					}.bind(this));

					aPromises.push(oUpdatePromise);
					break;
				case "DELETE":
					var oDeletionPromise = Storage.remove({
						flexObject: oChange.getDefinition(),
						layer: oChange.getLayer(),
						transport: oChange.getRequest()
					}).then(function(result) {
						var oChange = this._mVariantsChanges[sStableId][sChangeId];
						if (oChange.getPendingAction() === "DELETE") {
							delete this._mVariantsChanges[sStableId][sChangeId];
						}
						Cache.deleteChange({
							name: this._mComponent.name,
							appVersion: this._mComponent.appVersion
						}, oChange.getDefinition());
						return result;
					}.bind(this));

					aPromises.push(oDeletionPromise);
					break;
				default:
					break;
			}
		}.bind(this));

		// TODO Consider not rejecting with first error, but wait for all promises and collect the results
		return Promise.all(aPromises);
	};

	/**
	 * Calls the back end asynchronously and fetches all changes for the component
	 * New changes (dirty state) that are not yet saved to the back end won't be returned.
	 * @param {object} oAppComponent - Component instance used to prepare the IDs (e.g. local)
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Promise resolving with a getter for the changes map
	 * @public
	 */
	ChangePersistence.prototype.loadChangesMapForComponent = function(oAppComponent) {
		return this.getChangesForComponent({component: oAppComponent}).then(createChangeMap.bind(this));

		function createChangeMap(aChanges) {
			Measurement.start("fl.createDependencyMap", "Measurement of creating initial dependency map");
			//Since starting RTA does not recreate ChangePersistence instance, resets changes map is required to filter personalized changes
			this._mChanges = DependencyHandler.createEmptyDependencyMap();

			aChanges.forEach(this._addChangeAndUpdateDependencies.bind(this, oAppComponent));

			this._mChangesInitial = merge({}, this._mChanges);

			Measurement.end("fl.createDependencyMap", "Measurement of creating initial dependency map");
			this._bChangesMapCreated = true;
			return this.getChangesMapForComponent.bind(this);
		}
	};

	/**
	 * Checks the current dependencies map for any unresolved dependencies belonging to the given control
	 * Returns true as soon as the first dependency is found, otherwise false
	 *
	 * @param {object} oSelector selector of the control
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance that is currently loading
	 * @returns {boolean} Returns true if there are open dependencies
	 */
	ChangePersistence.prototype.checkForOpenDependenciesForControl = function(oSelector, oAppComponent) {
		return DependencyHandler.checkForOpenDependenciesForControl(this._mChanges, JsControlTreeModifier.getControlIdBySelector(oSelector, oAppComponent), oAppComponent);
	};

	/**
	 * This function copies the initial dependencies (before any changes got applied and dependencies got deleted) for the given change to the mChanges map
	 * Also checks if the dependency is still valid in a callback
	 * This function is used in the case that controls got destroyed and recreated
	 *
	 * @param {sap.ui.fl.Change} oChange The change whose dependencies should be copied
	 * @param {function} fnDependencyValidation this function is called to check if the dependency is still valid
	 * @param {sap.ui.core.Component} oAppComponent Application component instance that is currently loading
	 * @returns {object} Returns the mChanges object with the updated dependencies
	 */
	ChangePersistence.prototype.copyDependenciesFromInitialChangesMap = function(oChange, fnDependencyValidation, oAppComponent) {
		var mInitialDependencies = merge({}, this._mChangesInitial.mDependencies);
		var oInitialDependency = mInitialDependencies[oChange.getId()];

		if (oInitialDependency) {
			var aNewValidDependencies = [];
			oInitialDependency.dependencies.forEach(function(sChangeId) {
				if (fnDependencyValidation(sChangeId)) {
					this._mChanges.mDependentChangesOnMe[sChangeId] = this._mChanges.mDependentChangesOnMe[sChangeId] || [];
					this._mChanges.mDependentChangesOnMe[sChangeId].push(oChange.getId());
					aNewValidDependencies.push(sChangeId);
				}
			}.bind(this));

			var sControlId;
			var aNewValidControlDependencies = [];
			oInitialDependency.controlsDependencies.forEach(function(oDependentControlSelector) {
				// if the control is already available we don't need to add a dependency to it
				if (!JsControlTreeModifier.bySelector(oDependentControlSelector, oAppComponent)) {
					sControlId = JsControlTreeModifier.getControlIdBySelector(oDependentControlSelector, oAppComponent);
					aNewValidControlDependencies.push(oDependentControlSelector);
					this._mChanges.mControlsWithDependencies[sControlId] = this._mChanges.mControlsWithDependencies[sControlId] || [];
					if (!includes(this._mChanges.mControlsWithDependencies[sControlId], oChange.getId())) {
						this._mChanges.mControlsWithDependencies[sControlId].push(oChange.getId());
					}
				}
			}.bind(this));

			oInitialDependency.dependencies = aNewValidDependencies;
			oInitialDependency.controlsDependencies = aNewValidControlDependencies;
			if (aNewValidDependencies.length || aNewValidControlDependencies.length) {
				this._mChanges.mDependencies[oChange.getId()] = oInitialDependency;
			}
		}
		return this._mChanges;
	};

	ChangePersistence.prototype._addChangeAndUpdateDependencies = function(oAppComponent, oChange) {
		// the change status should always be initial when it gets added to the map / dependencies
		// if the component gets recreated the status of the change might not be initial
		oChange.setInitialApplyState();
		DependencyHandler.addChangeAndUpdateDependencies(oChange, oAppComponent, this._mChanges);
	};

	ChangePersistence.prototype._addRunTimeCreatedChangeAndUpdateDependencies = function(oAppComponent, oChange) {
		DependencyHandler.addRuntimeChangeAndUpdateDependencies(oChange, oAppComponent, this._mChanges, this._mChangesInitial);
	};

	/**
	 * Getter for the private aggregation containing sap.ui.fl.Change objects mapped by their selector ids.
	 * @return {map} mChanges mapping with changes sorted by their selector ids
	 * @public
	 */
	ChangePersistence.prototype.getChangesMapForComponent = function() {
		return this._mChanges;
	};

	/**
	 * Checks if the changes map for the component has been created or not.
	 * @return {boolean} <code>true</code> if the changes map has been created
	 * @public
	 */
	ChangePersistence.prototype.isChangeMapCreated = function() {
		return this._bChangesMapCreated;
	};

	ChangePersistence.prototype.changesHavingCorrectViewPrefix = function(mPropertyBag, oChange) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var oSelector = oChange.getSelector();
		if (!oSelector || !mPropertyBag) {
			return false;
		}
		if (oSelector.viewSelector) {
			var sSelectorViewId = oModifier.getControlIdBySelector(oSelector.viewSelector, oAppComponent);
			return sSelectorViewId === mPropertyBag.viewId;
		}
		var sSelectorId = oSelector.id;
		if (sSelectorId) {
			var sViewId;
			if (oChange.getSelector().idIsLocal) {
				if (oAppComponent) {
					sViewId = oAppComponent.getLocalId(mPropertyBag.viewId);
				}
			} else {
				sViewId = mPropertyBag.viewId;
			}
			var iIndex = 0;
			var sSelectorIdViewPrefix;
			do {
				iIndex = sSelectorId.indexOf("--", iIndex);
				sSelectorIdViewPrefix = sSelectorId.slice(0, iIndex);
				iIndex++;
			} while (sSelectorIdViewPrefix !== sViewId && iIndex > 0);

			return sSelectorIdViewPrefix === sViewId;
		}
		return false;
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
	 * @param {map} mPropertyBag contains additional data that are needed for reading of changes
	 * @param {string} mPropertyBag.viewId - id of the view
	 * @param {string} mPropertyBag.name - name of the view
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component for the view
	 * @param {string} mPropertyBag.componentId - responsible component's id for the view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - responsible modifier
	 * @returns {Promise} resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForView = function(mPropertyBag) {
		return this.getChangesForComponent(mPropertyBag).then(function(aChanges) {
			return aChanges.filter(this.changesHavingCorrectViewPrefix.bind(this, mPropertyBag));
		}.bind(this));
	};

	/**
	 * Adds a new change (could be variant as well) and returns the id of the new change.
	 *
	 * @param {object} vChange - The complete and finalized JSON object representation the file content of the change or a Change instance
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {sap.ui.fl.Change|sap.ui.fl.variant} the newly created change or variant
	 * @public
	 */
	ChangePersistence.prototype.addChange = function(vChange, oAppComponent) {
		var oChange = this.addDirtyChange(vChange);
		this._addRunTimeCreatedChangeAndUpdateDependencies(oAppComponent, oChange);
		this._addPropagationListener(oAppComponent);
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
		if (vChange instanceof Change || vChange instanceof Variant) {
			oNewChange = vChange;
		} else {
			oNewChange = new Change(vChange);
		}

		// don't add the same change twice
		if (this._aDirtyChanges.indexOf(oNewChange) === -1) {
			this._aDirtyChanges.push(oNewChange);
		}
		return oNewChange;
	};

	/**
	 * If the first changes were created, the <code>propagationListener</code> of <code>sap.ui.fl</code> might not yet
	 * be attached to the application component and must be added then.
	 *
	 * @param {sap.ui.core.UIComponent} oComponent Component having an app component that might not have a propagation listener yet
	 * @private
	 */
	ChangePersistence.prototype._addPropagationListener = function(oComponent) {
		var oAppComponent = Utils.getAppComponentForControl(oComponent);
		if (oAppComponent instanceof Component) {
			var fnCheckIsNotFlPropagationListener = function(fnPropagationListener) {
				return !fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			};

			var bNoFlPropagationListenerAttached = oAppComponent.getPropagationListeners().every(fnCheckIsNotFlPropagationListener);

			if (bNoFlPropagationListenerAttached) {
				var oManifest = oAppComponent.getManifestObject();
				var sVersion = Utils.getAppVersionFromManifest(oManifest);
				var oFlexControllerFactory = sap.ui.require("sap/ui/fl/FlexControllerFactory");
				var oFlexController = oFlexControllerFactory.create(this.getComponentName(), sVersion);
				var fnPropagationListener = Applier.applyAllChangesForControl.bind(Applier, this.getChangesMapForComponent.bind(this), oAppComponent, oFlexController);
				fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
				oAppComponent.addPropagationListener(fnPropagationListener);
			}
		}
	};

	ChangePersistence.prototype._deleteNotSavedChanges = function(aChanges, aCondensedChanges) {
		aChanges.filter(function(oChange) {
			return !aCondensedChanges.some(function(oCondensedChange) {
				return oChange.getId() === oCondensedChange.getId();
			});
		}).forEach(function(oChange) {
			this.deleteChange(oChange, true);
		}.bind(this));
	};

	function shouldCondensingBeEnabled(oAppComponent, aChanges) {
		var bCondenserEnabled = false;

		if (!oAppComponent || aChanges.length < 2) {
			return false;
		}

		var aLayers = aChanges.map(function(oChange) {
			return oChange.getLayer();
		});
		var aUniqueLayers = aLayers.filter(function(sValue, iIndex, aLayers) {
			return aLayers.indexOf(sValue) === iIndex;
		});

		if (aUniqueLayers.length > 1) {
			return false;
		}

		if (aUniqueLayers[0] === "CUSTOMER" || aUniqueLayers[0] === "USER") {
			bCondenserEnabled = true;
		}

		var oUriParameters = UriParameters.fromURL(window.location.href);
		if (oUriParameters.has("sap-ui-xx-condense-changes")) {
			bCondenserEnabled = oUriParameters.get("sap-ui-xx-condense-changes") === "true";
		}

		return bCondenserEnabled;
	}

	/**
	 * Saves the passed or all dirty changes by calling the appropriate back-end method (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 * If all changes are new they are condensed before they are passed to the Storage. For this the App Component is necessary.
	 * Condensing is enabled by default for CUSTOMER and USER layers, but can be overruled with the URL Parameter 'sap-ui-xx-condense-changes'
	 *
	 * @param {sap.ui.core.UIComponent} [oAppComponent] - AppComponent instance
	 * @param {boolean} [bSkipUpdateCache] - If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 * @param {sap.ui.fl.Change} [aChanges] - If passed only those changes are saved
	 * @param {boolean} [bDraft=false] - Indicates if changes should be written as a draft
	 * @returns {Promise} Resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveDirtyChanges = function(oAppComponent, bSkipUpdateCache, aChanges, bDraft) {
		aChanges = aChanges || this._aDirtyChanges;
		var aChangesClone = aChanges.slice(0);
		var aRequests = this._getRequests(aChanges);
		var aPendingActions = this._getPendingActions(aChanges);

		if (aPendingActions.length === 1 && aRequests.length === 1 && aPendingActions[0] === "NEW") {
			var oCondensedChangesPromise = Promise.resolve(aChangesClone);
			if (shouldCondensingBeEnabled(oAppComponent, aChangesClone)) {
				oCondensedChangesPromise = Condenser.condense(oAppComponent, aChangesClone);
			}
			return oCondensedChangesPromise.then(function(aCondensedChanges) {
				if (aCondensedChanges.length) {
					var sRequest = aRequests[0];
					var aPreparedDirtyChangesBulk = this._prepareDirtyChanges(aCondensedChanges);
					return Storage.write({
						layer: aPreparedDirtyChangesBulk[0].layer,
						flexObjects: aPreparedDirtyChangesBulk,
						transport: sRequest,
						isLegacyVariant: false,
						draft: bDraft
					}).then(function(oResponse) {
						this._massUpdateCacheAndDirtyState(aCondensedChanges, bSkipUpdateCache);
						this._deleteNotSavedChanges(aChanges, aCondensedChanges);
						return oResponse;
					}.bind(this));
				}
				this._deleteNotSavedChanges(aChanges, aCondensedChanges);
			}.bind(this));
		}
		return this.saveSequenceOfDirtyChanges(aChangesClone, bSkipUpdateCache, bDraft);
	};

	/**
	 * Saves a sequence of dirty changes by calling the appropriate back-end method (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 *
	 * @param {sap.ui.fl.Change[] | sap.ui.fl.Variant[]} aDirtyChanges - Array of dirty changes to be saved.
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 * @param {boolean} [bDraft=false] - Indicates if changes should be written as a draft
	 * @returns {Promise} resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveSequenceOfDirtyChanges = function(aDirtyChanges, bSkipUpdateCache, bDraft) {
		return aDirtyChanges.reduce(function(oPreviousPromise, oDirtyChange) {
			return oPreviousPromise
				.then(this._performSingleSaveAction(oDirtyChange, bDraft))
				.then(this._updateCacheAndDirtyState.bind(this, oDirtyChange, bSkipUpdateCache));
		}.bind(this), Promise.resolve());
	};

	ChangePersistence.prototype._performSingleSaveAction = function(oDirtyChange, bDraft) {
		return function() {
			if (oDirtyChange.getPendingAction() === "NEW") {
				return Storage.write({
					layer: oDirtyChange.getLayer(),
					flexObjects: [oDirtyChange.getDefinition()],
					transport: oDirtyChange.getRequest(),
					isLegacyVariant: oDirtyChange.isVariant(),
					draft: bDraft
				});
			}

			if (oDirtyChange.getPendingAction() === "DELETE") {
				return Storage.remove({
					flexObject: oDirtyChange.getDefinition(),
					layer: oDirtyChange.getLayer(),
					transport: oDirtyChange.getRequest()
				});
			}
		};
	};

	/**
	 * Updates the cache with the dirty change passed and removes it from the array of dirty changes if present.
	 * @param {sap.ui.fl.Change} oDirtyChange Dirty change which was saved
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app
	 * therefore, the cache update of the current app is skipped
	 */
	ChangePersistence.prototype._updateCacheAndDirtyState = function(oDirtyChange, bSkipUpdateCache) {
		if (!bSkipUpdateCache) {
			if (Utils.isChangeRelatedToVariants(oDirtyChange)) {
				VariantManagementState.updateVariantsState({
					reference: this._mComponent.name,
					changeToBeAddedOrDeleted: oDirtyChange
				});
			} else if (oDirtyChange.getPendingAction() === "NEW") {
				Cache.addChange(this._mComponent, oDirtyChange.getDefinition());
			} else if (oDirtyChange.getPendingAction() === "DELETE") {
				Cache.deleteChange(this._mComponent, oDirtyChange.getDefinition());
			}
		}

		this._aDirtyChanges = this._aDirtyChanges.filter(function(oExistingDirtyChange) {
			return oDirtyChange.getId() !== oExistingDirtyChange.getId();
		});
	};

	/**
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 */
	ChangePersistence.prototype._massUpdateCacheAndDirtyState = function(aDirtyChanges, bSkipUpdateCache) {
		aDirtyChanges.forEach(function(oDirtyChange) {
			this._updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache);
		}, this);
	};

	ChangePersistence.prototype._getRequests = function(aDirtyChanges) {
		var aRequests = [];

		aDirtyChanges.forEach(function(oChange) {
			var sRequest = oChange.getRequest();
			if (aRequests.indexOf(sRequest) === -1) {
				aRequests.push(sRequest);
			}
		});

		return aRequests;
	};

	ChangePersistence.prototype._getPendingActions = function(aDirtyChanges) {
		var aPendingActions = [];

		aDirtyChanges.forEach(function(oChange) {
			var sPendingAction = oChange.getPendingAction();
			if (aPendingActions.indexOf(sPendingAction) === -1) {
				aPendingActions.push(sPendingAction);
			}
		});

		return aPendingActions;
	};

	ChangePersistence.prototype._prepareDirtyChanges = function(aDirtyChanges) {
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
	 * @param {boolean} [bRunTimeCreatedChange] set if the change was created at runtime
	 */
	ChangePersistence.prototype.deleteChange = function(oChange, bRunTimeCreatedChange) {
		var nIndexInDirtyChanges = this._aDirtyChanges.indexOf(oChange);

		if (nIndexInDirtyChanges > -1) {
			if (oChange.getPendingAction() === "DELETE") {
				return;
			}
			this._aDirtyChanges.splice(nIndexInDirtyChanges, 1);
			this._deleteChangeInMap(oChange, bRunTimeCreatedChange);
			return;
		}

		oChange.markForDeletion();
		this.addDirtyChange(oChange);
		this._deleteChangeInMap(oChange, bRunTimeCreatedChange);
	};

	/**
	 * Deletes a change object from the internal map.
	 *
	 * @param {sap.ui.fl.Change} oChange change which has to be removed from the mapping
	 * @param {boolean} [bRunTimeCreatedChange] set if the change was created at runtime
	 * @private
	 */
	ChangePersistence.prototype._deleteChangeInMap = function(oChange, bRunTimeCreatedChange) {
		var sChangeKey = oChange.getId();
		DependencyHandler.removeChangeFromMap(this._mChanges, sChangeKey);
		DependencyHandler.removeChangeFromDependencies(bRunTimeCreatedChange ? this._mChangesInitial : this._mChanges, sChangeKey);
	};

	/**
	 * Transports all the UI changes and app variant descriptor (if exists) to the target system
	 *
	 * @param {object} oRootControl - the root control of the running application
	 * @param {string} sStyleClass - RTA style class name
	 * @param {string} sLayer - Working layer
	 * @param {array} [aAppVariantDescriptors] - an array of app variant descriptors which needs to be transported
	 * @returns {Promise} promise that resolves when all the artifacts are successfully transported
	 */
	ChangePersistence.prototype.transportAllUIChanges = function(oRootControl, sStyleClass, sLayer, aAppVariantDescriptors) {
		return this.getChangesForComponent({currentLayer: sLayer, includeCtrlVariants: true})
			.then(function(aAllLocalChanges) {
				return Storage.publish({
					transportDialogSettings: {
						rootControl: oRootControl, //TODO not used value, should be removed.
						styleClass: sStyleClass
					},
					layer: sLayer,
					reference: this.getComponentName(),
					appVersion: this._mComponent.appVersion,
					localChanges: aAllLocalChanges,
					appVariantDescriptors: aAppVariantDescriptors
				});
			}.bind(this));
	};

	/**
	 * Collect changes from the internal map by names
	 *
	 * @param {string[]} aNames Names of changes
	 * @returns {sap.ui.fl.Change[]} aChanges Array of changes with corresponding names
	 * @private
	 */
	ChangePersistence.prototype._getChangesFromMapByNames = function(aNames) {
		return this._mChanges.aChanges.filter(function(oChange) {
			return aNames.indexOf(oChange.getFileName()) !== -1;
		});
	};

	/**
	 * Reset changes on the server. Specification of a generator, selector string or change type string is optional
	 * but at least one of these parameters has to be filled.
	 * This function returns an array of changes which need to be reverted from UI. When neither a selector nor a change type is provided,
	 * an empty array is returned (this triggers a reset of the changes for an entire application component and reloads it).
	 *
	 * @param {string} sLayer Layer for which changes shall be deleted
	 * @param {string} [sGenerator] Generator of changes (optional)
	 * @param {string[]} [aSelectorIds] Selector IDs in local format (optional)
	 * @param {string[]} [aChangeTypes] Types of changes (optional)
	 *
	 * @returns {Promise} Promise that resolves with an array of changes which need to be reverted from UI
	 */
	ChangePersistence.prototype.resetChanges = function(sLayer, sGenerator, aSelectorIds, aChangeTypes) {
		var bSelectorIdsProvided = aSelectorIds && aSelectorIds.length > 0;
		var bChangeTypesProvided = aChangeTypes && aChangeTypes.length > 0;
		if (!sGenerator && !bSelectorIdsProvided && !bChangeTypesProvided) {
			Log.error("Of the generator, selector IDs and change types parameters at least one has to filled");
			return Promise.reject("Of the generator, selector IDs and change types parameters at least one has to filled");
		}

		return this.getChangesForComponent({
			currentLayer: sLayer,
			includeCtrlVariants: true
		}).then(function(aChanges) {
			var mParams = {
				reference: this.getComponentName(),
				appVersion: this._mComponent.appVersion,
				layer: sLayer,
				changes: aChanges
			};
			if (sGenerator) {
				mParams.generator = sGenerator;
			}
			if (bSelectorIdsProvided) {
				mParams.selectorIds = aSelectorIds;
			}
			if (bChangeTypesProvided) {
				mParams.changeTypes = aChangeTypes;
			}

			return Storage.reset(mParams);
		}.bind(this))
		.then(function(oResponse) {
			var aChangesToRevert = [];
			//If reset changes for control, returns an array of deleted changes for reverting
			if (aSelectorIds || aChangeTypes) {
				var aNames = [];
				if (oResponse && oResponse.response && oResponse.response.length > 0) {
					oResponse.response.forEach(function(oChangeContentId) {
						aNames.push(oChangeContentId.name);
					});
				}
				Cache.removeChanges(this._mComponent, aNames);
				aChangesToRevert = this._getChangesFromMapByNames(aNames);
			}
			return aChangesToRevert;
		}.bind(this));
	};

	/**
	 * Send a flex/info request to the backend.
	 *
	 * @param {object} mPropertyBag Contains additional data needed for checking flex/info
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector Selector
	 * @param {string} mPropertyBag.layer Layer on which the request is sent to the backend
	 *
	 * @returns {Promise<boolean>} Resolves the information if the application has content that can be reset and/or published
	 */
	ChangePersistence.prototype.getResetAndPublishInfo = function(mPropertyBag) {
		return Storage.getFlexInfo(mPropertyBag);
	};

	return ChangePersistence;
}, true);