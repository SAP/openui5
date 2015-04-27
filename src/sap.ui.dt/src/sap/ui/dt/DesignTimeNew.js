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
	 * The DesignTimeNew allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
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
			aggregations : {
				"managers" : {
					"type" : "sap.ui.dt.Manager",
					multiple : true
				}
			},
			events : {
				"overlayCreated" : {
					"overlay" : "sap.ui.dt.Overlay"
				}
			}
		}
	});

	/*
	 * Initialization of DesignTime
	 * @private
	 */
	DesignTimeNew.prototype.init = function() {

	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype.exit = function() {
		this._destroyAllOverlays();
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._createAllOverlays = function() {
		var that = this;

		this._iterateRootElements(function(oRootElement) {
			that._createOverlaysForRootElement(oRootElement);
		});
	};

	/*
	 * @public
	 */
	DesignTimeNew.prototype.getOverlays = function() {
		var aOverlays = [];

		this._iterateAllElements(function(oElement) {
			var oOverlay = OverlayRegistry.getOverlay(oElement);
			if (oOverlay) {
				aOverlays.push(oOverlay);
			}
		});

		return aOverlays;
	};

	/*
	 * @public
	 * @param {String|sap.ui.core.Element} element or elemet's id
	 */
	DesignTimeNew.prototype.addRootElement = function(vRootElement) {
		this.addAssociation("rootElements", vRootElement);

		this._createOverlaysForRootElement(Utils.getElementInstance(vRootElement));
	};

	/*
	 * @public
	 * @param {String|sap.ui.core.Element} element or elemet's id
	 */
	DesignTimeNew.prototype.removeRootElement = function(vRootElement) {
		this.removeAssociation("rootElements", vRootElement);

		this._destroyOverlaysForRootElement(Utils.getElementInstance(vRootElement));
	}; 	

	/*
	 * @public
	 * @param {String|sap.ui.core.Element} element or elemet's id
	 */
	DesignTimeNew.prototype.removeAllRootElement = function(vRootElement) {
		this.removeAssociation("rootElements", vRootElement);

		this._destroyAllOverlays();
	}; 	

	/*
	 * @public
	 */
	DesignTimeNew.prototype._destroyAllOverlays = function() {
		var that = this;

		this._iterateRootElements(function(oRootElement) {
			that._destroyOverlaysForRootElement(oRootElement);			
		});
	};

	/*
	 * @private
	 * @param {String|sap.ui.core.Element} element
	 */
	DesignTimeNew.prototype._createOverlaysForRootElement = function(oRootElement) {
		var that = this;

		this._iterateRootElementPublicChildren(oRootElement, function(oElement) {
			that._createOverlay(oElement);
		}); 
	};

	/*
	 * @private
	 * @param {String|sap.ui.core.Element} element
	 */
	DesignTimeNew.prototype._destroyOverlaysForRootElement = function(oRootElement) {
		this._iterateRootElementPublicChildren(oRootElement, function(oElement) {
			var oOverlay = OverlayRegistry.getOverlay(oElement);
			if (oOverlay) {
				oOverlay.destroy();
			}			
		});
	};	

	/*
	 * @private
	 * @param {String|sap.ui.core.Element} element
	 */
	DesignTimeNew.prototype._createOverlay = function(oElement) {
		// Filter
		//if (this.fireBeforeCreateOverlay())

		var oOverlay = this.createOverlay(oElement);
		oOverlay.attachEvent("elementModified", this._onElementModified, this);

		this.fireOverlayCreated({overlay : oOverlay});
	};

	/**
	 * @protected
	 * @param {String|sap.ui.core.Element} oElement to create overlay for
	 * @return {sap.ui.dt.Overlay} created overlay
	 */
	DesignTimeNew.prototype.createOverlay = function(oElement) {
		return new Overlay({
			element : oElement
		});
	};


	/*
	 * @private
	 * @param {sap.ui.baseEvent} event object
	 */
	DesignTimeNew.prototype._onElementModified = function(oEvent) {
		var oParams = oEvent.getParameters();
		if (oParams.type === "addAggregation" || oParams.type === "insertAggregation") {
			this._onOverlayElementAddAggregation(oParams.value);
		} else if (oParams.type === "setParent") {
			this._onOverlayElementSetParent(oParams.target, oParams.value);
		}
	};

	/*
	 * @private
	 * @param {sap.ui.core.Element} 
	 */
	DesignTimeNew.prototype._onOverlayElementAddAggregation = function(oElement) {
		var oOverlay = OverlayRegistry.getOverlay(oElement);
		if (!oOverlay) {
			this._createOverlay(oElement);
		}
	};

	/*
	 * @private
	 * @param {sap.ui.core.Element}
	 * @param {sap.ui.core.Element}
	 */
	DesignTimeNew.prototype._onOverlayElementSetParent = function(oElement, oParent) {
		var oOverlay = OverlayRegistry.getOverlay(oElement);
		if (oOverlay && !this._isElementInRootElements(oElement)) {
			oOverlay.destroy();
		}
	};	

	/*
	 * @private
	 * @param {sap.ui.core.Element}
	 */
	DesignTimeNew.prototype._isElementInRootElements = function(oElement) {
		var bFoundAncestor = false;

		this._iterateRootElements(function(oRootElement) {
			if (Utils.hasAncestor(oElement, oRootElement)) {
				bFoundAncestor = true;
				return false;
			}
		});

		return bFoundAncestor;
	};

	/*
	 * @public
	 * @param {sap.ui.dt.Manager} manager instance
	 */
	DesignTimeNew.prototype.addManager = function(oManager) {
		this.addAggregation("managers", oManager);
		oManager.setDesignTime(this);

		this._recreateOverlays();
	};

	/*
	 * @public
	 * @param {sap.ui.dt.Manager} manager instance
	 */
	DesignTimeNew.prototype.removeManager = function(vManager) {
		var oManager = this.removeAggregation("managers", vManager);
		if (oManager) {
			oManager.setDesignTime(null);
		}

		this._recreateOverlays();
	};

	/*
	 * @public
	 * @param {sap.ui.dt.Manager} manager instance
	 */
	DesignTimeNew.prototype.insertManager = function(oManager, iIndex) {
		this.insertAggregation("managers", oManager, iIndex);
		oManager.setDesignTime(this);

		this._recreateOverlays();
	};

	/*
	 * @public
	 * @param {sap.ui.dt.Manager} manager instance
	 */
	DesignTimeNew.prototype.removeAllManagers = function() {
		var aManagers = this.getManagers();
		this.removeAllAggregation("managers");
		jQuery.each(aManagers, function(iIndex, oManager) {
			oManager.setDesignTime(null);			
		});

		this._recreateOverlays();
	};	

	/*
	 * @private
	 */
	DesignTimeNew.prototype._recreateOverlays = function() {
		this._destroyAllOverlays();
		this._createAllOverlays();
	};	

	/*
	 * @private
	 */
	DesignTimeNew.prototype._iterateRootElements = function(fn) {
		var aRootElements = this.getRootElements() || [];
		jQuery.each(aRootElements, function(iIndex, sRootElementId) {
			var oRootElement = Utils.getElementInstance(sRootElementId);
			fn(oRootElement);
		});
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._iterateRootElementPublicChildren = function(oRootElement, fn) {
		var aAllPublicElements = Utils.findAllPublicElements(oRootElement);
		jQuery.each(aAllPublicElements, function(iIndex, oElement) {
			fn(oElement);
		});
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._iterateAllElements = function(fn) {
		var that = this;
		
		this._iterateRootElements(function(oRootElement) {
			that._iterateRootElementPublicChildren(oRootElement, fn);
		});
	};	

	return DesignTimeNew;
}, /* bExport= */ true);