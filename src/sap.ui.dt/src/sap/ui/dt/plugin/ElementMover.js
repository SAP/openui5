/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.plugin.ElementMover.
sap.ui.define([
    'sap/ui/base/ManagedObject',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/DOMUtil'
],
function(ManagedObject, ElementUtil, DOMUtil) {
	"use strict";

	/**
	 * Constructor for a new ElementMover.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementMover enables movement of UI5 elements based on aggregation types, which can be used by drag and drop or cut and paste behavior.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.plugin.ElementMover
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementMover = ManagedObject.extend("sap.ui.dt.plugin.ElementMover", /** @lends sap.ui.dt.plugin.ElementMover.prototype */ {		
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				movableTypes : {
					type : "string[]",
					defaultValue : ["sap.ui.core.Element"]
				}
			},
			associations : {
			},
			events : {
			}
		}
	});

	/**
	 * @private
	 */
	ElementMover.prototype._getMovableTypes = function() {
		return this.getProperty("movableTypes") || [];
	};

	/**
	 * @public
	 */
	ElementMover.prototype.isMovableType = function(oElement) {
		var aMovableTypes = this._getMovableTypes();

		return aMovableTypes.some(function(sType) {
			return  ElementUtil.isInstanceOf(oElement, sType);
		});
	};

	/**
	 * @protected
	 */
	ElementMover.prototype.checkMovable = function(oOverlay) {
		return true;
	};


	/**
	 * returns the moved overlay (only during movements)
	 * @public
	 * @return {sap.ui.dt.Overlay} overlay which is moved
	 */
	ElementMover.prototype.getMovedOverlay = function() {
		return this._oMovedOverlay;
	};
	
	/**
	 * set the moved overlay (only during movements)
	 * @param {sap.ui.dt.Overlay} [oMovedOverlay] overlay which is moved
	 * @public
	 */
	ElementMover.prototype.setMovedOverlay = function(oMovedOverlay) {
		this._oMovedOverlay = oMovedOverlay;
	};
	
	/**
	 * @private
	 */
	ElementMover.prototype.activateAllValidTargetZones = function(oDesignTime) {
		this._iterateAllAggregations(oDesignTime, this._activateValidTargetZone.bind(this));
	};

	/**
	 * @private
	 */
	ElementMover.prototype._activateValidTargetZone = function(oAggregationOverlay) {
		if (this.checkTargetZone(oAggregationOverlay)) {
			oAggregationOverlay.setTargetZone(true);
		}
	};

	/**
	 * @protected
	 */
	ElementMover.prototype.checkTargetZone = function(oAggregationOverlay) {
		var oParentElement = oAggregationOverlay.getElementInstance();
		var oMovedElement = this.getMovedOverlay().getElementInstance();
		var sAggregationName = oAggregationOverlay.getAggregationName();

		if (ElementUtil.isValidForAggregation(oParentElement, sAggregationName, oMovedElement)) {
			return true;
		}
	};

	/**
	 * @private
	 */
	ElementMover.prototype._deactivateTargetZone = function(oAggregationOverlay) {
		oAggregationOverlay.setTargetZone(false);
	};

	/**
	 * @private
	 */
	ElementMover.prototype.activateTargetZonesFor = function(oOverlay) {
		this._iterateOverlayAggregations(oOverlay, this._activateValidTargetZone.bind(this));
	};

	/**
	 * @private
	 */
	ElementMover.prototype.deactivateTargetZonesFor = function(oOverlay) {
		this._iterateOverlayAggregations(oOverlay, this._deactivateTargetZone.bind(this));
	};

	/**
	 * @private
	 */
	ElementMover.prototype.deactivateAllTargetZones = function(oDesignTime) {
		this._iterateAllAggregations(oDesignTime, function(oAggregationOverlay) {
				oAggregationOverlay.setTargetZone(false);
		});
	};
	
	/**
	 * @private
	 */
	ElementMover.prototype._iterateAllAggregations = function(oDesignTime, fnStep) {	
		var that = this;

		var aOverlays = oDesignTime.getOverlays();
		aOverlays.forEach(function(oOverlay) {
			that._iterateOverlayAggregations(oOverlay, fnStep);
		});
	};
	
	/**
	 * @private
	 */
	ElementMover.prototype._iterateOverlayAggregations = function(oOverlay, fnStep) {	
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			fnStep(oAggregationOverlay);
		});
	};

	/**
	 * @private
	 */
	ElementMover.prototype.repositionOn = function(oMovedOverlay, oTargetOverlay) {
		var oMovedElement = oMovedOverlay.getElementInstance();

		var oTargetElement = oTargetOverlay.getElementInstance();
		var oPublicParent = oTargetOverlay.getParentElementOverlay().getElementInstance();
		var sPublicParentAggregationName = oTargetOverlay.getParentAggregationOverlay().getAggregationName();

		var aChildren = ElementUtil.getAggregation(oPublicParent, sPublicParentAggregationName);
		var iIndex = aChildren.indexOf(oTargetElement);

		if (iIndex !== -1) {
			ElementUtil.insertAggregation(oPublicParent, sPublicParentAggregationName, oMovedElement, iIndex);
		}
	};
	
	ElementMover.Default = new ElementMover();

	return ElementMover;
}, /* bExport= */ true);