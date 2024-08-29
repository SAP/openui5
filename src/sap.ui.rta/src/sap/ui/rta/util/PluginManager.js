/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/base/util/values",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/iframe/AddIFrame",
	"sap/ui/rta/plugin/Combine",
	"sap/ui/rta/plugin/CompVariant",
	"sap/ui/rta/plugin/ControlVariant",
	"sap/ui/rta/plugin/CreateContainer",
	"sap/ui/rta/plugin/CutPaste",
	"sap/ui/rta/plugin/DragDrop",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/rta/plugin/Selection",
	"sap/ui/rta/plugin/Settings",
	"sap/ui/rta/plugin/Split",
	"sap/ui/rta/plugin/Stretch",
	"sap/ui/rta/plugin/LocalReset",
	"sap/ui/rta/plugin/Resize"
], function(
	isEmptyObject,
	values,
	ManagedObject,
	ContextMenuPlugin,
	ToolHooksPlugin,
	Layer,
	Settings,
	CommandFactory,
	AdditionalElementsPlugin,
	AddIFramePlugin,
	CombinePlugin,
	CompVariantPlugin,
	ControlVariantPlugin,
	CreateContainerPlugin,
	CutPastePlugin,
	RTADragDropPlugin,
	RemovePlugin,
	RTARenamePlugin,
	RTAElementMover,
	SelectionPlugin,
	SettingsPlugin,
	SplitPlugin,
	StretchPlugin,
	LocalResetPlugin,
	ResizePlugin
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.util.PluginManager
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.86
	 * @alias sap.ui.rta.util.PluginManager
	 */
	var PluginManager = ManagedObject.extend("sap.ui.rta.util.PluginManager", {
		metadata: {
			properties: {
				/**
				 * Map indicating plugins in to be loaded or in use by RuntimeAuthoring and DesignTime
				 */
				plugins: {
					type: "any",
					defaultValue: {}
				}
			}
		}
	});

	/**
	 * Called after PluginManager instance is initialised.
	 *
	 */
	PluginManager.prototype.init = function() {
		this.iEditableOverlaysCount = 0;
	};

	/**
	 * Returns the number of editable overlays
	 *
	 *
	 * @public
	 * @return {number} number of editable overlays
	 */
	PluginManager.prototype.getEditableOverlaysCount = function() {
		return this.iEditableOverlaysCount;
	};

	/**
	 * Returns (and creates) the default plugins of PluginManager
	 *
	 * These are AdditionalElements, ContextMenu, CreateContainer, CutPaste,
	 * DragDrop, Remove, Rename, Selection, Settings
	 *
	 * Method uses a local cache to hold the default plugins: Then on multiple access
	 * always the same instances get returned.
	 *
	 * @public
	 * @param {object} oFlexSettings - property bag for flex settings
	 * @return {Object<string,sap.ui.dt.plugin.Plugin>} map with plugins
	 */
	PluginManager.prototype.getDefaultPlugins = function(oFlexSettings) {
		if (!this._mDefaultPlugins) {
			this._oCommandFactory = new CommandFactory({
				flexSettings: oFlexSettings
			});

			this._mDefaultPlugins = {};

			this._mDefaultPlugins.selection = new SelectionPlugin({
				commandFactory: this._oCommandFactory,
				multiSelectionRequiredPlugins: [
					CombinePlugin.getMetadata().getName(),
					RemovePlugin.getMetadata().getName()
				],
				elementEditableChange: this.onElementEditableChange.bind(this)
			});

			this._oRTAElementMover = new RTAElementMover({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.dragDrop = new RTADragDropPlugin({
				elementMover: this._oRTAElementMover,
				commandFactory: this._oCommandFactory,
				dragStarted: this.handleStopCutPaste.bind(this)
			});

			this._mDefaultPlugins.rename = new RTARenamePlugin({
				commandFactory: this._oCommandFactory,
				editable: this.handleStopCutPaste.bind(this)
			});

			this._mDefaultPlugins.additionalElements = new AdditionalElementsPlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.createContainer = new CreateContainerPlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.remove = new RemovePlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.cutPaste = new CutPastePlugin({
				elementMover: this._oRTAElementMover,
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.settings = new SettingsPlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.combine = new CombinePlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.split = new SplitPlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.resize = new ResizePlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.contextMenu = new ContextMenuPlugin();

			this._mDefaultPlugins.stretch = new StretchPlugin();

			var oSettings = Settings.getInstanceOrUndef();
			if (oSettings && oSettings.isVariantAdaptationEnabled()) {
				this._mDefaultPlugins.compVariant = new CompVariantPlugin({
					commandFactory: this._oCommandFactory
				});
			}

			this._mDefaultPlugins.controlVariant = new ControlVariantPlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.addIFrame = new AddIFramePlugin({
				commandFactory: this._oCommandFactory
			});

			this._mDefaultPlugins.toolHooks = new ToolHooksPlugin();

			if (
				oFlexSettings.layer === Layer.CUSTOMER
				&& oSettings
				&& oSettings.isLocalResetEnabled()
			) {
				this._mDefaultPlugins.localReset = new LocalResetPlugin({
					commandFactory: this._oCommandFactory
				});
			}
		}

		return { ...this._mDefaultPlugins };
	};

	/**
	 * Prepares plugins for design time instantiation.
	 *
	 * @param {object} oFlexSettings - Property bag for flex settings
	 * @param {function} fnHandleElementModified - Handler function for element modified events
	 * @param {sap.ui.rta.command.Stack} oCommandStack - Command stack required in plugins
	 */
	PluginManager.prototype.preparePlugins = function(oFlexSettings, fnHandleElementModified, oCommandStack) {
		// Take default plugins if no plugins handed over
		if (isEmptyObject(this.getPlugins())) {
			this.setPlugins(this.getDefaultPlugins(oFlexSettings));
		} else {
			// Destroy default plugins instantiated but not in use
			this._destroyDefaultPlugins(this.getPlugins());
		}

		Object.keys(this.getPlugins()).forEach(function(sPluginName) {
			if (this.getPlugin(sPluginName).attachElementModified) {
				this.getPlugin(sPluginName).attachElementModified(fnHandleElementModified);
			}
		}.bind(this));

		this.provideCommandStack("settings", oCommandStack);
	};

	/**
	 * Returns a list of registered plugins
	 * @returns {array} list of plugins
	 */
	PluginManager.prototype.getPluginList = function() {
		return values(this.getPlugins());
	};

	/**
	 * Getter method for explicit plugin
	 * @param {string} sPluginName - Plugin name
	 * @returns {sap.ui.rta.plugin.Plugin} plugin
	 */
	PluginManager.prototype.getPlugin = function(sPluginName) {
		return this.getPlugins()[sPluginName];
	};

	/**
	 * Provides command stack to plugins.
	 * @param {string} sPluginName - Plugin name
	 * @param {sap.ui.rta.command.Stack} oCommandStack - Command stack required in plugins
	 */
	PluginManager.prototype.provideCommandStack = function(sPluginName, oCommandStack) {
		if (this.getPlugin(sPluginName)) {
			this.getPlugin(sPluginName).setCommandStack(oCommandStack);
		}
	};

	/**
	 * Increases or decreases the current number of editable Overlays.
	 * @param {sap.ui.base.Event} oEvent Event triggered by the 'editable' property change
	 * @private
	 */
	PluginManager.prototype.onElementEditableChange = function(oEvent) {
		var bEditable = oEvent.getParameter("editable");
		if (bEditable) {
			this.iEditableOverlaysCount += 1;
		} else {
			this.iEditableOverlaysCount -= 1;
		}
	};

	/**
	 * Handler for the stop cut and paste function.
	 */
	PluginManager.prototype.handleStopCutPaste = function() {
		var oCutPastePlugin = this.getPlugin("cutPaste");
		if (oCutPastePlugin) {
			oCutPastePlugin.stopCutAndPaste();
		}
	};

	PluginManager.prototype._destroyDefaultPlugins = function(mPluginsToKeep) {
		for (var sDefaultPluginName in this._mDefaultPlugins) {
			var oDefaultPlugin = this._mDefaultPlugins[sDefaultPluginName];

			if (oDefaultPlugin && !oDefaultPlugin.bIsDestroyed) {
				if (!mPluginsToKeep || mPluginsToKeep[sDefaultPluginName] !== oDefaultPlugin) {
					oDefaultPlugin.destroy();
				}
			}
		}
	};

	return PluginManager;
});