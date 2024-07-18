/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/rta/command/CompositeCommand",
	"sap/m/MessageToast",
	"sap/ui/dt/OverlayRegistry"
], function(
	Element,
	Lib,
	Plugin,
	DtUtil,
	FlUtils,
	ControlVariantApplyAPI,
	LocalResetAPI,
	CompositeCommand,
	MessageToast,
	OverlayRegistry
) {
	"use strict";

	function getCurrentVariant(oVariantModel, sVariantManagement) {
		return sVariantManagement
			? oVariantModel.getCurrentVariantReference(sVariantManagement)
			: "";
	}

	/**
	 * Constructor for a new LocalReset plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.90
	 * @alias sap.ui.rta.plugin.LocalReset
	 */
	var LocalReset = Plugin.extend("sap.ui.rta.plugin.LocalReset", /** @lends sap.ui.rta.plugin.LocalReset.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	LocalReset.prototype._isEditable = function(oOverlay) {
		if (!this.hasStableId(oOverlay)) {
			return false;
		}
		var vLocalResetAction = this.getAction(oOverlay);
		return !!vLocalResetAction;
	};

	/**
	 * @override
	 */
	LocalReset.prototype.isEnabled = function(aElementOverlays) {
		if (aElementOverlays.length !== 1) {
			return false;
		}
		var oElementOverlay = aElementOverlays[0];
		var oElement = oElementOverlay.getElement();
		var oAction = this.getAction(oElementOverlay);
		if (!oAction) {
			return false;
		}

		var bIsActionEnabled = true;
		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				bIsActionEnabled = oAction.isEnabled(oElement);
			} else {
				bIsActionEnabled = oAction.isEnabled;
			}
		}

		var oRelevantElement = oAction.changeOnRelevantContainer ? oElementOverlay.getRelevantContainer() : oElement;
		var oRelevantOverlay = OverlayRegistry.getOverlay(oRelevantElement);
		var oAppComponent = FlUtils.getAppComponentForControl(oRelevantElement);
		var oVariantModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		var sCurrentVariant = getCurrentVariant(oVariantModel, this.getVariantManagementReference(oRelevantOverlay));
		return (
			bIsActionEnabled
			&& LocalResetAPI.isResetEnabled(
				oRelevantElement,
				{
					layer: this.getCommandFactory().getFlexSettings().layer,
					currentVariant: sCurrentVariant
				}
			)
		);
	};

	/**
	 * Retrieves the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]} vElementOverlays - Target overlay(s)
	 * @return {object[]} Array of the items with required data
	 */
	LocalReset.prototype.getMenuItems = function(vElementOverlays) {
		return this._getMenuItems(vElementOverlays, {
			pluginId: "CTX_LOCAL_RESET",
			icon: "sap-icon://reset"
		});
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @return {string} Action name
	 */
	LocalReset.prototype.getActionName = function() {
		return "localReset";
	};

	LocalReset.prototype.handler = function(aOverlays) {
		var oOverlay = aOverlays[0];
		var oElement = oOverlay.getElement();
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var sVariantManagementReference = this.getVariantManagementReference(oOverlay);
		var oAppComponent = FlUtils.getAppComponentForControl(oElement);
		var oVariantModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		var sCurrentVariant = getCurrentVariant(oVariantModel, sVariantManagementReference);
		var bHasVariant = !!sCurrentVariant;
		var oVariantManagementControl = bHasVariant
			? oAppComponent.byId(sVariantManagementReference) || Element.getElementById(sVariantManagementReference)
			: undefined;
		var oCommandFactory = this.getCommandFactory();

		var oCompositeCommand = new CompositeCommand();

		return Promise.all([
			oCommandFactory.getCommandFor(
				oElement,
				"localReset",
				{
					currentVariant: sCurrentVariant
				},
				oDesignTimeMetadata,
				sVariantManagementReference
			),
			bHasVariant && oCommandFactory.getCommandFor(
				oVariantManagementControl,
				"save",
				{
					model: oVariantModel
				},
				oDesignTimeMetadata,
				sVariantManagementReference
			)
		].filter(Boolean))
		.then(function(aCommands) {
			aCommands.forEach(function(oCommand) {
				oCompositeCommand.addCommand(oCommand);
			});
			this.fireElementModified({
				command: oCompositeCommand
			});
			if (bHasVariant) {
				var sMessage = Lib.getResourceBundleFor("sap.ui.rta").getText("MSG_LOCAL_RESET_VARIANT_SAVE");
				MessageToast.show(sMessage, {
					duration: 5000
				});
			}
		}.bind(this))
		.catch(function(vError) {
			throw DtUtil.propagateError(
				vError,
				"LocalReset#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin"
			);
		});
	};

	return LocalReset;
});
