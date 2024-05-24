/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/RenameHandler",
	"sap/base/Log"
], function(
	Plugin,
	RenameHandler,
	Log
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

	/**
	 * @override
	 */
	Rename.prototype.exit = function(...aArgs) {
		Plugin.prototype.exit.apply(this, aArgs);

		this.setBusy(false);
		RenameHandler._exit.call(this);
	};

	/**
	 * @override
	 */
	Rename.prototype.setDesignTime = function(oDesignTime) {
		RenameHandler._setDesignTime.call(this, oDesignTime);
	};

	Rename.prototype.startEdit = function(oOverlay) {
		var vDomRef = this.getAction(oOverlay).domRef;
		var fnGetTextMutators = this.getAction(oOverlay).getTextMutators;
		RenameHandler.startEdit.call(this, {
			overlay: oOverlay,
			domRef: vDomRef,
			getTextMutators: fnGetTextMutators,
			pluginMethodName: "plugin.Rename.startEdit"
		});
	};

	Rename.prototype.stopEdit = function(bRestoreFocus) {
		RenameHandler._stopEdit.call(this, bRestoreFocus, "plugin.Rename.stopEdit");
	};

	Rename.prototype.handler = function(aElementOverlays) {
		aElementOverlays = this.getSelectedOverlays() || aElementOverlays;
		this.startEdit(aElementOverlays[0]);
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
			if (!(oAssociatedDomRef && oAssociatedDomRef.get(0))) {
				bIsEnabled = false;
			}
		}

		return bIsEnabled;
	};

	/**
	 * @override
	 */
	Rename.prototype.registerElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);

		Plugin.prototype.registerElementOverlay.apply(this, aArgs);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise.<boolean>|booolean} <code>true</code> if it's editable wrapped in a promise.
	 * @private
	 */
	Rename.prototype._isEditable = function(oOverlay) {
		return this._checkChangeHandlerAndStableId(oOverlay);
	};

	/**
	 * @override
	 */
	Rename.prototype.deregisterElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		oOverlay.detachEvent("editableChange", RenameHandler._manageClickEvent, this);
		oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);

		Plugin.prototype.deregisterElementOverlay.apply(this, aArgs);
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
	 * @returns {Promise} Empty promise
	 * @private
	 */
	Rename.prototype._emitLabelChangeEvent = function() {
		var sText = RenameHandler._getCurrentEditableFieldText.call(this);
		this._fnSetControlText(sText);
		return this.createRenameCommand(this._oEditedOverlay, sText);
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]} vElementOverlays - Target overlay(s)
	 * @return {object[]} - array of the items with required data
	 */
	Rename.prototype.getMenuItems = function(vElementOverlays) {
		return this._getMenuItems(vElementOverlays, { pluginId: "CTX_RENAME", rank: 10, icon: "sap-icon://edit" });
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Rename.prototype.getActionName = function() {
		return "rename";
	};

	return Rename;
});