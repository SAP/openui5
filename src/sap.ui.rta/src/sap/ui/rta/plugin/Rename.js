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
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Rename = Plugin.extend("sap.ui.rta.plugin.Rename", /** @lends sap.ui.rta.plugin.Rename.prototype */ {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				oldValue : "string"
			},
			associations : {},
			events : {
				/*
				 * Fired when renaming is possible
				*/
				editable : {},

				/**
				 * Fired when renaming is switched off
				 */
				nonEditable : {}
			}
		}
	});

	/**
	 * @override
	 */
	Rename.prototype.exit = function() {
		Plugin.prototype.exit.apply(this, arguments);

		this.setBusy(false);
		RenameHandler._exit.call(this);
	};

	/**
	 * @override
	 */
	Rename.prototype.setDesignTime = function(oDesignTime) {
		RenameHandler._setDesignTime.call(this, oDesignTime);
	};

	Rename.prototype.startEdit = function (oOverlay) {
		var oElement = oOverlay.getElement();
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var vDomRef = oDesignTimeMetadata.getAction("rename", oElement).domRef;
		RenameHandler.startEdit.call(this, {
			overlay: oOverlay,
			domRef: vDomRef,
			pluginMethodName: "plugin.Rename.startEdit"
		});
	};

	Rename.prototype.stopEdit = function (bRestoreFocus) {
		RenameHandler._stopEdit.call(this, bRestoreFocus, "plugin.Rename.stopEdit");
	};

	Rename.prototype.handler = function (aElementOverlays) {
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

	Rename.prototype.isRenameEnabled = function (aOverlays) {
		return this.isEnabled(aOverlays);
	};

	/**
	 * Checks if rename is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} true if it's enabled
	 * @public
	 */
	Rename.prototype.isEnabled = function (aElementOverlays) {
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
				bIsEnabled = oTargetOverlay.isEnabled;
			}
		}

		if (bIsEnabled) {
			var oDesignTimeMetadata = oTargetOverlay.getDesignTimeMetadata();
			if (!oDesignTimeMetadata.getAssociatedDomRef(oTargetOverlay.getElement(), oTargetOverlayAction.domRef)) {
				bIsEnabled = false;
			}
		}

		return bIsEnabled;
	};

	/**
	 * @override
	 */
	Rename.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);

		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise.<boolean>|booolean} <code>true</code> if it's editable wrapped in a promise.
	 * @private
	 */
	Rename.prototype._isEditable = function(oOverlay) {
		var oElement = oOverlay.getElement();
		var oRenameAction = this.getAction(oOverlay);
		if (oRenameAction && oRenameAction.changeType) {
			if (oRenameAction.changeOnRelevantContainer) {
				oElement = oOverlay.getRelevantContainer();
			}
			return this.hasChangeHandler(oRenameAction.changeType, oElement)
				.then(function(bHasChangeHandler) {
					return bHasChangeHandler
						&& this._checkRelevantContainerStableID(oRenameAction, oOverlay)
						&& this.hasStableId(oOverlay);
				}.bind(this));
		}
		return false;
	};

	/**
	 * @override
	 */
	Rename.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachEvent("editableChange", RenameHandler._manageClickEvent, this);
		oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);

		this.removeFromPluginsList(oOverlay);
	};

	/**
	 * @returns {Promise} Empty promise
	 * @private
	 */
	Rename.prototype._emitLabelChangeEvent = function() {
		var sText = RenameHandler._getCurrentEditableFieldText.call(this);
		if (this.getOldValue() !== sText) { //check for real change before creating a command
			this._$oEditableControlDomRef.text(sText);

			return Promise.resolve(this._oEditedOverlay)

			.then(function(oEditedOverlay) {
				var oResponsibleElementOverlay = this.getResponsibleElementOverlay(oEditedOverlay);
				var oRenamedElement = oResponsibleElementOverlay.getElement();
				var oDesignTimeMetadata = oResponsibleElementOverlay.getDesignTimeMetadata();
				var sVariantManagementReference = this.getVariantManagementReference(oResponsibleElementOverlay);

				return this.getCommandFactory().getCommandFor(oRenamedElement, "rename", {
					renamedElement : oRenamedElement,
					newValue : sText
				}, oDesignTimeMetadata, sVariantManagementReference);
			}.bind(this))

			.then(function(oRenameCommand) {
				this.fireElementModified({
					command : oRenameCommand
				});
			}.bind(this))

			.catch(function(oError) {
				Log.error("Error during rename : ", oError);
			});
		}
		return Promise.resolve();
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]} vElementOverlays - Target overlay(s)
	 * @return {object[]} - array of the items with required data
	 */
	Rename.prototype.getMenuItems = function (vElementOverlays) {
		return this._getMenuItems(vElementOverlays, { pluginId : "CTX_RENAME", rank : 10, icon: "sap-icon://edit" });
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