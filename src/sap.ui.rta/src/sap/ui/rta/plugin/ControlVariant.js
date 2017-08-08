/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.ControlVariant.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/fl/changeHandler/BaseTreeModifier',
	'sap/ui/fl/Utils',
	'sap/ui/fl/variants/VariantManagement',
	'sap/ui/base/ManagedObject'
], function(Plugin, Utils, ElementOverlay, OverlayRegistry, OverlayUtil, BaseTreeModifier, flUtils, VariantManagement, ManagedObject) {
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
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	/* Mix-in Variant Methods */
	ElementOverlay.prototype._variantManagement = undefined;
	ElementOverlay.prototype.getVariantManagement = function() { return this._variantManagement;};
	ElementOverlay.prototype.setVariantManagement = function(sKey) { this._variantManagement = sKey; };
	ElementOverlay.prototype.hasVariantManagement = function() { return this._variantManagement ? true : false; };

	var ControlVariant = Plugin.extend("sap.ui.rta.plugin.ControlVariant", /** @lends sap.ui.rta.plugin.ControlVariant.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	ControlVariant.MODEL_NAME = "$FlexVariants";

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.registerElementOverlay = function(oOverlay) {

		if (oOverlay.getElementInstance().getMetadata().getName() === "sap.ui.fl.variants.VariantManagement") {
			var oControl = oOverlay.getElementInstance();
			var vAssociationElement = oControl.getAssociation("for");

			var aVariantManagementTargetElements = !jQuery.isArray(vAssociationElement) ? [vAssociationElement] : vAssociationElement;

			aVariantManagementTargetElements.forEach( function(sVariantManagementTargetElement) {
				var oVariantManagementTargetElement = sVariantManagementTargetElement instanceof ManagedObject ? sVariantManagementTargetElement : sap.ui.getCore().byId(sVariantManagementTargetElement);
				var oVariantManagementTargetOverlay = OverlayRegistry.getOverlay(oVariantManagementTargetElement);
				var sVariantManagement = BaseTreeModifier.getSelector(oControl, flUtils.getComponentForControl(oControl)).id;
				this._propagateVariantManagement(oVariantManagementTargetOverlay , sVariantManagement);
			}.bind(this));
		}
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	ControlVariant.prototype._propagateVariantManagement = function(oParentElementOverlay, sVariantManagement) {
		var aElementOverlaysRendered = [];
		oParentElementOverlay.setVariantManagement(sVariantManagement);
		aElementOverlaysRendered = OverlayUtil.getAllChildOverlays(oParentElementOverlay);

		aElementOverlaysRendered.forEach( function(oElementOverlay) {
			aElementOverlaysRendered = aElementOverlaysRendered.concat(this._propagateVariantManagement(oElementOverlay, sVariantManagement));
		}.bind(this));

		return aElementOverlaysRendered;
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.deregisterElementOverlay = function(oOverlay) {
		Plugin.prototype.deregisterElementOverlay.apply(this, arguments);
	};

	ControlVariant.prototype._getSwitchAction = function(oOverlay) {
		if (oOverlay.getDesignTimeMetadata()) {
			return oOverlay.getDesignTimeMetadata().getAction("switch", oOverlay.getElementInstance());
		}
		return undefined;
	};

	ControlVariant.prototype._getVariantModel = function(oElement) {
		var oAppComponent = flUtils.getAppComponentForControl(oElement);
		return oAppComponent.getModel(ControlVariant.MODEL_NAME);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {boolean} editable or not
	 * @private
	 */
	ControlVariant.prototype._isEditable = function(oOverlay) {
		var oSwitchAction = this._getSwitchAction(oOverlay);
		if (oSwitchAction && oSwitchAction.changeType) {
			return true;
		} else {
			return false;
		}
	};

	ControlVariant.prototype._isVariantManagementControl = function(oOverlay) {
		var oElement = oOverlay.getElementInstance(),
			vAssociationElement = oElement.getAssociation("for");
		return (vAssociationElement) ? true : false;
	};

	/**
	 * Checks if variant switch is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if Variant Switch is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if enabled
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchEnabled = function(oOverlay) {
		var oElement = oOverlay.getElementInstance(),
			sVariantManagementId = oOverlay.getVariantManagement ? oOverlay.getVariantManagement() : undefined;
		if (sVariantManagementId === undefined ||
			sVariantManagementId === null) {
			return false;
		}
		var oModel = this._getVariantModel(oElement),
			aVariants = oModel ? oModel.getData()[sVariantManagementId].variants : [],
			bEnabled = aVariants.length > 1 ? true : false;
		return bEnabled;
	};

	/**
	 * Checks if variant rename is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantRenameAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if variant rename is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantRenameEnabled = function(oOverlay) {
		return false;
	};

	/**
	 * Checks if variant duplicate is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantDuplicateAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if variant duplicate is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantDuplicateEnabled = function(oOverlay) {
		return false;
	};

	/**
	 * Checks if variant configure is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if variant configure is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureEnabled = function(oOverlay) {
		return false;
	};

	/**
	 * Performs a variant switch
	 *
	 * @param {object} oTargetOverlay Target variant management overlay
	 * @param {String} sNewVariantReference The new variant reference
	 * @param {String} sCurrentVariantReference The current variant reference
	 * @public
	 */
	ControlVariant.prototype.switchVariant = function(oTargetOverlay, sNewVariantReference, sCurrentVariantReference) {
		var oDesignTimeMetadata = oTargetOverlay.getDesignTimeMetadata(),
			oTargetElement = oTargetOverlay.getElementInstance();

		var oSwitchCommand = this.getCommandFactory().getCommandFor(oTargetElement, "switch", {
			targetVariantReference: sNewVariantReference,
			sourceVariantReference: sCurrentVariantReference
		}, oDesignTimeMetadata);
		this.fireElementModified({
			"command" : oSwitchCommand
		});
	};

	/**
	 * Performs a variant rename
	 *
	 * @public
	 */
	ControlVariant.prototype.renameVariant = function() {
		return;
	};

	/**
	 * Performs a variant duplicate
	 *
	 * @public
	 */
	ControlVariant.prototype.duplicateVariant = function() {
		return;
	};

	/**
	 * Opens a dialog for Variant configuration
	 *
	 * @public
	 */
	ControlVariant.prototype.configureVariants = function() {
		return;
	};

	return ControlVariant;
}, /* bExport= */true);
