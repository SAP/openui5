/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_union",
	"sap/base/util/includes",
	"sap/base/util/merge",
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Change",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement"
], function(
	union,
	includes,
	merge,
	UriParameters,
	Log,
	JsControlTreeModifier,
	Component,
	Applier,
	ChangesUtils,
	FlexObject,
	FlexObjectFactory,
	DependencyHandler,
	VariantManagementState,
	FlexState,
	StorageUtils,
	Settings,
	Condenser,
	Storage,
	Version,
	Cache,
	Change,
	LayerUtils,
	Layer,
	Utils,
	JSONModel,
	Measurement
) {
	"use strict";

	/**
	 * Helper object to access a change from the back end. Access helper object for each change (and variant) which was fetched from the back end
	 *
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.25.0
	 * @param {object} mComponent - Component data to initiate <code>ChangePersistence</code> instance
	 * @param {string} mComponent.name - Name of the component this instance is responsible for
	 */
	var ChangePersistence = function(mComponent) {
		this._mComponent = mComponent;

		this._mChanges = DependencyHandler.createEmptyDependencyMap();
		this._bChangesMapCreated = false;

		//_mChangesInitial contains a clone of _mChanges to recreated dependencies if changes need to be reapplied
		this._mChangesInitial = merge({}, this._mChanges);

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

	function getChangeInstance(oFileContent, oChangeOrChangeContent) {
		var oChange;
		if (oChangeOrChangeContent instanceof Change || oChangeOrChangeContent instanceof FlexObject) {
			oChange = oChangeOrChangeContent; // can have other states
			this._mChangesEntries[oChange.getFileName()] = oChange;
		} else {
			if (!this._mChangesEntries[oChangeOrChangeContent.fileName]) {
				if (oChangeOrChangeContent.changeType === "codeExt") {
					this._mChangesEntries[oChangeOrChangeContent.fileName] = FlexObjectFactory.createFromFileContent(oChangeOrChangeContent);
				} else {
					this._mChangesEntries[oChangeOrChangeContent.fileName] = new Change(oChangeOrChangeContent);
				}
			}
			oChange = this._mChangesEntries[oChangeOrChangeContent.fileName];
			oChange.setState(Change.states.PERSISTED);
		}
		return oChange;
	}

	/**
	 * Return the name of the SAPUI5 component. All changes are assigned to 1 SAPUI5 component. The SAPUI5 component also serves as authorization
	 * object.
	 *
	 * @returns {string} component name
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
	 *
	 * @param {object} oChangeOrChangeContent Change instance or content of the change
	 *
	 * @returns {boolean} <code>true</code> if all the preconditions are fulfilled
	 */
	function preconditionsFulfilled(oChangeOrChangeContent) {
		var oChangeContent = oChangeOrChangeContent instanceof Change ? oChangeOrChangeContent.getDefinition() : oChangeOrChangeContent;

		var bControlVariantChange = false;
		if ((oChangeContent.fileType === "ctrl_variant") || (oChangeContent.fileType === "ctrl_variant_change") || (oChangeContent.fileType === "ctrl_variant_management_change")) {
			bControlVariantChange = oChangeContent.variantManagementReference || oChangeContent.variantReference || (oChangeContent.selector && oChangeContent.selector.id);
		}

		return oChangeContent.fileType === "change" || bControlVariantChange;
	}

	/**
	 * Calls the back end asynchronously and fetches all changes for the component
	 * New changes (dirty state) that are not yet saved to the back end won't be returned.
	 * @param {map} mPropertyBag Contains additional data needed for reading changes
	 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to the current running component
	 * @param {string} [mPropertyBag.siteId] ID of the site belonging to the current running component
	 * @param {string} [mPropertyBag.currentLayer] Specifies a single layer for loading changes. If this parameter is set, the max layer filtering is not applied
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] Indicates that changes shall be loaded without layer filtering
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Indicates that control variant changes shall be included
	 * @param {string} [mPropertyBag.cacheKey] Key to validate the cache entry stored on client side
	 * @param {sap.ui.core.Component} [mPropertyBag.component] - Component instance
	 * @param {boolean} bInvalidateCache - should the cache be invalidated
	 * @see sap.ui.fl.Change
	 * @returns {Promise} Promise resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForComponent = function(mPropertyBag, bInvalidateCache) {
		return Utils.getUShellService("URLParsing")
			.then(function(oURLParsingService) {
				this._oUShellURLParsingService = oURLParsingService;
				return Cache.getChangesFillingCache(this._mComponent, mPropertyBag, bInvalidateCache);
			}.bind(this))
			.then(function(mPropertyBag, oWrappedChangeFileContent) {
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
					aChanges = LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(aChanges, sCurrentLayer);
				} else if (LayerUtils.isLayerFilteringRequired(this._oUShellURLParsingService) && bFilterMaxLayer) {
					fnFilter = filterChangeForMaxLayer.bind(this);
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

				return this._checkAndGetChangeInstances(aChanges, oChangeFileContent);
			}.bind(this, mPropertyBag));
	};

	ChangePersistence.prototype._checkAndGetChangeInstances = function(aChanges, oChangeFileContent) {
		return aChanges
			.filter(preconditionsFulfilled)
			.map(getChangeInstance.bind(this, oChangeFileContent));
	};

	function filterChangeForMaxLayer(oChangeOrChangeContent) {
		if (LayerUtils.isOverMaxLayer(getLayerFromChangeOrChangeContent(oChangeOrChangeContent), this._oUShellURLParsingService)) {
			if (!this._bHasChangesOverMaxLayer) {
				this._bHasChangesOverMaxLayer = true;
			}
			return false;
		}
		return true;
	}

	function getLayerFromChangeOrChangeContent(oChangeOrChangeContent) {
		var sChangeLayer;
		if (
			typeof oChangeOrChangeContent.isA === "function"
			&& (oChangeOrChangeContent.isA("sap.ui.fl.apply._internal.flexObjects.FlVariant") || oChangeOrChangeContent.isA("sap.ui.fl.Change"))
		) {
			sChangeLayer = oChangeOrChangeContent.getLayer();
		} else {
			sChangeLayer = oChangeOrChangeContent.layer;
		}
		return sChangeLayer;
	}

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

			aChanges.forEach(this.addChangeAndUpdateDependencies.bind(this, oAppComponent));

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

	function getInitalDependencyClone(oChange) {
		var mInitialDependencies = merge({}, this._mChangesInitial.mDependencies);
		return mInitialDependencies[oChange.getId()];
	}

	function copyDependencies(oInitialDependency, aNewValidDependencies, oAppComponent, oChange) {
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
	ChangePersistence.prototype.copyDependenciesFromInitialChangesMapSync = function(oChange, fnDependencyValidation, oAppComponent) {
		var oInitialDependency = getInitalDependencyClone.call(this, oChange);
		if (oInitialDependency) {
			var aNewValidDependencies = [];
			oInitialDependency.dependencies.forEach(function(sChangeId) {
				if (fnDependencyValidation(sChangeId)) {
					this._mChanges.mDependentChangesOnMe[sChangeId] = this._mChanges.mDependentChangesOnMe[sChangeId] || [];
					this._mChanges.mDependentChangesOnMe[sChangeId].push(oChange.getId());
					aNewValidDependencies.push(sChangeId);
				}
			}.bind(this));
			copyDependencies.call(this, oInitialDependency, aNewValidDependencies, oAppComponent, oChange);
		}
		return this._mChanges;
	};

	/**
	 * This function copies the initial dependencies (before any changes got applied and dependencies got deleted) for the given change to the mChanges map
	 * Also checks if the dependency is still valid in a callback
	 * This function is used in the case that controls got destroyed and recreated
	 *
	 * @param {sap.ui.fl.Change} oChange The change whose dependencies should be copied
	 * @param {function} fnDependencyValidation this function is called to check if the dependency is still valid
	 * @param {sap.ui.core.Component} oAppComponent Application component instance that is currently loading
	 * @returns {Promise} Resolves the mChanges object with the updated dependencies
	 */
	ChangePersistence.prototype.copyDependenciesFromInitialChangesMap = function(oChange, fnDependencyValidation, oAppComponent) {
		var oInitialDependency = getInitalDependencyClone.call(this, oChange);
		if (oInitialDependency) {
			var aNewValidDependencies = [];
			return oInitialDependency.dependencies.reduce(function (oPreviousPromise, sChangeId) {
				return oPreviousPromise.then(function () {
					return fnDependencyValidation(sChangeId);
				}).then(function (bDependencyIsStillValid) {
					if (bDependencyIsStillValid) {
						this._mChanges.mDependentChangesOnMe[sChangeId] = this._mChanges.mDependentChangesOnMe[sChangeId] || [];
						this._mChanges.mDependentChangesOnMe[sChangeId].push(oChange.getId());
						aNewValidDependencies.push(sChangeId);
					}
				}.bind(this));
			}.bind(this), Promise.resolve())
			.then(function () {
				copyDependencies.call(this, oInitialDependency, aNewValidDependencies, oAppComponent, oChange);
				return this._mChanges;
			}.bind(this));
		}
		return Promise.resolve(this._mChanges);
	};

	/**
	 * Adds a new change into changes map positioned right after the referenced change and updates the change dependencies
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component for the view
	 * @param {sap.ui.fl.changeObject} oChange - Change instance
	 * @param {sap.ui.fl.changeObject} [oReferenceChange] - Refernce change. New change is positioned right after this one in the changes map
	 */
	ChangePersistence.prototype.addChangeAndUpdateDependencies = function(oAppComponent, oChange, oReferenceChange) {
		// the change status should always be initial when it gets added to the map / dependencies
		// if the component gets recreated the status of the change might not be initial
		oChange.setInitialApplyState();
		if (oReferenceChange) {
			DependencyHandler.insertChange(oChange, this._mChanges, oReferenceChange);
		}
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
	 * Returns all changes that are currently loaded for the component.
	 * @param {map} mPropertyBag - Contains additional data needed for reading changes
	 * @param {string} [mPropertyBag.layer] - Specifies a single layer for loading changes
	 * @param {boolean} [mPropertyBag.includeDirtyChanges] - Whether dirty changes of the current session should be included
	 * @returns {sap.ui.fl.Change[]} Array of changes
	 * @public
	 */
	ChangePersistence.prototype.getAllUIChanges = function(mPropertyBag) {
		var aChanges = union(
			this.getChangesMapForComponent().aChanges,
			mPropertyBag.includeDirtyChanges && this.getDirtyChanges()
		).filter(function (oChange) {
			return (
				Boolean(oChange)
				&& oChange.getFileType() === "change"
				&& LayerUtils.compareAgainstCurrentLayer(oChange.getLayer(), mPropertyBag.layer) === 0
			);
		});
		return aChanges;
	};

	/**
	 * Checks if the changes map for the component has been created or not.
	 * @return {boolean} <code>true</code> if the changes map has been created
	 * @public
	 */
	ChangePersistence.prototype.isChangeMapCreated = function() {
		return this._bChangesMapCreated;
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
			return aChanges.filter(ChangesUtils.filterChangeByView.bind(undefined, mPropertyBag));
		});
	};

	/**
	 * Adds a new change and returns the id of the new change.
	 *
	 * @param {object} vChange - The complete and finalized JSON object representation the file content of the change or a Change instance
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {sap.ui.fl.Change} the newly created change
	 * @public
	 */
	ChangePersistence.prototype.addChange = function(vChange, oAppComponent) {
		var oChange = this.addDirtyChange(vChange);
		this._addRunTimeCreatedChangeAndUpdateDependencies(oAppComponent, oChange);
		this._mChangesEntries[oChange.getId()] = oChange;
		this._addPropagationListener(oAppComponent);
		return oChange;
	};

	/**
	 * Adds a new dirty change.
	 *
	 * @param {object} vChange - JSON object of change or change object
	 * @returns {sap.ui.fl.Change} The prepared change object
	 * @public
	 */
	ChangePersistence.prototype.addDirtyChange = function(vChange) {
		var oNewChange;
		if (
			typeof vChange.isA === "function"
			&& (vChange.isA("sap.ui.fl.Change") || vChange.isA("sap.ui.fl.apply._internal.flexObjects.FlexObject"))
		) {
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
				var oFlexControllerFactory = sap.ui.require("sap/ui/fl/FlexControllerFactory");
				var oFlexController = oFlexControllerFactory.create(this.getComponentName());
				var fnPropagationListener = Applier.applyAllChangesForControl.bind(Applier, this.getChangesMapForComponent.bind(this), oAppComponent, oFlexController);
				fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
				oAppComponent.addPropagationListener(fnPropagationListener);
			}
		}
	};

	ChangePersistence.prototype._deleteNotSavedChanges = function(aChanges, aCondensedChanges, bAlreadyDeletedViaCondense) {
		aChanges.filter(function(oChange) {
			return !aCondensedChanges.some(function(oCondensedChange) {
				return oChange.getId() === oCondensedChange.getId();
			});
		}).forEach(function(oChange) {
			if (bAlreadyDeletedViaCondense) {
				this.removeChange(oChange);
				// Remove also from Cache if the persisted change is still there (e.g. navigate away and back to the app)
				Cache.deleteChange(this._mComponent, oChange.getDefinition());
			} else {
				this.deleteChange(oChange);
			}
		}.bind(this));
	};

	function checkIfOnlyOne(aChanges, sFunctionName) {
		var aProperties = aChanges.map(function(oChange) {
			return oChange[sFunctionName]();
		});
		var aUniqueProperties = aProperties.filter(function(sValue, iIndex, aProperties) {
			return aProperties.indexOf(sValue) === iIndex;
		});

		return aUniqueProperties.length === 1;
	}

	function shouldCondensingBeEnabled(oAppComponent, aChanges) {
		var bCondenserEnabled = false;

		if (!oAppComponent || aChanges.length < 2 || !checkIfOnlyOne(aChanges, "getLayer")) {
			return false;
		}

		var sLayer = aChanges[0].getLayer();
		if ([Layer.CUSTOMER, Layer.USER].includes(sLayer)) {
			bCondenserEnabled = true;
		}

		var oUriParameters = UriParameters.fromURL(window.location.href);
		if (oUriParameters.has("sap-ui-xx-condense-changes")) {
			bCondenserEnabled = oUriParameters.get("sap-ui-xx-condense-changes") === "true";
		}

		return bCondenserEnabled;
	}

	function isBackendCondensingEnabled(aChanges) {
		var bEnabled = Settings.getInstanceOrUndef() && Settings.getInstanceOrUndef().isCondensingEnabled();
		if (bEnabled && !checkIfOnlyOne(aChanges, "getNamespace")) {
			bEnabled = false;
		}

		return bEnabled;
	}

	function updateCacheAndDeleteUnsavedChanges(aAllChanges, aCondensedChanges, bSkipUpdateCache, bAlreadyDeletedViaCondense) {
		this._massUpdateCacheAndDirtyState(aCondensedChanges, bSkipUpdateCache);
		this._deleteNotSavedChanges(aAllChanges, aCondensedChanges, bAlreadyDeletedViaCondense);
	}

	function getAllRelevantChangesForCondensing(aDirtyChanges, aDraftFilenames) {
		if (!aDirtyChanges.length) {
			return [];
		}
		var sLayer = aDirtyChanges[0].getLayer();
		var aPersistedAndSameLayerChanges = this._mChanges.aChanges.filter(function(oChange) {
			if (sLayer === Layer.CUSTOMER && aDraftFilenames) {
				return oChange.getState() === Change.states.PERSISTED && aDraftFilenames.includes(oChange.getFileName());
			}
			return oChange.getState() === Change.states.PERSISTED && LayerUtils.compareAgainstCurrentLayer(oChange.getLayer(), sLayer) === 0;
		});
		return aPersistedAndSameLayerChanges.concat(aDirtyChanges);
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
	 * @param {string} sParentVersion - Parent version
	 * @param {string[]} [aDraftFilenames] - Filesnames from persisted changes draft version
	 * @returns {Promise} Resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveDirtyChanges = function(oAppComponent, bSkipUpdateCache, aChanges, sParentVersion, aDraftFilenames) {
		var aDirtyChanges = aChanges || this._aDirtyChanges;
		var aRelevantChangesForCondensing = getAllRelevantChangesForCondensing.call(this, aDirtyChanges, aDraftFilenames);
		var bIsCondensingEnabled = (
			isBackendCondensingEnabled(aRelevantChangesForCondensing)
			&& shouldCondensingBeEnabled(oAppComponent, aRelevantChangesForCondensing)
		);
		var aAllChanges = bIsCondensingEnabled ? aRelevantChangesForCondensing : aDirtyChanges;
		var aChangesClone = aAllChanges.slice(0);
		var aDirtyChangesClone = aDirtyChanges.slice(0);
		var aRequests = getRequests(aDirtyChanges);
		var aStates = getStates(aDirtyChanges);

		if (aStates.length === 1 && aRequests.length === 1 && aStates[0] === Change.states.NEW) {
			var oCondensedChangesPromise = Promise.resolve(aChangesClone);
			if (shouldCondensingBeEnabled(oAppComponent, aChangesClone)) {
				oCondensedChangesPromise = Condenser.condense(oAppComponent, aChangesClone);
			}
			return oCondensedChangesPromise.then(function(aCondensedChanges) {
				var sRequest = aRequests[0];
				var sLayer = aDirtyChanges[0].getLayer();
				if (bIsCondensingEnabled) {
					return Storage.condense({
						allChanges: aAllChanges,
						condensedChanges: aCondensedChanges,
						layer: sLayer,
						transport: sRequest,
						isLegacyVariant: false,
						parentVersion: sParentVersion
					}).then(function(oResponse) {
						updateCacheAndDeleteUnsavedChanges.call(this, aAllChanges, aCondensedChanges, bSkipUpdateCache, true);
						return oResponse;
					}.bind(this));
				}
				if (aCondensedChanges.length) {
					return Storage.write({
						layer: sLayer,
						flexObjects: prepareDirtyChanges(aCondensedChanges),
						transport: sRequest,
						isLegacyVariant: false,
						parentVersion: sParentVersion
					}).then(function(oResponse) {
						updateCacheAndDeleteUnsavedChanges.call(this, aAllChanges, aCondensedChanges, bSkipUpdateCache);
						return oResponse;
					}.bind(this));
				}
				this._deleteNotSavedChanges(aAllChanges, aCondensedChanges);
			}.bind(this));
		}

		return this.saveSequenceOfDirtyChanges(aDirtyChangesClone, bSkipUpdateCache, sParentVersion);
	};

	/**
	 * Saves a sequence of dirty changes by calling the appropriate back-end method (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 *
	 * @param {sap.ui.fl.Change[]} aDirtyChanges - Array of dirty changes to be saved
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 * @param {string} [sParentVersion] - Indicates if changes should be written as a draft and on which version the changes should be based on
	 * @returns {Promise} resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveSequenceOfDirtyChanges = function(aDirtyChanges, bSkipUpdateCache, sParentVersion) {
		var oFirstNewChange;
		if (sParentVersion) {
			// in case of changes saved for a draft only the first writing operation must have the parentVersion targeting the basis
			// followup changes must point the the existing draft created with the first request
			var aNewChanges = aDirtyChanges.filter(function (oChange) {
				return oChange.getState() === Change.states.NEW;
			});
			oFirstNewChange = [].concat(aNewChanges).shift();
		}

		return aDirtyChanges.reduce(function(oPreviousPromise, oDirtyChange) {
			return oPreviousPromise
				.then(performSingleSaveAction.bind(undefined, oDirtyChange, oFirstNewChange, sParentVersion))
				.then(this._updateCacheAndDirtyState.bind(this, oDirtyChange, bSkipUpdateCache));
		}.bind(this), Promise.resolve());
	};

	function performSingleSaveAction(oDirtyChange, oFirstChange, sParentVersion) {
		switch (oDirtyChange.getState()) {
			case Change.states.NEW:
				if (sParentVersion !== undefined) {
					sParentVersion = oDirtyChange === oFirstChange ? sParentVersion : Version.Number.Draft;
				}
				return Storage.write({
					layer: oDirtyChange.getLayer(),
					flexObjects: [oDirtyChange.getDefinition()],
					transport: oDirtyChange.getRequest(),
					parentVersion: sParentVersion
				});
			case Change.states.DELETED:
				return Storage.remove({
					flexObject: oDirtyChange.getDefinition(),
					layer: oDirtyChange.getLayer(),
					transport: oDirtyChange.getRequest(),
					parentVersion: sParentVersion
				});
			default:
		}
	}

	/**
	 * Updates the cache with the dirty change passed and removes it from the array of dirty changes if present.
	 * @param {sap.ui.fl.Change} oDirtyChange Dirty change which was saved
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app
	 * therefore, the cache update of the current app is skipped
	 */
	ChangePersistence.prototype._updateCacheAndDirtyState = function(oDirtyChange, bSkipUpdateCache) {
		this._aDirtyChanges = this._aDirtyChanges.filter(function(oExistingDirtyChange) {
			return oDirtyChange.getId() !== oExistingDirtyChange.getId();
		});

		if (!bSkipUpdateCache) {
			if (Utils.isChangeRelatedToVariants(oDirtyChange)) {
				VariantManagementState.updateVariantsState({
					reference: this._mComponent.name,
					changeToBeAddedOrDeleted: oDirtyChange
				});
			} else {
				switch (oDirtyChange.getState()) {
					case Change.states.NEW:
						oDirtyChange.setState(Change.states.PERSISTED);
						Cache.addChange(this._mComponent, oDirtyChange.getDefinition());
						break;
					case Change.states.DELETED:
						Cache.deleteChange(this._mComponent, oDirtyChange.getDefinition());
						break;
					case Change.states.DIRTY:
						oDirtyChange.setState(Change.states.PERSISTED);
						Cache.updateChange(this._mComponent, oDirtyChange.getDefinition());
						break;
				}
			}
		}
	};

	/**
	 * @param {sap.ui.fl.Change[]} aDirtyChanges - Array of dirty changes
	 * @param {boolean} [bSkipUpdateCache]-  If <code>true</code>, then the dirty change shall be saved for the newly created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 */
	ChangePersistence.prototype._massUpdateCacheAndDirtyState = function(aDirtyChanges, bSkipUpdateCache) {
		aDirtyChanges.forEach(function(oDirtyChange) {
			this._updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache);
		}, this);
	};

	function getRequests(aDirtyChanges) {
		var aRequests = [];

		aDirtyChanges.forEach(function(oChange) {
			var sRequest = oChange.getRequest();
			if (aRequests.indexOf(sRequest) === -1) {
				aRequests.push(sRequest);
			}
		});

		return aRequests;
	}

	function getStates(aDirtyChanges) {
		var aStates = [];

		aDirtyChanges.forEach(function(oChange) {
			var sState = oChange.getState();
			if (aStates.indexOf(sState) === -1) {
				aStates.push(sState);
			}
		});

		return aStates;
	}

	function prepareDirtyChanges(aDirtyChanges) {
		var aChanges = [];

		aDirtyChanges.forEach(function(oChange) {
			aChanges.push(oChange.convertToFileContent());
		});

		return aChanges;
	}

	ChangePersistence.prototype.getDirtyChanges = function() {
		return this._aDirtyChanges;
	};

	/**
	 * Prepares a change to be deleted with the next call to
	 * @see {ChangePersistence#saveDirtyChanges};
	 *
	 * If the given change is already in the dirty changes and
	 * has the 'NEW' state it will be removed, assuming,
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
			if (oChange.getState() === Change.states.DELETED) {
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

	ChangePersistence.prototype.removeChange = function(oChange) {
		var nIndexInDirtyChanges = this._aDirtyChanges.indexOf(oChange);

		if (nIndexInDirtyChanges > -1) {
			this._aDirtyChanges.splice(nIndexInDirtyChanges, 1);
		}
		this._deleteChangeInMap(oChange);
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

	function isLocalAndInLayer(sLayer, oObject) {
		return (oObject.getRequest() === "$TMP" || oObject.getRequest() === "") && oObject.getLayer() === sLayer;
	}

	function isPersistedAndInLayer(sLayer, oObject) {
		return oObject.getState() === Change.states.PERSISTED && oObject.getLayer() === sLayer;
	}

	function getAllCompVariantsEntities() {
		var aCompVariantEntities = [];
		var mCompVariantsMap = FlexState.getCompVariantsMap(this.getComponentName());
		for (var sPersistencyKey in mCompVariantsMap) {
			for (var sId in mCompVariantsMap[sPersistencyKey].byId) {
				aCompVariantEntities.push(mCompVariantsMap[sPersistencyKey].byId[sId]);
			}
		}
		return aCompVariantEntities;
	}
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
		return this.getChangesForComponent({currentLayer: sLayer, includeCtrlVariants: true}).then(function(aLocalChanges) {
			var aCompVariantEntities = getAllCompVariantsEntities.call(this);

			aLocalChanges = aLocalChanges.concat(
				aCompVariantEntities.filter(isLocalAndInLayer.bind(this, sLayer)));

			return Storage.publish({
				transportDialogSettings: {
					rootControl: oRootControl, //TODO not used value, should be removed.
					styleClass: sStyleClass
				},
				layer: sLayer,
				reference: this.getComponentName(),
				localChanges: aLocalChanges,
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
	 * Removes unsaved changes.
	 *
	 * @param {string|string[]} [vLayer] - Layer or multiple layers for which changes shall be deleted. If omitted, changes on all layers are considered.
	 * @param {sap.ui.core.Component} [oComponent] - Component instance, required if oControl is specified
	 * @param {string} [oControl] - Control for which the changes should be deleted. If omitted, all changes for the app component are considered.
	 * @param {string} [sGenerator] - Generator of changes (optional)
	 * @param {string[]} [aChangeTypes] - Types of changes (optional)
	 *
	 * @returns {Promise} Promise that resolves after the deletion took place
	 */
	ChangePersistence.prototype.removeDirtyChanges = function(vLayer, oComponent, oControl, sGenerator, aChangeTypes) {
		var aLayers = [].concat(vLayer || []);
		var aDirtyChanges = this._aDirtyChanges;

		var aChangesToBeRemoved = aDirtyChanges.filter(function (oChange) {
			var bChangeValid = true;

			if (aLayers.length && !aLayers.includes(oChange.getLayer())) {
				return false;
			}

			if (sGenerator && oChange.getDefinition().support.generator !== sGenerator) {
				return false;
			}

			if (oControl) {
				var vSelector = oChange.getSelector();
				bChangeValid = oControl.getId() === JsControlTreeModifier.getControlIdBySelector(vSelector, oComponent);
			}

			if (aChangeTypes) {
				bChangeValid = bChangeValid && aChangeTypes.indexOf(oChange.getChangeType()) !== -1;
			}

			return bChangeValid;
		});

		aChangesToBeRemoved.forEach(function (oChange) {
			var nIndex = aDirtyChanges.indexOf(oChange);
			aDirtyChanges.splice(nIndex, 1);
		});

		return Promise.resolve(aChangesToBeRemoved);
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

		//In case of application reset and PUBLIC layer available, also includes comp variant entities
		var isPublicLayerAvailable = Settings.getInstanceOrUndef() && Settings.getInstanceOrUndef().isPublicLayerAvailable();
		var isApplicationReset = sGenerator === undefined && aSelectorIds === undefined && aChangeTypes === undefined;
		var aCompVariantsEntries = [];
		if (isPublicLayerAvailable && isApplicationReset) {
			aCompVariantsEntries = getAllCompVariantsEntities.call(this).filter(isPersistedAndInLayer.bind(this, sLayer));
		}

		return this.getChangesForComponent({ currentLayer: sLayer, includeCtrlVariants: true}).then(function(aChanges) {
			aChanges = aChanges.concat(aCompVariantsEntries);
			var mParams = {
				reference: this.getComponentName(),
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
					oResponse.response.forEach(function (oChangeContentId) {
						aNames.push(oChangeContentId.fileName);
					});
				}
				Cache.removeChanges(this._mComponent, aNames);
				aChangesToRevert = this._getChangesFromMapByNames(aNames);
			}
			return aChangesToRevert;
		}.bind(this));
	};

	return ChangePersistence;
});