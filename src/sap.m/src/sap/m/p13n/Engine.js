/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/modules/AdaptationProvider",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/m/p13n/modification/FlexModificationHandler",
	"sap/m/MessageStrip",
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/m/p13n/modules/DefaultProviderRegistry",
	"sap/m/p13n/modules/UIManager",
	"sap/m/p13n/modules/StateHandlerRegistry",
	"sap/m/p13n/modules/xConfigAPI"
], function (AdaptationProvider, merge, Log, FlexModificationHandler, MessageStrip, coreLibrary, Element, DefaultProviderRegistry, UIManager, StateHandlerRegistry, xConfigAPI) {
	"use strict";

	var ERROR_INSTANCING = "Engine: This class is a singleton. Please use the getInstance() method instead.";

	//Shortcut to 'MessageType'
	var MessageType = coreLibrary.MessageType;

	/*global WeakMap */
	var _mRegistry = new WeakMap();

	//Singleton storage
	var oEngine;

	/**
	 *
	 * The <code>Engine</code> offers personalization capabilities by registering a control instance for modification such as:
	 *
	 * <ul>
	 * <li><code>sap.m.p13n.Popup</code> initialization</li>
	 * <li>Storing personalization states by choosing the desired persistence layer</li>
	 * <li>State appliance considering the persistence layer</li>
	 * </ul>
	 *
	 * The Engine should be used whenever personalization should be enabled by considering a certain persistence layer.
	 * Available controller implementations for the registration process are:
	 *
	 * <ul>
	 * <li>{@link sap.m.p13n.SelectionController SelectionController}: can be used to define a list of selectable entries</li>
	 * <li>{@link sap.m.p13n.SortController SortController}: can be used to define a list of sortable properties</li>
	 * <li>{@link sap.m.p13n.GroupController GroupController}: can be used to define a list of groupable properties</li>
	 * </ul>
	 *
	 * The following persistence layers can be chosen for personalization services:
	 *
	 * <ul>
	 * <li>{@link sap.m.p13n.modification.FlexModificationHandler FlexModificationHandler}: Can be used in combination with <code>sap.ui.fl.variants.VariantManagement</code> to persist state in variant using <code>sap.ui.fl</code> capabilities.</li>
	 * <li>{@link sap.m.p13n.modification.LocalStorageModificationHandler LocalStorageModificationHandler}: can be used to store personalization state in the local storage</li>
	 * <li>{@link sap.m.p13n.modification.ModificationHandler ModificationHandler}: will be used by default - this handler will not persist state.</li>
	 * </ul>
	 *
	 * @namespace
	 * @alias sap.m.p13n.Engine
	 * @extends sap.m.p13n.AdaptationProvider
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 * @since 1.104
	 */
	var Engine = AdaptationProvider.extend("sap.m.p13n.Engine", {
		constructor: function() {
			AdaptationProvider.call(this);

			if (oEngine) {
				throw Error(ERROR_INSTANCING);
			}

			this._aRegistry = [];
			this._aStateHandlers = [];

			//Default Provider Registry to be used for internal PersistenceProvider functionality access
			this.defaultProviderRegistry = DefaultProviderRegistry.getInstance();

			//UIManager to be used for p13n UI creation
			this.uimanager = UIManager.getInstance(this);

			//Default state Handler Registry to be used for state event handling
			this.stateHandlerRegistry = StateHandlerRegistry.getInstance();
		}
	});

	/**
	 *
	 *
	 * This method should only be called once per instance to register provided
	 * classes of <code>sap.m.p13n.Controller</code> for the control instance.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 * @param {sap.ui.core.Control} oControl The control instance to be registered for adaptation
	 * @param {Object} oConfig The config object providing key value pairs of keys and
	 * <code>sap.m.p13n.*Controller</code> classes.
	 *
	 * @example
	 *  {
	 * 		modification: new FlexModificationHandler(),
	 * 		helper: new Helper([
	 * 			{key: "idA", label: "Field A", path: "path/propA"},
	 * 			{key: "idB", label: "Field B", path: "path/propB"}
	 * 		]),
	 * 		controller: {
	 * 			Item: new SelectionController({
	 * 				control: oMyControl,
	 * 				targetAggregation: "items"
	 * 			}),
	 * 			Sort: new SortController({
	 * 				control: oMyControl
	 * 			}),
	 * 			Filter: new GroupController({
	 * 				control: oMyControl
	 * 			})
	 * 		}
	 *	}
	 */
	 Engine.prototype.register = function(oControl, oConfig) {

		if (!oConfig.hasOwnProperty("controller") || Object.keys(oConfig.controller).length < 1) {
			throw new Error("Please provide at least a configuration 'controller' containing a map of key-value pairs (key + Controller class) in order to register adaptation.");
		}

		if (!oConfig.hasOwnProperty("helper") || !(oConfig.helper.getProperties instanceof Function)) {
			throw new Error("Please provide at least a configuration 'helper' containing a metadata helper instance implementing a #getProperties function.");
		}

		var oRegistryEntry = this._getRegistryEntry(oControl);

		if (oRegistryEntry){
			this.deregister(oControl);
		}

		oRegistryEntry = this._createRegistryEntry(oControl, oConfig);

		var aControllerKeys = Object.keys(oConfig.controller);

		aControllerKeys.forEach(function(sKey){

			var oSubController = oConfig.controller[sKey];

			if (!this.getController(oControl, sKey)) {
				if (this._aRegistry.indexOf(oControl.getId()) < 0){
					this._aRegistry.push(oControl.getId());
				}

				this.addController(oSubController, sKey);
			}

		}.bind(this));

		this.getModificationHandler(oControl).initialize(oControl);

	};


	/**
	 * Deregister a registered control. By deregistering a control the control will
	 * be removed from the <code>Engine</code> registry and all instance specific sub
	 * modules such as the registered controllers are going to be destroyed.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 * @param {sap.ui.core.Control} oControl The registered control instance
	 */
	Engine.prototype.deregister = function(oControl) {
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
	 * Opens the personalization dialog.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 *
	 * @param {sap.ui.core.Control} oControl The control instance to be personalized
	 * @param {string|string[]} vPanelKeys The affected panels that should be added to the <code>sap.m.p13n.Popup</code>
	 * @param {object} mSettings The settings object for the personalization
	 * @param {string} [mSettings.title] The title for the <code>sap.m.p13n.Popup</code> control
	 * @param {sap.ui.core.Control} [mSettings.source] The source control to be used by the <code>sap.m.p13n.Popup</code> control (only necessary in case the mode is set to <code>ResponsivePopover</code>)
	 * @param {object} [mSettings.mode] The mode to be used by the <code>sap.m.p13n.Popup</code> control
	 * @param {object} [mSettings.contentHeight] Height configuration for the related popup container
	 * @param {object} [mSettings.contentWidth] Width configuration for the related popup container
	 *
	 * @returns {Promise} Promise resolving in the <code>sap.m.p13n.Popup</code> instance.
	 */
	Engine.prototype.show = function(oControl, vPanelKeys, mSettings) {
		return this.uimanager.show(oControl, vPanelKeys, mSettings);
	};

	/**
	 * Attaches an event handler to the <code>StateHandlerRegistry</code> class.
	 * The event handler may be fired every time a user triggers a personalization change for a control instance during runtime.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 * @param {function} fnStateEventHandler The handler function to call when the event occurs
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Engine.prototype.attachStateChange = function(fnStateEventHandler) {
		return this.stateHandlerRegistry.attachChange(fnStateEventHandler);
	};

	/**
	 * Removes a previously attached state change event handler from the <code>StateHandlerRegistry</code> class.
	 * The passed parameters must match those used for registration with {@link sap.m.p13n.Engine#attachStateChange} beforehand.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 * @param {function} fnStateEventHandler The handler function to detach from the event
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Engine.prototype.detachStateChange = function(fnStateEventHandler) {
		return this.stateHandlerRegistry.detachChange(fnStateEventHandler);
	};

	/**
	 * This method can be used to trigger a reset on the provided control instance.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 * @param {sap.ui.core.Control} oControl The according control instance.
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
	 * Apply a State on a control by passing an object that contains the
	 * registered controller key and an object matching the innter subcontroller housekeeping.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 * @example {
	 * 		ControllerKey: [{<someState>}, {...}]
	 * }
	 *
	 * @param {sap.ui.core.Control} oControl The registered control instance
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

			var aKeys = Object.keys(oState);
			aKeys.forEach(function(sControllerKey){

				var oController = this.getController(oControl, sControllerKey);

				if (!oController){
					//TODO: p13nMode <> register <> StateUtil key alignment
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
				var mChangeMap = {};

				aRawChanges.forEach(function(aSpecificChanges, iIndex){

					if (aSpecificChanges && aSpecificChanges.length > 0){
						aChanges = aChanges.concat(aSpecificChanges);
						var sKey = aKeys[iIndex];
						mChangeMap[sKey] = aSpecificChanges;
					}
				});

				return this._processChanges(oControl, mChangeMap);
			}.bind(this));

		}.bind(this));
	};

	/**
	 *
	 *  Retrieves the externalized state for a given control instance,
	 *  after all necessary changes have been applied (e.g. modification handler appliance).
	 *  After the returned Promise has been resolved, the returned State is in sync with the according
	 *  state object of the control.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 * @param {object} oControl The control instance implementing IxState to retrieve the externalized state
	 *
	 * @returns {Promise} a Promise resolving in the current control state.
	 */
	Engine.prototype.retrieveState = function(oControl) {

		//ensure that the control has been initialized
		return this.checkControlInitialized(oControl).then(function() {

			//ensure that all changes have been applied
			return Engine.getInstance().waitForChanges(oControl).then(function() {

				var oRetrievedState = {};
				Engine.getInstance().getRegisteredControllers(oControl).forEach(function(sKey){
					oRetrievedState[sKey] = Engine.getInstance().getController(oControl, sKey).getCurrentState(true);
				});

				return merge({}, oRetrievedState);

			});

		});

	};

	/**
	 * This method can be used to set the modification handling for a control instance.
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance
	 * @param {sap.m.p13n.modification.ModificationHandler} oModificationHandler The modification handler object
	 */
	Engine.prototype._setModificationHandler = function(vControl, oModificationHandler) {
		if (!oModificationHandler.isA("sap.m.p13n.modification.ModificationHandler")) {
			throw new Error("Only sap.m.p13n.modification.ModificationHandler derivations are allowed for modification");
		}
		var oModificationSetting = this._determineModification(vControl); //check and calculate modification basics
		oModificationSetting.handler = oModificationHandler;
		this._getRegistryEntry(vControl).modification = oModificationSetting;
	};

	var fnQueue = function(oControl, fTask) {
		var fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pModificationQueue === pOriginalPromise){
				delete oControl._pModificationQueue;
			}
		};

		oControl._pModificationQueue = oControl._pModificationQueue instanceof Promise ? oControl._pModificationQueue.then(fTask) : fTask();
		oControl._pModificationQueue.then(fCleanupPromiseQueue.bind(null, oControl._pModificationQueue));

		return oControl._pModificationQueue;
	};

	/**
	 * <code>Engine#createChanges</code> can be used to programmatically trigger the creation
	 * of a set of changes based on the current control state and the provided state.
	 *
	 * @ui5-restricted
	 *
	 * @param {object} mDiffParameters A map defining the configuration to create the changes.
	 * @param {sap.ui.core.Control} mDiffParameters.control The control instance tht should be adapted.
	 * @param {string} mDiffParameters.key The key used to retrieve the corresponding Controller.
	 * @param {object} mDiffParameters.state The state which should be applied on the provided control instance
	 * @param {boolean} [mDiffParameters.applyAbsolute] Decides whether unmentioned entries should be affected,
	 * @param {boolean} [mDiffParameters.stateBefore] In case the state should be diffed manually
	 * for example if "A" is existing in the control state, but not mentioned in the new state provided in the
	 * mDiffParameters.state then the absolute appliance decides whether to remove "A" or to keep it.
	 * @param {boolean} [mDiffParameters.suppressAppliance] Decides whether the change should be applied directly.
	 * @param {boolean} [mDiffParameters.applySequentially] Decides whether the appliance should be queued or processed in parallel.
	 * Controller
	 *
	 * @returns {Promise} A Promise resolving in the according delta changes.
	 */
	Engine.prototype.createChanges = function(mDiffParameters) {

		var sKey = mDiffParameters.key;
		var aNewState = mDiffParameters.state;
		var bApplyAbsolute = !!mDiffParameters.applyAbsolute;
		var bSuppressCallback = !!mDiffParameters.suppressAppliance;
		var bApplySequentially = !!mDiffParameters.applySequentially;

		if (!sKey || !mDiffParameters.control || !aNewState) {
			throw new Error("To create changes via Engine, atleast a 1)Control 2)Key and 3)State needs to be provided.");
		}

		var oControl = Engine.getControlInstance(mDiffParameters.control);

		var fDeltaHandling = function() {
			return this.initAdaptation(oControl, sKey).then(function(){

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
					deltaAttributes: ["key"],
					propertyInfo: oRegistryEntry.helper.getProperties().map(function(a){return {key: a.key};})
				};

				//Only execute change calculation in case there is a difference (--> example: press 'Ok' without a difference)
				var aChanges = oController.getDelta(mDeltaConfig);

				if (!bSuppressCallback) {
					var mChangeMap = {};
					mChangeMap[sKey] = aChanges;
					return this._processChanges(oControl, mChangeMap);
				}

				return aChanges || [];

			}.bind(this));

		}.bind(this);

		if (bApplySequentially) {
			return fnQueue(oControl, fDeltaHandling);
		} else {
			return fDeltaHandling.apply(this);
		}
	};

	/**
	 * Returns a promise resolving after all currently pending modifications have been applied.
	 *
	 * @ui5-restricted
	 *
	 * @param {sap.ui.core.Control} oControl The according control instance.
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
	 * @ui5-restricted
	 * @param {sap.ui.core.Control} oControl The according control instance.
	 *
	 * @returns {Promise} A Promise resolving in a boolean whether the requirements for the persistence layer are met.
	 */
	Engine.prototype.isModificationSupported = function(oControl) {
		var oModificationSetting = this._determineModification(oControl);
		return oModificationSetting.handler.isModificationSupported({
			element: oControl
		}, oModificationSetting.payload);
	};

	Engine.prototype.fireStateChange = function(oControl) {
		return this.retrieveState(oControl).then(function(oState){
			this.stateHandlerRegistry.fireChange(oControl, oState);
		}.bind(this));
	};

	/**
	 * This method can be used to process an array of changes.
	 * @ui5-restricted
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance
	 * @param {object} mChanges A map of keys and arrays, every controller will provide an array of changes
	 * @returns {Promise} The change appliance promise.
	 */
	Engine.prototype._processChanges = function(vControl, mChanges) {
		var aChanges = [];
		var aKeys = Object.keys(mChanges);

		aKeys.forEach(function(sKey){
			aChanges = aChanges.concat(mChanges[sKey]);
		});

		if (aChanges instanceof Array && aChanges.length > 0) {
			var oModificationSetting = this._determineModification(vControl);
			return oModificationSetting.handler.processChanges(aChanges, oModificationSetting.payload)
			.then(function(aChanges){
				return aChanges;
			});
		} else {
			return Promise.resolve([]);
		}
	};

	/**
	 * This method can be used in the control's according designtime metadata
	 * for keyuser personalization.
	 *
	 * @ui5-restricted
	 *
	 * @param {sap.ui.core.Control} oControl The registered control instance.
	 * @param {object} mPropertyBag The propertybag provided in the settings action.
	 * @param {string} aKeys The keys to be used to display in the corresponding Controller
	 *
	 * @returns {Promise} A Promise resolving in the set of changes to be created during RTA.
	 */
	Engine.prototype.getRTASettingsActionHandler = function (oControl, mPropertyBag, aKeys) {

		var fResolveRTA;

		//var aVMs = this.hasForReference(oControl, "sap.ui.fl.variants.VariantManagement");
		// TODO: clarify if we need this error handling / what to do with the Link if we want to keep it
		var aPVs = this.hasForReference(oControl, "sap.m.p13n.PersistenceProvider");

		if (aPVs.length > 0 && !oControl.isA("sap.m.link.Panel")) {
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
			var oCustomHeader = oContainer._oPopup.getCustomHeader();
			if (oCustomHeader) {
				oCustomHeader.getContentRight()[0].setVisible(false);
			}
			oContainer._oPopup.addStyleClass(mPropertyBag.styleClass);
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
	 * @ui5-restricted
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance.
	 * @param {object} mEnhanceConfig An object providing the information about the xConfig enhancement
	 * @param {object} mEnhanceConfig.key The affected property name
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

		return xConfigAPI.enhanceConfig(oControl, mEnhanceConfig)
		.then(function(oConfig){
			if (oRegistryEntry) {
				//to simplify debugging
				oRegistryEntry.xConfig = oConfig;
			}
		});
	};

	/**
	 * Returns a copy of the xConfig object
	 *
	 * @ui5-restricted sap.m
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
	 * @param {string|sap.ui.core.Control} vControl The registered control instance
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
	 * @param {string|sap.ui.core.Control} vControl The registered control instance
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

	Engine.prototype.checkControlInitialized = function(vControl) {
		var oControl = Engine.getControlInstance(vControl);
		return oControl.initialized instanceof Function ? oControl.initialized() : Promise.resolve();
	};

	Engine.prototype.checkPropertyHelperInitialized = function(vControl) {
		var oControl = Engine.getControlInstance(vControl);
		return oControl.initPropertyHelper instanceof Function ? oControl.initPropertyHelper() : Promise.resolve();
	};

	/**
	 * This method can be used to initialize the Controller housekeeping.
	 *
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance
	 * @param {string|string[]} aKeys The key for the according Controller
	 * @param {Object[]} aCustomInfo A custom set of propertyinfos as base to create the UI
	 *
	 * @returns {Promise} A Promise resolving after the adaptation housekeeping has been initialized.
	 */
	Engine.prototype.initAdaptation = function(vControl, aKeys) {
		this.verifyController(vControl, aKeys);

		//1) Cache property helper
		var oRegistryEntry = this._getRegistryEntry(vControl);
		var oControl = Engine.getControlInstance(vControl);

		if (oRegistryEntry.helper) {
			return Promise.resolve(oRegistryEntry.helper);
		}

		return this.checkPropertyHelperInitialized(oControl).then(function (oPropertyHelper) {
			oRegistryEntry.helper = oPropertyHelper;
			return oPropertyHelper;
		}, function (sHelperError) {
			throw new Error(sHelperError);
		});

	};

	/**
	 * This method should only be used to register a new Controller.
	 *
	 * @private
	 *
	 * @param {sap.m.p13n.subcontroller.Controller} oController The controller instance.
	 * @param {string} sKey The key that defines the later access to the controller instance.
	 * @param {object} oPreConfig A predefined configuration
	 */
	Engine.prototype.addController = function(oController, sKey, oPreConfig) {
		var oRegistryEntry = this._getRegistryEntry(oController.getAdaptationControl(), oPreConfig);
		oRegistryEntry.controller[sKey] = oController;
	};

	/**
	 * This method can be used to get a controller instance.
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered Control instance.
	 * @param {string} sKey The key for which the controller has been registered.
	 *
	 * @returns {sap.m.p13n.SelectionController} The controller instance
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
	 * @param {sap.ui.core.Control} vControl The registered Control instance.
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
	 * @param {sap.ui.core.Control} vControl The registered Control instance.
	 * @param {string|string[]} vKeys A key as string or an array of keys
	 *
	 * @returns {object} The requested UI settings of the control instance and provided keys
	 */
	Engine.prototype.getUISettings = function(vControl, vKeys) {
		var aKeys = Array.isArray(vKeys) ? vKeys : [vKeys];
		this.verifyController(vControl, aKeys);
		var oPropertyHelper = this._getRegistryEntry(vControl).helper;
		var mUiSettings = {}, aPanelCreation = [];

		aKeys.forEach(function(sKey){
			var oController = this.getController(vControl, sKey);
			var pAdaptationUI = oController.initAdaptationUI(oPropertyHelper);

			//Check faceless controller implementations and skip them
			if (pAdaptationUI instanceof Promise){
				aPanelCreation.push(pAdaptationUI);
			}
		}.bind(this));

		return Promise.all(aPanelCreation)
		.then(function(aPanels){
			aPanels.forEach(function(oPanel, iIndex){
				var sKey = aKeys[iIndex];
				mUiSettings[sKey] = {
					panel: oPanel
				};
			});
			return mUiSettings;
		});
	};

	/**
	 * This method can be used to determine if modification settings for a control have already been created.
	 *
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered Control instance
 	 * @returns {boolean} true if modification settings were already determined
	 */
	Engine.prototype.isRegisteredForModification = function(vControl) {
		var oRegistryEntry = this._getRegistryEntry(vControl);
		return oRegistryEntry && !!oRegistryEntry.modification;
	};

	/**
	 * Returns an array of all registered controllers
	 *
	 * @param {string|sap.ui.core.Control} vControl The control ID or instance
	 * @returns {array} An array of all registered controller instances
	 */
	Engine.prototype.getRegisteredControllers = function(vControl){
		var oRegistryEntry = this._getRegistryEntry(vControl);
		return Object.keys(oRegistryEntry.controller);
	};

	/**
	 * This method can be used to get the registry entry for a control instance
	 *
	 * @private
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
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
	 * @ui5-restricted sap.m
	 *
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
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
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
	 * @param {object} oPreConfig A predefined configuration
	 * @returns {object} The according registry entry
	 */
	Engine.prototype._createRegistryEntry = function(vControl, oPreConfig) {

		var oControl = Engine.getControlInstance(vControl);

		if (!_mRegistry.has(oControl)) {

			_mRegistry.set(oControl, {
				modification: oPreConfig && oPreConfig.modification ? {
					handler: oPreConfig.modification,//TBD
					payload: {
						mode: "Auto",//TBD,
						hasVM: true,
						hasPP: false
					}
				} : null,
				controller: {},
				activeP13n: null,
				helper: oPreConfig && oPreConfig.helper ? oPreConfig.helper : null,
				xConfig: null
			});

		}

		return _mRegistry.get(oControl);
	};

	/**
	 * Determines and registers the ModificationHandler per control instance
	 *
	 * @private
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
	 * @returns {object} The according modification registry entry
	 */
	Engine.prototype._determineModification = function (vControl) {

		var oRegistryEntry = this._getRegistryEntry(vControl);

		//Modification setting is only calculated once per control instance
		if (oRegistryEntry && oRegistryEntry.modification) {
			return oRegistryEntry.modification;
		}

		var aPPResults = this.hasForReference(vControl, "sap.m.p13n.PersistenceProvider");
		var aVMResults = this.hasForReference(vControl, "sap.ui.fl.variants.VariantManagement");

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

	Engine.prototype.hasForReference = function(vControl, sControlType) {
		var sControlId = vControl && vControl.getId ? vControl.getId() : vControl;
		var aResults = Element.registry.filter(function (oElement) {
			if (!oElement.isA(sControlType)) {
				return false;
			}
			var aFor = oElement.getFor instanceof Function ? oElement.getFor() : [];
			for (var n = 0; n < aFor.length; n++) {
				if (aFor[n] === sControlId || this.hasControlAncestorWithId(sControlId, aFor[n])) {
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
	Engine.prototype.hasControlAncestorWithId = function(sControlId, sAncestorControlId) {
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
	 * or the Control's ID.
	 *
	 * @private
	 *
	 * @param {string|sap.ui.core.Control} vControl The control ID or instance
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
	 * @param {string|sap.ui.core.Control} vControl The control ID or instance
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
	 * @param {sap.ui.core.Control} vControl The registered control instance.
	 * @param {string} sKey The registered key to get the corresponding Controller.
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
	 * @param {sap.ui.core.Control} vControl The registered control instance.
	 * @param {string} sKey The registered key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oP13nUI The adaptation UI displayed in the container (e.g. BasePanel derivation).
	 */
	Engine.prototype.validateP13n = function(vControl, sKey, oP13nUI) {
		var oController = this.getController(vControl, sKey);
		var oControl = Engine.getControlInstance(vControl);


		var mControllers = this._getRegistryEntry(vControl).controller;
		var oTheoreticalState = {};

		Object.keys(mControllers).forEach(function(sControllerKey){
			oTheoreticalState[sControllerKey] = mControllers[sControllerKey].getCurrentState();
		});

		//Only execute validation for controllers that support 'model2State'
		if (oController && oController.model2State instanceof Function) {
			oTheoreticalState[sKey] = oController.model2State();

			var mInfoState = {
				validation: MessageType.None
			};
			if (oControl.validateState instanceof Function) {
				mInfoState = oControl.validateState(this.externalizeKeys(oControl, oTheoreticalState), sKey);
			}

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

		}

	};

	/**
	 * Reads the current state of the subcontrollers and triggers a state appliance
	 *
	 * @param {sap.ui.core.Control} oControl The registered Control instance.
	 * @param {string[]} aKeys An array of keys
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
			var mChangeMap = {};
			aChangeMatrix.forEach(function(aTypeChanges, iIndex){
				aApplyChanges = aApplyChanges.concat(aTypeChanges);
				var sKey = aKeys[iIndex];
				mChangeMap[sKey] = aTypeChanges;
			});

			if (aApplyChanges.length > 0) {
				Engine.getInstance()._processChanges(oControl, mChangeMap);
			}
		});

	};

	/**
	 * @private
	 * @ui5-restricted sap.m
	 *
	 * This method is the central point of access to the Engine Singleton.
	 * @returns {sap.m.p13n.Engine} The Engine instance
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
	 * @returns {object} The Engine registry object
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
		this.uimanager.destroy();
		this.uimanager = null;
	};

	return Engine.getInstance();
});