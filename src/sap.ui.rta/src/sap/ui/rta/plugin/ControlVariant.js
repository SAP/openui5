/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/RenameHandler",
	"sap/ui/rta/Utils",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/base/ManagedObject",
	"sap/base/Log"
], function(
	Plugin,
	RenameHandler,
	Utils,
	ElementOverlay,
	OverlayRegistry,
	OverlayUtil,
	DtUtil,
	flUtils,
	Layer,
	VariantManagement,
	ContextSharingAPI,
	ManagedObject,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new ControlVariant Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ControlVariant allows propagation of variantManagement key
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.plugin.ControlVariant
	 * @experimental Since 1.50. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	/* Mix-in Variant Methods */
	ElementOverlay.prototype._variantManagement = undefined;
	ElementOverlay.prototype.getVariantManagement = function() { return this._variantManagement;};
	ElementOverlay.prototype.setVariantManagement = function(sKey) { this._variantManagement = sKey; };
	ElementOverlay.prototype.hasVariantManagement = function() { return !!this._variantManagement; };

	function destroyManageDialog(oOverlay) {
		var oManageDialog = oOverlay.getElement().getManageDialog();
		if (oManageDialog && !oManageDialog.bIsDestroyed) {
			oManageDialog.destroy();
		}
	}

	var ControlVariant = Plugin.extend("sap.ui.rta.plugin.ControlVariant", /** @lends sap.ui.rta.plugin.ControlVariant.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				oldValue: "string"
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * Registers an overlay.
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.registerElementOverlay = function(oOverlay) {
		var oControl = oOverlay.getElement();
		var sVariantManagementReference;

		Plugin.prototype.registerElementOverlay.apply(this, arguments);

		if (oControl instanceof VariantManagement) {
			var vAssociationElement = oControl.getFor();
			var aVariantManagementTargetElements;
			var oAppComponent = flUtils.getAppComponentForControl(oControl);
			var sControlId = oControl.getId();
			sVariantManagementReference = oAppComponent.getLocalId(sControlId) || sControlId;
			oOverlay.setVariantManagement(sVariantManagementReference);

			// If "for" association is not valid
			if (
				!vAssociationElement
				|| (Array.isArray(vAssociationElement) && vAssociationElement.length === 0)
			) {
				return;
			}

			aVariantManagementTargetElements = !Array.isArray(vAssociationElement) ? [vAssociationElement] : vAssociationElement;

			// Propagate variant management reference to all children overlays starting from the "for" association element as the root
			aVariantManagementTargetElements.forEach(function(sVariantManagementTargetElement) {
				var oVariantManagementTargetElement = sVariantManagementTargetElement instanceof ManagedObject ? sVariantManagementTargetElement : sap.ui.getCore().byId(sVariantManagementTargetElement);
				var oVariantManagementTargetOverlay = OverlayRegistry.getOverlay(oVariantManagementTargetElement);
				this._propagateVariantManagement(oVariantManagementTargetOverlay, sVariantManagementReference);
			}.bind(this));
			oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);
			destroyManageDialog(oOverlay);
		} else if (!oOverlay.getVariantManagement()) {
			// Case where overlay is dynamically created - variant management reference should be identified from parent
			sVariantManagementReference = this._getVariantManagementFromParent(oOverlay);
			if (sVariantManagementReference) {
				oOverlay.setVariantManagement(sVariantManagementReference);
				oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);
			}
		}
	};

	ControlVariant.prototype._isPersonalizationMode = function () {
		return this.getCommandFactory().getFlexSettings().layer === Layer.USER;
	};

	/**
	 * Top-down approach for setting VariantManagement reference to all children overlays.
	 *
	 * @param {sap.ui.dt.Overlay} oParentElementOverlay overlay object for which children overlays are computed
	 * @param {string} sVariantManagementReference VariantManagement reference to be set
	 * @returns {array} array of rendered ElementOverlays which have been set with passed VariantManagement reference
	 * @private
	 */
	ControlVariant.prototype._propagateVariantManagement = function(oParentElementOverlay, sVariantManagementReference) {
		var aElementOverlaysRendered = [];
		oParentElementOverlay.setVariantManagement(sVariantManagementReference);
		aElementOverlaysRendered = OverlayUtil.getAllChildOverlays(oParentElementOverlay);

		aElementOverlaysRendered.forEach(function(oElementOverlay) {
			aElementOverlaysRendered = aElementOverlaysRendered.concat(this._propagateVariantManagement(oElementOverlay, sVariantManagementReference));
		}.bind(this));

		return aElementOverlaysRendered;
	};

	/**
	 * Bottom-up approach for setting VariantManagement reference from parent ElementOverlays.
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object for which VariantManagement reference is to be set
	 * @returns {string} VariantManagement reference
	 * @private
	 */
	ControlVariant.prototype._getVariantManagementFromParent = function(oOverlay) {
		var sVariantManagementReference = oOverlay.getVariantManagement();
		if (!sVariantManagementReference && oOverlay.getParentElementOverlay()) {
			return this._getVariantManagementFromParent(oOverlay.getParentElementOverlay());
		}
		return sVariantManagementReference;
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.deregisterElementOverlay = function(oOverlay) {
		if (this._isVariantManagementControl(oOverlay)) {
			destroyManageDialog(oOverlay);
		}
		oOverlay.detachEvent("editableChange", RenameHandler._manageClickEvent, this);
		oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);
		this.removeFromPluginsList(oOverlay);
		Plugin.prototype.deregisterElementOverlay.apply(this, arguments);
	};

	ControlVariant.prototype._getVariantModel = function(oElement) {
		var oAppComponent = flUtils.getAppComponentForControl(oElement);
		return oAppComponent ? oAppComponent.getModel(flUtils.VARIANT_MODEL_NAME) : undefined;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {boolean} editable or not
	 * @private
	 */
	ControlVariant.prototype._isEditable = function(oOverlay) {
		if (this._isPersonalizationMode()) {
			return false;
		}
		return this._isVariantManagementControl(oOverlay) && this.hasStableId(oOverlay);
	};

	ControlVariant.prototype._isVariantManagementControl = function (oOverlay) {
		var oElement = oOverlay.getElement();
		var vAssociationElement = oElement.getAssociation("for");
		return !!(vAssociationElement && oElement instanceof VariantManagement);
	};

	/**
	 * Checks if variant switch is available for oOverlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchAvailable = function (oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if Variant Switch is enabled for oOverlay.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if enabled
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchEnabled = function (aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var aVariants = [];
		if (this._isVariantManagementControl(oElementOverlay)) {
			var oElement = oElementOverlay.getElement();
			var sVariantManagementReference = oElementOverlay.getVariantManagement ? oElementOverlay.getVariantManagement() : undefined;
			if (!sVariantManagementReference) {
				return false;
			}
			var oModel = this._getVariantModel(oElement);
			if (oModel) {
				aVariants = oModel.getData()[sVariantManagementReference].variants.reduce(function(aReducedVariants, oVariant) {
					if (oVariant.visible) {
						return aReducedVariants.concat(oVariant);
					}
					return aReducedVariants;
				}, []);
			}
			var bEnabled = aVariants.length > 1;
			return bEnabled;
		}
		return false;
	};

	/**
	 * @override
	 */
	ControlVariant.prototype.setDesignTime = function (oDesignTime) {
		RenameHandler._setDesignTime.call(this, oDesignTime);
	};

	/**
	 * Checks if variant rename is available for the overlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isRenameAvailable = function (oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant rename is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isRenameEnabled = function (aElementOverlays) {
		return this._isVariantManagementControl(aElementOverlays[0]);
	};

	/**
	 * Checks if variant Save is available for the overlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveAvailable = function (oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant Save is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveEnabled = function (aElementOverlays) {
		var oOverlay = aElementOverlays[0];
		var oElement = oOverlay.getElement();
		var oModel = this._getVariantModel(oElement);
		var sVariantManagementReference = oOverlay.getVariantManagement();
		return oModel.oData[sVariantManagementReference] && oModel.oData[sVariantManagementReference].modified;
	};

	/**
	 * Checks if variant SaveAs is available for the overlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveAsAvailable = function (oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant SaveAs is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveAsEnabled = function (aElementOverlays) {
		return this._isVariantManagementControl(aElementOverlays[0]);
	};

	/**
	 * Checks if variant configure is available for the overlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureAvailable = function (oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant configure is enabled for oOverlay.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureEnabled = function (aElementOverlays) {
		return this._isVariantManagementControl(aElementOverlays[0]);
	};

	/**
	 * Performs a variant switch.
	 *
	 * @param {object} oTargetOverlay Target variant management overlay
	 * @param {string} sNewVariantReference The new variant reference
	 * @param {string} sCurrentVariantReference The current variant reference
	 * @public
	 */
	ControlVariant.prototype.switchVariant = function(oTargetOverlay, sNewVariantReference, sCurrentVariantReference) {
		var oDesignTimeMetadata = oTargetOverlay.getDesignTimeMetadata();
		var oTargetElement = oTargetOverlay.getElement();

		this.getCommandFactory().getCommandFor(oTargetElement, "switch", {
			targetVariantReference: sNewVariantReference,
			sourceVariantReference: sCurrentVariantReference
		}, oDesignTimeMetadata)

		.then(function(oSwitchCommand) {
			this.fireElementModified({
				command: oSwitchCommand
			});
		}.bind(this))

		.catch(function(oMessage) {
			throw DtUtil.createError("ControlVariant#switchVariant", oMessage, "sap.ui.rta");
		});
	};

	/**
	 * Performs a variant set title.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @public
	 */
	ControlVariant.prototype.renameVariant = function (aElementOverlays) {
		this.startEdit(aElementOverlays[0]);
	};

	ControlVariant.prototype.startEdit = function(oVariantManagementOverlay) {
		var vDomRef = oVariantManagementOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;
		RenameHandler.startEdit.call(this, {
			overlay: oVariantManagementOverlay,
			domRef: vDomRef,
			pluginMethodName: "plugin.ControlVariant.startEdit"
		});
	};

	ControlVariant.prototype.stopEdit = function (bRestoreFocus) {
		RenameHandler._stopEdit.call(this, bRestoreFocus, "plugin.ControlVariant.stopEdit");
	};

	ControlVariant.prototype.createSaveCommand = function (aElementOverlays) {
		var oOverlay = aElementOverlays[0];
		var oElement = oOverlay.getElement();
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oModel = this._getVariantModel(oElement);
		var sVariantManagementReference = oOverlay.getVariantManagement();

		return this.getCommandFactory().getCommandFor(oElement, "save", {
			model: oModel
		}, oDesignTimeMetadata, sVariantManagementReference)
			.then(function(oSaveCommand) {
				this.fireElementModified({
					command: oSaveCommand
				});
			}.bind(this));
	};

	ControlVariant.prototype.createSaveAsCommand = function (aElementOverlays) {
		var oOverlay = aElementOverlays[0];
		var oElement = oOverlay.getElement();
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oModel = this._getVariantModel(oElement);
		var sVariantManagementReference = oOverlay.getVariantManagement();
		var sCurrentVariantReference = oModel.getCurrentVariantReference(sVariantManagementReference);

		return this.getCommandFactory().getCommandFor(oElement, "saveAs", {
			sourceVariantReference: sCurrentVariantReference,
			model: oModel
		}, oDesignTimeMetadata, sVariantManagementReference)
			.then(function(oSaveAsCommand) {
				this.fireElementModified({
					command: oSaveAsCommand
				});
			}.bind(this));
	};

	/**
	 * @returns {Promise} empty promise
	 * @private
	 */
	ControlVariant.prototype._emitLabelChangeEvent = function() {
		var sText = RenameHandler._getCurrentEditableFieldText.call(this);
		var oOverlay = this._oEditedOverlay;
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oRenamedElement = oOverlay.getElement();
		var sVariantManagementReference = oOverlay.getVariantManagement();

		return this._createSetTitleCommand({
			text: sText,
			element: oRenamedElement,
			designTimeMetadata: oDesignTimeMetadata,
			variantManagementReference: sVariantManagementReference
		})

		.then(function(oSetTitleCommand) {
			this.fireElementModified({
				command: oSetTitleCommand
			});
		}.bind(this));
	};

	/**
	 * Sets the domref text, creates a setTitle command and fires element modified.
	 * @param {map} mPropertyBag - (required) contains required properties to create the command
	 * @returns {object} setTitle command
	 * @private
	 */
	ControlVariant.prototype._createSetTitleCommand = function (mPropertyBag) {
		this._$oEditableControlDomRef.text(mPropertyBag.text);

		return this.getCommandFactory().getCommandFor(mPropertyBag.element, "setTitle", {
			newText: mPropertyBag.text
		}, mPropertyBag.designTimeMetadata, mPropertyBag.variantManagementReference)

		.catch(function(oMessage) {
			Log.error("Error during rename: ", oMessage);
		});
	};

	/**
	 * Prepares overlay for showing a value state message.
	 * @param {object} oOverlay Overlay which needs be prepared
	 * @param {string} sValueStateText value state text that needs to be set
	 * @private
	 */
	ControlVariant.prototype._prepareOverlayForValueState = function (oOverlay, sValueStateText) {
		//Prepare VariantManagement control overlay for valueStateMessage
		oOverlay.getValueState = function () {
			return "Error";
		};
		oOverlay.getValueStateText = function () {
			return sValueStateText;
		};
		oOverlay.getDomRefForValueStateMessage = function () {
			return this.$();
		};
	};

	/**
	 * Opens a dialog for Variant configuration.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {Promise} Resolving when the dialog is closed and the command is created
	 * @public
	 */
	ControlVariant.prototype.configureVariants = function (aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var oVariantManagementControl = oElementOverlay.getElement();
		var sVariantManagementReference = oElementOverlay.getVariantManagement();
		var oModel = this._getVariantModel(oVariantManagementControl);
		var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
		var mFlexSettings = this.getCommandFactory().getFlexSettings();

		return oModel.manageVariants(
			oVariantManagementControl,
			sVariantManagementReference,
			mFlexSettings.layer,
			Utils.getRtaStyleClassName(),
			ContextSharingAPI.createComponent(mFlexSettings)
		)
		.then(function(aConfiguredChanges) {
			if (aConfiguredChanges.length > 0) {
				return this.getCommandFactory().getCommandFor(
					oVariantManagementControl,
					"configure",
					{
						control: oVariantManagementControl,
						changes: aConfiguredChanges
					},
					oDesignTimeMetadata,
					sVariantManagementReference
				);
			}
			return undefined;
		}.bind(this))

		.then(function(oConfigureCommand) {
			if (oConfigureCommand) {
				this.fireElementModified({
					command: oConfigureCommand
				});
			}
		}.bind(this))

		.catch(function(oMessage) {
			throw DtUtil.createError("ControlVariant#configureVariants", oMessage, "sap.ui.rta");
		});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} - array containing the items with required data
	 */
	ControlVariant.prototype.getMenuItems = function (aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var aMenuItems = [];

		if (this.isRenameAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_SET_TITLE",
				text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_RENAME"),
				handler: this.renameVariant.bind(this),
				enabled: this.isRenameEnabled.bind(this),
				rank: 210,
				icon: "sap-icon://edit"
			});
		}

		if (this.isVariantSaveAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_SAVE",
				text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_VARIANT_SAVE"),
				handler: this.createSaveCommand.bind(this),
				enabled: this.isVariantSaveEnabled.bind(this),
				rank: 220,
				icon: "sap-icon://save"
			});
		}

		if (this.isVariantSaveAsAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_SAVEAS",
				text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_VARIANT_SAVEAS"),
				handler: this.createSaveAsCommand.bind(this),
				enabled: this.isVariantSaveAsEnabled.bind(this),
				rank: 225,
				icon: "sap-icon://duplicate"
			});
		}

		if (this.isVariantConfigureAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_MANAGE",
				text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_VARIANT_MANAGE"),
				handler: this.configureVariants.bind(this),
				enabled: this.isVariantConfigureEnabled.bind(this),
				startSection: true,
				rank: 230,
				icon: "sap-icon://action-settings"
			});
		}

		if (this.isVariantSwitchAvailable(oElementOverlay)) {
			var oModel = this._getVariantModel(oElementOverlay.getElement());
			var sManagementReferenceId = oElementOverlay.getVariantManagement();

			var aSubmenuItems = oModel.getData()[sManagementReferenceId].variants.reduce(function(aReducedVariants, oVariant) {
				if (oVariant.visible) {
					var bCurrentItem = oModel.getData()[sManagementReferenceId].currentVariant === oVariant.key;
					var oItem = {
						id: oVariant.key,
						text: oVariant.title,
						icon: bCurrentItem ? "sap-icon://accept" : "blank",
						enabled: !bCurrentItem
					};
					return aReducedVariants.concat(oItem);
				}
				return aReducedVariants;
			}, []);

			aMenuItems.push({
				id: "CTX_VARIANT_SWITCH_SUBMENU",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_SWITCH'),
				handler: function(aElementOverlays, mPropertyBag) {
					var sNewVariantKey = mPropertyBag.eventItem.getParameters().item.getProperty("key");
					var oTargetOverlay = aElementOverlays[0];
					var sCurrentVariantKey = oModel.getData()[sManagementReferenceId].currentVariant;
					return this.switchVariant(oTargetOverlay, sNewVariantKey, sCurrentVariantKey);
				}.bind(this),
				enabled: this.isVariantSwitchEnabled.bind(this),
				submenu: aSubmenuItems,
				rank: 240,
				icon: "sap-icon://switch-views"
			});
		}

		return aMenuItems;
	};

	ControlVariant.prototype.getActionName = function() {
		return "controlVariant";
	};

	return ControlVariant;
});