/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/plugin/Plugin"
], function(
	Log,
	RenameDialog,
	Plugin
) {
	"use strict";

	/**
	 * Constructor for a new Rename.
	 *
	 * @param {string}
	 *          [sId] id for the new object, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new object
	 *
	 * @class The Rename allows to create a set of Overlays above the root elements and their public children and manage
	 *        their events.
	 * @extends sap.ui.rta.plugin.Plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.Rename
	 */
	var Rename = Plugin.extend("sap.ui.rta.plugin.Rename", /** @lends sap.ui.rta.plugin.Rename.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				oldValue: "string"
			},
			associations: {},
			events: {
				/*
				 * Fired when renaming is possible
				*/
				editable: {},

				/**
				 * Fired when renaming is switched off
				 */
				nonEditable: {}
			}
		}
	});

	Rename.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new RenameDialog();
	};

	Rename.prototype.startEdit = async function(oOverlay) {
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oOverlay);
		const oDomRef = this.getAction(oOverlay).domRef;
		const sNewText = await this._oDialog.openDialogAndHandleRename({
			overlay: oOverlay,
			domRef: oDomRef,
			action: this.getAction(oResponsibleElementOverlay)
		});
		if (sNewText) {
			this.createRenameCommand(oOverlay, sNewText);
		}
	};

	Rename.prototype.handler = function(aElementOverlays) {
		const aSelectedOverlays = this.getSelectedOverlays();
		const [oOverlay] = aSelectedOverlays?.length > 0 ? aSelectedOverlays : aElementOverlays;
		this.startEdit(oOverlay);
	};

	/**
	 * Checks if rename is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @returns {boolean} true if it's editable
	 * @public
	 */
	Rename.prototype.isRenameAvailable = function(oOverlay) {
		return this._isEditableByPlugin(oOverlay);
	};

	Rename.prototype.isRenameEnabled = function(aOverlays) {
		return this.isEnabled(aOverlays);
	};

	/**
	 * Checks if rename is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} true if it's enabled
	 * @public
	 */
	Rename.prototype.isEnabled = function(aElementOverlays) {
		if (aElementOverlays.length > 1) {
			return false;
		}
		var oTargetOverlay = aElementOverlays[0];
		var oResponsibleElementOverlay = this.getResponsibleElementOverlay(oTargetOverlay);
		var bIsEnabled = true;
		if (!this.getAction(oResponsibleElementOverlay)) {
			bIsEnabled = false;
		}

		var oTargetOverlayAction = this.getAction(oTargetOverlay);
		if (bIsEnabled && typeof oTargetOverlayAction.isEnabled !== "undefined") {
			if (typeof oTargetOverlayAction.isEnabled === "function") {
				bIsEnabled = oTargetOverlayAction.isEnabled(oTargetOverlay.getElement());
			} else {
				bIsEnabled = oTargetOverlayAction.isEnabled;
			}
		}

		if (bIsEnabled) {
			var oDesignTimeMetadata = oTargetOverlay.getDesignTimeMetadata();
			var oAssociatedDomRef = oDesignTimeMetadata.getAssociatedDomRef(oTargetOverlay.getElement(), oTargetOverlayAction.domRef);
			if (!oAssociatedDomRef) {
				bIsEnabled = false;
			}
		}

		return bIsEnabled;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise.<boolean>|booolean} <code>true</code> if it's editable wrapped in a promise.
	 * @private
	 */
	Rename.prototype._isEditable = function(oOverlay) {
		return this._checkChangeHandlerAndStableId(oOverlay);
	};

	Rename.prototype.createRenameCommand = function(oElementOverlay, sNewText) {
		var oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		var oRenamedElement = oResponsibleElementOverlay.getElement();
		var oDesignTimeMetadata = oResponsibleElementOverlay.getDesignTimeMetadata();
		var sVariantManagementReference = this.getVariantManagementReference(oResponsibleElementOverlay);

		return this.getCommandFactory().getCommandFor(oRenamedElement, "rename", {
			renamedElement: oRenamedElement,
			newValue: sNewText
		}, oDesignTimeMetadata, sVariantManagementReference)

		.then(function(oRenameCommand) {
			this.fireElementModified({
				command: oRenameCommand
			});
		}.bind(this))

		.catch(function(oError) {
			Log.error("Error during rename: ", oError);
		});
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]} vElementOverlays - Target overlay(s)
	 * @return {object[]} - array of the items with required data
	 */
	Rename.prototype.getMenuItems = function(vElementOverlays) {
		return this._getMenuItems(vElementOverlays, { pluginId: "CTX_RENAME", icon: "sap-icon://edit" });
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Rename.prototype.getActionName = function() {
		return "rename";
	};

	Rename.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return Rename;
});