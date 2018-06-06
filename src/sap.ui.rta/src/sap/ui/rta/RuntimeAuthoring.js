/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.Main.
sap.ui.define([
		"jquery.sap.global",
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
		"sap/ui/rta/plugin/ControlVariant",
		"sap/ui/dt/plugin/ContextMenu",
		"sap/ui/dt/plugin/TabHandling",
		"sap/ui/fl/FlexControllerFactory",
		"sap/ui/rta/Utils",
		"sap/ui/dt/Util",
		"sap/ui/fl/Utils",
		"sap/ui/fl/registry/Settings",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/rta/util/PopupManager",
		"sap/ui/core/BusyIndicator",
		"sap/ui/dt/DOMUtil",
		"sap/ui/rta/util/StylesLoader",
		"sap/ui/rta/util/UrlParser",
		"sap/ui/rta/appVariant/Feature",
		"sap/ui/Device",
		"sap/ui/rta/service/index",
		"sap/ui/rta/util/ServiceEventBus"
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
		ControlVariantPlugin,
		ContextMenuPlugin,
		TabHandlingPlugin,
		FlexControllerFactory,
		Utils,
		DtUtil,
		FlexUtils,
		FlexSettings,
		MessageBox,
		MessageToast,
		PopupManager,
		BusyIndicator,
		DOMUtil,
		StylesLoader,
		UrlParser,
		RtaAppVariantFeature,
		Device,
		ServicesIndex,
		ServiceEventBus
	) {
	"use strict";

	var FL_MAX_LAYER_PARAM = "sap-ui-fl-max-layer";
	var SERVICE_STARTING = "starting";
	var SERVICE_STARTED = "started";
	var SERVICE_FAILED = "failed";

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
	var RuntimeAuthoring = ManagedObject.extend("sap.ui.rta.RuntimeAuthoring", /** @lends sap.ui.rta.RuntimeAuthoring.prototype */
	{
		metadata : {
			// ---- control specific ----
			library : "sap.ui.rta",
			associations : {
				/** The root control which the runtime authoring should handle */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			properties : {
				/** The URL which is called when the custom field dialog is opened */
				"customFieldUrl" : "string",

				/** Whether the create custom field button should be shown */
				"showCreateCustomField" : "boolean",

				/** Whether the create custom field button should be shown */
				"showToolbars" : {
					type : "boolean",
					defaultValue : true
				},

				/** Whether rta is triggered from a dialog button */
				"triggeredFromDialog" : {
					type : "boolean",
					defaultValue : false
				},

				/** Whether the window unload dialog should be shown */
				"showWindowUnloadDialog" : {
					type : "boolean",
					defaultValue : true
				},

				/** sap.ui.rta.command.Stack */
				"commandStack" : {
					type : "any"
				},

				/** Map indicating plugins in to be loaded or in use by RuntimeAuthoring and DesignTime */
				"plugins" : {
					type : "any",
					defaultValue : {}
				},


				/**
				 * Map with flex-related settings
				 * @experimental
				 */
				"flexSettings": {
					type: "object",
					defaultValue: {
						layer: "CUSTOMER",
						developerMode: true
					}
				},

				/** Defines view state of the RTA. Possible values: adaptation, navigation */
				"mode" : {
					type: "string",
					defaultValue: "adaptation"
				},

				/**
				 * Defines designtime metadata scope
				 */
				"metadataScope": {
					type: "string",
					defaultValue: "default"
				}
			},
			events : {
				/** Fired when the runtime authoring is started */
				"start" : {
					parameters: {
						editablePluginsCount: {
							type: "int"
						}
					}
				},

				/** Fired when the runtime authoring is stopped */
				"stop" : {},

				/** Fired when the runtime authoring failed to start */
				"failed" : {},

				/**
				 * Event fired when a DesignTime selection is changed
				 */
				"selectionChange" : {
					parameters : {
						selection : { type : "sap.ui.dt.Overlay[]" }
					}
				},
				/**Event fired when the runtime authoring mode is changed */
				"modeChanged" : {},

				/**
				 * Fired when the undo/redo stack has changed, undo/redo buttons can be updated
				 */
				"undoRedoStackModified" : {}
			}
		},
		_sAppTitle : null,
		_dependents: null,
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
		},
		_RESTART : {
			NOT_NEEDED : "no restart",
			VIA_HASH : "without max layer",
			RELOAD_PAGE : "reload"
		}
	});

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
	 * @return {map} Map with plugins
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
			this._mDefaultPlugins["contextMenu"] = new ContextMenuPlugin({
				styleClass: Utils.getRtaStyleClassName()
			});

			// Tab Handling
			this._mDefaultPlugins["tabHandling"] = new TabHandlingPlugin();

			//Control Variant
			this._mDefaultPlugins["controlVariant"] = new ControlVariantPlugin({
				commandFactory : oCommandFactory
			});
		}

		return jQuery.extend({}, this._mDefaultPlugins);
	};


	RuntimeAuthoring.prototype.addDependent = function (oObject, sName, bCreateGetter) {
		bCreateGetter = typeof bCreateGetter === 'undefined' ? true : !!bCreateGetter;
		if (!(sName in this._dependents)) {
			if (sName && bCreateGetter) {
				this['get' + jQuery.sap.charToUpperCase(sName, 0)] = this.getDependent.bind(this, sName);
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
		if (
			oEvent.getParameters() instanceof sap.m.Dialog
			&& this.getToolbar() instanceof FioriToolbar
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
		var oUriParams = jQuery.sap.getUriParameters();
		var aUriLayer = oUriParams.mParams["sap-ui-layer"];

		mFlexSettings = jQuery.extend({}, this.getFlexSettings(), mFlexSettings);

		if (aUriLayer && aUriLayer.length > 0) {
			mFlexSettings.layer = aUriLayer[0];
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
	 * @param {String} sLayer the current layer
	 * @returns {String} the layer after checking the uri parameters
	 * @private
	 */
	RuntimeAuthoring.prototype.getLayer = function(sLayer) {
		return this.getFlexSettings().layer;
	};

	RuntimeAuthoring.prototype._getFlexController = function() {
		var oRootControl = this._oRootControl || sap.ui.getCore().byId(this.getRootControl());
		return FlexControllerFactory.createForControl(oRootControl);
	};

	RuntimeAuthoring.prototype._getTextResources = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	};

	/**
	 * Start UI adaptation at runtime (RTA).
	 * @return {Promise} Returns a Promise with the initialization of RTA
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function() {
		var oDesignTimePromise;

		// Create DesignTime
		if (!this._oDesignTime) {
			this._oRootControl = sap.ui.getCore().byId(this.getRootControl());
			if (!this._oRootControl){
				var vError = "Could not start Runtime Adaptation: Root control not found";
				FlexUtils.log.error(vError);
				return Promise.reject(vError);
			}
			//Check if the application has personalized changes and reload without them
			return this._handlePersonalizationChangesOnStart()
			.then(function(bReloadTriggered){
				if (bReloadTriggered) {
					// FLP Plugin reacts on this error string and doesn't the error on the UI
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
					jQuery.sap.measure.start("rta.dt.startup","Measurement of RTA: DesignTime start up");
					this._oDesignTime = new DesignTime({
						scope: this.getMetadataScope(),
						plugins: aPlugins
					});
					//add root control is triggering overlay creation, so we need to wait for the scope to be set.
					this._oDesignTime.addRootElement(this._oRootControl);

					jQuery(Overlay.getOverlayContainer()).addClass("sapUiRta");
					if (this.getLayer() === "USER") {
						jQuery(Overlay.getOverlayContainer()).addClass("sapUiRtaPersonalize");
					}

					this._oRootControl.addStyleClass("sapUiRtaRoot");

					this._oDesignTime.attachSelectionChange(function(oEvent) {
						this.fireSelectionChange({selection: oEvent.getParameter("selection")});
					}, this);

					this._oDesignTime.attachEventOnce("synced", function() {
						fnResolve();
						jQuery.sap.measure.end("rta.dt.startup","Measurement of RTA: DesignTime start up");
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
				if (this.getShowToolbars()) {
					// Create ToolsMenu
					return this._getPublishAndAppVariantSupportVisibility()
						.then(function (aButtonsSupport) {
							var bShowPublish = aButtonsSupport[0];
							var bIsAppVariantSupported = aButtonsSupport[1];
							this._createToolsMenu(bShowPublish, bIsAppVariantSupported);
							return this.getToolbar().show();
						}.bind(this));
				}
			}.bind(this))
			.then(function () {
				// this is needed to initially check if undo is available, e.g. when the stack gets initialized with changes
				this._onStackModified();
				this.fnKeyDown = this._onKeyDown.bind(this);
				jQuery(document).on("keydown", this.fnKeyDown);
			}.bind(this))
			.then(function() {
				this.getPopupManager().setRta(this);
				var oRelevantPopups = this.getPopupManager().getRelevantPopups();
				if (oRelevantPopups.aDialogs || oRelevantPopups.aPopovers) {
					return this.getShowToolbars() && this.getToolbar().bringToFront();
				}
			}.bind(this))
			.then(function () {
				// non-blocking style loading
				StylesLoader
					.loadStyles('InPageStyles')
					.then(function (sData) {
						var sStyles = sData.replace(/%scrollWidth%/g, DOMUtil.getScrollbarWidth() + 'px');
						DOMUtil.insertStyles(sStyles);
					});
			})
			.then(function () {
				return oDesignTimePromise;
			})
			.then(
				function () {
					this.fireStart({
						editablePluginsCount: this.iEditableOverlaysCount
					});
				}.bind(this),
				function (vError) {
					if (vError !== "Reload triggered") {
						this.fireFailed(vError);
					}
					if (vError) {
						return Promise.reject(vError);
					}
				}.bind(this)
			);
		}
	};

	/**
	 * Checks the Publish button and app variant support (i.e. Save As and Overview of App Variants) availability
	 * @private
	 * @returns {boolean[]} Returns an array of boolean values [bPublishAvailable, bAppVariantSupportAvailable]
	 * @description The publish button shall not be available if the system is productive and if a merge error occurred during merging changes into the view on startup
	 * The app variant support shall not be available if the system is productive and if the platform is not enabled (See Feature.js) to show the app variant tooling
	 * isProductiveSystem should only return true if it is a test or development system with the provision of custom catalog extensions
	 */
	RuntimeAuthoring.prototype._getPublishAndAppVariantSupportVisibility = function() {
		return FlexSettings.getInstance().then(function(oSettings) {
			var bIsAppVariantSupported = RtaAppVariantFeature.isPlatFormEnabled(this._oRootControl, this.getLayer(), this._oSerializer);
			return [!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured(), !oSettings.isProductiveSystem() && bIsAppVariantSupported];
		}.bind(this))
		.catch(function(oError) {
			return false;
		});
	};

	var fnShowTechnicalError = function(vError) {
		BusyIndicator.hide();
		var sErrorMessage = vError.stack || vError.message || vError.status || vError;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		jQuery.sap.log.error("Failed to transfer runtime adaptation changes to layered repository", sErrorMessage);
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
		var  oOldCommandStack = this.getProperty("commandStack");
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
		var oUshellContainer = Utils.getUshellContainer();

		if (this.getShowToolbars()) {
			this.getToolbar().setUndoRedoEnabled(bCanUndo, bCanRedo);
			this.getToolbar().setPublishEnabled(this._bChangesExist || bCanUndo);
			this.getToolbar().setRestoreEnabled(this._bChangesExist || bCanUndo);
		}
		this.fireUndoRedoStackModified();

		if (oUshellContainer) {
			if (bCanUndo) {
				oUshellContainer.setDirtyFlag(true);
			} else {
				oUshellContainer.setDirtyFlag(false);
			}
		}
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
		} else {
			return [];
		}
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
			.then(function(sReload){
				return ((bDontSaveChanges) ? Promise.resolve() : this._serializeToLrep(this))
				.then(this._closeToolbar.bind(this))
				.then(function(){
					this.fireStop();
					if (sReload !== this._RESTART.NOT_NEEDED){
						this._removeMaxLayerParameter();
						if (sReload === this._RESTART.RELOAD_PAGE){
							this._reloadPage();
						}
					}
				}.bind(this));
			}.bind(this))['catch'](fnShowTechnicalError);
	};

	RuntimeAuthoring.prototype.restore = function() {
		this._onRestore();
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
		var bFocusOnBody = document.body === document.activeElement;
		var bFocusInsideRenameField = jQuery(document.activeElement).parents('.sapUiRtaEditableField').length > 0;

		if ((bFocusInsideOverlayContainer || bFocusInsideRtaToolbar || bFocusOnBody) && !bFocusInsideRenameField) {
			// OSX: replace CTRL with CMD
			var bCtrlKey = bMacintosh ? oEvent.metaKey : oEvent.ctrlKey;
			if (
				oEvent.keyCode === jQuery.sap.KeyCodes.Z
				&& oEvent.shiftKey === false
				&& oEvent.altKey === false
				&& bCtrlKey === true
			) {
				this._onUndo().then(oEvent.stopPropagation.bind(oEvent));
			} else if (
				(( // OSX: CMD+SHIFT+Z
					bMacintosh
					&& oEvent.keyCode === jQuery.sap.KeyCodes.Z
					&& oEvent.shiftKey === true
				) || ( // Others: CTRL+Y
					!bMacintosh
					&& oEvent.keyCode === jQuery.sap.KeyCodes.Y
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
		} else {
			window.onbeforeunload = this._oldUnloadHandler;
		}
	};

	RuntimeAuthoring.prototype._serializeToLrep = function() {
		return this._oSerializer.saveCommands();
	};

	RuntimeAuthoring.prototype._onUndo = function() {
		this._handleStopCutPaste();
		return this.getCommandStack().undo();
	};

	RuntimeAuthoring.prototype._onRedo = function() {
		this._handleStopCutPaste();
		return this.getCommandStack().redo();
	};

	RuntimeAuthoring.prototype._createToolsMenu = function(bPublishAvailable, bIsAppVariantSupported) {
		if (!this.getDependent('toolbar')) {
			var fnConstructor;

			if (this.getLayer() === "USER") {
				fnConstructor = PersonalizationToolbar;
			} else if (Utils.getFiori2Renderer()) {
				fnConstructor = FioriToolbar;
			} else {
				fnConstructor = StandaloneToolbar;
			}

			if (this.getLayer() === "USER") {
				this.addDependent(new fnConstructor({
					textResources: this._getTextResources(),
					//events
					exit: this.stop.bind(this, false, false),
					restore: this._onRestore.bind(this)
				}), 'toolbar');
			} else {
				this.addDependent(new fnConstructor({
					modeSwitcher: this.getMode(),
					publishVisible: bPublishAvailable,
					textResources: this._getTextResources(),
					//events
					exit: this.stop.bind(this, false, false),
					transport: this._onTransport.bind(this),
					restore: this._onRestore.bind(this),
					undo: this._onUndo.bind(this),
					redo: this._onRedo.bind(this),
					modeChange: this._onModeChange.bind(this),
					manageApps: RtaAppVariantFeature.onGetOverview.bind(null, true),
					appVariantOverview: this._onGetAppVariantOverview.bind(this),
					saveAs: RtaAppVariantFeature.onSaveAsFromRtaToolbar.bind(null, true, true)
				}), 'toolbar');
			}

			var bExtendedOverview;

			if (bIsAppVariantSupported) {
				// Sets the visibility of 'Save As' button in RTA toolbar
				this.getToolbar().getControl('saveAs').setVisible(bIsAppVariantSupported);
				// Flag which represents either the key user view or SAP developer view
				bExtendedOverview = RtaAppVariantFeature.isOverviewExtended();

				if (bExtendedOverview) {
					// Sets the visibility of 'i' menu button (App Variant Overview: SAP developer view) in RTA toolbar
					this.getToolbar().getControl('appVariantOverview').setVisible(bIsAppVariantSupported);
				} else {
					// Sets the visibility of 'i' button (App Variant Overview: Key user view) in RTA toolbar
					this.getToolbar().getControl('manageApps').setVisible(bIsAppVariantSupported);
				}

				RtaAppVariantFeature.isManifestSupported().then(function(bResult) {
					if (bExtendedOverview) {
						this.getToolbar().getControl('appVariantOverview').setEnabled(bResult);
					} else {
						this.getToolbar().getControl('manageApps').setEnabled(bResult);
					}
					this.getToolbar().getControl('saveAs').setEnabled(bResult);
				}.bind(this));
			}

			this._checkChangesExist().then(function(bResult){
				// FIXME: remove this condition when start() is refactored properly
				if (!this.bIsDestroyed) {
					this._bChangesExist = bResult;
					this.getToolbar().setPublishEnabled(bResult);
					this.getToolbar().setRestoreEnabled(bResult);
				}
			}.bind(this));
		}
	};

	RuntimeAuthoring.prototype._onGetAppVariantOverview = function(oEvent) {
		var oItem = oEvent.getParameter("item");

		var bTriggeredForKeyUser = oItem.getId() === 'keyUser';
		return RtaAppVariantFeature.onGetOverview(bTriggeredForKeyUser);
	};

	/**
	 * Exit Runtime Authoring - destroy all controls and plugins
	 *
	 * @protected
	 */
	RuntimeAuthoring.prototype.destroy = function() {
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

		if (this._oRootControl) {
			this._oRootControl.removeStyleClass("sapUiRtaRoot");
		}

		this.setCommandStack(null);

		var oUshellContainer = Utils.getUshellContainer();
		if (oUshellContainer) {
			oUshellContainer.setDirtyFlag(false);
		}

		if (this._oServiceEventBus) {
			this._oServiceEventBus.destroy();
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
			return this._getFlexController()._oChangePersistence.transportAllUIChanges(this._oRootControl, Utils.getRtaStyleClassName(), this.getLayer())
				.then(function(sResponse) {
					if (sResponse !== "Error" && sResponse !== "Cancel") {
						this._showMessageToast("MSG_TRANSPORT_SUCCESS");
					}
				}.bind(this));
		}.bind(this))['catch'](fnShowTechnicalError);
	};

	/**
	 * Delete all changes for current layer and root control's component
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._deleteChanges = function() {
		return this._getFlexController().resetChanges(this.getLayer(), "Change.createInitialFileContent", FlexUtils.getAppComponentForControl(this._oRootControl || sap.ui.getCore().byId(this.getRootControl())))
			.then(function() {
				this._reloadPage();
			}.bind(this))["catch"](function(oError) {
				return Utils._showMessageBox(MessageBox.Icon.ERROR, "HEADER_RESTORE_FAILED", "MSG_RESTORE_FAILED", oError);
			});
	};

	/**
	 * Reloads the page.
	 * @private
	 */
	RuntimeAuthoring.prototype._reloadPage = function(){
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

		var bRestart = !!window.localStorage.getItem("sap.ui.rta.restart." + sLayer);
		return bRestart;
	};

	/**
	 * Enable restart of RTA
	 * the RTA FLP plugin handles the restart
	 *
	 * @public
	 * @static
	 * @param {string} sLayer The active layer
	 */
	RuntimeAuthoring.enableRestart = function(sLayer) {
		window.localStorage.setItem("sap.ui.rta.restart." + sLayer, true);
	};

	/**
	 * Disable restart of RTA
	 *
	 * @public
	 * @static
	 * @param {string} sLayer The active layer
	 */
	RuntimeAuthoring.disableRestart = function(sLayer) {
		window.localStorage.removeItem("sap.ui.rta.restart." + sLayer);
	};

	/**
	 * Discard all LREP changes and restores the default app state,
	 * opens a MessageBox where the user can confirm
	 * the restoring to the default app state
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onRestore = function() {
		var sMessage = this.getLayer() === "USER"
			? this._getTextResources().getText("FORM_PERS_RESET_MESSAGE_PERSONALIZATION")
			: this._getTextResources().getText("FORM_PERS_RESET_MESSAGE");
		var sTitle = this.getLayer() === "USER"
			? this._getTextResources().getText("BTN_RESTORE")
			: this._getTextResources().getText("FORM_PERS_RESET_TITLE");

		var fnConfirmDiscardAllChanges = function (sAction) {
			if (sAction === "OK") {
				RuntimeAuthoring.enableRestart(this.getLayer());
				this._deleteChanges();
				this.getCommandStack().removeAllCommands();
			}
		}.bind(this);

		this._handleStopCutPaste();

		MessageBox.confirm(sMessage, {
			icon: MessageBox.Icon.WARNING,
			title : sTitle,
			onClose : fnConfirmDiscardAllChanges,
			styleClass: Utils.getRtaStyleClassName()
		});
	};

	/**
	 * Function to automatically start the rename plugin on a container when it gets created
	 * @param {object} vAction       The create action from designtime metadata
	 * @param {string} sNewControlID The id of the newly created container
	 */
	RuntimeAuthoring.prototype._scheduleRenameOnCreatedContainer = function(vAction, sNewControlID) {
		var fnStartEdit = function (oElementOverlay) {
			oElementOverlay.setSelected(true);
			this.getPlugins()["rename"].startEdit(oElementOverlay);
		};
		var fnGeometryChangedCallback = function(oEvent) {
			var oElementOverlay = oEvent.getSource();
			if (oElementOverlay.getGeometry() && oElementOverlay.getGeometry().visible) {
				fnStartEdit.call(this, oElementOverlay);
				oElementOverlay.detachEvent('geometryChanged', fnGeometryChangedCallback, this);
			}
		};

		var fnOverlayRenderedCallback = function(oEvent){
			var oNewOverlay = oEvent.getSource();
			// the control can be set to visible, but still have no size when we do the check
			// that's why we also attach to 'geometryChanged' and check if the overlay has a size
			if (!oNewOverlay.getGeometry() || !oNewOverlay.getGeometry().visible) {
				oNewOverlay.attachEvent('geometryChanged', fnGeometryChangedCallback, this);
			} else {
				fnStartEdit.call(this, oNewOverlay);
			}
			oNewOverlay.detachEvent('afterRendering', fnOverlayRenderedCallback, this);
		};
		var sNewContainerID = this.getPlugins()["createContainer"].getCreatedContainerId(vAction, sNewControlID);

		this._oDesignTime.attachEvent("elementOverlayCreated", function(oEvent){
			var oNewOverlay = oEvent.getParameter("elementOverlay");
			if (oNewOverlay.getElement().getId() === sNewContainerID) {
				// the overlay needs to be rendered before we can trigger the rename on it
				oNewOverlay.attachEvent('afterRendering', fnOverlayRenderedCallback, this);
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
			if (vAction && sNewControlID){
				this._scheduleRenameOnCreatedContainer(vAction, sNewControlID);
			}
			return this.getCommandStack().pushAndExecute(oCommand)
			// Error handling when a command fails is done in the Stack
			.catch(function(oError) {
				throw new Error(oError);
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
		if (this.getPlugins()["cutPaste"]){
			this.getPlugins()["cutPaste"].stopCutAndPaste();
		}
	};

	/**
	 * Check if Changes exist
	 * @private
	 * @returns {Promise} Resolving to false means that no change check is required
	 */
	RuntimeAuthoring.prototype._checkChangesExist = function() {
		if (this._getFlexController().getComponentName().length > 0) {
			return this._getFlexController().getComponentChanges({currentLayer: this.getLayer(), includeCtrlVariants: true}).then(function(aAllLocalChanges) {
				return aAllLocalChanges.length > 0;
			});
		} else {
			return Promise.resolve(false);
		}
	};

	/**
	 * Returns the URL parsed hash from UShell
	 * @return {map} Parsed shell hash map
	 */
	RuntimeAuthoring.prototype._getURLParsedHash = function(){
		var oURLParser = sap.ushell.Container.getService("URLParsing");
		if (oURLParser.parseShellHash && oURLParser.getHash){
			return oURLParser.parseShellHash(oURLParser.getHash(window.location.href));
		}
	};

	/**
	 * Build the navigation arguments object required to trigger the navigation
	 * using the CrossApplicationNavigation ushell service.
	 * @param  {Object} mParsedHash Parsed URL hash
	 * @return {Object}             Returns argument map ("oArg" parameter of the "toExternal" function)
	 */
	RuntimeAuthoring.prototype._buildNavigationArguments = function(mParsedHash){
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
	 * Returns true if the ui layer parameter is set to customer (skips personalization changes)
	 * @param  {map} mParsedHash The parsed URL hash
	 * @return {boolean} True if the parameter is in the hash
	 */
	RuntimeAuthoring.prototype._hasCustomerLayerParameter = function(mParsedHash){
		return mParsedHash.params &&
			mParsedHash.params[FL_MAX_LAYER_PARAM] &&
			mParsedHash.params[FL_MAX_LAYER_PARAM][0] === "CUSTOMER";
	};

	/**
	 * Reload the app inside FLP adding the parameter to skip personalization changes
	 * @param  {map} mParsedHash URL parsed hash
	 * @param  {sap.ushell.services.CrossApplicationNavigation} oCrossAppNav ushell service
	 * @return {Promise} resolving to true if reload was triggered
	 */
	RuntimeAuthoring.prototype._reloadWithoutPersonalizationChanges = function(mParsedHash, oCrossAppNav){
		if (!this._hasCustomerLayerParameter(mParsedHash)){
			if (!mParsedHash.params) {
				mParsedHash.params = {};
			}
			mParsedHash.params[FL_MAX_LAYER_PARAM] = ["CUSTOMER"];
			RuntimeAuthoring.enableRestart("CUSTOMER");
			// triggers the navigation without leaving FLP
			oCrossAppNav.toExternal(this._buildNavigationArguments(mParsedHash));
			return Promise.resolve(true);
		}
	};

	/**
	 * Reload the app inside FLP removing the parameter to skip personalization changes
	 * @return {boolean} resolving to true if reload was triggered
	 */
	RuntimeAuthoring.prototype._removeMaxLayerParameter = function(){
		if (Utils.getUshellContainer() && this.getLayer() !== "USER") {
			var oCrossAppNav = Utils.getUshellContainer().getService("CrossApplicationNavigation");
			var mParsedHash = this._getURLParsedHash();
			if (oCrossAppNav.toExternal && mParsedHash){
				if (this._hasCustomerLayerParameter(mParsedHash)) {
					delete mParsedHash.params[FL_MAX_LAYER_PARAM];
					// triggers the navigation without leaving FLP
					oCrossAppNav.toExternal(this._buildNavigationArguments(mParsedHash));
				}
			}
		}
	};

	/**
	 * Handler for the message box warning the user that personalization changes exist
	 * and the app will be reloaded
	 * @return {Promise} Resolving when the user clicks on OK
	 */
	RuntimeAuthoring.prototype._handlePersonalizationMessageBoxOnStart = function() {
		return Utils._showMessageBox(
			MessageBox.Icon.INFORMATION,
			"HEADER_PERSONALIZATION_EXISTS",
			"MSG_PERSONALIZATION_EXISTS");
	};

	/**
	 * Handler for the message box warning the user that personalization changes exist
	 * and the app will be reloaded
	 * @return {Promise} Resolving when the user clicks on OK
	 */
	RuntimeAuthoring.prototype._handleReloadMessageBox = function(sReason) {
		return Utils._showMessageBox(
			MessageBox.Icon.INFORMATION,
			"HEADER_RELOAD_NEEDED",
			sReason,
			undefined,
			"BUTTON_RELOAD_NEEDED"
		);
	};

	/**
	 * Check if there are personalization changes and restart the application without them
	 * Warn the user that the application will be restarted without personalization
	 * This is only valid when a UShell is present
	 * @return {Promise} Resolving to false means that reload is not necessary
	 */
	RuntimeAuthoring.prototype._handlePersonalizationChangesOnStart = function() {
		var oUshellContainer = Utils.getUshellContainer();
		if (oUshellContainer && this.getLayer() !== "USER") {
			var mParsedHash = this._getURLParsedHash();
			return this._getFlexController().isPersonalized({ignoreMaxLayerParameter : false})
			.then(function(bIsPersonalized){
				if (bIsPersonalized) {
					return this._handlePersonalizationMessageBoxOnStart().then(function() {
						var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
						if (oCrossAppNav.toExternal && mParsedHash){
							return this._reloadWithoutPersonalizationChanges(mParsedHash, oCrossAppNav);
						}
					}.bind(this));
				}
			}.bind(this));
		} else {
			return Promise.resolve(false);
		}
	};

	/**
	 * When exiting RTA and personalization changes exist, the user can choose to
	 * reload the app with personalization or stay in the app without the personalization
	 * @return {Promise} Resolving to RESTART enum indicating if reload is necessary
	 */
	RuntimeAuthoring.prototype._handleReloadOnExit = function() {
		return Promise.all([
			this._oSerializer.needsReload(),
			// When working with RTA, the MaxLayer parameter will be present in the URL and must
			// be ignored in the decision to bring up the pop-up (ignoreMaxLayerParameter = true)
			this._getFlexController().isPersonalized({ignoreMaxLayerParameter : true})
		]).then(function(aArgs){
			var bChangesNeedRestart = aArgs[0],
				bIsPersonalized = aArgs[1];
			if (bChangesNeedRestart || bIsPersonalized){
				var sRestart = this._RESTART.RELOAD_PAGE;
				var sRestartReason;
				if (bIsPersonalized) {
					//Loading the app with personalization means the visualization might change,
					//therefore this message takes precedence
					sRestartReason = "MSG_RELOAD_WITH_PERSONALIZATION";

					if (!bChangesNeedRestart){
						//if changes need restart this method has precedence, but in this case
						//the faster cross app navigation to the same app (restart via hash) is possible
						sRestart = this._RESTART.VIA_HASH;
					}
				} else if (bChangesNeedRestart){
					sRestartReason = "MSG_RELOAD_NEEDED";
				}
				return this._handleReloadMessageBox(sRestartReason).then(function(){
					return sRestart;
				});
			} else {
				//no reload needed
				return this._RESTART.NOT_NEEDED;
			}

		}.bind(this));
	};

	RuntimeAuthoring.prototype._onModeChange = function(oEvent) {
		this.setMode(oEvent.getParameter('key'));
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
			jQuery.sap.log.error("sap.ui.rta: Failed to set metadata scope on RTA instance after RTA is started");
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
		var sServiceLocation = resolveServiceLocation(sName);
		var mService;

		if (!sServiceLocation) {
			return Promise.reject(
				DtUtil.createError(
					"RuntimeAuthoring#stopService",
					DtUtil.printf("Unknown service. Can't find any registered service by name '{0}'", sName),
					"sap.ui.rta"
				)
			);
		} else {
			mService = this._mServices[sName];
			if (mService) {
				switch (mService.status) {
					case 'started': {
						return Promise.resolve(mService.exports);
					}
					case 'starting': {
						return mService.initPromise;
					}
					case 'failed': {
						return mService.initPromise;
					}
					default: {
						return Promise.reject(
							DtUtil.createError(
								"RuntimeAuthoring#getService",
								DtUtil.printf("Unknown service status. Service name = '{0}'", sName),
								"sap.ui.rta"
							)
						);
					}
				}
			} else {
				mService = {
					status: SERVICE_STARTING,
					location: sServiceLocation,
					initPromise: new Promise(function (fnResolve, fnReject) {
						sap.ui.require(
							[ sServiceLocation ],
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
													"RuntimeAuthoring#getService",
													DtUtil.printf("RuntimeAuthoring instance is destroyed while initialising the service '{0}'", sName),
													"sap.ui.rta"
												);
											}
											if (!jQuery.isPlainObject(oService)) {
												throw DtUtil.createError(
													"RuntimeAuthoring#getService",
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
													mResult[sKey] = typeof vValue === "function" ?  DtUtil.wrapIntoPromise(vValue) : vValue;
													return mResult;
												}, {})
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
										"RuntimeAuthoring#getService",
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
									"RuntimeAuthoring#getService",
									DtUtil.printf("Error during service '{0}' initialisation.", sName),
									"sap.ui.rta"
								)
							);
						})
				};

				this._mServices[sName] = mService;

				return mService.initPromise;
			}
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
				if (jQuery.isFunction(oService.service.destroy)) {
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
}, /* bExport= */true);
