/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/base/Log"
], function(
	ChangeRegistry,
	Utils,
	LayerUtils,
	Change,
	Variant,
	ChangePersistenceFactory,
	Versions,
	Applier,
	Reverter,
	URLHandler,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	Log
) {
	"use strict";

	/**
	 * Retrieves changes (LabelChange, etc.) for an sap.ui.core.mvc.View and applies these changes
	 *
	 * @param {string} sComponentName - Component name the flexibility controller is responsible for
	 * @param {string} sAppVersion - Current version of the application
	 * @constructor
	 * @class
	 * @alias sap.ui.fl.FlexController
	 * @experimental Since 1.27.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var FlexController = function(sComponentName, sAppVersion) {
		this._oChangePersistence = undefined;
		this._sComponentName = sComponentName || "";
		this._sAppVersion = sAppVersion || Utils.DEFAULT_APP_VERSION;
		if (this._sComponentName && this._sAppVersion) {
			this._createChangePersistence();
		}
	};

	/**
	 * Returns the component name of the FlexController
	 *
	 * @returns {String} the name of the component
	 * @public
	 */
	FlexController.prototype.getComponentName = function() {
		return this._sComponentName;
	};

	/**
	 * Returns the application version of the FlexController
	 *
	 * @returns {String} Application version
	 * @public
	 */
	FlexController.prototype.getAppVersion = function() {
		return this._sAppVersion;
	};

	/**
	 * Sets the variant switch promise
	 *
	 * @param {promise} oPromise variant switch promise
	 */
	FlexController.prototype.setVariantSwitchPromise = function(oPromise) {
		this._oVariantSwitchPromise = oPromise;
	};

	/**
	 * Returns the variant switch promise. By default this is a resolved promise
	 *
	 * @returns {promise} variant switch promise
	 */
	FlexController.prototype.waitForVariantSwitch = function() {
		if (!this._oVariantSwitchPromise) {
			this._oVariantSwitchPromise = Promise.resolve();
		}
		return this._oVariantSwitchPromise;
	};

	/**
	 * Base function for creation of a change
	 *
	 * @param {object} oChangeSpecificData - Property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent)
	 * The property "oPropertyBag.packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Component} oAppComponent - Application Component of the control at runtime in case a map has been used
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.createBaseChange = function(oChangeSpecificData, oAppComponent) {
		var oChangeFileContent;
		var oChange;

		if (!oAppComponent) {
			throw new Error("No application component found. To offer flexibility a valid relation to its owning component must be present.");
		}

		oChangeSpecificData.reference = this.getComponentName(); //in this case the component name can also be the value of sap-app-id
		oChangeSpecificData.packageName = "$TMP"; // first a flex change is always local, until all changes of a component are made transportable

		// fallback in case no application descriptor is available (e.g. during unit testing)
		oChangeSpecificData.validAppVersions = Utils.getValidAppVersions({
			appVersion: this.getAppVersion(),
			developerMode: oChangeSpecificData.developerMode,
			scenario: oChangeSpecificData.scenario
		});

		oChangeFileContent = Change.createInitialFileContent(oChangeSpecificData);
		oChange = new Change(oChangeFileContent);

		if (oChangeSpecificData.variantReference) {
			oChange.setVariantReference(oChangeSpecificData.variantReference);
		}

		return oChange;
	};

	FlexController.prototype._createChange = function(oChangeSpecificData, oAppComponent, oControl) {
		// for getting the change handler the change type and potentially the control type are needed
		var sControlType = oControl && (oControl.controlType || Utils.getControlType(oControl));

		var oChange = this.createBaseChange(oChangeSpecificData, oAppComponent);

		return this._getChangeHandler(oChange, sControlType, oControl, JsControlTreeModifier)
			.then(function(oChangeHandler) {
				if (oChangeHandler) {
					oChangeHandler.completeChangeContent(oChange, oChangeSpecificData, {
						modifier: JsControlTreeModifier,
						appComponent: oAppComponent
					});
				} else {
					throw new Error("Change handler could not be retrieved for change " + JSON.stringify(oChangeSpecificData) + ".");
				}
				return oChange;
			})
			.catch(function(oError) {
				return Promise.reject(oError);
			});
	};

	/**
	 * Create a change with an ExtensionPoint as selector.
	 *
	 * @param {object} oChangeSpecificData - Property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent)
	 * The property "oPropertyBag.packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {object} mExtensionPointReference - Reference map for extension point
	 * @param {string} mExtensionPointReference.name - Name of the extension point
	 * @param {sap.ui.core.Component} mExtensionPointReference.view - View including the extension point
	 * @returns {Promise.<sap.ui.fl.Change>} Created change wrapped in a promise
	 * @public

	 */
	FlexController.prototype.createChangeWithExtensionPointSelector = function(oChangeSpecificData, mExtensionPointReference) {
		return Promise.resolve()
			.then(function() {
				if (!mExtensionPointReference) {
					throw new Error("A flexibility change on extension point cannot be created without a valid extension point reference.");
				}
				var oView = mExtensionPointReference.view;
				var oAppComponent = Utils.getAppComponentForControl(oView);
				oChangeSpecificData.selector = {
					name: mExtensionPointReference.name,
					viewSelector: JsControlTreeModifier.getSelector(oView.getId(), oAppComponent)
				};
				return oAppComponent;
			})
			.then(function(oAppComponent) {
				return this._createChange(oChangeSpecificData, oAppComponent);
			}.bind(this));
	};

	/**
	 * Create a change
	 *
	 * @param {object} oChangeSpecificData - Property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent)
	 * The property "oPropertyBag.packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Control | map} oControl - Control for which the change will be added
	 * @param {string} oControl.id - ID of the control in case a map has been used to specify the control
	 * @param {sap.ui.core.Component} [oControl.appComponent] - Application component of the control at runtime in case a map has been used
	 * @param {string} oControl.controlType - Control type of the control in case a map has been used
	 * @returns {Promise.<sap.ui.fl.Change>} Created change wrapped in a promise
	 * @public
	 */
	FlexController.prototype.createChangeWithControlSelector = function(oChangeSpecificData, oControl) {
		var oAppComponent;
		return new Utils.FakePromise()
			.then(function() {
				if (!oControl) {
					throw new Error("A flexibility change cannot be created without a targeted control.");
				}

				var sControlId = oControl.id || oControl.getId();

				if (!oChangeSpecificData.selector) {
					oChangeSpecificData.selector = {};
				}
				oAppComponent = oControl.appComponent || Utils.getAppComponentForControl(oControl);
				if (!oAppComponent) {
					throw new Error("No application component found. To offer flexibility, the control with the ID '"
						+ sControlId + "' has to have a valid relation to its owning application component.");
				}

				// differentiate between controls containing the component id as a prefix and others
				// get local Id for control at root component and use it as selector id
				Object.assign(oChangeSpecificData.selector, JsControlTreeModifier.getSelector(sControlId, oAppComponent));
				return oAppComponent;
			})
			.then(function(oAppComponent) {
				return this._createChange(oChangeSpecificData, oAppComponent, oControl);
			}.bind(this));
	};

	/**
	 * Adds a change to the flex persistence (not yet saved). Will be saved with #saveAll.
	 *
	 * @param {object} oChangeSpecificData property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 * The property "oPropertyBag.packageName" is set to $TMP internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Control} oControl control for which the change will be added
	 * @returns {Promise.<sap.ui.fl.Change>} the created change
	 * @public
	 */
	FlexController.prototype.addChange = function(oChangeSpecificData, oControl) {
		return this.createChangeWithControlSelector(oChangeSpecificData, oControl)
			.then(function(oChange) {
				var oAppComponent = Utils.getAppComponentForControl(oControl);
				// adding a change to the persistence will trigger the propagation listener which would try to apply the change
				// but in this scenario the change is applied in .createAndApplyChange and no dependencies are added,
				// so the propagation listener should ignore this change once
				oChange._ignoreOnce = true;
				this.addPreparedChange(oChange, oAppComponent);
				return oChange;
			}.bind(this));
	};

	/**
	 * Adds an already prepared change to the flex persistence (not yet saved). This method will not call
	 * createChange again, but expects a fully computed and appliable change.
	 * Will be saved with #saveAll.
	 *
	 * @param {object} oChange property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 * The property "oPropertyBag.packageName" is set to $TMP internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Component} oAppComponent - Application component
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.addPreparedChange = function(oChange, oAppComponent) {
		if (oChange.getVariantReference()) {
			// variant model is always associated with the app component
			var oModel = oAppComponent.getModel(Utils.VARIANT_MODEL_NAME);
			oModel.addChange(oChange);
		}

		this._oChangePersistence.addChange(oChange, oAppComponent);

		return oChange;
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
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 */
	FlexController.prototype.deleteChange = function(oChange, oAppComponent) {
		this._oChangePersistence.deleteChange(oChange);
		if (oChange.getVariantReference()) {
			oAppComponent.getModel(Utils.VARIANT_MODEL_NAME).removeChange(oChange);
		}
	};

	/**
	 * Creates a new change and applies it immediately.
	 *
	 * @param {object} oChangeSpecificData The data specific to the change, e.g. the new label for a RenameField change
	 * @param {sap.ui.core.Control} oControl The control where the change will be applied to
	 * @returns {Promise} Returns Promise resolving to the change that was created and applied successfully or a Promise reject with the error object
	 * @public
	 */
	FlexController.prototype.createAndApplyChange = function(oChangeSpecificData, oControl) {
		var oChange;
		return this.addChange(oChangeSpecificData, oControl)
			.then(function(oAddedChange) {
				oChange = oAddedChange;
				var mPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: Utils.getAppComponentForControl(oControl),
					view: Utils.getViewForControl(oControl)
				};
				oChange.setQueuedForApply();
				return Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
			})
			.then(function(oReturn) {
				if (!oReturn.success) {
					var oException = oReturn.error || new Error("The change could not be applied.");
					this._oChangePersistence.deleteChange(oChange, true);
					throw oException;
				}
				return oChange;
			}.bind(this));
	};

	function checkDependencies(oChange, mDependencies, mChanges, oAppComponent, aRelevantChanges) {
		var bResult = canChangePotentiallyBeApplied(oChange, oAppComponent);
		if (!bResult) {
			return [];
		}
		aRelevantChanges.push(oChange);
		var sDependencyKey = oChange.getId();
		var aDependentChanges = mDependencies[sDependencyKey] && mDependencies[sDependencyKey].dependencies || [];
		for (var i = 0, n = aDependentChanges.length; i < n; i++) {
			var oDependentChange = Utils.getChangeFromChangesMap(mChanges, aDependentChanges[i]);
			bResult = checkDependencies(oDependentChange, mDependencies, mChanges, oAppComponent, aRelevantChanges);
			if (bResult.length === 0) {
				aRelevantChanges = [];
				break;
			}
			delete mDependencies[sDependencyKey];
		}
		return aRelevantChanges;
	}

	function canChangePotentiallyBeApplied(oChange, oAppComponent) {
		// is control available
		var aSelectors = oChange.getDependentControlSelectorList();
		aSelectors.push(oChange.getSelector());
		return !aSelectors.some(function(oSelector) {
			return !JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		});
	}

	/**
	 * Resolves with a promise after all the changes for all controls that are passed have been processed.
	 *
	 * @param {sap.ui.fl.Selector[]} vSelectors The control or an array of controls whose changes are being waited for
	 * @returns {Promise} Returns a promise when all changes on the controls have been processed
	 */
	FlexController.prototype.waitForChangesToBeApplied = function(vSelectors) {
		var aSelectors;
		if (Array.isArray(vSelectors)) {
			aSelectors = vSelectors;
		} else {
			aSelectors = [vSelectors];
		}
		var aPromises = aSelectors.map(function(vSelector) {
			return this._waitForChangesToBeApplied(vSelector);
		}.bind(this));
		return Promise.all(aPromises)
			.then(function() {
				// the return value is not important in this function, only that it resolves
				return undefined;
			});
	};
	/**
	 * Resolves with a Promise after all the changes for this control have been processed.
	 *
	 * @param {sap.ui.fl.Selector} vSelector The control whose changes are being waited for
	 * @returns {Promise} Returns a promise when all changes on the control have been processed
	 */
	FlexController.prototype._waitForChangesToBeApplied = function(vSelector) {
		var oControl = vSelector.id && sap.ui.getCore().byId(vSelector.id) || vSelector;
		var mChangesMap = this._oChangePersistence.getChangesMapForComponent();
		var aPromises = [];
		var mDependencies = Object.assign({}, mChangesMap.mDependencies);
		var mChanges = mChangesMap.mChanges;
		var aChangesForControl = mChanges[oControl.getId()] || [];
		var aNotYetProcessedChanges = aChangesForControl.filter(function(oChange) {
			return !oChange.isCurrentProcessFinished();
		}, this);
		var oAppComponent = vSelector.appComponent || Utils.getAppComponentForControl(oControl);
		var aRelevantChanges = [];
		aNotYetProcessedChanges.forEach(function(oChange) {
			var aChanges = checkDependencies(oChange, mDependencies, mChangesMap.mChanges, oAppComponent, []);
			aChanges.forEach(function(oDependentChange) {
				if (aRelevantChanges.indexOf(oDependentChange) === -1) {
					aRelevantChanges.push(oDependentChange);
				}
			});
		});

		// attach promises to the relevant Changes and wait for them to be applied
		aRelevantChanges.forEach(function(oChange) {
			aPromises = aPromises.concat(oChange.addChangeProcessingPromises());
		}, this);

		// also wait for a potential variant switch to be done
		aPromises.push(this.waitForVariantSwitch());

		return Promise.all(aPromises);
	};

	/**
	 * Saves all changes of a persistence instance.
	 *
	 * @param {sap.ui.core.UIComponent} [oAppComponent] - AppComponent instance
	 * @param {boolean} [bSkipUpdateCache=false] - Indicates the cache should not be updated
	 * @param {boolean} [bDraft=false] - Indicates if changes should be written as a draft
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	FlexController.prototype.saveAll = function(oAppComponent, bSkipUpdateCache, bDraft) {
		return this._oChangePersistence.saveDirtyChanges(oAppComponent, bSkipUpdateCache, undefined, bDraft)
			.then(function(oResult) {
				if (bDraft && oResult && oResult.response) {
					var vChangeDefinition = oResult.response;
					if (Array.isArray(vChangeDefinition)) {
						// the reference and layer of all items are the same
						vChangeDefinition = vChangeDefinition[0];
					}
					Versions.onAllChangesSaved({
						reference: vChangeDefinition.reference,
						layer: vChangeDefinition.layer
					});
				}
				return oResult;
			});
	};

	/**
	 * Loads and applies all changes for the specified xml tree view
	 *
	 * @param {object} oView - the view to process as XML tree
	 * @param {object} mPropertyBag - collection of cross-functional attributes
	 * @param {string} mPropertyBag.viewId - id of the processed view
	 * @param {string} mPropertyBag.componentId - name of the root component of the view
	 * @returns {Promise} Promise resolves once all changes of the view have been applied
	 * @public
	 */
	FlexController.prototype.processXmlView = function(oView, mPropertyBag) {
		var oViewComponent = Component.get(mPropertyBag.componentId);
		var oAppComponent = Utils.getAppComponentForControl(oViewComponent);

		mPropertyBag.appComponent = oAppComponent;
		mPropertyBag.modifier = XmlTreeModifier;
		mPropertyBag.view = oView;

		return this._oChangePersistence.getChangesForView(mPropertyBag)
			.then(Applier.applyAllChangesForXMLView.bind(Applier, mPropertyBag))
			.catch(this._handlePromiseChainError.bind(this, mPropertyBag.view));
	};

	FlexController.prototype._handlePromiseChainError = function(oView, oError) {
		Log.error("Error processing view " + oError + ".");
		return oView;
	};

	/**
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 *
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @param {string} sControlType - Mame of the ui5 control type i.e. sap.m.Button
	 * @param {sap.ui.core.Control} oControl - Control for which to retrieve the change handler
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @returns {Promise.<sap.ui.fl.changeHandler.Base>} Change handler or undefined if not found, wrapped in a promise.
	 * @private
	 */
	FlexController.prototype._getChangeHandler = function(oChange, sControlType, oControl, oModifier) {
		var sChangeType = oChange.getChangeType();
		var sLayer = oChange.getLayer();
		return this._getChangeRegistry().getChangeHandler(sChangeType, sControlType, oControl, oModifier, sLayer);
	};

	/**
	 * Returns the change registry
	 *
	 * @returns {sap.ui.fl.registry.ChangeRegistry} Instance of the change registry
	 * @private
	 */
	FlexController.prototype._getChangeRegistry = function() {
		var oInstance = ChangeRegistry.getInstance();
		// make sure to use the most current flex settings that have been retrieved during processView
		oInstance.initSettings();
		return oInstance;
	};

	/**
	 * Retrieves the changes for the complete UI5 component
	 *
	 * also used by OVP!
	 *
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to the current running component
	 * @param {string} [mPropertyBag.siteId] ID of the site belonging to the current running component
	 * @param {boolean} bInvalidateCache - (optional) should the cache be invalidated
	 * @returns {Promise} Promise resolves with a map of all {sap.ui.fl.Change} having the changeId as key
	 * @public
	 */
	FlexController.prototype.getComponentChanges = function(mPropertyBag, bInvalidateCache) {
		return this._oChangePersistence.getChangesForComponent(mPropertyBag, bInvalidateCache);
	};

	/**
	 * Calls the same function in the change persistence, which actually does the work.
	 *
	 * @param {object} oSelector selector of the control
	 * @param {sap.ui.core.Component} oComponent - component instance that is currently loading
	 * @returns {boolean} Returns true if there are open dependencies
	 */
	FlexController.prototype.checkForOpenDependenciesForControl = function(oSelector, oComponent) {
		return this._oChangePersistence.checkForOpenDependenciesForControl(oSelector, oComponent);
	};

	/**
	 * Determines if an active personalization - user specific changes or variants - for the flexibility reference
	 * of the controller instance (<code>this._sComponentName</code>) is in place.
	 *
	 * @param {map} [mPropertyBag] - Contains additional data needed for checking personalization, will be passed to FlexController.getComponentChanges
	 * @param {string} [mPropertyBag.upToLayer=currentLayer] - layer to compare to which it is checked if changes exist
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that personalization shall be checked without layer filtering
	 * @returns {Promise} Resolves with a boolean; true if a personalization change made using SAPUI5 flexibility services is active in the application
	 * @public
	 */
	FlexController.prototype.hasHigherLayerChanges = function(mPropertyBag) {
		mPropertyBag = mPropertyBag || {};
		var sCurrentLayer = mPropertyBag.upToLayer || LayerUtils.getCurrentLayer(false);
		//Always include smart variants when checking personalization
		mPropertyBag.includeVariants = true;
		//Also control variant changes are important
		mPropertyBag.includeCtrlVariants = true;
		return this.getComponentChanges(mPropertyBag).then(function(vChanges) {
			var bHasHigherLayerChanges = vChanges === this._oChangePersistence.HIGHER_LAYER_CHANGES_EXIST
				|| vChanges.some(function(oChange) {
					//check layer (needs inverse layer filtering compared to max-layer)
					return LayerUtils.compareAgainstCurrentLayer(oChange.getLayer(), sCurrentLayer) > 0;
				});

			return !!bHasHigherLayerChanges;
		}.bind(this));
	};

	/**
	 * Creates a new instance of sap.ui.fl.Persistence based on the current component and caches the instance in a private member
	 *
	 * @returns {sap.ui.fl.Persistence} persistence instance
	 * @private
	 */
	FlexController.prototype._createChangePersistence = function() {
		this._oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.getComponentName(), this.getAppVersion());
		return this._oChangePersistence;
	};

	/**
	 * Reset changes on the server
	 * If the reset is performed for an entire component, a browser reload is required.
	 * If the reset is performed for a control, this function also triggers a reversion of deleted UI changes.
	 *
	 * @param {string} sLayer - Layer for which changes shall be deleted
	 * @param {string} [sGenerator] - Generator of changes (optional)
	 * @param {sap.ui.core.Component} [oComponent] - Component instance (optional)
	 * @param {string[]} [aSelectorIds] - Selector IDs in local format (optional)
	 * @param {string[]} [aChangeTypes] - Types of changes (optional)
	 *
	 * @returns {Promise} Promise that resolves after the deletion took place
	 */
	FlexController.prototype.resetChanges = function(sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes) {
		return this._oChangePersistence.resetChanges(sLayer, sGenerator, aSelectorIds, aChangeTypes)
			.then(function(aChanges) {
				if (aChanges.length !== 0) {
					return Reverter.revertMultipleChanges(aChanges, {
						appComponent: oComponent,
						modifier: JsControlTreeModifier,
						flexController: this
					});
				}
			}.bind(this))
			.then(function() {
				if (oComponent) {
					var oModel = oComponent.getModel(Utils.VARIANT_MODEL_NAME);
					if (oModel) {
						URLHandler.update({
							parameters: [],
							updateURL: true,
							updateHashEntry: true,
							model: oModel
						});
					}
				}
			});
	};

	/**
	 * Discard changes on the server. Still used by OVP
	 *
	 * @param {array} aChanges array of {sap.ui.fl.Change} to be discarded
	 * @param {boolean} bDiscardPersonalization - (optional) specifies that only changes in the USER layer are discarded
	 * @returns {Promise} Promise that resolves without parameters
	 */
	FlexController.prototype.discardChanges = function(aChanges, bDiscardPersonalization) {
		var sActiveLayer = LayerUtils.getCurrentLayer(!!bDiscardPersonalization);
		var iIndex = 0;
		var iLength;
		var oChange;

		iLength = aChanges.length;
		while (iIndex < aChanges.length) {
			oChange = aChanges[iIndex];
			if (oChange && oChange.getLayer && oChange.getLayer() === sActiveLayer) {
				this._oChangePersistence.deleteChange(oChange);
			}
			//the array may change during this loop, so if the length is the same, the index must increase
			//otherwise the same index should be used (same index but different element in the array)
			if (iLength === aChanges.length) {
				iIndex++;
			} else {
				iLength = aChanges.length;
			}
		}

		return this._oChangePersistence.saveDirtyChanges();
	};

	/**
	 * Applying variant changes.
	 *
	 * @param {array} aChanges - Array of relevant changes
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were applied in asynchronous or FakePromise for the synchronous processing scenario
	 * @public
	 */
	FlexController.prototype.applyVariantChanges = function(aChanges, oAppComponent) {
		var oControl;
		return aChanges.reduce(function(oPreviousPromise, oChange) {
			return oPreviousPromise.then(function() {
				var mPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: oAppComponent
				};
				this._oChangePersistence._addRunTimeCreatedChangeAndUpdateDependencies(oAppComponent, oChange);
				oControl = mPropertyBag.modifier.bySelector(oChange.getSelector(), oAppComponent);
				if (oControl) {
					return Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
				}
				Log.error("A flexibility change tries to change a nonexistent control.");
			}.bind(this));
		}.bind(this), new Utils.FakePromise());
	};

	/**
	 * Saves changes sequentially on the associated change persistence instance;
	 * This API must be only used in scnarios without draft (like personalization).
	 *
	 * @param {sap.ui.fl.Change[]} aDirtyChanges Array of dirty changes to be saved
	 * @param {sap.ui.core.UIComponent} [oAppComponent] - AppComponent instance
	 * @returns {Promise} A Promise which resolves when all changes have been saved
	 * @public
	 */
	FlexController.prototype.saveSequenceOfDirtyChanges = function(aDirtyChanges, oAppComponent) {
		return this._oChangePersistence.saveDirtyChanges(oAppComponent, false, aDirtyChanges);
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
	FlexController.prototype.getResetAndPublishInfo = function(mPropertyBag) {
		mPropertyBag.reference = this._sComponentName;
		mPropertyBag.appVersion = this._sAppVersion;
		return this._oChangePersistence.getResetAndPublishInfo(mPropertyBag);
	};

	return FlexController;
}, true);
