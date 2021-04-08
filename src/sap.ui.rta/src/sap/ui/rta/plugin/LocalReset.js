/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/LocalResetAPI"
], function(
	Plugin,
	DtUtil,
	FlUtils,
	LocalResetAPI
) {
	"use strict";

	function getCurrentVariant(oAppComponent, sVariantManagement) {
		var oVariantModel = oAppComponent.getModel(FlUtils.VARIANT_MODEL_NAME);
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
	 * @experimental Since 1.90. This class is experimental and provides only limited functionality. Also the API might be changed in future.
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
	LocalReset.prototype._isEditable = function (oOverlay) {
		var vLocalResetAction = this.getAction(oOverlay);
		return !!vLocalResetAction;
	};

	/**
	 * @override
	 */
	LocalReset.prototype.isEnabled = function (aElementOverlays) {
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

		var oAppComponent = FlUtils.getAppComponentForControl(oElement);
		var sCurrentVariant = getCurrentVariant(oAppComponent, this.getVariantManagementReference(oElementOverlay));
		return (
			bIsActionEnabled
			&& LocalResetAPI.isResetEnabled(
				oElement,
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
	LocalReset.prototype.getMenuItems = function (vElementOverlays) {
		return this._getMenuItems(vElementOverlays, { pluginId: "CTX_LOCAL_RESET", rank: 61, icon: "sap-icon://reset" });
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
		var sCurrentVariant = getCurrentVariant(oAppComponent, sVariantManagementReference);

		return this.getCommandFactory().getCommandFor(
			oElement,
			"localReset",
			{
				currentVariant: sCurrentVariant
			},
			oDesignTimeMetadata,
			sVariantManagementReference
		)
			.then(function(oCommand) {
				this.fireElementModified({
					command: oCommand
				});
			}.bind(this))
			.catch(function(vError) {
				throw DtUtil.propagateError(
					vError,
					"LocalReset#handler",
					"Error occured during handler execution",
					"sap.ui.rta.plugin"
				);
			});
	};

	return LocalReset;
});
