/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/p13n/AdaptationProvider",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/mdc/p13n/modification/FlexModificationHandler",
	"sap/m/MessageStrip",
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/ui/mdc/p13n/modules/DefaultProviderRegistry",
	"sap/ui/mdc/p13n/UIManager",
	"sap/ui/mdc/p13n/modules/StateHandlerRegistry",
	"sap/ui/mdc/p13n/modules/xConfigAPI",
	"sap/base/util/UriParameters"
], function (AdaptationProvider, merge, Log, PropertyHelper, FlexModificationHandler, MessageStrip, coreLibrary, Element, DefaultProviderRegistry, UIManager, StateHandlerRegistry, xConfigAPI, SAPUriParameters) {
	"use strict";

	var ERROR_INSTANCING = "Engine: This class is a singleton. Please use the getInstance() method instead.";

	//Shortcut to 'MessageType'
	var MessageType = coreLibrary.MessageType;

	/*global WeakMap */
	var _mRegistry = new WeakMap();

	//Singleton storage
	var oEngine;

	/**
	 * Constructor for a new Engine.
	 *
	 * The Engine should always be accessed via 'getInstance' and not by creating a new instance of it.
	 * The class should only be used to create derivations.
	 *
	 * @class
	 * @extends sap.ui.mdc.p13n.AdaptationProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental
	 * @since 1.87
	 * @alias sap.ui.mdc.p13n.Engine
	 */
	var Engine = AdaptationProvider.extend("sap.ui.mdc.p13n.Engine", {
		constructor: function() {
			AdaptationProvider.call(this);

			if (oEngine) {
				throw Error(ERROR_INSTANCING);
			}

			this._bDebugMode = new SAPUriParameters(window.location.search).getAll("sap-ui-xx-debugP13n")[0] === "true";

			this._aRegistry = [];
			this._aStateHandlers = [];

			//Default Provider Registry to be used for internal PersistenceProvider functionality access
			this.defaultProviderRegistry = DefaultProviderRegistry.getInstance(this);

			//UIManager to be used for p13n UI creation
			this.uimanager = UIManager.getInstance(this);

			//Default state Handler Registry to be used for state event handling
			this.stateHandlerRegistry = StateHandlerRegistry.getInstance();
		}
	});

	/**
	 * This method should only be called once per instance to register provided
	 * classes of <code>sap.ui.mdc.p13n.Controller</code> for the control instance
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.Control} oControl The control insance to be registered for adaptation
	 * @param {Object} oConfig The config object providing key value pairs of keys and
	 * <code>sap.ui.mdc.p13n.Controller</code> classes.
	 *
	 * @example
	 *  {
	 * 		controller: {
	 * 			Item: ColumnController,
	 * 			Sort: SortController,
	 * 			Filter: FilterController
	 * 		}
	 *	}
	 */
	Engine.prototype.registerAdaptation = function(oControl, oConfig) {

		if (!oConfig.hasOwnProperty("controller")) {
			throw new Error("Please provide atleast a configuration 'controller' containing a map of key-value pairs (key + Controller class) in order to register adaptation.");
		}

		if (this._getRegistryEntry(oControl)){
			this.deregisterAdaptation(oControl);
		}

		var aControllerKeys = Object.keys(oConfig.controller);

		aControllerKeys.forEach(function(sKey){

			var SubController = oConfig.controller[sKey];

			if (!this.getController(oControl, sKey)) {
				if (this._aRegistry.indexOf(oControl.getId()) < 0){
					this._aRegistry.push(oControl.getId());
				}
				var oController = new SubController(oControl);

				this.addController(oController, sKey);
			}

		}.bind(this));

	};

	/**
	 * Deregister a registered control. By deregistering a control the control will
	 * be removed from the <code>Engine</code> registry and all instance specific sub
	 * modules such as the registered controllers are going to be destroyed.
	 *
	 * @param {sap.ui.mdc.Control} oControl
	 */
	Engine.prototype.deregisterAdaptation = function(oControl) {
		var oRegistryEntry = this._getRegistryEntry(oControl);

		//destroy subcontroller
		Object.keys(oRegistryEntry.controller).forEach(function(sKey){
			var oController = oRegistryEntry.controller[sKey];
			oController.destroy();

			delete oRegistryEntry.controller[sKey];
		});

		//Remove the control from the weakmap housekeeping
		_mRegistry.delete(oControl);

		//Remove the control from the array to maintain debugging
		var iControlIndex = this._aRegistry.indexOf(oControl.getId());
		this._aRegistry.splice(iControlIndex, 1);
	};

	/**
	 * This method can be used to set the modification handling for a control instance.
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @param {sap.ui.mdc.p13n.modification.ModificationHandler} ModificationHandler The modification handler singleton instance
	 */
	Engine.prototype._setModificationHandler = function(vControl, oModificationHandler) {
		if (!oModificationHandler.isA("sap.ui.mdc.p13n.modification.ModificationHandler")) {
			throw new Error("Only sap.ui.mdc.p13n.modification.ModificationHandler derivations are allowed for modification");
		}
		var oModificationSetting = this._determineModification(vControl); //check and calculate modification basics
		oModificationSetting.handler = oModificationHandler;
		this._getRegistryEntry(vControl).modification = oModificationSetting;
	};

	Engine.prototype._addToQueue = function(oControl, fTask) {
		var oRegistryEntry = this._getRegistryEntry(oControl);

		var fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oRegistryEntry.pendingModification === pOriginalPromise){
				oRegistryEntry.pendingModification = null;
			}
		};

		oRegistryEntry.pendingModification = oRegistryEntry.pendingModification instanceof Promise ? oRegistryEntry.pendingModification.then(fTask) : fTask();
		oRegistryEntry.pendingModification.then(fCleanupPromiseQueue.bind(null, oRegistryEntry.pendingModification));

		return oRegistryEntry.pendingModification;
	};

	/**
	 * <code>Engine#createChanges</code> can be used to programmatically trigger the creation
	 * of a set of changes based on the current control state and the provided state.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {object} mDiffParameters A map defining the configuration to create the changes.
	 * @param {sap.ui.mdc.Control} mDiffParameters.control The control instance tht should be adapted.
	 * @param {string} mDiffParameters.key The key used to retrieve the corresponding Controller.
	 * @param {object[]|Promise<object[]>} mDiffParameters.state The state which should be applied on the provided control instance
	 * @param {boolean} [mDiffParameters.applyAbsolute] Decides whether unmentioned entries should be affected,
	 * @param {boolean} [mDiffParameters.stateBefore] In case the state should be diffed manually
	 * for example if "A" is existing in the control state, but not mentioned in the new state provided in the
	 * mDiffParameters.state then the absolute appliance decides whether to remove "A" or to keep it.
	 * @param {boolean} [mDiffParameters.suppressAppliance] Decides whether the change should be applied directly.
	 * Controller
	 *
	 * @returns {Promise} A Promise resolving in the according delta changes.
	 */
	Engine.prototype.createChanges = function(mDiffParameters) {

		var oControl = Engine.getControlInstance(mDiffParameters.control);
		var sKey = mDiffParameters.key;
		var vNewState = mDiffParameters.state;
		var bApplyAbsolute = !!mDiffParameters.applyAbsolute;
		var bSuppressCallback = !!mDiffParameters.suppressAppliance;

		if (!sKey || !mDiffParameters.control || !vNewState) {
			throw new Error("To create changes via Engine, atleast a 1)Control 2)Key and 3)State needs to be provided.");
		}

		var fDeltaHandling = function() {
			return this.initAdaptation(oControl, sKey).then(function(){
				return vNewState;
			})
			.then(function(aNewState){
				var oController = this.getController(oControl, sKey);
				var mChangeOperations = oController.getChangeOperations();

				var oRegistryEntry = this._getRegistryEntry(oControl);
				var oCurrentState = oController.getCurrentState();
				var oPriorState = merge(oCurrentState instanceof Array ? [] : {}, oCurrentState);

				var mDeltaConfig = {
					existingState: mDiffParameters.stateBefore || oPriorState,
					applyAbsolute: bApplyAbsolute,
					changedState: aNewState,
					control: oController.getAdaptationControl(),
					changeOperations: mChangeOperations,
					deltaAttributes: ["name"],
					propertyInfo: oRegistryEntry.helper.getProperties().map(function(a){return {name: a.name};})
				};

				//Only execute change calculation in case there is a difference (--> example: press 'Ok' without a difference)
				var aChanges = oController.getDelta(mDeltaConfig);

				if (!bSuppressCallback) {
					return this._processChanges(oControl, aChanges);
				}

				return aChanges || [];
			}.bind(this));
		}.bind(this);

		return this._addToQueue(oControl, fDeltaHandling);
	};

	/**
	 * This method can be used to trigger a reset on the provided control instance.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.Control} oControl The according control instance.
	 * @param {string} aKeys The key for the affected config.
	 *
	 * @returns {Promise} A Promise resolving once the reset is completed.
	 */
	Engine.prototype.reset = function(oControl, aKeys) {

		aKeys = aKeys instanceof Array ? aKeys : [aKeys];

		var aSelectors = [];

		aKeys.forEach(function(sKey) {
			aSelectors = aSelectors.concat(this.getController(oControl, sKey).getSelectorForReset());
		}.bind(this));

		var oResetConfig = {
			selectors: aSelectors,
			selector: oControl
		};

		var oModificationSetting = this._determineModification(oControl);
		return oModificationSetting.handler.reset(oResetConfig, oModificationSetting.payload).then(function(){
			//trigger statehandlerregistry notification
			this.stateHandlerRegistry.fireChange(oControl);

			//Re-Init housekeeping after update
			return this.initAdaptation(oControl, aKeys).then(function(oPropertyHelper){
				aKeys.forEach(function(sKey){
					var oController = this.getController(oControl, sKey);
					oController.update(oPropertyHelper);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Returns a promise resolving after all currently pending modifications have been applied.
	 * This method will wait in addition for <code>Engine</code> related promises (retrieving necessary modules, initializing the propertyhelper, etc.) to be fulfilled before resolving.
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} oControl The according control instance.
	 * @returns {Promise} A Promise resolving after all pending modifications have been applied.
	 */
	Engine.prototype.waitForChanges = function(oControl) {
		var oModificationSetting = this._determineModification(oControl);
		var oRegistryEntry = this._getRegistryEntry(oControl);
		return oRegistryEntry && oRegistryEntry.pendingModification ? oRegistryEntry.pendingModification : Promise.resolve()
		.then(function(){
			return oModificationSetting.handler.waitForChanges({
				element: oControl
			}, oModificationSetting.payload);
		});
	};

	/**
	 * Determines whether the environment is suitable for the desired modification of the provided control instance.
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} oControl The according control instance.
	 */
	Engine.prototype.isModificationSupported = function(oControl) {
		var oModificationSetting = this._determineModification(oControl);
		return oModificationSetting.handler.isModificationSupported({
			element: oControl
		}, oModificationSetting.payload);
	};

	/**
	 * This method can be used to process an array of changes.
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @returns {Promise} The change appliance promise.
	 */
	Engine.prototype._processChanges = function(vControl, aChanges) {
		if (aChanges instanceof Array && aChanges.length > 0) {
			var oModificationSetting = this._determineModification(vControl);
			return oModificationSetting.handler.processChanges(aChanges, oModificationSetting.payload)
			.then(function(aChanges){
				var oControl = Engine.getControlInstance(vControl);
				this.stateHandlerRegistry.fireChange(oControl);
				return aChanges;
			}.bind(this));
		} else {
			return Promise.resolve([]);
		}
	};

	/**
	 * This method can be used in the control's according designtime metadata
	 * for keyuser personalization.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered control instance.
	 * @param {object} mPropertyBag The propertybag provided in the settings action.
	 * @param {string} aKeys The keys to be used to display in the corresponding Controller
	 *
	 * @returns {Promise} A Promise resolving in the set of changes to be created during RTA.
	 */
	Engine.prototype.getRTASettingsActionHandler = function (oControl, mPropertyBag, aKeys) {

		var fResolveRTA;

		//var aVMs = Engine.hasForReference(oControl, "sap.ui.fl.variants.VariantManagement");
		// TODO: clarify if we need this error handling / what to do with the Link if we want to keep it
		var aPVs = Engine.hasForReference(oControl, "sap.ui.mdc.p13n.PersistenceProvider");

		if (aPVs.length > 0 && !oControl.isA("sap.ui.mdc.link.Panel")) {
			return Promise.reject("Please do not use a PeristenceProvider in RTA.");
		}

		var oOriginalModifHandler = this.getModificationHandler(oControl);
		var oTemporaryRTAHandler = new FlexModificationHandler();

		var oRTAPromise = new Promise(function(resolve, reject){
			fResolveRTA = resolve;
		});

		oTemporaryRTAHandler.processChanges = function(aChanges) {
			fResolveRTA(aChanges);
			return Promise.resolve(aChanges);
		};

		this._setModificationHandler(oControl, oTemporaryRTAHandler);

		this.uimanager.show(oControl, aKeys).then(function(oContainer){
			var oCustomHeader = oContainer.getCustomHeader();
			if (oCustomHeader) {
				oCustomHeader.getContentRight()[0].setVisible(false);
			}
			oContainer.addStyleClass(mPropertyBag.styleClass);
			if (mPropertyBag.fnAfterClose instanceof Function) {
				oContainer.attachAfterClose(mPropertyBag.fnAfterClose);
			}
		});

		oRTAPromise.then(function(){
			this._setModificationHandler(oControl, oOriginalModifHandler);
			oTemporaryRTAHandler.destroy();
		}.bind(this));

		return oRTAPromise;

	};

	/**
	 * Enhances the xConfig object by using the <code>ModificationHandler</code>
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {object} mEnhanceConfig An object providing the information about the xConfig enhancement
	 * @param {object} mEnhanceConfig.name The affected property name
	 * @param {object} mEnhanceConfig.controlMeta Object describing which config is affected
	 * @param {object} mEnhanceConfig.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} mEnhanceConfig.controlMeta.property The affected property name (such as <code>width</code> or <code>lable</code>)
	 * @param {object} mEnhanceConfig.value The value that should be written in the xConfig
	 * @param {object} [mEnhanceConfig.propertyBag] Optional propertybag for the <code>ModificationHandler</code>
	 * @returns {Promise} Promise resolving when the XConfig is successfully enhanced
	 */
	Engine.prototype.enhanceXConfig = function(vControl, mEnhanceConfig) {

		var oControl = Engine.getControlInstance(vControl);
		var oRegistryEntry = this._getRegistryEntry(vControl);

		return Promise.resolve()
			.then(function() {
				return xConfigAPI.enhanceConfig(oControl, mEnhanceConfig)
					.then(function(oConfig){
						if (oRegistryEntry) {
							//to simplify debugging
							oRegistryEntry.xConfig = oConfig;
						}
					});
			});
	};

	/**
	 * Returns a copy of the xConfig object
	 *
	 * @param {sap.ui.core.Element} vControl The according element which should be checked
	 * @param {object} [mEnhanceConfig] An object providing a modification handler specific payload
	 * @param {object} [mEnhanceConfig.propertyBag] Optional propertybag for different modification handler derivations
	 *
	 * @returns {Promise<object>|object}
	 *     A promise that resolves with the xConfig, the xConfig directly if it is already available, or <code>null</code> if there is no xConfig
	 */
	Engine.prototype.readXConfig = function(vControl, mEnhanceConfig) {

		var oControl = Engine.getControlInstance(vControl);
		return xConfigAPI.readConfig(oControl, mEnhanceConfig) || {};
	};

	/**
	 * The Engine is processing state via the internal key registry.
	 * The external state representation might differ from the internal registration.
	 * <b>Note:</b> This will only replace the keys to the external StateUtil representation, but not transform the state content itself.
	 *
	 * @private
	 * @param {string|sap.ui.mdc.Control} vControl The registered control instance
	 * @param {object} oInternalState The internal state
	 * @returns {object} The externalized state
	 */
	Engine.prototype.externalizeKeys = function(vControl, oInternalState) {
		var oExternalState = {};
		Object.keys(oInternalState).forEach(function(sInternalKey){
			var oController = this.getController(Engine.getControlInstance(vControl), sInternalKey);
			if (oController) {
				oExternalState[oController.getStateKey()] = oInternalState[sInternalKey];
			}
		}.bind(this));
		return oExternalState;
	};

	/**
	 * The Engine is processing state via the internal key registry.
	 * The external state representation might differ from the internal registration.
	 * <b>Note:</b> This will only replace the keys to the internal Engine registry, but not transform the state content itself.
	 *
	 * @private
	 * @param {string|sap.ui.mdc.Control} vControl The registered control instance
	 * @param {object} oExternalState The external state
	 * @returns {object} The internalized state
	 */
	Engine.prototype.internalizeKeys = function (vControl, oExternalState) {
		var aControllerKeys = this.getRegisteredControllers(vControl), oInternalState = {};
		aControllerKeys.forEach(function(sInternalRegistryKey){
			var sExternalStateKey = this.getController(vControl, sInternalRegistryKey).getStateKey();
			if (oExternalState.hasOwnProperty(sExternalStateKey)) {
				oInternalState[sInternalRegistryKey] = oExternalState[sExternalStateKey];
			}
		}.bind(this));
		return oInternalState;
	};

	/**
	 * Apply a State on a control by passing an object that contains the
	 * registered controller key and an object matching the innter subcontroller housekeeping.
	 *
	 * @example {
	 * 		ControllerKey: [{<someState>}, {...}]
	 * }
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered control instance
	 * @param {object} oState The state object
	 * @param {boolean} bApplyAbsolute Defines whether the state should be an additional delta on the current control state
	 *
	 * @returns {Promise} A Promise resolving after the state has been applied
	 */
	Engine.prototype.applyState = function(oControl, oState, bApplyAbsolute) {

		//Call retrieve only to ensure that the control is initialized and enabled for modification
		return this.retrieveState(oControl).then(function(oCurrentState){

			var aStatePromise = [], aChanges = [], mInfoState = {};

			if (oControl.validateState instanceof Function) {
				mInfoState = oControl.validateState(this.externalizeKeys(oControl, oState));
			}

			if (mInfoState.validation === MessageType.Error){
				Log.error(mInfoState.message);
			}

			Object.keys(oState).forEach(function(sControllerKey){

				var oController = this.getController(oControl, sControllerKey);

				if (!oController){
					//TODO: p13nMode <> registerAdaptation <> StateUtil key alignment
					return;
				}

				var oStatePromise = this.createChanges({
					control: oControl,
					key: sControllerKey,
					state: oController.sanityCheck(oState[sControllerKey]),
					suppressAppliance: true,
					applyAbsolute: bApplyAbsolute
				});

				aStatePromise.push(oStatePromise);
			}.bind(this));

			return Promise.all(aStatePromise).then(function(aRawChanges){
				aRawChanges.forEach(function(aSpecificChanges){
					if (aSpecificChanges && aSpecificChanges.length > 0){
						aChanges = aChanges.concat(aSpecificChanges);
					}
				});

				if (this._bDebugMode) {
					Log.info("Engine state appliance for control: \n" + oControl.getId() + "\n\napplied state: \n" + JSON.stringify(oState, null, 2));
				}

				return this._processChanges(oControl, aChanges);
			}.bind(this));

		}.bind(this));
	};

	Engine.prototype.diffState = function(oControl, oOld, oNew) {

		var aDiffCreation = [], oDiffState = {};
		oOld = merge({}, oOld);
		oNew = merge({}, oNew);

		this.getRegisteredControllers(oControl).forEach(function(sKey){

			aDiffCreation.push(this.createChanges({
				control: oControl,
				stateBefore: oOld[sKey],
				state: oNew[sKey],
				applyAbsolute: true,
				key: sKey,
				suppressAppliance: true
			}));

		}.bind(this));

		return Promise.all(aDiffCreation)
		.then(function(aChanges){
			this.getRegisteredControllers(oControl).forEach(function(sKey, i){

				var aState = this.getController(oControl, sKey).changesToState(aChanges[i], oOld[sKey], oNew[sKey]);
				oDiffState[sKey] = aState;

			}.bind(this));

			return oDiffState;

		}.bind(this));
	};

	/**
	 *  Retrieves the externalized state for a given control instance.
	 *  The retrieved state is equivalent to the "getCurrentState" API for the given Control,
	 *  after all necessary changes have been applied (e.g. variant appliance and P13n/StateUtil changes).
	 *  After the returned Promise has been resolved, the returned State is in sync with the according
	 *  state object of the MDC control (for example "filterConditions" for the FilterBar).
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {object} oControl The control instance implementing IxState to retrieve the externalized state
	 *
	 * @returns {Promise} a Promise resolving in the current control state.
	 */
	Engine.prototype.retrieveState = function(oControl) {

		var bValidInterface = this.checkXStateInterface(oControl);

		if (!bValidInterface){
			throw new Error("The control needs to implement the interface IxState.");
		}

		//ensure that the control has been initialized
		return oControl.initialized().then(function() {

			//ensure that all changes have been applied
			return Engine.getInstance().waitForChanges(oControl).then(function() {

				var oRetrievedState = {};
				Engine.getInstance().getRegisteredControllers(oControl).forEach(function(sKey){
					oRetrievedState[sKey] = Engine.getInstance().getController(oControl, sKey).getCurrentState();
				});

				return merge({}, oRetrievedState);

			});

		});

	};

	/**
	 * This method sanity checks a control for state appliance.
	 * The according interface is <code>sap.ui.mdc.IxState</code>
	 * @private
	 *
	 * @param {object} oControl The registered control instance
	 *
	 * @returns {boolean} Returns true/false depending on the sanity state.
	 */
	Engine.prototype.checkXStateInterface = function(oControl) {

		//check if a control instance is available
		if (!oControl) {
			return false;
		}

		//check if flex is enabled
		if (!this.isModificationSupported(oControl)) {
			return false;
		}

		//check for IxState 'initialized'
		if (!oControl.isA("sap.ui.mdc.IxState")) {
			return false;
		}

		return true;
	};

	/**
	 * This method can be used to initialize the Controller housekeeping.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @param {string|string[]} aKeys The key for the according Controller
	 * @param {Object[]} aCustomInfo A custom set of propertyinfos as base to create the UI
	 *
	 * @returns {Promise} A Promise resolving after the adaptation housekeeping has been initialized.
	 */
	Engine.prototype.initAdaptation = function(vControl, aKeys, aCustomInfo) {
		this.verifyController(vControl, aKeys);

		//1) Init property helper
		return this._retrievePropertyHelper(vControl, aCustomInfo);

	};

	/**
	 * This method should only be used to register a new Controller.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.p13n.subcontroller.Controller} oController The controller instance.
	 * @param {string} sKey The key that defines the later access to the controller instance.
	 */
	Engine.prototype.addController = function(oController, sKey, oPreConfig) {
		var oRegistryEntry = this._createRegistryEntry(oController.getAdaptationControl(), oPreConfig);
		oRegistryEntry.controller[sKey] = oController;
	};

	/**
	 * This method can be used to get a controller instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered Control instance.
	 * @param {string} sKey The key for which the controller has been registered.
	 */
	Engine.prototype.getController = function(vControl, sKey) {
		var oRegistryEntry = this._getRegistryEntry(vControl);

		if (oRegistryEntry && oRegistryEntry.controller.hasOwnProperty(sKey)) {
			return oRegistryEntry.controller[sKey];
		}
	};

	/**
	 * Verifies the existence of a set of subcontrollers registered for a provided control instance.
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered Control instance.
	 * @param {string|array} vKey A key as string or an array of keys
	 */
	Engine.prototype.verifyController = function(vControl, vKey) {
		var aKeys = vKey instanceof Array ? vKey : [vKey];

		aKeys.forEach(function(sKey){
			if (!this.getController(vControl, sKey)) {
				var oControl = Engine.getControlInstance(vControl);
				throw new Error("No controller registered yet for " + oControl.getId() + " and key: " + sKey);
			}
		}.bind(this));

	};

	/**
	 * Retrieves the subcontroller UI settings for a provided control instance
	 * and the set of provided registered keys.
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered Control instance.
	 * @param {string|array} vKeys A key as string or an array of keys
	 *
	 * @returns {object} The requested UI settings of the control instance and provided keys
	 */
	Engine.prototype.getUISettings = function(vControl, vKeys) {
		var aKeys = Array.isArray(vKeys) ? vKeys : [vKeys];
		this.verifyController(vControl, aKeys);
		var oPropertyHelper = this._getRegistryEntry(vControl).helper;
		var mUiSettings = {};

		aKeys.forEach(function(sKey){
			var oController = this.getController(vControl, sKey);
			var pAdaptationUI = oController.getAdaptationUI(oPropertyHelper);
			//Check faceless controller implementations and skip them

			//TODO: error handling for non promises
			if (pAdaptationUI instanceof Promise){
				mUiSettings[sKey] = {};
				mUiSettings[sKey] = {
					resetEnabled: oController.getResetEnabled(),
					containerSettings: oController.getUISettings(),
					adaptationUI: pAdaptationUI
				};
			}
		}.bind(this));

		return mUiSettings;
	};

	/**
	 * This method can be used to determine if modification settings for a control have already been created.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered Control instance
 	 * @returns {boolean} true if modification settings were already determined
	 */
	Engine.prototype.isRegisteredForModification = function(vControl) {
		var oRegistryEntry = this._getRegistryEntry(vControl);
		return oRegistryEntry && !!oRegistryEntry.modification;
	};

	/**
	 * Retruns an array of all registered controllers
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered Control instance
	 * @returns {array} An array of all registered controller instances
	 */
	Engine.prototype.getRegisteredControllers = function(vControl){
		var oRegistryEntry = this._getRegistryEntry(vControl);
		return oRegistryEntry ? Object.keys(oRegistryEntry.controller) : [];
	};

	/**
	 * This method can be used to get the registry entry for a control instance
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} vControl
	 *
	 * @returns {object} The according registry entry
	 */
	Engine.prototype._getRegistryEntry = function(vControl) {

		var oControl = Engine.getControlInstance(vControl);
		return _mRegistry.get(oControl);

	};

	/**
	 * This method can be used to get the modification handling for a control instance
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.Control} vControl
	 *
	 * @returns {object} The according ModificationHandler.
	 */
	Engine.prototype.getModificationHandler = function(vControl) {
		var oModificationSetting = this._determineModification(vControl);

		//This method might also be retrieved by non-registered Controls (such as FilterBarBase) - the default should always be Flex.
		return oModificationSetting.handler;

	};

	/**
	 * This method can be used to create the registry entry for a control instance
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} vControl
	 *
	 * @returns {object} The according registry entry
	 */
	Engine.prototype._createRegistryEntry = function(vControl, oPreConfiguration) {

		var oControl = Engine.getControlInstance(vControl);

		if (!_mRegistry.has(oControl)) {

			_mRegistry.set(oControl, {
				modification: oPreConfiguration && oPreConfiguration.modification ? oPreConfiguration.modification : null,
				controller: {},
				activeP13n: null,
				helper: null,
				xConfig: null,
				pendingAppliance: {},
				pendingModification: null
			});

		}

		return _mRegistry.get(oControl);
	};

	Engine.prototype.trace = function(vControl, oChange) {
		var oRegistryEntry = this._getRegistryEntry(vControl);
		this.getRegisteredControllers(vControl).forEach(function(sKey){
			var oController = this.getController(vControl, sKey);
			var mChangeOperations = oController.getChangeOperations();
			Object.keys(mChangeOperations).forEach(function(sType){
				if (mChangeOperations[sType] === oChange.changeSpecificData.changeType) {
					oRegistryEntry.pendingAppliance[sKey] = [].concat(oRegistryEntry.pendingAppliance[sKey]).concat(oChange);
				}
			});
		}.bind(this));
	};

	Engine.prototype.getTrace = function(vControl, oChange) {
		var oRegistryEntry = this._getRegistryEntry(vControl);
		return Object.keys(oRegistryEntry.pendingAppliance);
	};

	Engine.prototype.clearTrace = function(vControl, oChange) {
		var oRegistryEntry = this._getRegistryEntry(vControl);
		oRegistryEntry.pendingAppliance = {};
	};

	/**
	 * Determines and registeres the ModificationHandler per control instance
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} vControl
	 * @returns {object} The according modification registry entry
	 */
	Engine.prototype._determineModification = function (vControl) {

		var oRegistryEntry = this._getRegistryEntry(vControl);

		//Modification setting is only calculated once per control instance
		if (oRegistryEntry && oRegistryEntry.modification) {
			return oRegistryEntry.modification;
		}

		var aPPResults = Engine.hasForReference(vControl, "sap.ui.mdc.p13n.PersistenceProvider");
		var aVMResults = Engine.hasForReference(vControl, "sap.ui.fl.variants.VariantManagement");

		var aPersistenceProvider = aPPResults.length ? aPPResults : undefined;
		var sHandlerMode = aPersistenceProvider ? aPersistenceProvider[0].getMode() : "Standard";

		var mHandlerMode = {
			//During preprocessing, it might be necessary to calculate the modification handler instance
			//without an initialized control instance --> use flex as default
			undefined: FlexModificationHandler,
			Global: FlexModificationHandler,
			Transient: FlexModificationHandler,
			Standard: FlexModificationHandler,
			Auto: FlexModificationHandler
		};

		var ModificiationHandler = mHandlerMode[sHandlerMode];

		if (!ModificiationHandler) {
			throw new Error("Please provide a valid ModificationHandler! - valid Modification handlers are:" + Object.keys(mHandlerMode));
		}

		var oModificationSetting = {
			handler: ModificiationHandler.getInstance(),
			payload: {
				hasVM: aVMResults && aVMResults.length > 0,
				hasPP: aPPResults && aPPResults.length > 0,
				mode: sHandlerMode
			}
		};

		if (oRegistryEntry && !oRegistryEntry.modification) {
			oRegistryEntry.modification = oModificationSetting;
		}

		return oModificationSetting;
	};

	Engine.hasForReference = function(vControl, sControlType) {
		var sControlId = vControl && vControl.getId ? vControl.getId() : vControl;
		var aResults = Element.registry.filter(function (oElement) {
			if (!oElement.isA(sControlType)) {
				return false;
			}
			var aFor = oElement.getFor();
			for (var n = 0; n < aFor.length; n++) {
				if (aFor[n] === sControlId || Engine.hasControlAncestorWithId(sControlId, aFor[n])) {
					return true;
				}
			}
			return false;
		});
		return aResults;
	};

	/**
	 * Determines and registeres the ModificationHandler per control instance
	 *
	 * @private
	 * @param {string} sControlId The control id
	 * @param {string} sAncestorControlId The control ancestor id
	 *
	 * @returns {boolean} Returns whether an according ancestor could be found.
	 */
	Engine.hasControlAncestorWithId = function(sControlId, sAncestorControlId) {
		var oControl;

		if (sControlId === sAncestorControlId) {
			return true;
		}

		oControl = sap.ui.getCore().byId(sControlId);
		while (oControl) {
			if (oControl.getId() === sAncestorControlId) {
				return true;
			}

			if (typeof oControl.getParent === "function") {
				oControl = oControl.getParent();
			} else {
				return false;
			}
		}

		return false;
	};


	/**
	 * This method can be used to get a control instance by passing either the control
	 * or the Control's Id.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control|string} vControl
	 * @returns {sap.ui.core.Control} The control instance
	 */
	Engine.getControlInstance = function(vControl) {
		return typeof vControl == "string" ? sap.ui.getCore().byId(vControl) : vControl;
	};

	/**
	 * This method can be used to get the active p13n state of a registered Control.
	 * E.g. the method will return the key of the Controller that is currently being
	 * used to display a p13n UI.
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} vControl
	 *
	 * @returns {boolean} The according flag is the Control has an open P13n container
	 */
	Engine.prototype.hasActiveP13n = function(vControl) {
		return !!this._getRegistryEntry(vControl).activeP13n;
	};

	/**
	 * This method can be used to set the active p13n state of a registered Control.
	 * E.g. the method will return the key of the Controller that is currently being
	 * used to display a p13n UI.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 */
	Engine.prototype.setActiveP13n = function(vControl, sKey) {
		this._getRegistryEntry(vControl).activeP13n = sKey;
	};

	/**
	 * Triggers a validation for a certain controller - The method will create a
	 * MessageStrip and place it on the according oP13nUI. The BaseController needs
	 * to implement <code>BaseController#validateP13n</code>.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oP13nUI The adaptation UI displayed in the container (e.g. BasePanel derivation).
	 *
	 * @returns {object} Object defining the state validation result
	 */
	Engine.prototype.validateP13n = function(vControl, sKey, oP13nUI) {
		var oController = this.getController(vControl, sKey);
		var oControl = Engine.getControlInstance(vControl);


		var mControllers = this._getRegistryEntry(vControl).controller;
		var oTheoreticalState = {};

		Object.keys(mControllers).forEach(function(sControllerKey){
			oTheoreticalState[sControllerKey] = mControllers[sControllerKey].getCurrentState();
		});

		//Only execeute validation for controllers that support 'model2State'
		if (oController && oController.model2State instanceof Function) {
			oTheoreticalState[sKey] = oController.model2State();

			var mInfoState = oControl.validateState(this.externalizeKeys(oControl, oTheoreticalState), sKey);

			var oMessageStrip;

			if (mInfoState.validation !== MessageType.None) {
				oMessageStrip = new MessageStrip({
					type: mInfoState.validation,
					text: mInfoState.message
				});
			}

			if (oP13nUI.setMessageStrip instanceof Function) {
				oP13nUI.setMessageStrip(oMessageStrip);
			} else {
				Log.warning("message strip could not be provided - the adaptation UI needs to implement 'setMessageStrip'");
			}
			return mInfoState;
		} else {
			return undefined;
		}

	};

	/**
	 * Reads the current state of the subcontrollers and triggers a state appliance
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered Control instance.
	 * @param {array} aKeys An array of keys
	 * @returns {Promise} A Promise resolving after all p13n changes have been calculated and processed
	 */
	Engine.prototype.handleP13n = function(oControl, aKeys) {

		var pChanges = [];

		aKeys.forEach(function(sControllerKey){

			var oController = this.getController(oControl, sControllerKey);

			var p = this.createChanges({
				control: oControl,
				key: sControllerKey,
				state: oController.getP13nData(),
				suppressAppliance: true,
				applyAbsolute: true
			})
			.then(function(aItemChanges){

				return oController.getBeforeApply().then(function(aChanges){

					var aComulatedChanges = aChanges ? aChanges.concat(aItemChanges) : aItemChanges;
					return aComulatedChanges;

				});
			});

			pChanges.push(p);
		}.bind(this));

		return Promise.all(pChanges).then(function(aChangeMatrix){

			var aApplyChanges = [];

			aChangeMatrix.forEach(function(aTypeChanges){
				aApplyChanges = aApplyChanges.concat(aTypeChanges);
			});

			if (aApplyChanges.length > 0) {
				Engine.getInstance()._processChanges(oControl, aApplyChanges);
			}
		});

    };

	/**
	 * This method can be used to retrieve the PropertyHelper for a registered Control.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {object[]} [aCustomPropertyInfo] A custom set of propertyinfo.
	 *
	 */
	Engine.prototype._retrievePropertyHelper = function (vControl, aCustomPropertyInfo) {

		var oRegistryEntry = this._getRegistryEntry(vControl);
		var oControl = Engine.getControlInstance(vControl);

		if (aCustomPropertyInfo) {
			if (oRegistryEntry.helper) {
				oRegistryEntry.helper.destroy();
			}
			oRegistryEntry.helper = new PropertyHelper(aCustomPropertyInfo);
			return Promise.resolve(oRegistryEntry.helper);
		}

		if (oRegistryEntry.helper) {
			return Promise.resolve(oRegistryEntry.helper);
		}

		return oControl.initPropertyHelper().then(function (oPropertyHelper) {
			oRegistryEntry.helper = oPropertyHelper;
			return oPropertyHelper;
		}, function (sHelperError) {
			throw new Error(sHelperError);
		});
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * This method is the central point of access to the Engine Singleton.
	 */
	Engine.getInstance = function() {
		if (!oEngine) {
			oEngine = new Engine();
		}
		return oEngine;
	};

	/**
	 * This method can be used for debugging to retrieve the complete registry.
	 *
	 * @private
	 */
	Engine.prototype._getRegistry = function() {
		var oRegistry = {
			stateHandlerRegistry: this.stateHandlerRegistry,
			defaultProviderRegistry: this.defaultProviderRegistry,
			controlRegistry: {}
		};

		this._aRegistry.forEach(function(sKey){
			var oControl = sap.ui.getCore().byId(sKey);
			oRegistry.controlRegistry[sKey] = _mRegistry.get(oControl);
		});

		return oRegistry;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	Engine.prototype.destroy = function() {
		AdaptationProvider.prototype.destroy.apply(this, arguments);
		oEngine = null;
		this._aRegistry = null;
		_mRegistry.delete(this);
		this.defaultProviderRegistry.destroy();
		this.defaultProviderRegistry = null;
		this.stateHandlerRegistry.destroy();
		this.stateHandlerRegistry = null;
		this._bDebugMode = null;
		this.uimanager.destroy();
		this.uimanager = null;
	};

	return Engine;
});
