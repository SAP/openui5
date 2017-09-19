/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Settings.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils'
], function(Plugin, Utils) {
	"use strict";

	/**
	 * Constructor for a new Settings Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Settings allows trigger change of settings operations on the overlay
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.Settings
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Settings = Plugin.extend("sap.ui.rta.plugin.Settings", /** @lends sap.ui.rta.plugin.Settings.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {
				commandStack : {
					type : "any"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for editable
	 * @returns {boolean} true if it's editable
	 * @private
	 */
	Settings.prototype._isEditable = function(oOverlay) {
		if (!Utils.getRelevantContainerDesigntimeMetadata(oOverlay)) {
			return false;
		}

		var oSettingsAction = this.getAction(oOverlay);
		if (oSettingsAction && oSettingsAction.handler) {
			return this.hasStableId(oOverlay);
		}

		return false;
	};

	/**
	 * Checks if settings is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @returns {boolean} true if it's enabled
	 * @public
	 */
	Settings.prototype.isEnabled = function(oOverlay) {
		var oAction = this.getAction(oOverlay);
		if (!oAction) {
			return false;
		}

		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				return oAction.isEnabled(oOverlay.getElementInstance());
			} else {
				return oAction.isEnabled;
			}
		}
		return true;
	};

	Settings.prototype._getUnsavedChanges = function(sId, aChangeTypes) {
		var sElementId;

		var aUnsavedChanges = this.getCommandStack().getAllExecutedCommands().filter(function(oCommand) {
			sElementId = oCommand.getElementId();
			if (sElementId === sId && aChangeTypes.indexOf(oCommand.getChangeType()) >= 0) {
				return true;
			}
		}).map(function(oCommand) {
			return oCommand.getPreparedChange();
		});

		return aUnsavedChanges;
	};

	/**
	 * Retrieves the available actions from the DesignTime Metadata and creates
	 * the corresponding commands for them.
	 * TODO: support for multiple actions
	 * @param  {sap.ui.dt.ElementOverlay[]} aSelectedOverlays Target Overlays of the action
	 * @return {Promise}                   Returns promise resolving with the creation of the commands
	 */
	Settings.prototype.handler = function(aSelectedOverlays) {
		var oSettingsCommand, oAppDescriptorCommand, oCompositeCommand;
		var oElement = aSelectedOverlays[0].getElementInstance();
		var mPropertyBag = {
			getUnsavedChanges: this._getUnsavedChanges.bind(this),
			styleClass: Utils.getRtaStyleClassName()
		};

		return aSelectedOverlays[0].getDesignTimeMetadata().getAction("settings").handler(oElement, mPropertyBag).then(function(aChanges) {
			oCompositeCommand = this.getCommandFactory().getCommandFor(oElement, "composite");
			aChanges.forEach(function(mChange) {
				var mChangeSpecificData = mChange.changeSpecificData;
				// Flex Change
				if (mChangeSpecificData.changeType){
					var sVariantManagementReference;
					var mSelectorControl = mChange.selectorControl;
					var oChangeHandler = this._getChangeHandlerForControlType(mSelectorControl.controlType, mChangeSpecificData.changeType);
					if (aSelectedOverlays[0].getVariantManagement && oChangeHandler && oChangeHandler.revertChange) {
						sVariantManagementReference = aSelectedOverlays[0].getVariantManagement();
					}
					oSettingsCommand = this.getCommandFactory().getCommandFor(
						mSelectorControl,
						"settings",
						mChangeSpecificData,
						undefined,
						sVariantManagementReference);
					oCompositeCommand.addCommand(oSettingsCommand);
				// App Descriptor Change
				} else if (mChangeSpecificData.appDescriptorChangeType){
					var oComponent = mChange.appComponent;
					var mManifest = oComponent.getManifest();
					var sReference = mManifest["sap.app"].id;
					oAppDescriptorCommand = this.getCommandFactory().getCommandFor(
						oElement,
						"appDescriptor",
						{
							reference : sReference,
							appComponent : oComponent,
							changeType : mChangeSpecificData.appDescriptorChangeType,
							parameters : mChangeSpecificData.content.parameters,
							texts : mChangeSpecificData.content.texts
						}
					);
					oCompositeCommand.addCommand(oAppDescriptorCommand);
				}
			}, this);
			this.fireElementModified({
				"command" : oCompositeCommand
			});
		}.bind(this))['catch'](function(oError) {
			if (oError) {
				throw oError;
			}
		});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * TODO: Support for multiple items (multiple actions)
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	Settings.prototype.getMenuItems = function(oOverlay){
		return this._getMenuItems(oOverlay, {pluginId : "CTX_SETTINGS", rank : 110});
	};

	/**
	 * Get the name of the action related to this plugin.
	 * TODO: Support for multiple actions
	 * @return {string} Returns the action name
	 */
	Settings.prototype.getActionName = function(){
		return "settings";
	};

	return Settings;
}, /* bExport= */true);
