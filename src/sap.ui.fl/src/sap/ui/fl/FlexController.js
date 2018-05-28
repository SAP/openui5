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
	"sap/ui/fl/Variant",
	"sap/ui/fl/Cache",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/mvc/View",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/fl/context/ContextManager"
], function (
	jQuery,
	Persistence,
	ChangeRegistry,
	Utils,
	LrepConnector,
	Change,
	Variant,
	Cache,
	FlexSettings,
	ChangePersistenceFactory,
	View,
	JsControlTreeModifier,
	XmlTreeModifier,
	ContextManager
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

	FlexController.appliedChangesCustomDataKey = "sap.ui.fl.appliedChanges";
	FlexController.failedChangesCustomDataKeyJs = "sap.ui.fl.failedChanges.js";
	FlexController.failedChangesCustomDataKeyXml = "sap.ui.fl.failedChanges.xml";
	FlexController.PENDING = "sap.ui.fl:PendingChange";
	FlexController.PROCESSING = "sap.ui.fl:ProcessingChange";
	FlexController.variantTechnicalParameterName = "sap-ui-fl-control-variant-id";

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
			oData = this._oChangePersistence._oVariantController._fillVariantModel();
		}

		return oData;
	};

	/**
	 * Base function for creation of a change
	 *
	 * @param {object} oChangeSpecificData property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 *        oPropertyBag). The property "packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.base.Component} oAppComponent application component of the control at runtime in case a map has been used
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.createBaseChange = function (oChangeSpecificData, oAppComponent) {
		var oChangeFileContent, oChange;

		var aCurrentDesignTimeContext = ContextManager._getContextIdsFromUrl();

		if (aCurrentDesignTimeContext.length > 1) {
			throw new Error("More than one DesignTime Context is currently active.");
		}

		if (!oAppComponent) {
			throw new Error("No Application Component found - to offer flexibility. Valid relation to its owning application component must be present.");
		}

		oChangeSpecificData.reference = this.getComponentName(); //in this case the component name can also be the value of sap-app-id
		oChangeSpecificData.packageName = "$TMP"; // first a flex change is always local, until all changes of a component are made transportable
		oChangeSpecificData.context = aCurrentDesignTimeContext.length === 1 ? aCurrentDesignTimeContext[0] : "";

		// fallback in case no application descriptor is available (e.g. during unit testing)
		oChangeSpecificData.validAppVersions = this._getValidAppVersions(oChangeSpecificData);

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
		var oChange, ChangeHandler;

		if (!oControl) {
			throw new Error("A flexibility change cannot be created without a targeted control.");
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

		oChange = this.createBaseChange(oChangeSpecificData, oAppComponent);

		// for getting the change handler the control type and the change type are needed
		var sControlType = oControl.controlType || Utils.getControlType(oControl);
		if (!sControlType) {
			throw new Error("No control type found - the change handler can not be retrieved.");
		}

		ChangeHandler = this._getChangeHandler(oChange, sControlType, oControl, JsControlTreeModifier);
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
	 * Create a variant
	 *
	 * @param {object} oVariantSpecificData property bag (nvp) holding the variant information (see sap.ui.fl.Variant#createInitialFileContent
	 *        oPropertyBag). The property "packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.base.Component} oAppComponent application component of the control at runtime in case a map has been used
	 * @returns {sap.ui.fl.Variant} the created variant
	 * @public
	 */
	FlexController.prototype.createVariant = function (oVariantSpecificData, oAppComponent) {
		var oVariant, oVariantFileContent;

		if (!oAppComponent) {
			throw new Error("No Application Component found - to offer flexibility the variant has to have a valid relation to its owning application component.");
		}

		oVariantSpecificData.content.reference = this.getComponentName(); //in this case the component name can also be the value of sap-app-id
		oVariantSpecificData.content.packageName = "$TMP"; // first a flex change is always local, until all changes of a component are made transportable

		// fallback in case no application descriptor is available (e.g. during unit testing)
		oVariantSpecificData.content.validAppVersions = this._getValidAppVersions(oVariantSpecificData);

		oVariantFileContent = Variant.createInitialFileContent(oVariantSpecificData);
		oVariant = new Variant(oVariantFileContent);

		return oVariant;
	};

	FlexController.prototype._getValidAppVersions = function(oChangeSpecificData) {
		var sAppVersion = this.getAppVersion();
		var oValidAppVersions = {
			creation: sAppVersion,
			from: sAppVersion
		};
		if (sAppVersion &&
			oChangeSpecificData.developerMode &&
			oChangeSpecificData.scenario !== sap.ui.fl.Scenario.AdaptationProject
		) {
			oValidAppVersions.to = sAppVersion;
		}
		return oValidAppVersions;
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
		this.addPreparedChange(oChange, oComponent);
		return oChange;
	};

	/**
	 * Adds an already prepared change to the flex persistence (not yet saved). This method will not call
	 * createChange again, but expects a fully computed and appliable change.
	 * Will be saved with #saveAll.
	 *
	 * @param {object} oChange property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 *        oPropertyBag). The property "packageName" is set to $TMP and internally since flex changes are always local when they are created
	 * @param {object} oAppComponent component object
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.addPreparedChange = function (oChange, oAppComponent) {
		if (oChange.getVariantReference()) {
			var oModel = oAppComponent.getModel("$FlexVariants");
			oModel._addChange(oChange);
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
	 * @param {object} oAppComponent component object
	 */
	FlexController.prototype.deleteChange = function (oChange, oAppComponent) {
		this._oChangePersistence.deleteChange(oChange);
		if (oChange.getVariantReference()) {
			oAppComponent.getModel("$FlexVariants")._removeChange(oChange);
		}
	};

	/**
	 * Creates a new change and applies it immediately.
	 *
	 * @param {object} oChangeSpecificData The data specific to the change, e.g. the new label for a RenameField change
	 * @param {sap.ui.core.Control} oControl The control where the change will be applied to
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise in asynchronous or FakePromise for the synchronous processing scenario after completion of the <code>checkTargetAndApplyChange</code> function
	 * @public
	 */
	FlexController.prototype.createAndApplyChange = function (oChangeSpecificData, oControl) {
		var oChange = this.addChange(oChangeSpecificData, oControl);
		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: Utils.getAppComponentForControl(oControl),
			view: Utils.getViewForControl(oControl)
		};
		return this.checkTargetAndApplyChange(oChange, oControl, mPropertyBag)

		.catch(function(oException) {
			this._oChangePersistence.deleteChange(oChange);
			throw oException;
		}.bind(this));
	};

	FlexController.prototype._checkDependencies = function(oChange, mDependencies, mChanges, oAppComponent, aRelevantChanges) {
		var bResult = this._checkChange(oChange, oAppComponent);
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

	FlexController.prototype._checkChange = function(oChange, oAppComponent) {
		// is control available
		var sControlId;
		var oSelector = oChange.getSelector();
		if (oSelector.idIsLocal) {
			sControlId = oAppComponent.createId(oSelector.id);
		} else {
			sControlId = oSelector.id;
		}
		var oControl = sap.ui.getCore().byId(sControlId);
		if (!oControl) {
			return false;
		}

		// check if the change has already failed. Here only changes that failed on JS-modifier are relevant,
		// because if a change failed on XML, it will try to apply it again on JS.
		var aFailedCustomDataEntries = this._getFailedCustomDataJs(oChange, oControl, JsControlTreeModifier).customDataEntries;
		if (aFailedCustomDataEntries.indexOf(oChange.getId()) > -1) {
			return false;
		}
		return true;
	};

	/**
	 * Resolves with a Promise after all the changes for this control are applied.
	 *
	 * @param {sap.ui.core.Control} oControl The control whose changes are being waited for
	 * @returns {Promise} Returns a promise when all changes on the control are applied
	 */
	FlexController.prototype.waitForChangesToBeApplied = function(oControl) {
		var mChangesMap = this._oChangePersistence.getChangesMapForComponent();
		var aPromises = [];
		var mDependencies = jQuery.extend({}, mChangesMap.mDependencies);
		var mChanges = mChangesMap.mChanges;
		var aChangesForControl = mChanges[oControl.getId()] || [];
		var aAppliedChanges = this._getAppliedCustomData(undefined, oControl, JsControlTreeModifier).customDataEntries;
		var oAppComponent = Utils.getAppComponentForControl(oControl);
		var aNotAppliedChanges = aChangesForControl.filter(function(oChange) {
			return aAppliedChanges.indexOf(oChange.getId()) === -1;
		});
		var aRelevantChanges = [];
		aNotAppliedChanges.forEach(function(oChange) {
			var aChanges = this._checkDependencies(oChange, mDependencies, mChangesMap.mChanges, oAppComponent, []);
			aRelevantChanges = aRelevantChanges.concat(aChanges);
		}, this);

		// remove duplicates
		aRelevantChanges = aRelevantChanges.filter(function(oChange, iPosition, aAllChanges) {
			return aAllChanges.indexOf(oChange) === iPosition;
		});

		// attach aRelevantChanges to the promises and wait for them to be applied
		aRelevantChanges.forEach(function(oWaitForChange) {
			if (!oWaitForChange.aPromiseFn) {
				oWaitForChange.aPromiseFn = [];
			}
			aPromises.push(
				new Promise(function(resolve, reject) {
					oWaitForChange.aPromiseFn.push({
						resolve: resolve,
						reject: reject
					});
				})
				.catch(function(oChange) {
					// check mDependentChangesOnMe, reject all changes in aRelevantChanges.
					var aDependentOnMe = oChange.getId && mChangesMap.mDependentChangesOnMe[oChange.getId()] || [];
					aDependentOnMe.forEach(function(sDependencyKey) {
						var oDependentChange = Utils.getChangeFromChangesMap(mChanges, sDependencyKey);
						if (oDependentChange.aPromiseFn) {
							oDependentChange.aPromiseFn.forEach(function(oPromiseFn) {
								oPromiseFn.reject(oDependentChange);
							});
						}
					});
					Promise.resolve();
				})
			);
		}, this);

		return Promise.all(aPromises);
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
	 * @param {object} mPropertyBag - collection of cross-functional attributes
	 * @param {object} mPropertyBag.view - the view to process as XML tree
	 * @param {string} mPropertyBag.viewId - id of the processed view
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {string} mPropertyBag.appComponent - app component
	 * @returns {Promise} without parameters. Promise resolves once all changes of the view have been applied
	 * @public
	 */
	FlexController.prototype.processViewByModifier = function (mPropertyBag) {

		mPropertyBag.siteId = Utils.getSiteId(mPropertyBag.appComponent);

		return this._oChangePersistence.getChangesForView(mPropertyBag.viewId, mPropertyBag)

		.then(this._resolveGetChangesForView.bind(this, mPropertyBag),
			this._handlePromiseChainError.bind(this, mPropertyBag.view));
	};

	/**
	 * Looping over all retrieved flexibility changes and applying them onto the targeted control within the view.
	 *
	 * @param {object} mPropertyBag - collection of cross-functional attributes
	 * @param {object} mPropertyBag.view - the view to process
	 * @param {string} mPropertyBag.viewId - id of the processed view
	 * @param {string} mPropertyBag.appComponent - app component
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor - app descriptor containing the metadata of the current application
	 * @param {string} mPropertyBag.siteId - id of the flp site containing this application
	 * @param {sap.ui.fl.Change[]} aChanges - list of flexibility changes on controls for the current processed view
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario including view object in both cases
	 * @private
	 */
	FlexController.prototype._resolveGetChangesForView = function (mPropertyBag, aChanges) {
		var aPromiseStack = [];

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

				aPromiseStack.push(function() {
					return this.checkTargetAndApplyChange(oChange, oControl, mPropertyBag)

					.catch(function(oException) {
						this._logApplyChangeError(oException, oChange);
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

		Utils.log.warning(sWarningMessage, undefined, "sap.ui.fl.FlexController");
	};

	/**
	 * Applying a specific change on the passed control.
	 *
	 * @param {sap.ui.fl.Change} oChange - change object which should be applied on the passed control
	 * @param {sap.ui.core.Control} oControl - control which is the target of the passed change
	 * @param {object} mPropertyBag propertyBag passed by the view processing
	 * @param {object} mPropertyBag.view - the view to process
	 * @param {object} mPropertyBag.modifier - polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor - app descriptor containing the metadata of the current application
	 * @param {object} mPropertyBag.appComponent - component instance that is currently loading
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
	 * @public
	 */
	FlexController.prototype.checkTargetAndApplyChange = function (oChange, oControl, mPropertyBag) {
		var bXmlModifier = mPropertyBag.modifier.targets === "xmlTree";
		var oModifier = mPropertyBag.modifier;
		var sControlType = oModifier.getControlType(oControl);
		var oChangeHandler = this._getChangeHandler(oChange, sControlType, oControl, oModifier);
		var oSettings;
		var oRtaControlTreeModifier;

		if (!oChangeHandler) {
			Utils.log.warning("Change handler implementation for change not found or change type not enabled for current layer - Change ignored");
			return new Utils.FakePromise();
		}
		if (bXmlModifier && oChange.getDefinition().jsOnly) {
			//change is not capable of xml modifier
			return new Utils.FakePromise();
		}

		var mAppliedChangesCustomData = this._getAppliedCustomData(oChange, oControl, oModifier);
		var sAppliedChanges = mAppliedChangesCustomData.customDataValue;
		var oAppliedChangeCustomData = mAppliedChangesCustomData.customData;

		if (!this._isChangeCurrentlyApplied(oControl, oChange, oModifier, mAppliedChangesCustomData)) {
			var bRevertible = this.isChangeHandlerRevertible(oChange, oControl, oChangeHandler);

			return new Utils.FakePromise()
			.then(function() {
				// only temporary until a revert function is mandatory for all change handlers
				oSettings = FlexSettings.getInstanceOrUndef();
				if (!bRevertible && oSettings && oSettings._oSettings.recordUndo) {
					// recording of undo is only implemented in JS. By throwing an error in XML we force a JS retry.
					if (bXmlModifier) {
						throw new Error();
					}

					return new Promise(function(resolve) {
						sap.ui.require(["sap/ui/rta/ControlTreeModifier"], function(RtaControlTreeModifier) {
							if (!RtaControlTreeModifier) {
								Utils.log.error("Please load 'sap/ui/rta' library if you want to record undo");
							} else {
								mPropertyBag.modifier = RtaControlTreeModifier;
								RtaControlTreeModifier.startRecordingUndo();
								oRtaControlTreeModifier = RtaControlTreeModifier;
							}
							resolve();
						});
					});
				}
			})
			.then(function() {
				oChange.PROCESSING = oChange.PROCESSING ? oChange.PROCESSING : true;
				return oChangeHandler.applyChange(oChange, oControl, mPropertyBag);
			})
			.then(function() {
				if (!bRevertible && oSettings && oSettings._oSettings.recordUndo && oRtaControlTreeModifier){
					oChange.setUndoOperations(oRtaControlTreeModifier.stopRecordingUndo());
				}
				var sChangeId = oChange.getId();
				var sValue = sAppliedChanges ? sAppliedChanges + "," + sChangeId : sChangeId;
				this._writeAppliedChangesCustomData(oAppliedChangeCustomData, sValue, mPropertyBag, oControl);
				if (oChange.aPromiseFn) {
					oChange.aPromiseFn.forEach(function(oPromiseFn) {
						oPromiseFn.resolve(oChange);
					});
				}
				delete oChange.PROCESSING;
				oChange.APPLIED = true;
				return true;
			}.bind(this))

			.catch(function(ex) {
				var mFailedChangesCustomData;
				this._setMergeError(true);

				var sLogMessage = "Change ''{0}'' could not be applied. Merge error detected while " +
				"processing the {1}.";

				if (bXmlModifier) {
					mFailedChangesCustomData = this._getFailedCustomDataXml(oChange, oControl, oModifier);
					sLogMessage = jQuery.sap.formatMessage(sLogMessage, [oChange.getId(), "XML tree"]);
					jQuery.sap.log.warning(sLogMessage, ex.stack || "");
				} else {
					mFailedChangesCustomData = this._getFailedCustomDataJs(oChange, oControl, oModifier);
					sLogMessage = jQuery.sap.formatMessage(sLogMessage, [oChange.getId(), "JS control tree"]);
					jQuery.sap.log.error(sLogMessage, ex.stack || "");
				}

				var oFailedChangeCustomData = mFailedChangesCustomData.customData;
				mFailedChangesCustomData.customDataEntries.push(oChange.getId());
				var sValue = mFailedChangesCustomData.customDataEntries.join(",");

				if (bXmlModifier) {
					this._writeFailedChangesCustomDataXml(oFailedChangeCustomData, sValue, mPropertyBag, oControl);
				} else {
					this._writeFailedChangesCustomDataJs(oFailedChangeCustomData, sValue, mPropertyBag, oControl);
				}

				if (oChange.aPromiseFn) {
					oChange.aPromiseFn.forEach(function(oPromiseFn) {
						oPromiseFn.reject(oChange);
					});
				}
				delete oChange.PROCESSING;
				return false;
			}.bind(this));
		}
		return new Utils.FakePromise(true);
	};

	FlexController.prototype._removeFromAppliedChangesAndMaybeRevert = function(oChange, oControl, mPropertyBag, bRevert) {
		var aAppliedChanges, oAppliedChangeCustomData, iIndex;
		var oModifier = mPropertyBag.modifier;
		var sControlType = oModifier.getControlType(oControl);
		var oChangeHandler = this._getChangeHandler(oChange, sControlType, oControl, oModifier);
		var vResult;

		if (bRevert && !oChangeHandler) {
			Utils.log.warning("Change handler implementation for change not found or change type not enabled for current layer - Change ignored");
			return new Utils.FakePromise();
		}

		var sChangeId = oChange.getId();
		var mCustomData = this._getAppliedCustomData(oChange, oControl, oModifier);
		aAppliedChanges = mCustomData.customDataEntries;
		oAppliedChangeCustomData = mCustomData.customData;
		iIndex = aAppliedChanges.indexOf(sChangeId);
		if (iIndex === -1 && (oChange.PROCESSING || oChange.QUEUED)) {
			// wait for the change to be applied
			vResult = new Promise(function(resolve, reject) {
				oChange.aPromiseFn = oChange.aPromiseFn || [];
				oChange.aPromiseFn.push({
					resolve: resolve,
					reject: reject
				});
			})
			.then(function(vValue) {
				return true;
			});
		} else {
			vResult = new Utils.FakePromise(false);
		}

		return vResult.then(function(bPending) {
			if (bRevert && (bPending || (!bPending && iIndex > -1))) {
				return oChangeHandler.revertChange(oChange, oControl, mPropertyBag);
			}
		})

		.then(function() {
			mCustomData = this._getAppliedCustomData(oChange, oControl, oModifier);
			aAppliedChanges = mCustomData.customDataEntries;
			oAppliedChangeCustomData = mCustomData.customData;
			iIndex = aAppliedChanges.indexOf(sChangeId);
			if (iIndex > -1 && oAppliedChangeCustomData) {
				aAppliedChanges.splice(iIndex, 1);
				this._writeAppliedChangesCustomData(oAppliedChangeCustomData, aAppliedChanges.join(), mPropertyBag, oControl);
			}
		}.bind(this))

		.catch(function(oError) {
			Utils.log.error("Change could not be reverted:", oError);
		});
	};

	FlexController.prototype._writeAppliedChangesCustomData = function(oCustomData, sValue, mPropertyBag, oControl) {
		this._writeCustomData(oCustomData, sValue, mPropertyBag, oControl, FlexController.appliedChangesCustomDataKey);
	};

	FlexController.prototype._writeFailedChangesCustomDataXml = function(oCustomData, sValue, mPropertyBag, oControl) {
		this._writeCustomData(oCustomData, sValue, mPropertyBag, oControl, FlexController.failedChangesCustomDataKeyXml);
	};

	FlexController.prototype._writeFailedChangesCustomDataJs = function(oCustomData, sValue, mPropertyBag, oControl) {
		this._writeCustomData(oCustomData, sValue, mPropertyBag, oControl, FlexController.failedChangesCustomDataKeyJs);
	};

	FlexController.prototype._writeCustomData = function(oCustomData, sValue, mPropertyBag, oControl, sCustomDataKey) {
		var oModifier = mPropertyBag.modifier;

		if (oCustomData) {
			oModifier.setProperty(oCustomData, "value", sValue);
		} else {
			var oAppComponent = mPropertyBag.appComponent;
			var oView = mPropertyBag.view;
			oCustomData = oModifier.createControl("sap.ui.core.CustomData", oAppComponent, oView);
			oModifier.setProperty(oCustomData, "key", sCustomDataKey);
			oModifier.setProperty(oCustomData, "value", sValue);
			oModifier.insertAggregation(oControl, "customData", oCustomData, 0, oView);
		}
	};

	FlexController.prototype._getAppliedCustomData = function(oChange, oControl, oModifier) {
		return this._getCustomData(oChange, oControl, oModifier, FlexController.appliedChangesCustomDataKey);
	};

	FlexController.prototype._getFailedCustomDataXml = function(oChange, oControl, oModifier) {
		return this._getCustomData(oChange, oControl, oModifier, FlexController.failedChangesCustomDataKeyXml);
	};

	FlexController.prototype._getFailedCustomDataJs = function(oChange, oControl, oModifier) {
		return this._getCustomData(oChange, oControl, oModifier, FlexController.failedChangesCustomDataKeyJs);
	};

	FlexController.prototype._getCustomData = function(oChange, oControl, oModifier, sCustomDataKey) {
		var aCustomData = oModifier.getAggregation(oControl, "customData") || [];
		var oReturn = {
			customDataEntries: []
		};
		aCustomData.some(function (oCustomData) {
			var sKey = oModifier.getProperty(oCustomData, "key");
			if (sKey === sCustomDataKey) {
				oReturn.customData = oCustomData;
				oReturn.customDataValue = oModifier.getProperty(oCustomData, "value");
				oReturn.customDataEntries = oReturn.customDataValue.split(",");
				return true; // break loop
			}
		});

		return oReturn;
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
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 *
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @param {string} sControlType name of the ui5 control type i.e. sap.m.Button
	 * @param {sap.ui.core.Control} oControl The control for which to retrieve the change handler
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier The control tree modifier
	 * @returns {sap.ui.fl.changeHandler.Base} the change handler. Undefined if not found.
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
	 * @param {map} [mPropertyBag] - Contains additional data needed for checking personalization
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that personalization shall be checked without layer filtering
	 * @returns {Promise} Resolves with a boolean; true if a personalization change made using SAPUI5 flexibility services is active in the application
	 * @public
	 */
	FlexController.prototype.isPersonalized = function (mPropertyBag) {
		mPropertyBag = mPropertyBag || {};
		//Always include smart variants when checking personalization
		mPropertyBag.includeVariants = true;
		return this.getComponentChanges(mPropertyBag).then(function (aChanges) {
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
		this._oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.getComponentName(), this.getAppVersion());
		return this._oChangePersistence;
	};

	/**
	 * Reset changes on the server.
	 *
	 * @returns {Promise} promise that resolves without parameters
	 */
	FlexController.prototype.resetChanges = function (sLayer, sGenerator, oComponent) {
		return this._oChangePersistence.resetChanges(sLayer, sGenerator)
			.then( function(oResponse) {
				if (oComponent) {
					var oModel = oComponent.getModel("$FlexVariants");
					if (oModel) {
						oModel.updateHasherEntry({
							parameters: [],
							updateURL: true,
							component: oComponent
						});
					}
				}
				return oResponse;
		});
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
		return FlexSettings.getInstance().then(function (oSettings) {
			oSettings.setMergeErrorOccured(true);
		});
	};

	FlexController.prototype._isChangeCurrentlyApplied = function(oControl, oChange, oModifier, mCustomData) {
		if (!mCustomData) {
			mCustomData = this._getAppliedCustomData(oChange, oControl, JsControlTreeModifier);
		}
		var aAppliedChanges = mCustomData.customDataEntries;
		var sChangeId = oChange.getId();
		return aAppliedChanges.indexOf(sChangeId) > -1;
	};

	FlexController.prototype._checkIfDependencyIsStillValid = function(oAppComponent, oModifier, sChangeId) {
		var oChange = Utils.getChangeFromChangesMap(this._oChangePersistence._mChanges.mChanges, sChangeId);
		if (!oChange.APPLIED) {
			return true;
		}

		var oControl = oModifier.bySelector(oChange.getSelector(), oAppComponent);
		if (!this._isChangeCurrentlyApplied(oControl, oChange, oModifier)) {
			return true;
		}
		return false;
	};

	/**
	 * Apply the changes in the control; this function is called just before the end of the
	 * creation process, changes are applied synchronously.
	 *
	 * @param {function} fnGetChangesMap Getter to retrieve the mapped changes belonging to the app component
	 * @param {object} oAppComponent Component instance that is currently loading
	 * @param {object} oControl Control instance that is being created
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise that is resolved after all changes were applied in asynchronous or FakePromise for the synchronous processing scenario
	 * @private
	 */
	FlexController.prototype._applyChangesOnControl = function (fnGetChangesMap, oAppComponent, oControl) {
		var aPromiseStack = [];
		var mChangesMap = fnGetChangesMap();
		var mChanges = mChangesMap.mChanges;
		var mDependencies = mChangesMap.mDependencies;
		var mDependentChangesOnMe = mChangesMap.mDependentChangesOnMe;
		var aChangesForControl = mChanges[oControl.getId()] || [];
		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: Utils.getViewForControl(oControl)
		};
		aChangesForControl.forEach(function (oChange) {

			// if a change was already processed and is not applied anymore,
			// then the control was destroyed and recreated. In this case we need to recreate/copy the dependencies.
			if (oChange.APPLIED && !this._isChangeCurrentlyApplied(oControl, oChange, mPropertyBag.modifier)) {
				mChangesMap = this._oChangePersistence.copyDependenciesFromInitialChangesMap(oChange, this._checkIfDependencyIsStillValid.bind(this, oAppComponent, mPropertyBag.modifier));
				mDependencies = mChangesMap.mDependencies;
				mDependentChangesOnMe = mChangesMap.mDependentChangesOnMe;
				delete oChange.APPLIED;
			}

			if (!mDependencies[oChange.getId()]) {
				oChange.QUEUED = true;
				aPromiseStack.push(function() {
					return this.checkTargetAndApplyChange(oChange, oControl, mPropertyBag)
					.then(function(bUpdate) {
						if (bUpdate) {
							this._updateDependencies(mDependencies, mDependentChangesOnMe, oChange.getId());
						}
						delete oChange.QUEUED;
					}.bind(this));
				}.bind(this));
			} else {
				//saves the information whether a change was already processed but not applied.
				mDependencies[oChange.getId()][FlexController.PENDING] =
					this.checkTargetAndApplyChange.bind(this, oChange, oControl, mPropertyBag);
			}
		}.bind(this));

		return Utils.execPromiseQueueSequentially(aPromiseStack)

		.then(function () {
			return this._processDependentQueue(mDependencies, mDependentChangesOnMe);
		}.bind(this));
	};

	/**
	 * Get <code>_applyChangesOnControl</code> function bound to the <code>FlexController</code> instance; this function
	 * must be used within the <code>addPropagationListener</code> function to ensure  proper identification of the bound
	 * function (identity check is not possible due to the wrapping of the <code>.bind</code>).
	 *
	 * @param {function} fnGetChangesMap Getter to retrieve the mapped changes belonging to the app component
	 * @param {object} oComponent Component instance that is currently loading
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
	 * @param {object} oAppComponent Component instance
	 * @param {object} oControl Control instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise that is resolved after all changes were reverted in asynchronous or FakePromise for the synchronous processing scenario
	 * @public
	 */
	FlexController.prototype.revertChangesOnControl = function(aChanges, oAppComponent) {
		var aPromiseStack = [];
		aChanges.forEach(function(oChange) {
			aPromiseStack.push(function() {
				var oSelector = this._getSelectorOfChange(oChange);
				var oControl = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
				var mPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: oAppComponent,
					view: Utils.getViewForControl(oControl)
				};
				return this._removeFromAppliedChangesAndMaybeRevert(oChange, oControl, mPropertyBag, true)
				.then(function() {
					this._oChangePersistence._deleteChangeInMap(oChange);
				}.bind(this));
			}.bind(this));
		}.bind(this));
		return Utils.execPromiseQueueSequentially(aPromiseStack);
	};

	/**
	 * Check if change handler applicable to the passed change and control has revertChange()
	 * If no change handler is given it will get the change handler from the change and control
	 *
	 * @param {object} oChange Change object
	 * @param {object} oControl Control instance object
	 * @param {object} [oChangeHandler] change handler of the control and change
	 * @returns {boolean} Returns true if change handler has revertChange()
	 * @public
	 */
	FlexController.prototype.isChangeHandlerRevertible = function(oChange, oControl, oChangeHandler) {
		if (!oChangeHandler) {
			var sControlType = JsControlTreeModifier.getControlType(oControl);
			oChangeHandler = this._getChangeHandler(oChange, sControlType, oControl, JsControlTreeModifier);
		}
		return !!(oChangeHandler && typeof oChangeHandler.revertChange === "function");
	};

	/**
	 * Applying variant changes.
	 *
	 * @param {array} aChanges Array of relevant changes
	 * @param {object} oComponent Component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise that is resolved after all changes were applied in asynchronous or FakePromise for the synchronous processing scenario
	 * @public
	 */
	FlexController.prototype.applyVariantChanges = function(aChanges, oComponent) {
		var oAppComponent = Utils.getAppComponentForControl(oComponent);
		var aPromiseStack = [];
		aChanges.forEach(function(oChange) {

			var mChangesMap = this._oChangePersistence.getChangesMapForComponent().mChanges;
			var aAllChanges = Object.keys(mChangesMap).reduce(function (aChanges, sControlId) {
				return aChanges.concat(mChangesMap[sControlId]);
			}, []);
			this._oChangePersistence._addChangeAndUpdateDependencies(oComponent, oChange, aAllChanges.length, aAllChanges);

			aPromiseStack.push(function() {
				var oModifier = JsControlTreeModifier;
				var oSelector = this._getSelectorOfChange(oChange);
				var oControl = oModifier.bySelector(oSelector, oAppComponent);
				if (!oControl) {
					Utils.log.error("A flexibility change tries to change a nonexistent control.");
					return new Utils.FakePromise();
				}

				//Previous changes added as dependencies
				return this._applyChangesOnControl(this._oChangePersistence.getChangesMapForComponent.bind(this._oChangePersistence), oAppComponent, oControl);
			}.bind(this));
		}.bind(this));

		return Utils.execPromiseQueueSequentially(aPromiseStack);
	};

	/**
	 * Remove the change from the applied Changes stored in the Controls Custom Data without reverting the change.
	 *
	 * @param {object} oChange Change
	 * @param {object} oAppComponent Component instance
	 * @param {object} oControl Control instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise for asyncronous or FakePromise for the synchronous processing scenario
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

	FlexController.prototype._updateControlsDependencies = function (mDependencies) {
		var oControl;
		Object.keys(mDependencies).forEach(function(sChangeKey) {
			var oDependency = mDependencies[sChangeKey];
			if (oDependency.controlsDependencies && oDependency.controlsDependencies.length > 0) {
				var iLength = oDependency.controlsDependencies.length;
				while (iLength--) {
					var sId = oDependency.controlsDependencies[iLength];
					oControl = sap.ui.getCore().byId(sId);
					if (oControl) {
						oDependency.controlsDependencies.splice(iLength, 1);
					}
				}
			}
		});
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

	/**
	 * Iterating over <code>mDependencies</code> once, executing relevant dependencies, and clearing dependencies queue.
	 *
	 * @param {object} mDependencies - Dependencies map
	 * @param {object} mDependentChangesOnMe - map of changes that cannot be applied with higher priority
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise for asyncronous or FakePromise for the synchronous processing scenario
	 * @private
	 */
	FlexController.prototype._iterateDependentQueue = function(mDependencies, mDependentChangesOnMe) {
		var aAppliedChanges = [],
			aDependenciesToBeDeleted = [],
			aPromises = [];
		this._updateControlsDependencies(mDependencies);
		Object.keys(mDependencies).forEach(function(sDependencyKey) {
			var oDependency = mDependencies[sDependencyKey];
			if (oDependency[FlexController.PENDING] && oDependency.dependencies.length === 0  &&
				!(oDependency.controlsDependencies && oDependency.controlsDependencies.length > 0) &&
				!oDependency[FlexController.PROCESSING]) {
				oDependency[FlexController.PROCESSING] = true;
				aPromises.push(
					function() {
						return oDependency[FlexController.PENDING]()

						.then(function (){
							aDependenciesToBeDeleted.push(sDependencyKey);
							aAppliedChanges.push(oDependency.changeObject.getId());
						});
					}
				);
			}
		});

		return Utils.execPromiseQueueSequentially(aPromises)

		.then(function () {
			for (var j = 0; j < aDependenciesToBeDeleted.length; j++) {
				delete mDependencies[aDependenciesToBeDeleted[j]];
			}

			// dependencies should be updated after all processing functions are executed and dependencies are deleted
			for (var k = 0; k < aAppliedChanges.length; k++) {
				this._updateDependencies(mDependencies, mDependentChangesOnMe, aAppliedChanges[k]);
			}

			return aAppliedChanges;
		}.bind(this));
	};

	/**
	 * Recursive iterations, which are processed sequentially, as long as dependent changes can be applied.
	 *
	 * @param {object} mDependencies - Dependencies map
	 * @param {object} mDependentChangesOnMe - map of changes that cannot be applied with higher priority
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns Promise that is resolved after all dependencies were processed for asyncronous or FakePromise for the synchronous processing scenario
	 * @private
	 */
	FlexController.prototype._processDependentQueue = function (mDependencies, mDependentChangesOnMe) {
		 return this._iterateDependentQueue(mDependencies, mDependentChangesOnMe)

		.then(function(aAppliedChanges) {
			if (aAppliedChanges.length > 0) {
				return this._processDependentQueue(mDependencies, mDependentChangesOnMe);
			}
		}.bind(this));
	};

	return FlexController;
}, true);
