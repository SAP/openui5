/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/Persistence",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Change",
	"sap/ui/fl/Cache",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/mvc/View",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier",
	"sap/ui/fl/context/ContextManager"
], function (jQuery, Persistence, ChangeRegistry, Utils, LrepConnector, Change, Cache, FlexSettings, ChangePersistenceFactory, View, JsControlTreeModifier, XmlTreeModifier, ContextManager) {
	"use strict";

	/**
	 * Retrieves changes (LabelChange, etc.) for a sap.ui.core.mvc.View and applies these changes
	 *
	 * @param {string} sComponentName - the component name the flexibility controller is responsible for
	 * @constructor
	 * @class
	 * @alias sap.ui.fl.FlexController
	 * @experimental Since 1.27.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var FlexController = function (sComponentName) {
		this._oChangePersistence = undefined;
		this._sComponentName = sComponentName || "";
		if (this._sComponentName) {
			this._createChangePersistence();
		}
	};

	FlexController.appliedChangesCustomDataKey = "sap.ui.fl:AppliedChanges";
	FlexController.PENDING = "sap.ui.fl:PendingChange";

	/**
	 * Sets the component name of the FlexController
	 *
	 * @param {String} sComponentName The name of the component
	 * @public
	 */
	FlexController.prototype.setComponentName = function (sComponentName) {
		this._sComponentName = sComponentName;
		this._createChangePersistence();
	};

	/**
	 * Returns the component name of the FlexController
	 *
	 * @returns {String} the name of the component
	 * @public
	 */
	FlexController.prototype.getComponentName = function () {
		return this._sComponentName;
	};

	/**
	 * Create a change
	 *
	 * @param {object} oChangeSpecificData property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 *        oPropertyBag). The property "packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Control | map} oControl - control for which the change will be added
	 * @param {string} oControl.id id of the control in case a map has been used to specify the control
	 * @param {sap.ui.base.Component} oControl.appComponent application component of the control at runtime in case a map has been used
	 * @param {string} oControl.controlType control type of the control in case a map has been used
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.createChange = function (oChangeSpecificData, oControl) {
		var oChangeFileContent, oChange, ChangeHandler;

		if (!oControl) {
			throw new Error("A flexibility change cannot be created without a targeted control.");
		}

		var aCurrentDesignTimeContext = ContextManager._getContextIdsFromUrl();

		if (aCurrentDesignTimeContext.length > 1) {
			throw new Error("More than one DesignTime Context is currently active.");
		}

		var sControlId = oControl.id || oControl.getId();

		if (!oChangeSpecificData.selector) {
			oChangeSpecificData.selector = {};
		}
		var oAppComponent = oControl.appComponent || Utils.getAppComponentForControl(oControl);
		if (!oAppComponent) {
			throw new Error("No Application Component found - to offer flexibility the control with the id '" + sControlId + "' has to have a valid relation to its owning application component.");
		}
		// differentiate between controls containing the app component id as a prefix and others
		if (Utils.hasLocalIdSuffix(sControlId, oAppComponent)) {
			// get local Id for control at root component and use it as selector id
			var sLocalId = oAppComponent.getLocalId(sControlId);
			if (!sLocalId) {
				throw new Error("Generated ID attribute found ('" + sControlId + "'); provide a stable ID for the control as required by flexibility for assigning the changes.");
			}
			oChangeSpecificData.selector.id = sLocalId;
			oChangeSpecificData.selector.idIsLocal = true;
		} else {
			oChangeSpecificData.selector.id = sControlId;
			oChangeSpecificData.selector.idIsLocal = false;
		}

		var oAppDescr = Utils.getAppDescriptor(oAppComponent);
		var sComponentName = this.getComponentName();
		oChangeSpecificData.reference = sComponentName; //in this case the component name can also be the value of sap-app-id
		if (oAppDescr && oAppDescr["sap.app"]) {
			oChangeSpecificData.componentName = oAppDescr["sap.app"].componentName || oAppDescr["sap.app"].id;
		} else {
			//fallback in case no appdescriptor is available (e.g. during unit testing)
			oChangeSpecificData.componentName = sComponentName;
		}
		oChangeSpecificData.packageName = "$TMP"; // first a flex change is always local, until all changes of a component are made transportable

		oChangeSpecificData.context = aCurrentDesignTimeContext.length === 1 ? aCurrentDesignTimeContext[0] : "";

		oChangeFileContent = Change.createInitialFileContent(oChangeSpecificData);
		oChange = new Change(oChangeFileContent);
		// for getting the change handler the control type and the change type are needed
		var sControlType = oControl.controlType || Utils.getControlType(oControl);
		if (!sControlType) {
			throw new Error("No control type found - the change handler can not be retrieved.");
		}
		ChangeHandler = this._getChangeHandler(oChange, sControlType);
		if (ChangeHandler) {
			ChangeHandler.completeChangeContent(oChange, oChangeSpecificData, {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			});
		} else {
			throw new Error("Change handler could not be retrieved for change " + JSON.stringify(oChangeSpecificData) + ".");
		}

		return oChange;
	};

	/**
	 * Adds a change to the flex persistence (not yet saved). Will be saved with #saveAll.
	 *
	 * @param {object} oChangeSpecificData property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 *        oPropertyBag). The property "packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Control} oControl control for which the change will be added
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.addChange = function (oChangeSpecificData, oControl) {
		var oChange = this.createChange(oChangeSpecificData, oControl);
		var oComponent = Utils.getAppComponentForControl(oControl);
		this._oChangePersistence.addChange(oChange, oComponent);
		return oChange;
	};

	/**
	 * Adds an already prepared change to the flex persistence (not yet saved). This method will not call
	 * createChange again, but expects an fully computed and appliable change.
	 * Will be saved with #saveAll.
	 *
	 * @param {object} oChange property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 *        oPropertyBag). The property "packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Control} oControl control for which the change will be added
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.addPreparedChange = function (oChange, oControl) {
		var oComponent = Utils.getAppComponentForControl(oControl);
		this._oChangePersistence.addChange(oChange, oComponent);
		return oChange;
	};

	/**
	 * Creates a new change and applies it immediately
	 *
	 * @param {object} oChangeSpecificData The data specific to the change, e.g. the new label for a RenameField change
	 * @param {sap.ui.core.Control} oControl The control where the change will be applied to
	 * @public
	 */
	FlexController.prototype.createAndApplyChange = function (oChangeSpecificData, oControl) {
		var oChange = this.addChange(oChangeSpecificData, oControl);
		try {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: Utils.getAppComponentForControl(oControl)
			};
			this._checkTargetAndApplyChange(oChange, oControl, mPropertyBag);
		} catch (oException) {
			this._oChangePersistence.deleteChange(oChange);
			throw oException;
		}
	};

	/**
	 * Saves all changes of a persistence instance.
	 *
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	FlexController.prototype.saveAll = function () {
		return this._oChangePersistence.saveDirtyChanges();
	};

	/**
	 * Loads and applies all changes for the specified xml tree view
	 *
	 * @param {object} oView - the view to process as XML tree
	 * @param {object} mPropertyBag
	 * @param {string} mPropertyBag.viewId - id of the processed view
	 * @param {string} mPropertyBag.componentId - name of the root component of the view
	 * @returns {Promise} without parameters. Promise resolves once all changes of the view have been applied
	 * @public
	 */
	FlexController.prototype.processXmlView = function (oView, mPropertyBag) {
		var oComponent = sap.ui.getCore().getComponent(mPropertyBag.componentId);
		var oAppComponent = Utils.getAppComponentForControl(oComponent);
		var oManifest = oComponent.getManifest();

		mPropertyBag.appComponent = oAppComponent;
		mPropertyBag.appDescriptor = oManifest;
		mPropertyBag.modifier = XmlTreeModifier;
		mPropertyBag.view = oView;

		return this.processViewByModifier(mPropertyBag);
	};

	/**
	 * Loads and applies all changes for the specified view
	 *
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.view - the view to process as XML tree
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {string} mPropertyBag.appComponent - app component
	 * @returns {Promise} without parameters. Promise resolves once all changes of the view have been applied
	 * @public
	 */
	FlexController.prototype.processViewByModifier = function (mPropertyBag) {

		mPropertyBag.viewId = mPropertyBag.modifier.getId(mPropertyBag.view);
		mPropertyBag.siteId = Utils.getSiteId(mPropertyBag.appComponent);

		var oGetFlexSettingsPromise = FlexSettings.getInstance(this.getComponentName(), mPropertyBag);
		return oGetFlexSettingsPromise.then(
			this._oChangePersistence.getChangesForView.bind(this._oChangePersistence, mPropertyBag.viewId, mPropertyBag),
			this._handlePromiseChainError.bind(this, mPropertyBag.view)
		).then(
			this._resolveGetChangesForView.bind(this, mPropertyBag)
		);
	};

	/**
	 * Looping over all retrieved flexibility changes and applying them onto the targeted control within the view
	 *
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.view - the view to process
	 * @param {string} mPropertyBag.viewId - id of the processed view
	 * @param {string} mPropertyBag.appComponent - app component
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor - app descriptor containing the metadata of the current application
	 * @param {string} mPropertyBag.siteId - id of the flp site containing this application
	 * @param {sap.ui.fl.Change[]} aChanges - list of flexibility changes on controls for the current processed view
	 * @returns {object} view - view object with all applied changes
	 * @private
	 */
	FlexController.prototype._resolveGetChangesForView = function (mPropertyBag, aChanges) {
		if (!Array.isArray(aChanges)) {
			var sErrorMessage = "No list of changes was passed for processing the flexibility on view: " + mPropertyBag.view + ".";
			Utils.log.error(sErrorMessage, undefined, "sap.ui.fl.FlexController");
			return [];
		}

		aChanges.forEach(function (oChange) {
			try {
				var oSelector = this._getSelectorOfChange(oChange);

				if (!oSelector || !oSelector.id) {
					throw new Error("No selector in change found or no selector ID.");
				}

				var oControl = mPropertyBag.modifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view);

				if (!oControl) {
					throw new Error("A flexibility change tries to change a nonexistent control.");
				}

				this._checkTargetAndApplyChange(oChange, oControl, mPropertyBag);
			} catch (oException) {
				this._logApplyChangeError(oException, oChange);
			}
		}.bind(this));

		return mPropertyBag.view;
	};

	FlexController.prototype._logApplyChangeError = function (oException, oChange) {
		var oDefinition = oChange.getDefinition();
		var sChangeType = oDefinition.changeType;
		var sTargetControlId = oDefinition.selector.id;
		var fullQualifiedName = oDefinition.namespace + oDefinition.fileName + "." + oDefinition.fileType;

		var sWarningMessage = "A flexibility change could not be applied.";
		sWarningMessage += "\nThe displayed UI might not be displayed as intedend.";
		if (oException.message) {
			sWarningMessage += "\n   occurred error message: '" + oException.message + "'";
		}
		sWarningMessage += "\n   type of change: '" + sChangeType + "'";
		sWarningMessage += "\n   LRep location of the change: " + fullQualifiedName;
		sWarningMessage += "\n   id of targeted control: '" + sTargetControlId + "'.";

		Utils.log.warning(sWarningMessage, undefined, "sap.ui.fl.FlexController");
	};

	/**
	 * Applying a specific change on the passed control
	 *
	 * @param {sap.ui.fl.Change} oChange - change object which should be applied on the passed control
	 * @param {sap.ui.core.Control} oControl - control which is the target of the passed change
	 * @param {object} mPropertyBag propertyBag passed by the view processing
	 * @param {object} mPropertyBag.view - the view to process
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor - app descriptor containing the metadata of the current application
	 * @param {object} mPropertyBag.appComponent - component instance that is currently loading
	 * @private
	 */
	FlexController.prototype._checkTargetAndApplyChange = function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var sControlType = oModifier.getControlType(oControl);
		var oChangeHandler = this._getChangeHandler(oChange, sControlType);

		if (!oChangeHandler) {
			if (oChange && oControl) {
				Utils.log.warning("Change handler implementation for change not found or change type not enabled for current layer - Change ignored");
			}
			return;
		}

		var aCustomData = oModifier.getAggregation(oControl, "customData") || [];
		var sChangeId = oChange.getId();
		var aAppliedChanges = [];
		var oAppliedChangeCustomData;
		var sAppliedChanges = "";
		aCustomData.some(function (oCustomData) {
			var sKey = oModifier.getProperty(oCustomData, "key");
			if (sKey === FlexController.appliedChangesCustomDataKey) {
				oAppliedChangeCustomData = oCustomData;
				sAppliedChanges = oModifier.getProperty(oCustomData, "value");
				aAppliedChanges = sAppliedChanges.split(",");
				return true; // break loop
			}
		});

		if (aAppliedChanges.indexOf(sChangeId) === -1) {
			try {
				oChangeHandler.applyChange(oChange, oControl, mPropertyBag);
			} catch (ex) {
				this._setMergeError(true);
				Utils.log.error("Change could not be applied. Merge error detected.");
				throw ex;
			}

			if (oAppliedChangeCustomData) {
				oModifier.setProperty(oAppliedChangeCustomData, "value", sAppliedChanges + "," + sChangeId);
			} else {
				var oAppComponent = mPropertyBag.appComponent;
				var oView = mPropertyBag.view;
				oAppliedChangeCustomData = oModifier.createControl("sap.ui.core.CustomData", oAppComponent, oView);
				oModifier.setProperty(oAppliedChangeCustomData, "key", FlexController.appliedChangesCustomDataKey);
				oModifier.setProperty(oAppliedChangeCustomData, "value", sChangeId);
				oModifier.insertAggregation(oControl, "customData", oAppliedChangeCustomData, 0, oView, true);
			}
		}
	};

	FlexController.prototype._handlePromiseChainError = function (oView, oError) {
		Utils.log.error("Error processing view " + oError + ".");
		return oView;
	};

	FlexController.prototype._getSelectorOfChange = function (oChange) {
		if (!oChange || !oChange.getSelector) {
			return undefined;
		}
		return oChange.getSelector();
	};

	/**
	 * Retrieves the corresponding change handler for the change and applies the change to the control
	 *
	 * @param {sap.ui.fl.Change} oChange Change instance
	 * @param {sap.ui.core.Control} oControl Control instance
	 * @public
	 * @deprecated
	 */
	FlexController.prototype.applyChange = function (oChange, oControl) {
		var sControlType = Utils.getControlType(oControl);
		var oChangeHandler = this._getChangeHandler(oChange, sControlType);
		if (!oChangeHandler) {
			if (oChange && oControl) {
				Utils.log.warning("Change handler implementation for change not found or change type not enabled for current layer - Change ignored.");
			}
			return;
		}

		try {
			oChangeHandler.applyChange(oChange, oControl);
		} catch (ex) {
			this._setMergeError(true);
			Utils.log.error("Change could not be applied. Merge error detected.");
			throw ex;
		}
	};

	/**
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 *
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @param {string} sControlType name of the ui5 control type i.e. sap.m.Button
	 * @returns {sap.ui.fl.changeHandler.Base} the change handler. Undefined if not found.
	 * @private
	 */
	FlexController.prototype._getChangeHandler = function (oChange, sControlType) {
		var oChangeTypeMetadata, fChangeHandler;

		oChangeTypeMetadata = this._getChangeTypeMetadata(oChange, sControlType);
		if (!oChangeTypeMetadata) {
			return undefined;
		}

		fChangeHandler = oChangeTypeMetadata.getChangeHandler();
		return fChangeHandler;
	};

	/**
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 *
	 * @param {sap.ui.fl.Change} oChange Change instance
	 * @param {string} sControlType name of the ui5 control type i.e. sap.m.Button
	 * @returns {sap.ui.fl.registry.ChangeTypeMetadata} the registry item containing the change handler. Undefined if not found.
	 * @private
	 */
	FlexController.prototype._getChangeTypeMetadata = function (oChange, sControlType) {
		var oChangeRegistryItem, oChangeTypeMetadata;

		oChangeRegistryItem = this._getChangeRegistryItem(oChange, sControlType);
		if (!oChangeRegistryItem || !oChangeRegistryItem.getChangeTypeMetadata) {
			return undefined;
		}

		oChangeTypeMetadata = oChangeRegistryItem.getChangeTypeMetadata();
		return oChangeTypeMetadata;
	};

	/**
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 *
	 * @param {sap.ui.fl.Change} oChange Change instance
	 * @param {string} sControlType name of the ui5 control type i.e. sap.m.Button
	 * @returns {sap.ui.fl.registry.ChangeRegistryItem} the registry item containing the change handler. Undefined if not found.
	 * @private
	 */
	FlexController.prototype._getChangeRegistryItem = function (oChange, sControlType) {
		var sChangeType, oChangeRegistryItem, sLayer;
		if (!oChange || !sControlType) {
			return undefined;
		}

		sChangeType = oChange.getChangeType();

		if (!sChangeType || !sControlType) {
			return undefined;
		}

		sLayer = oChange.getLayer();

		oChangeRegistryItem = this._getChangeRegistry().getRegistryItems({
			"changeTypeName": sChangeType,
			"controlType": sControlType,
			"layer": sLayer
		});
		if (oChangeRegistryItem && oChangeRegistryItem[sControlType] && oChangeRegistryItem[sControlType][sChangeType]) {
			return oChangeRegistryItem[sControlType][sChangeType];
		} else if (oChangeRegistryItem && oChangeRegistryItem[sControlType]) {
			return oChangeRegistryItem[sControlType];
		} else {
			return oChangeRegistryItem;
		}
	};

	/**
	 * Returns the change registry
	 *
	 * @returns {sap.ui.fl.registry.ChangeRegistry} Instance of the change registry
	 * @private
	 */
	FlexController.prototype._getChangeRegistry = function () {
		var oInstance = ChangeRegistry.getInstance();
		// make sure to use the most current flex settings that have been retrieved during processView
		oInstance.initSettings(this.getComponentName());
		return oInstance;
	};

	/**
	 * Retrieves the changes for the complete UI5 component
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * - appDescriptor that belongs to actual component
	 * - siteId that belongs to actual component
	 * @returns {Promise} Promise resolves with a map of all {sap.ui.fl.Change} having the changeId as key
	 * @public
	 */
	FlexController.prototype.getComponentChanges = function (mPropertyBag) {
		return this._oChangePersistence.getChangesForComponent(mPropertyBag);
	};

	/**
	 * Determines if an active personalization - user specific changes or variants - for the flexibility reference
	 * of the controller instance (<code>this._sComponentName</code>) is in place.
	 *
	 * @returns {Promise} resolves with a boolean; true if a personalization that has been made via flexibility is active in the application
	 * @public
	 */
	FlexController.prototype.isPersonalized = function () {
		return this.getComponentChanges({}).then(function (aChanges) {
			var bIsPersonalized = aChanges.some(function (oChange) {
				return oChange.isUserDependent();
			});

			return !!bIsPersonalized;
		});
	};

	/**
	 * Creates a new instance of sap.ui.fl.Persistence based on the current component and caches the instance in a private member
	 *
	 * @returns {sap.ui.fl.Persistence} persistence instance
	 * @private
	 */
	FlexController.prototype._createChangePersistence = function () {
		this._oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.getComponentName());
		return this._oChangePersistence;
	};

	/**
	 * Discard changes on the server.
	 *
	 * @param {array} aChanges array of {sap.ui.fl.Change} to be discarded
	 * @param {boolean} bDiscardPersonalization - (optional) specifies that only changes in the USER layer are discarded
	 * @returns {Promise} promise that resolves without parameters
	 */
	FlexController.prototype.discardChanges = function (aChanges, bDiscardPersonalization) {
		var sActiveLayer = Utils.getCurrentLayer(!!bDiscardPersonalization);
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
	 * Discard changes on the server for a specific selector ID.
	 *
	 * @param {string} sId for which the changes should be deleted
	 * @param {boolean} bDiscardPersonalization - (optional) specifies that only changes in the USER layer are discarded
	 * @returns {Promise} promise that resolves without parameters
	 */
	FlexController.prototype.discardChangesForId = function (sId, bDiscardPersonalization) {
		if (!sId) {
			return Promise.resolve();
		}

		var oChangesMap = this._oChangePersistence.getChangesMapForComponent();
		var aChanges = oChangesMap.mChanges[sId] || [];
		return this.discardChanges(aChanges, bDiscardPersonalization);
	};

	/**
	 * Set a flag in the settings instance in case an error has occurred when merging changes
	 *
	 * @returns {Promise} Promise resolved after the merge error flag is set
	 * @private
	 */
	FlexController.prototype._setMergeError = function () {
		return FlexSettings.getInstance(this.getComponentName()).then(function (oSettings) {
			oSettings.setMergeErrorOccured(true);
		});
	};

	/**
	 * Apply the changes on the control. This function is called just before the end of the
	 * creation process.
	 *
	 * @param {function} fnGetChangesMap Getter to retrieve the mapped changes belonging to the app component
	 * @param {object} oAppComponent Component instance that is currently loading
	 * @param {object} oControl Control instance that is being created
	 * @public
	 */
	FlexController.applyChangesOnControl = function (fnGetChangesMap, oAppComponent, oControl) {
		var mChangesMap = fnGetChangesMap();
		var mChanges = mChangesMap.mChanges;
		var mDependencies = mChangesMap.mDependencies;
		var mDependentChangesOnMe = mChangesMap.mDependentChangesOnMe;
		var aChangesForControl = mChanges[oControl.getId()] || [];
		aChangesForControl.forEach(function (oChange) {
			if (!mDependencies[oChange.getKey()]) {
				FlexController.prototype._checkTargetAndApplyChange(oChange, oControl, {modifier: JsControlTreeModifier, appComponent: oAppComponent});
				FlexController.prototype._updateDependencies(mDependencies, mDependentChangesOnMe, oChange.getKey());
			} else {
				//saves the information whether a change was already processed but not applied.
				mDependencies[oChange.getKey()][FlexController.PENDING] =
					FlexController.prototype._checkTargetAndApplyChange.bind(FlexController, oChange, oControl, {modifier: JsControlTreeModifier, appComponent: oAppComponent});
			}
		});

		FlexController.prototype._processDependentQueue(mDependencies, mDependentChangesOnMe, oAppComponent);
	};

	FlexController.prototype._updateDependencies = function (mDependencies, mDependentChangesOnMe, sChangeKey) {
		if (mDependentChangesOnMe[sChangeKey]) {
			mDependentChangesOnMe[sChangeKey].forEach(function (sKey) {
				var oDependency = mDependencies[sKey];
				var iIndex = oDependency.dependencies.indexOf(sChangeKey);
				if (iIndex > -1) {
					oDependency.dependencies.splice(iIndex, 1);
				}
			});
			delete mDependentChangesOnMe[sChangeKey];
		}
	};

	FlexController.prototype._processDependentQueue = function (mDependencies, mDependentChangesOnMe, oAppComponent) {
		var aAppliedChanges;
		var aDependenciesToBeDeleted;

		do {
			aAppliedChanges = [];
			aDependenciesToBeDeleted = [];
			for (var i = 0; i < Object.keys(mDependencies).length; i++) {
				var sDependencyKey = Object.keys(mDependencies)[i];
				var oDependency = mDependencies[sDependencyKey];
				if (oDependency[FlexController.PENDING] && oDependency.dependencies.length === 0) {
					oDependency[FlexController.PENDING]();
					aDependenciesToBeDeleted.push(sDependencyKey);
					aAppliedChanges.push(oDependency.changeObject.getKey());
				}
			}

			for (var j = 0; j < aDependenciesToBeDeleted.length; j++) {
				delete mDependencies[aDependenciesToBeDeleted[j]];
			}

			for (var k = 0; k < aAppliedChanges.length; k++) {
				FlexController.prototype._updateDependencies(mDependencies, mDependentChangesOnMe, aAppliedChanges[k]);
			}
		} while (aAppliedChanges.length > 0);
	};

	/**
	 * Get the changes and in case of existing changes, prepare the applyChanges function already with the changes.
	 *
	 * @param {object} oComponent Component instance that is currently loading
	 * @param {object} vConfig configuration of loaded component
	 * @public
	 */
	FlexController.getChangesAndPropagate = function (oComponent, vConfig) {
		var oManifest = oComponent.getManifestObject();
		ChangePersistenceFactory._getChangesForComponentAfterInstantiation(vConfig, oManifest, oComponent)
			.then(function (fnGetChangesMap) {
				oComponent.addPropagationListener(FlexController.applyChangesOnControl.bind(this, fnGetChangesMap, oComponent));
			}
		);
	};

	return FlexController;
}, true);
