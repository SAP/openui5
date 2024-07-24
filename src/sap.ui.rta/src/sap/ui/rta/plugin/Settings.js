/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/base/Log"
], function(
	Plugin,
	Utils,
	DtUtil,
	BaseLog
) {
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
	 */
	var Settings = Plugin.extend("sap.ui.rta.plugin.Settings", /** @lends sap.ui.rta.plugin.Settings.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				commandStack: {
					type: "any"
				}
			},
			associations: {},
			events: {}
		}
	});

	var sPluginId = "CTX_SETTINGS";

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
			}

			var bHandlerAndStableIdFound = Object.keys(vSettingsAction).some(function(sSettingsAction) {
				var oSettingsAction = vSettingsAction[sSettingsAction];
				return oSettingsAction.handler && this._checkRelevantContainerStableID(oSettingsAction, oOverlay);
			}.bind(this));
			if (bHandlerAndStableIdFound) {
				return this.hasStableId(oOverlay);
			}
		}

		return false;
	};

	/**
	 * Checks if settings is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} true if it's enabled
	 * @public
	 */
	Settings.prototype.isEnabled = function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		const oAction = this.getAction(oResponsibleElementOverlay);
		if (!oAction) {
			return false;
		}

		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				return oAction.isEnabled(oResponsibleElementOverlay.getElement());
			}
			return oAction.isEnabled;
		}
		return true;
	};

	Settings.prototype._getUnsavedChanges = function(sId, aChangeTypes) {
		var sElementId;

		var aUnsavedChanges = this.getCommandStack().getAllExecutedCommands().filter(function(oCommand) {
			sElementId = oCommand.getElementId && oCommand.getElementId() || oCommand.getElement && oCommand.getElement().getId();
			return sElementId === sId && aChangeTypes.indexOf(oCommand.getChangeType()) >= 0;
		}).map(function(oCommand) {
			return oCommand.getPreparedChange();
		});

		return aUnsavedChanges;
	};

	Settings.prototype._handleFlexChangeCommand = function(mChange, aSelectedOverlays, oCompositeCommand, oSettingsAction) {
		var mChangeSpecificData = mChange.changeSpecificData;
		var sVariantManagementReference;
		// temporarily support both
		var vSelector = mChange.selectorElement || mChange.selectorControl;
		var sControlType;
		var oControl;

		if (vSelector.controlType) {
			sControlType = vSelector.controlType;
		} else {
			oControl = vSelector;
		}

		return this.hasChangeHandler(mChangeSpecificData.changeType, oControl, sControlType)
		.then(function(bHasChangeHandler) {
			if (aSelectedOverlays[0].getVariantManagement && bHasChangeHandler && !oSettingsAction.CAUTION_variantIndependent) {
				sVariantManagementReference = aSelectedOverlays[0].getVariantManagement();
			}
			return this.getCommandFactory().getCommandFor(
				vSelector,
				"settings",
				mChangeSpecificData,
				undefined,
				sVariantManagementReference
			);
		}.bind(this))
		.then(function(oSettingsCommand) {
			var bRuntimeOnly = oSettingsAction.runtimeOnly;
			if (oSettingsCommand && bRuntimeOnly) {
				oSettingsCommand.setRuntimeOnly(bRuntimeOnly);
			}
			return oCompositeCommand.addCommand(oSettingsCommand);
		});
	};

	Settings.prototype._handleAppDescriptorChangeCommand = function(mChange, oElement, oCompositeCommand) {
		var mChangeSpecificData = mChange.changeSpecificData;
		var oComponent = mChange.appComponent;
		var mManifest = oComponent.getManifest();
		var sReference = mManifest["sap.app"].id;

		return this.getCommandFactory().getCommandFor(
			oElement,
			"appDescriptor",
			{
				reference: sReference,
				appComponent: oComponent,
				changeType: mChangeSpecificData.appDescriptorChangeType,
				parameters: mChangeSpecificData.content.parameters,
				texts: mChangeSpecificData.content.texts
			}
		)
		.then(function(oAppDescriptorCommand) {
			return oCompositeCommand.addCommand(oAppDescriptorCommand);
		});
	};

	Settings.prototype._handleCompositeCommand = function(aElementOverlays, oElement, aChanges, oSettingsAction) {
		var oCompositeCommand;

		return this.getCommandFactory().getCommandFor(oElement, "composite")

		.then(function(_oCompositeCommand) {
			oCompositeCommand = _oCompositeCommand;
		})

		.then(function() {
			return aChanges.map(function(mChange) {
				var mChangeSpecificData = mChange.changeSpecificData;
				// Flex Change
				if (mChangeSpecificData.changeType) {
					return this._handleFlexChangeCommand(mChange, aElementOverlays, oCompositeCommand, oSettingsAction);
				// App Descriptor Change
				} else if (mChangeSpecificData.appDescriptorChangeType) {
					return this._handleAppDescriptorChangeCommand(mChange, oElement, oCompositeCommand);
				}
				return undefined;
			}, this);
		}.bind(this))

		.then(function(aPromises) {
			return Promise.all(aPromises);
		})

		.then(function() {
			if (oCompositeCommand.getCommands().length > 0) {
				this.fireElementModified({
					command: oCompositeCommand
				});
			}
		}.bind(this));
	};

	/**
	 * Retrieves the available actions from the DesignTime Metadata and creates
	 * the corresponding commands for them.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target Overlays of the action
	 * @param {object} mPropertyBag - Property bag
	 * @param {function} [mPropertyBag.fnHandler] - Handler function for the case of multiple settings actions
	 * @param {object} [oSettingsAction] - The action object defined in the designtime
	 * @return {Promise} Returns promise resolving with the creation of the commands
	 */
	Settings.prototype.handler = function(aElementOverlays, mPropertyBag, oSettingsAction) {
		mPropertyBag ||= {};
		var oElement = aElementOverlays[0].getElement();
		var {fnHandler} = mPropertyBag;

		fnHandler ||= aElementOverlays[0].getDesignTimeMetadata().getAction("settings").handler;
		if (!fnHandler) {
			throw new Error("Handler not found for settings action");
		}
		mPropertyBag.getUnsavedChanges = this._getUnsavedChanges.bind(this);
		mPropertyBag.styleClass = Utils.getRtaStyleClassName();

		return fnHandler(oElement, mPropertyBag)

		.then(function(aChanges) {
			if (aChanges.length > 0) {
				return this._handleCompositeCommand(aElementOverlays, oElement, aChanges, oSettingsAction);
			}
			return undefined;
		}.bind(this))

		.catch(function(vError) {
			throw DtUtil.propagateError(
				vError,
				"Settings#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin"
			);
		});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * If multiple actions are defined for Settings, it returns multiple menu items.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} array of the items with required data
	 */
	Settings.prototype.getMenuItems = async function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		let vSettingsActions = this.getAction(oResponsibleElementOverlay);

		const aMenuItems = [];
		if (vSettingsActions) {
			const iRank = this.getRank("CTX_SETTINGS");

			if (vSettingsActions.handler) {
				vSettingsActions = {
					settings: vSettingsActions
				};
			}
			if (this._isEditableByPlugin(oResponsibleElementOverlay) === undefined) {
				// The responsibleElement editableByPlugin state was not evaluated yet e.g. because it
				// has no visible geometry, thus evaluateEditable now
				await this.evaluateEditable([oResponsibleElementOverlay], { onRegistration: false });
			}
			const aSettingsActions = Object.keys(vSettingsActions);
			aSettingsActions.forEach(function(sSettingsAction, iIndex, aActions) {
				const oSettingsAction = vSettingsActions[sSettingsAction];
				if (
					oSettingsAction.handler
					&& this._checkRelevantContainerStableID(oSettingsAction, oResponsibleElementOverlay)
					&& this.isAvailable([oResponsibleElementOverlay])
				) {
					const bSingleAction = aActions.length === 1;

					aMenuItems.push({
						id: bSingleAction ? sPluginId : sPluginId + iIndex,
						rank: bSingleAction ? iRank : iRank + iIndex,
						text: this.getActionText(oResponsibleElementOverlay, oSettingsAction, sPluginId),
						icon: getActionIcon(oSettingsAction),
						enabled: (
							typeof oSettingsAction.isEnabled === "function"
							&& function(aElementOverlays) {
								return oSettingsAction.isEnabled(aElementOverlays[0].getElement());
							}
							|| oSettingsAction.isEnabled
							|| this.isEnabled([oResponsibleElementOverlay])
						),
						handler: function(fnHandler, aElementOverlays, mPropertyBag) {
							mPropertyBag ||= {};
							mPropertyBag.fnHandler = fnHandler;
							return this.handler(aElementOverlays, mPropertyBag, oSettingsAction);
						}.bind(this, oSettingsAction.handler),
						submenu: formatSubMenuItems(oSettingsAction.submenu)
					});
				} else {
					BaseLog.warning(`Handler not found for settings action '${sSettingsAction}' or relevant container has no stable id`);
				}
			}, this);
		}

		return aMenuItems;
	};

	function formatSubMenuItems(aSubMenu) {
		if (aSubMenu) {
			return aSubMenu.map(function(oSubMenu, iIndex) {
				return {
					id: oSubMenu.key || `${sPluginId}_SUB_${iIndex}`,
					icon: oSubMenu.icon || "blank",
					text: oSubMenu.name || "",
					enabled: oSubMenu.hasOwnProperty("enabled") ? oSubMenu.enabled : true
				};
			});
		}
		return undefined;
	}

	function getActionIcon(oSettingsAction) {
		var sDefaultSettingIcon = "sap-icon://key-user-settings";
		var sActionIcon = oSettingsAction.icon;
		if (!sActionIcon) {
			return sDefaultSettingIcon;
		}
		if (typeof sActionIcon !== "string") {
			BaseLog.error("Icon setting for settingsAction should be a string");
			return sDefaultSettingIcon;
		}
		return sActionIcon;
	}

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Settings.prototype.getActionName = function() {
		return "settings";
	};

	return Settings;
});