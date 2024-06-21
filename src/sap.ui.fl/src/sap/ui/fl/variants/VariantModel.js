/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel"
], function(
	_omit,
	_isEqual,
	each,
	isEmptyObject,
	merge,
	ObjectPath,
	Log,
	JsControlTreeModifier,
	BusyIndicator,
	Element,
	Lib,
	Applier,
	Reverter,
	URLHandler,
	FlexObjectFactory,
	DependencyHandler,
	Switcher,
	VariantManagementState,
	FlexObjectState,
	ManifestUtils,
	VariantUtil,
	Layer,
	LayerUtils,
	Utils,
	Settings,
	ContextBasedAdaptationsAPI,
	BindingMode,
	JSONModel
) {
	"use strict";

	var _mUShellServices = {};

	/**
	 * Handler for "select" event fired from a variant management control.
	 * Adds to the variant switch promise chain, resolving when new variant (if applicable) has been switched and all source variant dirty changes have been removed.
	 * @param {object} oEvent - Event object
	 * @param {object} mPropertyBag - Object with properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model instance
	 * @returns {Promise<undefined>} Resolves with undefined
	 *
	 * @private
	 */
	function variantSelectHandler(oEvent, mPropertyBag) {
		return executeAfterSwitch(function(mParameters, mVariantProperties) {
			var oModel = mVariantProperties.model;
			var sVMReference = mVariantProperties.vmReference;
			var bVariantSwitch = false;
			var bOldVariantWasModified = ObjectPath.get([sVMReference, "modified"], oModel.oData);
			var sTargetVReference = mParameters.key;
			var sSourceVReference = mParameters.key;
			return Promise.resolve().then(function() {
				// for standard variants 'currentVariant' property is not set
				// e.g. variants generated through _ensureStandardVariantExists()
				if (
					ObjectPath.get([sVMReference, "currentVariant"], oModel.oData)
					&& oModel.oData[sVMReference].currentVariant !== sTargetVReference
				) {
					sSourceVReference = oModel.oData[sVMReference].currentVariant;
					bVariantSwitch = true;
					return oModel.updateCurrentVariant({
						variantManagementReference: sVMReference,
						newVariantReference: sTargetVReference,
						appComponent: oModel.oAppComponent,
						internallyCalled: true
					});
				}
			})
			.then(function() {
				if (bOldVariantWasModified) {
					var aControlChanges = VariantManagementState.getControlChangesForVariant({
						reference: oModel.sFlexReference,
						vmReference: sVMReference,
						vReference: sSourceVReference
					});
					return eraseDirtyChanges({
						changes: aControlChanges,
						vmReference: sVMReference,
						vReference: sSourceVReference,
						revert: !bVariantSwitch,
						model: oModel
					});
				}
				return Promise.resolve();
			})
			.then(function() {
				// the variant switch already calls the listeners
				if (!bVariantSwitch) {
					oModel.callVariantSwitchListeners(sVMReference, oModel.oData[sVMReference].currentVariant);
				}
			});
		}.bind(null, oEvent.getParameters(), mPropertyBag), mPropertyBag.model);
	}

	/**
	 * Removes passed control changes which are in DIRTY state from the variant state and flex controller.
	 * @param {object} mPropertyBag - Object with properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.changes - Array of control changes
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.vReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model instance
	 * @param {boolean} [mPropertyBag.revert] - Revert change from control
	 *
	 * @returns {Promise} Resolves when changes have been erased
	 */
	function eraseDirtyChanges(mPropertyBag) {
		var aVariantDirtyChanges = mPropertyBag.model._getDirtyChangesFromVariantChanges(mPropertyBag.changes);
		aVariantDirtyChanges = aVariantDirtyChanges.reverse();

		return Promise.resolve()
		.then(function() {
			if (mPropertyBag.revert) {
				return Reverter.revertMultipleChanges(aVariantDirtyChanges, {
					appComponent: mPropertyBag.model.oAppComponent,
					modifier: JsControlTreeModifier,
					reference: mPropertyBag.model.sFlexReference
				});
			}
			return undefined;
		})
		.then(function() {
			mPropertyBag.model.oChangePersistence.deleteChanges(aVariantDirtyChanges);
		});
	}

	/**
	 * Adds the passed function to the variant switch promise and returns the whole promise chain.
	 *
	 * @param {function():Promise} fnCallback - Callback function returning a promise
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant model
	 * @param {string} sVMReference - Variant Management reference
	 * @returns {Promise} Resolves when the variant model is not busy anymore
	 * @private
	 */
	function executeAfterSwitch(fnCallback, oModel) {
		// if there are multiple switches triggered very quickly this makes sure that they are being executed one after another
		oModel._oVariantSwitchPromise = oModel._oVariantSwitchPromise
		.catch(function() {})
		.then(fnCallback);
		VariantManagementState.setVariantSwitchPromise(oModel.sFlexReference, oModel._oVariantSwitchPromise);
		return oModel._oVariantSwitchPromise;
	}

	/**
	 * Saves the specified Unified Shell service on the model
	 *
	 * @param {string} sServiceName Name of the ushell service (e.g. "URLParsing")
	 * @param {sap.ui.core.service.Service} oService The service object
	 */
	function setUShellService(sServiceName, oService) {
		_mUShellServices[sServiceName] = oService;
	}

	function switchVariantAndUpdateModel(mPropertyBag, sScenario) {
		return Switcher.switchVariant(mPropertyBag)
		.then(function() {
			// update current variant in model
			if (this.oData[mPropertyBag.vmReference].updateVariantInURL) {
				URLHandler.updateVariantInURL({
					vmReference: mPropertyBag.vmReference,
					newVReference: mPropertyBag.newVReference,
					model: this
				});
			}

			// tell listeners that variant switch has happened
			this.callVariantSwitchListeners(mPropertyBag.vmReference, mPropertyBag.newVReference, undefined, sScenario);
		}.bind(this));
	}

	function updatePersonalVariantPropertiesWithFlpSettings(oVariant) {
		var oSettings = Settings.getInstanceOrUndef();
		if (oSettings && !oSettings.isVariantPersonalizationEnabled()) {
			oVariant.remove = false;
			oVariant.rename = false;
			oVariant.change = false;
		}
	}

	function updatePublicVariantPropertiesWithSettings(oVariant) {
		var oSettings = Settings.getInstanceOrUndef();
		var bUserIsAuthorized = oSettings &&
			(oSettings.isKeyUser() || !oSettings.getUserId() ||
			(oSettings.isPublicFlVariantEnabled() && oSettings.getUserId().toUpperCase() === oVariant.instance.getSupportInformation().user.toUpperCase()));
		oVariant.remove = bUserIsAuthorized;
		oVariant.rename = bUserIsAuthorized;
		oVariant.change = bUserIsAuthorized;
	}

	function isVariantValidForRemove(oVariant, sVariantManagementReference, bDesignTimeModeToBeSet) {
		var sLayer = bDesignTimeModeToBeSet ? LayerUtils.getCurrentLayer() : Layer.USER;
		if ((oVariant.layer === sLayer) && (oVariant.key !== sVariantManagementReference)) {
			return true;
		}
		return false;
	}

	function waitForControlToBeRendered(oControl) {
		return new Promise(function(resolve) {
			if (oControl.getDomRef()) {
				resolve();
			} else {
				oControl.addEventDelegate({
					onAfterRendering() {
						resolve();
					}
				});
			}
		});
	}

	function initUshellServices() {
		var oUShellContainer = Utils.getUshellContainer();
		if (oUShellContainer) {
			var aServicePromises = [
				Utils.getUShellService("UserInfo"),
				Utils.getUShellService("URLParsing"),
				Utils.getUShellService("Navigation"),
				Utils.getUShellService("ShellNavigationInternal")
			];
			return Promise.all(aServicePromises)
			.then(function(aServices) {
				setUShellService("UserInfo", aServices[0]);
				setUShellService("URLParsing", aServices[1]);
				setUShellService("Navigation", aServices[2]);
				setUShellService("ShellNavigationInternal", aServices[3]);
			})
			.catch(function(vError) {
				throw new Error(`Error getting service from Unified Shell: ${vError}`);
			});
		}
		return undefined;
	}

	function getVariant(aVariants, sVariantKey) {
		return merge({}, aVariants.find(function(oCurrentVariant) {
			return oCurrentVariant.key === sVariantKey;
		}));
	}

	function getAdaptationId(sLayer, oControl, sReference) {
		var mContextBasedAdaptationBag = {
			layer: sLayer,
			control: oControl,
			reference: sReference
		};
		var bHasAdaptationsModel = ContextBasedAdaptationsAPI.hasAdaptationsModel(mContextBasedAdaptationBag);
		return bHasAdaptationsModel && ContextBasedAdaptationsAPI.getDisplayedAdaptationId(mContextBasedAdaptationBag);
	}

	function waitForInitialVariantChanges(mPropertyBag) {
		const aCurrentVariantChanges = VariantManagementState.getInitialUIChanges({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference
		});
		const aSelectors = aCurrentVariantChanges.reduce((aCurrentControls, oChange) => {
			const oSelector = oChange.getSelector();
			const oControl = JsControlTreeModifier.bySelector(oSelector, mPropertyBag.appComponent);
			if (oControl && Utils.indexOfObject(aCurrentControls, { selector: oControl }) === -1) {
				aCurrentControls.push({ selector: oControl });
			}
			return aCurrentControls;
		}, []);
		return aSelectors.length ? FlexObjectState.waitForFlexObjectsToBeApplied(aSelectors) : Promise.resolve();
	}

	/**
	 * Constructor for a new sap.ui.fl.variants.VariantModel model.
	 * @class Variant model implementation for JSON format.
	 * @extends sap.ui.model.json.JSONModel
	 * @author SAP SE
	 * @version ${version}
	 * @param {object} oData - Either the URL where to load the JSON from or a JS object
	 * @param {object} mPropertyBag - Map of properties required for the constructor
	 * @param {sap.ui.fl.FlexController} mPropertyBag.flexController - <code>FlexController</code> instance for the component which uses the variant model
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component instance that is currently loading
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.fl
	 * @since 1.50
	 * @alias sap.ui.fl.variants.VariantModel
	 */
	var VariantModel = JSONModel.extend("sap.ui.fl.variants.VariantModel", /** @lends sap.ui.fl.variants.VariantModel.prototype */ {
		// eslint-disable-next-line object-shorthand
		constructor: function(oData, mPropertyBag) {
			// JSON model internal properties
			this.pSequentialImportCompleted = Promise.resolve();
			JSONModel.apply(this, [oData]);

			this.sharing = {
				PRIVATE: "private",
				PUBLIC: "public"
			};

			// FlexControllerFactory creates a FlexController instance for an application component,
			// which creates a ChangePersistence instance.
			// After retrieving changes for the created ChangePersistence instance,
			// FlexControllerFactory creates a VariantModel instance for this application component.
			this.oFlexController = mPropertyBag.flexController;
			this.oChangePersistence = this.oFlexController._oChangePersistence;
			this.sFlexReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.appComponent);
			this.oAppComponent = mPropertyBag.appComponent;
			this._oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
			this._oVariantSwitchPromise = Promise.resolve();
			this._oVariantAppliedListeners = {};

			// set variant model data
			this.fnUpdateListener = this.updateData.bind(this);
			this.oDataSelector = VariantManagementState.getVariantManagementMap();
			this.oDataSelector.addUpdateListener(this.fnUpdateListener);
			// Initialize data
			this.updateData();

			const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(this.sFlexReference);
			VariantManagementState.getInitialUIChanges(
				{reference: this.sFlexReference},
				this.oAppComponent.getId(),
				this.sFlexReference
			).forEach((oFlexObject) => {
				DependencyHandler.addChangeAndUpdateDependencies(oFlexObject, this.oAppComponent.getId(), oLiveDependencyMap);
			});

			this.setDefaultBindingMode(BindingMode.OneWay);
		}
	});

	VariantModel.prototype.updateData = function() {
		var oNewVariantsMap = this.oDataSelector.get({ reference: this.sFlexReference });
		var oCurrentData = Object.assign({}, this.getData());
		Object.entries(oNewVariantsMap).forEach(function(aVariants) {
			var sVariantManagementKey = aVariants[0];
			var oVariantMapEntry = Object.assign({}, aVariants[1]);
			oCurrentData[sVariantManagementKey] ||= {};
			oCurrentData[sVariantManagementKey].variants = oVariantMapEntry.variants.map(function(oVariant) {
				var oCurrentVariantData = (oCurrentData[sVariantManagementKey].variants || [])
				.find(function(oVariantToCheck) {
					return oVariantToCheck.key === oVariant.key;
				});
				return Object.assign(
					{},
					oCurrentVariantData || {},
					oVariant
				);
			});
			oCurrentData[sVariantManagementKey].currentVariant = oVariantMapEntry.currentVariant;
			oCurrentData[sVariantManagementKey].defaultVariant = oVariantMapEntry.defaultVariant;
			oCurrentData[sVariantManagementKey].modified = oVariantMapEntry.modified;
		});
		this.setData(oCurrentData);

		// Since the model has an one-way binding, some VariantItem properties that were overridden
		// via direct setter calls need to be updated explicitly
		this.refresh(true);
	};

	VariantModel.prototype.invalidateMap = function() {
		this.oDataSelector.checkUpdate({reference: this.sFlexReference});
	};

	/**
	 * Gets the necessary UShell Services and initializes the URL Handler
	 * @returns {Promise} Promise resolving when the VariantModel is initialized
	 */
	VariantModel.prototype.initialize = function() {
		return Promise.all([Settings.getInstance(), initUshellServices()])
		.then(function() {
			// initialize hash data - variants map & model should exist at this point (set on constructor)
			URLHandler.initialize({ model: this });
		}.bind(this));
	};

	/**
	 * Updates the storage of the current variant for a given variant management control.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.newVariantReference - Newly selected variant reference
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - Application component responsible for the variant management reference
	 * @param {boolean} [mPropertyBag.internallyCalled] - If set variant model is not set to busy explicitly
	 * @param {string} [mPropertyBag.scenario] - The current scenario, e.g. 'saveAs'
	 *
	 * @returns {Promise} Promise that resolves after the variant is updated
	 * @private
	 */
	VariantModel.prototype.updateCurrentVariant = function(mPropertyBag) {
		var mProperties = {
			vmReference: mPropertyBag.variantManagementReference,
			currentVReference: this.getCurrentVariantReference(mPropertyBag.variantManagementReference),
			newVReference: mPropertyBag.newVariantReference,
			appComponent: mPropertyBag.appComponent || this.oAppComponent,
			modifier: JsControlTreeModifier,
			reference: this.sFlexReference
		};

		if (mPropertyBag.internallyCalled) {
			return switchVariantAndUpdateModel.call(this, mProperties, mPropertyBag.scenario);
		}
		return executeAfterSwitch(switchVariantAndUpdateModel.bind(this, mProperties, mPropertyBag.scenario), this);
	};

	/**
	 * Returns the current variant for a given variant management control.
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @returns {string} Current variant reference
	 * @private
	 * @ui5-restricted
	 */
	VariantModel.prototype.getCurrentVariantReference = function(sVariantManagementReference) {
		return this.oData[sVariantManagementReference].currentVariant;
	};

	VariantModel.prototype.getVariantManagementReference = function(sVariantReference) {
		var sVariantManagementReference = "";
		var iIndex = -1;
		Object.keys(this.oData).some(function(sKey) {
			return this.oData[sKey].variants.some(function(oVariant, index) {
				if (oVariant.key === sVariantReference) {
					sVariantManagementReference = sKey;
					iIndex = index;
					return true;
				}
			});
		}.bind(this));
		return {
			variantManagementReference: sVariantManagementReference,
			variantIndex: iIndex
		};
	};

	VariantModel.prototype.getVariant = function(sVariantReference, sVariantManagementReference) {
		var sVMReference = sVariantManagementReference || this.getVariantManagementReference(sVariantReference).variantManagementReference;
		return getVariant(
			this.oData[sVMReference].variants,
			sVariantReference
		);
	};

	/**
	 * Searches for the variant and returns the current title.
	 *
	 * @param {string} sVariantReference - Variant reference
	 * @param {string} sVMReference - Variant management reference
	 * @returns {string} Title of the variant
	 */
	VariantModel.prototype.getVariantTitle = function(sVariantReference, sVMReference) {
		return getVariant(this.oData[sVMReference].variants, sVariantReference).title;
	};

	function handleInitialLoadScenario(sVMReference, oVariantManagementControl) {
		var oVariantChangesForVariant = VariantManagementState.getVariantChangesForVariant({
			vmReference: sVMReference,
			reference: this.sFlexReference
		});
		var sDefaultVariantReference = this.oData[sVMReference].defaultVariant;
		if (
			oVariantManagementControl.getExecuteOnSelectionForStandardDefault()
			&& sDefaultVariantReference === sVMReference
			&& !oVariantChangesForVariant.setExecuteOnSelect
		) {
			var oStandardVariant = getVariant(this.oData[sVMReference].variants, sVMReference);
			// set executeOnSelect in model and State without creating a change
			oStandardVariant.instance.setExecuteOnSelection(true);
			this.oData[sVMReference].variants[0].executeOnSelect = true;
			return true;
		}
		return false;
	}

	/**
	 * Saves a function that will be called after a variant has been applied with the new variant as parameter.
	 * The function also performs a sanity check after the control has been rendered.
	 * If the passed variant control ID does not match the responsible variant management control, the callback will not be saved.
	 * Optionally this function is also called after the initial variant is applied without a sanity check.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.control - Instance of the control
	 * @param {string} mPropertyBag.vmControlId - ID of the variant management control
	 * @param {function} mPropertyBag.callback - Callback that will be called after a variant has been applied
	 * @param {boolean} mPropertyBag.callAfterInitialVariant - The callback will also be called after the initial variant is applied
	 * @returns {Promise} Promise that resolves after the sanity check
	 */
	VariantModel.prototype.attachVariantApplied = function(mPropertyBag) {
		var oVariantManagementControl = Element.getElementById(mPropertyBag.vmControlId);
		var sVMReference = this.getVariantManagementReferenceForControl(oVariantManagementControl);

		return this.waitForVMControlInit(sVMReference).then(function(sVMReference, mPropertyBag) {
			this._oVariantAppliedListeners[sVMReference] ||= {};

			var bInitialLoad = handleInitialLoadScenario.call(this, sVMReference, oVariantManagementControl);

			// if the parameter callAfterInitialVariant or initialLoad is true call the function without check
			if (mPropertyBag.callAfterInitialVariant || bInitialLoad) {
				var mParameters = {
					appComponent: this.oAppComponent,
					reference: this.sFlexReference,
					vmReference: sVMReference
				};
				waitForInitialVariantChanges(mParameters).then(function() {
					var sCurrentVariantReference = this.oData[sVMReference].currentVariant;
					this.callVariantSwitchListeners(sVMReference, sCurrentVariantReference, mPropertyBag.callback);
				}.bind(this));
			}

			// first check if the passed vmControlId is correct, then save the callback
			// for this check the control has to be in the control tree already
			return waitForControlToBeRendered(mPropertyBag.control).then(function() {
				if (
					VariantUtil.getRelevantVariantManagementControlId(
						mPropertyBag.control,
						this.getVariantManagementControlIds()
					) === mPropertyBag.vmControlId
				) {
					this.oData[sVMReference].showExecuteOnSelection = true;
					this.checkUpdate(true);
					this._oVariantAppliedListeners[sVMReference][mPropertyBag.control.getId()] = mPropertyBag.callback;
				} else {
					Log.error("Error in attachVariantApplied: The passed VariantManagement ID does not match the "
					+ "responsible VariantManagement control");
				}
			}.bind(this));
		}.bind(this, sVMReference, mPropertyBag));
	};

	VariantModel.prototype.callVariantSwitchListeners = function(sVMReference, sNewVariantReference, fnCallback, sScenario) {
		if (this._oVariantAppliedListeners[sVMReference]) {
			var oVariant = getVariant(this.oData[sVMReference].variants, sNewVariantReference);
			if (sScenario) {
				oVariant.createScenario = sScenario;
			}

			if (fnCallback) {
				fnCallback(oVariant);
			} else {
				each(this._oVariantAppliedListeners[sVMReference], function(sControlId, fnCallback) {
					fnCallback(oVariant);
				});
			}
		}
	};

	VariantModel.prototype.detachVariantApplied = function(sVMControlId, sControlId) {
		var sVMReference = this.getVariantManagementReferenceForControl(Element.getElementById(sVMControlId));
		if (this._oVariantAppliedListeners[sVMReference]) {
			delete this._oVariantAppliedListeners[sVMReference][sControlId];
		}
	};

	/**
	 * Erases dirty changes on a given variant and returns the dirty changes.
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {string} sVariantReference - Variant reference to remove dirty changes from
	 * @returns {Promise} Promise resolving to dirty changes which will be removed
	 */
	VariantModel.prototype.eraseDirtyChangesOnVariant = function(sVariantManagementReference, sVariantReference) {
		var aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
			reference: this.sFlexReference,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference
		});

		var aSourceVariantDirtyChanges = this._getDirtyChangesFromVariantChanges(aSourceVariantChanges);

		return eraseDirtyChanges({
			changes: aSourceVariantChanges,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference,
			model: this,
			revert: true
		})
		.then(function() {
			return aSourceVariantDirtyChanges;
		});
	};

	/**
	 * Adds and applies the given changes.
	 *
	 * @param {Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>} aChanges Changes to be applied
	 * @returns {Promise} Promise resolving when all changes are applied
	 */
	VariantModel.prototype.addAndApplyChangesOnVariant = function(aChanges) {
		this.oChangePersistence.addChanges(aChanges, this.oAppComponent);
		return aChanges.reduce(function(oPreviousPromise, oChange) {
			return oPreviousPromise.then(function() {
				var oControl = Element.getElementById(JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), this.oAppComponent));
				return Applier.applyChangeOnControl(oChange, oControl, {
					modifier: JsControlTreeModifier,
					appComponent: this.oAppComponent,
					view: Utils.getViewForControl(oControl)
				})
				.then((oReturn) => {
					if (!oReturn.success) {
						var oException = oReturn.error || new Error("The change could not be applied.");
						this._oChangePersistence.deleteChange(oChange, true);
						throw oException;
					}
				});
			}.bind(this));
		}.bind(this), Promise.resolve());
	};

	VariantModel.prototype._getVariantTitleCount = function(sNewText, sVariantManagementReference) {
		var oData = this.getData();
		return oData[sVariantManagementReference].variants.reduce(function(iCount, oVariant) {
			if (sNewText.toLowerCase() === oVariant.title.toLowerCase() && oVariant.visible) {
				iCount++;
			}
			return iCount;
		}, 0);
	};

	function createNewVariant(oSourceVariant, mPropertyBag) {
		var mProperties = {
			id: mPropertyBag.newVariantReference,
			variantName: mPropertyBag.title,
			contexts: mPropertyBag.contexts,
			layer: mPropertyBag.layer,
			adaptationId: mPropertyBag.adaptationId,
			reference: oSourceVariant.getFlexObjectMetadata().reference,
			generator: mPropertyBag.generator,
			variantManagementReference: mPropertyBag.variantManagementReference
		};
		if (mPropertyBag.layer === Layer.VENDOR) {
			mProperties.user = "SAP";
		}
		if (mPropertyBag.currentVariantComparison === 1) {
			// in case a user variant should be saved as a PUBLIC variant, but refers to a PUBLIC variant,
			// the references dependencies must be followed one more time
			if (mPropertyBag.sourceVariantSource.instance.getLayer() === mPropertyBag.layer) {
				mProperties.variantReference = mPropertyBag.sourceVariantSource.instance.getVariantReference();
			} else {
				mProperties.variantReference = oSourceVariant.getVariantReference();
			}
		} else if (mPropertyBag.currentVariantComparison === 0) {
			mProperties.variantReference = oSourceVariant.getVariantReference();
		} else if (mPropertyBag.currentVariantComparison === -1) {
			mProperties.variantReference = mPropertyBag.sourceVariantReference;
		}

		return FlexObjectFactory.createFlVariant(mProperties);
	}

	VariantModel.prototype._duplicateVariant = function(mPropertyBag) {
		var sSourceVariantReference = mPropertyBag.sourceVariantReference;
		var sVariantManagementReference = mPropertyBag.variantManagementReference;
		var oSourceVariant = this.getVariant(sSourceVariantReference);

		var aVariantChanges = VariantManagementState.getControlChangesForVariant({
			vmReference: sVariantManagementReference,
			vReference: sSourceVariantReference,
			reference: this.sFlexReference
		})
		.map(function(oVariantChange) {
			return oVariantChange.convertToFileContent();
		});

		mPropertyBag.currentVariantComparison = LayerUtils.compareAgainstCurrentLayer(oSourceVariant.instance.getLayer(), mPropertyBag.layer);
		if (mPropertyBag.currentVariantComparison === 1) {
			mPropertyBag.sourceVariantSource = this.getVariant(oSourceVariant.instance.getVariantReference());
		}
		var oDuplicateVariant = {
			instance: createNewVariant(oSourceVariant.instance, mPropertyBag),
			controlChanges: aVariantChanges,
			variantChanges: {}
		};

		aVariantChanges = oDuplicateVariant.controlChanges.slice();

		var oDuplicateChangeData = {};
		oDuplicateVariant.controlChanges = aVariantChanges.reduce(function(aSameLayerChanges, oChange) {
			// copy all changes in the same layer and higher layers (PUBLIC variant can copy USER layer changes)
			if (LayerUtils.compareAgainstCurrentLayer(oChange.layer, mPropertyBag.layer) >= 0) {
				oDuplicateChangeData = merge({}, oChange);
				// ensure that the layer is set to the current variants (USER may becomes PUBLIC)
				oDuplicateChangeData.layer = mPropertyBag.layer;
				oDuplicateChangeData.variantReference = oDuplicateVariant.instance.getId();
				oDuplicateChangeData.support ||= {};
				oDuplicateChangeData.support.sourceChangeFileName = oChange.fileName;
				// For new change instances the package name needs to be reset to $TMP, BCP: 1870561348
				oDuplicateChangeData.packageName = "$TMP";
				oDuplicateChangeData.fileName = Utils.createDefaultFileName(oDuplicateChangeData.changeType);
				aSameLayerChanges.push(FlexObjectFactory.createFromFileContent(oDuplicateChangeData));
			}
			return aSameLayerChanges;
		}, []);

		return oDuplicateVariant;
	};

	/**
	 * Copies a variant.
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.title - Title for the variant
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Model's app component
	 * @param {string} mPropertyBag.layer - Layer on which the new variant should be created
	 * @param {string} mPropertyBag.newVariantReference - <code>variantReference</code> for the new variant
	 * @param {string} mPropertyBag.sourceVariantReference - <code>variantReference</code> of the source variant
	 * @param {string} mPropertyBag.generator - Information about who created the change
	 * @param {object} mPropertyBag.contexts - Context structure containing roles and countries
	 * @returns {Promise} Promise resolving to dirty changes created during variant copy
	 * @private
	 */
	VariantModel.prototype.copyVariant = function(mPropertyBag) {
		var oDuplicateVariantData = this._duplicateVariant(mPropertyBag);
		oDuplicateVariantData.generator = mPropertyBag.generator;

		this.oData[mPropertyBag.variantManagementReference].variants.push({
			key: oDuplicateVariantData.instance.getId(),
			rename: true,
			change: true,
			remove: true,
			sharing: mPropertyBag.layer === Layer.USER
				? this.sharing.PRIVATE
				: this.sharing.PUBLIC
		});

		var aChanges = [];

		// when created a new public variant other users do not see the new public variant
		if (mPropertyBag.layer === Layer.PUBLIC) {
			oDuplicateVariantData.instance.setFavorite(false);
			var oChangeProperties = {
				selector: JsControlTreeModifier.getSelector(mPropertyBag.newVariantReference, mPropertyBag.appComponent),
				changeType: "setFavorite",
				fileType: "ctrl_variant_change",
				generator: mPropertyBag.generator,
				layer: Layer.USER,
				reference: this.sFlexReference,
				content: {favorite: true}
			};
			aChanges.push(FlexObjectFactory.createUIChange(oChangeProperties));
		}

		// sets copied variant and associated changes as dirty
		aChanges = this.oChangePersistence.addDirtyChanges(
			aChanges
			.concat([oDuplicateVariantData.instance]
			.concat(oDuplicateVariantData.controlChanges)
			.concat(mPropertyBag.additionalVariantChanges))
		);

		return this.updateCurrentVariant({
			variantManagementReference: mPropertyBag.variantManagementReference,
			newVariantReference: oDuplicateVariantData.instance.getId(),
			appComponent: mPropertyBag.appComponent,
			internallyCalled: true,
			scenario: "saveAs"
		}).then(function() {
			return aChanges;
		});
	};

	VariantModel.prototype.removeVariant = function(mPropertyBag) {
		var aChangesToBeDeleted = this.oChangePersistence.getDirtyChanges().filter(function(oChange) {
			return (oChange.getVariantReference && oChange.getVariantReference() === mPropertyBag.variant.getId()) ||
				oChange.getId() === mPropertyBag.variant.getId();
		});

		return this.updateCurrentVariant({
			variantManagementReference: mPropertyBag.variantManagementReference,
			newVariantReference: mPropertyBag.sourceVariantReference,
			appComponent: mPropertyBag.component
		}).then(function() {
			this.oChangePersistence.deleteChanges(aChangesToBeDeleted);
		}.bind(this));
	};

	VariantModel.prototype._collectModelChanges = function(sVariantManagementReference, sLayer, oEvent) {
		const oData = this.getData()[sVariantManagementReference];
		const aModelVariants = oData.variants;
		const aChanges = [];
		const oSettings = Settings.getInstanceOrUndef();

		const findVariant = (sVariantKey) => {
			return aModelVariants.find((oModelVariant) => oModelVariant.key === sVariantKey);
		};

		const fnAddPreparedChange = (oVariant, sChangeType, mChangeData) => {
			// layer can be PUBLIC for setTitle, setExecuteOnSelect or setVisible, but never for setFavorite, setDefault or setContexts
			const bSupportsPublicChange = ["setTitle", "setExecuteOnSelect", "setVisible"].includes(sChangeType);
			const sChangeLayer = (
				bSupportsPublicChange
				&& oSettings?.isPublicFlVariantEnabled()
				&& oVariant.layer === Layer.PUBLIC
			) ? Layer.PUBLIC : sLayer;

			aChanges.push({
				variantReference: oVariant.key,
				changeType: sChangeType,
				layer: sChangeLayer,
				...mChangeData
			});
		};

		oEvent.getParameter("renamed")?.forEach(({key: sVariantKey, name: sNewTitle}) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setTitle",
				{
					title: sNewTitle,
					originalTitle: oVariant.title
				}
			);
		});
		oEvent.getParameter("fav")?.forEach(({key: sVariantKey, visible: bNewIsFavorite}) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setFavorite",
				{
					favorite: bNewIsFavorite,
					originalFavorite: oVariant.favorite
				}
			);
		});
		oEvent.getParameter("exe")?.forEach(({key: sVariantKey, exe: bNewExecuteOnSelect}) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setExecuteOnSelect",
				{
					executeOnSelect: bNewExecuteOnSelect,
					originalExecuteOnSelect: oVariant.executeOnSelect
				}
			);
		});
		oEvent.getParameter("deleted")?.forEach((sVariantKey) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setVisible",
				{
					visible: false
				}
			);
		});
		oEvent.getParameter("contexts")?.forEach(({key: sVariantKey, contexts: aNewContexts}) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setContexts",
				{
					contexts: aNewContexts,
					originalContexts: oVariant.contexts
				}
			);
		});
		const sNewDefault = oEvent.getParameter("def");
		if (sNewDefault) {
			aChanges.push({
				variantManagementReference: sVariantManagementReference,
				changeType: "setDefault",
				defaultVariant: sNewDefault,
				originalDefaultVariant: oData.defaultVariant,
				layer: sLayer
			});
		}

		return aChanges;
	};

	/**
	 * Opens the <i>Manage Views</i> dialog.
	 * Returns a promise which resolves to changes made from the manage dialog, based on the parameters passed.
	 * @param {sap.ui.fl.variants.VariantManagement} oVariantManagementControl - Variant management control
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {string} sLayer - Current layer
	 * @param {string} sClass - Style class assigned to the management dialog
	 * @param {Promise<sap.ui.core.ComponentContainer>} oContextSharingComponentPromise - Promise resolving with the ComponentContainer
	 * @returns {Promise<void>} Promise which resolves when "manage" event is fired from the variant management control
	 * @private
	 * @ui5-restricted
	 */
	VariantModel.prototype.manageVariants = function(oVariantManagementControl, sVariantManagementReference, sLayer, sClass, oContextSharingComponentPromise) {
		// called from the ControlVariant plugin in Adaptation mode
		return new Promise(function(resolve) {
			oVariantManagementControl.attachEventOnce("manage", {
				resolve,
				variantManagementReference: sVariantManagementReference,
				layer: sLayer
			}, this.fnManageClickRta, this);
			oVariantManagementControl.openManagementDialog(true, sClass, oContextSharingComponentPromise);
		}.bind(this));
	};

	/**
	 * Sets the variant properties and creates a variant change
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation ID to set which overrules the currently display adaptation
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created Change object
	 */
	VariantModel.prototype.createVariantChange = function(sVariantManagementReference, mPropertyBag) {
		var mAdditionalChangeContent = this.setVariantProperties(sVariantManagementReference, mPropertyBag);

		var mNewChangeData = {
			changeType: mPropertyBag.changeType,
			layer: mPropertyBag.layer,
			generator: mPropertyBag.generator,
			reference: this.sFlexReference
		};

		if (mPropertyBag.adaptationId !== undefined) {
			mNewChangeData.adaptationId = mPropertyBag.adaptationId;
		} else {
			mNewChangeData.adaptationId = getAdaptationId(mPropertyBag.layer, mPropertyBag.appComponent, this.sFlexReference);
		}

		if (mPropertyBag.changeType === "setDefault") {
			mNewChangeData.fileType = "ctrl_variant_management_change";
			mNewChangeData.selector = JsControlTreeModifier.getSelector(sVariantManagementReference, mPropertyBag.appComponent);
		} else {
			mNewChangeData.fileType = "ctrl_variant_change";
			mNewChangeData.selector = JsControlTreeModifier.getSelector(mPropertyBag.variantReference, mPropertyBag.appComponent);
		}

		var oChange = FlexObjectFactory.createUIChange(mNewChangeData);
		// update change with additional content
		oChange.setContent(mAdditionalChangeContent);
		if (mPropertyBag.changeType === "setTitle") {
			oChange.setText("title", mPropertyBag.title, "XFLD");
		}

		return oChange;
	};

	/**
	 * Sets the variant properties and adds a variant change
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created Change object
	 */
	VariantModel.prototype.addVariantChange = function(sVariantManagementReference, mPropertyBag) {
		var oChange = this.createVariantChange(sVariantManagementReference, mPropertyBag);
		this.oChangePersistence.addDirtyChange(oChange);

		return oChange;
	};

	/**
	 * Sets the variant properties and adds variant changes
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object[]} aChangePropertyMaps - Array of property maps optionally including the adaptation ID
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Created Change objects
	 */
	VariantModel.prototype.addVariantChanges = function(sVariantManagementReference, aChangePropertyMaps) {
		var aChanges = aChangePropertyMaps.map(function(mProperties) {
			return this.createVariantChange(sVariantManagementReference, mProperties);
		}.bind(this));
		this.oChangePersistence.addDirtyChanges(aChanges);

		return aChanges;
	};

	/**
	 * Sets the variant properties and deletes a variant change
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Variant change to be deleted
	 */
	VariantModel.prototype.deleteVariantChange = function(sVariantManagementReference, mPropertyBag, oChange) {
		this.setVariantProperties(sVariantManagementReference, mPropertyBag);
		this.oChangePersistence.deleteChange(oChange);
	};

	/**
	 * Sets the passed properties on a variant for the passed variant management reference and
	 * returns the content for change creation
	 * @param {sap.ui.fl.variants.VariantManagement} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantReference - Variant reference for which properties should be set
	 * @param {string} mPropertyBag.changeType - Change type due to which properties are being set
	 * @param {string} mPropertyBag.layer - Current layer
	 * @param {string} mPropertyBag.appComponent - App component instance
	 * @param {string} [mPropertyBag.title] - New app title value for <code>setTitle</code> change type
	 * @param {boolean} [mPropertyBag.visible] - New visible value for <code>setVisible</code> change type
	 * @param {object} [mPropertyBag.contexts] - New contexts object (e.g. roles) for <code>setContexts</code> change type
	 * @param {boolean} [mPropertyBag.favorite] - New favorite value for <code>setFavorite</code> change type
	 * @param {boolean} [mPropertyBag.executeOnSelect] - New executeOnSelect value for <code>setExecuteOnSelect</code> change type
	 * @param {string} [mPropertyBag.defaultVariant] - New default variant for <code>setDefault</code> change type
	 * @param {boolean} [bUpdateCurrentVariant] - Update current variant
	 * @returns {{title: string} | {favorite: boolean} | {executeOnSelect: boolean} | {visible: boolean, createdByReset: boolean} | {contexts: object} | {defaultVariant: string}} Additional content for change creation
	 * @private
	 * @ui5-restricted
	 */
	VariantModel.prototype.setVariantProperties = function(sVariantManagementReference, mPropertyBag) {
		// TODO: this function needs refactoring
		var oData = this.getData();
		var oVariantInstance = this.getVariant(mPropertyBag.variantReference, sVariantManagementReference).instance;

		var mAdditionalChangeContent = {};

		switch (mPropertyBag.changeType) {
			case "setTitle":
				oVariantInstance.setName(mPropertyBag.title, true);
				break;
			case "setFavorite":
				mAdditionalChangeContent.favorite = mPropertyBag.favorite;
				oVariantInstance.setFavorite(mPropertyBag.favorite);
				break;
			case "setExecuteOnSelect":
				mAdditionalChangeContent.executeOnSelect = mPropertyBag.executeOnSelect;
				oVariantInstance.setExecuteOnSelection(mPropertyBag.executeOnSelect);
				break;
			case "setVisible":
				mAdditionalChangeContent.visible = mPropertyBag.visible;
				mAdditionalChangeContent.createdByReset = false; // 'createdByReset' is used by the backend to distinguish between setVisible change created via reset and delete
				oVariantInstance.setVisible(mPropertyBag.visible);
				break;
			case "setContexts":
				mAdditionalChangeContent.contexts = mPropertyBag.contexts;
				oVariantInstance.setContexts(mPropertyBag.contexts);
				break;
			case "setDefault":
				mAdditionalChangeContent.defaultVariant = mPropertyBag.defaultVariant;
				// Update hash data
				var aHashParameters = URLHandler.getStoredHashParams({model: this});
				if (aHashParameters && this.oData[sVariantManagementReference].updateVariantInURL) {
					if (
						oData[sVariantManagementReference].defaultVariant !== oData[sVariantManagementReference].currentVariant
						&& aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant) === -1
					) {
						// if default variant is changed from the current variant, then add the current variant id as a variant URI parameter
						URLHandler.update({
							parameters: aHashParameters.concat(oData[sVariantManagementReference].currentVariant),
							updateURL: !this._bDesignTimeMode,
							updateHashEntry: true,
							model: this
						});
					} else if (
						oData[sVariantManagementReference].defaultVariant === oData[sVariantManagementReference].currentVariant
						&& aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant) > -1
					) {
						// if current variant is now the default variant, then remove the current variant id as a variant URI parameter
						aHashParameters.splice(aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant), 1);
						URLHandler.update({
							parameters: aHashParameters,
							updateURL: !this._bDesignTimeMode,
							updateHashEntry: true,
							model: this
						});
					}
				}

				break;
			default:
				break;
		}

		return mAdditionalChangeContent;
	};

	VariantModel.prototype._ensureStandardVariantExists = function(sVariantManagementReference) {
		var oData = this.getData();
		var oVMDataSection = oData[sVariantManagementReference] || {};
		var oVMDataSectionWithoutInit = _omit(oVMDataSection, ["initPromise"]);
		if (!oData[sVariantManagementReference] || isEmptyObject(oVMDataSectionWithoutInit)) { // Ensure standard variant exists
			// Standard Variant should always contain the value: "SAP" in "author" / "Created by" field
			var oStandardVariantInstance = FlexObjectFactory.createFlVariant({
				id: sVariantManagementReference,
				variantManagementReference: sVariantManagementReference,
				variantName: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				user: VariantUtil.DEFAULT_AUTHOR,
				layer: Layer.BASE,
				reference: this.sFlexReference
			});

			VariantManagementState.addRuntimeSteadyObject(this.sFlexReference, this.oAppComponent.getId(), oStandardVariantInstance);
			// save all VariantManagement references for which a standard variant is created
			this._aCreatedStandardVariantsFor ||= [];
			this._aCreatedStandardVariantsFor.push(sVariantManagementReference);
		}
	};

	VariantModel.prototype.setModelPropertiesForControl = function(sVariantManagementReference, bDesignTimeModeToBeSet, oControl) {
		this.oData[sVariantManagementReference].showFavorites = true;

		// this._bDesignTime is undefined initially
		var bOriginalMode = this._bDesignTimeMode;
		if (bOriginalMode !== bDesignTimeModeToBeSet) {
			this._bDesignTimeMode = bDesignTimeModeToBeSet;

			if (bDesignTimeModeToBeSet) {
				URLHandler.clearAllVariantURLParameters({model: this});
			} else if (bOriginalMode && this.oData[sVariantManagementReference].updateVariantInURL) {
				// use case: switch from end user -> key user with a restart; the initial hash data is empty
				URLHandler.update({
					parameters: URLHandler.getStoredHashParams({model: this}),
					updateURL: true,
					updateHashEntry: false,
					model: this
				});
			}
		}

		if (!(typeof this.fnManageClick === "function" && typeof this.fnManageClickRta === "function")) {
			this._initializeManageVariantsEvents();
		}
		oControl.detachManage(this.fnManageClick, this); /* attach done below */

		if (bDesignTimeModeToBeSet && this.oData[sVariantManagementReference]._isEditable) {
			// Key user adaptation settings
			this.oData[sVariantManagementReference].variantsEditable = false;

			// Properties for variant management control's internal model
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.rename = true;
				oVariant.change = true;
				oVariant.sharing = this.sharing.PUBLIC;
				oVariant.remove = isVariantValidForRemove(oVariant, sVariantManagementReference, bDesignTimeModeToBeSet);
			}.bind(this));
		} else if (this.oData[sVariantManagementReference]._isEditable) { // Personalization settings
			oControl.attachManage({
				variantManagementReference: sVariantManagementReference
			}, this.fnManageClick, this);

			this.oData[sVariantManagementReference].variantsEditable = true;

			// Properties for variant management control's internal model
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.remove = isVariantValidForRemove(oVariant, sVariantManagementReference, bDesignTimeModeToBeSet);
				// Check for end-user variant
				switch (oVariant.layer) {
					case Layer.USER:
						oVariant.rename = true;
						oVariant.change = true;
						oVariant.sharing = this.sharing.PRIVATE;
						updatePersonalVariantPropertiesWithFlpSettings(oVariant);
						break;
					case Layer.PUBLIC:
						oVariant.sharing = this.sharing.PUBLIC;
						updatePublicVariantPropertiesWithSettings(oVariant);
						break;
					default:
						oVariant.rename = false;
						oVariant.change = false;
						oVariant.sharing = this.sharing.PUBLIC;
				}
			}.bind(this));
		} else {
			this.oData[sVariantManagementReference].variantsEditable = false;
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.remove = false;
				oVariant.rename = false;
				oVariant.change = false;
			});
		}
	};

	VariantModel.prototype._initializeManageVariantsEvents = function() {
		this.fnManageClickRta = function(oEvent, oData) {
			var aConfiguredChanges = this._collectModelChanges(oData.variantManagementReference, oData.layer, oEvent);
			oData.resolve(aConfiguredChanges);
		};

		this.fnManageClick = function(oEvent, oData) {
			(async () => {
				if (!this.oFlexController || !this.getData()) {
					return;
				}
				var aConfigurationChangesContent = this._collectModelChanges(oData.variantManagementReference, Layer.USER, oEvent);

				if (aConfigurationChangesContent.some((oChange) => {
					return oChange.visible === false
					&& oChange.variantReference === this.getCurrentVariantReference(oData.variantManagementReference);
				})) {
					await this.updateCurrentVariant({
						variantManagementReference: oData.variantManagementReference,
						newVariantReference: oData.variantManagementReference
					});
				}

				var aChanges = [];
				aConfigurationChangesContent.forEach(function(oChangeProperties) {
					oChangeProperties.appComponent = this.oAppComponent;
				}.bind(this));
				aChanges = aChanges.concat(this.addVariantChanges(oData.variantManagementReference, aConfigurationChangesContent));
				this.oChangePersistence.saveDirtyChanges(this.oAppComponent, false, aChanges);
			})();
		};
	};

	function handleDirtyChanges(oFlexController, aCopiedVariantDirtyChanges, sVariantManagementReference, oAppComponent) {
		if (!this._bDesignTimeMode) {
			return oFlexController.saveSequenceOfDirtyChanges(aCopiedVariantDirtyChanges, oAppComponent)
			.then(function(oResponse) {
				if (oResponse) {
					const oResponseData = oResponse.response[0];
					const oAffectedVariant = this.oData[sVariantManagementReference].variants
					.find((oVariant) => oVariant.key === oResponseData.fileName);
					const oSupportInformation = oAffectedVariant.instance.getSupportInformation();
					oSupportInformation.user = oResponseData.support.user;
					oAffectedVariant.instance.setSupportInformation(oSupportInformation);
				}

				// TODO: as soon as the invalidation is done automatically this can be removed
				this.invalidateMap();
			}.bind(this));
		}
		return Promise.resolve();
	}

	VariantModel.prototype._handleSaveEvent = function(oEvent) {
		if (!this._bDesignTimeMode) {
			var oVariantManagementControl = oEvent.getSource();
			var mParameters = oEvent.getParameters();
			return this._handleSave(oVariantManagementControl, mParameters);
		}
		return Promise.resolve();
	};

	VariantModel.prototype._handleSave = function(oVariantManagementControl, mParameters) {
		var oAppComponent = Utils.getAppComponentForControl(oVariantManagementControl);
		var sVMReference = this.getLocalId(oVariantManagementControl.getId(), oAppComponent);
		var aNewVariantDirtyChanges;

		return executeAfterSwitch(function(sVariantManagementReference, oAppComponent, mParameters) {
			var sSourceVariantReference = this.getCurrentVariantReference(sVariantManagementReference);
			var aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
				reference: this.sFlexReference,
				vmReference: sVariantManagementReference,
				vReference: sSourceVariantReference
			});

			if (mParameters.overwrite) {
				// handle triggered "Save" button.
				// Include special handling for PUBLIC variant which requires changing of all the dirty changes to PUBLIC layer before saving.
				aNewVariantDirtyChanges = this._getDirtyChangesFromVariantChanges(aSourceVariantChanges);
				if (this.getVariant(sSourceVariantReference, sVariantManagementReference).layer === Layer.PUBLIC) {
					aNewVariantDirtyChanges.forEach((oChange) => oChange.setLayer(Layer.PUBLIC));
				}
				return this.oFlexController.saveSequenceOfDirtyChanges(
					aNewVariantDirtyChanges,
					oAppComponent
				)
				.then(function(oResponse) {
					// TODO: as soon as the invalidation is done automatically this can be removed
					this.invalidateMap();
					return oResponse;
				}.bind(this));
			}

			var sVariantLayer = mParameters.layer || (mParameters.public ? Layer.PUBLIC : Layer.USER);
			var sVariantChangeLayer = mParameters.layer || Layer.USER;

			// handle triggered "SaveAs" button
			var sNewVariantReference = mParameters.newVariantReference || Utils.createDefaultFileName("flVariant");
			var mPropertyBag = {
				variantManagementReference: sVariantManagementReference,
				appComponent: oAppComponent,
				layer: sVariantLayer,
				title: mParameters.name,
				contexts: mParameters.contexts,
				sourceVariantReference: sSourceVariantReference,
				newVariantReference: sNewVariantReference,
				generator: mParameters.generator,
				additionalVariantChanges: [],
				adaptationId: getAdaptationId(sVariantChangeLayer, oAppComponent, this.sFlexReference)
			};

			var oBaseChangeProperties = {
				content: {},
				reference: this.sFlexReference,
				generator: mPropertyBag.generator,
				layer: sVariantChangeLayer,
				adaptationId: mPropertyBag.adaptationId
			};

			if (mParameters.def) {
				var mPropertyBagSetDefault = merge({
					changeType: "setDefault",
					content: {
						defaultVariant: sNewVariantReference
					},
					fileType: "ctrl_variant_management_change",
					selector: JsControlTreeModifier.getSelector(sVariantManagementReference, mPropertyBag.appComponent)
				}, oBaseChangeProperties);
				mPropertyBag.additionalVariantChanges.push(FlexObjectFactory.createUIChange(mPropertyBagSetDefault));
			}
			if (mParameters.execute) {
				var mPropertyBagSetExecute = merge({
					changeType: "setExecuteOnSelect",
					content: {
						executeOnSelect: true
					},
					fileType: "ctrl_variant_change",
					selector: JsControlTreeModifier.getSelector(mPropertyBag.newVariantReference, mPropertyBag.appComponent)
				}, oBaseChangeProperties);
				mPropertyBag.additionalVariantChanges.push(FlexObjectFactory.createUIChange(mPropertyBagSetExecute));
			}

			return this.copyVariant(mPropertyBag)
			.then(function(aCopiedVariantDirtyChanges) {
				aNewVariantDirtyChanges = aCopiedVariantDirtyChanges;
				// unsaved changes on the source variant are removed before copied variant changes are saved
				return eraseDirtyChanges({
					changes: aSourceVariantChanges,
					vmReference: sVariantManagementReference,
					vReference: sSourceVariantReference,
					model: this
				})
				.then(handleDirtyChanges.bind(
					this,
					this.oFlexController,
					aNewVariantDirtyChanges,
					sVariantManagementReference,
					oAppComponent
				));
			}.bind(this));
		}.bind(this, sVMReference, oAppComponent, mParameters), this)
		.then(function() {
			return aNewVariantDirtyChanges;
		});
	};

	VariantModel.prototype.getLocalId = function(sId, oAppComponent) {
		return JsControlTreeModifier.getSelector(sId, oAppComponent).id;
	};

	VariantModel.prototype.getVariantManagementReferenceForControl = function(oVariantManagementControl) {
		var sControlId = oVariantManagementControl.getId();
		var oAppComponent = Utils.getAppComponentForControl(oVariantManagementControl);
		return (oAppComponent && oAppComponent.getLocalId(sControlId)) || sControlId;
	};

	VariantModel.prototype.switchToDefaultForVariantManagement = function(sVariantManagementReference) {
		if (this.oData[sVariantManagementReference].currentVariant !== this.oData[sVariantManagementReference].defaultVariant) {
			BusyIndicator.show(200);
			this.updateCurrentVariant({
				variantManagementReference: sVariantManagementReference,
				newVariantReference: this.oData[sVariantManagementReference].defaultVariant
			}).then(function() {
				BusyIndicator.hide();
			});
		}
	};

	VariantModel.prototype.switchToDefaultForVariant = function(sVariantId) {
		Object.keys(this.oData).forEach(function(sVariantManagementReference) {
			// set default variant only if passed variant id matches the current variant, or
			// if no variant id passed, set to default variant
			if (!sVariantId || this.oData[sVariantManagementReference].currentVariant === sVariantId) {
				this.switchToDefaultForVariantManagement(sVariantManagementReference);
			}
		}.bind(this));
	};

	function resolveTitleBindingsAndCreateVariantChanges(oVariantManagementControl, sVariantManagementReference) {
		this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
			// Find model and key from patterns like {i18n>TextKey} or {i18n>namespace.textkey} - only resource models are supported
			var aMatches = oVariant.title && oVariant.title.match(/{(\w+)>(\w.+)}/);
			if (aMatches) {
				var sModelName = aMatches[1];
				var sKey = aMatches[2];
				var oModel = oVariantManagementControl.getModel(sModelName);
				if (oModel) {
					var sResolvedTitle = oModel.getResourceBundle().getText(sKey);
					var mChangeProperties = {
						variantReference: oVariant.key,
						changeType: "setTitle",
						title: sResolvedTitle,
						layer: oVariant.layer,
						appComponent: this.oAppComponent
					};
					var oVariantChange = this.createVariantChange(sVariantManagementReference, mChangeProperties);
					// The change cannot be added as a dirty change but must survive a state invalidation
					VariantManagementState.addRuntimeSteadyObject(this.sFlexReference, this.oAppComponent.getId(), oVariantChange);
				} else {
					// Wait for model to be assigned and try again
					oVariantManagementControl.attachEventOnce(
						"modelContextChange",
						resolveTitleBindingsAndCreateVariantChanges.bind(this, oVariantManagementControl, sVariantManagementReference)
					);
				}
			}
		}.bind(this));
	}

	VariantModel.prototype.registerToModel = function(oVariantManagementControl) {
		const sVariantManagementReference = this.getVariantManagementReferenceForControl(oVariantManagementControl);

		// ensure standard variants are mocked, if no variants are present in the changes.variantSection response from the backend
		this._ensureStandardVariantExists(sVariantManagementReference);

		// original setting of control parameter 'editable' is needed
		this.oData[sVariantManagementReference]._isEditable = oVariantManagementControl.getEditable();

		// only attachVariantApplied will set this to true
		this.oData[sVariantManagementReference].showExecuteOnSelection = false;

		// replace bindings in titles with the resolved texts
		resolveTitleBindingsAndCreateVariantChanges.call(this, oVariantManagementControl, sVariantManagementReference);

		// attach/detach events on control
		// select event
		oVariantManagementControl.attachEvent("select", {
			vmReference: sVariantManagementReference,
			model: this
		}, variantSelectHandler);

		// save / saveAs
		oVariantManagementControl.attachSave(this._handleSaveEvent, this);

		// set model's properties specific to control's appearance
		this.setModelPropertiesForControl(sVariantManagementReference, false, oVariantManagementControl);

		// control property updateVariantInURL set initially
		const bUpdateURL = oVariantManagementControl.getUpdateVariantInURL(); // default false
		this.oData[sVariantManagementReference].updateVariantInURL = bUpdateURL;
		if (bUpdateURL) {
			URLHandler.registerControl({
				vmReference: sVariantManagementReference,
				updateURL: true,
				model: this
			});
			URLHandler.handleModelContextChange({
				model: this,
				vmControl: oVariantManagementControl
			});
		}

		if (this.oData[sVariantManagementReference].initPromise) {
			this.oData[sVariantManagementReference].initPromise.resolveFunction();
			delete this.oData[sVariantManagementReference].initPromise;
		}

		this.oData[sVariantManagementReference].init = true;

		// the initial changes are not applied via a variant switch
		// to enable early variant switches to work properly they need to wait for the initial changes
		// so the initial changes are set as a variant switch
		const mParameters = {
			appComponent: this.oAppComponent,
			reference: this.sFlexReference,
			vmReference: sVariantManagementReference
		};
		this._oVariantSwitchPromise = this._oVariantSwitchPromise.then(waitForInitialVariantChanges.bind(undefined, mParameters));
	};

	VariantModel.prototype.waitForVMControlInit = function(sVMReference) {
		if (!this.oData[sVMReference]) {
			this.oData[sVMReference] = {};
		} else if (this.oData[sVMReference].init) {
			return Promise.resolve();
		}

		this.oData[sVMReference].initPromise = {};
		this.oData[sVMReference].initPromise.promise = new Promise(function(resolve) {
			this.oData[sVMReference].initPromise.resolveFunction = resolve;
		}.bind(this));
		return this.oData[sVMReference].initPromise.promise;
	};

	/**
	 * Checks if the passed changes exist as dirty changes.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aControlChanges - Array of changes to be checked
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of filtered changes
	 * @private
	 */
	VariantModel.prototype._getDirtyChangesFromVariantChanges = function(aControlChanges) {
		var aChangeFileNames = aControlChanges.map(function(oChange) {
			return oChange.getId();
		});

		return this.oChangePersistence.getDirtyChanges().filter(function(oChange) {
			return aChangeFileNames.includes(oChange.getId()) && !oChange.getSavedToVariant();
		});
	};

	/**
	 * Returns the current variant references for the model passed as context.
	 *
	 * @returns {array} Array of current variant references
	 */
	VariantModel.prototype.getCurrentControlVariantIds = function() {
		return Object.keys(this.oData || {})
		.reduce(function(aCurrentVariants, sVariantManagementReference) {
			return aCurrentVariants.concat([this.oData[sVariantManagementReference].currentVariant]);
		}.bind(this), []);
	};

	/**
	 * Returns the IDs of the variant management controls.
	 *
	 * @returns {string[]} All IDs of the variant management controls
	 */
	VariantModel.prototype.getVariantManagementControlIds = function() {
		var sVMControlId;
		return Object.keys(this.oData || {}).reduce(function(aVMControlIds, sVariantManagementReference) {
			if (this.oAppComponent.byId(sVariantManagementReference)) {
				sVMControlId = this.oAppComponent.createId(sVariantManagementReference);
			} else {
				sVMControlId = sVariantManagementReference;
			}
			aVMControlIds.push(sVMControlId);
			return aVMControlIds;
		}.bind(this), []);
	};

	/**
	 * When the variants map is reset at runtime, this listener is called.
	 * It clears the fake standard variants and destroys the model.
	 */
	VariantModel.prototype.destroy = function() {
		// Variant dependent control changes of the current variant were added to the
		// dependency map in the VariantModel constructor and need to be removed
		const oVariantsMap = this.oDataSelector.get({ reference: this.sFlexReference });
		const aVariantDependentControlChanges = Object.entries(oVariantsMap)
		.map(([sVMReference, oVM]) => {
			const mCurrentVariant = VariantManagementState.getVariant({
				vmReference: sVMReference,
				vReference: oVM.currentVariant,
				reference: this.sFlexReference
			});
			return mCurrentVariant.controlChanges;
		})
		.flat();
		aVariantDependentControlChanges.forEach((oChange) => {
			this.oChangePersistence.removeChange(oChange);
		});

		this.oDataSelector.removeUpdateListener(this.fnUpdateListener);

		// as soon as there is a change / variant referencing a standard variant, the model is not in charge of creating the standard
		// variant anymore and it needs to be available already at an earlier point in time. Therefore the standard variant needs to
		// be added to the runtime persistence, mirroring the behavior of the InitialPrepareFunction.
		const aFakeVariantsToBeAdded = [];
		(this._aCreatedStandardVariantsFor || []).forEach((sVariantManagementReference) => {
			if (
				oVariantsMap[sVariantManagementReference]?.variants.length > 1
				|| oVariantsMap[sVariantManagementReference]?.variants[0].controlChanges.length
			) {
				aFakeVariantsToBeAdded.push(oVariantsMap[sVariantManagementReference].variants[0].instance);
			}
		});
		if (aFakeVariantsToBeAdded.length) {
			VariantManagementState.addRuntimeOnlyFlexObjects(this.sFlexReference, aFakeVariantsToBeAdded);
		}

		VariantManagementState.clearRuntimeSteadyObjects(this.sFlexReference, this.oAppComponent.getId());
		VariantManagementState.resetCurrentVariantReference(this.sFlexReference);
		JSONModel.prototype.destroy.apply(this);
	};

	/**
	 * Returns the Unified Shell service saved on the model, if available
	 *
	 * @param {string} sServiceName Name of the ushell service (e.g. "UserInfo")
	 * @returns {sap.ui.core.service.Service} The service object
	 */
	VariantModel.prototype.getUShellService = function(sServiceName) {
		return Utils.getUshellContainer() && _mUShellServices[sServiceName];
	};

	return VariantModel;
});