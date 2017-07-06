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
		"sap/ui/dt/ElementUtil",
		"sap/ui/dt/DesignTime",
		"sap/ui/dt/OverlayRegistry",
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
		"sap/ui/dt/plugin/ContextMenu",
		"sap/ui/dt/plugin/TabHandling",
		"sap/ui/fl/FlexControllerFactory",
		"sap/ui/rta/ui/SettingsDialog",
		"./Utils",
		"sap/ui/fl/transport/Transports",
		"sap/ui/fl/transport/TransportSelection",
		"sap/ui/fl/Utils",
		"sap/ui/fl/registry/Settings",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/rta/util/PopupManager",
		"sap/ui/core/BusyIndicator",
		"sap/ui/dt/DOMUtil",
		"sap/ui/rta/util/StylesLoader"
	],
	function(
		jQuery,
		ManagedObject,
		FioriToolbar,
		StandaloneToolbar,
		PersonalizationToolbar,
		ElementUtil,
		DesignTime,
		OverlayRegistry,
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
		ContextMenuPlugin,
		TabHandlingPlugin,
		FlexControllerFactory,
		SettingsDialog,
		Utils,
		Transports,
		TransportSelection,
		FlexUtils,
		FlexSettings,
		MessageBox,
		MessageToast,
		PopupManager,
		BusyIndicator,
		DOMUtil,
		StylesLoader
	) {
	"use strict";

	var FL_MAX_LAYER_PARAM = "sap-ui-fl-max-layer";

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

				/** Temporary property : whether to show a dialog for changing control's properties#
				 * should be removed after DTA will fully switch to a property panel
				 */
				"showSettingsDialog" : {
					type : "boolean",
					defaultValue : true
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
					type: "object"
				},

				/** Defines view state of the RTA. Possible values: adaptation, navigation */
				"mode" : {
					type: "string",
					defaultValue: "adaptation"
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
		_sAppTitle : null

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

			// Cut paste
			this._mDefaultPlugins["cutPaste"] = new CutPastePlugin({
				elementMover: oRTAElementMover,
				commandFactory: oCommandFactory
			});

			// Remove
			this._mDefaultPlugins["remove"] = new RemovePlugin({
				commandFactory: oCommandFactory
			});

			// Additional elements
			this._mDefaultPlugins["additionalElements"] = new AdditionalElementsPlugin({
				commandFactory: oCommandFactory,
				analyzer: AdditionalElementsAnalyzer,
				dialog: new AdditionalElementsDialog()
			});

			// Rename
			this._mDefaultPlugins["rename"] = new RTARenamePlugin({
				commandFactory: oCommandFactory,
				editable: this._handleStopCutPaste.bind(this)
			});

			// Settings
			this._mDefaultPlugins["settings"] = new SettingsPlugin({
				commandFactory: oCommandFactory
			});

			// Create container
			this._mDefaultPlugins["createContainer"] = new CreateContainerPlugin({
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

			// Context Menu
			this._mDefaultPlugins["contextMenu"] = new ContextMenuPlugin();

			// TabHandling
			this._mDefaultPlugins["tabHandling"] = new TabHandlingPlugin();
		}

		return jQuery.extend({}, this._mDefaultPlugins);
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

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.init = function() {
		this._onCommandStackModified = this._onStackModified.bind(this);
		this.iEditableOverlaysCount = 0;

		// call setFlexSettings with the defaultValues
		this.setFlexSettings({
			layer: "CUSTOMER",
			developerMode: true
		});

		this.oPopupManager = new PopupManager({
			open: this.onPopupOpen.bind(this),
			close: this.onPopupClose.bind(this)
		});
	};

	RuntimeAuthoring.prototype.onPopupOpen = function(oEvent) {
		if (
			oEvent.getParameters() instanceof sap.m.Dialog
			&& this._oToolsMenu instanceof FioriToolbar
		) {
			this._oToolsMenu.setColor("contrast");
		}
		this._oToolsMenu.bringToFront();
	};

	RuntimeAuthoring.prototype.onPopupClose = function(oEvent) {
		if (oEvent.getParameters() instanceof sap.m.Dialog) {
			this._oToolsMenu.setColor();
		}
	};

	RuntimeAuthoring.prototype.setPlugins = function(mPlugins) {
		if (this._oDesignTime) {
			throw new Error('Cannot replace plugins: runtime authoring already started');
		}
		this.setProperty("plugins", mPlugins);
	};

	/**
	 * Setter for flexSettings
	 *
	 * @param {Object} [mFlexSettings] property bag
	 * @param {String} [mFlexSettings.layer] The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {Boolean} [mFlexSettings.developerMode] Whether RTA is started in DeveloperMode Mode. Whether RTA is started in DeveloperMode Mode
	 * @param {String} [mFlexSettings.namespace] Namespace for changes inside LREP
	 */
	RuntimeAuthoring.prototype.setFlexSettings = function(mFlexSettings) {
		// Check URI-parameters for sap-ui-layer
		var oUriParams = jQuery.sap.getUriParameters();
		var aUriLayer = oUriParams.mParams["sap-ui-layer"];
		if (aUriLayer && aUriLayer.length > 0) {
			mFlexSettings.layer = aUriLayer[0];
		}

		this.setProperty("flexSettings", jQuery.extend(this.getFlexSettings(), mFlexSettings));
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
	 * Start Runtime Authoring
	 *
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function() {
		// Create DesignTime
		if (!this._oDesignTime) {
			this._oRootControl = sap.ui.getCore().byId(this.getRootControl());
			//Check if the application has personalized changes and reload without them
			return this._handlePersonalizationChangesOnStart()
			.then(function(bReloadTriggered){
				if (!bReloadTriggered) {
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

					// Hand over currrent command stack to setting plugin
					if (this.getPlugins()["settings"]) {
						this.getPlugins()["settings"].setCommandStack(this.getCommandStack());
					}

					this._buildContextMenu();

					this._oSerializer = new LREPSerializer({commandStack : this.getCommandStack(), rootControl : this.getRootControl()});

					// Create design time
					var aKeys = Object.keys(this.getPlugins());
					var aPlugins = aKeys.map(function(sKey) {
						return this.getPlugins()[sKey];
					}, this);

					jQuery.sap.measure.start("rta.dt.startup","Measurement of RTA: DesignTime start up");
					this._oDesignTime = new DesignTime({
						rootElements : [this._oRootControl],
						plugins : aPlugins
					});

					jQuery(Overlay.getOverlayContainer()).addClass("sapUiRta");
					if (this.getLayer() === "USER") {
						jQuery(Overlay.getOverlayContainer()).addClass("sapUiRtaPersonalize");
					}

					this._oRootControl.addStyleClass("sapUiRtaRoot");

					this._oDesignTime.attachSelectionChange(function(oEvent) {
						this.fireSelectionChange({selection: oEvent.getParameter("selection")});
					}, this);

					this._oDesignTime.attachEventOnce("synced", function() {
						this.fireStart({
							editablePluginsCount: this.iEditableOverlaysCount
						});
						jQuery.sap.measure.end("rta.dt.startup","Measurement of RTA: DesignTime start up");
					}, this);

					this._oDesignTime.attachEventOnce("syncFailed", function() {
						this.fireFailed();
					}, this);

					// attach RuntimeAuthoring event to _$document
					this._$document = jQuery(document);
					this.fnKeyDown = this._onKeyDown.bind(this);
					this._$document.on("keydown", this.fnKeyDown);

					// Register function for checking unsaved before leaving RTA
					this._oldUnloadHandler = window.onbeforeunload;
					window.onbeforeunload = this._onUnload.bind(this);

					sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "appClosed", this._onAppClosed, this);
				}

				return Promise.resolve(bReloadTriggered);
			}.bind(this))
			.then(function (bReloadTriggered) {
				if (this.getShowToolbars() && !bReloadTriggered) {
					// Create ToolsMenu
					return FlexSettings.getInstance(FlexUtils.getComponentClassName(this._oRootControl))
						.then(function(oSettings) {
							return !oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured();
						})
						.catch(function(oError) {
							return false;
						})
						.then(function (bShowPublish) {
							this._createToolsMenu(bShowPublish);
							return this._oToolsMenu.show();
						}.bind(this))
						.then(function() {
							//Popup Overlays
							this.oPopupManager.setRta(this);
						}.bind(this));
				}
			}.bind(this))
			.then(function() {
				var oRelevantPopups = this.oPopupManager.getRelevantPopups();
				if (oRelevantPopups.aDialogs || oRelevantPopups.aPopovers) {
					return this._oToolsMenu.bringToFront();
				}
				return true;
			}.bind(this))
			.then(function () {
				StylesLoader
					.loadStyles('InPageStyles')
					.then(function (sData) {
						var sStyles = sData.replace(/%scrollWidth%/g, DOMUtil.getScrollbarWidth() + 'px');
						DOMUtil.insertStyles(sStyles);
					});

				// non-blocking style loading
				return true;
			});
		}
	};

	var fnShowTechnicalError = function(vError) {
		var sErrorMessage = vError.stack || vError.message || vError.status || vError;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		jQuery.sap.log.error("Failed to transfer runtime adaptation changes to layered repository", sErrorMessage);
		var sMsg = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
				+ oTextResources.getText("MSG_ERROR_REASON", sErrorMessage);
		MessageBox.error(sMsg);
	};

	RuntimeAuthoring.prototype._onAppClosed = function() {
		this.stop(true, true);
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.setCommandStack = function(oCommandStack) {
		var  oOldCommandStack = this.getProperty("commandStack");
		if (oOldCommandStack) {
			oOldCommandStack.detachModified(this._onCommandStackModified);
		}

		if (this._oInternalCommandStack) {
			this._oInternalCommandStack.destroy();
			delete this._oInternalCommandStack;
		}

		var oResult = this.setProperty("commandStack", oCommandStack);

		if (oCommandStack) {
			oCommandStack.attachModified(this._onCommandStackModified);
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

		if (this.getShowToolbars() && this._oToolsMenu) {
			this._oToolsMenu.setUndoRedoEnabled(bCanUndo, bCanRedo);
			this._oToolsMenu.setPublishEnabled(this._bChangesExist || bCanUndo);
			this._oToolsMenu.setRestoreEnabled(this._bChangesExist || bCanUndo);
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

	RuntimeAuthoring.prototype._closeToolBars = function() {
		if (this.getShowToolbars() && this._oToolsMenu) {
			return this._oToolsMenu.hide();
		} else {
			return Promise.resolve();
		}
	};

	/**
	 * Returns a selection from the DesignTime
	 * @return {sap.ui.dt.Overlay[]} selected overlays
	 * @public
	 */
	RuntimeAuthoring.prototype.getSelection = function() {
		if (this._oDesignTime) {
			return this._oDesignTime.getSelection();
		} else {
			return [];
		}
	};

	/**
	 * stop Runtime Authoring
	 *
	 * @public
	 * @param {boolean} bDontSaveChanges - stop RTA with or w/o saving changes
	 * @param {boolean} bSkipCheckPersChanges - stop RTA with or w/o checking for personalized changes
	 * @returns {Promise} promise with no parameters
	 */
	RuntimeAuthoring.prototype.stop = function(bDontSaveChanges, bSkipCheckPersChanges) {
		return ((bDontSaveChanges) ? Promise.resolve() : this._serializeToLrep())
			.then(this._closeToolBars.bind(this))
			.then(bSkipCheckPersChanges ? Promise.resolve() : this._handlePersonalizationChangesOnExit.bind(this))
			.then(function(){
				this.exit();
				this.fireStop();
			}.bind(this))['catch'](fnShowTechnicalError);
	};

	RuntimeAuthoring.prototype.restore = function() {
		this._onRestore();
	};

	RuntimeAuthoring.prototype.transport = function() {
		this._onTransport();
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
		// on macintosh os cmd-key is used instead of ctrl-key
		var bCtrlKey = sap.ui.Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey;
		if ((oEvent.keyCode === jQuery.sap.KeyCodes.Z) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (bCtrlKey === true)) {
			// CTRL+Z
			this._onUndo()

			.then(oEvent.stopPropagation.bind(oEvent));
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.Y) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (bCtrlKey === true)) {
			// CTRL+Y
			this._onRedo()

			.then(oEvent.stopPropagation.bind(oEvent));
		}
	};

	/**
	 * Check for unsaved changes before Leaving Runtime Authoring
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

	RuntimeAuthoring.prototype._createToolsMenu = function(bPublishAvailable) {
		if (!this._oToolsMenu) {
			var fnConstructor;

			if (this.getLayer() === "USER") {
				fnConstructor = PersonalizationToolbar;
			} else if (Utils.getFiori2Renderer()) {
				fnConstructor = FioriToolbar;
			} else {
				fnConstructor = StandaloneToolbar;
			}

			if (this.getLayer() === "USER") {
				this._oToolsMenu = new fnConstructor({
					textResources: this._getTextResources(),
					//events
					exit: this.stop.bind(this, false, false),
					restore: this._onRestore.bind(this)
				});
			} else {
				this._oToolsMenu = new fnConstructor({
					modeSwitcher: this.getMode(),
					publishVisible: bPublishAvailable,
					textResources: this._getTextResources(),
					//events
					exit: this.stop.bind(this, false, false),
					transport: this._onTransport.bind(this),
					restore: this._onRestore.bind(this),
					undo: this._onUndo.bind(this),
					redo: this._onRedo.bind(this),
					modeChange: this._onModeChange.bind(this)
				});
			}

			this._checkChangesExist().then(function(bResult){
				this._bChangesExist = bResult;
				this._oToolsMenu.setPublishEnabled(bResult);
				this._oToolsMenu.setRestoreEnabled(bResult);
			}.bind(this));
		}
	};

	/**
	 * Exit Runtime Authoring - destroy all controls and plugins
	 *
	 * @protected
	 */
	RuntimeAuthoring.prototype.exit = function() {
		if (this._oDesignTime) {
			jQuery(Overlay.getOverlayContainer()).removeClass("sapUiRta");
			this._oDesignTime.destroy();
			this._oDesignTime = null;

			// detach browser events
			this._$document.off("keydown", this.fnKeyDown);
			// Destroy default plugins
			this._destroyDefaultPlugins();
			// plugins have been destroyed as _oDesignTime.destroy()
			// plugins are set to defaultValue if parameter is null
			this.setPlugins(null);
		}

		if (this._oRootControl) {
			this._oRootControl.removeStyleClass("sapUiRtaRoot");
		}

		if (this._oToolsMenu) {
			this._oToolsMenu.destroy();
			this._oToolsMenu = null;
		}
		this.setCommandStack(null);

		var oUshellContainer = Utils.getUshellContainer();
		if (oUshellContainer) {
			oUshellContainer.setDirtyFlag(false);
		}

		if (this.oPopupManager) {
			this.oPopupManager.destroy();
		}

		window.onbeforeunload = this._oldUnloadHandler;
		sap.ui.getCore().getEventBus().unsubscribe("sap.ushell.renderers.fiori2.Renderer", "appClosed", this._onAppClosed, this);
	};

	/**
	 * Function to handle ABAP transport of the changes
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onTransport = function() {
		var fnHandleAllErrors = function (oError) {
			BusyIndicator.hide();
			if (oError.message !== 'createAndApply failed') {
				FlexUtils.log.error("transport error" + oError);
				return this._showMessage(MessageBox.Icon.ERROR, "HEADER_TRANSPORT_ERROR", "MSG_TRANSPORT_ERROR", oError);
			}
		}.bind(this);

		this._handleStopCutPaste();

		return this._openSelection()
			.then(this._checkTransportInfo)
			.then(function(oTransportInfo) {
				if (oTransportInfo) {
					return this._serializeToLrep().then(function () {
						return this._getFlexController().getComponentChanges({currentLayer: this.getLayer()}).then(function (aAllLocalChanges) {
							if (aAllLocalChanges.length > 0) {
								BusyIndicator.show(0);
								return this._createAndApplyChanges(aAllLocalChanges)
									.then(this._transportAllLocalChanges.bind(this, oTransportInfo))
										['catch'](fnHandleAllErrors);
							}
						}.bind(this));
					}.bind(this))['catch'](fnShowTechnicalError);
				}
			}.bind(this)
		);
	};

	RuntimeAuthoring.prototype._checkTransportInfo = function(oTransportInfo) {
		if (oTransportInfo && oTransportInfo.transport && oTransportInfo.packageName !== "$TMP") {
			return oTransportInfo;
		} else {
			return false;
		}
	};

	RuntimeAuthoring.prototype._openSelection = function () {
	   return new TransportSelection().openTransportSelection(null, this._oRootControl);
	};

	/**
	 * Create and apply changes
	 *
	 * Function is copied from FormP13nHandler. We need all changes for various controls.
	 * The function is used in the transport handling.
	 *
	 * @private
	 * @param {array} aChangeSpecificData - array of objects with change specific data
	 * @param {sap.ui.fl.FlexController} - instance of FlexController
	 * @returns {Promise} promise that resolves with no parameters
	 */
	RuntimeAuthoring.prototype._createAndApplyChanges = function(aChangeSpecificData) {
		return Promise.resolve().then(function() {

			function fnValidChanges(oChangeSpecificData) {
				return oChangeSpecificData && oChangeSpecificData.selector && oChangeSpecificData.selector.id;
			}

			aChangeSpecificData.filter(fnValidChanges).forEach(function(oChangeSpecificData) {
				var oControl = sap.ui.getCore().byId(oChangeSpecificData.selector.id);
				this._getFlexController().createAndApplyChange(oChangeSpecificData, oControl);
			});
		})['catch'](function(oError) {
			FlexUtils.log.error("Create and apply error: " + oError);
			return oError;
		}).then(function(oError) {
			return this._getFlexController().saveAll().then(function() {
				if (oError) {
					throw oError;
				}
			});
		}.bind(this))['catch'](function(oError) {
			FlexUtils.log.error("Create and apply and/or save error: " + oError);
			return this._showMessage(MessageBox.Icon.ERROR, "HEADER_TRANSPORT_APPLYSAVE_ERROR", "MSG_TRANSPORT_APPLYSAVE_ERROR", oError);
		}.bind(this));
	};

	/**
	 * Delete all changes for current layer and root control's component
	 *
	 * @private
	 * @return {Promise} the promise from the FlexController
	 */
	RuntimeAuthoring.prototype._deleteChanges = function() {
		var oTransportSelection = new TransportSelection();
		var sCurrentLayer = this.getLayer();

		this._getFlexController().getComponentChanges({currentLayer: sCurrentLayer}).then(function(aChanges) {
			return FlexSettings.getInstance(FlexUtils.getComponentClassName(this._oRootControl)).then(function(oSettings) {
				if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
					return oTransportSelection.setTransports(aChanges, this._oRootControl);
				}
			}.bind(this)).then(function() {
				return this._getFlexController().discardChanges(aChanges, sCurrentLayer === "USER");
			}.bind(this)).then(function() {
				return window.location.reload();
			});
		}.bind(this))["catch"](function(oError) {
			return this._showMessage(MessageBox.Icon.ERROR, "HEADER_RESTORE_FAILED", "MSG_RESTORE_FAILED", oError);
		}.bind(this));
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessage = function(oMessageType, sTitleKey, sMessageKey, oError) {
		var sMessage = this._getTextResources().getText(sMessageKey, oError ? [oError.message || oError] : undefined);
		var sTitle = this._getTextResources().getText(sTitleKey);

		return new Promise(function(resolve) {
			MessageBox.show(sMessage, {
				icon: oMessageType,
				title: sTitle,
				onClose: resolve
			});
		});
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessageToast = function(sMessageKey) {
		var sMessage = this._getTextResources().getText(sMessageKey);

		MessageToast.show(sMessage);
	};

	/**
	 * Check if restart of RTA is needed
	 * the RTA FLP plugin will check this
	 * and restart RTA if needed
	 *
	 * @public
	 * @static
	 * @returns {Boolean} if restart is needed
	 */
	RuntimeAuthoring.needsRestart = function(sLayer) {

		var bRestart = !!window.localStorage.getItem("sap.ui.rta.restart." + sLayer);
		return bRestart;
	};

	/**
	 * Enable restart of RTA
	 * the RTA FLP plugin would handle the restart
	 *
	 * @public
	 * @static
	 */
	RuntimeAuthoring.enableRestart = function(sLayer) {
		window.localStorage.setItem("sap.ui.rta.restart." + sLayer, true);
	};

	/**
	 * Disable restart of RTA
	 * the RTA FLP plugin whould handle the restart
	 *
	 * @public
	 * @static
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
				this.getCommandStack().removeAllCommands();
				RuntimeAuthoring.enableRestart(this.getLayer());
				this._deleteChanges();
			}
		}.bind(this);

		this._handleStopCutPaste();

		MessageBox.confirm(sMessage, {
			icon: MessageBox.Icon.WARNING,
			title : sTitle,
			onClose : fnConfirmDiscardAllChanges
		});
	};

	/**
	 * Prepare all changes and assign them to an existing transport
	 *
	 * @private
	 * @param {object} oTransportInfo - information about the selected transport
	 * @param {sap.ui.fl.FlexController} - instance of FlexController
	 * @returns {Promise} Promise which resolves without parameters
	 */
	RuntimeAuthoring.prototype._transportAllLocalChanges = function(oTransportInfo) {
		return this._getFlexController().getComponentChanges({currentLayer: this.getLayer()}).then(function(aAllLocalChanges) {

			// Pass list of changes to be transported with transport request to backend
			var oTransports = new Transports();
			var aTransportData = oTransports._convertToChangeTransportData(aAllLocalChanges);
			var oTransportParams = {};
			//packageName is '' in CUSTOMER layer (no package input field in transport dialog)
			oTransportParams.package = oTransportInfo.packageName;
			oTransportParams.transportId = oTransportInfo.transport;
			oTransportParams.changeIds = aTransportData;

			return oTransports.makeChangesTransportable(oTransportParams).then(function() {

				// remove the $TMP package from all changes; has been done on the server as well,
				// but is not reflected in the client cache until the application is reloaded
				aAllLocalChanges.forEach(function(oChange) {

					if (oChange.getPackage() === '$TMP') {
						var oDefinition = oChange.getDefinition();
						oDefinition.packageName = oTransportInfo.packageName;
						oChange.setResponse(oDefinition);
					}
				});
			}).then(function() {
				BusyIndicator.hide();
				this._showMessageToast("MSG_TRANSPORT_SUCCESS");
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Checks the two parent-information maps for equality
	 *
	 * @param {object}
	 *          oInfo1 *
	 * @param {object}
	 *          oInfo2
	 * @return {boolean} true if equal, false otherwise
	 * @private
	 */
	RuntimeAuthoring.prototype._isEqualParentInfo = function(oInfo1, oInfo2) {
		var oResult = !!oInfo1 && !!oInfo2;
		if (oResult && (oInfo1.parent && oInfo2.parent)) {
			oResult = oInfo1.parent.getId() === oInfo2.parent.getId();
		}
		if (oResult && (oInfo1.index || oInfo2.index)) {
			oResult = oInfo1.index === oInfo2.index;
		}
		if (oResult && (oInfo1.aggregation || oInfo2.aggregation)) {
			oResult = oInfo1.aggregation === oInfo2.aggregation;
		}
		return oResult;
	};

	/**
	 * Function to handle modification of an element
	 *
	 * @param {sap.ui.base.Event}
	 *          oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleElementModified = function(oEvent) {
		this._handleStopCutPaste();

		var oCommand = oEvent.getParameter("command");
		if (oCommand instanceof sap.ui.rta.command.BaseCommand) {
			this.getCommandStack().pushAndExecute(oCommand);
		}
	};

	/**
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
	 * Function to handle hiding an element by the context menu
	 *
	 * @param {object}
	 *          oOverlay object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleRemoveElement = function(aOverlays) {
		this.getPlugins()["remove"].removeElement(aOverlays);
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._openSettingsDialog = function(oEventOrOverlays) {
		var aSelectedOverlays = (oEventOrOverlays.mParameters) ? oEventOrOverlays.getParameter("selectedOverlays") : oEventOrOverlays;
		var oElement = aSelectedOverlays[0].getElementInstance();
		this._handleStopCutPaste();

		if (!this._oSettingsDialog) {
			this._oSettingsDialog = new SettingsDialog();
		}
		this._oSettingsDialog.setCommandStack(this.getCommandStack());
		this._oSettingsDialog.open(oElement);
	};


	var fnMultiSelectionInactive = function(oOverlay) {
		return this._oDesignTime.getSelection().length < 2;
	};

	var fnIsMovable = function(oOverlay) {
		return oOverlay.getMovable();
	};

	var fnIsRemoveAvailable = function(oOverlay) {
		return this.getPlugins()["remove"].isRemoveAvailable(oOverlay);
	};

	var fnIsRemoveEnabled = function(oOverlay) {
		return this.getPlugins()["remove"].isRemoveEnabled(oOverlay);
	};

	var fnIsRenameAvailable = function(oOverlay) {
		return this.getPlugins()["rename"].isRenameAvailable(oOverlay);
	};

	var fnIsRenameEnabled = function(oOverlay) {
		return this.getPlugins()["rename"].isRenameEnabled(oOverlay);
	};

	var fnIsSettingsAvailable = function(oOverlay) {
		return this.getPlugins()["settings"].isSettingsAvailable(oOverlay);
	};

	var fnIsSettingsEnabled = function(oOverlay) {
		return this.getPlugins()["settings"].isSettingsEnabled(oOverlay);
	};

	var fnIsCombineAvailable = function(oOverlay) {
		return this.getPlugins()["combine"].isCombineAvailable(oOverlay);
	};

	var fnIsCombineEnabled = function(oOverlay) {
		return this.getPlugins()["combine"].isCombineEnabled(oOverlay);
	};

	var fnIsSplitAvailable = function(oOverlay) {
		return this.getPlugins()["split"].isSplitAvailable(oOverlay);
	};

	var fnIsSplitEnabled = function(oOverlay) {
		return this.getPlugins()["split"].isSplitEnabled(oOverlay);
	};

	RuntimeAuthoring.prototype._buildContextMenu = function() {
		// Return if plugin missing
		var oContextMenuPlugin = this.getPlugins()["contextMenu"];
		if (!oContextMenuPlugin) {
			return;
		}

		var oAdditionalElementsPlugin = this.getPlugins()["additionalElements"];
		var oCreateContainerPlugin = this.getPlugins()["createContainer"];

		if (this.getPlugins()["rename"]) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_RENAME_LABEL",
				text : this._getTextResources().getText("CTX_RENAME"),
				handler : this._handleRename.bind(this),
				available : fnIsRenameAvailable.bind(this),
				enabled : function(oOverlay) {
					return (fnMultiSelectionInactive.call(this, oOverlay) && fnIsRenameEnabled.call(this, oOverlay));
				}.bind(this)
			});
		}

		if (oAdditionalElementsPlugin){
			oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_ELEMENTS_AS_SIBLING",
				text : oAdditionalElementsPlugin.getContextMenuTitle.bind(oAdditionalElementsPlugin, true),
				handler : oAdditionalElementsPlugin.showAvailableElements.bind(oAdditionalElementsPlugin, true),
				available : oAdditionalElementsPlugin.isAvailable.bind(oAdditionalElementsPlugin, true),
				enabled : function(oOverlay) {
					return fnMultiSelectionInactive.call(this, oOverlay) && oAdditionalElementsPlugin.isEnabled(true, oOverlay);
				}.bind(this)
			});

			oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_ELEMENTS_AS_CHILD",
				text : oAdditionalElementsPlugin.getContextMenuTitle.bind(oAdditionalElementsPlugin, false),
				handler : oAdditionalElementsPlugin.showAvailableElements.bind(oAdditionalElementsPlugin, false),
				available : oAdditionalElementsPlugin.isAvailable.bind(oAdditionalElementsPlugin, false),
				enabled : function(oOverlay) {
					return fnMultiSelectionInactive.call(this, oOverlay) && oAdditionalElementsPlugin.isEnabled(false, oOverlay);
				}.bind(this)
			});

		}

		if (oCreateContainerPlugin) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_CREATE_CHILD_CONTAINER",
				text : oCreateContainerPlugin.getCreateContainerText.bind(oCreateContainerPlugin, false),
				handler : this._createContainer.bind(this, false),
				available : oCreateContainerPlugin.isCreateAvailable.bind(oCreateContainerPlugin, false),
				enabled : oCreateContainerPlugin.isCreateEnabled.bind(oCreateContainerPlugin, false)
			});

			oContextMenuPlugin.addMenuItem({
				id : "CTX_CREATE_SIBLING_CONTAINER",
				text : oCreateContainerPlugin.getCreateContainerText.bind(oCreateContainerPlugin, true),
				handler : this._createContainer.bind(this, true),
				available : oCreateContainerPlugin.isCreateAvailable.bind(oCreateContainerPlugin, true),
				enabled : oCreateContainerPlugin.isCreateEnabled.bind(oCreateContainerPlugin, true)
			});
		}

		if (this.getPlugins()["remove"]) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_REMOVE",
				text : this._getTextResources().getText("CTX_REMOVE"), // text can be defined also in designtime metadata
				handler : this._handleRemoveElement.bind(this),
				available : fnIsRemoveAvailable.bind(this),
				enabled : fnIsRemoveEnabled.bind(this)
			});
		}

		oContextMenuPlugin.addMenuItem({
			id : "CTX_CUT",
			text : this._getTextResources().getText("CTX_CUT"),
			handler : this._handleCutElement.bind(this),
			available : fnIsMovable,
			enabled : function () {
				return this._oDesignTime.getSelection().length === 1;
			}.bind(this)
		});

		if (this.getPlugins()["cutPaste"]) {

			oContextMenuPlugin.addMenuItem({
				id : "CTX_PASTE",
				text : this._getTextResources().getText("CTX_PASTE"),
				handler : this._handlePasteElement.bind(this),
				available : fnIsMovable,
				enabled : function(oOverlay) {
					return this.getPlugins()["cutPaste"].isElementPasteable(oOverlay);
				}.bind(this)
			});
		}

		oContextMenuPlugin.addMenuItem({
			id : "CTX_GROUP_FIELDS",
			text : this._getTextResources().getText("CTX_GROUP_FIELDS"),
			handler : this._handleCombineElements.bind(this),
			available : fnIsCombineAvailable.bind(this),
			enabled : fnIsCombineEnabled.bind(this)
		});

		oContextMenuPlugin.addMenuItem({
			id : "CTX_UNGROUP_FIELDS",
			text : this._getTextResources().getText("CTX_UNGROUP_FIELDS"),
			handler : this._handleSplitElements.bind(this),
			available : fnIsSplitAvailable.bind(this),
			enabled : fnIsSplitEnabled.bind(this)
		});

		if (this.getPlugins()["settings"]) {
			oContextMenuPlugin.addMenuItem({
				id : "CTX_SETTINGS",
				text : this._getTextResources().getText("CTX_SETTINGS"),
				handler : this._handleSettings.bind(this),
				available : fnIsSettingsAvailable.bind(this),
				enabled : fnIsSettingsEnabled.bind(this)
			});
		}
	};

	RuntimeAuthoring.prototype._createContainer = function(bSibling, aOverlays) {
		this._handleStopCutPaste();

		var oOverlay = aOverlays[0];
		var oNewContainerOverlay = this.getPlugins()["createContainer"].handleCreate(bSibling, oOverlay);

		if (this.getPlugins()["rename"]) {

			var oDelegate = {
				"onAfterRendering" : function() {
					// TODO : remove timeout
					setTimeout(function() {
						this.getPlugins()["rename"].startEdit(oNewContainerOverlay);
					}.bind(this), 0);
					oNewContainerOverlay.removeEventDelegate(oDelegate);
				}.bind(this)
			};

			oNewContainerOverlay.addEventDelegate(oDelegate);
		}

	};

	/**
	 * Function to handle renaming a label
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handleRename = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this.getPlugins()["rename"].startEdit(oOverlay);
	};

	/**
	 * Function to handle cutting an element
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handleCutElement = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this.getPlugins()["cutPaste"].cut(oOverlay);
	};

	/**
	 * Function to handle pasting an element
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handlePasteElement = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this.getPlugins()["cutPaste"].paste(oOverlay);
	};

	/**
	 * Handler function to stop cut and paste, because some other operation has started
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleStopCutPaste = function() {
		this.getPlugins()["cutPaste"].stopCutAndPaste();
	};

	/**
	 * Function to handle combining of elements
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleCombineElements = function() {
		this._handleStopCutPaste();

		var oSelectedElement = this.getPlugins()["contextMenu"].getContextElement();
		this.getPlugins()["combine"].handleCombine(oSelectedElement);
	};

	/**
	 * Function to handle ungrouping of elements
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleSplitElements = function() {
		this._handleStopCutPaste();

		var oSelectedElement = this.getPlugins()["contextMenu"].getContextElement();
		this.getPlugins()["split"].handleSplit(oSelectedElement);
	};

	/**
	 * Function to handle settings
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleSettings = function(aOverlays) {
		this.getPlugins()["settings"].handleSettings(aOverlays);
	};

	/**
	 * Get the Title of the Application from the manifest.json
	 *
	 * @private
	 * @returns {String} the application title or empty string
	 */
	RuntimeAuthoring.prototype._getApplicationTitle = function() {

		var sTitle = "";
		var oComponent = sap.ui.core.Component.getOwnerComponentFor(this._oRootControl);
		if (oComponent) {
			sTitle = oComponent.getMetadata().getManifestEntry("sap.app").title;
		}
		return sTitle;
	};

	/**
	 * Check if Changes exist
	 * @private
	 * @returns {Promise} Resolving to false means that no change check is required
	 */
	RuntimeAuthoring.prototype._checkChangesExist = function() {
		if (this._getFlexController().getComponentName().length > 0) {
			return this._getFlexController().getComponentChanges({currentLayer: this.getLayer()}).then(function(aAllLocalChanges) {
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
	 * Builds the navigation arguments object required to trigger the navigation
	 * using the CrossApplicationNavigation ushell service
	 * @param  {map} mParsedHash The parsed URL hash
	 * @return {map}             The argument map ("oArg" parameter of the "toExternal" function)
	 */
	RuntimeAuthoring.prototype._buildNavigationArguments = function(mParsedHash){
		return {
			target: {
				semanticObject : mParsedHash.semanticObject,
				action : mParsedHash.action,
				context : mParsedHash.contextRaw
			},
			params: mParsedHash.params,
			appSpecificRoute : mParsedHash.appSpecificRoute
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
	 * @param  {map} mParsedHash URL parsed hash
	 * @param  {sap.ushell.services.CrossApplicationNavigation} oCrossAppNav ushell service
	 * @return {Promise} resolving to true if reload was triggered
	 */
	RuntimeAuthoring.prototype._reloadWithPersonalizationChanges = function(mParsedHash, oCrossAppNav){
		if (this._hasCustomerLayerParameter(mParsedHash)) {
			delete mParsedHash.params[FL_MAX_LAYER_PARAM];
			// triggers the navigation without leaving FLP
			oCrossAppNav.toExternal(this._buildNavigationArguments(mParsedHash));
			return Promise.resolve(true);
		}
	};

	/**
	 * Handler for the message box warning the user that personalization changes exist
	 * and the app will be reloaded
	 * @return {Promise} Resolving when the user clicks on OK
	 */
	RuntimeAuthoring.prototype._handlePersonalizationMessageBoxOnStart = function() {
		return this._showMessage(
			MessageBox.Icon.INFORMATION,
			"HEADER_PERSONALIZATION_EXISTS",
			"MSG_PERSONALIZATION_EXISTS");
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
	 * Handler for the message box asking the user if the personalization changes
	 * should be restored after exiting RTA
	 * @return {Promise} Resolves to true if the user wants to restore personalization
	 */
	RuntimeAuthoring.prototype._handlePersonalizationMessageBoxOnExit = function() {
		return new Promise(function(resolve){
			var sMessage = this._getTextResources()
				.getText("MSG_LOAD_PERSONALIZATION_CHANGES");
			var sTitle = this._getTextResources()
				.getText("HEADER_LOAD_PERSONALIZATION_CHANGES");
			var sConfirmButtonText = this._getTextResources()
				.getText("MSG_PERSONALIZATION_CONFIRM_BUTTON_TEXT");
			var sCancelButtonText = this._getTextResources()
				.getText("MSG_PERSONALIZATION_CANCEL_BUTTON_TEXT");
			var fnCallback = function (sAction) {
				if (sAction === sConfirmButtonText) {
					return resolve(true);
				} else if (sAction === sCancelButtonText) {
					return resolve(false);
				}
			};

			MessageBox.confirm(sMessage, {
				icon: MessageBox.Icon.QUESTION,
				title : sTitle,
				actions : [sConfirmButtonText, sCancelButtonText],
				onClose : fnCallback
			});
		}.bind(this));
	};

	/**
	 * When exiting RTA and personalization changes exist, the user can choose to
	 * reload the app with personalization or stay in the app without the personalization
	 * @return {Promise} Resolving to false means that the reload is not necessary
	 */
	RuntimeAuthoring.prototype._handlePersonalizationChangesOnExit = function() {
		var oUshellContainer = Utils.getUshellContainer();
		sap.ui.getCore().getEventBus()
			.unsubscribe("sap.ushell.renderers.fiori2.Renderer", "appClosed", this._onAppClosed, this);
		if (oUshellContainer && this.getLayer() !== "USER") {
			// When working with RTA, the MaxLayer parameter will be present in the URL and must
			// be ignored in the decision to bring up the pop-up (ignoreMaxLayerParameter = true)
			return this._getFlexController().isPersonalized({ignoreMaxLayerParameter : true})
				.then(function(bIsPersonalized){
				if (bIsPersonalized) {
					return this._handlePersonalizationMessageBoxOnExit().then(function(bReloadWithPersonalization){
						if (bReloadWithPersonalization) {
							var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
							var mParsedHash = this._getURLParsedHash();
							if (oCrossAppNav.toExternal && mParsedHash){
								return this._reloadWithPersonalizationChanges(mParsedHash, oCrossAppNav);
							}
						}
					}.bind(this));
				}
			}.bind(this));
		} else {
			return Promise.resolve(false);
		}
	};

	RuntimeAuthoring.prototype._onModeChange = function(oEvent) {
		this.setMode(oEvent.getParameter('key'));
	};

	/**
	 * Setter for property `mode`
	 */
	RuntimeAuthoring.prototype.setMode = function (sNewMode) {
		if (this.getProperty('mode') !== sNewMode) {
			var oModeSwitcher = this._oToolsMenu.getControl('modeSwitcher');
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

	return RuntimeAuthoring;

}, /* bExport= */true);
