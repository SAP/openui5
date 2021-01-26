/*
 * ! ${copyright}
 */

 sap.ui.define([
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/RenameHandler",
	"sap/ui/rta/Utils"
], function(
	DtUtil,
	Plugin,
	RenameHandler,
	Utils
) {
	"use strict";

	var CompVariant = Plugin.extend("sap.ui.rta.plugin.CompVariant", /** @lends sap.ui.rta.plugin.CompVariant.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties : {},
			associations: {},
			events: {}
		}
	});

	function isVariantManagementControl(oOverlay) {
		return oOverlay.getElement().getMetadata().getName() === "sap.ui.comp.smartvariants.SmartVariantManagement";
	}

	function createCommandAndFireEvent(oOverlay, sName, mProperties) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oTargetElement = oOverlay.getElement();

		return this.getCommandFactory().getCommandFor(oTargetElement, sName, mProperties, oDesignTimeMetadata)

		.then(function(oCommand) {
			this.fireElementModified({
				command: oCommand
			});
		}.bind(this))

		.catch(function(oMessage) {
			throw DtUtil.createError(sName, oMessage, "sap.ui.rta.plugin.CompVariant");
		});
	}

	function getAllVariants(/*oOverlay*/) {
		// TODO: Control API
		return [];
	}

	// ------ rename / setTitle
	// TODO: is this needed at all? Titles are set in the SaveAs dialog and can be changed in the manage dialog
	function renameVariant(oOverlay) {
		this.startEdit(oOverlay);
	}

	CompVariant.prototype._emitLabelChangeEvent = function(oOverlay) {
		// TODO: is renaming a save or a configure)
		// var sText = RenameHandler._getCurrentEditableFieldText.call(this);
		createCommandAndFireEvent(oOverlay[0], "compVariantConfigure", {
			// sText
		});
	};

	// ------ configure ------
	function configureVariants(oOverlay) {
		oOverlay[0].getElement().openManageViewsDialogForKeyUser(Utils.getRtaStyleClassName(), function(oData) {
			if (oData.length) {
				createCommandAndFireEvent.call(this, oOverlay[0], "compVariantConfigure", oData);
			}
		}.bind(this));
	}

	// ------ switch ------
	function isSwitchEnabled(aOverlays) {
		return getAllVariants(aOverlays[0]).length > 0;
	}

	function switchVariant(oOverlay/*, oData*/) {
		var oVariantManagementControl = oOverlay.getElement();

		createCommandAndFireEvent.call(this, oOverlay[0], "compVariantSwitch", {
			variantName: "name",
			variantProperties: {
				// targetVariantReference: get sNewVariantReference from oData,
				sourceVariantReference: oVariantManagementControl.getCurrentVariantId()
			}
		});
	}

	// ------ save ------
	function saveVariant(oOverlay) {
		var oVariantManagementControl = oOverlay[0].getElement();
		// TODO: probably also a compVariantConfigure command
		createCommandAndFireEvent.call(this, oOverlay[0], "compVariantSave", {
			variantName: "name",
			variantProperties: {
				variantReference: oVariantManagementControl.getCurrentVariantId()
				//content: TODO (either to be set here or in the command / the save function of the control)
			}
		});
	}

	function isSaveEnabled(/*oOverlay*/) {
		// TODO: should only be enabled when the variant is dirty
		return true;
	}

	// ------ save as ------
	function saveAsNewVariant(oOverlay) {
		// var oVMControl = oOverlay[0].getElement();
		// oVMControl._openSaveAsDialog(); //TODO get function to open it in key user mode
		// TODO create the setDefault change
		createCommandAndFireEvent.call(this, oOverlay[0], "compVariantSaveAs", {
			variantName: "name",
			variantProperties: {
				"default": true,
				executeOnSelect: false,
				content: {},
				type: "page"
			}
		});
	}

	CompVariant.prototype._isEditable = function(oOverlay) {
		return isVariantManagementControl(oOverlay) && this.hasStableId(oOverlay);
	};

	CompVariant.prototype.getMenuItems = function (aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var oVariantManagementControl = oElementOverlay.getElement();
		var aMenuItems = [];

		if (this._isEditable(oElementOverlay)) {
			var oLibraryBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			aMenuItems.push({
				id: "CTX_COMP_VARIANT_SET_TITLE",
				text: oLibraryBundle.getText("CTX_RENAME"),
				handler: renameVariant.bind(this),
				enabled: true,
				rank: 210,
				icon: "sap-icon://edit"
			});

			aMenuItems.push({
				id: "CTX_COMP_VARIANT_SAVE",
				text: oLibraryBundle.getText("CTX_VARIANT_SAVE"),
				handler: saveVariant.bind(this),
				enabled: isSaveEnabled,
				rank: 220,
				icon: "sap-icon://save"
			});

			aMenuItems.push({
				id: "CTX_COMP_VARIANT_SAVE_AS",
				text: oLibraryBundle.getText("CTX_VARIANT_SAVEAS"),
				handler: saveAsNewVariant.bind(this),
				enabled: true,
				rank: 230,
				icon: "sap-icon://duplicate"
			});

			aMenuItems.push({
				id: "CTX_COMP_VARIANT_MANAGE",
				text: oLibraryBundle.getText("CTX_VARIANT_MANAGE"),
				handler: configureVariants.bind(this),
				enabled: true,
				rank: 240,
				icon: "sap-icon://action-settings"
			});

			var aVariants = getAllVariants(oElementOverlay);
			var aSubmenuItems = aVariants.map(function(oVariant) {
				var bCurrentItem = oVariantManagementControl.getCurrentVariantId() === oVariant.getFileName();
				var oItem = {
					id: oVariant.getFileName(),
					text: oVariant.getText("variantName"),
					icon: bCurrentItem ? "sap-icon://accept" : "blank",
					enabled: !bCurrentItem
				};
				return oItem;
			});

			aMenuItems.push({
				id: "CTX_COMP_VARIANT_SWITCH_SUBMENU",
				text: oLibraryBundle.getText("CTX_VARIANT_SWITCH"),
				handler: switchVariant.bind(this),
				enabled: isSwitchEnabled,
				submenu: aSubmenuItems,
				rank: 250,
				icon: "sap-icon://switch-views"
			});
		}

		return aMenuItems;
	};

	return CompVariant;
});