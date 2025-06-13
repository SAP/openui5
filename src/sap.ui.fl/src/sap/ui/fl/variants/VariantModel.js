/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_difference",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/restricted/_omit",
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/m/library"
], function(
	_difference,
	_isEqual,
	_omit,
	each,
	isEmptyObject,
	merge,
	Log,
	JsControlTreeModifier,
	BusyIndicator,
	Element,
	Lib,
	URLHandler,
	VariantUtil,
	FlexObjectFactory,
	DependencyHandler,
	Switcher,
	VariantManagementState,
	FlexObjectState,
	ManifestUtils,
	Settings,
	Layer,
	LayerUtils,
	Utils,
	JSONModel,
	BindingMode,
	mobileLibrary
) {
	"use strict";

	var _mUShellServices = {};
	const { SharingMode } = mobileLibrary;
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
		if (oSettings && !oSettings.getIsVariantPersonalizationEnabled()) {
			oVariant.remove = false;
			oVariant.rename = false;
			oVariant.change = false;
		}
	}

	function updatePublicVariantPropertiesWithSettings(oVariant) {
		var oSettings = Settings.getInstanceOrUndef();
		var bUserIsAuthorized = oSettings &&
			(oSettings.getIsKeyUser() || !oSettings.getUserId() ||
			(oSettings.getIsPublicFlVariantEnabled() && oSettings.getUserId().toUpperCase() === oVariant.instance.getSupportInformation().user.toUpperCase()));
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
				PRIVATE: SharingMode.Private,
				PUBLIC: SharingMode.Public
			};

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
		const oNewVariantsMap = this.oDataSelector.get({ reference: this.sFlexReference });
		const oCurrentData = { ...this.getData() };
		Object.entries(oNewVariantsMap).forEach(function(aVariants) {
			const sVariantManagementKey = aVariants[0];
			const oVariantMapEntry = { ...aVariants[1] };
			oCurrentData[sVariantManagementKey] ||= {};
			oCurrentData[sVariantManagementKey].variants = oVariantMapEntry.variants.map(function(oVariant) {
				const oCurrentVariantData = (oCurrentData[sVariantManagementKey].variants || [])
				.find(function(oVariantToCheck) {
					return oVariantToCheck.key === oVariant.key;
				});
				return { ...(oCurrentVariantData || {}), ...oVariant };
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
		var aVariantChangesForVariant = VariantManagementState.getVariantChangesForVariant({
			vmReference: sVMReference,
			reference: this.sFlexReference
		});
		var sDefaultVariantReference = this.oData[sVMReference].defaultVariant;
		if (
			oVariantManagementControl.getExecuteOnSelectionForStandardDefault()
			&& sDefaultVariantReference === sVMReference
			&& !aVariantChangesForVariant.some((oVariantChange) => oVariantChange.getChangeType() === "setExecuteOnSelect")
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
			variantManagementReference: mPropertyBag.variantManagementReference,
			executeOnSelection: mPropertyBag.executeOnSelection
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

	VariantModel.prototype._collectModelChanges = function(sVariantManagementReference, sLayer, oEvent) {
		const oData = this.getData()[sVariantManagementReference];
		const aModelVariants = oData.variants;
		const aChanges = [];
		const oSettings = Settings.getInstanceOrUndef();
		const aVariantsToBeDeleted = [];

		const findVariant = (sVariantKey) => {
			return aModelVariants.find((oModelVariant) => oModelVariant.key === sVariantKey);
		};

		const fnAddPreparedChange = (oVariant, sChangeType, mChangeData) => {
			// layer can be PUBLIC for setTitle, setExecuteOnSelect or setVisible, but never for setFavorite, setDefault or setContexts
			const bSupportsPublicChange = ["setTitle", "setExecuteOnSelect", "setVisible"].includes(sChangeType);
			const sChangeLayer = (
				bSupportsPublicChange
				&& oSettings?.getIsPublicFlVariantEnabled()
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
			aVariantsToBeDeleted.push(sVariantKey);
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

		return {
			changes: aChanges,
			variantsToBeDeleted: aVariantsToBeDeleted
		};
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

	// TODO refactor to use standard functions, not functions bound to the model instance that need to be initialized
	VariantModel.prototype._initializeManageVariantsEvents = function() {
		this.fnManageClickRta = function(oEvent, oData) {
			const oModelChanges = this._collectModelChanges(oData.variantManagementReference, oData.layer, oEvent);
			oData.resolve(oModelChanges);
		};

		this.fnManageClick = function(oEvent, oData) {
			sap.ui.require(["sap/ui/fl/variants/VariantManager"], function(VariantManager) {
				VariantManager.handleManageEvent(oEvent, oData, this);
			}.bind(this));
		};
	};

	VariantModel.prototype._handleSaveEvent = function(oEvent) {
		if (!this._bDesignTimeMode) {
			var oVariantManagementControl = oEvent.getSource();
			var mParameters = oEvent.getParameters();
			sap.ui.require(["sap/ui/fl/variants/VariantManager"], function(VariantManager) {
				VariantManager.handleSaveEvent(oVariantManagementControl, mParameters, this);
			}.bind(this));
		}
	};

	function variantSelectHandler(oEvent, mPropertyBag) {
		sap.ui.require(["sap/ui/fl/variants/VariantManager"], function(VariantManager) {
			VariantManager.handleSelectVariant(oEvent, mPropertyBag);
		});
	}

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
			// Find model and key from patterns like {i18n>TextKey} or {i18n>namespace.TextKey} - only resource models are supported
			const aMatches = oVariant.title && oVariant.title.match(/{(\w+)>(\w.+)}/);
			if (aMatches) {
				const [, sModelName, sKey] = aMatches;
				const oModel = oVariantManagementControl.getModel(sModelName);
				if (oModel) {
					const sResolvedTitle = oModel.getResourceBundle().getText(sKey);
					const mChangeProperties = {
						reference: this.sFlexReference,
						changeType: "setTitle",
						layer: oVariant.layer,
						fileType: "ctrl_variant_change",
						variantId: oVariant.key
					};
					const oSetTitleChange = FlexObjectFactory.createVariantChange(mChangeProperties);
					oSetTitleChange.setText("title", sResolvedTitle, "XFLD");
					oVariant.instance.setName(sResolvedTitle, true);
					// The change cannot be added as a dirty change but must survive a state invalidation
					VariantManagementState.addRuntimeSteadyObject(this.sFlexReference, this.oAppComponent.getId(), oSetTitleChange);
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

		return FlexObjectState.getDirtyFlexObjects(this.sFlexReference).filter(function(oChange) {
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
		const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(this.sFlexReference);
		const aDirtyChanges = [];
		aVariantDependentControlChanges.forEach((oChange) => {
			// dirty changes should not be applied when the app is opened the next time
			if (!oChange.isPersisted()) {
				aDirtyChanges.push(oChange);
			} else {
				DependencyHandler.removeChangeFromMap(oLiveDependencyMap, oChange.getId());
				DependencyHandler.removeChangeFromDependencies(oLiveDependencyMap, oChange.getId());
			}
		});
		sap.ui.require(["sap/ui/fl/write/_internal/flexState/FlexObjectManager"], (FlexObjectManager) => {
			FlexObjectManager.deleteFlexObjects({reference: this.sFlexReference, flexObjects: aDirtyChanges});
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