/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DesignTimeNew.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Utils'
],
function(jQuery, ManagedObject, Overlay, OverlayRegistry, Utils) {
	"use strict";

	/**
	 * Constructor for a new DesignTimeNew.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTimeNew allows to create an absolute positioned DIV above the associated
	 * control / element.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTimeNew
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DesignTimeNew = ManagedObject.extend("sap.ui.dt.DesignTimeNew", /** @lends sap.ui.dt.DesignTimeNew.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {

			},
			associations : {
				"rootElements" : {
					"type" : "sap.ui.core.Element",
					multiple : true
				}
			},
			events : {

			}
		}
	});

	/*
	 * @private
	 */
	DesignTimeNew.prototype.init = function() {

	};

	DesignTimeNew.prototype.addRootElement = function(vRootElement) {
		this.addAssociation("rootElements", vRootElement);

		this._createOverlaysForRootElement(Utils.getElementInstance(vRootElement));
	};

	DesignTimeNew.prototype.removeRootElement = function(vRootElement) {
		this.removeAssociation("rootElements", vRootElement);

		this._destroyOverlaysForRootElement(Utils.getElementInstance(vRootElement));
	};

	DesignTimeNew.prototype.removeAllRootElements = function() {
		this.destroyAllOverlays();

		this.removeAllAssociation("rootElements");
	};

	DesignTimeNew.prototype.destroyAllOverlays = function() {
		var aRootElements = this.getRootElements() || [];
		jQuery.each(aRootElements, function(iIndex, sRootElementId) {
			var oRootElement = Utils.getElementInstance(sRootElementId);
			var aAllPublicElements = Utils.findAllPublicElements(oRootElement);
			jQuery.each(aAllPublicElements, function(iIndex, oElement) {
				var oOverlay = OverlayRegistry.getOverlay(oElement);
				if (oOverlay) {
					oOverlay.destroy();
				}
			});
		});
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._createOverlaysForRootElement = function(oRootElement) {
		var that = this;

		var aAllPublicElements = Utils.findAllPublicElements(oRootElement);
		jQuery.each(aAllPublicElements, function(iIndex, oElement) {
			that._createOverlay(oElement);
		}); 
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._destroyOverlaysForRootElement = function(oRootElement) {
		var aAllPublicElements = Utils.findAllPublicElements(oRootElement);
		jQuery.each(aAllPublicElements, function(iIndex, oElement) {
			var oOverlay = OverlayRegistry.getOverlay(oElement);
			if (oOverlay) {
				oOverlay.destroy();
			}
		});
	};	

	/*
	 * @private
	 */
	DesignTimeNew.prototype._createOverlay = function(oElement) {
		var oOverlay = new Overlay({
			element : oElement
		});
		this._attachOverlayEvents(oOverlay);
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._attachOverlayEvents = function(oOverlay) {
		oOverlay.attachEvent("elementDataChanged", this._onElementDataChanged, this);
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._onElementDataChanged = function(oEvent) {
		var oParams = oEvent.getParameters();
		if (oParams.type === "addAggregation" || oParams.type === "insertAggregation") {
			this._onOverlayElementAddAggregation(oParams.value);
		} else if (oParams.type === "setParent") {
			this._onOverlayElementSetParent(oParams.target, oParams.value);
		}
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._onOverlayElementAddAggregation = function(oElement) {
		var oOverlay = OverlayRegistry.getOverlay(oElement);
		if (!oOverlay) {
			this._createOverlay(oElement);
		}
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._onOverlayElementSetParent = function(oElement, oParent) {
		var oOverlay = OverlayRegistry.getOverlay(oElement);
		if (oOverlay && !this._isElementInRootElements(oElement)) {
			oOverlay.destroy();
		}
	};	

	/*
	 * @private
	 */
	DesignTimeNew.prototype._isElementInRootElements = function(oElement) {
		var bFoundAncestor = false;

		var aRootElements = this.getRootElements() || [];
		jQuery.each(aRootElements, function(iIndex, vRootElement) {
			var oRootElement = Utils.getElementInstance(vRootElement);
			if (Utils.hasAncestor(oElement, oRootElement)) {
				bFoundAncestor = true;
				return false;
			}
		});

		return bFoundAncestor;
	};

	DesignTimeNew.prototype.exit = function() {
		this.destroyAllOverlays();
	};

	return DesignTimeNew;
}, /* bExport= */ true);