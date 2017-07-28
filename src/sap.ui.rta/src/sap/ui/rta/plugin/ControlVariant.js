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
	'sap/ui/base/ManagedObject'
], function(Plugin, Utils, ElementOverlay, OverlayRegistry, OverlayUtil, BaseTreeModifier, flUtils, ManagedObject) {
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
	ElementOverlay.prototype.hasVariantManagement = function() { this._variantManagement ? true : false; };

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

			//var sVarMgtKey;
			////True for ObjectPageLayout
			//if (oControl.getVariantManagement) {
			//	sVarMgtKey = oControl.getVariantManagement();
			//} else if (oOverlay.getParentElementOverlay()) {
			//	sVarMgtKey = oOverlay.getParentElementOverlay().getVariantManagement();
			//}
			//
			//if (!sVarMgtKey) {
			//	return;
			//}
			//oOverlay.setVariantManagement(sVarMgtKey);
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

	};


	return ControlVariant;
}, /* bExport= */true);
