/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/each",
	"sap/base/util/includes",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/BusyIndicator",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/model/json/JSONModel"
], function(
	_omit,
	_isEqual,
	each,
	includes,
	isEmptyObject,
	merge,
	ObjectPath,
	Log,
	JsControlTreeModifier,
	BusyIndicator,
	Reverter,
	URLHandler,
	FlexObjectFactory,
	Switcher,
	VariantManagementState,
	VariantUtil,
	Change,
	Layer,
	LayerUtils,
	Utils,
	Settings,
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
	function _variantSelectHandler(oEvent, mPropertyBag) {
		return _setVariantModelBusy(function(mParameters, mVariantProperties) {
			var oModel = mVariantProperties.model;
			var sVMReference = mVariantProperties.vmReference;
			var bVariantSwitch = false;
			var sTargetVReference = mParameters.key;
			var sSourceVReference = mParameters.key;
			return Promise.resolve().then(function() {
				// for standard variants 'currentVariant' property is not set
				// e.g. variants generated through _ensureStandardVariantExists()
				if (
					ObjectPath.get([sVMReference, "currentVariant"], oModel.oData)
					&& oModel.oData[sVMReference].currentVariant !== oModel.oData[sVMReference].originalCurrentVariant
				) {
					sSourceVReference = oModel.oData[sVMReference].originalCurrentVariant;
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
				// 'modified' property is only set when not in UI Adaptation mode
				if (ObjectPath.get([sVMReference, "modified"], oModel.oData) === true) {
					var aControlChanges = VariantManagementState.getControlChangesForVariant({
						reference: oModel.sFlexReference,
						vmReference: sVMReference,
						vReference: sSourceVReference
					});
					return _eraseDirtyChanges({
						changes: aControlChanges,
						vmReference: sVMReference,
						vReference: sSourceVReference,
						revert: !bVariantSwitch,
						model: oModel
					}).then(function() {
						oModel.oData[sVMReference].originalCurrentVariant = sTargetVReference;
						oModel.oData[sVMReference].modified = false;
						oModel.checkUpdate(true);
					});
				}
			})
			.then(function() {
				// the variant switch already calls the listeners
				if (!bVariantSwitch) {
					oModel._callVariantSwitchListeners(sVMReference, oModel.oData[sVMReference].currentVariant);
				}
			});
		}.bind(null, oEvent.getParameters(), mPropertyBag), mPropertyBag.model, mPropertyBag.vmReference);
	}

	/**
	 * Removes passed control changes which are in DIRTY state from the variant state and flex controller.
	 * @param {object} mPropertyBag - Object with properties
	 * @param {sap.ui.fl.Change[]} mPropertyBag.changes - Array of control changes
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.vReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model instance
	 * @param {boolean} [mPropertyBag.revert] - Revert change from control
	 *
	 * @returns {Promise} Resolves when changes have been erased
	 * @private
	 */
	function _eraseDirtyChanges(mPropertyBag) {
		var aVariantDirtyChanges = mPropertyBag.model._getDirtyChangesFromVariantChanges(mPropertyBag.changes);
		aVariantDirtyChanges = aVariantDirtyChanges.reverse();

		return Promise.resolve()
			.then(function() {
				if (mPropertyBag.revert) {
					return Reverter.revertMultipleChanges(aVariantDirtyChanges, {
						appComponent: mPropertyBag.model.oAppComponent,
						modifier: JsControlTreeModifier,
						flexController: mPropertyBag.model.oFlexController
					});
				}
			})
			.then(function() {
				aVariantDirtyChanges.forEach(function(oChange) {
					// remove from variant state
					VariantManagementState.removeChangeFromVariant({
						reference: mPropertyBag.model.sFlexReference,
						change: oChange,
						vmReference: mPropertyBag.vmReference,
						vReference: mPropertyBag.vReference
					});
					// remove from change persistence map
					mPropertyBag.model.oFlexController.deleteChange(oChange, mPropertyBag.model.oAppComponent);
				});
			});
	}

	function _setBusy(oModel, sVMReference, bValue) {
		// when component is destroyed the associated variant management reference might be deleted,
		// as part of the callback in _setVariantModelBusy()
		if (bValue || oModel.oData[sVMReference]) {
			oModel.oData[sVMReference].variantBusy = bValue;
		}
		oModel.checkUpdate();
	}

	/**
	 * Executes the passed callback function when the variant model instance is not busy anymore.
	 * During the execution of the function, the variant model is again set to busy state.
	 *
	 * @param {function():Promise} fnCallback - Callback function returning a promise
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant model
	 * @param {string} sVMReference - Variant Management reference
	 * @returns {Promise} Resolves when the variant model is not busy anymore
	 * @private
	 */
	function _setVariantModelBusy(fnCallback, oModel, sVMReference) {
		// if there are multiple switches triggered very quickly this makes sure that they are being executed one after another
		oModel._oVariantSwitchPromise = oModel._oVariantSwitchPromise
		// if the previous promise error is not caught
			.catch(function() {})
			.then(_setBusy.bind(null, oModel, sVMReference, true))
			.then(fnCallback)
			.then(_setBusy.bind(null, oModel, sVMReference, false))
			.catch(function(oError) {
				_setBusy(oModel, sVMReference, false);
				throw oError;
			});
		oModel.oFlexController.setVariantSwitchPromise(oModel._oVariantSwitchPromise);
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
				this.oData[mPropertyBag.vmReference].originalCurrentVariant = mPropertyBag.newVReference;
				this.oData[mPropertyBag.vmReference].currentVariant = mPropertyBag.newVReference;
				if (this.oData[mPropertyBag.vmReference].updateVariantInURL) {
					URLHandler.updateVariantInURL({
						vmReference: mPropertyBag.vmReference,
						newVReference: mPropertyBag.newVReference,
						model: this
					});
				}

				// tell listeners that variant switch has happened
				this._callVariantSwitchListeners(mPropertyBag.vmReference, mPropertyBag.newVReference, undefined, sScenario);

				this.checkUpdate();
			}.bind(this));
	}

	function updatePersonalVariantPropertiesWithFlpSettings(oVariant) {
		Settings.getInstance().then(function (oSettings) {
			if (!oSettings.isVariantPersonalizationEnabled()) {
				oVariant.remove = false;
				oVariant.rename = false;
				oVariant.change = false;
			}
		});
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
					onAfterRendering: function () {
						resolve();
					}
				});
			}
		});
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
	 * @ui5-restricted
	 * @since 1.50
	 * @alias sap.ui.fl.variants.VariantModel
	 * @experimental Since 1.50. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var VariantModel = JSONModel.extend("sap.ui.fl.variants.VariantModel", /** @lends sap.ui.fl.variants.VariantModel.prototype */ {
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
			this.sFlexReference = this.oChangePersistence.getComponentName();
			this.oAppComponent = mPropertyBag.appComponent;
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
			this._oVariantSwitchPromise = Promise.resolve();
			this._oVariantAppliedListeners = {};

			// set variant model data

			if (isEmptyObject(oData)) {
				// TODO: To be removed in a separate change
				// try-catch added to prevent FlexState initialize checks, since many tests use fake components / fake responses
				try {
					oData = VariantManagementState.fillVariantModel({
						reference: this.sFlexReference
					});
				} catch (oError) {
					Log.error("Variants Map was not found: " + oError.message);
				}
			}

			if (oData && typeof oData === "object") {
				Object.keys(oData).forEach(function(sKey) {
					oData[sKey].variants.forEach(function(oVariant) {
						if (!oData[sKey].currentVariant && (oVariant.key === oData[sKey].defaultVariant)) { /*Case when initial variant is not set from URL*/
							oData[sKey].currentVariant = oVariant.key;
						}
						// persisting original properties, since they're changed in real time in sap.ui.fl.variants.VariantManagement
						oVariant.originalTitle = oVariant.title;
						oVariant.originalFavorite = oVariant.favorite;
						oVariant.originalExecuteOnSelect = oVariant.executeOnSelect;
						oVariant.originalVisible = oVariant.visible;
						oVariant.originalContexts = oVariant.contexts;
					});
					oData[sKey].originalCurrentVariant = oData[sKey].currentVariant;
					oData[sKey].originalDefaultVariant = oData[sKey].defaultVariant;
				});

				this.setData(oData);
			}
			VariantManagementState.addUpdateStateListener(this.sFlexReference, updateModel.bind(this));
		}
	});

	function updateModel() {
		this.checkDirtyStateForControlModels(Object.keys(this.oData || {}));
	}

	/**
	 * Gets the necessary UShell Services and initializes the URL Handler
	 * @returns {Promise} Promise resolving when the VariantModel is initialized
	 */
	VariantModel.prototype.initialize = function() {
		return Promise.resolve()
			.then(function() {
				var oUShellContainer = Utils.getUshellContainer();
				if (oUShellContainer) {
					var aServicePromises = [
						Utils.getUShellService("UserInfo"),
						Utils.getUShellService("URLParsing"),
						Utils.getUShellService("CrossApplicationNavigation"),
						Utils.getUShellService("ShellNavigation")
					];
					return Promise.all(aServicePromises)
						.then(function(aServices) {
							setUShellService("UserInfo", aServices[0]);
							setUShellService("URLParsing", aServices[1]);
							setUShellService("CrossApplicationNavigation", aServices[2]);
							setUShellService("ShellNavigation", aServices[3]);
						})
						.catch(function(vError) {
							throw new Error("Error getting service from Unified Shell: " + vError);
						});
				}
				return undefined;
			})
			.then(function() {
				//initialize hash data - variants map & model should exist at this point (set on constructor)
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
			currentVReference: this.oData[mPropertyBag.variantManagementReference].originalCurrentVariant,
			newVReference: mPropertyBag.newVariantReference,
			flexController: this.oFlexController,
			appComponent: mPropertyBag.appComponent || this.oAppComponent,
			modifier: JsControlTreeModifier,
			reference: this.sFlexReference
		};

		if (mPropertyBag.internallyCalled) {
			return switchVariantAndUpdateModel.call(this, mProperties, mPropertyBag.scenario);
		}
		return _setVariantModelBusy(switchVariantAndUpdateModel.bind(this, mProperties, mPropertyBag.scenario), this, mPropertyBag.variantManagementReference);
	};

	/**
	 * Returns the current variant for a given variant management control.
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @returns {string} Current variant reference
	 * @public
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
		return VariantManagementState.getVariant({
			reference: this.sFlexReference,
			vmReference: sVariantManagementReference || this.getVariantManagementReference(sVariantReference).variantManagementReference,
			vReference: sVariantReference
		});
	};

	/**
	 * Searches for the variant and returns the current title.
	 *
	 * @param {string} sVariantReference - Variant reference
	 * @param {string} sVMReference - Variant management reference
	 * @returns {string} Title of the variant
	 */
	VariantModel.prototype.getVariantTitle = function(sVariantReference, sVMReference) {
		var sTitle = "";
		this.oData[sVMReference].variants.some(function(oVariantData) {
			if (oVariantData.key === sVariantReference) {
				sTitle = oVariantData.title;
				return true;
			}
		});
		return sTitle;
	};

	function handleInitialLoadScenario(sVMReference, oVariantManagementControl) {
		var oVariantChangesForVariant = VariantManagementState.getVariantChangesForVariant({
			vmReference: sVMReference,
			reference: this.sFlexReference
		});
		var sCurrentVariantReference = this.oData[sVMReference].currentVariant;
		var sDefaultVariantReference = this.oData[sVMReference].defaultVariant;
		if (
			oVariantManagementControl.getExecuteOnSelectionForStandardDefault()
			&& sCurrentVariantReference === sDefaultVariantReference
			&& sCurrentVariantReference === sVMReference
			&& !oVariantChangesForVariant.setExecuteOnSelect
		) {
			var oVariant = VariantManagementState.getVariant({
				reference: this.sFlexReference,
				vmReference: sVMReference,
				vReference: sVMReference
			});
			// set executeOnSelect in model and State without creating a change
			oVariant.instance.setExecuteOnSelection(true);
			this.oData[sVMReference].variants[0].originalExecuteOnSelect = true;
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
		var oVariantManagementControl = sap.ui.getCore().byId(mPropertyBag.vmControlId);
		var sVMReference = this.getVariantManagementReferenceForControl(oVariantManagementControl);

		return this.waitForVMControlInit(sVMReference).then(function(sVMReference, mPropertyBag) {
			if (!this._oVariantAppliedListeners[sVMReference]) {
				this._oVariantAppliedListeners[sVMReference] = {};
			}

			var bInitialLoad = handleInitialLoadScenario.call(this, sVMReference, oVariantManagementControl);

			// if the parameter callAfterInitialVariant or initialLoad is true call the function without check
			if (mPropertyBag.callAfterInitialVariant || bInitialLoad) {
				var mParameters = {
					appComponent: this.oAppComponent,
					reference: this.sFlexReference,
					vmReference: sVMReference,
					flexController: this.oFlexController
				};
				VariantManagementState.waitForInitialVariantChanges(mParameters).then(function() {
					var sCurrentVariantReference = VariantManagementState.getCurrentVariantReference({
						vmReference: sVMReference,
						reference: this.sFlexReference
					});
					this._callVariantSwitchListeners(sVMReference, sCurrentVariantReference, mPropertyBag.callback);
				}.bind(this));
			}

			// first check if the passed vmControlId is correct, then save the callback
			// for this check the control has to be in the control tree already
			return waitForControlToBeRendered(mPropertyBag.control).then(function() {
				if (VariantUtil.getRelevantVariantManagementControlId(mPropertyBag.control, this.getVariantManagementControlIds()) === mPropertyBag.vmControlId) {
					this.oData[sVMReference].showExecuteOnSelection = true;
					this.checkUpdate(true);
					this._oVariantAppliedListeners[sVMReference][mPropertyBag.control.getId()] = mPropertyBag.callback;
				} else {
					Log.error("Error in attachVariantApplied: The passed VariantManagement ID does not match the responsible VariantManagement control");
				}
			}.bind(this));
		}.bind(this, sVMReference, mPropertyBag));
	};

	VariantModel.prototype._callVariantSwitchListeners = function(sVMReference, sNewVariantReference, fnCallback, sScenario) {
		if (this._oVariantAppliedListeners[sVMReference]) {
			var oVariant;
			this.oData[sVMReference].variants.some(function(oCurrentVariant) {
				if (oCurrentVariant.key === sNewVariantReference) {
					oVariant = merge({}, oCurrentVariant);
					return true;
				}
			});
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
		var sVMReference = this.getVariantManagementReferenceForControl(sap.ui.getCore().byId(sVMControlId));
		if (this._oVariantAppliedListeners[sVMReference]) {
			delete this._oVariantAppliedListeners[sVMReference][sControlId];
		}
	};

	VariantModel.prototype.addChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
		//*marker for VariantManagement control
		if (oChange.getState() === Change.states.NEW) {
			this.oData[sVariantManagementReference].modified = true;
		}
		this.checkUpdate(true);
		return VariantManagementState.addChangeToVariant({
			reference: this.sFlexReference,
			change: oChange,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference
		});
	};

	VariantModel.prototype.removeChange = function(oChange) {
		var sVariantReference = oChange.getVariantReference();
		var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
		var bRemoved = VariantManagementState.removeChangeFromVariant({
			reference: this.sFlexReference,
			change: oChange,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference
		});
		this.checkDirtyStateForControlModels([sVariantManagementReference]);
		return bRemoved;
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
			reference: oSourceVariant.getFlexObjectMetadata().reference,
			generator: mPropertyBag.generator,
			variantManagementReference: mPropertyBag.variantManagementReference
		};
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
		var oDuplicateChangeContent;
		oDuplicateVariant.controlChanges = aVariantChanges.reduce(function(aSameLayerChanges, oChange) {
			// copy all changes in the same layer and higher layers (PUBLIC variant can copy USER layer changes)
			if (LayerUtils.compareAgainstCurrentLayer(oChange.layer, mPropertyBag.layer) >= 0) {
				oDuplicateChangeData = merge({}, oChange);
				// ensure that the layer is set to the current variants (USER may becomes PUBLIC)
				oDuplicateChangeData.layer = mPropertyBag.layer;
				oDuplicateChangeData.variantReference = oDuplicateVariant.instance.getId();
				if (!oDuplicateChangeData.support) {
					oDuplicateChangeData.support = {};
				}
				oDuplicateChangeData.support.sourceChangeFileName = oChange.fileName;
				// For new change instances the package name needs to be reset to $TMP, BCP: 1870561348
				oDuplicateChangeData.packageName = "$TMP";
				oDuplicateChangeContent = Change.createInitialFileContent(oDuplicateChangeData);
				aSameLayerChanges.push(new Change(oDuplicateChangeContent));
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
		var oVariantModelData = {
			key: oDuplicateVariantData.instance.getId(),
			layer: mPropertyBag.layer,
			title: oDuplicateVariantData.instance.getName(),
			originalTitle: oDuplicateVariantData.instance.getName(),
			originalExecuteOnSelect: oDuplicateVariantData.instance.getExecuteOnSelection(),
			executeOnSelect: false,
			favorite: true,
			originalFavorite: true,
			rename: true,
			change: true,
			remove: true,
			visible: true,
			originalVisible: true,
			sharing: mPropertyBag.layer === Layer.USER ? this.sharing.PRIVATE : this.sharing.PUBLIC,
			originalContexts: oDuplicateVariantData.instance.getContexts(),
			contexts: oDuplicateVariantData.instance.getContexts()
		};

		// sets copied variant and associated changes as dirty
		var aChanges = [];
		[oDuplicateVariantData.instance].concat(oDuplicateVariantData.controlChanges).forEach(function(oChange) {
			aChanges.push(this.oChangePersistence.addDirtyChange(oChange));
		}.bind(this));

		// adds variant to variants map
		var iIndex = VariantManagementState.addVariantToVariantManagement({
			variantData: oDuplicateVariantData,
			reference: this.sFlexReference,
			vmReference: mPropertyBag.variantManagementReference
		});

		// Variant Model
		this.oData[mPropertyBag.variantManagementReference].variants.splice(iIndex, 0, oVariantModelData);
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
			// Variants State
			var iIndex = VariantManagementState.removeVariantFromVariantManagement({
				reference: this.sFlexReference,
				variant: mPropertyBag.variant,
				vmReference: mPropertyBag.variantManagementReference
			});
			// Variant Model
			this.oData[mPropertyBag.variantManagementReference].variants.splice(iIndex, 1);
			this.checkUpdate();

			// Change Persistence
			aChangesToBeDeleted.forEach(function(oChange) {
				this.oChangePersistence.deleteChange(oChange);
			}.bind(this));
		}.bind(this));
	};

	VariantModel.prototype.collectModelChanges = function(sVariantManagementReference, sLayer) {
		var oData = this.getData()[sVariantManagementReference];
		var aModelVariants = oData.variants;
		var aChanges = [];
		var mPropertyBag = {};

		aModelVariants.forEach(function(oVariant) {
			if (oVariant.originalTitle !== oVariant.title) {
				mPropertyBag = {
					variantReference: oVariant.key,
					changeType: "setTitle",
					title: oVariant.title,
					originalTitle: oVariant.originalTitle,
					layer: sLayer
				};
				aChanges.push(mPropertyBag);
			}
			if (oVariant.originalFavorite !== oVariant.favorite) {
				mPropertyBag = {
					variantReference: oVariant.key,
					changeType: "setFavorite",
					favorite: oVariant.favorite,
					originalFavorite: oVariant.originalFavorite,
					layer: sLayer
				};
				aChanges.push(mPropertyBag);
			}
			if (oVariant.originalExecuteOnSelect !== oVariant.executeOnSelect) {
				mPropertyBag = {
					variantReference: oVariant.key,
					changeType: "setExecuteOnSelect",
					executeOnSelect: oVariant.executeOnSelect,
					originalExecuteOnSelect: oVariant.originalExecuteOnSelect,
					layer: sLayer
				};
				aChanges.push(mPropertyBag);
			}
			if (!oVariant.visible && oVariant.originalVisible) {
				mPropertyBag = {
					variantReference: oVariant.key,
					changeType: "setVisible",
					visible: false,
					layer: sLayer
				};
				aChanges.push(mPropertyBag);
			}
			if (!_isEqual(oVariant.originalContexts, oVariant.contexts)) {
				mPropertyBag = {
					variantReference: oVariant.key,
					changeType: "setContexts",
					layer: sLayer,
					contexts: oVariant.contexts,
					originalContexts: oVariant.originalContexts
				};
				aChanges.push(mPropertyBag);
			}
		});
		if (oData.originalDefaultVariant !== oData.defaultVariant) {
			mPropertyBag = {
				variantManagementReference: sVariantManagementReference,
				changeType: "setDefault",
				defaultVariant: oData.defaultVariant,
				originalDefaultVariant: oData.originalDefaultVariant,
				layer: sLayer
			};
			aChanges.push(mPropertyBag);
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
	 * @returns {Promise} Promise which resolves when "manage" event is fired from the variant management control
	 * @public
	 */
	VariantModel.prototype.manageVariants = function(oVariantManagementControl, sVariantManagementReference, sLayer, sClass, oContextSharingComponentPromise) {
		// called from the ControlVariant plugin in Adaptation mode
		return new Promise(function(resolve) {
			oVariantManagementControl.attachEventOnce("manage", {
				resolve: resolve,
				variantManagementReference: sVariantManagementReference,
				layer: sLayer
			}, this.fnManageClickRta, this);
			oVariantManagementControl.openManagementDialog(true, sClass, oContextSharingComponentPromise);
		}.bind(this));
	};

	/**
	 * Sets the variant properties and adds a variant change
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @returns {sap.fl.Change} Created Change object
	 */
	VariantModel.prototype.addVariantChange = function(sVariantManagementReference, mPropertyBag) {
		var mAdditionalChangeContent = this.setVariantProperties(sVariantManagementReference, mPropertyBag);

		var mNewChangeData = {};
		var mUpdateVariantsStateParams = {
			vmReference: sVariantManagementReference,
			add: true,
			reference: this.sFlexReference
		};

		//create new change object
		mNewChangeData.changeType = mPropertyBag.changeType;
		mNewChangeData.layer = mPropertyBag.layer;
		mNewChangeData.generator = mPropertyBag.generator;

		if (mPropertyBag.changeType === "setDefault") {
			mNewChangeData.fileType = "ctrl_variant_management_change";
			mNewChangeData.selector = JsControlTreeModifier.getSelector(sVariantManagementReference, mPropertyBag.appComponent);
		} else {
			mNewChangeData.fileType = "ctrl_variant_change";
			mNewChangeData.selector = JsControlTreeModifier.getSelector(mPropertyBag.variantReference, mPropertyBag.appComponent);
		}

		var oChange = this.oFlexController.createBaseChange(mNewChangeData, mPropertyBag.appComponent);
		//update change with additional content
		oChange.setContent(mAdditionalChangeContent);
		if (mPropertyBag.changeType === "setTitle") {
			oChange.setText("title", mPropertyBag.title, "XFLD");
		}

		mUpdateVariantsStateParams.changeContent = oChange.convertToFileContent();
		//update variants state and write change to ChangePersistence
		VariantManagementState.updateChangesForVariantManagementInMap(mUpdateVariantsStateParams);
		this.oChangePersistence.addDirtyChange(oChange);

		return oChange;
	};

	/**
	 * Sets the variant properties and deletes a variant change
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.fl.Change} oChange - Variant change to be deleted
	 */
	VariantModel.prototype.deleteVariantChange = function(sVariantManagementReference, mPropertyBag, oChange) {
		var mUpdateVariantsStateParams = {
			vmReference: sVariantManagementReference,
			add: false,
			reference: this.sFlexReference,
			changeContent: undefined
		};

		this.setVariantProperties(sVariantManagementReference, mPropertyBag, true);
		mUpdateVariantsStateParams.changeContent = oChange.convertToFileContent();
		//update variants state and write change to ChangePersistence
		VariantManagementState.updateChangesForVariantManagementInMap(mUpdateVariantsStateParams);
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
	 * @returns {object} Additional content for change creation
	 * @public
	 */
	VariantModel.prototype.setVariantProperties = function(sVariantManagementReference, mPropertyBag, bUpdateCurrentVariant) {
		// TODO: this function needs refactoring
		var iVariantIndex = -1;
		var oVariant;
		var oData = this.getData();
		var oVariantInstance = this.getVariant(mPropertyBag.variantReference, sVariantManagementReference).instance;

		if (mPropertyBag.variantReference) {
			iVariantIndex = this.getVariantManagementReference(mPropertyBag.variantReference).variantIndex;
			oVariant = oData[sVariantManagementReference].variants[iVariantIndex];
		}
		var mAdditionalChangeContent = {};

		switch (mPropertyBag.changeType) {
			case "setTitle":
				mAdditionalChangeContent.title = mPropertyBag.title;
				//Update Variant Model
				oVariant.title = mPropertyBag.title;
				oVariant.originalTitle = oVariant.title;
				oVariantInstance.setName(mPropertyBag.title, true);
				break;
			case "setFavorite":
				mAdditionalChangeContent.favorite = mPropertyBag.favorite;
				//Update Variant Model
				oVariant.favorite = mPropertyBag.favorite;
				oVariant.originalFavorite = oVariant.favorite;
				oVariantInstance.setFavorite(mPropertyBag.favorite);
				break;
			case "setExecuteOnSelect":
				mAdditionalChangeContent.executeOnSelect = mPropertyBag.executeOnSelect;
				//Update Variant Model
				oVariant.executeOnSelect = mPropertyBag.executeOnSelect;
				oVariant.originalExecuteOnSelect = oVariant.executeOnSelect;
				oVariantInstance.setExecuteOnSelection(mPropertyBag.executeOnSelect);
				break;
			case "setVisible":
				mAdditionalChangeContent.visible = mPropertyBag.visible;
				mAdditionalChangeContent.createdByReset = false; // 'createdByReset' is used by the backend to distinguish between setVisible change created via reset and delete
				//Update Variant Model
				oVariant.visible = mPropertyBag.visible;
				oVariant.originalVisible = oVariant.visible;
				oVariantInstance.setVisible(mPropertyBag.visible);
				break;
			case "setContexts":
				mAdditionalChangeContent.contexts = mPropertyBag.contexts;
				//Update Variant Model
				oVariant.contexts = mPropertyBag.contexts;
				oVariant.originalContexts = mPropertyBag.contexts;
				oVariantInstance.setContexts(mPropertyBag.contexts);
				break;
			case "setDefault":
				mAdditionalChangeContent.defaultVariant = mPropertyBag.defaultVariant;
				//Update Variant Model
				oData[sVariantManagementReference].defaultVariant = mPropertyBag.defaultVariant;
				oData[sVariantManagementReference].originalDefaultVariant = oData[sVariantManagementReference].defaultVariant;
				//Update hash data
				var aHashParameters = URLHandler.getStoredHashParams({model: this});
				if (aHashParameters) {
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

				if (bUpdateCurrentVariant && oData[sVariantManagementReference].currentVariant !== mPropertyBag.defaultVariant) {
					this.updateCurrentVariant({
						variantManagementReference: sVariantManagementReference,
						newVariantReference: mPropertyBag.defaultVariant,
						appComponent: mPropertyBag.appComponent
					});
				}
				break;
			default:
				break;
		}

		var oVariantContent = VariantManagementState.getContent(this.sFlexReference);
		if (iVariantIndex > -1) {
			// set data in variants map - which returns the variant index
			var iSortedIndex = VariantManagementState.setVariantData({
				variantData: mAdditionalChangeContent,
				vmReference: sVariantManagementReference,
				previousIndex: iVariantIndex,
				reference: this.sFlexReference
			});
			// modify data variable
			oData[sVariantManagementReference].variants.splice(iVariantIndex, 1);
			oData[sVariantManagementReference].variants.splice(iSortedIndex, 0, oVariant);
		} else if (oVariantContent[sVariantManagementReference]) {
			// for 'setDefault'
			oVariantContent[sVariantManagementReference].defaultVariant = mPropertyBag.defaultVariant;
		}

		// set data to variant model
		this.setData(oData);
		this.checkUpdate(true);

		return mAdditionalChangeContent;
	};

	VariantModel.prototype._ensureStandardVariantExists = function(sVariantManagementReference) {
		// variant model data
		var oData = this.getData();
		var oVMDataSection = oData[sVariantManagementReference] || {};
		var oVMDataSectionWithoutInit = _omit(oVMDataSection, ["initPromise"]);
		if (!oData[sVariantManagementReference] || isEmptyObject(oVMDataSectionWithoutInit)) { // Ensure standard variant exists
			// Standard Variant should always contain the value: "SAP" in "author" / "Created by" field

			// Set Standard Data to VariantModel
			oData[sVariantManagementReference] = merge(oVMDataSection, {
				currentVariant: sVariantManagementReference,
				originalCurrentVariant: sVariantManagementReference,
				defaultVariant: sVariantManagementReference,
				originalDefaultVariant: sVariantManagementReference,
				variants: [
					{
						key: sVariantManagementReference,
						title: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
						originalTitle: this._oResourceBundle.getText("STANDARD_VARIANT_ORIGINAL_TITLE"),
						favorite: true,
						originalFavorite: true,
						executeOnSelect: false,
						originalExecuteOnSelect: false,
						visible: true,
						originalVisible: true,
						contexts: {},
						originalContexts: {},
						author: VariantUtil.DEFAULT_AUTHOR
					}
				]
			});
			this.setData(oData);

			// variants state
			var oStandardVariant = {};
			oStandardVariant[sVariantManagementReference] = {
				defaultVariant: sVariantManagementReference,
				variantManagementChanges: {},
				variants: [
					{
						instance: FlexObjectFactory.createFlVariant({
							id: sVariantManagementReference,
							variantManagementReference: sVariantManagementReference,
							variantName: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
							user: VariantUtil.DEFAULT_AUTHOR,
							reference: this.sFlexReference
						}),
						controlChanges: [],
						variantChanges: {}
					}
				]
			};

			// TODO: To be removed in a separate change
			// try-catch added to prevent FlexState initialize checks, since many tests use fake components / fake responses
			try {
				VariantManagementState.addFakeStandardVariant(this.sFlexReference, this.oAppComponent.getId(), oStandardVariant);
			} catch (oError) {
				Log.error("Variants Map was not found: " + oError.message);
			}
		}
	};

	VariantModel.prototype.setModelPropertiesForControl = function(sVariantManagementReference, bDesignTimeModeToBeSet, oControl) {
		this.oData[sVariantManagementReference].modified = false;
		this.oData[sVariantManagementReference].showFavorites = true;

		// this._bDesignTime is undefined initially
		var bOriginalMode = this._bDesignTimeMode;
		if (bOriginalMode !== bDesignTimeModeToBeSet) {
			this._bDesignTimeMode = bDesignTimeModeToBeSet;

			if (bDesignTimeModeToBeSet) {
				URLHandler.clearAllVariantURLParameters({model: this});
			} else if (bOriginalMode) {
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
						var oUser = this._oUserInfoService && this._oUserInfoService.getUser();
						var bUserIsAuthorized = !oUser || oUser.getId().toUpperCase() === oVariant.author.toUpperCase() || Settings.getInstanceOrUndef().isKeyUser();
						oVariant.remove = bUserIsAuthorized;
						oVariant.rename = bUserIsAuthorized;
						oVariant.change = bUserIsAuthorized;
						oVariant.sharing = this.sharing.PUBLIC;
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
			var aConfiguredChanges = this.collectModelChanges(oData.variantManagementReference, oData.layer);
			oData.resolve(aConfiguredChanges);
		};

		this.fnManageClick = function(oEvent, oData) {
			if (!this.oFlexController || !VariantManagementState.getContent(this.sFlexReference)) {
				return;
			}
			var aConfigurationChangesContent = this.collectModelChanges(oData.variantManagementReference, Layer.USER);
			var aChanges = [];
			aConfigurationChangesContent.forEach(function(oChangeProperties) {
				oChangeProperties.appComponent = this.oAppComponent;
				aChanges.push(this.addVariantChange(oData.variantManagementReference, oChangeProperties));
			}.bind(this));
			this.oChangePersistence.saveDirtyChanges(this.oAppComponent, false, aChanges);
		};
	};

	function handleDirtyChanges(oFlexController, aCopiedVariantDirtyChanges, sVariantManagementReference, oAppComponent) {
		if (!this._bDesignTimeMode) {
			return oFlexController.saveSequenceOfDirtyChanges(aCopiedVariantDirtyChanges, oAppComponent)
				.then(function(oResponse) {
					if (oResponse) {
						var oResponseData = oResponse.response[0];
						this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
							if (oVariant.key === oResponseData.fileName) {
								oVariant.author = oResponseData.support.user;
							}
						});
					}
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

		return _setVariantModelBusy(function(sVariantManagementReference, oAppComponent, mParameters) {
			var bSetDefault = mParameters.def;
			var bSetExecuteOnSelect = mParameters.execute;

			var sSourceVariantReference = this.getCurrentVariantReference(sVariantManagementReference);
			var aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
				reference: this.sFlexReference,
				vmReference: sVariantManagementReference,
				vReference: sSourceVariantReference
			});

			if (mParameters.overwrite) {
				// handle triggered "Save" button
				return this.oFlexController.saveSequenceOfDirtyChanges(this._getDirtyChangesFromVariantChanges(aSourceVariantChanges), oAppComponent);
			}

			var sVariantLayer = mParameters.layer || (mParameters.public ? Layer.PUBLIC : Layer.USER);
			var sVariantChangeLayer = mParameters.layer || Layer.USER;

			// handle triggered "SaveAs" button
			var sNewVariantReference = mParameters.newVariantReference || Utils.createDefaultFileName();
			var mPropertyBag = {
				variantManagementReference: sVariantManagementReference,
				appComponent: oAppComponent,
				layer: sVariantLayer,
				title: mParameters.name,
				contexts: mParameters.contexts,
				sourceVariantReference: sSourceVariantReference,
				newVariantReference: sNewVariantReference,
				generator: mParameters.generator
			};

			return this.copyVariant(mPropertyBag)
				.then(function(aCopiedVariantDirtyChanges) {
					if (bSetDefault) {
						var mPropertyBagSetDefault = {
							changeType: "setDefault",
							defaultVariant: sNewVariantReference,
							originalDefaultVariant: this.oData[sVariantManagementReference].defaultVariant,
							appComponent: oAppComponent,
							layer: sVariantChangeLayer,
							variantManagementReference: sVariantManagementReference
						};
						var oSetDefaultChange = this.addVariantChange(sVariantManagementReference, mPropertyBagSetDefault);
						aCopiedVariantDirtyChanges.push(oSetDefaultChange);
					}
					if (bSetExecuteOnSelect) {
						var mPropertyBagSetExecute = {
							changeType: "setExecuteOnSelect",
							executeOnSelect: true,
							variantReference: sNewVariantReference,
							appComponent: oAppComponent,
							layer: sVariantChangeLayer,
							variantManagementReference: sVariantManagementReference
						};
						var oSetExecuteChange = this.addVariantChange(sVariantManagementReference, mPropertyBagSetExecute);
						aCopiedVariantDirtyChanges.push(oSetExecuteChange);
					}
					aNewVariantDirtyChanges = aCopiedVariantDirtyChanges;
					// unsaved changes on the source variant are removed before copied variant changes are saved
					return _eraseDirtyChanges({
						changes: aSourceVariantChanges,
						vmReference: sVariantManagementReference,
						vReference: sSourceVariantReference,
						model: this
					})
						.then(handleDirtyChanges.bind(this, this.oFlexController, aCopiedVariantDirtyChanges, sVariantManagementReference, oAppComponent));
				}.bind(this));
		}.bind(this, sVMReference, oAppComponent, mParameters), this, sVMReference)
			.then(function() {
				this.oData[sVMReference].modified = false;
				this.checkUpdate(true);
				return aNewVariantDirtyChanges;
			}.bind(this));
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

	VariantModel.prototype.registerToModel = function(oVariantManagementControl) {
		var sVariantManagementReference = this.getVariantManagementReferenceForControl(oVariantManagementControl);

		// ensure standard variants are mocked, if no variants are present in the changes.variantSection response from the backend
		this._ensureStandardVariantExists(sVariantManagementReference);

		// original setting of control parameter 'editable' is needed
		this.oData[sVariantManagementReference]._isEditable = oVariantManagementControl.getEditable();

		// only attachVariantApplied will set this to true
		this.oData[sVariantManagementReference].showExecuteOnSelection = false;

		// attach/detach events on control
		// select event
		oVariantManagementControl.attachEvent("select", {
			vmReference: sVariantManagementReference,
			model: this
		}, _variantSelectHandler);

		// save / saveAs
		oVariantManagementControl.attachSave(this._handleSaveEvent, this);

		// set model's properties specific to control's appearance
		this.setModelPropertiesForControl(sVariantManagementReference, false, oVariantManagementControl);

		//control property updateVariantInURL set initially
		var sUpdateURL = oVariantManagementControl.getUpdateVariantInURL(); // default false
		this.oData[sVariantManagementReference].updateVariantInURL = sUpdateURL;
		URLHandler.registerControl({
			vmReference: sVariantManagementReference,
			updateURL: !!sUpdateURL,
			model: this
		});
		URLHandler.handleModelContextChange({
			model: this,
			vmControl: oVariantManagementControl
		});

		if (this.oData[sVariantManagementReference].initPromise) {
			this.oData[sVariantManagementReference].initPromise.resolveFunction();
			delete this.oData[sVariantManagementReference].initPromise;
		}

		this.oData[sVariantManagementReference].init = true;
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
	 * @param {sap.ui.fl.Change[]} aControlChanges - Array of changes to be checked
	 * @returns {sap.ui.fl.Change[]} Array of filtered changes
	 * @private
	 */
	VariantModel.prototype._getDirtyChangesFromVariantChanges = function(aControlChanges) {
		var aChangeFileNames = aControlChanges.map(function(oChange) {
			return oChange.getId();
		});

		return this.oChangePersistence.getDirtyChanges().filter(function(oChange) {
			return includes(aChangeFileNames, oChange.getId()) && !oChange.assignedToVariant;
		});
	};

	/**
	 * Checks if dirty changes exist for the current variant inside the passed variant management reference.
	 * If no dirty changes exist, it marks the associated 'modified' model property to <code>false</code>.
	 * @param {string[]} aVariantManagementReferences - Array of variant management references
	 * @public
	 */
	VariantModel.prototype.checkDirtyStateForControlModels = function(aVariantManagementReferences) {
		aVariantManagementReferences.forEach(function(sVariantManagementReference) {
			var mVariantManagementModelData = this.oData[sVariantManagementReference];
			var sCurrentVariantReference = this.getCurrentVariantReference(sVariantManagementReference);
			var aCurrentVariantControlChanges = VariantManagementState.getControlChangesForVariant({
				reference: this.sFlexReference,
				vmReference: sVariantManagementReference,
				vReference: sCurrentVariantReference
			});
			var aDirtyCurrentVariantChanges = this._getDirtyChangesFromVariantChanges(aCurrentVariantControlChanges);

			mVariantManagementModelData.modified = aDirtyCurrentVariantChanges.length > 0;
		}.bind(this));
		this.checkUpdate(true);
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
	 * It clear the faked standard variants and destroys the model.
	 */
	VariantModel.prototype.destroy = function() {
		VariantManagementState.clearFakedStandardVariants(this.sFlexReference, this.oAppComponent.getId());
		VariantManagementState.removeUpdateStateListener(this.sFlexReference);
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