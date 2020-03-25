/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.Main.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/rta/toolbar/Fiori",
	"sap/ui/rta/toolbar/Standalone",
	"sap/ui/rta/toolbar/Personalization",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Overlay",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/rta/plugin/DragDrop",
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/rta/plugin/CutPaste",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/plugin/CreateContainer",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/Combine",
	"sap/ui/rta/plugin/Split",
	"sap/ui/rta/plugin/Selection",
	"sap/ui/rta/plugin/Settings",
	"sap/ui/rta/plugin/Stretch",
	"sap/ui/rta/plugin/ControlVariant",
	"sap/ui/rta/plugin/iframe/AddIFrame",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/plugin/TabHandling",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/ui/dt/ElementUtil",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/rta/util/PopupManager",
	"sap/ui/core/BusyIndicator",
	"sap/ui/dt/DOMUtil",
	"sap/ui/rta/util/StylesLoader",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/Device",
	"sap/ui/rta/service/index",
	"sap/ui/rta/util/ServiceEventBus",
	"sap/ui/dt/OverlayRegistry",
	"sap/base/strings/capitalize",
	"sap/base/util/UriParameters",
	"sap/ui/performance/Measurement",
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/ui/rta/util/validateFlexEnabled"
],
function(
	jQuery,
	ManagedObject,
	FioriToolbar,
	StandaloneToolbar,
	PersonalizationToolbar,
	DesignTime,
	Overlay,
	CommandStack,
	CommandFactory,
	LREPSerializer,
	RTARenamePlugin,
	RTADragDropPlugin,
	RTAElementMover,
	CutPastePlugin,
	RemovePlugin,
	CreateContainerPlugin,
	AdditionalElementsPlugin,
	AdditionalElementsDialog,
	AdditionalElementsAnalyzer,
	CombinePlugin,
	SplitPlugin,
	SelectionPlugin,
	SettingsPlugin,
	StretchPlugin,
	ControlVariantPlugin,
	AddIFramePlugin,
	ToolHooksPlugin,
	ContextMenuPlugin,
	TabHandlingPlugin,
	Utils,
	DtUtil,
	ElementUtil,
	FlexUtils,
	LayerUtils,
	Layer,
	FeaturesAPI,
	VersionsAPI,
	PersistenceWriteAPI,
	MessageBox,
	MessageToast,
	PopupManager,
	BusyIndicator,
	DOMUtil,
	StylesLoader,
	RtaAppVariantFeature,
	Device,
	ServicesIndex,
	ServiceEventBus,
	OverlayRegistry,
	capitalize,
	UriParameters,
	Measurement,
	Log,
	KeyCodes,
	validateFlexEnabled
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
		metadata : {
			// ---- control specific ----
			library : "sap.ui.rta",
			associations : {
				/** The root control which the runtime authoring should handle. Can only be sap.ui.core.Element or sap.ui.core.UIComponent */
				rootControl : {
					type : "sap.ui.base.ManagedObject"
				}
			},
			properties : {
				/** The URL which is called when the custom field dialog is opened */
				customFieldUrl : "string",

				/** Whether the create custom field button should be shown */
				showCreateCustomField : "boolean",

				/** Whether the create custom field button should be shown */
				showToolbars : {
					type : "boolean",
					defaultValue : true
				},

				/** Whether rta is triggered from a dialog button */
				triggeredFromDialog : {
					type : "boolean",
					defaultValue : false
				},

				/** Whether the window unload dialog should be shown */
				showWindowUnloadDialog : {
					type : "boolean",
					defaultValue : true
				},

				/** sap.ui.rta.command.Stack */
				commandStack : {
					type : "any"
				},

				/** Map indicating plugins in to be loaded or in use by RuntimeAuthoring and DesignTime */
				plugins : {
					type : "any",
					defaultValue : {}
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

				/** Defines view state of the RTA. Possible values: adaptation, navigation */
				mode : {
					type: "string",
					defaultValue: "adaptation"
				},

				/**
				 * Defines designtime metadata scope
				 */
				metadataScope: {
					type: "string",
					defaultValue: "default"
				},

				/**
				 * Whether app version must be validated on start
				 */
				validateAppVersion: {
					type: "boolean",
					defaultValue: false
				}
			},
			events : {
				/** Fired when the runtime authoring is started */
				start : {
					parameters: {
						editablePluginsCount: {
							type: "int"
						}
					}
				},

				/** Fired when the runtime authoring is stopped */
				stop : {},

				/** Fired when the runtime authoring failed to start */
				failed : {},

				/**
				 * Event fired when a DesignTime selection is changed
				 */
				selectionChange : {
					parameters : {
						selection : {
							type : "sap.ui.dt.Overlay[]"
						}
					}
				},
				/**Event fired when the runtime authoring mode is changed */
				modeChanged : {},

				/**
				 * Fired when the undo/redo stack has changed, undo/redo buttons can be updated
				 */
				undoRedoStackModified : {}
			}
		},
		_sAppTitle: null,
		_dependents: null,
		_sStatus: STOPPED,
		constructor: function() {
			// call parent constructor
			ManagedObject.apply(this, arguments);

			this._dependents = {};
			this._mServices = {};
			this._mCustomServicesDictinary = {};
			this.iEditableOverlaysCount = 0;

			this.addDependent(new PopupManager(), 'popupManager');

			if (this.getShowToolbars()) {
				this.getPopupManager().attachOpen(this.onPopupOpen, this);
				this.getPopupManager().attachClose(this.onPopupClose, this);
			}

			if (window.parent !== window) {
				this.startService('receiver');
			}

			if (this._shouldValidateFlexEnabled()) {
				this.attachEvent("start", validateFlexEnabled.bind(null, this));
			}
		},
		_RESTART : {
			NOT_NEEDED : "no restart",
			VIA_HASH : "CrossAppNavigation",
			RELOAD_PAGE : "reload"
		}
	});

	RuntimeAuthoring.prototype._shouldValidateFlexEnabled = function () {
		return document.location.hostname.endsWith(".sap" + ".corp");
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
	RuntimeAuthoring.prototype.getDefaultPlugins = function() {
		if (!this._mDefaultPlugins) {
			var oCommandFactory = new CommandFactory({
				flexSettings: this.getFlexSettings()
			});

			// Initialize local cache
			this._mDefaultPlugins = {};

			// Selection
			this._mDefaultPlugins["selection"] = new SelectionPlugin({
				commandFactory: oCommandFactory,
				multiSelectionRequiredPlugins: [
					CombinePlugin.getMetadata().getName(),
					RemovePlugin.getMetadata().getName()
				],
				elementEditableChange: this._onElementEditableChange.bind(this)
			});

			// Drag drop plugin
			var oRTAElementMover = new RTAElementMover({
				commandFactory: oCommandFactory
			});

			this._mDefaultPlugins["dragDrop"] = new RTADragDropPlugin({
				elementMover: oRTAElementMover,
				commandFactory: oCommandFactory,
				dragStarted: this._handleStopCutPaste.bind(this)
			});

			// Rename
			this._mDefaultPlugins["rename"] = new RTARenamePlugin({
				commandFactory: oCommandFactory,
				editable: this._handleStopCutPaste.bind(this)
			});

			// Additional elements
			this._mDefaultPlugins["additionalElements"] = new AdditionalElementsPlugin({
				commandFactory: oCommandFactory,
				analyzer: AdditionalElementsAnalyzer,
				dialog: new AdditionalElementsDialog()
			});

			// Create container
			this._mDefaultPlugins["createContainer"] = new CreateContainerPlugin({
				commandFactory: oCommandFactory
			});

			// Remove
			this._mDefaultPlugins["remove"] = new RemovePlugin({
				commandFactory: oCommandFactory
			});

			// Cut paste
			this._mDefaultPlugins["cutPaste"] = new CutPastePlugin({
				elementMover: oRTAElementMover,
				commandFactory: oCommandFactory
			});

			// Settings
			this._mDefaultPlugins["settings"] = new SettingsPlugin({
				commandFactory: oCommandFactory
			});

			// Combine
			this._mDefaultPlugins["combine"] = new CombinePlugin({
				commandFactory: oCommandFactory
			});

			// Split
			this._mDefaultPlugins["split"] = new SplitPlugin({
				commandFactory: oCommandFactory
			});

			// Context Menu (context menu)
			this._mDefaultPlugins["contextMenu"] = new ContextMenuPlugin();

			// Tab Handling
			this._mDefaultPlugins["tabHandling"] = new TabHandlingPlugin();

			// Stretching
			this._mDefaultPlugins["stretch"] = new StretchPlugin();

			//Control Variant
			this._mDefaultPlugins["controlVariant"] = new ControlVariantPlugin({
				commandFactory : oCommandFactory
			});

			// Add IFrame
			this._mDefaultPlugins["addIFrame"] = new AddIFramePlugin({
				commandFactory : oCommandFactory
			});

			//ToolHooks
			this._mDefaultPlugins["toolHooks"] = new ToolHooksPlugin();
		}

		return jQuery.extend({}, this._mDefaultPlugins);
	};

	RuntimeAuthoring.prototype.addDependent = function (oObject, sName, bCreateGetter) {
		bCreateGetter = typeof bCreateGetter === 'undefined' ? true : !!bCreateGetter;
		if (!(sName in this._dependents)) {
			if (sName && bCreateGetter) {
				this['get' + capitalize(sName, 0)] = this.getDependent.bind(this, sName);
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

	/**
	 * In order to clear the cache and to destroy the default plugins on exit use
	 * _destroyDefaultPlugins()
	 *
	 * In order to destroy default plugins not used, because replaced or removed,
	 * pass the list of active plugins: _destroyDefaultPlugins( mPluginsToKeep ).
	 *
	 * @param {map} mPluginsToKeep - list of active plugins to keep in _mDefaultPlugins
	 * @private
	 */
	RuntimeAuthoring.prototype._destroyDefaultPlugins = function (mPluginsToKeep) {
		// Destroy default plugins and clear cache
		// ... but keep those in mPluginsToKeep
		for (var sDefaultPluginName in this._mDefaultPlugins) {
			var oDefaultPlugin = this._mDefaultPlugins[sDefaultPluginName];

			if (oDefaultPlugin && !oDefaultPlugin.bIsDestroyed) {
				if (!mPluginsToKeep || mPluginsToKeep[sDefaultPluginName] !== oDefaultPlugin) {
					oDefaultPlugin.destroy();
				}
			}
		}
		if (!mPluginsToKeep) {
			this._mDefaultPlugins = null;
		}
	};

	RuntimeAuthoring.prototype.onPopupOpen = function(oEvent) {
		var oOpenedPopup = oEvent.getParameters().getSource();
		if (
			oOpenedPopup.isA("sap.m.Dialog")
			&& this.getToolbar().isA("sap.ui.rta.toolbar.Fiori")
		) {
			this.getToolbar().setColor("contrast");
		}
		this.getToolbar().bringToFront();
	};

	RuntimeAuthoring.prototype.onPopupClose = function(oEvent) {
		if (oEvent.getParameters() instanceof sap.m.Dialog) {
			this.getToolbar().setColor();
		}
	};

	RuntimeAuthoring.prototype.setPlugins = function(mPlugins) {
		if (this._oDesignTime) {
			throw new Error('Cannot replace plugins: runtime authoring already started');
		}
		this.setProperty("plugins", mPlugins);
	};

	/**
	 * Setter for flexSettings. Checks the Uri for parameters that override the layer.
	 * builds the rootNamespace and namespace parameters from the other parameters
	 *
	 * @param {Object} [mFlexSettings] property bag
	 * @param {String} [mFlexSettings.layer] The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {Boolean} [mFlexSettings.developerMode] Whether RTA is started in DeveloperMode Mode. Whether RTA is started in DeveloperMode Mode
	 * @param {String} [mFlexSettings.baseId] base ID of the app
	 * @param {String} [mFlexSettings.projectId] project ID
	 * @param {String} [mFlexSettings.scenario] Key representing the current scenario
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
	 * @returns {String} the layer after checking the uri parameters
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


	RuntimeAuthoring.prototype._initVersioning = function() {
		var sUseVersioning = !!FlexUtils.getUshellContainer();
		if (sUseVersioning) {
			return FeaturesAPI.isVersioningEnabled(this.getLayer())
			.then(function (bVersioningEnabled) {
				this._bVersioningEnabled = bVersioningEnabled;
				if (bVersioningEnabled) {
					return VersionsAPI.initialize({
						selector: this.getRootControlInstance(),
						layer: this.getLayer()
					});
				}
			}.bind(this));
		}

		this._bVersioningEnabled = false;
		return Promise.resolve();
	};

	/**
	 * Start UI adaptation at runtime (RTA).
	 * @return {Promise} Returns a Promise with the initialization of RTA
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function () {
		this._sStatus = STARTING;
		var oDesignTimePromise;
		var vError;
		var oRootControl = this.getRootControlInstance();
		// Create DesignTime
		if (!this._oDesignTime) {
			if (!oRootControl) {
				vError = new Error("Root control not found");
				Log.error(vError);
				return Promise.reject(vError);
			}

			// Check if the App Variant has the correct Format
			if (
				this.getValidateAppVersion()
				&& !FlexUtils.isCorrectAppVersionFormat(FlexUtils.getAppVersionFromManifest(FlexUtils.getAppComponentForControl(oRootControl).getManifest()))
			) {
				vError = this._getTextResources().getText("MSG_INCORRECT_APP_VERSION_ERROR");
				Log.error(vError);
				return Promise.reject(vError);
			}

			return this._initVersioning()
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

				// Take default plugins if no plugins handed over
				if (!this.getPlugins() || !Object.keys(this.getPlugins()).length) {
					this.setPlugins(this.getDefaultPlugins());
				}

				// Destroy default plugins instantiated but not in use
				this._destroyDefaultPlugins(this.getPlugins());

				Object.keys(this.getPlugins()).forEach(function(sPluginName) {
					if (this.getPlugins()[sPluginName].attachElementModified) {
						this.getPlugins()[sPluginName].attachElementModified(this._handleElementModified, this);
					}
				}.bind(this));

				// Hand over currrent command stack to settings plugin
				if (this.getPlugins()["settings"]) {
					this.getPlugins()["settings"].setCommandStack(this.getCommandStack());
				}

				this._oSerializer = new LREPSerializer({commandStack : this.getCommandStack(), rootControl : this.getRootControl()});

				// Create design time
				var aKeys = Object.keys(this.getPlugins());
				var aPlugins = aKeys.map(function(sKey) {
					return this.getPlugins()[sKey];
				}, this);

				oDesignTimePromise = new Promise(function (fnResolve, fnReject) {
					Measurement.start("rta.dt.startup", "Measurement of RTA: DesignTime start up");
					this._oDesignTime = new DesignTime({
						scope: this.getMetadataScope(),
						plugins: aPlugins
					});
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
			}.bind(this))
			.then(function () {
				var mPropertyBag = {
					selector: this.getRootControlInstance(),
					layer: this.getLayer()
				};
				return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag)
				.then(function(oPublishAndResetInfo) {
					this.bInitialResetEnabled = oPublishAndResetInfo.isResetEnabled;
					this.bInitialPublishEnabled = oPublishAndResetInfo.isPublishEnabled;
				}.bind(this));
			}.bind(this))
			.then(function () {
				if (this.getShowToolbars()) {
					// Create ToolsMenu
					return this._getToolbarButtonsVisibility()
					.then(this._createToolsMenu.bind(this));
				}
			}.bind(this))
			// this is needed to initially check if undo is available, e.g. when the stack gets initialized with changes
			.then(this._onStackModified.bind(this))
			.then(function () {
				// non-blocking style loading
				StylesLoader
				.loadStyles('InPageStyles')
				.then(function (sData) {
					var sStyles = sData.replace(/%scrollWidth%/g, DOMUtil.getScrollbarWidth() + 'px');
					DOMUtil.insertStyles(sStyles, Overlay.getOverlayContainer().get(0));
				});
			})
			.then(function () {
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
			}.bind(this))
			.then(function () {
				if (Device.browser.name === "ff") {
					// in FF shift+f10 also opens a browser context menu.
					// It seems that the only way to get rid of it is to completely turn off context menu in ff..
					jQuery(document).on('contextmenu', _ffContextMenuHandler);
				}
			})
			.then(function() {
				this.fnKeyDown = this._onKeyDown.bind(this);
				jQuery(document).on("keydown", this.fnKeyDown);

				var oRootOverlay = OverlayRegistry.getOverlay(this.getRootControl());
				this._$RootControl = oRootOverlay.getAssociatedDomRef();
				if (this._$RootControl) {
					this._$RootControl.addClass("sapUiRtaRoot");
				}
			}.bind(this))
			.then(function () {
				this._sStatus = STARTED;
				this.fireStart({
					editablePluginsCount: this.iEditableOverlaysCount
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
			}.bind(this));
		}
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
			this.bInitialDraftAvailable = this._isDraftAvailable();
			var bIsAppVariantSupported = RtaAppVariantFeature.isPlatFormEnabled(this.getRootControlInstance(), this.getLayer(), this._oSerializer);
			var bPublishAppVariantSupported = bIsPublishAvailable && bIsAppVariantSupported;
			return {
				publishAvailable: bIsPublishAvailable,
				publishAppVariantSupported: bPublishAppVariantSupported,
				draftAvailable: this.bInitialDraftAvailable
			};
		}.bind(this));
	};

	RuntimeAuthoring.prototype._handleVersionToolbar = function(bCanUndo) {
		var bDraftEnabled = this.bInitialDraftAvailable || bCanUndo;
		this.getToolbar().setDraftEnabled(bDraftEnabled);
		return this._setVersionLabel(bDraftEnabled);
	};

	RuntimeAuthoring.prototype._setVersionLabel = function(bDraftEnabled) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		if (bDraftEnabled) {
			this.getToolbar().setVersionLabelAccentColor(true);
			return this.getToolbar().setVersionLabel(oTextResources.getText("LBL_DRAFT"));
		}
		var aVersions = VersionsAPI.getVersions({
			selector: this.getRootControlInstance(),
			layer: this.getLayer()
		});

		// When there are changes before the draft is available set label to "Version 1"
		var sLabel = oTextResources.getText("LBL_VERSION_1");
		var bAccentColor = false;

		// When there is no content in the version request set label to "Original App"
		// Otherwise just need to have a look at the first entry in versions
		// If the title is not set and the versionNumber is zero, set the label to "Draft"
		if (aVersions.length === 0) {
			sLabel = oTextResources.getText("LBL_ORIGNINAL_APP");
		} else if (aVersions[0].title) {
			sLabel = aVersions[0].title;
		} else if (aVersions[0].versionNumber === 0) {
			bAccentColor = true;
			sLabel = oTextResources.getText("LBL_DRAFT");
		}

		this.getToolbar().setVersionLabelAccentColor(bAccentColor);
		return this.getToolbar().setVersionLabel(sLabel);
	};

	RuntimeAuthoring.prototype._isDraftAvailable = function() {
		if (this._bVersioningEnabled) {
			var bDraftAvailable = VersionsAPI.isDraftAvailable({
				selector: this.getRootControlInstance(),
				layer: this.getLayer()
			});
			return bDraftAvailable || this.canUndo();
		}

		return false;
	};

	var fnShowTechnicalError = function(vError) {
		BusyIndicator.hide();
		var sErrorMessage = vError.userMessage || vError.stack || vError.message || vError.status || vError;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		Log.error("Failed to transfer runtime adaptation changes to layered repository", sErrorMessage);
		var sMsg = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
				+ oTextResources.getText("MSG_ERROR_REASON", sErrorMessage);
		MessageBox.error(sMsg, {
			styleClass: Utils.getRtaStyleClassName()
		});
	};

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

		if (this.getPlugins() && this.getPlugins()["settings"]) {
			this.getPlugins()["settings"].setCommandStack(oCommandStack);
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
	 * @private
	 */
	RuntimeAuthoring.prototype._onStackModified = function() {
		var oCommandStack = this.getCommandStack();
		var bCanUndo = oCommandStack.canUndo();
		var bCanRedo = oCommandStack.canRedo();

		if (this.getShowToolbars()) {
			this.getToolbar().setUndoRedoEnabled(bCanUndo, bCanRedo);
			this.getToolbar().setPublishEnabled(this.bInitialPublishEnabled || bCanUndo);
			this.getToolbar().setRestoreEnabled(this.bInitialResetEnabled || bCanUndo);
			if (this._bVersioningEnabled) {
				this._handleVersionToolbar(bCanUndo);
			}
		}
		this.fireUndoRedoStackModified();
	};

	RuntimeAuthoring.prototype._closeToolbar = function() {
		if (this.getShowToolbars() && this.getToolbar) {
			return this.getToolbar().hide();
		}
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

	/**
	 * stop Runtime Authoring
	 *
	 * @public
	 * @param {boolean} bDontSaveChanges - stop RTA with or w/o saving changes
	 * @param {boolean} bSkipRestart - stop RTA with or w/o checking if a reload is needed to apply e.g. personalization/app descriptor changes
	 * @returns {Promise} promise with no parameters
	 */
	RuntimeAuthoring.prototype.stop = function(bDontSaveChanges, bSkipRestart) {
		return ((bSkipRestart) ? Promise.resolve(this._RESTART.NOT_NEEDED) : this._handleReloadOnExit())
			.then(function(sReload) {
				return ((bDontSaveChanges) ? Promise.resolve() : this._serializeToLrep(this))
				.then(this._closeToolbar.bind(this))
				.then(function() {
					this.fireStop();
					if (sReload !== this._RESTART.NOT_NEEDED) {
						var mParsedHash = this._handleParametersOnExit(true);
						this._triggerCrossAppNavigation(mParsedHash);
						if (sReload === this._RESTART.RELOAD_PAGE) {
							this._reloadPage();
						}
					}
				}.bind(this));
			}.bind(this))
			.catch(fnShowTechnicalError)
			.then(function () {
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
		var bFocusInsideRenameField = jQuery(document.activeElement).parents('.sapUiRtaEditableField').length > 0;

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
			var sMessage = this._getTextResources().getText("MSG_UNSAVED_CHANGES");
			return sMessage;
		}
		window.onbeforeunload = this._oldUnloadHandler;
	};

	RuntimeAuthoring.prototype._serializeAndSave = function() {
		return this._oSerializer.saveCommands(this._bVersioningEnabled);
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
		this._handleStopCutPaste();
		return this.getCommandStack().undo();
	};

	RuntimeAuthoring.prototype._onRedo = function() {
		this._handleStopCutPaste();
		return this.getCommandStack().redo();
	};

	RuntimeAuthoring.prototype._onActivateDraft = function(oEvent) {
		return this._serializeAndSave()
		.then(
			VersionsAPI.activateDraft.bind(undefined, {
				layer: this.getLayer(),
				selector: this.getRootControlInstance(),
				title: oEvent.getParameter("versionTitle")
			})
		).then(function () {
			this._showMessageToast("MSG_DRAFT_ACTIVATION_SUCCESS");
			this.bInitialDraftAvailable = false;
			this.getToolbar().setRestoreEnabled(true);
			return this._handleVersionToolbar(false);
		}.bind(this))
		.catch(function (oError) {
			Utils.showMessageBox("error", "MSG_DRAFT_ACTIVATION_FAILED", {error: oError});
		});
	};

	RuntimeAuthoring.prototype._handleDiscard = function(bHardReload) {
		var mParsedHash = FlexUtils.getParsedURLHash();
		var oRootControl = this.getRootControlInstance();
		var sLayer = this.getLayer();
		var mParsedHash = this._handleDraftParameter(mParsedHash);
		RuntimeAuthoring.enableRestart(sLayer, oRootControl);
		this.getCommandStack().removeAllCommands();
		this._triggerCrossAppNavigation(mParsedHash);
		if (bHardReload) {
			this._reloadPage();
		} else {
			return this.stop(true, true);
		}
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
					selector: this.getRootControlInstance(),
					updateState: true
				})
				.then(this._handleDiscard.bind(this, false));
			}
		}.bind(this));
	};

	RuntimeAuthoring.prototype._createToolsMenu = function(aButtonsVisibility) {
		if (!this.getDependent('toolbar')) {
			var fnConstructor;

			if (this.getLayer() === Layer.USER) {
				fnConstructor = PersonalizationToolbar;
			} else if (Utils.getFiori2Renderer()) {
				fnConstructor = FioriToolbar;
			} else {
				fnConstructor = StandaloneToolbar;
			}

			if (this.getLayer() === Layer.USER) {
				this.addDependent(new fnConstructor({
					textResources: this._getTextResources(),
					//events
					exit: this.stop.bind(this, false, true),
					restore: this._onRestore.bind(this)
				}), 'toolbar');
			} else {
				this.addDependent(new fnConstructor({
					modeSwitcher: this.getMode(),
					publishVisible: aButtonsVisibility.publishAvailable,
					textResources: this._getTextResources(),
					versioningVisible: this._bVersioningEnabled,
					draftEnabled: aButtonsVisibility.draftAvailable,
					//events
					exit: this.stop.bind(this, false, false),
					transport: this._onTransport.bind(this),
					restore: this._onRestore.bind(this),
					undo: this._onUndo.bind(this),
					redo: this._onRedo.bind(this),
					modeChange: this._onModeChange.bind(this),
					manageApps: RtaAppVariantFeature.onGetOverview.bind(null, true, this.getLayer()),
					appVariantOverview: this._onGetAppVariantOverview.bind(this),
					saveAs: RtaAppVariantFeature.onSaveAs.bind(null, true, true, this.getLayer(), null),
					activateDraft: this._onActivateDraft.bind(this),
					discardDraft: this._onDiscardDraft.bind(this)
				}), 'toolbar');
			}

			this.getToolbar().setPublishEnabled(this.bInitialPublishEnabled);
			this.getToolbar().setRestoreEnabled(this.bInitialResetEnabled);

			var bAppVariantSupported = aButtonsVisibility.publishAppVariantSupported;
			this.getToolbar().setAppVariantsVisible(bAppVariantSupported);

			var bExtendedOverview = bAppVariantSupported && RtaAppVariantFeature.isOverviewExtended();
			this.getToolbar().setExtendedManageAppVariants(bExtendedOverview);

			if (bAppVariantSupported) {
				RtaAppVariantFeature.isManifestSupported().then(function (bResult) {
					this.getToolbar().setAppVariantsEnabled(bResult);
				}.bind(this));
			}
		}
	};

	RuntimeAuthoring.prototype._onGetAppVariantOverview = function(oEvent) {
		var oItem = oEvent.getParameter("item");

		var bTriggeredForKeyUser = oItem.getId() === 'keyUser';
		return RtaAppVariantFeature.onGetOverview(bTriggeredForKeyUser, this.getLayer());
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
			// Destroy default plugins
			this._destroyDefaultPlugins();
			// plugins have been destroyed as _oDesignTime.destroy()
			// plugins are set to defaultValue if parameter is null
			this.setPlugins(null);
		}

		if (this._$RootControl) {
			this._$RootControl.removeClass("sapUiRtaRoot");
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
		this._handleStopCutPaste();

		BusyIndicator.show(500);
		return this._serializeToLrep().then(function () {
			BusyIndicator.hide();
			var bAppVariantRunning = FlexUtils.isApplicationVariant(this._oRootControl) && !FlexUtils.isVariantByStartupParameter(this._oRootControl);
			return ((bAppVariantRunning) ? RtaAppVariantFeature.getAppVariantDescriptor(this._oRootControl) : Promise.resolve())
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
						.then(function(sResponse) {
							if (sResponse !== "Error" && sResponse !== "Cancel") {
								this._showMessageToast("MSG_TRANSPORT_SUCCESS");

								if (this.getShowToolbars()) {
									var mPropertyBag = {
										selector: this.getRootControlInstance(),
										layer: this.getLayer()
									};
									PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag)
									.then(function(oPublishAndResetInfo) {
										this.getToolbar().setPublishEnabled(oPublishAndResetInfo.isPublishEnabled);
										this.getToolbar().setRestoreEnabled(oPublishAndResetInfo.isResetEnabled);
									}.bind(this));
								}
							}
						}.bind(this));
				}.bind(this));
		}.bind(this))['catch'](fnShowTechnicalError);
	};

	/**
	 * Delete all changes for current layer and root control's component.
	 * In case of Base Applications (no App Variants) the App Descriptor Changes and UI Changes are saved in different Flex Persistence instances,
	 * the changes for both places will be deleted. For App Variants all the changes are saved in one place.
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._deleteChanges = function() {
		return PersistenceWriteAPI.reset({
			selector: FlexUtils.getAppComponentForControl(this.getRootControlInstance()),
			layer: this.getLayer(),
			generator: "Change.createInitialFileContent"
		}).then(function () {
			var mParsedHash = this._handleParametersOnExit(false);
			this._triggerCrossAppNavigation(mParsedHash);
			this._reloadPage();
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
	 * @param  {string} sMessageKey The text key for the message
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessageToast = function(sMessageKey) {
		var sMessage = this._getTextResources().getText(sMessageKey);

		MessageToast.show(sMessage);
	};

	/**
	 * The RTA FLP plugin checks whether RTA needs to be restarted and restarts it if needed.
	 *
	 * @public
	 * @static
	 * @param {string} sLayer The active layer
	 * @returns {boolean} Returns true if restart is needed
	 */
	RuntimeAuthoring.needsRestart = function(sLayer) {
		var bRestart = !!window.sessionStorage.getItem("sap.ui.rta.restart." + sLayer);
		return bRestart;
	};

	/**
	 * Enable restart of RTA
	 * the RTA FLP plugin handles the restart
	 *
	 * @public
	 * @static
	 * @param {string} sLayer - The active layer
	 * @param {sap.ui.core.Control} oRootControl - root control for which RTA was started
	 */
	RuntimeAuthoring.enableRestart = function(sLayer, oRootControl) {
		var sFlexReference = FlexUtils.getComponentClassName(oRootControl);
		var vParameter = sFlexReference || true;
		window.sessionStorage.setItem("sap.ui.rta.restart." + sLayer, vParameter);
	};

	/**
	 * Disable restart of RTA
	 *
	 * @public
	 * @static
	 * @param {string} sLayer The active layer
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
	 */
	RuntimeAuthoring.prototype._onRestore = function() {
		var sLayer = this.getLayer();
		var sMessage = sLayer === Layer.USER
			? this._getTextResources().getText("FORM_PERS_RESET_MESSAGE_PERSONALIZATION")
			: this._getTextResources().getText("FORM_PERS_RESET_MESSAGE");
		var sTitle = sLayer === Layer.USER
			? this._getTextResources().getText("BTN_RESTORE")
			: this._getTextResources().getText("FORM_PERS_RESET_TITLE");

		this._handleStopCutPaste();

		return Utils.showMessageBox("warning", sMessage, {
			titleKey: sTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		}).then(function(sAction) {
			if (sAction === MessageBox.Action.OK) {
				//this.bInitialDraftAvailable = false; maybe no need
				//this.getToolbar().setDraftEnabled(false);
				RuntimeAuthoring.enableRestart(sLayer, this.getRootControlInstance());
				this._deleteChanges();
				this.getCommandStack().removeAllCommands();
			}
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
				oElementOverlay.attachEvent('geometryChanged', onGeometryChanged);
			} else {
				fnCallback(oElementOverlay);
			}
		}

		this._scheduleOnCreated(sNewControlID, function (oNewOverlay) {
			// the overlay needs to be rendered
			if (oNewOverlay.isRendered()) {
				onGeometryCheck(oNewOverlay);
			} else {
				oNewOverlay.attachEventOnce('afterRendering', function (oEvent) {
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
			this.getPlugins()["rename"].startEdit(oElementOverlay);
		}.bind(this);

		this._scheduleOnCreatedAndVisible(sNewControlID, function (oElementOverlay) {
			// get container of the new control for rename
			var sNewContainerID = this.getPlugins()["createContainer"].getCreatedContainerId(vAction, oElementOverlay.getElement().getId());
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
		this._handleStopCutPaste();

		var vAction = oEvent.getParameter("action");
		var sNewControlID = oEvent.getParameter("newControlId");

		var oCommand = oEvent.getParameter("command");
		if (oCommand instanceof sap.ui.rta.command.BaseCommand) {
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
		return Promise.resolve();
	};

	/**
	 * Increases or decreases the current number of editable Overlays.
	 * @param  {sap.ui.base.Event} oEvent Event triggered by the 'editable' property change
	 * @private
	 */
	RuntimeAuthoring.prototype._onElementEditableChange = function(oEvent) {
		var bEditable = oEvent.getParameter("editable");
		if (bEditable) {
			this.iEditableOverlaysCount += 1;
		} else {
			this.iEditableOverlaysCount -= 1;
		}
	};

	/**
	 * Handler function to stop cut and paste, because some other operation has started.
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleStopCutPaste = function() {
		if (this.getPlugins()["cutPaste"]) {
			this.getPlugins()["cutPaste"].stopCutAndPaste();
		}
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
				semanticObject : mParsedHash.semanticObject,
				action : mParsedHash.action,
				context : mParsedHash.contextRaw
			},
			params: mParsedHash.params,
			appSpecificRoute : mParsedHash.appSpecificRoute,
			writeHistory : false
		};
	};

	/**
	 * Returns true if the max layer / draft parameter is set to current layer
	 * (skips personalization and other higher level changes) / applies draft changes
	 *
	 * @param  {map} mParsedHash The parsed URL hash
	 * @param  {string} sParameterName The parameter for which the layer should be checked
	 * @return {boolean} True if the parameter is in the hash
	 */
	RuntimeAuthoring.prototype._hasParameter = function(mParsedHash, sParameterName) {
		var sCurrentLayer = this.getLayer();
		return mParsedHash.params &&
			mParsedHash.params[sParameterName] &&
			mParsedHash.params[sParameterName][0] === sCurrentLayer;
	};

	/**
	 * Check if the given parameter has a false value
	 *
	 * @param  {map} mParsedHash The parsed URL hash
	 * @param  {string} sParameterName The parameter for which the layer should be checked
	 * @return {boolean} True if the parameter value is false
	 */
	RuntimeAuthoring.prototype._hasDraftFalseParameter = function(mParsedHash, sParameterName) {
		return mParsedHash.params &&
			mParsedHash.params[sParameterName] &&
			mParsedHash.params[sParameterName][0] === "false";
	};

	/**
	 * Reload the app inside FLP adding the parameter to skip personalization changes
	 *
	 * @param  {map} mParsedHash URL Parsed hash
	 * @param  {sap.ushell.services.CrossApplicationNavigation} oCrossAppNav Ushell service
	 * @param  {Object} oReloadInfo Contains the information needed to set the correct url parameters
	 * @return {Promise} Resolving to true if reload was triggered
	 */
	RuntimeAuthoring.prototype._reloadWithMaxLayerOrDraftParam = function(mParsedHash, oCrossAppNav, oReloadInfo) {
		if (!mParsedHash.params) {
			mParsedHash.params = {};
		}
		if (!this._hasParameter(mParsedHash, LayerUtils.FL_MAX_LAYER_PARAM) && oReloadInfo.hasHigherLayerChanges) {
			mParsedHash.params[LayerUtils.FL_MAX_LAYER_PARAM] = [oReloadInfo.layer];
		}

		if (!this._hasParameter(mParsedHash, LayerUtils.FL_DRAFT_PARAM) && oReloadInfo.hasDraftChanges) {
			mParsedHash.params[LayerUtils.FL_DRAFT_PARAM] = [oReloadInfo.layer];

			// clears FlexState and triggers reloading of the flex data without blocking
			VersionsAPI.loadDraftForApplication({
				selector: oReloadInfo.selector,
				layer: oReloadInfo.layer
			});
		}

		RuntimeAuthoring.enableRestart(oReloadInfo.layer, this.getRootControlInstance());
		// triggers the navigation without leaving FLP
		oCrossAppNav.toExternal(this._buildNavigationArguments(mParsedHash));
		return Promise.resolve(true);
	};

	RuntimeAuthoring.prototype._triggerCrossAppNavigation = function(mParsedHash) {
		if (FlexUtils.getUshellContainer() && this.getLayer() !== Layer.USER) {
			var oCrossAppNav = FlexUtils.getUshellContainer().getService("CrossApplicationNavigation");
			oCrossAppNav.toExternal(this._buildNavigationArguments(mParsedHash));
			return Promise.resolve(true);
		}
	};

	RuntimeAuthoring.prototype._handleDraftParameter = function(mParsedHash) {
		if (!FlexUtils.getUshellContainer() || this.getLayer() === Layer.USER) {
			return;
		}

		if (this._hasParameter(mParsedHash, LayerUtils.FL_DRAFT_PARAM)) {
			delete mParsedHash.params[LayerUtils.FL_DRAFT_PARAM];
		} else if (this._hasDraftFalseParameter(mParsedHash, LayerUtils.FL_DRAFT_PARAM)) {
			/*
			In case we discarded our draft we add the false flag there, thats why we need to
			remove it on exit again to trigger the CrossAppNavigation
			*/
			delete mParsedHash.params[LayerUtils.FL_DRAFT_PARAM];
		} else if (this._isDraftAvailable()) { // only add the draft = false flag when versioning and draft is available
			/*
			In case we entered RTA without a draft and created dirty changes,
			we need to add sap-ui-fl-version=false, to trigger the CrossAppNavigation on exit.
			*/
			mParsedHash.params[LayerUtils.FL_DRAFT_PARAM] = ["false"];
		}
		return mParsedHash;
	};

	RuntimeAuthoring.prototype._handleMaxLayerParameter = function(mParsedHash, bDeleteMaxLayer) {
		// keep max layer parameter when reset was called, remove it on save & exit
		if (bDeleteMaxLayer && this._hasParameter(mParsedHash, LayerUtils.FL_MAX_LAYER_PARAM)) {
			delete mParsedHash.params[LayerUtils.FL_MAX_LAYER_PARAM];
		}
		return mParsedHash;
	};

	/**
	 * Reload the app inside FLP by removing max layer / draft parameter;
	 *
	 * @param {boolean} bDeleteMaxLayer - Indicates if max layer parameter should be removed or not (reset / exit)
	 * @return {map} parsedHash
	 */
	RuntimeAuthoring.prototype._handleParametersOnExit = function(bDeleteMaxLayer) {
		if (!FlexUtils.getUshellContainer() || this.getLayer() === Layer.USER) {
			return;
		}

		var oCrossAppNav = FlexUtils.getUshellContainer().getService("CrossApplicationNavigation");
		var mParsedHash = FlexUtils.getParsedURLHash();
		if (!oCrossAppNav.toExternal || !mParsedHash) {
			return;
		}

		mParsedHash = this._handleMaxLayerParameter(mParsedHash, bDeleteMaxLayer);
		mParsedHash = this._handleDraftParameter(mParsedHash);
		return mParsedHash;
	};

	/**
	 * Handler for the message box warning the user that personalization changes exist
	 * and the app will be reloaded
	 *
	 * @param  {Object} oReloadInfo Information to determine which message to show
	 * @return {Promise} Resolving when the user clicks on OK
	 */
	RuntimeAuthoring.prototype._handleReloadMessageBoxOnStart = function(oReloadInfo) {
		var sReason;
		var bIsCustomerLayer = oReloadInfo.layer === Layer.CUSTOMER;

		if (oReloadInfo.hasHigherLayerChanges && oReloadInfo.hasDraftChanges) {
			sReason = bIsCustomerLayer ? "MSG_PERSONALIZATION_AND_DRAFT_EXISTS" : "MSG_HIGHER_LAYER_CHANGES_AND_DRAFT_EXISTS";
		} else if (oReloadInfo.hasHigherLayerChanges) {
			sReason = bIsCustomerLayer ? "MSG_PERSONALIZATION_EXISTS" : "MSG_HIGHER_LAYER_CHANGES_EXIST";
		} else if (oReloadInfo.hasDraftChanges) {
			sReason = "MSG_DRAFT_EXISTS";
		}

		if (sReason) {
			return Utils.showMessageBox("information", sReason);
		}
	};

	/**
	 * Check if there are personalization changes/draft changes and restart the application without/with them;
	 * Warn the user that the application will be restarted without personalization / with draft changes;
	 * This is only valid when a UShell is present;
	 *
	 * @return {Promise<boolean>} Resolving to false means that reload is not necessary
	 */
	RuntimeAuthoring.prototype._determineReload = function() {
		var oUshellContainer = FlexUtils.getUshellContainer();
		if (!oUshellContainer) {
			return Promise.resolve(false);
		}

		var oReloadInfo = {
			hasHigherLayerChanges: false,
			hasDraftChanges: false,
			layer: this.getLayer(),
			selector: this.getRootControlInstance(),
			ignoreMaxLayerParameter: false
		};
		var oHigherLayerChangesValidationPromise;
		var bDraftAvailable = false;
		var mParsedHash = FlexUtils.getParsedURLHash();

		if (!this._hasParameter(mParsedHash, LayerUtils.FL_MAX_LAYER_PARAM) && oReloadInfo.layer !== Layer.USER) {
			oHigherLayerChangesValidationPromise = PersistenceWriteAPI.hasHigherLayerChanges({
				selector: oReloadInfo.selector,
				ignoreMaxLayerParameter: oReloadInfo.ignoreMaxLayerParameter
			});
		}
		if (!this._hasParameter(mParsedHash, LayerUtils.FL_DRAFT_PARAM) && this._bVersioningEnabled) {
			bDraftAvailable = VersionsAPI.isDraftAvailable({
				selector: oReloadInfo.selector,
				layer: oReloadInfo.layer
			});
		}

		return Promise.all([
			oHigherLayerChangesValidationPromise,
			bDraftAvailable
		])
		.then(function(aReloadInfo) {
			oReloadInfo.hasHigherLayerChanges = aReloadInfo[0];
			oReloadInfo.hasDraftChanges = aReloadInfo[1];

			if (oReloadInfo.hasHigherLayerChanges || oReloadInfo.hasDraftChanges) {
				return this._handleReloadMessageBoxOnStart(oReloadInfo).then(function () {
					var oCrossAppNav = oUshellContainer.getService("CrossApplicationNavigation");
					if (oCrossAppNav.toExternal && mParsedHash) {
						return this._reloadWithMaxLayerOrDraftParam(mParsedHash, oCrossAppNav, oReloadInfo);
					}
				}.bind(this));
			}
		}.bind(this));
	};

	/**
	 * Handler for the message box warning the user that personalization changes exist
	 * and the app will be reloaded
	 *
	 * @param  {Object} oReloadInfo - Information to determine which message to show
	 * @return {Promise} Resolving when the user clicks on OK
	 */
	RuntimeAuthoring.prototype._handleReloadMessageBoxOnExit = function(oReloadInfo) {
		var sReason;

		var bIsCustomerLayer = this.getLayer() === Layer.CUSTOMER;
		if (oReloadInfo.hasHigherLayerChanges && oReloadInfo.hasDraftChanges) {
			sReason = bIsCustomerLayer ? "MSG_RELOAD_WITH_PERSONALIZATION_AND_WITHOUT_DRAFT" : "MSG_RELOAD_WITH_ALL_CHANGES";
		} else if (oReloadInfo.hasHigherLayerChanges) {
			sReason = bIsCustomerLayer ? "MSG_RELOAD_WITH_PERSONALIZATION" : "MSG_RELOAD_WITH_ALL_CHANGES";
		} else if (oReloadInfo.hasDraftChanges) {
			sReason = "MSG_RELOAD_WITHOUT_DRAFT";
		} else if (oReloadInfo.changesNeedReload) {
			sReason = "MSG_RELOAD_NEEDED";
		} else if (oReloadInfo.hasDraftParameter) {
			sReason = "MSG_RELOAD_REMOVE_DRAFT_PARAMETER";
		}

		return Utils.showMessageBox("information", sReason, {
			titleKey: "HEADER_RELOAD_NEEDED"
		});
	};

	/**
	 * When exiting RTA and personalization changes exist, the user can choose to
	 * reload the app with personalization or stay in the app without the personalization
	 * @return {Promise} Resolving to RESTART enum indicating if reload is necessary
	 */
	RuntimeAuthoring.prototype._handleReloadOnExit = function() {
		return Promise.all([
			(!this._bReloadNeeded) ?
				this._oSerializer.needsReload() :
				Promise.resolve(this._bReloadNeeded),
			// When working with RTA, the MaxLayer parameter will be present in the URL and must
			// be ignored in the decision to bring up the pop-up (ignoreMaxLayerParameter = true)
			PersistenceWriteAPI.hasHigherLayerChanges({selector: this.getRootControlInstance(), ignoreMaxLayerParameter: true})
		]).then(function (aArgs) {
			var oReloadInfo = {
				changesNeedReload: aArgs[0],
				hasHigherLayerChanges: aArgs[1],
				hasDraftChanges: this._isDraftAvailable(),
				hasDraftParameter: this._hasParameter(FlexUtils.getParsedURLHash(), LayerUtils.FL_DRAFT_PARAM)
			};
			if (oReloadInfo.changesNeedReload || oReloadInfo.hasHigherLayerChanges || oReloadInfo.hasDraftChanges
				// If a draft was initially available, the url parameter must be removed on exit - which triggers a soft reload
				|| oReloadInfo.hasDraftParameter) {
				var sRestart = this._RESTART.RELOAD_PAGE;
				// always try cross app navigation (via hash); we only need a hard reload because of appdescr changes (changesNeedReload = true)
				if (!oReloadInfo.changesNeedReload && FlexUtils.getUshellContainer()) {
					sRestart = this._RESTART.VIA_HASH;
				}
				return this._handleReloadMessageBoxOnExit(oReloadInfo).then(function() {
					return sRestart;
				});
			}
			return this._RESTART.NOT_NEEDED;
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
		if (this.getProperty('mode') !== sNewMode) {
			var oModeSwitcher = this.getShowToolbars() && this.getToolbar().getControl('modeSwitcher');
			var bOverlaysEnabled = sNewMode === 'adaptation';

			if (oModeSwitcher) {
				// no event loop because setSelectedButton() doesn't trigger 'select' event on SegmentedButton
				oModeSwitcher.setSelectedButton(
					oModeSwitcher
						.getItems()
						.filter(function (oControl) {
							return oControl.getKey() === sNewMode;
						})
						.pop()
						.getId()
				);
			}
			this._oDesignTime.setEnabled(bOverlaysEnabled);
			this.getPlugins()['tabHandling'][bOverlaysEnabled ? 'removeTabIndex' : 'restoreTabIndex']();
			this.setProperty('mode', sNewMode);
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
		if (this._oDesignTime) {
			Log.error("sap.ui.rta: Failed to set metadata scope on RTA instance after RTA is started");
			return;
		}

		this.setProperty('metadataScope', sScope);
	};

	function resolveServiceLocation(sName) {
		if (ServicesIndex.hasOwnProperty(sName)) {
			return ServicesIndex[sName].replace(/\./g, '/');
		}
	}

	/**
	 * Starts a service
	 * @param {string} sName - Registered service name
	 * @return {Promise} - promise is resolved with service api or rejected in case of any error.
	 */
	RuntimeAuthoring.prototype.startService = function (sName) {
		if (this._sStatus !== STARTED) {
			return new Promise(function (fnResolve, fnReject) {
				this.attachEventOnce('start', fnResolve);
				this.attachEventOnce('failed', fnReject);
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

	return RuntimeAuthoring;
});
