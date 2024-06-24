/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/modules/AdaptationProvider",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/m/p13n/modification/FlexModificationHandler",
	"sap/m/MessageStrip",
	"sap/ui/core/Element",
	"sap/ui/core/ElementRegistry",
	"sap/ui/core/message/MessageType",
	"sap/m/p13n/modules/DefaultProviderRegistry",
	"sap/m/p13n/modules/UIManager",
	"sap/m/p13n/modules/StateHandlerRegistry",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/m/p13n/enums/ProcessingStrategy"
], (
	AdaptationProvider,
	merge,
	Log,
	FlexModificationHandler,
	MessageStrip,
	Element,
	ElementRegistry,
	MessageType,
	DefaultProviderRegistry,
	UIManager,
	StateHandlerRegistry,
	xConfigAPI,
	ProcessingStrategy
) => {
	"use strict";

	const ERROR_INSTANCING = "Engine: This class is a singleton. Please use the getInstance() method instead.";

	/*global WeakMap */
	const _mRegistry = new WeakMap();

	//Singleton storage
	let oEngine;

	/**
	 *
	 * @class
	 * The <code>Engine</code> entity offers personalization capabilities by registering a control instance for modification, such as:
	 *
	 * <ul>
	 * <li><code>sap.m.p13n.Popup</code> initialization</li>
	 * <li>Storing personalization states by choosing the desired persistence layer</li>
	 * <li>State appliance considering the persistence layer</li>
	 * </ul>
	 *
	 * The Engine must be used whenever personalization should be enabled by taking a certain persistence layer into account.
	 * Available controller implementations for the registration process are:
	 *
	 * <ul>
	 * <li>{@link sap.m.p13n.SelectionController SelectionController}: Used to define a list of selectable entries</li>
	 * <li>{@link sap.m.p13n.SortController SortController}: Used to define a list of sortable properties</li>
	 * <li>{@link sap.m.p13n.GroupController GroupController}: Used to define a list of groupable properties</li>
	 * </ul>
	 *
	 * Can be used in combination with <code>sap.ui.fl.variants.VariantManagement</code> to persist a state in variants using <code>sap.ui.fl</code> capabilities.</li>
	 *
	 * @see {@link topic:75c08fdebf784575947927e052712bab Personalization}
	 * @alias sap.m.p13n.Engine
	 * @extends sap.m.p13n.modules.AdaptationProvider
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.104
	 */
	const Engine = AdaptationProvider.extend("sap.m.p13n.Engine", {
		constructor: function() {
			AdaptationProvider.call(this);

			if (oEngine) {
				throw Error(ERROR_INSTANCING);
			}

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
	 * The <code>sap.m.p13n</code> namespace offers generic personalization capabilites.
	 * Personalization currently supports, for example, defining the order of columns in a table and their visibility, sorting, and grouping. To enable this, the personalization engine can be used.
	 * @namespace
	 * @name sap.m.p13n
	 * @public
	 */

	/**
	 *
	 * The central registration for personalization functionality.
	 * The registration is a precondition for using <code>Engine</code> functionality for a control instance.
	 * Once the control instance has been registered, it can be passed to the related <code>Engine</code>
	 * methods that always expect a control instance as parameter. Only registered control instances can be used for personalization through the <code>Engine</code>.
	 * @public
	 * @typedef {object} sap.m.p13n.EngineRegistrationConfig
	 * @property {sap.m.p13n.MetadataHelper} helper The <code>{@link sap.m.p13n.MetadataHelper MetadataHelper}</code> to provide metadata-specific information. It may be used to define more granular information for the selection of items.
	 * @property {Object<string,sap.m.p13n.SelectionController>} controller A map of arbitrary keys that contain a controller instance as value. The key must be unique and needs to be provided for later access when using <code>Engine</code> functionality specific for one controller type.
	 */

	/**
	 * @public
	 *
	 * @param {sap.ui.core.Control} oControl The control instance to be registered for adaptation
	 * @param {sap.m.p13n.EngineRegistrationConfig} oConfig The Engine registration configuration
	 *
	 * @example
	 *  {
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

		if (!oConfig.hasOwnProperty("controller") /* || Object.keys(oConfig.controller).length < 1*/) {
			throw new Error("Please provide at least a configuration 'controller' containing a map of key-value pairs (key + Controller class) in order to register adaptation.");
		}

		let oRegistryEntry = this._getRegistryEntry(oControl);

		if (oRegistryEntry) {
			this.deregister(oControl);
		}

		oRegistryEntry = this._createRegistryEntry(oControl, oConfig);

		const aControllerKeys = Object.keys(oConfig.controller);

		aControllerKeys.forEach((sKey) => {

			const oSubController = oConfig.controller[sKey];

			if (!this.getController(oControl, sKey)) {
				if (this._aRegistry.indexOf(oControl.getId()) < 0) {
					this._aRegistry.push(oControl.getId());
				}

				this.addController(oSubController, sKey);
			}

		});

		//In case the control is marked as modified, the state change event is triggered once initially to apply the default state
		const oXConfig = oControl.getCustomData().find((oCustomData) => oCustomData.getKey() == "xConfig");
		if (oXConfig && JSON.parse((oXConfig.getValue()).replace(/\\/g, ''))?.modified) {
			this.fireStateChange(oControl);
		}

	};


	/**
	 * Unregisters a registered control. By unregistering a control the control is
	 * removed from the <code>Engine</code> registry, and all instance-specific submodules,
	 * such as the registered controllers, are destroyed.
	 *
	 * @public
	 *
	 * @param {sap.ui.core.Control} oControl The registered control instance
	 */
	Engine.prototype.deregister = function(oControl) {
		const oRegistryEntry = this._getRegistryEntry(oControl);

		//destroy subcontroller
		Object.keys(oRegistryEntry.controller).forEach((sKey) => {
			const oController = oRegistryEntry.controller[sKey];
			oController.destroy();

			delete oRegistryEntry.controller[sKey];
		});

		//Remove the control from the weakmap housekeeping
		_mRegistry.delete(oControl);

		//Remove the control from the array to maintain debugging
		const iControlIndex = this._aRegistry.indexOf(oControl.getId());
		this._aRegistry.splice(iControlIndex, 1);
	};

	/**
	 * Opens the personalization dialog.
	 *
	 * @public
	 *
	 *
	 * @param {sap.ui.core.Control} oControl The control instance that is personalized
	 * @param {string|string[]} vPanelKeys The affected panels that are added to the <code>sap.m.p13n.Popup</code>
	 * @param {object} mSettings The settings object for the personalization
	 * @param {string} [mSettings.title] The title for the <code>sap.m.p13n.Popup</code> control
	 * @param {sap.ui.core.Control} [mSettings.source] The source control to be used by the <code>sap.m.p13n.Popup</code> control (only necessary if the mode is set to <code>ResponsivePopover</code>)
	 * @param {object} [mSettings.mode] The mode is used by the <code>sap.m.p13n.Popup</code> control
	 * @param {object} [mSettings.contentHeight] Height configuration for the related popup container
	 * @param {object} [mSettings.contentWidth] Width configuration for the related popup container
	 *
	 * @returns {Promise<sap.m.p13n.Popup>} Promise resolving in the <code>sap.m.p13n.Popup</code> instance
	 */
	Engine.prototype.show = async function(oControl, vPanelKeys, mSettings) {
		const enableReset = await this.hasChanges(oControl, vPanelKeys)
		.catch((oError) => {
			return false;
		});
		const oDialog = await this.uimanager.show(oControl, vPanelKeys, {
			...mSettings,
			enableReset
		});
		return oDialog.getParent();
	};

	/**
	 * Attaches an event handler to the <code>StateHandlerRegistry</code> class.
	 * The event handler is fired every time a user triggers a personalization change for a control instance during runtime.
	 *
	 * @public
	 *
	 * @param {function(sap.ui.base.Event):void} fnStateEventHandler The handler function to call when the event occurs
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
	 *
	 * @param {function(sap.ui.base.Event):void} fnStateEventHandler The handler function to detach from the event
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Engine.prototype.detachStateChange = function(fnStateEventHandler) {
		return this.stateHandlerRegistry.detachChange(fnStateEventHandler);
	};

	/**
	 * Check if there are changes for a given control instance
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 *
	 * @param {sap.ui.core.Control} control The control instance
	 * @param {string} key The affected controller key
	 * @returns {Promise<boolean>} A Promise that resolves if the given control instance has applied changes
	 */
	Engine.prototype.hasChanges = function(control, key) {
		const oChangeOperations = this.getController(control, key)?.getChangeOperations();
		let changeTypes;
		if (oChangeOperations) {
			changeTypes = [];
			Object.values(oChangeOperations).forEach((vChangeOperation) => {
				if (Array.isArray(vChangeOperation)) {
					changeTypes = changeTypes.concat(vChangeOperation);
				} else {
					changeTypes.push(vChangeOperation);
				}
			});
		}
		let selectors = [];
		if (this.getController(control, key)?.getSelectorsForHasChanges) {
			selectors = selectors.concat(this.getController(control, key).getSelectorsForHasChanges());
		} else {
			selectors.push(control);
		}

		const oModificationSetting = this._determineModification(control);
		return this.getModificationHandler(control).hasChanges({
			selector: control,
			selectors,
			changeTypes
		}, oModificationSetting?.payload).then((enableReset) => {
			return enableReset;
		});
	};

	/**
	 * This method can be used to trigger a reset to the provided control instance.
	 *
	 * @public
	 *
	 * @param {sap.ui.core.Control} oControl The related control instance
	 * @param {string} aKeys The key for the affected configuration
	 *
	 * @returns {Promise<null>} A Promise resolving once the reset is completed
	 */
	Engine.prototype.reset = function(oControl, aKeys) {

		if (aKeys === undefined) {
			aKeys = this.getRegisteredControllers(oControl);
		}

		aKeys = aKeys instanceof Array ? aKeys : [aKeys];

		let aSelectors = [];

		aKeys.forEach((sKey) => {
			aSelectors = aSelectors.concat(this.getController(oControl, sKey).getSelectorForReset());
		});

		const oResetConfig = {
			selectors: aSelectors,
			selector: oControl
		};

		if (aKeys) {
			let aChangeTypes = [];
			aKeys.forEach((sKey) => {
				aChangeTypes = aChangeTypes.concat(Object.values(this.getController(oControl, sKey).getChangeOperations()));
			});
			oResetConfig.changeTypes = [].concat(...aChangeTypes);
		}

		const oModificationSetting = this._determineModification(oControl);
		return oModificationSetting.handler.reset(oResetConfig, oModificationSetting.payload).then(() => {
			//Re-Init housekeeping after update
			return this.initAdaptation(oControl, aKeys).then((oPropertyHelper) => {
				aKeys.forEach((sKey) => {
					const oController = this.getController(oControl, sKey);
					oController.update(oPropertyHelper);
				});
			});
		});
	};

	/**
	 *
	 * @public
	 * @typedef {object} sap.m.p13n.State
	 * @property {Object<string,Object[]>} controller A map of arbitrary keys that contain a controller instance as value. The key must be unique and needs to be provided for later access when using <code>Engine</code> functionality specific for one controller type.
	 */

	/**
	 * Applies a state to a control by passing an object that contains the
	 * registered controller key and an object matching the inner subcontroller logic.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 *
	 * @example {
	 *		RegisteredSortControllerKey: [{
	 *			key: "key1" //Adds key1 to the existing sorting
	 *		},
	 *		{
	 *			key: "key2",
	 *			sorted: false //Removes sorting for key2
	 *		},{
	 *			key: "key3",
	 *			position: 2 //Reorders current sorter position in the array
	 *		}],
	 *		RegisteredSelectionControllerKey: [{
	 *			key: "key1" //Adds key1 to the existing selection status
	 *		},
	 *		{
	 *			key: "key2",
	 *			visible: false //Removes selection status for key2
	 *		},{
	 *			key: "key3",
	 *			position: 2 //Reorders current item position in the array
	 *		}],
	 *		RegisteredGroupControllerKey: [{
	 *			key: "key1" //Adds key1 to the existing grouping status
	 *		},
	 *		{
	 *			key: "key2",
	 *			grouped: false //Removes grouping status for key2
	 *		},{
	 *			key: "key3",
	 *			position: 2 //Reorders current grouping position in the array
	 *		}
	 *	}
	 *
	 * @param {sap.ui.core.Control} oControl The registered control instance
	 * @param {sap.m.p13n.State} oState The state object
	 *
	 * @returns {Promise<sap.m.p13n.State>} A Promise resolving after the state has been applied
	 */
	Engine.prototype.applyState = function(oControl, oState) {

		//Call retrieve only to ensure that the control is initialized and enabled for modification
		return this.retrieveState(oControl).then((oCurrentState) => {
			const aStatePromise = [];
			let aChanges = [];
			let mInfoState = {};

			if (oControl.validateState instanceof Function) {
				mInfoState = oControl.validateState(this.externalizeKeys(oControl, oState));
			}

			if (mInfoState.validation === MessageType.Error) {
				Log.error(mInfoState.message);
			}

			const aKeys = Object.keys(oState);
			aKeys.forEach((sControllerKey) => {
				const oController = this.getController(oControl, sControllerKey);

				if (!oController) {
					//In case no controller can be found, skip change creation & appliance
					//to avoid errors and react gracefully
					return;
				}

				const oStatePromise = this.createChanges({
					control: oControl,
					key: sControllerKey,
					state: oController.sanityCheck(oState[sControllerKey]),
					suppressAppliance: true,
					applyAbsolute: false
				});

				aStatePromise.push(oStatePromise);
			});

			return Promise.all(aStatePromise).then((aRawChanges) => {
				const mChangeMap = {};

				aRawChanges.forEach((aSpecificChanges, iIndex) => {

					if (aSpecificChanges && aSpecificChanges.length > 0) {
						aChanges = aChanges.concat(aSpecificChanges);
						const sKey = aKeys[iIndex];
						mChangeMap[sKey] = aSpecificChanges;
					}
				});

				return this._processChanges(oControl, mChangeMap);
			});
		});
	};

	/**
	 *
	 *  Retrieves the state for a given control instance
	 *  after all necessary changes have been applied (e.g. modification handler appliance).
	 *  After the returned <code>Promise</code> has been resolved, the returned state is in sync with the related
	 *  state object of the control.
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 * @param {sap.ui.core.Control} oControl The control instance implementing IxState to retrieve the externalized state
	 *
	 * @returns {Promise<sap.m.p13n.State>} A Promise resolving in the current control state
	 */
	Engine.prototype.retrieveState = function(oControl) {

		//ensure that the control has been initialized
		return this.checkControlInitialized(oControl).then(() => {

			//ensure that all changes have been applied
			return Engine.getInstance().waitForChanges(oControl).then(() => {

				const oRetrievedState = {};
				Engine.getInstance().getRegisteredControllers(oControl).forEach((sKey) => {
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
		const oModificationSetting = this._determineModification(vControl); //check and calculate modification basics
		oModificationSetting.handler = oModificationHandler;
		this._getRegistryEntry(vControl).modification = oModificationSetting;
	};

	Engine.prototype._addToQueue = function(oControl, fTask) {
		const oRegistryEntry = this._getRegistryEntry(oControl);

		const fCleanupPromiseQueue = (pOriginalPromise) => {
			if (oRegistryEntry.pendingModification === pOriginalPromise) {
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
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 *
	 * @param {object} mDiffParameters A map defining the configuration to create the changes
	 * @param {sap.ui.core.Control} mDiffParameters.control The control instance that should be adapted
	 * @param {string} mDiffParameters.key The key used to retrieve the related controller
	 * @param {object} mDiffParameters.state The state that is applied to the provided control instance
	 * @param {sap.m.p13n.enum.ProcessingStrategy} [mDiffParameters.applyAbsolute] Determines about the comparison algorithm between two states
	 * @param {boolean} [mDiffParameters.stateBefore] If the state should be diffed manually;
	 * for example, if "A" exists in the control state, but is not mentioned in the new state provided in the
	 * mDiffParameters.state then the absolute appliance decides whether to remove "A" or to keep it.
	 * @param {boolean} [mDiffParameters.suppressAppliance] Determines whether the change is applied directly
	 * @param {boolean} [mDiffParameters.applySequentially] Determines whether the appliance is queued or processed in parallel
	 * controller
	 *
	 * @returns {Promise} A Promise resolving in the related delta changes
	 */
	Engine.prototype.createChanges = function(mDiffParameters) {

		const oControl = Engine.getControlInstance(mDiffParameters.control);
		const sKey = mDiffParameters.key;
		const vNewState = mDiffParameters.state;
		const bSuppressCallback = !!mDiffParameters.suppressAppliance;

		if (!sKey || !mDiffParameters.control || !vNewState) {
			return Promise.resolve([]);
		}

		const fDeltaHandling = () => {
			return this.initAdaptation(oControl, sKey).then(() => {
				return vNewState;
			})
				.then((aNewState) => {

					const oController = this.getController(oControl, sKey);
					const mChangeOperations = oController.getChangeOperations();

					const oRegistryEntry = this._getRegistryEntry(oControl);
					const oCurrentState = oController.getCurrentState();
					const oPriorState = merge(oCurrentState instanceof Array ? [] : {}, oCurrentState);

					const oControllerHelper = oController.getMetadataHelper();
					const oHelper = oControllerHelper ? oControllerHelper : oRegistryEntry.helper;
					const oPropertyInfo = oHelper.getProperties().map((a) => {
						return {
							key: a.key,
							name: a.name
						};
					});

					const mDeltaConfig = {
						existingState: mDiffParameters.stateBefore || oPriorState,
						applyAbsolute: mDiffParameters.applyAbsolute,
						changedState: aNewState,
						control: oController.getAdaptationControl(),
						changeOperations: mChangeOperations,
						deltaAttributes: ["key"],
						propertyInfo: oPropertyInfo
					};

					//Only execute change calculation in case there is a difference (--> example: press 'Ok' without a difference)
					const aChanges = oController.getDelta(mDeltaConfig);

					if (!bSuppressCallback) {
						const mChangeMap = {};
						mChangeMap[sKey] = aChanges;
						return this._processChanges(oControl, mChangeMap)
							.then(() => {
								return aChanges;
							});
					}

					return aChanges || [];

				});

		};

		return this._addToQueue(oControl, fDeltaHandling);
	};

	/**
	 * Returns a promise resolving after all currently pending modifications have been applied.
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 *
	 * @param {sap.ui.core.Control} oControl The related control instance
	 * @returns {Promise} A Promise resolving after all pending modifications have been applied
	 */
	Engine.prototype.waitForChanges = function(oControl) {
		const oModificationSetting = this._determineModification(oControl);
		const oRegistryEntry = this._getRegistryEntry(oControl);
		return oRegistryEntry && oRegistryEntry.pendingModification ? oRegistryEntry.pendingModification : Promise.resolve()
			.then(() => {
				return oModificationSetting.handler.waitForChanges({
					element: oControl
				}, oModificationSetting.payload);
			});
	};
	/**
	 * Determines whether the environment is suitable for the desired modification of the provided control instance.
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 * @param {sap.ui.core.Control} oControl The related control instance
	 *
	 * @returns {Promise} A Promise resolving in a Boolean that determines whether the requirements for the persistence layer are met
	 */
	Engine.prototype.isModificationSupported = function(oControl) {
		const oModificationSetting = this._determineModification(oControl);
		return oModificationSetting.handler.isModificationSupported({
			element: oControl
		}, oModificationSetting.payload);
	};

	Engine.prototype.fireStateChange = function(oControl) {
		return this.retrieveState(oControl).then((oState) => {
			this.stateHandlerRegistry.fireChange(oControl, oState);
		});
	};

	/**
	 * This method can be used to process an array of changes.
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance
	 * @param {object} mChanges A map of keys and arrays, every controller will provide an array of changes
	 * @returns {Promise} The change appliance <code>Promise</code>
	 */
	Engine.prototype._processChanges = function(vControl, mChanges) {
		let aChanges = [];
		const aKeys = Object.keys(mChanges);
		const oDiff = {};

		aKeys.forEach((sKey) => {
			oDiff[sKey] = this.getController(vControl, sKey).changesToState(mChanges[sKey]);
			aChanges = aChanges.concat(mChanges[sKey]);
		});

		if (aChanges instanceof Array && aChanges.length > 0) {
			const oModificationSetting = this._determineModification(vControl);
			return oModificationSetting.handler.processChanges(aChanges, oModificationSetting.payload);
		} else {
			return Promise.resolve([]);
		}
	};


	/**
	 * This method can be used in the designtime metadata of the control
	 * for key user personalization.
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 *
	 * @param {sap.ui.core.Control} oControl The registered control instance
	 * @param {object} mPropertyBag The property bag provided in the settings action
	 * @param {string} aKeys The keys to be used to display in the corresponding controller
	 *
	 * @returns {Promise} A Promise resolving in the set of changes to be created during UI adaptation at runtime
	 */
	Engine.prototype.getRTASettingsActionHandler = function(oControl, mPropertyBag, aKeys) {

		let fResolveRTA;

		//var aVMs = this.hasForReference(oControl, "sap.ui.fl.variants.VariantManagement");
		// TODO: clarify if we need this error handling / what to do with the Link if we want to keep it
		const aPVs = this.hasForReference(oControl, "sap.m.p13n.PersistenceProvider");

		if (aPVs.length > 0 && !oControl.isA("sap.ui.mdc.link.Panel")) {
			return Promise.reject("Please do not use a PeristenceProvider in RTA.");
		}

		const oOriginalModifHandler = this.getModificationHandler(oControl);
		const oTemporaryRTAHandler = new FlexModificationHandler();

		const oRTAPromise = new Promise((resolve, reject) => {
			fResolveRTA = resolve;
		});

		oTemporaryRTAHandler.processChanges = (aChanges) => {
			fResolveRTA(aChanges);
			return Promise.resolve(aChanges);
		};

		this._setModificationHandler(oControl, oTemporaryRTAHandler);

		this.uimanager.show(oControl, aKeys, {
			showReset: false
		}).then((oContainer) => {
			const oCustomHeader = oContainer.getCustomHeader();
			if (oCustomHeader) {
				oCustomHeader.getContentRight()[0].setVisible(false);
			}
			oContainer.addStyleClass(mPropertyBag.styleClass);
			if (mPropertyBag.fnAfterClose instanceof Function) {
				oContainer.attachAfterClose(mPropertyBag.fnAfterClose);
			}
		});

		oRTAPromise.then(() => {
			this._setModificationHandler(oControl, oOriginalModifHandler);
			oTemporaryRTAHandler.destroy();
		});

		return oRTAPromise;

	};

	/**
	 * Enhances the <code>xConfig</code> object by using the <code>ModificationHandler</code>.
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance
	 * @param {object} mEnhanceConfig An object providing the information about the xConfig enhancement
	 * @param {object} mEnhanceConfig.key The affected property name
	 * @param {object} mEnhanceConfig.controlMeta Object describing which config is affected
	 * @param {object} mEnhanceConfig.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} mEnhanceConfig.controlMeta.property The affected property name (such as <code>width</code> or <code>label</code>)
	 * @param {object} mEnhanceConfig.value The value that should be written in the xConfig
	 * @param {object} [mEnhanceConfig.propertyBag] Optional property bag for the <code>ModificationHandler</code>
	 * @returns {Promise} Promise resolving when the xConfig is successfully enhanced
	 */
	Engine.prototype.enhanceXConfig = function(vControl, mEnhanceConfig) {

		const oControl = Engine.getControlInstance(vControl);
		const oRegistryEntry = this._getRegistryEntry(vControl);
		const sPersistenceIdentifier = mEnhanceConfig && mEnhanceConfig.value && mEnhanceConfig.value.controllerKey ? mEnhanceConfig.value.controllerKey : undefined;
		mEnhanceConfig.currentState = Engine.getInstance().getController(oControl, mEnhanceConfig.changeType, sPersistenceIdentifier)?.getCurrentState();

		return xConfigAPI.enhanceConfig(oControl, mEnhanceConfig)
			.then((oConfig) => {
				if (oRegistryEntry) {
					//to simplify debugging
					oRegistryEntry.xConfig = oConfig;
				}
				return oConfig;
			});
	};

	/**
	 * Returns a copy of the <code>xConfig</code> object.
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 * @param {sap.ui.core.Element} vControl The related element that should be checked
	 * @param {object} [mEnhanceConfig] An object providing a modification-handler-specific payload
	 * @param {object} [mEnhanceConfig.propertyBag] Optional property bag for different modification handler derivations
	 *
	 * @returns {Promise<object>|object}
	 * A <code>Promise</code> that resolves with the configuration. The xConfig itself if it is already available, or <code>null</code> if there is no xConfig
	 */
	Engine.prototype.readXConfig = (vControl, mEnhanceConfig) => {

		const oControl = Engine.getControlInstance(vControl);
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
		const oExternalState = {};
		Object.keys(oInternalState).forEach((sInternalKey) => {
			const oController = this.getController(Engine.getControlInstance(vControl), sInternalKey);
			if (oController) {
				oExternalState[oController.getStateKey()] = oInternalState[sInternalKey];
			}
		});
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
	Engine.prototype.internalizeKeys = function(vControl, oExternalState) {
		const aControllerKeys = this.getRegisteredControllers(vControl),
			oInternalState = {};
		aControllerKeys.forEach((sInternalRegistryKey) => {
			const sExternalStateKey = this.getController(vControl, sInternalRegistryKey).getStateKey();
			if (oExternalState.hasOwnProperty(sExternalStateKey)) {
				oInternalState[sInternalRegistryKey] = oExternalState[sExternalStateKey];
			}
		});
		return oInternalState;
	};

	Engine.prototype.diffState = function(oControl, oOld, oNew) {

		const aDiffCreation = [],
			oDiffState = {};
		oOld = merge({}, oOld);
		oNew = merge({}, oNew);

		Object.keys(oNew).forEach((sKey) => {
			aDiffCreation.push(this.createChanges({
				control: oControl,
				stateBefore: oOld[sKey],
				state: this.getController(oControl, sKey).sanityCheck(oNew[sKey]),
				applyAbsolute: ProcessingStrategy.FullReplace,
				key: sKey,
				suppressAppliance: true
			}));
		});
		return Promise.all(aDiffCreation)
			.then((aChanges) => {
				Object.keys(oNew).forEach((sKey, i) => {

					if (oNew[sKey]) {
						const aState = this.getController(oControl, sKey).changesToState(aChanges[i], oOld[sKey], oNew[sKey]);
						oDiffState[sKey] = aState;
					}
				});

				return oDiffState;

			});
	};

	Engine.prototype.checkControlInitialized = (vControl) => {
		const oControl = Engine.getControlInstance(vControl);
		const pInitialize = oControl.initialized instanceof Function ? oControl.initialized() : Promise.resolve();
		return pInitialize || Promise.resolve();
	};

	Engine.prototype.checkPropertyHelperInitialized = (vControl) => {
		const oControl = Engine.getControlInstance(vControl);
		return oControl.initPropertyHelper instanceof Function ? oControl.initPropertyHelper() : Promise.resolve();
	};

	/**
	 * This method can be used to initialize the controller housekeeping.
	 *
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance
	 * @param {string|string[]} aKeys The key for the related controller
	 * @param {Object[]} aCustomInfo A custom set of propertyinfos as base to create the UI
	 *
	 * @returns {Promise} A Promise resolving after the adaptation housekeeping has been initialized
	 */
	Engine.prototype.initAdaptation = function(vControl, aKeys) {
		this.verifyController(vControl, aKeys);

		//1) Cache property helper
		const oRegistryEntry = this._getRegistryEntry(vControl);
		const oControl = Engine.getControlInstance(vControl);

		if (oRegistryEntry.helper) {
			return Promise.resolve(oRegistryEntry.helper);
		}

		return this.checkPropertyHelperInitialized(oControl).then((oPropertyHelper) => {
			oRegistryEntry.helper = oPropertyHelper;
			return oPropertyHelper;
		}, (sHelperError) => {
			throw new Error(sHelperError);
		});

	};

	/**
	 * This method should only be used to register a new controller.
	 *
	 * @private
	 *
	 * @param {sap.m.p13n.subcontroller.Controller} oController The controller instance.
	 * @param {string} sKey The key that defines the later access to the controller instance.
	 * @param {object} oPreConfig A predefined configuration
	 */
	Engine.prototype.addController = function(oController, sKey, oPreConfig) {
		const oRegistryEntry = this._getRegistryEntry(oController.getAdaptationControl(), oPreConfig);
		oRegistryEntry.controller[sKey] = oController;
	};

	/**
	 * This method can be used to get a controller instance.
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered Control instance.
	 * @param {string} sKey The key/changeType for which the controller has been registered.
	 * @param {string} [sPersistenceIdentifier] The key defined for the controller. Should be used if <code>sKey</code> represents the changeType.
	 *
	 * @returns {sap.m.p13n.SelectionController} The controller instance
	 */
	Engine.prototype.getController = function(vControl, sKey, sPersistenceIdentifier) {
		const oRegistryEntry = this._getRegistryEntry(vControl);
		let oController;
		if (oRegistryEntry && oRegistryEntry.controller.hasOwnProperty(sKey)) {
			oController = oRegistryEntry.controller[sKey];
		}

		if (oController) {
			return oController;
		}

		this.getRegisteredControllers(vControl).forEach((sController) => {
			const oRegisteredController = this.getController(vControl, sController);
			if (oRegisteredController) {
				Object.keys(oRegisteredController.getChangeOperations()).forEach((sOperationType) => {
					if (oRegisteredController.getChangeOperations()[sOperationType] === sKey) {
						if (!sPersistenceIdentifier || sPersistenceIdentifier === oRegisteredController.getPersistenceIdentifier()) {
							oController = oRegisteredController;
						}
					}
				});
			}
		});

		return oController;
	};

	/**
	 * Verifies the existence of a set of subcontrollers registered for a provided control instance.
	 *
	 * @param {sap.ui.core.Control} vControl The registered Control instance.
	 * @param {string|array} vKey A key as string or an array of keys
	 */
	Engine.prototype.verifyController = function(vControl, vKey) {
		const aKeys = vKey instanceof Array ? vKey : [vKey];

		aKeys.forEach((sKey) => {
			if (!this.getController(vControl, sKey)) {
				const oControl = Engine.getControlInstance(vControl);
				throw new Error("No controller registered yet for " + oControl.getId() + " and key: " + sKey);
			}
		});

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
		const aKeys = Array.isArray(vKeys) ? vKeys : [vKeys];
		this.verifyController(vControl, aKeys);
		const oPropertyHelper = this._getRegistryEntry(vControl).helper;
		const mUiSettings = {},
			aPanelCreation = [];

		aKeys.forEach((sKey) => {
			const oController = this.getController(vControl, sKey);
			const pAdaptationUI = oController.initAdaptationUI(oPropertyHelper);

			//Check faceless controller implementations and skip them
			if (pAdaptationUI instanceof Promise) {
				aPanelCreation.push(pAdaptationUI);
			}
		});

		return Promise.all(aPanelCreation)
			.then((aPanels) => {
				aPanels.forEach((oPanel, iIndex) => {
					const sKey = aKeys[iIndex];
					mUiSettings[sKey] = {
						panel: oPanel
					};
				});
				return mUiSettings;
			});
	};

	/**
	 * This method can be used to determine if a control is registered in the Engine.
	 *
	 * @private
	 * @ui5-restricted sap.m
	 *
	 * @param {string|sap.ui.core.Control} vControl The control ID or instance
	 * @returns {boolean} true if modification settings were already determined
	 */
	Engine.prototype.isRegistered = function(vControl) {
		const oRegistryEntry = this._getRegistryEntry(vControl);
		return !!oRegistryEntry;
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
		const oRegistryEntry = this._getRegistryEntry(vControl);
		return oRegistryEntry && !!oRegistryEntry.modification;
	};

	/**
	 * Returns an array of all registered controllers
	 *
	 * @param {string|sap.ui.core.Control} vControl The control ID or instance
	 * @returns {array} An array of all registered controller instances
	 */
	Engine.prototype.getRegisteredControllers = function(vControl) {
		const oRegistryEntry = this._getRegistryEntry(vControl);
		return oRegistryEntry ? Object.keys(oRegistryEntry.controller) : [];
	};
	/**
	 * This method can be used to get the registry entry for a control instance
	 *
	 * @private
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
	 *
	 * @returns {object} The related registry entry
	 */
	Engine.prototype._getRegistryEntry = (vControl) => {

		const oControl = Engine.getControlInstance(vControl);
		return _mRegistry.get(oControl);

	};

	/**
	 * This method can be used to get the modification handling for a control instance
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 *
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
	 * @returns {object} The related ModificationHandler.
	 */
	Engine.prototype.getModificationHandler = function(vControl) {
		const oModificationSetting = this._determineModification(vControl);

		//This method might also be retrieved by non-registered Controls (such as FilterBarBase) - the default should always be Flex.
		return oModificationSetting.handler;

	};

	/**
	 * This method can be used to create the registry entry for a control instance
	 *
	 * @private
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
	 * @param {object} oPreConfig A predefined configuration
	 * @returns {object} The related registry entry
	 */
	Engine.prototype._createRegistryEntry = (vControl, oPreConfig) => {

		const oControl = Engine.getControlInstance(vControl);

		if (!_mRegistry.has(oControl)) {

			_mRegistry.set(oControl, {
				modification: oPreConfig && oPreConfig.modification ? {
					handler: oPreConfig.modification,
					payload: {
						mode: "Auto",
						hasVM: true,
						hasPP: false
					}
				} : null,
				controller: {},
				activeP13n: null,
				helper: oPreConfig && oPreConfig.helper ? oPreConfig.helper : null,
				xConfig: null,
				pendingAppliance: {}
			});

		}

		return _mRegistry.get(oControl);
	};

	Engine.prototype.trace = function(vControl, oChange) {
		const oRegistryEntry = this._getRegistryEntry(vControl);
		this.getRegisteredControllers(vControl).forEach((sKey) => {
			const oController = this.getController(vControl, sKey);
			const mChangeOperations = oController.getChangeOperations();
			Object.keys(mChangeOperations).forEach((sType) => {
				if (mChangeOperations[sType] === oChange.changeSpecificData.changeType) {
					oRegistryEntry.pendingAppliance[sKey] = [].concat(oRegistryEntry.pendingAppliance[sKey] || []).concat(oChange);
				}
			});
		});
	};

	Engine.prototype.getTrace = function(vControl, oChange) {
		const oRegistryEntry = this._getRegistryEntry(vControl);
		let oTrace;
		if (oRegistryEntry) {
			oTrace = Object.keys(oRegistryEntry.pendingAppliance);
		}
		return oTrace;
	};

	Engine.prototype.clearTrace = function(vControl, oChange) {
		const oRegistryEntry = this._getRegistryEntry(vControl);
		if (oRegistryEntry) {
			oRegistryEntry.pendingAppliance = {};
		}
	};

	/**
	 * Determines and registers the ModificationHandler per control instance
	 *
	 * @private
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
	 * @returns {object} The related modification registry entry
	 */
	Engine.prototype._determineModification = function(vControl) {

		const oRegistryEntry = this._getRegistryEntry(vControl);

		//Modification setting is only calculated once per control instance
		if (oRegistryEntry && oRegistryEntry.modification) {
			return oRegistryEntry.modification;
		}

		const aPPResults = this.hasForReference(vControl, "sap.m.p13n.PersistenceProvider").concat(this.hasForReference(vControl, "sap.ui.mdc.p13n.PersistenceProvider"));
		const aVMResults = this.hasForReference(vControl, "sap.ui.fl.variants.VariantManagement");

		let oRelevantPersistenceProvider;
		if (aPPResults?.length > 1) {
			oRelevantPersistenceProvider = aPPResults.find((oProvider) => {
				const aDefaultProviders = Object.values(this.defaultProviderRegistry._mDefaultProviders);
				return aDefaultProviders?.find((oDefaultProvider) => oDefaultProvider.getId() == oProvider.getId());
			});
		}

		oRelevantPersistenceProvider = oRelevantPersistenceProvider || aPPResults?.[0];
		const sHandlerMode = oRelevantPersistenceProvider ? oRelevantPersistenceProvider.getMode() : "Standard";

		const oModificationSetting = {
			handler: FlexModificationHandler.getInstance(),
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

	Engine.prototype.hasForReference = (vControl, sControlType) => {
		const sControlId = vControl && vControl.getId ? vControl.getId() : vControl;
		const aResults = ElementRegistry.filter((oElement) => {
			if (!oElement.isA(sControlType)) {
				return false;
			}
			const aFor = oElement.getFor instanceof Function ? oElement.getFor() : [];
			for (let n = 0; n < aFor.length; n++) {
				if (aFor[n] === sControlId || oEngine.hasControlAncestorWithId(sControlId, aFor[n])) {
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
	 * @returns {boolean} Returns whether an related ancestor could be found.
	 */
	Engine.prototype.hasControlAncestorWithId = (sControlId, sAncestorControlId) => {
		let oControl;

		if (sControlId === sAncestorControlId) {
			return true;
		}

		oControl = Element.getElementById(sControlId);
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
	Engine.getControlInstance = (vControl) => {
		return typeof vControl == "string" ? Element.getElementById(vControl) : vControl;
	};

	/**
	 * This method can be used to get the active p13n state of a registered Control.
	 * E.g. the method will return the key of the controller that is currently being
	 * used to display a p13n UI.
	 *
	 * @private
	 * @param {string|sap.ui.core.Control} vControl The control ID or instance
	 *
	 * @returns {boolean} The related flag is the Control has an open P13n container
	 */
	Engine.prototype.hasActiveP13n = function(vControl) {
		return !!this._getRegistryEntry(vControl).activeP13n;
	};

	/**
	 * This method can be used to set the active p13n state of a registered Control.
	 * E.g. the method will return the key of the controller that is currently being
	 * used to display a p13n UI.
	 *
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance.
	 * @param {string} sKey The registered key to get the corresponding controller.
	 * @param {boolean} bModified Determines whether changes have been triggered while the dialog has been opened
	 */
	Engine.prototype.setActiveP13n = function(vControl, sKey, bModified) {
		this._getRegistryEntry(vControl).activeP13n = sKey ? {
			usedControllers: sKey,
			modified: bModified
		} : null;
	};

	/**
	 * Triggers a validation for a certain controller - The method will create a
	 * MessageStrip and place it on the related oP13nUI. The BaseController needs
	 * to implement <code>BaseController#validateP13n</code>.
	 *
	 * @private
	 *
	 * @param {sap.ui.core.Control} vControl The registered control instance.
	 * @param {string} sKey The registered key to get the corresponding controller.
	 * @param {sap.ui.core.Control} oP13nUI The adaptation UI displayed in the container (e.g. BasePanel derivation).
	 */
	Engine.prototype.validateP13n = function(vControl, sKey, oP13nUI) {
		const oController = this.getController(vControl, sKey);
		const oControl = Engine.getControlInstance(vControl);


		const mControllers = this._getRegistryEntry(vControl).controller;
		const oTheoreticalState = {};

		Object.keys(mControllers).forEach((sControllerKey) => {
			oTheoreticalState[sControllerKey] = mControllers[sControllerKey].getCurrentState();
		});

		//Only execute validation for controllers that support 'model2State'
		if (oController && oController.model2State instanceof Function) {
			oTheoreticalState[sKey] = oController.model2State();

			let mInfoState = {
				validation: MessageType.None
			};
			if (oControl.validateState instanceof Function) {
				mInfoState = oControl.validateState(this.externalizeKeys(oControl, oTheoreticalState), sKey);
			}

			let oMessageStrip;

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

		const pChanges = [];

		aKeys.forEach((sControllerKey) => {

			const oController = this.getController(oControl, sControllerKey);

			const vP13nData = oController.getP13nData();
			if (vP13nData) {
				const p = this.createChanges({
					control: oControl,
					key: sControllerKey,
					state: vP13nData,
					suppressAppliance: true,
					applyAbsolute: true
				})
					.then((aItemChanges) => {

						return oController.getBeforeApply().then((aChanges) => {

							const aComulatedChanges = aChanges ? aChanges.concat(aItemChanges) : aItemChanges;
							return aComulatedChanges;

						});
					});

				pChanges.push(p);
			}

		});

		return Promise.all(pChanges).then((aChangeMatrix) => {

			let aApplyChanges = [];
			const mChangeMap = {};
			aChangeMatrix.forEach((aTypeChanges, iIndex) => {
				aApplyChanges = aApplyChanges.concat(aTypeChanges);
				const sKey = aKeys[iIndex];
				mChangeMap[sKey] = aTypeChanges;
			});

			if (aApplyChanges.length > 0) {
				Engine.getInstance()._processChanges(oControl, mChangeMap);
			}
		});

	};

	/**
	 * This method is the central point of access to the Engine Singleton.
	 *
	 * @public
	 *
	 * @returns {sap.m.p13n.Engine} The Engine instance
	 */
	Engine.getInstance = () => {
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
		const oRegistry = {
			stateHandlerRegistry: this.stateHandlerRegistry,
			defaultProviderRegistry: this.defaultProviderRegistry,
			controlRegistry: {}
		};

		this._aRegistry.forEach((sKey) => {
			const oControl = Element.getElementById(sKey);
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
	return Engine;
});