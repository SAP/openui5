/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Settings.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils'
], function(
	Plugin,
	Utils) {
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
		var vSettingsAction = this.getAction(oOverlay);
		// If no additional actions are defined in settings, a handler must be present to make it available
		if (vSettingsAction) {
			if (vSettingsAction.handler) {
				return this.hasStableId(oOverlay);
			} else {
				var bHandlerFound = Object.keys(vSettingsAction).some(function(sSettingsAction) {
					return vSettingsAction[sSettingsAction].handler;
				});
				if (bHandlerFound) {
					return this.hasStableId(oOverlay);
				}
			}
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
				return oAction.isEnabled(oOverlay.getElement());
			} else {
				return oAction.isEnabled;
			}
		}
		return true;
	};

	Settings.prototype._getUnsavedChanges = function(sId, aChangeTypes) {
		var sElementId;

		var aUnsavedChanges = this.getCommandStack().getAllExecutedCommands().filter(function(oCommand) {
			sElementId = oCommand.getElementId && oCommand.getElementId() || oCommand.getElement && oCommand.getElement().getId();
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
	 * @param  {sap.ui.dt.ElementOverlay[]} aSelectedOverlays Target Overlays of the action
	 * @param  {object} mPropertyBag Property bag
	 * @param  {function} [mPropertyBag.fnHandler] Handler function for the case of multiple settings actions
	 * @return {Promise} Returns promise resolving with the creation of the commands
	 */
	Settings.prototype.handler = function(aSelectedOverlays, mPropertyBag) {
		mPropertyBag = mPropertyBag || {};
		var oSettingsCommand, oAppDescriptorCommand, oCompositeCommand;
		var oElement = aSelectedOverlays[0].getElement();
		var fnHandler = mPropertyBag.fnHandler;

		if (!fnHandler){
			fnHandler = aSelectedOverlays[0].getDesignTimeMetadata().getAction("settings").handler;
			if (!fnHandler) {
				throw new Error("Handler not found for settings action");
			}
		}
		mPropertyBag.getUnsavedChanges = this._getUnsavedChanges.bind(this);
		mPropertyBag.styleClass = Utils.getRtaStyleClassName();

		return fnHandler(oElement, mPropertyBag).then(function(aChanges) {
			if (aChanges.length > 0){
				oCompositeCommand = this.getCommandFactory().getCommandFor(oElement, "composite");
				aChanges.forEach(function(mChange) {
					var mChangeSpecificData = mChange.changeSpecificData;
					// Flex Change
					if (mChangeSpecificData.changeType){
						var sVariantManagementReference;
						var vSelectorControl = mChange.selectorControl;
						var sControlType;
						var oControl;
						if (vSelectorControl.controlType){
							sControlType = vSelectorControl.controlType;
						} else {
							oControl = vSelectorControl;
						}
						var oChangeHandler = this._getChangeHandler(mChangeSpecificData.changeType, oControl, sControlType);
						if (aSelectedOverlays[0].getVariantManagement && oChangeHandler && oChangeHandler.revertChange) {
							sVariantManagementReference = aSelectedOverlays[0].getVariantManagement();
						}
						oSettingsCommand = this.getCommandFactory().getCommandFor(
							vSelectorControl,
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
				if (oCompositeCommand.getCommands().length > 0){
					this.fireElementModified({
						"command" : oCompositeCommand
					});
				}
			}
		}.bind(this))['catch'](function(oError) {
			if (oError) {
				throw oError;
			}
		});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * If multiple actions are defined for Settings, it returns multiple menu items.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	Settings.prototype.getMenuItems = function(oOverlay){
		var vSettingsActions = this.getAction(oOverlay);
		var iRank = 110;
		var sPluginId = "CTX_SETTINGS";

		if (vSettingsActions) {
			// Only one action: simply return settings entry as usual
			if (vSettingsActions.handler) {
				return this._getMenuItems(oOverlay, {pluginId : sPluginId, rank : iRank});
			// Multiple actions: return one menu item for each action
			} else {
				var aMenuItems = [];
				var aSettingsActions = Object.keys(vSettingsActions);
				var iActionCounter = 0;
				aSettingsActions.forEach(function(sSettingsAction){
					var oSettingsAction = vSettingsActions[sSettingsAction],
						sActionText = this.getActionText(oOverlay, oSettingsAction, oSettingsAction.name);
					if (oSettingsAction.handler){
						aMenuItems.push({
							id : sPluginId + iActionCounter,
							text : sActionText,
							enabled : oSettingsAction.isEnabled && oSettingsAction.isEnabled.bind(this, oOverlay.getElement()),
							handler : function(fnHandler, aOverlays, mPropertyBag){
								mPropertyBag = mPropertyBag || {};
								mPropertyBag.fnHandler = fnHandler;
								return this.handler(aOverlays, mPropertyBag);
							}.bind(this, oSettingsAction.handler),
							rank : iRank + iActionCounter
						});
						iActionCounter++;
					} else {
						jQuery.sap.log.warning("Handler not found for settings action '" + sActionText + "'");
					}
				}.bind(this));
				return aMenuItems;
			}
		}
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Settings.prototype.getActionName = function(){
		return "settings";
	};

	return Settings;
}, /* bExport= */true);
