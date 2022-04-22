/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.RuntimeAuthoring.
sap.ui.define([
	"sap/base/strings/capitalize",
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/BusyIndicator",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/service/index",
	"sap/ui/rta/toolbar/Fiori",
	"sap/ui/rta/toolbar/FioriLike",
	"sap/ui/rta/toolbar/Personalization",
	"sap/ui/rta/toolbar/Standalone",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/ui/rta/util/PluginManager",
	"sap/ui/rta/util/PopupManager",
	"sap/ui/rta/util/ServiceEventBus",
	"sap/ui/rta/util/validateFlexEnabled",
	"sap/ui/rta/Utils",
	"sap/ui/Device"
], function(
	capitalize,
	UriParameters,
	Log,
	MessageBox,
	MessageToast,
	jQuery,
	ManagedObject,
	BusyIndicator,
	DesignTime,
	DOMUtil,
	ElementUtil,
	Overlay,
	OverlayRegistry,
	DtUtil,
	KeyCodes,
	Version,
	FlexRuntimeInfoAPI,
	SmartVariantManagementApplyAPI,
	ControlPersonalizationWriteAPI,
	FeaturesAPI,
	PersistenceWriteAPI,
	ReloadInfoAPI,
	VersionsAPI,
	TranslationAPI,
	Layer,
	LayerUtils,
	Settings,
	FlexUtils,
	JSONModel,
	Measurement,
	RtaAppVariantFeature,
	BaseCommand,
	LREPSerializer,
	CommandStack,
	ServicesIndex,
	FioriToolbar,
	FioriLikeToolbar,
	PersonalizationToolbar,
	StandaloneToolbar,
	ChangeVisualization,
	PluginManager,
	PopupManager,
	ServiceEventBus,
	validateFlexEnabled,
	Utils,
	Device
) {
	"use strict";

	var STARTING = "STARTING";
	var STARTED = "STARTED";
	var STOPPED = "STOPPED";
	var FAILED = "FAILED";
	var SERVICE_STARTING = "SERVICE_STARTING";
	var SERVICE_STARTED = "SERVICE_STARTED";
	var SERVICE_FAILED = "SERVICE_FAILED";

	/**
	 * Constructor for a new sap.ui.rta.RuntimeAuthoring class.
	 *
	 * @class The runtime authoring allows to adapt the fields of a running application.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.RuntimeAuthoring
	 * @experimental This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RuntimeAuthoring = ManagedObject.extend("sap.ui.rta.RuntimeAuthoring", {
		metadata: {
			// ---- control specific ----
			library: "sap.ui.rta",
			associations: {
				/** The root control which the runtime authoring should handle. Can only be sap.ui.core.Control or sap.ui.core.UIComponent */
				rootControl: {
					type: "sap.ui.base.ManagedObject"
				}
			},
			properties: {
				/** The URL which is called when the custom field dialog is opened */
				customFieldUrl: "string",

				/** Whether the create custom field button should be shown */
				showCreateCustomField: "boolean",

				/** Whether the create custom field button should be shown */
				showToolbars: {
					type: "boolean",
					defaultValue: true
				},

				/** Whether rta is triggered from a dialog button */
				triggeredFromDialog: {
					type: "boolean",
					defaultValue: false
				},

				/** Whether the window unload dialog should be shown */
				showWindowUnloadDialog: {
					type: "boolean",
					defaultValue: true
				},

				/** sap.ui.rta.command.Stack */
				commandStack: {
					type: "any"
				},

				/**
				 * Map with flex-related settings
				 * @experimental
				 */
				flexSettings: {
					type: "object",
					defaultValue: {
						layer: Layer.CUSTOMER,
						developerMode: true
					}
				},

				/** Defines view state of key user adaptation. Possible values: adaptation, navigation, visualization */
				mode: {
					type: "string",
					defaultValue: "adaptation"
				},

				/**
				 * Defines designtime metadata scope
				 */
				metadataScope: {
					type: "string",
					defaultValue: "default"
				}
			},
			events: {
				/** Fired when the runtime authoring is started */
				start: {
					parameters: {
						editablePluginsCount: {
							type: "int"
						}
					}
				},

				/** Fired when the runtime authoring is stopped */
				stop: {},

				/** Fired when the runtime authoring failed to start */
				failed: {},

				/**
				 * Event fired when a DesignTime selection is changed
				 */
				selectionChange: {
					parameters: {
						selection: {
							type: "sap.ui.dt.Overlay[]"
						}
					}
				},
				/**Event fired when the runtime authoring mode is changed */
				modeChanged: {},

				/**
				 * Fired when the undo/redo stack has changed, undo/redo buttons can be updated
				 */
				undoRedoStackModified: {}
			}
		},
		_sAppTitle: null,
		_dependents: null,
		_sStatus: STOPPED,
		_bNavigationModeWarningShown: false,
		constructor: function() {
			// call parent constructor
			ManagedObject.apply(this, arguments);

			this._dependents = {};
			this._mServices = {};
			this._mCustomServicesDictinary = {};
			this._mUShellServices = {};
			this._pElementModified = Promise.resolve();

			this.addDependent(new PluginManager(), "pluginManager");
			this.addDependent(new PopupManager(), "popupManager");

			if (this.getShowToolbars()) {
				this.getPopupManager().attachOpen(this.onPopupOpen, this);
				this.getPopupManager().attachClose(this.onPopupClose, this);

				// Change visualization can only be triggered from the toolbar
				this.addDependent(new ChangeVisualization(), "changeVisualization");
			}

			if (window.parent !== window) {
				this.startService("receiver");
			}

			this._loadUShellServicesPromise = FlexUtils.getUShellServices(["URLParsing", "AppLifeCycle", "CrossApplicationNavigation"])
				.then(function (mUShellServices) {
					this._mUShellServices = mUShellServices;
				}.bind(this));
		},
		_RELOAD: {
			NOT_NEEDED: "NO_RELOAD",
			VIA_HASH: "CROSS_APP_NAVIGATION",
			RELOAD_PAGE: "HARD_RELOAD"
		}
	});

	RuntimeAuthoring.prototype._shouldValidateFlexEnabled = function () {
		var sUriParam = UriParameters.fromQuery(window.location.search).get("sap-ui-rta-skip-flex-validation");
		return Settings.getInstance()
			.then(function (oSettings) {
				return !oSettings.isCustomerSystem() && sUriParam !== "true";
			});
	};

	RuntimeAuthoring.prototype.addDependent = function (oObject, sName, bCreateGetter) {
		bCreateGetter = typeof bCreateGetter === "undefined" ? true : !!bCreateGetter;
		if (!(sName in this._dependents)) {
			if (sName && bCreateGetter) {
				this["get" + capitalize(sName, 0)] = this.getDependent.bind(this, sName);
			}
			this._dependents[sName || oObject.getId()] = oObject;
		} else {
			throw DtUtil.createError(
				"RuntimeAuthoring#addDependent",
				DtUtil.printf("Can't add dependency with same key '{0}'", sName),
				"sap.ui.rta"
			);
		}
	};

	RuntimeAuthoring.prototype.getDependent = function(sName) {
		return this._dependents[sName];
	};

	RuntimeAuthoring.prototype.getDependents = function () {
		return this._dependents;
	};

	RuntimeAuthoring.prototype.removeDependent = function (sName) {
		delete this._dependents[sName];
	};


	RuntimeAuthoring.prototype.onPopupOpen = function(oEvent) {
		var oOpenedPopup = oEvent.getParameters().getSource();
		if (
			oOpenedPopup.isA("sap.m.Dialog")
			&& this.getToolbar().type === "fiori"
		) {
			this.getToolbar().setColor("contrast");
		}
		this.getToolbar().bringToFront();
	};

	RuntimeAuthoring.prototype.onPopupClose = function(oEvent) {
		if (oEvent.getParameters().isA("sap.m.Dialog")) {
			this.getToolbar().setColor();
		}
	};

	/**
	 * Setter method for plugins. Plugins can't be set when runtime authoring is started.
	 * @param {object} mPlugins - map of plugins
	 */
	RuntimeAuthoring.prototype.setPlugins = function(mPlugins) {
		if (this._sStatus !== STOPPED) {
			throw new Error("Cannot replace plugins: runtime authoring already started");
		}
		this.getPluginManager().setPlugins(mPlugins);
	};

	/**
	 * Getter method for plugins.
	 * @returns {Object<string, sap.ui.rta.plugin.Plugin>} map with plugins
	 */
	RuntimeAuthoring.prototype.getPlugins = function () {
		return this.getPluginManager
			&& this.getPluginManager()
			&& this.getPluginManager().getPlugins();
	};

	/**
	 * Returns (and creates) the default plugins of RuntimeAuthoring
	 *
	 * These are AdditionalElements, ContextMenu, CreateContainer, CutPaste,
	 * DragDrop, Remove, Rename, Selection, Settings, TabHandling
	 *
	 * Method uses a local cache to hold the default plugins: Then on multiple access
	 * always the same instances get returned.
	 *
	 * @public
	 * @return {Object<string,sap.ui.rta.plugin.Plugin>} Map with plugins
	 */
	RuntimeAuthoring.prototype.getDefaultPlugins = function () {
		return this.getPluginManager().getDefaultPlugins(this.getFlexSettings());
	};

	/**
	 * Setter for flexSettings. Checks the Uri for parameters that override the layer.
	 * builds the rootNamespace and namespace parameters from the other parameters
	 *
	 * @param {object} [mFlexSettings] property bag
	 * @param {string} [mFlexSettings.layer] The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {boolean} [mFlexSettings.developerMode] Whether RTA is started in DeveloperMode Mode. Whether RTA is started in DeveloperMode Mode
	 * @param {string} [mFlexSettings.baseId] base ID of the app
	 * @param {string} [mFlexSettings.projectId] project ID
	 * @param {string} [mFlexSettings.scenario] Key representing the current scenario
	 */
	RuntimeAuthoring.prototype.setFlexSettings = function(mFlexSettings) {
		// Check URI-parameters for sap-ui-layer
		var oUriParams = UriParameters.fromQuery(window.location.search);
		var sUriLayer = oUriParams.get("sap-ui-layer");

		mFlexSettings = jQuery.extend({}, this.getFlexSettings(), mFlexSettings);
		if (sUriLayer) {
			mFlexSettings.layer = sUriLayer.toUpperCase();
		}

		// TODO: this will lead to incorrect information if this function is first called with scenario or baseId and then called again without.
		if (mFlexSettings.scenario || mFlexSettings.baseId) {
			var sLRepRootNamespace = FlexUtils.buildLrepRootNamespace(mFlexSettings.baseId, mFlexSettings.scenario, mFlexSettings.projectId);
			mFlexSettings.rootNamespace = sLRepRootNamespace;
			mFlexSettings.namespace = sLRepRootNamespace + "changes/";
		}

		Utils.setRtaStyleClassName(mFlexSettings.layer);
		this.setProperty("flexSettings", mFlexSettings);
	};

	/**
	 * Checks the uri parameters for "sap-ui-layer" and returns either the current layer or the layer from the uri parameter, if there is one
	 *
	 * @returns {string} the layer after checking the uri parameters
	 * @private
	 */
	RuntimeAuthoring.prototype.getLayer = function () {
		return this.getFlexSettings().layer;
	};

	RuntimeAuthoring.prototype.getRootControlInstance = function() {
		if (!this._oRootControl) {
			this._oRootControl = ElementUtil.getElementInstance(this.getRootControl());
		}
		return this._oRootControl;
	};

	RuntimeAuthoring.prototype._getTextResources = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	};

	RuntimeAuthoring.prototype._setVersionsModel = function(oModel) {
		this._oVersionsModel = oModel;
	};

	RuntimeAuthoring.prototype._initVersioning = function() {
		return VersionsAPI.initialize({
			control: this.getRootControlInstance(),
			layer: this.getLayer()
		}).then(this._setVersionsModel.bind(this));
	};

	RuntimeAuthoring.prototype._onPersonalizationChangeCreation = function() {
		if (this.getMode() === "navigation" && !this._bNavigationModeWarningShown) {
			this._showMessageToast("MSG_NAVIGATION_MODE_CHANGES_WARNING", {
				duration: 5000
			});
			this._bNavigationModeWarningShown = true;
		}
	};

	function addOrRemoveStyleClass(oRootControl, bAdd) {
		if (oRootControl.isA("sap.ui.core.UIComponent")) {
			oRootControl = oRootControl.getRootControl();
		}
		if (oRootControl) {
			oRootControl[bAdd ? "addStyleClass" : "removeStyleClass"]("sapUiRtaRoot");
		}
	}

	/**
	 * Start UI adaptation at runtime (RTA).
	 * @return {Promise} Returns a Promise with the initialization of RTA
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function () {
		var oDesignTimePromise;
		var vError;
		// Create DesignTime
		if (this._sStatus === STOPPED) {
			this._sStatus = STARTING;
			var oRootControl = this.getRootControlInstance();
			if (!oRootControl) {
				vError = new Error("Root control not found");
				Log.error(vError);
				return Promise.reject(vError);
			}

			return this._loadUShellServicesPromise
			.then(this._initVersioning.bind(this))
			/*
			Check if the application has personalized changes and reload without them;
			Also Check if the application has an available draft and if yes, reload with those changes.
			 */
			.then(this._determineReload.bind(this))
			.then(function(bReloadTriggered) {
				if (bReloadTriggered) {
					// FLP Plugin reacts on this error string and doesn't pass the error on the UI
					return Promise.reject("Reload triggered");
				}

				this._oSerializer = new LREPSerializer({commandStack: this.getCommandStack(), rootControl: this.getRootControl()});

				this.getPluginManager().preparePlugins(
					this.getFlexSettings(),
					this._handleElementModified.bind(this),
					this.getCommandStack()
				);

				var aPlugins = this.getPluginManager().getPluginList();

				oDesignTimePromise = new Promise(function (fnResolve, fnReject) {
					Measurement.start("rta.dt.startup", "Measurement of RTA: DesignTime start up");
					this._oDesignTime = new DesignTime({
						scope: this.getMetadataScope(),
						plugins: aPlugins
					});

					addOrRemoveStyleClass(this.getRootControlInstance(), true);

					//add root control is triggering overlay creation, so we need to wait for the scope to be set.
					this._oDesignTime.addRootElement(this._oRootControl);

					jQuery(Overlay.getOverlayContainer()).addClass("sapUiRta");
					if (this.getLayer() === Layer.USER) {
						jQuery(Overlay.getOverlayContainer()).addClass("sapUiRtaPersonalize");
					} else {
						// RTA Visual Improvements
						jQuery("body").addClass("sapUiRtaMode");
					}
					this._oDesignTime.getSelectionManager().attachChange(function(oEvent) {
						this.fireSelectionChange({selection: oEvent.getParameter("selection")});
					}, this);

					this._oDesignTime.attachEventOnce("synced", function() {
						fnResolve();
						Measurement.end("rta.dt.startup", "Measurement of RTA: DesignTime start up");
					}, this);

					this._oDesignTime.attachEventOnce("syncFailed", function(oEvent) {
						fnReject(oEvent.getParameter("error"));
					});
				}.bind(this));

				// Register function for checking unsaved before leaving RTA
				this._oldUnloadHandler = window.onbeforeunload;
				window.onbeforeunload = this._onUnload.bind(this);
				return undefined;
			}.bind(this))
			.then(function () {
				if (this.getShowToolbars()) {
					// Create ToolsMenu
					return this._getToolbarButtonsVisibility()
						.then(this._createToolsMenu.bind(this));
				}
				return undefined;
			}.bind(this))
			// this is needed to initially check if undo is available, e.g. when the stack gets initialized with changes
			.then(this._onStackModified.bind(this))
			.then(function () {
				//Resolve the CSS variable set in themes/base/OverlayWithScrollbar.css
				Overlay.getOverlayContainer().get(0).style.setProperty("--sap-ui-rta-scrollbar-scrollWidth", DOMUtil.getScrollbarWidth() + "px");
				Overlay.getOverlayContainer().get(0).style.setProperty("--sap-ui-rta-scrollbar-scrollWidthPlusTwo", DOMUtil.getScrollbarWidth() + 2 + "px");
				return oDesignTimePromise;
			})
			.then(function () {
				// PopupManager sets the toolbar to already open popups' autoCloseAreas
				// Since at this point the toolbar is not available, it waits for RTA to start,
				// before adding it to the autoCloseAreas of the open popups
				this.getPopupManager().setRta(this);
				if (this.getShowToolbars()) {
					// the show() method of the toolbar relies on this RTA instance being set on the PopupManager
					return this.getToolbar().show();
				}
				return undefined;
			}.bind(this))
			.then(function () {
				if (Device.browser.name === "ff") {
					// in FF shift+f10 also opens a browser context menu.
					// It seems that the only way to get rid of it is to completely turn off context menu in ff..
					jQuery(document).on("contextmenu", _ffContextMenuHandler);
				}
			})
			.then(function() {
				this.fnKeyDown = this._onKeyDown.bind(this);
				jQuery(document).on("keydown", this.fnKeyDown);
				this.fnOnPersonalizationChangeCreation = this._onPersonalizationChangeCreation.bind(this);
				ControlPersonalizationWriteAPI.attachChangeCreation(
					this.getRootControlInstance(),
					this.fnOnPersonalizationChangeCreation
				);
			}.bind(this))
			.then(this._shouldValidateFlexEnabled)
			.then(function (bShouldValidateFlexEnabled) {
				if (bShouldValidateFlexEnabled) {
					validateFlexEnabled(this);
				}
				this._sStatus = STARTED;
				this.fireStart({
					editablePluginsCount: this.getPluginManager().getEditableOverlaysCount()
				});
			}.bind(this))
			.catch(function (vError) {
				if (vError !== "Reload triggered") {
					this._sStatus = FAILED;
					this.fireFailed(vError);
				}
				if (vError) {
					// destroy rta when reload is triggered
					this.destroy();
					return Promise.reject(vError);
				}
				return undefined;
			}.bind(this));
		}
		return undefined;
	};

	function _ffContextMenuHandler() {
		return false;
	}

	/**
	 * Checks the publish button, draft buttons(activate and delete) and app variant support (i.e. Save As and Overview of App Variants) availability
	 * @private
	 * @returns {Promise<map>} with publishAvailable, publishAppVariantSupported and draftAvailable values
	 * @description The publish button shall not be available if the system is productive and if a merge error occurred during merging changes into the view on startup
	 * The app variant support shall not be available if the system is productive and if the platform is not enabled (See Feature.js) to show the app variant tooling
	 * isProductiveSystem should only return true if it is a test or development system with the provision of custom catalog extensions
	 */
	RuntimeAuthoring.prototype._getToolbarButtonsVisibility = function() {
		return FeaturesAPI.isPublishAvailable().then(function(bIsPublishAvailable) {
			return RtaAppVariantFeature.isSaveAsAvailable(this.getRootControlInstance(), this.getLayer(), this._oSerializer).then(function(bIsSaveAsAvailable) {
				return {
					publishAvailable: bIsPublishAvailable,
					saveAsAvailable: bIsPublishAvailable && bIsSaveAsAvailable
				};
			});
		}.bind(this));
	};

	RuntimeAuthoring.prototype._isOldVersionDisplayed = function() {
		return VersionsAPI.isOldVersionDisplayed({
			control: this.getRootControlInstance(),
			layer: this.getLayer()
		});
	};

	RuntimeAuthoring.prototype._isDraftAvailable = function() {
		return VersionsAPI.isDraftAvailable({
			control: this.getRootControlInstance(),
			layer: this.getLayer()
		});
	};

	function showTechnicalError(vError) {
		BusyIndicator.hide();
		var sErrorMessage = vError.userMessage || vError.stack || vError.message || vError.status || vError;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		Log.error("Failed to transfer changes", sErrorMessage);
		var sMsg = oTextResources.getText("MSG_TECHNICAL_ERROR") + "\n"
				+ oTextResources.getText("MSG_ERROR_REASON", sErrorMessage);
		MessageBox.error(sMsg, {
			styleClass: Utils.getRtaStyleClassName()
		});
	}

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.setCommandStack = function(oCommandStack) {
		var oOldCommandStack = this.getProperty("commandStack");
		if (oOldCommandStack) {
			oOldCommandStack.detachModified(this._onStackModified, this);
		}

		if (this._oInternalCommandStack) {
			this._oInternalCommandStack.destroy();
			delete this._oInternalCommandStack;
		}

		var oResult = this.setProperty("commandStack", oCommandStack);

		if (oCommandStack) {
			oCommandStack.attachModified(this._onStackModified, this);
		}

		if (this.getPluginManager && this.getPluginManager()) {
			this.getPluginManager().provideCommandStack("settings", oCommandStack);
		}

		return oResult;
	};

	/**
	 *
	 * @override
	 */
	RuntimeAuthoring.prototype.getCommandStack = function() {
		var oCommandStack = this.getProperty("commandStack");
		if (!oCommandStack) {
			oCommandStack = new CommandStack();
			this._oInternalCommandStack = oCommandStack;
			this.setCommandStack(oCommandStack);
		}

		return oCommandStack;
	};

	/**
	 * adapt the enablement of undo/redo/reset/transport button
	 * @returns {Promise} Resolves as soon as the MessageBox is closed
	 * @private
	 */
	RuntimeAuthoring.prototype._onStackModified = function() {
		var bBackEndDraftExists = this._oVersionsModel.getProperty("/backendDraft");
		var bDraftDisplayed = this._oVersionsModel.getProperty("/displayedVersion") === Version.Number.Draft;
		var oCommandStack = this.getCommandStack();
		var bCanUndo = oCommandStack.canUndo();

		if (
			!this.getShowToolbars() ||
			!bCanUndo ||
			this._bUserDiscardedDraft ||
			bDraftDisplayed ||
			!bBackEndDraftExists
		) {
			return this._modifyStack();
		}

		// warn the user: the existing draft would be discarded in case the user saves
		return Utils.showMessageBox("warning", "MSG_DRAFT_DISCARD_AND_CREATE_NEW_DIALOG", {
			titleKey: "TIT_DRAFT_DISCARD_DIALOG",
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		})
		.then(function(sAction) {
			if (sAction === MessageBox.Action.OK) {
				this._discardDraftConfirmed();
			} else {
				this.undo();
			}
		}.bind(this));
	};

	RuntimeAuthoring.prototype._discardDraftConfirmed = function() {
		this._bUserDiscardedDraft = true;
		this._modifyStack();
	};

	RuntimeAuthoring.prototype._modifyStack = function() {
		if (this.getShowToolbars()) {
			var oCommandStack = this.getCommandStack();
			var bCanUndo = oCommandStack.canUndo();
			var bCanRedo = oCommandStack.canRedo();
			var bTranslationRelevantDirtyChange = this._oToolbarControlsModel.getProperty("/translationVisible") &&
				TranslationAPI.hasTranslationRelevantDirtyChanges({layer: Layer.CUSTOMER, selector: this.getRootControlInstance()});

			// TODO: move to the setter to the ChangesState
			this._oVersionsModel.setDirtyChanges(bCanUndo);
			this._oToolbarControlsModel.setProperty("/undoEnabled", bCanUndo);
			this._oToolbarControlsModel.setProperty("/redoEnabled", bCanRedo);
			this._oToolbarControlsModel.setProperty("/publishEnabled", this.bInitialPublishEnabled || bCanUndo);
			this._oToolbarControlsModel.setProperty("/restoreEnabled", this.bInitialResetEnabled || bCanUndo);
			this._oToolbarControlsModel.setProperty("/translationEnabled", this.bPersistedDataTranslatable || bTranslationRelevantDirtyChange);
		}
		this.fireUndoRedoStackModified();
		return Promise.resolve();
	};

	RuntimeAuthoring.prototype._checkToolbarAndExecuteFunction = function (sName, vValue) {
		if (this.getShowToolbars() && this.getToolbar && this.getToolbar()) {
			return this.getToolbar()[sName](vValue);
		}
		return undefined;
	};

	/**
	 * Returns a selection from the DesignTime
	 * @return {sap.ui.dt.Overlay[]} selected overlays
	 * @public
	 */
	RuntimeAuthoring.prototype.getSelection = function() {
		if (this._oDesignTime) {
			return this._oDesignTime.getSelectionManager().get();
		}
		return [];
	};

	function waitForPendingActions() {
		return Promise.resolve(this._oDesignTime && this._oDesignTime.waitForBusyPlugins())
			.then(function() {
				return this._pElementModified;
			}.bind(this));
	}

	/**
	 * Stops Runtime Authoring
	 *
	 * @public
	 * @param {boolean} bDontSaveChanges - Stop RTA with or w/o saving changes
	 * @param {boolean} bSkipRestart - Stop RTA with or w/o checking if a reload is needed to apply e.g. personalization/app descriptor changes
	 * @returns {Promise} Resolves with undefined
	 */
	RuntimeAuthoring.prototype.stop = function(bDontSaveChanges, bSkipRestart) {
		this._checkToolbarAndExecuteFunction("setBusy", true);
		return waitForPendingActions.call(this)
			.then(this._handleReloadOnExit.bind(this, bSkipRestart))
			.then(function(oReloadInfo) {
				return ((bDontSaveChanges) ? Promise.resolve() : this._serializeToLrep(this))
				.then(this._checkToolbarAndExecuteFunction.bind(this, "hide", bDontSaveChanges))
				.then(function() {
					this.fireStop();
					if (oReloadInfo.reloadMethod && (oReloadInfo.reloadMethod !== this._RELOAD.NOT_NEEDED)) {
						oReloadInfo.deleteMaxLayer = true; // true for normal exit, false for reset
						oReloadInfo.onExit = true;
						oReloadInfo.triggerHardReload = (oReloadInfo.reloadMethod === this._RELOAD.RELOAD_PAGE); // StandAlone or AppDescriptorChanges case
						return this._handleUrlParameterOnExit(oReloadInfo);
					}
					return undefined;
				}.bind(this));
			}.bind(this))
			.catch(showTechnicalError)
			.then(function () {
				this._checkToolbarAndExecuteFunction("setBusy", false);
				this._sStatus = STOPPED;
				jQuery("body").removeClass("sapUiRtaMode");
			}.bind(this));
	};

	RuntimeAuthoring.prototype.restore = function() {
		return this._onRestore();
	};

	RuntimeAuthoring.prototype.transport = function() {
		return this._onTransport();
	};

	// ---- backward compatibility API
	RuntimeAuthoring.prototype.undo = function() {
		return this._onUndo();
	};

	RuntimeAuthoring.prototype.redo = function() {
		return this._onRedo();
	};

	RuntimeAuthoring.prototype.canUndo = function() {
		return this.getCommandStack().canUndo();
	};

	RuntimeAuthoring.prototype.canRedo = function() {
		return this.getCommandStack().canRedo();
	};
	// ---- backward compatibility API

	RuntimeAuthoring.prototype._onKeyDown = function(oEvent) {
		// if for example the addField Dialog/transport/reset Popup is open, we don't want the user to be able to undo/redo
		var bMacintosh = Device.os.macintosh;
		var bFocusInsideOverlayContainer = Overlay.getOverlayContainer().get(0).contains(document.activeElement);
		var bFocusInsideRtaToolbar = this.getShowToolbars() && this.getToolbar().getDomRef().contains(document.activeElement);
		var bFocusOnContextMenu = false;
		// there might be two divs with that style-class (compact and expanded context menu)
		jQuery(".sapUiDtContextMenu").each(function(iIndex, oDomRef) {
			if (oDomRef.contains(document.activeElement)) {
				bFocusOnContextMenu = true;
			}
		});
		var bFocusOnBody = document.body === document.activeElement;
		var bFocusInsideRenameField = jQuery(document.activeElement).parents(".sapUiRtaEditableField").length > 0;

		if ((bFocusInsideOverlayContainer || bFocusInsideRtaToolbar || bFocusOnContextMenu || bFocusOnBody) && !bFocusInsideRenameField) {
			// OSX: replace CTRL with CMD
			var bCtrlKey = bMacintosh ? oEvent.metaKey : oEvent.ctrlKey;
			if (
				oEvent.keyCode === KeyCodes.Z
				&& oEvent.shiftKey === false
				&& oEvent.altKey === false
				&& bCtrlKey === true
			) {
				this._onUndo().then(oEvent.stopPropagation.bind(oEvent));
			} else if (
				((// OSX: CMD+SHIFT+Z
					bMacintosh
					&& oEvent.keyCode === KeyCodes.Z
					&& oEvent.shiftKey === true
				) || (// Others: CTRL+Y
					!bMacintosh
					&& oEvent.keyCode === KeyCodes.Y
					&& oEvent.shiftKey === false
				))
				&& oEvent.altKey === false
				&& bCtrlKey === true
			) {
				this._onRedo().then(oEvent.stopPropagation.bind(oEvent));
			}
		}
	};

	/**
	 * Check for unsaved changes before leaving UI adaptation at runtime
	 * @return {string} Returns the message to be displayed in the unsaved changes dialog
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onUnload = function() {
		var oCommandStack = this.getCommandStack();
		var bUnsaved = oCommandStack.canUndo() || oCommandStack.canRedo();
		if (bUnsaved && this.getShowWindowUnloadDialog()) {
			return this._getTextResources().getText("MSG_UNSAVED_CHANGES");
		}
		window.onbeforeunload = this._oldUnloadHandler;
		return undefined;
	};

	RuntimeAuthoring.prototype._saveOnly = function(oEvent) {
		var fnCallback = oEvent.getParameter("callback") || function() {};
		return waitForPendingActions.call(this)
			.then(this._serializeToLrep.bind(this))
			.then(fnCallback);
	};

	RuntimeAuthoring.prototype._serializeAndSave = function() {
		this.bPersistedDataTranslatable = this._oToolbarControlsModel.getProperty("/translationEnabled");
		// Save changes on the current layer and discard dirty changes on other layers
		return this._oSerializer.saveCommands(this._oVersionsModel.getProperty("/versioningEnabled"), this.getLayer(), true);
	};

	RuntimeAuthoring.prototype._serializeToLrep = function() {
		if (!this._bReloadNeeded) {
			return this._oSerializer.needsReload().then(function(bReloadNeeded) {
				this._bReloadNeeded = bReloadNeeded;
				return this._serializeAndSave();
			}.bind(this));
		}
		return this._serializeAndSave();
	};

	RuntimeAuthoring.prototype._onUndo = function() {
		this.getPluginManager().handleStopCutPaste();
		return this.getCommandStack().undo();
	};

	RuntimeAuthoring.prototype._onRedo = function() {
		this.getPluginManager().handleStopCutPaste();
		return this.getCommandStack().redo();
	};

	RuntimeAuthoring.prototype._onActivate = function(oEvent) {
		var sVersionTitle = oEvent.getParameter("versionTitle");
		if (this._isOldVersionDisplayed() && this._isDraftAvailable()) {
			return Utils.showMessageBox("warning", "MSG_DRAFT_DISCARD_ON_REACTIVATE_DIALOG", {
				titleKey: "TIT_DRAFT_DISCARD_ON_REACTIVATE_DIALOG",
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK
			})
			.then(function(sAction) {
				if (sAction === MessageBox.Action.OK) {
					this._activate(sVersionTitle);
				}
			}.bind(this));
		}
		return this._activate(sVersionTitle);
	};

	RuntimeAuthoring.prototype._activate = function(sVersionTitle) {
		var sLayer = this.getLayer();
		var oSelector = this.getRootControlInstance();
		return VersionsAPI.activate({
			layer: sLayer,
			control: oSelector,
			title: sVersionTitle
		}).then(function () {
			this._showMessageToast("MSG_DRAFT_ACTIVATION_SUCCESS");
			this.bInitialResetEnabled = true;
			this._oToolbarControlsModel.setProperty("/restoreEnabled", true);
			this.getCommandStack().removeAllCommands();
		}.bind(this))
		.catch(function (oError) {
			Utils.showMessageBox("error", "MSG_DRAFT_ACTIVATION_FAILED", {error: oError});
		});
	};

	RuntimeAuthoring.prototype._handleDiscard = function() {
		var sLayer = this.getLayer();
		var oReloadInfo = {
			isDraftAvailable: false, // draft was just discarded
			layer: sLayer
		};
		RuntimeAuthoring.enableRestart(sLayer, this.getRootControlInstance());
		if (!FlexUtils.getUshellContainer()) {
			this.getCommandStack().removeAllCommands();
			return this._triggerHardReload(oReloadInfo);
		}
		var bTriggerReload = true;
		this.getCommandStack().removeAllCommands();
		var mParsedHash = this._removeVersionParameterForFLP(oReloadInfo, FlexUtils.getParsedURLHash(this._getUShellService("URLParsing")), bTriggerReload);
		this._triggerCrossAppNavigation(mParsedHash);
		return this.stop(true, true);
	};

	RuntimeAuthoring.prototype._onDiscardDraft = function() {
		return Utils.showMessageBox("warning", "MSG_DRAFT_DISCARD_DIALOG", {
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		})
		.then(function(sAction) {
			if (sAction === MessageBox.Action.OK) {
				return VersionsAPI.discardDraft({
					layer: this.getLayer(),
					control: this.getRootControlInstance(),
					updateState: true
				})
				.then(this._handleDiscard.bind(this));
			}
			return undefined;
		}.bind(this));
	};

	RuntimeAuthoring.prototype._onSwitchVersion = function (oEvent) {
		var sVersion = oEvent.getParameter("version");
		var sDisplayedVersion = this._oVersionsModel.getProperty("/displayedVersion");

		if (sVersion === sDisplayedVersion) {
			// already displayed version needs no switch
			return;
		}

		if (this.canUndo()) {
			this._sSwitchToVersion = sVersion;
			Utils.showMessageBox("warning", "MSG_SWITCH_VERSION_DIALOG", {
				titleKey: "TIT_SWITCH_VERSION_DIALOG",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.YES
			}).then(function (sAction) {
				if (sAction === MessageBox.Action.YES) {
					this._serializeToLrep(this)
						.then(this._switchVersion.bind(this, this._sSwitchToVersion));
				} else if (sAction === MessageBox.Action.NO) {
					// avoids the data loss popup; a reload is triggered later and will destroy RTA & the command stack
					this.getCommandStack().removeAllCommands(true);
					this._switchVersion(this._sSwitchToVersion);
				}
				return undefined;
			}.bind(this));
			return;
		}
		this._switchVersion(sVersion);
	};

	RuntimeAuthoring.prototype._switchVersion = function (sVersion) {
		RuntimeAuthoring.enableRestart(this.getLayer(), this.getRootControlInstance());

		if (!FlexUtils.getUshellContainer()) {
			if (!ReloadInfoAPI.hasVersionParameterWithValue({value: sVersion}, this._getUShellService("URLParsing"))) {
				var oReloadInfo = {
					versionSwitch: true,
					version: sVersion
				};
				return this._triggerHardReload(oReloadInfo);
			}
			return this._reloadPage();
		}
		var mParsedHash = FlexUtils.getParsedURLHash(this._getUShellService("URLParsing"));
		VersionsAPI.loadVersionForApplication({
			control: this.getRootControlInstance(),
			layer: this.getLayer(),
			version: sVersion
		});
		var aVersionsParameter = mParsedHash.params[Version.UrlParameter];
		if (
			aVersionsParameter &&
			aVersionsParameter[0] === sVersion &&
			this._getUShellService("AppLifeCycle")
		) {
			// RTA was started with a version parameter, the displayed version has changed and the key user switches back
			this._getUShellService("AppLifeCycle").reloadCurrentApp();
		} else {
			mParsedHash.params[Version.UrlParameter] = sVersion;
			this._triggerCrossAppNavigation(mParsedHash);
		}
		return undefined;
	};

	RuntimeAuthoring.prototype._setUriParameter = function (sParameters) {
		document.location.search = sParameters;
	};

	RuntimeAuthoring.prototype._createToolsMenu = function(aButtonsVisibility) {
		if (!this.getDependent("toolbar")) {
			var bUserLayer = this.getLayer() === Layer.USER;
			var oProperties = {
				rtaInformation: {
					flexSettings: this.getFlexSettings(),
					rootControl: this.getRootControlInstance(),
					commandStack: this.getCommandStack()
				},
				textResources: this._getTextResources(),
				restore: this._onRestore.bind(this),
				exit: this.stop.bind(this, false, bUserLayer),
				save: this._saveOnly.bind(this)
			};

			if (!bUserLayer) {
				oProperties.transport = this._onTransport.bind(this);
				oProperties.undo = this._onUndo.bind(this);
				oProperties.redo = this._onRedo.bind(this);
				oProperties.modeChange = this._onModeChange.bind(this);
				oProperties.activate = this._onActivate.bind(this);
				oProperties.discardDraft = this._onDiscardDraft.bind(this);
				oProperties.switchVersion = this._onSwitchVersion.bind(this);
				oProperties.openChangeCategorySelectionPopover = this.getChangeVisualization
					? this.getChangeVisualization().openChangeCategorySelectionPopover.bind(this.getChangeVisualization())
					: function () {};
			}

			var oToolbar;
			if (bUserLayer) {
				oToolbar = new PersonalizationToolbar(oProperties);
			} else if (Utils.isOriginalFioriToolbarAccessible()) {
				oToolbar = new FioriToolbar(oProperties);
			} else if (Utils.getFiori2Renderer()) {
				oToolbar = new FioriLikeToolbar(oProperties);
			} else {
				oToolbar = new StandaloneToolbar(oProperties);
			}
			this.addDependent(oToolbar, "toolbar");

			return Promise.all([oToolbar.onFragmentLoaded(), FeaturesAPI.isKeyUserTranslationEnabled(this.getLayer())])
				.then(function(aArguments) {
					var bTranslationAvailable = aArguments[1];
					var bSaveAsAvailable = aButtonsVisibility.saveAsAvailable;
					var bExtendedOverview = bSaveAsAvailable && RtaAppVariantFeature.isOverviewExtended();
					var oUriParameters = UriParameters.fromURL(window.location.href);
					// the "Visualization" tab should not be visible if the "fiori-tools-rta-mode" URL-parameter is set to any value but "false"
					var bVisualizationButtonVisible;
					bVisualizationButtonVisible = !oUriParameters.has("fiori-tools-rta-mode") || oUriParameters.get("fiori-tools-rta-mode") === "false";
					this.bPersistedDataTranslatable = false;

					this._oToolbarControlsModel = new JSONModel({
						undoEnabled: false,
						redoEnabled: false,
						translationVisible: bTranslationAvailable,
						translationEnabled: this.bPersistedDataTranslatable,
						publishVisible: aButtonsVisibility.publishAvailable,
						publishEnabled: this.bInitialPublishEnabled,
						restoreEnabled: this.bInitialResetEnabled,
						appVariantsOverviewVisible: bSaveAsAvailable && bExtendedOverview,
						appVariantsOverviewEnabled: bSaveAsAvailable && bExtendedOverview,
						saveAsVisible: bSaveAsAvailable,
						saveAsEnabled: false,
						manageAppsVisible: bSaveAsAvailable && !bExtendedOverview,
						manageAppsEnabled: bSaveAsAvailable && !bExtendedOverview,
						modeSwitcher: this.getMode(),
						visualizationButtonVisible: bVisualizationButtonVisible
					});

					var oTranslationPromise = new Promise(function (resolve) {
						if (!bTranslationAvailable) {
							resolve();
							return;
						}

						TranslationAPI.getSourceLanguages({selector: this.getRootControlInstance(), layer: this.getLayer()})
							.then(function (aSourceLanguages) {
								this.bPersistedDataTranslatable = aSourceLanguages.length > 0;
								this._oToolbarControlsModel.setProperty("/translationEnabled", this.bPersistedDataTranslatable);
							}.bind(this)).finally(resolve);
					}.bind(this));

					var oSaveAsPromise = new Promise(function (resolve) {
						if (!bSaveAsAvailable) {
							resolve();
							return;
						}

						RtaAppVariantFeature.isManifestSupported().then(function (bResult) {
							this._oToolbarControlsModel.setProperty("/saveAsEnabled", bResult);
							this._oToolbarControlsModel.setProperty("/appVariantsOverviewEnabled", bResult);
							this._oToolbarControlsModel.setProperty("/manageAppsEnabled", bResult);
						}.bind(this)).finally(resolve);
					}.bind(this));

					this.getToolbar().setModel(this._oVersionsModel, "versions");
					this.getToolbar().setModel(this._oToolbarControlsModel, "controls");

					return Promise.all([oTranslationPromise, oSaveAsPromise]);
				}.bind(this));
		}
		return Promise.resolve();
	};

	/**
	 * Exit Runtime Authoring - destroy all controls and plugins
	 *
	 * @protected
	 */
	RuntimeAuthoring.prototype.destroy = function () {
		jQuery.map(this._dependents, function (oDependent, sName) {
			this.removeDependent(sName);
			// Destroy should be called with suppress invalidate = true here to prevent static UI Area invalidation
			oDependent.destroy(true);
		}.bind(this));

		Object.keys(this._mServices).forEach(function (sServiceName) {
			this.stopService(sServiceName);
		}, this);

		if (this._oDesignTime) {
			this._oDesignTime.destroy();
			this._oDesignTime = null;

			// detach browser events
			jQuery(document).off("keydown", this.fnKeyDown);

			if (this.fnOnPersonalizationChangeCreation) {
				ControlPersonalizationWriteAPI.detachChangeCreation(
					this.getRootControlInstance(),
					this.fnOnPersonalizationChangeCreation
				);
			}
		}

		if (this.getRootControlInstance()) {
			addOrRemoveStyleClass(this.getRootControlInstance(), false);
		}

		this.setCommandStack(null);

		if (this._oServiceEventBus) {
			this._oServiceEventBus.destroy();
		}

		if (Device.browser.name === "ff") {
			jQuery(document).off("contextmenu", _ffContextMenuHandler);
		}

		window.onbeforeunload = this._oldUnloadHandler;

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Function to handle ABAP transport of the changes
	 * @return {Promise} Returns a Promise processing the transport of changes
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onTransport = function() {
		this.getPluginManager().handleStopCutPaste();

		BusyIndicator.show(500);
		return this._serializeToLrep().then(function () {
			BusyIndicator.hide();
			var bVariantByStartupParameter = FlexUtils.isVariantByStartupParameter(this._oRootControl);
			var bAppVariantRunning = SmartVariantManagementApplyAPI.isApplicationVariant({control: this._oRootControl}) && !bVariantByStartupParameter;
			return (bAppVariantRunning ? RtaAppVariantFeature.getAppVariantDescriptor(this._oRootControl) : Promise.resolve())
				.then(function(oAppVariantDescriptor) {
					var aAppVariantDescriptor = [];
					if (oAppVariantDescriptor) {
						aAppVariantDescriptor.push(oAppVariantDescriptor);
					}
					return PersistenceWriteAPI.publish({
						selector: this.getRootControlInstance(),
						styleClass: Utils.getRtaStyleClassName(),
						layer: this.getLayer(),
						appVariantDescriptors: aAppVariantDescriptor
					})
						.then(function(sMessage) {
							if (sMessage !== "Error" && sMessage !== "Cancel") {
								MessageToast.show(sMessage);
								if (this.getShowToolbars()) {
									PersistenceWriteAPI.getResetAndPublishInfo({
										selector: this.getRootControlInstance(),
										layer: this.getLayer()
									})
									.then(function(oPublishAndResetInfo) {
										this._oToolbarControlsModel.setProperty("/publishEnabled", oPublishAndResetInfo.isPublishEnabled);
										this._oToolbarControlsModel.setProperty("/restoreEnabled", oPublishAndResetInfo.isResetEnabled);
									}.bind(this));
								}
							}
						}.bind(this));
				}.bind(this));
		}.bind(this))["catch"](showTechnicalError);
	};

	/**
	 * Delete all changes for current layer and root control's component.
	 * In case of Base Applications (no App Variants) the App Descriptor Changes and UI Changes are saved in different Flex Persistence instances,
	 * the changes for both places will be deleted. For App Variants all the changes are saved in one place.
	 *
	 * @private
	 * @returns {Promise} Resolves when change persistence is resetted
	 */
	RuntimeAuthoring.prototype._deleteChanges = function() {
		var sLayer = this.getLayer();
		var oSelector = FlexUtils.getAppComponentForControl(this.getRootControlInstance());
		return PersistenceWriteAPI.reset({
			selector: oSelector,
			layer: sLayer
		}).then(function () {
			// avoids the data loss popup; a reload is triggered later and will destroy RTA & the command stack
			this.getCommandStack().removeAllCommands(true);
			ReloadInfoAPI.removeInfoSessionStorage(oSelector);
			var oReloadInfo = {
				isDraftAvailable: ReloadInfoAPI.hasVersionParameterWithValue({value: sLayer}, this._getUShellService("URLParsing")),
				layer: sLayer,
				deleteMaxLayer: false,
				triggerHardReload: true
			};
			return this._handleUrlParameterOnExit(oReloadInfo);
		}.bind(this))
		.catch(function (oError) {
			if (oError !== "cancel") {
				Utils.showMessageBox("error", "MSG_RESTORE_FAILED", {error: oError});
			}
		});
	};

	/**
	 * Reloads the page.
	 * @private
	 */
	RuntimeAuthoring.prototype._reloadPage = function() {
		window.location.reload();
	};

	/**
	 * Shows a message toast.
	 * @param  {string} sMessageKey - The text key for the message
	 * @param  {object} mOptions - Options for message toast
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessageToast = function(sMessageKey, mOptions) {
		var sMessage = this._getTextResources().getText(sMessageKey);

		MessageToast.show(sMessage, mOptions || {});
	};

	/**
	 * The RTA FLP plugin checks whether RTA needs to be restarted and restarts it if needed.
	 *
	 * @public
	 * @static
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @returns {boolean} Returns true if restart is needed
	 */
	RuntimeAuthoring.needsRestart = function(sLayer) {
		return !!window.sessionStorage.getItem("sap.ui.rta.restart." + sLayer);
	};

	/**
	 * Enable restart of RTA
	 * the RTA FLP plugin handles the restart
	 *
	 * @public
	 * @static
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @param {sap.ui.core.Control} oRootControl - Root control for which RTA was started
	 */
	RuntimeAuthoring.enableRestart = function(sLayer, oRootControl) {
		var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oRootControl});
		var vParameter = sFlexReference || true;
		window.sessionStorage.setItem("sap.ui.rta.restart." + sLayer, vParameter);
	};

	/**
	 * Disable restart of RTA
	 *
	 * @public
	 * @static
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 */
	RuntimeAuthoring.disableRestart = function(sLayer) {
		window.sessionStorage.removeItem("sap.ui.rta.restart." + sLayer);
	};

	/**
	 * Discard all LREP changes and restores the default app state,
	 * opens a MessageBox where the user can confirm
	 * the restoring to the default app state
	 *
	 * @private
	 * @returns {Promise} Resolves when Message Box is closed.
	 */
	RuntimeAuthoring.prototype._onRestore = function() {
		var sLayer = this.getLayer();
		var sMessageKey = sLayer === Layer.USER
			? "FORM_PERS_RESET_MESSAGE_PERSONALIZATION"
			: "FORM_PERS_RESET_MESSAGE";
		var sTitleKey = sLayer === Layer.USER
			? "BTN_RESTORE"
			: "FORM_PERS_RESET_TITLE";

		this.getPluginManager().handleStopCutPaste();

		return Utils.showMessageBox("warning", sMessageKey, {
			titleKey: sTitleKey,
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		}).then(function(sAction) {
			if (sAction === MessageBox.Action.OK) {
				RuntimeAuthoring.enableRestart(sLayer, this.getRootControlInstance());
				return this._deleteChanges();
			}
			return undefined;
		}.bind(this));
	};

	/**
	 * Triggers a callback when a control gets created with its associated overlay.
	 * @param {string} sNewControlID - ID of the newly created control
	 * @param {Function} fnCallback - Callback to execute when the conditions are met, the overlay is the only parameter
	 */
	RuntimeAuthoring.prototype._scheduleOnCreated = function (sNewControlID, fnCallback) {
		function onElementOverlayCreated (oEvent) {
			var oNewOverlay = oEvent.getParameter("elementOverlay");
			if (oNewOverlay.getElement().getId() === sNewControlID) {
				this._oDesignTime.detachEvent("elementOverlayCreated", onElementOverlayCreated, this);
				fnCallback(oNewOverlay);
			}
		}

		this._oDesignTime.attachEvent("elementOverlayCreated", onElementOverlayCreated, this);
	};

	/**
	 * Triggers a callback when a control gets created and its associated overlay is visible.
	 * @param {string} sNewControlID - ID of the newly created control
	 * @param {Function} fnCallback - Callback to execute when the conditions are met, the overlay is the only parameter
	 */
	RuntimeAuthoring.prototype._scheduleOnCreatedAndVisible = function (sNewControlID, fnCallback) {
		function onGeometryChanged (oEvent) {
			var oElementOverlay = oEvent.getSource();
			if (oElementOverlay.getGeometry() && oElementOverlay.getGeometry().visible) {
				oElementOverlay.detachEvent("geometryChanged", onGeometryChanged);
				fnCallback(oElementOverlay);
			}
		}

		function onGeometryCheck (oElementOverlay) {
			// the control can be set to visible, but still have no size when we do the check
			// that's why we also attach to 'geometryChanged' and check if the overlay has a size
			if (!oElementOverlay.getGeometry() || !oElementOverlay.getGeometry().visible) {
				oElementOverlay.attachEvent("geometryChanged", onGeometryChanged);
			} else {
				fnCallback(oElementOverlay);
			}
		}

		this._scheduleOnCreated(sNewControlID, function (oNewOverlay) {
			// the overlay needs to be rendered
			if (oNewOverlay.isRendered()) {
				onGeometryCheck(oNewOverlay);
			} else {
				oNewOverlay.attachEventOnce("afterRendering", function (oEvent) {
					onGeometryCheck(oEvent.getSource());
				});
			}
		});
	};

	/**
	 * Function to automatically start the rename plugin on a container when it gets created
	 *
	 * @param {object} vAction The create action from designtime metadata
	 * @param {string} sNewControlID The id of the newly created container
	 */
	RuntimeAuthoring.prototype._scheduleRenameOnCreatedContainer = function(vAction, sNewControlID) {
		var fnStartEdit = function (oElementOverlay) {
			oElementOverlay.setSelected(true);
			this.getPluginManager().getPlugin("rename").startEdit(oElementOverlay);
		}.bind(this);

		this._scheduleOnCreatedAndVisible(sNewControlID, function (oElementOverlay) {
			// get container of the new control for rename
			var sNewContainerID = this.getPluginManager().getPlugin("createContainer").getCreatedContainerId(vAction, oElementOverlay.getElement().getId());
			var oContainerElementOverlay = OverlayRegistry.getOverlay(sNewContainerID);
			if (oContainerElementOverlay) {
				fnStartEdit(oContainerElementOverlay);
			} else {
				this._scheduleOnCreatedAndVisible(sNewContainerID, fnStartEdit);
			}
		}.bind(this));
	};

	/**
	 * Function to handle modification of an element
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @returns {Promise} Returns promise that resolves after command was executed sucessfully
	 * @private
	 */
	RuntimeAuthoring.prototype._handleElementModified = function(oEvent) {
		// events are synchronously reset after the handlers are called
		var oCommand = oEvent.getParameter("command");
		var sNewControlID = oEvent.getParameter("newControlId");
		var vAction = oEvent.getParameter("action");

		this._pElementModified = this._pElementModified.then(function() {
			this.getPluginManager().handleStopCutPaste();

			if (oCommand instanceof BaseCommand) {
				if (sNewControlID) {
					this._scheduleOnCreated(sNewControlID, function (oElementOverlay) {
						var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
						var fnSelect = oDesignTimeMetadata.getData().select;
						if (typeof fnSelect === "function") {
							fnSelect(oElementOverlay.getElement());
						}
					});
					if (vAction) {
						this._scheduleRenameOnCreatedContainer(vAction, sNewControlID);
					}
				}
				return this.getCommandStack().pushAndExecute(oCommand)
					// Error handling when a command fails is done in the Stack
					.catch(function(oError) {
						if (oError && oError.message && oError.message.indexOf("The following Change cannot be applied because of a dependency") > -1) {
							Utils.showMessageBox("error", "MSG_DEPENDENCY_ERROR", {error: oError});
						}
						Log.error("sap.ui.rta: " + oError.message);
					});
			}
		}.bind(this));
		return this._pElementModified;
	};

	/**
	 * Build the navigation arguments object required to trigger the navigation
	 * using the CrossApplicationNavigation ushell service.
	 *
	 * @param  {Object} mParsedHash Parsed URL hash
	 * @return {Object} Returns argument map ("oArg" parameter of the "toExternal" function)
	 */
	RuntimeAuthoring.prototype._buildNavigationArguments = function(mParsedHash) {
		return {
			target: {
				semanticObject: mParsedHash.semanticObject,
				action: mParsedHash.action,
				context: mParsedHash.contextRaw
			},
			params: mParsedHash.params,
			appSpecificRoute: mParsedHash.appSpecificRoute,
			writeHistory: false
		};
	};

	RuntimeAuthoring.prototype._triggerCrossAppNavigation = function(mParsedHash) {
		if (
			(this.getLayer() !== Layer.USER) &&
			this._getUShellService("CrossApplicationNavigation")
		) {
			this._getUShellService("CrossApplicationNavigation")
				.toExternal(this._buildNavigationArguments(mParsedHash));
			return true;
		}
		return false;
	};

	RuntimeAuthoring.prototype._removeVersionParameterForFLP = function(oReloadInfo, mParsedHash, bTriggerReload) {
		var sLayer = this.getLayer();
		if (sLayer === Layer.USER) {
			return mParsedHash;
		}

		var sVersionParameter = FlexUtils.getParameter(Version.UrlParameter, this._getUShellService("URLParsing"));
		if (sVersionParameter) {
			delete mParsedHash.params[Version.UrlParameter];
		} else if (
			(this._isDraftAvailable() || bTriggerReload /* for discarding of dirty changes */) &&
			!oReloadInfo.hasHigherLayerChanges &&
			this._getUShellService("AppLifeCycle")
		) {
			// reloading this way only works when we dont have to remove max-layer parameter, see _removeMaxLayerParameterForFLP
			this._getUShellService("AppLifeCycle").reloadCurrentApp();
		}
		return mParsedHash;
	};

	RuntimeAuthoring.prototype._removeMaxLayerParameterForFLP = function(oReloadInfo, mParsedHash) {
		// keep max layer parameter when reset was called, remove it on save & exit
		if (oReloadInfo.deleteMaxLayer && oReloadInfo.hasHigherLayerChanges) {
			delete mParsedHash.params[LayerUtils.FL_MAX_LAYER_PARAM];
		}
		return mParsedHash;
	};

	/**
	 * Reload the app inside FLP or Standalone by removing max layer / draft parameter;
	 *
	 * @param {boolean} oReloadInfo - Information needed to
	 * @param {boolean} oReloadInfo.deleteMaxLayer - Indicates if the <code>sap-ui-fl-max-layer</code> parameter should be removed or not (reset / exit)
	 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
	 * @param  {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
	 *
	 * @return {map} parsedHash
	 */
	RuntimeAuthoring.prototype._handleUrlParameterOnExit = function(oReloadInfo) {
		if (!FlexUtils.getUshellContainer()) {
			return this._triggerHardReload(oReloadInfo);
		}

		var mParsedHash = FlexUtils.getParsedURLHash(this._getUShellService("URLParsing"));
		if (!mParsedHash) {
			return undefined;
		}

		// allContexts do not change the url parameter to trigger a reload
		if (
			oReloadInfo.allContexts &&
			!oReloadInfo.hasHigherLayerChanges &&
			this._getUShellService("AppLifeCycle")
		) {
			this._getUShellService("AppLifeCycle").reloadCurrentApp();
		}

		mParsedHash = this._removeMaxLayerParameterForFLP(oReloadInfo, mParsedHash);
		mParsedHash = this._removeVersionParameterForFLP(oReloadInfo, mParsedHash, false);
		this._triggerCrossAppNavigation(mParsedHash);

		// In FLP scenario we need to remove all parameters and also trigger an hard reload on reset
		if (oReloadInfo.triggerHardReload) {
			this._reloadPage();
		}
		return undefined;
	};

	/**
	 * Returns the correct message - why a reload is needed.
	 *
	 * @param  {object}  oReloadInfo - Contains the information needed to return the correct reload message
	 * @param  {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
	 * @param  {boolean} oReloadInfo.isDraftAvailable - Indicates if a draft is available
	 * @param  {boolean} oReloadInfo.allContexts - Indicates if a all contexts is visible
	 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
	 *
	 * @return {string} sReason Reload message
	 */
	RuntimeAuthoring.prototype._getReloadMessageOnStart = function(oReloadInfo) {
		var sReason;
		var bIsCustomerLayer = oReloadInfo.layer === Layer.CUSTOMER;

		if (oReloadInfo.hasHigherLayerChanges && oReloadInfo.isDraftAvailable) {
			sReason = bIsCustomerLayer ? "MSG_VIEWS_OR_PERSONALIZATION_AND_DRAFT_EXISTS" : "MSG_HIGHER_LAYER_CHANGES_AND_DRAFT_EXISTS";
		} else if (oReloadInfo.hasHigherLayerChanges && oReloadInfo.allContexts) {
			sReason = "MSG_RESTRICTED_CONTEXT_EXIST_AND_PERSONALIZATION";
		} else if (oReloadInfo.hasHigherLayerChanges) {
			sReason = bIsCustomerLayer ? "MSG_PERSONALIZATION_OR_PUBLIC_VIEWS_EXISTS" : "MSG_HIGHER_LAYER_CHANGES_EXIST";
		} else if (oReloadInfo.isDraftAvailable) {
			sReason = "MSG_DRAFT_EXISTS";
		} else if (oReloadInfo.allContexts) {
			sReason = "MSG_RESTRICTED_CONTEXT_EXIST";
		} // TODO add app descr changes case for start?
		return sReason;
	};

	/**
	 * Returns the correct message - why a reload is needed.
	 *
	 * @param  {object}  oReloadInfo - Contains the information needed to return the correct reload message
	 * @param  {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if sap-ui-fl-max-layer parameter is present in the url
	 * @param  {boolean} oReloadInfo.isDraftAvailable - Indicates if a draft is available
	 * @param  {boolean} oReloadInfo.changesNeedReload - Indicates if app descriptor changes need hard reload
	 * @param  {boolean} oReloadInfo.initialDraftGotActivated - Indicates if a draft got activated and had a draft initially when entering UI adaptation
	 * @param  {boolean} oReloadInfo.allContexts - Indicates if restricted contexts is visible
	 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
	 *
	 * @returns {string} sReason Reload message
	 */
	RuntimeAuthoring.prototype._getReloadMessageOnExit = function(oReloadInfo) {
		var bIsCustomerLayer = oReloadInfo.layer === Layer.CUSTOMER;

		if (oReloadInfo.hasHigherLayerChanges) {
			if (!bIsCustomerLayer) {
				return "MSG_RELOAD_WITH_ALL_CHANGES";
			}
			if (oReloadInfo.isDraftAvailable) {
				return "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT";
			}
			if (oReloadInfo.allContexts) {
				return "MSG_RELOAD_WITH_PERSONALIZATION_AND_RESTRICTED_CONTEXT";
			}
			return "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS";
		}

		if (oReloadInfo.initialDraftGotActivated) {
			return "MSG_RELOAD_ACTIVATED_DRAFT";
		}

		if (oReloadInfo.isDraftAvailable) {
			return "MSG_RELOAD_WITHOUT_DRAFT";
		}

		if (oReloadInfo.changesNeedReload) {
			return "MSG_RELOAD_NEEDED";
		}

		if (oReloadInfo.allContexts) {
			return "MSG_RELOAD_WITHOUT_ALL_CONTEXT";
		}
		return undefined;
	};

	/**
	 * Handler for the message box warning the user that personalization changes exist
	 * and the app will be reloaded
	 *
	 * @param  {Object} oReloadReasons Information to determine which message to show
	 * @returns {Promise} Resolving when the user clicks on OK
	 */
	RuntimeAuthoring.prototype._handleReloadMessageBoxOnExit = function(oReloadReasons) {
		var sReason = this._getReloadMessageOnExit(oReloadReasons);

		if (sReason) {
			return Utils.showMessageBox("information", sReason, {
				titleKey: "HEADER_RELOAD_NEEDED"
			});
		}
		return Promise.resolve();
	};

	RuntimeAuthoring.prototype._triggerReloadOnStart = function(oReloadInfo) {
		if (this._getUShellService("CrossApplicationNavigation") && this._oVersionsModel.getProperty("/versioningEnabled")) {
			if (oReloadInfo.isDraftAvailable) {
				// clears FlexState and triggers reloading of the flex data without blocking
				VersionsAPI.loadDraftForApplication({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer
				});
			} else {
				VersionsAPI.loadVersionForApplication({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer,
					allContexts: oReloadInfo.allContexts
				});
			}
		}
		var sReason = this._getReloadMessageOnStart(oReloadInfo);
		if (!sReason) {
			return Promise.resolve();
		}
		// showing messages in visual editor is leading to blocked screen. In this case we should reload without message
		return (this.getFlexSettings().developerMode ? Promise.resolve() : Utils.showMessageBox("information", sReason))
			.then(function() {
				RuntimeAuthoring.enableRestart(oReloadInfo.layer, this.getRootControlInstance());
				// allContexts do not change the url parameter to trigger a reload
				if (
					oReloadInfo.allContexts &&
					!oReloadInfo.hasHigherLayerChanges &&
					this._getUShellService("AppLifeCycle")
				) {
					this._getUShellService("AppLifeCycle").reloadCurrentApp();
				}
				if (FlexUtils.getUshellContainer()) {
					// clears FlexState and triggers reloading of the flex data without blocking
					var oParsedHash = ReloadInfoAPI.handleParametersOnStart(oReloadInfo);
					return this._triggerCrossAppNavigation(oParsedHash);
				}
				return this._triggerHardReload(oReloadInfo);
			}.bind(this));
	};

	/**
	 * Check if there are personalization changes/draft changes and restart the application without/with them;
	 * Warn the user that the application will be restarted without personalization / with draft changes;
	 * Check if it is neccessary to load all contexts
	 * This is only valid when a UShell is present;
	 *
	 * @return {Promise<boolean>} Resolving to false means that reload is not necessary
	 */
	RuntimeAuthoring.prototype._determineReload = function() {
		var oReloadInfo = {
			hasHigherLayerChanges: false,
			isDraftAvailable: false,
			layer: this.getLayer(),
			selector: this.getRootControlInstance(),
			ignoreMaxLayerParameter: false,
			includeCtrlVariants: true,
			URLParsingService: this._getUShellService("URLParsing")
		};
		return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo)
		.then(function (oReloadInfo) {
			var oFlexInfoSession = PersistenceWriteAPI.getResetAndPublishInfoFromSession(oReloadInfo.selector);
			this.bInitialResetEnabled = !!oFlexInfoSession.isResetEnabled;
			this.bInitialPublishEnabled = !!oFlexInfoSession.isPublishEnabled;
			if (oReloadInfo.hasHigherLayerChanges || oReloadInfo.isDraftAvailable || oReloadInfo.allContexts) {
				return this._triggerReloadOnStart(oReloadInfo);
			}
			return undefined;
		}.bind(this));
	};

	/**
	 * Change URL parameters if necessary, which will trigger an reload;
	 * This function must only be called outside of the ushell.
	 *
	 * @param {Object} oReloadInfo - Information to determine reload is needed
	 * @returns {Promise} Resolves when page reload is triggered
	 */
	RuntimeAuthoring.prototype._triggerHardReload = function(oReloadInfo) {
		oReloadInfo.parameters = document.location.search;
		oReloadInfo.URLParsingService = this._getUShellService("URLParsing");
		var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
		if (document.location.search !== sParameters) {
			this._setUriParameter(sParameters);
			return Promise.resolve();
		}
		return this._reloadPage();
	};

	/**
	 * When exiting RTA and personalization changes exist, the user can choose to
	 * reload the app with personalization or stay in the app without the personalization
	 * @param {boolean} bSkipRestart - Stop RTA without reloading the app in any way
	 *
	 * @return {Promise<object>} Resolving to an object containing information about if an reload is needed and how to handle it
	 */
	RuntimeAuthoring.prototype._handleReloadOnExit = function(bSkipRestart) {
		if (bSkipRestart) {
			return Promise.resolve({reloadMethod: this._RELOAD.NOT_NEEDED});
		}

		var oReloadPromise = this._bReloadNeeded ? Promise.resolve(this._bReloadNeeded) : this._oSerializer.needsReload();
		return oReloadPromise.then(function (bChangesNeedReload) {
			var oReloadInfo = {
				layer: this.getLayer(),
				selector: this.getRootControlInstance(),
				changesNeedReload: bChangesNeedReload,
				isDraftAvailable: this._oVersionsModel.getProperty("/draftAvailable"),
				versioningEnabled: this._oVersionsModel.getProperty("/versioningEnabled"),
				activeVersion: this._oVersionsModel.getProperty("/activeVersion"),
				URLParsingService: this._getUShellService("URLParsing")
			};
			oReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			return this._handleReloadMessageBoxOnExit(oReloadInfo).then(function () {
				return oReloadInfo;
			});
		}.bind(this));
	};

	RuntimeAuthoring.prototype._onModeChange = function(oEvent) {
		this.setMode(oEvent.getParameter("item").getKey());
	};

	/**
	 * Setter for property 'mode'.
	 * @param {string} sNewMode The new value for the 'mode' property
	 */
	RuntimeAuthoring.prototype.setMode = function (sNewMode) {
		var sCurrentMode = this.getMode();
		if (sCurrentMode !== sNewMode) {
			var oChangeVisualization = this.getChangeVisualization && this.getChangeVisualization();
			if (sNewMode === "visualization" || sCurrentMode === "visualization") {
				oChangeVisualization.triggerModeChange(this.getRootControl(), this.getToolbar());
			}
			var oTabHandlingPlugin = this.getPluginManager().getPlugin("tabHandling");
			var oSelectionPlugin = this.getPluginManager().getPlugin("selection");

			// Switch between another mode and navigation -> toggle overlay & App-Tabindex enablement
			if (sCurrentMode === "navigation" || sNewMode === "navigation") {
				this._oDesignTime.setEnabled(sNewMode !== "navigation");
				oTabHandlingPlugin[(sNewMode === "navigation") ? "restoreTabIndex" : "removeTabIndex"]();
			}

			if (sCurrentMode === "adaptation") {
				this.getPluginManager().handleStopCutPaste();
			}

			oTabHandlingPlugin[(sNewMode === "adaptation") ? "restoreOverlayTabIndex" : "removeOverlayTabIndex"]();
			oSelectionPlugin.setIsActive(!(sNewMode === "visualization"));

			Overlay.getOverlayContainer().toggleClass("sapUiRtaVisualizationMode", (sNewMode === "visualization"));
			if (sNewMode === "visualization") {
				jQuery(".sapUiDtOverlayMovable").css("cursor", "default");
			} else {
				jQuery(".sapUiDtOverlayMovable").css("cursor", "move");
			}

			this._oToolbarControlsModel.setProperty("/modeSwitcher", sNewMode);
			this.setProperty("mode", sNewMode);
			this.fireModeChanged({mode: sNewMode});
		}
	};

	/**
	 * Setter for property 'metadataScope'.
	 * @param {string} sScope The new value for the 'metadataScope' property
	 */
	RuntimeAuthoring.prototype.setMetadataScope = function (sScope) {
		// We do not support scope change after creation of DesignTime instance
		// as this requires reinitialization of all overlays
		if (this._sStatus !== STOPPED) {
			Log.error("sap.ui.rta: Failed to set metadata scope on RTA instance after RTA is started");
			return;
		}

		this.setProperty("metadataScope", sScope);
	};

	function resolveServiceLocation(sName) {
		if (ServicesIndex.hasOwnProperty(sName)) {
			return ServicesIndex[sName].replace(/\./g, "/");
		}
		return undefined;
	}

	/**
	 * Starts a service
	 * @param {string} sName - Registered service name
	 * @return {Promise} - promise is resolved with service api or rejected in case of any error.
	 */
	RuntimeAuthoring.prototype.startService = function (sName) {
		if (this._sStatus !== STARTED) {
			return new Promise(function (fnResolve, fnReject) {
				this.attachEventOnce("start", fnResolve);
				this.attachEventOnce("failed", fnReject);
			}.bind(this))
			.then(
				function () {
					return this.startService(sName);
				}.bind(this),
				function () {
					return Promise.reject(
						DtUtil.createError(
							"RuntimeAuthoring#startService",
							DtUtil.printf("Can't start the service '{0}' while RTA has been failed during a startup", sName),
							"sap.ui.rta"
						)
					);
				}
			);
		}

		var sServiceLocation = resolveServiceLocation(sName);
		var mService;

		if (!sServiceLocation) {
			return Promise.reject(
				DtUtil.createError(
					"RuntimeAuthoring#startService",
					DtUtil.printf("Unknown service. Can't find any registered service by name '{0}'", sName),
					"sap.ui.rta"
				)
			);
		}

		mService = this._mServices[sName];
		if (mService) {
			switch (mService.status) {
				case SERVICE_STARTED: {
					return Promise.resolve(mService.exports);
				}
				case SERVICE_STARTING: {
					return mService.initPromise;
				}
				case SERVICE_FAILED: {
					return mService.initPromise;
				}
				default: {
					return Promise.reject(
						DtUtil.createError(
							"RuntimeAuthoring#startService",
							DtUtil.printf("Unknown service status. Service name = '{0}'", sName),
							"sap.ui.rta"
						)
					);
				}
			}
		} else {
			this._mServices[sName] = mService = {
				status: SERVICE_STARTING,
				location: sServiceLocation,
				initPromise: new Promise(function (fnResolve, fnReject) {
					sap.ui.require(
						[sServiceLocation],
						function (fnServiceFactory) {
							mService.factory = fnServiceFactory;

							if (!this._oServiceEventBus) {
								this._oServiceEventBus = new ServiceEventBus();
							}

							DtUtil.wrapIntoPromise(fnServiceFactory)(
								this,
								this._oServiceEventBus.publish.bind(this._oServiceEventBus, sName)
							)
								.then(function (oService) {
									if (this.bIsDestroyed) {
										throw DtUtil.createError(
											"RuntimeAuthoring#startService",
											DtUtil.printf("RuntimeAuthoring instance is destroyed while initialising the service '{0}'", sName),
											"sap.ui.rta"
										);
									}
									if (!jQuery.isPlainObject(oService)) {
										throw DtUtil.createError(
											"RuntimeAuthoring#startService",
											DtUtil.printf("Invalid service format. Service should return simple javascript object after initialisation. Service name = '{0}'", sName),
											"sap.ui.rta"
										);
									}

									mService.service = oService;
									mService.exports = {};

									// Expose events API if there is at least one event
									if (Array.isArray(oService.events) && oService.events.length > 0) {
										jQuery.extend(mService.exports, {
											attachEvent: this._oServiceEventBus.subscribe.bind(this._oServiceEventBus, sName),
											detachEvent: this._oServiceEventBus.unsubscribe.bind(this._oServiceEventBus, sName),
											attachEventOnce: this._oServiceEventBus.subscribeOnce.bind(this._oServiceEventBus, sName)
										});
									}

									// Expose methods/properties from exports object if any
									var mExports = oService.exports || {};
									jQuery.extend(
										mService.exports,
										Object.keys(mExports).reduce(function (mResult, sKey) {
											var vValue = mExports[sKey];
											mResult[sKey] = typeof vValue === "function"
												? DtUtil.waitForSynced(this._oDesignTime, vValue)
												: vValue;
											return mResult;
										}.bind(this), {})
									);

									mService.status = SERVICE_STARTED;
									fnResolve(Object.freeze(mService.exports));
								}.bind(this))
								.catch(fnReject);
						}.bind(this),
						function (vError) {
							mService.status = SERVICE_FAILED;
							fnReject(
								DtUtil.propagateError(
									vError,
									"RuntimeAuthoring#startService",
									DtUtil.printf("Can't load service '{0}' by its name: {1}", sName, sServiceLocation),
									"sap.ui.rta"
								)
							);
						}
					);
				}.bind(this))
					.catch(function (vError) {
						mService.status = SERVICE_FAILED;
						return Promise.reject(
							DtUtil.propagateError(
								vError,
								"RuntimeAuthoring#startService",
								DtUtil.printf("Error during service '{0}' initialisation.", sName),
								"sap.ui.rta"
							)
						);
					})
			};

			return mService.initPromise;
		}
	};

	/**
	 * Stops a service
	 * @param {string} sName - Started service name
	 */
	RuntimeAuthoring.prototype.stopService = function (sName) {
		var oService = this._mServices[sName];

		if (oService) {
			if (oService.status === SERVICE_STARTED) {
				if (typeof oService.service.destroy === "function") {
					oService.service.destroy();
				}
			}
			delete this._mServices[sName];
		} else {
			throw DtUtil.createError(
				"RuntimeAuthoring#stopService",
				DtUtil.printf("Can't destroy service: unable to find service with name '{0}'", sName),
				"sap.ui.rta"
			);
		}
	};

	/**
	 * Gets a service by name (and starts it if it's not running)
	 * @param {string} sName - Registered service name
	 * @return {Promise} - promise is resolved with service api or rejected in case of any error.
	 */
	RuntimeAuthoring.prototype.getService = function (sName) {
		return this.startService(sName);
	};

	RuntimeAuthoring.prototype._getUShellService = function(sServiceName) {
		return FlexUtils.getUshellContainer() && this._mUShellServices[sServiceName];
	};

	return RuntimeAuthoring;
});
