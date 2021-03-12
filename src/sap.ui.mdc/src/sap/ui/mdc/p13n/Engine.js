/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/base/util/UriParameters",
	"sap/ui/base/Object",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/mdc/util/loadModules",
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/ui/mdc/p13n/modification/FlexModificationHandler",
	"sap/m/MessageStrip",
	"sap/ui/core/library",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/core/Element",
	"sap/ui/mdc/p13n/DefaultProviderRegistry"
], function (merge, Log, SAPUriParameters, BaseObject, PropertyHelper, loadModules, P13nBuilder, FlexModificationHandler, MessageStrip, coreLibrary, StateUtil, Element, DefaultProviderRegistry) {
	"use strict";

	//Shortcut to 'MessageType'
	var MessageType = coreLibrary.MessageType;

	//Used for experimental features (such as livemode)
	var oURLParams = new SAPUriParameters(window.location.search);

	/*global WeakMap */
	var _mRegistry = new WeakMap();

	//Singleton storage
	var oEngine;

	/**
	 * Constructor for a new Engine. The Engine should always be accessed
	 * via 'getInstance' and not by creating a new instance of it. The class should only be used
	 * to create derivations.
	 *
	 * @class
	 * @extends sap.ui.base.Object
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
	var Engine = BaseObject.extend("sap.ui.mdc.p13n.Engine", {
		constructor: function() {
			BaseObject.call(this);
			this._aRegistry = [];
			this.defaultProviderRegistry = DefaultProviderRegistry.getInstance();
		}
	});

	/**
	 * This method should only be called once per instance to register provided
	 * classes of <code>sap.ui.mdc.p13n.Controller</code> for the control instance
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
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

	Engine.prototype.deregisterAdaptation = function(oControl) {
		var oRegistryEntry = this._getRegistryEntry(oControl);
		Object.keys(oRegistryEntry.controller).forEach(function(sKey){
			var oController = oRegistryEntry.controller[sKey];
			oController.destroy();

			delete oRegistryEntry.controller[sKey];
		});
	};

	/**
	 * Opens a personalization Dialog according to the provided Controller
	 * in the registration that the Engine can find for the Control and key.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @param {string} sKey The key for the according Controller
	 * @param {sap.ui.core.Control} oSource The source to be used. This may only
	 * be relevant in case the corresponding Controller is configured
	 * for liveMode
	 *
	 * @returns {Promise} A Promise resolving in the P13n UI.
	 */
	Engine.prototype.showUI = function(vControl, sKey, oSource) {

		//!!!Warning: experimental and only for testing purposes!!!----------
		if (oURLParams.getAll("sap-ui-xx-p13nLiveMode")[0] === "true"){
			this.getController(vControl, sKey)._bLiveMode = true;
			Log.warning("Please note that the p13n liveMode is experimental");
		}
		//--------------------------------------------------------------------

		if (!this._hasActiveP13n(vControl)){
			this._setActiveP13n(vControl, sKey);
			return this.createUI(vControl, sKey).then(function(oP13nDialog){
				this._openP13nControl(vControl, sKey, oP13nDialog, oSource);
				return oP13nDialog;
			}.bind(this), function(sErr){
				this._setActiveP13n(vControl, null);
				Log.error("P13n container creation failed: " + sErr);
			}.bind(this));
		} else {
			return Promise.resolve();
		}
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

	/**
	 * This method can be used to create a customized P13nUI without using the default
	 * implementation of <code>Engine#showUI</code> which will use all
	 * properties available by default.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @param {string} sKey The key for the according Controller
	 * @param {Object[]} aCustomInfo A custom set of propertyinfos as base to create the UI
	 *
	 * @returns {Promise} A Promise resolving in the P13n UI.
	 */
	Engine.prototype.createUI = function(vControl, sKey, aCustomInfo) {
		return this.initAdaptation(vControl, sKey, aCustomInfo).then(function(){
			return this._retrieveP13nContainer(vControl, sKey).then(function(oContainer){
				var oP13nUI = oContainer.getContent()[0];

				var oController = this.getController(vControl, sKey);
				oP13nUI.setP13nModel(oController.getP13nModel());

				if (oP13nUI.setLiveMode){
					oP13nUI.setLiveMode(oController.getLiveMode());
				}

				return oController.initializeUI().then(function(){
					oController.getAdaptationControl().addDependent(oContainer);
					return oContainer;
				});

			}.bind(this));
		}.bind(this));
	};

	/**
	 * <code>Engine#createChanges</code> can be used to programmatically trigger the creation
	 * of a set of changes based on the current control state and the provided state.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 *
	 * @param {object} mDiffParameters A map defining the configuration to create the changes.
	 * @param {sap.ui.mdc.Control} mDiffParameters.control The control instance tht should be adapted.
	 * @param {string} mDiffParameters.key The key used to retrieve the corresponding Controller.
	 * @param {object} mDiffParameters.state The state which should be applied on the provided control instance
	 * @param {boolean} [mDiffParameters.applyAbsolute] Decides whether unmentioned entries should be affected,
	 * for example if "A" is existing in the control state, but not mentioned in the new state provided in the
	 * mDiffParameters.state then the absolute appliance decides whether to remove "A" or to keep it.
	 * @param {boolean} [mDiffParameters.suppressAppliance] Decides whether the change should be applied directly.
	 * Controller
	 *
	 * @returns {Promise} A Promise resolving in the according delta changes.
	 */
	Engine.prototype.createChanges = function(mDiffParameters) {

		var vControl = mDiffParameters.control;
		var sKey = mDiffParameters.key;
		var aNewState = mDiffParameters.state;
		var bApplyAbsolute = !!mDiffParameters.applyAbsolute;
		var bSuppressCallback = !!mDiffParameters.suppressAppliance;
		if (!sKey || !vControl || !aNewState) {
			throw new Error("To create changes via Engine, atleast a 1)Control 2)Key and 3)State needs to be provided.");
		}

		return this.initAdaptation(vControl, sKey).then(function(){

			var oController = this.getController(vControl, sKey);
			var mchangeOperations = oController.getChangeOperations();

			var oRegistryEntry = this._getRegistryEntry(vControl);
			var oCurrentState = oController.getCurrentState();
			var oPriorState = merge(oCurrentState instanceof Array ? [] : {}, oCurrentState);

			var mDeltaConfig = {
				existingState: oPriorState,
				applyAbsolute: bApplyAbsolute,
				changedState: aNewState,
				control: oController.getAdaptationControl(),
				changeOperations: mchangeOperations,
				deltaAttributes: ["name"],
				propertyInfo: oRegistryEntry.helper.getProperties().map(function(a){return {name: a.getName()};})
			};

			//Only execute change calculation in case there is a difference (--> example: press 'Ok' without a difference)
			var aChanges = oController.getDelta(mDeltaConfig);

			if (!bSuppressCallback) {
				this._processChanges(vControl, aChanges);
			}

			return aChanges || [];

		}.bind(this));

	};

	/**
	 * This method can be used to trigger a reset on the provided control instance.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 *
	 * @param {sap.ui.mdc.Control} oControl The according control instance.
	 * @param {string} sKey The key for the affected config.
	 *
	 * @returns {Promise} A Promise resolving once the reset is completed.
	 */
	Engine.prototype.reset = function(oControl, sKey) {
		var oController = this.getController(oControl, sKey);
		var oModificationSetting = this._determineModification(oControl);
		if (oController.getResetEnabled()) {
			return oModificationSetting.handler.reset({
				selector: oControl
			}, oModificationSetting.payload).then(function(){
				//Re-Init housekeeping after update
				return this.initAdaptation(oControl, sKey).then(function(){
					oController.update();
				});
			}.bind(this));
		} else {
			return Promise.reject("The controller " + sKey + " has been configured to now allow reset.");
		}

	};

	/**
	 * Returns a promise resolving after all currently pending modifications have been applied.
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} oControl The according control instance.
	 * @returns {Promise} A Promise resolving after all pending modifications have been applied.
	 */
	Engine.prototype.waitForChanges = function(oControl) {
		var oModificationSetting = this._determineModification(oControl);
		return oModificationSetting.handler.waitForChanges({
			element: oControl
		}, oModificationSetting.payload);
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
		var oModificationSetting = this._determineModification(vControl);
		return oModificationSetting.handler.processChanges(aChanges, oModificationSetting.payload);
	};

	/**
	 * This method can be used in the control's according designtime metadata
	 * for keyuser personalization.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered control instance.
	 * @param {object} mPropertyBag The propertybag provided in the settings action.
	 * @param {string} sKey The string to be used to call the corresponding Controller
	 *
	 * @returns {Promise} A Promise resolving in the set of changes to be created during RTA.
	 */
	Engine.prototype.getRTASettingsActionHandler = function (oControl, mPropertyBag, sKey) {

		var fResolveRTA;

		//var aVMs = Engine.hasForReference(oControl, "sap.ui.fl.variants.VariantManagement");
		var aPVs = Engine.hasForReference(oControl, "sap.ui.mdc.p13n.PersistenceProvider");

		if (aPVs.length > 0) {
			return Promise.reject("Please do not use a PeristenceProvider in RTA.");
		}

		var oModificationHandler = this.getModificationHandler(oControl);
		var fnInitialAppliance = oModificationHandler.processChanges;
		var oController = this.getController(oControl, sKey);
		var fResetEnabled = oController.getResetEnabled;
		oController.getResetEnabled = function(){return false;};

		var oRTAPromise = new Promise(function(resolve, reject){
			fResolveRTA = resolve;
		});

		oModificationHandler.processChanges = fResolveRTA;

		this._setModificationHandler(oControl, oModificationHandler);

		this.showUI(oControl, sKey).then(function(oContainer){
			oContainer.addStyleClass(mPropertyBag.styleClass);
		});

		oRTAPromise.then(function(){
			oController.getResetEnabled = fResetEnabled;
			oModificationHandler.processChanges = fnInitialAppliance;
		});

		return oRTAPromise;

	};

	Engine.prototype.applyState = function(oControl, oState, bApplyAbsolute) {

		//Call retrieve only to ensure that the control is initialized and enabled for modification
		return this.retrieveState(oControl).then(function(oCurrentState){

			var aStatePromise = [], aChanges = [];

			var mInfoState = oControl.validateState(StateUtil._externalizeKeys(oState));

			if (mInfoState.validation === MessageType.Error){
				Log.error(mInfoState.message);
			}

			Object.keys(oState).forEach(function(sControllerKey){

				var oController = this.getController(oControl, sControllerKey);

				if (!oController){
					Log.warning("No controller registered for state" + sControllerKey + " - state appliance ignored for this key.");
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
				return this._processChanges(oControl, aChanges);
			}.bind(this));

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
	 * @MDC_PUBLIC_CANDIDATE
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

				return oRetrievedState;

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
	 * @param {string} sKey The key for the according Controller
	 * @param {Object[]} aCustomInfo A custom set of propertyinfos as base to create the UI
	 *
	 * @returns {Promise} A Promise resolving after the adaptation housekeeping has been initialized.
	 */
	Engine.prototype.initAdaptation = function(vControl, sKey, aCustomInfo) {

		if (!this.getController(vControl, sKey)) {
			var oControl = Engine.getControlInstance(vControl);
			throw new Error("No controller registered yet for " + oControl.getId() + " and key: " + sKey);
		}

		//1) Init property helper
		return this._retrievePropertyHelper(vControl, aCustomInfo)

		//2) Initialize SubController housekeeping
		.then(function(){
			this._prepareAdaptationData(vControl, sKey);
			return;
		}.bind(this));

	};

	/**
	 * This method should only be used to register a new Controller.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.p13n.subcontroller.Controller} oController The controller instance.
	 * @param {string} sKey The key that defines the later access to the controller instance.
	 */
	Engine.prototype.addController = function(oController, sKey) {
		var oRegistryEntry = this._createRegistryEntry(oController.getAdaptationControl());
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
	 * This method can be used to determine if modification settings for a control have already been created.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered Control instance.
 	 * @returns {boolean} true if modification settings were already determined
	 */
	Engine.prototype.isRegisteredForModification = function(vControl) {
		var oRegistryEntry = this._getRegistryEntry(vControl);
		return oRegistryEntry && !!oRegistryEntry.modification;
	};

	Engine.prototype.getRegisteredControllers = function(vControl){
		var oRegistryEntry = this._getRegistryEntry(vControl);
		return Object.keys(oRegistryEntry.controller);
	};

	/**
	 * This method can be used to get the registry entry for a control instance.
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} vControl
	 *
	 * @returns {object} The according registry entry.
	 */
	Engine.prototype._getRegistryEntry = function(vControl) {

		var oControl = Engine.getControlInstance(vControl);
		return _mRegistry.get(oControl);

	};

	/**
	 * This method can be used to get the modification handling for a control instance.
	 *
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
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
	 * This method can be used to create the registry entry for a control instance.
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} vControl
	 *
	 * @returns {object} The according registry entry.
	 */
	Engine.prototype._createRegistryEntry = function(vControl) {

		var oControl = Engine.getControlInstance(vControl);

		if (!_mRegistry.has(oControl)) {

			_mRegistry.set(oControl, {
				modification: null,
				controller: {},
				activeP13n: null,
				helper: null
			});

		}

		return _mRegistry.get(oControl);
	};

	/**
	 * Determines and registeres the ModificationHandler per control instance
	 *
	 * @private
	 * @param {sap.ui.mdc.Control} vControl
	 * @returns {object} The according modification registry entry.
	 */
	Engine.prototype._determineModification = function (vControl) {

		var oRegistryEntry = this._getRegistryEntry(vControl);

		//Modification setting is only calculated once per control instance.
		if (oRegistryEntry && oRegistryEntry.modification) {
			return oRegistryEntry.modification;
		}

		var aPPResults = Engine.hasForReference(vControl, "sap.ui.mdc.p13n.PersistenceProvider");
		var aVMResults = Engine.hasForReference(vControl, "sap.ui.fl.variants.VariantManagement");

		var aPersistenceProvider = aPPResults.length ? aPPResults : undefined;
		var sHandlerMode = aPersistenceProvider ? aPersistenceProvider[0].getMode() : "Standard";

		var mHandlerMode = {
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
	 * @param {String} sControlId The control id
	 * @param {String} sAncestorControlId The control ancestor id
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
	 * @returns {boolean} The according flag is the Control has an open P13n container.
	 */
	Engine.prototype._hasActiveP13n = function(vControl) {
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
	Engine.prototype._setActiveP13n = function(vControl, sKey) {
		this._getRegistryEntry(vControl).activeP13n = sKey;
	};

	/**
	 * This method can be used to open the p13n UI.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oP13nControl The created p13n UI to be displayed.
	 * @param {sap.ui.core.Control} oSource The source control (only for livemode).
	 */
	Engine.prototype._openP13nControl = function(vControl, sKey, oP13nControl, oSource){
		var oController = this.getController(vControl, sKey);
		if (oController.getLiveMode()) {
			oP13nControl.openBy(oSource);
		} else {
			oP13nControl.open();
		}

		this._validateP13n(vControl, sKey, oP13nControl.getContent()[0]);
	};

	/**
	 * This method can be used to retrieve the p13n container.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 *
	 * @returns {Promise} A Promise resolving in the according container
	 * (Depending on the Controllers livemode config).
	 */
	Engine.prototype._retrieveP13nContainer = function (vControl, sKey) {
		return new Promise(function (resolve, reject) {

			var oController = this.getController(vControl, sKey);

			var bLiveMode = oController.getLiveMode();
			var vAdaptationUI = oController.getAdaptationUI();

			var fnPrepareP13nUI = function(oP13nUI) {
				if (bLiveMode && oP13nUI.attachChange) {
					oP13nUI.attachChange(function(){
						this._handleChange(oController.getAdaptationControl(), sKey, oController.getP13nData());
					}.bind(this));
				}

				if (oP13nUI.attachChange) {
					oP13nUI.attachChange(function(oEvt){
						Engine.getInstance()._validateP13n(vControl, sKey, oP13nUI);
					});
				}

				this._createUIContainer(vControl, sKey, oP13nUI).then(function(oDialog){
					resolve(oDialog);
				});
			}.bind(this);

			if (typeof vAdaptationUI === "string") {
				var sPath = vAdaptationUI;
				loadModules([sPath]).then(function(aModules){
					var Panel = aModules[0];
					var oPanel = new Panel();
					fnPrepareP13nUI(oPanel);
				});
			} else if (vAdaptationUI instanceof Function) {
				fnPrepareP13nUI(vAdaptationUI);
			} else if (vAdaptationUI instanceof Promise) {
				vAdaptationUI.then(function(oP13nUI){
					fnPrepareP13nUI(oP13nUI);
				});
			}else if (vAdaptationUI.isA("sap.ui.core.Control")) {
				var oP13nUI = vAdaptationUI;
				fnPrepareP13nUI(oP13nUI);
			} else {
				reject(new Error("Please provide either a BasePanel derivation or a custom Control as personalization UI in AdaptationConfig"));
			}

		}.bind(this));
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
	 */
	Engine.prototype._validateP13n = function(vControl, sKey, oP13nUI) {
		var oController = this.getController(vControl, sKey);
		var oControl = Engine.getControlInstance(vControl);


		var mControllers = this._getRegistryEntry(vControl).controller;
		var oTheoreticalState = {};

		Object.keys(mControllers).forEach(function(sControllerKey){
			oTheoreticalState[sControllerKey] = mControllers[sControllerKey].getCurrentState();
		});

		//Only execeute validation for controllers that support 'model2State'
		if (oController.model2State instanceof Function) {
			oTheoreticalState[sKey] = oController.model2State();

			var mInfoState = oControl.validateState(StateUtil._externalizeKeys(oTheoreticalState));

			var oMessageStrip;

			if (mInfoState.validation !== MessageType.None) {
				oMessageStrip = new MessageStrip({
					type: mInfoState.validation,
					text: mInfoState.message
				});
			}

			oP13nUI.setMessageStrip(oMessageStrip);
		}

	};

	/**
	 * The event handler called by the P13n UI.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 * @param {object} oNewState The state which is going to be applied absolute via Engine#createChanges
	 * @param {object[]} aAdditionalChanges An array of additional changes that should be applied.
	 * (For example Inbuilt Filtering)
	 */
	Engine.prototype._handleChange = function(oControl, sKey, oNewState, aAdditionalChanges) {
		this.createChanges({
			control: oControl,
			key: sKey,
			state: oNewState.items,
			suppressAppliance: true,
			applyAbsolute: true
		}).then(function(aItemChanges){

			var aComulatedChanges = aAdditionalChanges ? aAdditionalChanges.concat(aItemChanges) : aItemChanges;

			if (aComulatedChanges.length > 0) {
				this._processChanges(oControl, aComulatedChanges);
			}

		}.bind(this));
	};

	/**
	 * This method can be used to create the p13n container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oPanel The control instance which is set in the content area of the container.
	 *
	 * @returns {Promise} Returns a Promise resolving in the container instance
	 */
	Engine.prototype._createUIContainer = function (vControl, sKey, oPanel) {

		var oController = this.getController(vControl, sKey);
		var oContainerPromise;

		if (oController.getLiveMode()) {
			oContainerPromise = this._createPopover(vControl, sKey, oPanel);
		} else {
			oContainerPromise = this._createModalDialog(vControl, sKey, oPanel);
		}

		return oContainerPromise.then(function(oContainer){
			// Add custom style class in order to display marked items accordingly
			oContainer.addStyleClass("sapUiMdcPersonalizationDialog");

			oContainer.isPopupAdaptationAllowed = function () {
				return false;
			};

			//EscapeHandler is required for non-liveMode
			if (!oController.getLiveMode()){
				oContainer.setEscapeHandler(function(oDialogClose){
					this._setActiveP13n(vControl, null);
					oContainer.close();
					oContainer.destroy();
					oDialogClose.resolve();
				}.bind(this));
			}

			// Set compact style class if the table is compact too
			oContainer.toggleStyleClass("sapUiSizeCompact", !!jQuery(oController.getAdaptationControl()).closest(".sapUiSizeCompact").length);
			return oContainer;
		}.bind(this));

	};

	/**
	 * This method can be used to create a Popover as container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oPanel The control instance which is set in the content area of the container.
	 *
	 * @returns {sap.m.ResponsivePopover} The popover instance.
	 */
	Engine.prototype._createPopover = function(vControl, sKey, oPanel){

		var oController = this.getController(vControl, sKey);

		var fnAfterDialogClose = function (oEvt) {
			var oPopover = oEvt.getSource();
			this._setActiveP13n(vControl, null);
			oPopover.destroy();
		}.bind(this);

		var mSettings = Object.assign({
			verticalScrolling: true,
			afterClose: fnAfterDialogClose
		}, oController.getContainerSettings());

		if (oController.getResetEnabled()){
			mSettings.reset = {
				onExecute: function() {
					this.reset(vControl, sKey);
				}.bind(this)
			};
		}

		return P13nBuilder.createP13nPopover(oPanel, mSettings);

	};

	/**
	 * This method can be used to create a Dialog as container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oPanel The control instance which is set in the content area of the container.
	 *
	 * @returns {sap.m.Dialog} The dialog instance.
	 */
	Engine.prototype._createModalDialog = function(vControl, sKey, oPanel){

		var oController = this.getController(vControl, sKey);

		var fnDialogOk = function (oEvt) {
			var oDialog = oEvt.getSource().getParent();

			var pConfirmContainer = this._confirmContainer(vControl, sKey, oPanel);

			pConfirmContainer.then(function(){
				this._setActiveP13n(vControl, null);
				oDialog.close();
			}.bind(this));

		}.bind(this);

		var fnDialogCancel = function(oEvt) {
			var oContainer = oEvt.getSource().getParent();
			this._setActiveP13n(vControl, null);
			oContainer.close();
		}.bind(this);

		var mSettings = Object.assign({
			verticalScrolling: true,
			afterClose: function(oEvt) {
				var oDialog = oEvt.getSource();
				if (oDialog) {
					oDialog.destroy();
				}
			},
			cancel: fnDialogCancel
		}, oController.getContainerSettings());

		if (oController.getResetEnabled()){
			mSettings.reset = {
				onExecute: function() {
					this.reset(vControl, sKey);
				}.bind(this)
			};
		}

		mSettings.confirm = {
			handler: function(oEvt) {
				fnDialogOk(oEvt);
			}
		};

		return P13nBuilder.createP13nDialog(oPanel, mSettings);
	};

	/**
	 * This method can be used to confirm a Dialog container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oPanel The control instance which is set in the content area of the container.
	 *
	 */
	Engine.prototype._confirmContainer = function(vControl, sKey, oPanel){
		var oController = this.getController(vControl, sKey);

		return oController.getBeforeApply(oPanel).then(function(aChanges){
			return this._handleChange(oController.getAdaptationControl(), sKey, oController.getP13nData(), aChanges);
		}.bind(this));

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
	Engine.prototype._retrievePropertyHelper = function(vControl, aCustomPropertyInfo){

		var oRegistryEntry = this._getRegistryEntry(vControl);

		if (aCustomPropertyInfo) {
			if (oRegistryEntry.helper){
				oRegistryEntry.helper.destroy();
			}
			oRegistryEntry.helper = new PropertyHelper(aCustomPropertyInfo);
			return Promise.resolve(oRegistryEntry.oPropertyHelper);
		}

		if (oRegistryEntry.helper) {
			return Promise.resolve(oRegistryEntry.helper);
		}

		return vControl.initPropertyHelper().then(function(oPropertyHelper){
			oRegistryEntry.helper = oPropertyHelper;
		}, function(sHelperError){
			throw new Error(sHelperError);
		});
	};

	/**
	 * This method can be used to initialize the Controller housekeeping.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} sKey The registerd key to get the corresponding Controller.
	 *
	 */
	Engine.prototype._prepareAdaptationData = function(vControl, sKey){

		var oRegistryEntry = this._getRegistryEntry(vControl);

		var oController = this.getController(vControl, sKey);
		var oPropertyHelper = oRegistryEntry.helper;

		oController.setP13nData(oPropertyHelper);
	};

	/**
	 * @private
	 * @MDC_PUBLIC_CANDIDATE
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
	 * @private
	 *
	 * This method can be used for debugging to retrieve the complete registry.
	 */
	Engine.prototype._getRegistry = function() {
		var oRegistry = {};
		this._aRegistry.forEach(function(sKey){
			var oControl = sap.ui.getCore().byId(sKey);
			oRegistry[sKey] = _mRegistry.get(oControl);
		});
		return oRegistry;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	Engine.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		oEngine = null;
		this._aRegistry = null;
		_mRegistry.delete(this);
		this.defaultProviderRegistry.destroy();
		this.defaultProviderRegistry = null;
	};

	return Engine;
});
