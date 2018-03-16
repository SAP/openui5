/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Rename.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/plugin/RenameHandler',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/Utils'
], function(
	jQuery,
	Plugin,
	RenameHandler,
	Overlay,
	ElementUtil,
	OverlayUtil,
	OverlayRegistry,
	Utils
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
	var Rename = Plugin.extend("sap.ui.rta.plugin.Rename", /** @lends sap.ui.rta.plugin.Rename.prototype */
	{
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {
				oldValue : "string"
			},
			associations : {},
			events : {
				/** Fired when renaming is possible */
				"editable" : {},

				/** Fired when renaming is switched off */
				"nonEditable" : {}
			}
		}
	});

	/**
	 * @override
	 */
	Rename.prototype.exit = function() {
		Plugin.prototype.exit.apply(this, arguments);

		this._bPreventMenu = false;
		RenameHandler._exit.call(this);
	};

	/**
	 * @override
	 */
	Rename.prototype.setDesignTime = function(oDesignTime) {
		RenameHandler._setDesignTime.call(this, oDesignTime);
	};

	Rename.prototype.startEdit = function (oOverlay) {
		var oElement = oOverlay.getElement(),
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata(),
			vDomRef = oDesignTimeMetadata.getAction("rename", oElement).domRef;
		RenameHandler.startEdit.call(this, {
			overlay: oOverlay,
			domRef: vDomRef,
			pluginMethodName: "plugin.Rename.startEdit"
		});
	};

	Rename.prototype.stopEdit = function (bRestoreFocus) {
		RenameHandler._stopEdit.call(this, bRestoreFocus, "plugin.Rename.stopEdit");
	};

	Rename.prototype.handler = function (aOverlays) {
		this.startEdit(aOverlays[0]);
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

	Rename.prototype.isRenameEnabled = function (oOverlay) {
		return this.isEnabled(oOverlay);
	};

	/**
	 * Checks if rename is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @returns {boolean} true if it's enabled
	 * @public
	 */
	Rename.prototype.isEnabled = function(oOverlay) {
		var bIsEnabled = true;
		var oAction = this.getAction(oOverlay);
		if (!oAction) {
			bIsEnabled = false;
		}

		if (bIsEnabled && typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				bIsEnabled = oAction.isEnabled(oOverlay.getElement());
			} else {
				bIsEnabled = oAction.isEnabled;
			}
		}

		if (bIsEnabled) {
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			if (!oDesignTimeMetadata.getAssociatedDomRef(oOverlay.getElement(), oAction.domRef)) {
				bIsEnabled = false;
			}
		}

		return bIsEnabled && this.isMultiSelectionInactive.call(this, oOverlay);
	};

	/**
	 * @override
	 */
	Rename.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);

		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for editable
	 * @returns {boolean} true if it's editable
	 * @private
	 */
	Rename.prototype._isEditable = function(oOverlay) {
		var bEditable = false;
		var oElement = oOverlay.getElement();

		var oRenameAction = this.getAction(oOverlay);
		if (oRenameAction && oRenameAction.changeType) {
			if (oRenameAction.changeOnRelevantContainer) {
				oElement = oOverlay.getRelevantContainer();
			}
			bEditable = this.hasChangeHandler(oRenameAction.changeType, oElement);
		}

		if (bEditable) {
			return this.hasStableId(oOverlay);
		}

		return bEditable;
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
	 * @private
	 */
	Rename.prototype._emitLabelChangeEvent = function() {
		var sText = RenameHandler._getCurrentEditableFieldText.call(this);
		if (this.getOldValue() !== sText) { //check for real change before creating a command
			this._$oEditableControlDomRef.text(sText);
			try {
				var oRenameCommand;
				var oRenamedElement = this._oEditedOverlay.getElement();
				var oDesignTimeMetadata = this._oEditedOverlay.getDesignTimeMetadata();
				var oRenameAction = this.getAction(this._oEditedOverlay);
				var sVariantManagementReference = this.getVariantManagementReference(this._oEditedOverlay, oRenameAction);

				oRenameCommand = this.getCommandFactory().getCommandFor(oRenamedElement, "rename", {
					renamedElement : oRenamedElement,
					newValue : sText
				}, oDesignTimeMetadata, sVariantManagementReference);
				this.fireElementModified({
					"command" : oRenameCommand
				});
			} catch (oError) {
				jQuery.sap.log.error("Error during rename : ", oError);
			}
		}
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	Rename.prototype.getMenuItems = function(oOverlay){
		return this._getMenuItems(oOverlay, {pluginId : "CTX_RENAME", rank : 10, icon: "sap-icon://edit"});
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Rename.prototype.getActionName = function(){
		return "rename";
	};

	/**
	 * Indicates whether the Plugin is busy
	 * @return {boolean} true if Plugin is busy
	 */
	Rename.prototype.isBusy = function(){
		return this._bPreventMenu;
	};

	return Rename;
}, /* bExport= */true);
