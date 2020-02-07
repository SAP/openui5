/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/FlexCustomData",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/context/ContextManager",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/base/Log",
	"sap/base/util/restricted/_uniqWith",
	"sap/ui/fl/apply/_internal/variants/URLHandler"
], function(
	ChangeRegistry,
	ChangeHandlerRegistration,
	Utils,
	LayerUtils,
	FlexCustomData,
	FeaturesAPI,
	Change,
	Variant,
	FlexSettings,
	LrepConnector,
	ChangePersistenceFactory,
	ContextManager,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	Element,
	Log,
	_uniqWith,
	URLHandler
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
	var FlexController = function (sComponentName, sAppVersion) {
		this._oChangePersistence = undefined;
		this._sComponentName = sComponentName || "";
		this._sAppVersion = sAppVersion || Utils.DEFAULT_APP_VERSION;
		if (this._sComponentName && this._sAppVersion) {
			this._createChangePersistence();
		}
	};

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
	 * Returns the application version of the FlexController
	 *
	 * @returns {String} Application version
	 * @public
	 */
	FlexController.prototype.getAppVersion = function () {
		return this._sAppVersion;
	};

	/**
	 * Returns the variant model object
	 *
	 * @returns {Object} Variant Model Object
	 * @public
	 */
	FlexController.prototype.getVariantModelData = function () {
		var oData;
		if (this._oChangePersistence &&
				this._oChangePersistence._oVariantController._mVariantManagement &&
				Object.keys(this._oChangePersistence._oVariantController._mVariantManagement).length > 0) {
			oData = this._oChangePersistence._oVariantController.fillVariantModel();
		}

		return oData;
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
	FlexController.prototype.createBaseChange = function (oChangeSpecificData, oAppComponent) {
		var oChangeFileContent;
		var oChange;

		var aCurrentDesignTimeContext = ContextManager._getContextIdsFromUrl();

		if (aCurrentDesignTimeContext.length > 1) {
			throw new Error("More than one DesignTime Context is currently active.");
		}

		if (!oAppComponent) {
			throw new Error("No application component found. To offer flexibility a valid relation to its owning component must be present.");
		}

		oChangeSpecificData.reference = this.getComponentName(); //in this case the component name can also be the value of sap-app-id
		oChangeSpecificData.packageName = "$TMP"; // first a flex change is always local, until all changes of a component are made transportable
		oChangeSpecificData.context = aCurrentDesignTimeContext.length === 1 ? aCurrentDesignTimeContext[0] : "";

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
	FlexController.prototype.createChange = function (oChangeSpecificData, oControl) {
		var oAppComponent;
		var oChange;
		return Promise.resolve()
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
					throw new Error("No application component found. To offer flexibility, the control with the ID '" + sControlId + "' has to have a valid relation to its owning application component.");
				}

				// differentiate between controls containing the component id as a prefix and others
				// get local Id for control at root component and use it as selector id
				Object.assign(oChangeSpecificData.selector, JsControlTreeModifier.getSelector(sControlId, oAppComponent));

				oChange = this.createBaseChange(oChangeSpecificData, oAppComponent);

				// for getting the change handler the control type and the change type are needed
				var sControlType = oControl.controlType || Utils.getControlType(oControl);
				if (!sControlType) {
					throw new Error("No control type found - the change handler can not be retrieved.");
				}
				return this._getChangeHandler(oChange, sControlType, oControl, JsControlTreeModifier);
			}.bind(this))
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
			});
	};

	/**
	 * Create a variant
	 *
	 * @param {object} oVariantSpecificData - Property bag (nvp) holding the variant information (see sap.ui.fl.Variant#createInitialFileContentoPropertyBag).
	 * The property "oPropertyBag.packageName" is set to $TMP internally since flex changes are always local when they are created.
	 * @param {sap.ui.base.Component} oAppComponent - Application component of the control at runtime in case a map has been used
	 * @returns {sap.ui.fl.Variant} the created variant
	 * @public
	 */
	FlexController.prototype.createVariant = function (oVariantSpecificData, oAppComponent) {
		var oVariant;
		var oVariantFileContent;

		if (!oAppComponent) {
			throw new Error("No Application Component found - to offer flexibility the variant has to have a valid relation to its owning application component.");
		}

		if (oVariantSpecificData.content.variantManagementReference) {
			var bValidId = JsControlTreeModifier.checkControlId(oVariantSpecificData.content.variantManagementReference, oAppComponent);
			if (!bValidId) {
				throw new Error("Generated ID attribute found - to offer flexibility a stable VariantManagement ID is needed to assign the changes to, but for this VariantManagement control the ID was generated by SAPUI5 " + oVariantSpecificData.content.variantManagementReference);
			}
		}

		oVariantSpecificData.content.reference = this.getComponentName(); //in this case the component name can also be the value of sap-app-id
		oVariantSpecificData.content.packageName = "$TMP"; // first a flex change is always local, until all changes of a component are made transportable

		// fallback in case no application descriptor is available (e.g. during unit testing)
		oVariantSpecificData.content.validAppVersions = Utils.getValidAppVersions(
			this.getAppVersion(), oVariantSpecificData.developerMode, oVariantSpecificData.scenario);

		oVariantFileContent = Variant.createInitialFileContent(oVariantSpecificData);
		oVariant = new Variant(oVariantFileContent);

		return oVariant;
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
	FlexController.prototype.addChange = function (oChangeSpecificData, oControl) {
		return this.createChange(oChangeSpecificData, oControl)
			.then(function(oChange) {
				var oAppComponent = Utils.getAppComponentForControl(oControl);
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
	FlexController.prototype.addPreparedChange = function (oChange, oAppComponent) {
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
	FlexController.prototype.deleteChange = function (oChange, oAppComponent) {
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
	FlexController.prototype.createAndApplyChange = function (oChangeSpecificData, oControl) {
		var oChange;
		return Promise.resolve()
			.then(function() {
				return this.addChange(oChangeSpecificData, oControl);
			}.bind(this))
			.then(function(oAddedChange) {
				oChange = oAddedChange;
				var mPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: Utils.getAppComponentForControl(oControl),
					view: Utils.getViewForControl(oControl)
				};
				oChange.setQueuedForApply();
				return this.checkTargetAndApplyChange(oChange, oControl, mPropertyBag);
			}.bind(this))
			.then(function(oReturn) {
				if (!oReturn.success) {
					var oException = oReturn.error || new Error("The change could not be applied.");
					this._oChangePersistence.deleteChange(oChange, true);
					throw oException;
				}
				return oChange;
			}.bind(this));
	};

	FlexController.prototype._checkDependencies = function(oChange, mDependencies, mChanges, oAppComponent, aRelevantChanges) {
		var bResult = this._canChangePotentiallyBeApplied(oChange, oAppComponent);
		if (!bResult) {
			return [];
		}
		aRelevantChanges.push(oChange);
		var sDependencyKey = oChange.getId();
		var aDependentChanges = mDependencies[sDependencyKey] && mDependencies[sDependencyKey].dependencies || [];
		for (var i = 0, n = aDependentChanges.length; i < n; i++) {
			var oDependentChange = Utils.getChangeFromChangesMap(mChanges, aDependentChanges[i]);
			bResult = this._checkDependencies(oDependentChange, mDependencies, mChanges, oAppComponent, aRelevantChanges);
			if (bResult.length === 0) {
				aRelevantChanges = [];
				break;
			}
			delete mDependencies[sDependencyKey];
		}
		return aRelevantChanges;
	};

	FlexController.prototype._canChangePotentiallyBeApplied = function(oChange, oAppComponent) {
		// is control available
		var aSelectors = oChange.getDependentControlSelectorList();
		aSelectors.push(oChange.getSelector());
		return !aSelectors.some(function(oSelector) {
			return !JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		});
	};

	/**
	 * Resolves with a Promise after all the changes for this control are processed.
	 *
	 * @param {sap.ui.core.Control} oControl The control whose changes are being waited for
	 * @returns {Promise} Returns a promise when all changes on the control are processed
	 */
	FlexController.prototype.waitForChangesToBeApplied = function(oControl) {
		var mChangesMap = this._oChangePersistence.getChangesMapForComponent();
		var aPromises = [];
		var mDependencies = Object.assign({}, mChangesMap.mDependencies);
		var mChanges = mChangesMap.mChanges;
		var aChangesForControl = mChanges[oControl.getId()] || [];
		var aNotYetProcessedChanges = aChangesForControl.filter(function(oChange) {
			return !oChange.isCurrentProcessFinished();
		}, this);
		var oAppComponent = Utils.getAppComponentForControl(oControl);
		var aRelevantChanges = [];
		aNotYetProcessedChanges.forEach(function(oChange) {
			var aChanges = this._checkDependencies(oChange, mDependencies, mChangesMap.mChanges, oAppComponent, []);
			aChanges.forEach(function(oDependentChange) {
				if (aRelevantChanges.indexOf(oDependentChange) === -1) {
					aRelevantChanges.push(oDependentChange);
				}
			});
		}.bind(this));

		// attach promises to the relevant Changes and wait for them to be applied
		aRelevantChanges.forEach(function(oChange) {
			aPromises = aPromises.concat(oChange.addChangeProcessingPromises());
		}, this);

		// also wait for a potential variant switch to be done
		aPromises.push(this.waitForVariantSwitch());

		return Promise.all(aPromises)
		.then(function() {
			// the return value is not important in this function, only that it resolves
			return undefined;
		});
	};

	/**
	 * Saves all changes of a persistence instance.
	 *
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	FlexController.prototype.saveAll = function (bSkipUpdateCache) {
		return this._oChangePersistence.saveDirtyChanges(bSkipUpdateCache);
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
	FlexController.prototype.processXmlView = function (oView, mPropertyBag) {
		var oViewComponent = Component.get(mPropertyBag.componentId);
		var oAppComponent = Utils.getAppComponentForControl(oViewComponent);
		var oManifest = oAppComponent.getManifest();

		mPropertyBag.appComponent = oAppComponent;
		mPropertyBag.appDescriptor = oManifest;
		mPropertyBag.modifier = XmlTreeModifier;
		mPropertyBag.view = oView;

		return this.processViewByModifier(mPropertyBag);
	};

	/**
	 * Loads and applies all changes for the specified view
	 *
	 * @param {object} mPropertyBag - collection of cross-functional attributes
	 * @param {object} mPropertyBag.view - the view to process as XML tree
	 * @param {string} mPropertyBag.viewId - id of the processed view
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component instance responsible for the view
	 * @returns {Promise} Promise resolves once all changes of the view have been applied
	 * @public
	 */
	FlexController.prototype.processViewByModifier = function (mPropertyBag) {
		mPropertyBag.siteId = Utils.getSiteId(mPropertyBag.appComponent);

		return this._oChangePersistence.getChangesForView(mPropertyBag.viewId, mPropertyBag)

		.then(this._resolveGetChangesForView.bind(this, mPropertyBag),
			this._handlePromiseChainError.bind(this, mPropertyBag.view));
	};

	FlexController.prototype._checkForDependentSelectorControls = function (oChange, mPropertyBag) {
		var aDependentControlSelectorList = oChange.getDependentControlSelectorList();

		aDependentControlSelectorList.forEach(function(sDependentControlSelector) {
			var oDependentControl = mPropertyBag.modifier.bySelector(sDependentControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
			if (!oDependentControl) {
				throw new Error("A dependent selector control of the flexibility change is not available.");
			}
		});
	};

	/**
	 * Looping over all retrieved flexibility changes and applying them onto the targeted control within the view.
	 *
	 * @param {object} mPropertyBag - collection of cross-functional attributes
	 * @param {object} mPropertyBag.view - the view to process
	 * @param {string} mPropertyBag.viewId - id of the processed view
	 * @param {string} mPropertyBag.appComponent - Application component instance responsible for the view
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor - app descriptor containing the metadata of the current application
	 * @param {string} mPropertyBag.siteId - id of the flp site containing this application
	 * @param {sap.ui.fl.Change[]} aChanges - list of flexibility changes on controls for the current processed view
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario including view object in both cases
	 * @private
	 */
	FlexController.prototype._resolveGetChangesForView = function (mPropertyBag, aChanges) {
		var aPromiseStack = [];

		if (!Array.isArray(aChanges)) {
			var sErrorMessage = "No list of changes was passed for processing the flexibility on view: " + mPropertyBag.view + ".";
			Log.error(sErrorMessage, undefined, "sap.ui.fl.FlexController");
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

				this._checkForDependentSelectorControls(oChange, mPropertyBag);

				oChange.setQueuedForApply();
				aPromiseStack.push(function() {
					var bIsCurrentlyAppliedOnControl = this._isChangeCurrentlyApplied(oControl, oChange, mPropertyBag.modifier);
					var bChangeStatusAppliedFinished = oChange.isApplyProcessFinished();
					if (bChangeStatusAppliedFinished && !bIsCurrentlyAppliedOnControl) {
						// if a change was already processed and is not applied anymore,
						// then the control was destroyed and recreated.
						oChange.setInitialApplyState();
					} else if (!bChangeStatusAppliedFinished && bIsCurrentlyAppliedOnControl) {
						// if a change is already applied on the control, but the status does not reflect that, the status has to be updated
						// and the change does not need to be applied again
						// e.g. viewCache scenario
						oChange.markFinished();
						return new Utils.FakePromise();
					}

					return this.checkTargetAndApplyChange(oChange, oControl, mPropertyBag)

					.then(function(oReturn) {
						if (!oReturn.success) {
							this._logApplyChangeError(oReturn.error || {}, oChange);
						}
					}.bind(this));
				}.bind(this));
			} catch (oException) {
				this._logApplyChangeError(oException, oChange);
			}
		}.bind(this));

		return Utils.execPromiseQueueSequentially(aPromiseStack)

		.then(function() {
			return mPropertyBag.view;
		});
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

		Log.warning(sWarningMessage, undefined, "sap.ui.fl.FlexController");
	};

	FlexController.prototype._isXmlModifier = function(mPropertyBag) {
		return mPropertyBag.modifier.targets === "xmlTree";
	};

	/**
	 * Applying a specific change on the passed control, if it is not already applied.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object which should be applied on the passed control
	 * @param {sap.ui.core.Control} oControl - Control which is the target of the passed change
	 * @param {object} mPropertyBag propertyBag - Passed by the view processing
	 * @param {object} mPropertyBag.view - The view to process
	 * @param {object} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
	 * @param {object} mPropertyBag.appComponent - Component instance that is currently loading
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
	 * @public
	 */
	FlexController.prototype.checkTargetAndApplyChange = function (oChange, oControl, mPropertyBag) {
		var bXmlModifier = this._isXmlModifier(mPropertyBag);
		var oModifier = mPropertyBag.modifier;
		var sControlType = oModifier.getControlType(oControl);
		var mControl = this._getControlIfTemplateAffected(oChange, oControl, sControlType, mPropertyBag);
		var oResult;
		var sLibraryName = oModifier.getLibraryName(mControl.control);
		var oWaitForRegistration = new Utils.FakePromise();
		if (ChangeHandlerRegistration.isChangeHandlerRegistrationInProgress(sLibraryName)) {
			oWaitForRegistration = ChangeHandlerRegistration.waitForChangeHandlerRegistration(sLibraryName);
		}
		return oWaitForRegistration.then(function() {
			return this._getChangeHandler(oChange, mControl.controlType, mControl.control, oModifier);
		}.bind(this))
		.then(function(oChangeHandler) {
			if (!oChangeHandler) {
				var sErrorMessage = "Change handler implementation for change not found or change type not enabled for current layer - Change ignored";
				Log.warning(sErrorMessage);
				oResult = {success: false, error: new Error(sErrorMessage)};
				oChange.setInitialApplyState();
				return oResult;
			}
			if (bXmlModifier && oChange.getDefinition().jsOnly) {
				// change is not capable of xml modifier
				// the change status has to be reset to initial
				oResult = {success: false, error: new Error("Change cannot be applied in XML. Retrying in JS.")};
				oChange.setInitialApplyState();
				return oResult;
			}
			if (oChange.hasApplyProcessStarted()) {
				// wait for the change to be finished and then clean up the status and queue
				return oChange.addPromiseForApplyProcessing()
				.then(function(oResult) {
					oChange.markFinished();
					return oResult;
				});
			} else if (!oChange.isApplyProcessFinished()) {
				return new Utils.FakePromise().then(function() {
					oChange.startApplying();
					return oChangeHandler.applyChange(oChange, mControl.control, mPropertyBag);
				})
				.then(function(oInitializedControl) {
					// changeHandler can return a different control, e.g. case where a visible UI control replaces the stashed control
					if (oInitializedControl instanceof Element) {
						// the newly rendered control could have custom data set from the XML modifier
						mControl.control = oInitializedControl;
					}
					if (mControl.control) {
						oModifier.updateAggregation(oControl, oChange.getContent().boundAggregation);
					}
					// only save the revert data in the custom data when the change is being processed in XML,
					// as it's only relevant for viewCache at the moment
					FlexCustomData.addAppliedCustomData(mControl.control, oChange, mPropertyBag, bXmlModifier);
					// if a change was reverted previously remove the flag as it is not reverted anymore
					oResult = {success: true};
					oChange.markFinished(oResult);
					return oResult;
				})
				.catch(function(oRejectionReason) {
					this._logErrorAndWriteCustomData(oRejectionReason, oChange, mPropertyBag, mControl.control, bXmlModifier);
					oResult = {success: false, error: oRejectionReason};
					// if the change failed during XML processing, the status has to be reset
					// the change will be applied again in JS
					if (bXmlModifier) {
						oChange.setInitialApplyState();
					} else {
						oChange.markFinished(oResult);
					}
					return oResult;
				}.bind(this));
			}

			// make sure that everything that goes with finishing the apply process is done, even though the change was already applied
			oResult = {success: true};
			oChange.markFinished(oResult);
			return oResult;
		}.bind(this));
	};

	/**
	 * Removes a change from the applied control with an optional revert
	 *
	 * @param {sap.ui.fl.Change} oChange - Change to be removed / reverted
	 * @param {sap.ui.core.Control} oControl - Control from which the change should be removed / reverted
	 * @param {object} mPropertyBag - Additional properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component
	 * @param {sap.ui.core.mvc.View} [mPropertyBag.view] - View for the control
	 * @param {boolean} [bRevert] - Indicating if change should reverted
	 *
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise<boolean>} Promise or fake promise resolving to boolean indicating if revert was successful
	 * @restricted sap.ui.fl
	 */
	FlexController.prototype._removeFromAppliedChangesAndMaybeRevert = function(oChange, oControl, mPropertyBag, bRevert) {
		var oRevertPromise = Promise.resolve(true);
		if (bRevert) {
			oRevertPromise = this._revertChange(oChange, oControl, mPropertyBag);
		}
		return oRevertPromise.then(function(vRevertResult) {
			// vRevertResult can be an element or false
			this._removeChangeFromControl(vRevertResult || oControl, oChange, mPropertyBag.modifier);
			return !!vRevertResult;
		}.bind(this));
	};

	/**
	 * Reverts a change on the passed control
	 *
	 * @param {sap.ui.fl.Change} oChange - Change to be reverted
	 * @param {sap.ui.core.Control} oControl - Control from which the change should be reverted
	 * @param {object} mPropertyBag - Additional properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component
	 * @param {sap.ui.core.mvc.View} [mPropertyBag.view] - View for the control
	 *
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise<sap.ui.core.Element|false>} Promise or fake promise resolving to the control on which change was reverted successfully or false when unsuccessful
	 * @restricted sap.ui.fl
	 */
	FlexController.prototype._revertChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var bStashed;
		var sControlType;
		var bIsCurrentlyApplied;
		var oChangeHandler;
		var mControl = {};

		return new Utils.FakePromise().then(function() {
			if (!oControl) {
				throw Error("A flexibility change tries to revert changes on a nonexistent control");
			}

			sControlType = oModifier.getControlType(oControl);
			mControl = this._getControlIfTemplateAffected(oChange, oControl, sControlType, mPropertyBag);
		}.bind(this))

		.then(this._getChangeHandler.bind(this, oChange, mControl.controlType, mControl.control, oModifier))

		.then(function(oReturnedChangeHandler) {
			oChangeHandler = oReturnedChangeHandler;
			// check change handler is revertible
			var sMessage;
			if (!oChangeHandler) {
				sMessage = "Change handler implementation for change not found or change type not enabled for current layer - Change ignored";
			} else if (!(typeof oChangeHandler.revertChange === "function")) {
				sMessage = "No revert change function available to handle revert data for control type " + mControl.controlType;
			}

			if (sMessage) {
				Log.error(sMessage);
				oChange.markRevertFinished(new Error(sMessage));
				return new Utils.FakePromise(false);
			}

			// The stashed control does not have custom data in Runtime,
			// so we have to assume that it is stashed so we can perform the revert
			if (oChange.getChangeType() === "stashControl" && sControlType === "sap.ui.core._StashedControl") {
				bStashed = true;

				// if we want to revert we also have to fake the revertData when it is not available
				if (!oChange.getRevertData()) {
					oChangeHandler.setChangeRevertData(oChange, false);
				}
			}

			bIsCurrentlyApplied = oChange.isApplyProcessFinished();
			if (!bIsCurrentlyApplied && oChange.hasApplyProcessStarted()) {
				// wait for the change to be applied
				return oChange.addPromiseForApplyProcessing()
					.then(function(oResult) {
						if (oResult && oResult.error) {
							oChange.markRevertFinished(oResult.error);
							throw Error(oResult.error);
						}
						return true;
					});
			}
			return false;
		})
		.then(function(bPending) {
			if (bPending || (!bPending && bIsCurrentlyApplied) || bStashed) {
				// if the change has no revertData attached to it they may be saved in the custom data
				if (!oChange.getRevertData()) {
					oChange.setRevertData(FlexCustomData.getParsedRevertDataFromCustomData(oControl, oChange, oModifier));
				}

				oChange.startReverting();
				return oChangeHandler.revertChange(oChange, mControl.control, mPropertyBag);
			}
			throw Error("Change was never applied");
		})
		.then(function() {
			// After being unstashed the relevant control for the change is no longer sap.ui.core._StashedControl,
			// therefore it must be retrieved again
			mControl.control = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent, mPropertyBag.view);
			if (mControl.bTemplateAffected) {
				oModifier.updateAggregation(mControl.control, oChange.getContent().boundAggregation);
			}
			oChange.markRevertFinished();
			return mControl.control;
		})
		.catch(function(oError) {
			var sErrorMessage = "Change could not be reverted: " + oError.message;
			Log.error(sErrorMessage);
			oChange.markRevertFinished(sErrorMessage);
			return false;
		});
	};

	/**
	 * Removes the change from applied custom data on the element.
	 *
	 * @param {sap.ui.core.Control} oControl - Control from which custom data needs to be removed
	 * @param {sap.ui.fl.Change} oChange - Change which needs to be removed
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Modifier
	 * @restricted sap.ui.fl
	 */
	FlexController.prototype._removeChangeFromControl = function(oControl, oChange, oModifier) {
		FlexCustomData.destroyAppliedCustomData(oControl, oChange, oModifier);
	};

	FlexController.prototype._logErrorAndWriteCustomData = function(oRejectionReason, oChange, mPropertyBag, oControl, bXmlModifier) {
		var sChangeId = oChange.getId();
		var sLogMessage = "Change ''{0}'' could not be applied.";
		var bErrorOccured = oRejectionReason instanceof Error;
		var sCustomDataIdentifier = FlexCustomData.getCustomDataIdentifier(false, bErrorOccured, bXmlModifier);
		switch (sCustomDataIdentifier) {
			case FlexCustomData.notApplicableChangesCustomDataKey:
				Utils.formatAndLogMessage("info", [sLogMessage, oRejectionReason.message], [sChangeId]);
				break;
			case FlexCustomData.failedChangesCustomDataKeyXml:
				Utils.formatAndLogMessage("warning", [sLogMessage, "Merge error detected while processing the XML tree."], [sChangeId], oRejectionReason.stack);
				break;
			case FlexCustomData.failedChangesCustomDataKeyJs:
				Utils.formatAndLogMessage("error", [sLogMessage, "Merge error detected while processing the JS control tree."], [sChangeId], oRejectionReason.stack);
				break;
			/*no default*/
		}
		FlexCustomData.addFailedCustomData(oControl, oChange, mPropertyBag, sCustomDataIdentifier);
	};

	FlexController.prototype._isChangeCurrentlyApplied = function(oControl, oChange, oModifier) {
		return FlexCustomData.hasChangeApplyFinishedCustomData(oControl, oChange, oModifier);
	};

	FlexController.prototype._handlePromiseChainError = function (oView, oError) {
		Log.error("Error processing view " + oError + ".");
		return oView;
	};

	FlexController.prototype._getSelectorOfChange = function (oChange) {
		if (!oChange || !oChange.getSelector) {
			return undefined;
		}
		return oChange.getSelector();
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
	FlexController.prototype._getChangeHandler = function (oChange, sControlType, oControl, oModifier) {
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
	FlexController.prototype._getChangeRegistry = function () {
		var oInstance = ChangeRegistry.getInstance();
		// make sure to use the most current flex settings that have been retrieved during processView
		oInstance.initSettings();
		return oInstance;
	};

	/**
	 * Returns the control map containing control and control type
	 *
	 * @param {sap.ui.fl.Change} oChange - change to be evaluated if template is affected
	 * @param {sap.ui.core.Control} oControl - control which is the target of the passed change
	 * @param {string} sControlType - control type of the given control
	 * @param {map} mPropertyBag - contains additional data that are needed for reading of changes
	 * - {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - The control tree modifier
	 * - {sap.ui.core.Component} oAppComponent - component instance that is currently loading
	 * @returns {map} mControl contains the original selector control of the template and its control type
	 * - control {object}
	 * - controlType {string}
	 * @private
	 */
	FlexController.prototype._getControlIfTemplateAffected = function (oChange, oControl, sControlType, mPropertyBag) {
		var oChangeDefinition = oChange.getDefinition();
		var mControl = {};
		if (oChange.getContent().boundAggregation && oChangeDefinition.dependentSelector.originalSelector) {
			var oModifier = mPropertyBag.modifier;
			mControl.control = oModifier.bySelector(oChangeDefinition.dependentSelector.originalSelector, mPropertyBag.appComponent, mPropertyBag.view);
			mControl.controlType = oModifier.getControlType(mControl.control);
			mControl.bTemplateAffected = true;
		} else {
			mControl.control = oControl;
			mControl.controlType = sControlType;
			mControl.bTemplateAffected = false;
		}
		return mControl;
	};

	/**
	 * Retrieves the changes for the complete UI5 component
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to the current running component
	 * @param {string} [mPropertyBag.siteId] ID of the site belonging to the current running component
	 * @param {boolean} bInvalidateCache - (optional) should the cache be invalidated
	 * @returns {Promise} Promise resolves with a map of all {sap.ui.fl.Change} having the changeId as key
	 * @public
	 */
	FlexController.prototype.getComponentChanges = function (mPropertyBag, bInvalidateCache) {
		return this._oChangePersistence.getChangesForComponent(mPropertyBag, bInvalidateCache);
	};

	/**
	 * Calls the same function in the change persistence, which actually does the work.
	 *
	 * @param {object} oSelector selector of the control
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - polymorph reuse operations handling the changes on the given view type
	 * @param {sap.ui.core.Component} oComponent - component instance that is currently loading
	 * @returns {boolean} Returns true if there are open dependencies
	 */
	FlexController.prototype.checkForOpenDependenciesForControl = function(oSelector, oModifier, oComponent) {
		return this._oChangePersistence.checkForOpenDependenciesForControl(oSelector, oModifier, oComponent);
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
	FlexController.prototype.hasHigherLayerChanges = function (mPropertyBag) {
		mPropertyBag = mPropertyBag || {};
		var sCurrentLayer = mPropertyBag.upToLayer || LayerUtils.getCurrentLayer(false);
		//Always include smart variants when checking personalization
		mPropertyBag.includeVariants = true;
		//Also control variant changes are important
		mPropertyBag.includeCtrlVariants = true;
		return this.getComponentChanges(mPropertyBag).then(function (vChanges) {
			var bHasHigherLayerChanges = vChanges === this._oChangePersistence.HIGHER_LAYER_CHANGES_EXIST
				|| vChanges.some(function (oChange) {
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
	FlexController.prototype._createChangePersistence = function () {
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
	FlexController.prototype.resetChanges = function (sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes) {
		return this._oChangePersistence.resetChanges(sLayer, sGenerator, aSelectorIds, aChangeTypes)
			.then(function(aChanges) {
				if (aChanges.length !== 0) {
					return this.revertChangesOnControl(aChanges, oComponent);
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
	 * Discard changes on the server.
	 *
	 * @param {array} aChanges array of {sap.ui.fl.Change} to be discarded
	 * @param {boolean} bDiscardPersonalization - (optional) specifies that only changes in the USER layer are discarded
	 * @returns {Promise} Promise that resolves without parameters
	 */
	FlexController.prototype.discardChanges = function (aChanges, bDiscardPersonalization) {
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
	 * Discard changes on the server for a specific selector ID.
	 *
	 * @param {string} sId for which the changes should be deleted
	 * @param {boolean} bDiscardPersonalization - (optional) specifies that only changes in the USER layer are discarded
	 * @returns {Promise} Promise that resolves without parameters
	 */
	FlexController.prototype.discardChangesForId = function (sId, bDiscardPersonalization) {
		if (!sId) {
			return Promise.resolve();
		}

		var oChangesMap = this._oChangePersistence.getChangesMapForComponent();
		var aChanges = oChangesMap.mChanges[sId] || [];
		return this.discardChanges(aChanges, bDiscardPersonalization);
	};

	FlexController.prototype._checkIfDependencyIsStillValid = function(oAppComponent, oModifier, sChangeId) {
		var oChange = Utils.getChangeFromChangesMap(this._oChangePersistence._mChanges.mChanges, sChangeId);
		var oControl = oModifier.bySelector(oChange.getSelector(), oAppComponent);

		// if change is already applied OR if apply process has started,
		// then dependency is no more valid
		if (this._isChangeCurrentlyApplied(oControl, oChange, oModifier) || oChange.hasApplyProcessStarted()) {
			return false;
		}
		return true;
	};

	/**
	 * Apply the changes in the control; this function is called just before the end of the
	 * creation process, changes are applied synchronously.
	 *
	 * @param {function} fnGetChangesMap Getter to retrieve the mapped changes belonging to the app component
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance that is currently loading
	 * @param {sap.ui.core.Element} oControl Control instance that is being created
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were applied in asynchronous or FakePromise for the synchronous processing scenario
	 * @private
	 */
	FlexController.prototype._applyChangesOnControl = function (fnGetChangesMap, oAppComponent, oControl) {
		var aPromiseStack = [];
		var sControlId = oControl.getId();
		var mChangesMap = fnGetChangesMap();
		var mChanges = mChangesMap.mChanges;
		var mDependencies = mChangesMap.mDependencies;
		var mControlsWithDependencies = mChangesMap.mControlsWithDependencies;
		var aChangesForControl = mChanges[sControlId] || [];
		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: Utils.getViewForControl(oControl)
		};
		aChangesForControl.forEach(function (oChange) {
			var sControlType = JsControlTreeModifier.getControlType(oControl);
			var mControl = this._getControlIfTemplateAffected(oChange, oControl, sControlType, mPropertyBag);
			var bIsCurrentlyAppliedOnControl = this._isChangeCurrentlyApplied(mControl.control, oChange, mPropertyBag.modifier);
			var bChangeStatusAppliedFinished = oChange.isApplyProcessFinished();
			if (bChangeStatusAppliedFinished && !bIsCurrentlyAppliedOnControl) {
				// if a change was already processed and is not applied anymore,
				// then the control was destroyed and recreated. In this case we need to recreate/copy the dependencies.
				mChangesMap = this._oChangePersistence.copyDependenciesFromInitialChangesMap(oChange, this._checkIfDependencyIsStillValid.bind(this, oAppComponent, mPropertyBag.modifier), oAppComponent);

				mDependencies = mChangesMap.mDependencies;
				mControlsWithDependencies = mChangesMap.mControlsWithDependencies;
				oChange.setInitialApplyState();
			} else if (!bChangeStatusAppliedFinished && bIsCurrentlyAppliedOnControl) {
				// if a change is already applied on the control, but the status does not reflect that, the status has to be updated
				// the change still needs to go through the process so that the dependencies are correctly updated and the whole process is not harmed
				// scenario: viewCache
				oChange.markFinished();
			}

			oChange.setQueuedForApply();
			if (!mDependencies[oChange.getId()]) {
				aPromiseStack.push(function() {
					return this.checkTargetAndApplyChange(oChange, oControl, mPropertyBag)
					.then(function() {
						this._updateDependencies(mChangesMap, oChange.getId());
					}.bind(this));
				}.bind(this));
			} else {
				//saves the information whether a change was already processed but not applied.
				mDependencies[oChange.getId()][FlexController.PENDING] = this.checkTargetAndApplyChange.bind(this, oChange, oControl, mPropertyBag);
			}
		}.bind(this));

		// TODO improve handling of mControlsWithDependencies when change applying gets refactored
		// 		- save the IDs of the waiting changes in the map
		// 		- only try to apply those changes first
		if (aChangesForControl.length || mControlsWithDependencies[sControlId]) {
			delete mControlsWithDependencies[sControlId];
			return Utils.execPromiseQueueSequentially(aPromiseStack)
				.then(function () {
					return this._processDependentQueue(mChangesMap, oAppComponent);
				}.bind(this));
		}
		return new Utils.FakePromise();
	};

	/**
	 * Get <code>_applyChangesOnControl</code> function bound to the <code>FlexController</code> instance; this function
	 * must be used within the <code>addPropagationListener</code> function to ensure  proper identification of the bound
	 * function (identity check is not possible due to the wrapping of the <code>.bind</code>).
	 *
	 * @param {function} fnGetChangesMap Getter to retrieve the mapped changes belonging to the app component
	 * @param {sap.ui.core.Component} oComponent - Component instance that is currently loading
	 * @returns {function} Returns the bound function <code>_applyChangesOnControl</code>
	 * @public
	 */
	FlexController.prototype.getBoundApplyChangesOnControl = function (fnGetChangesMap, oComponent) {
		var fnBoundApplyChangesOnControl = this._applyChangesOnControl.bind(this, fnGetChangesMap, oComponent);
		fnBoundApplyChangesOnControl._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
		return fnBoundApplyChangesOnControl;
	};

	/**
	 * Revert changes for a control and removes the change from the applied Changes stored in the Controls Custom Data.
	 *
	 * @param {array} aChanges Array of to be reverted changes
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous or FakePromise for the synchronous processing scenario
	 * @public
	 */
	FlexController.prototype.revertChangesOnControl = function(aChanges, oAppComponent) {
		var aPromiseStack = [];
		aChanges.forEach(function(oChange) {
			// Queued 'state' will be removed once the revert process is done
			oChange.setQueuedForRevert();
			aPromiseStack.push(function() {
				var oSelector = this._getSelectorOfChange(oChange);
				var oControl = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
				if (!oControl) {
					Log.warning("A flexibility change tries to revert changes on a nonexistent control with id " + oSelector.id);
					return Promise.resolve();
				}
				var mPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: oAppComponent,
					view: Utils.getViewForControl(oControl)
				};
				return this._removeFromAppliedChangesAndMaybeRevert(oChange, oControl, mPropertyBag, true)
				.then(function(bSuccess) {
					if (bSuccess) {
						this._oChangePersistence._deleteChangeInMap(oChange);
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));
		return Utils.execPromiseQueueSequentially(aPromiseStack);
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
		var aPromiseStack = [];
		var oModifier = JsControlTreeModifier;
		var aChangeSelectors = aChanges.map(function (oChange) {
			this._oChangePersistence._addChangeAndUpdateDependencies(oAppComponent, oChange);
			return this._getSelectorOfChange(oChange);
		}.bind(this));
		var fnSameSelector = function (oSource, oTarget) {
			return oSource.id === oTarget.id;
		};
		// Remove duplicates. The further execution should be run once per control
		aChangeSelectors = _uniqWith(aChangeSelectors, fnSameSelector);
		aChangeSelectors.forEach(function(oSelector) {
			aPromiseStack.push(function() {
				var oControl = oModifier.bySelector(oSelector, oAppComponent);
				if (!oControl) {
					Log.error("A flexibility change tries to change a nonexistent control.");
					return new Utils.FakePromise();
				}

				// TODO: replace _applyChangesOnControl. This is based on the control specific changes. Should be replaced by a function that applies still the changes passed in applyVariantChanges
				// Previous changes added as dependencies
				return this._applyChangesOnControl(this._oChangePersistence.getChangesMapForComponent.bind(this._oChangePersistence), oAppComponent, oControl);
			}.bind(this));
		}.bind(this));

		return Utils.execPromiseQueueSequentially(aPromiseStack);
	};

	/**
	 * Remove the change from the applied Changes stored in the Controls Custom Data without reverting the change.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @param {sap.ui.core.Element} oControl - Control instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise for asynchronous or FakePromise for synchronous processing scenario
	 * @public
	 */
	FlexController.prototype.removeFromAppliedChangesOnControl = function(oChange, oAppComponent, oControl) {
		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: Utils.getViewForControl(oControl)
		};
		return this._removeFromAppliedChangesAndMaybeRevert(oChange, oControl, mPropertyBag, false);
	};

	FlexController.prototype._updateControlsDependencies = function (mChangesMap, oAppComponent) {
		var oControl;
		Object.keys(mChangesMap.mDependencies).forEach(function(sChangeKey) {
			var oDependency = mChangesMap.mDependencies[sChangeKey];
			if (oDependency.controlsDependencies && oDependency.controlsDependencies.length > 0) {
				var iLength = oDependency.controlsDependencies.length;
				while (iLength--) {
					var oSelector = oDependency.controlsDependencies[iLength];
					oControl = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
					if (oControl) {
						oDependency.controlsDependencies.splice(iLength, 1);
						delete mChangesMap.mControlsWithDependencies[oControl.getId()];
					}
				}
			}
		});
	};

	FlexController.prototype._updateDependencies = function (mChangesMap, sChangeKey) {
		if (mChangesMap.mDependentChangesOnMe[sChangeKey]) {
			mChangesMap.mDependentChangesOnMe[sChangeKey].forEach(function (sKey) {
				var oDependency = mChangesMap.mDependencies[sKey];

				// oDependency might be undefined, since initial dependencies were not copied yet from _applyChangesOnControl() for change with ID sKey
				var iIndex = oDependency ? oDependency.dependencies.indexOf(sChangeKey) : -1;
				if (iIndex > -1) {
					oDependency.dependencies.splice(iIndex, 1);
				}
			});
			delete mChangesMap.mDependentChangesOnMe[sChangeKey];
		}
	};

	/**
	 * Iterating over <code>mDependencies</code> once, executing relevant dependencies, and clearing dependencies queue.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise for asynchronous or FakePromise for synchronous processing scenario
	 * @private
	 */
	FlexController.prototype._iterateDependentQueue = function(mChangesMap, oAppComponent) {
		var aCoveredChanges = [];
		var aDependenciesToBeDeleted = [];
		var aPromises = [];
		this._updateControlsDependencies(mChangesMap, oAppComponent);
		Object.keys(mChangesMap.mDependencies).forEach(function(sDependencyKey) {
			var oDependency = mChangesMap.mDependencies[sDependencyKey];
			if (
				oDependency[FlexController.PENDING]
				&& oDependency.dependencies.length === 0
				&& !(oDependency.controlsDependencies && oDependency.controlsDependencies.length > 0)
			) {
				aPromises.push(
					function() {
						return oDependency[FlexController.PENDING]()
						.then(function () {
							aDependenciesToBeDeleted.push(sDependencyKey);
							aCoveredChanges.push(oDependency.changeObject.getId());
						});
					}
				);
			}
		});

		return Utils.execPromiseQueueSequentially(aPromises)

		.then(function () {
			for (var j = 0; j < aDependenciesToBeDeleted.length; j++) {
				delete mChangesMap.mDependencies[aDependenciesToBeDeleted[j]];
			}

			// dependencies should be updated after all processing functions are executed and dependencies are deleted
			for (var k = 0; k < aCoveredChanges.length; k++) {
				this._updateDependencies(mChangesMap, aCoveredChanges[k]);
			}

			return aCoveredChanges;
		}.bind(this));
	};

	/**
	 * Recursive iterations, which are processed sequentially, as long as dependent changes can be applied.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all dependencies were processed for asynchronous or FakePromise for the synchronous processing scenario
	 * @private
	 */
	FlexController.prototype._processDependentQueue = function (mChangesMap, oAppComponent) {
		return this._iterateDependentQueue(mChangesMap, oAppComponent)

		.then(function(aCoveredChanges) {
			if (aCoveredChanges.length > 0) {
				return this._processDependentQueue(mChangesMap, oAppComponent);
			}
		}.bind(this));
	};

	/**
	 * Saves changes sequentially on the associated change persistence instance
	 * @param {sap.ui.fl.Change[]} aDirtyChanges Array of dirty changes to be saved
	 * @returns {Promise} A Promise which resolves when all changes have been saved
	 * @public
	 */
	FlexController.prototype.saveSequenceOfDirtyChanges = function (aDirtyChanges) {
		return this._oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges);
	};

	/**
	 * Send a flex/info request to the backend.
	 *
	 * @param {object} mPropertyBag Contains additional data needed for checking flex/info
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector Selector
	 * @param {string} mPropertyBag.layer Layer on which the request is sent to the the backend
	 *
	 * @returns {Promise<boolean>} Resolves the information if the application has content that can be reset and/or published
	 */
	FlexController.prototype.getResetAndPublishInfo = function(mPropertyBag) {
		mPropertyBag.reference = this._sComponentName;
		mPropertyBag.appVersion = this._sAppVersion;
		return LrepConnector.createConnector().getFlexInfo(mPropertyBag);
	};

	return FlexController;
}, true);
