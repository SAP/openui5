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
		"sap/ui/rta/Utils",
		"sap/ui/fl/transport/Transports",
		"sap/ui/fl/transport/TransportSelection",
		"sap/ui/fl/Utils",
		"sap/ui/fl/registry/Settings",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/rta/util/PopupManager",
		"sap/ui/core/BusyIndicator",
		"sap/ui/dt/DOMUtil",
		"sap/ui/rta/util/StylesLoader",
		"sap/ui/rta/appVariant/Feature",
		"sap/ui/Device"
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
		StylesLoader,
		RtaAppVariantFeature,
		Device
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
			this.iEditableOverlaysCount = 0;

			this.addDependent(new PopupManager(), 'popupManager');

			if (this.getShowToolbars()) {
				this.getPopupManager().attachOpen(this.onPopupOpen, this);
				this.getPopupManager().attachClose(this.onPopupClose, this);
			}
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

			// Context Menu
			this._mDefaultPlugins["contextMenu"] = new ContextMenuPlugin({
				styleClass: Utils.getRtaStyleClassName()
			});

			// Tab Handling
			this._mDefaultPlugins["tabHandling"] = new TabHandlingPlugin();
		}

		return jQuery.extend({}, this._mDefaultPlugins);
	};


	RuntimeAuthoring.prototype.addDependent = function (oObject, sName) {
		if (!(sName in this._dependents)) {
			if (sName) {
				this['get' + jQuery.sap.charToUpperCase(sName, 0)] = this.getDependent.bind(this, sName);
			}
			this._dependents[sName || oObject.getId()] = oObject;
		}
	};

	RuntimeAuthoring.prototype.getDependent = function(sName) {
		return this._dependents[sName];
	};

	RuntimeAuthoring.prototype.getDependents = function() {
		return this._dependents;
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

		mFlexSettings = jQuery.extend({}, this.getFlexSettings(), mFlexSettings);

		if (aUriLayer && aUriLayer.length > 0) {
			mFlexSettings.layer = aUriLayer[0];
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
		// Create DesignTime
		if (!this._oDesignTime) {
			this._oRootControl = sap.ui.getCore().byId(this.getRootControl());
			//Check if the application has personalized changes and reload without them
			return this._handlePersonalizationChangesOnStart()
			.then(function(bReloadTriggered){
				if (bReloadTriggered) {
					return Promise.reject(false);
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
			.catch(function(vError) {
				if (vError) {
					return Promise.reject(vError);
				}
			});
		}
	};

	RuntimeAuthoring.prototype._getPublishAndAppVariantSupportVisibility = function() {
		return FlexSettings.getInstance().then(function(oSettings) {
			return RtaAppVariantFeature.isPlatFormEnabled(this.getLayer(), this._oRootControl).then(function(bIsAppVariantSupported) {
				return [!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured(), bIsAppVariantSupported];
			});
		}.bind(this))
		.catch(function(oError) {
			return false;
		});
	};

	var fnShowTechnicalError = function(vError) {
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
			.then(this._closeToolbar.bind(this))
			.then(bSkipCheckPersChanges ? Promise.resolve() : this._handlePersonalizationChangesOnExit.bind(this))
			.then(function(){
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
		// if for example the addField Dialog/transport/reset Popup is open, we don't want the user to be able to undo/redo
		var bMacintosh = Device.os.macintosh;
		var bFocusInsideOverlayContainer = Overlay.getOverlayContainer().contains(document.activeElement);
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
					appVariantFeaturesSupported: bIsAppVariantSupported,
					//events
					exit: this.stop.bind(this, false, false),
					transport: this._onTransport.bind(this),
					restore: this._onRestore.bind(this),
					undo: this._onUndo.bind(this),
					redo: this._onRedo.bind(this),
					modeChange: this._onModeChange.bind(this),
					manageApps: RtaAppVariantFeature.onGetOverview.bind(null, this._oRootControl),
					saveAs: RtaAppVariantFeature.onSaveAs.bind(null, this._oRootControl, null)
				}), 'toolbar');
			}

			this._checkChangesExist().then(function(bResult){
				this._bChangesExist = bResult;
				this.getToolbar().setPublishEnabled(bResult);
				this.getToolbar().setRestoreEnabled(bResult);
			}.bind(this));
		}
	};

	/**
	 * Exit Runtime Authoring - destroy all controls and plugins
	 *
	 * @protected
	 */
	RuntimeAuthoring.prototype.exit = function() {
		jQuery.map(this._dependents, function (oDependent) {
			//Destroy should be called with supress invalidate = true here to prevent static UI Area invalidation
			oDependent.destroy(true);
		});

		if (this._oDesignTime) {
			jQuery(Overlay.getOverlayContainer()).removeClass("sapUiRta");
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

		window.onbeforeunload = this._oldUnloadHandler;
	};

	/**
	 * Function to handle ABAP transport of the changes
	 * @return {Promise} Returns a Promise processing the transport of changes
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
	   return new TransportSelection().openTransportSelection(null, this._oRootControl, Utils.getRtaStyleClassName());
	};

	/**
	 * Create and apply changes
	 *
	 * Function is copied from FormP13nHandler. We need all changes for various controls.
	 * The function is used in the transport handling.
	 *
	 * @private
	 * @param {array} aChangeSpecificData - array of objects with change specific data
	 * @returns {Promise} promise that resolves with no parameters
	 */
	RuntimeAuthoring.prototype._createAndApplyChanges = function(aChangeSpecificData) {
		var aPromises = [];
		return Promise.resolve()

		.then(function() {
			function fnValidChanges(oChangeSpecificData) {
				return oChangeSpecificData && oChangeSpecificData.selector && oChangeSpecificData.selector.id;
			}
			aChangeSpecificData.filter(fnValidChanges).forEach(function(oChangeSpecificData) {
				var oControl = sap.ui.getCore().byId(oChangeSpecificData.selector.id);
				var oFlexController = this._getFlexController();
				aPromises.push(oFlexController.createAndApplyChange.bind(oFlexController, oChangeSpecificData, oControl));
			}.bind(this));
			return FlexUtils.execPromiseQueueSequentially(aPromises);
		}.bind(this))

		.catch(function(oError) {
			FlexUtils.log.error("Create and apply error: " + oError);
			return oError;
		})

		.then(function(oError) {
			return this._getFlexController().saveAll().then(function() {
				if (oError) {
					throw oError;
				}
			});
		}.bind(this))

		.catch(function(oError) {
			FlexUtils.log.error("Create and apply and/or save error: " + oError);
			return this._showMessage(MessageBox.Icon.ERROR, "HEADER_TRANSPORT_APPLYSAVE_ERROR", "MSG_TRANSPORT_APPLYSAVE_ERROR", oError);
		}.bind(this));
	};

	/**
	 * Delete all changes for current layer and root control's component
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._deleteChanges = function() {
		var oTransportSelection = new TransportSelection();
		var sCurrentLayer = this.getLayer();

		// all new changes from commands that are only in our stack and not yet in the LREP, filtered by them having a change
		var aUnsavedChanges = this.getCommandStack().getAllExecutedCommands().reduce(function(aChanges, oCommand) {
			if (oCommand.getPreparedChange) {
				aChanges.push(oCommand.getPreparedChange());
			} else if (oCommand.getVariantChange && oCommand.getVariantChange()) {
				aChanges.push(oCommand.getVariantChange());
			}
			return aChanges;
		}, []);

		this._getFlexController().getComponentChanges({currentLayer: sCurrentLayer}).then(function(aChanges) {
			return FlexSettings.getInstance(FlexUtils.getComponentClassName(this._oRootControl)).then(function(oSettings) {
				if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
					return oTransportSelection.setTransports(aChanges, this._oRootControl);
				}
			}.bind(this)).then(function() {
				BusyIndicator.show(0);
				aChanges = aChanges.concat(aUnsavedChanges);
				return this._getFlexController().discardChanges(aChanges, sCurrentLayer === "USER");
			}.bind(this)).then(function() {
				BusyIndicator.hide();
				this._reloadPage();
			}.bind(this));
		}.bind(this))["catch"](function(oError) {
			BusyIndicator.hide();
			return this._showMessage(MessageBox.Icon.ERROR, "HEADER_RESTORE_FAILED", "MSG_RESTORE_FAILED", oError);
		}.bind(this));
	};

	/**
	 * Reloads the page.
	 * @private
	 */
	RuntimeAuthoring.prototype._reloadPage = function(){
		window.location.reload();
	};

	/**
	 * Shows a message box.
	 * @param  {sap.m.MessageBox.Icon} oMessageType The type of the message box (icon to be displayed)
	 * @param  {string} sTitleKey The text key for the title of the message box
	 * @param  {string} sMessageKey The text key for the message of the message box
	 * @param  {any} oError Optional - If an error is passed on, the message box text is derived from it
	 * @return {Promise} Promise displaying the message box; resolves when it is closed
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessage = function(oMessageType, sTitleKey, sMessageKey, oError) {
		var sMessage = this._getTextResources().getText(sMessageKey, oError ? [oError.message || oError] : undefined);
		var sTitle = this._getTextResources().getText(sTitleKey);

		return new Promise(function(resolve) {
			MessageBox.show(sMessage, {
				icon: oMessageType,
				title: sTitle,
				onClose: resolve,
				styleClass: Utils.getRtaStyleClassName()
			});
		});
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
	 * Prepare all changes and assign them to an existing transport.
	 *
	 * @private
	 * @param {Object} mTransportInfo - Map containing the package name and the transport
	 * @param {string} mTransportInfo.packageName - Name of the package
 	 * @param {string} mTransportInfo.transport - ID of the transport
	 * @returns {Promise} Returns a Promise which resolves without parameters
	 */
	RuntimeAuthoring.prototype._transportAllLocalChanges = function(mTransportInfo) {
		return this._getFlexController().getComponentChanges({currentLayer: this.getLayer()}).then(function(aAllLocalChanges) {

			// Pass list of changes to be transported with transport request to backend
			var oTransports = new Transports();
			var aTransportData = oTransports._convertToChangeTransportData(aAllLocalChanges);
			var oTransportParams = {};
			//packageName is '' in CUSTOMER layer (no package input field in transport dialog)
			oTransportParams.package = mTransportInfo.packageName;
			oTransportParams.transportId = mTransportInfo.transport;
			oTransportParams.changeIds = aTransportData;

			return oTransports.makeChangesTransportable(oTransportParams).then(function() {

				// remove the $TMP package from all changes; has been done on the server as well,
				// but is not reflected in the client cache until the application is reloaded
				aAllLocalChanges.forEach(function(oChange) {

					if (oChange.getPackage() === '$TMP') {
						var oDefinition = oChange.getDefinition();
						oDefinition.packageName = mTransportInfo.packageName;
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
	 * Checks whether the two parent information maps are equal.
	 *
	 * @param {Object}
	 *          oInfo1 First map of information
	 * @param {Object}
	 *          oInfo2 Second map of information
	 * @return {boolean} Returns true if they are equal, false otherwise
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
	 * Function to automatically start the rename plugin on a container when it gets created
	 * @param {object} vAction       The create action from designtime metadata
	 * @param {string} sNewControlID The id of the newly created container
	 */
	RuntimeAuthoring.prototype._setRenameOnCreatedContainer = function(vAction, sNewControlID) {
		var oNewContainerOverlay = this.getPlugins()["createContainer"].getCreatedContainerOverlay(vAction, sNewControlID);
		if (oNewContainerOverlay) {
			oNewContainerOverlay.setSelected(true);

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
		}
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
			return this.getCommandStack().pushAndExecute(oCommand).then(function(){
				if (vAction && sNewControlID){
					this._setRenameOnCreatedContainer(vAction, sNewControlID);
				}
			}.bind(this));
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
				onClose : fnCallback,
				styleClass: Utils.getRtaStyleClassName()
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

	return RuntimeAuthoring;

}, /* bExport= */true);
